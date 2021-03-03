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

  /** 
   * Looks for all `<code>` tags and returns the `textContent` from the first
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

  /**
   * Creates the WebGL Shader and sets the shader source to be the string
   * contents of the "code" attribute.
   * 
   * Updates the "shader" attribute with the created WebGLShader id.
   */
  protected loadShader(gl: WebGL2RenderingContext, type: number) {
    const shader = gl.createShader(type);
    if (!shader) {
      throw new Error("Unable to create a GL Shader");
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
