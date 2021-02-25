import { nop } from "../common/nop.ts";

/** 
 * This type is used to define the possible values that can go in the
 * <blend-func> "dfactor" and "sfactor" attributes.
 * 
 * They follow the possible values for the `gl.blendFunc`
 * [arguments](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc#constants).
 */
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

/**
 * Helper function that reads any string and returns it if it is a valid
 * `BlendFactor` string.
 * 
 * If the string is not a valid `BlendFactor` the value `"ZERO"` is
 * returned or the `defaultFactor` provided as argument.
 */
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

/**
 * BlendFunc is a Web Component for a tag that represents the equivalent
 * operation of the `gl.blendFunc()` function.
 */
export class BlendFunc extends globalThis.HTMLElement {
  /**
   * ## `<blend-func>` {#BlendFunc}
   * 
   * This tag is the equivalent of the [WebGL `blendFunc() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc).
   * 
   * It sets the function WebGL uses to do the pixel blending arithmetic.
   * 
   * The presence of this tag automatically sets `gl.enable(gl.BLEND)`
   * 
   * No child tags allowed in `<blend-func>`.
   * 
   * The `<blend-func>` tag is meant to be used as a child of the
   * [`<draw-calls>`](#DrawCalls) list of actions.
   */
  static tag = "blend-func";
  blendFunc: () => void = nop;
  /**
   * Reads the DOM html attributes and creates the `blendFunc` closure.
   * 
   * Enables the WebGL blend.
   */
  initialize(gl: WebGL2RenderingContext) {
    // Create the blendFunc
    const sfactor = gl[this.sfactor];
    const dfactor = gl[this.dfactor];
    this.blendFunc = () => gl.blendFunc(sfactor, dfactor);
    gl.enable(gl.BLEND);
  }

  /**
   * A string specifying a multiplier for the _source_ blending factors. The
   * default value is `gl.ONE`.
   * 
   * Possible values:
   * - `"ZERO"`
   * - `"ONE"` _(default)_
   * - `"SRC_COLOR"`
   * - `"ONE_MINUS_SRC_COLOR"`
   * - `"DST_COLOR"`
   * - `"ONE_MINUS_DST_COLOR"`
   * - `"SRC_ALPHA"`
   * - `"ONE_MINUS_SRC_ALPHA"`
   * - `"DST_ALPHA"`
   * - `"ONE_MINUS_DST_ALPHA"`
   * - `"CONSTANT_COLOR"`
   * - `"ONE_MINUS_CONSTANT_COLOR"`
   * - `"CONSTANT_ALPHA"`
   * - `"ONE_MINUS_CONSTANT_ALPHA"`
   * - `"SRC_ALPHA_SATURATE"`
   */
  get sfactor(): BlendFactor {
    return readBlendFactor(this.getAttribute("sfactor"), "ONE");
  }

  /**
   * A string specifying a multiplier for the _destination_ blending factors.
   * The default value is `gl.ZERO`.
   * 
   * Possible values:
   * - `"ZERO"` _(default)_
   * - `"ONE"`
   * - `"SRC_COLOR"`
   * - `"ONE_MINUS_SRC_COLOR"`
   * - `"DST_COLOR"`
   * - `"ONE_MINUS_DST_COLOR"`
   * - `"SRC_ALPHA"`
   * - `"ONE_MINUS_SRC_ALPHA"`
   * - `"DST_ALPHA"`
   * - `"ONE_MINUS_DST_ALPHA"`
   * - `"CONSTANT_COLOR"`
   * - `"ONE_MINUS_CONSTANT_COLOR"`
   * - `"CONSTANT_ALPHA"`
   * - `"ONE_MINUS_CONSTANT_ALPHA"`
   * - `"SRC_ALPHA_SATURATE"`
   */
  get dfactor(): BlendFactor {
    return readBlendFactor(this.getAttribute("dfactor"), "ZERO");
  }
}
