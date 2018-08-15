const puppeteer = require("backend/process/puppteerProcess/Puppeteer");

class BasePuppeteer{
    puppConfig(){
        const config = {
            headless: false
        };
        return config
    }
    async openBrower(setting){
        const browser = puppeteer.launch(setting);
        return browser;
    }
    async openPage(browser){
        const page = await browser.newPage();
        return page;
    }
    async closeBrower(browser){
        await browser.close();
    }
    async closePage(page){
        await page.close();
    }
}

const pupp = new BasePuppeteer();
module.exports = pupp;