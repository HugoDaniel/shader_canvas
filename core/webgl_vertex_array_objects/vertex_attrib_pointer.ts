// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { ShaderLocations } from "../common/locations.ts";
import { nop } from "../common/nop.ts";

/** 
 * This type is used to define the possible values that can go in the
 * <vertex-attrib-pointer> `type` attribute.
 * 
 * They follow the possible values for the `gl.vertexAttribPointer`
 * [target argument](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer#parameters).
 */
type VertexAttribType =
  | "BYTE"
  | "SHORT"
  | "UNSIGNED_BYTE"
  | "UNSIGNED_SHORT"
  | "FLOAT"
  | "HALF_FLOAT";

function readVertexAttribType(value: string | null): VertexAttribType {
  switch (value) {
    case "BYTE":
    case "SHORT":
    case "UNSIGNED_BYTE":
    case "UNSIGNED_SHORT":
    case "FLOAT":
    case "HALF_FLOAT":
      return value;
    default:
      return "FLOAT";
  }
}

/** A type guard to check if a given value is a VertexAttribPointer class */
export function isVertexAttribPointer(
  value: unknown,
): value is VertexAttribPointer {
  return (typeof value === "object" && value !== null && "tagName" in value &&
    (value as unknown as { tagName: null | string })?.tagName?.toUpperCase() ===
      "VERTEX-ATTRIB-POINTER");
}

/**
 * The VertexAttribPointer class is a Web Component.
 * 
 * It provides the equivalent functionality of the `gl.vertexAttribPointer()`
 * function.
 */
export class VertexAttribPointer extends globalThis.HTMLElement {
  /**
   * ## `<vertex-attrib-pointer>` {#VertexAttribPointer}
   * 
   * This tag is the equivalent of the [WebGL `vertexAttribPointer() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer).
   * 
   * It specifies the layout of its parent buffer. It is used to map buffer
   * areas to variables.
   * 
   * No children are allowed in `<vertex-attrib-pointer>`.
   * 
   * For a usable example check the
   * [3rd example - animation](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/3-animation)
   * 
   * The `<vertex-attrib-pointer>` tag is meant to be used as a child of the
   * [`<bind-buffer>`](#BindBuffer) tag.
   */
  static tag = "vertex-attrib-pointer";

  /**
   * This function is a wrapper to the `gl.vertexAttribPointer()`, it is
   * created to avoid having arguments (arguments are read from the this
   * element attributes during initialization and set in the closure when this
   * function is created).
   * 
   * It defaults to a no-op until it is created in `initialize()`.
   */
  vertexAttribPointer: () => void = nop;
  /**
   * Keeps track of the GLSL location for the variable that is being pointed by
   * this Vertex Attrib Pointer.
   */
  location: number | undefined;
  /**
   * Reads the variable for this pointer and its GLSL location. Creates the
   * `this.vertexAttribPointer` function and calls it right away.
   */
  initialize(
    gl: WebGL2RenderingContext,
    locations: ShaderLocations = { attributes: new Map() },
  ) {
    const variable = this.variable;
    // Early return if there is no variable to point at.
    if (variable === "") return null;
    const location = locations.attributes.get(variable);
    // Print a warning if no valid location could be found for the variable.
    // This can happen if, for example, there is a typo in the variable name.
    if (location === undefined || location < 0) {
      console.warn(
        `<vertex-attrib-pointer> Unable to find variable ${variable} location`,
      );
      return;
    }
    // Read and setup the attributes from this tag
    this.location = location;
    const size = this.size;
    const type = gl[this.type];
    const normalized = this.normalized;
    const stride = this.stride;
    const offset = this.offset;
    // Create the wrapper for the `gl.vertexAttribPointer`. Its closure will
    // have the arguments available to be passed to the WebGL counterpart.
    this.vertexAttribPointer = () => {
      gl.enableVertexAttribArray(location);

      gl.vertexAttribPointer(
        location,
        size,
        type,
        normalized,
        stride,
        offset,
      );
    };
    // Call it right away.
    this.vertexAttribPointer();
  }
  /**
   * A string specifying the name of the variable that this data is going to be
   * placed at.
   */
  get variable(): string {
    return this.getAttribute("variable") || "";
  }
  set variable(name: string) {
    if (name) {
      this.setAttribute("variable", name);
    } else {
      console.warn("<vertex-attrib-pointer> needs a 'variable' attribute set");
      this.removeAttribute("variable");
    }
  }

