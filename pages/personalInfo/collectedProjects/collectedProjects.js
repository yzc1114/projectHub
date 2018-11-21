// pages/personalInfo/collectedProjects/collectedProjects.js
var util = require("../../../utils.js");
var app = getApp();
Page({
  data: {
    collectedProjectIds:[],
    collectedProjectInfos:[],
    pageNumber:1
  },
  onLoad: function (options) {
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    db.collection("UserInfos").where({
      openid: app.globalData.openid
    }).field({
      collectedProjects: true
    }).get({
      complete: (res) => {
        console.log("查询到参与的项目", res.data);
        console.assert(res.data.length === 1 ? "正常" : "不正常");
        var collectedProjectIds = res.data[0].collectedProjects;
        that.setData({
          collectedProjectIds: collectedProjectIds
        });
        collectedProjectIds.forEach(id => {
          const db = wx.cloud.database();
          db.collection("Projects").doc(id).get({
            complete: res => {
              if(!res){
                //防止project已经被删除了
                return;
              }
              res.data.formatTime = util.formatTime(new Date(res.data.createTimeStamp));
              console.log(res);
              that.setData({
                collectedProjectInfos: that.data.collectedProjectInfos.concat(res.data)
              })
            }
          })
        })
      }
    })

  },
  onReachBottom:function(){
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    db.collection("UserInfos").where({
      openid: app.globalData.openid
    }).skip(20 * that.data.pageNumber).field({
      collectedProjects: true
    }).get({
      success: (res) => {
        console.log("查询到参与的项目", res.data);
        console.assert(res.data.length === 1 ? "正常" : "不正常");
        if (res.data[0].length === 0) {
          //没有多余的了
          return;
        }
        var collectedProjectIds = res.data[0].collectedProjects;
        that.setData({
          collectedProjectIds: that.data.collectedProjectIds.concat(collectedProjectIds),
        });
        collectedProjectIds.forEach(id => {
          const db = wx.cloud.database();
          db.collection("Projects").doc(id).get({
            complete: res => {
              if(!res){
                //防止project已经被删除了
                return;
              }
              console.log(res);
              res.data.formatTime = util.formatTime(new Date(res.data.createTimeStamp));
              that.setData({
                collectedProjectInfos: that.data.collectedProjectInfos.concat(res.data)
              })
            }
          })
        })
      }
    })
  }
})