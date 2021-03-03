// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import type { TextureTarget } from "../webgl_textures/texture_target_type.ts";
import { readTextureTarget } from "../webgl_textures/texture_target_type.ts";
import { nop } from "../common/nop.ts";

/**
 * This class defines the common functionality between the TexParameter* 
 * classes.
 * 
 * It is a Web Component, and it is intended to be extended from.
 * 
 * It is the counterpart to the WebGL `gl.texParameter[fi]()` functions.
 */
class TexParameter extends globalThis.HTMLElement {
  /**
   * Keep both possible versions of parameters, the child classes will chose
   * which one to use.
   * 
   * They default to a no-op and get created in the `initialize()` function.
   */
  texParameterf: () => void = nop;
  texParameteri: () => void = nop;

  /**
   * Initialization of this class is where the functions `texParameter[fi]`
   * are created.
   * 
   * The tag parameters are read and a closure is made to allow these functions
   * to be called without arguments.
   */
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

  set target(name: TextureTarget) {
    if (name) {
      this.setAttribute("target", readTextureTarget(name));
    } else {
      this.setAttribute("target", "TEXTURE_2D");
    }
  }

  set pname(name: TextureParameterName) {
    if (name) {
      this.setAttribute("pname", readParameterName(name));
    } else {
      console.warn("<texture-parameter-*> a valid pname must be set");
      this.setAttribute("pname", "TEXTURE_WRAP_S");
    }
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

/**
 * Type guard that checks if a string is a Mag filter TextureParameter.
 */
function isValidMagFilter(value: string): value is TextureParameter {
  return value === "LINEAR" || value === "NEAREST";
}

/** Type guard that checks if a string is a Min filter TextureParameter */
function isValidMinFilter(value: string): value is TextureParameter {
  return value === "LINEAR" || value === "NEAREST" ||
    value === "NEAREST_MIPMAP_NEAREST" ||
    value === "LINEAR_MIPMAP_NEAREST" ||
    value === "NEAREST_MIPMAP_LINEAR" ||
    value === "LINEAR_MIPMAP_LINEAR";
}

/** 
 * Type guard that checks if a string is a valid texture wrap TextureParameter
 */
function isValidWrap(value: string): value is TextureParameter {
  return (
    value === "REPEAT" ||
    value === "CLAMP_TO_EDGE" ||
    value === "MIRRORED_REPEAT"
  );
}

/**
 * Type guard that checks if a string is a valid comparison function
 * TextureParameter.
 */
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

/**
 * Type guard that checks if a string is a valid texture comparison mode.
 */
function isValidCompareMode(value: string): value is TextureParameter {
  return (
    value === "NONE" || value === "COMPARE_REF_TO_TEXTURE"
  );
}

/**
 * Reading a parameter and validating it needs some logic added because some
 * values are only accepted with certain TextureParameterName's.
 */
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
  /**
   * ## `<tex-parameter-i>` {#TexParameterI}
   * 
   * This tag is the equivalent of the [WebGL `texParameteri() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter).
   * 
   * It sets the parameters for the current active texture set by the
   * [`<active-texture>`](#ActiveTexture) tag.
   * 
   * No child tags allowed in `<tex-parameter-i>`.
   * 
   * The `<tex-parameter-i>` tag is meant to be used as a child of the
   * [`<active-texture>`](#ActiveTexture) custom named tag.
   */
  static tag = "tex-parameter-i";
  /**
   * Returns the gl function for this tag. Not intended to be used as a 
   * tag attribute.
   */
  get texParameter() {
    return this.texParameteri;
  }

  /**
   * A string (GLenum) specifying the binding point (target)
   */
  get target(): TextureTarget {
    return readTextureTarget(this.getAttribute("target") || "TEXTURE_2D");
  }
  /**
   * The parameter name. Can be any valid `TextureParameterName`.
   */
  get pname(): TextureParameterName {
    return readParameterName(this.getAttribute("pname") || "TEXTURE_WRAP_S");
  }
  /**
   * The parameter value. Can be any valid `TextureParameter`.
   */
  get param(): TextureParameter | number {
    return readParameter(this.pname, this.getAttribute("param"));
  }
}
export class TexParameterF extends TexParameter {
  /**
   * ## `<tex-parameter-f>` {#TexParameterF}
   * 
   * This tag is the equivalent of the [WebGL `texParameteri() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter).
   * 
   * It sets the parameters for the current active texture set by the
   * [`<active-texture>`](#ActiveTexture) tag.
   * 
   * No child tags allowed in `<tex-parameter-f>`.
   * 
   * The `<tex-parameter-f>` tag is meant to be used as a child of the
   * [`<active-texture>`](#ActiveTexture) custom named tag.
   */
  static tag = "tex-parameter-f";
  /**
   * Returns the gl function for this tag. Not intended to be used as a 
   * tag attribute.
   */
  get texParameter() {
    return this.texParameterf;
  }
  /**
   * A string (GLenum) specifying the binding point (target)
   */
  get target(): TextureTarget {
    return readTextureTarget(this.getAttribute("target") || "TEXTURE_2D");
  }
  /**
   * The parameter name. Can be any valid `TextureParameterName`.
   */
  get pname(): TextureParameterName {
    return readParameterName(this.getAttribute("pname") || "TEXTURE_WRAP_S");
  }
  /**
   * The parameter value. Can be any valid `TextureParameter`.
   */
  get param(): TextureParameter | number {
    return readParameter(this.pname, this.getAttribute("param"));
  }
}
