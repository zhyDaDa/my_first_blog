//深度复制
var deepCopy = function (source, isArray) {
    var result = {};
    if (isArray) var result = [];
    for (var key in source) {
        if (Object.prototype.toString.call(source[key]) === '[object Object]') {
            result[key] = deepCopy(source[key]);
        } if (Object.prototype.toString.call(source[key]) === '[object Array]') {
            result[key] = deepCopy(source[key], 1);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

//Set teh canvas
const cvs = document.getElementById("canvas_1");
const ctx = cvs.getContext("2d");

var cvs_w = cvs.width,
    cvs_h = cvs.height,
    w = cvs_w / setting.width,
    h = cvs_h / setting.height,
    appleColor = setting.appleColor;

//Load img & audio
let imageName = new Image();
imageName.src = "./pic/apple.png"
let audioName = new Audio();
audioName.src = "./audio/bgmusic.mp3";
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
}

function drawApple(X, Y, appleColor) {
    ctx.fillStyle = appleColor;
    drawCircle(X * w, Y * h, (X + Y) / 4, true);
}

//Draw Rectangle
function drawSquare(X, Y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(X * w, Y * h, w, h);
}

//Creat a map with array
var map = [];

//Refresh the map 清空地图数组的函数
function refreshMap() {
    for (let i = 0; i < setting.width; i++) {
        map[i] = [];
        for (let j = 0; j < setting.height; j++) {
            map[i][j] = {
                occupy: 0,  //0代表空, 1代表蛇头, 2代表蛇尾, 3代表苹果
                color: "transparent",
            }
        }
    }
    //如果有mode就放在这里
}

//把map数组渲染出来
function drawMap() {
    for (let i = 0; i < setting.width; i++) {
        for (let j = 0; j < setting.height; j++) {
            map[i][j]// TODO:渲染出来
        }
    }
    
}

//渲染主循环
function clarity() {
    //检查collation
    //collation就结束
    //吃到苹果就算分, 并且刷新苹果位置
    //改变代表蛇的数组信息
    //刷新地图数组
    refreshMap();
    //把这一切打印到map数组中
    //把map数组渲染出来

}