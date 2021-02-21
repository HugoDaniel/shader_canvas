// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
/**
 * Welcome to the Shader Canvas code.
 * 
 * This is the entry-point of this graphics framework library.
 * 
 * The code is intended to be analyzed and bundled by Deno.
 */
import "https://deno.land/x/domtype@v1.0.4/mod.ts";
import { nop } from "./core/common/nop.ts";
import { DrawCalls } from "./core/draw_calls/draw_calls.ts";
import { WebGLCanvas } from "./core/webgl_canvas/webgl_canvas.ts";
import type {
  InitializerFunction,
  PartsFunctions,
  ShaderPart,
  ShaderProgram,
} from "./core/common/program_class.ts";
import { NewModules } from "./core/new_modules/new_modules.ts";
import { Payload } from "./core/new_modules/payload.ts";
import { CanHaveParts, CreatePart } from "./core/new_modules/create_part.ts";

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
export class ShaderCanvas extends CanHaveParts {
  /**
   * ## `<shader-canvas>`
   * 
   * This is the starting tag of the graphics framework. Your app can have
   * several of these tags.
   * 
   * 
   * The allowed children are:
   * 
   * - `<webgl-canvas>` _WebGL low-level back-end_
   * - `<new-modules>` _Modules tags and their content_ 
   * - Any module tag defined inside the `<new-modules>`
   * 
   * ### Example
   * 
   * ```html
   * <shader-canvas>
   *  <webgl-canvas>
   *    <!-- webgl-canvas specific tags here -->
   *  </webgl-canvas>
   *  <new-modules>
   *    <triangle-stream>
   *      <!-- some webgl-canvas parts here -->
   *    </triangle-stream>
   *  </new-modules>
   * 
   *  <triangle-stream></triangle-stream>
   * 
   * </shader-canvas>
   * ``` 
   */
  static tag = "shader-canvas";
  static createProgram(render: InitializerFunction): ShaderProgram {
    return (new (class implements ShaderProgram {
      initializer = render;
      useWith(name: string) {
        ShaderCanvas.programInitializers.set(name, render);
      }
    })());
  }
  static programInitializers = new Map<string, InitializerFunction>();
  static partsInitializers = new Map<
    string,
    (p: Payload) => void
  >();
  static partsFunctions = new Map<string, PartsFunctions>();
  static webglPart(createPart: (p: Payload) => void | PartsFunctions) {
    return (new (class implements ShaderPart {
      createPart = createPart;
      useWith(name: string) {
        ShaderCanvas.partsInitializers.set(name.toLowerCase(), (p: Payload) => {
          const functions = createPart(p);
          if (functions) {
            ShaderCanvas.partsFunctions.set(name.toLowerCase(), functions);
          }
        });
      }
    })());
  }

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

  webglCanvas: WebGLCanvas | null = null;
  root = this.attachShadow({ mode: "open" });
  draw: () => void = nop;
  initialize() {
    return this.whenLoaded.then(async () => {
      // Check if there is a webgl-canvas child, if not, create one in the
      // shadow root
      // This does not call initialize or any method, it just adjusts the
      // WebGL Canvas elements
      this.setWebGLCanvas();
      const style = globalThis.document.createElement("style");
      style.textContent = `
      slot {
        width: ${this.width}px;
        height: ${this.height}px;
        background: yellow;
      }
      `;
      const slot = globalThis.document.createElement("slot");
      this.root.append(style, slot);

      // Initialization of child components starts here:
      // Read new parts
      const modules = this.querySelector(NewModules.tag);
      let payloads: Payload[] = [];
      if (modules && modules instanceof NewModules) {
        payloads = await modules.initialize(
          ShaderCanvas.partsInitializers,
        );
      }
      // Parts in use directly as children of <shader-canvas>
      const shaderCanvasParts: CreatePart[] = [];
      for (const child of [...this.children]) {
        if (child instanceof CreatePart) {
          shaderCanvasParts.push(child);
        }
      }

      if (this.webglCanvas) {
        // Merge the parts before initialization
        // this.mergeContainerParts(shaderCanvasParts, payloads, this.webglCanvas);
        this.applyPayloads({
          payloadChildFilter: (child) =>
            child.nodeName === "WEBGL-PROGRAMS" ||
            child.nodeName === "WEBGL-VERTEX-ARRAY-OBJECTS" ||
            child.nodeName === "WEBGL-TEXTURES" ||
            child.nodeName === "WEBGL-BUFFERS" ||
            child.nodeName === "DRAW-CALLS",
          payloads,
          removePart: false,
          destinationRoot: this.webglCanvas,
          destinationChooser: (name) =>
            this.webglCanvas ? this.webglCanvas.querySelector(name) : null,
        });
        // Initialize
        await this.webglCanvas.initialize({
          width: this.width,
          height: this.height,
          payloads,
          programInitializers: ShaderCanvas.programInitializers,
          partsFunctions: ShaderCanvas.partsFunctions,
        });
        if (this.webglCanvas instanceof WebGLCanvas) {
          this.draw = () => this.webglCanvas?.webglCanvasDraw();
        } else {
          console.warn(`<${ShaderCanvas.tag}>: no webgl canvas instance found`);
        }
      } else {
        console.warn(`No <${WebGLCanvas.tag}> found.`);
      }
      return Promise.resolve();
    });
  }
  private setWebGLCanvas() {
    if (!this.querySelector(WebGLCanvas.tag)) {
      const webglCanvas = WebGLCanvas.default();
      this.webglCanvas = webglCanvas;
      if (webglCanvas) {
        this.root.append(webglCanvas);
      } else {
        console.warn(
          `<${ShaderCanvas.tag}>: no <${WebGLCanvas.tag}> found and unable to \
          create the default <${WebGLCanvas.tag}>. Make sure it is loaded and \
          defined.`,
        );
      }
    } else {
      const webglCanvas = this.querySelector(WebGLCanvas.tag);
      if (webglCanvas instanceof WebGLCanvas) {
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

[ShaderCanvas, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
