var Charter = require("../model/Charter");
var MsgMod = require("../model/MsgMod");
function SocketServer(server) {
    var io = require('socket.io').listen(server);
    io.set("log level", 0);
    io.set('transports', ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
    this.chartServer = io.of('/chartServer');
    this.charterMap = {};
    this.listen();
}

module.exports = SocketServer;
//
/**
 * 全部发消息
 * @param msgType 消息类型
 * @param obj 消息对象
 * @param ignore 忽略数组
 */
SocketServer.prototype.allSend = function (msgType, obj, ignore) {
    if (ignore) {
        for (var charter in this.charterMap) {
            if (ignore.indexOf(charter) == -1) {
                this.charterMap[charter].socket.emit(msgType, obj);
            }
        }
    } else {
//        console.log(this.charterMap);
        for (var charter in this.charterMap) {
            this.charterMap[charter].socket.emit(msgType, obj);
        }
    }
}
SocketServer.prototype.listen = function () {
    var _proto = this;
    _proto.chartServer.on('connection', function (socket) {
        //监听新增加入
        socket.on('online', function (data) {
            //应该查一下库,这个newuser是uid
            var user = data.user;
            var charter = new Charter(user, true, this);
            _proto.charterMap[user.username] = charter;
            _proto.allSend('onlineState', {user: user, state: true});
        });
        //监听聊天
        socket.on('msg', function (data) {
            var now = global.utils.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss");
            var from = data.from;//发信人
            var to = data.to;//收信人
            var content = data.content;
            var fromCharter = _proto.charterMap[from];
            var toCharter = _proto.charterMap[to];
            //通知发信人信息
            fromCharter && fromCharter.socket.emit('msg', {datetime: now, from: from, to: to, content: content});
            var msg = new MsgMod(null, from, to, content, now);
            msg.save(function (err) {
                if (err) {
                    fromCharter.socket.emit('sysinfo', {content: "对不起，服务器异常！"});
                }
                if (toCharter) {
                    //通知目标人信息
                    toCharter.socket.emit('msg', {datetime: now, from: from, to: to, content: content});
                }
            });
        });
    });
};
