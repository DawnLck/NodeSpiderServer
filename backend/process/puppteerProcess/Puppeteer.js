/* Puppeteer */

const puppeteer = require('puppeteer'),
    Timer = require('../../tools/Timings'),
    pageClassify = require('../../algorithm/pageClassify'),
    path = require('path'),
    fs = require('fs'),
    config = require('./config');

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
async function dataExtract(url, page) {
    let result = [];

    await Timer.start('dataExtract');
    console.log('网页信息提取： ' + url);

    await page.goto(url, {waitUntil: 'domcontentloaded'});

    //添加依赖的js库以及css样式表
    await page.addScriptTag({path: 'node_modules/jquery/dist/jquery.slim.min.js'});
    await page.addStyleTag({path: 'backend/process/stylesheets/content.css'});

    //把内部的console打印出来
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    const pageCallback = await page.evaluate(async () => {

        let title = document.title,
            keywords = $('meta[name="keywords"]').attr('content'),
            description = $('meta[name="description"]').attr('content') || $('meta[name="Description"]').attr('content'),
            bodyContent = $('body').text();

        return {
            title: title,
            keywords: keywords,
            description: description,
            bodyContent: bodyContent,
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            deviceScaleFactor: window.devicePixelRatio
        };
    });

    const classifyCallback = await pageClassify.process(pageCallback);
    console.log(classifyCallback);
    let resultCallback;
    if (classifyCallback.category === 'bbs') {
        resultCallback = await page.evaluate(async () => {

            const Timer = {
                data: {},
                start: function (key) {
                    // console.log('Timer start ... ');
                    Timer.data[key] = new Date();
                },
                stop: function (key) {
                    // console.log('Timer stop ... ');
                    let time = Timer.data[key];
                    if (time)
                        Timer.data[key] = new Date() - time;
                },
                getTime: function (key) {
                    return Timer.data[key] / 1000 + ' s';
                }
            };
            const rootFontSize = parseInt(window.getComputedStyle(document.getElementsByTagName('body')[0]).fontSize),
                DATE_REG = /\d{4}-\d{2}-\d{2}|((\d{4})年)?(\d{1,2})月(\d{1,2})日|\d{2}:\d{2}/,
                MIN_HEIGHT = 2 * rootFontSize;

            /* 标记主要区域 */
            async function markMainArea() {
                Timer.start("mainMark");
                console.log('Mark main area ... ');
                let _body = document.getElementsByTagName('body')[0],
                    bodyWidth = _body.scrollWidth,
                    bodyHeight = _body.scrollHeight,
                    // bodyTextLength = _body.innerText.length,
                    // rootFontSize = parseInt(window.getComputedStyle(_body).fontSize),
                    allDiv = $('div');

                console.log('Body { width:' + bodyWidth + ' height: ' + bodyHeight + ' }');
                console.log('Body Font-size: ' + rootFontSize);

                //标记
                allDiv.each(function () {
                    let _width = $(this).width() / bodyWidth * 100.0;
                    let _height = $(this).height() / bodyHeight * 100;
                    let _text = $(this).text().length;
                    // let _textDensity = _text.length / bodyTextLength.length * 100;

                    if (_text && _width > 30) {
                        if (_height > 60) {
                            // console.log(_width + ' ' + _height);
                            $(this).addClass('spider spider-main');
                        } else if ($(this).height() > MIN_HEIGHT) {
                            $(this).addClass('spider');
                            // console.log('## Spider: ' + $(this).height() + ' ' + $(this).text());
                        } else {
                            // console.log('## Non-Spider: ' + $(this).height() + ' ' + $(this).text());
                            // console.log('Remove: ' + $(this).height());
                            // $(this).removeClass('spider');
                        }
                    }

                    _width = null;
                    _height = null;
                    _text = null;
                    // _textDensity = null;
                });

                //
                // function filterMain(node) {
                //     node.children().each(function () {
                //         let _self = $(this);
                //         if(_self.hasClass('spider-main')){
                //             filterMain(_self);
                //             let _parent = _self.parent();
                //             if(_self.width() * 1.1 > _parent.width()){
                //                 _self.removeClass('spider-main');
                //             }else{
                //                 _parent.removeClass('spider-main');
                //             }
                //         }
                //     });
                // }
                // filterMain($('body'));

// test

                $('div.spider-main').each(function () {
                    let _self = $(this);
                    let _parent = _self.parent();
                    if (_parent.hasClass('spider') && _self.width() * 1.1 > _parent.width()) {
                        _self.removeClass('spider-main');
                    }
                });

                $('div.spider-main').each(function () {
                    if ($(this).find('.spider-main').length > 0) {
                        $(this).removeClass('spider-main');
                    }
                });

                $('.spider-main').siblings().each(function () {
                    $(this).addClass('spider-nonMain');
                    // console.log('Area Siblings ... ');
                });

                Timer.stop("mainMark");
                console.log("The main Mark time is: " + Timer.getTime('mainMark'));
            }

            /* 标记帖子区域 */
            async function markPostArea() {
                Timer.start("markPost");
                console.log('Mark post area ... ');

                let mainSelector = $('.spider-main');
                let mainWidth = mainSelector.width(),
                    mainHeight = mainSelector.height();
                console.log(mainWidth + ' ' + mainHeight);

                mainSelector.addClass('spider-content');

                function markContentNode(self) {
                    self.children().each(function () {
                        markContentNode($(this));
                        let _self = $(this),
                            _width = _self.width(),
                            _height = _self.height();

                        if ((_width / mainWidth * 100 > 70 && _height > MIN_HEIGHT)) {
                            _self.addClass('spider spider-content');
                            // console.log('Mark Content Node ...');
                            if (_height / mainHeight * 100 > 70 && _self.children('.spider-content').length > 5) {
                                _self.addClass('spider-post');
                            }
                        }
                    })
                }

                // function markPostNode(self){
                //     self.children().each(function () {
                //         let _self = $(this),
                //             // _width = _self.width(),
                //             _height = _self.height();
                //         if (_height / mainHeight * 100 > 50 && _self.children('.spider-content').length > 3) {
                //             _self.addClass('spider-post');
                //         }
                //     });
                // }

                markContentNode(mainSelector);
                // markPostNode(mainSelector);

                // mainSelector.parent().find('.spider-content').each(function () {
                //     let _self = $(this);
                //     if (_self.height() / mainHeight * 100 > 50) {
                //         let _childrenLength = _self.children().length;
                //         if (_childrenLength > 3) {
                //             _self.addClass('spider-post');
                //         }
                //     }
                //
                //     //
                //     // // console.log('siblings Count: ' + _siblingsLength);
                //     // if (_siblingsLength > 6) {
                //     //     $(this).parent().addClass('spider spider-post');
                //     // } else if (_self.width() / mainWidth * 100 > 70 && _self.height() / mainHeight * 100 > 50) {
                //     //     // console.log(_self.prop('childElementCount'));
                //     //     if (_self.children('.spider').length > 4) {
                //     //         $(this).addClass('spider spider-post');
                //     //     }
                //     // }
                // });

                $('.spider-post').each(function () {
                    if ($(this).find('.spider-post').length > 0) {
                        console.log('Unmark the post ... ');
                        $(this).removeClass('spider-post');
                    }
                });

                // if (mainSelector.find('.spider-post').length === 0) {
                //     console.log('Main && Post');
                //     if (mainSelector.children('.spider-content').length > 6) {
                //         mainSelector.addClass('spider-post');
                //     }
                //     mainSelector.parent().addClass('spider spider-main');
                //     mainSelector.removeClass('spider-main');
                // }

                Timer.stop("markPost");
                console.log("The post mark time is: " + Timer.getTime('markPost'));
            }

            /* 标记列表节点 */
            async function markListNode() {
                Timer.start("markList");
                console.log('Mark list node ... ');
                // let result = [];

                $('.spider-post').children('.spider-content').each(function () {
                    let _self = $(this),
                        _leafWidth = _self.width(),
                        _leafHeight = _self.height(),
                        _date = _self.prop('innerHTML').match(DATE_REG);
                    if (_date) {
                        _self.addClass('listNode');
                    }

                    function markLeafComponents(self) {
                        self.children().each(function () {
                            let _s = $(this),
                                _width = _s.width() / _leafWidth * 100.0,
                                _height = _s.height() / _leafHeight * 100.0;

                            if ((_s.width() > 12 && _height > 70) || (_s.height() > 12 && _width > 70)) {
                                _s.addClass('spider listNode_components');
                                markLeafComponents(_s);
                            }

                            _width = null;
                            _height = null;
                            _s = null;
                        })
                    }

                    markLeafComponents(_self);

                    // 考虑百度贴吧的两段式布局
                    // _self.children().each(function () {
                    //     let _self = $(this);
                    //     if (_self.height() > 2 * rootFontSize && !_self.hasClass('spider')) {
                    //         _self.addClass('spider listNode_components');
                    //         // console.log('## Spider: ' + $(this).height() + ' ' + $(this).text());
                    //     }
                    // });

                    // let links = [];
                    // $(this).find('a').each(function () {
                    //     // console.log($(this).text());
                    //     if ($(this).prop('childElementCount') === 0 && $(this).text().length > 0 && $(this).attr('href') && $(this).attr('href').length > 20) {
                    //         // console.log('Author ... ' + $(this).text() + $(this).attr('href'));
                    //         links.push({
                    //             url: $(this).attr('href'),
                    //             text: $(this).text(),
                    //             width: $(this).width(),
                    //             height: $(this).height(),
                    //             offsetLeft: $(this).prop('offsetLeft'),
                    //             offsetTop: $(this).prop('offsetTop')
                    //         })
                    //     }
                    // });
                    //
                    // result.push({
                    //     text: $(this).text().replace(/(\s){2}|('\n')|('\r')/g, ''),
                    //     author: $(this).find('a').attr('href'),
                    //     links: links
                    // });
                });

                Timer.stop("markList");
                console.log("The post mark time is: " + Timer.getTime('markList'));

                // console.log(result);
            }

            async function postDataExtract() {
                let data = [];
                $('.listNode').each(function () {
                    let _self = $(this),
                        _content = _self.prop('innerText').replace(/\n+|\s+/gi, ''),
                        _date = _self.prop('innerHTML').match(DATE_REG)[0];
                    data.push({
                        content: _content,
                        // authorName: _self.find('.post-authorName').innerText,
                        // authorUrl: _self.find('.post-authorText').attr('url'),
                        date: _date
                    });
                });

                console.log(data);

                return data;
            }

            await markMainArea();
            await markPostArea();
            await markListNode();

            return await postDataExtract();

        });
    }

    // let classifyResult = await pageClassify.process(pageCallback);
    // console.log(classifyResult);

    // if (pageClassifyCallback.category) {
    //     //可以进行分类的网页
    //     switch (classifyResult.category) {
    //         case 'bbs':
    //             await Timer.start('bbsExtraction');
    //             await markMainArea();
    //             await markPostArea();
    //             await markListNode();
    //             await Timer.stop('bbsExtraction');
    //             await console.log(`bbsExtraction ${Timer.getTime('bbsExtraction')}`);
    //             break;
    //         case 'articles':
    //             break;
    //         case 'news':
    //             break;
    //         default:
    //             break;
    //     }
    // } else {
    //     //无法分类的网页
    // }

    //如果screen shot 为true，则截图
    if (config.screenShot) {
        await page.screenshot({
            path: path.join(__dirname, pageCallback.title + '.png'),
            type: 'png',
            // quality: 100, 只对jpg有效
            fullPage: true,
            // 指定区域截图，clip和fullPage两者只能设置一个
            // clip: {
            //   x: 0,
            //   y: 0,
            //   width: 1000,
            //   height: 40
            // }
        })
    }

    result = classifyCallback;

    // async function writeResult(data){
    //     let writerStream = fs.createWriteStream(pageCallback.title + '.json');
    //     await writerStream.write(data, 'UTF8');
    //     await writerStream.end();
    // }
    //
    // await writeResult(classifyCallback);

    await fs.writeFileSync(path.join(__dirname, pageCallback.title + '.json'), JSON.stringify(resultCallback, null, 2));

    await Timer.stop('dataExtract');
    await console.log(`DataExtraction:  ${Timer.getTime('dataExtract')}`);

    // await browser.close();
}

async function init() {
    // await screenShot('https://segmentfault.com/a/1190000015369542', 'backend/render/', 'segmentfault');
    // await getDimension('https://segmentfault.com/a/1190000015369542');
    // await domSelector('http://bbs.tianya.cn/post-develop-2298254-1-1.shtml');
    const browser = await puppeteer.launch(config.browserConfig);
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

    await dataExtract('http://bbs.kaoyan.com/t8960275p1', page);

    // await downloadPdf('https://segmentfault.com/a/1190000015369542', 'backend/render/', 'segmentfault');
}

exports.init = init;
