/* Puppeteer */

const puppeteer = require('puppeteer'),
    Timer = require('../../tools/Timings'),
    pageClassify = require('../../algorithm/pageClassify'),
    path = require('path'),
    fs = require('fs'),
    brain = require('brain.js'),
    config = require('./config'),
    {testDomsModel, testPagesModel} = require('../../mongodb');

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
    await Promise.race([
        page.goto(url, config.pageConfig).catch(e => void e),
        new Promise(x => setTimeout(x, 20 * 1000))
    ]);

    //添加依赖的js库以及css样式表
    await page.addScriptTag({path: 'node_modules/jquery/dist/jquery.slim.min.js'});
    // await page.addScriptTag({path: 'node_modules/brain.js/browser.min.js'});
    await page.addStyleTag({path: 'backend/process/stylesheets/content.css'});

    //把内部的console打印出来
    // page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    const pageCallback = await page.evaluate(async () => {

        let title = document.title,
            keywords = $('meta[name="keywords"]').attr('content'),
            description = $('meta[name="description"]').attr('content') || $('meta[name="Description"]').attr('content'),
            bodyContent = $('body').text();

        return {
            title: title,
            hostname: window.location.hostname,
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
                DATE_REG = /\d{4}-\d{1,2}-\d{1,2}|((\d{4})年)?(\d{1,2})月(\d{1,2})日|\d{2}:\d{2}/gi,
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
                            _height = _self.height(),
                            _date = _self.prop('innerHTML').match(DATE_REG);

                        if (_date && (_width / mainWidth * 100 > 70 && _height > MIN_HEIGHT)) {
                            _self.addClass('spider spider-content');
                            _self.find('script').remove();
                            if (_height / mainHeight * 100 > 70 && _self.children('.spider-content').length > 5) {
                                _self.addClass('spider-post');
                            }
                        }
                    })
                }

                markContentNode(mainSelector);

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
                        _leafHeight = _self.height();

                    _self.addClass('listNode');

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

            function uniq(array) {
                if (array) {
                    let temp = [],
                        _length = array.length;
                    for (let i = 0; i < _length; i++) {
                        //如果当前数组的第i项在当前数组中第一次出现的位置是i，才存入数组；否则代表是重复的
                        if (array.indexOf(array[i]) === i) {
                            temp.push(array[i])
                        }
                    }
                    return temp;
                }
                else {
                    return [];
                }
            }

            async function postDataExtract() {
                let output = {
                    listNode: [],
                    listNodeCandidate: [],
                    textNode: [],
                    postAreaNode: [],
                    mainAreaNode: [],
                    spiderNode: []
                };
                $('.spider-content').each(function () {
                    let _self = $(this),
                        _content = _self.prop('innerText').replace(/\n+|\s+/gi, ''),
                        _date = uniq(_self.prop('innerHTML').match(DATE_REG)),
                        _cursor = _self,
                        _dom_level = 0,
                        _linkContent = [];

                    _self.find('a').each(function () {
                        let _this = $(this);
                        if ((_this.prop('offsetWidth') + _this.prop('offsetHeight')) !== 0) {
                            let _href = _this.attr('href');
                            // console.log(_this.prop('offsetWidth') + ' ' + _this.prop('offsetHeight') + ' ' + _href);
                            if (_href && _href.indexOf('javascript:void(0)') < 0 && _href !== '#') {
                                _linkContent.push(_href);
                            }
                            _href = null;
                        }
                    });

                    while (true) {
                        if (_cursor.is('body')) {
                            break;
                        } else {
                            _cursor = _cursor.parent();
                            _dom_level++;
                            if (_dom_level > 10) {
                                break;
                            }
                        }
                    }

                    let item = {
                        content: _content,
                        // html: _self.prop('innerHTML'),
                        // authorName: _self.find('.post-authorName').innerText,
                        // authorUrl: _self.find('.post-authorText').attr('url'),
                        date: _date,
                        links: _linkContent,
                        item: {
                            width: _self.prop('offsetWidth') / 1000,
                            height: _self.prop('offsetHeight') / 30000,

                            dom_level: _dom_level / 10,
                            childElementCount: _self.prop('childElementCount') / 150,
                            siblingsCount: _self.siblings().length / 150,

                            textBodyPercentage: _self.prop('innerText').length / $('body').prop('innerText').length,

                            linkElementCount: _linkContent.length / 20,
                            imageElementCount: _self.find('img').length / 150
                        },
                        output: []
                    };
                    if (_self.hasClass('listNode')) {
                        output.listNode.push(item);
                    } else if (_self.children().length === 0) {
                        output.textNode.push(item);
                    } else {
                        output.spiderNode.push(item);
                    }
                });
                return output;
            }

            await markMainArea();
            await markPostArea();
            await markListNode();

            return await postDataExtract();
        });
    }

    let net = new brain.NeuralNetwork();
    let _netJSON = config.net;
    await net.fromJSON(_netJSON);

    let listNode = resultCallback.listNode || [],
        postAreaNode = resultCallback.postAreaNode || [],
        mainAreaNode = resultCallback.mainAreaNode || [],
        listNodeCandidate = resultCallback.listNodeCandidate || [],
        spiderNode = resultCallback.spiderNode || [];
    for (let i = 0, length = listNode.length; i < length; i++) {
        listNode[i].output = net.run(listNode[i].item);
    }

    for (let j = 0, length = spiderNode.length; j < length; j++) {
        let node = spiderNode[j];
        let output = net.run(spiderNode[j].item);
        node.output = output;
        let cateIndex = output.indexOf(Math.max.apply(null, output));
        node.cate = cateIndex;
        if (cateIndex === 0) {
            mainAreaNode.push(node);
        } else if (cateIndex === 1) {
            postAreaNode.push(node);
        } else if (cateIndex === 2) {
            listNodeCandidate.push(node);
        } else {

        }
    }

    // resultCallback.spiderNode.forEach(async function (node) {
    //     let output = await net.run(node.item);
    //     node.output = output.indexOf(Math.max.apply(null, output));
    //     // console.log(Math.max.apply(null, output));
    //     // console.log(output.indexOf(Math.max.apply(null, output)));
    //     // if (output.indexOf(Math.max.apply(null, output)) === 3) {
    //     //     item.output = undefined;
    //     // }
    // });

    resultCallback.spiderNode = spiderNode.filter(function (item) {
        // console.log('-----------');
        // console.log(item.output);
        // console.log(item.output !== undefined);
        return item.cate === 3;
    });

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

    let dir = path.join(__dirname, 'verification/' + pageCallback.title.replace(/[?:\|，。"']/g, '').split(' ')[0] + '.json');
    let stat = fs.existsSync(dir);
    console.log(`${stat}: ${dir}`);
    if (stat) {
        dir = path.join(__dirname, 'verification/' + pageCallback.title.replace(/[?:\|，。"']/g, '') + '.json')
    }
    await fs.writeFileSync(dir, JSON.stringify(resultCallback, null, 2));
    await Timer.stop('dataExtract');
    await console.log(`DataExtraction:  ${Timer.getTime('dataExtract')}`);

    // await browser.close();
    return resultCallback;
}

async function verification(page) {
    let testPages = await testPagesModel.find({}).exec();
    let length = testPages.length,
        positivePageCount = 0,
        positivePostItemCount = 0,
        totalPostItemCount = 0;

    for (let i = 0; i < length; i++) {
        if (testPages[i].domain === 'kaoyan') {
            positivePageCount++;
            continue;
        }
        console.log(testPages[i]);
        let positive = 0;
        let pageUrl = testPages[i].url;
        let groundTruth = await testDomsModel.find({meta_href: pageUrl, dom_category: 'postItem'}).exec();
        console.log(pageUrl);
        // console.log(groundTruth);
        let truthLength = groundTruth.length;

        let result = await dataExtract(pageUrl, page);
        for (let j in result) {
            let item = result[j];
            for (let x = 0; x < truthLength; x++) {
                if (groundTruth[x].innerText.replace(/\n+|\s+/gi, '').indexOf(item.content)) {
                    positive++;
                    break;
                }
            }
        }
        positivePostItemCount += positive;
        totalPostItemCount += result.length;
        let positiveRate = positive / result.length;
        console.log('Positive Rate: ' + '[' + positive + ', ' + result.length + '] ' + positiveRate);
        if (positiveRate > 0.7) {
            positivePageCount++;
        }
        // console.log(result.length);
    }

    console.log('Total postsItem rate: ' + '[' + positivePostItemCount + ', ' + totalPostItemCount + '] ' + positivePostItemCount / totalPostItemCount);
    console.log('Total page rate: ' + '[' + positivePageCount + ', ' + length + '] ' + positivePageCount / length);
}

async function webpageDataExtraction(webPageUrl) {
    // await Timer.start(`Webpage dataExtract from ${webPageUrl}`);
    // await Timer.stop('dataExtract');
    // await console.log(`DataExtraction:  ${Timer.getTime('dataExtract')}`);
    if (!webPageUrl) return false;

    puppeteer.launch(config.browserConfig).then(async browser => {
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        page.on('request', interceptedRequest => {
            if (interceptedRequest.url().endsWith('.png') || interceptedRequest.url().endsWith('.jpg') || interceptedRequest.url().endsWith('.jpeg') || interceptedRequest.url().endsWith('.gif'))
                interceptedRequest.abort();
            else
                interceptedRequest.continue();
        });

        await page.setViewport({
            width: 1366,
            height: 768 * 2
        });

        return dataExtract(webPageUrl, page);
    });
}

// 控制puppeteer的进程
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

    // await dataExtract('http://bbs.3dmgame.com/thread-5784208-1-1.html', page);
    await verification(page);
    // await downloadPdf('https://segmentfault.com/a/1190000015369542', 'backend/render/', 'segmentfault');
}

exports.init = init;
exports.webDataExtraction = webpageDataExtraction;
