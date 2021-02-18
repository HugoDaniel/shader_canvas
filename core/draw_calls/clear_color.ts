import { nop } from "../common/nop.ts";

export class ClearColor extends globalThis.HTMLElement {
  static tag = "clear-color";
  clearColor: () => void = nop;

  initialize(gl: WebGL2RenderingContext) {
    const r = this.red;
    const g = this.green;
    const b = this.blue;
    const a = this.alpha;

    this.clearColor = () => gl.clearColor(r, g, b, a);
  }

  get red(): number {
    return Number(this.getAttribute("red"));
  }
  get green(): number {
    return Number(this.getAttribute("green"));
  }
  get blue(): number {
    return Number(this.getAttribute("blue"));
  }
  get alpha(): number {
    return Number(this.getAttribute("alpha"));
  }
}
