/**
 * Route - api
 * 接收前端的参数并处理
 * */

const express = require("express");
const puppeteer = require("../process/puppteerProcess/Puppeteer");
const router = express.Router();

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
  console.log(callback);
  res.send(callback);
});

module.exports = router;
