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

export class DrawCallsContainer extends CanMerge {
  drawFunctions: (() => void)[] = [];
  drawCalls: () => void = nop;
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
