// index.js
const app = getApp();

Page({
  data: {
  },

  // 事件处理函数
  goToPage: function (e) {
    let pageName = e.target.id;
    const path = pageName === 'about' ?
            '../' + pageName + '/' + pageName :
            '../roadmap/pages/' + pageName + '/' + pageName;
    wx.navigateTo({
      url: path
    });
  },

  goToDebug: function (e) {
    if (app.globalData.debug) {
      wx.navigateTo({
        url: '../debug/debug'
      });
    }
  },

  onLoad() {
  }
})
