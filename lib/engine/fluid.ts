import { bindTex, createProgram, type GL, type Program } from "./gl";
import { FLUID, FLUID_HEAD, VERT } from "./shaders";

interface Target {
  t: WebGLTexture;
  fb: WebGLFramebuffer;
  w: number;
  h: number;
  tx: [number, number];
}

class Swap {
  constructor(public r: Target, public w: Target) {}
  swap() {
    const x = this.r;
    this.r = this.w;
    this.w = x;
  }
}

export interface FluidInput {
  now: number;
  dt: number;
  asp: number;
  mouse: [number, number];
  delta: [number, number];
  ta: WebGLTexture;
  tb: WebGLTexture;
  T: number;
  dT: number;
  offA: number;
  /** Smoothed scroll velocity, px per frame. */
  scroll: number;
  distortion: number;
  ink: number;
}

type Passes = Record<keyof typeof FLUID, Program>;

export class Fluid {
  vel!: Swap;
  dye!: Swap;
  private p!: Swap;
  private div!: Target;
  private curl!: Target;
  private targets: Target[] = [];

  private constructor(
    private gl: GL,
    private S: Passes,
    private type: number,
    private filter: number,
  ) {}

  static create(gl: GL): Fluid | null {
    const hf = gl.getExtension("OES_texture_half_float");
    if (!hf) return null;
    const linear = gl.getExtension("OES_texture_half_float_linear");
    gl.getExtension("EXT_color_buffer_half_float");
    const S = {} as Passes;
    for (const [name, src] of Object.entries(FLUID) as [keyof typeof FLUID, string][]) {
      const prog = createProgram(gl, VERT, FLUID_HEAD + src);
      if (!prog) return null;
      S[name] = prog;
    }
    return new Fluid(gl, S, hf.HALF_FLOAT_OES, linear ? gl.LINEAR : gl.NEAREST);
  }

