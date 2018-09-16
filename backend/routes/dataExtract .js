/* Deep learn Route */
const express = require('express'),
    router = express.Router(),
    process = require('../process/puppteerProcess/Puppeteer');

/* Express server 接收请求 get & post */
router.get('/dpLinks', function (req, res) {
   process.webDataExtraction(req.query.pageUrl).then(data =>{
       res.send(data);
   })
});
module.exports = router;