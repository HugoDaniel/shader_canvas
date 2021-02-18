export type SrcReader<T> = (src: string) => Promise<T>;
/**
 * A data reader that queries for the `src` string and runs `JSON.parse` on
 * the `textContent` of the element queried.
 * 
 * It rejects if the src string is not a query string, or if no element is
 * found or if the textContent of the found element is not an array of numbers.
 */
export function readQueryElement(src: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    if (isQuery(src)) {
      const elem = globalThis.document.querySelector(src);
      if (!elem || !elem?.textContent) {
        reject();
        return; // To avoid TypeScript complaining when accessing `textContent`
      }
      readSrcAsJSON(elem?.textContent.trim()).then((result) => {
        resolve(result);
      }).catch((r) => {
        reject();
      });
    } else {
      reject();
    }
  });
}
export function readSrcAsJSON(src: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const firstChar = src[0];
    const lastChar = src[src.length - 1];
    if (firstChar === "[" && lastChar === "]") {
      try {
        let result = JSON.parse(src);
        result = result.map(Number);
        if (result.filter(isNaN).length > 0) {
          reject();
        }
        resolve(result);
      } catch (e) {
        console.warn("JSON error", e);
        reject(e);
      }
    }
    reject();
  });
}

function isQuery(query: string): boolean {
  const firstChar = query[0];
  const secondChar = query[1];
  const hasSlash = query.indexOf("/") >= 0 || query.indexOf("\\") >= 0;
  return Boolean(
    ((firstChar === "." && secondChar.match(/[a-zA-Z]/)) ||
      (firstChar === "#" && secondChar.match(/[a-zA-Z]/)) ||
      firstChar.match(/[a-zA-Z]/)) && !hasSlash,
  );
}

function getImageData(
  img: HTMLImageElement,
  ctx: CanvasRenderingContext2D | undefined | null,
) {
  const w = img.width;
  const h = img.height;
  // render the image to canvas
  // which is the only way to get an ImageData/Uint8Array
  // for the GPU
  if (ctx) {
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, h, h);
    // perform a copy of the ImageData into a Uint8Array
    // this is because Apple limits the total ImageData available size
    // so I circumvent by transforming it into a Uint8Array :P
    return (new Uint8Array(d.data.copyWithin(0, 0)));
  }
  return null;
}

export type ImageDataInput =
  | HTMLImageElement
  | HTMLCanvasElement
  | HTMLVideoElement
  | ImageBitmap
  | ImageData;

function isImageDataInput(elem: unknown): elem is ImageDataInput {
  return (
    (elem instanceof globalThis.HTMLImageElement) ||
    (elem instanceof globalThis.HTMLCanvasElement) ||
    (elem instanceof globalThis.HTMLVideoElement) ||
    (elem instanceof globalThis.ImageBitmap) ||
    (elem instanceof globalThis.ImageData)
  );
}

export function readImageDataFromQuery(src: string): Promise<ImageDataInput> {
  return new Promise((resolve, reject) => {
    if (isQuery(src)) {
      const elem = globalThis.document.querySelector(src);
      if (!elem || !(isImageDataInput(elem))) {
        reject();
        return;
      }
      if (elem instanceof globalThis.HTMLImageElement) {
        elem.onload = () => {
          resolve(elem);
        };
        if (elem.complete) {
          resolve(elem);
        }
        elem.onerror = (e) => {
          console.warn(`Error with image at ${src}: ${e}`);
        };
        elem.onabort = () => {
          console.warn(`Loading the image at ${src} was aborted`);
        };
      } else {
        resolve(elem);
      }
    } else {
      reject();
    }
  });
}

export async function trySrcReaders<T>(src: string, readers: SrcReader<T>[]) {
  // run through the readers array
  for (let i = 0; i < readers.length; i++) {
    try {
      // Once a reader can resolve the src string, return its result and don't
      // try more readers. Stop at the first one that can read the src string.
      return await readers[i](src);
    } catch (e) {
      // If the Promise didn't resolve it means that the reader was not
      // able to read the src string provided.
      continue; // Move to the next reader and see if it resolves
    }
  }
  // No reader has
  console.error(`Cannot find a reader for this source: ${src}`);
  return [];
}
