$.extend({
    TOAST_TIMER: null,
    toast: function (msg) {
        $.TOAST_TIMER && clearTimeout($.TOAST_TIMER);
        var $toast = $("#toast");
        if (!$toast.length) {
            $toast = $("<div id='toast' class='current'><span></span></div>");
            $toast.css({
                opacity: 0,
                position: "absolute",
                top: "80%",
                width: "100%",
                height: "50px",
                textAlign: "center",
                zIndex: 9999
            });
            $toast.children("span").css({
                padding: "10px 20px",
                borderRadius: "10px",
                background: "rgba(0,0,0,0.6)",
                color: "#FFF"
            });
            $("body").append($toast);
        }
        var animateToast = $("#toast:animated");
        if (animateToast.length) { //正在动画中
            $toast.css("opacity", 1);
        }
        $toast.children("span").html(msg);
        $toast.animate({opacity: 1});
        $.TOAST_TIMER = setTimeout(function () {
            $toast.animate({opacity: 0});
        }, 3000);
    }
});
$.fn.extend({
    floatmove: function (option) {
        var opt = {};
        $.extend(opt, option);
        var SCREEN_W = document.body.clientWidth;
        var SCREEN_H = document.body.clientHeight;
        var lx, ly, st, sx, sy, sey;

        var animateRun = function (el, x, y, t) {
            t = t || 120;
            if (y < 60) {
                y = 60;
            } else if (y > SCREEN_H - 100) {
                y = SCREEN_H - 100;
            }
            if (x && y) {
                el.animate({left: x, top: y}, t);
            } else if (x) {
                x && el.animate({left: x}, t);
            } else if (y) {
                y && el.animate({top: y}, t);
            }
        };
        this.each(function () {
            var $this = $(this);
            $this.bind("touchstart", function (e) {
//                e.preventDefault();
                var $this = $(this);
                st = Date.now();
                var touch = e.originalEvent.targetTouches[0];
                lx = sx = touch.clientX;
                ly = sy = touch.clientY;
                sey = parseInt($this.css("top"));
            });
            $this.bind("touchmove", function (e) {
                e.preventDefault();
                var touch = e.originalEvent.targetTouches[0];
                var $this = $(this);
                var dx = touch.clientX - lx;
                var dy = touch.clientY - ly;
                lx = touch.clientX;
                ly = touch.clientY;
                var curx = parseInt($this.css("left"));
                var cury = parseInt($this.css("top"));
                $this.css({left: curx + dx, top: cury + dy});
            });
            $this.bind("touchend", function (e) {
//                e.preventDefault();
                var dt = Date.now() - st;

                var touch = e.originalEvent.changedTouches[0];
                var dx = touch.clientX - sx;
                var dy = touch.clientY - sy;
                var $this = $(this);

                if ($.isFunction(opt.tap)) {
                    if (Math.abs(dx) <= 10 && Math.abs(dy) <= 10 && dt < 500) {//tap event
                        $this.animateRun = animateRun;
                        $this.SCREEN_W = SCREEN_W;
                        if (opt.tap($this)) return;
                    }
                }
                if ($.isFunction(opt.touchend)) {
                    $this.animateRun = animateRun;
                    if (opt.touchend($this)) return;
                }
                var curx = parseInt($this.css("left"));
                if (dt < 300 && Math.abs(dx) > 100) {
                    var my = (dy / dx) * (SCREEN_W + 10 - (100 - 10));
                    if (dx > 0) {
                        animateRun($this, SCREEN_W - $this.width() + 10, sey + my);
                    } else if (dx < 0) {
                        animateRun($this, -10, sey - my);
                    }
                } else {
                    if (curx > 270) {
                        animateRun($this, SCREEN_W - $this.width() + 10, touch.clientY);
                    } else {
                        animateRun($this, -10, touch.clientY);
                    }
                }
            });
        });
    }
});
Date.prototype.format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};