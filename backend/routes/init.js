/* Route - init
* */


var express = require('express');
var router = express.Router();

// // 该路由使用的中间件
// router.use(function timeLog(req, res, next) {
//     console.log('Time: ', Date.now());
//     next();
// });

// 定义网站主页的路由
router.get('/', function(req, res) {
    res.send('Route - init');
});
// 定义 about 页面的路由
router.get('/about', function(req, res) {
    res.send('Route - init -about');
});

/* Express server 接收请求 get & post */
app.get('/dpLinks', function (req, res) {
    webpageInit.parseSingleWebsite(req.query.webpageName, req.query.webpageUrl, 'a', function (index, data) {
        console.log('Parse website ' + index + ' ok with ' + data.length + ' data callback.');
        // console.log(data[0]);
        deepLearn.useLinkDNN_Arr(data, function (callbackData) {
            // console.log(callbackData);
            res.send(callbackData);
        });
    });
});
app.get('/dpContent', function (req, res) {
    webpageInit.parseSingleWebsite(req.query.webpageName, req.query.webpageUrl, 'div', function (index, data) {
        console.log('Parse website ' + index + ' ok with ' + data.length + ' data callback.');
        // console.log(data[0]);
        deepLearn.useContentDNN_Arr(data, function (callbackData) {
            // console.log(callbackData);
            res.send(callbackData);
        });
    });
});

module.exports = router;
