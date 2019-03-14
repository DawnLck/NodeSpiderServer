/* Route - init
 * */

const express = require("express"),
  router = express.Router();

// // 该路由使用的中间件
// router.use(function timeLog(req, res, next) {
//     console.log('Time: ', Date.now());
//     next();
// });

// 定义网站主页的路由
router.get("/", function(req, res) {
  res.send("Route - init");
});
// 定义 about 页面的路由
router.get("/about", function(req, res) {
  res.send("Route - init -about");
});

module.exports = router;
