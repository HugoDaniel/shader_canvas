import { ShaderCanvasContainer } from "../shader_canvas/shader_canvas_container.ts";
import { CreateBuffer } from "./create_buffer.ts";
import { BufferData } from "./buffer_data.ts";
import { nop } from "../common/nop.ts";
import type { WebGLCanvasContext } from "../webgl_canvas/context.ts";

/**
 * Like the other WebGL* containers, the WebGLBuffers ignores the common
 * Web Components creation methods. 
 * It is constructed and initialized by the "initialize()" function.
 * 
 * The "initialize()" uses the classes in this list to wait for them to be
 * registered with a custom tag name at the global customElements registry.
 *   
 * This list is declared at the file scope because it is also used at the
 * bottom of this file to register the tag names for them if they are not
 * registered.
 */
const dependsOn = [BufferData];

/**
 * WebGLBuffers is a Web Component. It extends the ShaderCanvasContainer
 * because any immediate children tags get their names registered as
 * new Web Components automatically. These children act as containers for
 * functionality (WebGL Buffers in this case) that can then be referenced
 * by the tag name being used.
 * 
 * WebGLBuffers is a container where each immediate child is a CreateBuffer
 * instance.
 * 
 * This class has no constructor, it assumes the default constructor. The
 * logic starts at the `initialize()` function.
 */
export class WebGLBuffers extends ShaderCanvasContainer<CreateBuffer> {
  /**
   * ## `<webgl-buffers>` {#WebGLBuffers}
   * 
   * This tag is a container of a WebGL buffers. Each child defines a WebGL 
   * Buffer. You must set a unique name for each child tag, these children
   * can then have the valid content for a [buffer](#CreateBuffer).
   * 
   * The children unique tag names are used as reference in other containers
   * and in the [<draw-calls>](#DrawCalls) list of actions.
   * 
   * WebGL Buffers consist of buffer data. For now 1 buffer can only have one
   * buffer data source (this will change in the future to allow early
   * concatenation of raw data).
   * During initialization the buffers listed as children of this tag get 
   * loaded and their runtime functions created to be used by the draw calls
   * either at its initialization or during the render loop.
   * 
   * The allowed children are:
   * 
   * - [`<{{buffer-name}}>`](#CreateBuffer)
   *   _WebGL Buffer (you decide the tag name)_
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *   <webgl-canvas>
   *     <webgl-buffers>
   *       <cube-vertices>
   *         <buffer-data src="/myCube.json"></buffer-data>
   *       </cube-vertices>
   *       <cool-texture-uv-coords>
   *         <buffer-data src="#textureCoords"></buffer-data>
   *       </cool-texture-uv-coords>
   *     </webgl-buffers>
   *   </webgl-canvas>
   * </shader-canvas>
   * ```
   * For a usable example check the
   * [3rd example - animation](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/3-animation)
   * 
   * The `<webgl-buffers>` tag is meant to be used as a child of the
   * [`<webgl-canvas>`](#WebGLCanvas) tag.
   */
  static tag = "webgl-buffers";
  /**
   * Promise that resolves when all dependencies have registered their 
   * tag in the customElements global Web Components registry.
   * 
   * This is used in the async initialize() function, to ensure that the
   * code only runs when all the tags it depends are available. 
   */
  whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  /**
   * This function returns the function that binds the buffer with the name
   * passed in the argument.
   * 
   * It looks for the name in its children, and returns the reference to its
   * `bindBuffer()` function.
   * 
   * If no buffer is found with that name, a no operation function is returned.
   * 
   * This function is mostly a helper to avoid having to look into all the
   * buffers to get a given bind function. Buffer bind functions are useful
   * in WebGL because they set the buffer where further actions will operate.
   */
  bindFunctionFor(bufferName: string) {
    // The "this.content" Map is set by the ShaderCanvasContainer class that
    // this class extends from. It holds the association between the child
    // tag names and their instance (CreateBuffer in this case).
    const buffer = this.content.get(bufferName);
    if (!buffer) {
      // Don't abort execution, but signal that an error occurred. Not finding
      // a buffer is typically a declaration error since Shader Canvas works at
      // initialization to create the graphics draw calls for runtime.
      console.error(
        `<webgl-buffers>: Could not get bind function for ${bufferName}`,
      );
      // Return a nop that outputs the 0 buffer id.
      return () => {
        nop();
        return 0;
      };
    }
    // Return the reference for the bindBuffer() in the requested buffer.
    return buffer.bindBuffer;
  }

  /**
   * This function returns the raw data length (in bytes) for the buffer
   * with the name provided as argument. 
   * 
   * This length takes in consideration an eventual offset in the buffer data.
   * 
   * Returns 0 if the buffer name is not found.
   */
  lengthFor(bufferName: string) {
    // The "this.content" Map is set by the ShaderCanvasContainer class that
    // this class extends from. It holds the association between the child
    // tag names and their instance (CreateBuffer in this case).
    const buffer = this.content.get(bufferName);
    if (!buffer || buffer.data === null) {
      // Asking for the length of a buffer without data is signaled with
      // this error. Buffers can be set with data, to be just empty containers
      // when they are declared (hopefully they get filled with when running)
      console.error(
        `<webgl-buffers>: Could not get length for ${bufferName}`,
      );
      return 0;
    }
    return buffer.length;
  }

  /**
   * Initializes the WebGL Buffers container.
   * 
   * This function starts by calling the common container creation logic, by
   * reading its child tag names and create them as unique Web Components with
   * a `CreateBuffer` instance.
   * 
   * After all buffers have been created as Web Components, they get loaded,
   * and their runtime functions created.
   */
  async initialize({ gl }: WebGLCanvasContext) {
    // Only proceed if every needed tag is registered
    await this.whenLoaded;
    // This is a function from the ShaderCanvasContainer class extension.
    // It runs through all of the child tags and registers them as a new unique
    // Web Component with the CreateBuffer class.
    this.createContentComponentsWith(CreateBuffer);

    // Initialize all CreateBuffer children.
    for (const buffer of this.content.values()) {
      // await will wait for the data to be loaded before proceeding to the next
      // buffer. Maybe this can be changed to a `for await...of` loop instead.
      await buffer.initialize(gl);
    }
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
