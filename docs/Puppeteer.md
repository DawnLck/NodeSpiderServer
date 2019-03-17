# 木偶 Puppeteer
> 更友好的 Headless Chrome Node API
> 木偶也是有心的 (=･ω･=)

![clipboard.png](https://segmentfault.com/img/bVbcEKb?w=290&h=422)

## Puppeteer是什么？
Puppeteer是一个Node库，它提供了一个高级API来通过DevTools协议控制无头 Chrome或Chromium ，它也可以配置为使用完整（非无头）Chrome或Chromium。

你可以通过Puppeteer的提供的api直接控制Chrome模拟大部分用户操作来进行UI Test或者作为爬虫访问页面来收集数据。

## 为什么会产生Puppeteer呢？

很早很早之前，前端就有了对 headless 浏览器的需求，最多的应用场景有两个

 1. UI 自动化测试：摆脱手工浏览点击页面确认功能模式
 2. 爬虫：解决页面内容异步加载等问题

在Chrome headless 和Puppeteer出现之前，headless 浏览器有以下几种：

- PhantomJS, 基于 Webkit
- SlimerJS, 基于 Gecko
- HtmlUnit, 基于 Rhnio
- TrifleJS, 基于 Trident
- Splash, 基于 Webkit

但这些都有共同的通病，环境安装复杂，API 调用不友好

2017 年 Chrome 官方团队连续放了两个大招 Headless Chrome 和对应的 NodeJS API Puppeteer，直接让 PhantomJS 和 Selenium IDE for Firefox 作者宣布暂停继续维护其产品，PhantomJs的开发者更直接宣称自己要失业了。

## Puppeteer能做什么？
你可以在浏览器中手动完成的大部分事情都可以使用Puppteer完成
比如：
 1. 生成页面的屏幕截图和PDF。 
 2. 抓取SPA并生成预先呈现的内容（即“SSR”）。 
 3. 自动表单提交，UI测试，键盘输入等。
 4. 创建一个最新的自动化测试环境。使用最新的的JavaScript和浏览器功能，直接在最新版本的Chrome浏览器中运行测试。
 5. 捕获您网站的时间线跟踪，以帮助诊断性能问题。

## 入门
安装Puppeteer

``` cmd
npm install puppeteer
或者
yarn add puppeteer
```

> Puppeteer至少需要Node v6.4.0，但如果想要使用async / await，它仅在Node v7.6.0或更高版本中受支持。

### 实例一 截屏保存
导航到 https://example.com 并将截屏保存为 example.png：

```
const puppeteer = require('puppeteer');
async function screenShot(url, path, name) {
    await console.log('Screen Shot ... ');
    await console.log('Save path: ' + path + name + '.png');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.screenshot({path: path + name + '.png'});

    await browser.close();
}
```
puppeteer 默认的页面大小为800x600分辨率，页面的大小可以通过```Page.setViewport()```来更改

### 实例二 创建一个PDF

```
const puppeteer = require('puppeteer');

async function downloadPdf(url, path, name) {
    await console.log('Download Pdf ... ');
    await console.log('Save path: ' + path + name + '.pdf');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    //networkidle2: consider navigation to be finished when there are no more than 2 network connections for at least 500 ms.
    await page.goto(url, {waitUntil: 'networkidle2'});
    await page.pdf({path: path + name + '.pdf', format: 'A4'});

    await browser.close();
}
```

### 实例三 在渲染的页面中执行代码
```
const puppeteer = require('puppeteer');

async function getDimension(url) {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(url);

    // Get the "viewport" of the page, as reported by the page.
    const dimensions = await page.evaluate(() => {
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            deviceScaleFactor: window.devicePixelRatio
        };
    });

    console.log('Dimensions:', dimensions);

    // await browser.close();
}
```
## 一些默认的设置和开发调试建议
###1. 使用Headless模式
Puppeteer默认以Headless模式加载Chromium，如果想加载完整的Chromium（这样方便观察网页加载的效果究竟是怎么样的），可以执行以下命令

```
const browser = await puppeteer.launch({headless: false}); // default is true
```

###2. 使执行本地版本的Chrome或者Chromium

```
const browser = await puppeteer.launch({executablePath: '/path/to/Chrome'});
```

###3. 延迟执行Puppeteer

```
 const browser = await puppeteer.launch({
   headless: false,
   slowMo: 250 // slow down by 250ms
 });
```
###4. 获取控制台输出
可以监听console的事件，也可以通过evaluate来执行console
```
 page.on('console', msg => console.log('PAGE LOG:', msg.text()));

 await page.evaluate(() => console.log(`url is ${location.href}`));
```
###5. 设置页面视窗大小

```
await page.setViewport({
        width: 1366,
        height: 768 * 2
    });
```

> 参考链接 
> - Puppeteer的入门教程和实践 任乃千 https://www.jianshu.com/p/2f04f9d665ce
> - 官方文档 https://github.com/GoogleChrome/puppeteer