/**
 * Created by Dell on 2017/3/3.
 */
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');

/* 请求网页源码Document
 * 必须写成闭包形式，否则返回值为空
 * */
var requestHtmlBodySrc = function (url, callback) {
    //console.log('url: ' + url);
    request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            callback(body);
        }
        else {
            callback(null);
        }
    });
};              
// 将请求作为文件流进行输出
var requestStream = function (url, filename) {
    request(url).pipe(fs.createReadStream(filename));
};
// 解析网页 通过cheerio 暂时不用这两个，用phantom，见PhantomExport.js
var analysisWebpageByDiv = function (url, callback) {
    request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var resultArray = [];
            var $ = cheerio.load(body);
            var domArray = $('div');
            var domArrayLength = domArray.length;
            console.log('Div Array Length: ' + domArrayLength);
            for(var i = 0;i < domArrayLength; i++) {
                var result = {
                    dom_name: domArray[i].name,
                    dom_id: domArray[i].attribs.id,
                    dom_class: domArray[i].attribs.class,

                    dom_brothersNum: (domArray[i].children.length - 1) / 2,
                    dom_childrenNum: (domArray[i].parent.children.length - 1) / 2
                };
                resultArray.push(result);
                // result.dom_name = divArray[0].name;
                // result.dom_id = divArray[0].attribs.id;
                // result.dom_class = divArray[0].attribs.class;
                // result.dom_childrenNum = (divArray[0].children.length - 1) / 2;
                // result.dom_brothersNum = (divArray[0].parent.children.length - 1) / 2;
            }
            // console.log(divArray);
            callback(resultArray);
        }
        else {
            console.log(error);
            callback(null);
        }
    });
};
var analysisWebpageByA = function (url, callback) {
    request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var resultArray = [];
            var $ = cheerio.load(body);
            var domArray = $('a');
            var domArrayLength = domArray.length;
            console.log('Div Array Length: ' + domArrayLength);
            for(var i = 0;i < domArrayLength; i++) {
                var result = {
                    dom_name: domArray[i].name,
                    dom_id: domArray[i].attribs.id,
                    dom_class: domArray[i].attribs.class,

                    dom_brothersNum: (domArray[i].children.length - 1) / 2,
                    dom_childrenNum: (domArray[i].parent.children.length - 1) / 2
                };
                resultArray.push(result);
                // result.dom_name = divArray[0].name;
                // result.dom_id = divArray[0].attribs.id;
                // result.dom_class = divArray[0].attribs.class;
                // result.dom_childrenNum = (divArray[0].children.length - 1) / 2;
                // result.dom_brothersNum = (divArray[0].parent.children.length - 1) / 2;
            }
            // console.log(divArray);
            callback(resultArray);
        }
        else {
            console.log(error);
            callback(null);
        }
    });
};

exports.requestHtmlBodySrc = requestHtmlBodySrc;
exports.requestStream = requestStream;
exports.analysisWebpageByDiv = analysisWebpageByDiv;
exports.analysisWebpageByA = analysisWebpageByA;