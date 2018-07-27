const {domsModel} = require('../mongodb');

module.exports.getData = async () => {
    let data = await domsModel.find({}, {
        classList: 0,
        links: 0,
        meta_href: 0,
        meta_domain: 0,
        title: 0,
        innerText: 0
    }).exec();
    let samples = [],
        labels = [],
        length = data.length;
    for (let i = 0; i < length; i++) {
        await samples.push({
            /* meta信息 */
            document_width: data[i].document_width,
            document_height: data[i].document_height,

            /* Property 属性 */
            offsetTop: data[i].offsetTop,
            offsetLeft: data[i].offsetLeft,

            realTop: data[i].realTop,
            realLeft: data[i].realLeft,

            width: data[i].width,
            height: data[i].height,

            dom_level: data[i].dom_level,
            childElementCount: data[i].childElementCount,
            siblingsCount: data[i].siblingsCount,

            textDensity: data[i].textDensity,
            textMainPercentage: data[i].textMainPercentage,
            textBodyPercentage: data[i].textBodyPercentage,

            linkElementCount: data[i].linkElementCount,
            imageElementCount: data[i].imageElementCount
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
    console.log(orderedData.length);
    // DATA = data;
    return orderedData;
};


// let data = getData();
// console.log(data.length);
