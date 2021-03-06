// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { Payload } from "../new_modules/payload.ts";
import type { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { CreateProgram } from "../webgl_programs/create_program.ts";
export interface ModulesFunctions {
  onFrame?: (ctx: WebGLCanvasContext) => void;
  onUseProgram?: (
    ctx: WebGLCanvasContext,
    program: CreateProgram,
    programName: string,
  ) => void;
  initializer?: InitializerFunction;
}
export interface ShaderPart {
  useWith: (name: string) => void;
  createPart: (payload: Payload) => ModulesFunctions | void;
}
export type ProgramRenderer = () => void;
export type InitializerFunction = (
  gl: WebGL2RenderingContext,
  options: {
    uniformLocations: Map<string, WebGLUniformLocation>;
    ctx: WebGLCanvasContext;
    program: CreateProgram;
    programName: string;
  },
) => ProgramRenderer | void;

export interface ShaderProgram {
  initializer: InitializerFunction;
  useWith: (name: string) => void;
}
