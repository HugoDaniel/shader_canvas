class Vector2D {
    constructor(x1 = 0, y1 = 0){
        this.x = x1;
        this.y = y1;
    }
    toJSON() {
        return {
            x: this.x,
            y: this.y
        };
    }
    static revive(v) {
        return new Vector2D(v.x, v.y);
    }
    get fst() {
        return this.x;
    }
    get snd() {
        return this.y;
    }
    toString() {
        return `(${this.x}, ${this.y})`;
    }
    isEqual(v) {
        return this.x === v.x && this.y === v.y;
    }
    static isEqual(v1, v2) {
        return v1.x === v2.x && v1.y === v2.y;
    }
    static fromObj(obj) {
        return new Vector2D(obj.x, obj.y);
    }
    static zero() {
        return new Vector2D();
    }
    static pow7() {
        return new Vector2D(127, 127);
    }
    static isBetween(a, b, c) {
        const epsilon = 0.1;
        const crossProduct = (c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y);
        if (Math.abs(crossProduct) > 0.1) {
            return false;
        }
        const dotProduct = (c.x - a.x) * (b.x - a.x) + (c.y - a.y) * (b.y - a.y);
        if (dotProduct < 0) {
            return false;
        }
        const squaredLengthBA = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
        if (dotProduct > squaredLengthBA) {
            return false;
        }
        return true;
    }
    static getNearSet(pt, _epsilon = 1) {
        const result = new Array(_epsilon * 8);
        let epsilon = Math.abs(Math.round(_epsilon));
        const x1 = pt.x;
        const y1 = pt.y;
        while(epsilon > 0){
            const xA = x1 - epsilon;
            const xB = x1 + epsilon;
            const yA = y1 - epsilon;
            const yB = y1 + epsilon;
            result.push(new Vector2D(xA, yA));
            result.push(new Vector2D(x1, yA));
            result.push(new Vector2D(xB, yA));
            result.push(new Vector2D(xA, y1));
            result.push(new Vector2D(xB, y1));
            result.push(new Vector2D(xA, yB));
            result.push(new Vector2D(x1, yB));
            result.push(new Vector2D(xB, yB));
            epsilon = epsilon - 1;
        }
        return result;
    }
    static abs(p) {
        return new Vector2D(Math.abs(p.x), Math.abs(p.y));
    }
    static createRounded(res, x, y) {
        const halfRes = res / 2;
        let result;
        if (x >= halfRes && y < halfRes) {
            result = new Vector2D(Math.floor(x), Math.ceil(y));
        } else if (x < halfRes && y < halfRes) {
            result = new Vector2D(Math.ceil(x), Math.ceil(y));
        } else if (x < halfRes && y >= halfRes) {
            result = new Vector2D(Math.ceil(x), Math.floor(y));
        } else {
            result = new Vector2D(Math.floor(x), Math.floor(y));
        }
        return result;
    }
    static insideTriangle(x, y, p0, p1, p2) {
        const area = 0.5 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
        const s = 1 / (2 * area) * (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * x + (p0.x - p2.x) * y);
        const t = 1 / (2 * area) * (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * x + (p1.x - p0.x) * y);
        return s >= -0.1 && t >= -0.1 && 1 - s - t >= 0;
    }
}
class VectorMap1 {
    constructor(vectors, elements){
        this.tree = new Map();
        if (vectors && vectors.length > 0 && elements) {
            this._size = vectors.length;
            for(let i = 0; i < vectors.length; i++){
                const v = vectors[i];
                let vx, vy;
                if (v instanceof Array) {
                    vx = v[0];
                    vy = v[1];
                } else {
                    vx = v.x;
                    vy = v.y;
                }
                const ys = this.tree.get(vx) || new Map();
                ys.set(vy, elements[i]);
                this.tree.set(vx, ys);
            }
        } else {
            this._size = 0;
        }
    }
    toJSON(elemToJSON = JSON.parse) {
        const result = [];
        this.map((elem, x2, y2)=>{
            if (x2 !== undefined && y2 !== undefined) {
                result.push([
                    x2,
                    y2,
                    elemToJSON(elem)
                ]);
            }
        });
        return result;
    }
    static revive(a, reviveElem) {
        const result = new VectorMap1();
        a.map((v)=>result.addXY(v[0], v[1], reviveElem(v[2]))
        );
        return result;
    }
    clear() {
        this.tree.clear();
        this._size = 0;
    }
    get size() {
        return this._size;
    }
    firstValue() {
        if (this.size === 0) {
            throw new Error("No values in VectorMap");
        }
        return this.tree.values().next().value.values().next().value;
    }
    firstKey() {
        if (this.size === 0) {
            throw new Error("Trying to get the firstKey() but there are no keys in VectorMap/Set");
        }
        const [x2, ys] = this.tree.entries().next().value;
        return new Vector2D(x2, ys.keys().next().value);
    }
    filter(f) {
        const result = new VectorMap1();
        for (const [x2, yMap] of this.tree.entries()){
            for (const [y2, val] of yMap.entries()){
                if (f(val, x2, y2)) {
                    result.addXY(x2, y2, val);
                }
            }
        }
        return result;
    }
    map(f) {
        const result = new VectorMap1();
        for (const [x2, yMap] of this.tree.entries()){
            for (const [y2, val] of yMap.entries()){
                result.addXY(x2, y2, f(val, x2, y2));
            }
        }
        return result;
    }
    *entries() {
        for (const [x2, yMap] of this.tree.entries()){
            for (const [y2, val] of yMap.entries()){
                yield [
                    val,
                    [
                        x2,
                        y2
                    ]
                ];
            }
        }
    }
    addXY(x, y, value) {
        const ys = this.tree.get(x) || new Map();
        if (ys.size === 0 || !ys.has(y)) {
            this._size += 1;
        }
        ys.set(y, value);
        this.tree.set(x, ys);
        return this;
    }
    addValue(v, value) {
        return this.addXY(v.x, v.y, value);
    }
    deleteXY(x, y) {
        const ys = this.tree.get(x) || new Map();
        if (ys.size <= 1) {
            this.tree.delete(x);
        } else {
            ys.delete(y);
        }
        this._size -= 1;
        return this;
    }
    delete(v) {
        return this.deleteXY(v.x, v.y);
    }
    hasXY(x, y) {
        const map = this.tree.get(x);
        if (map) {
            return map.has(y);
        }
        return false;
    }
    has(v) {
        return this.hasXY(v.x, v.y);
    }
    get(v) {
        return this.getXY(v.x, v.y);
    }
    getXY(x, y) {
        return this.tree.get(x)?.get(y);
    }
    equals(set2) {
        const set1 = this;
        if (set1.size !== set2.size) {
            return false;
        }
        for (const [x2, yMap] of set1.tree.entries()){
            for (const [y2, val] of yMap.entries()){
                const value = set2.getXY(x2, y2);
                if (!value || value !== val) {
                    return false;
                }
            }
        }
        return true;
    }
}
class VectorSet1 extends VectorMap1 {
    constructor(vectors1){
        if (vectors1) {
            super(vectors1, vectors1);
        } else {
            super();
        }
    }
    toJSON() {
        const result = this.toArray().map((v)=>[
                v.x,
                v.y,
                0
            ]
        );
        return result;
    }
    static revive(a, reviveElem) {
        const result = new VectorSet1();
        a.map((v)=>result.add(new Vector2D(v[0], v[1]))
        );
        return result;
    }
    add(v) {
        return this.addValue(v, v);
    }
    delete(v) {
        return super.delete(v);
    }
    dup() {
        const result = new VectorSet1();
        return result.append(this);
    }
    append(set) {
        for (const [x2, yMap] of set.tree.entries()){
            for (const [y2, val] of yMap.entries()){
                this.addXY(x2, y2, val);
            }
        }
        return this;
    }
    *values() {
        for (const yMap of this.tree.values()){
            for (const v of yMap.values()){
                yield v;
            }
        }
    }
    toArray() {
        const result = [];
        for (const yMap of this.tree.values()){
            for (const v of yMap.values()){
                result.push(v);
            }
        }
        return result;
    }
    first() {
        return super.firstKey();
    }
    equals(set2) {
        const set1 = this;
        if (set1.size !== set2.size) {
            return false;
        }
        for (const yMap of set1.tree.values()){
            for (const v of yMap.values()){
                if (!set2.has(v)) {
                    return false;
                }
            }
        }
        return true;
    }
    filter(f) {
        const result = new VectorSet1();
        for (const [x2, yMap] of this.tree.entries()){
            for (const [y2, val] of yMap.entries()){
                if (f(val, x2, y2)) {
                    result.add(val);
                }
            }
        }
        return result;
    }
    map(f) {
        return super.map(f);
    }
}
export { VectorMap1 as VectorMap };
export { VectorSet1 as VectorSet };

