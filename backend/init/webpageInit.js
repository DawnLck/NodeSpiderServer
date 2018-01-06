/**
 * Created by Dell on 2017/3/3.
 */
// var WebpageAnalysis = require('../tools/WebpageAnalysis');
var phantomExports = require('../tools/PhantomExport');
var mongoModel = require('../mongooseModel');

/* 解析网页表中的所有网站 */
var saveAllWebsites = function (tableName) {
    mongoModel.readAllDocs(tableName, function (docs) {
        console.log('Find ' + docs.length + ' docs!');
        /* 将网页列表中的所有网站都解析和渲染一遍 */
        for (var index = 0; index < docs.length; index++) {
            console.log(index + ' ' + docs[index].info + ' ' + docs[index].url);
            saveSingleWebsite(index, docs[index].url, 'a');
        }
    });
};

/* 解析单个网页 */
var saveSingleWebsite = function (domId, url, tag, callback) {
    phantomExports.createPhantom(domId, url, tag, function (collName, data) {
        console.log('Data is collected from Phantom...');
        mongoModel.saveDomArrayToCollection(data, collName);
        callback(collName, data);
    })
};

/* 解析单个网页 */
var parseSingleWebsite = function (urlName, url, tag, callback) {
    console.log(urlName + ' ' + url + ' ' + tag);
    phantomExports.createPhantom(urlName, url, tag, function (urlName, data) {
        console.log('Data is collected from Phantom...');
        callback(urlName, data);
    })
};


/* 输入内容提取页的训练集 */
var inputContentWebsite =function () {
    var test = {
        name: 'content_train_2',
        url: 'https://www.zhihu.com/question/28033162/answer/258410403',
        tag:'div'
    };
    saveSingleWebsite(test.name, test.url, test.tag, function (collName, data) {
        console.log('Test:' + collName + ' ' + data.length);
    });
};

exports.init = function () {
    console.log('Webpage Init....');
    // inputContentWebsite();
};

exports.parseSingleWebsite = parseSingleWebsite;

