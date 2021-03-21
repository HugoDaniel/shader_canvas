// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import {
  readQueryElement,
  readSrcAsJSON,
  SrcReader,
  trySrcReaders,
} from "../common/src_readers.ts";

/** 
 * This type is used to define the possible values that can go in the
 * <buffer-data> target attribute.
 * 
 * They follow the possible values for the `gl.bufferData`
 * [target argument](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData#parameters).
 */
export type BufferDataTarget =
  | "ARRAY_BUFFER"
  | "ELEMENT_ARRAY_BUFFER"
  | "COPY_READ_BUFFER"
  | "COPY_WRITE_BUFFER"
  | "TRANSFORM_FEEDBACK_BUFFER"
  | "UNIFORM_BUFFER"
  | "PIXEL_PACK_BUFFER"
  | "PIXEL_UNPACK_BUFFER";

/**
 * Helper function that reads any string and returns it if it is a valid
 * `BufferDataTarget` string.
 * 
 * If the string is not a valid `BufferDataTarget` the value `"ARRAY_BUFFER"` is
 * returned.
 */
function readBufferDataTarget(target: string | null): BufferDataTarget {
  switch (target) {
    case "ARRAY_BUFFER":
    case "ELEMENT_ARRAY_BUFFER":
    case "COPY_READ_BUFFER":
    case "COPY_WRITE_BUFFER":
    case "TRANSFORM_FEEDBACK_BUFFER":
    case "UNIFORM_BUFFER":
    case "PIXEL_PACK_BUFFER":
    case "PIXEL_UNPACK_BUFFER":
      return target;
    default:
      return "ARRAY_BUFFER";
  }
}

/** 
 * This type is used to define the possible values that can go in the
 * <buffer-data> usage attribute.
 * 
 * They follow the possible values for the `gl.bufferData`
 * [usage argument](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData#parameters).
 */
type BufferDataUsage =
  | "STATIC_DRAW"
  | "DYNAMIC_DRAW"
  | "STREAM_DRAW"
  | "STATIC_READ"
  | "DYNAMIC_READ"
  | "STREAM_READ"
  | "STATIC_COPY"
  | "DYNAMIC_COPY"
  | "STREAM_COPY";

/**
 * Helper function that reads any string and returns it if it is a valid
 * `BufferDataUsage` string.
 * 
 * If the string is not a valid `BufferDataUsage` the value `"STATIC_DRAW"` is
 * returned.
 */
function readBufferDataUsage(usage: string): BufferDataUsage {
  switch (usage) {
    case "STATIC_DRAW":
    case "DYNAMIC_DRAW":
    case "STREAM_DRAW":
    case "STATIC_READ":
    case "DYNAMIC_READ":
    case "STREAM_READ":
    case "STATIC_COPY":
    case "DYNAMIC_COPY":
    case "STREAM_COPY":
      return usage;
    default:
      return "STATIC_DRAW";
  }
}

/**
 * The type of data buffers supported.
 * Raw data must be able to be represented by one of these types.
 */
export type DataInputArray =
  | ArrayBuffer
  | SharedArrayBuffer
  | ArrayBufferView
  | number[];

/**
 * The BufferData class is a Web Component.
 * 
 * It is the equivalent of the WebGL `bufferData()` call.
 * It initializes and creates the buffer object's data store.
 * Data is fetched from the `src` attribute.
 */
export class BufferData extends globalThis.HTMLElement {
  /**
   * ## `<buffer-data>` {#BufferData}
   * 
   * This tag is the equivalent of the [WebGL `bufferData() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData).
   * It loads the data at the location set by the `src` attribute.
   * 
   * The data loaded is bounded to the buffer it has as parent. 
   * 
   * No child tags allowed in `<buffer-data>`.
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *  <webgl-canvas>
   *    <webgl-buffers>
   *      <super-huge-buffer>
   *        <buffer-data src="/mesh.json"></buffer-data>
   *        <!-- 
   *           loads the `mesh.json` file and sets it as
   *           the data for the `super-huge-buffer`
   *        -->
   *      </super-huge-buffer>
   *    </webgl-buffers>
   *  </webgl-canvas>
   * </shader-canvas>
   * ```
   * 
   * 
   * For a usable example check the
   * [1st example - simple triangle](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/1-triangle)
   * 
   * The `<buffer-data>` tag is meant to be used as a child of the
   * [`<{{buffer-name}}>`](#CreateBuffer) custom named tag.
   */
  static tag = "buffer-data";

