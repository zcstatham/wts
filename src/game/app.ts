/**
 * Created by Administrator on 2018/11/24.
 */

let requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60);
};
let cancelAnimationFrame = window.cancelAnimationFrame;

export let extend = function (...args) {
    let argsLen: number = args.length,
        target = args[0] || {},
        i = 1,
        deep = true;
    if (typeof target === "boolean") {
        deep = target;
        target = args[i] || {};
        i++;
    }
    if (typeof target !== "object" && typeof target !== "function") {
        target = {};
    }
    if (i === argsLen) {
        target = this;
        i--;
    }
    for (; i < argsLen; i++) {
        let options = args[i];
        if (options != null) {
            for (let name in options) {
                if (options.hasOwnProperty(name)) {
                    let src = target[name];
                    let copy = options[name];
                    let copyIsArray = Array.isArray(copy);
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && (copy.constructor.name === "Object" || copyIsArray)) {
                        let clone;
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];
                        } else {
                            clone = src && src.constructor.name === "Object" ? src : {};
                        }
                        target[name] = this.extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
    }

    return target;
};

export class Tick {
    private ani: any;
    private func: Function;
    private target: any;

    public constructor(_func, _target) {
        this.func = _func;
        this.target = _target;
    }

    private tick() {
        this.func && this.func.call(this.target, this);
        this.ani = requestAnimationFrame(()=>{
            this.tick();
        });
    }

    public start() {
        this.tick.call(this);
    }

    public stop() {
        cancelAnimationFrame(this.ani);
    }
}

export class DisplayContainer {
    public x: any;
    public y: any;
    public width: any;
    public height: any;
    public scaleX: any;
    public scaleY: any;
    public children: any;

    public constructor(option?) {
        let options = extend({
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1
        }, option);
        for (let index in options) {
            if (options.hasOwnProperty(index)) {
                this[index] = options[index];
            }
        }
        this.children = [];
    }

    public addChild(particle, name?) {
        for (let index in this.children) {
            if (this.children.hasOwnProperty(index) && this.children[index]['name'] && name === this.children[index]['name']) {
                console.log("name命名冲突：" + name);
                return;
            }
        }
        particle.name = name;
        this.children.push(particle);
    }

    public addChildTo(particle, idx) {
        this.children.splice(idx, 0, particle);
    }

    public getChildByName(name) {
        for (let index in this.children) {
            if (this.children.hasOwnProperty(index) && this.children[index]['name'] && name === this.children[index]['name']) {
                return this.children[index]
            }
        }
    }

    public removeChildAt(idx) {
        this.children.splice(idx, 1);
    }

    public removeChild(particle) {
        for (let index in this.children) {
            if (this.children.hasOwnProperty(index) && particle === this.children[index]) {
                this.children.splice(index, 1);
                break;
            }
        }
    }

    public paint(ctx) {
        for (let index in this.children) {
            if (this.children.hasOwnProperty(index)) {
                ctx.save();
                this.updataContent.call(this, ctx);
                this.children[index].paint.call(this.children[index], ctx);
                ctx.restore();
            }
        }
    }

    public updataContent(ctx) {
        ctx.transform(this.scaleX, 0, 0, this.scaleY, this.x, this.y)
    }
}

export class Shape {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public scaleX: number;
    public scaleY: number;
    private lineWidth: number;
    private fillStyle: string;
    private strokeStyle: string;

    public constructor(option) {
        let options = extend({
            x: 0,
            y: 0,
            lineWidth: 1,
            fillStyle: "#EEEEEE",
            strokeStyle: null,
            scaleX: 1,
            scaleY: 1
        }, option);
        for (let index in options) {
            if (options.hasOwnProperty(index)) {
                this[index] = options[index];
            }
        }
    }

    public paint(ctx) {
        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

export class Circle {
    public x: number;
    public y: number;
    public r: number;
    public scaleX: number;
    public scaleY: number;
    private color: string;

    public constructor(option) {
        let options = extend({
            x: 0,
            y: 0,
            r: 0,
            scaleX: 1,
            scaleY: 1
        }, option);
        for (let index in options) {
            if (options.hasOwnProperty(index)) {
                this[index] = options[index];
            }
        }
    }

    public paint(ctx) {
        if (this.color != '') {
            ctx.fillStyle = this.color;
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

export class TextField {
    public x: number;
    public y: number;
    private text: string;
    private font: string;

    public constructor(option) {
        this.x = option.x;
        this.y = option.y;
        this.text = option.text;
        this.font = option.size + 'px sans-serif';
    }

    public paint(ctx) {
        ctx.font = this.font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x, this.y);
    }
}

export class Polygon {
    public points: [number, number][];
    private strokeStyle: string;
    private fillStyle: string;

    public constructor(conf) {
        this.points = conf.points;  //顶点坐标
        this.strokeStyle = conf.strokeStyle;
        this.fillStyle = conf.fillStyle;
    }

    public paint(ctx) {
        ctx.beginPath();
        let start_point = this.points[0];
        let other_point = this.points.slice(1);
        ctx.moveTo(start_point[0], start_point[1]);
        for (let item of other_point) {
            let [x, y] = item;
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.lineWidth = 1;
        ctx.fillStyle = this.fillStyle;
        ctx.fill();   //用于绘制线条
    }
}

export class Bitmap {
    public x: number;
    public y: number;
    public sx: number;
    public sy: number;
    public swidth: number;
    public sheight: number;
    public width: number;
    public height: number;
    public skin: HTMLImageElement;

    public constructor(option?) {
        let options = extend({
            x: 0,
            y: 0,
            sx: null,
            sy: null,
            swidth: null,
            sheight: null,
            width: this.width,
            height: this.height,
        }, option);
        for (let index in options) {
            if (options.hasOwnProperty(index)) {
                this[index] = options[index];
            }
        }
    }

    public paint(ctx) {
        if (this.swidth && this.sheight && this.sx) {
            ctx.drawImage(this.skin, this.sx, this.sy, this.swidth, this.sheight, this.x, this.y,this.swidth, this.sheight);
        } else {
            ctx.drawImage(this.skin, this.x, this.y, this.width, this.height);
        }
    }
}

export class ImgLoader {
    private oList: any;
    private iList: any;
    private complete: boolean;

    public constructor(list: any) {
        this.oList = list;
        this.iList = {};
        this.complete = false;
    }

    public static getInstance(...args: any[]): any {
        let Class: any = this;
        if (!Class._instance) {
            let argsLen: number = args.length;
            if (argsLen == 0) {
                Class._instance = new Class();
            } else {
                Class._instance = new Class(...args);
            }
        }
        return Class._instance;
    }

    public async loadGroup(name) {
        let imgs = [];
        let oimgs = {};
        for (let item of this.oList.groups[name].split(',')) {
            oimgs[item] = this.oList.resources[item];
        }
        for (let index in oimgs) {
            if (oimgs.hasOwnProperty(index)) {
                let img = new Image();
                img.src = oimgs[index];
                img.name = index;
                let img_p = new Promise((resolve,reject)=>{
                    img.onload = (event)=>{
                        resolve(event.target)
                    }
                });
                imgs.push(img_p);
            }
        }
        console.log(2);
        await Promise.all(imgs).then((res) => {
            console.log(res);
            res.forEach((item) => {
                this.iList[item.name] = item;
                this.complete = true;
            })
        });
        console.log(4);
    }

    public getImg(name) {
        return this.iList[name];
    }
}

/**
 * t -- 当前时间
 * b -- 起始值
 * c -- 值变化
 * d -- 持续时间
 */
export class Easing {

    static easeInQuad(x, t, b, c, d) {
        return c * (t /= d) * t + b;
    }

    static easeOutQuad(x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    }

    static easeInOutQuad(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    }

    static easeInCubic(x, t, b, c, d) {
        return c * (t /= d) * t * t + b;
    }

    static easeOutCubic(x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    }

    static easeInOutCubic(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    }

    static easeInQuart(x, t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    }

    static easeOutQuart(x, t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    }

    static easeInOutQuart(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    }

    static easeInQuint(x, t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    }

    static easeOutQuint(x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    }

    static easeInOutQuint(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    }

    static easeInSine(x, t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    }

    static easeOutSine(x, t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    }

    static easeInOutSine(x, t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    }

    static easeInExpo(x, t, b, c, d) {
        return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    }

    static easeOutExpo(x, t, b, c, d) {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    }

    static easeInOutExpo(x, t, b, c, d) {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    }

    static easeInCirc(x, t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    }

    static easeOutCirc(x, t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    }

    static easeInOutCirc(x, t, b, c, d) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    }

    static easeInElastic(x, t, b, c, d) {
        let s = 1.70158;
        let p = 0;
        let a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            let s = p / 4;
        }
        else s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    }

    static easeOutElastic(x, t, b, c, d) {
        let s = 1.70158;
        let p = 0;
        let a = c;
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            let s = p / 4;
        }
        else s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    }

    static easeInOutElastic(x, t, b, c, d) {
        let s = 1.70158;
        let p = 0;
        let a = c;
        if (t == 0) return b;
        if ((t /= d / 2) == 2) return b + c;
        if (!p) p = d * (.3 * 1.5);
        if (a < Math.abs(c)) {
            a = c;
            let s = p / 4;
        }
        else s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
    }

    static easeInBack(x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    }

    static easeOutBack(x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    }

    static easeInOutBack(x, t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    }

    static easeInBounce(x, t, b, c, d) {
        return c - Easing.easeOutBounce(x, d - t, 0, c, d) + b;
    }

    static easeOutBounce(x, t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
    }

    static easeInOutBounce(x, t, b, c, d) {
        if (t < d / 2) return Easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
        return Easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
}

export interface Skin {
    x: number;
    y: number;
    sx?: number;
    sy?: number;
    swidth?: number;
    sheight?: number;
    width?: number;
    height?: number;
    image: HTMLImageElement;
}