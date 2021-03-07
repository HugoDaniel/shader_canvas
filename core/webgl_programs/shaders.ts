// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import {
  GLSLVariable,
  parse,
} from "https://deno.land/x/glsl_variables@v1.0.2/parser.ts";

/**
 * This class defines the common functionality between the VertexShader and
 * the FragmentShader.
 * 
 * They both share most of the functionality, their difference at this level 
 * of abstraction is mostly cosmetic.
 */
class ShaderCode extends globalThis.HTMLElement {
  code = "";
  variables: GLSLVariable[] = [];
  shader: WebGLShader | undefined;
  log: string | undefined;
  // deno-lint-ignore no-explicit-any
  status: any;

  /**
   * Shader Code initialization consists in:
   * - Read the `textContent` of the child `<code>` tag.
   * - Parse its variables.
   */
  initialize() {
    // TODO: Setup a Mutation Observer to re-compile things when they change
    this.setupCode();
    // The final output code is set as a text node directly on the shader html
    // element
    this.appendChild(globalThis.document.createTextNode(this.code));
  }

  /**
   * Merges and returns the text content of the elements array passed as
   * argument.
   **/
  private getCode = (codeTags: Element[]) => {
    // Early return
    if (codeTags.length === 0) return "";
    // Convert to string (map the textContent of the element), and concat all
    // strings (reduce by appending with the + string operator)
    return (codeTags.map((code) => (code.textContent || "").trim()).reduce((
      accum,
      value,
    ) => `${accum}\n${value}`));
  };

  /**
   * Looks for the line with the string "#version " and puts it at the start
   * of the "code" string.
   * 
   * This function is pure, it does not change the argument string.
   */
  private adjustVersion(code: string) {
    return this.placeLineOnTop(code, ["#version "]);
  }
  /**
   * Looks for the line with the string "precision highp float;" or 
   * "precision mediump float;" or "precision lowp float;" and puts it at the
   * start of the "code" string.
   * 
   * This function is pure, it does not change the argument string.
   */
  private adjustPrecision(code: string) {
    return this.placeLineOnTop(code, [
      "precision highp float;",
      "precision mediump float;",
      "precision lowp float;",
    ]);
  }

  /**
   * Looks for the line with at least one of the strings specified by "lookFor"
   * and removes it from its location and puts it at the start of the "code"
   * string.
   * 
   * This function is pure, it does not change the argument string.
   */
  private placeLineOnTop(code: string, lookFor: string[]) {
    const lines = code.split("\n");
    // Finds the first index that includes one of the strings in the "lookFor"
    // array
    const splitIndex = lines.findIndex((l) =>
      lookFor.some((words) => l.includes(words))
    );
    if (splitIndex <= 0) return code;
    return ([
      lines[splitIndex],
      ...lines.slice(0, splitIndex),
      ...lines.slice(splitIndex + 1),
    ].join("\n"));
  }

  /** 
   * Looks for all code tags (`<code-before>`, `<code>` and `<code-after>`)
   * and returns the merged `textContent` string from all of them.
   **/
  private readCode = () => {
    // Read all <code> tags
    const codeTags = [
      ...this.getElementsByTagName("code-before"),
      ...this.getElementsByTagName("code"),
      ...this.getElementsByTagName("code-after"),
    ];
    // Read the elements textContent's
    return this.getCode(codeTags);
  };

  /**
   * Reads the `textContent` from the code tags found and parses its
   * `GLSLVariables`
   * 
   * Sets `this.code` and `this.variables`.
   * 
   * Throws an exception if there is no code.
   **/
  private setupCode = () => {
    this.code = this.readCode();
    // Ensure that the code exists and is not empty
    if (!this.code || this.code.length === 0 || this.code.trim().length === 0) {
      throw new Error(
        `Shader must have at least one non-empty code tag\n\
      Please ensure that there is at least one of "<code-before>", "<code>", \
      "<code-after>"`,
      );
    }
    // Adjust the location of the precision GLSL code line:
    this.code = this.adjustPrecision(this.code);
    // Adjust the #version of the GLSL code:
    this.code = this.adjustVersion(this.code);
    this.variables = parse(this.code);
  };

  /**
   * Creates the WebGL Shader and sets the shader source to be the string
   * contents of the "code" attribute.
   * 
   * Updates the "shader" attribute with the created WebGLShader id.
   */
  protected loadShader(gl: WebGL2RenderingContext, type: number) {
    const shader = gl.createShader(type);
    if (!shader) {
      throw new Error("Unable to create a WebGL Shader");
    }
    gl.shaderSource(shader, this.code);
    this.shader = shader;
  }

  /**
   * Runs the `gl.compileShader` command for the WebGLShader id specified
   * by the "shader" attribute.
   * 
   * This function is very minimal, its intention is to provide a quick check
   * before the compileShader call. Useful to perform shader compilation in
   * batches in `WebGLPrograms.initialize()`.
   */
  compile(gl: WebGL2RenderingContext) {
    if (!this.shader) return;
    gl.compileShader(this.shader);
  }

