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
router.get('/', function(req, res) {
    let query = req.query;
    let url = query.url;
    console.log(query);

    phantom.createPhantom(url);

    res.send('Route - process');
});
// 定义 about 页面的路由
router.get('/about', function(req, res) {
    res.send('Route - process -about');
});
// 定义 about 页面的路由
router.get('/about', function(req, res) {
    res.send('Route - process -about');
});

module.exports = router;
