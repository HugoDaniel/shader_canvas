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

/**
 * WebGLCanvas largely ignores the common Web Components creation methods. 
 * It is constructed and initialized by the "initialize()" function.
 * 
 * The "initialize()" uses the classes in this list to wait for them to be
 * registered with a custom tag name at the global customElements registry.
 *   
 * This list is declared at the file scope because it is also used at the
 * bottom of this file to register the tag names for them if they are not
 * registered.
 */
const dependsOn = [
  WebGLPrograms,
  WebGLBuffers,
  DrawCalls,
  WebGLVertexArrayObjects,
];

/**
 * WebGLCanvas is a Web Component. It extends the global HTMLElement and it is
 * intended to be registered with a custom tag name at the global customElements
 * registry.
 * 
 * The tag name is defined by the static attribute "tag".
 * 
 * Constructor and callbacks are ignored. It is meant to be created by calling
 * the `initialize()` method when it is appropriate within the ShaderCanvas
 * life-cycle flow. This happens at the `ShaderCanvas.initialize()` function.
 * 
 * This class initializes all of the child containers. It makes an effort to
 * try to parallelize as much as possible during initialization.
 */
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
   * - [`<webgl-programs>`](#WebGLPrograms) _WebGL shader programs container_
   * - [`<webgl-buffers>`](#WebGLBuffers) _Buffers with raw data_ 
   * - [`<webgl-vertex-array-objects>`](#WebGLVertexArrayObjects) 
   *    _Vertex Array Objects container
   *    (here you can bundle multiple buffers and define what their raw data
   *    is formatted and what it contains)_ 
   * - [`<webgl-textures>`](#WebGLTextures) _Container for image and video data_
   * - [`<draw-calls>`](#DrawCalls) _List of actions to perform when rendering an image_
   * - Any module tag that is previously defined inside the parent
   *   [`<new-modules>`](#NewModules)
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

  /**
   * Promise that resolves when all dependencies have registered their 
   * tag in the customElements global Web Components registry.
   * 
   * This is used in the async initialize() function, to ensure that its
   * code only runs when all the tags it depends are available. 
   */
  private whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );
  /**
   * A helper attribute to access the Shadow Root.
   * 
   * The Shadow Root is used to keep the <canvas> element and set its dimensions
   * through a <style> tag (this is useful to adjust for displays with a pixel
   * ratio different than 1).
   */
  private root = this.attachShadow({ mode: "open" });
  /**
   * A helper attribute to access the <canvas> element.
   * The "webgl2" context is going come from this canvas element. 
   */
  private canvas: HTMLCanvasElement = globalThis.document.createElement(
    "canvas",
  );
  /**
   * A helper attribute to access the WebGL2RenderingContext.
   * 
   * The <webgl-canvas> is a WebGL2 only graphics backend.
   * This context comes from the <canvas> tag set at the "canvas" attribute.
   */
  gl: WebGL2RenderingContext | undefined;
  /**
   * Much like the canvas have its "getContext" function, this WebGLCanvas
   * class also has its context that is returned after calling "getContext". 
   * 
   * This function returns a context for this class that wraps the
   * WebGL2RenderingContext and each container class defined as children.
   * 
   * A context is useful to provide quick access to these classes and objects
   * without having to traverse the DOM in order to get them.
   */
  getContext: () => WebGLCanvasContext | null = () => null;
  /**
   * The draw function. This function renders a frame, it defaults to a no op.
   * 
   * This function is created by the <draw-calls> associated class. It is the
   * responsibility of the user to declare the proper draw calls as children
   * of the <draw-calls> tag. These draw calls children, together with the
   * info from the webgl container children, are used during initialization to
   * create a function to set here in this attribute.
   */
  webglCanvasDraw: () => void = nop;

  /**
   * This function creates the <canvas> element and get its "webgl2" context.
   * 
   * It calls the initialization function of each child with this "webgl2"
   * context.
   * 
   * After the children initialization it calls any program init function that
   * might have been set through the `ShaderCanvas.createProgram` API. 
   */
  async initialize(init: ShaderCanvasInitializer) {
    const {
      width,
      height,
      programInitializers,
    } = init;
    // Only proceed if every needed tag is registered
    await this.whenLoaded;
    // Read the device pixel ratio, useful to adjust the width and height of
    // the canvas.
    const dpr = window.devicePixelRatio;
    // The technique used here is to create a bigger canvas than the dimensions
    // passed, and then adjust it to the intended size with CSS style.
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;

    // Use a CSS transform: scale to reduce the <canvas> element size to the
    // one passed as argument.
    const style = globalThis.document.createElement("style");
    style.textContent = `
    canvas {
      transform: scale(${1 / dpr});
      transform-origin: top left;
    }
    .canvasWrapper {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
    }
    ::slotted(*) {
      display: none;
    }
    `;
    const wrapper = globalThis.document.createElement("div");
    wrapper.className = "canvasWrapper";
    wrapper.appendChild(this.canvas);
    // Encapsulate the canvas and its style, these are not intended to be
    // visible in the DOM inspection. They are to be used internally by this
    // class and its children.
    this.root.append(
      style,
      wrapper,
    );

    // Set the WebGL2 context to the "gl" attribute.
    this.gl = this.initializeGL();

    // Create the context object, it holds the nodes of the containers that
    // <webgl-canvas> needs to have in order to properly run.
    // When the containers are not found, this function also creates the
    // minimal child layout needed for proper <webgl-canvas> functioning
    this.getContext = this.createContext(this.gl, init);
    // Immediately call this function and use its context for the rest of the
    // initialization code. This allows for an early return if no context
    // is available to work with.
    const ctx = this.getContext();
    if (!ctx) {
      console.warn("<webgl-canvas>: unable to create runtime context");
      return;
    }
    // Initialize each of the possible containers. The context is being passed
    // to allow each container to reference or obtain data from the other
    // already defined containers.
    await ctx.programs.initialize(ctx); // Compile, link and get locations
    await ctx.buffers.initialize(ctx); // Fetch data from sources into the GPU
    await ctx.textures.initialize(ctx); // Fetch images and put them in the GPU
    await ctx.vaos.initialize(ctx); // Call the vertexAttribPointer's

    // The context is now only partially initialized, to finish initialization
    // the custom initialize functions for each program need to be executed
    // if they exist.
    const renderers = await ctx.programs.callInitializers(
      this.gl,
      ctx,
      programInitializers,
    );

    // Prepare the render function.
    // Check if there is a draw calls tag, and initialize it.
    let drawCallsRoot = this.querySelector(DrawCalls.tag);
    if (!drawCallsRoot) {
      // If there is no draw calls, create one as a child of this element.
      drawCallsRoot = globalThis.document.createElement(DrawCalls.tag);
      this.append(drawCallsRoot);
    }
    if (drawCallsRoot instanceof DrawCalls) {
      // Place the default draw calls if they are not set
      this.createDefaultDrawCalls(this.gl, drawCallsRoot);
      // Builds the draw function and sets a render loop if one is declared:
      await drawCallsRoot.initialize(this.gl, ctx, renderers);
      // The frame update function is just a reference to its equivalent of
      // the draw calls container, which at this stage (after initialization)
      // should be created and ready to daw a frame.
      if (drawCallsRoot instanceof DrawCalls) {
        this.webglCanvasDraw = drawCallsRoot.drawCalls;
      }
    } else {
      console.warn(
        `<webgl-canvas>: unable to initialize the <${DrawCalls.tag}>`,
      );
    }
  }
  /**
   * Creates the WebGLCanvas context.
   * 
   * It returns a function that returns the WebGLCanvas context.
   * 
   * This context is an object that holds the class for each of the child
   * containers in the <webgl-canvas> tag. It also references the modules
   * Payloads and the functions associated to each module from the API.
   * 
   * The final context also contains a Runtime object. This object contains
   * runtime instances of temporary objects and references.
   * It starts with a set of predefined HTML5 Canvas elements, useful for
   * functions that need to deal with ImageData. 
   * 
   * It looks for each container tag, gets their instance, and puts it in the
   * object to be returned. A warning is printed if a container tag is not
   * found. In this case, an empty container is placed as a child. This allows
   * other containers to reference it, or modules to merge their Payload to it.
   */
  private createContext(
    gl: WebGL2RenderingContext,
    { payloads, modulesFunctions }: ShaderCanvasInitializer,
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
      // Create the Runtime object
      const runtime = this.createRuntime();

      const context = {
        gl,
        programs,
        buffers,
        vaos,
        textures,
        runtime,
        payloads,
        modulesFunctions,
      };
      return () => context;
    }
    console.warn(
"<webgl-canvas>: Unable to create context function, \
    are the containers instances available and their tags registered?",
    );
    // return null if there is at least one container does not have its
    // intended instance.
    return () => null;
  }

  /**
   * Create the runtime object.
   * 
   * The runtime object represents the temporary references and nodes that
   * might be useful for the execution of the <webgl-canvas> backend.
   * 
   * This includes a few HTML5 <canvas> elements and their contexts, already
   * set to a predefined resolution. This might be useful if you are dealing
   * with ImageData or texture drawing/downscalling in the CPU side.
   * 
   * To create the canvas elements with a specific resolution and retrieve their
   * contexts, a node "webgl-canvas-runtime" is appended to the Shadow Root.
   * This is the parent node of the canvas elements in the Runtime object, it
   * should not be visible.
   */
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
      throw new Error(
"WebGL Canvas Runtime: Unable to create offscreen \
      canvas context",
      );
    }

    return ({
      offscreenCanvas512,
      offscreenCanvas1024,
      offscreenCanvas2048,
    });
  }
  /**
   * Get a "webgl2" context from the canvas element set at "this.canvas".
   * This will throw an exception if there is no such context returned. 
   */
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
    // This method does nothing for now, it is mostly commented. I still
    // have to think of a way to create the default draw calls for a simple
    // render when they are not declared as a child of <webgl-canvas>
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

  /**
   * This function creates a <webgl-canvas> tag and fills it with the 4 empty
   * containers expected to be found in it:
   * - <webgl-programs>
   * - <webgl-buffers>
   * - <webgl-vertex-array-objects>
   * - <webgl-textures>
   *  
   * It does not append this into any real DOM or Shadow DOM. The created
   * element is returned and expected to be used where appropriate. 
   */
  static default() {
    // Start by creating the <webgl-canvas> parent tag:
    const parent = globalThis.document.createElement(WebGLCanvas.tag);
    // Create its 4 containers elements:
    const programs = globalThis.document.createElement(WebGLPrograms.tag);
    const buffers = globalThis.document.createElement(WebGLBuffers.tag);
    const textures = globalThis.document.createElement(WebGLTextures.tag);
    const vaos = globalThis.document.createElement(
      WebGLVertexArrayObjects.tag,
    );

    // And append them to the parent:
    parent.append(textures, vaos, buffers, programs);
    // The WebGLCanvas class must be registered as a WebComponent,
    // or else null is returned.
    if (parent instanceof WebGLCanvas) {
      return parent;
    }
    return null;
  }
}

// Add the WebGLCanvas to the list of dependencies and go through all of them
// and register their tags in the Web Components customElements global registry.
// This is run at the module level, when this module is imported. The
// initialize() function waits for all these classes to be registered before
// doing anything.
[WebGLCanvas, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
