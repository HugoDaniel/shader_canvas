import { FragmentShader, VertexShader } from "./shaders.ts";
import {
  GLSLVariable,
  isInputVariable,
  isOutputVariable,
  isSamplerVariable,
} from "https://deno.land/x/glsl_variables@v1.0.2/parser.ts";
import { CanHaveModules } from "../new_modules/create_module.ts";
import { Payload } from "../new_modules/payload.ts";

/**
 * The CreateProgram class is intended to be used to create custom tags
 * for the children of the WebGLPrograms container.
 * 
 * Every Shader Canvas program is an instance of this class. It provides
 * methods to load, compile, link and validate a WebGL Program. It also has
 * a couple of helper methods to deal with Program variables. 
 * 
 * This class extends "CanHaveModules" because modules can be set inside it
 * to extend the contents it has (like add variables or provide
 * functionality that is common to other programs).
 */
export class CreateProgram extends CanHaveModules {
  /**
   * ## `<{{program-name}}>` {#CreateProgram}
   * 
   * The tag name is set by you when declaring a program. Use the tag name
   * to represent the program name. This name is then used to reference this
   * program in other Shader Canvas containers and parts.
   * 
   * The allowed children of a program are:
   * 
   * - [`<vertex-shader>`](#VertexShader) _WebGL Vertex Shader code_
   * - [`<fragment-shader>`](#FragmentShader) _WebGL Fragment Shader code_
   * - Any module tag defined inside the Shader Canvas
   *   [`<new-modules>`](#NewModules) tag
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *  <webgl-canvas>
   *    <webgl-programs>
   *      <!--
   *        Create your WebGL programs here by specifying a
   *        tag name that identifies them, and place inside
   *        it the vertex and fragment code
   *      -->
   *      <here-is-a-cool-program>
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
   *              Write the fragment shader code for the
   *              "here-is-a-cool-program" here.
   *            -->
   *          </code>
   *        </fragment-shader>
   *      </here-is-a-cool-program>
   *    </webgl-programs>
   *  </webgl-canvas>
   * </shader-canvas>
   * ```
   * 
   * For a usable example check the
   * [1st example - simple triangle](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/1-triangle)
   * 
   * This custom named tag is meant to be used as a child of the
   * [`<webgl-programs>`](#WebGLPrograms) container tag.
   */
  static tag = "{{user defined}}";
  // ^ This static "tag" is not used, it is here to trigger the documentation
  /**
   * The program name is the name set as the tagName. This is defined by the
   * user when declaring programs as children of the <webgl-programs> container.
   */
  name: string = this.tagName.toLocaleLowerCase();
  /**
   * Vertex Shader and Fragment Shader node classes,
   * They hold the final shader code and are responsible for most shader
   * GL actions, like loading and compiling the shader.
   */
  vertexShader: VertexShader | undefined;
  fragmentShader: FragmentShader | undefined;
  /**
   * The program GL id, this is used to bind the program in the WebGL state
   * before performing the actions that relate to it.  
   */
  program: WebGLProgram | undefined | null;
  /**
   * Program information log, a string that holds the result of calling
   * `gl.getProgramInfoLog()`. This function is called right after the program
   * is finished being initialized.
   */
  log: string | undefined;
  /**
   * A Map that relates the uniform variable name with its WebGL location in
   * this program.
   * 
   * Uniform locations are kept per program (as opposed to the vertex attributes
   * that are global and share their locations between programs).
   */
  uniformLocations: Map<string, WebGLUniformLocation> = new Map();

  /**
   * This function gets the <vertex-shader> and <fragment-shader> nodes from
   * the DOM and places a reference to their class instance in the attributes
   * "this.vertexShader" and "this.fragmentShader".
   * 
   * These are helper references, to avoid having to read the DOM every time
   * that work needs to be done on their class instances.
   * 
   * It leaves the "vertexShader" and "fragmentShader" attributes as undefined
   * if they don't have the correct class instance. Which can happen if their
   * tag names have not yet been registered at the customElements at this point. 
   */
  private readShaders = () => {
    // Query the DOM for the tags
    const vertexShader = this.querySelector(VertexShader.tag);
    const fragmentShader = this.querySelector(FragmentShader.tag);

    // Write an error if the tags are not found, these are not hard errors,
    // just log information. This function does not trigger an exception if
    // they are not found - this happens after.
    if (!vertexShader) {
      console.error(`No <vertex-shader> found in ${this.tagName}`);
    }
    if (!fragmentShader) {
      console.error(`No <fragment-shader> found in ${this.tagName}`);
    }
    // Make sure they are instances of the correct classes. Don't make the
    // assignment and leave them undefined if not.
    if (vertexShader instanceof VertexShader) {
      this.vertexShader = vertexShader;
    }
    if (fragmentShader instanceof FragmentShader) {
      this.fragmentShader = fragmentShader;
    }
  };

