import {
  readImageDataFromQuery,
  trySrcReaders,
} from "../common/src_readers.ts";
import type { ImageDataInput, SrcReader } from "../common/src_readers.ts";
import type { TextureTarget } from "./texture_target_type.ts";
import { readTextureTarget } from "./texture_target_type.ts";

type TextureFormat =
  | "RGBA"
  | "RGB"
  | "LUMINANCE_ALPHA"
  | "LUMINANCE"
  | "ALPHA"
  | "DEPTH_COMPONENT"
  | "DEPTH_STENCIL"
  | "R8"
  | "R8_SNORM"
  | "RG8"
  | "RG8_SNORM"
  | "RGB8"
  | "RGB8_SNORM"
  | "RGB565"
  | "RGBA4"
  | "RGB5_A1"
  | "RGBA8"
  | "RGBA8_SNORM"
  | "RGB10_A2"
  | "RGB10_A2UI"
  | "SRGB8"
  | "SRGB8_ALPHA8"
  | "R16F"
  | "RG16F"
  | "RGB16F"
  | "RGBA16F"
  | "R32F"
  | "RG32F"
  | "RGB32F"
  | "RGBA32F"
  | "R11F_G11F_B10F"
  | "RGB9_E5"
  | "R8I"
  | "R8UI"
  | "R16I"
  | "R16UI"
  | "R32I"
  | "R32UI"
  | "RG8I"
  | "RG8UI"
  | "RG16I"
  | "RG16UI"
  | "RG32I"
  | "RG32UI"
  | "RGB8I"
  | "RGB8UI"
  | "RGB16I"
  | "RGB16UI"
  | "RGB32I"
  | "RGB32UI"
  | "RGBA8I"
  | "RGBA8UI"
  | "RGBA16I"
  | "RGBA16UI"
  | "RGBA32I"
  | "RGBA32UI";

type TextureType =
  | "BYTE"
  | "UNSIGNED_SHORT"
  | "SHORT"
  | "UNSIGNED_INT"
  | "INT"
  | "HALF_FLOAT"
  | "FLOAT"
  | "UNSIGNED_INT_2_10_10_10_REV"
  | "UNSIGNED_INT_10F_11F_11F_REV"
  | "UNSIGNED_INT_5_9_9_9_REV"
  | "UNSIGNED_INT_24_8"
  | "FLOAT_32_UNSIGNED_INT_24_8_REV"
  // 8 bits per channel for gl.RGBA:
  | "UNSIGNED_BYTE"
  // 5 red bits, 6 green bits, 5 blue bits.
  | "UNSIGNED_SHORT_5_6_5"
  // 4 red bits, 4 green bits, 4 blue bits, 4 alpha bits.
  | "UNSIGNED_SHORT_4_4_4_4"
  // 5 red bits, 5 green bits, 5 blue bits, 1 alpha bit.
  | "UNSIGNED_SHORT_5_5_5_1";

export class TexImage2D extends globalThis.HTMLElement {
  static tag = "tex-image-2d";
  get width(): number {
    return Number(this.getAttribute("width"));
  }
  get height(): number {
    return Number(this.getAttribute("height"));
  }
  get level(): number {
    return Number(this.getAttribute("level"));
  }
  get target(): TextureTarget {
    return readTextureTarget(this.getAttribute("target") || "TEXTURE_2D");
  }
  get internalFormat(): TextureFormat {
    return readTextureFormat(this.getAttribute("internalFormat") || "RGBA");
  }
  get format(): TextureFormat {
    return readTextureFormat(this.getAttribute("format") || "RGBA");
  }
  get type(): TextureType {
    return readTextureType(this.getAttribute("type") || "UNSIGNED_BYTE");
  }
  get src(): string | null {
    return this.getAttribute("src");
  }

  data: ImageDataInput | undefined;

