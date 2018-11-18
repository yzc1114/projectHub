// pages/personalInfo/personalInfo.js
const app = getApp()


Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showPage: false,
    showGetUserInfoButton: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    //查看是否已经授权过了 若授权过了 就把userinfo加载进来
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              app.globalData.userInfo = res.userInfo
              console.log("myAvatarUrl:",res.userInfo.avatarUrl);
              that.setData({
                userInfo: res.userInfo,
                hasUserInfo: true,
              })
            }
          })
        } else {
          //还没授权
          that.setData({
            showGetUserInfoButton: true
          })
        }
      }
    })
  },
  editPersonalInfo: function(e) {
    wx.navigateTo({
      url: "./changePersonalInfo/changePersonalInfo",
    })
  },

  getUserInfo: function(e) {
    var that = this;
    wx.getUserInfo({
      complete: function(res) {
        console.log("在个人信息页面", res);
        if (res.errMsg === "getUserInfo:fail auth deny") {
          that.setData({
            userInfo: null,
            hasUserInfo: false,
          })
          wx.showModal({
            title: '提示',
            content: '请您打开授权，否则无法正常使用该小程序',
            showCancel: false
          });
          return;
        }
        app.globalData.userInfo = res.userInfo;
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          showGetUserInfoButton: false
        })
      }

    })
  },
  onShow: function() {
    //检测这个openid是否已经注册过 如果没有注册 则导航到注册界面
    if (app.globalData.isRegistered) {
      this.setData({
        showPage: true,
      })
    } else {
      wx.navigateTo({
        url: "../startPage",
      })
    }
    //检测是否授权 若为授权 则显示授权按钮
    if (app.globalData.userInfo != null) {
      this.setData({
        showGetUserInfoButton: false,
      })
    } else {
      this.setData({
        showGetUserInfoButton: true,
      })
    }
  },
  publishNewProjectButton:function(e){
    wx.navigateTo({
      url: '../editProject/editProject',
    })
  }
})