var global = {
    jQt: null,
    date: new Date(),
    user: null,
    chartServer: null,
    dates: [],
    timePanelScroll: null,
    chartPanelScroll: null,
    diary: new Diary(),
    msg: new Msg()
};
$(function () {
    redirect();
    initView();
    global.jQT = new $.jQTouch({ fixedViewport: false});
    eventListener();
    autoLogin();
});
/**
 * 视图初始化
 */
function initView() {
    initTimeScroll();
    initChartScroll();
}
function log() {
    $.toast(Array.prototype.slice.call(arguments).toString());
}
/**
 * 事件监听
 */
function eventListener() {
    var ts;
    document.addEventListener("touchstart", function (e) {
        var touch = e.touches[0];
        ts = touch.clientY;
    });
    document.addEventListener('touchmove', function (e) {
        if (e.target.tagName == "TEXTAREA") {
            var touch = e.touches[0];
            var textarea = e.target;
            if (textarea.scrollHeight != textarea.clientHeight) {//有内容滚条
                if ((textarea.scrollTop == 0 && touch.clientY < ts) ||  //滚为顶、手上滑
                    (textarea.scrollTop == (textarea.scrollHeight - textarea.clientHeight) && touch.clientY > ts) || //滚为底、手下滑
                    (textarea.scrollTop != 0 && textarea.scrollTop != (textarea.scrollHeight - textarea.clientHeight))) { //滚为中
                    ts = touch.clientY;
                    return;
                }
            }
        }
        e.preventDefault();
    }, false);
    $("#loginBtn").bind("tap", function () {
        var username = $.trim($("#username").val());
        var password = $.trim($("#password").val());
        if (!username || !password) {
            $.toast("请输入登录信息");
        } else {
            login({username: username, password: password});
        }
    });

    $("#diaryBtn").bind("tap", closeLogMenu);
    $("#chartBtn").bind("tap", function () {
        var $chart = $("#chart");
        $chart.attr("data-x", $chart.css("left"));
        $chart.attr("data-y", $chart.css("top"));
        $chart.animate({left: document.body.clientWidth - $chart.width() - 20, top: 60}, 120);
        $chartbox.show();
        $chart_panel.addClass("act");
        chartPanelToBottom();
    });
    $("#menuBtn").bind("tap", function () {
        $("#logMenu").css({height: 120, opacity: 1});
        $(this).parent(".toolbar").addClass("shadow");
        $("#timeline > .mask").fadeIn(300);
    });
    $("#timeline > .mask").bind("touchstart", closeLogMenu);
    var fileuploader = global.diary.photoUploader();
    $("#sendDiary").bind("tap", function () {
        global.diary.content = $("#diaryContent").val();
        if (fileuploader.files.length) {
            fileuploader.uploadFile();
        } else if (global.diary.content) {
            global.diary.sendDiary();
        }
    });

    function closeLogMenu() {
        $("#logMenu").css({height: 0, opacity: 0});
        $("#timeline .toolbar").removeClass("shadow");
        $("#timeline > .mask").fadeOut(200);
    }

    var $chartbox = $("#chartbox");
    var $chart_panel = $chartbox.find(".panel");
    $("#chart").floatmove({
        tap: function ($this) {
            if ($this.attr("data-x")) {
                $this.animateRun($this, $this.attr("data-x"), $this.attr("data-y"));
                $this.removeAttr("data-x");
                $this.removeAttr("data-y");
                $chartbox.hide();
                $chart_panel.removeClass("act");
                return true;
            } else {
                $this.attr("data-x", $this.css("left"));
                $this.attr("data-y", $this.css("top"));
                $this.animateRun($this, $this.SCREEN_W - $this.width() - 20, 10);
                $chartbox.show();
                $chart_panel.addClass("act");
                chartPanelToBottom();
                return true;
            }
        },
        touchend: function ($this) {
            if ($this.attr("data-x")) {
                $this.animateRun($this, $this.attr("data-x"), $this.attr("data-y"));
                $this.removeAttr("data-x");
                $this.removeAttr("data-y");
                $chartbox.hide();
                $chart_panel.removeClass("act");
                return true;
            }
            return false;
        }
    });
    $("#chartbox .close").bind("tap", function () {
        var $this = $("#chart");
        $this.animate({left: $this.attr("data-x"), top: $this.attr("data-y")}, 120);
        $this.removeAttr("data-x");
        $this.removeAttr("data-y");
        $chartbox.hide();
        $chart_panel.removeClass("act");
    });
    $("#sendMsg").bind("tap", function () {
        var content = $("#chartMsg").val();
        if ($.trim(content)) {
            global.msg.content = content;
            global.msg.sendMsg();
        }
    });
}
//socket.io监听
function socketListener() {
    var $chartPanel = $("#chartPanel");
    var $chartlist = $chartPanel.find(".list");
    global.chartServer.on("sysinfo", function (data) {
        data.content && $.toast(data.content);
    });

    global.chartServer.on("msg", function (data) {
        var html, sex;
        if (data.from == global.user.username) { //自己发的
            sex = global.user.sex == "gg" ? "gg" : "mm";
            html = "<div class='right'><div class='bubble #{sex}'>#{content}</div><div class='datetime'><span class='date'></span><span class='time'>#{time}</span></div></div>";
        } else {
            sex = global.user.sex == "gg" ? "mm" : "gg";
            html = "<div class='left'><div class='bubble #{sex}'>#{content}</div><div class='datetime'><span class='date'></span><span class='time'>#{time}</span></div></div>";
        }
        var time = data.datetime.substr(11);
        html = html.replace("#{content}", data.content).replace("#{sex}", sex).replace("#{time}", time);
        $chartlist.append(html);
        global.msg.shownum++;
        chartPanelToBottom(200);
    });
}
/**
 * 检测地址重定向，
 */
