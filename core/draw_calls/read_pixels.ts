import { WebGLBuffers } from "../webgl_buffers/webgl_buffers.ts";
import { nop } from "../common/nop.ts";

export class ReadPixels extends globalThis.HTMLElement {
  static tag = "read-pixels";

  get x(): number {
    return Number(this.getAttribute("x"));
  }

  get y(): number {
    return Number(this.getAttribute("y"));
  }

  get offset(): number {
    return Number(this.getAttribute("offset"));
  }

  /**
   * The width of the pixels to read. Defaults to canvas size.
   */
  get width(): number {
    return Number(this.getAttribute("width"));
  }
  /**
   * The height of the pixels to read. Defaults to canvas size.
   */
  get height(): number {
    return Number(this.getAttribute("height"));
  }

  get format(): PixelDataFormat {
    return readPixelDataFormat(this.getAttribute("format"));
  }

  get type(): PixelDataType {
    return readPixelDataType(this.getAttribute("type"));
  }

  get dest(): string | null {
    return this.getAttribute("dest");
  }

  isDrawingBlocked = false;

  getPixels: (dest: ArrayBufferView) => Promise<ArrayBufferView> = (id) =>
    Promise.reject(`"readPixels()" is undefined`);

  readPixels: () => void = nop;
  /**
   * Creates a "readPixels" function to be used in <draw-calls>.
   * 
   * This function always writes to the bound PIXEL_PACK_BUFFER. No other
   * options are provided due to the spec constraints described at
   * https://www.khronos.org/registry/webgl/specs/latest/2.0/#3.7.10
   * 
   * If the "dest" attribute is present, that buffer is used instead of the
   * current bound buffer.
   */
  initialize(gl: WebGL2RenderingContext, buffers: WebGLBuffers) {
    const x = this.x;
    const y = this.y;
    const w = this.width || gl.drawingBufferWidth;
    const h = this.height || gl.drawingBufferHeight;
    const format = gl[this.format];
    const type = gl[this.type];
    const offset = this.offset;
    const dest = this.dest;

    let bindPixelBuffer = () => 0;
    if (dest) {
      const buffer = buffers.content.get(dest);
      if (!buffer || !buffer.buffer) {
        console.warn(`Could not find the buffer "${dest}" in <draw-pixels>.`);
        return;
      }
      bindPixelBuffer = buffer.bindBuffer;
    }

    this.readPixels = () => {
      if (this.readAllowed) {
        bindPixelBuffer();
        gl.readPixels(x, y, w, h, format, type, offset);
      }
    };

    // Create the fence
    this.getPixels = async (dest) => {
      this.readAllowed = true;
      await waitFrame();
      this.readAllowed = false;
      this.isDrawingBlocked = true;
      await fence(gl, () => {
        gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, dest, 0);
        this.isDrawingBlocked = false;
      });
      return dest;
    };
  }
  readAllowed = false;
}

type PixelDataType =
  | "UNSIGNED_BYTE"
  | "UNSIGNED_SHORT_5_6_5"
  | "UNSIGNED_SHORT_4_4_4_4"
  | "UNSIGNED_SHORT_5_5_5_1"
  | "FLOAT"
  | "BYTE"
  | "UNSIGNED_INT_2_10_10_10_REV"
  | "HALF_FLOAT"
  | "SHORT"
  | "UNSIGNED_SHORT"
  | "INT"
  | "UNSIGNED_INT"
  | "UNSIGNED_INT_10F_11F_11F_REV"
  | "UNSIGNED_INT_5_9_9_9_REV";

function readPixelDataType(t: string | null) {
  switch (t) {
    case "UNSIGNED_BYTE":
    case "UNSIGNED_SHORT_5_6_5":
    case "UNSIGNED_SHORT_4_4_4_4":
    case "UNSIGNED_SHORT_5_5_5_1":
    case "FLOAT":
    case "BYTE":
    case "UNSIGNED_INT_2_10_10_10_REV":
    case "HALF_FLOAT":
    case "SHORT":
    case "UNSIGNED_SHORT":
    case "INT":
    case "UNSIGNED_INT":
    case "UNSIGNED_INT_10F_11F_11F_REV":
    case "UNSIGNED_INT_5_9_9_9_REV":
      return t;
    default:
      return "UNSIGNED_BYTE";
  }
}

type PixelDataFormat =
  | "ALPHA"
  | "RGB"
  | "RGBA"
  | "RED"
  | "RG"
  | "RED_INTEGER"
  | "RG_INTEGER"
  | "RGB_INTEGER"
  | "RGBA_INTEGER";

function readPixelDataFormat(t: string | null) {
  switch (t) {
    case "ALPHA":
    case "RGB":
    case "RGBA":
    case "RED":
    case "RG":
    case "RED_INTEGER":
    case "RG_INTEGER":
    case "RGB_INTEGER":
    case "RGBA_INTEGER":
      return t;
    default:
      return "RGBA";
  }
}

async function fence<T>(gl: WebGL2RenderingContext, action: () => T) {
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  if (!sync) return;
  gl.flush();
  for (let i = 0; i < 6; i++) {
    await waitFrame();
    const syncStatus = gl.clientWaitSync(sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0);
    if (
      syncStatus === gl.ALREADY_SIGNALED ||
      syncStatus === gl.CONDITION_SATISFIED
    ) {
      break;
    }
  }
  gl.deleteSync(sync);
  return action();
}

function waitFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(resolve);
    // setTimeout(resolve, 1);
  });
}
