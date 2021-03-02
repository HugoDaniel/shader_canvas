// deno-lint-ignore-file

describe("<webgl-textures>", function () {
  const textureCode = (programName) => `
  <shader-canvas>
  <webgl-canvas>
      <draw-calls>
          <viewport-transform x="0" y="0"></viewport-transform>
          <clear-color red="0" green="0" blue="0" alpha="1"></clear-color>
          <clear-flags mask="COLOR_BUFFER_BIT"></clear-flags>
          <use-program src="${programName}">
              <active-texture var="u_texture" src="${programName}-texture"></active-texture>
              <draw-vao src="${programName}-vao" count="6"></draw-vao>
          </use-program>
      </draw-calls>
      <webgl-textures>
          <${programName}-texture>
              <tex-image-2d src="#texture"></tex-image-2d>
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
  <img id="texture" src="../examples/2-textured-quad/f-texture.png">
</section>`;

  beforeEach(function () {
    domTestArea.innerHTML = "";
  });

  it("creates custom texture object tag names", function (done) {
    const name = "textures-one";
    domTestArea.innerHTML = textureCode(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglTextures = shaderCanvas.querySelector("webgl-textures");
      waitFor(() => webglTextures.content.size === 1)
        .then(() => {
          assert.equal(webglTextures.content.size, 1, "Must have 1 texture");
          const textureName = name + "-texture";
          assert(
            webglTextures.content.has(textureName),
            `Must have the ${textureName} texture`
          );
          assert(
            customElements.get(textureName),
            `Must have the tag <${textureName}> defined`
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

  it("creates a WebGL Texture id", function (done) {
    const name = "textures-two";
    domTestArea.innerHTML = textureCode(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglTextures = shaderCanvas.querySelector("webgl-textures");
      waitFor(() => webglTextures.content.size === 1)
        .then(() => {
          const textureName = name + "-texture";
          const texture = webglTextures.content.get(textureName);
          assert(texture.texture, `The WebGL texture id must be defined`);
        })
        .then(() => done())
        .catch((error) => done(error));
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });

  it("reads image data from querySelector src", function (done) {
    const name = "textures-three";
    domTestArea.innerHTML = textureCode(name);
    const shaderCanvas = document.querySelector("shader-canvas");
    const observer = new MutationObserver(() => {
      const webglTextures = shaderCanvas.querySelector("webgl-textures");
      waitFor(() => webglTextures.content.size === 1).then(() => {
        const textureName = name + "-texture";
        const texture = webglTextures.content.get(textureName);
        const texImage2d = texture.querySelector("tex-image-2d");
        waitFor(() => texImage2d.data)
          .then(() => {
            assert(texImage2d.data, `The WebGL texture must load`);
          })
          .then(() => done())
          .catch((error) => done(error));
      });
    });
    observer.observe(shaderCanvas.root, {
      childList: true,
    });
    shaderCanvas.initialize();
  });
});
