// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { ShaderLocations } from "../common/locations.ts";
import { nop } from "../common/nop.ts";
import { WebGLBuffers } from "../webgl_buffers/webgl_buffers.ts";
import { VertexAttribPointer } from "./vertex_attrib_pointer.ts";

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
const dependsOn = [VertexAttribPointer, WebGLBuffers];

/**
 * BindBuffer is a WebComponent.
 * 
 * It is the equivalent of the WebGL `bindBuffer()` call.
 * It binds a buffer specified in the WebGLBuffers to its target.
 */
export class BindBuffer extends globalThis.HTMLElement {
  /**
   * ## `<bind-buffer>` {#BindBuffer}
   * 
   * This tag is the equivalent of the [WebGL `bindBuffer() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer).
   * 
   * Its child tags will be bound with the buffer specified by this tag
   * "src" attribute.
   * 
   * The `<bind-buffer>` tag can be used in a `<vertex-array-object>` to
   * associate variables and their contents to areas of a buffer defined in
   * the `<webgl-buffers>` container.
   *  
   * The allowed children are:
   * 
   * - [`<vertex-attrib-pointer>`](#VertexAttribPointer) _WebGL _
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *  <webgl-canvas>
   *    <webgl-vertex-array-objects>
   *      <some-cool-vao>
   *        <bind-buffer src="big-raw-data">
   *          <!-- vertex-attrib-pointers here -->
   *        </bind-buffer>
   *      </some-cool-vao>
   *    <webgl-vertex-array-objects>
   *    <webgl-buffers>
   *      <!-- src references these buffer tag names -->
   *      <big-raw-data>
   *        <buffer-data src="data.json"></buffer-data>
   *      </big-raw-data>
   *    </webgl-buffers>
   *  </webgl-canvas>
   * </shader-canvas>
   * ```
   * 
   * For a usable example check the
   * [3rd example - animation](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/3-animation)
   * 
   * The `<bind-buffer>` tag is meant to be used as a child of the
   * [`<{{vao-name}}>`](#CreateVertexArray) custom named tag.
   */
  static tag = "bind-buffer";

  /**
   * The bind buffer `src` attribute is a string that references a buffer.
   * 
   * This must be the name of a tag available in the `<webgl-buffers>`
   * container.
   */
  get src(): string {
    const result = this.getAttribute("src");
    if (!result) {
      console.error("No src set in <bind-buffer>");
    }
    return result || "";
  }

  /**
   * Promise that resolves when all dependencies have registered their 
   * tag in the customElements global Web Components registry.
   * 
   * This is used in the async initialize() function, to ensure that the
   * code only runs when all the tags it depends are available. 
   */
  private whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  /**
   * This array keeps track of the variables associated with this buffer.
   **/
  vars: string[] = [];
  /**
   * The WebGL buffer target enum. 0 means no target.
   */
  target = 0;
  /**
   * The VertexAttribPointer for the vertex attribute at location 0.
   * 
   * It is useful to know if this `<bind-buffer>` is being used to set the data
   * to be sent to the vertex attribute at location 0. In Shader Canvas the
   * vertex attribute at location 0 always refers to the vertex data.
   */
  location0Attribute: VertexAttribPointer | null = null;
  /**
   * Knowing where the vertex data is being set allows for some automatic
   * calculations to be done at render time, such as the number of elements
   * to draw.
   * 
   * This variable holds the number of items being pointed at the location 0.
   */
  location0Count = 0;

  /**
   * The bindBuffer function is set in the `initialize()` method.
   * It defaults to a no-op, and after initialization becomes a reference to the
   * `bindBuffer()` function of the buffer being referenced by the `src`
   * attribute.
   * 
   * It is used at render time to perform the `gl.bindBuffer()` action without
   * having to specify the buffer id.
   */
  bindBuffer: (() => number) = () => {
    nop();
    return 0;
  };

  /** 
   * This function is the entry point of the logic for the BindBuffer class.
   * 
   * It is responsible set the reference to the "bindBuffer()" function and
   * to initialize any `VertexAttribPointer` children that this class might
   * have.
   * 
   * If a VertexAttribPointer is referencing a variable at position 0 then this
   * function uses the buffer length to calculate the number of vertices being
   * pointed at (and sets the `this.location0Count` to this amount).
   */
  async initialize(
    gl: WebGL2RenderingContext,
    buffers: WebGLBuffers,
    locations: ShaderLocations,
  ) {
    await this.whenLoaded;
    // get the bind function for the buffer with this src name from buffers
    this.bindBuffer = buffers.bindFunctionFor(this.src);
    this.target = this.bindBuffer();
    for (const child of Array.from(this.children)) {
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
    // Unbind the buffer
    // gl.bindBuffer(this.target, null);
  }
}

// Add the BindBuffer to the list of dependencies and go through all of them
// and register their tags in the Web Components customElements global registry.
// This is run at the module level, when this module is imported. The
// initialize() function waits for all these classes to be registered before
// doing anything.
[BindBuffer, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
