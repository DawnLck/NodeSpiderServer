/**
 * Global.js
 * */
const protocol = document.location.protocol,
  port = protocol === "https:" ? 8082 : 8081,
  SAVE_PAGE = "/data/saveTestPage",
  SAVE_DOM = "/data/saveTestDom";

const bodyStyle =
  window.getComputedStyle(document.getElementsByTagName("body")[0]) || {};
const rootFontSize = parseInt(bodyStyle.fontSize),
  MIN_HEIGHT = 2 * rootFontSize;

/* 阈值设定 */
const CONFIG = {
  showClassifyResult: true,
  threshold: {
    area: 0.2,
    center: 0.5,
    text: 0.45,
    areaMargin: 0.2
  }
};

/* 可视块的属性指标 */
const BlockProperty = {
  countable: [
    "childElementCount",
    "clientHeight",
    "clientLeft",
    "clientTop",
    "clientWidth",
    "offsetHeight",
    "offsetLeft",
    "offsetWidth",
    "offsetTop",
    "scrollHeight",
    "scrollLeft",
    "scrollTop",
    "scrollWidth"
  ],
  enumerable: [
    "className",
    "hidden",
    "nodeName",
    "localName",
    "nodeType",
    "tagName"
  ],
  others: ["innerHTML", "innerText", "outerHTML", "outerText", "textContent"]
};

/* 可视块的样式指标 */
const BlockCss = {
  enumerable: [
    "color",
    "line-height",
    "font-size",
    "font-weight",
    "font-family",
    "padding",
    "margin"
  ],
  others: ["content"]
};

const DATE_REG = /[0-2]\d{3}-\d{1,2}-\d{1,2}(\s*)\d{2}:\d{2}|[0-2]\d{3}-\d{1,2}-\d{1,2}|((\d{4})(\s*)年)?(\s*)(\d{1,2})(\s*)月(\s*)(\d{1,2})(\s*)日|\d{2}:\d{2}/gi;
