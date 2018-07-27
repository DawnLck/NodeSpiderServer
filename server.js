/*
 * app.js
 * The main file running on the express server
 * */

const express = require('express');

const webpageInit = require('./backend/init/webpageInit'),
    deepLearn = require('./backend/brainJs/brainInit'),
    puppeteer = require('./backend/tools/Puppeteer');
    // chromeHeadless = require('./backend/tools/ChromeHeadless');

const initRoute = require('./backend/routes/init'),
    dataRoute = require('./backend/routes/data'),
    processRoute = require('./backend/routes/process');

let app = express();
app.use('/init', initRoute);
app.use('/data', dataRoute);
app.use('/process', processRoute);

/* 打开nodeJs服务器 */
let server = app.listen(8081, function () {
    let host = server.address().address;
    let port = server.address().port;
    console.log('App listening at http://%s:%s', host, port);
});

/* Test */
let test = function () {
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
async function init() {
    // await console.log('Init the backend-app...');
    // await puppeteer.init();
    // mongoInit.init();
    // webpageInit.init();
    // deepLearn.init();
    // test();
    // chromeHeadless.preRender();
}
init(()=>{});

// console.log('End...');
