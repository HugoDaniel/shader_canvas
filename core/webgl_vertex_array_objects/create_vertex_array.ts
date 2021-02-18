import { ShaderLocations } from "../common/locations.ts";
import { nop } from "../common/nop.ts";
import { WebGLBuffers } from "../webgl_buffers/webgl_buffers.ts";
import { BindBuffer } from "./bind_buffer.ts";
import { VertexAttribPointer } from "./vertex_attrib_pointer.ts";

export class CreateVertexArray extends globalThis.HTMLElement {
  hasElementArrayBuffer = false;
  vao: WebGLVertexArrayObject | null = null;
  vars: string[] = [];
  location0Attribute: VertexAttribPointer | null = null;
  location0Count = 0;

  whenLoaded = Promise.all(
    [
      globalThis.customElements.whenDefined("vertex-attrib-pointer"),
      globalThis.customElements.whenDefined("bind-buffer"),
      globalThis.customElements.whenDefined("webgl-buffers"),
    ],
  );
  bindVAO: () => void = nop;
  async initialize(
    gl: WebGL2RenderingContext,
    buffers: WebGLBuffers,
    locations: ShaderLocations,
  ) {
    await this.whenLoaded;
    this.vao = gl.createVertexArray();
    if (!this.vao) {
      console.error(
        `<${this.tagName.toLocaleLowerCase()}>: Unable to create VAO`,
      );
      return;
    }
    gl.bindVertexArray(this.vao);
    for (const child of [...this.children]) {
      if (child instanceof BindBuffer) {
        await child.initialize(gl, buffers, locations);
        this.vars.concat(this.vars, child.vars);
        this.hasElementArrayBuffer = this.hasElementArrayBuffer ||
          child.target === gl.ELEMENT_ARRAY_BUFFER;
        // store the vertex attrib pointer for the var at location = 0
        if (child.location0Attribute !== null) {
          this.location0Attribute = child.location0Attribute;
          this.location0Count = child.location0Count;
        }
      }
    }
    // This must be called *after* all buffers are initialized
    gl.bindVertexArray(null);
    const vao = this.vao;
    // Create the bind function
    this.bindVAO = () => gl.bindVertexArray(vao);
  }
}
