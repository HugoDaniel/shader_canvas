import { nop } from "../common/nop.ts";

export class ViewportTransformation extends globalThis.HTMLElement {
  static tag = "viewport-transform";
  viewport: () => void = nop;
  initialize(gl: WebGL2RenderingContext) {
    const x = this.x;
    const y = this.y;
    const width = this.width === 0 ? gl.drawingBufferWidth : this.width;
    const height = this.height === 0 ? gl.drawingBufferHeight : this.height;

    this.viewport = () => gl.viewport(x, y, width, height);
  }

  get x(): number {
    const x = Number(this.getAttribute("x"));
    if (isNaN(x)) return 0;

    return x;
  }
  get y(): number {
    const y = Number(this.getAttribute("y"));
    if (isNaN(y)) return 0;

    return y;
  }
  get width(): number {
    const w = Number(this.getAttribute("width"));
    if (isNaN(w)) return 0;

    return w;
  }
  get height(): number {
    const h = Number(this.getAttribute("height"));
    if (isNaN(h)) return 0;

    return h;
  }
}
