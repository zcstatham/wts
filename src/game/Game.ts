import {Player} from "./Player";
import {Bitmap, DisplayContainer, ImgLoader, Shape, TextField, Tick} from "./app";
import {PARAMETERS, PieceH, PieceW, PlayerH, PlayerW, POINTS, STAGEH, STAGEW} from "./GameData";
import {Piece} from "./Piece";
import {ChangeLevel} from "./ChangeLevel";

const data = require('../../resource/config/default.res.json');

export class Game {
    //香水瓶
    public gameOverCallback: Function;
    public gameSuccessCallback: Function;
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
    private level_change_box: ChangeLevel;
    private game_over_box: DisplayContainer;
    private game_success_box: DisplayContainer;
    private game_try_box: DisplayContainer;
    private main_scene: DisplayContainer;
    private change_scene: DisplayContainer;

    public constructor(canvas, options) {
        this.canvas = canvas;
        this.gameSuccessCallback = options.gameSuccessCallback;
        this.gameOverCallback = options.gameOverCallback;
        this.ctx = canvas.getContext('2d');
        this.layout = new DisplayContainer();
        this.main_scene = new DisplayContainer();
        this.change_scene = new DisplayContainer();
        this.layout.addChild(this.main_scene);
        this.layout.addChild(this.change_scene);
        this.reSize(STAGEW, STAGEH, canvas);

        ImgLoader.getInstance(data);
        this.init(options);
    }

    private async init(options) {
        this.level = 1;
        this.pieceNum = this.getParams(1, 1);
        this.gameModel = options.gameModel;
        this.levelLength = 3;
        await ImgLoader.getInstance().loadGroup('preload');
        this.resetScene();

        let clickEvent = 'ontouchend' in document ? 'touchend' : 'click';
        options.layout.addEventListener(clickEvent, (event) => {
            event.preventDefault();
            let changedTouches = (event.changedTouches && event.changedTouches[0]) || event;
            let x = (changedTouches.pageX - this.layout.x) / this.layout.scaleX;
            let y = (changedTouches.pageY - this.layout.y) / this.layout.scaleY;
            let target = this.getTapTarget(x, y, this.main_scene);
            if (target && target.func) {
                target.func();
                return;
            }
            if(!this.isCanTap){
                return;
            }
            if (this.bottle.isJump || this.bottle.isDrop) {
                return
            } else {
                this.bottle.isJump = true;
            }
        });
        this.tick = new Tick(this.updata, this);
        this.gameStart();
    }

    private getTapTarget(x, y, container) {
        let lth = container.children.length;
        for (let i = lth - 1; i >= 0; i--) {
            let item = container.children[i],
                ileft = item.x,
                itop = item.y,
                iwidth = item.width || item.swidth,
                iheight = item.height || item.sheight,
                iright = ileft + iwidth,
                ibottom = itop + iheight;
            if (item.children && item.children.length > 0 && item.canTouchenable) {
                let ix = (x - item.x) / item.scaleX;
                let iy = (y - item.y) / item.scaleY;
                return this.getTapTarget(ix, iy, item);
            } else if (ileft < x && iright > x && itop < y && ibottom > y && item.canTouchenable) {
                return item
            }
        }
    }

    public gameStart() {
        this.level = 1;
        this.times = this.getParams(1, 3);
        this.isPause = false;
        this.isOver = false;
        this.tick.start();
        this.levelSuccessHandle();
    }

    public gamePause(){
        this.isCanTap = false;
        this.isPause = true;
    }

    public gameContinue() {
        this.isPause = false;
        this.isCanTap = true;
        if (this.isOver) {
            this.resetScene();
            this.isOver = false;
        }
        // this.audioPlay(this.audios.back_music);
    }

