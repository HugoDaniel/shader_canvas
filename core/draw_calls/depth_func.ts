// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { nop } from "../common/nop.ts";

/** 
 * This type is used to define the possible values that can go in the
 * <depth-func> "func" attribute.
 * 
 * They follow the possible values for the `gl.depthFunc`
 * [func parameter](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc#parameters).
 */
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
/**
 * Helper function that reads any string and returns it if it is a valid
 * `DepthComparison` string.
 * 
 * If the string is not a valid `DepthComparison` the value `"LESS"` is
 * returned.
 */
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
/**
 * DepthFunc is a Web Component for a tag that represents the equivalent
 * operation of the `gl.depthFunc()` function.
 */
export class DepthFunc extends globalThis.HTMLElement {
  /**
   * ## `<depth-func>` {#DepthFunc}
   * 
   * This tag is the equivalent of the [WebGL `depthFunc() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc).
   * 
   * It specifies a function that compares incoming pixel depth to the current
   * depth buffer value.
   * 
   * The presence of this tag automatically sets `gl.enable(gl.DEPTH)`
   * 
   * No child tags allowed in `<depth-func>`.
   * 
   * The `<depth-func>` tag is meant to be used as a child of the
   * [`<draw-calls>`](#DrawCalls) list of actions.
   */
  static tag = "depth-func";
  /**
   * The function to call when rendering, defaults to a no-op and is created
   * in `initialize()`.
   */
  depthFunc: () => void = nop;
  /**
   * Reads the DOM html attributes and creates the `depthFunc` closure.
   * 
   * Enables the WebGL depth mode.
   */
  initialize(gl: WebGL2RenderingContext) {
    const func = gl[this.func];
    this.depthFunc = () => {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(func);
    };
  }
  /**
   * A string specifying the depth comparison function, which sets the
   * conditions under which the pixel will be drawn. The default value is
   * `gl.LESS`.
   * 
   * Possible values are:
   * 
   * - `"NEVER"`
   * - `"LESS"` __default__
   * - `"EQUAL"`
   * - `"LEQUAL"`
   * - `"GREATER"`
   * - `"NOTEQUAL"`
   * - `"GEQUAL"`
   * - `"ALWAYS"`
   */
  get func(): DepthComparison {
    return readDepthComparison(this.getAttribute("func"));
  }
}
