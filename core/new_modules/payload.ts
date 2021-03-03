// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
type ParentAttribute = string;
type AttributeInNode = string;
type NodePath = string;
export type PartConnections = Map<
  ParentAttribute,
  [AttributeInNode, NodePath][]
>;

export class Payload {
  contents: Node[] = [];
  tagName: string;

  constructor(root: HTMLElement) {
    this.tagName = root.tagName;
    this.contents = [...root.children];
  }

  static walkTheDOM(
    node: Node | null,
    func: (n: Node | null) => void,
  ) {
    func(node);
    node = node !== null ? node.firstChild : null;
    while (node) {
      Payload.walkTheDOM(node, func);
      node = node.nextSibling;
    }
  }

  connectContents(
    srcElem: HTMLElement,
    selectedContents: (child: Node) => boolean,
  ) {
    return this.contents.filter(selectedContents).map((child) => {
      const c = deepClone(child);
      Payload.walkTheDOM(c, (node) => {
        if (node && node instanceof globalThis.HTMLElement) {
          for (const [key, attribName] of Object.entries(node.dataset)) {
            if (attribName) {
              if (attribName.toLowerCase() === "textcontent") {
                setKey(node, key, srcElem.textContent);
              } else {
                setKey(node, key, srcElem.getAttribute(attribName));
              }
            }
            node.removeAttribute(`data-${key}`);
          }
        }
      });
      return c;
    });
  }
}

function setKey(node: HTMLElement, key: string, value: string | null) {
  if (!value) return;
  if (key.toLowerCase() === "textcontent") {
    node.textContent = value;
  } else {
    node.setAttribute(key, value);
  }
}

function deepClone(c: Node): Node {
  return c.cloneNode(true);
}
