// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { nop } from "../common/nop.ts";
import type { ProgramRenderer } from "../common/program_class.ts";
import type { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { CreateProgram } from "../webgl_programs/create_program.ts";
import { ActiveTexture } from "./active_texture.ts";
import { DrawVAO } from "./draw_vao.ts";
import {
  SetUniform,
  SetUniform1fv,
  SetUniform1iv,
  SetUniform2fv,
  SetUniform2iv,
  SetUniform3fv,
  SetUniform3iv,
  SetUniform4fv,
  SetUniform4iv,
} from "./set_uniform.ts";
/**
 * Inside the UseProgram a drawVAO must exist for it to be drawn.
 * This array sets the dependencies for the UseProgram.
 */
const dependsOn = [
  DrawVAO,
  SetUniform1iv,
  SetUniform2iv,
  SetUniform3iv,
  SetUniform4iv,
  SetUniform1fv,
  SetUniform2fv,
  SetUniform3fv,
  SetUniform4fv,
];

/**
 * UseProgram is a Web Component for a tag that represents the
 * equivalent operation of the `gl.useProgram()` function.
 */
export class UseProgram extends globalThis.HTMLElement {
  /**
   * ## `<use-program>` {#UseProgram}
   * 
   * This tag is the equivalent of the [WebGL `useProgram() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/useProgram).
   * 
   * It sets the specified WebGLProgram as part of the current rendering state.
   * 
   * The allowed children are:
   * 
   * - [`<active-texture>`](#ActiveTexture)
   *   _Equivalent to the [`gl.activeTexture()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/activeTexture)
   *   function_
   * - [`<draw-vao>`](#DrawVAO)
   *   _Equivalent to either the [`gl.drawElements()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements)
   *   or the [`gl.drawArrays()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays)
   *   functions (it knows which to use based on the Vertex Array Object that
   *   it references)_
   * 
   * The `<use-program>` tag is meant to be used within the
   * [`<draw-calls>`](#DrawCalls) list of actions.
   */
  static tag = "use-program";
  /**
   * A promise that resolves when all the needed dependencies in the
   * `dependsOn` list are available.  
   */
  private whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  /**
   * A string that references a program name.
   * 
   * This must be the name of a tag available in the `<webgl-programs>`
   * container.
   */
  get src(): string | null {
    return this.getAttribute("src");
  }

  /**
   * The class instance of the referenced program tag in `<webgl-programs>`
   * 
   * Defaults to `undefined` until it gets created in the `initialize()` method
   */
  program: CreateProgram | undefined = undefined;
  /**
   * This function starts the program. It is a reference for the
   * `gl.useProgram()` function, that is intended to be called without having
   * to pass the program id (it is set in the closure).
   * 
   * It calls any initialize functions set for it in the Shader Canvas context
   * (programs modules might register a start function through the
   * `ShaderCanvas.webglModule` API).
   */
  useProgram: () => void = nop;

  /**
   * A `<use-program>` tag can have multiple draw calls set as children.
   * This array stores the draw functions associated with each child tag that
   * the `<use-program>` might have.
   * 
   * These get called with the WebGLProgram set in the rendering state.
   */
  drawCalls: (() => void)[] = [];

  /**
   * The function to call when rendering, defaults to a no-op and is created
   * in `initialize()`.
   * 
   * It binds this tag referenced program and calls each function in the
   * `drawCalls` array.
   */
  drawProgram: (() => void) = nop;

  /**
   * Reads the "src" DOM attribute, gets the program from the `<webgl-programs>`
   * and calls an eventual start function that might have been defined through
   * the ShaderCanvas modules API. 
   */
  async initialize(
    gl: WebGL2RenderingContext,
    context: WebGLCanvasContext,
    renderers: Map<string, ProgramRenderer>,
  ) {
    await this.whenLoaded;

    const src = this.src;
    if (!src) {
      console.warn("<use-program>: no src attribute found");
      return;
    }
    this.program = context.programs.content.get(src);
    if (!this.program) {
      console.warn(`<use-program>: unable to find program named <${src}>`);
      return;
    }
    const program = this.program;
    const glProgramId = this.program.program;
    if (!glProgramId) {
      console.warn(`<use-program>: GL Program not set for program <${src}>`);
      return;
    }
    // If it has parts, then call the onUseProgramStart and onUseProgramEnd
    if (this.program.modules.length > 0) {
      const name = this.program?.name;

      // get the functions for each module
      const onStart = this.program.modules.map((module) =>
        context.modulesFunctions.get(module)?.onUseProgram
      ).filter((f) => f !== undefined) as ((
        ctx: WebGLCanvasContext,
        program: CreateProgram,
        programName: string,
      ) => void)[];
      // create the useProgram function that calls the `onStart` function
      // on each module present here.
      this.useProgram = () => {
        gl.useProgram(glProgramId);
        for (let i = 0; i < onStart.length; i++) {
          onStart[i](context, program, name);
        }
      };
    } else {
      this.useProgram = () => gl.useProgram(glProgramId);
    }

    // Create the draw calls array and start
    const renderFunction = renderers.get(src);
    if (renderFunction) {
      this.drawCalls.push(renderFunction);
    }

    // Get draw function for each child instance and put it in the
    // `drawCalls` array.
    for (const child of [...this.children]) {
      if (child instanceof DrawVAO) {
        child.initialize(gl, context);
        this.drawCalls.push(child.drawVao);
      } else if (child instanceof ActiveTexture) {
        await child.initialize(gl, context, this.program);
        this.drawCalls = this.drawCalls.concat(child.drawCalls);
      } else if (child instanceof SetUniform) {
        await child.initialize(gl, context, this.program);
        this.drawCalls = this.drawCalls.concat(child.drawCalls);
      } else {
        console.warn(
          `<use-program>: This tag "<${child.tagName.toLocaleLowerCase()}>" is not a valid child of use-program`,
        );
      }
    }
    // The drawProgram simply iterates through each function in the `drawCalls`
    // array.
    this.drawProgram = () => {
      this.useProgram();
      for (let i = 0; i < this.drawCalls.length; i++) {
        this.drawCalls[i]();
      }
    };
  }
}
