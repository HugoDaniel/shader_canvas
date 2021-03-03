// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { BufferData } from "./buffer_data.ts";
import type { DataInputArray } from "./buffer_data.ts";
import { nop } from "../common/nop.ts";

/**
 * The CreateBuffer class is intended to be used to create custom tags
 * for the children of the WebGLBuffers container.
 * 
 * Every WebGL buffer in use by the Shader Canvas is an instance of this class.
 * After initialization this class provides a `bindBuffer` function that
 * performs the equivalent `gl.bindBuffer()` on its buffer instance. 
 */
export class CreateBuffer extends globalThis.HTMLElement {
  /**
   * ## `<{{buffer-name}}>` {#CreateBuffer}
   * 
   * You chose the tag name for your buffers when declaring them. The tag name
   * is used to represent the name for the buffer. This name is then used to
   * reference this buffer in other Shader Canvas containers and parts (like
   * vertex array objects and draw calls).
   * 
   * The allowed children of a buffer are:
   * 
   * - [`<buffer-data>`](#BufferData) _WebGL Buffer Data source_
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *  <webgl-canvas>
   *    <webgl-buffers>
   *      <!--
   *        Create your WebGL buffers here by specifying a
   *        tag name that uniquely identifies them.
   *      -->
   *      <super-huge-buffer>
   *        <buffer-data src="/mesh.json"></buffer-data>
   *      </super-huge-buffer>
   *    </webgl-buffers>
   *  </webgl-canvas>
   * </shader-canvas>
   * ```
   * 
   * For a usable example check the
   * [1st example - simple triangle](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/1-triangle)
   * 
   * This custom named tag is meant to be used as a child of the
   * [`<webgl-buffers>`](#WebGLBuffers) container tag.
   */
  static tag = "{{user defined}}";
  // ^ This static "tag" is not used, it is here to trigger the documentation
  /**
   * The buffer raw data object. Can have multiple representations, or null if
   * this buffer is just a place-holder for the time being.
   */
  data: DataInputArray | null = null;
  /**
   * The WebGL id for this buffer. Created during initialization.
   */
  buffer: WebGLBuffer | null = null;
  /**
   * The buffer length in bytes (takes in consideration a possible offset)
   */
  length = 0;
  /**
   * This function is a wrapper for the `gl.bindBuffer()` call.
   * It takes no arguments because it always binds this current
   * buffer instance.
   * 
   * It is set during initialization and defaults to a no-op before it.
   */
  bindBuffer: (() => number) = () => {
    nop();
    return 0; // Return the "0" target, this does not match any buffer target id
  };

  /**
   * Initializing a buffer consists in calling the initialization function
   * for each child <buffer-data> instance.
   * 
   * This function loads the data and calculates its length. It also
   * creates the `bindBuffer` function above, that is used to set this buffer
   * as the target for further WebGL actions (which happens in a couple of
   * places, like with the Vertex Array Objects).
   */
  async initialize(gl: WebGL2RenderingContext) {
    // Create the WebGL buffer Id.
    this.buffer = gl.createBuffer();
    // Early return if it is not possible to create a buffer id.
    if (!this.buffer) {
      console.error(
        `<${this.tagName.toLocaleLowerCase()}>: Unable to create buffer`,
      );
      return;
    }
    // TODO: merge data buffers into a single data buffer
    for (const child of [...this.children]) {
      if (child instanceof BufferData) {
        child.initialize(gl); // creates the load function
        await child.load(this.buffer); // loads the buffer data
        this.data = child.data; // keep a local reference for the data
        // adjust the length to contain the loaded buffer data byte count
        this.length += child.length;
        // Create the bind function
        const target = gl[child.target];
        this.bindBuffer = () => {
          gl.bindBuffer(target, this.buffer);
          return target;
        };
      }
    }
  }
}
