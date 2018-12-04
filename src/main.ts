/**
 * Created by Administrator on 2018/12/2.
 */
import {Game} from "./game/Game";

const box = document.getElementById("stage_box");

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
        layout: document.body,
        gameModel: 1
    });
};