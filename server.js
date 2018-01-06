/*
 * app.js
 * The main file running on the express server
 * */

var express = require('express');

var webpageInit = require('./backend/init/webpageInit');
var mongoInit = require('./backend/init/mongoInit');
var deepLearn = require('./backend/init/brainInit');

var app = express();

/* Express server 接收请求 get & post */
app.get('/deepLearnLinks', function (req, res) {
    webpageInit.parseSingleWebsite(req.query.webpageName, req.query.webpageUrl, 'a', function (index, data) {
        console.log('Parse website ' + index + ' ok with ' + data.length + ' data callback.');
        // console.log(data[0]);
        deepLearn.useLinkDNN_Arr(data, function (callbackData) {
            // console.log(callbackData);
            res.send(callbackData);
        });
    });
});
app.get('/deepLearnContent', function (req, res) {
    webpageInit.parseSingleWebsite(req.query.webpageName, req.query.webpageUrl, 'div', function (index, data) {
        console.log('Parse website ' + index + ' ok with ' + data.length + ' data callback.');
        // console.log(data[0]);
        deepLearn.useContentDNN_Arr(data, function (callbackData) {
            // console.log(callbackData);
            res.send(callbackData);
        });
    });
});

/* 打开nodeJs服务器 */
var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('App listening at http://%s:%s', host, port);
});

/* Test */
var test = function () {
    webpageInit.parseSingleWebsite('test', 'https://www.zhihu.com/question/59615727/answer/167124652', 'div', function (index, data) {
        console.log('Parse website ' + index + ' ok with ' + data.length + ' data callback.');
        // console.log(data[0]);
        deepLearn.useContentDNN_Arr(data, function (callbackData) {
            console.log('Content-DNN is over....');
            // console.log(callbackData);
        });
    });
};

/* 后台运行脚本 */
var init = function () {
    console.log('Init the backend-app...');
    mongoInit.init();
    webpageInit.init();
    deepLearn.init();
    // test();
};
init();

// console.log('End...');