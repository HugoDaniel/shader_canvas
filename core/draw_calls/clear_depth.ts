// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { nop } from "../common/nop.ts";

/**
 * ClearDepth is a Web Component for a tag that represents the equivalent
 * operation of the `gl.clearDepth()` function.
 */
export class ClearDepth extends globalThis.HTMLElement {
  /**
   * ## `<clear-depth>` {#ClearDepth}
   * 
   * This tag is the equivalent of the [WebGL `clearDepth() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearDepth).
   * 
   * It specifies the clear value for the depth buffer.
   * 
   * No child tags allowed in `<clear-depth>`.
   * 
   * The `<clear-depth>` tag is meant to be used as a child of the
   * [`<draw-calls>`](#DrawCalls) list of actions.
   */
  static tag = "clear-depth";
  /**
   * The function to call when rendering, defaults to a no-op and is created
   * in `initialize()`.
   */
  clearDepth: () => void = nop;
  /**
   * Reads the DOM "depth" attribute and creates the `clearDepth` closure.
   */
  initialize(gl: WebGL2RenderingContext) {
    const depth = this.depth;

    this.clearDepth = () => gl.clearDepth(depth);
  }

  /**
   * A number specifying the depth value used when the depth buffer is cleared.
   * Default value: 1.
   */
  get depth(): number {
    const value = this.getAttribute("depth");
    if (value === null) return 1;
    return Number(value);
  }
}
