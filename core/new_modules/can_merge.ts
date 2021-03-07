// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
/**
 * This class is meant to be used as an extension.
 * 
 * CanMerge class provides another class with a default `merge()` method.
 * 
 * This method is used by the ShaderCanvas module system, to allow the Payload 
 * of the module tags to be merged into this element.
 * 
 * The module tags Payload is kind of a blueprint, an intermediate state of the
 * module DOM, that is intended to be filled with data from the module tag
 * attributes.
 */
export class CanMerge extends globalThis.HTMLElement {
  /** The name of the module where this part is coming from */
  module = "unknown";

  /** 
   * Deep merge the children of a root node into a destination element.
   * This is a recursive function that directly appends the child (and its
   * children) from the root into the destination. (using 
   * `dest.appendChild(rootChild)`)
   * 
   * The child attributes are copied into the destination node if the
   * child already exists in the destination.
   */
  merge(dest: Element | undefined | null, root: Element = this) {
    // Early return if there is no element
    if (!dest) return;
    const destChildNames = new Map([...dest.children].map(getChildName));
    for (const child of [...root.children]) {
      if (destChildNames.has(child.tagName)) {
        // Copy attributes from this child into the existing destination child
        const destChild = destChildNames.get(child.tagName);
        copyAttributes(child, destChild);
        // Do the recursive call here, and proceed to copy one level deeper
        this.merge(destChild, child);
      } else {
        dest.appendChild(child);
      }
    }
  }
}

/**
 * Helper function that returns a pair of [tagName, tagElement].
 * This is useful to create a Map of tags and fast check if a given tagName
 * exists in the destination.
 */
function getChildName(c: Element): [string, Element] {
  return [c.tagName, c];
}

/**
 * This function copies the attributes of an element into a destination 
 * element.
 * 
 * Merging defaults to a simple copy of the attributes if a given node already
 * exists in the destination.
 */
function copyAttributes(src: Element, dest: Element | undefined) {
  // Do nothing if dest is undefined or if src has no attributes
  if (dest && src.hasAttributes()) {
    for (const { name, value } of src.attributes) {
      dest.setAttribute(name, value);
    }
  }
}