  /**
   * A number specifying the number of components per vertex attribute.
   * Must be 1, 2, 3, or 4.
   **/
  get size(): number {
    return Number(this.getAttribute("size") || 4);
  }
  set size(val: number) {
    const size = Number(val);
    if (isNaN(size)) {
      console.warn("Invalid size in vertex-attrib-pointer: must be a number");
      this.removeAttribute("size");
    } else if (size <= 0 || size > 4) {
      console.warn("Invalid size in vertex-attrib-pointer: must be 1,2,3 or 4");
      this.removeAttribute("size");
    } else {
      this.setAttribute("size", String(size));
    }
  }

  /**
   * A string (GLenum) specifying the data type of each component in the array.
   * 
   * This attribute allows the same values that the `type` parameter of the
   * [`gl.vertexAttribPointer()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer#parameters)
   * function does: 
   * 
   * - `"BYTE"`
   * - `"SHORT"`
   * - `"UNSIGNED_BYTE"`
   * - `"UNSIGNED_SHORT"`
   * - `"FLOAT"` _(default)_
   * - `"HALF_FLOAT"`
   */
  get type(): VertexAttribType {
    return readVertexAttribType(this.getAttribute("type"));
  }
  set type(val: VertexAttribType) {
    if (val) {
      this.setAttribute("type", readVertexAttribType(val));
    } else {
      this.removeAttribute("type");
    }
  }

  /**
   * A GLintptr specifying an offset in bytes of the first component in the
   * vertex attribute array. Must be a multiple of the byte length of type.
   */
  get offset(): number {
    return Number(this.getAttribute("offset") || 0);
  }
  set offset(val: number) {
    const offset = Number(val);
    if (isNaN(offset)) {
      console.warn("Invalid offset in vertex-attrib-pointer: must be a number");
      this.removeAttribute("offset");
    } else {
      this.setAttribute("offset", String(offset));
    }
  }

  /**
   * A boolean specifying whether integer data values should be normalized
   * into a certain range when being cast to a float.
   *   - For types gl.BYTE and gl.SHORT, normalizes the values to [-1, 1] if
   *     true.
   *   - For types gl.UNSIGNED_BYTE and gl.UNSIGNED_SHORT, normalizes the
   *     values to [0, 1] if true.
   *   - For types gl.FLOAT and gl.HALF_FLOAT, this parameter has no effect.
   */
  get normalized(): boolean {
    return this.getAttribute("normalized") !== null;
  }
  set normalized(val: boolean) {
    if (val) {
      this.setAttribute("normalized", "");
    } else {
      this.removeAttribute("normalized");
    }
  }

  /**
   * A GLsizei specifying the offset in bytes between the beginning of
   * consecutive vertex attributes. Cannot be larger than 255. If stride is 0,
   * the attribute is assumed to be tightly packed, that is, the attributes are
   * not interleaved but each attribute is in a separate block, and the next
   * vertex' attribute follows immediately after the current vertex.
   */
  get stride(): number {
    return Number(this.getAttribute("stride") || 0); // 0 by default
  }
  set stride(val: number) {
    const stride = Number(val);
    if (isNaN(stride)) {
      console.warn("Invalid stride in vertex-attrib-pointer: must be a number");
      this.removeAttribute("stride");
    } else if (stride < 0 || stride > 255) {
      console.warn(
        "Invalid stride in vertex-attrib-pointer: must be between 0 and 255",
      );
      this.removeAttribute("stride");
    } else {
      this.setAttribute("stride", String(stride));
    }
  }
}
