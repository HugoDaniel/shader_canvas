// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { ShaderCanvasContainer } from "../shader_canvas/shader_canvas_container.ts";
import { CreateProgram } from "./create_program.ts";
import { FragmentShader, VertexShader } from "./shaders.ts";
import { ShaderLocations } from "../common/locations.ts";
import type { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import type {
  InitializerFunction,
  ProgramRenderer,
} from "../common/program_class.ts";
import { NewModules } from "../new_modules/new_modules.ts";

/**
 * WebGLPrograms ignores the common Web Components creation methods. 
 * It is constructed and initialized by the "initialize()" function.
 * 
 * The "initialize()" uses the classes in this list to wait for them to be
 * registered with a custom tag name at the global customElements registry.
 *   
 * This list is declared at the file scope because it is also used at the
 * bottom of this file to register the tag names for them if they are not
 * registered.
 */
const dependsOn = [VertexShader, FragmentShader, NewModules];

/**
 * WebGLPrograms is a Web Component. It extends the ShaderCanvasContainer
 * because any immediate children tags get their names registered as
 * new Web Components automatically. These children act as containers for
 * functionality (WebGL Programs in this case) that can then be referenced
 * by the tag name being used.
 * 
 * WebGLPrograms is a container where each immediate child is a CreateProgram
 * instance.
 * 
 * This class has no constructor, it assumes the default constructor. The
 * logic starts at the `initialize()` function.
 */
export class WebGLPrograms extends ShaderCanvasContainer<CreateProgram> {
  /**
   * ## `<webgl-programs>` {#WebGLPrograms}
   * 
   * This tag is a container of a WebGL programs. Each child defines a WebGL 
   * Program. You must set a unique name for each child tag, these children
   * can then have the valid content for a [program](#CreateProgram).
   * 
   * The children unique tag names are used as reference in other containers
   * and in the [<draw-calls>](#DrawCalls) list of actions.
   * 
   * WebGL Programs consist of vertex shader code and fragment shader code.
   * During initialization the programs listed as children of this tag get 
   * loaded, compiled, linked and their variable locations set.
   * 
   * The allowed children are:
   * 
   * - [`<{{program-name}}>`](#CreateProgram)
   *   _WebGL Program (you decide the tag name)_
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *   <webgl-canvas>
   *    <webgl-programs>
   *      <my-awesome-program>
   *        <vertex-shader>
   *          <code> ... </code>
   *        </vertex-shader>
   *        <fragment-shader>
   *          <code> ... </code>
   *        </fragment-shader>
   *      </my-awesome-program>
   *    </webgl-programs>
   *  </webgl-canvas>
   * </shader-canvas>
   * ```
   * For a usable example check the
   * [1st example - simple triangle](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/1-triangle)
   * 
   * The `<webgl-programs>` tag is meant to be used as a child of the
   * [`<webgl-canvas>`](#WebGLCanvas) tag.
   */
  static tag = "webgl-programs";

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
   * Associates the variable name of the vertex attributes in this program with
   * their gl location.
   * 
   * This Map is useful to allow the variables content to be set using their
   * name (ShaderCanvas allows this, instead of the traditional flow of having
   * to go asking WebGL for the location and then use the location to set the
   * content)
   */
  locations: ShaderLocations = { attributes: new Map() };

  /**
   * Initializes the WebGL Programs container.
   * 
   * This function starts by calling the common container creation logic, by
   * reading its child tag names and create them as unique Web Components with
   * a `CreateProgram` instance.
   * 
   * After all programs have been created as Web Components, they get loaded,
   * compiled, linked and the variable locations updated.
   */
  async initialize({ gl, payloads }: WebGLCanvasContext) {
    // Only proceed if every needed tag is registered
    await this.whenLoaded;

    // This is a function from the ShaderCanvasContainer class extension.
    // It runs through all of the child tags and registers them as a new unique
    // Web Component with the CreateProgram class.
    this.createContentComponentsWith(CreateProgram);

    // All ShaderCanvasContainer child tags get mapped in the "content" Map.
    // Only proceed if there are any child tags to read.
    if (this.content.size === 0) {
      console.error(
        `<${WebGLPrograms.tag}>: No programs available to initialize`,
      );
      return;
    }

    // Place the children program class instances in a normal JS array.
    const programs = [...this.content.values()];
    // Initialize each program, this step is where the modules payload is merged
    // which only happens if there are any modules applied to a child program.
    // It needs to happen before all the other steps, because a module might
    // change the shader code of a given program.
    programs.forEach((p) => p.initialize(payloads));
    const attributes = this.locations.attributes;
    programs.forEach((program) => program.load(gl)); // Load the shader code
    // Make the compile calls all at once. This allows for parallel compilation.
    programs.forEach((program) => program.compile(gl)); // Compile shader code
    // Creates the GL Program and attaches the compiled shaders to it
    programs.forEach((program) => program.createProgram(gl));
    programs.forEach((program) => program.bindLocations(gl, attributes));
    programs.forEach((program) => program.link(gl));
    // Check if the program was properly created and linked
    programs.forEach((program) => program.statusCheck(gl));
    // Check if the vertex attribute locations match the ones set by the
    // other programs for the same variable names (this allows VAOs to be used
    // between shader programs without having to reset the locations)
    programs.forEach((program) => program.verifyLocations(gl, attributes));
    programs.forEach((program) => program.updateLocations(gl, attributes));
    programs.forEach((program) => program.updateUniformLocations(gl));
    console.debug("<webgl-programs> locations", [
      ...this.locations.attributes.entries(),
    ]);
  }

  /**
   * This function is responsible to create the customized render functions
   * for the programs that have them.
   * 
   * A program can have a customized render function if the developer uses
   * the `ShaderCanvas.createProgram()` API. This API sets an initializer
   * function that can return a customized render function to be used at
   * render time.
   * 
   * This function calls these initializers and returns their customized
   * render function in a Map that relates the program name with its
   * corresponding customized render function.
   * It is meant to be used by the WebGLCanvas global initialization function.
   */
  async callInitializers(
    gl: WebGL2RenderingContext,
    ctx: WebGLCanvasContext,
    initializers: Map<string, InitializerFunction>,
  ): Promise<Map<string, ProgramRenderer>> {
    // The final returned Map, relates the program name with its custom
    // render function.
    // This function fills this Map and returns it. Starts empty.
    const result = new Map();
    // Go through each CreateProgram tag instance declared as child, and
    // check if there is an initializer function defined for it.
    // The `this.content` Map is set by the ShaderCanvasContainer class that
    // this class is extending; it holds all program class instances and
    // associates them to their tag name.
    for (const [programName, program] of this.content.entries()) {
      // Get the initializer function for the current tag name
      const f = initializers.get(programName);
      // Check if it exists and if the program was correctly compiled.
      if (f && program && program.program) {
        // Bind the program before calling the initializer function
        gl.useProgram(program.program);
        // The initializer function produces the render function
        // It receives the gl as the first argument and an object of
        // optional attributes that holds the program uniform locations
        // and the global containers context (where the vertex attribute
        // locations can be read from)
        const renderer = await f(gl, {
          uniformLocations: program.uniformLocations,
          ctx,
        });
        // Unbind the program after use
        gl.useProgram(null);
        // Check if a render function was returned (it might not, a program
        // might only need some code to run at init time).
        if (renderer) {
          // And add it to the result Map
          result.set(programName, renderer);
        }
      } else {
        // Soft fail, produce a warning if the program is not valid and
        // continue with the other child programs
        if (!program) {
          console.warn(
"<webgl-programs>: could not call `createProgram` function for \
            program ${programName}`",
          );
        }
      }
    }
    return result;
  }
}

// Add the WebGLPrograms to the list of dependencies and go through all of them
// and register their tags in the Web Components customElements global registry.
// This is run at the module level, when this module is imported. The
// initialize() function waits for all these classes to be registered before
// doing anything.
[WebGLPrograms, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
