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
