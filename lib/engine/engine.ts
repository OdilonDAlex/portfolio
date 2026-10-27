import Lenis from "lenis";
import { scene, scroll } from "../config";
import {
  FrameGovernor,
  chapterPhase,
  easeInOutQuart,
  layoutChapters,
  renderScale,
  restartDuration,
  reveal,
  scrollState,
  travelDuration,
  type ScrollState,
} from "./choreography";
import { Fluid } from "./fluid";
import { bindTex, createProgram, type GL, type Program } from "./gl";
import { SCENE, VERT } from "./shaders";
import { TitleTextures } from "./titles";

export interface EngineCallbacks {
  onChapter(index: number): void;
  onHudDark(dark: boolean): void;
  onLost(): void;
}

interface Stage {
  sec: HTMLElement;
  stage: HTMLElement;
  title: HTMLElement | null;
  ds: HTMLElement[];
  sigs: string[];
  ty: number;
  vis: boolean;
  live: boolean;
}

const MOBILE = 760;

/**
 * Immersive mode: chapters are pinned full-screen stages driven by scroll, their titles
 * redrawn in WebGL. The page stays plain HTML until `create` succeeds, and `destroy`
 * restores it entirely.
 */
export class Engine {
  private chs: Stage[];
  private N: number;
  private layout!: ReturnType<typeof layoutChapters>;
  private lenis: Lenis;
  private fluid: Fluid | null;
  private titles: TitleTextures;
  private zero: WebGLTexture;
  private governor = new FrameGovernor();
  private hud: { progress: HTMLElement | null; cue: HTMLElement | null; bar: HTMLElement | null };

  private raf = 0;
  private vw = 0;
  private vh = 0;
  private scale = 1;
  private cur = -1;
  private hudDark: boolean | null = null;
  private progressKey = "";
  private cueOpacity = -1;

  private mouse: [number, number] = [0.5, 0.5];
  private delta: [number, number] = [0, 0];
  private hasMouse = false;
  private mv: [number, number] = [0, 0];
  private tmv: [number, number] = [0.06, 0.02];
  private sv = 0;
  private lastY: number | null = null;
  private lastAct = performance.now();
  private frameCount = 0;
  private frameT: number | null = null;
  private fluidT: number | null = null;
  private lastTransition: number | null = null;
  private theme: { from: number; to: number; t0: number; c: [number, number] };

  private resizeTimer = 0;
  private prefetching = 0;

