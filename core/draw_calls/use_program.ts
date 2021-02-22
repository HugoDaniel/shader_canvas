import { nop } from "../common/nop.ts";
import type { ProgramRenderer } from "../common/program_class.ts";
import type { WebGLCanvasContext } from "../webgl_canvas/context.ts";
import { CreateProgram } from "../webgl_programs/create_program.ts";
import { ActiveTexture } from "./active_texture.ts";
import { DrawVAO } from "./draw_vao.ts";
const dependsOn = [DrawVAO];
export class UseProgram extends globalThis.HTMLElement {
  static tag = "use-program";
  whenLoaded = Promise.all(
    dependsOn.map((c) => globalThis.customElements.whenDefined(c.tag)),
  );

  get src(): string | null {
    return this.getAttribute("src");
  }

  program: CreateProgram | undefined = undefined;

  useProgram: () => void = nop;

  drawCalls: (() => void)[] = [];

  drawProgram: (() => void) = nop;

  async initialize(
    gl: WebGL2RenderingContext,
    context: WebGLCanvasContext,
    renderers: Map<string, ProgramRenderer>,
  ) {
    await this.whenLoaded;

    const src = this.src;
    if (!src) {
      console.warn("<use-program>: no src attribute found");
      return;
    }
    this.program = context.programs.content.get(src);
    if (!this.program) {
      console.warn(`<use-program>: unable to find program named <${src}>`);
      return;
    }
    const program = this.program;
    const glProgramId = this.program.program;
    if (!glProgramId) {
      console.warn(`<use-program>: GL Program not set for program <${src}>`);
      return;
    }
    // If it has parts, then call the onUseProgramStart and onUseProgramEnd
    if (this.program.modules.length > 0) {
      const name = this.program?.name;

      // get the functions for each part
      const onStart = this.program.modules.map((module) =>
        context.modulesFunctions.get(module)?.onUseProgram
      ).filter((f) => f !== undefined) as ((
        ctx: WebGLCanvasContext,
        program: CreateProgram,
        programName: string,
      ) => void)[];

      this.useProgram = () => {
        gl.useProgram(glProgramId);
        for (let i = 0; i < onStart.length; i++) {
          onStart[i](context, program, name);
        }
      };
    } else {
      this.useProgram = () => gl.useProgram(glProgramId);
    }

    // Create the draw calls array and start
    const renderFunction = renderers.get(src);
    if (renderFunction) {
      this.drawCalls.push(renderFunction);
    }
    for (const child of [...this.children]) {
      if (child instanceof DrawVAO) {
        child.initialize(gl, context);
        this.drawCalls.push(child.drawVao);
      } else if (child instanceof ActiveTexture) {
        await child.initialize(gl, context, this.program);
        this.drawCalls = this.drawCalls.concat(child.drawCalls);
      } else {
        console.warn(
          `<use-program>: No valid child found in: <${child.tagName.toLocaleLowerCase()}>`,
        );
      }
    }

    this.drawProgram = () => {
      this.useProgram();
      for (let i = 0; i < this.drawCalls.length; i++) {
        this.drawCalls[i]();
      }
    };
  }
}
