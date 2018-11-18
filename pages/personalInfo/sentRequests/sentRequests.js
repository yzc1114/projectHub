// pages/personalInfo/collectedProjects/collectedProjects.js
var util = require("../../../utils.js");
var app = getApp();
Page({
  data: {
    sentRequestInfos: [],
    sentRequestProjectInfos: [],
    pageNumber: 1
  },
  onLoad: function (options) {
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    db.collection("UserInfos").where({
      openid: app.globalData.openid
    }).field({
      myRequestProjects: true
    }).get({
      success: (res) => {
        console.log("查询到参与的项目", res.data);
        console.assert(res.data.length === 1 ? "正常" : "不正常");
        var sentRequestInfos = res.data[0].myRequestProjects;
        that.setData({
          sentRequestInfos: sentRequestInfos
        });

        var promises = [];
        const db = wx.cloud.database();
        sentRequestInfos.forEach(info => {
          promises.push(db.collection("Projects").doc(info.requestProjectId).get());
        })
        Promise.all(promises).then(results=>{
          for (let i = sentRequestInfos.length-1;i>=0;i--){
            var info = sentRequestInfos[i];
            var res = results[i];
            res.data.formatTime = util.formatTime(new Date(res.data.createTimeStamp));
            if (info.requestStatus === "requesting") {
              res.data.status = "申请中"
            } else if (info.requestStatus === "agreed") {
              res.data.status = "已同意"
            } else {
              res.data.status = "被拒绝"
            }
            console.log(res);
            that.setData({
              sentRequestProjectInfos: that.data.sentRequestProjectInfos.concat(res.data)
            })
          }
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
      myRequestProjects: true
    }).get({
      success: (res) => {
        console.log("查询到参与的项目", res.data);
        console.assert(res.data.length === 1 ? "正常" : "不正常");
        if (res.data[0].length === 0) {
          //没有多余的了
          return;
        }
        var sentRequestInfos = res.data[0].myRequestProjects;
        that.setData({
          sentRequestInfos: that.data.sentRequestInfos.concat(sentRequestInfos)
        });
        var promises = [];
        const db = wx.cloud.database();
        sentRequestInfos.forEach(info => {
          promises.push(db.collection("Projects").doc(info.requestProjectId).get());
        })
        Promise.all(promises).then(results => {
          for (let i = sentRequestInfos.length - 1; i >= 0; i--) {
            var info = sentRequestInfos[i];
            var res = results[i];
            res.data.formatTime = util.formatTime(new Date(res.data.createTimeStamp));
            if (info.requestStatus === "requesting") {
              res.data.status = "申请中"
            } else if (info.requestStatus === "agreed") {
              res.data.status = "已同意"
            } else {
              res.data.status = "被拒绝"
            }
            console.log(res);
            that.setData({
              sentRequestProjectInfos: that.data.sentRequestProjectInfos.concat(res.data)
            })
          }
        })
      }
    })
  },
})