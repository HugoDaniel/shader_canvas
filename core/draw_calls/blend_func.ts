import { nop } from "../common/nop.ts";

type BlendFactor =
  | "ZERO"
  | "ONE"
  | "SRC_COLOR"
  | "ONE_MINUS_SRC_COLOR"
  | "DST_COLOR"
  | "ONE_MINUS_DST_COLOR"
  | "SRC_ALPHA"
  | "ONE_MINUS_SRC_ALPHA"
  | "DST_ALPHA"
  | "ONE_MINUS_DST_ALPHA"
  | "CONSTANT_COLOR"
  | "ONE_MINUS_CONSTANT_COLOR"
  | "CONSTANT_ALPHA"
  | "ONE_MINUS_CONSTANT_ALPHA"
  | "SRC_ALPHA_SATURATE";

function readBlendFactor(
  value: string | null,
  defaultFactor: BlendFactor = "ZERO",
): BlendFactor {
  switch (value) {
    case "ZERO":
    case "ONE":
    case "SRC_COLOR":
    case "ONE_MINUS_SRC_COLOR":
    case "DST_COLOR":
    case "ONE_MINUS_DST_COLOR":
    case "SRC_ALPHA":
    case "ONE_MINUS_SRC_ALPHA":
    case "DST_ALPHA":
    case "ONE_MINUS_DST_ALPHA":
    case "CONSTANT_COLOR":
    case "ONE_MINUS_CONSTANT_COLOR":
    case "CONSTANT_ALPHA":
    case "ONE_MINUS_CONSTANT_ALPHA":
    case "SRC_ALPHA_SATURATE":
      return value;
    default:
      return defaultFactor;
  }
}

export class BlendFunc extends globalThis.HTMLElement {
  static tag = "blend-func";
  blendFunc: () => void = nop;
  initialize(gl: WebGL2RenderingContext) {
    // Create the blendFunc
    const sfactor = gl[this.sfactor];
    const dfactor = gl[this.dfactor];
    this.blendFunc = () => gl.blendFunc(sfactor, dfactor);
    gl.enable(gl.BLEND);
  }

  get sfactor(): BlendFactor {
    return readBlendFactor(this.getAttribute("sfactor"), "ONE");
  }

  get dfactor(): BlendFactor {
    return readBlendFactor(this.getAttribute("dfactor"), "ZERO");
  }
}
