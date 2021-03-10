// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import type { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import type { ProgramRenderer } from "../common/program_class.ts";
import { dependencies, DrawCallsContainer } from "./draw_calls_container.ts";
import { DrawLoop } from "./draw_loop.ts";

/**
 * The list of dependencies for DrawCalls is set externally in the file that
 * defines the container class.
 * 
 * The intended use is the same as in the other Shader Canvas Web Components.
 */
const dependsOn = [DrawLoop, ...dependencies];

/**
 * The DrawCalls class is a Web Component that represents the tag <draw-calls>.
 * 
 * It builds the draw function to render (done in the DrawCallsContainer class
 * that it extends) and looks for a <draw-loop> element to see if it needs to
 * start a render loop (might not be needed if the purpose is to draw a 
 * single image/frame).
 */
export class DrawCalls extends DrawCallsContainer {
  /**
   * ## `<draw-calls>` {#DrawCalls}
   * 
   * This tag is a container of a WebGL draw commands. Each child defines a
   * WebGL draw call. It is intended to hold an ordered list of tags that is run
   * sequentially when rendering a frame.
   * 
   * Some of the child tags make use of the WebGL elements defined in other
   * containers, like programs, textures, buffers and vertex array objects.
   * 
   * A drawing loop can be defined by creating [`<draw-loop>`](#DrawLoop)
   * child in this tag.
   * 
   * 
   * The allowed children are:
   * 
   * - [`<active-texture>`](#ActiveTexture)
   *   _Equivalent to the [`gl.activeTexture()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/activeTexture)
   *   function_
   * - [`<blend-func>`](#BlendFunc)
   *   _Equivalent to the [`gl.blendFunc()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc)
   *   function_
   * - [`<depth-func>`](#DepthFunc)
   *   _Equivalent to the [`gl.depthFunc()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc)
   *   function_
   * - [`<cull-face>`](#CullFace)
   *   _Equivalent to the [`gl.cullFace()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace)
   *   function_
   * - [`<clear-color>`](#ClearColor)
   *   _Equivalent to the [`gl.clearColor()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearColor)
   *   function_
   * - [`<clear-depth>`](#ClearDepth)
   *   _Equivalent to the [`gl.clearDepth()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearDepth)
   *   function_
   * - [`<clear-stencil>`](#ClearStencil)
   *   _Equivalent to the [`gl.clearStencil()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearStencil)
   *   function_
   * - [`<clear-flags>`](#ClearFlags)
   *   _Equivalent to the [`gl.clear()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clear)
   *   function_
   * - [`<tex-parameter-i>`](#TexParameterI)
   *   _Equivalent to the [`gl.texParameteri()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter)
   *   function_
   * - [`<tex-parameter-f>`](#TexParameterF)
   *   _Equivalent to the [`gl.texParameterf()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter)
   *   function_
   * - [`<use-program>`](#UseProgram)
   *   _Equivalent to the [`gl.useProgram()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/useProgram)
   *   function_
   * - [`<viewport-transform>`](#ViewportTransformation)
   *   _Equivalent to the [`gl.viewport()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/viewport)
   *   function_
   * - [`<draw-loop>`](#DrawLoop)
   *   _Lists the actions to perform inside a [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)_
   * - [`<draw-vao>`](#DrawVAO)
   *   _Equivalent to either the [`gl.drawElements()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements)
   *   or the [`gl.drawArrays()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays)
   *   functions (it knows which to use based on the Vertex Array Object that
   *   it references)_
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *   <webgl-canvas>
   *     <draw-calls>
   *       <viewport-transform x="0" y="0"></viewport-transform>
   *       <clear-color red="0" green="0" blue="0" alpha="1"></clear-color>
   *       <clear-flags mask="COLOR_BUFFER_BIT"></clear-flags>
   *       <use-program src="farbrausch">
   *         <active-texture var="acid" src="#lsdImage"></active-texture>
   *         <draw-vao src="weird-meshes"></draw-vao>
   *       </use-program>
   *     </draw-calls>
   *   </webgl-canvas>
   * </shader-canvas>
   * ```
   * 
   * For a usable example check the
   * [3rd example - animation](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/3-animation)
   * 
   * The `<draw-calls>` tag is meant to be used as a child of the
   * [`<webgl-canvas>`](#WebGLCanvas) tag.
   */
  static tag = "draw-calls";

  /**
   * A promise that resolves when all the needed dependencies in the
   * `dependsOn` list are available.  
   */
  private whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  /**
   * The draw calls initialization differs from typical containers because
   * it looks for specified children instances in order to be able to create
   * the render function. The DrawCalls class is an ordered list of tags
   * that get executed sequentially to produce the final frame.
   */
  async initialize(
    gl: WebGL2RenderingContext,
    context: WebGLCanvasContext,
    renderers: Map<string, ProgramRenderer>,
    updaters: (() => void)[],
  ) {
    // Only proceed when all dependencies have been created
    await this.whenLoaded;
    // Create the draw function (this function is from the DrawCallsContainer)
    await this.buildDrawFunction(gl, context, renderers, updaters);
    // Finally, check if there is a loop child, create the loop and start it.
    const drawLoopElem = this.querySelector(DrawLoop.tag);
    if (drawLoopElem && drawLoopElem instanceof DrawLoop) {
      await drawLoopElem.initialize(gl, context, renderers, updaters);
      drawLoopElem.start();
    }
  }
}

// Define the tags that this class depends on.
[DrawCalls, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
