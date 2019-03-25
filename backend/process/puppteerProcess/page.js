/**
 * page.js
 * 整合页面信息提取流程
 */
const { Timer } = require("../../utils/Timings");
/**
 * removeIframe 移除页面上的iframe
 */
async function removeIframe() {
  setTimeout(function() {
    $("body")
      .find("iframe")
      .remove("");
  }, 2000);
}
/**
 * pageExtraction
 * @param {any} page
 */
async function process(page, stepName, func) {
  console.log(`### ${stepName} ###`);
  Timer.start(stepName);
  let result = await page.evaluate(func);
  Timer.stop(stepName);
  console.log(`The ${stepName} time is: ${Timer.getTime(stepName)} ms`);
  return result;
}

/**
 * 页面信息提取
 * @param {*} page
 */
async function pageExtract(page) {
  // 区域聚焦
  let mainArea = await process(page, "regionalFocus", () => {
    return regionalFocus();
  });

  if (!mainArea) {
    console.error("ERROR: 未能找到正文区域！");
    return false;
  }

  //  可视块聚类
  let resultClustering = await process(page, "blockClustering", () => {
    return clusteringBlocks();
  });

  // 获取数据记录
  let records = await process(page, "getRecords", () => {
    return getRecords();
  });
  return records;
}

module.exports.pageExtract = pageExtract;
