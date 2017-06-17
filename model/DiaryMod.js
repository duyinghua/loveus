var DB = require("../util/DB");
function DiaryMod(id, uid, content, datetime) {
    this.id = id;
    this.uid = uid;
    this.content = content;
    this.datetime = datetime;
}
DiaryMod.createObj = function createObj(obj) {
    var DiaryMod = new DiaryMod();
    DiaryMod.id = obj.id;
    DiaryMod.uid = obj.uid;
    DiaryMod.content = obj.content;
    DiaryMod.datetime = obj.datetime;
    return DiaryMod;
}
module.exports = DiaryMod;
DiaryMod.prototype.save = function save(callback) {
    var sql = 'insert into diary values(null,"' + this.uid + '","' + this.content + '","' + this.datetime + '")';
    var db = DB();
    db.query(sql, function (err, result) {
        callback(err, result.insertId);
    });
};

DiaryMod.prototype.update = function update(callback) {
    var sql = "update diary set uid='" + this.uid + "',content='" + this.content + "',datetime='" + this.datetime + "' where id=" + this.id;
    var db = DB();
    db.query(sql, function (err) {
        callback(err);
    });
};

DiaryMod.del = function del(id, callback) {
    var sql = "delete from diary where id=" + id;
    var db = DB();
    db.query(sql, function (err) {
        callback(err);
    });
};

DiaryMod.query = function query(callback) {
    var sql = "select * from diary";
    var db = DB();
    db.query(sql, function (err, results) {
        callback(err, results);
    });
};

DiaryMod.findById = function findById(id, callback) {
    var sql = "select * from diary where id='" + id + "'";
    var db = DB();
    db.query(sql, function (err, results) {
        var result = results && results[0];
        callback(err, result);
    });
};
DiaryMod.queryByPage = function (pagenum, callback) {
    pagenum = isNaN(pagenum) ? 0 : pagenum;
    var perRows = 10;
    var start = pagenum * perRows;
    var sql = "SELECT d.id as id,d.content,d.datetime,u.sex FROM `diary` d LEFT JOIN `user` u ON d.uid = u.id ORDER BY d.datetime DESC LIMIT " + start + "," + perRows;
    var db = DB();
    db.query(sql, function (err, results) {
        callback(err, results);
    });
};