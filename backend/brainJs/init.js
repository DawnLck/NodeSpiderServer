const {getData} = require('./dateset'),
    getAccuracy = require('./getAccuracy').getAccuracy,
    brain = require('brain.js'),
    fs = require('fs'),
    path = require('path'),
    {networkConfig, datasetConfig} = require('./config');

const SPLIT = datasetConfig.SPLIT;

async function init() {
    let DATA = await getData();
    // console.log(DATA);

    const trainData = DATA.slice(0, SPLIT);
    const testData = DATA.slice(SPLIT + 1);

    // https://github.com/BrainJS/brain.js
    //create a simple feed forward neural network with backpropagation

    const net = new brain.NeuralNetwork(networkConfig);

    await net.train(trainData);

    const accuracy = getAccuracy(net, testData);
    console.log('accuracy: ', accuracy);

    let jsonNet = JSON.stringify(net.toJSON(), null, 4);
    await fs.writeFileSync(path.join(__dirname, 'net.json'), jsonNet);
    console.log('NetWork 写入完成');
    await fs.close();

    return null;
}

module.exports.init = init;
