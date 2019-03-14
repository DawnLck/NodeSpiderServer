/**
 * @method getDirPath 获取页面数据的download地址
 * @params {String} domain 页面的域名 {String} title 页面的名称
 * @return dir 文件地址
 * */
module.exports.getDirPath = function(domain, title) {
  let dirPath = "verification/" + domain;
  let stat = fs.existsSync(path.join(__dirname, dirPath));
  if (!stat) {
    fs.mkdir(path.join(__dirname, dirPath), err => {});
  }
  let dir = path.join(
    __dirname,
    dirPath + "/" + title.replace(/[?:\|，。"']/g, "").split(" ")[0] + ".json"
  );
  stat = fs.existsSync(dir);
  console.log(`${stat}: ${dir}`);
  if (stat) {
    dir = path.join(
      __dirname,
      dirPath + "/" + title.replace(/[?:\|，。"']/g, "") + ".json"
    );
  }
  return dir;
};
