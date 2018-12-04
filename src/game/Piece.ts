import {Bitmap, Easing} from "./app";
import {G, OBOTTOM, STAGEW} from "./GameData";

export class Piece extends Bitmap{
    private xSpeed:number = 5;
    private xa:number = 0.1;
    private xd:number = 0;
    private direction:number = 1;

    public constructor(options){
        super(options);
        this.x = 0;
        this.y = OBOTTOM - 205 -60*2;
    }

    public paint(ctx){
        if(this.x<0){
            this.direction = 1;
            this.xd = 0;
            this.x = 0
        }/*else if (this.x >= 0 && this.x<=(STAGEW - this.width)/2) {
            this.direction = 1;
            this.xd = 0;
        } else if (this.x >= STAGEW - this.width && this.x>(STAGEW - this.width)/2) {
            this.direction = -1;
            this.xd = 0;
        }*/else if(this.x > STAGEW - this.width){
            this.direction = -1;
            this.xd = 0;
            this.x = STAGEW - this.width;
        }
        this.xd ++;
        this.x += (this.xSpeed + this.xa * this.xd*this.xd) *this.direction;
        /**     this.xd ++;
         if(this.x<0){
            this.direction = 1;
            this.xd = 0;
        }else if (this.x >= 0 && this.x<=(STAGEW - this.width)/2) {
            this.x = (this.xSpeed / 2 * this.xd * this.xd + this.x)*this.direction;
        } else if (this.x <= STAGEW - this.width && this.x>(STAGEW - this.width)/2) {
            this.x = (-this.xSpeed / 2 * ((-- this.xd) * (this.xd - 2) - 1) + this.x)*this.direction ;
        }else if(this.x > STAGEW - this.width){
            this.direction = -1;
            this.xd = 0;
        }**/
        super.paint(ctx);
    }
}