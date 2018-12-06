import {Bitmap} from "./app";

export class ChangeLevel{
    public skin:Bitmap;
    public parent:any;
    public isShow: boolean;
    private func: (resetLevel) => void;
    private target: any;

    public constructor(_skin,parent) {
        this.isShow = true;
        this.skin = _skin;
        this.parent = parent.layout;
        this.func = parent.gameContinue;
        this.target = parent;
    }

    public paint(ctx) {
        if(this.skin.x<0 && this.isShow){
            this.skin.x += 20;
        }else if(this.skin.x<=0 && this.skin.x>-750&& !this.isShow) {
            this.skin.x -= 20;
        }else if(this.skin.x>0 && this.isShow){
            this.skin.x = 0;
            setTimeout(()=>{
                this.isShow = false;
            },3000);
            this.func && this.func.call(this.target);
        }else if(this.skin.x<-750&& !this.isShow){
            this.skin.x = -750
        }
        this.skin.paint(ctx);
    }
}