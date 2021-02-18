import { ShaderLocations } from "../common/locations.ts";
import { nop } from "../common/nop.ts";
type VertexAttribType =
  | "BYTE"
  | "SHORT"
  | "UNSIGNED_BYTE"
  | "UNSIGNED_SHORT"
  | "FLOAT"
  | "HALF_FLOAT";

function readVertexAttribType(value: string): VertexAttribType {
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

export function isVertexAttribPointer(
  value: unknown,
): value is VertexAttribPointer {
  return (typeof value === "object" && value !== null && "tagName" in value &&
    (value as unknown as { tagName: null | string })?.tagName?.toUpperCase() ===
      "VERTEX-ATTRIB-POINTER");
}
export class VertexAttribPointer extends globalThis.HTMLElement {
  static tag = "vertex-attrib-pointer";
  vertexAttribPointer: () => void = nop;
  location: number | undefined;
  initialize(
    gl: WebGL2RenderingContext,
    locations: ShaderLocations = { attributes: new Map() },
  ) {
    const variable = this.variable;
    if (variable === "") return null;
    const location = locations.attributes.get(variable);
    if (location === undefined || location < 0) {
      console.warn(
        `<vertex-attrib-pointer> Unable to find variable ${variable} location`,
      );
      return;
    }
    this.location = location;
    // create the function to call and call it
    const size = this.size;
    const type = gl[this.type];
    const normalized = this.normalized;
    const stride = this.stride;
    const offset = this.offset;
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
    this.vertexAttribPointer();
  }
  /**
   * A string (GLenum) specifying the data type of each component in the array
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
   * A string (GLenum) specifying the data type of each component in the array
   */
  get type(): VertexAttribType {
    return readVertexAttribType(this.getAttribute("type") || "FLOAT");
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
   * A GLboolean specifying whether integer data values should be normalized
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
