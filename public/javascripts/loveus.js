var global = {
    jQt: null,
    pagenum: 0,
    dates: [],
    timeLY: 0,
    timepanelScroll: -1
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
    setTimePanel();
}

/**
 * 事件监听
 */
function eventListener() {
    document.addEventListener('touchstart', function (e) {
        var touch = e.touches[0];
        global.timeLY = touch.pageY;

    });
    document.addEventListener('touchmove', function (e) {
        var touch = e.touches[0];
        var $target = $(e.target);
        var ly = global.timeLY;
        global.timeLY = touch.pageY;
        if (e.target.tagName == "TEXTAREA") {
            return;
        } else if ($target.parents(".scroll_frame").length) {
            if (global.timepanelScroll == -1 && ly < touch.pageY) {
                e.preventDefault();
            } else if (global.timepanelScroll == 1 && ly > touch.pageY) {
                e.preventDefault();
            } else {
                return;
            }
        }
        e.preventDefault();
    });
    $(window).bind("orientationchange", function () {
        if (window.orientation == 0 || window.orientation == 180) {//竖屏
            setTimePanel(window.screen.availHeight);
        } else if (window.orientation == 90 || window.orientation == -90) {//横屏
            setTimePanel(window.screen.availWidth);
        }
    });
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
    $("#menuBtn").bind("tap", function () {
        $("#logMenu").css({height: 120, opacity: 1});
        $("#timeline .mask").fadeIn(300);
    });
    $("#timeline .mask").bind("touchstart", closeLogMenu);
    var $timePanelMore = $("#timePanel .more");
    $("#timeline .scroll_frame").bind("scroll", function (e) {
        global.timepanelScroll = 0;
        var $this = $(this);
        var scrollTop = $this.scrollTop();
        var clientHeight = $this.height();
        var offsetHeight = $this.children(".area").height();
        var diff = (offsetHeight - clientHeight) - scrollTop;
        if (diff <= 0) {
            global.timepanelScroll = 1;
            $timePanelMore.show();
            queryDiarys(function () {
                $timePanelMore.hide();
            });
        }
        if (scrollTop <= 0) {
            global.timepanelScroll = -1;
        }

    });
    var diary = new Diary();
    var fileuploader = diary.photoUploader();
    $("#sendDiary").bind("tap", function () {
        diary.content = $("#diaryContent").val();
        if (fileuploader.files.length) {
            fileuploader.uploadFile();
        } else if (diary.content) {
            diary.sendDiary();
        }
    });

    function closeLogMenu() {
        $("#logMenu").css({height: 0, opacity: 0});
        $("#timeline .mask").fadeOut(200);
    }

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
        success: function (data) {
            if (data == "suc") {
                localStorage.setItem("logininfo", JSON.stringify(logininfo));
                global.jQT.goTo("#timeline", "slideup");
                queryDiarys();
            } else {
                $.toast("不要偷看别人隐私哦");
            }
        },
        error: function () {
            $.toast("网络异常");
        }
    });
}
function setTimePanel(size) {
    var h = size * 2 - 10 - 80;// 减margin，toolbar
    if (size < 400) {//320
        h -= 40;// 减 statusbar
    }
    $("#timePanel").height(h);
}

function refreshDiary() {
    $("#diarys").empty();
    global.pagenum = 0;
    global.dates = [];
    queryDiarys();
}
function queryDiarys(callback) {
    $.ajax({
        url: "./queryDiarys",
        data: {pagenum: global.pagenum},
        dataType: "json",
        type: "post",
        success: function (data) {
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
                global.pagenum++;
            } else {
                $.toast("宝贝儿，没有了...");
            }
            loadImages();
            callback && callback();
        },
        error: function (req, textStatus, errorThrown) {
            if (req.responseText == "login") {
                global.jQT.goTo("#login", "slidedown");
            } else {
                $.toast("宝贝儿，网络异常了，一会儿再试试看吧");
            }
        }
    })

}
function loadImages(callback) {
    var preimgs = $("img.preimg[src='']");
    var img = new Image();
    (function (arr, i) {
        var argcall = arguments.callee;
        if (i == arr.length) {
            callback && callback();
        } else {
            var ari = arr.eq(i);
            img.src = ari.attr("data-src");
            img.onload = function () {
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
}
/**
 * 日志类
 */
function Diary(content, filenames) {
    this.content = content || "";
    this.filenames = filenames;
}
Diary.prototype.sendDiary = function () {
    $.ajax({
        url: "./sendDiary",
        data: {filenames: this.filenames, content: this.content},
        type: "post",
        success: function (data) {
            if (data.res == "suc") {
                $.toast("日志上传成功");
                refreshDiary();
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
        onSelect: function (files) {
            var $photos = $("#photos");
            if (files.length) {
                $photos.empty();
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var reader = new FileReader();
                    reader.readAsDataURL(file);
                    var $photo = $('<div class="photo" id="p_' + i + '"><span>加载中</span><div class="progress"><i></i></div></div>');
                    $photos.append($photo);
                    (function (po) {
                        reader.onprogress = function (e) {
                            po.children("span").html(parseInt((e.loaded / e.total) * 100) + "%");
                        };
                        reader.onload = function (e) {
                            po.css("backgroundImage", "url(" + e.target.result + ")").children("span").html("");
                        };
                    })($photo);
                }
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