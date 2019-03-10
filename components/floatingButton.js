// components/Menu/menu.js
var systemInfo = wx.getSystemInfoSync();
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,//是否已经弹出
    animMain: {},//旋转动画
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //点击弹出或者收起
    showOrHide: function () {
      this.triggerEvent("mainEvent")
      if (this.data.isShow) {
        //缩回动画
        this.takeback();
        this.setData({
          isShow: false
        })
      } else {
        //弹出动画
        this.popp();
        this.setData({
          isShow: true
        })
      }
    },

    //弹出动画
    popp: function () {
      //main按钮顺时针旋转
      var animationMain = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease-out'
      })
      
      animationMain.rotateZ(90).step();
      
      this.setData({
        animMain: animationMain.export(),
      })
    },
    //收回动画
    takeback: function () {
      //main按钮逆时针旋转
      var animationMain = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease-out'
      })
      animationMain.rotateZ(0).step();
      this.setData({
        animMain: animationMain.export(),
      })
    }
  },
  //解决滚动穿透问题
  myCatchTouch: function () {
    return
  }
})
