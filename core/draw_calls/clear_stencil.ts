// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { nop } from "../common/nop.ts";

/**
 * ClearStencil is a Web Component for a tag that represents the equivalent
 * operation of the `gl.clearStencil()` function.
 */
export class ClearStencil extends globalThis.HTMLElement {
  /**
   * ## `<clear-stencil>` {#ClearStencil}
   * 
   * This tag is the equivalent of the [WebGL `clearStencil() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearStencil).
   * 
   * It specifies the clear value for the WebGL stencil buffer.
   * 
   * No child tags allowed in `<clear-stencil>`.
   * 
   * The `<clear-stencil>` tag is meant to be used as a child of the
   * [`<draw-calls>`](#DrawCalls) list of actions.
   */
  static tag = "clear-stencil";
  /**
   * The function to call when rendering, defaults to a no-op and is created
   * in `initialize()`.
   */
  clearStencil: () => void = nop;
  /**
   * Reads the DOM "s" attribute and creates the `clearStencil` closure.
   */
  initialize(gl: WebGL2RenderingContext) {
    const s = this.s;

    this.clearStencil = () => gl.clearStencil(s);
  }
  /**
   * A number specifying the index used when the stencil buffer is cleared.
   * Default value: 0.
   */
  get s(): number {
    return Number(this.getAttribute("s"));
  }
}
