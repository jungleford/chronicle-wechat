// pages/debug/debug.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    years: [{year: 1927}, {year: 1928}, {year: 1929}, {year: 1930}, {year: 1931}, {year: 1932}, {year: 1933}, {year: 1934}, {year: 1935}, {year: 1936}, {year: 1937}],
    troops: [{name: '军'}, {name: '师'}, {name: '团'}, {name: '营'}, {name: '连'}, {name: '排'}, {name: '班'}],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  changeYear: function (e) {
    console.log(this.data.years[e.detail.value].year);
  },

  changeTroop: function (e) {
    console.log(this.data.troops[e.detail.value].name);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})