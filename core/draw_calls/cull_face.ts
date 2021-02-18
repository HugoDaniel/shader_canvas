import { nop } from "../common/nop.ts";

export class CullFace extends globalThis.HTMLElement {
  static tag = "cull-face";
  get mode(): CullFaceMode {
    return readCullFaceMode(this.getAttribute("mode"));
  }
  cullFace: () => void = nop;

  initialize(gl: WebGL2RenderingContext) {
    const mode = gl[this.mode];
    this.cullFace = () => {
      gl.enable(gl.CULL_FACE);
      gl.cullFace(mode);
    };
  }
}

type CullFaceMode = "FRONT" | "BACK" | "FRONT_AND_BACK";

function readCullFaceMode(attrib: string | null): CullFaceMode {
  switch (attrib) {
    case "FRONT":
    case "BACK":
    case "FRONT_AND_BACK":
      return attrib;
    default:
      return "BACK";
  }
}
