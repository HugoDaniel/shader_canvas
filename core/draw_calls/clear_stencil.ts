import { nop } from "../common/nop.ts";

export class ClearStencil extends globalThis.HTMLElement {
  static tag = "clear-stencil";
  clearStencil: () => void = nop;

  initialize(gl: WebGL2RenderingContext) {
    const s = this.s;

    this.clearStencil = () => gl.clearStencil(s);
  }

  get s(): number {
    return Number(this.getAttribute("s"));
  }
}
