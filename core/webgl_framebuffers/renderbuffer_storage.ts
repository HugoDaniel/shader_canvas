export class RenderbufferStorage extends globalThis.HTMLElement {
  static tag = "renderbuffer-storage";

  get format(): RenderbufferInternalFormat {
    return readRenderbufferInternalFormat(this.getAttribute("format"));
  }
  /**
   * The width of the renderbuffer.
   * 
   * This attribute is a number.
   */
  get width(): number {
    return Number(this.getAttribute("width"));
  }
  /**
   * The height of the renderbuffer.
   * 
   * This attribute is a number.
   */
  get height(): number {
    return Number(this.getAttribute("height"));
  }

  /** Sets the render buffer format and dimensions */
  initialize(gl: WebGL2RenderingContext) {
    if (!gl.getExtension("EXT_color_buffer_float")) {
      console.error("Color Buffer Float not supported");
    }
    const w = this.width || gl.drawingBufferWidth;
    const h = this.height || gl.drawingBufferHeight;
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl[this.format],
      w,
      h,
    );
  }
}

export type RenderbufferInternalFormat =
  | "RGBA4"
  | "RGB565"
  | "RGB5_A1"
  | "DEPTH_COMPONENT16"
  | "STENCIL_INDEX8"
  | "DEPTH_STENCIL"
  | "R8"
  | "R8UI"
  | "R8I"
  | "R16UI"
  | "R16I"
  | "R32UI"
  | "R32I"
  | "RG8"
  | "RG8UI"
  | "RG8I"
  | "RG16UI"
  | "RG16I"
  | "RG32UI"
  | "RG32I"
  | "RGB8"
  | "RGBA8"
  | "SRGB8_ALPHA8"
  | "RGB10_A2"
  | "RGBA8UI"
  | "RGBA8I"
  | "RGB10_A2UI"
  | "RGBA16UI"
  | "RGBA16I"
  | "RGBA32I"
  | "RGBA32UI"
  | "DEPTH_COMPONENT24"
  | "DEPTH_COMPONENT32F"
  | "DEPTH24_STENCIL8"
  | "DEPTH32F_STENCIL8"
  | "R16F"
  | "RG16F"
  | "RGBA16F"
  | "R32F"
  | "RG32F"
  | "RGBA32F"
  | "R11F_G11F_B10F";

function readRenderbufferInternalFormat(
  format: string | null,
): RenderbufferInternalFormat {
  switch (format) {
    case "RGBA4":
    case "RGB565":
    case "RGB5_A1":
    case "DEPTH_COMPONENT16":
    case "STENCIL_INDEX8":
    case "DEPTH_STENCIL":
    case "R8":
    case "R8UI":
    case "R8I":
    case "R16UI":
    case "R16I":
    case "R32UI":
    case "R32I":
    case "RG8":
    case "RG8UI":
    case "RG8I":
    case "RG16UI":
    case "RG16I":
    case "RG32UI":
    case "RG32I":
    case "RGB8":
    case "RGBA8":
    case "SRGB8_ALPHA8":
    case "RGB10_A2":
    case "RGBA8UI":
    case "RGBA8I":
    case "RGB10_A2UI":
    case "RGBA16UI":
    case "RGBA16I":
    case "RGBA32I":
    case "RGBA32UI":
    case "DEPTH_COMPONENT24":
    case "DEPTH_COMPONENT32F":
    case "DEPTH24_STENCIL8":
    case "DEPTH32F_STENCIL8":
    case "R16F":
    case "RG16F":
    case "RGBA16F":
    case "R32F":
    case "RG32F":
    case "RGBA32F":
    case "R11F_G11F_B10F":
      return format;
    default:
      return "RGBA8";
  }
}
