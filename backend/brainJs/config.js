/**
 *  config.js
 **/

module.exports.networkConfig = {
    // binaryThresh: 0.5,      // ¯\_(ツ)_/¯

    hiddenLayers: [3],      // array of ints for the sizes of the hidden layers in the network
    activation: 'sigmoid',   // Supported activation types ['sigmoid', 'relu', 'leaky-relu', 'tanh']

    iterations: 20000,
    learningRate: 0.3 // global learning rate, useful when training using streams
};

module.exports.datasetConfig = {
    SPLIT : 80
};
