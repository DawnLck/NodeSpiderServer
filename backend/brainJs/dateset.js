const {domsModel} = require('../mongodb'),
    // iris = require('./iris'),
    {shuffle} = require('./shuffle');

module.exports.getData = async () => {
    let data = await domsModel.find({}, {
        document_width: 0,
        document_height: 0,
        classList: 0,
        // links: 0,
        meta_href: 0,
        meta_domain: 0,
        title: 0,
        textDensity: 0,
        textMainPercentage: 0,
        innerText: 0
    }).exec();
    // }).where('dom_category').in(['postArea', 'postItem', 'postItemAuthor']).exec();
    let samples = [],
        labels = [],
        length = data.length;
    for (let i = 0; i < length; i++) {
        await samples.push({
            /* Property 属性 */
            // offsetTop: data[i].offsetTop,
            // offsetLeft: data[i].offsetLeft,

            // realTop: data[i].realTop,
            // realLeft: data[i].realLeft,

            width: data[i].width / 1000,
            height: data[i].height / 30000,

            dom_level: data[i].dom_level / 10,
            childElementCount: data[i].childElementCount / 150,
            siblingsCount: data[i].siblingsCount / 150,

            textBodyPercentage: data[i].textBodyPercentage,

            linkElementCount: data[i].links.length / 20,
            imageElementCount: data[i].imageElementCount / 150
        });
        switch (data[i].dom_category) {
            case 'mainArea':
                await labels.push([1, 0, 0, 0]);
                break;
            case 'postArea':
                await labels.push([0, 1, 0, 0]);
                break;
            case 'postItem':
                await labels.push([0, 0, 1, 0]);
                break;
            case 'postItemAuthor':
                await labels.push([0, 0, 0, 1]);
                break;
            default:
                break;
        }
        // console.log(data[i]);
    }


    // console.log(samples);
    const orderedData = await samples.map((sample, index) => {
        return {
            input: sample,
            output: labels[index]
        }
    });
    console.log('DATASET_LENGTH: ' + orderedData.length);

    const shuffledData = shuffle(orderedData);

    // DATA = data;
    return shuffledData;
};

// let data = getData();
// console.log(data.length);
