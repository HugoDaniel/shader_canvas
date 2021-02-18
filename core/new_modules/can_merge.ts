export class CanMerge extends globalThis.HTMLElement {
  // Deep merge by default
  merge(dest: Element | undefined | null, root: Element = this) {
    if (!dest) return;
    const destChildNames = new Map([...dest.children].map(getChildName));
    for (const child of [...root.children]) {
      if (destChildNames.has(child.tagName)) {
        // Copy attributes from this child into the existing destination child
        const destChild = destChildNames.get(child.tagName);
        copyAttributes(child, destChild);
        // append deeper
        this.merge(destChild, child);
      } else {
        dest.appendChild(child);
      }
    }
  }
}

function getChildName(c: Element): [string, Element] {
  return [c.tagName, c];
}
function copyAttributes(src: Element, dest: Element | undefined) {
  if (dest && src.hasAttributes()) {
    for (const { name, value } of src.attributes) {
      dest.setAttribute(name, value);
    }
  }
}
