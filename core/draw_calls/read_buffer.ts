// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { nop } from "../common/nop.ts";

export class ReadBuffer extends globalThis.HTMLElement {
  static tag = "read-buffer";
  get src(): Buffers {
    return readBuffers(this.getAttribute("src"));
  }
  /**
   * The function to call when rendering, defaults to a no-op and is created
   * in `initialize()`.
   */
  readBuffer: () => void = nop;
  /**
    * Reads the DOM mode attribute and creates the `drawBuffers` closure.
    */
  initialize(gl: WebGL2RenderingContext) {
    const buffer = gl[this.src];
    this.readBuffer = () => {
      gl.readBuffer(buffer);
    };
  }
}

/** 
 * This type is used to define the possible values that can go in the
 * <read-buffer> "src" attribute.
 * 
 * They follow the possible values for the `gl.drawBuffers`
 * [buffer parameter](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/drawBuffers#parameters).
 */
type Buffers =
  | "NONE"
  | "BACK"
  | "COLOR_ATTACHMENT0"
  | "COLOR_ATTACHMENT1"
  | "COLOR_ATTACHMENT2"
  | "COLOR_ATTACHMENT3"
  | "COLOR_ATTACHMENT4"
  | "COLOR_ATTACHMENT5"
  | "COLOR_ATTACHMENT6"
  | "COLOR_ATTACHMENT7"
  | "COLOR_ATTACHMENT8"
  | "COLOR_ATTACHMENT9"
  | "COLOR_ATTACHMENT10"
  | "COLOR_ATTACHMENT11"
  | "COLOR_ATTACHMENT12"
  | "COLOR_ATTACHMENT13"
  | "COLOR_ATTACHMENT14"
  | "COLOR_ATTACHMENT15";
/**
 * Helper function that reads any string and returns it if it is a valid
 * `Buffer` string.
 * 
 * If the string is not a valid `Buffer` the value `"NONE"` is
 * returned.
 */
function readBuffers(attrib: string | null): Buffers {
  switch (attrib) {
    case "BACK":
    case "COLOR_ATTACHMENT0":
    case "COLOR_ATTACHMENT1":
    case "COLOR_ATTACHMENT2":
    case "COLOR_ATTACHMENT3":
    case "COLOR_ATTACHMENT4":
    case "COLOR_ATTACHMENT5":
    case "COLOR_ATTACHMENT6":
    case "COLOR_ATTACHMENT7":
    case "COLOR_ATTACHMENT8":
    case "COLOR_ATTACHMENT9":
    case "COLOR_ATTACHMENT10":
    case "COLOR_ATTACHMENT11":
    case "COLOR_ATTACHMENT12":
    case "COLOR_ATTACHMENT13":
    case "COLOR_ATTACHMENT14":
    case "COLOR_ATTACHMENT15":
      return attrib;
    default:
      return "NONE";
  }
}
