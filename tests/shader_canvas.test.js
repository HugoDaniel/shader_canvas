// deno-lint-ignore-file
describe("<shader-canvas>", function () {
  beforeEach(function () {
    domTestArea.innerHTML = "";
  });
  const simpleTriangle = (w, h) => `
  <div id="trianglePoints">[-0.7, 0, 0, 0.5, 0.7, 0]</div>

  ${w && h ? `<shader-canvas width=${w} height=${h}>` : `<shader-canvas>`}
      <webgl-canvas>
          <draw-calls>
              <clear-color red="0" green="0" blue="0" alpha="1"></clear-color>
              <clear-flags mask="COLOR_BUFFER_BIT"></clear-flags>
              <use-program src="simple-triangle">
                  <draw-vao src="triangle-vao" count="3"></draw-vao>
              </use-program>
          </draw-calls>
          <webgl-buffers>
              <triangle-vertices>
                  <buffer-data src="#trianglePoints"></buffer-data>
              </triangle-vertices>
          </webgl-buffers>
          <webgl-vertex-array-objects>
              <triangle-vao>
                  <bind-buffer src="triangle-vertices">
                      <vertex-attrib-pointer variable="a_position" size="2">
                      </vertex-attrib-pointer>
                  </bind-buffer>
              </triangle-vao>
          </webgl-vertex-array-objects>
          <webgl-programs>
              <simple-triangle>
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
              </simple-triangle>
          </webgl-programs>
      </webgl-canvas>
  </shader-canvas>`;

  it("creates a canvas with the width, height from tag attributes", function (done) {
    domTestArea.innerHTML = simpleTriangle(123, 321);
    const shaderCanvas = document.querySelector("shader-canvas");
    // Shadow DOM is being changed asynchronously
    const observer = new MutationObserver(() => {
      assert.equal(shaderCanvas.width, 123, "Wrong width");
      assert.equal(shaderCanvas.height, 321, "Wrong height");
      done();
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });
  it("uses window dimensions by default", function (done) {
    domTestArea.innerHTML = simpleTriangle();
    const shaderCanvas = document.querySelector("shader-canvas");
    // Shadow DOM is being changed asynchronously
    const observer = new MutationObserver(() => {
      assert.equal(shaderCanvas.width, window.innerWidth, "Wrong width");
      assert.equal(shaderCanvas.height, window.innerHeight, "Wrong height");
      done();
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize().then(shaderCanvas.draw());
  });
  it("creates a <webgl-canvas> tag if none is present", function (done) {
    domTestArea.innerHTML = `<shader-canvas></shader-canvas>`;
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglCanvas = shaderCanvas.shadowRoot.querySelector("webgl-canvas");
      assert(webglCanvas, "<webgl-canvas> must be defined in the shadow DOM\n");
      done();
    });
    // Shadow DOM is being changed asynchronously
    observer.observe(shaderCanvas.shadowRoot, {
      childList: true,
    });
    shaderCanvas.initialize();
  });
});
