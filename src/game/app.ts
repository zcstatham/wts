/**
 * Created by Administrator on 2018/11/24.
 */

    export let requestAnimationFrame =  window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
    export let cancelAnimationFrame = window.cancelAnimationFrame;

    export let extend = function(...args) {
            let argsLen: number = args.length,
                target = args[0] || {},
                i = 1,
                deep = false;
            if (typeof target === "boolean") {
                deep = target;
                target = args[i] || {};
                i++;
            }
            if (typeof target !== "object" && typeof target !== "function") {
                target = {};
            }
            if (i === length) {
                target = this;
                i--;
            }
            for (; i < length; i++) {
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
        };

    export class Tick {
        private ani;
        private func;
        private target;

        public constructor(_func,_target) {
            this.func = _func;
            this.target = _target;
        }

        private tick() {
            this.ani = requestAnimationFrame(()=> {
                this.tick();
                this.func && this.func.call(this.target, this);
            });
        }
        public  start(){
            this.tick.call(this);
        }
        public  stop(){
            window.cancelAnimationFrame(this.ani);
        }
    }

    export class DisplayContainer {
        private x: any;
        private y: any;
        private width: any;
        private height: any;
        private scaleX: any;
        private scaleY: any;
        private children: any;

        public constructor(option) {
            let options = extend({
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1
            },option);
            for (let index in option) {
                if (option.hasOwnProperty(index) && this.hasOwnProperty(index)) {
                    this[index] = option[index];
                }
            }
        }

        public addChild(particle, name) {
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

        public removeChild(particle) {
            for (let  index in this.children) {
                if (this.children.hasOwnProperty(index) && particle === this.children[index]) {
                    this.children.splice(index, 1);
                    break;
                }
            }
        }

        public paint(ctx) {
            for (let  index in this.children) {
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

    export class Circle{
        private x: number;
        private y: number;
        private r: number;
        private scaleX: number;
        private scaleY: number;
        private color: string;

        public constructor(option) {
            let options = extend({
                x: 0,
                y: 0,
                r: 0,
                scaleX: 1,
                scaleY: 1
            },option);
            for (let index in option) {
                if (option.hasOwnProperty(index) && this.hasOwnProperty(index)) {
                    this[index] = option[index];
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

    export class TextField{
        private x: number;
        private y: number;
        private text: string;
        private font: string;

        public constructor(option) {
            this.x = option.x;
            this.y = option.y;
            this.text = option.text;
            this.font = option.size + 'px';
        }

        public paint(ctx) {
            ctx.font = this.font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.text, this.x, this.y);
        }
    }

    export class Bitmap {
        private x: number;
        private y: number;
        private width: number;
        private height: number;
        private skin: string;

        public constructor(option) {
            let options = extend({
                x: 0,
                y: 0,
            }, option);
            for (let index in option) {
                if (option.hasOwnProperty(index) && this.hasOwnProperty(index)) {
                    this[index] = option[index];
                }
            }
        }

        public paint(ctx) {
            ctx.drawImage(this.skin, this.x, this.y, this.width, this.height);
        }
    }

    export class ImgLoader{
        private oList:any;
        private iList:any;
        private complete:boolean;

        public constructor(list:any){
            this.oList = list;
            this.iList = {};
            this.complete = false;
        }

        public loadGroup(name){
            let imgs = [];
            let oimgs = {};
            for(let index in this.oList.name){
                if(this.oList.name.hasOwnProperty(index)) {
                    oimgs[index] = this.oList.resource.index;
                }
            }
            for(let index in oimgs){
                if(oimgs.hasOwnProperty(index)){
                    let img = new Image();
                    img.src = oimgs[index];
                    img.name = oimgs[index];
                    imgs.push(img);
                }
            }
            console.log(2);
            Promise.all(imgs).then((res)=>{
                console.log(3);
                res.forEach((item,index)=>{
                    this.iList[item.target.name] = item.target;
                    this.complete = true;
                })
            });
            console.log(4);
        }

        public getImg(name){
            return this.iList[name];
        }
    }