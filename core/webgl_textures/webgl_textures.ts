// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { ShaderCanvasContainer } from "../shader_canvas/shader_canvas_container.ts";
import { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { CreateTexture } from "./create_texture.ts";
import { TexImage2D } from "./tex_image_2d.ts";

/**
 * Like the other WebGL* containers, the WebGLTextures ignores the
 * Web Components creation methods, and leaves them to their defaults.
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
const dependsOn = [TexImage2D];

/**
 * WebGLTextures is a Web Component. It extends the
 * ShaderCanvasContainer because any immediate children tags get their names
 * registered as new Web Components automatically. These children act as
 * containers for functionality (WebGL Textures in this case) that
 * can then be referenced by their unique tag name being used.
 * 
 * WebGLTextures is a container where each immediate child is a
 * CreateTexture instance.
 * 
 * This class has no constructor, it assumes the default constructor. The
 * logic starts at the `initialize()` function.
 */
export class WebGLTextures extends ShaderCanvasContainer<CreateTexture> {
  /**
   * ## `<webgl-textures>` {#WebGLTextures}
   * 
   * This tag is a container of a WebGL Textures. Each child defines a WebGL
   * Texture. You must set a unique name for each child tag, these children can
   * then have the valid content for a [texture](#CreateTexture).
   * 
   * The children unique tag names are used as reference in other containers
   * and in the [<draw-calls>](#DrawCalls) list of actions.
   *
   * Textures can hold image data, and are sent to the Sampler* variables of
   * the GLSL fragment shader programs.
   * 
   * During initialization the textures listed as children of this tag get 
   * loaded and their runtime functions created to be used by the draw calls
   * either at its initialization or during the render loop.
   * 
   * The allowed children are:
   * 
   * - [`<{{texture-name}}>`](#CreateTexture)
   *   _WebGL Texture (you decide the tag name)_
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *   <webgl-canvas>
   *     <webgl-textures>
   *       <such-an-awesome-image>
   *          <!--
   *            Texture content tags
   *          -->
   *       </such-an-awesome-image>
   *    </textures>
   *   </webgl-canvas>
   * </shader-canvas>
   * ```
   * For a usable example check the
   * [2nd example - texture quad](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/2-textured-quad)
   * 
   * The `<webgl-textures>` tag is meant to be used as a child of
   * the [`<webgl-canvas>`](#WebGLCanvas) tag.
   */
  static tag = "webgl-textures";
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
  /**
  * Initializes the WebGL Textures container.
  * 
  * This function starts by calling the container creation logic: it reads
  * its child tag names and creates them as unique Web Components with
  * a `CreateTexture` instance.
  * 
  * After all textures have been created as Web Components,
  * they get initialized in a promise array, this initialization can wait
  * for them to be fully loaded if the textures are images..
  */
  async initialize({ gl }: WebGLCanvasContext) {
    // Only proceed when every needed tag is registered
    await this.whenLoaded;
    // This is a function from the ShaderCanvasContainer class extension.
    // It runs through all of the child tags and registers them as a new unique
    // Web Component with the CreateTexture class.
    this.createContentComponentsWith(CreateTexture);

    if (this.content.size === 0) {
      console.warn("<webgl-textures>: No textures available to initialize");
      return;
    }
    return Promise.all([...this.content.values()].map((t) => t.initialize(gl)));
  }
}

// Add the WebGLTextures to the list of dependencies and go through
// all of them and register their tags in the Web Components customElements
// global registry.
// This is run at the module level, when this module is imported. The
// initialize() function waits for all these classes to be registered before
// doing anything.
[WebGLTextures, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
