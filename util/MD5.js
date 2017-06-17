/**
 * md5静态类
 * @type {*}
 */
var crypto = require("crypto");
var MD5 = {
    run:function (str) {
        var md5 = crypto.createHash("md5");
        return md5.update(str).digest("hex");
    }
};
module.exports = MD5;
