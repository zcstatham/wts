import {Bitmap, DisplayContainer, Easing, Polygon} from "./app";
import {G, OBOTTOM, PieceH, PieceV, PlayerH, STAGEW} from "./GameData";

export class Piece {
    private xA: number = 0.1;
    private xANum: number = 0;
    private skin:Bitmap;
    public direction: number = 1;
    public xSpeed: number;
    public polygon:Polygon;
    public container: DisplayContainer;
    private isSuccess: boolean;
    private isAuto: boolean;
    private bottom: number;

    public constructor(_skin,points) {
        this.isAuto =  true;
        this.xSpeed =  PieceV;
        this.bottom =  OBOTTOM;
        // this.x = 0;
        // this.y = OBOTTOM - PlayerH - PieceH * 2;
        this.init(_skin,points);
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
            if (this.container.y >= this.bottom - this.container.height){
                this.isSuccess = false;
                this.container.y = this.bottom - this.container.height;
                this.bottom -= PieceH;
            }
        }
        this.container.x += (new_y) * this.direction;
        this.container.paint(ctx);
    }

    down(){
        this.isAuto = false;
        this.isSuccess = true;
    }
}