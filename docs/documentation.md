+++
title = "Shader Canvas"
description = "A graphics framework for specialists"
template = "project.html"
date = 2021-02-16
extra = { showTOC = true, github = "https://github.com/HugoDaniel/shader_canvas", intro = "/projects/shader-canvas", docs = "#", author = "Hugo Daniel", class="project documentation center-images", social_img = "/images/shader-canvas-logo.png" }
+++

# Getting Started

Shader Canvas is made with [Deno](https://deno.land) and intended to be used
as a bundle in an HTML file that makes use of its specific Web
Components tags.

### 3 step setup

You can begin using Shader Canvas with these 3 steps.

1. _Step 1_ Start with a simple HTML file for your project:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Using Shader Canvas</title>
</head>

<body>
  <shader-canvas>
    <!-- Use the shader canvas tags here -->
  </shader-canvas>
</body>
</html>
```

2. _Step 2_ Include the Shader Canvas bundle in the HTML file

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Using Shader Canvas</title>
</head>

<body>
  <shader-canvas>
    <!-- Use the shader canvas tags here -->
  </shader-canvas>


  <script type="module">
    import { ShaderCanvas } from "https://cdn.deno.land/shader_canvas/versions/v1.1.1/raw/build/shader_canvas.min.js";
  </script>
</body>
</html>
```

3. _Step 3_ Initialize the Shader Canvas components and draw them

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Using Shader Canvas</title>
</head>

<body>
  <shader-canvas>
    <!-- Use the shader canvas tags here -->
  </shader-canvas>

  <script type="module">
    import { ShaderCanvas } from "https://cdn.deno.land/shader_canvas/versions/v1.1.1/raw/build/shader_canvas.min.js";

    window.addEventListener("load", async () => {
      const c = document.querySelector("shader-canvas");
      if (c instanceof ShaderCanvas) {
        await c.initialize();
        c.draw()
      }
    })
    </script>
</body>
</html>
```

### Using Deno

Only Deno is supported for now to use and bundle Shader Canvas in your project.

To do that use the import from the [`deno.land`](https://deno.land/x/shader_canvas@v1.1.1)
file directly:

```typescript
import { ShaderCanvas } from "https://deno.land/x/shader_canvas@v1.1.1/shader_canvas.ts"

// your project code ...
```

And run your project `deno bundle` CLI command or equivalent on it.

## Creating a scene

To create a scene in Shader Canvas you have to think of it in the low-level
elements from the graphics framework that you want to draw with.

For now there is only WebGL, which means that a scene has to be made to work
with the following parts:

- Programs (how is it going to be expressed in GLSL?)
- Buffers (what raw binary data it might need?)
- Textures (what raw image data it might need?)
- Vertex Array Objects (what information to send in each vertex?)

The Shader Canvas provides the tag [`<webgl-canvas>`](#WebGLCanvas) to hold all
of the WebGL related tags. In this tag the following container tags can be used
to define each of the above parts:

- [`<webgl-programs>`](#WebGLPrograms)
- [`<webgl-buffers>`](#WebGLBuffers)
- [`<webgl-textures>`](#WebGLTextures)
- [`<webgl-vertex-array-objects>`](#WebGLVertexArrayObjects)

Within each of these tags you create new parts for your program. Each of their
children is a uniquely named new tag that you create. This new name is then
referenced by other tags (if you create a buffer named "monkey-vertices" then
you can reference it in a Vertex Array Object with that name).

And finally the `<webgl-canvas>` also has a container for the drawing
instructions:

- [`<draw-calls>`](#DrawCalls)

This contains an ordered list of WebGL actions to perform (Each WebGL function 
has its corresponding tag).

### Textured rectangle

For a simple textured rectangle this means that you would need the following:

#### Textures

- An image to use as texture.

#### Buffers

- Vertices positions for the rectangle.
- Texture positions for the rectangle.

#### Programs

- A vertex shader that reads the vertices positions and texture coordinates and
  places them in the screen
- A fragment shader that reads the texture and its coordinates and uses it to 
  paint its interpolated rectangle pixel position.

#### Vertex Array Objects

- Assign the buffers for the vertex positions and texture coordinates to their 
  respective variables in the program.

#### Example

A working textured rectangle example of this can be read at the [project GitHub
repository](https://github.com/HugoDaniel/shader_canvas/blob/main/examples/2-textured-quad/index.html).

It is a rework of the [WebGL2Fundamentals](https://webgl2fundamentals.org)
examples with Shader Canvas.

## Modules

Shader Canvas modules allows you to have reusable shader code parts and create your
tags that merge WebGL functionality in each of the `<webgl-canvas>` parts.

To create your modules you have to think that they act like a blueprint of
tags that get pasted and merged with the parent where the module tag shows.

### Animation module

To begin a Shader Canvas module you need a unique name for it. This name
must be a valid Web Component tag name. It must have at least one '-' character.

For this example the module is going to be named `with-anim`.

To declare a new module, place its unique name as a child tag of the Shader
Canvas `<new-modules>` tag:

```html
<shader-canvas>
  <new-modules>
    <with-anim>
      <!-- Module blueprint here -->
    </with-anim>
  </new-modules>
</shader-canvas>
```

Inside it, any of the `<webgl-canvas>` containers might be defined
(`<webgl-programs>`, `<webgl-buffers>`, `<webgl-textures>`,
`<webgl-vertex-array-objects>` and `<draw-calls>`).

If after this declaration you use this new `<with-anim>` tag in Shader Canvas,
these containers corresponding HTML part will be copied and merged
into the final `<webgl-canvas>` corresponding tag.

As an example, if you declare a new buffer as a child of your tag in the
`<new-modules>`, then when the tag is used directly in `<shader-canvas>` it
will copy that buffer into the final `webgl-canvas` buffers.

```html
<shader-canvas>
  <new-modules>
    <with-anim>
      <!-- Module blueprint here -->
      <webgl-buffers>
        <my-animated-buffer>
          <buffer-data src="monkey.obj"></buffer-data>
        </my-animated-buffer>
      </webgl-buffers>
    </with-anim>
  </new-modules>

  <!--
    Using the tag outside <new-modules> merges
    its containers with the final ones on
    <webgl-canvas>
  -->
  <with-anim></with-anim>
</shader-canvas>
```

This works well for the main parts of the `<webgl-canvas>`. To have a GLSL 
program reusable part, that is specific to a program inside `<webgl-programs>`,
the Shader Canvas module system provides a specific module tag:

- [`<webgl-program-part>`](#WebGLProgramPart)

Inside this tag, code parts of `<vertex-shader>`and `<fragment-shader>` tags can
be reused in many programs.

#### Example

A working example of the animation module can be read at the [project GitHub
repository](https://github.com/HugoDaniel/shader_canvas/blob/main/examples/3-animation/index.html).

Like the other examples, it is a rework of the
[WebGL2Fundamentals](https://webgl2fundamentals.org) examples with Shader Canvas.

# ShaderCanvas API

The ShaderCanvas API consists of static functions you can call to perform actions
at given key moments of the framework.

## Mandatory functions

The basic and essential actions are:

- `ShaderCanvas.initialize`

   _An async function that reads the DOM tree under `<shader-canvas>` and
    creates the functions to render the WebGL parts declared._

- `ShaderCanvas.draw` 

   _A function that calls the render function created by `ShaderCanvas.initialize()`,
   it might start a loop if there is a [`<draw-loop>`](#DrawLoop) tag present under the
   [`<draw-calls>`](#DrawCalls)._

These two functions must be called for Shader Canvas to render anything.

They can be seen in action in all of the
[provided examples](https://github.com/HugoDaniel/shader_canvas/blob/main/examples/1-triangle/index.html).

## Utility functions

Starting and stopping the drawing loop can be done with the instance functions:

- `<shaderCanvasInstance>.startLoop`

  _Starts the drawing loop if there is one defined and it is not started._

- `<shaderCanvasInstance>.stopLoop`

  _Stops the drawing loop if there is one defined and it is started._

You can define a drawing loop with the [`<draw-loop>`](#DrawLoop) tag.

<hr></hr>

# Reference

This section lists all the new HTML elements that Shader Canvas introduces.
## `<active-texture>` {#ActiveTexture}

This tag is the equivalent of the [WebGL `activeTexture() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/activeTexture).