  /**
   * Returns all valid input variables.
   * Vertex shader outputs are removed from the Fragment shader inputs.
   * 
   * This function uses the GLSL variable parser helper functions (imported at
   * the top of this module) to differentiate between input and output
   * variables.
   */
  private inputs = () => {
    // Early exit if there are no vertex and no fragment shaders
    if (!this.vertexShader || !this.fragmentShader) {
      throw new Error(
        `Program ${this.name} has no shaders available to read their inputs`,
      );
    }
    // It works by merging the vertex and fragment shader variables in a single
    // array, and then processing all inputs from the shader variable and
    const variables = [
      ...this.vertexShader.variables,
      ...this.fragmentShader.variables,
    ];
    // The final array that this function returns, this will hold all
    // input variables found.
    const result = [];
    const outs: string[] = [];
    // Run through the merged variables array
    for (let i = 0; i < variables.length; i++) {
      const v = variables[i];
      // Mark output variables so they can be excluded from consideration.
      // This function only cares about inputs that are not passed from
      // the vertex to the fragment shader.
      if (isOutputVariable(v)) {
        outs.push(v.name);
      } else if (isInputVariable(v) && !outs.includes(v.name)) {
        // This is a valid variable, it is an input variable and is not
        // an output variable.
        result.push(v);
      }
    }
    return result;
  };

  /**
   * This function looks for the Sampler* variables in the fragment shader.
   * It returns an array with all of these variables.
   * This is useful so that the textures declared can build their draw function
   * at initialization time, fetching the corresponding location for their
   * variable and creating their drawing call already with this information.
   */
  allTextureVariables(): GLSLVariable[] {
    // Early return if the fragmentShader is undefined
    if (!this.fragmentShader) return [];
    // Uses the isSamplerVariable helper function from the GLSL parser.
    return this.fragmentShader.variables.filter(isSamplerVariable);
  }

  /**
   * This is where the Program logic starts.
   * Initializing a program consists in checking if it has any modules, read
   * these modules payloads and merge them to the program, and then
   * read the final shader code (vertex and fragment) and keep a reference for
   * its string.
   * 
   * No compilation or shader loading is done here. There are helper methods for
   * these actions, and they are meant to be used by the parent initialize
   * function at a proper moment.
   * 
   * Avoiding doing program compilation and linking here allows the Shader
   * Canvas to explore parallel compilation and linking by making the
   * compile calls for all the programs at once in WebGLPrograms.  
   */
  initialize(
    payloads: Payload[] = [],
  ) {
    // Merge this program modules payloads.
    this.applyPayloads({
      payloads,
      // If there are any modules, then look for their "<webgl-program-part>"
      // tag contents. This is the part of the module that will be merged here.
      // If a module has no such part then nothing is done/merged even if it
      // is being declared as a child of this program.
      payloadChildFilter: (c) => c.nodeName === "WEBGL-PROGRAM-PART",
    });

    // Query the DOM for the shader tags (<vertex-shader> and <fragment-shader>)
    this.readShaders();
    // Read their final code string and parse it.
    this.vertexShader?.initialize();
    this.fragmentShader?.initialize();
  }

  /**
   * Loads the shaders, this function creates the shaders and calls
   * `gl.shaderSource` with their code.
   **/
  load(gl: WebGL2RenderingContext) {
    this.vertexShader?.load(gl);
    this.fragmentShader?.load(gl);
  }
  /** Compiles shaders, this calls `gl.compileShader` */
  compile(gl: WebGL2RenderingContext) {
    console.log("COMPILING", this.vertexShader?.code);
    this.vertexShader?.compile(gl);
    this.fragmentShader?.compile(gl);
  }
  /**
   * This function creates the WebGLProgram.
   * It calls `gl.createProgram()` and then attaches the shaders to it.
   */
  createProgram(gl: WebGL2RenderingContext) {
    this.program = gl.createProgram();
    if (!this.program) {
      throw new Error(`Unable to create a program in ${this.tagName}`);
    }
    if (!this.vertexShader?.shader || !this.fragmentShader?.shader) {
      throw new Error(`No shaders found for program ${this.tagName}`);
    }
    gl.attachShader(this.program, this.vertexShader.shader);
    gl.attachShader(this.program, this.fragmentShader.shader);
  }

  /**
   * Links this WebGLProgram. Completing the process of preparing the GPU
   * code for the program's fragment and vertex shaders.
   */
  link(gl: WebGL2RenderingContext) {
    const program = this.program;
    if (!program) {
      throw new Error("Shader program failed compilation in " + this.tagName);
    }
    gl.linkProgram(program);
  }

