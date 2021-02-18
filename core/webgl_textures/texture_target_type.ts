export type TextureTarget =
  | "TEXTURE_2D"
  // The following select the face to show of a cube map texture:
  | "TEXTURE_CUBE_MAP_POSITIVE_X"
  | "TEXTURE_CUBE_MAP_NEGATIVE_X"
  | "TEXTURE_CUBE_MAP_POSITIVE_Y"
  | "TEXTURE_CUBE_MAP_NEGATIVE_Y"
  | "TEXTURE_CUBE_MAP_POSITIVE_Z"
  | "TEXTURE_CUBE_MAP_NEGATIVE_Z";

export function readTextureTarget(target: string): TextureTarget {
  switch (target) {
    case "TEXTURE_2D":
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
