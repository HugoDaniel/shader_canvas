import { CanMerge } from "../new_modules/can_merge.ts";

/**
 * This class is meant to be used as an extension.
 * 
 * It represents a container of custom tags. Each child name will be used to
 * register a custom element of type T.
 * 
 * This means that a container can have infinite children, provided that each
 * child has a unique name.
 * 
 * A container is a creator of tags. Each child will be a new tag. This
 * anti-pattern has a set of cool properties, the most used in shader canvas is
 * that it allows the contents of each child to be referenced by the tag name
 * it has.
 * 
 * Example:
 * 
 * <container>
 *  <a-new-unique-name>
 *    <!-- Some content -->
 *  </a-new-unique-name>
 *  <another-new-unique-name>
 *    <!-- Some other content -->
 *  </another-new-unique-name>
 * </container>
 *  
 * Then the contents can be referenced by its child name. This makes it clearer
 * to read and maintain in big HTML trees (the tag collapses). It is also easy
 * to process through the provided DOM access methods.
 * 
 * This class implements the "CanMerge" class, which is an instance of
 * HTMLElement and allows modules to be used in it (their payloads can be merged
 * here).
 */
export class ShaderCanvasContainer<T> extends CanMerge {
  // This Map associates each new tag child with its T class instance.
  // This is helpful when accessing or referencing within a container function.
  // It avoids querying the DOM.
  content: Map<string, T> = new Map();
  /**
   * Read all children and create custom elements with their name.
   * 
   * For each child, creates the element with the name it has, as an anonymous
   * class of the CustomElementConstructor provided as argument.
   * 
   * This function is intended to be called by the container `initialize()`
   * function.
   **/
  createContentComponentsWith = (
    parent: CustomElementConstructor,
  ) => {
    for (const child of [...this.children]) {
      const childName = child.tagName.toLocaleLowerCase();
      if (!childName) {
        throw new Error(`Unable to read ${this.tagName} child`);
      }
      // Create the web component for this child
      if (!globalThis.customElements.get(childName)) {
        // Extending an anonymous class creates a unique class that is exactly
        // the same as the CustomElementConstructor provided as argument.
        // In ShaderCanvas these CustomElementConstructor's are typically
        // the classes that start with Create*.
        // i.e. CreateProgram, CreateBuffer, CreateTexture, etc...
        const contentClass = class extends parent {};
        // This is where the registration happens, a new WebComponent is
        // created with the child name being read.
        globalThis.customElements.define(childName, contentClass);
        // Keep track of the instances, by placing it in the Map that associates
        // the new tag name with its class instance.
        this.content.set(childName, child as unknown as T);
      }
    }
  };
}
