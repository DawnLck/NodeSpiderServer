async function pageExtraction() {
  /**
   * 网页数据提取
   * */
  let resultCallback;
  if (classifyCallback.category === "bbs") {
    resultCallback = await page.evaluate(async () => {
      const Timer = {
        data: {},
        start: function(key) {
          // console.log('Timer start ... ');
          Timer.data[key] = new Date();
        },
        stop: function(key) {
          // console.log('Timer stop ... ');
          let time = Timer.data[key];
          if (time) Timer.data[key] = new Date() - time;
        },
        getTime: function(key) {
          return Timer.data[key] / 1000 + " s";
        }
      };
      const rootFontSize = parseInt(
          window.getComputedStyle(document.getElementsByTagName("body")[0])
            .fontSize
        ),
        DATE_REG = /[0-2]\d{3}-\d{1,2}-\d{1,2}|((\d{4})年)?(\d{1,2})月(\d{1,2})日|\d{2}:\d{2}/gi,
        MIN_HEIGHT = 2 * rootFontSize;

      setTimeout(function() {
        $("body")
          .find("iframe")
          .remove("");
      }, 2000);

      /* 标记主要区域 */
      async function markMainArea() {
        Timer.start("mainMark");
        console.log("Mark main area ... ");
        let _body = document.getElementsByTagName("body")[0],
          bodyWidth = _body.scrollWidth,
          bodyHeight = _body.scrollHeight,
          // bodyTextLength = _body.innerText.length,
          // rootFontSize = parseInt(window.getComputedStyle(_body).fontSize),
          allDiv = $("div");

        console.log(
          "Body { width:" + bodyWidth + " height: " + bodyHeight + " }"
        );
        console.log("Body Font-size: " + rootFontSize);

        //标记
        allDiv.each(function() {
          let _width = ($(this).width() / bodyWidth) * 100.0;
          let _height = ($(this).height() / bodyHeight) * 100;
          let _text = $(this).text().length;
          // let _textDensity = _text.length / bodyTextLength.length * 100;

          if (_text && _width > 30) {
            if (_height > 60) {
              // console.log(_width + ' ' + _height);
              $(this).addClass("spider spider-main");
            } else if ($(this).height() > MIN_HEIGHT) {
              $(this).addClass("spider");
              // console.log('## Spider: ' + $(this).height() + ' ' + $(this).text());
            } else {
              // console.log('## Non-Spider: ' + $(this).height() + ' ' + $(this).text());
              // console.log('Remove: ' + $(this).height());
              // $(this).removeClass('spider');
            }
          }

          _width = null;
          _height = null;
          _text = null;
          // _textDensity = null;
        });

        //
        // function filterMain(node) {
        //     node.children().each(function () {
        //         let _self = $(this);
        //         if(_self.hasClass('spider-main')){
        //             filterMain(_self);
        //             let _parent = _self.parent();
        //             if(_self.width() * 1.1 > _parent.width()){
        //                 _self.removeClass('spider-main');
        //             }else{
        //                 _parent.removeClass('spider-main');
        //             }
        //         }
        //     });
        // }
        // filterMain($('body'));

        // test

        $("div.spider-main").each(function() {
          let _self = $(this);
          let _parent = _self.parent();
          if (
            _parent.hasClass("spider") &&
            _self.width() * 1.1 > _parent.width()
          ) {
            _self.removeClass("spider-main");
          }
        });

        $("div.spider-main").each(function() {
          if ($(this).find(".spider-main").length > 0) {
            $(this).removeClass("spider-main");
          }
        });

        $(".spider-main")
          .siblings()
          .each(function() {
            $(this).addClass("spider-nonMain");
            // console.log('Area Siblings ... ');
          });

        Timer.stop("mainMark");
        console.log("The main Mark time is: " + Timer.getTime("mainMark"));
      }

      /* 标记帖子区域 */
      async function markPostArea() {
        Timer.start("markPost");
        console.log("Mark post area ... ");

        let mainSelector = $(".spider-main");
        let mainWidth = mainSelector.width(),
          mainHeight = mainSelector.height();
        console.log(mainWidth + " " + mainHeight);

        mainSelector.addClass("spider-content");

        function markContentNode(self) {
          // console.log('Mark Content Node ...');

          self.children().each(function() {
            markContentNode($(this));
            let _self = $(this),
              _width = _self.prop("offsetWidth"),
              _height = _self.prop("offsetHeight"),
              _date = _self.prop("innerHTML").match(DATE_REG);
            if (
              (_width / mainWidth) * 100 > 70 &&
              _height > MIN_HEIGHT &&
              (_date || _self.siblings(".spider-content"))
            ) {
              console.log(
                "SPIDER_CONTENT: " +
                  _width +
                  " " +
                  _height +
                  " " +
                  _self.prop("tagName")
              );
              _self.addClass("spider spider-content");
            } else {
              // if(_width / mainWidth * 100 > 70 && _height > MIN_HEIGHT){
              //     console.log('#################');
              //     console.log('SPIDER-CONTENT: ' + _self.prop('innerText').substring(0, 10));
              //     console.log(_date);
              //     console.log(_self.prop('innerHTML'));
              //     console.log('#################');
              // }
            }
          });
          if (
            (self.prop("offsetHeight") / mainHeight) * 100.0 > 70 &&
            self.children(".spider-content").length > 5
          ) {
            self.addClass("spider-post");
          }
        }

        markContentNode(mainSelector);

        $(".spider-post").each(function() {
          if ($(this).find(".spider-post").length > 0) {
            console.log("Unmark the post ... ");
            $(this).removeClass("spider-post");
          }
        });

        // if (mainSelector.find('.spider-post').length === 0) {
        //     console.log('Main && Post');
        //     if (mainSelector.children('.spider-content').length > 6) {
        //         mainSelector.addClass('spider-post');
        //     }
        //     mainSelector.parent().addClass('spider spider-main');
        //     mainSelector.removeClass('spider-main');
        // }

        Timer.stop("markPost");
        console.log("The post mark time is: " + Timer.getTime("markPost"));
      }

      /* 标记列表节点 */
      async function markListNode() {
        Timer.start("markList");
        console.log("Mark list node ... ");
        // let result = [];

        $(".spider-post")
          .children(".spider-content")
          .each(function() {
            let _self = $(this),
              _leafWidth = _self.prop("offsetWidth"),
              _leafHeight = _self.prop("offsetHeight");

            if (_self.prop("innerText").replace(/\n+|\s+/gi, "").length > 10) {
              _self.addClass("listNode");

              function markLeafComponents(self) {
                self.children().each(function() {
                  let _s = $(this),
                    _width = (_s.width() / _leafWidth) * 100.0,
                    _height = (_s.height() / _leafHeight) * 100.0;

                  if (
                    (_s.width() > 12 && _height > 70) ||
                    (_s.height() > 12 && _width > 70)
                  ) {
                    _s.addClass("spider listNode_components");
                    markLeafComponents(_s);
                  }

                  _width = null;
                  _height = null;
                  _s = null;
                });
              }

              markLeafComponents(_self);
            }

            // 考虑百度贴吧的两段式布局
            // _self.children().each(function () {
            //     let _self = $(this);
            //     if (_self.height() > 2 * rootFontSize && !_self.hasClass('spider')) {
            //         _self.addClass('spider listNode_components');
            //         // console.log('## Spider: ' + $(this).height() + ' ' + $(this).text());
            //     }
            // });

            // let links = [];
            // $(this).find('a').each(function () {
            //     // console.log($(this).text());
            //     if ($(this).prop('childElementCount') === 0 && $(this).text().length > 0 && $(this).attr('href') && $(this).attr('href').length > 20) {
            //         // console.log('Author ... ' + $(this).text() + $(this).attr('href'));
            //         links.push({
            //             url: $(this).attr('href'),
            //             text: $(this).text(),
            //             width: $(this).width(),
            //             height: $(this).height(),
            //             offsetLeft: $(this).prop('offsetLeft'),
            //             offsetTop: $(this).prop('offsetTop')
            //         })
            //     }
            // });
            //
            // result.push({
            //     text: $(this).text().replace(/(\s){2}|('\n')|('\r')/g, ''),
            //     author: $(this).find('a').attr('href'),
            //     links: links
            // });
          });

        Timer.stop("markList");
        console.log("The post mark time is: " + Timer.getTime("markList"));

        // console.log(result);
      }

      function uniq(array) {
        if (array) {
          let temp = [],
            _length = array.length;
          for (let i = 0; i < _length; i++) {
            //如果当前数组的第i项在当前数组中第一次出现的位置是i，才存入数组；否则代表是重复的
            if (array.indexOf(array[i]) === i) {
              temp.push(array[i]);
            }
          }
          return temp;
        } else {
          return [];
        }
      }

      async function postDataExtract() {
        let output = {
          listNode: [],
          listNodeCandidate: [],
          listNodeCandidateFilter: [],
          textNode: [],
          postAreaNode: [],
          mainAreaNode: [],
          spiderNode: []
        };
        $(".spider-content").each(function() {
          let _self = $(this),
            _parent = _self.parent(),
            _innerTextLength = _self.prop("innerText").length,
            _content = _self.prop("innerText").replace(/\n+|\s+/gi, ""),
            _date = uniq(_self.prop("innerHTML").match(DATE_REG)),
            _cursor = _self,
            _dom_level = 0,
            _linkContent = [];

          _self.find("a").each(function() {
            let _this = $(this);
            if (_this.prop("offsetWidth") + _this.prop("offsetHeight") !== 0) {
              let _href = _this.attr("href");
              // console.log(_this.prop('offsetWidth') + ' ' + _this.prop('offsetHeight') + ' ' + _href);
              if (_href) {
                let rules = ["javascript:;", "javascript:void(0)"];
                let flag = false;
                for (let i = 0, length = rules.length; i < length; i++) {
                  if (_href.indexOf(rules[i]) > -1) {
                    flag = true;
                    break;
                  }
                }
                if (!flag && _href !== "#" && _href !== "./") {
                  _linkContent.push(_href);
                }
              }
            }
          });

          while (true) {
            if (_cursor.is("body")) {
              break;
            } else {
              _cursor = _cursor.parent();
              _dom_level++;
              if (_dom_level > 10) {
                break;
              }
            }
          }

          let item = {
            content: _content,
            // html: _self.prop('innerHTML'),
            // authorName: _self.find('.post-authorName').innerText,
            // authorUrl: _self.find('.post-authorText').attr('url'),
            date: _date,
            links: _linkContent,
            item: {
              // width: _self.prop('offsetWidth') / 1000,
              // height: _self.prop('offsetHeight') / 30000,
              widthPercentage: _self.prop("offsetWidth") / $(document).width(),
              heightPercentage:
                _self.prop("offsetHeight") / $(document).height(),

              dom_level: _dom_level / 10,
              textBodyPercentage:
                _innerTextLength / $("body").prop("innerText").length,
              relativeTextPercentage:
                _innerTextLength / _parent.prop("innerText").length,

              childElementCount: _self.prop("childElementCount") / 150,
              siblingsCount: _self.siblings().length / 150,
              linkElementCount: _linkContent.length / 20,
              imageElementCount: _self.find("img").length / 150,
              anchorMarkerCount: _self.find("a").length / 150
            },
            output: []
          };
          if (_self.hasClass("listNode")) {
            output.listNode.push(item);
          } else if (_self.children().length === 0) {
            output.textNode.push(item);
          } else {
            output.spiderNode.push(item);
          }
        });
        return output;
      }

      await markMainArea();
      await markPostArea();
      await markListNode();

      return await postDataExtract();
    });
  } else {
  }

  let net = new brain.NeuralNetwork();
  let _netJSON = config.net;
  await net.fromJSON(_netJSON);

  let listNode = resultCallback.listNode || [],
    postAreaNode = resultCallback.postAreaNode || [],
    mainAreaNode = resultCallback.mainAreaNode || [],
    listNodeCandidate = resultCallback.listNodeCandidate || [],
    listNodeCandidateFilter = resultCallback.listNodeCandidateFilter || [],
    spiderNode = resultCallback.spiderNode || [];
  for (let i = 0, length = listNode.length; i < length; i++) {
    listNode[i].output = net.run(listNode[i].item);
  }

  for (let j = 0, length = spiderNode.length; j < length; j++) {
    let node = spiderNode[j];
    let output = net.run(spiderNode[j].item);
    node.output = output;
    let maxRate = Math.max.apply(null, output);
    let cateIndex = output.indexOf(maxRate);
    node.cate = cateIndex;
    if (
      maxRate < 0.6 ||
      node.content.length < 10 ||
      node.item.linkElementCount === 0 ||
      node.item.imageElementCount === 0
    ) {
      continue;
    }
    if (cateIndex === 0) {
      mainAreaNode.push(node);
    } else if (cateIndex === 1) {
      postAreaNode.push(node);
    } else if (cateIndex === 2) {
      listNodeCandidate.push(node);
    } else {
    }
  }

  listNodeCandidateFilter.push(listNodeCandidate[0]);
  for (let x = 1, length = listNodeCandidate.length; x < length; x++) {
    let prevContent = listNodeCandidate[x - 1].content,
      currentContent = listNodeCandidate[x].content;
    if (!prevContent.includes(currentContent)) {
      listNodeCandidateFilter.push(listNodeCandidate[x]);
    }
  }

  resultCallback.spiderNode = spiderNode.filter(function(item) {
    // console.log('-----------');
    // console.log(item.output);
    // console.log(item.output !== undefined);
    return item.cate === 3;
  });

  getDirPath(pageInfo.domain, pageInfo.title).then(dir => {
    console.log(dir);
    fs.writeFileSync(dir, JSON.stringify(resultCallback, null, 2));
  });
  await Timer.stop("dataExtract");
  await console.log(`DataExtraction:  ${Timer.getTime("dataExtract")}`);

  // await browser.close();
  return resultCallback;
}
