const puppeteer = require('puppeteer');
const pageClassify = require('../algorithm/pageClassify');

const TAG_LINK = 'A',
    TAG_DIV = 'DIV';
const META_KEYWORD = 'meta[name="keywords"]';

async function init() {
    // await screenShot('https://segmentfault.com/a/1190000015369542', 'backend/render/', 'segmentfault');
    // await getDimension('https://segmentfault.com/a/1190000015369542');
    await domSelector('http://bbs.tianya.cn/post-develop-2298254-1-1.shtml');
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
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--window-size=1366," + (768 * 2)
        ]
    });
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'domcontentloaded'});

    await page.waitFor(1000);
    await page.setViewport({
        width: 1366,
        height: 768 * 2
    });
    // Get the "viewport" of the page, as reported by the page.

    //把内部的console打印出来
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'});
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

    function markLeafNode(){

    }

    function markPostList(){
        console.log('Mark post list ... ');
        page.evaluate(async () => {
            
        })
    }


    if (classifyResult.category) {
        //可以进行分类的网页
        switch (classifyResult.category) {
            case 'bbs':
                markPostList();
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

    await browser.close();
}


exports.init = init;