/*
Page Classify 网页分类算法  
* */

const GLOBAL_KEYS = {
    bbs: {
        primaryKeys: [
            'bbs',
            'BBS',
            '论坛'
        ],
        secondKeys: [
            '社区',
            '家园'
        ]
    },
    articles: {
        primaryKeys: [
            '博客',
            '文章',
            '作者',
            '首发',
            '转载'
        ],
        secondKeys: [
            '佳作',
            '正文',
            '专栏',
            '收藏',
            '关注'
        ]
    },
    news: {
        primaryKeys: [
            '新闻',
            '记者',
            '编辑',
            '晚报',
            '早报'
        ],
        secondKeys: [
            '频道',
            '观点',
            '人民',
            '突发',
            '实时'
        ]
    }
};

/* 网页分类计算权重 */
async function calculateWeights(count, text) {
    if (!text) {
        return count;
    }
    let queue = ['bbs', 'articles', 'news'];
    for (let _index = 0; _index < queue.length; _index++) {
        let _tem = GLOBAL_KEYS[queue[_index]];
        for (let j = 0; j < _tem.primaryKeys.length; j++) {
            if (text.indexOf(_tem.primaryKeys[j]) > -1) {
                count[queue[_index]] += 2;
            }
        }
        for (let x = 0; x < _tem.secondKeys.length; x++) {
            if (text.indexOf(_tem.secondKeys[x]) > -1) {
                count[queue[_index]] += 1;
            }
        }
    }
    return count;
}
async function process(pageCallback){
    console.log('... 网页分类 ...');
    let result = {
        bbs: 0,
        articles: 0,
        news: 0
    },
        queue = [
            'bbs',
            'article',
            'news'
        ];
    // console.log(pageCallback.title);
    // console.log(pageCallback.keywords);
    // console.log(pageCallback.description);
    result = await calculateWeights(result, pageCallback.title);
    result = await calculateWeights(result, pageCallback.keywords);
    result = await calculateWeights(result, pageCallback.description);


    if ((result.bbs + result.articles + result.news) === 0) {
        // console.log('基于内容进行第二次网页分类 ... ');
        console.log('The second classify based on content ... ');

        result = await pcalculateWeights(result, pageCallback.bodyContent);
    }

    let max = 0;
    result.category = null;
    for(let i = 0;i<queue.length;i++){
        let cate = queue[i];
        if(result[cate] > max){
            result.category = cate;
            max = result[cate];
        }
        cate = null;
    }
    max = null;

    return result;
}

exports.calculateWeights = calculateWeights;
exports.process = process;