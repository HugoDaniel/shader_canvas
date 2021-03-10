# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Support for buffer initializer functions in the ShaderCanvas API.
- Support for multiple `<code>` tags in shaders.
- Support for `<code-before>` and `<code-after>` tags in shaders.
- It is possible to start and stop a loop through the ShaderCanvas instance API.
- `<draw-loop>` now supports setting the frames per second ("fps" attribute).
- Show compiler errors for each shader after compilation is done.
- Print a console.error when a container has no children to create; execution
  continues as normal, just the error is output.
- This changelog.
- The `ShaderCanvas.webglModule` API function now supports an `initializer()`
  function to be present in the functions objects it returns. This initializer
  function is run once per program during initialization.

### Changed

- The `modules` array in the CanHaveModules class now only contains the module
  names of the modules that were merged (previously it contained all modules
  present as children of the class, even if they included no parts to be merged
  there).

## [1.0.0] - 2021-03-03

### Added

- shader-canvas first version
- [Documentation page](https://hugodaniel.com/projects/shader-canvas/)
- Runtime browser execution for a shader canvas html file.
- Support for simple [WebGL canvas](https://hugodaniel.com/projects/shader-canvas/documentation/#WebGLCanvas) elements.
- Tag `<active-texture>`
- Tag `<bind-buffer>`
- Tag `<blend-func>`
- Tag `<buffer-data>`
- Tag `<clear-color>`
- Tag `<clear-depth>`
- Tag `<clear-flags>`
- Tag `<clear-stencil>`
- Tag `<{{buffer-name}}>`
- Tag `<{{module-name}}>`
- Tag `<{{program-name}}>`
- Tag `<{{texture-name}}>`
- Tag `<{{vao-name}}>`
- Tag `<cull-face>`
- Tag `<depth-func>`
- Tag `<draw-calls>`
- Tag `<draw-loop>`
- Tag `<draw-vao>`
- Tag `<fragment-shader>`
- Tag `<new-modules>`
- Tag `<shader-canvas>`
- Tag `<tex-image-2d>`
- Tag `<tex-parameter-f>`
- Tag `<tex-parameter-i>`
- Tag `<use-program>`
- Tag `<vertex-attrib-pointer>`
- Tag `<vertex-shader>`
- Tag `<viewport-transform>`
- Tag `<webgl-buffers>`
- Tag `<webgl-canvas>`
- Tag `<webgl-program-part>`
- Tag `<webgl-programs>`
- Tag `<webgl-textures>`
- Tag `<webgl-vertex-array-objects>`