// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import type { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { CreateProgram } from "../webgl_programs/create_program.ts";

type UniformFunctionName =
  | "uniform1iv"
  | "uniform2iv"
  | "uniform3iv"
  | "uniform4iv"
  | "uniform1fv"
  | "uniform2fv"
  | "uniform3fv"
  | "uniform4fv";
/*
  | "uniform1i"
  | "uniform2i"
  | "uniform3i"
  | "uniform4i"
  | "uniform1f"
  | "uniform2f"
  | "uniform3f"
  | "uniform4f"
*/
/**
 * SetUniform is a Web Component that does the equivalent operations to the
 * `gl.uniform[1234][fi][v]()` WebGL functions.
 */
export class SetUniform extends globalThis.HTMLElement {
  get var(): string | null {
    return this.getAttribute("var");
  }
  get value(): string | null {
    return this.getAttribute("value");
  }
  get format(): string | null {
    return this.getAttribute("format");
  }

  name: UniformFunctionName = "uniform1fv";

  /**
   * The list of functions to execute when rendering.
   */
  drawCalls: (() => void)[] = [];

  initialize(
    gl: WebGL2RenderingContext,
    context: WebGLCanvasContext,
    program: CreateProgram,
  ) {
    // Read the "var" html attribute and keep a reference to it locally.
    const variable = this.var;
    if (!variable) {
      console.warn("<set-uniform>: no var attribute found");
      return;
    }
    // Read the "value" html attribute and keep a reference to it locally.
    const value = this.value;
    if (!value) {
      console.warn("<set-uniform>: no value attribute found");
      return;
    }
    let arrayValue: number[] = [];
    const parsedValue = JSON.parse(value);
    if (!(parsedValue instanceof Array)) {
      arrayValue.push(Number(parsedValue));
    } else {
      arrayValue = parsedValue.map(Number);
    }

    // Read the variable location, print an error if not found
    const location = program.uniformLocations.get(variable);
    this.drawCalls.push(() => {
      if (!location) {
        console.error(`<set-uniform>: Location for ${variable} not found`);
        return;
      }
      gl[this.name](location, arrayValue);
    });
  }
}

export class SetUniform1iv extends SetUniform {
  static tag = "uniform-1iv";
  name: UniformFunctionName = "uniform1iv";
}
export class SetUniform2iv extends SetUniform {
  static tag = "uniform-2iv";
  name: UniformFunctionName = "uniform2iv";
}
export class SetUniform3iv extends SetUniform {
  static tag = "uniform-3iv";
  name: UniformFunctionName = "uniform3iv";
}
export class SetUniform4iv extends SetUniform {
  static tag = "uniform-4iv";
  name: UniformFunctionName = "uniform4iv";
}
export class SetUniform1fv extends SetUniform {
  static tag = "uniform-1fv";
  name: UniformFunctionName = "uniform1fv";
}
export class SetUniform2fv extends SetUniform {
  static tag = "uniform-2fv";
  name: UniformFunctionName = "uniform2fv";
}
export class SetUniform3fv extends SetUniform {
  static tag = "uniform-3fv";
  name: UniformFunctionName = "uniform3fv";
}
export class SetUniform4fv extends SetUniform {
  static tag = "uniform-4fv";
  name: UniformFunctionName = "uniform4fv";
}

[
  SetUniform1iv,
  SetUniform2iv,
  SetUniform3iv,
  SetUniform4iv,
  SetUniform1fv,
  SetUniform2fv,
  SetUniform3fv,
  SetUniform4fv,
].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
