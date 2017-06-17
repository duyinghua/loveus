var DB = require("../util/DB");
function MsgMod(id, from_user, to_user, content, datatime) {
    this.id = id;
    this.from_user = from_user;
    this.to_user = to_user;
    this.content = content || "";
    this.datatime = datatime || global.utils.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
}
module.exports = MsgMod;
MsgMod.prototype.save = function save(callback) {
    var sql = "insert into msg values(null,'" + this.from_user + "','" + this.to_user + "','" + this.content + "','" + this.datatime + "')";
    console.log(sql);
    var db = DB();
    db.query(sql, function (err) {
        callback(err);
    });
};

MsgMod.queryByFTP = function queryByFT(from_user, to_user, pagenum, shownum, callback) {
    pagenum = isNaN(pagenum) ? 0 : pagenum;
    shownum = isNaN(shownum) ? 0 : shownum;
    var perRows = 25;
    var start = pagenum * perRows + shownum;
    var sql = "SELECT " +
        "m.id AS id, " +
        "f.id AS f_id, " +
        "f.username AS f_username, " +
        "f.sex AS f_sex, " +
        "t.id AS t_id, " +
        "t.username AS t_username, " +
        "t.sex AS t_sex, " +
        "content, " +
        "datetime " +
        "FROM msg AS m " +
        "LEFT JOIN `user` AS f ON m.from_user=f.username " +
        "LEFT JOIN `user` AS t ON m.to_user=t.username " +
        "WHERE m.from_user in ('" + from_user + "','" + to_user + "') " +
        "AND m.to_user in ('" + from_user + "','" + to_user + "') " +
        "ORDER BY datetime DESC LIMIT " + start + "," + perRows;
    var db = DB();
    db.query(sql, function (err, result) {
        callback(err, result);
    });
};
MsgMod.del = function del(id, callback) {
    var sql = "delete from contact where id=" + id;
    var db = DB();
    db.query(sql, function (err) {
        callback(err);
    });
};
