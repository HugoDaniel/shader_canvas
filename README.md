# shader-canvas

A rendering engine where you can write WebGL 2.0 shaders using custom low-level
tags.

- For documentation check the [official site](http://hugodaniel.com/projects/shader-canvas/).

- For examples check the [examples folder](https://github.com/HugoDaniel/shader_canvas/tree/main/examples).

- For code distribution [deno.land](https://deno.land/x/shader_canvas) is being used.

**Current version: v1.0.0**

## Developer notes

This project uses `make` to do the build automation and developer environment.

The [`Makefile`](https://github.com/HugoDaniel/shader_canvas/blob/main/Makefile)
has the following main actions:

- `make serve`
  
Use this command to start a development server at `localhost:8000`

- `make stop` 

Use this command to stop the development server

- `make docs/documentation.md` 

Use this command to generate the [documentation markdown file](https://github.com/HugoDaniel/shader_canvas/blob/main/docs/documentation.md) which is then used to produce the [official docs](http://hugodaniel.com/projects/shader-canvas/documentation/)

- `make build/shader_canvas.min.js` 

Use this command to generate the final production file at `build/shader_canvas.min.js`.

### Running tests

Tests run in the browser, [mocha](https://mochajs.org/) and
[chaijs](https://www.chaijs.com/) are being used to test the usage of the
Shader Canvas components.

To run the tests, start the local development server by running `make serve` and
then access [http://localhost:8000/tests/test.html](http://localhost:8000/tests/test.html).

Tests are located in the [`tests/` folder](https://github.com/HugoDaniel/shader_canvas/tree/main/tests).
