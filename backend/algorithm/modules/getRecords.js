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
        !item.text ||
        !item.text.length ||
        !item.href ||
        !item.href.includes("javascript:void(0)")
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
async function getRecords() {
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
      links.push({
        text: dom.text(),
        href: href
      });
    }

    links = links.concat(getLinks(dom));

    let item = {
      content: cleanContent(dom.prop("innerText")),
      links: links
    };
    recordsArr.push(item);
  });

  await filterLinks(recordsArr);

  let outputContentLength = recordsArr.reduce((acc, curr) => {
    return (acc += curr.content.length);
  }, 0);

  // let fullContent = cleanContent($(".spider-main").prop("innerText"));
  let fullContent = $(".spider-main").prop("innerText");
  console.log(`outputContentLength: ${outputContentLength}`);
  // console.log(fullContent);

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
          links: await getLinks($(".spider-main"))
        }
      ]
    };
  }
}

console.log("### Warining ###");
