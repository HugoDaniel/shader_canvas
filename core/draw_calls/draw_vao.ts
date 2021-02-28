import { nop } from "../common/nop.ts";
import { CreateVertexArray } from "../webgl_vertex_array_objects/create_vertex_array.ts";
import type { WebGLCanvasContext } from "../webgl_canvas/context.ts";

/**
 * DrawVAO is a Web Component that does the equivalent operations to the
 * `gl.drawArrays()` and `gl.drawElements()` WebGL functions.
 */
export class DrawVAO extends globalThis.HTMLElement {
  /**
   * ## `<draw-vao>` {#DrawVAO}
   * 
   * This tag is equivalent to either the [`gl.drawElements()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements)
   * or the [`gl.drawArrays()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays)
   * functions.
   * 
   * It searches for the Vertex Array Object specified by the `src` attribute
   * and calls `gl.drawElements` if it has an element array buffer, or 
   * `gl.drawArrays` otherwise.
   * 
   * The number of items to draw can be specified in the "count" attribute,
   * but these also get calculated automatically by the vertex array buffer 
   * specifications.
   * 
   * No allowed child tags.
   * 
   * The `<draw-vao>` tag is meant to be used within the
   * [`<draw-calls>`](#DrawCalls) list of actions.
   */
  static tag = "draw-vao";
  /**
   * A string that references a vertex array object name.
   * 
   * This must be the name of a tag available in the
   * `<webgl-vertex-array-objects>` container.
   */
  get src(): string | null {
    return this.getAttribute("src");
  }

  /**
   * A string that specifies the type primitive to render. 
   * 
   * Possible values are:
   *
   * - `"POINTS"`
   * - `"LINE_STRIP"`
   * - `"LINE_LOOP"`
   * - `"LINES"`
   * - `"TRIANGLE_STRIP"`
   * - `"TRIANGLE_FAN"`
   * - `"TRIANGLES"` _(default)_
   */
  get mode(): VAOMode {
    return readVaoMode(this.getAttribute("mode"));
  }
  /**
   * The number of elements to draw.
   * 
   * This number is automatically calculated from the vertex array object
   * properties, but you can specify it to override how you see fit.
   */
  set count(value: number) {
    if (value) {
      this.setAttribute("count", `${value}`);
    }
  }
  get count(): number {
    return Number(
      this.getAttribute("count"),
    );
  }
  /**
   * A number specifying a byte offset in the element array buffer. Must be a
   * valid multiple of the size of the given type.
   */
  get offset(): number {
    return Number(this.getAttribute("offset"));
  }

  /**
   * A number specifying the starting index in the array of vector points.
   */
  get first(): number {
    return Number(this.getAttribute("first"));
  }
  /**
   * A string specifying the type of the values in the element array buffer.
   * 
   * Possible values are:
   * 
   * - `"UNSIGNED_BYTE"` _(default)_
   * - `"UNSIGNED_SHORT"`
   */
  get type(): VAOType {
    return readVAOType(this.getAttribute("type"));
  }

  /**
   * The class instance of the referenced vertex array tag in
   * `<webgl-vertex-array-objects>`
   * 
   * Defaults to `undefined` until it gets created in the `initialize()` method
   */
  vao: CreateVertexArray | undefined;
  /**
   * The function to call when rendering, defaults to a no-op and is created
   * in `initialize()`.
   */
  drawVao: () => void = nop;

  /**
   * Gets the Vertex Array specified by the `src` attribute from the
   * `<webgl-vertex-array-objects>` collection.
   * 
   * It creates the `drawVao` function by
   * deciding if it should use the `gl.drawElements` or the `gl.drawArrays` 
   * function, and calculating the number of elements to draw.
   */
  initialize(gl: WebGL2RenderingContext, context: WebGLCanvasContext) {
    // look for <webgl-vertex-array-objects>
    const src = this.src;
    if (!src) {
      console.warn("<draw-vao>: no src attribute found");
      return;
    }
    this.vao = context.vaos.content.get(src);
    if (!this.vao) {
      console.warn(`<draw-vao>: unable to find program named <${src}>`);
      return;
    }
    // get the reference to the function that binds this vertex array object
    // used at the start of the `drawVao` function to set the target of the
    // `gl.drawElements` or `gl.drawArrays`.
    const bindVao = this.vao.bindVAO;
    // Keep a local copy of the dom attributes of this tag.
    // This way during rendering there is no need to read the DOM, because the
    // arguments values are set here within the closure context.
    const mode = gl[this.mode];
    // Calculate the number of elements to draw
    let count = this.count;
    if (count === 0) {
      count = this.vao.location0Count || readTargetMinCount(this.mode);
      // Update the DOM with the calculated number:
      this.count = count;
    }
    const type = gl[this.type];
    const offset = this.offset;
    const first = this.first;
    if (this.vao.hasElementArrayBuffer) {
      this.drawVao = () => {
        bindVao();
        gl.drawElements(mode, count, type, offset);
      };
    } else {
      this.drawVao = () => {
        bindVao();
        gl.drawArrays(mode, first, count);
      };
    }
  }
}

/** 
 * This type is used to define the possible values that can go in the
 * <draw-vao> "mode" attribute.
 * 
 * They follow the possible values for the `gl.drawVAO`
 * [mode parameter](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays#parameters).
 */
type VAOMode =
  | "POINTS"
  | "LINE_STRIP"
  | "LINE_LOOP"
  | "LINES"
  | "TRIANGLE_STRIP"
  | "TRIANGLE_FAN"
  | "TRIANGLES";

/**
 * Helper function that reads any string and returns it if it is a valid
 * `VAOMode` string.
 * 
 * If the string is not a valid `VAOMode` the value `"TRIANGLES"` is
 * returned.
 */
function readVaoMode(value: string | null): VAOMode {
  if (!value) return "TRIANGLES";
  switch (value) {
    case "POINTS":
    case "LINE_STRIP":
    case "LINE_LOOP":
    case "LINES":
    case "TRIANGLE_STRIP":
    case "TRIANGLE_FAN":
    case "TRIANGLES":
      return value;
    default:
      return "TRIANGLES";
  }
}

/**
 * Returns the minimum array length for each drawing mode target.
 * 
 * Defaults to 0 if an invalid/unknown mode is passed as argument.
 */
function readTargetMinCount(t: VAOMode): number {
  console.warn("<draw-vao>: count attribute not set, using the minimum count");
  switch (t) {
    case "POINTS":
      return 1;
    case "LINE_STRIP":
    case "LINE_LOOP":
    case "LINES":
      return 2;
    case "TRIANGLE_STRIP":
    case "TRIANGLE_FAN":
    case "TRIANGLES":
      return 3;
    default:
      return 0;
  }
}
/** 
 * This type is used to define the possible values that can go in the
 * <draw-vao> "type" attribute.
 * 
 * They follow the possible values for the `gl.drawVAO`
 * [type parameter](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays#parameters).
 */
type VAOType = "UNSIGNED_BYTE" | "UNSIGNED_SHORT";
/**
 * Helper function that reads any string and returns it if it is a valid
 * `VAOType` string.
 * 
 * Returns `"UNSIGNED_BYTE"` by default.
 */
function readVAOType(value: string | null): VAOType {
  if (value === "UNSIGNED_SHORT") return value;

  return "UNSIGNED_BYTE";
}
