// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { nop } from "../common/nop.ts";

/**
 * CullFace is a Web Component for a tag that represents the equivalent
 * operation of the `gl.cullFace()` function.
 */
export class CullFace extends globalThis.HTMLElement {
  /**
   * ## `<cull-face>` {#CullFace}
   * 
   * This tag is the equivalent of the [WebGL `cullFace() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace).
   * 
   * It specifies whether or not front- and/or back-facing polygons can be
   * culled.
   * 
   * The presence of this tag automatically sets `gl.enable(gl.CULL_FACE)`
   * 
   * No child tags allowed in `<cull-face>`.
   * 
   * The `<cull-face>` tag is meant to be used as a child of the
   * [`<draw-calls>`](#DrawCalls) list of actions.
   */
  static tag = "cull-face";

  /**
   * A string specifying whether front- or back-facing polygons are candidates
   * for culling.
   * 
   * The default value is "BACK". Possible values are:
   * 
   * - `"FRONT"`
   * - `"BACK"` _(default)_
   * - `"FRONT_AND_BACK"`
   */
  get mode(): CullFaceMode {
    return readCullFaceMode(this.getAttribute("mode"));
  }
  /**
   * The function to call when rendering, defaults to a no-op and is created
   * in `initialize()`.
   */
  cullFace: () => void = nop;
  /**
   * Reads the DOM mode attribute and creates the `cullFace` closure.
   * 
   * Enables the WebGL cull face mode.
   */
  initialize(gl: WebGL2RenderingContext) {
    const mode = gl[this.mode];
    this.cullFace = () => {
      gl.enable(gl.CULL_FACE);
      gl.cullFace(mode);
    };
  }
}

/** 
 * This type is used to define the possible values that can go in the
 * <cull_face> "mode" attribute.
 * 
 * They follow the possible values for the `gl.cullFace`
 * [mode parameter](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace#parameters).
 */
type CullFaceMode = "FRONT" | "BACK" | "FRONT_AND_BACK";

/**
 * Helper function that reads any string and returns it if it is a valid
 * `CullFaceMode` string.
 * 
 * If the string is not a valid `CullFaceMode` the value `"BACK"` is
 * returned.
 */
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
