import { WebGLTextures } from "../webgl_textures/webgl_textures.ts";
import { RenderbufferStorage } from "./renderbuffer_storage.ts";

const dependsOn = [RenderbufferStorage];

export class FramebufferAttachment extends globalThis.HTMLElement {
  get target(): FramebufferTarget {
    return readFramebufferTarget(this.getAttribute("target"));
  }
  get attachment(): FramebufferAttachmentPoint {
    return readFramebufferAttachment(this.getAttribute("attachment"));
  }
  get src(): string | null {
    return this.getAttribute("src");
  }
}

export class FramebufferTexture2D extends FramebufferAttachment {
  static tag = "framebuffer-texture-2d";
  /** A string specifying the texture target. */
  get texture(): FramebufferTexTarget {
    return readFramebufferTexTarget(this.getAttribute("texture"));
  }

  initialize(gl: WebGL2RenderingContext, textures: WebGLTextures) {
    // Get the texture from the source or create it and read data from child node
    const textureName = this.src;
    if (!textureName) {
      // TODO: create the texture and read the data from a child node
      console.warn("No texture 'src' attribute found in framebufferTexture2D");
      return;
    }
    const texture = textures.content.get(textureName);
    if (!texture || !texture.texture) {
      console.warn(
        `Could not find the referenced texture at ${FramebufferTexture2D.tag}`,
      );
      return;
    }

    const textureId = texture.texture;
    const attachmentPoint = gl[this.attachment];
    const texTarget = gl[this.texture];
    const fbTarget = gl[this.target];
    texture.bindTexture();
    gl.framebufferTexture2D(fbTarget, attachmentPoint, texTarget, textureId, 0);
  }
}

export class FramebufferTextureLayer extends FramebufferAttachment {
  static tag = "framebuffer-texture-layer";
  /** A number specifying the mipmap level of the texture image to attach.  */
  get level(): number {
    return Number(this.getAttribute("level"));
  }
  /** A number specifying the layer of the texture image to attach. */
  get layer(): number {
    return Number(this.getAttribute("layer"));
  }
  initialize(gl: WebGL2RenderingContext, textures: WebGLTextures) {
    // Get the texture from the source or create it and read data from child node
    const textureName = this.src;
    if (!textureName) {
      // TODO: create the texture and read the data from a child node
      console.warn(
        `No texture 'src' attribute found in ${FramebufferTextureLayer.tag}`,
      );
      return;
    }
    const texture = textures.content.get(textureName);
    if (!texture || !texture.texture) {
      console.warn(
        `Could not find the referenced texture at ${FramebufferTextureLayer.tag}`,
      );
      return;
    }

    const textureId = texture.texture;
    const attachmentPoint = gl[this.attachment];
    const fbTarget = gl[this.target];
    gl.framebufferTextureLayer(
      fbTarget,
      attachmentPoint,
      textureId,
      this.level,
      this.layer,
    );
  }
}

export class FramebufferRenderbuffer extends FramebufferAttachment {
  static tag = "framebuffer-renderbuffer";
  /**
   * Promise that resolves when all dependencies have registered their 
   * tag in the customElements global Web Components registry.
   * 
   * This is used in the async initialize() function, to ensure that its
   * code only runs when all the tags it depends are available. 
   */
  private whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  renderbuffer: WebGLRenderbuffer | null = null;

  async initialize(gl: WebGL2RenderingContext) {
    await this.whenLoaded;
    this.renderbuffer = gl.createRenderbuffer();
    if (!this.renderbuffer) {
      console.warn(
        `Unable to create the render buffer in <${FramebufferRenderbuffer.tag}>`,
      );
    }
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
    // Set the Renderbuffer Storage
    for (const child of Array.from(this.children)) {
      if (child instanceof RenderbufferStorage) {
        child.initialize(gl);
      }
    }
    if (this.children.length === 0) {
      console.warn(
        `No <renderbuffer-storage> set in the ${FramebufferRenderbuffer.tag}`,
      );
    }
    const attachmentPoint = gl[this.attachment];
    const fbTarget = gl[this.target];
    gl.framebufferRenderbuffer(
      fbTarget,
      attachmentPoint,
      gl.RENDERBUFFER,
      this.renderbuffer,
    );
  }
}

export type FramebufferTexTarget =
  | "TEXTURE_2D"
  | "TEXTURE_CUBE_MAP_POSITIVE_X"
  | "TEXTURE_CUBE_MAP_NEGATIVE_X"
  | "TEXTURE_CUBE_MAP_POSITIVE_Y"
  | "TEXTURE_CUBE_MAP_NEGATIVE_Y"
  | "TEXTURE_CUBE_MAP_POSITIVE_Z"
  | "TEXTURE_CUBE_MAP_NEGATIVE_Z";
export function readFramebufferTexTarget(
  target: string | null,
): FramebufferTexTarget {
  switch (target) {
    case "TEXTURE_CUBE_MAP_POSITIVE_X":
    case "TEXTURE_CUBE_MAP_NEGATIVE_X":
    case "TEXTURE_CUBE_MAP_POSITIVE_Y":
    case "TEXTURE_CUBE_MAP_NEGATIVE_Y":
    case "TEXTURE_CUBE_MAP_POSITIVE_Z":
    case "TEXTURE_CUBE_MAP_NEGATIVE_Z":
      return target;
    default:
      return "TEXTURE_2D";
  }
}

export type FramebufferAttachmentPoint =
  | "DEPTH_ATTACHMENT"
  | "DEPTH_STENCIL_ATTACHMENT"
  | "STENCIL_ATTACHMENT"
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
export function readFramebufferAttachment(
  target: string | null,
): FramebufferAttachmentPoint {
  switch (target) {
    case "DEPTH_ATTACHMENT":
    case "DEPTH_STENCIL_ATTACHMENT":
    case "STENCIL_ATTACHMENT":
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
      return target;
    default:
      return "COLOR_ATTACHMENT0";
  }
}

export type FramebufferTarget =
  | "FRAMEBUFFER"
  // The following select the face to show of a cube map texture:
  | "DRAW_FRAMEBUFFER"
  | "READ_FRAMEBUFFER";

export function readFramebufferTarget(
  target: string | null,
): FramebufferTarget {
  switch (target) {
    case "FRAMEBUFFER":
    case "DRAW_FRAMEBUFFER":
    case "READ_FRAMEBUFFER":
      return target;
    default:
      return "FRAMEBUFFER";
  }
}

// Add these framebuffer attachments to the list of dependencies and go through
// all of them and register their tags in the Web Components customElements
// global registry.
// This is run at the module level, when any of these classes are imported. The
// initialize() function can wait for all these classes to be registered before
// doing anything.
[
  FramebufferTexture2D,
  FramebufferTextureLayer,
  FramebufferRenderbuffer,
  ...dependsOn,
].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
