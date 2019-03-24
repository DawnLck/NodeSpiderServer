/**
 *  Get Records 获取数据记录
 */

/**
 * Clean Content 清洁文本
 * @param {*} content
 */
async function cleanContent(content) {
  content.replace(/[\s\n\r]/g, "");
  return content;
}

/**
 * 获取链接
 */
async function getLinks(dom) {
  let links = [];
  $(dom).each((index, e) => {
    let href = $(e).attr("href");

    if (href && !href.includes(document.location.host)) {
      href = document.location.origin + "/" + href;
    }

    let item = {
      text: $(e).text(),
      href: href
    };

    if (
      !item.text ||
      !item.text.length ||
      item.href.includes("javascript:void(0)")
    ) {
      links.push(item);
    }
  });
  return links;
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
async function getRecords(page) {
  console.log("### 获取数据记录 ###");
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
    links.concat(getLinks(dom));

    let content = await cleanContent(dom.prop("innerText"));
    console.log(content);
    let item = {
      content: content,
      links: links
    };

    recordsArr.push(item);
  });
  await filterLinks(recordsArr);
  let outputContentLength = recordsArr.reduce((acc, curr) => {
    return (acc += curr.content.length);
  }, 0);

  //   return {
  //     records: recordsArr
  //   };

  let fullContent = cleanContent($(".spider-main").prop("innerText"));
  console.log(`outputContentLength: ${outputContentLength}`);
  console.log(fullContent);
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
      records: [
        {
          content: fullContent,
          links: getLinks($(".spider-main"))
        }
      ]
    };
  }
}

console.log('### Warining ###');