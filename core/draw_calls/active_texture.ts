import { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { CreateProgram } from "../webgl_programs/create_program.ts";
import { CreateTexture } from "../webgl_textures/create_texture.ts";
import {
  TexParameterF,
  TexParameterI,
} from "../webgl_textures/tex_parameter.ts";

const dependsOn = [TexParameterI, TexParameterF];

export class ActiveTexture extends globalThis.HTMLElement {
  static tag = "active-texture";
  whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );
  texture: CreateTexture | undefined = undefined;
  unit = 0;

  get src(): string | null {
    return this.getAttribute("src");
  }
  get var(): string | null {
    return this.getAttribute("var");
  }
  drawCalls: (() => void)[] = [];
  async initialize(
    gl: WebGL2RenderingContext,
    context: WebGLCanvasContext,
    program: CreateProgram,
  ) {
    await this.whenLoaded;

    const src = this.src;
    if (!src) {
      console.warn("<active-texture>: no src attribute found");
      return;
    }
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
