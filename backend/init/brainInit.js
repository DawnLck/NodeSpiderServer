var mongoose = require('mongoose');
var myDomScheme = require('../mongooseModel').domSchema;
var saveDlArray = require('../mongooseModel').saveDeepLearnArray;
var brain = require('brain.js');

var linksNet = null;
var contentNet = null;

var reduceModel = function (modelName, callback) {
    console.log('Reduce model....' + modelName);
    var targetModel = mongoose.model(modelName, myDomScheme);
    targetModel.find({}, function (err, docs) {
        if (err || !docs.length) {
            console.log(err);
        }
        else {
            console.log('Doc.Length: ' + docs.length);
            // console.log(docs);
            var samples = [];
            var saveArray = [];
            for (var index in docs) {
                var doc = docs[index];
                samples.push({
                    input: [
                        doc.dom_brothersNum,
                        doc.dom_childrenNum,
                        doc.dom_height,
                        doc.dom_width,
                        doc.dom_left,
                        doc.dom_top,
                        doc.dom_innerText ? doc.dom_innerText.length : 0
                    ],
                    output: [doc.targetFlag ? 1 : 0]
                });
                saveArray.push({
                    brotherNum: doc.dom_brothersNum,
                    childrenNum: doc.dom_childrenNum,
                    height: doc.dom_height,
                    width: doc.dom_width,
                    left: doc.dom_left,
                    top: doc.dom_top,
                    innerTextLength: doc.dom_innerText ? doc.dom_innerText.length : 0,
                    targetFlag: doc.targetFlag ? 1 : 0
                });
            }
            saveDlArray(saveArray, modelName + '_reduce');
            callback(samples);
        }
    });
};

/* 化简数据 */
var reduceData = function (arr) {
    var reduceArr = [];
    for (var index in arr) {
        var doc = arr[index];
        reduceArr.push(
            doc.dom_brothersNum,
            doc.dom_childrenNum,
            doc.dom_height,
            doc.dom_width,
            doc.dom_left,
            doc.dom_top,
            doc.dom_innerText ? doc.dom_innerText.length : 0
        );
    }
    return reduceArr;
};

/* 构建并训练神经网络 */
var deepLearn = function (input, callback) {
    var net = new brain.NeuralNetwork({
        hiddenLayers: [8, 7],
        learningRate: 0.2
    });
    // var inputArray = [{input: [0, 0], output: [0]},
    //     {input: [0, 1], output: [1]},
    //     {input: [1, 0], output: [1]},
    //     {input: [1, 1], output: [0]}];
    // var testData = [1,0];
    net.train(input, {
        errorThresh: 0.005,  // error threshold to reach
        iterations: 20000,   // maximum training iterations
        log: true,           // console.log() progress periodically
        logPeriod: 5000,       // number of iterations between logging
        learningRate: 0.1    // learning rate
    });
    // var output = net.run(test);
    callback(net);
};

/* 使用神经网络（数组形式输入） */
var testArray = function (arr, net, callback) {
    var result = [];
    for (var index in arr) {
        testSingleCase(net, arr[index], function (data) {
            result.push(data.slice());
        });
    }
    callback(result);
};

/* 使用神经网络（单例形式输入） */
var testSingleCase = function (net, testItem, callback) {
    // console.log(testItem);
    callback(net.run(testItem));
};

/*评估神经网络 */
var evaluateDNN = function (arr, net, callback) {
    var result = [];
    for (var index in arr) {
        testSingleCase(net, arr[index].input, function (data) {
            // result.push(data.slice());
            console.log('index： ' + index + ' w：' + arr[index].input);
            if (parseInt(arr[index].input[3]) > 100) {
                result.push({
                    index: index,
                    paramsInput: arr[index].input,
                    paramsOutput: arr[index].output,
                    outputTest: data.slice()
                });
            }
        });
    }
    callback(result);
};

