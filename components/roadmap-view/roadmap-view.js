// components/roadmap-view/roadmap-view.js
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    url: String, // 路线图的远程cdn地址
    filePath: String, // TODO: 路线图的本地文件路径，暂未实现
    showFilePath: { // 打开/关闭本地图片路径对话框
      type: Boolean,
      value: false
    },
    mapData: Object, // 路线图的元数据：年份，坐标定位，说明，图例等
    zoomList: { // 缩放倍率列表，数值从小到大升序排列
       type: Array,
       value: [0.25, 0.5, 1, 1.5, 2] // 缺省值为五档倍率
    },
    zoomBest: { // 最佳缩放倍率
       type: Number,
       value: 1 // 缺省值为原始大小
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    loading: true,
    // scrollView: null, // ScrollViewContext

    width: 0, // 原始图片宽度：7340
    height: 0, // 原始图片高度：61649
    zoom: 1, // 初始放大倍率为1，即原始图片大小
    zoomToDisplay: 1, // 在缩放面板中显示的数值，最多带一位小数

    distance: 0, // 计算双指间距离，用于计算动态缩放
    distanceDiff: 0, // 双指间距离的动态变化值

    x: 0, // 初始左上角的横坐标，倍率恒定为1
    y: 0, // 初始左上角的纵坐标，倍率恒定为1
    scrollX: 0, // 当前屏幕左上角的横坐标
    scrollY: 0, // 当前屏幕左上角的纵坐标

    showZoom: false, // 打开/收起缩放面板
    showHelp: false, // 打开/收起帮助面板
    showIntro: false, // 打开/关闭说明对话框
    showLegend: false, // 打开/关闭图例对话框
    showReference: false, // 打开/关闭参考资料对话框
    dialogButtons: [{text: '确定'}],

    YEARS: {},
    TROOPS: {},

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

  /**
   * 组件的方法列表
   */
  methods: {
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
      const scrollX = this.data.debugX;
      const scrollY = this.data.debugY;
      this.setData({
        x: scrollX / this.data.zoom,
        y: scrollY / this.data.zoom,
        scrollX, scrollY
      });
      // this.data.scrollView.fields({node: true, size: true}).exec(res => {
      //   console.log(res[0]);
      //   const sv = res[0].node;
      //   sv.scrollTo({left: this.data.debugX, top: this.data.debugY});
      // });
    },

    onSvgLoaded: function (e) {
      console.log(`图片加载完毕！原始宽度：${e.detail.width}，原始高度：${e.detail.height}`);
      this.setData({
        loading: false,
        showIntro: Array.isArray(this.data.mapData.INTRO) && this.data.mapData.INTRO.length > 0,
        width: e.detail.width, // original image width
        height: e.detail.height, // original image height
      });
    },

    /* 手指缩放图片: https://segmentfault.com/a/1190000013687274 */
    touchStart: function (e) {
      // 单手指缩放开始，也不做任何处理
      if (e.touches.length === 1) return;

      console.log('双指触发开始');
      const xMove = e.touches[1].clientX - e.touches[0].clientX;
      const yMove = e.touches[1].clientY - e.touches[0].clientY;
      const distance = Math.sqrt(xMove * xMove + yMove * yMove);
      this.setData({ distance });
    },

    touchMove: function (e) {
      // 单手指缩放我们不做任何操作
      if (e.touches.length === 1) return;

      console.log('双指缩放...');
      const xMove = e.touches[1].clientX - e.touches[0].clientX;
      const yMove = e.touches[1].clientY - e.touches[0].clientY;
      const distance = Math.sqrt(xMove * xMove + yMove * yMove);
      const distanceDiff = distance - this.data.distance;
      let newZoom = this.data.zoom + 0.002 * distanceDiff;

      const zoomMax = this.data.zoomList[this.data.zoomList.length - 1];
      const zoomMin = this.data.zoomList[0];
      if (newZoom > zoomMax) {
        newZoom = zoomMax;
      }
      if (newZoom < zoomMin) {
        newZoom = zoomMin;
      }

      this.setData({
        distance,
        x: this.data.scrollX / this.data.zoom,
        y: this.data.scrollY / this.data.zoom,
        zoom: newZoom,
        zoomToDisplay: Math.floor(newZoom * 1000) / 1000, // 缩放面板上的显示数值保留至多一位小数
        distanceDiff
      });
    },

    /* 打开/关闭缩放面板 */
    toggleZoom: function (e) {
      this.setData({showZoom: !this.data.showZoom});
    },

    zoomIn: function (e) {
      const zoom = this.data.zoom;
      const zl = this.data.zoomList;
      const index = zl.findIndex((z, i) => i > 0 ? z >= zoom && zl[i - 1] < zoom : z >= zoom);
      if (index < 0) {
        this.setData({zoom: 1, zoomToDisplay: 1});
      } else if (index < zl.length - 1) {
        const newZoom = zl[index] === zoom ? zl[index + 1] : zl[index];
        this.setData({
          zoom: newZoom,
          zoomToDisplay: newZoom
        });
      } else {
        const newZoom = zl[zl.length - 1];
        this.setData({
          zoom: newZoom,
          zoomToDisplay: newZoom
        });
      }
    },

    zoomOut: function (e) {
      const zoom = this.data.zoom;
      const zl = this.data.zoomList;
      const index = zl.findIndex((z, i) => i < zl.length - 1 ? z <= zoom && zl[i + 1] > zoom : z <= zoom);
      if (index < 0) {
        this.setData({zoom: 1, zoomToDisplay: 1});
      } else if (index > 0) {
        const newZoom = zl[index] === zoom ? zl[index - 1] : zl[index];
        this.setData({
          zoom: newZoom,
          zoomToDisplay: newZoom
        });
      } else {
        const newZoom = zl[0];
        this.setData({
          zoom: newZoom,
          zoomToDisplay: newZoom
        });
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
      const scrollX = e.detail.scrollLeft;
      const scrollY = e.detail.scrollTop;
      console.log(`X': ${scrollX}, Y': ${scrollY}， ZOOM: ${this.data.zoom}`);
      this.setData({
        scrollX, scrollY,
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
      const troop = this.data.TROOPS[e.detail.value[0]];
      const years = this.data.YEARS.filter((yr, index) => {
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

    toggleFilePath: function (e) {
      this.setData({showFilePath: !this.data.showFilePath});
    },
  },

  /**
   * 组件的生命周期函数
   */
  lifetimes: {
    /**
     * 在组件实例进入页面节点树时执行
     */
    attached: function() {
      const YEARS = this.data.mapData.YEARS;
      const TROOPS = this.data.mapData.TROOPS;
      this.setData({
        YEARS,
        TROOPS,
        year: YEARS[0],
        years: YEARS,
        troop: TROOPS[0],
        troops: TROOPS,
        // scrollView: this.createSelectorQuery().select('#scrollview')
      });
    },

    /**
     * 在组件实例被从页面节点树移除时执行
     */
    detached: function() {
    },
  }
})
