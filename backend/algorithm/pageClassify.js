/*
Page Classify 网页分类算法
* */
const { CLASSIFICATION } = require("./Classification");

/* 权重计算函数 */
async function calculateWeights(count, text, weight) {
  if (!text) {
    return count;
  }
  let queue = ["bbs", "articles", "news"];
  for (let _index = 0; _index < queue.length; _index++) {
    let _tem = CLASSIFICATION[queue[_index]];
    for (let j = 0; j < _tem.primaryKeys.length; j++) {
      if (text.indexOf(_tem.primaryKeys[j]) > -1) {
        count[queue[_index]] += 2 * weight;
      }
    }
    for (let x = 0; x < _tem.secondKeys.length; x++) {
      if (text.indexOf(_tem.secondKeys[x]) > -1) {
        count[queue[_index]] += 1 * weight;
      }
    }
  }
  return count;
}

/**
 * 计算网页权重
 */
async function pageClassify(pageInfo) {
  console.log("## 网页分类 ##");
  let hostname = pageInfo.hostname;
  let result = {};
  for (let key in CLASSIFICATION) {
    result[key] = hostname.indexOf(key) > -1 ? 1000 : 0;
  }
  result = await calculateWeights(result, pageInfo.title, 3);
  result = await calculateWeights(result, pageInfo.keywords, 2);
  result = await calculateWeights(result, pageInfo.description, 1);

  if (result.bbs + result.articles + result.news === 0) {
    result = await calculateWeights(result, pageInfo.bodyContent, 1);
  }

  let max = 0,
    category = null;

  for (let key in result) {
    if (result[key] > max) {
      category = key;
      max = result[key];
    }
  }

  return {
    category: category,
    scores: result
  };
}

module.exports.calculateWeights = calculateWeights;
module.exports.pageClassify = pageClassify;
