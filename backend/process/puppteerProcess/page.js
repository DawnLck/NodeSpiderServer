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
  console.log("### 获取数据记录 ###");
  let result = await process(page, "getRecords", () => {
    let recordsArr = [];
    $(".spider-record").each(function() {
      let dom = $(this);
      let links = [];
      if (dom.attr("href")) {
        let href = dom.attr("href");
        if (!href.includes("http")) {
          href = document.location.origin + "/" + href;
        }
        links.push(href);
      }
      dom.find("a").each((index, e) => {
        let href = $(e).attr("href");
        if (href && !href.includes("http")) {
          href = document.location.origin + "/" + href;
        }
        links.push(href);
      });
      let item = {
        content: dom.prop("innerText"),
        links: links
      };
      recordsArr.push(item);
    });

    let outputContentLength = recordsArr.reduce((acc, curr) => {
      return (acc += curr.content.length);
    }, 0);

    let fullContent = $(".spider-main").prop("innerText");
    let EI = outputContentLength / fullContent.length;

    if (EI > 0.7) {
      // console.log(recordsArr);
      return {
        EI: EI,
        records: recordsArr
      };
    } else {
      return {
        EI: EI,
        records: recordsArr
      };
    }
  });
  return result;
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
