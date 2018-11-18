// pages/checkPerson/checkPerson.js
Page({
  data: {
    userOpenid:"",
    userInfo:{},
  },
  onLoad: function (options) {
    this.setData({
      userOpenid:options.openid,
    })
    console.log(options);
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    db.collection("UserInfos").where({
      openid:options.openid,
    }).get().then(res=>{
      console.log(res);
      that.setData({
        userInfo:res.data[0]
      })
    })
  },
})