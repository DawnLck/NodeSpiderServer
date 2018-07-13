/* Deep learn Route */
const express = require('express'),
    router = express.Router(),
    deepLearn = require('./backend/init/brainInit'),
    webpageInit = require('./backend/init/webpageInit');

/* Express server 接收请求 get & post */
router.get('/dpLinks', function (req, res) {
    webpageInit.parseSingleWebsite(req.query.webpageName, req.query.webpageUrl, 'a', function (index, data) {
        console.log('Parse website ' + index + ' ok with ' + data.length + ' data callback.');
        // console.log(data[0]);
        deepLearn.useLinkDNN_Arr(data, function (callbackData) {
            // console.log(callbackData);
            res.send(callbackData);
        });
    });
});

router.get('/dpContent', function (req, res) {
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