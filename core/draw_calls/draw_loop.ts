import { nop } from "../common/nop.ts";
import { ProgramRenderer } from "../common/program_class.ts";
import { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { dependencies, DrawCallsContainer } from "./draw_calls_container.ts";
const dependsOn = [...dependencies];

export class DrawLoop extends DrawCallsContainer {
  static tag = "draw-loop";
  whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  rafId = -1;
  raf = (dt: DOMHighResTimeStamp) => {
    this.drawCalls();
    this.rafId = window.requestAnimationFrame(this.raf);
  };
  start() {
    this.rafId = window.requestAnimationFrame(this.raf);
  }
  stop() {
    window.cancelAnimationFrame(this.rafId);
  }
  async initialize(
    gl: WebGL2RenderingContext,
    context: WebGLCanvasContext,
    renderers: Map<string, ProgramRenderer>,
  ) {
    await this.whenLoaded;
    await this.buildDrawFunction(gl, context, renderers);
    // prepend the functions for the parts that have declared a "onFrame"
    // function
    for (const functions of context.partsFunctions.values()) {
      if (functions.onFrame && typeof functions.onFrame === "function") {
        const f = functions.onFrame;
        this.drawFunctions.unshift(() => f(context));
      }
    }
  }
}

// Create tags
[DrawLoop, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
