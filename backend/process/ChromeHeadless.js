/* Chrome Headless js */

// const {ChromeLauncher} = require('lighthouse/chrome-launcher');
const chromeLauncher = require("chrome-launcher");
const CDP = require("chrome-remote-interface");

// 延迟函数
function delay(time) {
  time = time || 0;
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve();
    }, time);
  });
}

function launchChrome(headless = true) {
  const launcher = new ChromeLauncher({
    port: 8801,
    autoSelectChrome: true,
    additionalFlags: ["--window-size= 1200, 600", headless ? "--headless" : ""]
  });
  return launcher
    .run()
    .then(() => launcher)
    .catch(err => {
      return launcher.kill().then(() => {
        throw err;
      }, console.error);
    });
}

function printVersion() {
  launchChrome(true).then(launcher => {
    chrome.Version().then(version => console.log(version["User-Agent"]));
  });
}

async function preRender() {
  // open chrome
  const chrome = await chromeLauncher
    .launch({
      port: 8081,
      chromeFlags: ["--headless"]
    })
    .then(chrome => {
      console.log("Chrome debugging port:" + chrome.port);
    });
  const { Page, DOM } = await CDP();
  await Promise.all([Page.enable(), DOM.enable()]);
  await Page.navigate({ url: "https://h5.ele.me/market/#/home" });
  await Page.loadEventFired();
  // wait for loading data
  await delay(3000);
  const rootNode = await DOM.getDocument();
  const appNode = await DOM.querySelector({
    nodeId: rootNode.root.nodeId,
    selector: "#app"
  });
  // replace product data to clear data
  const needReplaceFlag = "#app [shell-replace]";
  const defaultImage = "http://defaultImage.com";
  const replaceNode = await DOM.querySelectorAll({
    nodeId: rootNode.root.nodeId,
    selector: needReplaceFlag
  });
  replaceNode.nodeIds.length &&
    (await new Promise((resolve, reject) => {
      const tasks = [];
      replaceNode.nodeIds.forEach(nodeId => {
        try {
          const task = DOM.getOuterHTML({ nodeId }).then(html => {
            const nodeName = html.outerHTML
              .split(">")[0]
              .slice(1)
              .split(" ")[0];
            if (nodeName === "img") {
              return DOM.setAttributeValue({
                nodeId,
                name: "src",
                value: defaultImage
              });
            } else {
              return DOM.setOuterHTML({
                nodeId,
                outerHTML: `<${nodeName}>&nbsp;</${nodeName}>`
              });
            }
          });
          tasks.push(task);
        } catch (e) {
          reject(e);
        }
      });
      Promise.all(tasks)
        .then(() => {
          resolve();
        })
        .catch(e => reject(e));
    }));

  const shellHTML = await DOM.getOuterHTML({ nodeId: appNode.nodeId });
}

exports.printVersion = printVersion;
exports.preRender = preRender;
