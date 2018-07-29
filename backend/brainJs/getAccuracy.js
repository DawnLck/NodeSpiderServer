module.exports.getAccuracy = function (net, testData) {
    let hits = 0;
    testData.forEach((datapoint) => {
        const output = net.run(datapoint.input),
            result = [],
            length = output.length,
            groundTruth = datapoint.output;
        let flag = true;

        for (let i = 0; i < output.length; i++) {
            result.push(Math.round(output[i]));
        }

        for (let i = 0; i < output.length; i++) {
            if (datapoint.output[i] !== result[i]) {
                flag = false;
            }
        }

        if (flag) {
            hits++;
        } else {
            console.log('###############');
            console.log(output);
            console.log(result);
            console.log(datapoint.output);
        }

    });
    return hits / testData.length;
};
