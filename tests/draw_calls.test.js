// deno-lint-ignore-file

describe("<draw-calls>", function () {
  const drawCode = (programName) => `
  <shader-canvas>
    <webgl-canvas>
      <draw-calls>
          <viewport-transform x="0" y="0"></viewport-transform>
          <clear-color red="0" green="0" blue="0" alpha="1"></clear-color>
          <clear-flags mask="COLOR_BUFFER_BIT"></clear-flags>
          <use-program src="${programName}">
              <active-texture var="u_texture" src="${programName}-texture"></active-texture>
              <draw-vao src="${programName}-vao"></draw-vao>
          </use-program>
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
            4,
            "Must read 4 draw functions"
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
          assert(
            calls[3].includes("useProgram"),
            "Incorrect order in <use-program>"
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
