// pages/personalInfo/requests/requests.js
var app = getApp();
Page({
  data: {
    hasNewRequest:false
  },
  onLoad: function (options) {

  },
  onShow: function () {
    this.setData({
      hasNewRequest: app.globalData.hasNewRequest
    })
  },
})