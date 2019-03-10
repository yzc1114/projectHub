// pages/personalInfo/projects/projects.js
var app = getApp();
Page({
  data: {
    hasNewParticipatingProjects:false
  },
  onLoad: function (options) {

  },
  onShow: function () {
    this.setData({
      hasNewParticipatingProjects:app.globalData.hasNewParticipatingProjects
    })
  },
  publishNewProjectButton: function (e) {
    wx.navigateTo({
      url: '../../editProject/editProject',
    })
  }
})