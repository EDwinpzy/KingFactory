/*
 * @Author: EDwin
 * @Date: 2022-11-07 15:32:57
 * @LastEditors: EDwin
 * @LastEditTime: 2022-11-07 15:32:58
 */
const express = require('express');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');  //解析cookie
// const responseTime = require('response-time');
const routes = require('../routers'); // 引入路由
class ExpressApp {
    constructor() {}
    /**
     * @memberof ExpressApp
     * @description 初始化Express
     * @author sheng.hou
     * @createDate 	  	2022/09/16
     */
    init(port) {
        const app = express();
        // 解析post请求
        app.use(
            bodyParser.urlencoded({
                extended: false,
            })
        );
        app.use(bodyParser.json());
        // 打印接口耗时
        // app.use(responseTime(function (req, res, time) {
        //     console.info(`"${req.method} ${req.url}" ${time}ms`);
        // }));
        // 解决跨域
        app.all('*', function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
            res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
            if (req.method == 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });
        // 注册路由
        app.use('/', routes);
        // catch 404 and forward to error handler
        app.use(function (err, req, res, next) {
            console.error('Error:', err);
            res.status(err.code);
            res.send(err.message);
        });

        let listenMessage = app.listen(port, function () {
            console.info('Express server listening on port:', port);
        });
        if (!listenMessage.listening) {
            console.error(`端口${port}已被占用，启动服务失败！`);
            process.exit(1);
        }
    }
}
module.exports = new ExpressApp();
