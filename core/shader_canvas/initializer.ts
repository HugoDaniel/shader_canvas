import type {
  InitializerFunction,
  ModulesFunctions,
} from "../common/program_class.ts";
import { Payload } from "../new_modules/payload.ts";

export interface ShaderCanvasInitializer {
  width: number;
  height: number;
  programInitializers: Map<string, InitializerFunction>;
  payloads: Payload[];
  modulesFunctions: Map<string, ModulesFunctions>;
}
