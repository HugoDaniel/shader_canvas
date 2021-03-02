// deno-lint-ignore-file
describe("<new-modules>", function () {
  beforeEach(function () {
    domTestArea.innerHTML = "";
  });
  const moduleTriangle = (programName) => `
<shader-canvas>
  <new-modules>
      <${programName}-buffer-2d>
          <webgl-buffers>
              <${programName}-vertices-2d>
                  <buffer-data data-src="textContent"></buffer-data>
              </${programName}-vertices-2d>
          </webgl-buffers>
          <webgl-vertex-array-objects>
              <${programName}-vao-2d>
                  <bind-buffer src="${programName}-vertices-2d">
                      <vertex-attrib-pointer data-variable="variable" size="2">
                      </vertex-attrib-pointer>
                  </bind-buffer>
              </${programName}-vao-2d>
          </webgl-vertex-array-objects>
          <webgl-program-part>
              <vertex-shader>
                  <code>
                      in vec4 vertex2d;
                  </code>
              </vertex-shader>
          </webgl-program-part>
          <draw-calls>
              <viewport-transform x="0" y="0"></viewport-transform>
              <clear-color red="0" green="0" blue="0" alpha="1"></clear-color>
              <clear-flags mask="COLOR_BUFFER_BIT"></clear-flags>

              <use-program src="${programName}-program-2d">
                  <draw-vao src="${programName}-vao-2d"></draw-vao>
              </use-program>
          </draw-calls>
      </${programName}-buffer-2d>
      <${programName}-vertex-code>
          <webgl-programs>
              <${programName}-program-2d>
                  <${programName}-buffer-2d></${programName}-buffer-2d>
                  <vertex-shader>
                      <code data-textcontent="textContent"></code>
                  </vertex-shader>
              </${programName}-program-2d>
          </webgl-programs>
      </${programName}-vertex-code>
      <${programName}-fragment-code>
          <webgl-programs>
              <${programName}-program-2d>
                  <${programName}-buffer-2d></${programName}-buffer-2d>
                  <fragment-shader>
                      <code data-textcontent="textContent"></code>
                  </fragment-shader>
              </${programName}-program-2d>
          </webgl-programs>
      </${programName}-fragment-code>
  </new-modules>
  <${programName}-buffer-2d variable="vertex2d">[-0.7, 0, 0, 0.5, 0.7, 0]</${programName}-buffer-2d>
  <${programName}-vertex-code>
      #version 300 es
      void main() {
      gl_Position = vertex2d;
      }
  </${programName}-vertex-code>
  <${programName}-fragment-code>
      #version 300 es
      precision highp float;
      out vec4 outColor;

      void main() {
      outColor = vec4(1, 0, 1, 1);
      }
  </${programName}-fragment-code>
</shader-canvas>`;

  it("creates custom module tags", function (done) {
    const name = "modules-one";
    domTestArea.innerHTML = moduleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const modules = shaderCanvas.querySelector("new-modules");
      waitFor(() => modules.content.size > 0)
        .then(() => {
          assert.equal(modules.content.size, 3, "Must have 3 modules present");
          assert(
            modules.content.get(name + "-buffer-2d"),
            `Must have the ${name}-buffer-2d module`
          );
          assert(
            customElements.get(name + "-buffer-2d"),
            `Must have the tag <${name}-buffer-2d> defined`
          );
          assert(
            modules.content.get(name + "-vertex-code"),
            `Must have the ${name}-vertex-code module`
          );
          assert(
            customElements.get(name + "-vertex-code"),
            `Must have the tag <${name}-vertex-code> defined`
          );
          assert(
            modules.content.get(name + "-fragment-code"),
            `Must have the ${name}-fragment-code module`
          );
          assert(
            customElements.get(name + "-fragment-code"),
            `Must have the tag <${name}-fragment-code> defined`
          );
        })
        .then(() => done())
        .catch((error) => done(error));
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });

  it("can merge webgl-programs", function (done) {
    const name = "modules-two";
    domTestArea.innerHTML = moduleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const modules = shaderCanvas.querySelector("new-modules");
      waitFor(() => modules.content.size > 0)
        .then(() => {
          const programs = shaderCanvas.root.querySelector(
            "webgl-canvas webgl-programs"
          );
          assert.equal(programs.content.size, 1, "Must have 1 program present");
          assert(
            programs.content.get(name + "-program-2d"),
            `Must have the ${name}-program-2d defined`
          );
        })
        .then(() => done())
        .catch((error) => done(error));
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });
  it("can merge code from program parts", function (done) {
    const name = "modules-three";
    domTestArea.innerHTML = moduleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const modules = shaderCanvas.querySelector("new-modules");
      waitFor(() => modules.content.size > 0)
        .then(() => {
          const programs = shaderCanvas.root.querySelector(
            "webgl-canvas webgl-programs"
          );
          const program = programs.content.get(name + "-program-2d");
          const vertex2dVar = program.vertexShader.variables.find(
            (v) => v.name === "vertex2d"
          );
          const fragmentVar = program.fragmentShader.variables.find(
            (v) => v.name === "vertex2d"
          );
          assert(vertex2dVar, "Must have the vertex2d var merged");
          assert(
            fragmentVar === undefined,
            "Must not merge the vertex2d var in the fragment shader"
          );
        })
        .then(() => done())
        .catch((error) => done(error));
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });
  it("can merge webgl-buffers", function (done) {
    const name = "modules-four";
    domTestArea.innerHTML = moduleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const modules = shaderCanvas.querySelector("new-modules");
      waitFor(() => modules.content.size > 0)
        .then(() => {
          const buffers = shaderCanvas.root.querySelector(
            "webgl-canvas webgl-buffers"
          );
          assert.equal(buffers.content.size, 1, "Must have 1 buffer present");
          assert(
            buffers.content.get(name + "-vertices-2d"),
            `Must have the ${name}-vertices-2d defined`
          );
        })
        .then(() => done())
        .catch((error) => done(error));
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });
  it("can set data from an element textContent", function (done) {
    const name = "modules-five";
    domTestArea.innerHTML = moduleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const modules = shaderCanvas.querySelector("new-modules");
      waitFor(() => modules.content.size > 0)
        .then(() => {
          const bufferData = shaderCanvas.root.querySelector(
            "webgl-canvas webgl-buffers buffer-data"
          );
          assert.equal(bufferData.data.length, 6, "Must have 6 float values");
          assert.equal(bufferData.data[1], 0, `Must have correct values`);
          assert.equal(bufferData.data[2], 0, `Must have correct values`);
          assert.equal(bufferData.data[3], 0.5, `Must have correct values`);
        })
        .then(() => done())
        .catch((error) => done(error));
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });
});
