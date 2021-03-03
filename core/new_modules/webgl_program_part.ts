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
  vertexCode = "";
  fragmentCode = "";

  /**
   * Merges the code from the `node` and `codeText` arguments into the
   * `node.textContent`.
   * 
   * It merges only WebGL2 GLSL code. The entry point of the code to merge is
   * either bellow the "#version" line or the "precision" line. Whichever comes
   * latest. 
   * 
   * This is a private function meant to be used by the `merge` method bellow.
   */
  private mergeCode(node: Element | null, codeText: string) {
    if (node) {
      const splitCode = node.textContent?.split("\n") || [];
      let splitLineIndex = splitCode.findIndex((line) =>
        line.includes("precision ")
      );
      if (splitLineIndex === -1) {
        splitLineIndex = splitCode.findIndex((line) =>
          line.includes("#version ")
        );
      }
      if (splitLineIndex >= 0) {
        node.textContent = [
          ...splitCode.slice(0, splitLineIndex + 1),
          codeText,
          ...splitCode.slice(splitLineIndex + 1),
        ].join("\n");
      } else {
        node.textContent = [codeText, ...splitCode].join("\n");
      }
    }
  }
  /**
   * Merges the partial code in this "Program Part" in the destination element
   * passed as argument.
   */
  merge(dest: Element | undefined | null) {
    if (!dest) return;
    this.vertexCode =
      this.querySelector(`${VertexShader.tag} code`)?.textContent ||
      "";
    this.fragmentCode =
      this.querySelector(`${FragmentShader.tag} code`)?.textContent || "";

    this.mergeCode(
      dest.querySelector(`${VertexShader.tag} code`),
      this.vertexCode,
    );
    this.mergeCode(
      dest.querySelector(`${FragmentShader.tag} code`),
      this.fragmentCode,
    );
  }
}
