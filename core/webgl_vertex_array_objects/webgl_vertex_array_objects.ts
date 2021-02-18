import { ShaderCanvasContainer } from "../shader_canvas/shader_canvas_container.ts";
import { CreateVertexArray } from "./create_vertex_array.ts";
import { VertexAttribPointer } from "./vertex_attrib_pointer.ts";
import { BindBuffer } from "./bind_buffer.ts";
import { nop } from "../common/nop.ts";
import { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { WebGLBuffers } from "../webgl_buffers/webgl_buffers.ts";

const dependsOn = [VertexAttribPointer, BindBuffer, WebGLBuffers];
export class WebGLVertexArrayObjects
  extends ShaderCanvasContainer<CreateVertexArray> {
  static tag = "webgl-vertex-array-objects";
  whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );
  bindFunctionFor(vaoName: string) {
    const vao = this.content.get(vaoName);
    if (!vao) {
      console.error(
        `<webgl-vertex-array-objects>: Could not get bind function for ${vaoName}`,
      );
      return nop;
    }
    return vao.bindVAO;
  }

  async initialize({
    gl,
    buffers,
    programs: { locations },
  }: WebGLCanvasContext) {
    await this.whenLoaded;
    this.createContentComponentsWith(CreateVertexArray);

    if (!buffers) {
      console.warn(
        "<webgl-vertex-array-objects>: unable to initialize without buffers",
      );
      return;
    }
    if (!locations) {
      console.warn(
        "<webgl-vertex-array-objects>: unable to initialize without locations",
      );
      return;
    }
    for (const vao of this.content.values()) {
      await vao.initialize(gl, buffers, locations);
    }
  }
}

[WebGLVertexArrayObjects, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(
      component.tag,
      component,
    );
  }
});
