/* div: 工具篇 */
/**
 * 深度复制
 * @param {*} source 被复制的对象
 * @param {true,false} isArray 如果是数组输入true, 默认是对象
 * @returns 复制成功的对象
 */
function deepCopy(source, isArray = false) {
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
/**
 * 取两个数字中较小的那个返回
 * @param {*} a 
 * @param {*} b 
 * @returns 返回最小值
 */
function getMin(a, b) {
    return a > b ? b : a;
}

/* div: 参数声明 */
// Set the canvas
const cvs = document.getElementById("canvas_1");
const ctx = cvs.getContext("2d");

const cvs_w = cvs.width,
    cvs_h = cvs.height,
    w = cvs_w / setting.width,
    h = cvs_h / setting.height;

// Load img & audio
// let imageName = new Image();
// imageName.src = "./pic/apple.png"
// let audioName = new Audio();
// audioName.src = "./audio/bgmusic.mp3";
// audioName.play();

/* div: 作图工具 */

/**
 * 画一个圆圈, 以(X,Y)为中心
 * @param {*} x 
 * @param {*} y 
 * @param {*} radius 
 * @param {true,false} fillCircle true会填充圆圈(不带边框), false只画出轮廓
 */
function drawCircle(x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    if (fillCircle) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
}

/**
 * 画一个实心的苹果, 在方格内
 * @param {*} X 
 * @param {*} Y 
 * @param {setting.appleColor} appleColor 苹果的颜色
 */
function drawApple(X, Y, appleColor) {
    ctx.fillStyle = appleColor;
    drawCircle((X + .5) * w, (Y + .5) * h, getMin(w, h) / 2, true);
    ctx.strokeStyle = "#000";
    drawCircle((X + .5) * w, (Y + .5) * h, getMin(w, h) / 2, false);
}

/**
 * 
 * @param {*} X 
 * @param {*} Y 
 * @param {*} color 
 */
function drawSquare(X, Y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(X * w, Y * h, w, h);
}

/* div: 核心函数 */

// 创建 map,snake,apple
var map = [], snake = [], apple = { x: 0, y: 0 };

// 检查碰撞, 返回碰撞结果
function checkCollasion() {
    
}

/**
 * 初始化地图
 */
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


/**
 * 把map数组渲染出来
 */
function drawMap() {
    for (let i = 0; i < setting.width; i++) {
        for (let j = 0; j < setting.height; j++) {
            map[i][j]// TODO:渲染出来
        }
    }

}

//渲染主循环
function clarity() {
    //检查按照移动方向的下一步的collation
    let result = checkCollasion();
    switch (result) {
        //没事儿先退
        case 0:
            break;
        //吃到苹果就算分, 并且刷新苹果位置
        case 1:
            changeScore(1);//接受正数的时候要考虑分数加倍的情况
            generateApple();
            break;
        //collation就结束
        //对应不同的result做不同的ending(例如死亡分类计数)

    }
    //改变代表蛇的数组信息
    moveSnake();
    //初始化地图数组
    refreshMap();
    //把蛇和苹果的位置到map数组中
    //先把地图擦干净
    // ctx.clearRect(0, 0, cvs_w, cvs_h);
    //把map数组渲染出来
    drawMap();
}