import { nop } from "../common/nop.ts";
import type { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import type { ProgramRenderer } from "../common/program_class.ts";
import { dependencies, DrawCallsContainer } from "./draw_calls_container.ts";
import { DrawLoop } from "./draw_loop.ts";

const dependsOn = [DrawLoop, ...dependencies];

export class DrawCalls extends DrawCallsContainer {
  static tag = "draw-calls";
  whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  /** The draw calls initialization differs from typical containers because... */
  async initialize(
    gl: WebGL2RenderingContext,
    context: WebGLCanvasContext,
    renderers: Map<string, ProgramRenderer>,
  ) {
    await this.whenLoaded;
    await this.buildDrawFunction(gl, context, renderers);
    const drawLoopElem = this.querySelector(DrawLoop.tag);
    if (drawLoopElem && drawLoopElem instanceof DrawLoop) {
      await drawLoopElem.initialize(gl, context, renderers);
      drawLoopElem.start();
    }
  }
}

// Create tags
[DrawCalls, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
