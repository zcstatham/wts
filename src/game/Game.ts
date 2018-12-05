import {Player} from "./Player";
import {Bitmap, DisplayContainer, ImgLoader, Polygon, TextField, Tick} from "./app";
import {OBOTTOM, PARAMETERS, PieceH, PieceW, PlayerH, PlayerW, POINTS, STAGEH, STAGEW} from "./GameData";
import {Piece} from "./Piece";

const data = require('../../resource/config/default.res.json');

export class Game {
    //香水瓶
    private levelLength: number;
    private gameModel: number;
    private pieceNum: number;
    private level: number;
    private bottle: Player;
    private floor: Bitmap;
    private piece: Piece;
    private splitPiece: Bitmap;
    private try_label: Bitmap;
    private level_change: Bitmap;
    private bottom_banner: Bitmap;
    private pieces: DisplayContainer;
    private layout: DisplayContainer;
    private level_box: DisplayContainer;
    private piece_box: DisplayContainer;
    private timer_box: DisplayContainer;
    private ctx: CanvasRenderingContext2D;
    private isPause: boolean;
    private isOver: boolean;
    private isCanTap: boolean;
    private tick: Tick;
    private canvas: any;
    private times: number;
    private time_down: any;

    public constructor(canvas, options) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.layout = new DisplayContainer();
        this.reSize(STAGEW, STAGEH, canvas);

