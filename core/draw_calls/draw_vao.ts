import { nop } from "../common/nop.ts";
import { CreateVertexArray } from "../webgl_vertex_array_objects/create_vertex_array.ts";
import type { WebGLCanvasContext } from "../webgl_canvas/context.ts";

export class DrawVAO extends globalThis.HTMLElement {
  static tag = "draw-vao";
  get src(): string | null {
    return this.getAttribute("src");
  }
  get mode(): VAOMode {
    return readVaoMode(this.getAttribute("mode"));
  }
  set count(value: number) {
    if (value) {
      this.setAttribute("count", `${value}`);
    }
  }
  get count(): number {
    return Number(
      this.getAttribute("count"),
    );
  }
  get offset(): number {
    return Number(this.getAttribute("offset"));
  }
  get first(): number {
    return Number(this.getAttribute("first"));
  }
  get type(): VAOType {
    return readVAOType(this.getAttribute("type"));
  }

  vao: CreateVertexArray | undefined;
  drawVao: () => void = nop;
  initialize(gl: WebGL2RenderingContext, context: WebGLCanvasContext) {
    // look for <webgl-vertex-array-objects>
    const src = this.src;
    if (!src) {
      console.warn("<draw-vao>: no src attribute found");
      return;
    }
    this.vao = context.vaos.content.get(src);
    if (!this.vao) {
      console.warn(`<draw-vao>: unable to find program named <${src}>`);
      return;
    }
    const bindVao = this.vao.bindVAO;
    const mode = gl[this.mode];
    let count = this.count;
    if (count === 0) {
      count = this.vao.location0Count || readTargetMinCount(this.mode);
      this.count = count;
    }
    const type = gl[this.type];
    const offset = this.offset;
    const first = this.first;
    if (this.vao.hasElementArrayBuffer) {
      this.drawVao = () => {
        bindVao();
        gl.drawElements(mode, count, type, offset);
      };
    } else {
      this.drawVao = () => {
        bindVao();
        gl.drawArrays(mode, first, count);
      };
    }
  }
}

type VAOMode =
  | "POINTS"
  | "LINE_STRIP"
  | "LINE_LOOP"
  | "LINES"
  | "TRIANGLE_STRIP"
  | "TRIANGLE_FAN"
  | "TRIANGLES";

function readVaoMode(value: string | null): VAOMode {
  if (!value) return "TRIANGLES";
  switch (value) {
    case "POINTS":
    case "LINE_STRIP":
    case "LINE_LOOP":
    case "LINES":
    case "TRIANGLE_STRIP":
    case "TRIANGLE_FAN":
    case "TRIANGLES":
      return value;
    default:
      return "TRIANGLES";
  }
}

function readTargetMinCount(t: VAOMode): number {
  console.warn("<draw-vao>: count attribute not set, using the minimum count");
  switch (t) {
    case "POINTS":
      return 1;
    case "LINE_STRIP":
    case "LINE_LOOP":
    case "LINES":
      return 2;
    case "TRIANGLE_STRIP":
    case "TRIANGLE_FAN":
    case "TRIANGLES":
      return 3;
    default:
      return 0;
  }
}

type VAOType = "UNSIGNED_BYTE" | "UNSIGNED_SHORT";

function readVAOType(value: string | null): VAOType {
  if (value === "UNSIGNED_SHORT") return value;

  return "UNSIGNED_BYTE";
}
