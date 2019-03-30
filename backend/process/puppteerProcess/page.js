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
  console.log(`The ${stepName} time is: ${Timer.getTime(stepName)}`);
  return {
    result: result,
    time: {
      name: stepName,
      timeComsuming: Timer.getTime(stepName)
    }
  };
}

/**
 * 页面信息提取
 * @param {*} page
 */
async function pageExtract(page) {
  let timeResult = {};

  // 区域聚焦
  let focusResult = await process(page, "regionalFocus", () => {
    return regionalFocus();
  });
  timeResult.regionFocus = focusResult.time.timeComsuming;

  if (!focusResult.result) {
    console.error("ERROR: 未能找到正文区域！");
    return false;
  }

  //  可视块聚类
  let clusteringResult = await process(page, "blockClustering", () => {
    return clusteringBlocks();
  });
  timeResult.clusteringBlocks = clusteringResult.time.timeComsuming;

  // 获取数据记录
  let recordsResult = await process(page, "getRecords", () => {
    return getRecords();
  });
  timeResult.getRecords = recordsResult.time.timeComsuming;

  return {
    result: recordsResult.result,
    time: timeResult
  };
}

/**
 * 获取页面基本信息
 */
async function getPageInfo(page) {
  let pageInfo = await process(page, "getPageInfo", () => {
    let title = document.title,
      keywords = $('meta[name="keywords"]').attr("content"),
      description =
        $('meta[name="description"]').attr("content") ||
        $('meta[name="Description"]').attr("content"),
      bodyContent = $("body").prop("innerText");

    return {
      title: title,
      hostname: window.location.hostname,
      domain: window.location.hostname.split(".")[1],
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      deviceScaleFactor: window.devicePixelRatio,
      keywords: keywords,
      description: description,
      bodyContent: bodyContent
        ? bodyContent.slice(0, 100) + "...."
        : bodyContent
    };
  });
  return pageInfo;
}

module.exports.pageExtract = pageExtract;
module.exports.getPageInfo = getPageInfo;
