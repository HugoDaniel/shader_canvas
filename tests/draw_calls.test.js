// deno-lint-ignore-file

describe("<draw-calls>", function () {
  const drawCode = (programName, fps = null) => `
  <shader-canvas>
    <webgl-canvas>
      <draw-calls>
          <viewport-transform x="0" y="0"></viewport-transform>
          <clear-color red="0" green="0" blue="0" alpha="1"></clear-color>
          <clear-flags mask="COLOR_BUFFER_BIT"></clear-flags>
          <draw-loop ${fps ? `fps="${fps}"` : ""}>
            <use-program src="${programName}">
                <active-texture var="u_texture" src="${programName}-texture"></active-texture>
                <draw-vao src="${programName}-vao"></draw-vao>
            </use-program>
          </draw-loop>
      </draw-calls>
      <webgl-textures>
          <${programName}-texture>
              <tex-image-2d src="#texture-draw"></tex-image-2d>
          </${programName}-texture>
      </webgl-textures>
      <webgl-buffers>
          <${programName}-vertices>
              <buffer-data src="#geometryCoords"></buffer-data>
          </${programName}-vertices>
          <${programName}-texture-coords>
              <buffer-data src="#textureCoords"></buffer-data>
          </${programName}-texture-coords>
      </webgl-buffers>
      <webgl-vertex-array-objects>
          <${programName}-vao>
              <bind-buffer src="${programName}-vertices">
                  <vertex-attrib-pointer variable="a_position" size="3">
                  </vertex-attrib-pointer>
              </bind-buffer>
              <bind-buffer src="${programName}-texture-coords">
                  <vertex-attrib-pointer variable="a_texcoord" size="2">
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
                      in vec2 a_texcoord;
                      
                      uniform mat4 u_matrix;
                      
                      out vec2 v_texcoord;
                      
                      void main() {
                        gl_Position = u_matrix * a_position;
                      
                        v_texcoord = a_texcoord;
                      }
                  </code>
              </vertex-shader>
              <fragment-shader>
                  <code>
                      #version 300 es

                      precision highp float;
                      
                      in vec2 v_texcoord;
                      
                      uniform sampler2D u_texture;
                      
                      out vec4 outColor;
                      
                      void main() {
                        outColor = texture(u_texture, v_texcoord);
                      }
                  </code>
              </fragment-shader>
          </${programName}>
      </webgl-programs>
  </webgl-canvas>
</shader-canvas>
<section id="assets" style="display: none">
  <div id="geometryCoords">[
      -0.5, 0.5, 0.5,
      0.5, 0.5, 0.5,
      -0.5, -0.5, 0.5,
      -0.5, -0.5, 0.5,
      0.5, 0.5, 0.5,
      0.5, -0.5, 0.5
      ]</div>
  <div id="textureCoords">
      [
      -3, -1,
      2, -1,
      -3, 4,
      -3, 4,
      2, -1,
      2, 4
      ]
  </div>
  <img id="texture-draw" src="../examples/2-textured-quad/f-texture.png">
</section>`;

  beforeEach(function () {
    domTestArea.innerHTML = "";
  });

  it("creates draw calls functions", function (done) {
    const name = "draw-one";
    domTestArea.innerHTML = drawCode(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const drawCallsElem = shaderCanvas.querySelector("draw-calls");
      waitFor(() => drawCallsElem.drawFunctions.length > 0)
        .then(() => {
          assert.equal(
            drawCallsElem.drawFunctions.length,
            3,
            "Must read 3 draw functions"
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
  it("calls the correct WebGL functions in order", function (done) {
    const name = "draw-two";
    domTestArea.innerHTML = drawCode(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const drawCallsElem = shaderCanvas.querySelector("draw-calls");
      waitFor(() => drawCallsElem.drawFunctions.length > 0)
        .then(() => {
          // Convert the functions to a string, and check if they have the
          // corresponding tag function.
          const calls = drawCallsElem.drawFunctions.map((c) => c.toString());
          assert(calls[0].includes("gl.viewport"), "Must start with viewport");
          assert(
            calls[1].includes("gl.clearColor"),
            "Incorrect order in <clear-color>"
          );
          assert(
            calls[2].includes("gl.clear"),
            "Incorrect order in <clear-flags>"
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

  it("sets the draw-loop desired fps with setTimeout", function (done) {
    const name = "draw-three";
    const fps = 20;
    let timeout = 0;
    // Mock setTimeout
    globalThis.setTimeout = (_, t) => {
      timeout = t;
    };
    domTestArea.innerHTML = drawCode(name, fps);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      waitFor(() => timeout > 0)
        .then(() => {
          const loop = shaderCanvas.querySelector("draw-loop");
          assert(loop.getAttribute("fps") === `${fps}`);
          assert(
            timeout === 1000 / fps,
            `Must have a timeout of ${1000 / fps}\n`
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

  it("starts the loop by default", function (done) {
    const name = "draw-four";
    const fps = 20;
    let started = false;
    // Mock setTimeout
    globalThis.setTimeout = () => {
      started = true;
    };
    domTestArea.innerHTML = drawCode(name, fps);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      waitFor(() => started === true)
        .then(() => {
          assert(started === true, "Must start by default\n");
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
