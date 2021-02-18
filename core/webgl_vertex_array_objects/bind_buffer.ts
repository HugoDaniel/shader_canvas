import { ShaderLocations } from "../common/locations.ts";
import { nop } from "../common/nop.ts";
import { WebGLBuffers } from "../webgl_buffers/webgl_buffers.ts";
import { VertexAttribPointer } from "./vertex_attrib_pointer.ts";

export class BindBuffer extends globalThis.HTMLElement {
  static tag = "bind-buffer";

  get src(): string {
    const result = this.getAttribute("src");
    if (!result) {
      console.error("No src set in <bind-buffer>");
    }
    return result || "";
  }
  whenLoaded = Promise.all(
    [
      globalThis.customElements.whenDefined("vertex-attrib-pointer"),
      globalThis.customElements.whenDefined("webgl-buffers"),
      globalThis.customElements.whenDefined("webgl-programs"),
    ],
  );

  vars: string[] = [];
  target = 0; // WebGL buffer target enum
  location0Attribute: VertexAttribPointer | null = null;
  location0Count = 0;

  bindBuffer: (() => number) = () => {
    nop();
    return 0;
  };
  async initialize(
    gl: WebGL2RenderingContext,
    buffers: WebGLBuffers,
    locations: ShaderLocations,
  ) {
    await this.whenLoaded;
    // get the bind function for the buffer with this src name from buffers
    this.bindBuffer = buffers.bindFunctionFor(this.src);
    this.target = this.bindBuffer();
    for (const child of [...this.children]) {
      if (child instanceof VertexAttribPointer) {
        child.initialize(gl, locations);
        this.vars.push(child.variable);
        // Check if this buffer is for variable 0 (the one to be called in
        // drawArrays/drawElements):
        const varLocation = locations.attributes.get(child.variable);
        if (varLocation === 0) {
          this.location0Attribute = child;
          this.location0Count = buffers.lengthFor(this.src) / child.size;
        }
      }
    }
    gl.bindBuffer(this.target, null);
  }
}
