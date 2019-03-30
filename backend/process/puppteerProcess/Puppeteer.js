/* Puppeteer */

const puppeteer = require("puppeteer"),
  fs = require("fs"),
  path = require("path"),
  { Timer } = require("../../utils/Timings"),
  { pageClassify } = require("../../algorithm/modules/pageClassify"),
  { pageExtract, getPageInfo } = require("./page"),
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
      interceptedRequest.url().endsWith(".gif") ||
      interceptedRequest.url().endsWith(".mp4")
    )
      interceptedRequest.abort();
    else interceptedRequest.continue();
  });
  await page.setViewport({
    width: 1366,
    height: 768 * 2
  });
  console.log("### Puppeteer init ###");
})();

/** 网页数据提取
 * pageInfo 页面相关信息
 * pageClassification 页面分类结果
 * */
async function dataExtract(page) {
  const pageInfo = await getPageInfo(page);
  const pageClassification = await pageClassify(pageInfo.result);
  const pageExtraction = await pageExtract(page);

  return {
    pageInfo: pageInfo.result,
    pageClassification: pageClassification ? pageClassification : null,
    pageExtraction: pageExtraction.result.records,
    pageExtractionEI: pageExtraction.result.EI,
    time: pageExtraction.time
  };
}

/**
 * 提取单页的数据
 * */
async function pageSpider(webPageUrl) {
  await Timer.start("pageSpider");
  console.log("网页信息提取： " + webPageUrl);

  /** 页面操作相关
   * */
  await Promise.race([
    page.goto(webPageUrl, config.pageConfig).catch(e => void e),
    new Promise(x => setTimeout(x, 20 * 1000))
  ]);

  if (webPageUrl.includes("weibo")) {
    await page.waitFor(10000);
  }

  await page.addScriptTag({
    path: "node_modules/jquery/dist/jquery.slim.min.js"
  });

  await page.addScriptTag({
    path: "backend/algorithm/GLOBAL_CONST.js"
  });

  await page.addScriptTag({
    path: "backend/algorithm/modules/getRecords.js"
  });

  await page.addScriptTag({
    path: "backend/algorithm/modules/regionalFocus.js"
  });

  await page.addScriptTag({
    path: "backend/algorithm/modules/blockClustering.js"
  });

  // await page.addScriptTag({path: 'node_modules/brain.js/browser.min.js'});
  await page.addStyleTag({
    path: "backend/process/stylesheets/content.min.css"
  });
  // page.on('console', msg => console.log('PAGE LOG:', msg.text())); //打印内部的console

  let result = await dataExtract(page);
  await Timer.stop("pageSpider");
  console.log(`Page Spider Time: ${Timer.getTime("pageSpider")} ms`);

  result.screenShot = await renderScreenShot(result.pageInfo);
  result.dataFile = await storeDataFile(result.pageInfo, result);

  return result;
}

/**
 * 存储截图
 */
async function renderScreenShot(pageInfo) {
  //如果screen shot 为true，则截图
  let screenShotUrl = null;
  if (config.screenShot) {
    let imageName = `${pageInfo.title
      .replace(/[\s\/\:\*\?\"<>\|\#，。]*/g, "")
      .substring(0, 8)}.png`;
    // console.log(`图片名称: ${imageName}`);
    await page.screenshot({
      path: path.resolve("outputs/render", imageName),
      type: "png",
      fullPage: true
    });
    if (process.env.NODE_ENV === "develop") {
      screenShotUrl = `http://localhost:8090/static/${imageName}`;
    } else {
      screenShotUrl = `http://liangck.com:8090/static/${imageName}`;
    }
  }
  return screenShotUrl;
}

/**
 * 存储提取的数据
 */
async function storeDataFile(pageInfo, result) {
  let dataFileUrl = null;

  if (config.screenShot) {
    let fileName = `${pageInfo.title
      .replace(/[\s\/\:\*\?\"<>\|\#，。]*/g, "")
      .substring(0, 8)}.json`;

    fs.writeFile(
      path.resolve("outputs/dataFile", fileName),
      JSON.stringify(result, null, 4),
      {
        encoding: "utf8"
      },
      err => {
        if (err) throw err;
        console.log("## DataFile 写入完成 ##");
      }
    );

    if (process.env.NODE_ENV === "develop") {
      dataFileUrl = `http://localhost:8090/static/${fileName}`;
    } else {
      dataFileUrl = `http://liangck.com:8090/static/${fileName}`;
    }
  }
  return dataFileUrl;
}

/**
 * 主进程
 * */
async function init() {
  // await dataExtract("https://segmentfault.com/a/1190000009650938", page);
  // await verification(page);
}

module.exports.init = init;
module.exports.pageSpider = pageSpider;
