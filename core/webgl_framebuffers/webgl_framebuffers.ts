// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { ShaderCanvasContainer } from "../shader_canvas/shader_canvas_container.ts";
import type { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { CreateFramebuffer } from "./create_framebuffer.ts";
import {
  FramebufferRenderbuffer,
  FramebufferTexture2D,
  FramebufferTextureLayer,
} from "./attachments.ts";

/**
 * WebGL Framebuffers ignores the common Web Components creation methods. 
 * It is constructed and initialized by the "initialize()" function.
 * 
 * The "initialize()" uses the classes in this list to wait for them to be
 * registered with a custom tag name at the global customElements registry.
 *   
 * This list is declared at the file scope because it is also used at the
 * bottom of this file to register the tag names for them if they are not
 * registered.
 */
const dependsOn = [
  FramebufferRenderbuffer,
  FramebufferTexture2D,
  FramebufferTextureLayer,
];

/**
 * WebGLFramebuffers is a Web Component. It extends the ShaderCanvasContainer
 * because any immediate children tags get their names registered as
 * new Web Components automatically. These children act as containers for
 * functionality (WebGL Framebuffers in this case) that can then be referenced
 * by the tag name being used.
 * 
 * WebGLFramebuffers is a container where each immediate child is a
 * CreateFramebuffer instance.
 * 
 * This class has no constructor, it assumes the default constructor. The
 * logic starts at the `initialize()` function.
 */
export class WebGLFramebuffers
  extends ShaderCanvasContainer<CreateFramebuffer> {
  /**
   * ## `<webgl-framebuffers>` {#WebGLFramebuffers}
   * 
   * This tag is a container of a WebGL framebuffers. Each child defines a WebGL 
   * Framebuffer. You must set a unique name for each child tag, these children
   * can then have the valid content for a [framebuffer](#CreateFramebuffer).
   * 
   * The children unique tag names are used as reference in other containers
   * and in the [<draw-calls>](#DrawCalls) list of actions.
   * 
   * WebGL Framebuffers consist of a set of attachments and texture sources.
   * During initialization the framebuffers listed as children of this tag get 
   * created and attached.
   * 
   * The allowed children are:
   * 
   * - [`<{{framebuffer-name}}>`](#CreateFramebuffer)
   *   _WebGL Framebuffer (you decide the tag name)_
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *   <webgl-canvas>
   *    <webgl-framebuffers>
+   *    </webgl-framebuffers>
   *  </webgl-canvas>
   * </shader-canvas>
   * ```
   * For a usable example check the
   * [6th example - infinite grid](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/6-infinite-grid)
   * 
   * The `<webgl-framebuffers>` tag is meant to be used as a child of the
   * [`<webgl-canvas>`](#WebGLCanvas) tag.
   */
  static tag = "webgl-framebuffers";

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
   * Initializes the WebGL Framebuffers container.
   * 
   * This function starts by calling the common container creation logic, by
   * reading its child tag names and create them as unique Web Components with
   * a `CreateFramebuffer` instance.
   * 
   * After all programs have been created as Web Components, they get loaded,
   * compiled, linked and the variable locations updated.
   */
  async initialize({ gl, textures }: WebGLCanvasContext) {
    // Only proceed if every needed tag is registered
    await this.whenLoaded;

    // This is a function from the ShaderCanvasContainer class extension.
    // It runs through all of the child tags and registers them as a new unique
    // Web Component with the CreateProgram class.
    this.createContentComponentsWith(CreateFramebuffer);
    // Initialize all CreateFramebuffer children.
    for (const framebuffer of this.content.values()) {
      await framebuffer.initialize(gl, textures);
    }
  }
}

// Add the WebGLFramebuffers to the list of dependencies and go through all of them
// and register their tags in the Web Components customElements global registry.
// This is run at the module level, when this module is imported. The
// initialize() function waits for all these classes to be registered before
// doing anything.
[WebGLFramebuffers, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
