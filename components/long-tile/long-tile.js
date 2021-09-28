// components/long-tile/long-tile.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    foreground: {
      type: String, // color
      value: 'white' // default value
    },
    background: {
      type: String, // color,
      value: 'white' // default value
    },
    banner: {
      type: String, // color,
      value: '#ccc' // default value
    },
    imgUrl: String,
    imgMode: {
      type: String,
      value: 'aspectFit' // default value
    },
    title: String,
    link: String
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
  }
})
