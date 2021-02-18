import { CanMerge } from "../new_modules/can_merge.ts";

export class ShaderCanvasContainer<T> extends CanMerge {
  content: Map<string, T> = new Map();
  /**
   * Read all children
   * For each child, create the element with the name it has, as an anonymous
   * class of CreateProgram
   **/
  createContentComponentsWith = (
    parent: CustomElementConstructor,
  ) => {
    for (const child of [...this.children]) {
      const childName = child.tagName.toLocaleLowerCase();
      if (!childName) {
        throw new Error(`Unable to read ${this.tagName} child`);
      }
      // Create the web component
      if (!globalThis.customElements.get(childName)) {
        // Extending an anonymous class creates a unique class that is exactly
        // the same as the CreateProgram
        const contentClass = class extends parent {};
        globalThis.customElements.define(childName, contentClass);
        this.content.set(childName, child as unknown as T);
      }
    }
  };

  protected static copyChildrenFromTarget = (
    target: HTMLElement,
    name: string,
    defaultTagName: string,
    classObject: CustomElementConstructor,
    contentFilter: (elem: Element) => boolean,
  ) => {
    let elem = target.querySelector(name);

    // Create the new container
    if (!elem || !(elem instanceof classObject)) {
      const defaultTag = globalThis.document.createElement(defaultTagName);
      // Not found as a child: create a new one and copy the relevant content
      // found on the <shader-canvas> body into it
      elem = globalThis.document.createElement(name);

      elem.appendChild(defaultTag);
      // Copy all target child that pass the filter into the container
      // defaultTag
      for (const child of target.children) {
        if (contentFilter(child)) {
          defaultTag.appendChild(child.cloneNode(true));
        }
      }
    }

    // Must be an instance after creation
    if (!(elem instanceof classObject)) {
      throw new Error(`Unable to create container ${name} - make sure it is \
      already registered by running it inside the \
      "customElements.whenDefined('${name}')" promise`);
    }
    return elem;
  };
}
