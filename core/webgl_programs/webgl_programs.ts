import { ShaderCanvasContainer } from "../shader_canvas/shader_canvas_container.ts";
import { CreateProgram } from "./create_program.ts";
import { FragmentShader, VertexShader } from "./shaders.ts";
import { ShaderLocations } from "../common/locations.ts";
import type { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import type {
  InitializerFunction,
  ProgramRenderer,
} from "../common/program_class.ts";
import { NewModules } from "../new_modules/new_modules.ts";

const dependsOn = [VertexShader, FragmentShader, NewModules];

export class WebGLPrograms extends ShaderCanvasContainer<CreateProgram> {
  static tag = "webgl-programs";
  static setupFromChildren(parent: HTMLElement) {
    const result = ShaderCanvasContainer.copyChildrenFromTarget(
      parent,
      this.tag,
      "default-program",
      WebGLPrograms,
      (elem) =>
        elem.tagName === "VERTEX-SHADER" || elem.tagName === "FRAGMENT-SHADER",
    );

    if (result instanceof WebGLPrograms) {
      return result;
    } else {
      throw new Error("Unable to setup WebGLPrograms");
    }
  }
  whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );
  locations: ShaderLocations = { attributes: new Map() };

  async initialize({ gl, payloads }: WebGLCanvasContext) {
    await this.whenLoaded;

    this.createContentComponentsWith(CreateProgram);

    if (this.content.size === 0) {
      console.error("<webgl-programs>: No programs available to initialize");
      return;
    }

    const programs = [...this.content.values()];
    programs.forEach((p) => p.initialize(payloads));
    const attributes = this.locations.attributes;
    programs.forEach((program) => program.load(gl));
    programs.forEach((program) => program.compile(gl));
    programs.forEach((program) => program.createProgram(gl));
    programs.forEach((program) => program.bindLocations(gl, attributes));
    programs.forEach((program) => program.link(gl));
    programs.forEach((program) => program.statusCheck(gl));
    programs.forEach((program) => program.verifyLocations(gl, attributes));
    programs.forEach((program) => program.updateLocations(gl, attributes));
    programs.forEach((program) => program.updateUniformLocations(gl));
    console.debug("<webgl-programs> locations", [
      ...this.locations.attributes.entries(),
    ]);
  }

  async callInitializers(
    gl: WebGL2RenderingContext,
    ctx: WebGLCanvasContext,
    initializers: Map<string, InitializerFunction>,
  ): Promise<Map<string, ProgramRenderer>> {
    const result = new Map();
    for (const [programName, program] of this.content.entries()) {
      const f = initializers.get(programName);
      if (f && program && program.program) {
        gl.useProgram(program.program);
        const renderer = await f(gl, {
          uniformLocations: program.uniformLocations,
          ctx,
        });
        gl.useProgram(null);
        if (renderer) {
          result.set(programName, renderer);
        }
      } else {
        if (!program) {
          console.warn(
"<webgl-programs>: could not call `createProgram` function for \
            program ${programName}`",
          );
        }
      }
    }
    return result;
  }
}

[WebGLPrograms, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
