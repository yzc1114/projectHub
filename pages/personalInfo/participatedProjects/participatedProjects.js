// pages/personalInfo/collectedProjects/collectedProjects.js
var util = require("../../../utils.js");
var app = getApp();
Page({
  data: {
    participatingProjectIds: [],
    participatingProjectInfos:[],
    pageNumber: 1
  },
  onLoad: function (options) {
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    db.collection("UserInfos").where({
      openid: app.globalData.openid
    }).field({
      participatingProjects:true
    }).get({
      success: (res) => {
        console.log("查询到参与的项目", res.data);
        console.assert(res.data.length === 1?"正常":"不正常");
        var participatingProjectIds = res.data[0].participatingProjects;
        that.setData({
          participatingProjectIds: participatingProjectIds
        });
        participatingProjectIds.forEach(id=>{
          const db = wx.cloud.database();
          db.collection("Projects").doc(id).get({
            success:res=>{
              res.data.formatTime = util.formatTime(new Date(res.data.createTimeStamp));
              console.log(res);
              that.setData({
                participatingProjectInfos:that.data.participatingProjectInfos.concat(res.data)
              })
            }
          })
        })
      }
    })
    
  },
  onReachBottom: function () {
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    db.collection("UserInfos").where({
      openid: app.globalData.openid
    }).skip(20 * that.data.pageNumber).field({
      participatingProjects: true
    }).get({
      success: (res) => {
        console.log("查询到参与的项目", res.data);
        console.assert(res.data.length === 1 ? "正常" : "不正常");
        if(res.data[0].length === 0){
          //没有多余的了
          return;
        }
        var participatingProjectIds = res.data[0].participatingProjects;
        that.setData({
          participatingProjectIds: that.data.participatingProjectIds.concat(participatingProjectIds)
        });
        participatingProjectIds.forEach(id => {
          const db = wx.cloud.database();
          db.collection("Projects").doc(id).get({
            success: res => {
              console.log(res);
              res.data.formatTime = util.formatTime(new Date(res.data.createTimeStamp));
              that.setData({
                participatingProjectInfos: that.data.participatingProjectInfos.concat(res.data)
              })
            }
          })
        })
      }
    })
  },
})