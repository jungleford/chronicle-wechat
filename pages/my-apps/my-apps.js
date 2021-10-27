// pages/my-apps/my-apps.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myApps: [
      {
        id: 'wx1b639981f0681076',
        icon: 'logo-math-folding.png',
        name: '对折问题',
        description: '对一道奥数题的深度思考',
      },
    ],
  },

  openApp: function (e) {
    const { appId } = e.currentTarget.dataset;
    wx.navigateToMiniProgram({
      appId,
      success: res => {
        console.log(`小程序 ${appId} 打开成功！`, res);
      },
      fail: err => {
        console.error(`小程序 ${appId} 打开失败！`, err)
      },
    });
  },

});