const nop = ()=>{
    console.trace();
    console.warn("WARNING: Calling the placeholder nop() - should not happen");
};
function readBlendFactor(value, defaultFactor = "ZERO") {
    switch(value){
        case "ZERO":
        case "ONE":
        case "SRC_COLOR":
        case "ONE_MINUS_SRC_COLOR":
        case "DST_COLOR":
        case "ONE_MINUS_DST_COLOR":
        case "SRC_ALPHA":
        case "ONE_MINUS_SRC_ALPHA":
        case "DST_ALPHA":
        case "ONE_MINUS_DST_ALPHA":
        case "CONSTANT_COLOR":
        case "ONE_MINUS_CONSTANT_COLOR":
        case "CONSTANT_ALPHA":
        case "ONE_MINUS_CONSTANT_ALPHA":
        case "SRC_ALPHA_SATURATE":
            return value;
        default:
            return defaultFactor;
    }
}
class BlendFunc extends globalThis.HTMLElement {
    static tag = "blend-func";
    blendFunc = nop;
    initialize(gl) {
        const sfactor = gl[this.sfactor];
        const dfactor = gl[this.dfactor];
        this.blendFunc = ()=>gl.blendFunc(sfactor, dfactor)
        ;
        gl.enable(gl.BLEND);
    }
    get sfactor() {
        return readBlendFactor(this.getAttribute("sfactor"), "ONE");
    }
    get dfactor() {
        return readBlendFactor(this.getAttribute("dfactor"), "ZERO");
    }
}
class ClearColor extends globalThis.HTMLElement {
    static tag = "clear-color";
    clearColor = nop;
    initialize(gl) {
        const r = this.red;
        const g = this.green;
        const b = this.blue;
        const a = this.alpha;
        this.clearColor = ()=>gl.clearColor(r, g, b, a)
        ;
    }
    get red() {
        return Number(this.getAttribute("red"));
    }
    get green() {
        return Number(this.getAttribute("green"));
    }
    get blue() {
        return Number(this.getAttribute("blue"));
    }
    get alpha() {
        return Number(this.getAttribute("alpha"));
    }
}
class ClearDepth extends globalThis.HTMLElement {
    static tag = "clear-depth";
    clearDepth = nop;
    initialize(gl) {
        const depth = this.depth;
        this.clearDepth = ()=>gl.clearDepth(depth)
        ;
    }
    get depth() {
        const value = this.getAttribute("depth");
        if (value === null) return 1;
        return Number(value);
    }
}
class ClearStencil extends globalThis.HTMLElement {
    static tag = "clear-stencil";
    clearStencil = nop;
    initialize(gl) {
        const s = this.s;
        this.clearStencil = ()=>gl.clearStencil(s)
        ;
    }
    get s() {
        return Number(this.getAttribute("s"));
    }
}
class ClearFlags extends globalThis.HTMLElement {
    static tag = "clear-flags";
    get mask() {
        const maskString = this.getAttribute("mask");
        if (!maskString) return [];
        return maskString.split("|").map((s)=>s.trim()
        );
    }
    get flags() {
        return this.mask;
    }
    clearFlags = nop;
    initialize(gl) {
        const flags = this.mask;
        let mask = 0;
        flags.forEach((flag)=>{
            if (flag === "COLOR_BUFFER_BIT" || flag === "DEPTH_BUFFER_BIT" || flag === "STENCIL_BUFFER_BIT") {
                mask = gl[flag] | mask;
            }
        });
        this.clearFlags = ()=>gl.clear(mask)
        ;
    }
}
function readDepthComparison(value) {
    switch(value){
        case "NEVER":
        case "LESS":
        case "EQUAL":
        case "LEQUAL":
        case "GREATER":
        case "NOTEQUAL":
        case "GEQUAL":
        case "ALWAYS":
            return value;
        default:
            return "LESS";
    }
}
class DepthFunc extends globalThis.HTMLElement {
    static tag = "depth-func";
    depthFunc = nop;
    initialize(gl) {
        const func = gl[this.func];
        this.depthFunc = ()=>{
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(func);
        };
    }
    get func() {
        return readDepthComparison(this.getAttribute("func"));
    }
}
class ViewportTransformation extends globalThis.HTMLElement {
    static tag = "viewport-transform";
    viewport = nop;
    initialize(gl) {
        const x = this.x;
        const y = this.y;
        const width = this.width === 0 ? gl.drawingBufferWidth : this.width;
        const height = this.height === 0 ? gl.drawingBufferHeight : this.height;
        this.viewport = ()=>gl.viewport(x, y, width, height)
        ;
    }
    get x() {
        const x = Number(this.getAttribute("x"));
        if (isNaN(x)) return 0;
        return x;
    }
    get y() {
        const y = Number(this.getAttribute("y"));
        if (isNaN(y)) return 0;
        return y;
    }
    get width() {
        const w = Number(this.getAttribute("width"));
        if (isNaN(w)) return 0;
        return w;
    }
    get height() {
        const h = Number(this.getAttribute("height"));
        if (isNaN(h)) return 0;
        return h;
    }
}
function readTextureTarget(target) {
    switch(target){
        case "TEXTURE_2D":
        case "TEXTURE_CUBE_MAP_POSITIVE_X":
        case "TEXTURE_CUBE_MAP_NEGATIVE_X":
        case "TEXTURE_CUBE_MAP_POSITIVE_Y":
        case "TEXTURE_CUBE_MAP_NEGATIVE_Y":
        case "TEXTURE_CUBE_MAP_POSITIVE_Z":
        case "TEXTURE_CUBE_MAP_NEGATIVE_Z":
            return target;
        default:
            return "TEXTURE_2D";
    }
}
class TexParameter extends globalThis.HTMLElement {
    texParameterf = nop;
    texParameteri = nop;
    initialize(gl) {
        const target = gl[this.target];
        const pname = gl[this.pname];
        let param = this.param;
        if (typeof param === "string") {
            param = gl[param];
        }
        this.texParameterf = ()=>gl.texParameterf(target, pname, param)
        ;
        this.texParameteri = ()=>gl.texParameteri(target, pname, param)
        ;
    }
    set target(name) {
        if (name) {
            this.setAttribute("target", readTextureTarget(name));
        } else {
            this.setAttribute("target", "TEXTURE_2D");
        }
    }
    set pname(name) {
        if (name) {
            this.setAttribute("pname", readParameterName(name));
        } else {
            console.warn("<texture-parameter-*> a valid pname must be set");
            this.setAttribute("pname", "TEXTURE_WRAP_S");
        }
    }
    set param(value) {
        if (typeof value === "string" || value >= 0) {
            this.setAttribute("param", String(readParameter(this.pname, String(value))));
        } else {
            console.warn("<texture-parameter-*> a valid 'param' must be set");
            this.setAttribute("param", "0");
        }
    }
}
function readParameterName(value) {
    switch(value){
        case "TEXTURE_MAG_FILTER":
        case "TEXTURE_MIN_FILTER":
        case "TEXTURE_WRAP_S":
        case "TEXTURE_WRAP_T":
        case "TEXTURE_BASE_LEVEL":
        case "TEXTURE_COMPARE_FUNC":
        case "TEXTURE_COMPARE_MODE":
        case "TEXTURE_MAX_LEVEL":
        case "TEXTURE_MAX_LOD":
        case "TEXTURE_MIN_LOD":
        case "TEXTURE_WRAP_R":
            return value;
        default:
            console.warn("Invalid texture parameter name", value);
            return "TEXTURE_MAG_FILTER";
    }
}
function isValidMagFilter(value) {
    return value === "LINEAR" || value === "NEAREST";
}
function isValidMinFilter(value) {
    return value === "LINEAR" || value === "NEAREST" || value === "NEAREST_MIPMAP_NEAREST" || value === "LINEAR_MIPMAP_NEAREST" || value === "NEAREST_MIPMAP_LINEAR" || value === "LINEAR_MIPMAP_LINEAR";
}
function isValidWrap(value) {
    return value === "REPEAT" || value === "CLAMP_TO_EDGE" || value === "MIRRORED_REPEAT";
}
function isValidCompareFunc(value) {
    return value === "LEQUAL" || value === "GEQUAL" || value === "LESS" || value === "GREATER" || value === "EQUAL" || value === "NOTEQUAL" || value === "ALWAYS" || value === "NEVER";
}
function isValidCompareMode(value) {
    return value === "NONE" || value === "COMPARE_REF_TO_TEXTURE";
}
function readParameter(name, value) {
    if (value === null) {
        console.warn("<tex-parameter-*> parameter value cannot be null");
        return 0;
    }
    switch(name){
        case "TEXTURE_MAG_FILTER":
            if (isValidMagFilter(value)) return value;
            else return "LINEAR";
        case "TEXTURE_MIN_FILTER":
            if (isValidMinFilter(value)) return value;
            else return "NEAREST_MIPMAP_LINEAR";
        case "TEXTURE_WRAP_S":
        case "TEXTURE_WRAP_T":
        case "TEXTURE_WRAP_R":
            if (isValidWrap(value)) return value;
            else return "REPEAT";
        case "TEXTURE_COMPARE_FUNC":
            if (isValidCompareFunc(value)) return value;
            else return "LEQUAL";
        case "TEXTURE_COMPARE_MODE":
            if (isValidCompareMode(value)) return value;
            else return "NONE";
        case "TEXTURE_BASE_LEVEL":
        case "TEXTURE_MAX_LEVEL":
            if (isNaN(Number(value))) return 0;
            else return Math.round(Number(value));
        case "TEXTURE_MAX_LOD":
        case "TEXTURE_MIN_LOD":
            if (isNaN(Number(value))) return 0;
            else return Number(value);
        default:
            console.warn("<tex-parameter-*>: No valid target found for name, setting 0");
            return 0;
    }
}
class TexParameterI extends TexParameter {
    static tag = "tex-parameter-i";
    get texParameter() {
        return this.texParameteri;
    }
    get target() {
        return readTextureTarget(this.getAttribute("target") || "TEXTURE_2D");
    }
    get pname() {
        return readParameterName(this.getAttribute("pname") || "TEXTURE_WRAP_S");
    }
    get param() {
        return readParameter(this.pname, this.getAttribute("param"));
    }
}
class TexParameterF extends TexParameter {
    static tag = "tex-parameter-f";
    get texParameter() {
        return this.texParameterf;
    }
    get target() {
        return readTextureTarget(this.getAttribute("target") || "TEXTURE_2D");
    }
    get pname() {
        return readParameterName(this.getAttribute("pname") || "TEXTURE_WRAP_S");
    }
    get param() {
        return readParameter(this.pname, this.getAttribute("param"));
    }
}
const dependsOn = [
    TexParameterI,
    TexParameterF
];
class ActiveTexture extends globalThis.HTMLElement {
    static tag = "active-texture";
    whenLoaded = Promise.all(dependsOn.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    texture = undefined;
    unit = 0;
    get src() {
        return this.getAttribute("src");
    }
    get var() {
        return this.getAttribute("var");
    }
    drawCalls = [];
    async initialize(gl, context, program) {
        await this.whenLoaded;
        const src = this.src;
        if (!src) {
            console.warn("<active-texture>: no src attribute found");
            return;
        }
        const variable = this.var;
        if (!variable) {
            console.warn("<active-texture>: no var attribute found");
            return;
        }
        const texture = context.textures.content.get(src);
        this.texture = texture;
        if (texture?.texture) {
            const index = program.allTextureVariables().findIndex((v)=>v.name === variable
            );
            if (index < 0) {
                console.warn(`<active-texture>: unable to find the variable ${variable} in \
          ${program.name}`);
                return;
            }
            this.unit = index;
            const location = program.uniformLocations.get(variable);
            if (!location) {
                console.warn(`<active-texture>: unable to find the location for variable \
          ${variable} in ${program.name}`);
                return;
            }
            this.drawCalls.push(()=>{
                gl.uniform1i(location, index);
                gl.activeTexture(gl.TEXTURE0 + index);
                texture.bindTexture();
            });
            const children = Array.from(this.children);
            if (children.filter((c)=>c instanceof TexParameterI
            ).length === 0) {
                const texParamElem = globalThis.document.createElement("tex-parameter-i");
                texParamElem.setAttribute("target", "TEXTURE_2D");
                texParamElem.setAttribute("pname", "TEXTURE_MIN_FILTER");
                texParamElem.setAttribute("param", "LINEAR");
                this.appendChild(texParamElem);
            }
            for (const child of children){
                if (child instanceof TexParameterI || child instanceof TexParameterF) {
                    child.initialize(gl);
                    const drawFunction = child.texParameter;
                    this.drawCalls.push(drawFunction);
                } else {
                    console.warn(`<active-texture>: Not a valid child: \
            <${child.tagName.toLocaleLowerCase()}>`);
                }
            }
        }
    }
}
[
    ActiveTexture,
    ...dependsOn
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
class DrawVAO extends globalThis.HTMLElement {
    static tag = "draw-vao";
    get src() {
        return this.getAttribute("src");
    }
    get mode() {
        return readVaoMode(this.getAttribute("mode"));
    }
    set count(value) {
        if (value) {
            this.setAttribute("count", `${value}`);
        }
    }
    get count() {
        return Number(this.getAttribute("count"));
    }
    set instanceCount(value) {
        if (value) {
            this.setAttribute("instanceCount", `${value}`);
        }
    }
    get instanceCount() {
        return Number(this.getAttribute("instanceCount"));
    }
    get offset() {
        return Number(this.getAttribute("offset"));
    }
    get first() {
        return Number(this.getAttribute("first"));
    }
    get type() {
        return readVAOType(this.getAttribute("type"));
    }
    drawVao = nop;
    initialize(gl, context) {
        const src = this.src;
        if (!src) {
            console.warn("<draw-vao>: no src attribute found");
            return;
        }
        this.vao = context.vaos.content.get(src);
        if (!this.vao) {
            console.warn(`<draw-vao>: unable to find program named <${src}>`);
            return;
        }
        const bindVao = this.vao.bindVAO;
        const mode = gl[this.mode];
        let count = this.count;
        if (count === 0) {
            count = this.vao.location0Count || readTargetMinCount(this.mode);
            this.count = count;
        }
        const type = gl[this.type];
        const offset = this.offset;
        const first = this.first;
        const instances = this.instanceCount;
        if (this.vao.hasElementArrayBuffer) {
            if (instances > 0) {
                console.log("ELEMENTS WITH INSTANCES", instances, count);
                this.drawVao = ()=>{
                    bindVao();
                    gl.drawElementsInstanced(mode, count, type, offset, instances);
                };
            } else {
                this.drawVao = ()=>{
                    bindVao();
                    gl.drawElements(mode, count, type, offset);
                };
            }
        } else {
            if (instances > 0) {
                console.log("ARRAYS WITH INSTANCES", instances, count);
                this.drawVao = ()=>{
                    bindVao();
                    gl.drawArraysInstanced(mode, first, count, instances);
                };
            } else {
                console.log("WITHOUT INSTANCES");
                this.drawVao = ()=>{
                    bindVao();
                    gl.drawArrays(mode, first, count);
                };
            }
        }
    }
}
function readVaoMode(value) {
    if (!value) return "TRIANGLES";
    switch(value){
        case "POINTS":
        case "LINE_STRIP":
        case "LINE_LOOP":
        case "LINES":
        case "TRIANGLE_STRIP":
        case "TRIANGLE_FAN":
        case "TRIANGLES":
            return value;
        default:
            return "TRIANGLES";
    }
}
function readTargetMinCount(t) {
    console.warn("<draw-vao>: count attribute not set, using the minimum count");
    switch(t){
        case "POINTS":
            return 1;
        case "LINE_STRIP":
        case "LINE_LOOP":
        case "LINES":
            return 2;
        case "TRIANGLE_STRIP":
        case "TRIANGLE_FAN":
        case "TRIANGLES":
            return 3;
        default:
            return 0;
    }
}
function readVAOType(value) {
    if (value === "UNSIGNED_SHORT") return value;
    if (value === "UNSIGNED_INT") return value;
    return "UNSIGNED_BYTE";
}
class SetUniform extends globalThis.HTMLElement {
    get var() {
        return this.getAttribute("var");
    }
    get value() {
        return this.getAttribute("value");
    }
    get format() {
        return this.getAttribute("format");
    }
    name = "uniform1fv";
    drawCalls = [];
    initialize(gl, context, program) {
        const variable = this.var;
        if (!variable) {
            console.warn("<set-uniform>: no var attribute found");
            return;
        }
        const value = this.value;
        if (!value) {
            console.warn("<set-uniform>: no value attribute found");
            return;
        }
        let arrayValue = [];
        const parsedValue = JSON.parse(value);
        if (!(parsedValue instanceof Array)) {
            arrayValue.push(Number(parsedValue));
        } else {
            arrayValue = parsedValue.map(Number);
        }
        const location = program.uniformLocations.get(variable);
        this.drawCalls.push(()=>{
            if (!location) {
                console.error(`<set-uniform>: Location for ${variable} not found`);
                return;
            }
            gl[this.name](location, arrayValue);
        });
    }
}
class SetUniform1iv extends SetUniform {
    static tag = "uniform-1iv";
    name = "uniform1iv";
}
class SetUniform2iv extends SetUniform {
    static tag = "uniform-2iv";
    name = "uniform2iv";
}
class SetUniform3iv extends SetUniform {
    static tag = "uniform-3iv";
    name = "uniform3iv";
}
class SetUniform4iv extends SetUniform {
    static tag = "uniform-4iv";
    name = "uniform4iv";
}
class SetUniform1fv extends SetUniform {
    static tag = "uniform-1fv";
    name = "uniform1fv";
}
class SetUniform2fv extends SetUniform {
    static tag = "uniform-2fv";
    name = "uniform2fv";
}
class SetUniform3fv extends SetUniform {
    static tag = "uniform-3fv";
    name = "uniform3fv";
}
class SetUniform4fv extends SetUniform {
    static tag = "uniform-4fv";
    name = "uniform4fv";
}
[
    SetUniform1iv,
    SetUniform2iv,
    SetUniform3iv,
    SetUniform4iv,
    SetUniform1fv,
    SetUniform2fv,
    SetUniform3fv,
    SetUniform4fv, 
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
const dependsOn1 = [
    DrawVAO,
    SetUniform1iv,
    SetUniform2iv,
    SetUniform3iv,
    SetUniform4iv,
    SetUniform1fv,
    SetUniform2fv,
    SetUniform3fv,
    SetUniform4fv, 
];
class UseProgram extends globalThis.HTMLElement {
    static tag = "use-program";
    whenLoaded = Promise.all(dependsOn1.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    get src() {
        return this.getAttribute("src");
    }
    program = undefined;
    useProgram = nop;
    drawCalls = [];
    drawProgram = nop;
    async initialize(gl, context, renderers) {
        await this.whenLoaded;
        const src = this.src;
        if (!src) {
            console.warn("<use-program>: no src attribute found");
            return;
        }
        this.program = context.programs.content.get(src);
        if (!this.program) {
            console.warn(`<use-program>: unable to find program named <${src}>`);
            return;
        }
        const program = this.program;
        const glProgramId = this.program.program;
        if (!glProgramId) {
            console.warn(`<use-program>: GL Program not set for program <${src}>`);
            return;
        }
        if (this.program.modules.length > 0) {
            const name = this.program?.name;
            const onStart = this.program.modules.map((module)=>context.modulesFunctions.get(module)?.onUseProgram
            ).filter((f)=>f !== undefined
            );
            this.useProgram = ()=>{
                gl.useProgram(glProgramId);
                for(let i = 0; i < onStart.length; i++){
                    onStart[i](context, program, name);
                }
            };
        } else {
            this.useProgram = ()=>gl.useProgram(glProgramId)
            ;
        }
        const renderFunction = renderers.get(src);
        if (renderFunction) {
            this.drawCalls.push(renderFunction);
        }
        for (const child of Array.from(this.children)){
            if (child instanceof DrawVAO) {
                child.initialize(gl, context);
                this.drawCalls.push(child.drawVao);
            } else if (child instanceof ActiveTexture) {
                await child.initialize(gl, context, this.program);
                this.drawCalls = this.drawCalls.concat(child.drawCalls);
            } else if (child instanceof SetUniform) {
                await child.initialize(gl, context, this.program);
                this.drawCalls = this.drawCalls.concat(child.drawCalls);
            } else {
                console.warn(`<use-program>: This tag "<${child.tagName.toLocaleLowerCase()}>" is not a valid child of use-program`);
            }
        }
        this.drawProgram = ()=>{
            this.useProgram();
            for(let i = 0; i < this.drawCalls.length; i++){
                this.drawCalls[i]();
            }
        };
    }
}
class CullFace extends globalThis.HTMLElement {
    static tag = "cull-face";
    get mode() {
        return readCullFaceMode(this.getAttribute("mode"));
    }
    cullFace = nop;
    initialize(gl) {
        const mode = gl[this.mode];
        this.cullFace = ()=>{
            gl.enable(gl.CULL_FACE);
            gl.cullFace(mode);
        };
    }
}
function readCullFaceMode(attrib) {
    switch(attrib){
        case "FRONT":
        case "BACK":
        case "FRONT_AND_BACK":
            return attrib;
        default:
            return "BACK";
    }
}
class CanMerge extends globalThis.HTMLElement {
    module = "unknown";
    merge(dest, root = this) {
        if (!dest) return;
        const destChildNames = new Map(Array.from(dest.children).map(getChildName));
        for (const child of Array.from(root.children)){
            if (destChildNames.has(child.tagName)) {
                const destChild = destChildNames.get(child.tagName);
                copyAttributes(child, destChild);
                this.merge(destChild, child);
            } else {
                dest.appendChild(child);
            }
        }
    }
}
function getChildName(c) {
    return [
        c.tagName,
        c
    ];
}
function copyAttributes(src, dest) {
    if (!dest) return;
    const attributes = Array.prototype.slice.call(src.attributes);
    let attr;
    do {
        dest.setAttribute(attr.nodeName, attr.nodeValue);
        attr = attributes.pop();
    }while (attr)
}
class DrawBuffers extends globalThis.HTMLElement {
    static tag = "draw-buffers";
    get buffers() {
        const parsed = JSON.parse(this.getAttribute("buffers") || "[]");
        return parsed.map(readBuffers1);
    }
    drawBuffers = nop;
    initialize(gl) {
        const buffers = this.buffers.map((b)=>gl[b]
        );
        this.drawBuffers = ()=>{
            gl.drawBuffers(buffers);
        };
    }
}
function readBuffers1(attrib) {
    switch(attrib){
        case "BACK":
        case "COLOR_ATTACHMENT0":
        case "COLOR_ATTACHMENT1":
        case "COLOR_ATTACHMENT2":
        case "COLOR_ATTACHMENT3":
        case "COLOR_ATTACHMENT4":
        case "COLOR_ATTACHMENT5":
        case "COLOR_ATTACHMENT6":
        case "COLOR_ATTACHMENT7":
        case "COLOR_ATTACHMENT8":
        case "COLOR_ATTACHMENT9":
        case "COLOR_ATTACHMENT10":
        case "COLOR_ATTACHMENT11":
        case "COLOR_ATTACHMENT12":
        case "COLOR_ATTACHMENT13":
        case "COLOR_ATTACHMENT14":
        case "COLOR_ATTACHMENT15":
            return attrib;
        default:
            return "NONE";
    }
}
class ReadPixels extends globalThis.HTMLElement {
    static tag = "read-pixels";
    get x() {
        return Number(this.getAttribute("x"));
    }
    get y() {
        return Number(this.getAttribute("y"));
    }
    get offset() {
        return Number(this.getAttribute("offset"));
    }
    get width() {
        return Number(this.getAttribute("width"));
    }
    get height() {
        return Number(this.getAttribute("height"));
    }
    get format() {
        return readPixelDataFormat(this.getAttribute("format"));
    }
    get type() {
        return readPixelDataType(this.getAttribute("type"));
    }
    get dest() {
        return this.getAttribute("dest");
    }
    isDrawingBlocked = false;
    getPixels = (id)=>Promise.reject(`"readPixels()" is undefined`)
    ;
    readPixels = nop;
    initialize(gl, buffers) {
        const x = this.x;
        const y = this.y;
        const w = this.width || gl.drawingBufferWidth;
        const h = this.height || gl.drawingBufferHeight;
        const format = gl[this.format];
        const type = gl[this.type];
        const offset = this.offset;
        const dest = this.dest;
        let bindPixelBuffer = ()=>0
        ;
        if (dest) {
            const buffer = buffers.content.get(dest);
            if (!buffer || !buffer.buffer) {
                console.warn(`Could not find the buffer "${dest}" in <draw-pixels>.`);
                return;
            }
            bindPixelBuffer = buffer.bindBuffer;
        }
        this.readPixels = ()=>{
            if (this.readAllowed) {
                bindPixelBuffer();
                gl.readPixels(x, y, w, h, format, type, offset);
            }
        };
        this.getPixels = async (dest1)=>{
            this.readAllowed = true;
            await waitFrame();
            this.readAllowed = false;
            this.isDrawingBlocked = true;
            await fence1(gl, ()=>{
                gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, dest1, 0);
                this.isDrawingBlocked = false;
            });
            return dest1;
        };
    }
    readAllowed = false;
}
function readPixelDataType(t) {
    switch(t){
        case "UNSIGNED_BYTE":
        case "UNSIGNED_SHORT_5_6_5":
        case "UNSIGNED_SHORT_4_4_4_4":
        case "UNSIGNED_SHORT_5_5_5_1":
        case "FLOAT":
        case "BYTE":
        case "UNSIGNED_INT_2_10_10_10_REV":
        case "HALF_FLOAT":
        case "SHORT":
        case "UNSIGNED_SHORT":
        case "INT":
        case "UNSIGNED_INT":
        case "UNSIGNED_INT_10F_11F_11F_REV":
        case "UNSIGNED_INT_5_9_9_9_REV":
            return t;
        default:
            return "UNSIGNED_BYTE";
    }
}
function readPixelDataFormat(t) {
    switch(t){
        case "ALPHA":
        case "RGB":
        case "RGBA":
        case "RED":
        case "RG":
        case "RED_INTEGER":
        case "RG_INTEGER":
        case "RGB_INTEGER":
        case "RGBA_INTEGER":
            return t;
        default:
            return "RGBA";
    }
}
async function fence1(gl, action) {
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!sync) return;
    gl.flush();
    for(let i = 0; i < 6; i++){
        await waitFrame();
        const syncStatus = gl.clientWaitSync(sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0);
        if (syncStatus === gl.ALREADY_SIGNALED || syncStatus === gl.CONDITION_SATISFIED) {
            break;
        }
    }
    gl.deleteSync(sync);
    return action();
}
function waitFrame() {
    return new Promise((resolve)=>{
        window.requestAnimationFrame(resolve);
    });
}
class ReadBuffer extends globalThis.HTMLElement {
    static tag = "read-buffer";
    get src() {
        return readBuffers2(this.getAttribute("src"));
    }
    readBuffer = nop;
    initialize(gl) {
        const buffer = gl[this.src];
        this.readBuffer = ()=>{
            gl.readBuffer(buffer);
        };
    }
}
function readBuffers2(attrib) {
    switch(attrib){
        case "BACK":
        case "COLOR_ATTACHMENT0":
        case "COLOR_ATTACHMENT1":
        case "COLOR_ATTACHMENT2":
        case "COLOR_ATTACHMENT3":
        case "COLOR_ATTACHMENT4":
        case "COLOR_ATTACHMENT5":
        case "COLOR_ATTACHMENT6":
        case "COLOR_ATTACHMENT7":
        case "COLOR_ATTACHMENT8":
        case "COLOR_ATTACHMENT9":
        case "COLOR_ATTACHMENT10":
        case "COLOR_ATTACHMENT11":
        case "COLOR_ATTACHMENT12":
        case "COLOR_ATTACHMENT13":
        case "COLOR_ATTACHMENT14":
        case "COLOR_ATTACHMENT15":
            return attrib;
        default:
            return "NONE";
    }
}
const dependencies = [
    ClearColor,
    BlendFunc,
    ClearDepth,
    CullFace,
    ClearStencil,
    ClearFlags,
    DepthFunc,
    ViewportTransformation,
    DrawVAO,
    UseProgram,
    SetUniform1iv,
    SetUniform2iv,
    SetUniform3iv,
    SetUniform4iv,
    SetUniform1fv,
    SetUniform2fv,
    SetUniform3fv,
    SetUniform4fv,
    DrawBuffers,
    ReadPixels,
    ReadBuffer, 
];
const dependsOn2 = [
    ...dependencies
];
class DrawCallsContainer extends CanMerge {
    drawFunctions = [];
    drawCalls = nop;
    fence = ()=>this.fenceChildren.some(this.isDrawingBlocked)
    ;
    isDrawingBlocked = ({ isDrawingBlocked  })=>isDrawingBlocked
    ;
    fenceChildren = [];
    runDrawCalls = true;
    async buildDrawFunction(gl, context, renderers, updaters) {
        this.gl = gl;
        for (const child of Array.from(this.children)){
            if (child instanceof ClearColor) {
                child.initialize(gl);
                this.drawFunctions.push(child.clearColor);
            } else if (child instanceof BlendFunc) {
                child.initialize(gl);
                this.drawFunctions.push(child.blendFunc);
            } else if (child instanceof ClearDepth) {
                child.initialize(gl);
                this.drawFunctions.push(child.clearDepth);
            } else if (child instanceof ClearStencil) {
                child.initialize(gl);
                this.drawFunctions.push(child.clearStencil);
            } else if (child instanceof ClearFlags) {
                child.initialize(gl);
                this.drawFunctions.push(child.clearFlags);
            } else if (child instanceof CullFace) {
                child.initialize(gl);
                this.drawFunctions.push(child.cullFace);
            } else if (child instanceof DepthFunc) {
                child.initialize(gl);
                this.drawFunctions.push(child.depthFunc);
            } else if (child instanceof ViewportTransformation) {
                child.initialize(gl);
                this.drawFunctions.push(child.viewport);
            } else if (child instanceof ReadBuffer) {
                child.initialize(gl);
                this.drawFunctions.push(child.readBuffer);
            } else if (child instanceof ReadPixels) {
                child.initialize(gl, context.buffers);
                this.drawFunctions.push(child.readPixels);
                this.fenceChildren.push(child);
            } else if (child instanceof UseProgram) {
                await child.initialize(gl, context, renderers);
                this.drawFunctions.push(child.drawProgram);
            } else if (child instanceof DrawBuffers) {
                child.initialize(gl);
                this.drawFunctions.push(child.drawBuffers);
            } else if (child instanceof BindFramebuffer && child.runDrawCalls) {
                await child.initialize(gl, context, renderers, updaters);
                this.drawFunctions.push(child.drawCalls);
            }
        }
        this.drawCalls = ()=>{
            if (this.fence()) return;
            for(let i = 0; i < updaters.length; i++){
                updaters[i]();
            }
            for(let i1 = 0; i1 < this.drawFunctions.length; i1++){
                this.drawFunctions[i1]();
            }
        };
        return this.drawCalls;
    }
    readFunction = undefined;
    read = 0;
}
class BindFramebuffer extends DrawCallsContainer {
    static tag = "bind-framebuffer";
    whenLoaded = Promise.all(dependsOn2.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    get src() {
        return this.getAttribute("src");
    }
    async initialize(gl, context, renderers, updaters) {
        await this.whenLoaded;
        const framebufferName = this.src;
        if (!framebufferName) {
            console.warn(`No "src" attribute found in <${BindFramebuffer}>.`);
            return;
        }
        const framebuffer = context.framebuffers.content.get(framebufferName);
        if (!framebuffer) {
            console.warn(`Framebuffer "${framebufferName}" NOT FOUND in <${BindFramebuffer}>.\n\n        Make sure it is properly declared inside <webgl-framebuffers>.`);
            return;
        }
        this.drawFunctions.push(framebuffer.bindFramebuffer);
        const target = gl[framebuffer.target];
        await this.buildDrawFunction(gl, context, renderers, updaters);
        this.drawFunctions.push(()=>{
            gl.bindFramebuffer(target, null);
        });
        this.gl = gl;
    }
}
[
    BindFramebuffer,
    ...dependsOn2
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
const dependsOn3 = [
    ...dependencies
];
class DrawLoop extends DrawCallsContainer {
    static tag = "draw-loop";
    whenLoaded = Promise.all(dependsOn3.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    runDrawCalls = false;
    intervalId = -1;
    raf = ()=>{
        this.drawCalls();
        this.intervalId = this.requestFrame();
    };
    start() {
        if (this.intervalId !== -1) return;
        if (this.fps) {
            const interval = Math.floor(1000 / this.fps);
            this.requestFrame = ()=>setTimeout(this.raf, interval)
            ;
        }
        this.intervalId = this.requestFrame();
    }
    stop() {
        if (this.intervalId === -1) {
            return;
        }
        if (this.fps) {
            clearTimeout(this.intervalId);
        } else {
            window.cancelAnimationFrame(this.intervalId);
        }
        this.intervalId = -1;
    }
    requestFrame = ()=>window.requestAnimationFrame(this.raf)
    ;
    async initialize(gl, context, renderers, updaters) {
        await this.whenLoaded;
        console.log("DRAW LOOP RENDERERS", renderers);
        await this.buildDrawFunction(gl, context, renderers, updaters);
        for (const functions of context.modulesFunctions.values()){
            if (functions.onFrame && typeof functions.onFrame === "function") {
                const f = functions.onFrame;
                this.drawFunctions.unshift(()=>f(context)
                );
            }
        }
        this.gl = gl;
    }
    get fps() {
        const value = this.getAttribute("fps");
        if (value) {
            return Number(value);
        }
        return null;
    }
}
[
    DrawLoop,
    ...dependsOn3
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
const dependsOn4 = [
    DrawLoop,
    ...dependencies
];
class DrawCalls extends DrawCallsContainer {
    static tag = "draw-calls";
    whenLoaded = Promise.all(dependsOn4.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    async initialize(gl, context, renderers, updaters) {
        await this.whenLoaded;
        await this.buildDrawFunction(gl, context, renderers, updaters);
        const drawLoopElem = this.querySelector(DrawLoop.tag);
        if (drawLoopElem && drawLoopElem instanceof DrawLoop) {
            await drawLoopElem.initialize(gl, context, renderers, updaters);
            drawLoopElem.start();
        }
    }
}
[
    DrawCalls,
    ...dependsOn4
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
class ShaderCanvasContainer extends CanMerge {
    content = new Map();
    createContentComponentsWith = (parent)=>{
        for (const child of Array.from(this.children)){
            const childName = child.tagName.toLocaleLowerCase();
            if (!childName) {
                throw new Error(`Unable to read ${this.tagName} child`);
            }
            if (!globalThis.customElements.get(childName)) {
                const contentClass = class extends parent {
                };
                globalThis.customElements.define(childName, contentClass);
                this.content.set(childName, child);
            }
        }
        if (this.content.size === 0) {
            console.error(`No valid child nodes in <${this.tagName.toLocaleLowerCase()}>`);
        }
    };
}
function parse(code) {
    const blocks = [];
    let shaderCode = code.split("\n").filter((line)=>!line.trim().startsWith("#")
    ).join("\n");
    shaderCode = replaceBlocks(shaderCode, "//", "\n");
    shaderCode = shaderCode.split("//").join("");
    shaderCode = replaceBlocks(shaderCode, "/*", "*/");
    shaderCode = shaderCode.split("/**/").join("");
    shaderCode = replaceBlocks(shaderCode, "{", "}", (match)=>String(blocks.push(match) - 1)
    );
    shaderCode = replaceBlocks(shaderCode, "(", ")", (match)=>String(blocks.push(match) - 1)
    );
    const structs = readExpressions(shaderCode, {
        blocks,
        expressionFilter: expressionStructsFilter
    });
    const extraTypes = structs.map((s)=>s.name
    ).filter((s)=>typeof s === "string"
    );
    return readExpressions(shaderCode, {
        blocks,
        extraTypes
    }).concat(structs).map(fromPartialToFullVariable);
}
function isGLSLVariable(value) {
    return typeof value === "object" && value !== null && "qualifier" in value && (value.qualifier === "struct" || isQualifier(value.qualifier)) && "type" in value && (value.type === "block" || value.type === "struct" || isGLSLType(value.type)) && "name" in value && typeof value.name === "string" && "amount" in value && typeof value.amount === "number" && !isNaN(value.amount) && "isInvariant" in value && typeof value.isInvariant === "boolean" && "isCentroid" in value && typeof value.isCentroid === "boolean" && "layout" in value && (value.layout === null || typeof value.layout === "string") && "precision" in value && (value.precision === null || isGLSLPrecision(value.precision));
}
function readExpressions(code, { expressionFilter =expressionShaderIOFilter , blocks =[] , extraTypes =[]  }) {
    return code.split(";").map((expression)=>expression.match(/\S+/g) || []
    ).filter(expressionFilter).map((expressionWords)=>readVariable(expressionWords, {
            blocks,
            extraTypes
        })
    );
}
function expressionShaderIOFilter(expressionWords) {
    if (expressionWords.length === 0) return false;
    const initialWord = expressionWords[0];
    return initialWord === "uniform" || initialWord === "in" || initialWord === "out" || initialWord.includes("layout") || initialWord.includes("precision") && expressionWords.length > 3;
}
function expressionStructsFilter(expressionWords) {
    if (expressionWords.length === 0) return false;
    return expressionWords[0] === "struct";
}
function createVariablesFilter(extraTypes) {
    return (expressionWords)=>{
        if (expressionWords.length === 0) return false;
        return isGLSLType(expressionWords[0]) || extraTypes.includes(expressionWords[0]) || expressionShaderIOFilter(expressionWords);
    };
}
function replaceBlocks(code, blockStart, blockEnd, replacer = ()=>""
) {
    const blocks = code.split(blockStart);
    if (blocks.length <= 1) {
        return code;
    }
    let result = code;
    for(let i = 0; i < blocks.length; i++){
        const b = blocks[i];
        const endIndex = b.indexOf(blockEnd);
        if (endIndex > 0) {
            result = result.replace(b.slice(0, endIndex), replacer);
        }
    }
    return result;
}
function isQualifier(value) {
    return typeof value === "string" && (value === "in" || value === "uniform" || value === "out");
}
function parseExpressionWord(word, variable, extraTypes = []) {
    if (!variable.qualifier && (isQualifier(word) || word === "struct")) {
        variable.qualifier = word;
        return variable;
    }
    if (!variable.structName && extraTypes.includes(word)) {
        variable.type = "struct";
        variable.structName = word;
        return variable;
    }
    if (!variable.type && isGLSLType(word)) {
        variable.type = word;
        return variable;
    }
    const bracketIndex = word.indexOf("[");
    if (bracketIndex >= 0) {
        variable.amount = Number(word.slice(bracketIndex + 1, word.indexOf("]")));
        if (bracketIndex > 0) {
            variable.name = word.slice(0, bracketIndex);
        }
        return variable;
    }
    if (!variable.isCentroid && word === "centroid") {
        variable.isCentroid = true;
        return variable;
    }
    if (!variable.isInvariant && word === "invariant") {
        variable.isInvariant = true;
        return variable;
    }
    if (!variable.precision && isGLSLPrecision(word)) {
        variable.precision = word;
        return variable;
    }
    if (!variable.name) {
        variable.name = word;
        return variable;
    }
    return variable;
}
function createPartialVariable() {
    return {
        precision: null,
        layout: null,
        block: null,
        isCentroid: false,
        isInvariant: false,
        amount: 1,
        structName: null
    };
}
function processWordsWithin(expressionWords, leftLimit, rightLimit, processor) {
    const result = [];
    let processorInput = [];
    const startIndex = expressionWords.findIndex((w)=>w.includes(leftLimit)
    );
    const endIndex = expressionWords.findIndex((w)=>w.includes(rightLimit)
    );
    if (startIndex === -1 && endIndex === -1) {
        return expressionWords;
    }
    const lastWord = expressionWords[endIndex];
    if (typeof lastWord === "undefined" || lastWord.length === 0) {
        return expressionWords;
    }
    if (startIndex === endIndex) {
        processorInput.push(lastWord.slice(lastWord.indexOf(leftLimit) + 1, lastWord.indexOf(rightLimit)));
    } else {
        processorInput.push(expressionWords[startIndex].slice(expressionWords[startIndex].indexOf(leftLimit) + 1));
        processorInput = processorInput.concat(expressionWords.slice(startIndex + 1, endIndex));
        processorInput.push(lastWord.slice(0, lastWord.indexOf(rightLimit)));
    }
    processor(processorInput);
    if (lastWord.indexOf(rightLimit) < lastWord.length - 1) {
        result.push(lastWord.slice(lastWord.indexOf(rightLimit) + 1));
    }
    return result.concat(expressionWords.slice(endIndex + 1));
}
function readVariable(expressionWords, { blocks =[] , extraTypes =[]  }) {
    const variable = createPartialVariable();
    let words = expressionWords;
    words = processWordsWithin(expressionWords, "(", ")", (blockNumber)=>{
        const blockIndex = Number(blockNumber);
        if (!isNaN(blockIndex) && blockIndex >= 0 && blockIndex < blocks.length) {
            variable.layout = blocks[Number(blockNumber)].split(" ").join("");
        }
    });
    for (let word of words){
        const openBracketIndex = word.indexOf("{");
        if (openBracketIndex >= 0) {
            word = word.slice(0, openBracketIndex);
        }
        const closeBracketIndex = word.indexOf("}");
        if (closeBracketIndex >= 0) {
            word = word.slice(closeBracketIndex + 1);
        }
        parseExpressionWord(word, variable, extraTypes);
    }
    processWordsWithin(words, "{", "}", (blockNumber)=>{
        const blockIndex = Number(blockNumber);
        if (!isNaN(blockIndex) && blockIndex >= 0 && blockIndex < blocks.length) {
            variable.block = readExpressions(blocks[blockIndex], {
                blocks,
                extraTypes,
                expressionFilter: createVariablesFilter(extraTypes)
            }).map((v)=>{
                if (!v.qualifier) {
                    v.qualifier = variable.qualifier;
                }
                if (isGLSLVariable(v)) {
                    return v;
                } else {
                    throw new Error(`Invalid block variable: ${JSON.stringify(v)}`);
                }
            });
            variable.type = "block";
        }
    });
    return variable;
}
function fromPartialToFullVariable(variable) {
    if (isGLSLVariable(variable)) {
        return variable;
    } else {
        throw new Error("Unable to read a full GLSL variable: " + JSON.stringify(variable));
    }
}
function isGLSLPrecision(value) {
    return value === "highp" || value == "mediump" || value === "lowp";
}
function isGLSLType(value) {
    switch(value){
        case "double":
        case "float":
        case "uint":
        case "int":
        case "bool":
        case "vec2":
        case "vec3":
        case "vec4":
        case "dvec2":
        case "dvec3":
        case "dvec4":
        case "uvec2":
        case "uvec3":
        case "uvec4":
        case "ivec2":
        case "ivec3":
        case "ivec4":
        case "bvec2":
        case "bvec3":
        case "bvec4":
        case "mat2":
        case "mat3":
        case "mat4":
        case "mat2x2":
        case "mat2x3":
        case "mat2x4":
        case "mat3x2":
        case "mat3x3":
        case "mat3x4":
        case "mat4x2":
        case "mat4x3":
        case "mat4x4":
        case "sampler2D":
        case "sampler3D":
        case "samplerCube":
        case "samplerCubeShadow":
        case "sampler2DShadow":
        case "sampler2DArray":
        case "sampler2DArrayShadow":
        case "isampler2D":
        case "isampler3D":
        case "isamplerCube":
        case "isampler2DArray":
        case "usampler2D":
        case "usampler3D":
        case "usamplerCube":
        case "usampler2DArray":
            return true;
        default:
            return false;
    }
}
function isInputVariable(variable) {
    return variable.qualifier !== "out";
}
function isOutputVariable(variable) {
    return variable.qualifier === "out";
}
function isSamplerVariable(variable) {
    if (variable.qualifier === "uniform") {
        switch(variable.type){
            case "sampler2D":
            case "sampler3D":
            case "samplerCube":
            case "samplerCubeShadow":
            case "sampler2DShadow":
            case "sampler2DArray":
            case "sampler2DArrayShadow":
            case "isampler2D":
            case "isampler3D":
            case "isamplerCube":
            case "isampler2DArray":
            case "usampler2D":
            case "usampler3D":
            case "usamplerCube":
            case "usampler2DArray":
                return true;
            default:
                return false;
        }
    }
    return false;
}
class ShaderCode extends globalThis.HTMLElement {
    code = "";
    variables = [];
    initialize() {
        this.setupCode();
        this.appendChild(globalThis.document.createTextNode(this.code));
    }
    getCode = (codeTags)=>{
        if (codeTags.length === 0) return "";
        return codeTags.map((code)=>(code.textContent || "").trim()
        ).reduce((accum, value)=>`${accum}\n${value}`
        );
    };
    adjustVersion(code) {
        return this.placeLineOnTop(code, [
            "#version "
        ]);
    }
    adjustPrecision(code) {
        return this.placeLineOnTop(code, [
            "precision highp float;",
            "precision mediump float;",
            "precision lowp float;", 
        ]);
    }
    placeLineOnTop(code, lookFor) {
        const lines = code.split("\n");
        const splitIndex = lines.findIndex((l)=>lookFor.some((words)=>l.includes(words)
            )
        );
        if (splitIndex <= 0) return code;
        return [
            lines[splitIndex],
            ...lines.slice(0, splitIndex),
            ...lines.slice(splitIndex + 1), 
        ].join("\n");
    }
    readCode = ()=>{
        const codeTags = [
            ...Array.from(this.getElementsByTagName("code-before")),
            ...Array.from(this.getElementsByTagName("code")),
            ...Array.from(this.getElementsByTagName("code-after")), 
        ];
        return this.getCode(codeTags);
    };
    setupCode = ()=>{
        this.code = this.readCode();
        if (!this.code || this.code.length === 0 || this.code.trim().length === 0) {
            throw new Error(`Shader must have at least one non-empty code tag\n\
      Please ensure that there is at least one of "<code-before>", "<code>", \
      "<code-after>"`);
        }
        this.code = this.adjustPrecision(this.code);
        this.code = this.adjustVersion(this.code);
        this.variables = parse(this.code);
    };
    loadShader(gl, type) {
        const shader = gl.createShader(type);
        if (!shader) {
            throw new Error("Unable to create a WebGL Shader");
        }
        gl.shaderSource(shader, this.code);
        this.shader = shader;
    }
    compile(gl) {
        if (!this.shader) return;
        gl.compileShader(this.shader);
    }
    statusCheck(gl) {
        if (!this.shader) {
            throw new Error("Status: Shader not loaded: " + this.code);
        }
        this.status = gl.getShaderParameter(this.shader, gl.COMPILE_STATUS);
        this.log = gl.getShaderInfoLog(this.shader) || "Status: Nothing to report";
        if (!this.status) {
            gl.deleteShader(this.shader);
            throw new Error(`Status: An error occurred compiling the shader: ${this.log}`);
        }
    }
}
class VertexShader extends ShaderCode {
    static tag = "vertex-shader";
    load(gl) {
        this.loadShader(gl, gl.VERTEX_SHADER);
    }
}
class FragmentShader extends ShaderCode {
    static tag = "fragment-shader";
    load(gl) {
        this.loadShader(gl, gl.FRAGMENT_SHADER);
    }
}
class Payload {
    contents = [];
    constructor(root1){
        this.tagName = root1.tagName;
        this.contents = Array.from(root1.children);
    }
    static walkTheDOM(node, func) {
        func(node);
        node = node !== null ? node.firstChild : null;
        while(node){
            Payload.walkTheDOM(node, func);
            node = node.nextSibling;
        }
    }
    connectContents(srcElem, selectedContents) {
        return this.contents.filter(selectedContents).map((child)=>{
            const c = deepClone(child);
            Payload.walkTheDOM(c, (node)=>{
                if (node && node instanceof globalThis.HTMLElement) {
                    for (const [key, attribName] of Object.entries(node.dataset)){
                        if (attribName) {
                            if (attribName.toLowerCase() === "textcontent") {
                                setKey(node, key, srcElem.textContent);
                            } else {
                                setKey(node, key, srcElem.getAttribute(attribName));
                            }
                        }
                        node.removeAttribute(`data-${key}`);
                    }
                }
            });
            return c;
        });
    }
}
function setKey(node, key, value) {
    if (!value) return;
    if (key.toLowerCase() === "textcontent") {
        node.textContent = value;
    } else {
        node.setAttribute(key, value);
    }
}
function deepClone(c) {
    return c.cloneNode(true);
}
class CreateModule extends globalThis.HTMLElement {
    static tag = "{{user defined}}";
    initializeModule(initializers) {
        const payload = new Payload(this);
        const initializerFunction = initializers.get(this.nodeName.toLowerCase());
        if (initializerFunction) {
            initializerFunction(payload);
        }
        return payload;
    }
    initialize({ payload , destinationRoot , payloadChildFilter , destinationChooser  }) {
        const nodes = payload.connectContents(this, payloadChildFilter);
        let didMerge = false;
        for (const node of nodes){
            if (node instanceof CanMerge) {
                node.module = this.nodeName.toLowerCase();
                if (destinationChooser) {
                    const destNodeName = node.tagName.toLowerCase();
                    let destNode = destinationChooser(destNodeName);
                    if (!destNode) {
                        destNode = globalThis.document.createElement(destNodeName);
                        destinationRoot.appendChild(destNode);
                    }
                    node.merge(destNode);
                    didMerge = didMerge || destNode !== null;
                } else {
                    didMerge = true;
                    node.merge(destinationRoot);
                }
            } else {
                console.debug(`The ${payload.tagName} module child: ${node.nodeName}, cannot be merged.\n\n          Is the destination an instance of "CanMerge"?`);
            }
        }
        return didMerge;
    }
}
class CanHaveModules extends globalThis.HTMLElement {
    modules = [];
    applyPayloads({ payloads =[] , payloadChildFilter =()=>true
     , destinationRoot =this , destinationChooser , removeModule =true  }) {
        let appliedPayload = false;
        for (const child of Array.from(this.children)){
            if (child instanceof CreateModule) {
                const name = child.nodeName.toLowerCase();
                const payload = payloads.find((p)=>p.tagName.toLowerCase() === name
                );
                if (!payload) continue;
                if (child.initialize({
                    payload,
                    destinationRoot,
                    destinationChooser,
                    payloadChildFilter
                })) {
                    this.modules.push(name);
                    appliedPayload = true;
                }
                if (removeModule) {
                    this.removeChild(child);
                }
            }
        }
        return appliedPayload;
    }
}
class CreateProgram extends CanHaveModules {
    static tag = "{{user defined}}";
    name = this.tagName.toLocaleLowerCase();
    uniformLocations = new Map();
    readShaders = ()=>{
        const vertexShader = this.querySelector(VertexShader.tag);
        const fragmentShader = this.querySelector(FragmentShader.tag);
        if (!vertexShader) {
            console.error(`No <vertex-shader> found in ${this.tagName}`);
        }
        if (!fragmentShader) {
            console.error(`No <fragment-shader> found in ${this.tagName}`);
        }
        if (vertexShader instanceof VertexShader) {
            this.vertexShader = vertexShader;
        }
        if (fragmentShader instanceof FragmentShader) {
            this.fragmentShader = fragmentShader;
        }
    };
    inputs = ()=>{
        if (!this.vertexShader || !this.fragmentShader) {
            throw new Error(`Program ${this.name} has no shaders available to read their inputs`);
        }
        const variables = [
            ...this.vertexShader.variables,
            ...this.fragmentShader.variables, 
        ];
        const result = [];
        const outs = [];
        for(let i = 0; i < variables.length; i++){
            const v = variables[i];
            if (isOutputVariable(v)) {
                outs.push(v.name);
            } else if (isInputVariable(v) && !outs.includes(v.name)) {
                result.push(v);
            }
        }
        return result;
    };
    allTextureVariables() {
        if (!this.fragmentShader) return [];
        return this.fragmentShader.variables.filter(isSamplerVariable);
    }
    initialize(payloads = []) {
        this.applyPayloads({
            payloads,
            payloadChildFilter: (c)=>c.nodeName === "WEBGL-PROGRAM-PART"
        });
        this.readShaders();
        this.vertexShader?.initialize();
        this.fragmentShader?.initialize();
    }
    load(gl) {
        this.vertexShader?.load(gl);
        this.fragmentShader?.load(gl);
    }
    compile(gl) {
        this.vertexShader?.compile(gl);
        this.fragmentShader?.compile(gl);
    }
    createProgram(gl) {
        this.program = gl.createProgram();
        if (!this.program) {
            throw new Error(`Unable to create a program in ${this.tagName}`);
        }
        if (!this.vertexShader?.shader || !this.fragmentShader?.shader) {
            throw new Error(`No shaders found for program ${this.tagName}`);
        }
        gl.attachShader(this.program, this.vertexShader.shader);
        gl.attachShader(this.program, this.fragmentShader.shader);
    }
    link(gl) {
        const program = this.program;
        if (!program) {
            throw new Error("Shader program failed compilation in " + this.tagName);
        }
        gl.linkProgram(program);
    }
    shaderCompilationCheck(gl) {
        if (this.vertexShader?.shader) {
            const compiled = gl.getShaderParameter(this.vertexShader.shader, gl.COMPILE_STATUS);
            if (!compiled) {
                console.warn("Vertex Shader failed to compile");
                const compilationLog = gl.getShaderInfoLog(this.vertexShader.shader);
                console.log("Shader compiler log: " + compilationLog);
            }
        }
        if (this.fragmentShader?.shader) {
            const compiled = gl.getShaderParameter(this.fragmentShader.shader, gl.COMPILE_STATUS);
            if (!compiled) {
                console.warn("Fragment Shader failed to compile");
                const compilationLog = gl.getShaderInfoLog(this.fragmentShader.shader);
                console.log("Shader compiler log: " + compilationLog);
            }
        }
    }
    statusCheck(gl) {
        this.shaderCompilationCheck(gl);
        if (!this.program) {
            throw new Error("Status: Program was not created " + this.tagName);
        }
        this.log = gl.getProgramInfoLog(this.program) || "Status: Nothing to report";
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            gl.deleteProgram(this.program);
            throw new Error("Status: Program was not linked " + this.tagName + "; Log: " + this.log);
        }
    }
    bindLocations(gl, attribLocations) {
        if (!this.program || !this.vertexShader) {
            throw new Error("Not enough data to locate attributes for program " + this.tagName);
        }
        for (const variable of this.vertexShader.variables){
            let location = attribLocations.get(variable.name);
            if (!location && variable.layout) {
                const [key, value] = variable.layout.split("=");
                const numberValue = Number(value);
                if (key === "location" && !isNaN(numberValue)) {
                    location = numberValue;
                }
            }
            if (location !== undefined && location >= 0 && variable.qualifier === "in") {
                gl.bindAttribLocation(this.program, location, variable.name);
            }
        }
    }
    verifyLocations(gl, attribLocations = new Map()) {
        if (!this.program) {
            throw new Error("Shader Program failed compilation");
        }
        for (const [name, desiredLocation] of attribLocations.entries()){
            const location = gl.getAttribLocation(this.program, name);
            if (location === -1) {
                console.warn(`Unable to verify ${name} in Shader Program\n\
                  Besides being declared, is it being used by the shader?`);
            } else if (location !== desiredLocation) {
                console.warn(`Location ${name} could not bet set to the desired value.`, `It is set to location ${location} when the intended was \
            ${desiredLocation}.`);
            }
        }
    }
    updateLocations(gl, attribLocations = new Map()) {
        if (!this.program) {
            throw new Error("Shader Program failed compilation");
        }
        for (const variable of this.inputs()){
            if (variable.qualifier === "in") {
                const location = gl.getAttribLocation(this.program, variable.name);
                if (location === undefined || location < 0) {
                    console.warn(`Unable to find "${variable.name}" in program ${this.tagName}\n\
                * Besides being declared, is it being used by the shader?\n`);
                } else if (!attribLocations.has(variable.name)) {
                    attribLocations.set(variable.name, location);
                }
            }
        }
        return attribLocations;
    }
    updateUniformLocations(gl) {
        if (!this.program) {
            throw new Error(`Shader Program ${this.name} failed compilation`);
        }
        for (const variable of this.inputs()){
            if (variable.qualifier === "uniform") {
                const location = gl.getUniformLocation(this.program, variable.name);
                if (!location) {
                    console.warn(`Unable to find "${variable.name}" in program ${this.tagName}\n\
              * Besides being declared, is it being used by the shader?`);
                } else {
                    this.uniformLocations.set(variable.name, location);
                }
            }
        }
    }
}
class WebGLProgramPart extends CanMerge {
    static tag = "webgl-program-part";
    mergeCodeChildren(dest, node) {
        if (node && dest) {
            for (const child of Array.from(node.childNodes)){
                if (child.nodeName === "CODE" || child.nodeName === "CODE-BEFORE" || child.nodeName === "CODE-AFTER") {
                    const destSibling = dest.querySelector(child.nodeName);
                    const codeChild = child.cloneNode(true);
                    if (codeChild instanceof globalThis.Element) {
                        codeChild.setAttribute("from-module", this.module);
                    }
                    if (destSibling) {
                        dest.insertBefore(codeChild, destSibling);
                    } else {
                        dest.appendChild(codeChild);
                    }
                }
            }
        }
    }
    merge(dest) {
        if (!dest) return;
        const vertexElem = this.querySelector(VertexShader.tag);
        const fragmentElem = this.querySelector(FragmentShader.tag);
        this.mergeCodeChildren(dest.querySelector(VertexShader.tag), vertexElem);
        this.mergeCodeChildren(dest.querySelector(FragmentShader.tag), fragmentElem);
    }
}
const dependsOn5 = [
    WebGLProgramPart
];
class NewModules extends ShaderCanvasContainer {
    static tag = "new-modules";
    whenLoaded = Promise.all(dependsOn5.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    payloads = [];
    async initialize(initializers) {
        await this.whenLoaded;
        this.createContentComponentsWith(CreateModule);
        for (const child of Array.from(this.children)){
            if (child instanceof CreateModule) {
                this.payloads.push(child.initializeModule(initializers));
            }
        }
        return this.payloads;
    }
}
[
    NewModules,
    ...dependsOn5
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
const dependsOn6 = [
    VertexShader,
    FragmentShader,
    NewModules
];
class WebGLPrograms extends ShaderCanvasContainer {
    static tag = "webgl-programs";
    whenLoaded = Promise.all(dependsOn6.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    locations = {
        attributes: new Map()
    };
    async initialize({ gl , payloads  }) {
        await this.whenLoaded;
        this.createContentComponentsWith(CreateProgram);
        if (this.content.size === 0) {
            console.error(`<${WebGLPrograms.tag}>: No programs available to initialize`);
            return;
        }
        const programs = [
            ...this.content.values()
        ];
        programs.forEach((p)=>p.initialize(payloads)
        );
        const attributes = this.locations.attributes;
        programs.forEach((program)=>program.load(gl)
        );
        programs.forEach((program)=>program.compile(gl)
        );
        programs.forEach((program)=>program.createProgram(gl)
        );
        programs.forEach((program)=>program.bindLocations(gl, attributes)
        );
        programs.forEach((program)=>program.link(gl)
        );
        programs.forEach((program)=>program.statusCheck(gl)
        );
        programs.forEach((program)=>program.verifyLocations(gl, attributes)
        );
        programs.forEach((program)=>program.updateLocations(gl, attributes)
        );
        programs.forEach((program)=>program.updateUniformLocations(gl)
        );
        console.debug("<webgl-programs> locations", [
            ...this.locations.attributes.entries(), 
        ]);
    }
    async callInitializers({ gl , ctx , programInitializers , modulesFunctions  }) {
        const result = new Map();
        for (const [programName, program] of this.content.entries()){
            const f = programInitializers.get(programName);
            if (f && program && program.program) {
                gl.useProgram(program.program);
                const initializerArgs = {
                    uniformLocations: program.uniformLocations,
                    attributeLocations: this.locations.attributes,
                    ctx,
                    program,
                    programName: program.name
                };
                const renderer = await f(gl, initializerArgs);
                program.modules.forEach((m)=>{
                    const functions = modulesFunctions.get(m);
                    if (functions && functions.initializer) {
                        functions.initializer(gl, initializerArgs);
                    }
                });
                gl.useProgram(null);
                if (renderer) {
                    result.set(programName, renderer);
                }
            } else {
                if (!program) {
                    console.warn("<webgl-programs>: could not call `createProgram` function for \
            program ${programName}`");
                }
            }
        }
        return result;
    }
}
[
    WebGLPrograms,
    ...dependsOn6
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
function readQueryElement(src) {
    return new Promise((resolve, reject)=>{
        if (isQuery(src)) {
            const elem = globalThis.document.querySelector(src);
            if (!elem || !elem?.textContent) {
                reject();
                return;
            }
            readSrcAsJSON(elem?.textContent.trim()).then((result)=>{
                resolve(result);
            }).catch((r)=>{
                reject();
            });
        } else {
            reject();
        }
    });
}
function readSrcAsJSON(src) {
    return new Promise((resolve, reject)=>{
        const firstChar = src[0];
        const lastChar = src[src.length - 1];
        if (firstChar === "[" && lastChar === "]") {
            try {
                let result = JSON.parse(src);
                result = result.map(Number);
                if (result.filter(isNaN).length > 0) {
                    reject();
                }
                resolve(result);
            } catch (e) {
                console.warn("JSON error", e);
                reject(e);
            }
        }
        reject();
    });
}
function isQuery(query) {
    const firstChar = query[0];
    const secondChar = query[1];
    const hasSlash = query.indexOf("/") >= 0 || query.indexOf("\\") >= 0;
    return Boolean((firstChar === "." && secondChar.match(/[a-zA-Z]/) || firstChar === "#" && secondChar.match(/[a-zA-Z]/) || firstChar.match(/[a-zA-Z]/)) && !hasSlash);
}
function isImageDataInput(elem) {
    return elem instanceof globalThis.HTMLImageElement || elem instanceof globalThis.HTMLCanvasElement || elem instanceof globalThis.HTMLVideoElement || elem instanceof globalThis.ImageBitmap || elem instanceof globalThis.ImageData;
}
function readImageDataFromQuery(src) {
    return new Promise((resolve, reject)=>{
        if (isQuery(src)) {
            const elem = globalThis.document.querySelector(src);
            if (!elem || !isImageDataInput(elem)) {
                reject();
                return;
            }
            if (elem instanceof globalThis.HTMLImageElement) {
                elem.onload = ()=>{
                    resolve(elem);
                };
                if (elem.complete) {
                    resolve(elem);
                }
                elem.onerror = (e)=>{
                    console.warn(`Error with image at ${src}: ${e.toString()}`);
                };
                elem.onabort = ()=>{
                    console.warn(`Loading the image at ${src} was aborted`);
                };
            } else {
                resolve(elem);
            }
        } else {
            reject();
        }
    });
}
async function trySrcReaders(src, readers) {
    for(let i = 0; i < readers.length; i++){
        try {
            return await readers[i](src);
        } catch (e) {
            continue;
        }
    }
    console.error(`Cannot find a reader for this source: ${src}`);
    return [];
}
function readBufferDataTarget(target) {
    switch(target){
        case "ARRAY_BUFFER":
        case "ELEMENT_ARRAY_BUFFER":
        case "COPY_READ_BUFFER":
        case "COPY_WRITE_BUFFER":
        case "TRANSFORM_FEEDBACK_BUFFER":
        case "UNIFORM_BUFFER":
        case "PIXEL_PACK_BUFFER":
        case "PIXEL_UNPACK_BUFFER":
            return target;
        default:
            return "ARRAY_BUFFER";
    }
}
function readBufferDataUsage(usage) {
    switch(usage){
        case "STATIC_DRAW":
        case "DYNAMIC_DRAW":
        case "STREAM_DRAW":
        case "STATIC_READ":
        case "DYNAMIC_READ":
        case "STREAM_READ":
        case "STATIC_COPY":
        case "DYNAMIC_COPY":
        case "STREAM_COPY":
            return usage;
        default:
            return "STATIC_DRAW";
    }
}
class BufferData extends globalThis.HTMLElement {
    static tag = "buffer-data";
    data = null;
    get target() {
        return readBufferDataTarget(this.getAttribute("target"));
    }
    get size() {
        return Number(this.getAttribute("size")) || 0;
    }
    get usage() {
        return readBufferDataUsage(this.getAttribute("usage") || "STATIC_DRAW");
    }
    get offset() {
        return Number(this.getAttribute("offset") || 0);
    }
    get src() {
        return this.getAttribute("src");
    }
    get bytesPerItem() {
        return Number(this.getAttribute("bytesPerItem")) || 8;
    }
    length = 0;
    load = async ()=>{
    };
    async readDataFromSrc(readers, srcOverride) {
        const src = srcOverride || this.src;
        if (!src) {
            console.error("Cannot find <buffer-data> source");
            return [];
        }
        return await trySrcReaders(src, readers);
    }
    initialize(gl) {
        const target = gl[this.target];
        const usage = gl[this.usage];
        const src = this.src;
        this.load = async (buffer, srcOverride)=>{
            if (src || srcOverride) {
                this.data = await this.readDataFromSrc([
                    readQueryElement,
                    readSrcAsJSON
                ], srcOverride);
            } else if (this.target === "PIXEL_PACK_BUFFER" || this.target === "PIXEL_UNPACK_BUFFER") {
                const s = this.size || gl.drawingBufferWidth * gl.drawingBufferHeight;
                switch(this.bytesPerItem){
                    case 1:
                        this.data = new Uint8Array(s);
                        break;
                    case 2:
                        this.data = new Uint16Array(s);
                        break;
                    default:
                        this.data = new Uint32Array(s * 4);
                }
            }
            gl.bindBuffer(target, buffer);
            if (this.data) {
                let bytesPerItem = 8;
                if (Array.isArray(this.data)) {
                    if (target !== gl.ELEMENT_ARRAY_BUFFER) {
                        this.data = new Float32Array(this.data);
                        bytesPerItem = this.data.BYTES_PER_ELEMENT;
                    } else {
                        this.data = new Uint16Array(this.data);
                        bytesPerItem = this.data.BYTES_PER_ELEMENT;
                    }
                } else if (this.target === "PIXEL_PACK_BUFFER" || this.target === "PIXEL_UNPACK_BUFFER") {
                    bytesPerItem = this.data.BYTES_PER_ELEMENT;
                }
                this.length = Math.floor(this.data.byteLength / bytesPerItem);
                console.log("CREATED BUFFER", this.parentElement?.tagName, this.length, bytesPerItem);
                if (this.offset > 0 && isArrayBufferView(this.data)) {
                    gl.bufferData(target, this.data, usage, this.offset);
                    this.length = this.length - this.offset;
                } else {
                    console.log("UPLOADING DATA ARRAY");
                    gl.bufferData(target, this.data, usage);
                }
            } else {
                if (this.size) {
                    this.length = this.size;
                    gl.bufferData(target, this.size, usage);
                } else {
                    gl.bufferData(target, null, usage);
                }
            }
        };
    }
}
function isArrayBufferView(data) {
    return "buffer" in data && "BYTES_PER_ELEMENT" in data;
}
class CreateBuffer extends globalThis.HTMLElement {
    static tag = "{{user defined}}";
    data = null;
    buffer = null;
    length = 0;
    bindBuffer = ()=>{
        nop();
        return 0;
    };
    async initialize(gl) {
        this.buffer = gl.createBuffer();
        if (!this.buffer) {
            console.error(`<${this.tagName.toLocaleLowerCase()}>: Unable to create buffer`);
            return;
        }
        this.bindBuffer = ()=>{
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            return gl.ARRAY_BUFFER;
        };
        for (const child of Array.from(this.children)){
            if (child instanceof BufferData) {
                child.initialize(gl);
                await child.load(this.buffer);
                this.data = child.data;
                this.length += child.length;
                const target = gl[child.target];
                this.bindBuffer = ()=>{
                    gl.bindBuffer(target, this.buffer);
                    return target;
                };
            }
        }
    }
}
const dependsOn7 = [
    BufferData
];
class WebGLBuffers extends ShaderCanvasContainer {
    static tag = "webgl-buffers";
    whenLoaded = Promise.all(dependsOn7.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    bindFunctionFor(bufferName) {
        const buffer = this.content.get(bufferName);
        if (!buffer) {
            console.error(`<webgl-buffers>: Could not get bind function for ${bufferName}`);
            return ()=>{
                nop();
                return 0;
            };
        }
        return buffer.bindBuffer;
    }
    lengthFor(bufferName) {
        const buffer = this.content.get(bufferName);
        if (!buffer || buffer.data === null) {
            console.error(`<webgl-buffers>: Could not get length for ${bufferName}`);
            return 0;
        }
        return buffer.length;
    }
    async initialize({ gl  }) {
        await this.whenLoaded;
        this.createContentComponentsWith(CreateBuffer);
        for (const buffer of this.content.values()){
            await buffer.initialize(gl);
        }
    }
}
[
    WebGLBuffers,
    ...dependsOn7
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
class RenderbufferStorage extends globalThis.HTMLElement {
    static tag = "renderbuffer-storage";
    get format() {
        return readRenderbufferInternalFormat(this.getAttribute("format"));
    }
    get width() {
        return Number(this.getAttribute("width"));
    }
    get height() {
        return Number(this.getAttribute("height"));
    }
    initialize(gl) {
        if (!gl.getExtension("EXT_color_buffer_float")) {
            console.error("Color Buffer Float not supported");
        }
        const w = this.width || gl.drawingBufferWidth;
        const h = this.height || gl.drawingBufferHeight;
        gl.renderbufferStorage(gl.RENDERBUFFER, gl[this.format], w, h);
    }
}
function readRenderbufferInternalFormat(format) {
    switch(format){
        case "RGBA4":
        case "RGB565":
        case "RGB5_A1":
        case "DEPTH_COMPONENT16":
        case "STENCIL_INDEX8":
        case "DEPTH_STENCIL":
        case "R8":
        case "R8UI":
        case "R8I":
        case "R16UI":
        case "R16I":
        case "R32UI":
        case "R32I":
        case "RG8":
        case "RG8UI":
        case "RG8I":
        case "RG16UI":
        case "RG16I":
        case "RG32UI":
        case "RG32I":
        case "RGB8":
        case "RGBA8":
        case "SRGB8_ALPHA8":
        case "RGB10_A2":
        case "RGBA8UI":
        case "RGBA8I":
        case "RGB10_A2UI":
        case "RGBA16UI":
        case "RGBA16I":
        case "RGBA32I":
        case "RGBA32UI":
        case "DEPTH_COMPONENT24":
        case "DEPTH_COMPONENT32F":
        case "DEPTH24_STENCIL8":
        case "DEPTH32F_STENCIL8":
        case "R16F":
        case "RG16F":
        case "RGBA16F":
        case "R32F":
        case "RG32F":
        case "RGBA32F":
        case "R11F_G11F_B10F":
            return format;
        default:
            return "RGBA8";
    }
}
const dependsOn8 = [
    RenderbufferStorage
];
class FramebufferAttachment extends globalThis.HTMLElement {
    get target() {
        return readFramebufferTarget(this.getAttribute("target"));
    }
    get attachment() {
        return readFramebufferAttachment(this.getAttribute("attachment"));
    }
    get src() {
        return this.getAttribute("src");
    }
}
class FramebufferTexture2D extends FramebufferAttachment {
    static tag = "framebuffer-texture-2d";
    get texture() {
        return readFramebufferTexTarget(this.getAttribute("texture"));
    }
    initialize(gl, textures) {
        const textureName = this.src;
        if (!textureName) {
            console.warn("No texture 'src' attribute found in framebufferTexture2D");
            return;
        }
        const texture = textures.content.get(textureName);
        if (!texture || !texture.texture) {
            console.warn(`Could not find the referenced texture at ${FramebufferTexture2D.tag}`);
            return;
        }
        const textureId = texture.texture;
        const attachmentPoint = gl[this.attachment];
        const texTarget = gl[this.texture];
        const fbTarget = gl[this.target];
        texture.bindTexture();
        gl.framebufferTexture2D(fbTarget, attachmentPoint, texTarget, textureId, 0);
    }
}
class FramebufferTextureLayer extends FramebufferAttachment {
    static tag = "framebuffer-texture-layer";
    get level() {
        return Number(this.getAttribute("level"));
    }
    get layer() {
        return Number(this.getAttribute("layer"));
    }
    initialize(gl, textures) {
        const textureName = this.src;
        if (!textureName) {
            console.warn(`No texture 'src' attribute found in ${FramebufferTextureLayer.tag}`);
            return;
        }
        const texture = textures.content.get(textureName);
        if (!texture || !texture.texture) {
            console.warn(`Could not find the referenced texture at ${FramebufferTextureLayer.tag}`);
            return;
        }
        const textureId = texture.texture;
        const attachmentPoint = gl[this.attachment];
        const fbTarget = gl[this.target];
        gl.framebufferTextureLayer(fbTarget, attachmentPoint, textureId, this.level, this.layer);
    }
}
class FramebufferRenderbuffer extends FramebufferAttachment {
    static tag = "framebuffer-renderbuffer";
    whenLoaded = Promise.all(dependsOn8.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    renderbuffer = null;
    async initialize(gl) {
        await this.whenLoaded;
        this.renderbuffer = gl.createRenderbuffer();
        if (!this.renderbuffer) {
            console.warn(`Unable to create the render buffer in <${FramebufferRenderbuffer.tag}>`);
        }
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
        for (const child of Array.from(this.children)){
            if (child instanceof RenderbufferStorage) {
                child.initialize(gl);
            }
        }
        if (this.children.length === 0) {
            console.warn(`No <renderbuffer-storage> set in the ${FramebufferRenderbuffer.tag}`);
        }
        const attachmentPoint = gl[this.attachment];
        const fbTarget = gl[this.target];
        gl.framebufferRenderbuffer(fbTarget, attachmentPoint, gl.RENDERBUFFER, this.renderbuffer);
    }
}
function readFramebufferTexTarget(target) {
    switch(target){
        case "TEXTURE_CUBE_MAP_POSITIVE_X":
        case "TEXTURE_CUBE_MAP_NEGATIVE_X":
        case "TEXTURE_CUBE_MAP_POSITIVE_Y":
        case "TEXTURE_CUBE_MAP_NEGATIVE_Y":
        case "TEXTURE_CUBE_MAP_POSITIVE_Z":
        case "TEXTURE_CUBE_MAP_NEGATIVE_Z":
            return target;
        default:
            return "TEXTURE_2D";
    }
}
function readFramebufferAttachment(target) {
    switch(target){
        case "DEPTH_ATTACHMENT":
        case "DEPTH_STENCIL_ATTACHMENT":
        case "STENCIL_ATTACHMENT":
        case "COLOR_ATTACHMENT1":
        case "COLOR_ATTACHMENT2":
        case "COLOR_ATTACHMENT3":
        case "COLOR_ATTACHMENT4":
        case "COLOR_ATTACHMENT5":
        case "COLOR_ATTACHMENT6":
        case "COLOR_ATTACHMENT7":
        case "COLOR_ATTACHMENT8":
        case "COLOR_ATTACHMENT9":
        case "COLOR_ATTACHMENT10":
        case "COLOR_ATTACHMENT11":
        case "COLOR_ATTACHMENT12":
        case "COLOR_ATTACHMENT13":
        case "COLOR_ATTACHMENT14":
        case "COLOR_ATTACHMENT15":
            return target;
        default:
            return "COLOR_ATTACHMENT0";
    }
}
function readFramebufferTarget(target) {
    switch(target){
        case "FRAMEBUFFER":
        case "DRAW_FRAMEBUFFER":
        case "READ_FRAMEBUFFER":
            return target;
        default:
            return "FRAMEBUFFER";
    }
}
[
    FramebufferTexture2D,
    FramebufferTextureLayer,
    FramebufferRenderbuffer,
    ...dependsOn8, 
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
let error = undefined;
function glError(gl) {
    if (!gl) return;
    error = gl.getError();
    if (error !== gl.NO_ERROR) {
        console.log(glEnumToString(gl, error));
    }
}
function glEnumToString(gl, v) {
    for(const k in gl){
        if (gl[k] === v) {
            return k;
        }
    }
    return `0x${v.toString(16)}`;
}
class CreateFramebuffer extends globalThis.HTMLElement {
    static tag = "{{user defined}}";
    framebuffer = null;
    bindFramebuffer = ()=>{
        nop();
        return -1;
    };
    get target() {
        switch(this.getAttribute("target")){
            case "DRAW_FRAMEBUFFER":
                return "DRAW_FRAMEBUFFER";
            case "READ_FRAMEBUFFER":
                return "READ_FRAMEBUFFER";
            default:
                return "FRAMEBUFFER";
        }
    }
    async initialize(gl, textures) {
        this.framebuffer = gl.createFramebuffer();
        if (!this.framebuffer) {
            console.error(`<${this.tagName.toLocaleLowerCase()}>: Unable to create framebuffer`);
            return;
        }
        this.gl = gl;
        const target = gl[this.target];
        this.bindFramebuffer = ()=>{
            gl.bindFramebuffer(target, this.framebuffer);
            return target;
        };
        this.bindFramebuffer();
        for (const child of Array.from(this.children)){
            if (child instanceof FramebufferTexture2D || child instanceof FramebufferTextureLayer) {
                child.initialize(gl, textures);
            }
            if (child instanceof FramebufferRenderbuffer) {
                await child.initialize(gl);
            }
        }
        if (gl.checkFramebufferStatus(target) !== gl.FRAMEBUFFER_COMPLETE) {
            const status = gl.checkFramebufferStatus(target);
            console.warn(`Framebuffer <${this.nodeName}> attachments don't work together: ${glEnumToString(gl, status)}`);
            glError(gl);
        }
        gl.bindFramebuffer(target, null);
    }
}
const dependsOn9 = [
    FramebufferRenderbuffer,
    FramebufferTexture2D,
    FramebufferTextureLayer, 
];
class WebGLFramebuffers extends ShaderCanvasContainer {
    static tag = "webgl-framebuffers";
    whenLoaded = Promise.all(dependsOn9.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    async initialize({ gl , textures  }) {
        await this.whenLoaded;
        this.createContentComponentsWith(CreateFramebuffer);
        for (const framebuffer of this.content.values()){
            await framebuffer.initialize(gl, textures);
        }
    }
}
[
    WebGLFramebuffers,
    ...dependsOn9
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
function readVertexAttribType(value) {
    switch(value){
        case "BYTE":
        case "SHORT":
        case "UNSIGNED_BYTE":
        case "UNSIGNED_SHORT":
        case "FLOAT":
        case "HALF_FLOAT":
            return value;
        default:
            return "FLOAT";
    }
}
class VertexAttribPointer extends globalThis.HTMLElement {
    static tag = "vertex-attrib-pointer";
    vertexAttribPointer = nop;
    initialize(gl, locations = {
        attributes: new Map()
    }) {
        const variable = this.variable;
        if (variable === "") return null;
        const location = locations.attributes.get(variable);
        if (location === undefined || location < 0) {
            console.warn(`<vertex-attrib-pointer> Unable to find variable ${variable} location`);
            return;
        }
        this.location = location;
        const size = this.size;
        const type = gl[this.type];
        const normalized = this.normalized;
        const stride = this.stride;
        const offset = this.offset;
        const divisor = this.divisor;
        if (this.type.includes("FLOAT")) {
            this.vertexAttribPointer = ()=>{
                gl.enableVertexAttribArray(location);
                gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
                if (divisor > 0) {
                    gl.vertexAttribDivisor(location, divisor);
                }
            };
        } else {
            this.vertexAttribPointer = ()=>{
                gl.enableVertexAttribArray(location);
                gl.vertexAttribIPointer(location, size, type, stride, offset);
                if (divisor > 0) {
                    gl.vertexAttribDivisor(location, divisor);
                }
            };
        }
        this.vertexAttribPointer();
    }
    get variable() {
        return this.getAttribute("variable") || "";
    }
    set variable(name) {
        if (name) {
            this.setAttribute("variable", name);
        } else {
            console.warn("<vertex-attrib-pointer> needs a 'variable' attribute set");
            this.removeAttribute("variable");
        }
    }
    get divisor() {
        return Number(this.getAttribute("divisor"));
    }
    get size() {
        return Number(this.getAttribute("size") || 4);
    }
    set size(val) {
        const size = Number(val);
        if (isNaN(size)) {
            console.warn("Invalid size in vertex-attrib-pointer: must be a number");
            this.removeAttribute("size");
        } else if (size <= 0 || size > 4) {
            console.warn("Invalid size in vertex-attrib-pointer: must be 1,2,3 or 4");
            this.removeAttribute("size");
        } else {
            this.setAttribute("size", String(size));
        }
    }
    get type() {
        return readVertexAttribType(this.getAttribute("type"));
    }
    set type(val) {
        if (val) {
            this.setAttribute("type", readVertexAttribType(val));
        } else {
            this.removeAttribute("type");
        }
    }
    get offset() {
        return Number(this.getAttribute("offset") || 0);
    }
    set offset(val) {
        const offset = Number(val);
        if (isNaN(offset)) {
            console.warn("Invalid offset in vertex-attrib-pointer: must be a number");
            this.removeAttribute("offset");
        } else {
            this.setAttribute("offset", String(offset));
        }
    }
    get normalized() {
        return this.getAttribute("normalized") !== null;
    }
    set normalized(val) {
        if (val) {
            this.setAttribute("normalized", "");
        } else {
            this.removeAttribute("normalized");
        }
    }
    get stride() {
        return Number(this.getAttribute("stride") || 0);
    }
    set stride(val) {
        const stride = Number(val);
        if (isNaN(stride)) {
            console.warn("Invalid stride in vertex-attrib-pointer: must be a number");
            this.removeAttribute("stride");
        } else if (stride < 0 || stride > 255) {
            console.warn("Invalid stride in vertex-attrib-pointer: must be between 0 and 255");
            this.removeAttribute("stride");
        } else {
            this.setAttribute("stride", String(stride));
        }
    }
}
const dependsOn10 = [
    VertexAttribPointer,
    WebGLBuffers
];
class BindBuffer extends globalThis.HTMLElement {
    static tag = "bind-buffer";
    get src() {
        const result = this.getAttribute("src");
        if (!result) {
            console.error("No src set in <bind-buffer>");
        }
        return result || "";
    }
    whenLoaded = Promise.all(dependsOn10.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    vars = [];
    target = 0;
    location0Attribute = null;
    location0Count = 0;
    bindBuffer = ()=>{
        nop();
        return 0;
    };
    async initialize(gl, buffers, locations) {
        await this.whenLoaded;
        this.bindBuffer = buffers.bindFunctionFor(this.src);
        this.target = this.bindBuffer();
        for (const child of Array.from(this.children)){
            if (child instanceof VertexAttribPointer) {
                child.initialize(gl, locations);
                this.vars.push(child.variable);
                const varLocation = locations.attributes.get(child.variable);
                if (varLocation === 0) {
                    this.location0Attribute = child;
                    this.location0Count = buffers.lengthFor(this.src) / child.size;
                }
            }
        }
    }
}
[
    BindBuffer,
    ...dependsOn10
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
const dependsOn11 = [
    VertexAttribPointer,
    BindBuffer,
    WebGLBuffers
];
class CreateVertexArray extends globalThis.HTMLElement {
    static tag = "{{user defined}}";
    hasElementArrayBuffer = false;
    vao = null;
    vars = [];
    location0Attribute = null;
    location0Count = 0;
    whenLoaded = Promise.all(dependsOn11.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    bindVAO = nop;
    async initialize(gl, buffers, locations) {
        await this.whenLoaded;
        this.vao = gl.createVertexArray();
        if (!this.vao) {
            console.error(`<${this.tagName.toLocaleLowerCase()}>: Unable to create VAO`);
            return;
        }
        const vao = this.vao;
        gl.bindVertexArray(vao);
        for (const child of Array.from(this.children)){
            if (child instanceof BindBuffer) {
                await child.initialize(gl, buffers, locations);
                this.vars = this.vars.concat(child.vars);
                this.hasElementArrayBuffer = this.hasElementArrayBuffer || child.target === gl.ELEMENT_ARRAY_BUFFER;
                if (child.location0Attribute !== null) {
                    this.location0Attribute = child.location0Attribute;
                    this.location0Count = child.location0Count;
                }
            }
        }
        gl.bindVertexArray(null);
        this.bindVAO = ()=>{
            gl.bindVertexArray(vao);
        };
    }
}
[
    WebGLBuffers,
    ...dependsOn11
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
const dependsOn12 = [
    VertexAttribPointer,
    BindBuffer,
    WebGLBuffers
];
class WebGLVertexArrayObjects extends ShaderCanvasContainer {
    static tag = "webgl-vertex-array-objects";
    whenLoaded = Promise.all(dependsOn12.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    bindFunctionFor(vaoName) {
        const vao = this.content.get(vaoName);
        if (!vao) {
            console.error(`<webgl-vertex-array-objects>: Could not get bind function for \
        ${vaoName}`);
            return nop;
        }
        return vao.bindVAO;
    }
    async initialize({ gl , buffers , programs: { locations  }  }) {
        await this.whenLoaded;
        this.createContentComponentsWith(CreateVertexArray);
        if (!buffers) {
            console.warn("<webgl-vertex-array-objects>: unable to initialize without buffers");
            return;
        }
        if (!locations) {
            console.warn("<webgl-vertex-array-objects>: unable to initialize without locations");
            return;
        }
        for (const vao of this.content.values()){
            await vao.initialize(gl, buffers, locations);
        }
    }
}
[
    WebGLVertexArrayObjects,
    ...dependsOn12
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
class TexImage2D extends globalThis.HTMLElement {
    static tag = "tex-image-2d";
    get width() {
        return Number(this.getAttribute("width"));
    }
    set width(w) {
        this.setAttribute("width", String(w));
    }
    get height() {
        return Number(this.getAttribute("height"));
    }
    set height(h) {
        this.setAttribute("height", String(h));
    }
    get level() {
        return Number(this.getAttribute("level"));
    }
    get target() {
        return readTextureTarget(this.getAttribute("target") || "TEXTURE_2D");
    }
    get internalFormat() {
        return readTextureFormat(this.getAttribute("internalFormat") || "RGBA");
    }
    get format() {
        return readTextureFormat(this.getAttribute("format") || "RGBA");
    }
    get type() {
        return readTextureType(this.getAttribute("type") || "UNSIGNED_BYTE");
    }
    get src() {
        return this.getAttribute("src");
    }
    data = null;
    async readDataFromSrc(readers, srcOverride) {
        const src = srcOverride || this.src;
        if (!src) {
            console.error("Cannot find <tex-image-2d> source");
            return new globalThis.ImageData(0, 0);
        }
        const result = await trySrcReaders(src, readers);
        if (Array.isArray(result)) {
            return new globalThis.ImageData(0, 0);
        }
        return result;
    }
    load = async ()=>{
    };
    initialize(gl) {
        const width = this.width;
        const height = this.height;
        const level = this.level;
        const target = this.target;
        const internalFormat = this.internalFormat;
        const format = this.format;
        const type = this.type;
        const src = this.src;
        this.load = async (texture, srcOverride)=>{
            if (src || srcOverride) {
                this.data = await this.readDataFromSrc([
                    readImageDataFromQuery
                ], srcOverride ? srcOverride : src || srcOverride);
            }
            gl.bindTexture(gl[target], texture);
            if (width > 0 && height > 0) {
                gl.texImage2D(gl[target], level, gl[internalFormat], width, height, 0, gl[format], gl[type], this.data);
            } else if (this.data === null) {
                this.width = gl.drawingBufferWidth;
                this.height = gl.drawingBufferHeight;
                gl.texImage2D(gl[target], level, gl[internalFormat], gl.drawingBufferWidth, gl.drawingBufferHeight, 0, gl[format], gl[type], null);
            } else {
                gl.texImage2D(gl[target], level, gl[internalFormat], gl[format], gl[type], this.data);
            }
        };
    }
}
function readTextureFormat(format) {
    switch(format){
        case "RGBA":
        case "RGB":
        case "LUMINANCE_ALPHA":
        case "LUMINANCE":
        case "ALPHA":
        case "DEPTH_COMPONENT":
        case "DEPTH_STENCIL":
        case "R8":
        case "R8_SNORM":
        case "RG8":
        case "RG8_SNORM":
        case "RGB8":
        case "RGB8_SNORM":
        case "RGB565":
        case "RGBA4":
        case "RGB5_A1":
        case "RGBA8":
        case "RGBA8_SNORM":
        case "RGB10_A2":
        case "RGB10_A2UI":
        case "SRGB8":
        case "SRGB8_ALPHA8":
        case "R16F":
        case "RG16F":
        case "RGB16F":
        case "RGBA16F":
        case "R32F":
        case "RG32F":
        case "RGB32F":
        case "RGBA32F":
        case "R11F_G11F_B10F":
        case "RGB9_E5":
        case "R8I":
        case "R8UI":
        case "R16I":
        case "R16UI":
        case "R32I":
        case "R32UI":
        case "RG8I":
        case "RG8UI":
        case "RG16I":
        case "RG16UI":
        case "RG32I":
        case "RG32UI":
        case "RGB8I":
        case "RGB8UI":
        case "RGB16I":
        case "RGB16UI":
        case "RGB32I":
        case "RGB32UI":
        case "RGBA8I":
        case "RGBA8UI":
        case "RGBA16I":
        case "RGBA16UI":
        case "RGBA32I":
        case "RGBA32UI":
            return format;
        default:
            return "RGBA";
    }
}
function readTextureType(value) {
    switch(value){
        case "BYTE":
        case "UNSIGNED_SHORT":
        case "UNSIGNED_INT":
        case "SHORT":
        case "INT":
        case "HALF_FLOAT":
        case "FLOAT":
        case "UNSIGNED_INT_2_10_10_10_REV":
        case "UNSIGNED_INT_10F_11F_11F_REV":
        case "UNSIGNED_INT_5_9_9_9_REV":
        case "UNSIGNED_INT_24_8":
        case "FLOAT_32_UNSIGNED_INT_24_8_REV":
        case "UNSIGNED_BYTE":
        case "UNSIGNED_SHORT_5_6_5":
        case "UNSIGNED_SHORT_4_4_4_4":
        case "UNSIGNED_SHORT_5_5_5_1":
            return value;
        default:
            return "UNSIGNED_BYTE";
    }
}
const dependsOn13 = [
    TexImage2D,
    TexParameterF,
    TexParameterI
];
class CreateTexture extends globalThis.HTMLElement {
    static tag = "{{user defined}}";
    whenLoaded = Promise.all(dependsOn13.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    texture = null;
    bindTexture = nop;
    async initialize(gl) {
        await this.whenLoaded;
        this.texture = gl.createTexture();
        if (!this.texture) {
            console.error(`<${this.tagName.toLocaleLowerCase()}>: Unable to create texture`);
            return;
        }
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        for (const child of Array.from(this.children)){
            if (child instanceof TexImage2D) {
                child.initialize(gl);
                await child.load(this.texture);
                this.bindTexture = ()=>gl.bindTexture(gl.TEXTURE_2D, this.texture)
                ;
            }
            if (child instanceof TexParameterI) {
                child.initialize(gl);
                child.texParameteri();
            }
            if (child instanceof TexParameterF) {
                child.initialize(gl);
                child.texParameterf();
            }
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}
[
    ...dependsOn13
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
const dependsOn14 = [
    TexImage2D
];
class WebGLTextures extends ShaderCanvasContainer {
    static tag = "webgl-textures";
    whenLoaded = Promise.all(dependsOn14.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    async initialize({ gl  }) {
        await this.whenLoaded;
        this.createContentComponentsWith(CreateTexture);
        if (this.content.size === 0) {
            console.warn("<webgl-textures>: No textures available to initialize");
            return;
        }
        return Promise.all([
            ...this.content.values()
        ].map((t)=>t.initialize(gl)
        ));
    }
}
[
    WebGLTextures,
    ...dependsOn14
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
const dependsOn15 = [
    WebGLPrograms,
    WebGLBuffers,
    DrawCalls,
    WebGLVertexArrayObjects, 
];
class WebGLCanvas extends globalThis.HTMLElement {
    static tag = "webgl-canvas";
    whenLoaded = Promise.all(dependsOn15.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    root = this.attachShadow({
        mode: "open"
    });
    canvas = globalThis.document.createElement("canvas");
    getContext = ()=>null
    ;
    webglCanvasDraw = nop;
    async initialize(init) {
        const { width , height , programInitializers , modulesFunctions , bufferInitializers ,  } = init;
        await this.whenLoaded;
        const dpr = window.devicePixelRatio;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        const style = globalThis.document.createElement("style");
        style.textContent = `\n    canvas {\n      transform: scale(${1 / dpr});\n      transform-origin: top left;\n    }\n    .canvasWrapper {\n      width: ${width}px;\n      height: ${height}px;\n      overflow: hidden;\n    }\n    ::slotted(*) {\n      display: none;\n    }\n    `;
        const wrapper = globalThis.document.createElement("div");
        wrapper.className = "canvasWrapper";
        wrapper.appendChild(this.canvas);
        this.root.append(style, wrapper);
        this.gl = this.initializeGL();
        this.getContext = this.createContext(this.gl, init);
        const ctx = this.getContext();
        if (!ctx) {
            console.warn("<webgl-canvas>: unable to create runtime context");
            return;
        }
        await ctx.programs.initialize(ctx);
        await ctx.buffers.initialize(ctx);
        await ctx.textures.initialize(ctx);
        await ctx.framebuffers.initialize(ctx);
        await ctx.vaos.initialize(ctx);
        const bufferUpdaters = bufferInitializers.map((f)=>{
            if (this.gl) {
                return f(this.gl, ctx.buffers, ctx) || nop;
            }
            return nop;
        }).filter((f)=>f !== nop
        );
        const renderers = await ctx.programs.callInitializers({
            gl: this.gl,
            ctx,
            programInitializers,
            modulesFunctions
        });
        let drawCallsRoot = this.querySelector(DrawCalls.tag);
        if (!drawCallsRoot) {
            drawCallsRoot = globalThis.document.createElement(DrawCalls.tag);
            this.append(drawCallsRoot);
        }
        if (drawCallsRoot instanceof DrawCalls) {
            this.createDefaultDrawCalls(this.gl, drawCallsRoot);
            await drawCallsRoot.initialize(this.gl, ctx, renderers, bufferUpdaters);
            if (drawCallsRoot instanceof DrawCalls) {
                this.webglCanvasDraw = drawCallsRoot.drawCalls;
            }
        } else {
            console.warn(`<webgl-canvas>: unable to initialize the <${DrawCalls.tag}>`);
        }
    }
    createContext(gl, { payloads , modulesFunctions  }) {
        let buffers = this.querySelector(WebGLBuffers.tag);
        if (!buffers) {
            console.warn(`<webgl-canvas>: Unable to find <${WebGLBuffers.tag}>`);
            buffers = globalThis.document.createElement(WebGLBuffers.tag);
            this.appendChild(buffers);
        }
        let vaos = this.querySelector(WebGLVertexArrayObjects.tag);
        if (!vaos) {
            console.warn(`<webgl-canvas>: Unable to find <${WebGLVertexArrayObjects.tag}>`);
            vaos = globalThis.document.createElement(WebGLVertexArrayObjects.tag);
            this.appendChild(vaos);
        }
        let programs = this.querySelector(WebGLPrograms.tag);
        if (!programs) {
            console.warn(`<webgl-canvas>: Unable to find <${WebGLPrograms.tag}>`);
            programs = globalThis.document.createElement(WebGLPrograms.tag);
            this.appendChild(programs);
        }
        let textures = this.querySelector(WebGLTextures.tag);
        if (!textures) {
            console.warn(`<webgl-canvas>: Unable to find <${WebGLTextures.tag}>`);
            textures = globalThis.document.createElement(WebGLTextures.tag);
            this.appendChild(textures);
        }
        let framebuffers = this.querySelector(WebGLFramebuffers.tag);
        if (!framebuffers) {
            console.warn(`<webgl-canvas>: Unable to find <${WebGLFramebuffers.tag}>`);
            framebuffers = globalThis.document.createElement(WebGLFramebuffers.tag);
            this.appendChild(framebuffers);
        }
        if (textures instanceof WebGLTextures && programs instanceof WebGLPrograms && vaos instanceof WebGLVertexArrayObjects && buffers instanceof WebGLBuffers && framebuffers instanceof WebGLFramebuffers) {
            const runtime = this.createRuntime();
            const context = {
                gl,
                programs,
                buffers,
                framebuffers,
                vaos,
                textures,
                runtime,
                payloads,
                modulesFunctions
            };
            return ()=>context
            ;
        }
        console.warn("<webgl-canvas>: Unable to create context function, \
    are the containers instances available and their tags registered?");
        if (!(textures instanceof WebGLTextures)) {
            console.warn(`<webgl-textures> is malformed`, textures);
        }
        if (!(programs instanceof WebGLPrograms)) {
            console.warn(`<webgl-programs> is malformed`, programs);
        }
        if (!(vaos instanceof WebGLVertexArrayObjects)) {
            console.warn(`<webgl-vertex-array-objects> is malformed`, vaos);
        }
        if (!(framebuffers instanceof WebGLFramebuffers)) {
            console.warn(`<webgl-framebuffers> is malformed`, framebuffers);
        }
        if (!(buffers instanceof WebGLBuffers)) {
            console.warn(`<webgl-buffers> is malformed`, buffers);
        }
        return ()=>null
        ;
    }
    createRuntime() {
        const canvas512 = globalThis.document.createElement("canvas");
        const canvas1024 = globalThis.document.createElement("canvas");
        const canvas2048 = globalThis.document.createElement("canvas");
        const runtimeElement = globalThis.document.createElement("webgl-canvas-runtime");
        canvas512.width = 512;
        canvas512.height = 512;
        canvas1024.width = 1024;
        canvas1024.height = 1024;
        canvas2048.width = 2048;
        canvas2048.height = 2048;
        runtimeElement.append(canvas512, canvas1024, canvas2048);
        this.root.append(runtimeElement);
        const offscreenCanvas512 = canvas512.getContext("2d");
        const offscreenCanvas1024 = canvas512.getContext("2d");
        const offscreenCanvas2048 = canvas512.getContext("2d");
        if (offscreenCanvas512 === null || offscreenCanvas1024 === null || offscreenCanvas2048 === null) {
            throw new Error("WebGL Canvas Runtime: Unable to create offscreen \
      canvas context");
        }
        return {
            offscreenCanvas512,
            offscreenCanvas1024,
            offscreenCanvas2048
        };
    }
    initializeGL() {
        const ctx = this.canvas.getContext("webgl2", {
            desynchronized: true
        });
        if (!ctx || typeof ctx.getContextAttributes !== "function") {
            throw new Error("No WebGL 2.0 support");
        }
        return ctx;
    }
    createDefaultDrawCalls(gl, drawCalls) {
    }
    static default() {
        const parent = globalThis.document.createElement(WebGLCanvas.tag);
        const programs = globalThis.document.createElement(WebGLPrograms.tag);
        const buffers = globalThis.document.createElement(WebGLBuffers.tag);
        const textures = globalThis.document.createElement(WebGLTextures.tag);
        const vaos = globalThis.document.createElement(WebGLVertexArrayObjects.tag);
        parent.append(textures, vaos, buffers, programs);
        if (parent instanceof WebGLCanvas) {
            return parent;
        }
        return null;
    }
}
[
    WebGLCanvas,
    ...dependsOn15
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
class ImportModule extends globalThis.HTMLElement {
    static tag = "import-module";
    get from() {
        return this.getAttribute("from");
    }
    async initialize() {
        if (this.from) {
            try {
                const response = await fetch(this.from);
                const result = await response.text();
                console.log("GOT RESULT", result);
                return result;
            } catch (e) {
                console.error(e);
            }
        }
    }
}
const dependsOn16 = [
    NewModules,
    WebGLCanvas,
    DrawCalls,
    DrawLoop,
    ImportModule, 
];
class ShaderCanvas1 extends CanHaveModules {
    static tag = "shader-canvas";
    static createProgram(render) {
        return new class {
            initializer = render;
            useWith(name) {
                ShaderCanvas1.programInitializers.set(name.toLowerCase(), render);
            }
        }();
    }
    static programInitializers = new Map();
    static initializeBuffers(init) {
        this.bufferInitializers.push(init);
    }
    static bufferInitializers = [];
    static webglModule(createModule) {
        return new class {
            createPart = createModule;
            useWith(name) {
                ShaderCanvas1.modulesInitializers.set(name.toLowerCase(), (p)=>{
                    const functions = createModule(p);
                    if (functions) {
                        ShaderCanvas1.modulesFunctions.set(name.toLowerCase(), functions);
                    }
                });
            }
        }();
    }
    static modulesInitializers = new Map();
    static modulesFunctions = new Map();
    static getModuleState(moduleName) {
        return this.modulesFunctions.get(moduleName)?.getState?.();
    }
    whenLoaded = Promise.all(dependsOn16.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    get width() {
        return Number(this.getAttribute("width") || `${window.innerWidth}`);
    }
    get height() {
        return Number(this.getAttribute("height") || `${window.innerHeight}`);
    }
    webglCanvas = null;
    root = this.attachShadow({
        mode: "open"
    });
    draw = nop;
    async initialize() {
        await this.whenLoaded;
        this.setWebGLCanvas();
        const style = globalThis.document.createElement("style");
        style.textContent = `\n      ::slotted(*) {\n        display: block;\n        width: ${this.width}px;\n        height: ${this.height}px;\n        overflow: hidden;\n      }\n      ::slotted(new-modules) {\n        display: none;\n      }\n    `;
        const slot = globalThis.document.createElement("slot");
        this.root.append(style, slot);
        const modulesToLoad = globalThis.document.querySelectorAll("import-module");
        const loadedModules = [];
        for (const module of Array.from(modulesToLoad)){
            if (module && module instanceof ImportModule) {
                const content = await module.initialize();
                if (content) {
                    loadedModules.push(content);
                }
            }
        }
        let modules = this.querySelector(NewModules.tag);
        if (!modules && loadedModules.length > 0) {
            modules = globalThis.document.createElement(NewModules.tag);
            this.root.appendChild(modules);
        }
        if (!modules) {
            throw new Error("Unable to create placeholder <new-modules> tag");
        }
        for (const moduleContent of loadedModules){
            modules.insertAdjacentHTML("afterbegin", moduleContent);
        }
        let payloads = [];
        if (modules && modules instanceof NewModules) {
            payloads = await modules.initialize(ShaderCanvas1.modulesInitializers);
        }
        if (this.webglCanvas) {
            this.applyPayloads({
                payloadChildFilter: (child)=>child.nodeName === "WEBGL-PROGRAMS" || child.nodeName === "WEBGL-VERTEX-ARRAY-OBJECTS" || child.nodeName === "WEBGL-TEXTURES" || child.nodeName === "WEBGL-BUFFERS" || child.nodeName === "WEBGL-FRAMEBUFFERS" || child.nodeName === "DRAW-CALLS"
                ,
                payloads,
                removeModule: false,
                destinationRoot: this.webglCanvas,
                destinationChooser: (name)=>this.webglCanvas ? this.webglCanvas.querySelector(name) : null
            });
            await this.webglCanvas.initialize({
                width: this.width,
                height: this.height,
                payloads,
                programInitializers: ShaderCanvas1.programInitializers,
                bufferInitializers: ShaderCanvas1.bufferInitializers,
                modulesFunctions: ShaderCanvas1.modulesFunctions
            });
            if (this.webglCanvas instanceof WebGLCanvas) {
                const webglDraw = this.webglCanvas.webglCanvasDraw;
                this.draw = webglDraw;
                const loopElement = this.querySelector("draw-loop");
                if (loopElement && loopElement instanceof DrawLoop) {
                    this.loop = loopElement;
                }
            } else {
                console.warn(`<${ShaderCanvas1.tag}>: no webgl canvas instance found`);
            }
        } else {
            console.warn(`No <${WebGLCanvas.tag}> found.`);
        }
    }
    startLoop() {
        if (this.loop) {
            this.loop.start();
        }
    }
    stopLoop() {
        if (this.loop) {
            this.loop.stop();
        }
    }
    setWebGLCanvas() {
        if (!this.querySelector(WebGLCanvas.tag)) {
            const webglCanvas = WebGLCanvas.default();
            this.webglCanvas = webglCanvas;
            if (webglCanvas) {
                this.root.append(webglCanvas);
            } else {
                console.warn(`<${ShaderCanvas1.tag}>: no <${WebGLCanvas.tag}> found and unable to \
          create the default <${WebGLCanvas.tag}>. Make sure it is loaded and \
          defined.`);
            }
        } else {
            const webglCanvas = this.querySelector(WebGLCanvas.tag);
            if (webglCanvas instanceof WebGLCanvas) {
                this.webglCanvas = webglCanvas;
            } else {
                console.warn(`<${ShaderCanvas1.tag}>: the child <${WebGLCanvas.tag}> is not an \
        instance of WebGLCanvas (not a valid canvas object). Make sure it is \
        loaded and defined.`);
            }
        }
    }
}
[
    ShaderCanvas1,
    ...dependsOn16
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
export { ShaderCanvas1 as ShaderCanvas };