  /**
   * Checks if the program was properly created and linked.
   * 
   * Places the info log in the "log" attribute of this class.
   * 
   * Deletes the program if errors are found.
   */
  statusCheck(gl: WebGL2RenderingContext) {
    // Early return if the program is null or undefined
    if (!this.program) {
      throw new Error("Status: Program was not created " + this.tagName);
    }
    // Read the program information log, this is shown bellow if a linking
    // error is found.
    this.log = gl.getProgramInfoLog(this.program) ||
      "Status: Nothing to report";
    // Checks the LINK_STATUS, it returns false if the linking failed.
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      gl.deleteProgram(this.program);
      throw new Error(
        "Status: Program was not linked " + this.tagName + "; Log: " + this.log,
      );
    }
  }

  /**
   * This function calls `gl.bindAttribLocation` to set the pre-established 
   * location for any vertex attributes that this program might have.
   * 
   * It receives the `attribLocations` Map that holds the locations for all
   * known vertex attributes at this point in time.
   * 
   * This function is used to try to keep the same locations at the same
   * variable names between programs. This allows for Vertex Array Objects
   * to be swapped easily between programs.
   */
  bindLocations(
    gl: WebGL2RenderingContext,
    attribLocations: Readonly<Map<string, number>>,
  ) {
    // Abort all execution if there is no program compiled (should not happen).
    // In order to bind the vertex attribute variables a vertex shader must be
    // present.
    if (!this.program || !this.vertexShader) {
      throw new Error(
        "Not enough data to locate attributes for program " + this.tagName,
      );
    }
    // Go through all the parsed vertex variables and check if they already
    // have a location set in the global attribLocations Map.
    // If they do, then bind the variables in this program to it.
    for (const variable of this.vertexShader.variables) {
      let location = attribLocations.get(variable.name);
      if (!location && variable.layout) {
        // Layout was set at the variable in the GLSL code
        // Bind the variable to this intended value (only happens if it does
        // not have a location in the `attribLocations` Map).
        const [key, value] = variable.layout.split("=");
        const numberValue = Number(value);
        if (key === "location" && !isNaN(numberValue)) {
          location = numberValue;
        }
      }
      // Bind the vertex attributes ("in" variables) to the location found
      if (
        location !== undefined && location >= 0 && variable.qualifier === "in"
      ) {
        gl.bindAttribLocation(
          this.program,
          location as number,
          variable.name,
        );
      }
    }
  }

  /**
   * This function only verifies if the locations were set at their intended
   * locations.
   * 
   * It prints an error if a variable was not located.
   * 
   * It does not change the attribLocations Map.
   */
  verifyLocations(
    gl: WebGL2RenderingContext,
    attribLocations: Readonly<Map<string, number>> = new Map(),
  ) {
    if (!this.program) {
      throw new Error("Shader Program failed compilation");
    }

    // Validate attribute locations, for each attribute entry get its location
    // number and check if it matches the location on the Map from the
    // function argument.
    for (const [name, desiredLocation] of attribLocations.entries()) {
      const location = gl.getAttribLocation(this.program, name);
      if (location === -1) {
        console.warn(
          `Unable to verify ${name} in Shader Program\n\
                  Besides being declared, is it being used by the shader?`,
        );
      } else if (location !== desiredLocation) {
        console.warn(
          `Location ${name} could not bet set to the desired value.`,
          `It is set to location ${location} when the intended was \
            ${desiredLocation}.`,
        );
      }
    }
  }

  /**
   * This functions reads each vertex attribute location of this program
   * and puts it in the attribute locations Map `attribLocations` provided as
   * argument.
   * 
   * If the location already exists, it is assume that its location remains
   * the same (this means that multiple programs must share the same locations
   * for each vertex attribute).
   * 
   * The `attribLocations` Map is changed. This is not a pure function.
   */
  updateLocations(
    gl: WebGL2RenderingContext,
    attribLocations: Map<string, number> = new Map(),
  ) {
    // Early return, ensures that program is not null throughout the execution
    // of this function
    if (!this.program) {
      throw new Error("Shader Program failed compilation");
    }

    // Get vertex attribute locations for this program
    for (const variable of this.inputs()) {
      // Only consider variables that are vertex attributes
      if (variable.qualifier === "in") {
        // Read the location for the variable
        const location = gl.getAttribLocation(this.program, variable.name);
        if (location === undefined || location < 0) {
          console.warn(
            `Unable to find "${variable.name}" in program ${this.tagName}\n\
                * Besides being declared, is it being used by the shader?\n`,
          );
        } else if (!attribLocations.has(variable.name)) {
          // Add the location to the variable name if it is not set
          attribLocations.set(variable.name, location);
        }
      }
    }
    // Returns the updated Map.
    return attribLocations;
  }

  /**
   * This functions updates and fills this program `uniformLocations` Map.
   * 
   * The `uniformLocations` Map is an association kept at each program that
   * relates a uniform variable to its bound location.
   * 
   * It uses the variables parsed from the code and present at  
   */
  updateUniformLocations(
    gl: WebGL2RenderingContext,
  ) {
    // Abort all execution if a program was not compiled
    if (!this.program) {
      throw new Error(`Shader Program ${this.name} failed compilation`);
    }

    // Get uniform locations for this program
    for (const variable of this.inputs()) {
      if (variable.qualifier === "uniform") {
        const location = gl.getUniformLocation(this.program, variable.name);
        if (!location) {
          // Unused variables will have no location. This is ok, but a warning
          // is shown about it to allow shader code to be optimized.
          console.warn(
            `Unable to find "${variable.name}" in program ${this.tagName}\n\
              * Besides being declared, is it being used by the shader?`,
          );
        } else {
          // A location was found, add it to the uniform locations Map of this
          // program.
          this.uniformLocations.set(variable.name, location);
        }
      }
    }
  }
}
