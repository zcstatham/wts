/**
 * Created by Administrator on 2018/12/2.
 */
import {Game} from "./game/Game";
const wx = require("wx");
const box = document.getElementById("stage_box");
let request = getRequest();
if (Object.keys(request).length) {
    if (!request.hasOwnProperty('gameId') || !request.hasOwnProperty('rt') || !request.hasOwnProperty('orderId')) {
        request = {rt: 1, gameId: 1, orderId: 0}
    }
} else {
    request = {rt: 1, gameId: 1, orderId: 0}
}


window.onload = (event)=>{
    let canvas = document.createElement("canvas");
    canvas.id = "stage";
    box.appendChild(canvas);

    window.onresize = (event)=> {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // if (Object.keys(request).length) {
    //     if (!request.hasOwnProperty('gameId') || !request.hasOwnProperty('rt') || !request.hasOwnProperty('orderId')) {
    //         request = {
    //             rt: 1,
    //             gameId: 1,
    //             orderId: 0
    //         }
    //     }
    // } else {
    //     request = {
    //         rt: 1,
    //         gameId: 1,
    //         orderId: 0
    //     }
    // }
    new Game(canvas, {
        layout: canvas,
        gameModel: 2,
        gameSuccessCallback: function(){
            if (!window['__wxjs_environment']) {
                window.location.reload();
            } else {
                if (Number(request['gameId']) === 1) {
                    wx.miniProgram.navigateBack();
                }else{
                    wx.miniProgram.getEnv(function (res) {
                        if (res.miniprogram) {
                            let info = {
                                game_id: 2,
                                orderId: request['orderId'],
                                level: 3,
                                results: request['rt']
                            };
                            let json = JSON.stringify(info);
                            wx.miniProgram.postMessage({data: json});
                        }
                    });
                    setTimeout(function () {
                        wx.miniProgram.switchTab({
                            url: '../user/index'
                        });
                    }, 500)
                }
            }
        },
        gameOverCallback: function () {
            if (!window['__wxjs_environment']) {
                window.location.reload();
            } else {
                wx.miniProgram.getEnv(function (res) {
                    if (res.miniprogram) {
                        let info = {
                            game_id: this.gameModel,//参数一
                            orderId: request['orderId'],
                            level: this.levelLength,//参数二
                            results: 0//参数二
                        };
                        let json = JSON.stringify(info);
                        wx.miniProgram.postMessage({data: json});
                    }
                });
                setTimeout(function () {
                    wx.miniProgram.navigateBack();
                }, 500)
            }
        }
    })
};

function getRequest() {
    let url = location.search; //获取url中"?"符后的字串
    let theRequest = {};
    if (url.indexOf("?") !== -1) {
        let strs = url.substr(1).split("&");
        for (let i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}