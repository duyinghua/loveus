module.exports = function (app) {
//session拦截器
    app.use(function (req, res, next) {
        res.locals({
            user: req.session.user
        });
        next();
    });
    //登录拦截器
    app.use(function (req, res, next) {
        var url = req.originalUrl;
//        req.session.user = null;
        if (url != "/" && url != "/index" && url != "/login" && !req.session.user) {
            if (req.method == "POST") {
                res.send('login');
            } else {
                res.redirect("/index");
            }
        }
        next();
    });
};

