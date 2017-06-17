function Charter(user, state, socket) {
    this.user = user;
    this.state = state;
    this.socket = socket;
    this.listen();
}
Charter.prototype.listen = function () {
    var _proto = this;
    _proto.socket.on('disconnect', function () {
        delete global.socketServer.charterMap[_proto.user.username];
        global.socketServer.allSend('onlineState', {user: _proto.user, state: false});
    });
}
module.exports = Charter;
