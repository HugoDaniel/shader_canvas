import { dependencies, DrawCallsContainer } from "./draw_calls_container.ts";
import { ProgramRenderer } from "../common/program_class.ts";
import { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { glError } from "../common/errors.ts";

/**
 * Needs the same dependencies that the DrawCalls needs
 * See that class and the DrawCallsContainer for more details on these.
 */
const dependsOn = [...dependencies];

export class BindFramebuffer extends DrawCallsContainer {
  static tag = "bind-framebuffer";
  /**
   * A promise that resolves when all the needed dependencies in the
   * `dependsOn` list are available.  
   */
  private whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );
  get src(): string | null {
    return this.getAttribute("src");
  }
  /**
   * Creates the drawing function that performs the action of each child tag
   * declared.
   * 
   * These functions will happen with the framebuffer binded to them.
   * The framebuffer is set to null after the draw calls in it are run.
   */
  async initialize(
    gl: WebGL2RenderingContext,
    context: WebGLCanvasContext,
    renderers: Map<string, ProgramRenderer>,
    updaters: (() => void)[],
  ) {
    await this.whenLoaded;
    // Get the framebuffer
    const framebufferName = this.src;
    if (!framebufferName) {
      console.warn(`No "src" attribute found in <${BindFramebuffer}>.`);
      return;
    }

    const framebuffer = context.framebuffers.content.get(framebufferName);
    if (!framebuffer) {
      console.warn(
        `Framebuffer "${framebufferName}" NOT FOUND in <${BindFramebuffer}>.\n
        Make sure it is properly declared inside <webgl-framebuffers>.`,
      );
      return;
    }

    this.drawFunctions.push(framebuffer.bindFramebuffer);
    const target = gl[framebuffer.target];
    await this.buildDrawFunction(gl, context, renderers, updaters);
    this.drawFunctions.push(() => {
      gl.bindFramebuffer(target, null);
    });
    this.gl = gl;
  }

  gl: WebGL2RenderingContext | undefined;
}

// Register the tags that this class depends on.
[BindFramebuffer, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
