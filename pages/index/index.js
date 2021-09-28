// index.js
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
    })
  },
  onLoad() {
  }
})
