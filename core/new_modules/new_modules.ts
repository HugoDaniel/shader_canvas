import { ShaderCanvasContainer } from "../shader_canvas/shader_canvas_container.ts";
import { CreatePart } from "./create_part.ts";
import { Payload } from "./payload.ts";
import { WebGLProgramPart } from "./webgl_program_part.ts";

const dependsOn = [WebGLProgramPart];
export class NewModules extends ShaderCanvasContainer<CreatePart> {
  static tag = "new-modules";
  whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  // These will be used later by the containers Create*, when they call the
  // CreatePart.initialize() function
  payloads: Payload[] = [];

  async initialize(initializers: Map<string, (p: Payload) => void>) {
    await this.whenLoaded;
    this.createContentComponentsWith(CreatePart);
    // TODO: Fetch the import parts, and place them as children
    for (const child of [...this.children]) {
      if (child instanceof CreatePart) {
        this.payloads.push(child.initializePart(initializers));
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
