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
  Timer.start(stepName);
  let result = await page.evaluate(func);
  Timer.stop(stepName);
  console.log(`The ${stepName} time is: ${Timer.getTime(stepName)} ms`);
  return result;
}

async function getRecords(page) {
  let records = await process(page, "getRecords", () => {
    let recordsArr = [];
    console.log($(".spider-record"));
    $(".spider-record").each(function() {
      let dom = $(this);
      let item = {
        content: dom.prop("innerText")
      };
      recordsArr.push(item);
    });
    console.log(recordsArr);
    return recordsArr;
  });
  return records;
}
async function pageExtract(page) {
  // 区域聚焦
  await process(page, "regionalFocus", () => {
    regionalFocus();
  });

  //  可视块聚类
  let resultClustering = await process(page, "blockClustering", () => {
    return clusteringBlocks();
  });

  // 获取数据记录
  let records = await getRecords(page);

  return records;
}

module.exports.pageExtract = pageExtract;
