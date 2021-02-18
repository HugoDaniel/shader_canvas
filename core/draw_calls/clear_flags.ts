import { nop } from "../common/nop.ts";

export class ClearFlags extends globalThis.HTMLElement {
  static tag = "clear-flags";
  get flags(): string[] {
    const maskString = this.getAttribute("mask");
    if (!maskString) return [];

    return maskString.split("|").map((s) => s.trim());
  }

  clearFlags: () => void = nop;
  initialize(gl: WebGL2RenderingContext) {
    const flags = this.flags;
    let mask = 0;
    flags.forEach((flag) => {
      if (
        flag === "COLOR_BUFFER_BIT" || flag === "DEPTH_BUFFER_BIT" ||
        flag === "STENCIL_BUFFER_BIT"
      ) {
        mask = mask | gl[flag];
      }
    });
    this.clearFlags = () => gl.clear(mask);
  }
}