  private async readDataFromSrc(
    readers: SrcReader<ImageDataInput>[],
    srcOverride?: string,
  ): Promise<ImageDataInput> {
    // get the string value from the `src` attribute
    const src = srcOverride || this.src;
    if (!src) {
      console.error("Cannot find <tex-image-2d> source");
      return new globalThis.ImageData(0, 0);
    }
    const result = await trySrcReaders(src, readers);
    if (Array.isArray(result)) {
      return new globalThis.ImageData(0, 0);
    }
    return result;
  }

  load: ((texture: WebGLTexture, src?: string) => Promise<void>) =
    async () => {};
  initialize(gl: WebGL2RenderingContext) {
    // Read the attributes from the DOM
    const width = this.width;
    const height = this.height;
    const level = this.level;
    const target = this.target;
    const internalFormat = this.internalFormat;
    const format = this.format;
    const type = this.type;
    const src = this.src;
    // Create the load function
    this.load = async (texture, srcOverride) => {
      if (src || srcOverride) {
        this.data = await this.readDataFromSrc(
          [readImageDataFromQuery],
          srcOverride ? srcOverride : src || srcOverride,
        );
        gl.bindTexture(gl[target], texture);
        if (width > 0 && height > 0) {
          gl.texImage2D(
            gl[target],
            level,
            gl[internalFormat],
            width,
            height,
            0,
            gl[format],
            gl[type],
            this.data,
          );
        } else {
          gl.texImage2D(
            gl[target],
            level,
            gl[internalFormat],
            gl[format],
            gl[type],
            this.data,
          );
        }
        gl.bindTexture(gl[target], null);
      }
    };
  }
}

function readTextureFormat(format: string): TextureFormat {
  switch (format) {
    case "RGBA":
    case "RGB":
    case "LUMINANCE_ALPHA":
    case "LUMINANCE":
    case "ALPHA":
    case "DEPTH_COMPONENT":
    case "DEPTH_STENCIL":
    case "R8":
    case "R8_SNORM":
    case "RG8":
    case "RG8_SNORM":
    case "RGB8":
    case "RGB8_SNORM":
    case "RGB565":
    case "RGBA4":
    case "RGB5_A1":
    case "RGBA8":
    case "RGBA8_SNORM":
    case "RGB10_A2":
    case "RGB10_A2UI":
    case "SRGB8":
    case "SRGB8_ALPHA8":
    case "R16F":
    case "RG16F":
    case "RGB16F":
    case "RGBA16F":
    case "R32F":
    case "RG32F":
    case "RGB32F":
    case "RGBA32F":
    case "R11F_G11F_B10F":
    case "RGB9_E5":
    case "R8I":
    case "R8UI":
    case "R16I":
    case "R16UI":
    case "R32I":
    case "R32UI":
    case "RG8I":
    case "RG8UI":
    case "RG16I":
    case "RG16UI":
    case "RG32I":
    case "RG32UI":
    case "RGB8I":
    case "RGB8UI":
    case "RGB16I":
    case "RGB16UI":
    case "RGB32I":
    case "RGB32UI":
    case "RGBA8I":
    case "RGBA8UI":
    case "RGBA16I":
    case "RGBA16UI":
    case "RGBA32I":
    case "RGBA32UI":
      return format;
    default:
      return "RGBA";
  }
}

function readTextureType(value: string): TextureType {
  switch (value) {
    case "BYTE":
    case "UNSIGNED_SHORT":
    case "UNSIGNED_INT":
    case "SHORT":
    case "INT":
    case "HALF_FLOAT":
    case "FLOAT":
    case "UNSIGNED_INT_2_10_10_10_REV":
    case "UNSIGNED_INT_10F_11F_11F_REV":
    case "UNSIGNED_INT_5_9_9_9_REV":
    case "UNSIGNED_INT_24_8":
    case "FLOAT_32_UNSIGNED_INT_24_8_REV":
    case "UNSIGNED_BYTE":
    case "UNSIGNED_SHORT_5_6_5":
    case "UNSIGNED_SHORT_4_4_4_4":
    case "UNSIGNED_SHORT_5_5_5_1":
      return value;
    default:
      return "UNSIGNED_BYTE";
  }
}
