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
import { nop } from "./common/nop.ts";
import { DrawCalls } from "./draw_calls/draw_calls.ts";
import { WebGLCanvas } from "./webgl_canvas/webgl_canvas.ts";
import type {
  InitializerFunction,
  PartsFunctions,
  ShaderPart,
  ShaderProgram,
} from "./common/program_class.ts";
import { NewModules } from "./new_modules/new_modules.ts";
import { Payload } from "./new_modules/payload.ts";
import { CanHaveParts, CreatePart } from "./new_modules/create_part.ts";

const dependsOn = [
  WebGLCanvas,
  DrawCalls,
  NewModules,
];

/**
 * Class for the `<shader-canvas>` tags.
 * @extends ./new_modules/create_part.ts:CanHaveParts
 */
export class ShaderCanvas extends CanHaveParts {
  /** To something  */

  /** ShaderCanvas class is used to define a custom element with the
   * "shader-canvas" name.
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

  whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  get width(): number {
    return Number(this.getAttribute("width") || `${window.innerWidth}`);
  }
  set width(value: number) {
    this.setAttribute("width", `${value}`);
  }
  get height(): number {
    return Number(this.getAttribute("height") || `${window.innerHeight}`);
  }
  set height(value: number) {
    this.setAttribute("height", `${value}`);
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
