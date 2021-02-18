import {
  GLSLVariable,
  parse,
} from "https://deno.land/x/glsl_variables@v1.0.2/parser.ts";

class ShaderCode extends globalThis.HTMLElement {
  code = "";
  variables: GLSLVariable[] = [];
  shader: WebGLShader | undefined;
  log: string | undefined;
  // deno-lint-ignore no-explicit-any
  status: any;

  initialize() {
    // TODO WHEN TRIANGLE IS VISIBLE: Setup a Mutation Observer

    this.setupCode();
  }
  /**
   * This function asserts that at least one `<code>` tag exists and that there
   * are no empty `<code>` tags.
   */
  private hasCode = (codeTags: HTMLCollectionOf<HTMLElement>) => {
    let isCodeEmpty = codeTags.length === 0;
    for (let i = 0; i < codeTags.length; i++) {
      isCodeEmpty = isCodeEmpty ||
        (codeTags[i].textContent?.trim().length || 0) === 0;
    }
    return !isCodeEmpty;
  };

  /** Returns the text content of the first `<code>` tag found on the argument */
  private getCode = (codeTags: HTMLCollectionOf<HTMLElement>) => {
    if (codeTags.length === 0) return "";
    return (codeTags[0].textContent || "").trim();
  };

  /** Looks for all `<code>` tags and returns the `textContent` from the first
   * found.
   * 
   * It throws an exception if no `<code>` tags were found or if there is no
   * `textContent` set on the first `<code>` tag.
   **/
  private readCode = () => {
    // Read all <code> tags
    const codeTags = this.getElementsByTagName("code");
    // Ensure that the code exists and is not empty
    if (!this.hasCode(codeTags)) {
      throw new Error("Shader must have at least one non-empty <code> tag");
    }
    // Read the first <code> tag it finds into the "code" string
    return this.getCode(codeTags);
  };

  /**
   * Reads the `textContent` from first `<code>` tag found and parses its
   * `GLSLVariables`
   * 
   * Sets `this.code` and `this.variables`.
   **/
  private setupCode = () => {
    this.code = this.readCode();
    this.variables = parse(this.code);
  };

  protected loadShader(gl: WebGL2RenderingContext, type: number) {
    const shader = gl.createShader(type);
    if (!shader) {
      throw new Error("Unable to create a GL Shader");
    }
    gl.shaderSource(shader, this.code);
    this.shader = shader;
  }

  compile(gl: WebGL2RenderingContext) {
    if (!this.shader) return;
    gl.compileShader(this.shader);
  }

  statusCheck(gl: WebGL2RenderingContext) {
    if (!this.shader) {
      throw new Error("Status: Shader not loaded: " + this.code);
    }
    this.status = gl.getShaderParameter(this.shader, gl.COMPILE_STATUS);
    this.log = gl.getShaderInfoLog(this.shader) || "Status: Nothing to report";
    if (!this.status) {
      const e = new Error(
        "Status: An error occurred compiling the shader: " + this.log,
      );
      gl.deleteShader(this.shader);
      throw e;
    }
  }
}

export class VertexShader extends ShaderCode {
  static tag = "vertex-shader";
  load(gl: WebGL2RenderingContext) {
    this.loadShader(gl, gl.VERTEX_SHADER);
  }
}
export class FragmentShader extends ShaderCode {
  static tag = "fragment-shader";
  load(gl: WebGL2RenderingContext) {
    this.loadShader(gl, gl.FRAGMENT_SHADER);
  }
}