var useLinkDNN_Arr = function (arr, callback) {
    console.log('Using Link-DNN to parse webpage....');
    var net = linksNet;
    var result = [];
    var index = 0;
    var arrLength = arr.length;
    // var getProbability = function () {
    //     if (index < arrLength) {
    //         var doc = arr[index];
    //         // console.log(doc);
    //         var docReduce = [doc.dom_brothersNum,
    //             doc.dom_childrenNum,
    //             doc.dom_height,
    //             doc.dom_width,
    //             doc.dom_left,
    //             doc.dom_top,
    //             doc.dom_innerText ? doc.dom_innerText.length : 0];
    //         var probability = net.run(docReduce);
    //
    //         probability = probability['0'].toFixed(4);
    //         if (probability > 0.3) {
    //             console.log('[' + index + ', ' + probability + ']');
    //             result.push({
    //                 index: index,
    //                 dom_href: doc.dom_href,
    //                 dom_innerText: doc.dom_innerText,
    //                 dom_probability: probability
    //             });
    //         }
    //         console.log(index + ' ' + probability);
    //         index++;
    //         getProbability();
    //     }
    // };
    // (function () {
    //     getProbability();
    //     callback(result);
    // })();

    for (; index < arrLength; index++) {
        var doc = arr[index];
        // console.log(doc);
        var docReduce = [doc.dom_brothersNum,
            doc.dom_childrenNum,
            doc.dom_height,
            doc.dom_width,
            doc.dom_left,
            doc.dom_top,
            doc.dom_innerText ? doc.dom_innerText.length : 0];
        var probability = net.run(docReduce);

        probability = probability['0'].toFixed(4);
        if (probability > 0.3) {
            console.log('[' + index + ', ' + probability + ']');
            result.push({
                index: index,
                dom_href: doc.dom_href,
                dom_innerText: doc.dom_innerText,
                dom_probability: probability
            });
        }
    }
    callback(result);
};

var useContentDNN_Arr = function (arr, callback) {
    console.log('Using Content-DNN to parse webpage....');
    var net = contentNet;
    var result = [];
    var arrLength = arr.length;
    var height_limit = arr[0].dom_height - 1000;
    for (var index = 0; index < arrLength; index++) {
        var doc = arr[index];
        if (doc.dom_height > height_limit) {
            continue;
        }
        var docReduce = [
            doc.dom_brothersNum,
            doc.dom_childrenNum,
            doc.dom_height,
            doc.dom_width,
            doc.dom_left,
            doc.dom_top,
            doc.dom_innerText ? doc.dom_innerText.length : 0];
        var probability = net.run(docReduce);
        // console.log(probability);
        probability = probability['0'].toFixed(4);
        if (probability > 0.3) {
            console.log('[' + index + ', ' + doc.dom_height + ', ' + probability + ']');
            result.push({
                index: index,
                dom_href: doc.dom_href,
                dom_innerText: doc.dom_innerText,
                dom_probability: probability
            });
        }
    }
    callback(result);
};

/* 测试神经网络 */
var testDNN = function () {
    reduceModel('dom_ex8', function (input) {
        var test = [[14, 0, 16, 78, 436, 12, 8],
            [1, 0, 16, 254, 0, 13, 18],
            [1, 0, 16, 330, 0, 13, 24]];//测试案例

        deepLearn(input, function (net) {
            console.log('Test...');
            // testArray(input, net, function (data) {
            //     console.log(data);
            // });
            reduceModel('dom_ex9', function (evaInput) {
                evaluateDNN(evaInput, net, function (data) {
                    console.log('length: ' + data.length);
                    console.log(data);
                });
            });
            console.log('None?');
        })
    });
};

var trainLinkDNN = function (modelName, callback) {
    var targetModel = mongoose.model(modelName, myDomScheme);
    targetModel.find({}, function (err, docs) {
        // console.log(docs.length);
        if (err || !docs.length) {
            console.log(err);
        }
        else {
            console.log('Doc.Length: ' + docs.length);
            var trainSamples = [];
            // var saveArray = [];
            for (var index in docs) {
                var doc = docs[index];
                if (doc.dom_height < 1000) {
                    trainSamples.push({
                        input: [
                            doc.dom_brothersNum,
                            doc.dom_childrenNum,
                            doc.dom_height,
                            doc.dom_width,
                            doc.dom_left,
                            doc.dom_top,
                            doc.dom_innerText ? doc.dom_innerText.length : 0
                        ],
                        output: [doc.targetFlag ? 1 : 0]
                    });
                }
                // if(doc.targetFlag === true){
                //     console.log('TargetIndex'+ index + '!' + trainSamples[index].output);
                // }
                // saveArray.push({
                //     brotherNum: doc.dom_brothersNum,
                //     childrenNum: doc.dom_childrenNum,
                //     height: doc.dom_height,
                //     width: doc.dom_width,
                //     left: doc.dom_left,
                //     top: doc.dom_top,
                //     innerTextLength: doc.dom_innerText ? doc.dom_innerText.length : 0,
                //     targetFlag: doc.targetFlag ? 1 : 0
                // });
            }
            // saveDlArray(saveArray, modelName + '_reduce');
            console.log('TrainSamples Length: ' + trainSamples.length);
            console.log(trainSamples[0]);
            var net = new brain.NeuralNetwork({
                hiddenLayers: [8, 7],
                learningRate: 0.2
            });
            net.train(trainSamples, {
                errorThresh: 0.005,  // error threshold to reach
                iterations: 20000,   // maximum training iterations
                log: true,           // console.log() progress periodically
                logPeriod: 5000,       // number of iterations between logging
                learningRate: 0.1    // learning rate
            });

            // for (var testIndex in trainSamples) {
            //     var probability = net.run(trainSamples[testIndex].input);
            //     probability = probability['0'].toFixed(4);
            //     if(probability > 0.3){
            //         console.log('target!: (' + testIndex + ' ' + probability + ')'  + ' ' + trainSamples[testIndex].output);
            //     }else if (probability > 0.2){
            //         console.log('justSoso!:('+ testIndex + ' ' + probability + ')' + ' ' + trainSamples[testIndex].output);
            //     }else{
            //         console.log('('+ testIndex + ' ' + probability + ')'  + ' ' + trainSamples[testIndex].output);
            //     }
            // }

            callback(net);
        }
    });
};

