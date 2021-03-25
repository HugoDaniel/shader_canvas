// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
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
  /**
   * ## `<tex-image-2d>` {#TexImage2D}
   * 
   * This tag is the equivalent of the [WebGL `texImage2D() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D).
   * 
   * It sets the 2D image data to be used in the texture being declared and how
   * it should be processed.
   * 
   * No child tags allowed in `<tex-image-2d>`.
   * 
   * **Example**
   * 
   * ```html
   * <shader-canvas>
   *   <webgl-canvas>
   *     <webgl-textures>
   *       <such-an-awesome-image>
   *         <tex-image-2d src="#texture"></tex-image-2d>
   *       </such-an-awesome-image>
   *    </textures>
   *   </webgl-canvas>
   *   <img id="texture" src="awesome-texture.png">
   * </shader-canvas>
   * ```
   * 
   * For a usable example check the
   * [2nd example - texture quad](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/2-textured-quad)
   * 
   * 
   * The `<tex-image-2d>` tag is meant to be used as a child of the
   * [`<{{texture-name}}>`](#CreateTexture) custom named tag.
   */
  static tag = "tex-image-2d";

  /**
   * The width of the texture.
   * 
   * This attribute is a number.
   */
  get width(): number {
    return Number(this.getAttribute("width"));
  }
  set width(w: number) {
    this.setAttribute("width", String(w));
  }

  /**
   * The height of the texture.
   * 
   * This attribute is a number.
   */
  get height(): number {
    return Number(this.getAttribute("height"));
  }
  set height(h: number) {
    this.setAttribute("height", String(h));
  }

  /**
   * Specifies the level of detail that this texture data is for.
   * Level 0 is the base image level and level n is the nth mipmap reduction
   * level.
   * 
   * This attribute is a number.
   */
  get level(): number {
    return Number(this.getAttribute("level"));
  }
  /**
   * The WebGL binding point for this texture.
   * 
   * This attribute allows the same values that the "target" parameter of the
   * [`gl.texImage2D()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D#parameters)
   * function does: 
   * 
   * - `"TEXTURE_2D"` _(default)_
   * - `"TEXTURE_CUBE_MAP_POSITIVE_X"`
   * - `"TEXTURE_CUBE_MAP_NEGATIVE_X"`
   * - `"TEXTURE_CUBE_MAP_POSITIVE_Y"`
   * - `"TEXTURE_CUBE_MAP_NEGATIVE_Y"`
   * - `"TEXTURE_CUBE_MAP_POSITIVE_Z"`
   * - `"TEXTURE_CUBE_MAP_NEGATIVE_Z"`
   */
  get target(): TextureTarget {
    return readTextureTarget(this.getAttribute("target") || "TEXTURE_2D");
  }
  /**
   * Specifies the color components in the texture.
   * 
   * This attribute allows the same values that the "internalFormat" parameter of
   * the [`gl.texImage2D()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D#parameters)
   * function does (and the same as the "format" attribute):
   * 
   * - `"RGBA"` _(default)_
   * - `"RGB"`
   * - `"LUMINANCE_ALPHA"`
   * - `"LUMINANCE"`
   * - `"ALPHA"`
   * - `"DEPTH_COMPONENT"`
   * - `"DEPTH_STENCIL"`
   * - `"R8"`
   * - `"R8_SNORM"`
   * - `"RG8"`
   * - `"RG8_SNORM"`
   * - `"RGB8"`
   * - `"RGB8_SNORM"`
   * - `"RGB565"`
   * - `"RGBA4"`
   * - `"RGB5_A1"`
   * - `"RGBA8"`
   * - `"RGBA8_SNORM"`
   * - `"RGB10_A2"`
   * - `"RGB10_A2UI"`
   * - `"SRGB8"`
   * - `"SRGB8_ALPHA8"`
   * - `"R16F"`
   * - `"RG16F"`
   * - `"RGB16F"`
   * - `"RGBA16F"`
   * - `"R32F"`
   * - `"RG32F"`
   * - `"RGB32F"`
   * - `"RGBA32F"`
   * - `"R11F_G11F_B10F"`
   * - `"RGB9_E5"`
   * - `"R8I"`
   * - `"R8UI"`
   * - `"R16I"`
   * - `"R16UI"`
   * - `"R32I"`
   * - `"R32UI"`
   * - `"RG8I"`
   * - `"RG8UI"`
   * - `"RG16I"`
   * - `"RG16UI"`
   * - `"RG32I"`
   * - `"RG32UI"`
   * - `"RGB8I"`
   * - `"RGB8UI"`
   * - `"RGB16I"`
   * - `"RGB16UI"`
   * - `"RGB32I"`
   * - `"RGB32UI"`
   * - `"RGBA8I"`
   * - `"RGBA8UI"`
   * - `"RGBA16I"`
   * - `"RGBA16UI"`
   * - `"RGBA32I"`
   * - `"RGBA32UI"`
   */
  get internalFormat(): TextureFormat {
    return readTextureFormat(this.getAttribute("internalFormat") || "RGBA");
  }
  /**
   * Specifies the format for the texel data.
   * 
   * This attribute allows the same values that the "format" parameter of
   * the [`gl.texImage2D()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D#parameters)
   * function does (and the same as the "internalFormat" attribute).
   */
  get format(): TextureFormat {
    return readTextureFormat(this.getAttribute("format") || "RGBA");
  }
  /**
   * Specifies the data type of the texel data.
   * 
   * This attribute allows the same values that the "type" parameter of
   * the [`gl.texImage2D()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D#parameters)
   * function does:
   * 
   * - `"BYTE"`
   * - `"UNSIGNED_SHORT"`
   * - `"SHORT"`
   * - `"UNSIGNED_INT"`
   * - `"INT"`
   * - `"HALF_FLOAT"`
   * - `"FLOAT"`
   * - `"UNSIGNED_INT_2_10_10_10_REV"`
   * - `"UNSIGNED_INT_10F_11F_11F_REV"`
   * - `"UNSIGNED_INT_5_9_9_9_REV"`
   * - `"UNSIGNED_INT_24_8"`
   * - `"FLOAT_32_UNSIGNED_INT_24_8_REV"`
   * - `"UNSIGNED_BYTE"` _(default)_
   * - `"UNSIGNED_SHORT_5_6_5"`
   * - `"UNSIGNED_SHORT_4_4_4_4"`
   * - `"UNSIGNED_SHORT_5_5_5_1"`
   */
  get type(): TextureType {
    return readTextureType(this.getAttribute("type") || "UNSIGNED_BYTE");
  }
  /**
   * This attribute is used to get the image data from.
   * 
   * It can be a URL or a query selector for an image/video tag.
   */
  get src(): string | null {
    return this.getAttribute("src");
  }

  /**
   * A reference to the data sent to the GPU, this is set in the load function
   **/
  data: ImageDataInput | null = null;

  /**
   * This function is used to read the `src` attribute and try to read it with 
   * the available supported readers.
   * 
   * It returns an empty ImageData (0,0) if the `src` attribute is not found
   * or an override is not provided.
   */
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

  /**
   * This function loads the texture data by reading the `src` attribute
   * and returning a valid `ImageDataInput` type from it.
   * 
   * It might need to wait until the image data is loaded before sending to the
   * GPU (which happens if the `src` is pointing to an image)
   *  
   * This function is created in the `initialize()` method and defaults to a
   * no-op.
   */
  load: ((texture: WebGLTexture, src?: string) => Promise<void>) =
    async () => {};

  /**
   * Reads the attributes from this Web Component and uses them to create the
   * `load` function.
   * 
   * The created `load` function binds the texture and calls `gl.texImage2D`
   * on it with the appropriate signature according to the attributes being
   * set.
   */
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
        // Try a set of readers (just `readImageDataFromQuery` for now).
        this.data = await this.readDataFromSrc(
          [readImageDataFromQuery],
          srcOverride ? srcOverride : src || srcOverride,
        );
      }
      // Temporarily bind the texture to call `texImage2D` on it.
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
          this.data as TexImageSource,
        );
      } else if (this.data === null) {
        // No data, assume screen dimensions
        this.width = gl.drawingBufferWidth;
        this.height = gl.drawingBufferHeight;
        gl.texImage2D(
          gl[target],
          level,
          gl[internalFormat],
          gl.drawingBufferWidth,
          gl.drawingBufferHeight,
          0,
          gl[format],
          gl[type],
          null,
        );
      } else {
        gl.texImage2D(
          gl[target],
          level,
          gl[internalFormat],
          gl[format],
          gl[type],
          this.data as TexImageSource,
        );
      }
    };
  }
}

/**
 * Reads a string value and returns it if it is a valid TextureFormat or
 * "RGBA" otherwise.
 */
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

/**
 * Reads a string value and returns it if it is a valid TextureType or
 * "UNSIGNED_BYTE" otherwise.
 */
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