    public gameOver() {
        //画结束
        let rect = new Shape({
                x: 0, y: 0,
                width: STAGEW, height: STAGEH,
                fillStyle: "rgba(0,0,0,0.6)"
            }),
            box = new Bitmap({
                x: 115, y: 400,
                width: 525, height: 572,
                skin: ImgLoader.getInstance().getImg('game_over_box_png')
            }),
            btn = new Bitmap({
                x: 203, y: 817,
                width: 340, height: 116,
                skin: ImgLoader.getInstance().getImg('game_over_btn_png'),
            });
        btn['func'] = this.gameOverCallback;
        btn['canTouchenable'] = true;
        this.game_over_box.addChild(rect);
        this.game_over_box.addChild(box);
        this.game_over_box.addChild(btn);
        this.game_over_box.canTouchenable = true;
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

    public normalResults() {
        console.log(1);
        //pieces +1 左右界限
        if (this.pieces.children.length == 0) {
            this.pieces['leftx'] = this.piece.container.x;
            this.pieces['rightx'] = this.piece.container.x + this.piece.container.width;
        } else if (this.pieces.children.length > 0) {
            let a = this.pieces['leftx'] - this.piece.container.x;
            if (a > 3) {
                this.pieces['rightx'] -= a;
            } else if (a < -3) {
                this.pieces['leftx'] -= a;
            }
        }
        let swidth = Math.floor(this.pieces['rightx'] - this.pieces['leftx']),
            sx = Math.floor((PieceW - swidth) / 2);
        let new_piece = new Bitmap({
            x: this.pieces['leftx'],
            y: this.piece.container.y,
            sx: sx, sy: 0,
            swidth: swidth, sheight: PieceH,
            skin: ImgLoader.getInstance().getImg(this.piece.skin.skin.name)
        });
        this.pieces.addChild(new_piece);
        this.piece_box.removeChildAt(this.piece_box.children.length - 1);
        //初始化piece 宽
        let name = 'piece_' + Math.floor(Math.random() * 7 + 1) + '_png';
        let piece = new Bitmap({
            sx: sx,
            sy: 0,
            swidth: swidth,
            sheight: PieceH,
            name: name,
            skin: ImgLoader.getInstance().getImg(name)
        });
        this.piece.reset({
            skin: piece,
            points: [[0, 0], [swidth, 0], [swidth, PieceH], [0, PieceH]]
        });
        if (this.pieces.children.length >= this.pieceNum) {
            this.nextLevel();
        }
    }

    public updata() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.isPause && !this.isOver) {
            if (this.bottle.isJump) {
                let bottle = this.bottle;
                let piece = this.piece;
                /*碰撞检测START*/
                if (bottle.container.y >= piece.container.y - PlayerH &&
                    bottle.container.y <= piece.container.y + PieceH &&
                    piece.container.x >= STAGEW / 2 - piece.container.width - PlayerW / 2 &&
                    piece.container.x <= STAGEW / 2 + PlayerW / 2
                ) {
                    console.log('碰撞检测');
                    // console.log(bottle.polygon.points);
                    // console.log(piece.polygon.points)
                    if (bottle.jumpDirection === 'up') {
                        let direction = [];
                        direction[0] = piece.direction;
                        direction[1] = 1;
                        bottle.drop(direction);
                        piece.isAuto = false;
                    } else if (bottle.jumpDirection === 'down') {
                        if ((//香水与块体左右侧碰撞
                                //  p.y- b.h <= b.y <= p.y + p.h
                                // 且 (b.x <= p.x <= b.x + b.w 或 b.x <= p.x + p.w <= b.x + b.w）
                                bottle.container.y > piece.container.y - bottle.container.height &&
                                bottle.container.y < piece.container.y + piece.container.height) && ((
                                piece.container.x >= bottle.container.x &&
                                piece.container.x <= bottle.container.x + bottle.container.width) || (
                                piece.container.x + piece.container.width >= bottle.container.x &&
                                piece.container.x + piece.container.width <= bottle.container.x + bottle.container.width
                            ))) {
                            let dir = piece.container.x >= bottle.container.x? -5 : 5;
                            bottle.drop([piece.direction, 1, dir]);
                            piece.isAuto = false;
                        } else if (//左侧跌落
                        //  p.y = b.y + b.h 且 b.x <= p.x <= b.x + b.w
                        Math.floor(bottle.container.y + bottle.container.height) === Math.floor(+piece.container.y) &&
                        bottle.container.x <= piece.container.x &&
                        bottle.container.x + bottle.container.width >= piece.container.x
                        ) {
                            bottle.drop([-1, 1, -5]);
                            piece.isAuto = false;
                        } else if (//右侧跌落
                        //  p.y = b.y + b.h 且 b.x <= p.x + p.w <= b.x + b.w
                        Math.floor(bottle.container.y + bottle.container.height) === Math.floor(+piece.container.y) &&
                        bottle.container.x <= piece.container.x + piece.container.width &&
                        bottle.container.x + bottle.container.width >= piece.container.x + piece.container.width
                        ) {
                            bottle.drop([1, 1, 5]);
                            piece.isAuto = false;
                        } else {//成功
                            piece.down();
                            bottle.down();
                        }
                    }
                }
            }
        }
        this.layout.paint(this.ctx);
    }

    private levelSuccessHandle() {
        this.isOver = true;
        if ((Number(this.gameModel) === 1 && this.level < 3) || (Number(this.gameModel) === 2 && this.level < 4)) {
            let ox = this.level == 1? -1:-STAGEW;
            let level_change = new Bitmap({
                x:ox, y: 0,
                width: STAGEW, height: STAGEH,
                skin: ImgLoader.getInstance().getImg('level_to_' + this.level + '_jpg')
            });
            this.level_change_box = new ChangeLevel(level_change, this);
            this.change_scene.addChild(this.level_change_box);
        } else {
            this.gamePass();
        }
    }

    private gamePass() {
        let name = this.gameModel == 1 ? 'try' : 'success',
            rect = new Shape({
                x: 0, y: 0,
                width: STAGEW, height: STAGEH,
                fillStyle: "rgba(0,0,0,0.6)"
            }),
            box = new Bitmap({
                x: name == 'try' ? 115 : 24,
                y: name == 'try' ? 400 : 257,
                width: name == 'try' ? 525 : 702,
                height: name == 'try' ? 572 : 655,
                skin: ImgLoader.getInstance().getImg('game_' + name + '_box_png')
            }),
            btn = new Bitmap({
                x: name == 'try' ? 203 : 207,
                y: name == 'try' ? 817 : 971,
                width: name == 'try' ? 340 : 344,
                height: name == 'try' ? 116 : 110,
                skin: ImgLoader.getInstance().getImg('game_' + name + '_btn_png'),
            });
        btn['func'] = this.gameSuccessCallback;
        btn['canTouchenable'] = true;
        this['game_' + name + '_box'].addChild(rect);
        this['game_' + name + '_box'].addChild(box);
        this['game_' + name + '_box'].addChild(btn);
        this['game_' + name + '_box'].canTouchenable = true;
        return btn;
    }

    private gameOverHandle(level: number) {
        this.isOver = true;
        this.isCanTap = false;
        clearInterval(this.time_down);
        this.tick.stop();
    }

    private resetScene() {
        this.main_scene.children = [];
        this.main_scene.addChild(new Bitmap({
            width: 750,
            height: 1334,
            skin: ImgLoader.getInstance().getImg('main_bg_jpg')
        }), 'main_bg');
        //level-label 绘制
        this.level_box = new DisplayContainer({x: 41, y: 44});
        for (let i = 0; i < this.levelLength; i++) {
            let skin;
            if (this.level >= i + 1) {
                skin = ImgLoader.getInstance().getImg('level_' + (i + 1) + '_icon_active_png');
            } else if (this.gameModel === 1 && i + 1 === this.levelLength) {
                skin = ImgLoader.getInstance().getImg('level_icon_lock_png');
            } else {
                skin = ImgLoader.getInstance().getImg('level_' + (i + 1) + '_icon_png');
            }
            this.level_box.addChild(new Bitmap({
                x: i * 87, y: 0,
                width: 60, height: 60,
                skin: skin
            }));
        }
        this.main_scene.addChild(this.level_box);
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
        this.main_scene.addChild(this.piece_box);
        //times-label 绘制
        this.timer_box = new DisplayContainer({x: 583, y: 37});
        this.timer_box.addChild(new Bitmap({
            width: 110, height: 110,
            skin: ImgLoader.getInstance().getImg('times_bg_png')
        }));
        this.timer_box.addChild(new TextField({
            x: 52, y: 52,
            text: this.getParams(this.level, 3),
            size: 50
        }), 'timetext');
        this.main_scene.addChild(this.timer_box);
        this.time_down = setInterval(() => {
            --this.times;
            this.timer_box.getChildByName('timetext').text = this.times;
            if (Number(this.times) === 0) {
                this.gameOver.call(this);
            }
        }, 1000);
        //try-label 绘制
        if (this.gameModel === 1) {
            this.try_label = new Bitmap({
                x: 586,
                y: 172,
                width: 106, height: 29,
                skin: ImgLoader.getInstance().getImg('game_try_png')
            });
            this.main_scene.addChild(this.try_label);
        }
        //floor 绘制
        this.floor = new Bitmap({
            x: 101, y: 1115,
            width: 548, height: 42,
            skin: ImgLoader.getInstance().getImg('piece_floor_png')
        });
        this.main_scene.addChild(this.floor);
        //piece 堆块绘制
        this.pieces = new DisplayContainer();
        this.main_scene.addChild(this.pieces);
        //piece 绘制
        let name = 'piece_' + Math.floor(Math.random() * 7 + 1) + '_png';
        let piece = new Bitmap({
            width: PieceW, height: PieceH,
            name: name,
            skin: ImgLoader.getInstance().getImg(name)
        });
        this.piece = new Piece(piece, POINTS);
        this.main_scene.addChild(this.piece);
        //bollet 绘制
        let bollet = new Bitmap({
            width: PlayerW, height: PlayerH,
            skin: ImgLoader.getInstance().getImg('bollet_png')
        });
        this.bottle = new Player(bollet, POINTS, this.normalResults, this.gameOver, this);
        this.main_scene.addChild(this.bottle);
        //mask 绘制
        let mask = new Bitmap({
            x: 0, y: 971,
            width: 750, height: 363,
            skin: ImgLoader.getInstance().getImg('main_bottom_mask_png')
        });
        this.main_scene.addChild(mask);
        this.game_over_box = new DisplayContainer();
        this.game_success_box = new DisplayContainer();
        this.game_try_box = new DisplayContainer();
        this.main_scene.addChild(this.game_over_box);
        this.main_scene.addChild(this.game_success_box);
        this.main_scene.addChild(this.game_try_box);
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