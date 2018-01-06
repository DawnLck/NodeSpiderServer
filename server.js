/*
 * app.js
 * The main file running on the express server
 * */

var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var MyMongoModel = require('./backend/mongooseModel');
var webpageInit = require('./backend/init/webpageInit');
var mongoInit = require('./backend/init/mongoInit');
var deepLearn = require('./backend/init/brainInit');

var app = express();
var urlencodedParser = bodyParser.urlencoded({extended: false});
// var jsonParser = bodyParser.json();

/* 设置静态文件托管 */
app.use(express.static('frontend'));
/* Express server 接收请求 get & post */
app.get('/', function (req, res) {
    /* 输出服务器基本信息 */
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
    /* 返回页面 */
    res.send('frontend/index.html');
});
app.get('/create', function (req, res) {
    console.log('Create new DB-item....');
    var webPageItem = new MyWebPageModel({
        id: MyMongoModel.MyWebPageModel.count() + 1,
        category: 1,
        url: 'http://weibo.com/',
        info: "随时随地发现新鲜事！微博带你欣赏世界上每一个精彩瞬间，了解每一个幕后故事。分享你想表达的，让全世界都能听到你的心声！",
        sourceCode: null
    });

    webPageItem.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('存入成功');
        }
    });
    res.send('Insert End...');
});
app.post('/insert', urlencodedParser, function (req, res) {
    if (!req.body) {
        return res.sendStatus(400);
    }
    console.log('Get new web page item....');
    // console.log(req.originalUrl);
    console.log(req.url);
    console.log(req.body);

    request(req.body.url, function (error, res) {
        if (!error && res.statusCode === 200) {
            MyMongoModel.MyMinWebPageModel.count({}, function (err, count) {
                if (err) {
                    console.log(err.message);
                }
                else {
                    console.log('Document count: ' + count);
                    new MyMongoModel.MyMinWebPageModel({
                        id: count + 1,
                        category: req.body.category,
                        url: req.body.url,
                        info: req.body.info
                    }).save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Success to save the document.存入成功.');
                        }
                    });
                }
            });
        }
    });

    res.send('Insert End...');
});
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