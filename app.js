App({
  globalData: {
    userInfoWithOpenId: null,
    userInfo:null,
    appid:"wx81a4cc6878f3e889",
    secret:"79ec3223a69b91a76f7a3c23aa6af4ff",
    openid:"",
    isRegistered:false
  },
  onLaunch: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    //云端初始化
    wx.cloud.init();
    //登录微信
    //获取openid
    var that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          wx.cloud.callFunction({
            name: "getOpenid",
            complete: res => {
              console.log('callFunction test result: ', res);
              var OPENID = res.result.OPENID;
              console.log(OPENID);
              that.globalData.openid = OPENID;
            }
          })
        }
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showModal({
          title: '登录微信失败',
          content: '请检查你的网络连接',
          showCancel: false
        })
      }
    })//获取完毕

    //根据openid查询用户信息 可能没有注册过 也可能注册过 
    //TODO:若注册过 则修改几个按钮的行为
    var that = this;
    wx.cloud.callFunction({
      name: "getUserInfoWithOpenId",
      complete: res => {
        console.assert(res.result.data.length === 1 || res.result.data.length === 0, "返回数据正常", "有多条数据有相同的openid???");
        if (res.result.data.length === 1) {
          that.globalData.userInfoWithOpenId = res.result.data[0];
          that.globalData.isRegistered = true;
          console.log(res.result.data[0]);
        } else {
          that.globalData.isRegistered = false;
          that.globalData.userInfoWithOpenId = null;
          console.log("用户未注册");
        }
        that.globalData.userInfoChecked = true;
        wx.hideLoading();
      }
    })
  }
})

