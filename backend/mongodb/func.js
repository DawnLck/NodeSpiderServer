/* func */
module.exports.saveArray = function (arr, collName, schema) {
    let arrLength = arr.length;
    let targetModel = mongoose.model(collName, schema, collName);

    console.log('CollName:' + collName + ' ArrayLength: ' + arrLength);

    targetModel.remove({}, function (err) {
        if (err) {
            console.log(err);
        }
    });

    for (let i = 0; i < arrLength; i++) {
        let item = arr[i];
        // console.log('Processing ' + i + '/' + arrLength);
        new targetModel(item).save(function (err) {
            if (err) {
                return handleError(err);
                // console.log(i + '/' + arrLength + ' 存入失败.');
            } else {
                // console.log(i + '/' + arrLength + ' 存入成功.');
            }
        }).catch();
    }
};
module.exports.saveDeepLearnArray = function (arr, collName) {
    saveArray(arr, collName, deepLearnSchema);
};
/*  将DOM结点数组存放进集合中  */
module.exports.saveDomArrayToCollection = function (arr, collName) {
    console.log('Save Dom Array To Collection...');
    //console.log(collName);
    saveArray(arr, collName, domSchema);
};
/* 将单个DOM结点存放进集合中 */
module.exports.saveDomItemToCollection = function (item, collName) {
    let targetModel = mongoose.model(collName, domSchema);
    new targetModel(item).save(function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('Success to save the document.存入成功.');
        }
    });
};

module.exports.readAllDocs = function (collName, callback) {
    mongoose.model(collName).find({}, function (err, docs) {
        if (err) {
            console.log(err);
            callback(null);
        } else {
            callback(docs);
        }
    })
};
