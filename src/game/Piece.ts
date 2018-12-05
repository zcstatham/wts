import {Bitmap} from "./app";
import {OBOTTOM} from "./GameData";

export class Piece extends Bitmap{
    private xSpeed:number = 30;
    private direction:number = 1;

    public constructor(options){
        super(options);
        this.x = 0;
        this.y = OBOTTOM - 200;
    }

    public paint(ctx){
        if(this.x<300){

        }
    }
}