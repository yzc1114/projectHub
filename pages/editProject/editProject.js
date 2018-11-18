// pages/editProject/editProject.js
var utils = require("../../utils.js");
var app = getApp();

Page({

  data: {
    projectNameInput: "",
    teamMemberNumberInput: 0,
    projectDescriptionInput: "",
    projectDescriptionInputLength: 0,
    teamMemberDescriptionInput: "",
    teamMemberDescriptionInputLength: 0
  },

  onLoad: function(options) {
  
  },
  
  //提交项目按钮
  finsihButton:function(e){
    wx.showLoading({
      title: '上传中',
    })
    var that = this;
    const db = wx.cloud.database();
    const _ = db.command;
    //获取
    //向项目数据库中添加条目
    db.collection("Projects").add({
      data : {
        leaderOpenid:app.globalData.openid,
        workersOpenid:[],
        projectDescription:that.data.projectDescriptionInput,
        projectName:that.data.projectNameInput,
        teamMemberDescription:that.data.teamMemberDescriptionInput,
        teamMemberNumber:that.data.teamMemberNumberInput,
        createTimeStamp:Date.now(),
        watchedTimes:0
      },
      success:function(res){
        wx.hideLoading();
        wx.cloud.callFunction({
          name:"updateUserLeadingProjects",
          data:{
            projectId:res._id
          },
          complete:(res2)=>{console.log("updateUserLeadingProjects完毕",res2)}
        })
        console.log("添加项目成功",res);
        wx.navigateBack({});
      },
      fail:function(res){
        wx.hideLoading();
        wx.showToast({
          title: '添加项目失败',
        })
        console.log("添加项目失败",res);
      }
    })
  },

  onProjectNameInputTyping: function(res) {
    this.setData({
      projectNameInput: res.detail.value,
    })
  },

  onteamMemberNumberInputTyping: function(res) {
    this.setData({
      teamMemberNumberInput: res.detail.value,
    })
  },

  onProjectDescriptionInputTyping: function(res) {
    this.setData({
      projectDescriptionInput: res.detail.value,
      projectDescriptionInputLength: res.detail.value.length
    })
  },

  onteamMemberDescriptionInputTyping: function(res) {
    this.setData({
      teamMemberDescriptionInput: res.detail.value,
      teamMemberDescriptionInputLength: res.detail.value.length
    })
  }
})