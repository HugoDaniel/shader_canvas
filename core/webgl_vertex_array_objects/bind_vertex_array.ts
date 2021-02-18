import { nop } from "../common/nop.ts";
import { WebGLVertexArrayObjects } from "./webgl_vertex_array_objects.ts";

export class BindVertexArray extends globalThis.HTMLElement {
  static tag = "bind-vertex-array";
  whenLoaded = Promise.all(
    [
      globalThis.customElements.whenDefined("webgl-vertex-array-objects"),
    ],
  );

  get src(): string {
    const result = this.getAttribute("src");
    if (!result) {
      console.error("No src set in <bind-vertex-array>");
    }
    return result || "";
  }
  bindVAO: (() => void) = nop;
  async initialize(
    gl: WebGL2RenderingContext,
    vaos: WebGLVertexArrayObjects,
  ) {
    await this.whenLoaded;
    this.bindVAO = vaos.bindFunctionFor(this.src);
  }
}
