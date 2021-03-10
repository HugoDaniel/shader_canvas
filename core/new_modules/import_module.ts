export class ImportModule extends globalThis.HTMLElement {
  static tag = "import-module";

  get from(): string | null {
    return this.getAttribute("from");
  }

  async initialize() {
    if (this.from) {
      try {
        const response = await fetch(this.from);
        const result = await response.text();
        console.log("GOT RESULT", result);
        return result;
      } catch (e) {
        console.error(e);
      }
    }
  }
}