  static create(root: HTMLElement, dark: boolean, cb: EngineCallbacks) {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    }) as GL | null;
    if (!gl || !gl.getExtension("OES_standard_derivatives")) return null;
    const prog = createProgram(gl, VERT, SCENE);
    if (!prog) return null;
    return new Engine(root, dark, cb, canvas, gl, prog);
  }

  private constructor(
    private root: HTMLElement,
    private dark: boolean,
    private cb: EngineCallbacks,
    private canvas: HTMLCanvasElement,
    private gl: GL,
    private prog: Program,
  ) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    this.zero = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.zero);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    this.titles = new TitleTextures(gl);
    this.fluid = Fluid.create(gl);

    this.chs = [...root.querySelectorAll<HTMLElement>("[data-ch]")].map((sec) => {
      const ds = [...sec.querySelectorAll<HTMLElement>("[data-d]")];
      return {
        sec,
        stage: sec.querySelector<HTMLElement>("[data-stage]")!,
        title: sec.querySelector<HTMLElement>("[data-title]"),
        ds,
        sigs: ds.map(() => ""),
        ty: 0,
        vis: false,
        live: false,
      };
    });
    this.N = this.chs.length;
    this.hud = {
      progress: root.querySelector("[data-hud-progress]"),
      cue: root.querySelector("[data-hud-cue]"),
      bar: root.querySelector("[data-hud-bar]"),
    };
    const t = dark ? 1 : 0;
    this.theme = { from: t, to: t, t0: -1e9, c: [1, 1] };

    canvas.className = "gl-canvas";
    canvas.setAttribute("aria-hidden", "true");
    root.dataset.immersive = "";
    root.prepend(canvas);

    this.lenis = new Lenis({ ...scroll, autoRaf: false });
    this.relayout();

    window.addEventListener("pointermove", this.onPointer, { passive: true });
    window.addEventListener("resize", this.onResize);
    root.addEventListener("focusin", this.onFocus);
    canvas.addEventListener("webglcontextlost", this.onLost);
    this.raf = requestAnimationFrame(this.frame);
  }

  go(k: number) {
    const top = this.layout.chapters[k].top + (k === 0 ? 0 : 2);
    this.scrollTo(top, travelDuration(Math.max(0, this.cur), k));
  }

  restart() {
    this.scrollTo(0, restartDuration(this.N));
  }

  lock(locked: boolean) {
    if (locked) this.lenis.stop();
    else this.lenis.start();
  }

  /** Starts the ink ripple from the centre of `origin` (the theme button). */
  setTheme(dark: boolean, origin: DOMRect) {
    this.dark = dark;
    const now = performance.now();
    this.theme = {
      from: this.theme.to,
      to: dark ? 1 : 0,
      t0: now,
      c: [(origin.left + origin.width / 2) / this.vw, 1 - (origin.top + origin.height / 2) / this.vh],
    };
    this.lastAct = now + 1400;
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.resizeTimer);
    if (this.prefetching) cancelIdle(this.prefetching);
    window.removeEventListener("pointermove", this.onPointer);
    window.removeEventListener("resize", this.onResize);
    this.root.removeEventListener("focusin", this.onFocus);
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.lenis.destroy();
    this.titles.dispose();
    this.fluid?.release();
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
    this.canvas.remove();
    delete this.root.dataset.immersive;
    this.root.style.removeProperty("--vh");
    for (const c of this.chs) {
      c.sec.style.height = "";
      c.stage.style.transform = "";
      c.stage.removeAttribute("data-vis");
      c.stage.removeAttribute("data-live");
      for (const d of c.ds) {
        d.style.opacity = d.style.transform = d.style.filter = "";
      }
    }
  }

  private scrollTo(y: number, duration: number) {
    this.lenis.scrollTo(y, { duration, easing: easeInOutQuart });
  }

  private relayout() {
    this.vw = innerWidth;
    this.vh = innerHeight;
    this.root.style.setProperty("--vh", `${this.vh}px`);
    for (const c of this.chs) {
      c.ty = 0;
      c.stage.style.transform = "";
    }
    const overflows = this.chs.map((c) => Math.max(0, c.stage.offsetHeight - this.vh));
    this.layout = layoutChapters(overflows, this.vh);
    this.chs.forEach((c, k) => (c.sec.style.height = `${this.layout.chapters[k].height}px`));
    this.resizeCanvas();
    if (this.fluid && !this.fluid.resize(this.vw / this.vh, this.vw < MOBILE)) {
      this.fluid.release();
      this.fluid = null;
    }
    this.lenis.resize();
  }

  private resizeCanvas() {
    this.scale = renderScale(devicePixelRatio, this.vw, this.vh, this.governor.quality, scene.maxDpr, scene.maxPixels);
    this.canvas.width = Math.round(this.vw * this.scale);
    this.canvas.height = Math.round(this.vh * this.scale);
    this.titles.clear();
  }

  private onResize = () => {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => {
      // Mobile URL bars resize the viewport while scrolling; relayout would make the page jump.
      if (Math.abs(innerWidth - this.vw) < 2 && Math.abs(innerHeight - this.vh) < 120) return;
      this.relayout();
    }, 150);
  };

  private onPointer = (e: PointerEvent) => {
    const x = e.clientX / this.vw, y = 1 - e.clientY / this.vh;
    if (this.hasMouse) {
      const dx = x - this.mouse[0], dy = y - this.mouse[1];
      this.tmv[0] += dx * 1.1;
      this.tmv[1] += dy * 1.1;
      this.delta[0] += dx;
      this.delta[1] += dy;
    }
    this.mouse = [x, y];
    this.hasMouse = true;
    this.lastAct = performance.now();
  };

  private onFocus = (e: FocusEvent) => {
    const k = this.chs.findIndex((c) => c.sec.contains(e.target as Node));
    if (k >= 0 && k !== this.cur) this.scrollTo(this.layout.chapters[k].top, 1.2);
  };

  private onLost = (e: Event) => {
    e.preventDefault();
    this.cb.onLost();
  };

  private frame = (t: number) => {
    this.raf = requestAnimationFrame(this.frame);
    this.lenis.raf(t);
    if (document.hidden) return;

    const now = performance.now();
    const y = this.lenis.animatedScroll;
    const raw = y - (this.lastY ?? y);
    this.lastY = y;
    this.sv += (raw - this.sv) * 0.1;
    if (Math.abs(raw) > 0.1) this.lastAct = now;

    const s = scrollState(y, this.layout.chapters, this.layout.H);
    if (s.cur !== this.cur) {
      this.cur = s.cur;
      this.cb.onChapter(s.cur);
    }
    this.choreograph(s);
    this.updateHud(s, t);

    this.tmv[0] *= 0.86;
    this.tmv[1] *= 0.86;
    const tl = Math.hypot(this.tmv[0], this.tmv[1]);
    if (tl > 0.12) {
      this.tmv[0] *= 0.12 / tl;
      this.tmv[1] *= 0.12 / tl;
    }
    this.mv[0] += (this.tmv[0] - this.mv[0]) * 0.1;
    this.mv[1] += (this.tmv[1] - this.mv[1]) * 0.1;

    const fdt = t - (this.frameT ?? t);
    this.frameT = t;
    const idle = now - this.lastAct > 600 && Math.hypot(this.mv[0], this.mv[1]) < 1e-4;
    if (!idle && this.governor.sample(fdt)) this.resizeCanvas();
    // At rest only the slow terrain drift moves: 30 fps is enough.
    if (idle && ++this.frameCount % 2) return;
    this.render(t, s);
  };

  private choreograph(s: ScrollState) {
    for (let k = 0; k < this.N; k++) {
      const c = this.chs[k];
      const ph = chapterPhase(k, s.i, s.T);
      const vis = ph.on && ((ph.enter > 0.001 && ph.exit < 0.999) || (k === s.i && !!c.title && s.T < 0.999));
      if (c.vis !== vis) {
        c.vis = vis;
        c.stage.toggleAttribute("data-vis", vis);
      }
      const ty = k === s.i ? -this.layout.chapters[k].over * s.pan : 0;
      if (c.ty !== ty) {
        c.ty = ty;
        c.stage.style.transform = ty ? `translate3d(0,${ty.toFixed(1)}px,0)` : "";
      }
      const live = (k === s.i && s.T < 0.5) || (k === s.i + 1 && s.T >= 0.5);
      if (c.live !== live) {
        c.live = live;
        c.stage.toggleAttribute("data-live", live);
      }
      if (!ph.on) continue;
      const n = c.ds.length;
      for (let j = 0; j < n; j++) {
        const r = reveal(ph.enter, ph.exit, j, n);
        const sig = r.opacity.toFixed(3) + r.y.toFixed(1);
        if (c.sigs[j] === sig) continue;
        c.sigs[j] = sig;
        const d = c.ds[j].style;
        d.opacity = r.opacity.toFixed(3);
        d.transform = `translate3d(0,${r.y.toFixed(1)}px,0)`;
        d.filter = r.blur > 0.05 ? `blur(${r.blur.toFixed(1)}px)` : "";
      }
    }
  }

  private updateHud(s: ScrollState, t: number) {
    const hudDark = s.inv > 0.6 !== this.dark;
    if (hudDark !== this.hudDark) {
      this.hudDark = hudDark;
      this.cb.onHudDark(hudDark);
    }
    const { progress, cue, bar } = this.hud;
    const key = (s.progress / (this.N - 1)).toFixed(4);
    if (progress && key !== this.progressKey) {
      this.progressKey = key;
      progress.style.transform = `scaleY(${key})`;
    }
    const o = Math.max(0, 1 - s.progress * 5);
    if (cue && o !== this.cueOpacity) {
      this.cueOpacity = o;
      cue.style.opacity = o.toFixed(3);
    }
    if (bar && o > 0) bar.style.transform = `translateY(${(((t / 2200) % 1) * 200 - 100).toFixed(1)}%)`;
  }

  private titleTex(k: number) {
    const c = this.chs[k];
    return this.titles.get(k, c.title, this.canvas.width, this.canvas.height, this.scale, c.ty);
  }

  /** Rasterising a title costs a few ms: do the one after next while the browser is idle. */
  private prefetch(i: number) {
    const k = i + 2;
    if (k >= this.N || this.prefetching || this.titles.has(k)) return;
    this.prefetching = requestIdle(() => {
      this.prefetching = 0;
      if (this.titles.has(k)) return;
      this.titleTex(k);
    });
  }

  private render(t: number, s: ScrollState) {
    const gl = this.gl, u = (n: string) => this.prog.u(n);
    const i = s.i;
    const ta = this.titleTex(i), tb = this.titleTex(Math.min(this.N - 1, i + 1));
    this.titles.prune((k) => k >= i - 1 && k <= i + 2);
    this.prefetch(i);
    const offA = this.chs[i].ty / this.vh;

    if (this.fluid) {
      const now = t / 1000;
      const dt = Math.min(1 / 30, Math.max(1 / 240, now - (this.fluidT ?? now - 1 / 60)));
      this.fluidT = now;
      const dT = s.T - (this.lastTransition ?? s.T);
      this.lastTransition = s.T;
      this.fluid.step({
        now,
        dt,
        asp: this.vw / this.vh,
        mouse: this.mouse,
        delta: this.delta,
        ta,
        tb,
        T: s.T,
        dT,
        offA,
        scroll: this.sv,
        distortion: scene.distortion,
        ink: scene.ink,
      });
      this.delta = [0, 0];
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.prog.p);
    gl.uniform1i(u("uA"), bindTex(gl, 0, ta));
    gl.uniform1i(u("uB"), bindTex(gl, 1, tb));
    gl.uniform1i(u("uFlow"), bindTex(gl, 2, this.fluid?.vel.r.t ?? this.zero));
    gl.uniform1i(u("uDye"), bindTex(gl, 3, this.fluid?.dye.r.t ?? this.zero));
    const tx = this.fluid?.vel.r.tx ?? [0, 0];
    gl.uniform2f(u("uSimTx"), tx[0], tx[1]);

    const tp = Math.min(1, (performance.now() - this.theme.t0) / 1200);
    gl.uniform1f(u("uFrom"), this.theme.from);
    gl.uniform1f(u("uTo"), this.theme.to);
    gl.uniform1f(u("uThR"), tp >= 1 ? 4 : (1 - (1 - tp) ** 3) * 2.6);
    gl.uniform2f(u("uThC"), this.theme.c[0], this.theme.c[1]);

    gl.uniform1f(u("uOffA"), offA);
    gl.uniform1f(u("uT"), s.T);
    gl.uniform1f(u("uTime"), t / 1000);
    gl.uniform1f(u("uZ"), s.progress);
    gl.uniform1f(u("uVel"), this.sv);
    gl.uniform1f(u("uInv"), s.inv);
    gl.uniform1f(u("uAsp"), this.vw / this.vh);
    gl.uniform1f(u("uS"), scene.distortion);
    gl.uniform1f(u("uInk"), scene.ink);
    gl.uniform1f(u("uLines"), scene.lines);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

const hasIdle = typeof window !== "undefined" && typeof window.requestIdleCallback === "function";

const requestIdle = (cb: () => void): number =>
  hasIdle ? requestIdleCallback(cb, { timeout: 500 }) : window.setTimeout(cb, 120);

const cancelIdle = (id: number) => (hasIdle ? cancelIdleCallback(id) : clearTimeout(id));
