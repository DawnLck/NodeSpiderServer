/*
 * Mongoose Model
 * */
require('./mongooseConnect');
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/* Define The WebPage Schema 定义网页模式 */
const webpageSchema = new Schema({
    id: Number,
    category: Number,
    url: String,
    info: String,
    sourceCode: String
}, {
    versionKey: false //取消collection在初次建立时生成的_v内部版本数据属性
});
/* Define The Dom Schema 定义DOM模式 */
const domSchema = new Schema({
    dom_url: String,            //源网址
    dom_tagName: String,        //标签名
    dom_id: String,             //id属性类
    dom_class: String,          //class样式类
    dom_width: Number,          //DOM宽度
    dom_height: Number,         //DOM高度
    dom_left: Number,           //DOM横坐标
    dom_top: Number,            //DOM纵坐标
    dom_brothersNum: Number,    //同级结点数
    dom_childrenNum: Number,    //子级结点数
    dom_href: String,           //指向性链接
    dom_innerHTML: String,      //DOM的HTML
    dom_innerText: String,      //DOM的文本内容
    targetFlag: Boolean         //是否为目标节点
}, {
    versionKey: false           //是否要添加版本信息
});
const deepLearnSchema = new Schema({
    brotherNum: Number,
    childrenNum: Number,
    height: Number,
    width: Number,
    left: Number,
    top: Number,
    innerTextLength: Number,
    targetFlag: Number
}, {
    versionKey: false
});
/* Define the post-list data schema 定义帖子数据模式
* */
const postListSchema = new Schema({

    /* Dom Property*/
    baseUrl: String,
    brotherElementCount: Number,
    childElementCount: Number,
    className: String, //可能含有item
    height: Number,
    width: Number,
    id: String, //如果有id
    offsetLeft: Number,
    offsetTop: Number,
    innerText: String,
    outerHTML: String,

    /* Text Property */
    content: String,
    author: String,
    authorUrl: String,
    date: Date
},{
    versionKey: false
});


let saveArray = function (arr, collName, schema) {
    let arrLength = arr.length;
    let targetModel = mongoose.model(collName, schema, collName);

    console.log('CollName:' + collName + ' ArrayLength: ' + arrLength);

    targetModel.remove({}, function (err) {
        if (err) {
            console.log(err);
        }
    });

    for (let i = 0; i < arrLength; i++) {
        let item = arr[i];
        // console.log('Processing ' + i + '/' + arrLength);
        new targetModel(item).save(function (err) {
            if (err) {
                return handleError(err);
                // console.log(i + '/' + arrLength + ' 存入失败.');
            } else {
                // console.log(i + '/' + arrLength + ' 存入成功.');
            }
        }).catch();
    }
};
let saveDeepLearnArray = function (arr, collName) {
    saveArray(arr, collName, deepLearnSchema);
};
/*  将DOM结点数组存放进集合中  */
let saveDomArrayToCollection = function (arr, collName) {
    console.log('Save Dom Array To Collection...');
    //console.log(collName);
    saveArray(arr, collName, domSchema);
};
/* 将单个DOM结点存放进集合中 */
let saveDomItemToCollection = function (item, collName) {
    let targetModel = mongoose.model(collName, domSchema);
    new targetModel(item).save(function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Success to save the document.存入成功.');
        }
    });
};

let readAllDocs = function (collName, callback) {
    mongoose.model(collName).find({}, function (err, docs) {
        if (err) {
            console.log(err);
            callback(null);
        } else {
            callback(docs);
        }
    })
};

/* Define the data model Student 将模式与模型相关联 */
let MyMinWebPageModel = mongoose.model('min_webpages', webpageSchema);
let MyDomModel = mongoose.model('doms', webpageSchema);

exports.MyMinWebPageModel = MyMinWebPageModel;
exports.MyDomModel = MyDomModel;
exports.webpageSchema = webpageSchema;
exports.domSchema = domSchema;

exports.readAllDocs = readAllDocs;
exports.saveDeepLearnArray = saveDeepLearnArray;
exports.saveDomItemToCollection = saveDomItemToCollection;
exports.saveDomArrayToCollection = saveDomArrayToCollection;