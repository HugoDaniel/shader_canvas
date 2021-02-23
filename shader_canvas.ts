// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
/**
 * Welcome to the Shader Canvas code.
 * 
 * This is the entry-point of this graphics framework library.
 * 
 * The code is intended to be analyzed and bundled by Deno.
 * 
 * Documentation can be found at https://hugodaniel.com/projects/shader-canvas/
 */
import "https://deno.land/x/domtype@v1.0.4/mod.ts";
import { nop } from "./core/common/nop.ts";
import { DrawCalls } from "./core/draw_calls/draw_calls.ts";
import { WebGLCanvas } from "./core/webgl_canvas/webgl_canvas.ts";
import type {
  InitializerFunction,
  ModulesFunctions,
  ShaderPart,
  ShaderProgram,
} from "./core/common/program_class.ts";
import { NewModules } from "./core/new_modules/new_modules.ts";
import { Payload } from "./core/new_modules/payload.ts";
import { CanHaveModules } from "./core/new_modules/create_module.ts";

/**
 * Shader Canvas uses a very simple life-cycle for its components.
 * It resorts to calling the "initialize()" function of each component class.
 * 
 * In order for this to work at a time where all the necessary classes have
 * already been defined at the Web Components customElements registry, a list
 * of dependencies is set at runtime. The initialization function of this
 * component depends on these classes being properly defined at the
 * customElements global registry.
 * 
 * This list is declared at the file scope because it is also used at the
 * bottom of this file to declare these classes if they are not declared.
 */
const dependsOn = [
  WebGLCanvas,
  DrawCalls,
  NewModules,
];

/**
 * Class for the `<shader-canvas>` tags.
 * 
 * This is the main entry point of the Shader Canvas framework.
 * 
 * It is meant to allow multiple graphics back-ends. Abstractions can be
 * created from these graphics back-ends through custom tags that
 * merge and compose parts of their functionality.
 * 
 * The `<shader-canvas>` children tags define its behavior. These tags can be
 * any custom modules or a supported graphics back-end with its associated
 * functionality.
 * 
 * It establishes the graphics back-ends and its actions (`<webgl-canvas>`
 * is the only supported).
 * 
 * It allows modules and composable parts to be imported and defined inside it.
 * This is why it extends the [CanHaveParts](#CanHaveParts) class.
 * 
 * It is an HTMLElement that is created with the `ShaderCanvas.tag` string name. 
 * 
 * The Web Components life-cycle methods and events are all avoided and kept
 * to their defaults. It is the responsibility of the user to call the
 * entry-point of this class, which is the `initialize()` function.
 */
export class ShaderCanvas extends CanHaveModules {
  /**
   * ## `<shader-canvas>` {#ShaderCanvas}
   * 
   * This is the starting tag of the graphics framework. Your app can have
   * several of these tags.
   * 
   * 
   * The allowed children are:
   * 
   * - [`<webgl-canvas>`](#WebGLCanvas) _WebGL low-level back-end_
   * - [`<new-modules>`](#NewModules) _Modules tags and their content_ 
   * - Any module tag defined inside the `<new-modules>`
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *  <webgl-canvas>
   *    <!-- webgl-canvas specific tags here -->
   *  </webgl-canvas>
   *  <new-modules>
   *    <!-- create your modules here, e.g. -->
   *    <triangle-stream>
   *      <!--
   *      this module is called "triangle-stream" inside it you
   *      can put some webgl-canvas parts, that will be merged
   *      whenever this tag is used.
   *      -->
   *    </triangle-stream>
   *  </new-modules>
   * 
   *  <!--
   *    here the module is being used, its webgl-canvas parts
   *    will be merged here during initialization
   *  --> 
   *  <triangle-stream></triangle-stream>
   * 
   * </shader-canvas>
   * ``` 
   */
  static tag = "shader-canvas";
  /**
   * This function allows a shader program to define a custom initialization
   * and render function.
   * 
   * The initializer function passed as argument is a closure that returns
   * a function to be called by the draw calls.
   * 
   * **Example**
   * 
   * ```javascript
   * const myProgram = ShaderCanvas.createProgram((gl) => {
   *   // Initialize your state here
   *   const state = {
   *     frame: 0
   *   };
   * 
   *   return (() => {
   *     // Called by the render loop.
   *     state.frame++;
   *   })
   * })
   * 
   * // Set the program tag name that calls this function:
   * myProgram.useWith("simple-cube");
   * ```
   * 
   * For a usable example check the
   * [2nd example - texture quad](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/2-textured-quad)
   * 
   * It returns an instance of `ShaderProgram`, which has the `useWith()`
   * function.
   */
  static createProgram(render: InitializerFunction): ShaderProgram {
    // Returns an anonymous instance of ShaderProgram that sets the
    // InitializerFunction parts into the static `programInitializers` Map().
    return (new (class implements ShaderProgram {
      initializer = render;

      /**
       * This function is meant to associate a tag name from the
       * `<webgl-programs>` container with an initializer function.
       * 
       * This is used during program initialization to create the render
       * function for the program. The render function created is then used
       * by the draw calls.
       **/
      useWith(name: string) {
        ShaderCanvas.programInitializers.set(name.toLowerCase(), render);
      }
    })());
  }
  /**
   * This Map associates the tag name with the function provided by the
   * `ShaderCanvas.createProgram()`.
   **/
  private static programInitializers = new Map<string, InitializerFunction>();

