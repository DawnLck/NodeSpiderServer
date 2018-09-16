const brain = require('brain.js');
const netJSON = {
    "sizes": [
        8,
        4,
        4
    ],
    "layers": [
        {
            "width": {},
            "height": {},
            "dom_level": {},
            "childElementCount": {},
            "siblingsCount": {},
            "textBodyPercentage": {},
            "linkElementCount": {},
            "imageElementCount": {}
        },
        {
            "0": {
                "bias": -23.417999267578125,
                "weights": {
                    "width": 9.17359733581543,
                    "height": 12.42061996459961,
                    "dom_level": 13.87948226928711,
                    "childElementCount": -2.9722516536712646,
                    "siblingsCount": -24.507854461669922,
                    "textBodyPercentage": 15.768620491027832,
                    "linkElementCount": 4.360204696655273,
                    "imageElementCount": 0.18984298408031464
                }
            },
            "1": {
                "bias": -2.8092916011810303,
                "weights": {
                    "width": 0.34069448709487915,
                    "height": 8.400906562805176,
                    "dom_level": 3.083099842071533,
                    "childElementCount": 2.2855560779571533,
                    "siblingsCount": -35.694637298583984,
                    "textBodyPercentage": 5.790182590484619,
                    "linkElementCount": 1.6176120042800903,
                    "imageElementCount": -21.61107063293457
                }
            },
            "2": {
                "bias": 14.31540584564209,
                "weights": {
                    "width": -6.627396583557129,
                    "height": 3.9794533252716064,
                    "dom_level": -15.038548469543457,
                    "childElementCount": -53.43230056762695,
                    "siblingsCount": 0.7210049033164978,
                    "textBodyPercentage": 4.083445072174072,
                    "linkElementCount": 0.7156722545623779,
                    "imageElementCount": -10.106427192687988
                }
            },
            "3": {
                "bias": -12.21337604522705,
                "weights": {
                    "width": 9.312704086303711,
                    "height": 0.9799083471298218,
                    "dom_level": 1.0027018785476685,
                    "childElementCount": 0.9966574311256409,
                    "siblingsCount": 19.034236907958984,
                    "textBodyPercentage": 11.847274780273438,
                    "linkElementCount": 12.796168327331543,
                    "imageElementCount": 0.013565132394433022
                }
            }
        },
        {
            "0": {
                "bias": -16.826276779174805,
                "weights": {
                    "0": 16.72538948059082,
                    "1": -7.739642143249512,
                    "2": 16.391809463500977,
                    "3": -2.932137966156006
                }
            },
            "1": {
                "bias": -19.83531951904297,
                "weights": {
                    "0": 2.588974714279175,
                    "1": 25.611948013305664,
                    "2": -14.32908821105957,
                    "3": 0.9160532355308533
                }
            },
            "2": {
                "bias": -5.012476444244385,
                "weights": {
                    "0": -17.99854278564453,
                    "1": -10.676167488098145,
                    "2": -2.334087371826172,
                    "3": 24.742097854614258
                }
            },
            "3": {
                "bias": 4.103302001953125,
                "weights": {
                    "0": 0.068759486079216,
                    "1": 0.5284549593925476,
                    "2": 3.9254367351531982,
                    "3": -18.60357093811035
                }
            }
        }
    ],
    "outputLookup": false,
    "inputLookup": true,
    "activation": "sigmoid",
    "trainOpts": {
        "iterations": 20000,
        "errorThresh": 0.0005,
        "log": true,
        "logPeriod": 500,
        "learningRate": 0.3,
        "momentum": 0.1,
        "callbackPeriod": 10
    }
};

let net = new brain.NeuralNetwork();
net.fromJSON(netJSON);
console.log(net.run({
    "width": 0.744,
    "height": 0.010233333333333334,
    "dom_level": 0.8,
    "childElementCount": 0.013333333333333334,
    "siblingsCount": 0.22,
    "textBodyPercentage": 0.032305433186490456,
    "linkElementCount": 0.3,
    "imageElementCount": 0.006666666666666667
}));