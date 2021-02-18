import { FragmentShader, VertexShader } from "../webgl_programs/shaders.ts";
import { CanMerge } from "./can_merge.ts";

/**
 * Extended through the <code data-textContent="...">, as a child of either
 * a vertex-shader or a fragment-shader
 **/
export class WebGLProgramPart extends CanMerge {
  static tag = "webgl-program-part";
  vertexCode = "";
  fragmentCode = "";

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
