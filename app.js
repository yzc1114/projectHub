App({
  globalData: {
    userInfoWithOpenId: null,
    userInfo: null,
    openid: "",
    isRegistered: false,
    hasNewParticipatingProjects: false,
    hasNewRequest: false,
    hasNewMessages: false
  },
  onLaunch: function() {
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
      success: function(res) {
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
      fail: function(res) {
        wx.hideLoading();
        wx.showModal({
          title: '登录微信失败',
          content: '请检查你的网络连接',
          showCancel: false
        })
      }
    }) //获取完毕

    //根据openid查询用户信息 可能没有注册过 也可能注册过 
    //TODO:若注册过 则修改几个按钮的行为
    var that = this;
    wx.cloud.callFunction({
      name: "getUserInfoWithOpenId",
      complete: res => {
        if (res.result.data.length === 1) {
          that.globalData.userInfoWithOpenId = res.result.data[0];
          that.globalData.isRegistered = true;
          console.log(res.result.data[0]);
          //若用户注册过 则设置一个interval 每隔固定时间 检查自己是否有新消息
          setInterval(() => {
            var that = this;
            const db = wx.cloud.database();
            db.collection("UserInfos").where({
              openid: that.globalData.openid,
            }).field({
              hasNewParticipatingProjects: true,
              hasNewMessages: true,
              hasNewRequest: true,
            }).get({
              success: res => {
                console.log("查询有无hasNewParticipatingProjects和hasNewMessages完毕", res.data[0]);
                that.globalData.hasNewParticipatingProjects = res.data[0].hasNewParticipatingProjects;
                that.globalData.hasNewMessages = res.data[0].hasNewMessages;
                that.globalData.hasNewRequest = res.data[0].hasNewRequest;
              },
              fail: res => {
                console.log("查询失败");
              }
            })
          }, 3000)
        } else {
          that.globalData.isRegistered = false;
          that.globalData.userInfoWithOpenId = null;
          console.log("用户未注册");
        }
        that.globalData.userInfoChecked = true;
        wx.hideLoading();
      }
    });
  }
})