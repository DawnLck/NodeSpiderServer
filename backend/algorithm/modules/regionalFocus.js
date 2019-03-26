/**
 * Regional Focus 区域聚焦
 */

let bodyDom = {},
  bodyWidth,
  bodyHeight,
  pageX,
  pageY,
  bodyContentLength;

/* 0. 异步获取Page的一些基本信息 */
async function getPageBase() {
  $("html").css({
    "max-width": "1980px",
    width: "100%"
  });
  bodyDom = document.getElementsByTagName("body")[0];
  bodyWidth = bodyDom.scrollWidth;
  bodyHeight = bodyDom.scrollHeight;
  pageX = document.documentElement.offsetWidth / 2;
  pageY = document.documentElement.offsetHeight / 2;
  bodyContentLength = bodyDom.innerText.length;
  // console.log(bodyDom.innerText);
}

// 1. 面积大小比较 > 0.3
async function areaComparison(dom) {
  let domTag = dom.prop("tagName");
  if (domTag === "P" || domTag === "SPAN") {
    return false;
  }
  let _width = dom.prop("offsetWidth"),
    _height = dom.prop("offsetHeight"),
    areaProportion = (_width * _height) / (bodyWidth * bodyHeight);

  if (_width / bodyWidth > 0.2 || _height / bodyHeight > 0.2) {
    if (areaProportion > CONFIG.threshold.area) {
      dom.addClass("spider spider-areaOk");
      return true;
    } else if (_width / bodyWidth > 0.25 && _height > MIN_HEIGHT) {
      dom.addClass("spider");
    } else {
    }
    dom.attr("data-area-comparision", areaProportion);
  }
  return false;
}

// 2. 文本长度比较 > 0.45
async function textComparison(dom) {
  let _contentLength = dom.prop("innerText").length,
    textProportion = _contentLength / bodyContentLength;
  if (textProportion > CONFIG.threshold.text) {
    dom.addClass("spider-textOk");
    return true;
  } else {
  }
  dom.attr("data-text-comparision", textProportion);
  return false;
}

// 3. 中心偏移计算 < 0.4
async function centerComparison(dom) {
  // console.log("》 中心偏移计算 《");
  let domX = dom.offset().left + dom.prop("offsetWidth") / 2,
    domY = dom.offset().top + dom.prop("offsetHeight") / 2,
    offset = Math.sqrt(Math.pow(pageX - domX, 2) + Math.pow(pageY - domY, 2)),
    centerProportion = offset / bodyWidth;

  dom.attr("data-offsetLeft", `${dom.offset().left}`);
  dom.attr("data-offsetWidth", `${dom.prop("offsetWidth")}`);

  dom.attr("data-domCenter", `(${domX}, ${domY})`);
  dom.attr("data-pageCenter", `(${pageX}, ${pageY})`);

  // console.log(`[${domX}, ${domY}] / [${pageX}, ${pageY}]`);
  // console.log(`offset: ${offset}  bodyWidth: ${bodyWidth}`);

  if (centerProportion < CONFIG.threshold.center) {
    dom.addClass("spider-centerOk spider-main");
    return true;
  } else {
  }

  dom.attr("data-center-comparision", centerProportion);

  return false;
}

// 维度重叠
async function dimensionOverlap(doms) {
  console.log("[Regional Focus]: dimension overlap....");
  doms.each(() => {
    let _self = $(this),
      _parent = _self.parent(),
      _width = _self.prop("offsetWidth"),
      _height = _self.prop("offsetHeight");

    while (true) {
      if (_parent.hasClass("spider")) {
        let _parentWidth = _parent.prop("offsetWidth"),
          _parentHeight = _parent.prop("offsetHeight");
        if (_parentWidth < _width * 1.2 && _parentHeight < _height * 1.2) {
          _parent.removeClass("spider");
          _parent = _parent.parent();
        } else {
          break;
        }
      } else {
        break;
      }
    }
  });
}

// 嵌套解耦
async function deNesting(doms) {
  console.log("[Regional Focus]: deNesting....");
  doms.each(function() {
    let _self = $(this),
      _parent = _self.parent(),
      _width = _self.prop("offsetWidth"),
      _height = _self.prop("offsetHeight");

    while (true) {
      let _parentWidth = _parent.prop("offsetWidth"),
        _parentHeight = _parent.prop("offsetHeight");

      if (_parent.hasClass("spider-main")) {
        if (_parentWidth < _width * 1.2 || _parentHeight < _height * 1.2) {
          _parent.removeClass("spider-main"); //todo 如果是父节点去除spider-main，则范围缩小，反之放大
          _parent = _parent.parent();
        } else {
          break;
        }
      } else {
        break;
      }
    }
  });
}

// 合并区域
async function mergeArea() {
  console.log("[Regional Focus]: merge area....");
  $(".spider-main").each(function() {
    let _self = $(this);
    if (_self.find(".spider-main").length > 0) {
      _self.removeClass("spider-main");
    }
  });
}

// 区域聚焦主程序
async function regionalFocus() {
  console.log("regionalFocus !");

  await getPageBase();

  let _allDiv = $("*");

  _allDiv.each(async function() {
    let _self = $(this);
    if (await areaComparison(_self)) {
      // console.log("Area Ok!");
      if (await textComparison(_self)) {
        // console.log("Text Ok!");
        await centerComparison(_self);
      } else {
      }
    } else {
    }
  });

  //维度重叠
  await dimensionOverlap($(".spider"));

  //嵌套解耦
  await deNesting($(".spider-main"));

  //合并区域
  await mergeArea();

  if (!$(".spider-main").length) {
    console.log("ERROR: 未能找到正文区域！");
    return false;
  }

  // 标记非正文区域节点
  $(".spider-main")
    .siblings(".spider")
    .each(function() {
      $(this).addClass("spider-nonMain");
      // console.log('Area Siblings ... ');
    });

  return true;
}
