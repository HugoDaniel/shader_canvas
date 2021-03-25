// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { nop } from "../common/nop.ts";
import {
  FramebufferRenderbuffer,
  FramebufferTexture2D,
  FramebufferTextureLayer,
} from "./attachments.ts";
import { WebGLTextures } from "../webgl_textures/webgl_textures.ts";
import { glEnumToString, glError } from "../common/errors.ts";

/**
 * The CreateFrameBuffer class is intended to be used to create custom tags
 * for the children of the WebGLFramebuffers container.
 * 
 * Every WebGL framebuffer in use by the Shader Canvas is an instance of
 * this class.
 * After initialization this class provides a `bindFramebuffer` function that
 * performs the equivalent `gl.bindFramebuffer()` on its framebuffer instance. 
 */
export class CreateFramebuffer extends globalThis.HTMLElement {
  /**
   * ## `<{{framebuffer-name}}>` {#CreateFramebuffer}
   * 
   * You chose the tag name for your framebuffers when declaring them. The tag
   * name is used to represent the name for the framebuffer. This name is then
   * used to reference this framebuffer in other Shader Canvas containers and
   * parts.
   * 
   * The allowed children of a framebuffer are:
   * 
   * - [`<framebuffer-texture-2d>`](#FramebufferTexture2D) _A 2D WebGL Framebuffer_
   * - [`<framebuffer-texture-layer>`](#FramebufferTextureLayer) _A layer of a WebGL Texture_
   * - [`<framebuffer-renderbuffer>`](#FramebufferRenderbuffer) _A Renderbuffer WebGL Framebuffer_
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *  <webgl-canvas>
   *    <webgl-framebuffers>
   *      <!--
   *        Create your WebGL framebuffers here by specifying a
   *        tag name that uniquely identifies them.
   *      -->
   *    </webgl-framebuffers>
   *  </webgl-canvas>
   * </shader-canvas>
   * ```
   * 
   * For a usable example check the
   * [6th example - infinite grid](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/6-infinite-grid)
   * 
   * This custom named tag is meant to be used as a child of the
   * [`<webgl-framebuffers>`](#WebGLFramebuffers) container tag.
   */
  static tag = "{{user defined}}";
  // ^ This static "tag" is not used, it is here to trigger the documentation

  /**
   * The WebGL id for this framebuffer. Created during initialization.
   */
  framebuffer: WebGLFramebuffer | null = null;
  /**
   * This function is a wrapper for the `gl.bindFramebuffer()` call.
   * It takes no arguments because it always binds this current
   * framebuffer instance.
   * 
   * It is set during initialization and defaults to a no-op before it.
   */
  bindFramebuffer: (() => number) = () => {
    nop();
    // Return the "-1" target, this does not match any framebuffer target
    return -1;
  };

  gl: WebGL2RenderingContext | undefined;

  get target(): "FRAMEBUFFER" | "DRAW_FRAMEBUFFER" | "READ_FRAMEBUFFER" {
    switch (this.getAttribute("target")) {
      case "DRAW_FRAMEBUFFER":
        return "DRAW_FRAMEBUFFER";
      case "READ_FRAMEBUFFER":
        return "READ_FRAMEBUFFER";
      default:
        return "FRAMEBUFFER";
    }
  }

  /**
   * Initializing a framebuffer consists in calling the initialization function
   * for each child target instance.
   * 
   * This function creates the `bindFramebuffer` function above, that is used
   * to set this buffer as the target for further WebGL actions.
   */
  async initialize(gl: WebGL2RenderingContext, textures: WebGLTextures) {
    // Create the WebGL framebuffer Id.
    this.framebuffer = gl.createFramebuffer();
    // Early return if it is not possible to create a buffer id.
    if (!this.framebuffer) {
      console.error(
        `<${this.tagName.toLocaleLowerCase()}>: Unable to create framebuffer`,
      );
      return;
    }
    this.gl = gl;
    const target = gl[this.target];
    this.bindFramebuffer = () => {
      gl.bindFramebuffer(target, this.framebuffer);
      return target;
    };

    this.bindFramebuffer();
    for (const child of Array.from(this.children)) {
      if (
        child instanceof FramebufferTexture2D ||
        child instanceof FramebufferTextureLayer
      ) {
        child.initialize(gl, textures); // creates the load function
      }
      if (child instanceof FramebufferRenderbuffer) {
        await child.initialize(gl);
      }
    }
    // Check if attachments work
    if (gl.checkFramebufferStatus(target) !== gl.FRAMEBUFFER_COMPLETE) {
      const status = gl.checkFramebufferStatus(target);
      console.warn(
        `Framebuffer <${this.nodeName}> attachments don't work together: ${
          glEnumToString(gl, status)
        }`,
      );
      glError(gl);
    }

    gl.bindFramebuffer(target, null);
  }
}
