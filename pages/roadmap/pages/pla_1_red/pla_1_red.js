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
    ZOOM_LIST: [0.25, 0.5, 1, 1.5, 2], // 简易的放大倍率列表

    /*=== 变量 ===*/
    loading: true,
    // url: 'https://static.mysmth.net/nForum/att/Modern_CHN/609880/4524'
    url: 'https://ks3-cn-beijing.ksyun.com/attachment/5c4dae443d305e6ab42fe90121327225',
    // filePath: null,

    width: 0, // 原始图片宽度：7340
    height: 0, // 原始图片高度：61649
    zoom: 1, // 初始放大倍率为1，即原始图片大小
  
    x: 0, // 当前屏幕左上角的横坐标
    y: 0, // 当前屏幕左上角的纵坐标

    showZoom: false, // 打开/收起缩放面板
    showHelp: false, // 打开/收起帮助面板
    showIntro: false, // 打开/关闭说明对话框
    showLegend: false, // 打开/关闭图例对话框
    showReference: false, // 打开/关闭参考资料对话框
    dialogButtons: [{text: '确定'}],

    /*
     * 年份坐标快捷书签，默认放大倍率为1
     * 位置为年份标签出现在可见屏幕右侧时，左上角的坐标
     */
    year: null,
    yearIndex: [0],
    years: [], // picker上的列表可能会有联动

    /*
     * 部队坐标快捷书签，默认放大倍率为1
     * 由于同一支部队在不同时间可能有不同的横坐标，故位置记录为一数组
     */
    troop: null,
    troopIndex: [0],
    troops: [], // picker上的列表可能会有联动

    showPicker: false, // 打开/收起picker面板

    /*
     * favorites数组：用户添加的坐标书签。
     * 其中元素的格式为：
     * {
     *   zoom: 放大倍数,
     *   x: 左上角横坐标,
     *   y: 左上角纵坐标
     * }
     */
    favorites: [],

    showGoto: false,

    /*=== 测试用 ===*/
    debug: app.globalData.debug,
    debugX: 0,
    debugY: 0,
    showDebug: false, // 打开/收起调试面板
  },

  /* 打开/关闭调试面板 */
  toggleDebug: function (e) {
    this.setData({showDebug: !this.data.showDebug});
  },

  /* setX()和setY()为测试用 */
  setX: function (e) {
    let x = e.detail.value;
    const maxX = this.data.width * this.data.zoom - app.globalData.screenWidth;
    if (isNaN(x) || x < 0) {
      x = 0;
    } else if (x > maxX) {
      x = maxX;
    }
    this.setData({debugX: x});
  },

  setY: function (e) {
    let y = e.detail.value;
    const maxY = this.data.height * this.data.zoom - app.globalData.screenHeight;
    if (isNaN(y) || y < 0) {
      y = 0;
    } else if (y > maxY) {
      y = maxY;
    }
    this.setData({debugY: y});
  },

  /* goto()为测试用 */
  goto: function () {
    this.setData({x: this.data.debugX / this.data.zoom, y: this.data.debugY / this.data.zoom});
  },

  onSvgLoaded: function (e) {
    console.log(`图片加载完毕！原始宽度：${e.detail.width}，原始高度：${e.detail.height}`);
    this.setData({
      loading: false,
      showIntro: true,
      width: e.detail.width, // original image width
      height: e.detail.height, // original image height
    });
  },

  /* 手指缩放图片: https://segmentfault.com/a/1190000013687274 */
  touchStart: function (e) {},

  touchMove: function (e) {},

  /* 打开/关闭缩放面板 */
  toggleZoom: function (e) {
    this.setData({showZoom: !this.data.showZoom});
  },

  zoomIn: function (e) {
    const index = this.data.ZOOM_LIST.findIndex(z => z === this.data.zoom);
    if (index < 0) {
      this.setData({zoom: 1});
    } else if (index < this.data.ZOOM_LIST.length - 1) {
      this.setData({zoom: this.data.ZOOM_LIST[index + 1]});
    }
  },

  zoomOut: function (e) {
    const index = this.data.ZOOM_LIST.findIndex(z => z === this.data.zoom);
    if (index < 0) {
      this.setData({zoom: 1});
    } else if (index > 0) {
      this.setData({zoom: this.data.ZOOM_LIST[index - 1]});
    }
  },

  /* 打开/关闭帮助面板 */
  toggleHelp: function (e) {
    this.setData({showHelp: !this.data.showHelp});
  },

  toggleIntro: function (e) {
    this.setData({showIntro: !this.data.showIntro});
  },

  toggleLegend: function (e) {
    this.setData({showLegend: !this.data.showLegend});
  },

  toggleReference: function (e) {
    this.setData({showReference: !this.data.showReference});
  },

  onScroll: function (e) {
    console.log(`X: ${e.detail.scrollLeft}, Y: ${e.detail.scrollTop}， ZOOM: ${this.data.zoom}`);
    this.setData({
      showGoto: e.detail.scrollTop > app.globalData.screenHeight * 2, // 向下滚动大约两屏左右即显示“去顶部”按钮
    });
  },

  /* 打开/关闭Picker面板 */
  togglePicker: function (e) {
    this.setData({showPicker: !this.data.showPicker});
  },

  /* 如果定位靠右侧，则需要进行横坐标定位的补偿 */
  adjustX: function (x) {
    return x + app.globalData.screenWidth * (1 - 1 / this.data.zoom);
  },

  relocate: async function ({year, yearIndex = [0], years, troop, troopIndex = [0], troops}) {
    let payload = {year, troop};
    if (years && years.length > 0) {
      payload = {...payload, years};
    }
    if (troops && troops.length > 0) {
      payload = {...payload, troops};
    }
    if (troop.id === 'placeholder') { // 不选部队，滚动到年份坐标处
      await this.setData({
        ...payload,
        x: this.adjustX(year.position.x), // 年份坐标在右侧，故需要进行横坐标补偿
        y: year.position.y,
      });
      // picker-view的value需要在set列表之后才能成功设置
      // 参考：https://developers.weixin.qq.com/community/develop/doc/00024047f302b06d026761e2256800
      this.setData({yearIndex, troopIndex});
    } else if (year.year) { // 已选部队，且已选年份，进行区间判断
      const positions = troop.positions;
      let nextYear = years.find(yr => yr.year === year.year + 1);
      if (!nextYear) {
        nextYear = years[years.length - 1];
      }
      const positionByForce =  positions.find(area => year.year === area.forceTo); // 选择的年份优先使用forceTo坐标
      const position = positionByForce || positions.find(area => year.position.y <= area.y1 && nextYear.position.y > area.y1);
      if (position) {
        await this.setData({
          ...payload,
          x: position.x1,
          y: position.y1,
        });
        this.setData({yearIndex, troopIndex});
      } else {
        await this.setData({
          ...payload,
          x: positions[0].x1,
          y: year.position.y,
        });
        this.setData({yearIndex, troopIndex});
      }
    } else { // 已选部队，但不选年份，滚动到该部队的顶部
      const area = troop.positions[0];
      await this.setData({
        ...payload,
        x: area.x1,
        y: area.y1,
      });
      this.setData({yearIndex, troopIndex});
    }
  },

  changeYear: function (e) {
    this.relocate({
      year: this.data.years[e.detail.value[0]],
      yearIndex: e.detail.value,
      years: this.data.years,
      troop: this.data.troop,
      troopIndex: this.data.troopIndex,
    });
  },

  changeTroop: function (e) {
    const troop = TROOPS[e.detail.value[0]];
    const years = YEARS.filter((yr, index) => {
      if (troop.from && troop.to && troop.from > troop.to) {
        return true;
      }

      // 有谱系标识的部队，可以滚动到顶部标识处
      if (troop.family && index === 0) {
        return true;
      }

      let result = true;
      if (troop.from) {
        result = result && yr.year >= troop.from;
      }
      if (troop.to) {
        result = result && yr.year <= troop.to;
      }
      return result;
    });
    let year;
    let yearIndex;
    if (this.data.year.year && this.data.year.year >= years[0].year && this.data.year.year <= years[years.length - 1].year) {
      year = this.data.year;
      yearIndex = [years.indexOf(year)];
    } else {
      year = years[0];
      yearIndex = [0];
    };
    this.relocate({year, yearIndex, years, troop, troopIndex: e.detail.value});
  },

  goTop: function (e) {
    this.setData({
      y: 0,
      showGoto: false,
    });
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
    //     // this.setData({filePath: tempFilePath});
    //     const filePath = `${wx.env.USER_DATA_PATH}/red_army.svg`;
    //     const fs = wx.getFileSystemManager();
    //     fs.saveFile({
    //       tempFilePath,
    //       filePath,
    //       success: res1 => {
    //         console.log(`用户文件：${res1.savedFilePath}`);
    //         this.setData({filePath: res1.savedFilePath});
    //       },
    //     });
    //   }
    // });

    this.setData({
      year: YEARS[0],
      years: YEARS,
      troop: TROOPS[0],
      troops: TROOPS,
    });
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