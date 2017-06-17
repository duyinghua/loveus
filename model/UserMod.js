var DB = require("../util/DB");
function UserMod(id, username, password, sex, match) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.sex = sex;
    this.match = match;
}
UserMod.createObj = function createObj(obj) {
    var userMod = new UserMod();
    userMod.id = obj.id;
    userMod.username = obj.username;
    userMod.password = obj.password;
    userMod.sex = obj.sex;
    userMod.match = obj.match;
    return userMod;
}
module.exports = UserMod;
UserMod.prototype.save = function save(callback) {
    var sql = 'insert into user values(null,"' + this.username + '","' + this.password + '","' + this.sex + '","' + this.match + '")';
    var db = DB();
    db.query(sql, function (err) {
        callback(err);
    });
};

UserMod.prototype.update = function update(callback) {
    var sql = "update user set username='" + this.username + "',password='" + this.password + "',sex='" + this.sex + "',match='" + this.match + "' where id=" + this.id;
    var db = DB();
    db.query(sql, function (err) {
        callback(err);
    });
};

UserMod.del = function del(id, callback) {
    var sql = "delete from user where id=" + id;
    var db = DB();
    db.query(sql, function (err) {
        callback(err);
    });
};

UserMod.query = function query(callback) {
    var sql = "select * from user";
    var db = DB();
    db.query(sql, function (err, results) {
        callback(err, results);
    });
};

UserMod.findByName = function findByName(username, callback) {
    var sql = "select * from user where username='" + username + "'";
    var db = DB();
    db.query(sql, function (err, results) {
        var result = results && results[0];
        callback(err, result);
    });
};