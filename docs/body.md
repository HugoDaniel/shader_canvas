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
    import { ShaderCanvas } from "https://cdn.deno.land/shader_canvas/versions/v1.0.0/raw/build/shader_canvas.min.js";
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
    import { ShaderCanvas } from "https://cdn.deno.land/shader_canvas/versions/v1.0.0/raw/build/shader_canvas.min.js";

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

To do that use the import from the [`deno.land`](https://deno.land/x/shader_canvas@v1.0.0)
file directly:

```typescript
import { ShaderCanvas } from "https://deno.land/x/shader_canvas@v1.0.0/shader_canvas.ts"

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

<hr></hr>

# Reference

This section lists all the new HTML elements that Shader Canvas introduces.
