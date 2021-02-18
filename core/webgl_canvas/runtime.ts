export interface WebGLCanvasRuntime {
  offscreenCanvas512: CanvasRenderingContext2D;
  offscreenCanvas1024: CanvasRenderingContext2D;
  offscreenCanvas2048: CanvasRenderingContext2D;
}

export class WebGLRuntime extends globalThis.HTMLElement {}
