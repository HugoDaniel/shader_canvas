// deno-lint-ignore-file

describe("<webgl-buffers>", function () {
  const simpleTriangle = (programName) => `
  <div id="trianglePoints">[-0.7, 0, 0, 0.5, 0.7, 0]</div>
    <shader-canvas>
      <webgl-canvas>
          <draw-calls>
              <clear-color red="0" green="0" blue="0" alpha="1"></clear-color>
              <clear-flags mask="COLOR_BUFFER_BIT"></clear-flags>
              <use-program src="simple-triangle">
                  <draw-vao src="triangle-vao" count="3"></draw-vao>
              </use-program>
          </draw-calls>
          <webgl-buffers>
              <${programName}-vertices>
                  <buffer-data src="#trianglePoints"></buffer-data>
              </${programName}-vertices>
          </webgl-buffers>
          <webgl-vertex-array-objects>
              <${programName}-vao>
                  <bind-buffer src="triangle-vertices">
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

  it("creates custom buffer tag names", function (done) {
    const name = "buffers-one";
    domTestArea.innerHTML = simpleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglBuffers = shaderCanvas.querySelector("webgl-buffers");
      waitFor(() => webglBuffers.content.size === 1)
        .then(() => {
          assert.equal(webglBuffers.content.size, 1, "Must have 1 buffer");
          const bufferName = name + "-vertices";
          assert(
            webglBuffers.content.has(bufferName),
            `Must have the ${bufferName} buffer`
          );
          assert(
            customElements.get(bufferName),
            `Must have the tag <${bufferName}> defined`
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
  it("creates a WebGL buffer id", function (done) {
    const name = "buffers-two";
    domTestArea.innerHTML = simpleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglBuffers = shaderCanvas.querySelector("webgl-buffers");
      waitFor(() => webglBuffers.content.size === 1)
        .then(() => {
          const bufferName = name + "-vertices";
          const buffer = webglBuffers.content.get(bufferName);
          assert(buffer.buffer, `Must have the ${bufferName} buffer id`);
        })
        .then(() => done())
        .catch((error) => done(error));
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });
  it("<buffer-data> reads data from a queryElement source", function (done) {
    const name = "buffers-three";
    domTestArea.innerHTML = simpleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglBuffers = shaderCanvas.querySelector("webgl-buffers");
      waitFor(() => webglBuffers.content.size === 1)
        .then(() => {
          const bufferName = name + "-vertices";
          const buffer = webglBuffers.content.get(bufferName);
          assert(buffer.data, `${bufferName} must have data`);
          assert.equal(buffer.length, 6, `${bufferName} must load 6 floats`);
          assert.equal(
            buffer.data[3],
            0.5,
            `${bufferName} must load correctly`
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
  it("uses Float32Array by default", function (done) {
    const name = "buffers-four";
    domTestArea.innerHTML = simpleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglBuffers = shaderCanvas.querySelector("webgl-buffers");
      waitFor(() => webglBuffers.content.size === 1)
        .then(() => {
          const bufferName = name + "-vertices";
          const buffer = webglBuffers.content.get(bufferName);
          assert(
            buffer.data instanceof Float32Array,
            `${bufferName} must be a Float32Array`
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
  it.skip("uses Uint16Array for ELEMENT_ARRAY_BUFFER targets", function () {});
});
