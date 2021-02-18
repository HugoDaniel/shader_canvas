import { Payload } from "../new_modules/payload.ts";
import type { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { CreateProgram } from "../webgl_programs/create_program.ts";
export interface PartsFunctions {
  onFrame?: (ctx: WebGLCanvasContext) => void;
  onUseProgram?: (
    ctx: WebGLCanvasContext,
    program: CreateProgram,
    programName: string,
  ) => void;
}
export interface ShaderPart {
  useWith: (name: string) => void;
  createPart: (payload: Payload) => PartsFunctions | void;
}
export type ProgramRenderer = () => void;
export type InitializerFunction = (
  gl: WebGL2RenderingContext,
  options: {
    uniformLocations: Map<string, WebGLUniformLocation>;
    ctx: WebGLCanvasContext;
  },
) => ProgramRenderer | void;

export interface ShaderProgram {
  initializer: InitializerFunction;
  useWith: (name: string) => void;
}
