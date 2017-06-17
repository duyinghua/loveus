var fs = require('fs');
var uuid = require('node-uuid');
var UserMod = require('../model/UserMod');
var DiaryMod = require('../model/DiaryMod');
var MsgMod = require('../model/MsgMod');
var DiaryService = require('../service/DiaryService');
exports.main = function (req, res) {
    res.redirect("/index");
};
exports.index = function (req, res) {
    res.render('index', { });
};
exports.login = function (req, res) {
    var username = req.param("username");
    var password = req.param("password");
    UserMod.findByName(username, function (err, result) {
        if (result && result.password == password) {
            req.session.user = result;
            var data = {res: "suc", data: {user: result}};
            res.send(JSON.stringify(data));
        } else {
            res.send({res: "err"});
        }
    });
};
exports.queryDiarys = function (req, res) {
    var pagenum = req.param("pagenum");
    pagenum = pagenum ? parseInt(pagenum) : 0;
    DiaryService.queryDiary(pagenum, function (diarys) {
        res.send(diarys);
    });
};

exports.photoUpload = function (req, res) {
    var fname = req.header('x-file-name');
    fname = uuid.v1() + "_" + decodeURI(fname);
    var tmpfile = global.TMP_FILE_PATH + fname;
    /*var ws = fs.createWriteStream(tmpfile);
     ws.on('error', function (err) {
     console.log("uploadFile() - req.xhr - could not open writestream.");
     res.send({res: "err"});
     });
     ws.on('close', function (err) {
     res.send({res: "suc", data: {filename: fname}});
     });
     // Writing filedata into writestream
     req.on('data', function (data) {
     ws.write(data);
     });
     req.on('end', function () {
     ws.end();
     });*/

    var imgData = req.body.imgData;
    //过滤data:URL
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "").replace(/\s/g, "+");
    var dataBuffer = new Buffer(base64Data, 'base64');
    fs.writeFile(tmpfile, dataBuffer, function (err) {
        if (err) {
            res.send({res: "err"});
        } else {
            res.send({res: "suc", data: {filename: fname}});
        }
    });


};

exports.sendDiary = function (req, res) {
    var filenames = req.param("filenames");
    var content = req.param("content");
    var filearr = filenames ? JSON.parse(filenames) : [];
    var date = new Date();
    var datemonthStr = global.utils.dateFormat(date, "yyyyMM");
    var datetimeStr = global.utils.dateFormat(date, "yyyy-MM-dd hh:mm:ss");
    var diary = new DiaryMod(null, req.session.user.id, content, datetimeStr);
    DiaryService.addDiary(diary, filearr, datemonthStr, function () {
        res.send({res: "suc"});
    })
};
exports.queryMsg = function (req, res) {
    var from_user = req.param("from_user");
    var to_user = req.param("to_user");
    var pagenum = req.param("pagenum");
    pagenum = pagenum ? parseInt(pagenum) : 0;
    var shownum = req.param("shownum");
    shownum = shownum ? parseInt(shownum) : 0;
    MsgMod.queryByFTP(from_user, to_user, pagenum, shownum, function (err, msgs) {
        res.send(msgs)
    });
};