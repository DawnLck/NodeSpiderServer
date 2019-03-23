/**
 * getPageInfo 获取页面的基本信息
 * @param {*} page
 */
async function getPageInfo(page) {
  return page.evaluate(async () => {
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
}

module.exports.getPageInfo = getPageInfo;