  /**
   * Checks the compilation status of the shader code. If an error is found
   * the shader information log is printed before all execution is aborted
   * (by thrown an exception) and the shader is deleted.
   */
  statusCheck(gl: WebGL2RenderingContext) {
    // Early return. Aborts all execution if there is not a shader at this
    // point.
    if (!this.shader) {
      throw new Error("Status: Shader not loaded: " + this.code);
    }
    // Reads the shader status code.
    this.status = gl.getShaderParameter(this.shader, gl.COMPILE_STATUS);
    // Read the shader information log, this log is shown bellow if a status
    // error is found.
    this.log = gl.getShaderInfoLog(this.shader) || "Status: Nothing to report";
    if (!this.status) {
      // Remove the shader before throwing the exception.
      gl.deleteShader(this.shader);
      throw new Error(
        `Status: An error occurred compiling the shader: ${this.log}`,
      );
    }
  }
}

/**
 * This class implements the "load" function for the vertex shader.
 * All other functionality is done by extending the ShaderCode class. 
 */
export class VertexShader extends ShaderCode {
  /**
   * ## `<vertex-shader>` {#VertexShader}
   * 
   * This tag holds the vertex shader code of a WebGL program. The code must be
   * valid WebGL 2 GLSL. It is parsed and the variables analyzed and retrieved
   * to allow Shader Canvas to be able to easily reference them and keep track
   * of their locations at compilation/linking time.
   * 
   * The allowed children for the `<vertex-shader>`:
   * 
   * - [`<code>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/code) 
   *   _Plain HTML `<code>` tag that holds the vertex
   *   code. Code tag is useful because it allows preformatted text as content._
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *  <webgl-canvas>
   *    <webgl-programs>
   *      <some-program>
   *        <vertex-shader>
   *          <code>
   *            #version 300 es
   *            in vec4 a_position;
   *            void main() {
   *              gl_Position = a_position;
   *            }
   *          </code>
   *        </vertex-shader>
   *        <fragment-shader>
   *          <code>
   *            <!--
   *              Write the fragment shader code for
   *              "some-program" here.
   *            -->
   *          </code>
   *        </fragment-shader>
   *      </some-program>
   *    </webgl-programs>
   *  </webgl-canvas>
   * </shader-canvas>
   * ```
   * 
   * For a usable example check the
   * [1st example - simple triangle](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/1-triangle)
   * 
   * The `<vertex-shader>` tag is meant to be used as a child of the
   * [`<{{program-name}}>`](#CreateProgram) custom named tag.
   */
  static tag = "vertex-shader";
  /**
   * Simple wrapper for the `ShaderCode.loadShader()` method.
   * Sets the shader type as a VERTEX_SHADER
   */
  load(gl: WebGL2RenderingContext) {
    this.loadShader(gl, gl.VERTEX_SHADER);
  }
}
/**
 * This class implements the "load" function for the fragment shader.
 * All other functionality is done by extending the ShaderCode class. 
 */
export class FragmentShader extends ShaderCode {
  /**
   * ## `<fragment-shader>` {#FragmentShader}
   * 
   * This tag holds the fragment shader code of a WebGL program. The code must
   * be valid WebGL 2 GLSL. It is parsed and the variables analyzed and
   * retrieved to allow Shader Canvas to be able to easily reference them and
   * track their locations at compilation/linking time.
   * 
   * The allowed children for the `<fragment-shader>`:
   * 
   * - [`<code>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/code) 
   *   _Plain HTML `<code>` tag that holds the fragment
   *   code. Code tag is useful because it allows preformatted text as content._
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *  <webgl-canvas>
   *    <webgl-programs>
   *      <some-program>
   *        <vertex-shader>
   *          <code>
   *            <!--
   *              Write the vertex shader code for
   *              "some-program" here.
   *            -->
   *          </code>
   *        </vertex-shader>
   *        <fragment-shader>
   *          <code>
   *            #version 300 es
   *            precision highp float;
   *            out vec4 outColor;
   *            
   *            void main() {
   *              outColor = vec4(1, 0, 1, 1);
   *            }
   *          </code>
   *        </fragment-shader>
   *      </some-program>
   *    </webgl-programs>
   *  </webgl-canvas>
   * </shader-canvas>
   * ```
   * 
   * For a usable example check the
   * [1st example - simple triangle](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/1-triangle)
   * 
   * The `<fragment-shader>` tag is meant to be used as a child of the
   * [`<{{program-name}}>`](#CreateProgram) custom named tag.
   */
  static tag = "fragment-shader";
  /**
   * Simple wrapper for the `ShaderCode.loadShader()` method.
   * Sets the shader type as a FRAGMENT_SHADER
   */
  load(gl: WebGL2RenderingContext) {
    this.loadShader(gl, gl.FRAGMENT_SHADER);
  }
}
