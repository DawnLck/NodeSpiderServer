/**
 *  Get Records 获取数据记录
 */

/**
 * Clean Content 清洁文本
 * @param {*} content
 */
function cleanContent(content) {
  let result = content;
  result.replace(/[\s↵]/g, "");
  return result;
}

/**
 * 链接数组去重
 * @param {*} links
 */
function uniqLinks(links) {
  let textSet = new Set();
  let hrefSet = new Set();
  for (let i = 0, length = links.length; i < length; i++) {
    let item = links[i];
    if (textSet.has(item.text) || hrefSet.has(item.href)) {
      links[i].label = 0;
      continue;
    }
    links[i].label = 1;
    textSet.add(item.text);
    hrefSet.add(item.href);
  }
  return links.filter(item => item.label == 1);
}

/**
 * 获取链接
 */
function getLinks(dom) {
  let links = [];
  $(dom)
    .find("a")
    .each((index, e) => {
      let href = $(e).attr("href");

      if (href && !href.includes(document.location.host)) {
        href = document.location.origin + "/" + href;
      }

      let item = {
        text: $(e).text(),
        href: href
      };

      if (
        item.text &&
        item.text.length &&
        item.href &&
        !item.href.includes("javascript:") &&
        !item.text.includes("下载") &&
        !item.text.includes("保存") &&
        !item.text.includes("赞") &&
        !item.text.includes("踩") &&
        !item.text.includes("回复") &&
        !item.text.includes("收藏") &&
        !item.text.includes("分享")
      ) {
        links.push(item);
      }
    });
  return uniqLinks(links);
}

/**
 * 过滤链接
 * @param {*} page
 */
async function filterLinks(recordsArr) {
  for (let i = 0, length = recordsArr.length; i < length; i++) {
    let item = recordsArr[i].links;
    for (let j = 0, linkLength = item.length; j < linkLength; j++) {
      let linkItem = item[j];
      if (
        !linkItem.text ||
        !linkItem.text.length ||
        linkItem.href.includes("javascript:void(0)")
      ) {
        linkItem.label = "-1";
      } else {
        linkItem.label = "1";
      }
    }
    recordsArr[i].links = item.filter(link => link.label == "1");
  }
}

/**
 * getRecords 获取数据记录
 * @param {*} page
 */
async function getRecords() {
  console.log("### 获取数据记录 ###");
  let recordsArr = [];

  let recordWidth = $(".spider-record").prop("offsetWidth");
  let max_height = $(".spider-record").prop("offsetHeight");
  let max_height_dom = null;
  console.log(`Record Width：${recordWidth} \n Max_height: ${max_height}`);

  $(".spider-main")
    .find(".spider")
    .each((index, e) => {
      let _self = $(e);
      if (
        !_self.find(".spider-record").length &&
        _self.prop("offsetHeight") > max_height
      ) {
        max_height = _self.prop("offsetHeight");
        max_height_dom = _self;
        console.log(`# ${max_height} - ${_self.text()}`);
      }
    });
  console.log(max_height_dom);
  if (max_height_dom) {
    max_height_dom.addClass("spider-record spider-firstFloor");
  }

  $(".spider-record").each(function() {
    let dom = $(this);
    let _links = [];
    if (dom.attr("href")) {
      let href = dom.attr("href");
      if (!href.includes("http")) {
        href = document.location.origin + "/" + href;
      }
      let text = dom.text();
      _links.push({
        text: text,
        length: text.length,
        href: href
      });
    }

    _links = _links.concat(getLinks(dom));

    let _content = cleanContent(dom.prop("innerText"));

    let item = {
      content: _content,
      length: _content.length,
      date: _content.match(DATE_REG) || ["未检索到日期"],
      links: _links
    };
    recordsArr.push(item);
  });

  await filterLinks(recordsArr);

  let outputContentLength = recordsArr.reduce((acc, curr) => {
    return (acc += curr.content.length);
  }, 0);

  // let fullContent = cleanContent($(".spider-main").prop("innerText"));
  let fullContent = cleanContent($(".spider-main").prop("innerText"));
  console.log(`outputContentLength: ${outputContentLength}`);
  // console.log(fullContent);

  let EI = outputContentLength / fullContent.length;

  if (EI > 0.7) {
    // console.log(recordsArr);
    return {
      EI: {
        value: EI,
        resultLength: outputContentLength,
        mainAreaContentLength: fullContent.length
      },

      records: recordsArr
    };
  } else {
    return {
      EI: {
        value: EI,
        resultLength: outputContentLength,
        mainAreaContentLength: fullContent.length
      },
      records: [
        {
          content: fullContent,
          links: await getLinks($(".spider-main"))
        }
      ]
    };
  }
}

console.log("### Warining ###");
