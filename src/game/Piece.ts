import {Bitmap, DisplayContainer, Easing, Polygon} from "./app";
import {G, OBOTTOM, PieceH, PieceV, PlayerH, STAGEW} from "./GameData";

export class Piece {
    public skin:Bitmap;
    public direction: number = 1;
    public xSpeed: number;
    public polygon:Polygon;
    public container: DisplayContainer;
    public isAuto: boolean;
    public isDown: boolean;
    private xA: number = 0.1;
    private xANum: number = 0;
    private isSuccess: boolean;
    private bottom: number;

    public constructor(_skin,points) {
        this.isAuto =  true;
        this.isDown =  false;
        this.xSpeed =  PieceV;
        this.bottom =  OBOTTOM;
        // this.x = 0;
        // this.y = OBOTTOM - PlayerH - PieceH * 2;
        this.init(_skin,points);
    }

    public reset(options) {
        console.log(name);
        this.container.x =this.container['oX'];
        this.container.y =this.container['oY'];
        this.container.removeChildAt(1);
        this.skin = options.skin;
        this.container.addChild(this.skin);
        this.polygon = new Polygon({
            points: options.points,
            fillStyle: 'transparent'
        });
        this.container.width = this.skin.width || this.skin.swidth;
        this.container.height = this.skin.height || this.skin.sheight;
        this.isAuto = true;
        this.isDown = false;
        this.isSuccess = false;
    }

    private init(_skin,points){
        this.skin = _skin;
        let [x, y] = [0, OBOTTOM - PlayerH - PieceH * 2];
        this.polygon = new Polygon({
            points: points,
            fillStyle: 'transparent'
        });
        this.container = new DisplayContainer({x: x, y: y});
        this.container.addChild(this.polygon,'polygon');
        this.container.addChild(this.skin);
        this.container['oX'] = x;
        this.container['oY'] = y;
        this.container.width = this.skin.width;
        this.container.height = this.skin.height;
    }

    public paint(ctx) {
        let right_left_x = STAGEW - this.container.width;
        let duration = this.direction === 1?this.container.x:(right_left_x-this.container.x);
        let new_y = 0;
        ++this.xANum;
        if (this.isAuto && this.container.x < 0) {
            this.container.x = 0;
            this.direction = 1;
        } else if (this.isAuto && this.container.x >= 0 && this.container.x <= right_left_x) {
            new_y = Easing.easeInOutQuad(0, duration, this.xSpeed, this.xA, right_left_x)
        } else if (this.isAuto && this.container.x > right_left_x) {
            this.direction = -1;
            this.container.x = right_left_x;
        }else if(this.isSuccess){
            this.container.y += 30 * G;
            if (this.container.y >= this.bottom - PieceH){
                this.isSuccess = false;
                this.container.y= this.bottom - PieceH;
                this.container['oY'] -= this.container.height;
                this.bottom -= PieceH;
            }
        }
        this.container.x += (new_y) * this.direction;
        this.container.paint(ctx);
    }

    down(){
        this.isDown = true;
        this.isAuto = false;
        this.isSuccess = true;
    }
}