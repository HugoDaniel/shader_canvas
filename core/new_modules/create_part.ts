import { CanMerge } from "./can_merge.ts";
import { Payload } from "./payload.ts";
export class CanHaveParts extends globalThis.HTMLElement {
  parts: string[] = [];
  applyPayloads({
    payloads = [],
    // A payload can be applied in multiple places:
    // this function filters the children of the payload that matter
    payloadChildFilter = () => true,
    destinationRoot = this,
    destinationChooser,
    removePart = true,
  }: {
    payloads?: Payload[];
    payloadChildFilter?: (child: Node) => boolean;
    destinationRoot?: HTMLElement;
    destinationChooser?: (partChildName: string) => Element | null;
    removePart?: boolean;
  }) {
    for (const part of [...this.children]) {
      if (part instanceof CreatePart) {
        const name = part.nodeName.toLowerCase();
        // Get the payload for this children
        const payload = payloads.find((p) => p.tagName.toLowerCase() === name);
        if (!payload) continue;
        // Add the part name to the parts array, signalizing that this
        // element uses this part.
        this.parts.push(name);
        // Connect the attributes from the part node into its children and
        // then merge its children with the root of this element
        part.initialize(
          { payload, destinationRoot, destinationChooser, payloadChildFilter },
        );
        if (removePart) {
          this.removeChild(part);
        }
      }
    }
  }
}

export class CreatePart extends globalThis.HTMLElement {
  // Create the payload
  initializePart(initializers: Map<string, (p: Payload) => void>) {
    const payload = new Payload(this);
    const initializerFunction = initializers.get(this.nodeName.toLowerCase());
    if (initializerFunction) {
      initializerFunction(payload);
    }
    return payload;
  }

  initialize(
    { payload, destinationRoot, payloadChildFilter, destinationChooser }: {
      payload: Payload;
      destinationRoot: HTMLElement;
      payloadChildFilter: (child: Node) => boolean;
      destinationChooser?: (partChildName: string) => Element | null;
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
          `The ${payload.tagName} part child: ${node.nodeName}, cannot be merged.\n
          Is the destination an instance of "CanMerge"?`,
        );
      }
    }
  }
}
