// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { nop } from "../common/nop.ts";
import { WebGLVertexArrayObjects } from "./webgl_vertex_array_objects.ts";

const dependsOn = [WebGLVertexArrayObjects];

export class BindVertexArray extends globalThis.HTMLElement {
  static tag = "bind-vertex-array";
  private whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
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

[BindVertexArray, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
