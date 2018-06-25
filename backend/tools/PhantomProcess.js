/*
 * 使用Phantom进行后台的网页渲染
 * log4js 作为调试模块暂时不瞎搞了
 * ES6可以使用新的语法
 * ES5使用promise的写法
 * */
let phantom = require('phantom');
let expect = require('expect');

/**/
// phantom.create(['--ignore-ssl-error=yes','--load-images=no'],{
function createPhantom(urlName = 'image', url, tagName='div', callback) {
    console.log('Create Phantom .... ');
    console.log(urlName + url + tagName);
    phantom.create(['--load-images=no'], {
        // phantomPath: 'E:/Environment/phantomjs/bin', // 选择phantomjs所在的安装路径
    }).then(function (instance) {
        instance.createPage().then(function (page) {
            let outObj = instance.createOutObject();
            outObj.urls = [];
            //开启javascript加载
            page.setting('javascriptEnabled').then(function (value) {
                expect(value).toEqual(true);
            });

            page.on('viewportSize', {width: 1920, height: 900}).then(function () {
            });
            page.on('onResourceRequested', function (requestData, networkRequest, out) {
                out.urls.push(requestData.url);
            }, outObj);

            console.log('Test');

            /*打开网站链接*/
            page.open(url).then(async function (status) {
                console.log(url + ' Link Status: ' + status);

                if(status === 'fail'){
                    return 'Open page fail ... ';
                }

                console.log('OpenTagNameTest: ' + tagName);
                // outObj.property('urls').then(function (urls) {
                //     console.log(urls);
                // });
                // console.log('ResultArray :');
                console.log('Now is working');
                page.evaluate(function () {
                    var tagArray = document.getElementsByTagName('a');
                    console.log(document);
                    console.log(tagArray);
                    // console.log(tagName);
                });
                // page.evaluate(function (tName) {
                //     console.log(document);
                //     let resultArray = [];
                //     console.log('tName: ' + tName);
                //     let tagArray = document.getElementsByTagName(tName);
                //     for (let i = 0, length = tagArray.length; i < length; i++) {
                //         let domItem = {
                //             dom_url: tagArray[i].baseURI,
                //             dom_tagName: tagArray[i].tagName,
                //             dom_id: tagArray[i].id,
                //             dom_class: tagArray[i].className,
                //             dom_width: tagArray[i].offsetWidth,
                //             dom_height: tagArray[i].offsetHeight,
                //             dom_left: tagArray[i].offsetLeft,
                //             dom_top: tagArray[i].offsetTop,
                //             dom_brothersNum: tagArray[i].parentNode.childElementCount,
                //             dom_childrenNum: tagArray[i].childElementCount,
                //             dom_href: tagArray[i].href?tagArray[i].href:null,
                //             dom_innerHTML: null,
                //             // dom_innerHTML: tagArray[i].innerHTML,
                //             // dom_innerText: tagArray[i].innerHTML.replace(/<.+?>/gim, ''),
                //             dom_innerText: tagArray[i].innerHTML.replace(/<.+?>/gim, ''),
                //             targetFlag: false
                //         };
                //         resultArray.push(domItem);
                //     }
                //     callback(resultArray);
                //     // return resultArray;
                // }, tagName);
                await page.render('backend/render/' + urlName + '.png');
                await console.log('done');
                await page.close();
                return null;
            }).catch(function (err) {
                console.log(err);
                instance.exit();
            });
        })
    });
}
// let urlGoZjut = 'http://weibo.com/?category=1760';
// createPhantom(1, urlGoZjut, 'a', function (index, data) {
//     console.log('Data ' + index + '...');
//     console.log(data.length);
// });
exports.createPhantom = createPhantom;