  /**
   * This function associates an initializer and life-cycle methods to a
   * module.
   * 
   * Each module must have a main tag, defined as a child of `<new-modules>`.
   * 
   * It receives an initializer that can return an object that attributes a 
   * function to each life-cycle points.
   * 
   * The initializer function also receives the module "payload". The module
   * "payload" is an intermediate state of the module DOM, that holds the 
   * module contents and its connection points to the main module tag
   * attributes. This allows for the main module tag attributes to control
   * the attributes and content of the payload before it gets applied to the
   * graphics framework backend.
   * 
   * The supported life-cycle methods for a module are:
   * 
   * - _`onFrame`_ - Called when a frame is entered.
   * - _`onUseProgram`_ - Called when a program starts to be used
   *   (right after a useProgram call)
   * 
   * The initializer function can return an object with these functions set.
   * 
   * **Example**
   * 
   * ```javascript
   * const part = ShaderCanvas.webglModule(() => {
   *   const state = [0, 0];
   *   document.body.addEventListener("mousemove", (e) => {
   *     state[0] = e.offsetX;
   *     state[1] = e.offsetY;
   *   })
   *   return ({
   *     onUseProgram({gl}, program) {
   *       const mouseLoc = program.uniformLocations.get("mousePosition");
   *       gl.uniform2f(mouseLoc, state);
   *     }
   *   });
   * });
   * 
   * part.useWith("mouse-position");
   * ```
   * For a usable example check the
   * [3rd example - animation](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/3-animation)
   */
  static webglModule(createModule: (p: Payload) => void | ModulesFunctions) {
    // Returns an anonymous class of ShaderPart
    // This class implements the `useWith` function.
    return (new (class implements ShaderPart {
      createPart = createModule;

      /**
       * Associates the initializer passed as argument to the `webglModule()`
       * with a module name.
       * 
       * This initializer is then run when the modules are being initialized.
       * Modules are initialized at the start, before the framework tags get
       * called to be initialized. This allows modules to run and perform tasks
       * on their payload
       * 
       */
      useWith(name: string) {
        ShaderCanvas.modulesInitializers.set(
          name.toLowerCase(),
          // The initializer function is wrapped in order to associate the
          // object of functions it returns with the module name being set
          // when calling useWith.
          // This object of functions is an option return of the initializer
          // function (it can return undefined - nothing at all).
          // If defined, it is then passed to the initializer functions of
          // the graphics back-end, which is responsible to call these functions
          // defined for the module at their respective moments.
          // (onFrame is called when a frame is starting and onUseProgram is
          // called when a shader program is being used by <use-program>).
          (p: Payload) => {
            const functions = createModule(p);
            if (functions) {
              ShaderCanvas.modulesFunctions.set(name.toLowerCase(), functions);
            }
          },
        );
      }
    })());
  }

  /**
   * Associates a module name with its initializer function.
   * Note that the initializer function being expected here is the wrapper
   * function that deals with setting the module initializer
   * life-cycle functions object in the `modulesFunctions` Map.
   */
  private static modulesInitializers = new Map<
    string,
    (p: Payload) => void
  >();

  /**
   * Associates a life-cycle functions object with a module name.
   * These functions are expected to be called by the underlying graphics
   * framework at their respective moments (onFrame at the start of a frame,
   * and onUseProgram when a <use-program> tag is run)
   */
  private static modulesFunctions = new Map<string, ModulesFunctions>();

