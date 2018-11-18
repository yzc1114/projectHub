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
    db.collection("Projects").where({
      leaderOpenid: app.globalData.openid,
    }).skip(20 * that.data.pageNumber).get({
      success: (res) => {
        console.log("已发布的项目加载完毕", res);
        if (res.data.length === 0) { //若后面没有数据
          return;
        } else { //若有数据 
          res.data.forEach(item => {
            item.formatTime = util.formatTime(new Date(item.createTimeStamp));
          });
          that.setData({
            publishedProjects: that.data.publishedProjects.concat(res.data),
            pageNumber: that.data.pageNumber + 1,
          })
        }
      }
    })
  }
})