import {Bitmap, DisplayContainer, Polygon, Skin} from "./app";
import {CHECKW, G, JSPEED, OBOTTOM, POINTS, STAGEW} from "./GameData";

export class Player{
    public isJump: boolean;
    private skin:Bitmap;
    private polygon:Polygon;
    private container: DisplayContainer;
    private points: number[][];
    private checkW: number;
    private oldY: number;
    private bottom: number;
    private width: number;
    private height: number;
    private jSpeed: number;
    private direction: string;

    public constructor(_skin,points){
        this.checkW = CHECKW;
        this.bottom = OBOTTOM;
        this.jSpeed = JSPEED;
        this.direction = 'up';
        this.init(_skin,points);
    }

    private init(_skin,points){
        this.skin = _skin;
        let [x, y] = [STAGEW * 0.5 - this.skin.width*0.5, this.bottom - this.skin.height];
        this.oldY =  y;
        this.polygon = new Polygon({
            points: points,
            fillStyle: 'transparent'
        });
        this.container = new DisplayContainer({x: x, y: y});
        this.container.addChild(this.polygon,'polygon');
        this.container.addChild(this.skin);
    }

    public paint(ctx){
        if(this.isJump && this.jSpeed >0 && this.direction === 'up'){
            this.jSpeed = Math.round((this.jSpeed - G)*10) / 10;
            this.container.y -= this.jSpeed - 0.5*G;
        }else if(this.isJump && this.jSpeed >=0 && this.direction === 'down'&& this.container.y<=930){
            this.jSpeed = Math.round((this.jSpeed + G)*10) / 10;
            this.container.y += this.jSpeed + 0.5*G;
        }else if(this.isJump && this.jSpeed >0 && this.direction === 'down'&& this.container.y>930){
            this.container.y = 930;
            this.direction = 'up';
            this.isJump = false;
        }else if(this.isJump && this.jSpeed <=0){
            this.jSpeed = 0;
            this.direction = 'down'
        }
        this.container.paint(ctx);
    }

    public drop(direction,func,target){
        let dropSpeed = 1.2 * G;
        this.container.y += dropSpeed * this.jSpeed;
        this.container.x -= dropSpeed * 10;
        if (this.container.y >= OBOTTOM - this.height) {
            func && func.call(target);
        }
    }

    public down(){
        this.skin.y += 0.3 * G;
    }

    public resetBottom(y){
        this.bottom = y
    }
}