  /** A reference to the Array that represents the raw data loaded */
  data: DataInputArray | null = null;
  /**
   * The buffer data target attribute that specifies the WebGL binding point.
   * 
   * This attribute allows the same values that the "target" parameter of the
   * [`gl.bufferData()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData#parameters)
   * function does: 
   * 
   * - `"ARRAY_BUFFER"` _(default)_
   * - `"ELEMENT_ARRAY_BUFFER"`
   * - `"COPY_READ_BUFFER"`
   * - `"COPY_WRITE_BUFFER"`
   * - `"TRANSFORM_FEEDBACK_BUFFER"`
   * - `"UNIFORM_BUFFER"`
   * - `"PIXEL_PACK_BUFFER"`
   * - `"PIXEL_UNPACK_BUFFER"`
   * 
   * **Example**
   * 
   * ```html
   * <buffer-data
   *    target="ELEMENT_ARRAY_BUFFER"
   *    src="data.json">
   * </buffer-data>
   * ```
   */
  get target(): BufferDataTarget {
    return readBufferDataTarget(this.getAttribute("target"));
  }
  /**
   * The buffer data `size` attribute sets the size in bytes of the WebGL 
   * buffer object's data store.
   * 
   * This attribute is a number.
   */
  get size(): number {
    return Number(this.getAttribute("size")) || 0;
  }
  /**
   * The buffer data "usage" attribute that specifies the WebGL intended usage
   * pattern of the data store for optimization purposes.
   * 
   * This attribute allows the same values that the "usage" parameter of the
   * [`gl.bufferData()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData#parameters)
   * function does: 
   * 
   * - `"STATIC_DRAW"` _(default)_
   * - `"DYNAMIC_DRAW"`
   * - `"STREAM_DRAW"`
   * - `"STATIC_READ"`
   * - `"DYNAMIC_READ"`
   * - `"STREAM_READ"`
   * - `"STATIC_COPY"`
   * - `"DYNAMIC_COPY"`
   * - `"STREAM_COPY"`
   */
  get usage(): BufferDataUsage {
    return readBufferDataUsage(this.getAttribute("usage") || "STATIC_DRAW");
  }
  /**
   * The buffer data "offset" attribute that sets the offset in bytes to where
   * the raw data starts.
   * 
   * This attribute is a number (defaults to 0).
   */
  get offset(): number {
    return Number(this.getAttribute("offset") || 0);
  }
  /**
   * This attribute is used to get the raw data from.
   * 
   * It can be a URL, a query selector, or a JSON array with the data.
   * 
   * If it is a query selector _`("#someId")`_, the element `textContent` will
   * be read and parsed as JSON.
   */
  get src(): string | null {
    return this.getAttribute("src");
  }

  get bytesPerItem(): number {
    return Number(this.getAttribute("bytesPerItem")) || 8;
  }

  /**
   * The length of the raw data in bytes (takes in consideration a possible
   * offset)
   **/
  length = 0;

  /**
   * The function to trigger the load of the data. It is created by the
   * `initialize()` function and defaults to a no-op.
   */
  load: ((buffer: WebGLBuffer, src?: string) => Promise<void>) = async () => {};
  /**
   * This function is used to read the `src` attribute and try to read it with 
   * the available supported readers.
   * 
   * It returns an empty array `[]` if the `src` attribute is not found or an
   * override is not provided.
   */
  private async readDataFromSrc(
    readers: SrcReader<DataInputArray>[],
    srcOverride?: string,
  ): Promise<DataInputArray> {
    // get the string value from the `src` attribute
    const src = srcOverride || this.src;
    if (!src) {
      console.error("Cannot find <buffer-data> source");
      return [];
    }
    // Try to read the src string with the supported readers.
    return await trySrcReaders(src, readers);
  }

  /** 
   * This function is the entry point of the logic for the BufferData class.
   * 
   * It is responsible to create the "load()" function to be called later.
   * 
   * The "load()" function created will set the number of bytes that were loaded
   * in this class "length" property.
   * 
   * The data loaded defaults to Float32 elements, except if the target is
   * "ELEMENT_ARRAY_BUFFER", in which case the data is made of Uint16 elements.
   */
  initialize(gl: WebGL2RenderingContext) {
    const target = gl[this.target];
    const usage = gl[this.usage];
    const src = this.src;
    this.load = async (buffer, srcOverride) => {
      if (src || srcOverride) {
        this.data = await this.readDataFromSrc(
          [readQueryElement, readSrcAsJSON],
          srcOverride,
        );
      } else if (
        this.target === "PIXEL_PACK_BUFFER" ||
        this.target === "PIXEL_UNPACK_BUFFER"
      ) {
        const s = this.size || gl.drawingBufferWidth * gl.drawingBufferHeight;
        switch (this.bytesPerItem) {
          case 1:
            this.data = new Uint8Array(s);
            break;
          case 2:
            this.data = new Uint16Array(s);
            break;
          default:
            this.data = new Uint32Array(s * 4);
        }
      }
      gl.bindBuffer(target, buffer);
      if (this.data) {
        let bytesPerItem = 8; // Assume 64 bit items by default
        if (Array.isArray(this.data)) {
          if (target !== gl.ELEMENT_ARRAY_BUFFER) {
            this.data = new Float32Array(this.data);
            bytesPerItem = (this.data as Float32Array).BYTES_PER_ELEMENT;
          } else {
            this.data = new Uint16Array(this.data);
            bytesPerItem = (this.data as Uint16Array).BYTES_PER_ELEMENT;
          }
        } else if (
          this.target === "PIXEL_PACK_BUFFER" ||
          this.target === "PIXEL_UNPACK_BUFFER"
        ) {
          bytesPerItem = (this.data as Uint32Array).BYTES_PER_ELEMENT;
        }
        // Useful to calculate the draw count when drawing this buffer as the
        // source of vertices
        this.length = Math.floor(this.data.byteLength / bytesPerItem);
        console.log("CREATED BUFFER", this.length, bytesPerItem);
        if (this.offset > 0 && isArrayBufferView(this.data)) {
          gl.bufferData(target, this.data, usage, this.offset);
          this.length = this.length - this.offset;
        } else {
          console.log("UPLOADING DATA ARRAY");
          gl.bufferData(target, this.data, usage);
        }
      } else {
        if (this.size) {
          this.length = this.size;
          gl.bufferData(target, this.size, usage);
        } else {
          // If srcdata is null, a data store is still created, but the content
          // is uninitialized and undefined.
          gl.bufferData(target, null, usage);
        }
      }
      // gl.bindBuffer(target, null);
    };
  }
}

/** Type guard to check if a given array is an ArrayBufferView */
function isArrayBufferView(
  data: ArrayBuffer | SharedArrayBuffer | ArrayBufferView | number[],
): data is ArrayBufferView {
  return "buffer" in data && "BYTES_PER_ELEMENT" in data;
}
