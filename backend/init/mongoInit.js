/**
 * MongoInit.js
 * Created by Dell on 2017/3/3.
 */
let MyWebPageModel = require("../mongooseModel").MyWebPageModel;
let MyMinWebPageModel = require('../mongooseModel').MyMinWebPageModel;
let simplifyWebPageCollection = function () {
    MyWebPageModel.find({}, function (err, docs) {
        //Javascript 原生写法
        for (let i = 0, len = docs.length; i < len; i++) {
            let simplifyModel = new MyMinWebPageModel({
                id: i + 1,
                category: docs[i].category,
                info: docs[i].info,
                url: docs[i].url
            });
            (function (i) {
                simplifyModel.save(function (err) {
                    if (err) {
                        console.log(err);
                        console.log('Fail to save document' + docs[i].info + '!');
                    }
                    else {
                        console.log('Success: ' + i + '/' + docs.length + ' ...');
                    }
                });
            })(i); //这里采用了闭包
            console.log(docs[i].info);
        }
    });
};
exports.simplifyWebPageCollection = simplifyWebPageCollection;
exports.init = function () {
    console.log('Mongo Init....');
    // simplifyWebPageCollection();
};