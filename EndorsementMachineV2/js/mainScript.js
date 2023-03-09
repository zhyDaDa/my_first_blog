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

/**
 * 设置, 具体设置的值在settings中
 */
const SETTING = {
    settings: {
        lastBookID: 0,
        lastBookName: "",
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
        document.documentElement.style.setProperty("--color-light", SETTING.colors[SETTING.settings.theme_color][0]);
        document.documentElement.style.setProperty("--color-deep", SETTING.colors[SETTING.settings.theme_color][1]);

    },
    GetSettingsFromLocalStorageThenApply: () => {
        let s = localStorage.getItem("settings");
        try {
            SETTING.settings = deepCopy(JSON.parse(s), false);
            $("#setting_1")[0].checked = SETTING.settings.start_rememberLastBook;
            $("#setting_2")[0].checked = SETTING.settings.start_showSentence;
            $(".setting-color-grid[value=" + SETTING.settings.theme_color + "]")[0].checked = true;
            SETTING.ApplySetting();
        } catch {
            console.log("读入设置失败, 可能是没有存储或格式错误, 已完成设置初始化");
            SETTING.settings = {
                lastBookID: 0,
                lastBookName: "",
                start_showTutorial: true,
                start_showSentence: false,
                start_rememberLastBook: false,
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
function Book(rawBook = "") {
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
    }
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
        SetNextQuestion: () => {
            let ranNum = (Math.random() * (CURRENT.contentArray.length)) >> 0;
            CURRENT.question = CURRENT.contentArray[ranNum][0];
            CURRENT.answer1 = CURRENT.contentArray[ranNum][1];
        },
        DisplayQuestion: () => {
            let target = GetTarget(),
                question = CURRENT.question;

            let _html = ``;
            if (question.length > 40) _html += `<h5 class = "question long-question">`;
            else _html += `<h5 class = "question short-question">`;
            _html += CURRENT.question;
            _html += `</h5>`;
            target.innerHTML = _html;
        },
        DisplayQuestionAndAnswer: () => {
            let target = GetTarget(),
                question = CURRENT.question,
                answer = CURRENT.answer1;

            let _html = ``;

            if (question.length > 40) _html += `<h5 class="question long-question">`;
            else _html += `<h5 class="question short-question">`;
            _html += CURRENT.question;
            _html += `</h5>`;

            _html += `<hr>`;

            if (answer.length > 40) _html += `<h7 class="answer long-answer">`;
            else _html += `<h7 class="answer short-answer">`;
            _html += CURRENT.answer1;
            _html += `</h7>`;
            target.innerHTML = _html;
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

    // book-grid-pannel控件


}

main();