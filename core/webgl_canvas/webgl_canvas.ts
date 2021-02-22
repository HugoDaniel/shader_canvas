import "https://deno.land/x/domtype@v1.0.4/mod.ts";
import type { WebGLCanvasRuntime } from "./runtime.ts";
import { WebGLPrograms } from "../webgl_programs/webgl_programs.ts";
import { WebGLBuffers } from "../webgl_buffers/webgl_buffers.ts";
import type { WebGLCanvasContext } from "./context.ts";
import { WebGLVertexArrayObjects } from "../webgl_vertex_array_objects/webgl_vertex_array_objects.ts";
import { WebGLTextures } from "../webgl_textures/webgl_textures.ts";
import { DrawCalls } from "../draw_calls/draw_calls.ts";
import { nop } from "../common/nop.ts";
import { ShaderCanvasInitializer } from "../shader_canvas/initializer.ts";

const dependsOn = [
  WebGLPrograms,
  WebGLBuffers,
  DrawCalls,
  WebGLVertexArrayObjects,
];
export class WebGLCanvas extends globalThis.HTMLElement {
  /**
   * ## `<webgl-canvas>` {#WebGLCanvas}
   * 
   * This tag defines a WebGL graphics backend.
   * Its children are the logic blocks and actions to perform.
   * 
   * It splits WebGL operation into 5 distinct parts:
   * 
   * - _Programs_ - Shader programs to use when drawing
   * 
   * - _Buffers_ - Raw data, define here the sources to use elsewhere
   * - _Vertex Array Objects_ - 
   *      Each child defines blocks that set how the data in the buffers is
   *      going to be read.
   * - _Textures_ - 
   *      Image and video data sources
   * - _Draw calls_ - 
   *      How to draw the 4 parts above.
   * 
   * The allowed children are:
   * 
   * - `<webgl-canvas>` _WebGL low-level back-end_
   * - `<new-modules>` _Modules tags and their content_ 
   * - Any module tag defined inside the `<new-modules>`
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *  <webgl-canvas>
   *    <webgl-textures>
   *      <!-- WebGL Textures are defined here -->
   *    </webgl-textures>
   *    
   *    <webgl-buffers>
   *      <!-- WebGL Buffer Data is defined here -->
   *    </webgl-buffers>
   * 
   *    <webgl-vertex-array-objects>
   *      <!-- WebGL Vertex Array Objects go here -->
   *    </webgl-vertex-array-objects>
   * 
   *    <webgl-programs>
   *      <!-- Shader programs are defined here -->
   *    </webgl-programs>
   * 
   *    <draw-calls>
   *      <!-- Set the viewport and background color and draw programs here -->
   *    </draw-calls>
   *  </webgl-canvas>
   * </shader-canvas>
   * ``` 
   * 
   * For a usable example check the
   * [2nd example - texture quad](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/2-textured-quad)
   * 
   * The `<webgl-canvas>` tag is meant to be used as a child of the
   * [`<shader-canvas>`](#ShaderCanvas) tag.
   */

