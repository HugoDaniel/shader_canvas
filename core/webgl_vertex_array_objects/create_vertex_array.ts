// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { ShaderLocations } from "../common/locations.ts";
import { nop } from "../common/nop.ts";
import { WebGLBuffers } from "../webgl_buffers/webgl_buffers.ts";
import { BindBuffer } from "./bind_buffer.ts";
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
const dependsOn = [VertexAttribPointer, BindBuffer, WebGLBuffers];

/**
 * The CreateVertexArray class is intended to be used to create custom tags
 * for the children of the WebGLVertexArrayObjects container.
 * 
 * Every WebGL vertex array object in use by the Shader Canvas is an instance
 * of this class.
 * After initialization this class provides a `bindVAO` function that
 * performs the equivalent `gl.bindVertexArray()` on its vertex array instance. 
 */
export class CreateVertexArray extends globalThis.HTMLElement {
  /**
   * ## `<{{vao-name}}>` {#CreateVertexArray}
   * 
   * You chose the tag name for your vertex array objects (VAO) when declaring them.
   * The tag name is used to represent the name for the VAO.
   * This name is then used to reference this VAO in other Shader Canvas
   * containers and parts (like draw calls).
   * 
   * The allowed children of a VAO are:
   * 
   * - [`<bind-buffer>`](#BindBuffer) _Binds a buffer specified in the webgl
   *   buffers container_
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *  <webgl-canvas>
   *    <webgl-vertex-array-objects>
   *      <!--
   *        Create your WebGL VAOs here by specifying a
   *        tag name that uniquely identifies them.
   *      -->
   *      <here-is-a-vao>
   *        <bind-buffer src="some-buffer">
   *          <!-- vertex-attrib-pointers here -->
   *        </bind-buffer>
   *      </here-is-a-vao>
   *    <webgl-vertex-array-objects>
   *  </webgl-canvas>
   * </shader-canvas>
   * ```
   * 
   * For a usable example check the
   * [3rd example - animation](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/3-animation)
   * 
   * This custom named tag is meant to be used as a child of the
   * [`<webgl-vertex-array-objects>`](#WebGLVertexArrayObjects) container tag.
   */
  static tag = "{{user defined}}";

  /**
   * A helper flag that specifies if this VAO has an Element Array Buffer.
   * The presence of an Element Array Buffer means that this VAO is meant to be
   * drawn with the `gl.drawElements()` instead of the `gl.drawArrays()`
   * function.
   */
  hasElementArrayBuffer = false;
  /**
   * The WebGL Vertex Array Object id. Obtained after the call to
   * `gl.createVertexArray()`.
   */
  vao: WebGLVertexArrayObject | null = null;
  /**
   * Keep track of the variables that are being set with this VAO.
   * 
   * This is an array of variable names.
   */
  vars: string[] = [];
  /**
   * The VertexAttribPointer for the vertex attribute at location 0.
   * 
   * It is useful to know if this VAO is setting the data to be sent to the
   * vertex attribute at location 0.
   * 
   * In Shader Canvas the vertex attribute at location 0 always refers
   * to the vertices coordinates.
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
   * The bindVAO function is set in the `initialize()` method.
   * It defaults to a no-op, and after initialization becomes a wrapper for the
   * `gl.bindVertexArray()` function call.
   * 
   * It is used at render time to perform the `gl.bindVertexArray()` action
   * without having to specify the VAO id.
   */
  bindVAO: () => void = nop;

  /**
   * Initializing a Vertex Array Object (VAO) consists in creating a
   * Vertex Array in WebGL, and initialize each `<bind-buffer>` child it
   * might have.
   * 
   * This function creates the `bindVAO()` method (defined above) to be
   * a call to the `gl.bindVertexArray()` WebGL function (without the need for
   * the VAO id - it is set by the closure). 
   * 
   * This function loads the data and calculates its length. It also
   * creates the `bindBuffer` function above, that is used to set this buffer
   * as the target for further WebGL actions (which happens in a couple of
   * places, like with the Vertex Array Objects).
   */
  async initialize(
    gl: WebGL2RenderingContext,
    buffers: WebGLBuffers,
    locations: ShaderLocations,
  ) {
    // Wait for every dependency to load before proceeding further
    await this.whenLoaded;
    // Create the WebGL VAO id
    this.vao = gl.createVertexArray();
    // Don't abort execution if it was not possible to create a VAO id
    // but print and error and don't proceed with this initialization.
    if (!this.vao) {
      console.error(
        `<${this.tagName.toLocaleLowerCase()}>: Unable to create VAO`,
      );
      return;
    }
    const vao = this.vao;
    gl.bindVertexArray(vao);
    for (const child of Array.from(this.children)) {
      if (child instanceof BindBuffer) {
        // Initialize the `<bind-buffer>` tags
        await child.initialize(gl, buffers, locations);
        // Get the variable names that they have.
        this.vars = this.vars.concat(child.vars);
        // Look for ELEMENT_ARRAY_BUFFER targets, this means that this VAO
        // is meant to be drawn with `gl.drawElements()` instead of
        // `gl.drawArrays()`.
        this.hasElementArrayBuffer = this.hasElementArrayBuffer ||
          child.target === gl.ELEMENT_ARRAY_BUFFER;
        // store the vertex attrib pointer for the var at location = 0
        if (child.location0Attribute !== null) {
          this.location0Attribute = child.location0Attribute;
          this.location0Count = child.location0Count;
        }
      }
    }
    // This must be called *after* all buffers are initialized
    gl.bindVertexArray(null);
    // Create the bind function
    this.bindVAO = () => {
      gl.bindVertexArray(vao);
    };
  }
}

// Add the WebGLBuffers to the list of dependencies and go through all of them
// and register their tags in the Web Components customElements global registry.
// This is run at the module level, when this module is imported. The
// initialize() function waits for all these classes to be registered before
// doing anything.
[WebGLBuffers, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
