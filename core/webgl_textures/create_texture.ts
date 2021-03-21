// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { nop } from "../common/nop.ts";
import { TexImage2D } from "./tex_image_2d.ts";
import { TexParameterF, TexParameterI } from "../draw_calls/tex_parameter.ts";

/**
 * Like the other Web Components in Shader Canvas, this one ignores the
 * common life-cycle methods and construction logic.
 * 
 * This class is constructed and initialized by its "initialize()" function.
 * 
 * The "initialize()" uses the classes in this list to wait for them to be
 * registered with a custom tag name at the global customElements registry.
 *   
 * This list is declared at the file scope because it is also used at the
 * bottom of this file to register the tag names for them if they are not
 * registered.
 */
const dependsOn = [TexImage2D, TexParameterF, TexParameterI];

export class CreateTexture extends globalThis.HTMLElement {
  /**
   * ## `<{{texture-name}}>` {#CreateTexture}
   * 
   * You chose the tag name for your textures when declaring them.
   * This name is then used to reference this Texture in other Shader Canvas
   * containers and parts (like draw calls).
   * 
   * The allowed children of a Texture are:
   * 
   * - [`<tex-image-2d>`](#TexImage2D) _Sets the Image data for this texture_
   * - [`<tex-parameter-i>`](#TexParameterI) _Sets an int texture parameter_
   * - [`<tex-parameter-f>`](#TexParameterF) _Sets a float texture parameter_
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *   <webgl-canvas>
   *     <webgl-textures>
   *       <such-an-awesome-image>
   *         <tex-image-2d src="#texture"></tex-image-2d>
   *       </such-an-awesome-image>
   *    </textures>
   *   </webgl-canvas>
   *   <img id="texture" src="awesome-texture.png">
   * </shader-canvas>
   * ```
   * 
   * For a usable example check the
   * [2nd example - texture quad](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/2-textured-quad)
   * 
   * This custom named tag is meant to be used as a child of the
   * [`<webgl-textures>`](#WebGLTextures) container tag.
   */
  static tag = "{{user defined}}";

  /**
   * Promise that resolves when all dependencies have registered their 
   * tag in the customElements global Web Components registry.
   * 
   * This is used in the async initialize() function, to ensure that its
   * code only runs when all the tags it depends are available. 
   */
  private whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  /** The WebGL Texture id returned after `gl.createTexture()` is called */
  texture: WebGLTexture | null = null;
  /**
   * This function is a wrapper to the `gl.bindTexture()` function. It is useful
   * to allow a texture to be bound without having to keep track of its texture
   * id.
   * 
   * It is created in the `initialize()` function.
   * 
   * It defaults to a no-op.
   */
  bindTexture: (() => void) = nop;

  /**
   * Initializing a texture consists in calling the initialization function
   * for each child <tex-image-2d> instance.
   * 
   * This function creates the `bindTexture` function above, which allows
   * to set this texture id as the target for further WebGL actions
   */
  async initialize(gl: WebGL2RenderingContext) {
    // Only proceed when every needed tag is registered
    await this.whenLoaded;
    // Create the WebGL texture Id.
    this.texture = gl.createTexture();
    if (!this.texture) {
      console.error(
        `<${this.tagName.toLocaleLowerCase()}>: Unable to create texture`,
      );
      return;
    }
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    for (const child of [...this.children]) {
      if (child instanceof TexImage2D) {
        child.initialize(gl); // creates the load function
        await child.load(this.texture); // call it
        // Create the bind function
        this.bindTexture = () => gl.bindTexture(gl.TEXTURE_2D, this.texture);
      }
      if (child instanceof TexParameterI) {
        child.initialize(gl);
        child.texParameteri();
      }
      if (child instanceof TexParameterF) {
        child.initialize(gl);
        child.texParameterf();
      }
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}

[...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
