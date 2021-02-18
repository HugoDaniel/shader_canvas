import { BufferData } from "./buffer_data.ts";
import { nop } from "../common/nop.ts";
export class CreateBuffer extends globalThis.HTMLElement {
  data: ArrayBuffer | SharedArrayBuffer | ArrayBufferView | number[] | null =
    null;
  buffer: WebGLBuffer | null = null;
  length = 0;
  bindBuffer: (() => number) = () => {
    nop();
    return 0;
  };

  async initialize(gl: WebGL2RenderingContext) {
    this.buffer = gl.createBuffer();
    if (!this.buffer) {
      console.error(
        `<${this.tagName.toLocaleLowerCase()}>: Unable to create buffer`,
      );
      return;
    }
    // TODO: merge data buffers into a single data buffer
    for (const child of [...this.children]) {
      if (child instanceof BufferData) {
        child.initialize(gl); // creates the load function
        await child.load(this.buffer);
        this.data = child.data;
        this.length += child.length;
        // Create the bind function
        const target = gl[child.target];
        this.bindBuffer = () => {
          console.debug(`<${this.tagName.toLocaleLowerCase()}>: bindBuffer()`);
          gl.bindBuffer(target, this.buffer);
          return target;
        };
      }
    }
  }
}
