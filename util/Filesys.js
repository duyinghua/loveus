/**
 * 扩展fs类,批量处理文件
 * @type {*}
 */
var fs = require("fs");
var uuid = require('node-uuid');

module.exports = {
    /**
     * 层层创建文件
     * @param url
     * @param mode
     * @param cb
     */
    mkAllFs: function (url, mode, cb) {
        var arr = url.split("/");
        mode = mode || 0755;
        cb = cb || function () {
        };
        if (arr[0] === ".") {//处理 ./aaa
            arr.shift();
        }
        if (arr[0] == "..") {//处理 ../ddd/d
            arr.splice(0, 2, arr[0] + "/" + arr[1])
        }
        function inner(cur) {
            if (!fs.existsSync(cur)) {//不存在就创建一个
                fs.mkdirSync(cur, mode)
            }
            if (arr.length) {
                inner(cur + "/" + arr.shift());
            } else {
                cb();
            }
        }

        arr.length && inner(arr.shift());
    },
    rmAllFs: function (dir, cb) {
        function iterator(url, dirs) {
            var stat = fs.statSync(url);
            if (stat.isDirectory()) {
                dirs.unshift(url);//收集目录
                inner(url, dirs);
            } else if (stat.isFile()) {
                fs.unlinkSync(url);//直接删除文件
            }
        }

        function inner(path, dirs) {
            var arr = fs.readdirSync(path);
            for (var i = 0, el; el = arr[i++];) {
                iterator(path + "/" + el, dirs);
            }
        }

        cb = cb || function () {
        };
        var dirs = [];
        try {
            iterator(dir, dirs);
            for (var i = 0, el; el = dirs[i++];) {
                fs.rmdirSync(el);//一次性删除所有收集到的目录
            }
            cb()
        } catch (e) {//如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
            e.code === "ENOENT" ? cb() : cb(e);
        }
    },
    moveTo: function (sourcefile, targetpath, targetfile) {
        var the = this;
        var move = function () {
            fs.rename(sourcefile, targetpath + targetfile, function (err) {
                if (!err) {
                    the.rmAllFs(sourcefile);
                }
            });
        };
        if (!fs.existsSync(targetpath)) {
            the.mkAllFs(targetpath, null, function () {
                move();
            });
        }
        else {
            move();
        }
    }
}
