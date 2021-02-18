import type { TextureTarget } from "./texture_target_type.ts";
import { readTextureTarget } from "./texture_target_type.ts";
import { nop } from "../common/nop.ts";

class TexParameter extends globalThis.HTMLElement {
  texParameterf: () => void = nop;
  texParameteri: () => void = nop;
  initialize(
    gl: WebGL2RenderingContext,
  ) {
    // Create the context for the `texParameter*` functions
    const target = gl[this.target];
    const pname = gl[this.pname];
    let param = this.param;
    if (typeof param === "string") {
      param = gl[param];
    }
    // Create the functions
    this.texParameterf = () => gl.texParameterf(target, pname, param as number);
    this.texParameteri = () => gl.texParameteri(target, pname, param as number);
  }

  /**
   * A string (GLenum) specifying the binding point (target)
   */
  get target(): TextureTarget {
    return readTextureTarget(this.getAttribute("target") || "TEXTURE_2D");
  }
  set target(name: TextureTarget) {
    if (name) {
      this.setAttribute("target", readTextureTarget(name));
    } else {
      this.setAttribute("target", "TEXTURE_2D");
    }
  }

  get pname(): TextureParameterName {
    return readParameterName(this.getAttribute("pname") || "TEXTURE_WRAP_S");
  }
  set pname(name: TextureParameterName) {
    if (name) {
      this.setAttribute("pname", readParameterName(name));
    } else {
      console.warn("<texture-parameter-*> a valid pname must be set");
      this.setAttribute("pname", "TEXTURE_WRAP_S");
    }
  }

  get param(): TextureParameter | number {
    return readParameter(this.pname, this.getAttribute("param"));
  }
  set param(value: TextureParameter | number) {
    if (typeof value === "string" || value >= 0) {
      this.setAttribute(
        "param",
        String(readParameter(this.pname, String(value))),
      );
    } else {
      console.warn("<texture-parameter-*> a valid 'param' must be set");
      this.setAttribute("param", "0");
    }
  }
}

type TextureParameterName =
  | "TEXTURE_MAG_FILTER"
  | "TEXTURE_MIN_FILTER"
  | "TEXTURE_WRAP_S"
  | "TEXTURE_WRAP_T"
  | "TEXTURE_BASE_LEVEL"
  | "TEXTURE_COMPARE_FUNC"
  | "TEXTURE_COMPARE_MODE"
  | "TEXTURE_MAX_LEVEL"
  | "TEXTURE_MAX_LOD"
  | "TEXTURE_MIN_LOD"
  | "TEXTURE_WRAP_R";

function readParameterName(value: string): TextureParameterName {
  switch (value) {
    case "TEXTURE_MAG_FILTER":
    case "TEXTURE_MIN_FILTER":
    case "TEXTURE_WRAP_S":
    case "TEXTURE_WRAP_T":
    case "TEXTURE_BASE_LEVEL":
    case "TEXTURE_COMPARE_FUNC":
    case "TEXTURE_COMPARE_MODE":
    case "TEXTURE_MAX_LEVEL":
    case "TEXTURE_MAX_LOD":
    case "TEXTURE_MIN_LOD":
    case "TEXTURE_WRAP_R":
      return value;
    default:
      console.warn("Invalid texture parameter name", value);
      return "TEXTURE_MAG_FILTER";
  }
}

type TextureParameter =
  | "LINEAR"
  | "NEAREST"
  | "NEAREST_MIPMAP_NEAREST"
  | "LINEAR_MIPMAP_NEAREST"
  | "NEAREST_MIPMAP_LINEAR"
  | "LINEAR_MIPMAP_LINEAR"
  | "REPEAT"
  | "CLAMP_TO_EDGE"
  | "MIRRORED_REPEAT"
  | "LEQUAL"
  | "GEQUAL"
  | "LESS"
  | "GREATER"
  | "EQUAL"
  | "NOTEQUAL"
  | "ALWAYS"
  | "NEVER"
  | "NONE"
  | "COMPARE_REF_TO_TEXTURE";

function isValidMagFilter(value: string): value is TextureParameter {
  return value === "LINEAR" || value === "NEAREST";
}

function isValidMinFilter(value: string): value is TextureParameter {
  return value === "LINEAR" || value === "NEAREST" ||
    value === "NEAREST_MIPMAP_NEAREST" ||
    value === "LINEAR_MIPMAP_NEAREST" ||
    value === "NEAREST_MIPMAP_LINEAR" ||
    value === "LINEAR_MIPMAP_LINEAR";
}

function isValidWrap(value: string): value is TextureParameter {
  return (
    value === "REPEAT" ||
    value === "CLAMP_TO_EDGE" ||
    value === "MIRRORED_REPEAT"
  );
}

function isValidCompareFunc(value: string): value is TextureParameter {
  return (
    value === "LEQUAL" ||
    value === "GEQUAL" ||
    value === "LESS" ||
    value === "GREATER" ||
    value === "EQUAL" ||
    value === "NOTEQUAL" ||
    value === "ALWAYS" ||
    value === "NEVER"
  );
}

function isValidCompareMode(value: string): value is TextureParameter {
  return (
    value === "NONE" || value === "COMPARE_REF_TO_TEXTURE"
  );
}

function readParameter(
  name: TextureParameterName,
  value: string | null,
): TextureParameter | number {
  if (value === null) {
    console.warn("<tex-parameter-*> parameter value cannot be null");
    return 0;
  }
  switch (name) {
    case "TEXTURE_MAG_FILTER":
      if (isValidMagFilter(value)) return value;
      else return "LINEAR";
    case "TEXTURE_MIN_FILTER":
      if (isValidMinFilter(value)) return value;
      else return "NEAREST_MIPMAP_LINEAR";
    case "TEXTURE_WRAP_S":
    case "TEXTURE_WRAP_T":
    case "TEXTURE_WRAP_R":
      if (isValidWrap(value)) return value;
      else return "REPEAT";
    case "TEXTURE_COMPARE_FUNC":
      if (isValidCompareFunc(value)) return value;
      else return "LEQUAL";
    case "TEXTURE_COMPARE_MODE":
      if (isValidCompareMode(value)) return value;
      else return "NONE";
    // INT:
    case "TEXTURE_BASE_LEVEL":
    case "TEXTURE_MAX_LEVEL":
      if (isNaN(Number(value))) return 0;
      else return Math.round(Number(value));
    // FLOAT:
    case "TEXTURE_MAX_LOD":
    case "TEXTURE_MIN_LOD":
      if (isNaN(Number(value))) return 0;
      else return Number(value);
    default:
      console.warn(
        "<tex-parameter-*>: No valid target found for name, setting 0",
      );
      return 0;
  }
}

export class TexParameterI extends TexParameter {
  static tag = "tex-parameter-i";
  get texParameter() {
    return this.texParameteri;
  }
}
export class TexParameterF extends TexParameter {
  static tag = "tex-parameter-f";
  get texParameter() {
    return this.texParameterf;
  }
}
