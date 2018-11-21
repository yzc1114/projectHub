Page({
  data: {
    openid:"",
    name:"",
    content:"",
    avatarUrl:"",
    messageInput:"",
    messageInputLength:0,
},
  onLoad: function (options) {
    console.log(options);
    this.setData({
      openid:options.openid,
      content:options.content,
      avatarUrl:options.avatarUrl,
      name:options.name
    });
  },
  sendMessage:function(e){
    var that = this;
    if (this.data.messageInput === "") {
      this.setData({
        showTopTips: true,
      });
      setTimeout(() => {
        that.setData({
          showTopTips: false,
        })
      }, 2000);
      return;
    } else {
      //留言不为空 发送给这个人
      wx.showLoading({
        title: '发送中',
        mask: true
      })
      wx.cloud.callFunction({
        name: "updateUserLeftMessages",
        data: {
          openid: that.data.openid,
          messageContent: that.data.messageInput,
          sendTimeStamp: Date.now(),
        },
        complete: (res) => {
          console.log("发送留言完毕", res);
          wx.hideLoading();
          wx.showToast({
            title: '发送成功',
          });
        }
      })
    }
  },
  clickAvatar:function(e){
    var that = this;
    wx.navigateTo({
      url: '../../../checkPerson/checkPerson?openid=' + that.data.openid
    })
  },
  onMessageInput:function(e){
    this.setData({
      messageInput:e.detail.value,
      messageInputLength:e.detail.value.length,
    });
  },
})