  /**
   * Promise that resolves when all dependencies have a tag in the
   * customElements global Web Components registry.
   * 
   * This is used in the async initialize() function, the main function and 
   * entry point of this class, to ensure that its code only runs when all the
   * tags it depends are available. 
   */
  private whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  /**
   * A number that sets the width of the underlying graphics backend.
   * This number is passed to the graphics backend to set its canvas dimensions.
   * 
   * It defaults to the `window.innerWidth` attribute value.
   * 
   * A graphics backend might not follow this number exactly and use it as a
   * basis to set the pixel width based on the underlying pixel ratio.
   */
  get width(): number {
    return Number(this.getAttribute("width") || `${window.innerWidth}`);
  }

  /**
   * A number that sets the height of the underlying graphics backend.
   * Like the width, this is passed to the graphics backend to set its
   * canvas dimensions.
   * 
   * It defaults to the `window.innerHeight` attribute value.
   * 
   * A graphics backend might not follow this number exactly and use it as a
   * basis to set the pixel height based on the underlying pixel ratio.
   */
  get height(): number {
    return Number(this.getAttribute("height") || `${window.innerHeight}`);
  }

  /**
   * The WebGL graphics back-end. It starts as null, and is setup with default
   * tags if it is not available as an immediate child when the initialize()
   * is called.
   */
  private webglCanvas: WebGLCanvas | null = null;

  /**
   * A helper attribute to access the Shadow Root.
   * 
   * The shadow root is used to keep the default <webgl-canvas> instance if
   * it was not set as an immediate child of <shader-canvas>.
   * 
   * This makes sure that:
   * 1. the backend is always available even when it was not directly declared
   * 2. there is always a graphics backend declaration with the graphics state
   * that is being run.
   * 
   * The shadow root has a <slot> inside it, to keep the declared content
   * directly visible as <shader-canvas> children while being linked inside
   * the shadow root, where things are unfolded to represent the verbose
   * graphics backend state (very useful for debugging purposes).
   */
  private root = this.attachShadow({ mode: "open" });

