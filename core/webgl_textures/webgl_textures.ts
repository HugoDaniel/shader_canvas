import { ShaderCanvasContainer } from "../shader_canvas/shader_canvas_container.ts";
import { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { VertexAttribPointer } from "../webgl_vertex_array_objects/vertex_attrib_pointer.ts";
import { CreateTexture } from "./create_texture.ts";

const dependsOn = [VertexAttribPointer];

export class WebGLTextures extends ShaderCanvasContainer<CreateTexture> {
  static tag = "webgl-textures";
  whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  async initialize({ gl }: WebGLCanvasContext) {
    await this.whenLoaded;
    this.createContentComponentsWith(CreateTexture);

    if (this.content.size === 0) {
      console.error("<webgl-textures>: No textures available to initialize");
      return;
    }
    return Promise.all([...this.content.values()].map((t) => t.initialize(gl)));
  }
}

[WebGLTextures, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
