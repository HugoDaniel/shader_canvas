# Getting Started

This is how you start

By downloading, installing and runining the following HTML CODE

## Creating a scene

This is how you create a scene...

## Installation

### Install from Deno

Installation from Deno is the preferred way.

### Install from NPM

Installation from NPM is also supported

### Install from CDN

Installation from CDN or self host.





```html
<shader-canvas>
<!--
  Shader Canvas starts with this tag
  Its children tags define what will
  be rendered.

  It can use multiple graphical API
  backends.
-->
  <webgl-canvas>
<!--
  Start the WebGl backend
  (the only one supported for now)

  Inside this element, each tag
  corresponds to its low level
  WebGL function.
-->

    <draw-calls>
<!--
  List the actions to perform when
  drawing. Each tag matches the
  corresponding WebGL function.
-->
      <clear-color red="0" green="0" blue="0" alpha="1"></clear-color>
<!--
  The <clear-color> matches the
  WebGL "clearColor()" function

  There is one of these for each
  WebGL function.
-->
      <clear-flags mask="COLOR_BUFFER_BIT"></clear-flags>
<!--
  The <clear-flags> matches the
  WebGL "clearFlags()" function

  Each tag has attributes according
  to the names given to the function
  arguments in the WebGL spec.
-->

      <use-program src="simple-triangle">
<!-- 
  Likewise <use-program> matches the
  "useProgram()" function.
  The "src" attribute can reference
  the tag name that defines the
  WebGL program to use.

  In this case <use-program> will
  look for the <simple-triangle>
  program, defined bellow.
-->
        <draw-vao src="triangle-vao"></draw-vao>
<!--
  Any tag inside <use-program>
  has the program bound to it.

  Here, <draw-vao> is calling the
  WebGL draw function for the
  Vertex Array Object defined
  bellow at the tag <triangle-vao>.
  (VAO stands for Vertex Array Object).
-->
      </use-program>
    </draw-calls>


<!--
  Besides the <draw-calls> the 
  <webgl-canvas> can have 4 containers:
   - <webgl-programs>
      * every child will be a program
   - <webgl-buffers>
      * every child will be a buffer
   - <webgl-textures>
      * every child will be a texture
   - <webgl-vertex-array-objects>
      * every child will be a
        vertex-array-object

  Their direct children tag names can
  be used as a reference in the "src"
  attribute of other tags.
-->
    <webgl-programs>
<!--
  Inside the <webgl-programs> container
  you can define the WebGL programs
  by specifying a unique tag name to
  each program.
-->
      <simple-triangle>
<!--
  Here starts the program
  "simple-triangle". Any name could
  be set.
-->
        <vertex-shader>
<!--
  A WebGL program has a vertex-shader
  and a fragment-shader.
-->
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

    <webgl-vertex-array-objects>
<!-- 
  <webgl-vertex-array-objects> works
  like <webgl-programs>: you can put
  any name here as a child tag,
  provided it is unique.

  Other tags can then reference this
  name in their "src" attributes.
-->
      <triangle-vao>
<!-- 
  Here a Vertex Array Object
  called "triangle-vao" is being
  defined.
-->
        <bind-buffer src="triangle-vertices">
<!--
  <bind-buffer> corresponds to the
  WebGL function "bindBuffer()"

  It is referencing the tag 
  "triangle-vertices" which is
  a buffer defined bellow
  in <webgl-buffers>
-->
          <vertex-attrib-pointer variable="a_position" size="2">
          </vertex-attrib-pointer>
<!--
  Any child of <bind-buffer> will
  have the referenced buffer bound.

  Here the <vertex-attrib-pointer>
  will use the "vertexAttribPointer()"
  function for the buffer set at the
  <triangle-vertices> tag.
-->
        </bind-buffer>
      </triangle-vao>
    </webgl-vertex-array-objects>

<!--
  <webgl-buffers> is a container like
  <webgl-vertex-array-objects> and 
  <webl-programs>.

  It is used to set buffers and their
  data. In WebGL the buffers data is
  separated from their meaning and usage.

  <webgl-vertex-array-objects>,
  <webgl-programs> and <webgl-textures>
  can provide meaning and use the
  buffers declared here.
-->
    <webgl-buffers>
      <triangle-vertices>
        <buffer-data src="#trianglePoints"></buffer-data>
<!--
  The tag <buffer-data> is equivalent
  to the "bufferData" WebGL function.

  The "src" attribute can also be an
  element query string (used in the
  "querySelector" function), as well as
  a url that can point to the data to load.
--> 
      </triangle-vertices>
    </webgl-buffers>

  </webgl-canvas>
</shader-canvas>

<!-- The data for the buffer -->
<div id="trianglePoints">[-0.7, 0, 0, 0.5, 0.7, 0]</div>
```

# Reference
