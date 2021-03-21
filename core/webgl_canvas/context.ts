// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { WebGLPrograms } from "../webgl_programs/webgl_programs.ts";
import { WebGLBuffers } from "../webgl_buffers/webgl_buffers.ts";
import { WebGLVertexArrayObjects } from "../webgl_vertex_array_objects/webgl_vertex_array_objects.ts";
import { WebGLTextures } from "../webgl_textures/webgl_textures.ts";
import { WebGLFramebuffers } from "../webgl_framebuffers/webgl_framebuffers.ts";
import { WebGLCanvasRuntime } from "./runtime.ts";
import { Payload } from "../new_modules/payload.ts";
import { ModulesFunctions } from "../common/program_class.ts";

export interface WebGLCanvasContext {
  gl: WebGL2RenderingContext;
  programs: WebGLPrograms;
  buffers: WebGLBuffers;
  framebuffers: WebGLFramebuffers;
  vaos: WebGLVertexArrayObjects;
  textures: WebGLTextures;
  runtime: WebGLCanvasRuntime;
  payloads: Payload[];
  modulesFunctions: Map<string, ModulesFunctions>;
}
