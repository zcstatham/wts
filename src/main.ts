/**
 * Created by Administrator on 2018/12/2.
 */
import {ImgLoader} from "./game/app";

const data = require('../resource/config/default.res.json');
let a = new ImgLoader(data);
async function ab(){
    console.log(0);
    await a.loadGroup('preload');
    console.log(5);
    document.body.innerHTML = a.getImg('shareindex');
}
ab();