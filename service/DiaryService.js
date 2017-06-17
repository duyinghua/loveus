var DiaryMod = require('../model/DiaryMod');
var PhotoMod = require('../model/PhotoMod');
var Filesys = require('../util/Filesys');


exports.queryDiary = function queryDiary(pagenum, callback) {
    DiaryMod.queryByPage(pagenum, function (err, diarys) {
        var res = [];
        (function (arr, i) {
            var argcall = arguments.callee;
            if (i == arr.length) {
                callback(res);
            } else {
                var diary = arr[i];
                var dy = {};
                dy.date = global.utils.dateFormat(diary.datetime, "yyyy-MM-dd");
                dy.time = global.utils.dateFormat(diary.datetime, "hh:mm:ss");
                dy.content = diary.content;
                dy.sex = diary.sex;
                PhotoMod.queryByDid(diary.id, function (err, photos) {
                    dy.photos = photos;
                    res.push(dy);
                    i++;
                    argcall(arr, i);
                });
            }
        })(diarys, 0);
    });
};
exports.addDiary = function (diary, filearr, path, callback) {
    diary.save(function (err, did) {
        (function (arr, i) {
            var argcall = arguments.callee;
            if (i == arr.length) {
                callback();
            } else {
                Filesys.moveTo(global.TMP_FILE_PATH + arr[i], "./upload/" + path + "/", arr[i]);
                var photo = new PhotoMod(null, arr[i], diary.datetime, "/" + path + "/", did);
                photo.save(function (err) {
                    i++;
                    argcall(arr, i);
                });
            }
        })(filearr, 0);
    });
};