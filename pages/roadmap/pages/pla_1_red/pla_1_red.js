// pages/roadmap/pages/pla_1_red/pla_1_red.js
import {YEARS, TROOPS} from './data';

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    /*=== 常量 ===*/
    ZOOM_BEST: 1.5,
    ZOOM_LIST: [0.25, 0.5, 1, 1.5, 2], // 简易的放大倍率列表，数值从小到大升序排列

    /*=== 变量 ===*/
    // url: 'https://static.mysmth.net/nForum/att/Modern_CHN/609880/4524',
    url: 'https://ks3-cn-beijing.ksyun.com/attachment/5c4dae443d305e6ab42fe90121327225',
    filePath: null,
    showFilePath: false, // 打开/关闭本地图片路径对话框
    mapData: {YEARS, TROOPS}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // TODO: 如何用<image>加载下载到本地的图片？此处savedFilePath无法显示图片
    // wx.downloadFile({
    //   url: this.data.url,
    //   type: 'image',
    //   success: res => {
    //     const tempFilePath = res.tempFilePath;
    //     console.log(`临时文件：${tempFilePath}`);
    //     // this.setData({
    //     //   filePath: tempFilePath,
    //     //   showFilePath: true
    //     // });
    //     const filePath = `${wx.env.USER_DATA_PATH}/red_army.svg`;
    //     const fs = wx.getFileSystemManager();
    //     fs.saveFile({
    //       tempFilePath,
    //       filePath,
    //       success: res1 => {
    //         console.log(`用户文件：${res1.savedFilePath}`);
    //         this.setData({
    //           filePath: res1.savedFilePath,
    //           showFilePath: true
    //         });
    //       },
    //     });
    //   }
    // });
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