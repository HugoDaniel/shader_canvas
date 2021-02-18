import { nop } from "../common/nop.ts";

type DepthComparison =
  //  (never pass)
  | "NEVER"
  | //  (pass if the incoming value is less than the depth buffer value)
  "LESS"
  | //  (pass if the incoming value equals the depth buffer value)
  "EQUAL"
  | //  (pass if the incoming value is less than or equal to the depth buffer value)
  "LEQUAL"
  | //  (pass if the incoming value is greater than the depth buffer value)
  "GREATER"
  | //  (pass if the incoming value is not equal to the depth buffer value)
  "NOTEQUAL"
  | //  (pass if the incoming value is greater than or equal to the depth buffer value)
  "GEQUAL"
  | //  (always pass)
  "ALWAYS";

function readDepthComparison(value: string | null): DepthComparison {
  switch (value) {
    case "NEVER":
    case "LESS":
    case "EQUAL":
    case "LEQUAL":
    case "GREATER":
    case "NOTEQUAL":
    case "GEQUAL":
    case "ALWAYS":
      return value;
    default:
      return "LESS";
  }
}

export class DepthFunc extends globalThis.HTMLElement {
  static tag = "depth-func";
  depthFunc: () => void = nop;
  initialize(gl: WebGL2RenderingContext) {
    const func = gl[this.func];
    this.depthFunc = () => {
      gl.enable(gl.DEPTH);
      gl.depthFunc(func);
    };
  }
  get func(): DepthComparison {
    return readDepthComparison(this.getAttribute("func"));
  }
}
