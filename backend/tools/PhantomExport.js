/*
 * 使用Phantom进行后台的网页渲染
 * log4js 作为调试模块暂时不瞎搞了
 * ES6可以使用新的语法
 * ES5使用promise的写法
 * */
var phantom = require('phantom');
var log4js = require('log4js');
var log4Logger = log4js.getLogger();
var expect = require('expect');
log4Logger.level = log4js.levels.INFO;

/**/
// phantom.create(['--ignore-ssl-error=yes','--load-images=no'],{
var createPhantom = function (urlName, url, tagName, callback) {
    //console.log('OutTagNameTest: ' + tagName);
    phantom.create(['--load-images=no'], {
        // phantomPath: 'E:/Environment/phantomjs/bin', // 选择phantomjs所在的安装路径
        logger: log4Logger,
        logLever: 'info'
    }).then(function (instance) {
        instance.createPage().then(function (page) {
            var outObj = instance.createOutObject();
            outObj.urls = [];
            //开启javascript加载
            page.setting('javascriptEnabled').then(function (value) {
                expect(value).toEqual(true);
            });

            page.property('viewportSize', {width: 1920, height: 900}).then(function () {
            });
            page.property('onResourceRequested', function (requestData, networkRequest, out) {
                out.urls.push(requestData.url);
            }, outObj);

            /*打开网站链接*/
            page.open(url).then(function (status) {
                console.log(url + ' Link Status: ' + status);
                console.log('OpenTagNameTest: ' + tagName);
                // console.log('EvaluateTagNameTest: ' + tagName);
                // outObj.property('urls').then(function (urls) {
                //     console.log(urls);
                // });
                // console.log('ResultArray :');
                setTimeout(function () {
                    console.log('Now is working');
                    page.evaluate(function (tName) {
                        //console.log(document);
                        var resultArray = [];
                        // console.log('tName: ' + tName);
                        var tagArray = document.getElementsByTagName(tName);
                        for (var i = 0, length = tagArray.length; i < length; i++) {
                            var domItem = {
                                dom_url: tagArray[i].baseURI,
                                dom_tagName: tagArray[i].tagName,
                                dom_id: tagArray[i].id,
                                dom_class: tagArray[i].className,
                                dom_width: tagArray[i].offsetWidth,
                                dom_height: tagArray[i].offsetHeight,
                                dom_left: tagArray[i].offsetLeft,
                                dom_top: tagArray[i].offsetTop,
                                dom_brothersNum: tagArray[i].parentNode.childElementCount,
                                dom_childrenNum: tagArray[i].childElementCount,
                                dom_href: tagArray[i].href?tagArray[i].href:null,
                                dom_innerHTML: null,
                                // dom_innerHTML: tagArray[i].innerHTML,
                                // dom_innerText: tagArray[i].innerHTML.replace(/<.+?>/gim, ''),
                                dom_innerText: tagArray[i].innerHTML.replace(/<.+?>/gim, ''),
                                targetFlag: false
                            };
                            resultArray.push(domItem);
                        }
                        return resultArray;
                    }, tagName).then(function (resultArray) {
                        callback(urlName, resultArray);
                    });
                    page.render('backend/render/' + urlName + '.png');
                    page.close();
                    // instance.exit();
                }, 10000);
            }).catch(function (err) {
                console.log(err);
                instance.exit();
            });
        })
    });
};
// var urlGoZjut = 'http://weibo.com/?category=1760';
// createPhantom(1, urlGoZjut, 'a', function (index, data) {
//     console.log('Data ' + index + '...');
//     console.log(data.length);
// });
exports.createPhantom = createPhantom;

