/* Puppeteer */
const timings = require('timings.js'),
    puppeteer = require('puppeteer'),
    // mongoModel = require('../mongooseModel'),
    // pupp = require('../tools/PuppeteerConfig'),
    pageClassify = require('../algorithm/pageClassify');

const TAG_LINK = 'A',
    TAG_DIV = 'DIV';
const META_KEYWORD = 'meta[name="keywords"]';

async function init() {
    // await screenShot('https://segmentfault.com/a/1190000015369542', 'backend/render/', 'segmentfault');
    // await getDimension('https://segmentfault.com/a/1190000015369542');

    // await domSelector('http://bbs.tianya.cn/post-develop-2298254-1-1.shtml');
    await domSelector('https://tieba.baidu.com/p/5758158945');


    // await downloadPdf('https://segmentfault.com/a/1190000015369542', 'backend/render/', 'segmentfault');
}

//网页截图
async function screenShot(url, path, name) {
    await console.log('Screen Shot ... ');
    await console.log('Save path: ' + path + name + '.png');
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setViewport({
        width: 1366,
        height: 768 * 2
    });
    await page.goto(url, {
        waitUntil: 'networkidle2' //networkidle2
    });
    await page.screenshot({path: path + name + '.png'});

    await browser.close();
}

//保存为pdf
async function downloadPdf(url, path, name) {
    await console.log('Download Pdf ... ');
    await console.log('Save path: ' + path + name + '.pdf');
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    //networkidle2: consider navigation to be finished when there are no more than 2 network connections for at least 500 ms.
    await page.goto(url, {waitUntil: 'networkidle2'});
    await page.pdf({path: path + name + '.pdf', format: 'A4'});

    // await browser.close();
}

//获取页面宽度
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

//针对页面进行操作
async function domSelector(url) {
    console.log('网页信息提取： ' + url);

    const browserTracker = timings();

    // noinspection JSAnnotator
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            "--window-size=1366," + (768 * 2),
            '--disable-dev-shm-usage'
        ]
    });
    // noinspection JSAnnotator
    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
        if (interceptedRequest.url().endsWith('.png') || interceptedRequest.url().endsWith('.jpg') || interceptedRequest.url().endsWith('.jpeg') || interceptedRequest.url().endsWith('.gif'))
            interceptedRequest.abort();
        else
            interceptedRequest.continue();
    });

    // await page.waitFor(1000);
    await page.setViewport({
        width: 1366,
        height: 768 * 2
    });
    // Get the "viewport" of the page, as reported by the page.

    await page.goto(url, {waitUntil: 'domcontentloaded'});

    //把内部的console打印出来
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    //添加依赖的js库以及css样式表
    await page.addScriptTag({path: 'node_modules/jquery/dist/jquery.slim.min.js'});
    await page.addStyleTag({path: 'backend/stylesheets/content.css'});

    const browserDuration = browserTracker();
    console.log(`Page 加载时间 ... ${browserDuration} 毫秒`);

    const pageCallback = await page.evaluate(async (sel) => {
        console.log(sel);

        let title = document.title,
            keywords = $('meta[name="keywords"]').attr('content'),
            description = $('meta[name="description"]').attr('content') || $('meta[name="Description"]').attr('content'),
            bodyContent = $('body').text();

        const $els = document.querySelectorAll(sel);

        console.log('ELS Length: ' + $els.length);//写在内部的console会直接打印在headless浏览器里

        return {
            title: title,
            keywords: keywords,
            description: description,
            bodyContent: bodyContent,
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            deviceScaleFactor: window.devicePixelRatio
        };
    }, TAG_DIV);

    let classifyResult = await pageClassify.process(pageCallback);
    console.log(classifyResult);

    /* 标记主要区域 */
    async function markMainArea(){
        console.log('Mark main area ... ');
        await page.evaluate(()=>{
            let _body = document.getElementsByTagName('body')[0],
                bodyWidth = _body.scrollWidth,
                bodyHeight = _body.scrollHeight,
                bodyTextLength = _body.innerText.length,
                allDiv = $('div');

            console.log('Body { width:' + bodyWidth + ' height: ' + bodyHeight + ' }');

            //标记
            allDiv.each(function () {
                let _width = $(this).width() / bodyWidth * 100.0;
                let _height = $(this).height() / bodyHeight * 100;
                let _text = $(this).text();
                let _textDensity = _text.length / bodyTextLength.length * 100;

                if (_text) {
                    if (_width > 30 && _width < 96) {
                        $(this).addClass('spider');
                        if (_height > 60) {
                            $(this).addClass('main');
                        }
                    }
                }
            });

            $('div.spider.main').each(function () {
                if ($(this).find('.spider.main').length > 0) {
                    console.log('Unmark the main ... ');
                    $(this).removeClass('main');
                }
            });
        });
    }

    /* 标记帖子区域 */
    async function markPostArea() {
        console.log('Mark post area ... ');

        await page.evaluate(()=>{
            let mainSelector = $('div.spider.main');
            let mainWidth = mainSelector.width(),
                mainHeight = mainSelector.height();
            console.log(mainWidth + ' ' + mainHeight);

            mainSelector.parent().find('div.spider').each(function () {
                if ($(this).width() / mainWidth * 100 > 70 && $(this).height() / mainHeight * 100 > 50) {
                    $(this).addClass('post');
                }
            });

            $('div.post').each(function () {
                if ($(this).find('.spider.post').length > 0) {
                    console.log('Unmark the post ... ');
                    $(this).removeClass('post');
                }
            });
        });
    }

    /* 标记列表节点 */
    async function markListNode() {
        console.log('Mark list node ... ');

        await page.evaluate(()=>{
            let result = [];

            $('div.post').children().each(function () {
                // $(this).append('<div class="collect-btn">采集</div>');
                $(this).addClass('spider listNode');
                let links = [];
                $(this).find('a').each(function () {
                    // console.log($(this).text());
                    if ($(this).prop('childElementCount') === 0 && $(this).text().length > 0 && $(this).attr('href') && $(this).attr('href').length > 20) {
                        // console.log('Author ... ' + $(this).text() + $(this).attr('href'));
                        links.push({
                            url: $(this).attr('href'),
                            text: $(this).text(),
                            width: $(this).width(),
                            height: $(this).height(),
                            offsetLeft: $(this).prop('offsetLeft'),
                            offsetTop: $(this).prop('offsetTop')
                        })
                    }
                });
                // console.log(links);

                result.push({
                    text: $(this).text().replace(/(\s){2}|('\n')|('\r')/g, ''),
                    author: $(this).find('a').attr('href'),
                    links: links
                });
            });

            console.log(result);
        });
    }

    if (classifyResult.category) {
        //可以进行分类的网页
        switch (classifyResult.category) {
            case 'bbs':
                await markMainArea();
                await markPostArea();
                await markListNode();
                break;
            case 'articles':
                break;
            case 'news':
                break;
            default:
                break;
        }
    } else {
        //无法分类的网页
    }

    // await browser.close();
}

exports.init = init;