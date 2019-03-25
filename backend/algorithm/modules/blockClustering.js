/**
 *  Clustering Block 可视块聚类
 */

const DBSCAN_CONFIG = {
  MinPt: 3,
  r: 0.08
};

/* 距离计算函数 */
function distance_countable(a, b) {
  let molecular = Math.pow(a - b, 2);
  let denominator = Math.pow(a, 2) + Math.pow(b, 2);
  denominator = denominator ? denominator : 1;
  //   console.log(`molecular: ${molecular}, denominator: ${denominator}`);
  return 1 - molecular / denominator;
}

function distance_enumerable(a, b) {
  return a === b ? 1 : 0;
}

function distance_other(a, b) {
  return distance_countable(a.length, b.length);
}

/**
 * EIR / EffectiveInformationRatio
 * 有效信息率 = 非链接文本长度 / 总文本长度
 */
function getEIR(dom) {
  let linkContentLength = 0;
  dom.find("a").each((index, e) => {
    linkContentLength += $(e).prop("innerText").length;
  });

  let EffectiveInformationRatio =
    1 - linkContentLength / dom.prop("innerText").length;
  return EffectiveInformationRatio;
}

function distance(A, B) {
  let count = 0,
    num = 0;
  let domA = $(A),
    domB = $(B);
  for (let item of BlockProperty.countable) {
    let tem = distance_countable(A[item], B[item]);
    num++;
    count += tem;
  }
  for (let item of BlockProperty.enumerable) {
    let tem = distance_enumerable(A[item], B[item]);
    num++;
    count += tem;
  }
  for (let item of BlockCss.enumerable) {
    let a = domA.css(item),
      b = domB.css(item),
      tem = distance_enumerable(a, b);
    num++;
    count += tem;
  }

  // let distance_EIR = distance_countable(
  //   domA.attr("data-EIR"),
  //   domB.attr("data-EIR")
  // );

  // count += distance_EIR * 10;
  // num += 10;

  return 1 - count / num;
}

/* 聚类函数 */
function DBSCAN(doms) {
  console.log("### DBSCAN ###");
  const length = doms.length;
  let c = 0;

  for (let i = 0; i < length; i++) {
    if (doms[i].clabel !== -1) {
      continue;
    } else {
      let dom = doms[i],
        distances = dom.distances,
        N = distances.filter(p => p.distance < DBSCAN_CONFIG.r);
      if (N.length < DBSCAN_CONFIG.MinPt) {
        dom.clabel = 0;
        continue;
      } else {
        dom.clabel = ++c;

        for (let j = 0; j < N.length; j++) {
          let item = doms[N[j].index];
          if (item.clabel === 0) {
            item.clabel = c;
          }
          if (item.clabel !== -1) {
            continue;
          }
          item.clabel = c;
          let n = item.distances.filter(p => {
            return p.distance < DBSCAN_CONFIG.r;
          });
          //   console.log(`${item.index} ${item.clabel} ${item.innerText} For n`);
          //   console.log(n);
          N = Array.from(new Set(N.concat(n)));
        }
      }
      //   debugger;
      // console.log(`>>>> index ${i} <<<<`);
      // console.log(doms.map(p => p.clabel));
    }
  }
  return doms.map((p, i) => ({ index: i, data: p, clabel: p.clabel }));
}

function DBSCAN2(doms) {
  c = 0;
  doms = doms.map((i, p) => ({ idx: i, data: p, label: -1 }));
  console.log(doms);

  doms.forEach(p => {
    // Only process unlabelled points
    if (p.label !== -1) return;

    // Get all the points neighbors
    n = p.data.distances.filter(i => i.distance <= DBSCAN_CONFIG.r);
    console.log(n);

    // Check if point is noise
    if (n.length < minPts) {
      p.label = 0;
      return;
    }
  });
}

/* 执行入口 */
function clusteringBlocks() {
  console.log("### Clustering Block ###");

  let childrenDoms = [];

  let spiderDoms = $(".spider-main")
    .find(".spider")
    .each((index, e) => {
      let _self = $(e);
      let EIR = getEIR(_self);
      _self.attr("data-EIR");
      if (_self.siblings(".spider").length > 3 && EIR > 0.5) {
        childrenDoms.push(e);
      }
    });

  if (childrenDoms.length < 3) {
    console.log(
      `Warning：ChildrenDom.length 为 ${
        childrenDoms.length
      }, 这可能是一篇文章！`
    );
    $(".spider-main").addClass("spider-record");
    return false;
  }

  /* 计算所有点之间的距离 */
  for (let i = 0; i < childrenDoms.length; i++) {
    childrenDoms[i].index = i;
    childrenDoms[i].clabel = -1;
    childrenDoms[i].distances = [];
    for (let j = 0; j < childrenDoms.length; j++) {
      if (i === j) {
        continue;
      }
      let distanceTem = distance(childrenDoms[i], childrenDoms[j]);

      childrenDoms[i].distances.push({
        index: j,
        distance: distanceTem
      });
    }
  }
  // console.log(
  //   childrenDoms.map(p => ({
  //     clabel: p.clabel,
  //     distances: p.distances,
  //     innerText: p.innerText
  //   }))
  // );
  let clusterResult = DBSCAN(childrenDoms);
  // console.log(clusterResult);
  if (clusterResult[0].clabel === 0) {
    clusterResult[0].clabel = 1;
    clusterResult[0].data.clabel = 1;
  }
  //   $(childrenDoms[0]).addClass("spider-blockcluster");
  //   $(clusterResult[1].data).addClass("spider-blockcluster");

  let result = [];
  for (let i = 0; i < clusterResult.length; i++) {
    if (clusterResult[i].clabel === 1) {
      $(clusterResult[i].data).addClass("spider-blockcluster spider-record");
      result.push(clusterResult[i]);
    } else {
      $(clusterResult[i].data).addClass("spider-blockcluster-false");
    }
  }

  return result;
}
