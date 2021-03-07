// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { ProgramRenderer } from "../common/program_class.ts";
import { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { dependencies, DrawCallsContainer } from "./draw_calls_container.ts";

/**
 * Needs the same dependencies that the DrawCalls needs
 * See that class and the DrawCallsContainer for more details on these.
 */
const dependsOn = [...dependencies];

/**
 * This class defines a list of draw actions to be performed repeatedly. 
 * It is a Web Component that works like the DrawCalls, but sets a
 * `requestAnimationFrame` for the drawing function (or a `setTimeout` if
 * a the number of FPS's are specified).
 */
export class DrawLoop extends DrawCallsContainer {
  /**
   * ## `<draw-loop>` {#DrawLoop}
   * 
   * This tag is a container of a WebGL draw commands. Each child defines a
   * WebGL draw call. It is intended to hold an ordered list of tags that is run
   * sequentially _and repeatedly_.
   * 
   * It creates a draw function to perform each action listed as children and
   * then registers a `requestAnimationFrame` for that draw function
   * (the `setTimeout()` is used instead if a the number of FPS's are specified
   * ).
   * 
   * It allows the same children that the [`<draw-calls>`](#DrawCalls) accepts.
   * 
   * For a usable example check the
   * [3rd example - animation](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/3-animation)
   * 
   * The `<draw-loop>` tag is meant to be used as a child of the
   * [`<draw-calls>`](#DrawCalls) tag.
   */
  static tag = "draw-loop";
  /**
   * A promise that resolves when all the needed dependencies in the
   * `dependsOn` list are available.  
   */
  private whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  /** A reference to the registered `requestFrame` callback id */
  intervalId = -1;
  /**
   * The function that will be registered by the `requestFrame()`.
   */
  raf = (dt: DOMHighResTimeStamp) => {
    this.drawCalls();
    this.intervalId = this.requestFrame();
  };
  /**
   * Starts the loop, calls the function set at the `requestFrame` for the loop
   * function, and keeps track of its request id
   * (to allow it to be canceled/stopped).
   * 
   * The function `requestFrame` is set to a `setTimeout` when the attribute
   * "fps" is defined, otherwise `window.requestAnimationFrame` is used.
   * 
   * This function does nothing if there is already a started loop running.
   */
  start() {
    // Don't start if there is already a loop running
    if (this.intervalId !== -1) return;
    // Use `setTimeout` if there is a fixed number of "fps" defined.
    if (this.fps) {
      const interval = Math.floor(1000 / this.fps);
      this.requestFrame = () => setTimeout(this.raf, interval);
    }
    this.intervalId = this.requestFrame();
  }
  /**
   * Stops the animation frame if there is a running animation happening.
   */
  stop() {
    // Don't stop if it is already stopped
    if (this.intervalId === -1) {
      return;
    }
    // Use `clearTimeout` if there is a fixed number of "fps" defined
    if (this.fps) {
      clearTimeout(this.intervalId);
    } else {
      window.cancelAnimationFrame(this.intervalId);
    }
    this.intervalId = -1;
  }

  /**
   * The function `requestFrame` is set to a `setTimeout` when the attribute
   * "fps" is defined (this happens in the `start()` function), otherwise
   * by default the `window.requestAnimationFrame` is used.
   */
  requestFrame = () => window.requestAnimationFrame(this.raf);
  /**
   * Creates the drawing function that performs the action of each child tag
   * declared.
   * 
   * Looks for modules that are being used in Shader Canvas and that have the
   * `onFrame()` function set (done with the ShaderCanvas.webglModule API).
   */
  async initialize(
    gl: WebGL2RenderingContext,
    context: WebGLCanvasContext,
    renderers: Map<string, ProgramRenderer>,
  ) {
    await this.whenLoaded;
    await this.buildDrawFunction(gl, context, renderers);
    // prepend the functions for the modules that have declared a "onFrame"
    // function
    for (const functions of context.modulesFunctions.values()) {
      if (functions.onFrame && typeof functions.onFrame === "function") {
        const f = functions.onFrame;
        this.drawFunctions.unshift(() => f(context));
      }
    }
  }

  /**
   * Sets the number of Frames Per Second (FPS) that the loop should run.
   * It defaults to using the `window.requestAnimationFrame`.
   * 
   * This attribute is a number.
   */
  get fps(): number | null {
    const value = this.getAttribute("fps");
    if (value) {
      return Number(value);
    }
    return null;
  }
}

// Register the tags that this class depends on.
[DrawLoop, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
