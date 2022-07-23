//深度复制
var deepCopy = function (source, isArray) {
    var result = {};            
    if(isArray) var result = [];            
    for(var key in source) {                
        if(Object.prototype.toString.call(source[key])  === '[object Object]') {
            result[key] = deepCopy(source[key])
        } if(Object.prototype.toString.call(source[key]) === '[object Array]') {
            result[key] = deepCopy(source[key],1)
        } else {
            result[key] = source[key]
        }
    }            
    return result;
}

//Set teh canvas
const cvs = document.getElementById("canvas_1");
const ctx = cvs.getContext("2d");

var cvs_w = cvs.width,
    cvs_h = cvs.height,
    w = cvs_w / setting_w,
    h = cvs_h / setting_h,
    appleColor = setting.appleColor;

//Load img & audio
let imageName = new Image();
imageName.src = "./pic/apple.png"
let audioName = new Audio();
audioName.src = "./audio/bgmusic.mp3"
//xxx.play();

//Draw apples
function drawCircle(x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    if (fillCircle) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
};
function drawApple(X, Y,appleColor) {
    ctx.fillStyle = appleColor;
    drawCircle(X * w, Y * h, (X + Y) / 4, true);
}

//Draw Rectangle
ctx.fillStyle = "red";
ctx.fillRect(X, Y, Wid, Hei);