function redirect() {
    var path = location.href;
    var m = path.indexOf("#");
    if (m != -1) {
        if ("login" != path.substring(m + 1, path.length)) {
            location.href = path.substring(0, m);
        }
    }
}
function gotoLoginPage() {
    global.jQT.goTo("#login", "slidedown");
}
function autoLogin() {
    var logininfo = localStorage.getItem("logininfo");
    if (logininfo) {
        logininfo = JSON.parse(logininfo);
        $("#username").val(logininfo.username);
        $("#password").val(logininfo.password);
        login(logininfo);
    }
}
function login(logininfo) {
    $.ajax({
        url: "./login",
        data: logininfo,
        type: "post",
        dataType: "json",
        success: function (data) {
            if (data.res == "suc") {
                global.user = data.data.user;
                localStorage.setItem("logininfo", JSON.stringify(logininfo));
                global.msg.from = global.user.username;
                global.msg.to = global.user.match;
                global.chartServer = io.connect('/chartServer');
                socketListener();
                global.chartServer.emit("online", {user: global.user});
                $("#telephone").attr("href", "tel:" + global.user.match);
                global.jQT.goTo("#timeline", "slideup");
                global.diary.refreshDiary();
                global.msg.queryMsg();
            } else {
                $.toast("不要偷看别人隐私哦");
            }
        },
        error: function () {
            $.toast("网络异常");
        }
    });
}
function initTimeScroll() {
    var pullDownEl = $("#timePanel .pullDown");
    var pullDownOffset = pullDownEl.height();
    var pullUpEl = $("#timePanel .pullUp");
    var pullUpOffset = pullUpEl.height();
    global.timePanelScroll = new iScroll("timePanel", {
        probeType: 3, vScrollbar: false,
        topOffset: pullDownOffset,
        onRefresh: function () {
            if (pullDownEl.hasClass('loading')) {
                pullDownEl.attr('class', 'pullDown');
                pullDownEl.children('.pullDownLabel').html('下拉刷新');
            } else if (pullUpEl.hasClass('loading')) {
                pullUpEl.attr('class', 'pullUp');
                pullUpEl.children('.pullUpLabel').html('加载更多');
            }
        },
        onScrollMove: function () {
            if (this.y > 5 && !pullDownEl.hasClass('flip')) {
                pullDownEl.attr('class', 'pullDown flip');
                pullDownEl.children('.pullDownLabel').html('释放刷新');
                this.minScrollY = 0;
            } else if (this.y < 5 && pullDownEl.hasClass('flip')) {
                pullDownEl.attr('class', 'pullDown');
                pullDownEl.children('.pullDownLabel').html('下拉刷新');
                this.minScrollY = -pullDownOffset;
            } else if (this.y < (this.maxScrollY - 5) && !pullUpEl.hasClass('flip')) {
                pullUpEl.attr('class', 'pullUp flip').show();
                pullUpEl.children('.pullUpLabel').html('释放加载更多');
                this.maxScrollY = this.maxScrollY;
            } else if (this.y > (this.maxScrollY + 5) && pullUpEl.hasClass('flip')) {
                pullUpEl.attr('class', 'pullUp').show();
                pullUpEl.children('.pullUpLabel').html('加载更多');
                this.maxScrollY = pullUpOffset;
            }
        },
        onScrollEnd: function () {
            if (pullDownEl.hasClass('flip')) {
                pullDownEl.attr('class', 'pullDown loading');
                pullUpEl.hide();
                pullDownEl.children('.pullDownLabel').html('');
                global.diary.refreshDiary();
            } else if (pullUpEl.hasClass('flip')) {
                pullUpEl.attr('class', 'pullUp loading');
                pullUpEl.children('.pullUpLabel').html('');
                global.diary.queryDiarys();
            }
        }
    });
}
function initChartScroll() {
    var pullDownEl = $("#chartPanel .pullDown");
    var pullDownOffset = pullDownEl.height();
    global.chartPanelScroll = new iScroll("chartPanel", {
        probeType: 3,
        topOffset: pullDownOffset,
        onRefresh: function () {
            if (pullDownEl.hasClass('loading')) {
                pullDownEl.attr('class', 'pullDown');
                pullDownEl.children('.pullDownLabel').html('下拉查看更多消息');
            }
        },
        onScrollMove: function () {
            if (this.y > 5 && !pullDownEl.hasClass('flip')) {
                pullDownEl.attr('class', 'pullDown flip');
                pullDownEl.children('.pullDownLabel').html('释放查看更多消息');
                this.minScrollY = 0;
            } else if (this.y < 5 && pullDownEl.hasClass('flip')) {
                pullDownEl.attr('class', 'pullDown');
                pullDownEl.children('.pullDownLabel').html('下拉查看更多消息');
                this.minScrollY = -pullDownOffset;
            }
        },
        onScrollEnd: function () {
            if (pullDownEl.hasClass('flip')) {
                pullDownEl.attr('class', 'pullDown loading');
                pullDownEl.children('.pullDownLabel').html('');
                global.msg.queryMsg();
            }
        }
    });
}
function chartPanelToBottom(time) {
    time = time || 0;
    global.chartPanelScroll.refresh();
    var $cp = $("#chartPanel");
    var lh = $cp.find(".list").height();
    var ph = $cp.height();
    var pdh = $cp.find(".pullDown").height();
    lh = lh < ph ? ph : lh;
    global.chartPanelScroll.scrollTo(0, -(lh - ph + pdh), time);
}
/**
 * 日志类
 */
