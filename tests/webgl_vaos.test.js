// deno-lint-ignore-file

describe("<webgl-vaos>", function () {
  const simpleTriangle = (programName) => `
  <div id="trianglePoints">[-0.7, 0, 0, 0.5, 0.7, 0]</div>
    <shader-canvas>
      <webgl-canvas>
          <draw-calls>
              <clear-color red="0" green="0" blue="0" alpha="1"></clear-color>
              <clear-flags mask="COLOR_BUFFER_BIT"></clear-flags>
              <use-program src="${programName}">
                  <draw-vao src="${programName}-vao" count="3"></draw-vao>
              </use-program>
          </draw-calls>
          <webgl-buffers>
              <${programName}-vertices>
                  <buffer-data src="#trianglePoints"></buffer-data>
              </${programName}-vertices>
          </webgl-buffers>
          <webgl-vertex-array-objects>
              <${programName}-vao>
                  <bind-buffer src="${programName}-vertices">
                      <vertex-attrib-pointer variable="a_position" size="2">
                      </vertex-attrib-pointer>
                  </bind-buffer>
              </${programName}-vao>
          </webgl-vertex-array-objects>
          <webgl-programs>
              <${programName}>
                  <vertex-shader>
                      <code>
                          #version 300 es
                          in vec4 a_position;
                          void main() {
                              gl_Position = a_position;
                          }
                      </code>
                  </vertex-shader>
                  <fragment-shader>
                      <code>
                          #version 300 es
                          precision highp float;
                          out vec4 outColor;
              
                          void main() {
                              outColor = vec4(1, 0, 1, 1);
                          }
                      </code>
                  </fragment-shader>
              </${programName}>
          </webgl-programs>
      </webgl-canvas>
  </shader-canvas>`;

  beforeEach(function () {
    domTestArea.innerHTML = "";
  });

  it("creates custom vertex array object tag names", function (done) {
    const name = "vaos-one";
    domTestArea.innerHTML = simpleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglVaos = shaderCanvas.querySelector(
        "webgl-vertex-array-objects"
      );
      waitFor(() => webglVaos.content.size === 1)
        .then(() => {
          assert.equal(webglVaos.content.size, 1, "Must have 1 buffer");
          const vaoName = name + "-vao";
          assert(
            webglVaos.content.has(vaoName),
            `Must have the ${vaoName} vertex array object`
          );
          assert(
            customElements.get(vaoName),
            `Must have the tag <${vaoName}> defined`
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
  it("creates a WebGL Vertex Array id", function (done) {
    const name = "vaos-two";
    domTestArea.innerHTML = simpleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglVaos = shaderCanvas.querySelector(
        "webgl-vertex-array-objects"
      );
      waitFor(() => webglVaos.content.size === 1)
        .then(() => {
          const vaoName = name + "-vao";
          const vao = webglVaos.content.get(vaoName);
          assert(vao.vao, `Must have the ${vaoName} Vertex Array id`);
        })
        .then(() => done())
        .catch((error) => done(error));
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });
  it("reads the location 0 vertex attrib pointer", function (done) {
    const name = "vaos-three";
    domTestArea.innerHTML = simpleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglVaos = shaderCanvas.querySelector(
        "webgl-vertex-array-objects"
      );
      waitFor(() => webglVaos.content.size === 1)
        .then(() => {
          const vaoName = name + "-vao";
          const vao = webglVaos.content.get(vaoName);
          const l0 = vao.location0Attribute;
          assert(l0, `${vaoName} must read the location 0 VertexAttribPointer`);
          assert.strictEqual(
            l0.location,
            0,
            `${vaoName} VertexAttribPointer must have location=0`
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
  it("reads the size of the location 0 variable", function (done) {
    const name = "vaos-four";
    domTestArea.innerHTML = simpleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglVaos = shaderCanvas.querySelector(
        "webgl-vertex-array-objects"
      );
      waitFor(() => webglVaos.content.size === 1)
        .then(() => {
          const vaoName = name + "-vao";
          const vao = webglVaos.content.get(vaoName);
          const count = vao.location0Count;
          assert.strictEqual(
            count,
            3,
            `${vaoName} VertexAttribPointer must have 3 triangles`
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
  it("keeps a list of variables affected per vertex array object", function (done) {
    const name = "vaos-five";
    domTestArea.innerHTML = simpleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglVaos = shaderCanvas.querySelector(
        "webgl-vertex-array-objects"
      );
      waitFor(() => webglVaos.content.size === 1)
        .then(() => {
          const vaoName = name + "-vao";
          const vao = webglVaos.content.get(vaoName);
          const vars = vao.vars;
          assert.strictEqual(
            vars.length,
            1,
            `${vaoName} VertexAttribPointer must have 1 variable`
          );
          assert.strictEqual(
            vars[0],
            "a_position",
            `${vaoName} VertexAttribPointer must have the a_position variable`
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
});
