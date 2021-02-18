import {
  readQueryElement,
  readSrcAsJSON,
  SrcReader,
  trySrcReaders,
} from "../common/src_readers.ts";

export type BufferDataTarget =
  | "ARRAY_BUFFER"
  | "ELEMENT_ARRAY_BUFFER"
  | "COPY_READ_BUFFER"
  | "COPY_WRITE_BUFFER"
  | "TRANSFORM_FEEDBACK_BUFFER"
  | "UNIFORM_BUFFER"
  | "PIXEL_PACK_BUFFER"
  | "PIXEL_UNPACK_BUFFER";
function readBufferDataTarget(target: string): BufferDataTarget {
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
      console.warn(
"Unable to read a valid buffer-data target: %s \
          defaulting to ARRAY_BUFFER",
      );
      return "ARRAY_BUFFER";
  }
}

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
      console.warn(
"Unable to read a valid buffer-data usage: %s \
                          defaulting to STATIC_DRAW",
      );
      return "STATIC_DRAW";
  }
}

type DataInputArray =
  | ArrayBuffer
  | SharedArrayBuffer
  | ArrayBufferView
  | number[];

export class BufferData extends globalThis.HTMLElement {
  static tag = "buffer-data";
  data: DataInputArray | null = null;
  get target(): BufferDataTarget {
    return readBufferDataTarget(this.getAttribute("target") || "ARRAY_BUFFER");
  }
  set target(val: BufferDataTarget) {
    if (val) {
      this.setAttribute("target", readBufferDataTarget(val));
    } else {
      this.removeAttribute("target");
    }
  }
  get size(): number {
    return Number(this.getAttribute("size")) || 0;
  }
  set size(value: number) {
    this.setAttribute("size", String(value));
  }
  get usage(): BufferDataUsage {
    return readBufferDataUsage(this.getAttribute("usage") || "STATIC_DRAW");
  }
  set usage(val: BufferDataUsage) {
    if (val) {
      this.setAttribute("usage", readBufferDataUsage(val));
    } else {
      this.removeAttribute("usage");
    }
  }
  get offset(): number {
    return Number(this.getAttribute("offset") || 0);
  }
  set offset(val: number) {
    const offset = Number(val);
    if (isNaN(offset)) {
      console.warn("Invalid offset in buffer-data: must be a number");
      this.removeAttribute("offset");
    } else {
      this.setAttribute("offset", String(offset));
    }
  }
  get src(): string | null {
    return this.getAttribute("src");
  }
  set src(value: string | null) {
    if (value) {
      this.setAttribute("src", value);
    } else {
      this.removeAttribute("src");
    }
  }
  length = 0;

  load: ((buffer: WebGLBuffer, src?: string) => Promise<void>) = async () => {};
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
    return await trySrcReaders(src, readers);
  }

  // This function creates the "load()" function to be called later
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
      }
      gl.bindBuffer(target, buffer);
      if (this.data) {
        let bytesPerItem = 8; // Assume 64 bit items by default
        if (Array.isArray(this.data)) {
          if (target !== gl.ELEMENT_ARRAY_BUFFER) {
            this.data = new Float32Array(this.data);
            bytesPerItem = 4;
          } else {
            this.data = new Uint16Array(this.data);
            bytesPerItem = 2;
          }
        }
        // Useful to calculate the draw count when drawing this buffer as the
        // source of vertices
        this.length = Math.floor(this.data.byteLength / bytesPerItem);
        if (this.offset > 0 && isArrayBufferView(this.data)) {
          gl.bufferData(target, this.data, usage, this.offset);
          this.length = this.length - this.offset;
        } else {
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
      gl.bindBuffer(target, null);
    };
  }
}

function isArrayBufferView(
  data: ArrayBuffer | SharedArrayBuffer | ArrayBufferView | number[],
): data is ArrayBufferView {
  return "buffer" in data && "BYTES_PER_ELEMENT" in data;
}