It sets the texture pointed by the `src` attribute as the target for the
actions defined as children.

Place tags inside this one to perform actions in the texture this tag is
referencing.

The allowed children are:

- [`<tex-parameter-i>`](#TexParameterI)
- [`<tex-parameter-f>`](#TexParameterF)

The `<active-texture>` tag is meant to be used as a child of the
[`<draw-calls>`](#DrawCalls) list of actions.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/active_texture.ts#L19">View Source</a></small></em>

### Attributes of `<ActiveTexture>`

#### _[src](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/active_texture.ts#L62)_

A string that references a texture name.

This must be the name of a tag available in the `<webgl-textures>`
container.
#### _[var](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/active_texture.ts#L68)_

A string with the GLSL variable name to put this texture at.


<hr>

## `<bind-buffer>` {#BindBuffer}

This tag is the equivalent of the [WebGL `bindBuffer() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer).

Its child tags will be bound with the buffer specified by this tag
"src" attribute.

The `<bind-buffer>` tag can be used in a `<vertex-array-object>` to
associate variables and their contents to areas of a buffer defined in
the `<webgl-buffers>` container.
 
The allowed children are:

- [`<vertex-attrib-pointer>`](#VertexAttribPointer) _WebGL _

**Example**

```html
<shader-canvas>
 <webgl-canvas>
   <webgl-vertex-array-objects>
     <some-cool-vao>
       <bind-buffer src="big-raw-data">
         <!-- vertex-attrib-pointers here -->
       </bind-buffer>
     </some-cool-vao>
   <webgl-vertex-array-objects>
   <webgl-buffers>
     <!-- src references these buffer tag names -->
     <big-raw-data>
       <buffer-data src="data.json"></buffer-data>
     </big-raw-data>
   </webgl-buffers>
 </webgl-canvas>
</shader-canvas>
```

For a usable example check the
[3rd example - animation](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/3-animation)

The `<bind-buffer>` tag is meant to be used as a child of the
[`<{{vao-name}}>`](#CreateVertexArray) custom named tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_vertex_array_objects/bind_buffer.ts#L29">View Source</a></small></em>

### Attributes of `<BindBuffer>`

#### _[src](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_vertex_array_objects/bind_buffer.ts#L82)_

The bind buffer `src` attribute is a string that references a buffer.

This must be the name of a tag available in the `<webgl-buffers>`
container.


<hr>

## `<blend-func>` {#BlendFunc}

This tag is the equivalent of the [WebGL `blendFunc() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc).

It sets the function WebGL uses to do the pixel blending arithmetic.

The presence of this tag automatically sets `gl.enable(gl.BLEND)`

No child tags allowed in `<blend-func>`.

The `<blend-func>` tag is meant to be used as a child of the
[`<draw-calls>`](#DrawCalls) list of actions.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/blend_func.ts#L66">View Source</a></small></em>

### Attributes of `<BlendFunc>`

#### _[sfactor](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/blend_func.ts#L117)_

A string specifying a multiplier for the _source_ blending factors. The
default value is `gl.ONE`.

Possible values:
- `"ZERO"`
- `"ONE"` _(default)_
- `"SRC_COLOR"`
- `"ONE_MINUS_SRC_COLOR"`
- `"DST_COLOR"`
- `"ONE_MINUS_DST_COLOR"`
- `"SRC_ALPHA"`
- `"ONE_MINUS_SRC_ALPHA"`
- `"DST_ALPHA"`
- `"ONE_MINUS_DST_ALPHA"`
- `"CONSTANT_COLOR"`
- `"ONE_MINUS_CONSTANT_COLOR"`
- `"CONSTANT_ALPHA"`
- `"ONE_MINUS_CONSTANT_ALPHA"`
- `"SRC_ALPHA_SATURATE"`
#### _[dfactor](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/blend_func.ts#L142)_

A string specifying a multiplier for the _destination_ blending factors.
The default value is `gl.ZERO`.

Possible values:
- `"ZERO"` _(default)_
- `"ONE"`
- `"SRC_COLOR"`
- `"ONE_MINUS_SRC_COLOR"`
- `"DST_COLOR"`
- `"ONE_MINUS_DST_COLOR"`
- `"SRC_ALPHA"`
- `"ONE_MINUS_SRC_ALPHA"`
- `"DST_ALPHA"`
- `"ONE_MINUS_DST_ALPHA"`
- `"CONSTANT_COLOR"`
- `"ONE_MINUS_CONSTANT_COLOR"`
- `"CONSTANT_ALPHA"`
- `"ONE_MINUS_CONSTANT_ALPHA"`
- `"SRC_ALPHA_SATURATE"`


<hr>

## `<buffer-data>` {#BufferData}

This tag is the equivalent of the [WebGL `bufferData() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData).
It loads the data at the location set by the `src` attribute.

The data loaded is bounded to the buffer it has as parent. 

No child tags allowed in `<buffer-data>`.

**Example**

```html
<shader-canvas>
 <webgl-canvas>
   <webgl-buffers>
     <super-huge-buffer>
       <buffer-data src="/mesh.json"></buffer-data>
       <!-- 
          loads the `mesh.json` file and sets it as
          the data for the `super-huge-buffer`
       -->
     </super-huge-buffer>
   </webgl-buffers>
 </webgl-canvas>
</shader-canvas>
```


For a usable example check the
[1st example - simple triangle](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/1-triangle)

The `<buffer-data>` tag is meant to be used as a child of the
[`<{{buffer-name}}>`](#CreateBuffer) custom named tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_buffers/buffer_data.ts#L109">View Source</a></small></em>

### Attributes of `<BufferData>`

#### _[target](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_buffers/buffer_data.ts#L174)_

The buffer data target attribute that specifies the WebGL binding point.

This attribute allows the same values that the "target" parameter of the
[`gl.bufferData()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData#parameters)
function does: 

- `"ARRAY_BUFFER"` _(default)_
- `"ELEMENT_ARRAY_BUFFER"`
- `"COPY_READ_BUFFER"`
- `"COPY_WRITE_BUFFER"`
- `"TRANSFORM_FEEDBACK_BUFFER"`
- `"UNIFORM_BUFFER"`
- `"PIXEL_PACK_BUFFER"`
- `"PIXEL_UNPACK_BUFFER"`

**Example**

```html
<buffer-data
   target="ELEMENT_ARRAY_BUFFER"
   src="data.json">
</buffer-data>
```
#### _[size](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_buffers/buffer_data.ts#L183)_

The buffer data `size` attribute sets the size in bytes of the WebGL 
buffer object's data store.

This attribute is a number.
#### _[usage](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_buffers/buffer_data.ts#L204)_

The buffer data "usage" attribute that specifies the WebGL intended usage
pattern of the data store for optimization purposes.

This attribute allows the same values that the "usage" parameter of the
[`gl.bufferData()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData#parameters)
function does: 

- `"STATIC_DRAW"` _(default)_
- `"DYNAMIC_DRAW"`
- `"STREAM_DRAW"`
- `"STATIC_READ"`
- `"DYNAMIC_READ"`
- `"STREAM_READ"`
- `"STATIC_COPY"`
- `"DYNAMIC_COPY"`
- `"STREAM_COPY"`
#### _[offset](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_buffers/buffer_data.ts#L213)_

The buffer data "offset" attribute that sets the offset in bytes to where
the raw data starts.

This attribute is a number (defaults to 0).
#### _[src](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_buffers/buffer_data.ts#L224)_

This attribute is used to get the raw data from.

It can be a URL, a query selector, or a JSON array with the data.

If it is a query selector _`("#someId")`_, the element `textContent` will
be read and parsed as JSON.


<hr>

## `<clear-color>` {#ClearColor}

This tag is the equivalent of the [WebGL `clearColor() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearColor).

It specifies the RGBA color values used when clearing color buffers.

No child tags allowed in `<clear-color>`.

The `<clear-color>` tag is meant to be used as a child of the
[`<draw-calls>`](#DrawCalls) list of actions.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/clear_color.ts#L9">View Source</a></small></em>

### Attributes of `<ClearColor>`

#### _[red](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/clear_color.ts#L44)_

The "red" color value, a number between 0.0 and 1.0.
Defaults to 0.
#### _[green](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/clear_color.ts#L51)_

The "green" color value, a number between 0.0 and 1.0.
Defaults to 0.
#### _[blue](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/clear_color.ts#L58)_

The "blue" color value, a number between 0.0 and 1.0.
Defaults to 0.
#### _[alpha](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/clear_color.ts#L65)_

The "alpha" color value, a number between 0.0 and 1.0.
Defaults to 0.


<hr>

## `<clear-depth>` {#ClearDepth}

This tag is the equivalent of the [WebGL `clearDepth() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearDepth).

It specifies the clear value for the depth buffer.

No child tags allowed in `<clear-depth>`.

The `<clear-depth>` tag is meant to be used as a child of the
[`<draw-calls>`](#DrawCalls) list of actions.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/clear_depth.ts#L9">View Source</a></small></em>

### Attributes of `<ClearDepth>`

#### _[depth](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/clear_depth.ts#L41)_

A number specifying the depth value used when the depth buffer is cleared.
Default value: 1.


<hr>

## `<clear-flags>` {#ClearFlags}

This tag is the equivalent of the [WebGL `clear() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clear).

It clears the WebGL buffers to their preset values.

No child tags allowed in `<clear-flags>`.

The `<clear-color>` tag is meant to be used as a child of the
[`<draw-calls>`](#DrawCalls) list of actions.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/clear_flags.ts#L9">View Source</a></small></em>

### Attributes of `<ClearFlags>`

#### _[mask](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/clear_flags.ts#L34)_

A string that sets the "mask" of the clear method.

This string can contain the three following strings separated by the
char "|":
- `"COLOR_BUFFER_BIT"`
- `"DEPTH_BUFFER_BIT"`
- `"STENCIL_BUFFER_BIT"`


<hr>

## `<clear-stencil>` {#ClearStencil}

This tag is the equivalent of the [WebGL `clearStencil() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearStencil).

It specifies the clear value for the WebGL stencil buffer.

No child tags allowed in `<clear-stencil>`.

The `<clear-stencil>` tag is meant to be used as a child of the
[`<draw-calls>`](#DrawCalls) list of actions.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/clear_stencil.ts#L9">View Source</a></small></em>

### Attributes of `<ClearStencil>`

#### _[s](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/clear_stencil.ts#L40)_

A number specifying the index used when the stencil buffer is cleared.
Default value: 0.


<hr>

## `<{{buffer-name}}>` {#CreateBuffer}

You chose the tag name for your buffers when declaring them. The tag name
is used to represent the name for the buffer. This name is then used to
reference this buffer in other Shader Canvas containers and parts (like
vertex array objects and draw calls).

The allowed children of a buffer are:

- [`<buffer-data>`](#BufferData) _WebGL Buffer Data source_

**Example**

```html
<shader-canvas>
 <webgl-canvas>
   <webgl-buffers>
     <!--
       Create your WebGL buffers here by specifying a
       tag name that uniquely identifies them.
     -->
     <super-huge-buffer>
       <buffer-data src="/mesh.json"></buffer-data>
     </super-huge-buffer>
   </webgl-buffers>
 </webgl-canvas>
</shader-canvas>
```

For a usable example check the
[1st example - simple triangle](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/1-triangle)

This custom named tag is meant to be used as a child of the
[`<webgl-buffers>`](#WebGLBuffers) container tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_buffers/create_buffer.ts#L15">View Source</a></small></em>



<hr>

## `<{{module-name}}>` {#CreateModule}

You chose the tag name for your modules when declaring them.

If it happens inside the `<new-modules>` tag, then the module tag name is
used to declare the DOM blueprint that is intended to be merged when the
module tag is used elsewhere.

If it happens outside the `<new-modules>` tag, then the module tag name is
used to merge its DOM blueprint (the child nodes it contains in the
`<new-modules>`) at the location it is at.

The allowed children of a module are:

- All Shader Canvas tags
- [`<webgl-program-part>`](#WebGLProgramPart) _Specifies a part of
  a [`<{{program-name}}>`](#CreateProgram) to be merged if this module is
  used inside a program._

**Example**

```html
<shader-canvas>
  <new-modules>
    <my-crazy-module>
      <!--
       Create your Shader Canvas partial code here.
      -->
    </my-crazy-module>
  </new-modules>

  <!-- merge the module code here -->
  <my-crazy-module></my-crazy-module>
</shader-canvas>
```

For a usable example check the
[4th example - composition](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/4-composition)

This custom named tag is meant to be used as a child of the
[`<new-modules>`](#NewModules) container tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/new_modules/create_module.ts#L17">View Source</a></small></em>



<hr>

## `<{{program-name}}>` {#CreateProgram}

The tag name is set by you when declaring a program. Use the tag name
to represent the program name. This name is then used to reference this
program in other Shader Canvas containers and parts.

The allowed children of a program are:

- [`<vertex-shader>`](#VertexShader) _WebGL Vertex Shader code_
- [`<fragment-shader>`](#FragmentShader) _WebGL Fragment Shader code_
- Any module tag defined inside the Shader Canvas
  [`<new-modules>`](#NewModules) tag

**Example**

```html
<shader-canvas>
 <webgl-canvas>
   <webgl-programs>
     <!--
       Create your WebGL programs here by specifying a
       tag name that identifies them, and place inside
       it the vertex and fragment code
     -->
     <here-is-a-cool-program>
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
           <!--
             Write the fragment shader code for the
             "here-is-a-cool-program" here.
           -->
         </code>
       </fragment-shader>
     </here-is-a-cool-program>
   </webgl-programs>
 </webgl-canvas>
</shader-canvas>
```

For a usable example check the
[1st example - simple triangle](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/1-triangle)

This custom named tag is meant to be used as a child of the
[`<webgl-programs>`](#WebGLPrograms) container tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_programs/create_program.ts#L25">View Source</a></small></em>



<hr>

## `<{{texture-name}}>` {#CreateTexture}

You chose the tag name for your textures when declaring them.
This name is then used to reference this Texture in other Shader Canvas
containers and parts (like draw calls).

The allowed children of a Texture are:

- [`<tex-image-2d>`](#TexImage2D) _Sets the Image data for this texture_

**Example**

```html
<shader-canvas>
  <webgl-canvas>
    <webgl-textures>
      <such-an-awesome-image>
        <tex-image-2d src="#texture"></tex-image-2d>
      </such-an-awesome-image>
   </textures>
  </webgl-canvas>
  <img id="texture" src="awesome-texture.png">
</shader-canvas>
```

For a usable example check the
[2nd example - texture quad](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/2-textured-quad)

This custom named tag is meant to be used as a child of the
[`<webgl-textures>`](#WebGLTextures) container tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_textures/create_texture.ts#L21">View Source</a></small></em>



<hr>

## `<{{vao-name}}>` {#CreateVertexArray}

You chose the tag name for your vertex array objects (VAO) when declaring them.
The tag name is used to represent the name for the VAO.
This name is then used to reference this VAO in other Shader Canvas
containers and parts (like draw calls).

The allowed children of a VAO are:

- [`<bind-buffer>`](#BindBuffer) _Binds a buffer specified in the webgl
  buffers container_

**Example**

```html
<shader-canvas>
 <webgl-canvas>
   <webgl-vertex-array-objects>
     <!--
       Create your WebGL VAOs here by specifying a
       tag name that uniquely identifies them.
     -->
     <here-is-a-vao>
       <bind-buffer src="some-buffer">
         <!-- vertex-attrib-pointers here -->
       </bind-buffer>
     </here-is-a-vao>
   <webgl-vertex-array-objects>
 </webgl-canvas>
</shader-canvas>
```

For a usable example check the
[3rd example - animation](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/3-animation)

This custom named tag is meant to be used as a child of the
[`<webgl-vertex-array-objects>`](#WebGLVertexArrayObjects) container tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_vertex_array_objects/create_vertex_array.ts#L33">View Source</a></small></em>



<hr>

## `<cull-face>` {#CullFace}

This tag is the equivalent of the [WebGL `cullFace() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace).

It specifies whether or not front- and/or back-facing polygons can be
culled.

The presence of this tag automatically sets `gl.enable(gl.CULL_FACE)`

No child tags allowed in `<cull-face>`.

The `<cull-face>` tag is meant to be used as a child of the
[`<draw-calls>`](#DrawCalls) list of actions.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/cull_face.ts#L9">View Source</a></small></em>

### Attributes of `<CullFace>`

#### _[mode](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/cull_face.ts#L37)_

A string specifying whether front- or back-facing polygons are candidates
for culling.

The default value is "BACK". Possible values are:

- `"FRONT"`
- `"BACK"` _(default)_
- `"FRONT_AND_BACK"`


<hr>

## `<depth-func>` {#DepthFunc}

This tag is the equivalent of the [WebGL `depthFunc() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc).

It specifies a function that compares incoming pixel depth to the current
depth buffer value.

The presence of this tag automatically sets `gl.enable(gl.DEPTH)`

No child tags allowed in `<depth-func>`.

The `<depth-func>` tag is meant to be used as a child of the
[`<draw-calls>`](#DrawCalls) list of actions.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/depth_func.ts#L55">View Source</a></small></em>

### Attributes of `<DepthFunc>`

#### _[func](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/depth_func.ts#L105)_

A string specifying the depth comparison function, which sets the
conditions under which the pixel will be drawn. The default value is
`gl.LESS`.

Possible values are:

- `"NEVER"`
- `"LESS"`
- `"EQUAL"`
- `"LEQUAL"`
- `"GREATER"`
- `"NOTEQUAL"`
- `"GEQUAL"`
- `"ALWAYS"`


<hr>

## `<draw-calls>` {#DrawCalls}

This tag is a container of a WebGL draw commands. Each child defines a
WebGL draw call. It is intended to hold an ordered list of tags that is run
sequentially when rendering a frame.

Some of the child tags make use of the WebGL elements defined in other
containers, like programs, textures, buffers and vertex array objects.

A drawing loop can be defined by creating [`<draw-loop>`](#DrawLoop)
child in this tag.


The allowed children are:

- [`<active-texture>`](#ActiveTexture)
  _Equivalent to the [`gl.activeTexture()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/activeTexture)
  function_
- [`<blend-func>`](#BlendFunc)
  _Equivalent to the [`gl.blendFunc()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc)
  function_
- [`<depth-func>`](#DepthFunc)
  _Equivalent to the [`gl.depthFunc()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc)
  function_
- [`<cull-face>`](#CullFace)
  _Equivalent to the [`gl.cullFace()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace)
  function_
- [`<clear-color>`](#ClearColor)
  _Equivalent to the [`gl.clearColor()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearColor)
  function_
- [`<clear-depth>`](#ClearDepth)
  _Equivalent to the [`gl.clearDepth()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearDepth)
  function_
- [`<clear-stencil>`](#ClearStencil)
  _Equivalent to the [`gl.clearStencil()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearStencil)
  function_
- [`<clear-flags>`](#ClearFlags)
  _Equivalent to the [`gl.clear()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clear)
  function_
- [`<tex-parameter-i>`](#TexParameterI)
  _Equivalent to the [`gl.texParameteri()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter)
  function_
- [`<tex-parameter-f>`](#TexParameterF)
  _Equivalent to the [`gl.texParameterf()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter)
  function_
- [`<use-program>`](#UseProgram)
  _Equivalent to the [`gl.useProgram()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/useProgram)
  function_
- [`<viewport-transform>`](#ViewportTransformation)
  _Equivalent to the [`gl.viewport()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/viewport)
  function_
- [`<draw-loop>`](#DrawLoop)
  _Lists the actions to perform inside a [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)_
- [`<draw-vao>`](#DrawVAO)
  _Equivalent to either the [`gl.drawElements()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements)
  or the [`gl.drawArrays()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays)
  functions (it knows which to use based on the Vertex Array Object that
  it references)_

**Example**

```html
<shader-canvas>
  <webgl-canvas>
    <draw-calls>
      <viewport-transform x="0" y="0"></viewport-transform>
      <clear-color red="0" green="0" blue="0" alpha="1"></clear-color>
      <clear-flags mask="COLOR_BUFFER_BIT"></clear-flags>
      <use-program src="farbrausch">
        <active-texture var="acid" src="#lsdImage"></active-texture>
        <draw-vao src="weird-meshes"></draw-vao>
      </use-program>
    </draw-calls>
  </webgl-canvas>
</shader-canvas>
```

For a usable example check the
[3rd example - animation](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/3-animation)

The `<draw-calls>` tag is meant to be used as a child of the
[`<webgl-canvas>`](#WebGLCanvas) tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/draw_calls.ts#L24">View Source</a></small></em>



<hr>

## `<draw-loop>` {#DrawLoop}

This tag is a container of a WebGL draw commands. Each child defines a
WebGL draw call. It is intended to hold an ordered list of tags that is run
sequentially _and repeatedly_.

It creates a draw function to perform each action listed as children and
then registers a `requestAnimationFrame` for that draw function
(the `setTimeout()` is used instead if a the number of FPS's are specified
).

It allows the same children that the [`<draw-calls>`](#DrawCalls) accepts.

For a usable example check the
[3rd example - animation](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/3-animation)

The `<draw-loop>` tag is meant to be used as a child of the
[`<draw-calls>`](#DrawCalls) tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/draw_loop.ts#L19">View Source</a></small></em>

### Attributes of `<DrawLoop>`

#### _[fps](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/draw_loop.ts#L134)_

Sets the number of Frames Per Second (FPS) that the loop should run.
It defaults to using the `window.requestAnimationFrame`.

This attribute is a number.


<hr>

## `<draw-vao>` {#DrawVAO}

This tag is equivalent to either the [`gl.drawElements()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements)
or the [`gl.drawArrays()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays).

If the "instanceCount" attribute is set, then it makes use
of the [`gl.drawElementsInstanced()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/drawElementsInstanced)
or the [`gl.drawArraysInstanced()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/drawArraysInstanced)
functions.

It searches for the Vertex Array Object specified by the `src` attribute
and calls `gl.drawElements` if it has an element array buffer, or 
`gl.drawArrays` otherwise.
(or `gl.drawElementsInstanced()`/`gl.drawArraysInstanced()` if
"instanceCount" is set)

The number of items to draw can be specified in the "count" attribute,
but these also get calculated automatically by the vertex array buffer 
specifications.

No allowed child tags.

The `<draw-vao>` tag is meant to be used within the
[`<draw-calls>`](#DrawCalls) list of actions.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/draw_vao.ts#L11">View Source</a></small></em>

### Attributes of `<DrawVAO>`

#### _[src](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/draw_vao.ts#L45)_

A string that references a vertex array object name.

This must be the name of a tag available in the
`<webgl-vertex-array-objects>` container.
#### _[mode](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/draw_vao.ts#L62)_

A string that specifies the type primitive to render. 

Possible values are:

- `"POINTS"`
- `"LINE_STRIP"`
- `"LINE_LOOP"`
- `"LINES"`
- `"TRIANGLE_STRIP"`
- `"TRIANGLE_FAN"`
- `"TRIANGLES"` _(default)_
#### _[offset](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/draw_vao.ts#L104)_

A number specifying a byte offset in the element array buffer. Must be a
valid multiple of the size of the given type.
#### _[first](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/draw_vao.ts#L111)_

A number specifying the starting index in the array of vector points.
#### _[type](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/draw_vao.ts#L122)_

A string specifying the type of the values in the element array buffer.

Possible values are:

- `"UNSIGNED_BYTE"` _(default)_
- `"UNSIGNED_SHORT"`


<hr>

## `<fragment-shader>` {#FragmentShader}

This tag holds the fragment shader code of a WebGL program. The code must
be valid WebGL 2 GLSL. It is parsed and the variables analyzed and
retrieved to allow Shader Canvas to be able to easily reference them and
track their locations at compilation/linking time.

The allowed children for the `<fragment-shader>`:

- [`<code>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/code) 
  _Plain HTML `<code>` tag that holds the fragment
  code. Code tag is useful because it allows preformatted text as content._

**Example**

```html
<shader-canvas>
 <webgl-canvas>
   <webgl-programs>
     <some-program>
       <vertex-shader>
         <code>
           <!--
             Write the vertex shader code for
             "some-program" here.
           -->
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
     </some-program>
   </webgl-programs>
 </webgl-canvas>
</shader-canvas>
```

For a usable example check the
[1st example - simple triangle](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/1-triangle)

The `<fragment-shader>` tag is meant to be used as a child of the
[`<{{program-name}}>`](#CreateProgram) custom named tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_programs/shaders.ts#L259">View Source</a></small></em>



<hr>

## `<new-modules>` {#NewModules}

This tag is a container of a Shader Canvas modules. Each child defines a 
module. You must set a unique name for each child tag, these children
can then have the valid content for a [module](#CreateModule).

This is the place to define the DOM contents of each module. These module
tags can then be used in other containers, and have their contents merged
with the location that they are placed.

A Shader Canvas module consists of parts of the html code of each
Shader Canvas container. When a module tag is used outside of
`<new-modules>` the corresponding html code part for its parent will be
merged into the final Shader Canvas DOM.

The allowed children are:

- [`<{{module-name}}>`](#CreateModule)
  _Shader Canvas Module (you decide the tag name)_

**Example**

```html
<shader-canvas>
 <new-modules>
   <some-cool-module-name>
     <webgl-buffers>
       <!-- buffers blueprint to be merged -->
     </webgl-buffers>
     <webgl-vertex-array-objects>
       <!-- vao's blueprint to be merged -->
     </webgl-vertex-array-objects>
     <webgl-program-part>
       <!-- a blueprint to be merged into a program -->
     </webgl-program-part>
   </some-cool-module-name>
 </new-modules>
</shader-canvas>
```

For a usable example check the
[4th example - composition](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/4-composition)

The `<new-modules>` tag is meant to be used as a child of the
[`<shader-canvas>`](#ShaderCanvas) tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/new_modules/new_modules.ts#L24">View Source</a></small></em>



<hr>

## `<shader-canvas>` {#ShaderCanvas}

This is the starting tag of the graphics framework. Your app can have
several of these tags.


The allowed children are:

- [`<webgl-canvas>`](#WebGLCanvas) _WebGL low-level back-end_
- [`<new-modules>`](#NewModules) _Modules tags and their content_ 
- Any module tag defined inside the [`<new-modules>`](#NewModules)

**Example**

```html
<shader-canvas>
 <webgl-canvas>
   <!-- webgl-canvas specific tags here -->
 </webgl-canvas>
 <new-modules>
   <!-- create your modules here, e.g. -->
   <triangle-stream>
     <!--
     this module is called "triangle-stream" inside it you
     can put some webgl-canvas parts, that will be merged
     whenever this tag is used.
     -->
   </triangle-stream>
 </new-modules>

 <!--
   here the module is being used, its webgl-canvas parts
   will be merged here during initialization
 --> 
 <triangle-stream></triangle-stream>

</shader-canvas>
```

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/shader_canvas.ts#L75">View Source</a></small></em>

### Attributes of `<ShaderCanvas>`

#### _[width](https://github.com/HugoDaniel/shader_canvas/blob/main/shader_canvas.ts#L316)_

A number that sets the width of the underlying graphics backend.
This number is passed to the graphics backend to set its canvas dimensions.

It defaults to the `window.innerWidth` attribute value.

A graphics backend might not follow this number exactly and use it as a
basis to set the pixel width based on the underlying pixel ratio.
#### _[height](https://github.com/HugoDaniel/shader_canvas/blob/main/shader_canvas.ts#L330)_

A number that sets the height of the underlying graphics backend.
Like the width, this is passed to the graphics backend to set its
canvas dimensions.

It defaults to the `window.innerHeight` attribute value.

A graphics backend might not follow this number exactly and use it as a
basis to set the pixel height based on the underlying pixel ratio.


<hr>

## `<tex-image-2d>` {#TexImage2D}

This tag is the equivalent of the [WebGL `texImage2D() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D).

It sets the 2D image data to be used in the texture being declared and how
it should be processed.

No child tags allowed in `<tex-image-2d>`.

**Example**

```html
<shader-canvas>
  <webgl-canvas>
    <webgl-textures>
      <such-an-awesome-image>
        <tex-image-2d src="#texture"></tex-image-2d>
      </such-an-awesome-image>
   </textures>
  </webgl-canvas>
  <img id="texture" src="awesome-texture.png">
</shader-canvas>
```

For a usable example check the
[2nd example - texture quad](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/2-textured-quad)


The `<tex-image-2d>` tag is meant to be used as a child of the
[`<{{texture-name}}>`](#CreateTexture) custom named tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_textures/tex_image_2d.ts#L91">View Source</a></small></em>

### Attributes of `<TexImage2D>`

#### _[width](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_textures/tex_image_2d.ts#L131)_

The width of the texture.

This attribute is a number.
#### _[height](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_textures/tex_image_2d.ts#L139)_

The height of the texture.

This attribute is a number.
#### _[level](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_textures/tex_image_2d.ts#L150)_

Specifies the level of detail that this texture data is for.
Level 0 is the base image level and level n is the nth mipmap reduction
level.

This attribute is a number.
#### _[target](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_textures/tex_image_2d.ts#L168)_

The WebGL binding point for this texture.

This attribute allows the same values that the "target" parameter of the
[`gl.texImage2D()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D#parameters)
function does: 

- `"TEXTURE_2D"` _(default)_
- `"TEXTURE_CUBE_MAP_POSITIVE_X"`
- `"TEXTURE_CUBE_MAP_NEGATIVE_X"`
- `"TEXTURE_CUBE_MAP_POSITIVE_Y"`
- `"TEXTURE_CUBE_MAP_NEGATIVE_Y"`
- `"TEXTURE_CUBE_MAP_POSITIVE_Z"`
- `"TEXTURE_CUBE_MAP_NEGATIVE_Z"`
#### _[internalFormat](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_textures/tex_image_2d.ts#L235)_

Specifies the color components in the texture.

This attribute allows the same values that the "internalFormat" parameter of
the [`gl.texImage2D()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D#parameters)
function does (and the same as the "format" attribute):

- `"RGBA"` _(default)_
- `"RGB"`
- `"LUMINANCE_ALPHA"`
- `"LUMINANCE"`
- `"ALPHA"`
- `"DEPTH_COMPONENT"`
- `"DEPTH_STENCIL"`
- `"R8"`
- `"R8_SNORM"`
- `"RG8"`
- `"RG8_SNORM"`
- `"RGB8"`
- `"RGB8_SNORM"`
- `"RGB565"`
- `"RGBA4"`
- `"RGB5_A1"`
- `"RGBA8"`
- `"RGBA8_SNORM"`
- `"RGB10_A2"`
- `"RGB10_A2UI"`
- `"SRGB8"`
- `"SRGB8_ALPHA8"`
- `"R16F"`
- `"RG16F"`
- `"RGB16F"`
- `"RGBA16F"`
- `"R32F"`
- `"RG32F"`
- `"RGB32F"`
- `"RGBA32F"`
- `"R11F_G11F_B10F"`
- `"RGB9_E5"`
- `"R8I"`
- `"R8UI"`
- `"R16I"`
- `"R16UI"`
- `"R32I"`
- `"R32UI"`
- `"RG8I"`
- `"RG8UI"`
- `"RG16I"`
- `"RG16UI"`
- `"RG32I"`
- `"RG32UI"`
- `"RGB8I"`
- `"RGB8UI"`
- `"RGB16I"`
- `"RGB16UI"`
- `"RGB32I"`
- `"RGB32UI"`
- `"RGBA8I"`
- `"RGBA8UI"`
- `"RGBA16I"`
- `"RGBA16UI"`
- `"RGBA32I"`
- `"RGBA32UI"`
#### _[format](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_textures/tex_image_2d.ts#L245)_

Specifies the format for the texel data.

This attribute allows the same values that the "format" parameter of
the [`gl.texImage2D()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D#parameters)
function does (and the same as the "internalFormat" attribute).
#### _[type](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_textures/tex_image_2d.ts#L272)_

Specifies the data type of the texel data.

This attribute allows the same values that the "type" parameter of
the [`gl.texImage2D()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D#parameters)
function does:

- `"BYTE"`
- `"UNSIGNED_SHORT"`
- `"SHORT"`
- `"UNSIGNED_INT"`
- `"INT"`
- `"HALF_FLOAT"`
- `"FLOAT"`
- `"UNSIGNED_INT_2_10_10_10_REV"`
- `"UNSIGNED_INT_10F_11F_11F_REV"`
- `"UNSIGNED_INT_5_9_9_9_REV"`
- `"UNSIGNED_INT_24_8"`
- `"FLOAT_32_UNSIGNED_INT_24_8_REV"`
- `"UNSIGNED_BYTE"` _(default)_
- `"UNSIGNED_SHORT_5_6_5"`
- `"UNSIGNED_SHORT_4_4_4_4"`
- `"UNSIGNED_SHORT_5_5_5_1"`
#### _[src](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_textures/tex_image_2d.ts#L280)_

This attribute is used to get the image data from.

It can be a URL or a query selector for an image/video tag.


<hr>

## `<tex-parameter-f>` {#TexParameterF}

This tag is the equivalent of the [WebGL `texParameteri() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter).

It sets the parameters for the current active texture set by the
[`<active-texture>`](#ActiveTexture) tag.

No child tags allowed in `<tex-parameter-f>`.

The `<tex-parameter-f>` tag is meant to be used as a child of the
[`<active-texture>`](#ActiveTexture) custom named tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/tex_parameter.ts#L274">View Source</a></small></em>

### Attributes of `<TexParameterF>`

#### _[texParameter](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/tex_parameter.ts#L293)_

Returns the gl function for this tag. Not intended to be used as a 
tag attribute.
#### _[target](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/tex_parameter.ts#L299)_

A string (GLenum) specifying the binding point (target)
#### _[pname](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/tex_parameter.ts#L305)_

The parameter name. Can be any valid `TextureParameterName`.
#### _[param](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/tex_parameter.ts#L311)_

The parameter value. Can be any valid `TextureParameter`.


<hr>

## `<tex-parameter-i>` {#TexParameterI}

This tag is the equivalent of the [WebGL `texParameteri() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter).

It sets the parameters for the current active texture set by the
[`<active-texture>`](#ActiveTexture) tag.

No child tags allowed in `<tex-parameter-i>`.

The `<tex-parameter-i>` tag is meant to be used as a child of the
[`<active-texture>`](#ActiveTexture) custom named tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/tex_parameter.ts#L232">View Source</a></small></em>

### Attributes of `<TexParameterI>`

#### _[texParameter](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/tex_parameter.ts#L251)_

Returns the gl function for this tag. Not intended to be used as a 
tag attribute.
#### _[target](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/tex_parameter.ts#L258)_

A string (GLenum) specifying the binding point (target)
#### _[pname](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/tex_parameter.ts#L264)_

The parameter name. Can be any valid `TextureParameterName`.
#### _[param](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/tex_parameter.ts#L270)_

The parameter value. Can be any valid `TextureParameter`.


<hr>

## `<use-program>` {#UseProgram}

This tag is the equivalent of the [WebGL `useProgram() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/useProgram).

It sets the specified WebGLProgram as part of the current rendering state.

The allowed children are:

- [`<active-texture>`](#ActiveTexture)
  _Equivalent to the [`gl.activeTexture()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/activeTexture)
  function_
- [`<draw-vao>`](#DrawVAO)
  _Equivalent to either the [`gl.drawElements()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements)
  or the [`gl.drawArrays()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays)
  functions (it knows which to use based on the Vertex Array Object that
  it references)_

The `<use-program>` tag is meant to be used within the
[`<draw-calls>`](#DrawCalls) list of actions.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/use_program.ts#L40">View Source</a></small></em>

### Attributes of `<UseProgram>`

#### _[src](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/use_program.ts#L77)_

A string that references a program name.

This must be the name of a tag available in the `<webgl-programs>`
container.


<hr>

## `<vertex-attrib-pointer>` {#VertexAttribPointer}

This tag is the equivalent of the [WebGL `vertexAttribPointer() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer).

It specifies the layout of its parent buffer. It is used to map buffer
areas to variables.

No children are allowed in `<vertex-attrib-pointer>`.

For a usable example check the
[3rd example - animation](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/3-animation)

The `<vertex-attrib-pointer>` tag is meant to be used as a child of the
[`<bind-buffer>`](#BindBuffer) tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_vertex_array_objects/vertex_attrib_pointer.ts#L50">View Source</a></small></em>

### Attributes of `<VertexAttribPointer>`

#### _[variable](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_vertex_array_objects/vertex_attrib_pointer.ts#L136)_

A string specifying the name of the variable that this data is going to be
placed at.
#### _[divisor](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_vertex_array_objects/vertex_attrib_pointer.ts#L151)_

A number specifying the instance items for this attribute.
If it is greater than 0 a call to `gl.vertexAttribDivisor` is made with it.
#### _[size](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_vertex_array_objects/vertex_attrib_pointer.ts#L158)_

A number specifying the number of components per vertex attribute.
Must be 1, 2, 3, or 4.
#### _[type](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_vertex_array_objects/vertex_attrib_pointer.ts#L188)_

A string (GLenum) specifying the data type of each component in the array.

This attribute allows the same values that the `type` parameter of the
[`gl.vertexAttribPointer()`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer#parameters)
function does: 

- `"BYTE"`
- `"SHORT"`
- `"UNSIGNED_BYTE"`
- `"UNSIGNED_SHORT"`
- `"FLOAT"` _(default)_
- `"HALF_FLOAT"`
#### _[offset](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_vertex_array_objects/vertex_attrib_pointer.ts#L203)_

A GLintptr specifying an offset in bytes of the first component in the
vertex attribute array. Must be a multiple of the byte length of type.
#### _[normalized](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_vertex_array_objects/vertex_attrib_pointer.ts#L225)_

A boolean specifying whether integer data values should be normalized
into a certain range when being cast to a float.
  - For types gl.BYTE and gl.SHORT, normalizes the values to [-1, 1] if
    true.
  - For types gl.UNSIGNED_BYTE and gl.UNSIGNED_SHORT, normalizes the
    values to [0, 1] if true.
  - For types gl.FLOAT and gl.HALF_FLOAT, this parameter has no effect.
#### _[stride](https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_vertex_array_objects/vertex_attrib_pointer.ts#L243)_

A GLsizei specifying the offset in bytes between the beginning of
consecutive vertex attributes. Cannot be larger than 255. If stride is 0,
the attribute is assumed to be tightly packed, that is, the attributes are
not interleaved but each attribute is in a separate block, and the next
vertex' attribute follows immediately after the current vertex.


<hr>

## `<vertex-shader>` {#VertexShader}

This tag holds the vertex shader code of a WebGL program. The code must be
valid WebGL 2 GLSL. It is parsed and the variables analyzed and retrieved
to allow Shader Canvas to be able to easily reference them and keep track
of their locations at compilation/linking time.

The allowed children for the `<vertex-shader>`:

- [`<code>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/code) 
  _Plain HTML `<code>` tag that holds the vertex
  code. Code tag is useful because it allows preformatted text as content._

**Example**

```html
<shader-canvas>
 <webgl-canvas>
   <webgl-programs>
     <some-program>
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
           <!--
             Write the fragment shader code for
             "some-program" here.
           -->
         </code>
       </fragment-shader>
     </some-program>
   </webgl-programs>
 </webgl-canvas>
</shader-canvas>
```

For a usable example check the
[1st example - simple triangle](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/1-triangle)

The `<vertex-shader>` tag is meant to be used as a child of the
[`<{{program-name}}>`](#CreateProgram) custom named tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_programs/shaders.ts#L195">View Source</a></small></em>



<hr>

## `<viewport-transform>` {#ViewportTransformation}

This tag is the equivalent of the [WebGL `viewport() function`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/viewport).

It sets the viewport, which specifies the affine transformation of x and
y from normalized device coordinates to window coordinates.

No child tags allowed in `<viewport-transform>`.

The `<viewport-transform>` tag is meant to be used as a child of the
[`<draw-calls>`](#DrawCalls) list of actions.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/viewport.ts#L9">View Source</a></small></em>

### Attributes of `<ViewportTransformation>`

#### _[x](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/viewport.ts#L46)_

A number specifying the horizontal coordinate for the lower left corner
of the viewport origin.

Default value: 0.
#### _[y](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/viewport.ts#L59)_

A number specifying the vertical coordinate for the lower left corner of
the viewport origin.

Default value: 0.
#### _[width](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/viewport.ts#L71)_

A number specifying the width of the viewport.

Default value: width of the canvas.
#### _[height](https://github.com/HugoDaniel/shader_canvas/blob/main/core/draw_calls/viewport.ts#L82)_

A number specifying the height of the viewport.

Default value: height of the canvas.


<hr>

## `<webgl-buffers>` {#WebGLBuffers}

This tag is a container of a WebGL buffers. Each child defines a WebGL 
Buffer. You must set a unique name for each child tag, these children
can then have the valid content for a [buffer](#CreateBuffer).

The children unique tag names are used as reference in other containers
and in the [<draw-calls>](#DrawCalls) list of actions.

WebGL Buffers consist of buffer data. For now 1 buffer can only have one
buffer data source (this will change in the future to allow early
concatenation of raw data).
During initialization the buffers listed as children of this tag get 
loaded and their runtime functions created to be used by the draw calls
either at its initialization or during the render loop.

The allowed children are:

- [`<{{buffer-name}}>`](#CreateBuffer)
  _WebGL Buffer (you decide the tag name)_

**Example**

```html
<shader-canvas>
  <webgl-canvas>
    <webgl-buffers>
      <cube-vertices>
        <buffer-data src="/myCube.json"></buffer-data>
      </cube-vertices>
      <cool-texture-uv-coords>
        <buffer-data src="#textureCoords"></buffer-data>
      </cool-texture-uv-coords>
    </webgl-buffers>
  </webgl-canvas>
</shader-canvas>
```
For a usable example check the
[3rd example - animation](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/3-animation)

The `<webgl-buffers>` tag is meant to be used as a child of the
[`<webgl-canvas>`](#WebGLCanvas) tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_buffers/webgl_buffers.ts#L36">View Source</a></small></em>



<hr>

## `<webgl-canvas>` {#WebGLCanvas}

This tag defines a WebGL graphics backend.
Its children are the logic blocks and actions to perform.

It splits WebGL operation into 5 distinct parts:

- _Programs_ - Shader programs to use when drawing

- _Buffers_ - Raw data, define here the sources to use elsewhere
- _Vertex Array Objects_ - 
     Each child defines blocks that set how the data in the buffers is
     going to be read.
- _Textures_ - 
     Image and video data sources
- _Draw calls_ - 
     How to draw the 4 parts above.

The allowed children are:

- [`<webgl-programs>`](#WebGLPrograms) _WebGL shader programs container_
- [`<webgl-buffers>`](#WebGLBuffers) _Buffers with raw data_ 
- [`<webgl-vertex-array-objects>`](#WebGLVertexArrayObjects) 
   _Vertex Array Objects container
   (here you can bundle multiple buffers and define what their raw data
   is formatted and what it contains)_ 
- [`<webgl-textures>`](#WebGLTextures) _Container for image and video data_
- [`<draw-calls>`](#DrawCalls) _List of actions to perform when rendering an image_
- Any module tag that is previously defined inside the parent
  [`<new-modules>`](#NewModules)

**Example**

```html
<shader-canvas>
 <webgl-canvas>
   <webgl-textures>
     <!-- WebGL Textures are defined here -->
   </webgl-textures>
   
   <webgl-buffers>
     <!-- WebGL Buffer Data is defined here -->
   </webgl-buffers>

   <webgl-vertex-array-objects>
     <!-- WebGL Vertex Array Objects go here -->
   </webgl-vertex-array-objects>

   <webgl-programs>
     <!-- Shader programs are defined here -->
   </webgl-programs>

   <draw-calls>
     <!-- Set the viewport and background color and draw programs here -->
   </draw-calls>
 </webgl-canvas>
</shader-canvas>
``` 

For a usable example check the
[2nd example - texture quad](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/2-textured-quad)

The `<webgl-canvas>` tag is meant to be used as a child of the
[`<shader-canvas>`](#ShaderCanvas) tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_canvas/webgl_canvas.ts#L46">View Source</a></small></em>



<hr>

## `<webgl-program-part>` {#WebGLProgramPart}

Use this tag to declare a reusable part of your WebGL program GLSL code.

The code set in this tag can then be used in multiple GLSL programs in
a transparent way.

The allowed children are:

- [`<vertex-shader>`](#VertexShader) _Specifies the code part for the
  Vertex shader program_
- [`<fragment-shader>`](#FragmentShader) _Specifies the code part for the
  Vertex shader program_

For a usable example check the
[4th example - composition](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/4-composition)

This tag is meant to be used inside the custom named module tag
[`<{{module-name}}>`](#CreateModule).

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/new_modules/webgl_program_part.ts#L14">View Source</a></small></em>



<hr>

## `<webgl-programs>` {#WebGLPrograms}

This tag is a container of a WebGL programs. Each child defines a WebGL 
Program. You must set a unique name for each child tag, these children
can then have the valid content for a [program](#CreateProgram).

The children unique tag names are used as reference in other containers
and in the [<draw-calls>](#DrawCalls) list of actions.

WebGL Programs consist of vertex shader code and fragment shader code.
During initialization the programs listed as children of this tag get 
loaded, compiled, linked and their variable locations set.

The allowed children are:

- [`<{{program-name}}>`](#CreateProgram)
  _WebGL Program (you decide the tag name)_

**Example**

```html
<shader-canvas>
  <webgl-canvas>
   <webgl-programs>
     <my-awesome-program>
       <vertex-shader>
         <code> ... </code>
       </vertex-shader>
       <fragment-shader>
         <code> ... </code>
       </fragment-shader>
     </my-awesome-program>
   </webgl-programs>
 </webgl-canvas>
</shader-canvas>
```
For a usable example check the
[1st example - simple triangle](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/1-triangle)

The `<webgl-programs>` tag is meant to be used as a child of the
[`<webgl-canvas>`](#WebGLCanvas) tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_programs/webgl_programs.ts#L41">View Source</a></small></em>



<hr>

## `<webgl-textures>` {#WebGLTextures}

This tag is a container of a WebGL Textures. Each child defines a WebGL
Texture. You must set a unique name for each child tag, these children can
then have the valid content for a [texture](#CreateTexture).

The children unique tag names are used as reference in other containers
and in the [<draw-calls>](#DrawCalls) list of actions.

Textures can hold image data, and are sent to the Sampler* variables of
the GLSL fragment shader programs.

During initialization the textures listed as children of this tag get 
loaded and their runtime functions created to be used by the draw calls
either at its initialization or during the render loop.

The allowed children are:

- [`<{{texture-name}}>`](#CreateTexture)
  _WebGL Texture (you decide the tag name)_

**Example**

```html
<shader-canvas>
  <webgl-canvas>
    <webgl-textures>
      <such-an-awesome-image>
         <!--
           Texture content tags
         -->
      </such-an-awesome-image>
   </textures>
  </webgl-canvas>
</shader-canvas>
```
For a usable example check the
[2nd example - texture quad](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/2-textured-quad)

The `<webgl-textures>` tag is meant to be used as a child of
the [`<webgl-canvas>`](#WebGLCanvas) tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_textures/webgl_textures.ts#L36">View Source</a></small></em>



<hr>

## `<webgl-vertex-array-objects>` {#WebGLVertexArrayObjects}

This tag is a container of a WebGL Vertex Array Objects. Each child defines
a WebGL Vertex Array Object. You must set a unique name for each child tag,
these children can then have the valid content for a 
[vertex array object](#CreateVertexArray).

The children unique tag names are used as reference in other containers
and in the [<draw-calls>](#DrawCalls) list of actions.

Vertex Array Objects pass extra data per vertex into WebGL programs.
They allow a vertex to have any extra information that might be needed
for the programs to display their cool things.
 
WebGL Vertex Array Objects are a way that WebGL uses to separate the data
contents from their representation. With Vertex Array Objects it is
possible to select a buffer and read its data as 2d float vertices, or,
if you want, select that same buffer and read its data as 3d vertices.

During initialization the vertex array objects listed as children of this
tag get their runtime functions created to be used by the draw calls
either at its initialization or during the render loop.

The allowed children are:

- [`<{{vertex-array-object-name}}>`](#CreateVertexArrayObject)
  _WebGL Vertex Array Object (you decide the tag name)_
- Any module tag defined inside the [`<new-modules>`](#NewModules)

**Example**

```html
<shader-canvas>
  <webgl-canvas>
    <webgl-vertex-array-objects>
      <my-extra-vertex-data>
         <!--
           Vertex Array Object content tags
         -->
      </my-extra-vertex-data>
   </webgl-vertex-array-objects>
  </webgl-canvas>
</shader-canvas>
```
For a usable example check the
[2nd example - texture quad](https://github.com/HugoDaniel/shader_canvas/tree/main/examples/2-textured-quad)

The `<webgl-vertex-array-objects>` tag is meant to be used as a child of
the [`<webgl-canvas>`](#WebGLCanvas) tag.

<em><small><a href="https://github.com/HugoDaniel/shader_canvas/blob/main/core/webgl_vertex_array_objects/webgl_vertex_array_objects.ts#L39">View Source</a></small></em>



<hr>

