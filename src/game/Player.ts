import {Bitmap, DisplayContainer, Polygon, Skin} from "./app";
import {CHECKW, G, OBOTTOM, PieceH, PieceV, PlayerV, PlayerW, POINTS, STAGEW} from "./GameData";

export class Player{
    public isJump: boolean;
    public isDrop: boolean;
    public width: number;
    public height: number;
    public jSpeed: number;
    public container: DisplayContainer;
    public polygon:Polygon;
    public bottom: number;
    public jumpDirection: string;
    public dropDirection: number[];
    private skin:Bitmap;
    private points: number[][];
    private checkW: number;
    private oldY: number;
    private successFunc: Function;
    private failFunc: Function;
    private target: any;
    private isSuccess: boolean;
    private angle: number;

    public constructor(_skin,points,func1,func2,target){
        this.bottom = OBOTTOM;
        this.successFunc = func1;
        this.failFunc = func2;
        this.target = target;
        this.reset();
        this.init(_skin,points);
    }

    private reset(){
        this.checkW = CHECKW;
        this.jSpeed = PlayerV;
        this.isJump = false;
        this.isDrop = false;
        this.isSuccess = false;
        this.jumpDirection = 'up';
        this.dropDirection = null;
    }

    private init(_skin,points){
        this.skin = _skin;
        this.angle = 0;
        let [x, y] = [STAGEW * 0.5 - this.skin.width*0.5, this.bottom - this.skin.height];
        this.oldY =  y;
        this.polygon = new Polygon({
            points: points,
            fillStyle: 'transparent'
        });
        this.container = new DisplayContainer({x: x, y: y});
        this.container.addChild(this.polygon,'polygon');
        this.container.addChild(this.skin);
        this.container.width = this.skin.width;
        this.container.height = this.skin.height;
    }

    public paint(ctx){
        if(this.isJump && this.jSpeed >0 && this.jumpDirection === 'up'){
            this.jSpeed = Math.round((this.jSpeed - G)*10) / 10;
            this.container.y -= this.jSpeed - 0.5*G;
        }else if(this.isJump && this.jSpeed >=0 && this.jumpDirection === 'down'&& this.container.y<=this.bottom-this.container.height){
            this.jSpeed = Math.round((this.jSpeed + G)*10) / 10;
            this.container.y += this.jSpeed + 0.5*G;
        }else if(this.isJump && this.jSpeed >0 && this.jumpDirection === 'down'&& this.container.y>this.bottom-this.container.height){
            this.container.y = this.bottom-this.container.height;
            this.jumpDirection = 'up';
            this.isJump = false;
        }else if(this.isJump && this.jSpeed <=0){
            this.jSpeed = 0;
            this.jumpDirection = 'down'
        }else if(this.isDrop){
            this.container.y += PlayerV;
            this.container.x += this.dropDirection[0]*PieceV*2;
            if (this.container.y >= OBOTTOM - this.container.height) {
                this.isDrop = false;
                this.dropDirection = null;
                this.container.y = this.bottom - this.container.height;
                this.failFunc && this.failFunc.call(this.target);
            }
        }else if(this.isSuccess){
            this.container.y += 30 * G;
            if (this.container.y >= this.bottom - this.container.height) {
                this.reset();
                this.container.y = this.bottom - this.container.height;
                this.successFunc && this.successFunc.call(this.target);
            }
        }
        if(this.dropDirection && this.dropDirection[2]){
            this.angle += this.dropDirection[2];
            ctx.translate(this.container.x+this.container.width/2,this.container.y+this.container.height/2);
            ctx.rotate(this.angle*Math.PI/180);
            this.skin.paint(ctx);
        }else{
            this.container.paint(ctx);
        }
    }

    public drop(direction){
        this.isJump = false;
        this.isDrop = true;
        this.dropDirection = direction;
    }

    public down(){
        this.isJump = false;
        this.isSuccess = true;
        this.bottom -= PieceH;
    }

    public resetBottom(y){
        this.bottom = y
    }
}