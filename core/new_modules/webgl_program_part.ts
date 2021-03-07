// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { FragmentShader, VertexShader } from "../webgl_programs/shaders.ts";
import { CanMerge } from "./can_merge.ts";

/**
 * This class is a Web Component that is meant to be used as a child of custom
 * named `CreateModule` instances.
 * 
 * It extends a `CreateProgram` living as child of the `WebGLPrograms` container 
 * through its `<code data-textContent="...">` tags. These can be defined as a
 * child of either a vertex-shader or a fragment-shader.
 **/
export class WebGLProgramPart extends CanMerge {
  /**
   * ## `<webgl-program-part>` {#WebGLProgramPart}
   * 
   * Use this tag to declare a reusable part of your WebGL program GLSL code.
   * 
   * The code set in this tag can then be used in multiple GLSL programs in
   * a transparent way.
   * 
   * The allowed children are:
   * 
   * - [`<vertex-shader>`](#VertexShader) _Specifies the code part for the
   *   Vertex shader program_
   * - [`<fragment-shader>`](#FragmentShader) _Specifies the code part for the
   *   Vertex shader program_
   * 
   * For a usable example check the
   * [4th example - composition](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/4-composition)
   * 
   * This tag is meant to be used inside the custom named module tag
   * [`<{{module-name}}>`](#CreateModule).
   */
  static tag = "webgl-program-part";

  /**
   * Merges the code children tags from the `node` element to the `dest`
   * element.
   * 
   * The final output code is created in the ShaderCode class by parsing the
   * contents of all the children it has at the initialization stage.
   * 
   * This is a private function meant to be used by the `merge` method bellow.
   */
  private mergeCodeChildren(dest: Element | null, node: Element | null) {
    if (node && dest) {
      for (const child of node.childNodes) {
        if (
          child.nodeName === "CODE" || child.nodeName === "CODE-BEFORE" ||
          child.nodeName === "CODE-AFTER"
        ) {
          const destSibling = dest.querySelector(child.nodeName);
          const codeChild = child.cloneNode(true);
          // Set the module origin as an attribute
          if (codeChild instanceof globalThis.Element) {
            codeChild.setAttribute(
              "from-module",
              this.module,
            );
          }
          if (destSibling) {
            dest.insertBefore(codeChild, destSibling);
          } else {
            dest.appendChild(codeChild);
          }
        }
      }
    }
  }

  /**
   * Merges the partial code in this "Program Part" in the destination element
   * passed as argument.
   */
  merge(dest: Element | undefined | null) {
    if (!dest) return;

    const vertexElem = this.querySelector(VertexShader.tag);
    const fragmentElem = this.querySelector(FragmentShader.tag);
    this.mergeCodeChildren(
      dest.querySelector(VertexShader.tag),
      vertexElem,
    );
    this.mergeCodeChildren(
      dest.querySelector(FragmentShader.tag),
      fragmentElem,
    );
  }
}
