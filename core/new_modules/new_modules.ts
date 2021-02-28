import { ShaderCanvasContainer } from "../shader_canvas/shader_canvas_container.ts";
import { CreateModule } from "./create_module.ts";
import { Payload } from "./payload.ts";
import { WebGLProgramPart } from "./webgl_program_part.ts";

/**
 * For now only WebGLPrograms can be partially defined in modules. In the
 * future the other containers might also come into play here. At the current
 * state there is only support for full items in them (full arrays,
 * full textures, etc...).
 * 
 * WebGLPrograms can be partially defined, with parts of the code coming from
 * modules and getting merged into the final program.
 */
const dependsOn = [WebGLProgramPart];

/**
 * Web Component class for the tag `<new-modules>`. It is a container for
 * modules, where each child tag has its unique name and inside it the 
 * parts of the dom that will be merged when it is used.
 */
export class NewModules extends ShaderCanvasContainer<CreateModule> {
  /**
   * ## `<new-modules>` {#NewModules}
   * 
   * This tag is a container of a Shader Canvas modules. Each child defines a 
   * module. You must set a unique name for each child tag, these children
   * can then have the valid content for a [module](#CreateModule).
   * 
   * This is the place to define the DOM contents of each module. These module
   * tags can then be used in other containers, and have their contents merged
   * with the location that they are placed.
   * 
   * A Shader Canvas module consists of parts of the html code of each
   * Shader Canvas container. When a module tag is used outside of
   * `<new-modules>` the corresponding html code part for its parent will be
   * merged into the final Shader Canvas DOM.
   * 
   * The allowed children are:
   * 
   * - [`<{{module-name}}>`](#CreateModule)
   *   _Shader Canvas Module (you decide the tag name)_
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *  <new-modules>
   *    <some-cool-module-name>
   *      <webgl-buffers>
   *        <!-- buffers blueprint to be merged -->
   *      </webgl-buffers>
   *      <webgl-vertex-array-objects>
   *        <!-- vao's blueprint to be merged -->
   *      </webgl-vertex-array-objects>
   *      <webgl-program-part>
   *        <!-- a blueprint to be merged into a program -->
   *      </webgl-program-part>
   *    </some-cool-module-name>
   *  </new-modules>
   * </shader-canvas>
   * ```
   * 
   * For a usable example check the
   * [4th example - composition](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/4-composition)
   * 
   * The `<new-modules>` tag is meant to be used as a child of the
   * [`<shader-canvas>`](#ShaderCanvas) tag.
   */
  static tag = "new-modules";
  /**
   * A promise that resolves when all the dependencies are ready to be used.
   */
  private whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  /**
   * The list of Payloads to merge. Each payload corresponds to the HTML
   * part from the module declaration.
   * 
   * These will be used later by the containers Create*, when they call the
   * CreateModule.initialize() function
   */
  payloads: Payload[] = [];

  /**
   * This initialize function works similarly to the other containers
   * initialize functions.
   * 
   * It starts by reading its child tags and creating them as instances of
   * CreateModule and then calls the corresponding initialize function in each
   * of them.
   */
  async initialize(initializers: Map<string, (p: Payload) => void>) {
    await this.whenLoaded;
    this.createContentComponentsWith(CreateModule);
    // TODO: Fetch the import modules, and place them as children
    for (const child of [...this.children]) {
      if (child instanceof CreateModule) {
        this.payloads.push(child.initializeModule(initializers));
      }
    }
    // Payloads are returned to allow ShaderCanvas to keep track of the
    // payloads available.
    return this.payloads;
  }
}

// Add the NewModules to the list of dependencies and go through all of them
// and register their tags in the Web Components customElements global registry.
// This is run at the module level, when this module is imported. The
// initialize() function waits for all these classes to be registered before
// doing anything.
[NewModules, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