        ImgLoader.getInstance(data);
        this.init(options);
    }

    private async init(options) {
        this.level = 1;
        this.pieceNum = this.getParams(1, 2);
        this.gameModel = options.gameModel;
        this.levelLength = 3;
        await ImgLoader.getInstance().loadGroup('preload');

        this.layout.addChild(new Bitmap({
            width: 750,
            height: 1334,
            skin: ImgLoader.getInstance().getImg('main_bg_jpg')
        }), 'main_bg');
        this.resetScene();

        let clickEvent = 'ontouchend' in document ? 'touchend' : 'click';
        options.layout.addEventListener(clickEvent, (event)=>{
            event.preventDefault();
            if(this.bottle.isJump || this.bottle.isDrop){
                return
            }else{
                this.bottle.isJump = true;
            }
        });
        this.tick = new Tick(this.updata, this);
        this.gameStart();
    }

    public gameStart () {
        this.level = 1;
        this.times = this.getParams(1,3);
        this.isPause = false;
        this.isOver = false;
        this.isCanTap = true;
        this.tick.start();
        this.time_down = setInterval(()=>{
            if (this.times <= 11 && this.times > 10) {
                //this.audioPlay($("#Countdown_10s_audio").get(0))
            }
            --this.times;
            this.timer_box.getChildByName('timetext').text = this.times;
            if (Number(this.times) === 0) {
                this.gameOver.call(this);
            }
        },1000);
    }

    public gamePause () {
        this.isCanTap = false;
        this.isPause = true;
    }

    public gameContinue (resetLevel) {
        this.isPause = false;
        this.isCanTap = true;
        if (this.isOver || resetLevel) {
            this.resetScene();
            this.isOver = false;
        }
        this.updata();
        // this.audioPlay(this.audios.back_music);
    }

    public gameOver () {
        this.isOver = true;
        this.isCanTap = false;
        this.tick.stop();
        this.gameOverHandle(this.level);
    }

    public nextLevel() {
        clearInterval(this.time_down);
        this.level++;
        this.gamePause.call(this);
        if (this.level <= this.levelLength + 1) {
            this.levelSuccessHandle.call(this);
        }
    }

    public normalResults(){
        //pieces +1 左右界限

        //初始化piece 宽

        //初始化香水

    }

    public updata () {
        if (!this.isPause && !this.isOver) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (this.bottle.isJump) {
                let bottle = this.bottle;
                let piece = this.piece;
                /*碰撞检测START*/
                if (bottle.container.y >= OBOTTOM - PieceH * 2 - PlayerH * 2 &&
                    bottle.container.y <= OBOTTOM - PieceH- PlayerH &&
                    piece.container.x >= STAGEW / 2 - PieceW - PlayerW / 2 &&
                    piece.container.x <= STAGEW / 2 + PlayerW / 2
                ) {
                    console.log('碰撞检测');
                    // console.log(bottle.polygon.points);
                    // console.log(piece.polygon.points)
                    if(bottle.jumpDirection === 'up'){
                        let direction = [];
                        direction[0] = piece.direction;
                        direction[1] = 1;
                        bottle.drop(direction);
                    }else if(bottle.jumpDirection === 'down'){
                        let piece_y = OBOTTOM - PlayerH - PieceH * 2;
                        if((
                            bottle.container.y > piece_y - bottle.container.height &&
                            bottle.container.y < piece_y + piece.container.height) && ((
                            piece.container.x >= bottle.container.x &&
                            piece.container.x <= bottle.container.x + bottle.container.width) || (
                            piece.container.x + piece.container.width >= bottle.container.x &&
                            piece.container.x + piece.container.width <= bottle.container.x + bottle.container.width
                        ))) {
                            bottle.drop([piece.direction,1,0.02]);
                        }else if(
                            bottle.container.y ===  piece.container.y &&
                            bottle.container.x <= piece.container.x &&
                            bottle.container.x+bottle.container.width>=piece.container.x
                        ){
                            bottle.drop([-1,1,0.02]);
                        }else if(
                            bottle.container.y ===  piece.container.y &&
                            bottle.container.x <= piece.container.x+piece.container.width &&
                            bottle.container.x+bottle.container.width>=piece.container.x+piece.container.width
                        ){
                            bottle.drop([1,1,0.02]);
                        }else{
                            piece.down();
                            bottle.down();
                        }
                    }
                }
            }
            this.layout.paint(this.ctx);
        }
    }

    private levelSuccessHandle() {
        if ((Number(this.gameModel) === 1 && this.level < 3) || (Number(this.gameModel) === 2 && this.level < 4)) {
            //切换关卡 出关卡图
            setTimeout(function () {
                // 删除关卡图

            }, 3000);
        } else {
            //游戏结束 出结束弹框
            if (Number(this.gameModel) === 1) {

            } else if (Number(this.gameModel) === 2) {

            }
        }
    }

    private gameOverHandle(level: number) {

    }

    private resetScene() {
        //level-label 绘制
        this.level_box = new DisplayContainer({x: 41, y: 44});
        for (let i = 0; i < this.levelLength; i++) {
            let skin;
            if (this.level === i + 1) {
                skin = ImgLoader.getInstance().getImg('level_' + (i+1) + '_icon_active_png');
            } else if (this.gameModel === 1 && i + 1 === this.levelLength) {
                skin = ImgLoader.getInstance().getImg('level_icon_lock_png');
            } else {
                skin = ImgLoader.getInstance().getImg('level_' + (i+1) + '_icon_png');
            }
            this.level_box.addChild(new Bitmap({
                x: i * 87, y: 0,
                width: 60, height: 60,
                skin: skin
            }));
        }
        this.layout.addChild(this.level_box);
        //piece-label 绘制
        this.piece_box = new DisplayContainer({x: 41, y: 148});
        this.piece_box.addChild(new Bitmap({
            width: 136, height: 38,
            skin: ImgLoader.getInstance().getImg('piece_label_png')
        }));
        for (let i = 0; i < this.pieceNum; i++) {
            let skin = ImgLoader.getInstance().getImg('piece_icon_png');
            this.piece_box.addChild(new Bitmap({
                x: i * 34 + 146, y: 9,
                width: 26, height: 26,
                skin: skin
            }));
        }
        this.layout.addChild(this.piece_box);
        //times-label 绘制
        this.timer_box = new DisplayContainer({x: 583, y: 37});
        this.timer_box.addChild(new Bitmap({
            width: 110, height: 110,
            skin: ImgLoader.getInstance().getImg('times_bg_png')
        }));
        this.timer_box.addChild(new TextField({
            x:52,y:52,
            text: this.getParams(this.level,3),
            size: 50
        }), 'timetext');
        this.layout.addChild(this.timer_box);
        //try-label 绘制
        if(this.gameModel === 1){
            this.try_label = new Bitmap({
                x: 586,
                y: 172,
                width: 106, height: 29,
                skin: ImgLoader.getInstance().getImg('game_try_png')
            });
            this.layout.addChild(this.try_label);
        }
        //piece 堆块绘制
        this.pieces = new DisplayContainer({x: 41, y: 148});
        this.layout.addChild(this.pieces);
        //floor 绘制
        this.floor =  new Bitmap({
            x:101, y:1115,
            width: 548, height: 42,
            skin: ImgLoader.getInstance().getImg('piece_floor_png')
        });
        this.layout.addChild(this.floor);
        //piece 绘制
        let piece = new Bitmap({
            width: PieceW, height: PieceH,
            skin: ImgLoader.getInstance().getImg('piece_' + Math.floor(Math.random() * 7 + 1) + '_png')
        });
        this.piece = new Piece(piece,POINTS);
        this.layout.addChild(this.piece);
        //bollet 绘制
        let bollet = new Bitmap({
            width: PlayerW, height: PlayerH,
            skin: ImgLoader.getInstance().getImg('bollet_png')
        });
        this.bottle = new Player(bollet,POINTS,this.normalResults,this.gameOver,this);
        this.layout.addChild(this.bottle);
        //mask 绘制
        let mask =  new Bitmap({
            x:0, y:971,
            width: 750, height: 363,
            skin: ImgLoader.getInstance().getImg('main_bottom_mask_png')
        });
        this.layout.addChild(mask);
    }
    
    private getParams(...args) {
        for (let _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        let argsLen = args.length;
        if (argsLen === 0) {
            return PARAMETERS;
        }
        else if (argsLen === 1 && typeof args[0] === 'number') {
            return PARAMETERS['level_' + args[0]];
        }
        else if (argsLen === 1 && typeof args[0] === 'string') {
            return PARAMETERS[args[0]];
        }
        else if (argsLen === 2 && typeof args[0] === 'number') {
            return PARAMETERS['level_' + args[0]][args[1]];
        }
        else if (argsLen === 2 && typeof args[0] === 'string') {
            return PARAMETERS[args[0]][args[1]];
        }
        else if (argsLen === 3) {
            return PARAMETERS['level_' + args[0]][args[1]][args[2]]
        }
    }

    private reSize(width, height, canvas) {
        this.layout.width = width;
        this.layout.height = height;
        let a = this.layout.width / this.layout.height;
        let b = canvas.width / canvas.height;
        if (a > b) {
            this.layout.scaleX = this.layout.scaleY = (canvas.width / this.layout.width).toFixed(4);
            this.layout.y = Math.round((canvas.height - this.layout.height * this.layout.scaleY) / 2);
            this.layout.x = 0;
        } else {
            this.layout.scaleX = this.layout.scaleY = (canvas.height / this.layout.height).toFixed(4);
            this.layout.x = Math.round((canvas.width - this.layout.width * this.layout.scaleX) / 2);
            this.layout.y = 0;
        }
    };
}