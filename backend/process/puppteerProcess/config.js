/**
 *  puppteer config.js
 **/

module.exports = {
    browserConfig: {
        // 若是手动下载的chromium需要指定chromium地址, 默认引用地址为 /项目目录/node_modules/puppeteer/.local-chromium/
        // executablePath: '/Users/huqiyang/Documents/project/z/chromium/Chromium.app/Contents/MacOS/Chromium',
        //设置超时时间
        timeout: 15000,
        //如果是访问https页面 此属性会忽略https错误
        ignoreHTTPSErrors: true,
        // 打开开发者工具, 当此值为true时, headless总为false
        devtools: false,
        // headless为true, 不会打开浏览器
        headless: true,
        args: [
            "--window-size=1366," + (768 * 2),
            '--disable-dev-shm-usage'
        ]
    },
    TAG_LINK: 'A',
    TAG_DIV: 'DIV',
    META_KEYWORD: 'meta[name="keywords"]',
    screenShot: false
};