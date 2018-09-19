/**
 *  config.js
 **/

module.exports.networkConfig = {
    // binaryThresh: 0.5,      // ¯\_(ツ)_/¯
    errorThresh: 0.0005,  // error threshold to reach

    hiddenLayers: [4],      // array of ints for the sizes of the hidden layers in the network
    activation: 'sigmoid',   // Supported activation types ['sigmoid', 'relu', 'leaky-relu', 'tanh']

    iterations: 20000,
    log: true,           // console.log() progress periodically
    logPeriod: 500,       // number of iterations between logging
    learningRate: 0.3 // global learning rate, useful when training using streams
};

module.exports.datasetConfig = {
    SPLIT : 700
};
