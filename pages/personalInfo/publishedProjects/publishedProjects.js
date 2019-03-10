// pages/personalInfo/publishedProjects/publishedProjects.js
var util = require("../../../utils.js");
var app = getApp();
Page({
  data: {
    publishedProjects: [],
    pageNumber: 1
  },
  onLoad: function (options) {
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    db.collection("Projects").where({
      leaderOpenid: app.globalData.openid,
    }).field({
      createTimeStamp: true,
      teamMemberNumber: true,
      projectName: true,
      projectDescription: true,
      workersOpenid: true,
      projectProgress:true,
      projectType:true,
    }).get({
      success: (res) => {
        console.log("已发布的项目加载完毕", res);
        res.data.forEach(item=>{
          item.formatTime = util.formatTime(new Date(item.createTimeStamp));
        })
        that.setData({
          publishedProjects: res.data,
        })
      }
    })
  },
  onReachBottom: function () {
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    wx.showNavigationBarLoading();
    db.collection("Projects").where({
      leaderOpenid: app.globalData.openid,
    }).skip(20 * that.data.pageNumber).field({
      createTimeStamp: true,
      teamMemberNumber: true,
      projectName: true,
      projectDescription: true,
      workersOpenid: true,
      projectProgress: true,
      projectType: true,
    }).get({
      success: (res) => {
        console.log("跳过",20*that.data.pageNumber);
        console.log("已发布的项目加载完毕", res);
        if (res.data.length === 0) { //若后面没有数据
          wx.hideNavigationBarLoading();
          return;
        } else { //若有数据 
          res.data.forEach(item => {
            item.formatTime = util.formatTime(new Date(item.createTimeStamp));
          });
          that.setData({
            publishedProjects: that.data.publishedProjects.concat(res.data),
            pageNumber: that.data.pageNumber + 1,
          })
          wx.hideNavigationBarLoading();
          return;
        }
      }
    })
  }
})