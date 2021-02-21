## `<shader-canvas>`

This is the starting tag of the graphics framework. Your app can have
several of these tags.


The allowed children are:

- `<webgl-canvas>` _WebGL low-level back-end_
- `<new-modules>` _Modules tags and their content_ 
- Any module tag defined inside the `<new-modules>`

### Example

```html
<shader-canvas>
 <webgl-canvas>
   <!-- webgl-canvas specific tags here -->
 </webgl-canvas>
 <new-modules>
   <triangle-stream>
     <!-- some webgl-canvas parts here -->
   </triangle-stream>
 </new-modules>

 <triangle-stream></triangle-stream>

</shader-canvas>
```

_[[View Source]](https://github.com/HugoDaniel/shader_canvas/blob/main/shader_canvas.ts#L55)_

### Attributes

#### _[width](https://github.com/HugoDaniel/shader_canvas/blob/main/shader_canvas.ts#L129)_

A number that sets the width of the underlying graphics backend.
This number is passed to the graphics backend to set its canvas dimensions.

It defaults to the `window.innerWidth` attribute value.

A graphics backend might not follow this number exactly and use it as a
basis to set the pixel width based on the underlying pixel ratio.
#### _[height](https://github.com/HugoDaniel/shader_canvas/blob/main/shader_canvas.ts#L143)_

A number that sets the height of the underlying graphics backend.
Like the width, this is passed to the graphics backend to set its
canvas dimensions.

It defaults to the `window.innerHeight` attribute value.

A graphics backend might not follow this number exactly and use it as a
basis to set the pixel height based on the underlying pixel ratio.


