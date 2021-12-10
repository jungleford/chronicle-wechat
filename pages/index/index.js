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

  goToMyApps: function (e) {
    wx.navigateTo({
      url: app.globalData.debug ? '../debug/debug' : '../my-apps/my-apps'
    });
  },

  goToReleaseNotes: function (e) {
    wx.navigateTo({
      url: '../release-notes/release-notes'
    });
  },

  onLoad() {
  }
})