  /** Returns false when half-float render targets are unsupported. */
  resize(asp: number, mobile: boolean) {
    const gl = this.gl;
    this.release();
    const res = (h: number): [number, number] => (asp >= 1 ? [Math.round(h * asp), h] : [h, Math.round(h / asp)]);
    let ok = true;
    const mk = (w: number, h: number): Target => {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, this.type, null);
      const fb = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      ok &&= gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const target = { t, fb, w, h, tx: [1 / w, 1 / h] as [number, number] };
      this.targets.push(target);
      return target;
    };
    const [sw, sh] = res(128);
    const [dw, dh] = res(mobile ? 256 : 420);
    this.vel = new Swap(mk(sw, sh), mk(sw, sh));
    this.dye = new Swap(mk(dw, dh), mk(dw, dh));
    this.p = new Swap(mk(sw, sh), mk(sw, sh));
    this.div = mk(sw, sh);
    this.curl = mk(sw, sh);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return ok;
  }

  private run(prog: Program, target: Target, set: (p: Program) => void) {
    const gl = this.gl;
    gl.useProgram(prog.p);
    set(prog);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
    gl.viewport(0, 0, target.w, target.h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  step(i: FluidInput) {
    const gl = this.gl, S = this.S, V = this.vel, D = this.dye, tx = V.r.tx;
    const k = i.distortion;
    const [dx, dy] = i.delta;
    const speed = Math.hypot(dx, dy);

    if (speed > 0) {
      this.run(S.splat, V.w, (p) => {
        gl.uniform1i(p.u("uTarget"), bindTex(gl, 0, V.r.t));
        gl.uniform1f(p.u("uAsp"), i.asp);
        gl.uniform2f(p.u("uPoint"), i.mouse[0], i.mouse[1]);
        gl.uniform2f(p.u("uColor"), ((dx * V.r.w) / i.dt) * 0.7 * k, ((dy * V.r.h) / i.dt) * 0.7 * k);
        gl.uniform1f(p.u("uRadius"), 0.0005);
      });
      V.swap();
    }

    const flood = Math.min(0.08, Math.abs(i.dT));
    const fsrc = i.dT >= 0 ? i.ta : i.tb, foff = i.dT >= 0 ? i.offA : 0;
    const hover = Math.min(0.4, speed * 8) * i.ink;
    const hsrc = i.T < 0.5 ? i.ta : i.tb, hoff = i.T < 0.5 ? i.offA : 0;
    const dyePass = (src: WebGLTexture, h: number, fl: number, off: number) => {
      this.run(S.textDye, D.w, (p) => {
        gl.uniform1i(p.u("uTarget"), bindTex(gl, 0, D.r.t));
        gl.uniform1i(p.u("uText"), bindTex(gl, 1, src));
        gl.uniform2f(p.u("uPoint"), i.mouse[0], i.mouse[1]);
        gl.uniform1f(p.u("uAsp"), i.asp);
        gl.uniform1f(p.u("uRadius"), 0.00028);
        gl.uniform1f(p.u("uHover"), h);
        gl.uniform1f(p.u("uFlood"), fl * i.ink);
        gl.uniform1f(p.u("uOff"), off);
      });
      D.swap();
    };
    if (hover > 0.001) dyePass(hsrc, hover, 0, hoff);
    if (flood > 0.0005) dyePass(fsrc, 0, flood, foff);

    const drift = Math.max(-40, Math.min(40, i.scroll * 0.6));
    if (flood > 0.0005 || Math.abs(drift) > 0.05) {
      this.run(S.textForce, V.w, (p) => {
        gl.uniform1i(p.u("uTarget"), bindTex(gl, 0, V.r.t));
        gl.uniform1i(p.u("uText"), bindTex(gl, 1, fsrc));
        gl.uniform1f(p.u("uAmt"), flood * 900 * k);
        gl.uniform1f(p.u("uTime"), i.now);
        gl.uniform1f(p.u("uDrift"), drift * k);
        gl.uniform1f(p.u("uOff"), foff);
      });
      V.swap();
    }

    this.run(S.curl, this.curl, (p) => {
      gl.uniform1i(p.u("uVel"), bindTex(gl, 0, V.r.t));
      gl.uniform2f(p.u("uTx"), tx[0], tx[1]);
    });
    this.run(S.vort, V.w, (p) => {
      gl.uniform1i(p.u("uVel"), bindTex(gl, 0, V.r.t));
      gl.uniform1i(p.u("uCurl"), bindTex(gl, 1, this.curl.t));
      gl.uniform2f(p.u("uTx"), tx[0], tx[1]);
      gl.uniform1f(p.u("uC"), 22);
      gl.uniform1f(p.u("uDt"), i.dt);
    });
    V.swap();
    this.run(S.div, this.div, (p) => {
      gl.uniform1i(p.u("uVel"), bindTex(gl, 0, V.r.t));
      gl.uniform2f(p.u("uTx"), tx[0], tx[1]);
    });
    this.run(S.mul, this.p.w, (p) => {
      gl.uniform1i(p.u("uSrc"), bindTex(gl, 0, this.p.r.t));
      gl.uniform1f(p.u("uK"), 0.8);
    });
    this.p.swap();
    for (let n = 0; n < 16; n++) {
      this.run(S.jacobi, this.p.w, (p) => {
        gl.uniform1i(p.u("uP"), bindTex(gl, 0, this.p.r.t));
        gl.uniform1i(p.u("uDiv"), bindTex(gl, 1, this.div.t));
        gl.uniform2f(p.u("uTx"), tx[0], tx[1]);
      });
      this.p.swap();
    }
    this.run(S.grad, V.w, (p) => {
      gl.uniform1i(p.u("uP"), bindTex(gl, 0, this.p.r.t));
      gl.uniform1i(p.u("uVel"), bindTex(gl, 1, V.r.t));
      gl.uniform2f(p.u("uTx"), tx[0], tx[1]);
    });
    V.swap();
    this.run(S.advect, V.w, (p) => {
      gl.uniform1i(p.u("uVel"), bindTex(gl, 0, V.r.t));
      gl.uniform1i(p.u("uSrc"), 0);
      gl.uniform2f(p.u("uTx"), tx[0], tx[1]);
      gl.uniform1f(p.u("uDt"), i.dt);
      gl.uniform1f(p.u("uDiss"), 1 / (1 + i.dt * 0.6));
    });
    V.swap();
    this.run(S.advect, D.w, (p) => {
      gl.uniform1i(p.u("uVel"), bindTex(gl, 0, V.r.t));
      gl.uniform1i(p.u("uSrc"), bindTex(gl, 1, D.r.t));
      gl.uniform2f(p.u("uTx"), tx[0], tx[1]);
      gl.uniform1f(p.u("uDt"), i.dt);
      gl.uniform1f(p.u("uDiss"), 1 / (1 + i.dt * 1.5));
    });
    D.swap();
  }

  release() {
    const gl = this.gl;
    for (const t of this.targets) {
      gl.deleteTexture(t.t);
      gl.deleteFramebuffer(t.fb);
    }
    this.targets = [];
  }
}
