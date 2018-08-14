/* Route - data
* */

const express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    {webpagesModel, domsModel, testDomsModel, testPagesModel} = require('../mongodb');

router.use(bodyParser.urlencoded({extended: false}));

router.get('/savePage', function (req, res) {
    console.log(req.query);
    let data = new webpagesModel(req.query);
    data.save().then(suc => {
        console.log('保存成功：' + suc);
        res.send('保存成功：' + suc);
    }, err => {
        console.log('保存失败: ' + err);
        res.send('保存失败: ' + err)
    })
});

router.post('/saveDom', function (req, res) {
    console.log(req.body);
    let data = new domsModel(req.body);
    data.save().then(suc => {
        console.log('保存成功：' + suc);
        res.send('保存成功：' + suc);
    }, err => {
        console.log('保存失败: ' + err);
        res.send('保存失败: ' + err)
    })
});

router.get('/saveTestPage', function (req, res) {
    console.log(req.query);
    let data = new testPagesModel(req.query);
    data.save().then(suc => {
        console.log('保存成功：' + suc);
        res.send('保存成功：' + suc);
    }, err => {
        console.log('保存失败: ' + err);
        res.send('保存失败: ' + err)
    })
});

router.post('/saveTestDom', function (req, res) {
    console.log(req.body);
    let data = new testDomsModel(req.body);
    data.save().then(suc => {
        console.log('保存成功：' + suc);
        res.send('保存成功：' + suc);
    }, err => {
        console.log('保存失败: ' + err);
        res.send('保存失败: ' + err)
    })
});

module.exports = router;
