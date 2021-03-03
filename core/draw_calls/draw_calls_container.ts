// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { BlendFunc } from "./blend_func.ts";
import { ClearColor } from "./clear_color.ts";
import { ClearDepth } from "./clear_depth.ts";
import { ClearStencil } from "./clear_stencil.ts";
import { ClearFlags } from "./clear_flags.ts";
import { DepthFunc } from "./depth_func.ts";
import { ViewportTransformation } from "./viewport.ts";
import { UseProgram } from "./use_program.ts";
import { DrawVAO } from "./draw_vao.ts";
import { nop } from "../common/nop.ts";
import { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { ProgramRenderer } from "../common/program_class.ts";
import { CullFace } from "./cull_face.ts";
import { CanMerge } from "../new_modules/can_merge.ts";

/**
 * The draw calls container is responsible to create the render function
 * for that it needs to know what kind of children it might have and how to
 * work with them. These are listed here and are intended to be used like in
 * the other Web Components of Shader Canvas.
 */
export const dependencies = [
  ClearColor,
  BlendFunc,
  ClearDepth,
  CullFace,
  ClearStencil,
  ClearFlags,
  DepthFunc,
  ViewportTransformation,
  UseProgram,
  DrawVAO,
];

/**
 * Creates the render function.
 * 
 * Runs through the child nodes, check their instance, creates the appropriate 
 * closure function and places it in an array that gets traversed when
 * rendering.
 * 
 * This class is intended to be extended from by the <draw-calls> component.
 * It is a Web Component, and can be merged if defined partially by a module.
 */
export class DrawCallsContainer extends CanMerge {
  /** The array of drawing functions to traverse at runtime */
  drawFunctions: (() => void)[] = [];
  /**
   * The function to call when rendering. This function defaults to a no-op and
   * gets created in the `buildDrawFunction()`.
   * 
   * It is a simple loop through all the closures listed in `drawFunctions`.
   **/
  drawCalls: () => void = nop;
  /**
   * Reads the DOM and for every child node it initializes it and creates 
   * its corresponding drawing call to be put in the `drawFunctions` array of
   * functions.
   * 
   * In creates the `drawCalls` function that calls all the functions in the
   * `drawFunctions` array.
   */
  async buildDrawFunction(
    gl: WebGL2RenderingContext,
    context: WebGLCanvasContext,
    renderers: Map<string, ProgramRenderer>,
  ) {
    // Get children and create a function of draw commands to be called
    for (const child of [...this.children]) {
      if (child instanceof ClearColor) {
        child.initialize(gl);
        this.drawFunctions.push(child.clearColor);
      } else if (child instanceof BlendFunc) {
        child.initialize(gl);
        this.drawFunctions.push(child.blendFunc);
      } else if (child instanceof ClearDepth) {
        child.initialize(gl);
        this.drawFunctions.push(child.clearDepth);
      } else if (child instanceof ClearStencil) {
        child.initialize(gl);
        this.drawFunctions.push(child.clearStencil);
      } else if (child instanceof ClearFlags) {
        child.initialize(gl);
        this.drawFunctions.push(child.clearFlags);
      } else if (child instanceof CullFace) {
        child.initialize(gl);
        this.drawFunctions.push(child.cullFace);
      } else if (child instanceof DepthFunc) {
        child.initialize(gl);
        this.drawFunctions.push(child.depthFunc);
      } else if (child instanceof ViewportTransformation) {
        child.initialize(gl);
        this.drawFunctions.push(child.viewport);
      } else if (child instanceof UseProgram) {
        // Pass the renderer
        await child.initialize(gl, context, renderers);
        this.drawFunctions.push(child.drawProgram);
      }
    }
    // Create draw function
    this.drawCalls = () => {
      for (let i = 0; i < this.drawFunctions.length; i++) {
        this.drawFunctions[i]();
      }
    };
    return this.drawCalls;
  }
}