function Diary(content, filenames) {
    this.content = content || "";
    this.filenames = filenames;
    this.pagenum = 0;
}
Diary.prototype.sendDiary = function () {
    var the = this;
    $.ajax({
        url: "./sendDiary",
        data: {filenames: this.filenames, content: this.content},
        type: "post",
        dataType: "json",
        success: function (data) {
            if (data.res == "suc") {
                $.toast("日志上传成功");
                the.refreshDiary();
                global.jQT.goTo("#timeline", "slideright");
            }
        },
        error: function (req) {
            if (req.responseText == "login") {
                global.jQT.goTo("#login", "slidedown");
            } else {
                $.toast("宝贝儿，网络异常了，一会儿再试试看吧");
            }
        }
    });
};
Diary.prototype.photoUploader = function () {
    var the = this;
    var fileconfig = {
        fileInput: "photofile",
        url: "./photoUpload",
        onSelectBefore: function (num) {
            var $photos = $("#photos");
            $photos.empty();
            for (var i = 0; i < num; i++) {
                var $photo = $('<div class="photo"><span>加载中</span><div class="progress"><i></i></div></div>');
                $photos.append($photo);
            }
        },
        onSelect: function (files) {
            var $photos = $("#photos");
            if (files.length) {
                $.makeThumb({
                    files: files,
                    width: 1000,
                    height: 1000,
                    success: function (files) {
                        $photos.empty();
                        for (var i = 0; i < files.length; i++) {
                            var file = files[i];
                            var $photo = $('<div class="photo" id="p_' + i + '"><span>加载中</span><div class="progress"><i></i></div></div>');
                            $photo.css("backgroundImage", "url(" + file.dataURL + ")").children("span").html("");
                            $photos.append($photo);
                        }
                    }
                });
            }
        },
        onProgress: function (file, e) {
            var percent = parseInt(e.loaded / e.total * 100) + '%';
            $("#p_" + file.index).css("opacity", e.loaded / e.total);
            $("#p_" + file.index + " i").width(percent);
        },
        onSuccess: function (file, data) {
            if (data.res == "suc") {
                $("#p_" + file.index).attr("filename", data.data.filename).addClass("uploaded").empty();
            } else {
                $.toast(file.name + "上传失败");
            }
        },
        onFailure: function (file, data) {
            if (data == "login") {
                global.jQT.goTo("#login", "slidedown");
            } else {
                $.toast("宝贝儿，网络异常了，一会儿再试试看吧");
            }
        },
        onComplete: function () {
            var filenames = [];
            $(".uploaded").each(function () {
                filenames.push($(this).attr("filename"));
            });
            the.filenames = JSON.stringify(filenames);
            the.sendDiary();
        }
    };
    return new FileUpload(fileconfig);
};
Diary.prototype.refreshDiary = function () {
    this.pagenum = 0;
    global.dates = [];
    this.queryDiarys(function () {
        $("#diarys").empty();
    });
}
Diary.prototype.queryDiarys = function (callbefore, callback) {
    var the = this;
    var $loading = $("#timeline .load");
    $loading.fadeIn(300);
    $.ajax({
        url: "./queryDiarys",
        data: {pagenum: the.pagenum},
        dataType: "json",
        type: "post",
        success: function (data) {
            callbefore && callbefore();
            if (data.length) {
                var dayTmpl = "<div class='day'><span class='date'>#{date}</span><div class='left'></div><div class='right'></div></div>";
                var cardTmpl = "<div class='timecard'><p class='time'>#{time}</p><div class='photos'></div><p class='content'>#{content}</p>";
                var $day, $dayLeft, $dayRight;
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    var cardHtml = cardTmpl.replace("#{time}", item.time).replace("#{content}", item.content);
                    var $card = $(cardHtml);
                    var $photos = $card.children(".photos");
                    for (var m = 0; m < item.photos.length; m++) {
                        $photos.append("<img class='preimg' src='' data-src='" + item.photos[m].url + encodeURI(item.photos[m].name) + "'>");
                    }
                    if (global.dates.indexOf(item.date) == -1) {
                        global.dates.push(item.date);
                        var dayHtml = dayTmpl.replace("#{date}", item.date);
                        $day = $(dayHtml);
                        $day.attr("id", item.date);
                        $("#diarys").append($day);
                    } else {
                        $day = $("#" + item.date);
                    }
                    $dayLeft = $day.children(".left");
                    $dayRight = $day.children(".right");
                    if (item.sex == "gg") {
                        $dayLeft.append($card);
                    } else if (item.sex == "mm") {
                        $dayRight.append($card);
                    }
                }
                the.pagenum++;
            } else {
                $.toast("宝贝儿，没有了...");
            }
            the.loadImages(function () {
                $loading.fadeOut(300);
            });
            callback && callback();
        },
        error: function (req, textStatus, errorThrown) {
            callbefore && callbefore();
            $loading.fadeOut(300);
            if (req.responseText == "login") {
                global.jQT.goTo("#login", "slidedown");
            } else {
                $.toast("宝贝儿，网络异常了，一会儿再试试看吧");
            }
        }
    })
};
Diary.prototype.loadImages = function (callback) {
    var preimgs = $("img.preimg[src='']");
    var img = new Image();
    (function (arr, i) {
        var argcall = arguments.callee;
        if (i == arr.length) {
            setTimeout(function () {
                global.timePanelScroll.refresh();
                callback && callback();
            }, 100);
        } else {
            var ari = arr.eq(i);
            img.src = ari.attr("data-src");
            img.onload = function () {
//                var scale = 260 / img.naturalWidth;
//                ari.attr("height", img.naturalHeight * scale);
                ari.attr("src", img.src);
                i++;
                argcall(arr, i);
            };
            img.onerror = function () {
                i++;
                argcall(arr, i);
            }
        }
    })(preimgs, 0);
};
/*
 * 消息类
 *
 * */
