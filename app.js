/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var db = require("./util/DB");
var MySQLStore = require('connect-mysql')(express);
var app = express();
var routeCtrl = require("./controller/Ctrl");
var interceptor = require("./controller/Interceptor");
global.utils = require('./util/Utils');
var SocketServer = require("./service/SocketService");
global.TMP_FILE_PATH = __dirname + "/upload/tmp/";
app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('env', "production");
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(__dirname + "/upload"));
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser());//cookie解析的中间件
    app.use(express.cookieSession({
            secret: "dyh",
            store: new MySQLStore({ client: new db() }),
            cookie: {
//                maxAge:60000 * 60 //30 minutes
            }}
    ));

    interceptor(app);
    app.use(app.router);
    routeCtrl(app);
});
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var server = http.createServer(app);
global.socketServer = new SocketServer(server);
server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