  /**
   * Call draw to start the <draw-calls> of this <shader-canvas> graphics
   * back-end.
   */
  draw: () => void = nop;
  async initialize() {
    // Only proceed if every needed tag is registered
    await this.whenLoaded;

    // Check if there is a webgl-canvas child, if not, create one in the
    // shadow root.
    // This does not initialize or call any method, it just creates the
    // WebGL Canvas elements for the most minimal usage if they don't exist.
    this.setWebGLCanvas();

    // This style element is going to be appended to the shadow root.
    const style = globalThis.document.createElement("style");
    // It includes the styling for the unique default slot
    // This styles all content. The browser automatically connects all of the
    // <shader-canvas> children to the default slot in the shadow root.
    style.textContent = `
      webgl-canvas,
      slot,
      ::slotted(*),
      * {
        width: ${this.width}px;
        height: ${this.height}px;
        overflow: hidden;
      }
      ::slotted(*) {
        display: none;
      }
      webgl-canvas {
        display: block;
      }
    `;
    // Create the default slot for the shadow root. By default the browser
    // connects it to all of the children of <shader-canvas>.
    const slot = globalThis.document.createElement("slot");
    // The shadow root at this stage will also contain the graphics framework
    // backend tag (<webgl-canvas> in this case).
    this.root.append(style, slot);

    // Initialization of child components starts here:
    // To read any new modules that might be defined, get the <new-modules>
    // class and initialize it.
    const modules = this.querySelector(NewModules.tag);
    // Payloads represent the intermediate state of a module. It holds the
    // module contents and how to fill them with the information that might
    // be provided through the attributes of the main module tag.
    let payloads: Payload[] = [];
    if (modules && modules instanceof NewModules) {
      // Pass down the modules function initializers set through the API
      // Each module creation function is responsible to return the module
      // Payload (the blueprint of nodes ready to be connected to the module
      // main tag).
      // Passing the module init functions Map, allows the module creation
      // function to call them and allow them to transform the payload before
      // the module initialization is finished and returns the final payload
      // version to be connected.
      payloads = await modules.initialize(
        ShaderCanvas.modulesInitializers,
      );
    }
    // Initialize the WebGL graphics framework back-end if it is defined.
    // (It should be by now, since it is the only one supported - the default
    // initialization of <shader-canvas> done at `setWebGLCanvas()` above
    // ensures that this is a very likely if to occur).
    if (this.webglCanvas) {
      // Any eventual modules that might be used must already be initialized
      // at this stage. This means that each module must have its corresponding
      // Payload ready to be applied. Applying a payload is an operation that
      // does two things:
      // 1. Sets any attributes present on its module tag instance to its body
      // 2. Merges this body with the parent tag of the module tag instance
      //
      // The `this.applyPayloads()` is a function from the CanHaveModules
      // class extension.
      this.applyPayloads({
        // The payloadChildFilter selects which child tags are eligible to
        // have a payload applied in them.
        payloadChildFilter: (child) =>
          child.nodeName === "WEBGL-PROGRAMS" ||
          child.nodeName === "WEBGL-VERTEX-ARRAY-OBJECTS" ||
          child.nodeName === "WEBGL-TEXTURES" ||
          child.nodeName === "WEBGL-BUFFERS" ||
          child.nodeName === "DRAW-CALLS",
        payloads,
        // The removeModule flag specifies if the module tag should be removed
        // after the payload is applied.
        // In this case, the module tag is left where it is, this might help
        // when debugging, leaving the trace of the modules being used that
        // are being merged at the final DOM state.
        removeModule: false,
        destinationRoot: this.webglCanvas,
        destinationChooser: (name) =>
          this.webglCanvas ? this.webglCanvas.querySelector(name) : null,
      });
      // Initializing the WebGL graphics back-end consists in create a
      // canvas with the gl context, and initialize each of the containers
      // declared as children.
      // The program initializers are passed so that each program can call
      // its corresponding init function that was set with the ShaderCanvas API.
      await this.webglCanvas.initialize({
        width: this.width,
        height: this.height,
        payloads,
        programInitializers: ShaderCanvas.programInitializers,
        modulesFunctions: ShaderCanvas.modulesFunctions,
      });
      // The ShaderCanvas draw function is just a reference to the webgl draw
      // function. This draw function must be called in order for ShaderCanvas
      // to draw anything. The reference passing here is just to allow other
      // graphics frameworks to exist in the future.
      if (this.webglCanvas instanceof WebGLCanvas) {
        const webglDraw = this.webglCanvas.webglCanvasDraw;
        this.draw = webglDraw;
      } else {
        console.warn(`<${ShaderCanvas.tag}>: no webgl canvas instance found`);
      }
    } else {
      // Avoid a hard fail (it is not good to have tags that produce exceptions
      // and fail by stopping the execution).
      // This else is very unlikely to happen, but still some kind of output
      // is welcome to have in such an event.
      console.warn(`No <${WebGLCanvas.tag}> found.`);
    }
  }

  /**
   * Creates a <webgl-canvas> tag in the Shadow Root if none exist.
   * 
   * The default <webgl-canvas> child tags are set in it by this method.
   */
  private setWebGLCanvas() {
    // Check if there is a <webgl-canvas> tag defined as a child
    if (!this.querySelector(WebGLCanvas.tag)) {
      // If not, then create a new one with the default containers in it:
      const webglCanvas = WebGLCanvas.default();
      // Keep a reference to it in ShaderCanvas (this is used by the
      // initialize() function)
      this.webglCanvas = webglCanvas;
      if (webglCanvas) {
        // And place it in the Shadow Root
        this.root.append(webglCanvas);
      } else {
        console.warn(
          `<${ShaderCanvas.tag}>: no <${WebGLCanvas.tag}> found and unable to \
          create the default <${WebGLCanvas.tag}>. Make sure it is loaded and \
          defined.`,
        );
      }
    } else {
      // If a <webgl-canvas> tag exists as a child, get its class instance
      const webglCanvas = this.querySelector(WebGLCanvas.tag);
      if (webglCanvas instanceof WebGLCanvas) {
        // And set a reference to it in ShaderCanvas (this is used by the
        // initialize() function)
        this.webglCanvas = webglCanvas;
      } else {
        console.warn(
          `<${ShaderCanvas.tag}>: the child <${WebGLCanvas.tag}> is not an \
        instance of WebGLCanvas (not a valid canvas object). Make sure it is \
        loaded and defined.`,
        );
      }
    }
  }
}

// Add the ShaderCanvas to the list of dependencies and go through all of them
// and register their tags in the Web Components customElements global registry.
// This is run at the module level, when this module is imported. The
// initialize() function waits for all these classes to be registered before
// doing anything.
[ShaderCanvas, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    // Each class must have a static "tag" attribute defined, with the
    // name to be registered as a new custom tag.
    globalThis.customElements.define(component.tag, component);
  }
});
