import { nop } from "../common/nop.ts";

export class ClearDepth extends globalThis.HTMLElement {
  static tag = "clear-depth";
  clearDepth: () => void = nop;

  initialize(gl: WebGL2RenderingContext) {
    const depth = this.depth;

    this.clearDepth = () => gl.clearDepth(depth);
  }

  get depth(): number {
    return Number(this.getAttribute("depth"));
  }
}
