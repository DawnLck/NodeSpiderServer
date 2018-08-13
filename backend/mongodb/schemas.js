/**
 *  Mongoose Schemas
 **/

const Schema = require('./connect').Schema;

let schemas = {};

/* Define The WebPage Schema 定义网页模式 */
schemas.webpages = new Schema({
    title: String,
    url: String,
    domain: String,
    category: String,
    meta_keyword: String,
    meta_description: String,
    score: {
        bbs: Number,
        articles: Number,
        news: Number
    }
}, {
    versionKey: false //取消collection在初次建立时生成的_v内部版本数据属性
});

/* Define the Dom Schema 定义节点的模式 */
schemas.doms = new Schema({
    /* meta信息 */
    document_width: String,
    document_height: String,
    meta_href: String,
    meta_domain: String,
    title: String,

    /* Property 属性 */
    classList: [String],
    offsetTop: String,
    offsetLeft: String,

    realTop: String,
    realLeft: String,

    width: String,
    height: String,

    dom_level: String,
    childElementCount: String,
    siblingsCount: String,

    innerText: String,
    textDensity: String,
    textMainPercentage: String,
    textBodyPercentage: String,

    anchorMarkerCount: String,
    linkElementCount: String,
    links: [String],
    imageElementCount: String,

    /* parent Prop */
    relativeTextPercentage: String,

    parentWidth: String,
    parentHeight: String,
    parentAnchorMarkerCount: String,
    parentImageCount: String,

    /* category */
    dom_category:  String
}, {
    versionKey: false //取消collection在初次建立时生成的_v内部版本数据属性
});


/* Define The Dom Schema 定义DOM模式 */
// schemas.doms = new Schema({
//     dom_url: String,            //源网址
//     dom_tagName: String,        //标签名
//     dom_id: String,             //id属性类
//     dom_class: String,          //class样式类
//     dom_width: Number,          //DOM宽度
//     dom_height: Number,         //DOM高度
//     dom_left: Number,           //DOM横坐标
//     dom_top: Number,            //DOM纵坐标
//     dom_brothersNum: Number,    //同级结点数
//     dom_childrenNum: Number,    //子级结点数
//     dom_href: String,           //指向性链接
//     dom_innerHTML: String,      //DOM的HTML
//     dom_innerText: String,      //DOM的文本内容
//     targetFlag: Boolean         //是否为目标节点
// }, {
//     versionKey: false           //是否要添加版本信息
// });

/* Define the deep learn schema  */
schemas.deepLearns = new Schema({
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

/* Define the post-list data schema 定义帖子数据模式 */
schemas.postLists = new Schema({
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
}, {
    versionKey: false
});

module.exports = schemas;
