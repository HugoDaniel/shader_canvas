import { ShaderCanvasContainer } from "../shader_canvas/shader_canvas_container.ts";
import { CreateBuffer } from "./create_buffer.ts";
import { BufferData } from "./buffer_data.ts";
import { nop } from "../common/nop.ts";
import type { WebGLCanvasContext } from "../webgl_canvas/context.ts";

const dependsOn = [BufferData];
export class WebGLBuffers extends ShaderCanvasContainer<CreateBuffer> {
  static tag = "webgl-buffers";
  whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  bindFunctionFor(bufferName: string) {
    const buffer = this.content.get(bufferName);
    if (!buffer) {
      console.error(
        `<webgl-buffers>: Could not get bind function for ${bufferName}`,
      );
      return () => {
        nop();
        return 0;
      };
    }
    return buffer.bindBuffer;
  }

  lengthFor(bufferName: string) {
    const buffer = this.content.get(bufferName);
    if (!buffer || buffer.data === null) {
      console.error(
        `<webgl-buffers>: Could not get length for ${bufferName}`,
      );
      return 0;
    }
    return buffer.length;
  }

  async initialize({ gl }: WebGLCanvasContext) {
    await this.whenLoaded;
    this.createContentComponentsWith(CreateBuffer);
    for (const buffer of this.content.values()) {
      await buffer.initialize(gl);
    }
  }
}

[WebGLBuffers, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
