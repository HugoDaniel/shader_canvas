// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { nop } from "../common/nop.ts";

/**
 * DrawBuffers is a Web Component for a tag that represents the equivalent
 * operation of the `gl.drawBuffers()` function.
 */
export class DrawBuffers extends globalThis.HTMLElement {
  /**
   * ## `<draw-buffers>` {#DrawBuffers}
   * 
   * This tag is the equivalent of the [WebGL `drawBuffers() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/drawBuffers).
   * 
   * It defines draw buffers to which fragment colors are written into.
   * The draw buffer settings are part of the state of the currently bound
   * framebuffer or the drawingbuffer if no framebuffer is bound. 
   * 
   * No child tags allowed in `<draw-buffers>`.
   * 
   * The `<draw-buffers>` tag is meant to be used as a child of the
   * [`<draw-calls>`](#DrawCalls) list of actions.
   */
  static tag = "draw-buffers";

  /**
   * A string with a JSON array of the buffers into which fragment colors
   * will be written.
   * 
   * Possible values that the array can hold are:
   * 
   * - `"NONE"` _(default)_
   * - `"BACK"` 
   * - `"COLOR_ATTACHMENT{0-15}"`
   * 
   * `JSON.parse` is run on the "buffers" attribute. Set it as:
   * 
   * `<draw-buffers buffers=["COLOR_ATTACHMENT0","COLOR_ATTACHMENT1"]>`
   * 
   */
  get buffers(): Buffers[] {
    const parsed = JSON.parse(this.getAttribute("buffers") || "[]");
    return parsed.map(readBuffers);
  }
  /**
   * The function to call when rendering, defaults to a no-op and is created
   * in `initialize()`.
   */
  drawBuffers: () => void = nop;
  /**
   * Reads the DOM mode attribute and creates the `drawBuffers` closure.
   */
  initialize(gl: WebGL2RenderingContext) {
    const buffers = this.buffers.map((b) => gl[b]);
    this.drawBuffers = () => {
      gl.drawBuffers(buffers);
    };
  }
}

/** 
 * This type is used to define the possible values that can go in the
 * <draw-buffers> "buffers" array attribute.
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
