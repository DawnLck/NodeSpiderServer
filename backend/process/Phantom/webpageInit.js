/**
 * Created by Dell on 2017/3/3.
 */
// let WebpageAnalysis = require('../tools/WebpageAnalysis');
const phantomExports = require("./PhantomExport");
// let mongoModel = require('../mongoose');

/* 解析网页表中的所有网站 */
let saveAllWebsites = function(tableName) {
  mongoModel.readAllDocs(tableName, function(docs) {
    console.log("Find " + docs.length + " docs!");
    /* 将网页列表中的所有网站都解析和渲染一遍 */
    for (let index = 0; index < docs.length; index++) {
      console.log(index + " " + docs[index].info + " " + docs[index].url);
      saveSingleWebsite(index, docs[index].url, "a");
    }
  });
};

/* 解析单个网页 */
let saveSingleWebsite = function(domId, url, tag, callback) {
  phantomExports.createPhantom(domId, url, tag, function(collName, data) {
    console.log("Data is collected from Phantom...");
    mongoModel.saveDomArrayToCollection(data, collName);
    callback(collName, data);
  });
};

/* 解析单个网页 */
let parseSingleWebsite = function(urlName, url, tag, callback) {
  console.log(urlName + " " + url + " " + tag);
  phantomExports.createPhantom(urlName, url, tag, function(urlName, data) {
    console.log("Data is collected from Phantom...");
    callback(urlName, data);
  });
};

/* 输入内容提取页的训练集 */
let inputContentWebsite = function() {
  let test = {
    name: "content_train_2",
    url: "https://www.zhihu.com/question/28033162/answer/258410403",
    tag: "div"
  };
  saveSingleWebsite(test.name, test.url, test.tag, function(collName, data) {
    console.log("Test:" + collName + " " + data.length);
  });
};

exports.init = function() {
  console.log("Webpage Init....");
  // inputContentWebsite();
};

exports.parseSingleWebsite = parseSingleWebsite;
