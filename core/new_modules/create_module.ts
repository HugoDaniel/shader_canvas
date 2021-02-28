import { CanMerge } from "./can_merge.ts";
import { Payload } from "./payload.ts";

/**
 * The CreateModule class is intended to be used to create module tags.
 * 
 * Every module in use by the Shader Canvas is an instance of this class.
 * 
 * It has two initialize functions, the `initializeModule()` is the first
 * one to run, it is called by the `<new-modules>` to get this module payload.
 * 
 * The `initialize()` function applies 
 * 
 */
export class CreateModule extends globalThis.HTMLElement {
  /**
   * ## `<{{module-name}}>` {#CreateModule}
   * 
   * You chose the tag name for your modules when declaring them.
   * 
   * If it happens inside the `<new-modules>` tag, then the module tag name is
   * used to declare the DOM blueprint that is intended to be merged when the
   * module tag is used elsewhere.
   * 
   * If it happens outside the `<new-modules>` tag, then the module tag name is
   * used to merge its DOM blueprint (the child nodes it contains in the
   * `<new-modules>`) at the location it is at.
   * 
   * The allowed children of a module are:
   * 
   * - All Shader Canvas tags
   * - [`<webgl-program-part>`](#WebGLProgramPart) _Specifies a part of
   *   a [`<{{program-name}}>`](#CreateProgram) to be merged if this module is
   *   used inside a program._
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *   <new-modules>
   *     <my-crazy-module>
   *       <!--
   *        Create your Shader Canvas partial code here.
   *       -->
   *     </my-crazy-module>
   *   </new-modules>
   * 
   *   <!-- merge the module code here -->
   *   <my-crazy-module></my-crazy-module>
   * </shader-canvas>
   * ```
   * 
   * For a usable example check the
   * [4th example - composition](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/4-composition)
   * 
   * This custom named tag is meant to be used as a child of the
   * [`<new-modules>`](#NewModules) container tag.
   */
  static tag = "{{user defined}}";
  /**
   * Creates this module payload and calls any initializer function set for it
   * through the Shader Canvas API.
   */
  initializeModule(initializers: Map<string, (p: Payload) => void>) {
    const payload = new Payload(this);
    const initializerFunction = initializers.get(this.nodeName.toLowerCase());
    if (initializerFunction) {
      initializerFunction(payload);
    }
    return payload;
  }

  /**
   * Connects the payload to the destination.
   * Uses the `payloadChildFilter` to know which parts of the payload to use
   * for a given destination root.
   * 
   * Can only merge instances of the `CanMerge` class.
   */
  initialize(
    { payload, destinationRoot, payloadChildFilter, destinationChooser }: {
      payload: Payload;
      destinationRoot: HTMLElement;
      payloadChildFilter: (child: Node) => boolean;
      destinationChooser?: (moduleChildName: string) => Element | null;
    },
  ) {
    const nodes = payload.connectContents(this, payloadChildFilter);
    for (const node of nodes) {
      if (node instanceof CanMerge) {
        if (destinationChooser) {
          const destNodeName = node.tagName.toLowerCase();
          let destNode = destinationChooser(destNodeName);
          if (!destNode) {
            destNode = globalThis.document.createElement(destNodeName);
            destinationRoot.appendChild(destNode);
          }
          node.merge(destNode);
        } else {
          node.merge(destinationRoot);
        }
      } else {
        console.debug(
          `The ${payload.tagName} module child: ${node.nodeName}, cannot be merged.\n
          Is the destination an instance of "CanMerge"?`,
        );
      }
    }
  }
}

export class CanHaveModules extends globalThis.HTMLElement {
  modules: string[] = [];
  applyPayloads({
    payloads = [],
    // A payload can be applied in multiple places:
    // this function filters the children of the payload that matter
    payloadChildFilter = () => true,
    destinationRoot = this,
    destinationChooser,
    removeModule = true,
  }: {
    payloads?: Payload[];
    payloadChildFilter?: (child: Node) => boolean;
    destinationRoot?: HTMLElement;
    destinationChooser?: (moduleChildName: string) => Element | null;
    removeModule?: boolean;
  }) {
    for (const child of [...this.children]) {
      if (child instanceof CreateModule) {
        const name = child.nodeName.toLowerCase();
        // Get the payload for this children
        const payload = payloads.find((p) => p.tagName.toLowerCase() === name);
        if (!payload) continue;
        // Add the part name to the parts array, signalizing that this
        // element uses this part.
        this.modules.push(name);
        // Connect the attributes from the part node into its children and
        // then merge its children with the root of this element
        child.initialize(
          { payload, destinationRoot, destinationChooser, payloadChildFilter },
        );
        if (removeModule) {
          this.removeChild(child);
        }
      }
    }
  }
}
