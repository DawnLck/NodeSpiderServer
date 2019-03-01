# VSCode && Vue 开发QA

## 使用 vetur 插件后格式化 vue 单引号变双引号

VS Code 默认不认识 .vue 文件，需要安装 vetur, 但是装完 vetur, 把 .vue 格式化的时候，会把 string 的引用从单引号变成双引号，导致 airbnb 报错。原因是 vetur 使用 prettier 来格式化, vetur doc 有说明。

解决办法：在项目根目录新建 `.prettierrc` 文件，在里面加上
```json
{
"singleQuote":true 
}
```

## vetur 格式化文档时候默认把 trailing comma 删除

trailing comma, 特别是多行的 object 或者 array，还是有用处的。修改 .prettierrc, 添加 "trailingComma": all。[官方介绍](https://prettier.io/docs/en/options.html),搜索 Trailing Commas。
```json
{
"singleQuote": true,
"trailingComma": all,
}
```

## vue-cli3 设置sass/scss全局变量
### 1. 准备存放全局样式变量的文件
`color.module.scss`，内容如下：
```scss
$theme-color: #3385ff;
```
### 2. 配置loader
打开根目录下 `vue.config.js`
写入
```js
module.exports = {
  // ...
  css: {
    loaderOptions: {
      sass: {
        data: `
          @import "@/assets/styles/_variable.scss";
        `
      }
    }
  }
}
```
### 3. 使用全局变量

现在就可以在每个vue文件中直接使用全局变量了

```html
<template></template>
<script></script>
<style lang="scss" scoped>
button{
color: $theme-color;
}
</style>
```