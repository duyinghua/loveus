/**
 * 数据库配置
 * @type {Function}
 */
var mysql = require('mysql');
var connection;
module.exports = function () {
    if ((connection) && (connection._socket)
        && (connection._socket.readable)
        && (connection._socket.writable)) {
        return connection;
    } else {
        connection = mysql.createConnection({
            database: 'loveus',
            user: 'root',
            password: 'root'
        });
        /* connection = mysql.createConnection({
         host: "us01-user01.crtks9njytxu.us-east-1.rds.amazonaws.com",
         hostname: "us01-user01.crtks9njytxu.us-east-1.rds.amazonaws.com",
         port: 3306,
         database: "d9b998317587c462baa96be72d10d72ca",
         user: "umuqhKghgfe0z",
         password: "pw7jRkGp2xmbp"
         });*/
        connection.connect();
        handleDisconnect(connection);
        return connection;
    }

}
function handleDisconnect(connection) {
    connection.on('error', function (err) {
        if (!err.fatal) {
            return;
        }

        if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
            global.log.error(err);
            throw err;
        }

        connection = mysql.createConnection(connection.config);
        connection.connect();
        handleDisconnect(connection);
    });
}