  static tag = "webgl-canvas";
  private whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );
  private root = this.attachShadow({ mode: "open" });
  private canvas: HTMLCanvasElement = globalThis.document.createElement(
    "canvas",
  );
  gl: WebGL2RenderingContext | undefined;
  getContext: () => WebGLCanvasContext | null = () => null;
  webglCanvasDraw: () => void = nop;

  initialize(init: ShaderCanvasInitializer) {
    const {
      width,
      height,
      programInitializers,
    } = init;
    return this.whenLoaded.then(async () => {
      const dpr = window.devicePixelRatio;
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
      this.canvas.style.transform = `scale(${1 / dpr})`;
      this.canvas.style.transformOrigin = `top left`;

      const style = globalThis.document.createElement("style");
      style.textContent = `
      slot {
        display: none;
      }
      width: ${width}px;
      height: ${height}px;
      `;

      this.root.append(
        style,
        this.canvas,
      );
      this.gl = this.initializeGL();

      // Create Context object, it holds the nodes of the containers that
      // <webgl-canvas> needs to properly run
      // When the containers are not found, this function also creates the
      // minimal child layout needed for proper <webgl-canvas> functioning
      this.getContext = this.createContext(this.gl, init);
      // Initialize the context
      const ctx = this.getContext();
      if (!ctx) {
        console.warn("<webgl-canvas>: unable to create runtime context");
        return;
      }
      await ctx.programs.initialize(ctx);
      await ctx.buffers.initialize(ctx);
      await ctx.textures.initialize(ctx);
      await ctx.vaos.initialize(ctx);
      // The context is now only partially initialized, to finish initialization
      // it is needed to call the custom initialize functions for each program
      // if they exist
      const renderers = await ctx.programs.callInitializers(
        this.gl,
        ctx,
        programInitializers,
      );

      // Check if there is a draw calls tag
      let drawCallsRoot = this.querySelector(DrawCalls.tag);
      if (!drawCallsRoot) {
        drawCallsRoot = globalThis.document.createElement(DrawCalls.tag);
        this.append(drawCallsRoot);
      }
      if (drawCallsRoot instanceof DrawCalls) {
        // Place the default draw calls if they are not set
        this.createDefaultDrawCalls(this.gl, drawCallsRoot);
        await drawCallsRoot.initialize(this.gl, ctx, renderers).then(() => {
          // Create the update function
          if (drawCallsRoot instanceof DrawCalls) {
            this.webglCanvasDraw = drawCallsRoot.drawCalls;
          }
        });
      } else {
        console.warn(
          `<webgl-canvas>: unable to initialize the <${DrawCalls.tag}>`,
        );
      }
    });
  }
  private createContext(
    gl: WebGL2RenderingContext,
    { payloads, partsFunctions }: ShaderCanvasInitializer,
  ): () => (WebGLCanvasContext | null) {
    // Read children and create tags that are missing
    let buffers = this.querySelector(WebGLBuffers.tag);
    if (!buffers) {
      console.warn(`<webgl-canvas>: Unable to find <${WebGLBuffers.tag}>`);
      buffers = globalThis.document.createElement(WebGLBuffers.tag);
      this.appendChild(buffers);
    }
    let vaos = this.querySelector(WebGLVertexArrayObjects.tag);
    if (!vaos) {
      console.warn(
        `<webgl-canvas>: Unable to find <${WebGLVertexArrayObjects.tag}>`,
      );
      vaos = globalThis.document.createElement(WebGLVertexArrayObjects.tag);
      this.appendChild(vaos);
    }
    let programs = this.querySelector(WebGLPrograms.tag);
    if (!programs) {
      console.warn(`<webgl-canvas>: Unable to find <${WebGLPrograms.tag}>`);
      programs = globalThis.document.createElement(WebGLPrograms.tag);
      this.appendChild(programs);
    }
    let textures = this.querySelector(WebGLTextures.tag);
    if (!textures) {
      console.warn(`<webgl-canvas>: Unable to find <${WebGLTextures.tag}>`);
      textures = globalThis.document.createElement(WebGLTextures.tag);
      this.appendChild(textures);
    }
    if (
      textures instanceof WebGLTextures && programs instanceof WebGLPrograms &&
      vaos instanceof WebGLVertexArrayObjects && buffers instanceof WebGLBuffers
    ) {
      // Create Runtime object
      const runtime = this.createRuntime();

      const context = {
        gl,
        programs,
        buffers,
        vaos,
        textures,
        runtime,
        payloads,
        partsFunctions,
      };
      return () => context;
    }
    console.warn("<webgl-canvas>: Unable to create context function");
    return () => null;
  }
  private createRuntime(): WebGLCanvasRuntime {
    const canvas512 = globalThis.document.createElement("canvas");
    const canvas1024 = globalThis.document.createElement("canvas");
    const canvas2048 = globalThis.document.createElement("canvas");
    const runtimeElement = globalThis.document.createElement(
      "webgl-canvas-runtime",
    );
    canvas512.width = 512;
    canvas512.height = 512;
    canvas1024.width = 1024;
    canvas1024.height = 1024;
    canvas2048.width = 2048;
    canvas2048.height = 2048;
    runtimeElement.append(canvas512, canvas1024, canvas2048);

    this.root.append(runtimeElement);
    const offscreenCanvas512 = canvas512.getContext("2d");
    const offscreenCanvas1024 = canvas512.getContext("2d");
    const offscreenCanvas2048 = canvas512.getContext("2d");

    if (
      offscreenCanvas512 === null || offscreenCanvas1024 === null ||
      offscreenCanvas2048 === null
    ) {
      throw new Error("Unable to create offscreen canvas context");
    }

    return ({
      offscreenCanvas512,
      offscreenCanvas1024,
      offscreenCanvas2048,
    });
  }
  private initializeGL() {
    const ctx = this.canvas.getContext("webgl2");
    if (
      !ctx ||
      typeof (ctx as WebGL2RenderingContext).getContextAttributes !==
        "function"
    ) {
      throw new Error("No WebGL 2.0 support");
    }
    return ctx;
  }
  private createDefaultDrawCalls(
    gl: WebGL2RenderingContext,
    drawCalls: DrawCalls,
  ) {
    /*

    // `root` is the parent DrawCalls element
    if (!drawCalls.querySelector("viewport-transformation")) {
      const viewport = globalThis.document.createElement(
        "viewport-transformation",
      );
      viewport.setAttribute("x", "0");
      viewport.setAttribute("y", "0");
      viewport.setAttribute("width", `${gl.drawingBufferWidth}`);
      viewport.setAttribute("height", `${gl.drawingBufferHeight}`);
      drawCalls.prepend(viewport);
    }
    if (!drawCalls.querySelector("clear-color")) {
      const clearColor = globalThis.document.createElement("clear-color");
      const gray = "0.9568"; // ~ 0xf4
      clearColor.setAttribute("red", gray);
      clearColor.setAttribute("green", gray);
      clearColor.setAttribute("blue", gray);
      clearColor.setAttribute("alpha", "1");
      drawCalls.prepend(clearColor);
    }
    // Create default drawing tags if they are not set
    if (!drawCalls.querySelector("blend-func")) {
      const blendFunc = globalThis.document.createElement("blend-func");
      blendFunc.setAttribute("sfactor", "SRC_ALPHA");
      blendFunc.setAttribute("dfactor", "ONE_MINUS_SRC_ALPHA");
      drawCalls.prepend(blendFunc);
    }
    */
  }
  static default() {
    const parent = globalThis.document.createElement(WebGLCanvas.tag);
    const programs = globalThis.document.createElement(WebGLPrograms.tag);
    const buffers = globalThis.document.createElement(WebGLBuffers.tag);
    const vaos = globalThis.document.createElement(
      WebGLVertexArrayObjects.tag,
    );
    const textures = globalThis.document.createElement(WebGLTextures.tag);

    parent.append(textures, vaos, buffers, programs);
    if (parent instanceof WebGLCanvas) {
      return parent;
    }
    return null;
  }
}

[WebGLCanvas, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
