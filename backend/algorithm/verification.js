/**
 * 验证算法
 * */
async function verification(page) {
  let testPages = await testPagesModel.find({}).exec();
  let length = testPages.length,
    positivePageCount = 0,
    positivePostItemCount = 0,
    totalPostItemCount = 0;

  for (let i = 0; i < length; i++) {
    // if (testPages[i].domain === 'kaoyan') {
    //     positivePageCount++;
    //     continue;
    // }
    console.log(testPages[i]);
    let positive = 0;
    let pageUrl = testPages[i].url;
    let groundTruth = await testDomsModel
      .find({ meta_href: pageUrl, dom_category: "postItem" })
      .exec();
    // console.log(pageUrl);
    // console.log(groundTruth);
    let truthLength = groundTruth.length;

    let result = await dataExtract(pageUrl, page);
    let nodeData = result.listNode.concat(result.listNodeCandidateFilter);
    for (let j = 0; j < truthLength; j++) {
      let item = groundTruth[j];
      for (let x = 0, outputLength = nodeData.length; x < outputLength; x++) {
        if (
          item.innerText.replace(/\n+|\s+/gi, "").indexOf(nodeData[x].content)
        ) {
          positive++;
          break;
        }
      }
    }
    positivePostItemCount += positive;
    totalPostItemCount += truthLength;
    let positiveRate = positive / truthLength;
    console.log(
      "Positive Rate: " +
        "[" +
        positive +
        ", " +
        truthLength +
        "] " +
        positiveRate
    );
    if (positiveRate > 0.7) {
      positivePageCount++;
    }
    // console.log(result.length);
  }

  console.log(
    "Total postsItem rate: " +
      "[" +
      positivePostItemCount +
      ", " +
      totalPostItemCount +
      "] " +
      positivePostItemCount / totalPostItemCount
  );
  console.log(
    "Total page rate: " +
      "[" +
      positivePageCount +
      ", " +
      length +
      "] " +
      positivePageCount / length
  );
}

module.exports.verification = verification;
