module.exports = {
  css: {
    sourceMap: true,
    loaderOptions: {
      sass: {
        data: `
          @import "src/scss/global.module.scss";
          @import "src/scss/color.module.scss";
        `
      }
    }
  }
}