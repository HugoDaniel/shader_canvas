import { nop } from "../common/nop.ts";

/**
 * ViewportTransformation is a Web Component for a tag that represents the
 * equivalent operation of the `gl.viewport()` function.
 */
export class ViewportTransformation extends globalThis.HTMLElement {
  /**
   * ## `<viewport-transform>` {#ViewportTransformation}
   * 
   * This tag is the equivalent of the [WebGL `viewport() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/viewport).
   * 
   * It sets the viewport, which specifies the affine transformation of x and
   * y from normalized device coordinates to window coordinates.
   * 
   * No child tags allowed in `<viewport-transform>`.
   * 
   * The `<viewport-transform>` tag is meant to be used as a child of the
   * [`<draw-calls>`](#DrawCalls) list of actions.
   */
  static tag = "viewport-transform";
  /**
   * The function to call when rendering, defaults to a no-op and is created
   * in `initialize()`.
   */
  viewport: () => void = nop;
  /**
   * Reads the DOM attributes and creates the `viewport()` closure.
   */
  initialize(gl: WebGL2RenderingContext) {
    const x = this.x;
    const y = this.y;
    const width = this.width === 0 ? gl.drawingBufferWidth : this.width;
    const height = this.height === 0 ? gl.drawingBufferHeight : this.height;

    this.viewport = () => gl.viewport(x, y, width, height);
  }
  /**
   * A number specifying the horizontal coordinate for the lower left corner
   * of the viewport origin.
   * 
   * Default value: 0.
   */
  get x(): number {
    const x = Number(this.getAttribute("x"));
    if (isNaN(x)) return 0;

    return x;
  }

  /**
   * A number specifying the vertical coordinate for the lower left corner of
   * the viewport origin.
   * 
   * Default value: 0.
   */
  get y(): number {
    const y = Number(this.getAttribute("y"));
    if (isNaN(y)) return 0;

    return y;
  }

  /**
   * A number specifying the width of the viewport.
   * 
   * Default value: width of the canvas.
   */
  get width(): number {
    const w = Number(this.getAttribute("width"));
    if (isNaN(w)) return 0;

    return w;
  }
  /**
   * A number specifying the height of the viewport.
   * 
   * Default value: height of the canvas.
   */
  get height(): number {
    const h = Number(this.getAttribute("height"));
    if (isNaN(h)) return 0;

    return h;
  }
}