function Msg(from, to, content) {
    this.from = from;
    this.to = to;
    this.content = content;
    this.pagenum = 0;
    this.shownum = 0;
}
Msg.prototype.sendMsg = function () {
    global.chartServer.emit("msg", {from: this.from, to: this.to, content: this.content});
};
Msg.prototype.queryMsg = function () {
    var the = this;
    $.ajax({
        url: "./queryMsg",
        data: {pagenum: the.pagenum, shownum: the.shownum, from_user: the.from, to_user: the.to},
        dataType: "json",
        type: "post",
        success: function (msgs) {
            if (msgs.length) {
                var $chartlist = $("#chartPanel .list");
                var htmls = "", sex;
                var todayStr = global.date.format("yyyy-MM-dd");
                for (var i = 0; i < msgs.length; i++) {
                    var msg = msgs[i];
                    var html;
                    if (msg.f_username == global.user.username) { //自己发的
                        sex = msg.f_sex;
                        html = "<div class='right'><div class='bubble #{sex}'>#{content}</div><div class='datetime'><span class='date'>#{date}</span><span class='time'>#{time}</span></div></div>";
                    } else {
                        sex = msg.f_sex;
                        html = "<div class='left'><div class='bubble #{sex}'>#{content}</div><div class='datetime'><span class='date'>#{date}</span><span class='time'>#{time}</span></div></div>";
                    }
                    msg.datetime = new Date(msg.datetime).format("yyyy-MM-dd hh:mm:ss");
                    var date = msg.datetime.substr(0, 10);
                    var time = msg.datetime.substr(11);
                    if (todayStr == date) date = "";
                    htmls = html.replace("#{content}", msg.content).replace("#{sex}", sex).replace("#{date}", date).replace("#{time}", time) + htmls;
                }
                htmls += "<div class='page" + the.pagenum + "'></div>";
                $chartlist.prepend(htmls);
                global.chartPanelScroll.refresh();
                global.chartPanelScroll.scrollToElement(".page" + the.pagenum, 0);
                the.pagenum++;
            } else {
                global.chartPanelScroll.refresh();
            }
        }
    });
};