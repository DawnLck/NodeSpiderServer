/**
 * Route - api
 * 接收前端的参数并处理
 * */

const express = require("express");
const puppeteer = require("../process/puppteerProcess/Puppeteer");
const router = express.Router();
/**
 * CORS设置
 */
//设置允许跨域访问该服务.
router.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

router.get("/", function(req, res) {
  console.log("sss");
  res.send("hello,this is a /.");
});
//
router.get("/test", function(req, res) {
  console.log("sss");
  res.send("hello,this is a test.");
});

// 定义网站主页的路由
router.post("/spider", async function(req, res) {
  const website = req.body.website;
  let callback = await puppeteer.pageSpider(website);
  // console.log(callback);
  res.send(callback);
});

module.exports = router;
