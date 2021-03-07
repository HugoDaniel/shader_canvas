// deno-lint-ignore-file
describe("<webgl-programs>", function () {
  beforeEach(function () {
    domTestArea.innerHTML = "";
  });
  const simpleTriangle = (programName, shaderCode = null) => `
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
              <${programName}>
                  ${
                    shaderCode
                      ? shaderCode
                      : `
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
                  `
                  }
              </${programName}>
          </webgl-programs>
      </webgl-canvas>
  </shader-canvas>`;

  it("creates custom program tags", function (done) {
    const name = "program-one";
    domTestArea.innerHTML = simpleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglPrograms = shaderCanvas.querySelector("webgl-programs");
      waitFor(() => webglPrograms.content.size > 0)
        .then(() => {
          assert.equal(webglPrograms.content.size, 1, "Must have 1 program");
          assert(
            webglPrograms.content.get(name),
            `Must have the ${name} program`
          );
          assert(
            customElements.get(name),
            `Must have the tag <${name}> defined`
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

  it("can compile GLSL programs", function (done) {
    const name = "program-two";
    domTestArea.innerHTML = simpleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglPrograms = shaderCanvas.querySelector("webgl-programs");
      waitFor(() => webglPrograms.content.has(name))
        .then(() => {
          const glslProgram = webglPrograms.content.get(name);
          assert.equal(glslProgram.log, "Status: Nothing to report");
          assert(glslProgram.program);
        })
        .then(() => done())
        .catch((error) => done(error));
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });

  it("can keep track of vertex attribute locations", function (done) {
    const name = "program-three";
    domTestArea.innerHTML = simpleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglPrograms = shaderCanvas.querySelector("webgl-programs");
      waitFor(() => webglPrograms.content.has(name))
        .then(() => {
          const locations = webglPrograms.locations.attributes;
          assert.equal(locations.size, 1, "Must have one attribute");
          assert(locations.has("a_position"), "a_position must be found");
        })
        .then(() => done())
        .catch((error) => done(error));
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });
  it("reads the vertex and fragment shader code", function (done) {
    const name = "program-four";
    domTestArea.innerHTML = simpleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglPrograms = shaderCanvas.querySelector("webgl-programs");
      waitFor(() => webglPrograms.content.has(name))
        .then(() => {
          const glslProgram = webglPrograms.content.get(name);
          assert(glslProgram.vertexShader, "Must have a vertex shader defined");
          assert(
            glslProgram.fragmentShader,
            "Must have a fragment shader defined"
          );

          const vertexCode = glslProgram.vertexShader.code.split("\n");
          const fragmentCode = glslProgram.fragmentShader.code.split("\n");
          assert.equal(vertexCode[0], "#version 300 es");
          assert.equal(vertexCode[1].trim(), "in vec4 a_position;");
          assert.equal(fragmentCode[0], "#version 300 es");
          assert.equal(fragmentCode[1].trim(), "precision highp float;");
        })
        .then(() => done())
        .catch((error) => done(error));
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });

  it("parses shader variables", function (done) {
    const name = "program-five";
    domTestArea.innerHTML = simpleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglPrograms = shaderCanvas.querySelector("webgl-programs");
      waitFor(() => webglPrograms.content.has(name))
        .then(() => {
          const glslProgram = webglPrograms.content.get(name);
          const vertexVars = glslProgram.vertexShader.variables;
          const fragmentVars = glslProgram.fragmentShader.variables;
          assert.equal(vertexVars.length, 1, "Must read one vertex variable");
          assert.equal(
            fragmentVars.length,
            1,
            "Must read one fragment variable"
          );
          assert.equal(
            vertexVars[0].name,
            "a_position",
            "Must read the variable 'a_position'"
          );
          assert.equal(
            fragmentVars[0].name,
            "outColor",
            "Must read the variable 'outColor'"
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

  it("attaches shader code", function (done) {
    const name = "program-six";
    domTestArea.innerHTML = simpleTriangle(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglPrograms = shaderCanvas.querySelector("webgl-programs");
      waitFor(() => webglPrograms.content.has(name))
        .then(() => {
          const glslProgram = webglPrograms.content.get(name);
          const vertexShaderId = glslProgram.vertexShader.shader;
          const fragmentShaderId = glslProgram.fragmentShader.shader;
          assert(vertexShaderId, "Must have a vertex shader id defined");
          assert(fragmentShaderId, "Must have a fragment shader id defined");
        })
        .then(() => done())
        .catch((error) => done(error));
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });

  it("merges multiple code tags", function (done) {
    const name = "program-seven";
    domTestArea.innerHTML = simpleTriangle(
      name,
      `
    <vertex-shader>
      <code>
        #version 300 es
        in vec4 a_position;
      </code>
      <code>
       void main() {
      </code>
      <code>
        gl_Position = a_position;
      </code>
      <code>
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
    `
    );
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglPrograms = shaderCanvas.querySelector("webgl-programs");
      waitFor(() => webglPrograms.content.has(name))
        .then(() => {
          const glslProgram = webglPrograms.content.get(name);
          const vertexShaderCode = glslProgram.vertexShader.code;
          assert(vertexShaderCode.length > 0);
          assert(vertexShaderCode.split("\n").length === 5);
        })
        .then(() => done())
        .catch((error) => done(error));
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });
  it("preserves order of code tags", function (done) {
    const name = "program-eight";
    domTestArea.innerHTML = simpleTriangle(
      name,
      `
    <vertex-shader>
      <code>
        #version 300 es
        in vec4 a_position;
      </code>
      <code>
       void main() {
      </code>
      <code>
        gl_Position = a_position;
      </code>
      <code>
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
    `
    );
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglPrograms = shaderCanvas.querySelector("webgl-programs");
      waitFor(() => webglPrograms.content.has(name))
        .then(() => {
          const glslProgram = webglPrograms.content.get(name);
          const vertexShaderCode = glslProgram.vertexShader.code.split("\n");
          console.log(vertexShaderCode[2]);
          assert(vertexShaderCode[0].includes("version 300 es"));
          assert(vertexShaderCode[1].includes("in vec4 a_position"));
          assert(vertexShaderCode[2].includes("void main() {"));
          assert(vertexShaderCode[3].includes("gl_Position = a_position"));
        })
        .then(() => done())
        .catch((error) => done(error));
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });

  it("always places #version on top", function (done) {
    const name = "program-nine";
    domTestArea.innerHTML = simpleTriangle(
      name,
      `
    <vertex-shader>
      <code>
        in vec4 a_position;
      </code>
      <code>
       void main() {
      </code>
      <code>
        gl_Position = a_position;
      </code>
      <code>
      #version 300 es
      </code>
      <code>
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
    `
    );
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglPrograms = shaderCanvas.querySelector("webgl-programs");
      waitFor(() => webglPrograms.content.has(name))
        .then(() => {
          const glslProgram = webglPrograms.content.get(name);
          const vertexShaderCode = glslProgram.vertexShader.code.split("\n");
          assert(vertexShaderCode[0].includes("version 300 es"));
          assert(vertexShaderCode[1].includes("in vec4 a_position"));
          assert(vertexShaderCode[2].includes("void main() {"));
          assert(vertexShaderCode[3].includes("gl_Position = a_position"));
        })
        .then(() => done())
        .catch((error) => done(error));
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });
  it("merges the code-before and code-after in the correct order", function (done) {
    const name = "program-ten";
    domTestArea.innerHTML = simpleTriangle(
      name,
      `
  <vertex-shader>
      <code-after>
      vec4 panZoom2D(in vec4 _pos) {
        return _pos + vec4(1.0, 1.0, 1.0, 1.0);
      }
      </code-after>
      <code>
          #version 300 es
          in vec4 a_position;
          void main() {
              gl_Position = a_position;
          }
      </code>
      <code-before>

      vec4 panZoom2D(in vec4 _pos);
      </code-before>
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
`
    );
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglPrograms = shaderCanvas.querySelector("webgl-programs");
      waitFor(() => webglPrograms.content.has(name))
        .then(() => {
          const glslProgram = webglPrograms.content.get(name);
          const vertexShaderCode = glslProgram.vertexShader.code.split("\n");
          console.log(vertexShaderCode);
          assert(vertexShaderCode[0].includes("version 300 es"));
          assert(vertexShaderCode[1].includes("vec4 panZoom2D(in vec4 _pos);"));
          assert(
            vertexShaderCode[6].includes("vec4 panZoom2D(in vec4 _pos) {")
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
