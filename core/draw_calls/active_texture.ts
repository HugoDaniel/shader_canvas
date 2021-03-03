// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
import { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { CreateProgram } from "../webgl_programs/create_program.ts";
import { CreateTexture } from "../webgl_textures/create_texture.ts";
import { TexParameterF, TexParameterI } from "./tex_parameter.ts";

/**
 * Like the other Web Components in Shader Canvas, the `dependsOn` list
 * sets the classes that this Web Component needs to be defined before
 * its initialization can be done.
 */
const dependsOn = [TexParameterI, TexParameterF];

/**
 * ActiveTexture is a Web Component for a tag that represents the equivalent
 * operation of the `gl.activeTexture()` function.
 */
export class ActiveTexture extends globalThis.HTMLElement {
  /**
   * ## `<active-texture>` {#ActiveTexture}
   * 
   * This tag is the equivalent of the [WebGL `activeTexture() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/activeTexture).
   * 
   * It sets the texture pointed by the `src` attribute as the target for the
   * actions defined as children.
   * 
   * Place tags inside this one to perform actions in the texture this tag is
   * referencing.

   * The allowed children are:
   * 
   * - [`<tex-parameter-i>`](#TexParameterI)
   * - [`<tex-parameter-f>`](#TexParameterF)
   * 
   * The `<active-texture>` tag is meant to be used as a child of the
   * [`<draw-calls>`](#DrawCalls) list of actions.
   */
  static tag = "active-texture";
  private whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );
  /**
   * A reference to the Texture this tag is pointing at.
   * Defaults to `undefined` but gets attributed the correct texture after
   * `initialize()` is called.
   **/
  texture: CreateTexture | undefined = undefined;
  /**
   * A reference to the texture unit that is being used. This is
   * calculated automatically during `initialize()` by looking at the parsed
   * list of GLSL variables.
   */
  unit = 0;

  /**
   * A string that references a texture name.
   * 
   * This must be the name of a tag available in the `<webgl-textures>`
   * container.
   */
  get src(): string | null {
    return this.getAttribute("src");
  }
  /**
   * A string with the GLSL variable name to put this texture at.
   */
  get var(): string | null {
    return this.getAttribute("var");
  }
  /**
   * The list of functions to execute when rendering.
   */
  drawCalls: (() => void)[] = [];

  /**
   * Initializing an active texture looks for the texture name in the textures
   * container (from the context arg) and defines its texture unit by finding
   * the index of the variable being pointed in the program being passed as
   * argument.
   */
  async initialize(
    gl: WebGL2RenderingContext,
    context: WebGLCanvasContext,
    program: CreateProgram,
  ) {
    // Only proceed after every dependency is loaded
    await this.whenLoaded;

    // Read the "src" html attribute and keep a reference to it in a local var.
    // This prevents reading the DOM when the src is needed.
    const src = this.src;
    if (!src) {
      console.warn("<active-texture>: no src attribute found");
      return;
    }
    // Read the "var" html attribute and keep a reference to it locally.
    const variable = this.var;
    if (!variable) {
      console.warn("<active-texture>: no var attribute found");
      return;
    }
    const texture = context.textures.content.get(src);
    this.texture = texture;
    // Add the `activeTexture` to the draw calls array
    if (texture?.texture) {
      // Find the uniform texture order in the program
      const index = program.allTextureVariables().findIndex((v) =>
        v.name === variable
      );
      if (index < 0) {
        console.warn(
          `<active-texture>: unable to find the variable ${variable} in \
          ${program.name}`,
        );
        return;
      }
      // The index of the texture variable sets the texture unit it will be at
      this.unit = index;
      const location = program.uniformLocations.get(variable);
      if (!location) {
        console.warn(
          `<active-texture>: unable to find the location for variable \
          ${variable} in ${program.name}`,
        );
        return;
      }
      this.drawCalls.push(() => {
        // set the uniform with the index (which corresponds to the texture
        // unit)
        gl.uniform1i(location, index);
        gl.activeTexture(gl.TEXTURE0 + index);
        texture.bindTexture();
      });
      // If there are no <tex-parameter-i> child tags, add the default one
      if (
        [...this.children].filter((c) => c instanceof TexParameterI).length ===
          0
      ) {
        const texParamElem = globalThis.document.createElement(
          "tex-parameter-i",
        );
        texParamElem.setAttribute("target", "TEXTURE_2D");
        texParamElem.setAttribute("pname", "TEXTURE_MIN_FILTER");
        texParamElem.setAttribute("param", "LINEAR");
        this.appendChild(texParamElem);
      }

      // create the call to activeTexture and bindTexture (with the texture
      // unit from the order)
      for (const child of [...this.children]) {
        if (child instanceof TexParameterI || child instanceof TexParameterF) {
          child.initialize(gl);
          const drawFunction = child.texParameter;
          this.drawCalls.push(drawFunction);
        } else {
          console.warn(
            `<active-texture>: Not a valid child: \
            <${child.tagName.toLocaleLowerCase()}>`,
          );
        }
      }
    }
  }
}

[ActiveTexture, ...dependsOn].map((component) => {
  if (!globalThis.customElements.get(component.tag)) {
    globalThis.customElements.define(component.tag, component);
  }
});
