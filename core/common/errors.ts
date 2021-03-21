let error = undefined;
export function glError(gl: WebGL2RenderingContext | undefined) {
  if (!gl) return;
  error = gl.getError();
  if (error !== gl.NO_ERROR) {
    console.log(glEnumToString(gl, error));
  }
}
function glEnumToString(gl: WebGL2RenderingContext | undefined, v: number) {
  for (const k in gl) {
    if (((gl as unknown) as any)[k] === v) {
      return k;
    }
  }
  return `0x${v.toString(16)}`;
}
