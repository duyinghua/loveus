var DB = require("../util/DB");
function DiaryMod(id, name, datetime, url, did) {
    this.id = id;
    this.did = did;
    this.name = name;
    this.url = url;
    this.datetime = datetime;
}
DiaryMod.createObj = function createObj(obj) {
    var diaryMod = new DiaryMod();
    diaryMod.id = obj.id;
    diaryMod.did = obj.did;
    diaryMod.name = obj.name;
    diaryMod.url = obj.url;
    diaryMod.datetime = obj.datetime;
    return diaryMod;
}
module.exports = DiaryMod;
DiaryMod.prototype.save = function save(callback) {
    var sql = 'insert into photo values(null,"' + this.name + '","' + this.datetime + '","' + this.url + '","' + this.did + '")';
    var db = DB();
    db.query(sql, function (err) {
        callback(err);
    });
};

DiaryMod.prototype.update = function update(callback) {
    var sql = "update photo set did='" + this.did + "',name='" + this.name + "',datetime='" + this.datetime + "',url='" + this.url + "' where id=" + this.id;
    var db = DB();
    db.query(sql, function (err) {
        callback(err);
    });
};

DiaryMod.del = function del(id, callback) {
    var sql = "delete from photo where id=" + id;
    var db = DB();
    db.query(sql, function (err) {
        callback(err);
    });
};

DiaryMod.query = function query(callback) {
    var sql = "select * from photo";
    var db = DB();
    db.query(sql, function (err, results) {
        callback(err, results);
    });
};
DiaryMod.queryByDid = function query(did, callback) {
    var sql = "select * from photo where did='" + did + "'";
    var db = DB();
    db.query(sql, function (err, results) {
        callback(err, results);
    });
};
