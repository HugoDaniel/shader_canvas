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
    get flags() {
        const maskString = this.getAttribute("flags");
        if (!maskString) return [];
        return maskString.split("|").map((s)=>s.trim()
        );
    }
    clearFlags = nop;
    initialize(gl) {
        const flags = this.flags;
        let mask = 0;
        flags.forEach((flag)=>{
            if (flag === "COLOR_BUFFER_BIT" || flag === "DEPTH_BUFFER_BIT" || flag === "STENCIL_BUFFER_BIT") {
                mask = mask | gl[flag];
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
            gl.enable(gl.DEPTH);
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
            if ([
                ...this.children
            ].filter((c)=>c instanceof TexParameterI
            ).length === 0) {
                const texParamElem = globalThis.document.createElement("tex-parameter-i");
                texParamElem.setAttribute("target", "TEXTURE_2D");
                texParamElem.setAttribute("pname", "TEXTURE_MIN_FILTER");
                texParamElem.setAttribute("param", "LINEAR");
                this.appendChild(texParamElem);
            }
            for (const child of [
                ...this.children
            ]){
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
        if (this.vao.hasElementArrayBuffer) {
            this.drawVao = ()=>{
                bindVao();
                gl.drawElements(mode, count, type, offset);
            };
        } else {
            this.drawVao = ()=>{
                bindVao();
                gl.drawArrays(mode, first, count);
            };
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
    return "UNSIGNED_BYTE";
}
const dependsOn1 = [
    DrawVAO
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
        for (const child of [
            ...this.children
        ]){
            if (child instanceof DrawVAO) {
                child.initialize(gl, context);
                this.drawCalls.push(child.drawVao);
            } else if (child instanceof ActiveTexture) {
                await child.initialize(gl, context, this.program);
                this.drawCalls = this.drawCalls.concat(child.drawCalls);
            } else {
                console.warn(`<use-program>: No valid child found in: <${child.tagName.toLocaleLowerCase()}>`);
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
const dependencies = [
    ClearColor,
    BlendFunc,
    ClearDepth,
    CullFace,
    ClearStencil,
    ClearFlags,
    DepthFunc,
    ViewportTransformation,
    UseProgram,
    DrawVAO, 
];
class CanMerge extends globalThis.HTMLElement {
    merge(dest, root = this) {
        if (!dest) return;
        const destChildNames = new Map([
            ...dest.children
        ].map(getChildName));
        for (const child of [
            ...root.children
        ]){
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
    if (dest && src.hasAttributes()) {
        for (const { name , value  } of src.attributes){
            dest.setAttribute(name, value);
        }
    }
}
class DrawCallsContainer extends CanMerge {
    drawFunctions = [];
    drawCalls = nop;
    async buildDrawFunction(gl, context, renderers) {
        for (const child of [
            ...this.children
        ]){
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
            } else if (child instanceof UseProgram) {
                await child.initialize(gl, context, renderers);
                this.drawFunctions.push(child.drawProgram);
            }
        }
        this.drawCalls = ()=>{
            for(let i = 0; i < this.drawFunctions.length; i++){
                this.drawFunctions[i]();
            }
        };
        return this.drawCalls;
    }
}
const dependsOn2 = [
    ...dependencies
];
class DrawLoop extends DrawCallsContainer {
    static tag = "draw-loop";
    whenLoaded = Promise.all(dependsOn2.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    rafId = -1;
    raf = (dt)=>{
        this.drawCalls();
        this.rafId = window.requestAnimationFrame(this.raf);
    };
    start() {
        this.rafId = window.requestAnimationFrame(this.raf);
    }
    stop() {
        window.cancelAnimationFrame(this.rafId);
    }
    async initialize(gl, context, renderers) {
        await this.whenLoaded;
        await this.buildDrawFunction(gl, context, renderers);
        for (const functions of context.modulesFunctions.values()){
            if (functions.onFrame && typeof functions.onFrame === "function") {
                const f = functions.onFrame;
                this.drawFunctions.unshift(()=>f(context)
                );
            }
        }
    }
}
[
    DrawLoop,
    ...dependsOn2
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
const dependsOn3 = [
    DrawLoop,
    ...dependencies
];
class DrawCalls extends DrawCallsContainer {
    static tag = "draw-calls";
    whenLoaded = Promise.all(dependsOn3.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    async initialize(gl, context, renderers) {
        await this.whenLoaded;
        await this.buildDrawFunction(gl, context, renderers);
        const drawLoopElem = this.querySelector(DrawLoop.tag);
        if (drawLoopElem && drawLoopElem instanceof DrawLoop) {
            await drawLoopElem.initialize(gl, context, renderers);
            drawLoopElem.start();
        }
    }
}
const DrawCalls1 = DrawCalls;
[
    DrawCalls,
    ...dependsOn3
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
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
const parse1 = parse;
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
    }
    hasCode = (codeTags)=>{
        let isCodeEmpty = codeTags.length === 0;
        for(let i = 0; i < codeTags.length; i++){
            isCodeEmpty = isCodeEmpty || (codeTags[i].textContent?.trim().length || 0) === 0;
        }
        return !isCodeEmpty;
    };
    getCode = (codeTags)=>{
        if (codeTags.length === 0) return "";
        return (codeTags[0].textContent || "").trim();
    };
    readCode = ()=>{
        const codeTags = this.getElementsByTagName("code");
        if (!this.hasCode(codeTags)) {
            throw new Error("Shader must have at least one non-empty <code> tag");
        }
        return this.getCode(codeTags);
    };
    setupCode = ()=>{
        this.code = this.readCode();
        this.variables = parse1(this.code);
    };
    loadShader(gl, type) {
        const shader = gl.createShader(type);
        if (!shader) {
            throw new Error("Unable to create a GL Shader");
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
const VertexShader1 = VertexShader;
class FragmentShader extends ShaderCode {
    static tag = "fragment-shader";
    load(gl) {
        this.loadShader(gl, gl.FRAGMENT_SHADER);
    }
}
const FragmentShader1 = FragmentShader;
class WebGLProgramPart extends CanMerge {
    static tag = "webgl-program-part";
    vertexCode = "";
    fragmentCode = "";
    mergeCode(node, codeText) {
        if (node) {
            const splitCode = node.textContent?.split("\n") || [];
            let splitLineIndex = splitCode.findIndex((line)=>line.includes("precision ")
            );
            if (splitLineIndex === -1) {
                splitLineIndex = splitCode.findIndex((line)=>line.includes("#version ")
                );
            }
            if (splitLineIndex >= 0) {
                node.textContent = [
                    ...splitCode.slice(0, splitLineIndex + 1),
                    codeText,
                    ...splitCode.slice(splitLineIndex + 1), 
                ].join("\n");
            } else {
                node.textContent = [
                    codeText,
                    ...splitCode
                ].join("\n");
            }
        }
    }
    merge(dest) {
        if (!dest) return;
        this.vertexCode = this.querySelector(`${VertexShader1.tag} code`)?.textContent || "";
        this.fragmentCode = this.querySelector(`${FragmentShader1.tag} code`)?.textContent || "";
        this.mergeCode(dest.querySelector(`${VertexShader.tag} code`), this.vertexCode);
        this.mergeCode(dest.querySelector(`${FragmentShader.tag} code`), this.fragmentCode);
    }
}
const dependsOn4 = [
    WebGLProgramPart
];
class Payload {
    contents = [];
    constructor(root1){
        this.tagName = root1.tagName;
        this.contents = [
            ...root1.children
        ];
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
        for (const node of nodes){
            if (node instanceof CanMerge) {
                if (destinationChooser) {
                    const destNodeName = node.tagName.toLowerCase();
                    let destNode = destinationChooser(destNodeName);
                    if (!destNode) {
                        destNode = globalThis.document.createElement(destNodeName);
                        destinationRoot.appendChild(destNode);
                    }
                    node.merge(destNode);
                } else {
                    node.merge(destinationRoot);
                }
            } else {
                console.debug(`The ${payload.tagName} module child: ${node.nodeName}, cannot be merged.\n\n          Is the destination an instance of "CanMerge"?`);
            }
        }
    }
}
class CanHaveModules extends globalThis.HTMLElement {
    modules = [];
    applyPayloads({ payloads =[] , payloadChildFilter =()=>true
     , destinationRoot =this , destinationChooser , removeModule =true  }) {
        for (const child of [
            ...this.children
        ]){
            if (child instanceof CreateModule) {
                const name = child.nodeName.toLowerCase();
                const payload = payloads.find((p)=>p.tagName.toLowerCase() === name
                );
                if (!payload) continue;
                this.modules.push(name);
                child.initialize({
                    payload,
                    destinationRoot,
                    destinationChooser,
                    payloadChildFilter
                });
                if (removeModule) {
                    this.removeChild(child);
                }
            }
        }
    }
}
class ShaderCanvasContainer extends CanMerge {
    content = new Map();
    createContentComponentsWith = (parent)=>{
        for (const child of [
            ...this.children
        ]){
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
    };
}
class NewModules extends ShaderCanvasContainer {
    static tag = "new-modules";
    whenLoaded = Promise.all(dependsOn4.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    payloads = [];
    async initialize(initializers) {
        await this.whenLoaded;
        this.createContentComponentsWith(CreateModule);
        for (const child of [
            ...this.children
        ]){
            if (child instanceof CreateModule) {
                this.payloads.push(child.initializeModule(initializers));
            }
        }
        return this.payloads;
    }
}
[
    NewModules,
    ...dependsOn4
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
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
    statusCheck(gl) {
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
const dependsOn5 = [
    VertexShader,
    FragmentShader,
    NewModules
];
class WebGLPrograms extends ShaderCanvasContainer {
    static tag = "webgl-programs";
    whenLoaded = Promise.all(dependsOn5.map((c)=>globalThis.customElements.whenDefined(c.tag)
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
    async callInitializers(gl, ctx, initializers) {
        const result = new Map();
        for (const [programName, program] of this.content.entries()){
            const f = initializers.get(programName);
            if (f && program && program.program) {
                gl.useProgram(program.program);
                const renderer = await f(gl, {
                    uniformLocations: program.uniformLocations,
                    ctx
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
const WebGLPrograms1 = WebGLPrograms;
[
    WebGLPrograms,
    ...dependsOn5
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
        this.vertexAttribPointer = ()=>{
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
        };
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
const readQueryElement1 = readQueryElement;
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
const readSrcAsJSON1 = readSrcAsJSON;
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
const readImageDataFromQuery1 = readImageDataFromQuery;
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
                    readQueryElement1,
                    readSrcAsJSON1
                ], srcOverride);
            }
            gl.bindBuffer(target, buffer);
            if (this.data) {
                let bytesPerItem = 8;
                if (Array.isArray(this.data)) {
                    if (target !== gl.ELEMENT_ARRAY_BUFFER) {
                        this.data = new Float32Array(this.data);
                        bytesPerItem = 4;
                    } else {
                        this.data = new Uint16Array(this.data);
                        bytesPerItem = 2;
                    }
                }
                this.length = Math.floor(this.data.byteLength / bytesPerItem);
                if (this.offset > 0 && isArrayBufferView(this.data)) {
                    gl.bufferData(target, this.data, usage, this.offset);
                    this.length = this.length - this.offset;
                } else {
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
            gl.bindBuffer(target, null);
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
        for (const child of [
            ...this.children
        ]){
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
const dependsOn6 = [
    BufferData
];
class WebGLBuffers extends ShaderCanvasContainer {
    static tag = "webgl-buffers";
    whenLoaded = Promise.all(dependsOn6.map((c)=>globalThis.customElements.whenDefined(c.tag)
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
const WebGLBuffers1 = WebGLBuffers;
[
    WebGLBuffers,
    ...dependsOn6
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
const dependsOn7 = [
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
    whenLoaded = Promise.all(dependsOn7.map((c)=>globalThis.customElements.whenDefined(c.tag)
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
        for (const child of [
            ...this.children
        ]){
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
        gl.bindBuffer(this.target, null);
    }
}
[
    BindBuffer,
    ...dependsOn7
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
const dependsOn8 = [
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
    whenLoaded = Promise.all(dependsOn8.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    bindVAO = nop;
    async initialize(gl, buffers, locations) {
        await this.whenLoaded;
        this.vao = gl.createVertexArray();
        if (!this.vao) {
            console.error(`<${this.tagName.toLocaleLowerCase()}>: Unable to create VAO`);
            return;
        }
        gl.bindVertexArray(this.vao);
        for (const child of [
            ...this.children
        ]){
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
        const vao = this.vao;
        this.bindVAO = ()=>gl.bindVertexArray(vao)
        ;
    }
}
[
    WebGLBuffers,
    ...dependsOn8
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
const dependsOn9 = [
    VertexAttribPointer,
    BindBuffer,
    WebGLBuffers
];
class WebGLVertexArrayObjects extends ShaderCanvasContainer {
    static tag = "webgl-vertex-array-objects";
    whenLoaded = Promise.all(dependsOn9.map((c)=>globalThis.customElements.whenDefined(c.tag)
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
const WebGLVertexArrayObjects1 = WebGLVertexArrayObjects;
[
    WebGLVertexArrayObjects,
    ...dependsOn9
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
    get height() {
        return Number(this.getAttribute("height"));
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
                    readImageDataFromQuery1
                ], srcOverride ? srcOverride : src || srcOverride);
                gl.bindTexture(gl[target], texture);
                if (width > 0 && height > 0) {
                    gl.texImage2D(gl[target], level, gl[internalFormat], width, height, 0, gl[format], gl[type], this.data);
                } else {
                    gl.texImage2D(gl[target], level, gl[internalFormat], gl[format], gl[type], this.data);
                }
                gl.bindTexture(gl[target], null);
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
const dependsOn10 = [
    TexImage2D
];
class CreateTexture extends globalThis.HTMLElement {
    static tag = "{{user defined}}";
    whenLoaded = Promise.all(dependsOn10.map((c)=>globalThis.customElements.whenDefined(c.tag)
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
        for (const child of [
            ...this.children
        ]){
            if (child instanceof TexImage2D) {
                child.initialize(gl);
                await child.load(this.texture);
                this.bindTexture = ()=>gl.bindTexture(gl.TEXTURE_2D, this.texture)
                ;
            }
        }
    }
}
[
    ...dependsOn10
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
const dependsOn11 = [
    TexImage2D
];
class WebGLTextures extends ShaderCanvasContainer {
    static tag = "webgl-textures";
    whenLoaded = Promise.all(dependsOn11.map((c)=>globalThis.customElements.whenDefined(c.tag)
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
const WebGLTextures1 = WebGLTextures;
[
    WebGLTextures,
    ...dependsOn11
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
const dependsOn12 = [
    WebGLPrograms,
    WebGLBuffers,
    DrawCalls,
    WebGLVertexArrayObjects, 
];
class WebGLCanvas extends globalThis.HTMLElement {
    static tag = "webgl-canvas";
    whenLoaded = Promise.all(dependsOn12.map((c)=>globalThis.customElements.whenDefined(c.tag)
    ));
    root = this.attachShadow({
        mode: "open"
    });
    canvas = globalThis.document.createElement("canvas");
    getContext = ()=>null
    ;
    webglCanvasDraw = nop;
    async initialize(init) {
        const { width , height , programInitializers ,  } = init;
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
        await ctx.vaos.initialize(ctx);
        const renderers = await ctx.programs.callInitializers(this.gl, ctx, programInitializers);
        let drawCallsRoot = this.querySelector(DrawCalls.tag);
        if (!drawCallsRoot) {
            drawCallsRoot = globalThis.document.createElement(DrawCalls1.tag);
            this.append(drawCallsRoot);
        }
        if (drawCallsRoot instanceof DrawCalls) {
            this.createDefaultDrawCalls(this.gl, drawCallsRoot);
            await drawCallsRoot.initialize(this.gl, ctx, renderers);
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
            buffers = globalThis.document.createElement(WebGLBuffers1.tag);
            this.appendChild(buffers);
        }
        let vaos = this.querySelector(WebGLVertexArrayObjects.tag);
        if (!vaos) {
            console.warn(`<webgl-canvas>: Unable to find <${WebGLVertexArrayObjects.tag}>`);
            vaos = globalThis.document.createElement(WebGLVertexArrayObjects1.tag);
            this.appendChild(vaos);
        }
        let programs = this.querySelector(WebGLPrograms.tag);
        if (!programs) {
            console.warn(`<webgl-canvas>: Unable to find <${WebGLPrograms.tag}>`);
            programs = globalThis.document.createElement(WebGLPrograms1.tag);
            this.appendChild(programs);
        }
        let textures = this.querySelector(WebGLTextures.tag);
        if (!textures) {
            console.warn(`<webgl-canvas>: Unable to find <${WebGLTextures.tag}>`);
            textures = globalThis.document.createElement(WebGLTextures1.tag);
            this.appendChild(textures);
        }
        if (textures instanceof WebGLTextures && programs instanceof WebGLPrograms && vaos instanceof WebGLVertexArrayObjects && buffers instanceof WebGLBuffers) {
            const runtime = this.createRuntime();
            const context = {
                gl,
                programs,
                buffers,
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
        const ctx = this.canvas.getContext("webgl2");
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
    ...dependsOn12
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});
const dependsOn13 = [
    NewModules,
    WebGLCanvas,
    DrawCalls, 
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
    whenLoaded = Promise.all(dependsOn13.map((c)=>globalThis.customElements.whenDefined(c.tag)
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
        const modules = this.querySelector(NewModules.tag);
        let payloads = [];
        if (modules && modules instanceof NewModules) {
            payloads = await modules.initialize(ShaderCanvas1.modulesInitializers);
        }
        if (this.webglCanvas) {
            this.applyPayloads({
                payloadChildFilter: (child)=>child.nodeName === "WEBGL-PROGRAMS" || child.nodeName === "WEBGL-VERTEX-ARRAY-OBJECTS" || child.nodeName === "WEBGL-TEXTURES" || child.nodeName === "WEBGL-BUFFERS" || child.nodeName === "DRAW-CALLS"
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
                modulesFunctions: ShaderCanvas1.modulesFunctions
            });
            if (this.webglCanvas instanceof WebGLCanvas) {
                const webglDraw = this.webglCanvas.webglCanvasDraw;
                this.draw = webglDraw;
            } else {
                console.warn(`<${ShaderCanvas1.tag}>: no webgl canvas instance found`);
            }
        } else {
            console.warn(`No <${WebGLCanvas.tag}> found.`);
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
export { ShaderCanvas1 as ShaderCanvas };
[
    ShaderCanvas1,
    ...dependsOn13
].map((component)=>{
    if (!globalThis.customElements.get(component.tag)) {
        globalThis.customElements.define(component.tag, component);
    }
});

