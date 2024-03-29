// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import type {
  InitializeBufferFunction,
  InitializerFunction,
  ModulesFunctions,
} from "../common/program_class.ts";
import { Payload } from "../new_modules/payload.ts";

export interface WebGLContextFlags {
  failIfMajorPerformanceCaveat: boolean;
  powerPreference: "default" | "high-performance" | "low-power";
  desynchronized: boolean;
}
export interface ShaderCanvasInitializer {
  width: number;
  height: number;
  programInitializers: Map<string, InitializerFunction>;
  bufferInitializers: InitializeBufferFunction[];
  payloads: Payload[];
  modulesFunctions: Map<string, ModulesFunctions>;
  flags:
    | WebGLContextFlags
    | undefined;
}
