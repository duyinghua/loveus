var controllers = require('./Controllers');

module.exports = function (app) {
    app.get('/', controllers.main);
    app.get('/index', controllers.index);
    app.post('/login', controllers.login);
    app.post('/queryDiarys', controllers.queryDiarys);
    app.post('/photoUpload', controllers.photoUpload);
    app.post('/sendDiary', controllers.sendDiary);
    app.post('/queryMsg', controllers.queryMsg);
};

