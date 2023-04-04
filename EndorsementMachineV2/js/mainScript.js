// rawBook是一个未加工的字符串, 是书中所有信息的集合
// Book是解压后的对象, 是书中所有信息的集合
// 把rawBook丢给Book方法, 就能构造出Book这个对象(用New)
// book在Local内的储存形式是"Book1

var deepCopy = function(source, isArray) {
    var result = {};
    if (isArray) var result = [];
    for (var key in source) {
        if (Object.prototype.toString.call(source[key]) === '[object Object]') {
            result[key] = deepCopy(source[key])
        }
        if (Object.prototype.toString.call(source[key]) === '[object Array]') {
            result[key] = deepCopy(source[key], 1)
        } else {
            result[key] = source[key]
        }
    }
    return result;
}


// 简易的md转html
var md2html = function(md) {
    // 分别替换两个尖括号
    md = md.replace(/</gm, "&lt;");
    md = md.replace(/>/gm, "&gt;");

    // 加粗
    md = md.replace(/\*\*(.+?)\*\*/gm, "<strong>$1</strong>");

    // 代码
    md = md.replace(/\$(.+?)\$/gm, "<code>$1</code>");

    // 链接
    md = md.replace(/\[(.+?)\]\((.+?)\)/gm, "<a target='_blank' href='$2'>$1</a>");

    // 句子中间的多个空格替换为html中相同数量的空格
    md = md.replace(/  /gm, "&nbsp;&nbsp;");

    // 一级标题
    md = md.replace(/^# (.+?)$/gm, "<h1>$1</h1>");

    // 二级标题
    md = md.replace(/^## (.+?)$/gm, "<h2>$1</h2>");

    // 三级标题
    md = md.replace(/^### (.+?)$/gm, "<h3>$1</h3>");

    // 其余的行前后加上p标签, 如果一行的末尾有2个空格则在末尾加上<br>
    md = md.replace(/^(.+?)$/gm, "<p>$1</p>");
    md = md.replace(/<p>(.+?)  <\/p>/gm, "<p>$1</p><br>");

    return md;

}


/**
 * 设置, 具体设置的值在settings中
 */
const SETTING = {
    settings: {
        lastBookID: 0,
        lastBookName: "",
        poolSize: 5,
        start_showTutorial: true,
        start_showSentence: false,
        start_rememberLastBook: false,
        theme_color: 0,
    },
    colors: [
        //[light,deep]
        ["#FBA3A3", "#C95758"],
        ["#DA4453", "#89216B"],
        ["#f7b733", "#fc4a1a"],
        ["#E29587", "#D66D75"],
        ["#a8c0ff", "#3f2b96"],
        ["#56CCF2", "#2F80ED"],
        ["#F2C94C", "#F2994A"],
        ["#B2FEFA", "#0ED2F7"],
        ["#00c6ff", "#0072ff"],
        ["#6dd5ed", "#2193b0"],
        ["#", "#"],
        ["#", "#"],
    ],
    ApplySetting: () => {
        let lightColor = SETTING.colors[SETTING.settings.theme_color][0];
        let deepColor = SETTING.colors[SETTING.settings.theme_color][1];
        document.documentElement.style.setProperty("--color-light", lightColor);
        document.documentElement.style.setProperty("--color-deep", deepColor);
        // document.documentElement.style.setProperty("--color-lighter", adjustLightness(lightColor, 1.2));
        // document.documentElement.style.setProperty("--color-deeper", adjustLightness(deepColor, 0.8));

    },
    GetSettingsFromLocalStorageThenApply: () => {
        let s = localStorage.getItem("settings");
        try {
            SETTING.settings = deepCopy(JSON.parse(s), false);
            $("#setting_1")[0].checked = SETTING.settings.start_rememberLastBook;
            $("#setting_2")[0].checked = SETTING.settings.start_showSentence;
            $(".setting-color-grid[value=" + SETTING.settings.theme_color + "]")[0].checked = true;
            $("#stepper-input__input")[0].value = SETTING.settings.poolSize ? SETTING.settings.poolSize : SETTING.settings = 5;

            SETTING.ApplySetting();
        } catch {
            console.log("读入设置失败, 可能是没有存储或格式错误, 已完成设置初始化");
            SETTING.settings = {
                lastBookID: 0,
                lastBookName: "",
                start_showTutorial: true,
                start_showSentence: false,
                start_rememberLastBook: false,
                poolSize: 5,
                theme_color: 0,
            };
            SETTING.SaveSettingsToLocalStorage();
            SETTING.GetSettingsFromLocalStorageThenApply();
        }
    },
    SaveSettingsToLocalStorage: () => {
        localStorage.setItem("settings", JSON.stringify(SETTING.settings));
    },
}

/**
 * 书架
 */
const BOOKS = {
    books: [],
    GetBooksFromLocalStorage: () => {
        let s = localStorage.getItem("books");
        if (!s) {
            console.log("存储中没有书");
            return false;
        }
        BOOKS.books = JSON.parse(s);
        BOOKS.RefreshBookGridPannel();
    },
    SaveBooksIntoLocalStorage: () => {
        localStorage.setItem("books", JSON.stringify(BOOKS.books));
    },
    RefreshBookGridPannel: () => {
        let pannel = $(".book-grid-pannel")[0];
        pannel.innerHTML = '';
        let htmlString = '';
        for (let i = 0; i < BOOKS.books.length; i++) {
            let book = BOOKS.books[i],
                bookName = book.name,
                bookId = i;
            htmlString += `<input class="checkbox" type="radio" name="book" id="book-` + bookId + `"><label class="for-checkbox" for="book-` + bookId + `"><div data-hover="` + bookName + `">` + bookName + `</div></label>`;
        }
        pannel.innerHTML = htmlString;
        $(".book-grid-pannel input").click(function() {
            let iii = $(".book-grid-pannel input").get();
            for (let i = 0; i < iii.length; i++) {
                const input = iii[i];
                if (!input.checked) continue;
                CURRENT.OpenBookByBookID(i);
                break;
            }
        });
    },
    GetBookCount: () => { return BOOKS.books.length; },
}

/**
 * 构造Book的方法, 得到一个Book对象
 * @param {string} rawBook 包含这本辞书所有信息的未加工的字符串
 */
function Book(rawBook = '{}') {
    let book_obj = JSON.parse(rawBook);
    this.name = book_obj.name || "无名辞书";
    this.mode = book_obj.mode || "填空类型";
    this.lastEdit = Number(book_obj.time) || Date.now();
    this.rawContent = book_obj.rawContent || "^^question##answer";
    this.wordCount = Number(this.rawContent.length) || 0;
    this.contentArray = GetModeByModeName(this.mode).DealContent(this.rawContent) || [
        ["question", "answer"]
    ];
}

/**
 * 相当于全局对象, 表示当前的状态  
 * 还有LoadBook的功能
 */
const CURRENT = {
    bookId: 0,
    bookName: "",
    mode: "",
    lastEdit: 0,
    wordCount: 0,
    contentArray: "",
    rawContent: "",
    question: "",
    questionId: 0,
    // questionList是所有问题的索引的数组
    questionPool: [],
    // rateList是部分问题出现频率的数组
    rateList: [],
    answer1: "",
    answer2: "",

    /**
     * 把一个BOOK装载到CURRENT中
     * @param {*} book 一个BOOK对象
     */
    LoadBook: (book, id) => {
        CURRENT.bookId = id;
        CURRENT.bookName = book.name;
        CURRENT.mode = book.mode;
        CURRENT.lastEdit = book.lastEdit;
        CURRENT.wordCount = book.wordCount;
        CURRENT.contentArray = book.contentArray;
        CURRENT.rawContent = book.rawContent;
        let tr = $("tr#book-info-display>td").get();
        tr[0].innerText = CURRENT.bookName;
        tr[1].innerText = CURRENT.mode;
        let d = new Date(parseInt(CURRENT.lastEdit));
        tr[2].innerText = (d).toLocaleDateString() + " " + (d).toLocaleTimeString();
        tr[3].innerText = CURRENT.wordCount;
    },

    /**
     * 从Books的books中按序号找到对应的书, 并导入CURRENT中, 相当于获得了全部信息
     * @param {int} bookId BOOK.books中的下标
     */
    OpenBookByBookID: (bookId = 0) => {
        let book = BOOKS.books[bookId];
        if (BOOKS.GetBookCount == 0 || !book) {
            console.log("书架上没有书");
            return false;
        }
        CURRENT.LoadBook(book, bookId);
        $("input[name='book']")[bookId].checked = true;
        GLOBAL.flag_showAnswer = false;
        GLOBAL.ShowQA();
        SETTING.settings.lastBookID = bookId;
        SETTING.SaveSettingsToLocalStorage();
        return true;
    },

    /**
     * "多背几遍按钮"点击事件, 让当前问题的索引(questionId)在questionPool中的出现频率增加, 登记到rateList中
     */
    AddRate: () => {
        let rate = CURRENT.rateList[CURRENT.questionId];
        if (rate == undefined) {
            CURRENT.rateList[CURRENT.questionId] = 1.2;
        } else {
            CURRENT.rateList[CURRENT.questionId] += .2;
        }
        GLOBAL.DisplayQuestionRate();
    },

    /**
     * "少背几遍按钮"点击事件, 让当前问题的索引(questionId)在questionPool中的出现频率减少, 登记到rateList中
     */
    SubRate: () => {
        let rate = CURRENT.rateList[CURRENT.questionId];
        if (rate == undefined) {
            CURRENT.rateList[CURRENT.questionId] = .8;
        } else {
            CURRENT.rateList[CURRENT.questionId] -= .2;
        }
        GLOBAL.DisplayQuestionRate();
    },
};


//#region div: 实际功能实现
/**
 * 得到target这个element
 * @returns target元素
 */
function GetTarget() {
    return $(".target")[0];
}

/**
 * 得到输入框rectify_3这个element
 * @returns rectify_3元素
 */
function GetRectify3() {
    return $('#rectify_3')[0];
}

function generatePattern(str) {
    // 将字符串转换为16进制
    let hex = '';
    for (let i = 0; i < str.length; i++) {
        hex += str.charCodeAt(i).toString(16);
    }

    // 创建canvas元素
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    let tds = $("tr#book-info-display>td").get();
    tds[5].innerHTML = "";
    tds[5].appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // 绘制图案
    for (let i = 0; i < hex.length; i += 6) {
        const x = parseInt(hex.substr(i, 1), 16) * canvas.width / 16;
        const y = parseInt(hex.substr(i + 2, 1), 16) * canvas.height / 16;
        const r = parseInt(hex.substr(i + 4, 1), 16);
        const color = '#' + hex.substr(i + 5, 3);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }
}

/**
 * 获取辞书类型
 * @param {"填空类型"|"选择类型"} modeName 辞书的类型
 * @returns {Object} 那个类型对应的类型处理对象
 */
function GetModeByModeName(modeName) {
    switch (modeName) {
        case "填空类型":
            return MODE_FillingTheBlank;
        case "选择类型":
            return MODE_Choosing;

        default:
            console.log("在获取辞书类型时出错, 传入的错误的辞书类型是: " + modeName);
            return null;
    }
}

/**
 * 关于表格式录入
 */
const PANEL = {
    getPanel: () => { return document.getElementById("panel") },
    getTable: () => { return PANEL.getPanel().querySelector("table") },
    getAddRowButton: () => { return PANEL.getPanel().querySelector("#add-row") },
    getDeletRowButton: () => { return PANEL.getPanel().querySelector("#delet-row") },
    getSaveDataButton: () => { return PANEL.getPanel().querySelector("#save-data") },
    getCLoseButton: () => { return PANEL.getPanel().querySelector("#close-panel") },
    // 显示全屏面板
    showPanel: () => {
        PANEL.getPanel().classList.add("show");
    },

    // 隐藏全屏面板
    hidePanel: () => {
        PANEL.getPanel().classList.remove("show");
    },

    // 添加新行
    addRow: () => {
        var newRow = document.createElement("tr");
        newRow.innerHTML = "<td contenteditable='true'></td><td contenteditable='true'></td>";
        PANEL.getTable().querySelector("tbody").appendChild(newRow);
    },

    // 删除所有空的行
    deletRow: () => {
        var rows = PANEL.getTable().querySelectorAll("tbody tr");
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var tds = row.querySelectorAll("td");
            if (tds[0].innerText == "" && tds[1].innerText == "") {
                row.remove();
            }
        }
    },

    // 载入数据
    loadData: (data) => {
        // 用正则实现
        let pat = /\^\^(.+?)\#\#(.+?)((?=[\^\n]|\/\/)|$)/g;
        // 第一组是题目, 第二组是答案
        // 对应填入每一行的两列中
        let rows = [];
        let match;
        while (match = pat.exec(data)) {
            rows.push([match[1], match[2]]);
        }


        // 去除空元素
        rows = rows.filter(function(row) {
            return row.length > 1;
        });

        // 获取表格元素
        var table = PANEL.getTable();

        // 清空表格
        table.querySelector("tbody").innerHTML = "";

        // 将二维数组转换为HTML字符串, 添加到表格末尾 
        table.querySelector("tbody").innerHTML += rows.map(function(row) {
            return "<tr><td contenteditable='true'>" + row[0] + "</td><td contenteditable='true'>" + row[1] + "</td></tr>";
        }).join("");


    },

    // 保存数据
    saveData: () => {
        var data = [];

        // 遍历每一行
        PANEL.getTable().querySelectorAll("tbody tr").forEach(function(row) {
            var rowData = [];

            // 遍历每一列
            row.querySelectorAll("td").forEach(function(cell) {
                rowData.push(cell.innerHTML);
            });

            // 如果该行的两个单元格都为空，则不保存该行数据
            if (rowData.every(function(value) { return value.trim() === "" })) {
                return;
            }

            data.push(rowData);
        });

        // 将二维数组中的每一行用^^连接，每一列用##连接，组成一个字符串
        data = data.map(function(row) {
            return row.join("##");
        }).join("^^");

        // data最前面也要加上^^
        data = "^^" + data;

        GetRectify3().value = data;

    }
}

/**
 * 全局变量和全局函数
 */
const GLOBAL = {
    flag_showAnswer: false,
    flag_rectify: false,

    NextQuestion: () => {
        GetModeByModeName(CURRENT.mode).SetNextQuestion();
        GetModeByModeName(CURRENT.mode).DisplayQuestion();
        this.flag_showAnswer = true;
    },
    DisplayAnswer: () => {
        GetModeByModeName(CURRENT.mode).DisplayQuestionAndAnswer();
        this.flag_showAnswer = false;
    },
    DisplayQuestionRate: () => {
        let currentRate = CURRENT.rateList[CURRENT.questionId];
        let tds = $("tr#book-info-display>td").get();
        tds[4].innerHTML = String(currentRate ? currentRate.toFixed(1) : 1);
    },
    DealDisplayString: (str) => {
        let result = str;
        // 以//开头, 行尾或^^收尾的注释, 去掉
        result = result.replace(/\/\/(.+?)(?=\^\^|$)/gm, "");
        result = result.replace(/\\n/g, "<br>");
        result = result.replace(/\\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
        // 方括号改为<strong>标签
        result = result.replace(/\[(.+?)\]/g, "<strong>$1</strong>");
        // 如果有|出现, 那么|隔开的多个答案, 以横向列表显示
        if (result.indexOf("|") != -1) {
            result = result.replace(/\|/g, "</li><li>");
            result = "<ul><li>" + result + "</li></ul>";
        }

        return result;
    },

    ShowQA: () => {

        if (!CURRENT.bookName && !CURRENT.mode) {
            let target = GetTarget();
            target.innerHTML = `没有选定的辞书!<br>快去录入辞书吧!`;
            $(".showQA-btn")[0].innerText = "选择辞书后刷新";
        }

        if (GLOBAL.flag_showAnswer) {
            GLOBAL.DisplayAnswer();
            $(".showQA-btn")[0].innerText = "再来一题";
            GLOBAL.flag_showAnswer = false;
        } else {
            GLOBAL.NextQuestion();
            $(".showQA-btn")[0].innerText = "显示答案";
            GLOBAL.flag_showAnswer = true;
        }
    },

    ConfirmLoadBook: () => {
        let rawbook = {};
        rawbook.name = $("#book-info_1")[0].value;
        rawbook.mode = $("#book-info_2")[0].value;
        rawbook.rawContent = $("#book-info_3")[0].value;
        let book = new Book(JSON.stringify(rawbook));
        BOOKS.books.push(book);
        BOOKS.SaveBooksIntoLocalStorage();
        BOOKS.RefreshBookGridPannel();
        hsycms.success();
        $("form#LoadBook")[0].reset();
        return false;
    },

    RectifyCurrentBook: () => {
        let r1 = $("#rectify_1")[0];
        let r2 = $("#rectify_2")[0];
        let r3 = $("#rectify_3")[0];
        let book = BOOKS.books[CURRENT.bookId];
        r1.value = book.name;
        r2.value = book.mode;
        r3.value = book.rawContent;
        GLOBAL.flag_rectify = false;
    },

    ConfirmRectifyBook: () => {
        if (!GLOBAL.flag_rectify) return false;
        let r1 = $("#rectify_1")[0].value;
        let r2 = $("#rectify_2")[0].value;
        let r3 = $("#rectify_3")[0].value;
        let _book = {};
        _book.name = r1;
        _book.mode = r2;
        _book.rawContent = r3;
        BOOKS.books[CURRENT.bookId] = deepCopy(new Book(JSON.stringify(_book)), false);
        BOOKS.SaveBooksIntoLocalStorage();
        BOOKS.RefreshBookGridPannel();
        CURRENT.OpenBookByBookID(CURRENT.bookId);
        $("form#RectifyBook")[0].reset();
        hsycms.success();
        return false;
    },
    ConfirmSetting: () => {
        SETTING.settings.start_rememberLastBook = $("#setting_1")[0].checked;
        SETTING.settings.start_showSentence = $("#setting_2")[0].checked;
        let aaa = $(".setting-color-grid").get();
        let value = 0;
        for (let i = 0; i < aaa.length; i++) {
            const a = aaa[i];
            if (a.checked) {
                value = a.value * 1;
                break;
            }
        }
        SETTING.settings.theme_color = value;
        SETTING.settings.poolSize = $("#stepper-input__input")[0].value;
        SETTING.SaveSettingsToLocalStorage();
        SETTING.ApplySetting();
        hsycms.success();
        return false;
    },


    DisplayTutorial: () => {
        //todo:一个遮挡层, 做任意事件就消失
    },

    DisplaySentence: () => {
        //todo:需要几个一言库, 做一个api接口
    },
}

/**
 * 这个对象聚合了和填空题有关的所有方法
 */
const MODE_FillingTheBlank = {
        DealContent: (rawContent) => {
            let Q_A = [];
            Q_A = rawContent.split("^^");
            Q_A.shift();
            let finalContent = [];
            finalContent = Q_A.map((e) => {
                let t = e.split("##");
                return [t[0], t[t.length - 1]];
            });
            return finalContent;
        },
        /**
         * 设定下一个问题和答案, 并登记到current中
         */
        SetNextQuestion: () => {
            // let ranNum = (Math.random() * (CURRENT.contentArray.length)) >> 0;

            // current的问题库(questionPool)是一个数组, 里面存放的是问题的索引
            // 先判断问题库是否为空, 如果为空, 就把问题库重置
            // 如果不为空, 就从问题库中随机取一个问题的索引
            let ranNum = 0;
            if (CURRENT.questionPool.length == 0) {
                // set_times是一个问题在问题库标准出现的次数
                const set_times = SETTING.settings.poolSize;
                // 每个索引值依据CURRENT.rateList生成的数量
                // 问题索引对应的rateList位置的值, 代表了该问题的出现概率, 小于0的值代表了该问题不出现, 大于零的值代表了该问题要出现times的次数倍, 没有值则就是times次
                // 例如rateList[20] = 1.2, 那么问题索引为20的问题, 会出现1.2*times次, 最后四舍五入取整
                CURRENT.questionPool = [];
                for (let i = 0; i < CURRENT.contentArray.length; i++) {
                    let times = 0;
                    if (CURRENT.rateList[i] > 0) times = Math.round(CURRENT.rateList[i] * times);
                    else if (CURRENT.rateList[i] <= 0) times = 0;
                    else times = set_times;
                    for (let j = 0; j < times; j++) {
                        CURRENT.questionPool.push(i);
                    }
                }
            }

            // 从问题库中随机取一个问题的索引, 并从问题库中删除该索引
            ranNum = CURRENT.questionPool.splice((Math.random() * (CURRENT.questionPool.length)) >> 0, 1)[0];
            CURRENT.questionId = ranNum;

            // 将问题和答案分别登记到current中
            CURRENT.question = CURRENT.contentArray[ranNum][0];
            CURRENT.answer1 = CURRENT.contentArray[ranNum][1];
        },
        DisplayQuestion: () => {
            let target = GetTarget(),
                question = CURRENT.question;
            // 清空target中的内容
            target.innerHTML = "";
            // 创建一个h5标签, 存在node变量中
            let node = document.createElement("h5");
            // 给h5标签添加一个class
            node.className = "question";
            // 如果问题的长度大于40, 就给h5标签添加一个class: long-question, 否则就添加一个class: short-question
            if (question.length > 40) node.classList.add("long-question");
            else node.classList.add("short-question");
            // 将问题的内容添加到h5标签中
            node.innerHTML = GLOBAL.DealDisplayString(CURRENT.question);
            // 将h5标签添加到target中
            target.appendChild(node);
            // 生成图片的标识
            generatePattern(question);
            // 显示问题出现的频次
            GLOBAL.DisplayQuestionRate();
        },
        DisplayQuestionAndAnswer: () => {
            let target = GetTarget(),
                question = CURRENT.question,
                answer = CURRENT.answer1;
            // 清空target中的内容
            target.innerHTML = "";
            // 创建一个h5标签, 存在node1变量中
            let node1 = document.createElement("h5");
            // 给h5标签添加一个class
            node1.className = "question";
            // 如果问题的长度大于40, 就给h5标签添加一个class: long-question, 否则就添加一个class: short-question
            if (question.length > 40) node1.classList.add("long-question");
            else node1.classList.add("short-question");
            // 将问题的内容添加到h5标签中
            node1.innerHTML = GLOBAL.DealDisplayString(CURRENT.question);
            // 将h5标签添加到target中
            target.appendChild(node1);

            // 创建一个h7标签, 存在node2变量中
            let node2 = document.createElement("h7");
            node2.className = "answer";
            if (answer.length > 40) node2.classList.add("long-answer");
            else node2.classList.add("short-answer");
            node2.innerHTML = GLOBAL.DealDisplayString(CURRENT.answer1);
            target.appendChild(node2);
        },

    }
    //#endregion


/**
 * Div: main函数
 * 初始化成功就运行, 完成所有初始化
 */
function main() {
    // 将存储中的书导出到BOOKS
    BOOKS.GetBooksFromLocalStorage();
    // 将存储中的设置导出到SETTINGS.setting并应用
    SETTING.GetSettingsFromLocalStorageThenApply();
    // 按照SETTINGS打开最近看的辞书或者有设置过的初始辞书
    CURRENT.OpenBookByBookID(SETTING.settings.start_rememberLastBook ? SETTING.settings.lastBookID : 0);
    // 显示帮助
    // if (SETTING.settings.start_showTutorial) GLOBAL.DisplayTutorial();
    // else if (SETTING.settings.start_showSentence) GLOBAL.DisplaySentence();
    // else GLOBAL.NextQuestion();

    // GLOBAL.ShowQA();

    // Theme自带的一些控件
    $('div.set').click(function() {
        $('div.content').addClass('show');
        $('div').removeClass('pagevis');

        if ($(this).is('#set1')) {
            $('div#page1').addClass('pagevis').siblings('div').removeClass('pageVis');
        } else if ($(this).is('#set2')) {
            $('div#page2').addClass('pagevis').siblings('div').removeClass('pageVis');
        } else if ($(this).is('#set3')) {
            $('div#page3').addClass('pagevis').siblings('div').removeClass('pageVis');
        } else {
            $('div#page4').addClass('pagevis').siblings('div').removeClass('pageVis');
        }
    }); //end set click i.e. content visible
    $('div.content span').click(() => {
        $('div.content').removeClass('show');
    });

    // table pannel控件
    PANEL.getAddRowButton().addEventListener("click", PANEL.addRow);
    PANEL.getDeletRowButton().addEventListener("click", PANEL.deletRow);
    PANEL.getSaveDataButton().addEventListener("click", PANEL.saveData);
    PANEL.getCLoseButton().addEventListener("click", PANEL.hidePanel);

    // stepper-input__button
    let plusBTN = document.getElementById("stepper-input__button__plus");
    let minusBTN = document.getElementById("stepper-input__button__minus");
    plusBTN.addEventListener("click", () => {
        let input = document.getElementById("stepper-input__input");
        // 如果input中是整数, 就加一
        // 否则设置为5
        if (Number.isInteger(parseInt(input.value))) {
            input.value = parseInt(input.value) + 1;
        } else {
            input.value = SETTINGS.settings.poolSize;
        }

    });
    minusBTN.addEventListener("click", () => {
        let input = document.getElementById("stepper-input__input");
        // 如果input中是整数, 就减一
        // 否则设置为5
        if (Number.isInteger(parseInt(input.value))) {
            input.value = parseInt(input.value) - 1;
        } else {
            input.value = SETTINGS.settings.poolSize;
        }
    });

    // 在设置页加入md转html的innerhtml
    // md是多行文字
    let md = `    
### 操作说明
整体布局为左右结构, 左侧是导航栏, 右侧是具体内容
**背书机**面板的上侧显示题目, 下侧显示答案, 点击长条形按钮即可刷题
双击背书区可以全屏显示或退出全屏
底部两个按钮可以调节同一个问题的出现次数
**辞书**面板内分为三个子版块
   **选择辞书**中展示着现有的所有录入的辞书的书名, 点击其中一本即选定了现在的辞书, 在那之后可以在背书机面板刷题, 或是在辞书的修改面板中对其进行修改
   **录入辞书**可以自行添加辞书, 添加成功后会一直保存
   **修改辞书**可以修改现有辞书, 要先在选择辞书面板中选择要修改的辞书, 为了方便修改可以按左下角"填入当前"按钮, 这将自动为你填入现在的辞书信息, 完成修改后再"确认修改"按钮提交
**设置**面板中提供一些自定义选项, 务必记得保存修改! 保存后会立刻呈现效果, 当然, "启动设置"内的效果要在下一次启动时才有效果
### 格式说明
在$修改辞书$界面可以用表格的形式呈现辞书内容, 非常方便修改; 此外, 输入的内容都会通过正则表达式进行替换, 但基本的输入规则需要明晰
**填空类型**: 用 $^^问题1##答案1^^问题2##答案2...$ 的形式录入内容
在问题和答案中都能插入**格式符号**, &lt;br&gt;表示换行, &lt;hr&gt;表示插入水平分割线
例如, 输入: $^^drink##n. 饮料&lt;br&gt;v. 喝饮料$ , 那么在答案中, 两个词性将分行呈现

### 关于我
正如启动动画中所看到的, 我的昵称是**zhyDaDa**, 主打前端设计
这个背书机是我高三时着手完成的项目, 出发点是为了背书, 更多信息可以浏览这一篇博客->[背书机mobile](https://zhydada.github.io/posts/%E8%83%8C%E4%B9%A6%E6%9C%BAmobile/)

为了追求更强的视觉传达和用户体验, 我花了约1个月的时间重制了背书机, 能很明显的感受到css动画带来的舒适和高级感
一些心得体会和技术细节我写在了这篇博客->[背书机V2](https://zhydada.github.io/posts/%E8%83%8C%E4%B9%A6%E6%9C%BAv2/)
如果对我其他作品和博客感兴趣, 欢迎移步至我的小站点->[zhyDaDa的个人站点](https://zhydada.github.io)
    `;
    // id为page4-content的div中插入md转html
    document.getElementById("page4-content").setHTML(md2html(md));

    // 一些控件双击进入或退出全屏
    // 所有textarea
    let textareas = document.getElementsByTagName("textarea");
    for (let i = 0; i < textareas.length; i++) {
        textareas[i].addEventListener("dblclick", () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                textareas[i].requestFullscreen();
            }
        });
    }
    // #target 双击全屏或退出 单击等同于点击按钮$('.showQA-btn')
    let target = document.getElementById("target");
    target.addEventListener("click", () => {
        $('.showQA-btn')[0].click();
    });
    let icon = document.querySelector("#fullScreenIcon div");
    icon.addEventListener("click", () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            target.parentNode.requestFullscreen();
        }
    });
}
main();

/* 如果第一次使用 */
if (BOOKS.books.length == 0) {
    BOOKS.books.push(new Book());
    BOOKS.RefreshBookGridPannel();
    CURRENT.LoadBook(BOOKS.books[0]);
    CURRENT.bookId = 0;
}