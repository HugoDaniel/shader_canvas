import { ShaderCanvasContainer } from "../shader_canvas/shader_canvas_container.ts";
import { CreateModule } from "./create_module.ts";
import { Payload } from "./payload.ts";
import { WebGLProgramPart } from "./webgl_program_part.ts";

const dependsOn = [WebGLProgramPart];
export class NewModules extends ShaderCanvasContainer<CreateModule> {
  static tag = "new-modules";
  whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  // These will be used later by the containers Create*, when they call the
  // CreateModule.initialize() function
  payloads: Payload[] = [];

  async initialize(initializers: Map<string, (p: Payload) => void>) {
    await this.whenLoaded;
    this.createContentComponentsWith(CreateModule);
    // TODO: Fetch the import modules, and place them as children
    for (const child of [...this.children]) {
      if (child instanceof CreateModule) {
        this.payloads.push(child.initializeModule(initializers));
      }
    }
    return this.payloads;
  }
}

[NewModules, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
