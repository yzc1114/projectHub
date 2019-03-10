// pages/checkPerson/checkPerson.js
var app = getApp();
Page({
  data: {
    userOpenid: "",
    userInfo: {},
    messageInputLength: 0,
    messageInput: "",
    showTopTips: false,
    tipMessage: "留言不能为空",
    isMyself:true,
  },
  onLoad: function(options) {
    this.setData({
      userOpenid: options.openid,
    })
    var that = this;
    if(that.data.userOpenid === app.globalData.openid){
      //是自己
      that.setData({
        isMyself:false,
      })
    }else{
      that.setData({
        isMyself:false,
      })
    }

    console.log(options);
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    db.collection("UserInfos").where({
      openid: options.openid,
    }).field({
      nickName:true,
      sex:true,
      telNumber:true,
      major:true,
      grade:true,
      leadingProjects:true,
      participatingProjects:true,
      goodAt:true,
      avatarUrl:true,
      studentId:true,
    }).get().then(res => {
      console.log(res);
      that.setData({
        userInfo: res.data[0]
      })
    })
  },
  onMessageInput: function(e) {
    console.log(e);
    this.setData({
      messageInput: e.detail.value,
      messageInputLength: e.detail.value.length,
    })
  },
  sendMessage: function(e) {
    wx.showLoading({
      title: '发送中',
      mask: true,
    })
    if (!app.globalData.isRegistered) {
      //如果没有注册的话 就没法留言
      wx.hideLoading();
      wx.showModal({
        title: '注意',
        content: '请您先注册，再给Ta留言',
        success:res=>{
          
          if(res.confirm){
            wx.navigateTo({
              url: '../startPage',
            });
            return;
          }else{
            return;
          }
        }
      })
    } else {
      var that = this;
      if (this.data.messageInput === "") {
        wx.hideLoading();
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
        wx.cloud.callFunction({
          name: "updateUserLeftMessages",
          data: {
            openid: that.data.userOpenid,
            messageContent: that.data.messageInput,
            sendTimeStamp: Date.now(),
          },
          complete: (res) => {
            console.log("发送留言完毕", res);
            wx.hideLoading();
            wx.showToast({
              title: '发送完毕',
            })
          }
        })
      }
    }
  }
})