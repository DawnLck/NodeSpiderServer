/* Puppeteer */

const puppeteer = require("puppeteer"),
  path = require("path"),
  fs = require("fs"),
  Timer = require("../../tools/Timings"),
  pageClassify = require("../../algorithm/pageClassify"),
  { getPageInfo } = require("../../algorithm/pageInfo"),
  getDirPath = require("../../utils/getDirPath"),
  brain = require("brain.js"),
  config = require("./config"),
  { testDomsModel, testPagesModel } = require("../../mongodb");

let page;
/**
 * Puppeteer: page init
 */
(async () => {
  const browser = await puppeteer.launch(config.browserConfig);
  page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", interceptedRequest => {
    if (
      interceptedRequest.url().endsWith(".png") ||
      interceptedRequest.url().endsWith(".jpg") ||
      interceptedRequest.url().endsWith(".jpeg") ||
      interceptedRequest.url().endsWith(".gif")
    )
      interceptedRequest.abort();
    else interceptedRequest.continue();
  });
  // await page.waitFor(1000);
  await page.setViewport({
    width: 1366,
    height: 768 * 2
  });
  console.log("### Puppeteer init ###");
})();

/** 网页数据提取
 * */
async function dataExtract(url, page) {
  await Timer.start("dataExtract");
  console.log("网页信息提取： " + url);

  /** 页面操作相关
   * */
  await Promise.race([
    page.goto(url, config.pageConfig).catch(e => void e),
    new Promise(x => setTimeout(x, 20 * 1000))
  ]);

  await page.addScriptTag({
    path: "node_modules/jquery/dist/jquery.slim.min.js"
  });

  // await page.addScriptTag({path: 'node_modules/brain.js/browser.min.js'});
  await page.addStyleTag({
    path: "backend/process/stylesheets/content.css"
  });
  // page.on('console', msg => console.log('PAGE LOG:', msg.text())); //打印内部的console

  /**
   * 获得页面的相关信息
   * */
  const pageInfo = await getPageInfo(page);

  //如果screen shot 为true，则截图
  if (config.screenShot) {
    await page.screenshot({
      path: path.resolve("backend/render", pageInfo.title + ".png"),
      type: "png",
      fullPage: true
    });
  }

  return {
    pageInfo: pageInfo
  };

  /**
   * 获得页面的分类结果
   * */
  const classifyCallback = await pageClassify.process(pageInfo);
}

/**
 * 提取单页的数据
 * */
async function webpageDataExtraction(webPageUrl) {
  let result = await dataExtract(webPageUrl, page);
  console.log(result);
  return result;
}

/**
 * 主进程
 * */
async function init() {
  // await dataExtract("https://segmentfault.com/a/1190000009650938", page);
  // await verification(page);
}

module.exports.init = init;
module.exports.webpageDataExtraction = webpageDataExtraction;
