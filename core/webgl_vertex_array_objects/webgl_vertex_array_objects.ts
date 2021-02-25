import { ShaderCanvasContainer } from "../shader_canvas/shader_canvas_container.ts";
import { CreateVertexArray } from "./create_vertex_array.ts";
import { VertexAttribPointer } from "./vertex_attrib_pointer.ts";
import { BindBuffer } from "./bind_buffer.ts";
import { nop } from "../common/nop.ts";
import { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { WebGLBuffers } from "../webgl_buffers/webgl_buffers.ts";

/**
 * Like the other WebGL* containers, the WebGLVertexArrayObjects ignores the
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
const dependsOn = [VertexAttribPointer, BindBuffer, WebGLBuffers];

/**
 * WebGLVertexArrayObjects is a Web Component. It extends the
 * ShaderCanvasContainer because any immediate children tags get their names
 * registered as new Web Components automatically. These children act as
 * containers for functionality (WebGL Vertex Array Objects in this case) that
 * can then be referenced by their unique tag name being used.
 * 
 * WebGLVertexArrayObjects is a container where each immediate child is a
 * CreateVertexArray instance.
 * 
 * This class has no constructor, it assumes the default constructor. The
 * logic starts at the `initialize()` function.
 */
export class WebGLVertexArrayObjects
  extends ShaderCanvasContainer<CreateVertexArray> {
  /**
   * ## `<webgl-vertex-array-objects>` {#WebGLVertexArrayObjects}
   * 
   * This tag is a container of a WebGL Vertex Array Objects. Each child defines
   * a WebGL Vertex Array Object. You must set a unique name for each child tag,
   * these children can then have the valid content for a 
   * [vertex array object](#CreateVertexArray).
   * 
   * The children unique tag names are used as reference in other containers
   * and in the [<draw-calls>](#DrawCalls) list of actions.
   *
   * Vertex Array Objects pass extra data per vertex into WebGL programs.
   * They allow a vertex to have any extra information that might be needed
   * for the programs to display their cool things.
   *  
   * WebGL Vertex Array Objects are a way that WebGL uses to separate the data
   * contents from their representation. With Vertex Array Objects it is
   * possible to select a buffer and read its data as 2d float vertices, or,
   * if you want, select that same buffer and read its data as 3d vertices.
   * 
   * During initialization the vertex array objects listed as children of this
   * tag get their runtime functions created to be used by the draw calls
   * either at its initialization or during the render loop.
   * 
   * The allowed children are:
   * 
   * - [`<{{vertex-array-object-name}}>`](#CreateVertexArrayObject)
   *   _WebGL Vertex Array Object (you decide the tag name)_
   * - Any module tag defined inside the [`<new-modules>`](#NewModules)
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *   <webgl-canvas>
   *     <webgl-vertex-array-objects>
   *       <my-extra-vertex-data>
   *          <!--
   *            Vertex Array Object content tags
   *          -->
   *       </my-extra-vertex-data>
   *    </webgl-vertex-array-objects>
   *   </webgl-canvas>
   * </shader-canvas>
   * ```
   * For a usable example check the
   * [2nd example - texture quad](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/2-textured-quad)
   * 
   * The `<webgl-vertex-array-objects>` tag is meant to be used as a child of
   * the [`<webgl-canvas>`](#WebGLCanvas) tag.
   */
  static tag = "webgl-vertex-array-objects";

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
   * This function returns the function that binds the Vertex Array Object that
   * has the name passed in the argument.
   * 
   * It looks for the name in this element children tags, and returns the
   * reference to its `bindVAO()` function.
   * 
   * If no Vertex Array Object is found with that name, a no operation function
   * is returned.
   * 
   * This function is mostly a helper to avoid having to look into all the
   * children elements to get a given bind function. Vertex Array Objects bind
   * functions are useful in WebGL because they set the Vertex Array Object
   * where further actions will operate.
   */
  bindFunctionFor(vaoName: string) {
    // The "this.content" Map is set by the ShaderCanvasContainer class that
    // this class extends from. It holds the association between the child
    // tag names and their instance (CreateVertexArray in this case).
    const vao = this.content.get(vaoName);
    if (!vao) {
      console.error(
        `<webgl-vertex-array-objects>: Could not get bind function for \
        ${vaoName}`,
      );
      return nop;
    }
    return vao.bindVAO;
  }
  /**
   * Initializes the WebGL Vertex Array Objects container.
   * 
   * This function starts by calling the container creation logic: it reads
   * its child tag names and creates them as unique Web Components with
   * a `CreateVertexArray` instance.
   * 
   * After all vertex array objects have been created as Web Components,
   * they get initialized, which creates their bind function.
   */
  async initialize({
    gl,
    buffers,
    programs: { locations },
  }: WebGLCanvasContext) {
    // Only proceed if every needed tag is registered
    await this.whenLoaded;
    // This is a function from the ShaderCanvasContainer class extension.
    // It runs through all of the child tags and registers them as a new unique
    // Web Component with the CreateVertexArray class.
    this.createContentComponentsWith(CreateVertexArray);

    // Buffers and program vertex attribute locations must be available for
    // a Vertex Array Object to be initialized.
    if (!buffers) {
      console.warn(
        "<webgl-vertex-array-objects>: unable to initialize without buffers",
      );
      return;
    }
    if (!locations) {
      console.warn(
        "<webgl-vertex-array-objects>: unable to initialize without locations",
      );
      return;
    }
    for (const vao of this.content.values()) {
      // Initializing a Vertex Array Object (VAO) is about giving meaning to
      // buffer data and specify how it should be sent to the programs in
      // each vertex.
      // This process involves looking at the buffers being bound and
      // read their vertex attrib pointer tags.
      await vao.initialize(gl, buffers, locations);
    }
  }
}

// Add the WebGLVertexArrayObjects to the list of dependencies and go through
// all of them and register their tags in the Web Components customElements
// global registry.
// This is run at the module level, when this module is imported. The
// initialize() function waits for all these classes to be registered before
// doing anything.
[WebGLVertexArrayObjects, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
