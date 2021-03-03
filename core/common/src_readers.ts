// Copyright 2021 Hugo Daniel Henriques Oliveira Gomes. All rights reserved.
// Licensed under the EUPL
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

/**
 * This function is a "reader". If the src string is a JSON array, then it
 * returns a promise that resolves to the parsed contents.
 * 
 * Otherwise the src string is rejected.
 */
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

/**
 * This functions parses a string and checks if it is a valid
 * [querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector).
 * input.
 */
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

/**
 * These types can be used as image data sources for textures.
 */
export type ImageDataInput =
  | HTMLImageElement
  | HTMLCanvasElement
  | HTMLVideoElement
  | ImageBitmap
  | ImageData;

/** Type guard to make sure that an element can be used as image data input */
function isImageDataInput(elem: unknown): elem is ImageDataInput {
  return (
    (elem instanceof globalThis.HTMLImageElement) ||
    (elem instanceof globalThis.HTMLCanvasElement) ||
    (elem instanceof globalThis.HTMLVideoElement) ||
    (elem instanceof globalThis.ImageBitmap) ||
    (elem instanceof globalThis.ImageData)
  );
}

/**
 * This function tries to read the image from an element specified by the
 * `src` query string.
 * 
 * It returns a promise that resolves with the image data if the element is
 * any of the supported image data inputs.
 * 
 * If the element is an HTMLImageElement it resolves after it is loaded or
 * completed, otherwise the element is returned as is (WebGL2 supports these
 * elements as image data sources).
 */
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
          console.warn(`Error with image at ${src}: ${e.toString()}`);
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

/**
 * For a given src string, it tries a set of data readers for it.
 * This allows a src string to support multiple target representations.
 * 
 * An example of a reader is, for instance, the JSON parser.
 */
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
  // No reader can resolve this src string
  console.error(`Cannot find a reader for this source: ${src}`);
  return [];
}
