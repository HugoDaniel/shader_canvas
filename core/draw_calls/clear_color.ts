import { nop } from "../common/nop.ts";

/**
 * ClearColor is a Web Component for a tag that represents the equivalent
 * operation of the `gl.clearColor()` function.
 */
export class ClearColor extends globalThis.HTMLElement {
  /**
   * ## `<clear-color>` {#ClearColor}
   * 
   * This tag is the equivalent of the [WebGL `clearColor() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearColor).
   * 
   * It specifies the RGBA color values used when clearing color buffers.
   * 
   * No child tags allowed in `<clear-color>`.
   * 
   * The `<clear-color>` tag is meant to be used as a child of the
   * [`<draw-calls>`](#DrawCalls) list of actions.
   */
  static tag = "clear-color";
  /**
   * The function to call when rendering, defaults to a no-op and is created
   * in `initialize()`.
   */
  clearColor: () => void = nop;
  /**
   * Reads the DOM html attributes and creates the `clearColor` closure.
   */
  initialize(gl: WebGL2RenderingContext) {
    const r = this.red;
    const g = this.green;
    const b = this.blue;
    const a = this.alpha;

    this.clearColor = () => gl.clearColor(r, g, b, a);
  }

  /**
   * The "red" color value, a number between 0.0 and 1.0.
   * Defaults to 0.
   */
  get red(): number {
    return Number(this.getAttribute("red"));
  }
  /**
   * The "green" color value, a number between 0.0 and 1.0.
   * Defaults to 0.
   */
  get green(): number {
    return Number(this.getAttribute("green"));
  }
  /**
   * The "blue" color value, a number between 0.0 and 1.0.
   * Defaults to 0.
   */
  get blue(): number {
    return Number(this.getAttribute("blue"));
  }
  /**
   * The "alpha" color value, a number between 0.0 and 1.0.
   * Defaults to 0.
   */
  get alpha(): number {
    return Number(this.getAttribute("alpha"));
  }
}
