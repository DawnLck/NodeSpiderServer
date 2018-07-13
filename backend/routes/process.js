/* Route - process
* */

let express = require('express');
let router = express.Router();
let phantom = require('../tools/PhantomProcess');

// // 该路由使用的中间件
// router.use(function timeLog(req, res, next) {
//     console.log('Time: ', Date.now());
//     next();
// });

// 定义网站主页的路由
router.get('/', async function (req, res) {
    let query = req.query;
    let url = query.url,
        urlName = query.pageName,
        tag = 'div';
    console.log(query);

    phantom.createPhantom(urlName, url, tag, function(result){
        console.log('Result'+ result);
        res.send('Route - process');
    });

});

module.exports = router;
