// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { nop } from "../common/nop.ts";

/**
 * ClearFlags is a Web Component for a tag that represents the equivalent
 * operation of the `gl.clear()` function.
 */
export class ClearFlags extends globalThis.HTMLElement {
  /**
   * ## `<clear-flags>` {#ClearFlags}
   * 
   * This tag is the equivalent of the [WebGL `clear() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clear).
   * 
   * It clears the WebGL buffers to their preset values.
   * 
   * No child tags allowed in `<clear-flags>`.
   * 
   * The `<clear-color>` tag is meant to be used as a child of the
   * [`<draw-calls>`](#DrawCalls) list of actions.
   */

  static tag = "clear-flags";

  /**
   * A string that sets the "mask" of the clear method.
   * 
   * This string can contain the three following strings separated by the
   * char "|":
   * - `"COLOR_BUFFER_BIT"`
   * - `"DEPTH_BUFFER_BIT"`
   * - `"STENCIL_BUFFER_BIT"`
   */
  get mask(): string[] {
    const maskString = this.getAttribute("mask");
    if (!maskString) return [];

    return maskString.split("|").map((s) => s.trim());
  }

  /**
   * The function to call when rendering, defaults to a no-op and is created
   * in `initialize()`.
   */
  clearFlags: () => void = nop;
  /**
   * Reads the DOM flag attribute and creates the `clearFlags` closure.
   * The mask is created by iterating through the flags values and composing
   * them with a bitwise or.
   */
  initialize(gl: WebGL2RenderingContext) {
    const flags = this.mask;
    let mask = 0;
    flags.forEach((flag) => {
      if (
        flag === "COLOR_BUFFER_BIT" || flag === "DEPTH_BUFFER_BIT" ||
        flag === "STENCIL_BUFFER_BIT"
      ) {
        mask = gl[flag] | mask;
      }
    });
    this.clearFlags = () => gl.clear(mask);
  }
}
