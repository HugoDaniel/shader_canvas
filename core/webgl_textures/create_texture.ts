import { nop } from "../common/nop.ts";
import { TexImage2D } from "./tex_image_2d.ts";

const dependsOn = [TexImage2D];

export class CreateTexture extends globalThis.HTMLElement {
  whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  texture: WebGLTexture | null = null;
  bindTexture: (() => void) = nop;

  async initialize(gl: WebGL2RenderingContext) {
    await this.whenLoaded;
    this.texture = gl.createTexture();
    if (!this.texture) {
      console.error(
        `<${this.tagName.toLocaleLowerCase()}>: Unable to create texture`,
      );
      return;
    }
    for (const child of [...this.children]) {
      if (child instanceof TexImage2D) {
        child.initialize(gl); // creates the load function
        await child.load(this.texture); // call it async
        // Create the bind function
        this.bindTexture = () => gl.bindTexture(gl.TEXTURE_2D, this.texture);
      }
    }
  }
}

[...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