var trainContentDNN = function (modelName, callback) {
    console.log('Reduce model....' + modelName);
    var targetModel = mongoose.model(modelName, myDomScheme);
    targetModel.find({}, function (err, docs) {
        console.log(docs.length);
        if (err || !docs.length) {
            console.log(err);
        }
        else {
            console.log('Doc.Length: ' + docs.length);
            var trainSamples = [];
            // var saveArray = [];
            for (var index in docs) {
                var doc = docs[index];
                if (doc.dom_height < 1000) {
                    trainSamples.push({
                        input: [
                            doc.dom_brothersNum,
                            doc.dom_childrenNum,
                            doc.dom_height,
                            doc.dom_width,
                            doc.dom_left,
                            doc.dom_top,
                            doc.dom_innerText ? doc.dom_innerText.length : 0
                        ],
                        output: [doc.targetFlag ? 1 : 0]
                    });
                }
                // if(doc.targetFlag === true){
                //     console.log('TargetIndex'+ index + '!' + trainSamples[index].output);
                // }
                // saveArray.push({
                //     brotherNum: doc.dom_brothersNum,
                //     childrenNum: doc.dom_childrenNum,
                //     height: doc.dom_height,
                //     width: doc.dom_width,
                //     left: doc.dom_left,
                //     top: doc.dom_top,
                //     innerTextLength: doc.dom_innerText ? doc.dom_innerText.length : 0,
                //     targetFlag: doc.targetFlag ? 1 : 0
                // });
            }
            // saveDlArray(saveArray, modelName + '_reduce');
            console.log('TrainSamples Length: ' + trainSamples.length);
            console.log(trainSamples[0]);
            var net = new brain.NeuralNetwork({
                hiddenLayers: [9, 8],
                learningRate: 0.2
            });
            net.train(trainSamples, {
                errorThresh: 0.005,  // error threshold to reach
                iterations: 20000,   // maximum training iterations
                log: true,           // console.log() progress periodically
                logPeriod: 5000,       // number of iterations between logging
                learningRate: 0.1    // learning rate
            });

            // for (var testIndex in trainSamples) {
            //     var probability = net.run(trainSamples[testIndex].input);
            //     probability = probability['0'].toFixed(4);
            //     if(probability > 0.3){
            //         console.log('target!: (' + testIndex + ' ' + probability + ')'  + ' ' + trainSamples[testIndex].output);
            //     }else if (probability > 0.2){
            //         console.log('justSoso!:('+ testIndex + ' ' + probability + ')' + ' ' + trainSamples[testIndex].output);
            //     }else{
            //         console.log('('+ testIndex + ' ' + probability + ')'  + ' ' + trainSamples[testIndex].output);
            //     }
            // }

            callback(net);
        }
    });
};

/* 初始化训练神经网络 */
exports.init = function () {
    console.log('Brain DeepLearning Frame Init....');
    // reduceModel('dom_ex8', function (input) {
    //     deepLearn(input, function (net) {
    //             linksNet = net;
    //             console.log('DeepLinkNet is ready.');
    //         }
    //     )
    // });

    trainLinkDNN('link_train_1', function (net) {
        linksNet = net;
        console.log('DeepLinkNet is ready...');
    });

    trainContentDNN('content_train_2', function (net) {
        contentNet = net;
        console.log('DeepContentNet is ready...');
        // var test = [
        //     [6, 1, 2126, 1920, 0, 0, 7049],
        //     [3, 1, 390, 652, 481, 417, 408],
        //     [1, 0, 0, 1920, 0, 261, 0]
        // ];
        // for (var index in test) {
        //     var probability = net.run(test[index]);
        //     probability = probability['0'].toFixed(4);
        //     console.log(index + ' ' + probability);
        // }
    });
};

exports.useLinkDNN_Arr = useLinkDNN_Arr;
exports.useContentDNN_Arr = useContentDNN_Arr;

exports.linksNet = linksNet;
exports.contentNet = contentNet;