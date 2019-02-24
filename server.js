/*
 * app.js
 * The main file running on the express server
 * */

const express = require("express"),
  fs = require("fs"),
  http = require("http"),
  https = require("https");

const privateKey = fs.readFileSync("https/private.pem", "utf8"),
  certificate = fs.readFileSync("https/file.crt", "utf8"),
  credentials = { key: privateKey, cert: certificate };

const webpageInit = require("./backend/init/webpageInit"),
  brainInit = require("./backend/brainJs/init"),
  puppeteer = require("./backend/process/puppteerProcess/Puppeteer");
// deepLearn = require('./backend/brainJs/brainInit'),

// chromeHeadless = require('./backend/tools/ChromeHeadless');

const initRoute = require("./backend/routes/init"),
  dataRoute = require("./backend/routes/data"),
  processRoute = require("./backend/routes/process");

const app = express();
const httpServer = http.createServer(app),
  httpsServer = https.createServer(credentials, app),
  PORT = 8081,
  SSLPORT = 8082;

app.use("/init", initRoute);
app.use("/data", dataRoute);
app.use("/process", processRoute);

/* 打开nodeJs服务器 */

// let server = app.listen(8081, function () {
//     let host = server.address().address;
//     let port = server.address().port;
//     console.log('App listening at http://%s:%s', host, port);
// });

httpServer.listen(PORT, function() {
  console.log("HTTP Server is running on: http://localhost:%s", PORT);
});

httpsServer.listen(SSLPORT, function() {
  console.log("HTTPS Server is running on: https://localhost:%s", SSLPORT);
});

/* Test */
// let test = function () {
//     webpageInit.parseSingleWebsite('test', 'https://www.zhihu.com/question/59615727/answer/167124652', 'div', function (index, data) {
//         console.log('Parse website ' + index + ' ok with ' + data.length + ' data callback.');
//         // console.log(data[0]);
//         deepLearn.useContentDNN_Arr(data, function (callbackData) {
//             console.log('Content-DNN is over....');
//             // console.log(callbackData);
//         });
//     });
// };

/* 后台运行脚本 */
async function init() {
  // await brainInit.init();

  // await console.log('Init the backend-app...');
  await puppeteer.init();

  // mongoInit.init();
  // webpageInit.init();
  // deepLearn.init();
  // test();
  // chromeHeadless.preRender();
}

init(() => {});

// console.log('End...');
