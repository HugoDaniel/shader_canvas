import { FragmentShader, VertexShader } from "./shaders.ts";
import {
  GLSLVariable,
  isInputVariable,
  isOutputVariable,
  isSamplerVariable,
} from "https://deno.land/x/glsl_variables@v1.0.2/parser.ts";
import { CanHaveModules } from "../new_modules/create_module.ts";
import { Payload } from "../new_modules/payload.ts";

export class CreateProgram extends CanHaveModules {
  name: string = this.tagName.toLocaleLowerCase();
  vertexShader: VertexShader | undefined;
  fragmentShader: FragmentShader | undefined;
  vertexCode: string | undefined;
  fragmentCode: string | undefined;
  program: WebGLProgram | undefined | null;
  log: string | undefined;
  uniformLocations: Map<string, WebGLUniformLocation> = new Map();
  private readShaders = () => {
    const vertexShader = this.querySelector(VertexShader.tag);
    const fragmentShader = this.querySelector(FragmentShader.tag);
    if (!vertexShader) {
      console.error(`No <vertex-shader> found in ${this.tagName}`);
    }
    if (!fragmentShader) {
      console.error(`No <fragment-shader> found in ${this.tagName}`);
    }
    this.vertexShader = vertexShader as VertexShader;
    this.fragmentShader = fragmentShader as FragmentShader;
  };
  /**
   * Returns all valid input variables.
   * Vertex shader outputs are removed from the Fragment shader inputs.
   */
  private inputs = () => {
    if (!this.vertexShader || !this.fragmentShader) {
      throw new Error(
        "Shaders must be available to be able to read their inputs",
      );
    }
    // It works by merging the vertex and fragment shader variables in a single
    // array, and then processing all inputs from the shader variable and
    const variables = [
      ...this.vertexShader.variables,
      ...this.fragmentShader.variables,
    ];
    const result = [];
    const outs: string[] = [];
    for (let i = 0; i < variables.length; i++) {
      const v = variables[i];
      if (isOutputVariable(v)) {
        outs.push(v.name);
      } else if (isInputVariable(v) && !outs.includes(v.name)) {
        result.push(v);
      }
    }
    return result;
  };

  get textures(): GLSLVariable[] {
    if (!this.fragmentShader) return [];
    return this.fragmentShader.variables.filter(isSamplerVariable);
  }
  initialize(
    payloads: Payload[] = [],
  ) {
    this.applyPayloads({
      payloads,
      payloadChildFilter: (c) => c.nodeName === "WEBGL-PROGRAM-PART",
    });
    this.readShaders();
    this.vertexShader?.initialize();
    this.fragmentShader?.initialize();
  }

  load(gl: WebGL2RenderingContext) {
    this.vertexShader?.load(gl);
    this.fragmentShader?.load(gl);
  }
  compile(gl: WebGL2RenderingContext) {
    this.vertexShader?.compile(gl);
    this.fragmentShader?.compile(gl);
  }
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
  link(gl: WebGL2RenderingContext) {
    const program = this.program;
    if (!program) {
      throw new Error("Shader program failed compilation in " + this.tagName);
    }
    gl.linkProgram(program);
  }
  statusCheck(gl: WebGL2RenderingContext) {
    if (!this.program) {
      throw new Error("Status: Program was not created " + this.tagName);
    }
    this.log = gl.getProgramInfoLog(this.program) ||
      "Status: Nothing to report";
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      gl.deleteProgram(this.program);
      throw new Error(
        "Status: Program was not linked " + this.tagName + "; Log: " + this.log,
      );
    }
  }
  bindLocations(
    gl: WebGL2RenderingContext,
    attribLocations: Readonly<Map<string, number>>,
  ) {
    if (!this.program || !this.vertexShader) {
      throw new Error(
        "Not enough data to locate attributes for program " + this.tagName,
      );
    }
    for (const variable of this.vertexShader.variables) {
      let location = attribLocations.get(variable.name);
      if (!location && variable.layout) {
        // Layout was set at the variable
        const [key, value] = variable.layout.split("=");
        const numberValue = Number(value);
        if (key === "location" && !isNaN(numberValue)) {
          location = numberValue;
        }
      }
      // Bind the vertex attributes ("in" variables)
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

    // Validate attribute locations
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

  updateLocations(
    gl: WebGL2RenderingContext,
    attribLocations: Map<string, number> = new Map(),
  ) {
    if (!this.program) {
      throw new Error("Shader Program failed compilation");
    }

    // Get vertex attribute locations for this program
    for (const variable of this.inputs()) {
      if (variable.qualifier === "in") {
        const location = gl.getAttribLocation(this.program, variable.name);
        if (location === undefined || location < 0) {
          console.warn(
            `Unable to find "${variable.name}" in program ${this.tagName}\n\
                * Besides being declared, is it being used by the shader?\n`,
          );
        } else if (!attribLocations.has(variable.name)) {
          attribLocations.set(variable.name, location);
        }
      }
    }
    return attribLocations;
  }
  updateUniformLocations(
    gl: WebGL2RenderingContext,
  ) {
    if (!this.program) {
      throw new Error("Shader Program failed compilation");
    }

    // Get uniform locations for this program
    for (const variable of this.inputs()) {
      if (variable.qualifier === "uniform") {
        const location = gl.getUniformLocation(this.program, variable.name);
        if (!location) {
          console.warn(
            `Unable to find "${variable.name}" in program ${this.tagName}\n\
              * Besides being declared, is it being used by the shader?`,
          );
        } else {
          this.uniformLocations.set(variable.name, location);
        }
      }
    }
  }
}
