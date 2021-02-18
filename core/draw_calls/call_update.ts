import type { WebGLCanvasContext } from "../webgl_canvas/context.ts";

export class CallUpdate extends globalThis.HTMLElement {
  initialize(gl: WebGL2RenderingContext, context: WebGLCanvasContext) {
    // Get the parent "component"/"part"
    // If it has an update function, then call it
  }
}
