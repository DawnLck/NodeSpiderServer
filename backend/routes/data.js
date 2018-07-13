/* Route - data
* */

const express = require('express'),
    router = express.Router(),
    {webpagesModel} = require('../mongodb');

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

module.exports = router;
