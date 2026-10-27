import type { GL } from "./gl";

/**
 * Draws each glyph at the position the DOM gives it, so the WebGL title lands
 * pixel-for-pixel on the transparent HTML title (which stays selectable and accessible).
 */
export class TitleTextures {
  private tex = new Map<number, WebGLTexture>();
  private ctx: CanvasRenderingContext2D;
  private blank: WebGLTexture;

  constructor(private gl: GL) {
    this.ctx = document.createElement("canvas").getContext("2d")!;
    this.blank = this.create();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  }

  has(idx: number) {
    return this.tex.has(idx);
  }

  /** `ty` is the stage's current translateY, removed so the texture is drawn at rest. */
  get(idx: number, el: HTMLElement | null, width: number, height: number, scale: number, ty: number) {
    let t = this.tex.get(idx);
    if (!t) {
      t = el ? this.draw(el, width, height, scale, ty) : this.blank;
      this.tex.set(idx, t);
    }
    return t;
  }

  prune(keep: (idx: number) => boolean) {
    for (const [idx, t] of this.tex) {
      if (keep(idx)) continue;
      if (t !== this.blank) this.gl.deleteTexture(t);
      this.tex.delete(idx);
    }
  }

  clear() {
    this.prune(() => false);
  }

  dispose() {
    this.clear();
    this.gl.deleteTexture(this.blank);
    this.ctx.canvas.width = this.ctx.canvas.height = 0;
  }

  private create() {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }

  private draw(el: HTMLElement, width: number, height: number, scale: number, ty: number) {
    const x = this.ctx, c = x.canvas;
    if (c.width !== width || c.height !== height) {
      c.width = width;
      c.height = height;
    }
    x.setTransform(scale, 0, 0, scale, 0, 0);
    x.clearRect(0, 0, width / scale, height / scale);
    x.fillStyle = "#000";
    x.textBaseline = "alphabetic";
    const range = document.createRange();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const cs = getComputedStyle(node.parentElement!);
      x.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = x.measureText("Hg");
      const ascent = m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent;
      const str = node.textContent ?? "";
      for (let i = 0; i < str.length; i++) {
        if (str[i] === " " || str[i] === "\n") continue;
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const r = range.getBoundingClientRect();
        if (!r.width) continue;
        x.fillText(str[i], r.left, r.top - ty + ascent);
      }
    }
    const gl = this.gl;
    const t = this.create();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    return t;
  }
}
