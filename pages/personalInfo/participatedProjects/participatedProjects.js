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
    //先看看自己的hasNewParticipatingProjects是否为true 然后再决定是否更新自己的hasNewParticipatingProjects
    /*
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //拿到上一个界面 即为personalInfo.js
    if (prevPage.data.hasNewParticipatingProjects) {
      wx.cloud.callFunction({
        name: "updateUserHasNew",
        data: {
          hasNewParticipatingProjects: false,
        },
        complete: res => {
          //修改完毕
          console.log("修改hasNewMessages完毕", res);
          prevPage.setData({
            hasNewParticipatingProjects:false,
          })
        }
      })
    }*/
    if(app.globalData.hasNewParticipatingProjects){
      wx.cloud.callFunction({
        name: "updateUserHasNew",
        data: {
          hasNewParticipatingProjects: false,
        },
        complete: res => {
          //修改完毕
          console.log("修改hasNewMessages完毕", res);
          app.globalData.hasNewParticipatingProjects = false;
        }
      })
    }

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
        var participatingProjectIds = res.data[0].participatingProjects;
        that.setData({
          participatingProjectIds: participatingProjectIds
        });
        participatingProjectIds.forEach(id=>{
          const db = wx.cloud.database();
          db.collection("Projects").doc(id).field({
            createTimeStamp: true,
            teamMemberNumber: true,
            workersOpenid: true,
            projectName: true,
            projectDescription: true,
            projectProgress: true,
            projectType: true,
          }).get({
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
    wx.showNavigationBarLoading();
    db.collection("UserInfos").where({
      openid: app.globalData.openid
    }).skip(20 * that.data.pageNumber).field({
      participatingProjects: true
    }).get({
      success: (res) => {
        console.log("查询到参与的项目", res.data);
        if(res.data.length === 0){
          //没有多余的了
          wx.hideNavigationBarLoading();
          return;
        }
        var participatingProjectIds = res.data[0].participatingProjects;
        that.setData({
          participatingProjectIds: that.data.participatingProjectIds.concat(participatingProjectIds)
        });
        participatingProjectIds.forEach(id => {
          const db = wx.cloud.database();
          db.collection("Projects").doc(id).field({
            createTimeStamp:true,
            teamMemberNumber:true,
            workersOpenid:true,
            projectName:true,
            projectDescription:true,
            projectProgress: true,
            projectType: true,
          }).get({
            success: res => {
              console.log(res);
              res.data.formatTime = util.formatTime(new Date(res.data.createTimeStamp));
              that.setData({
                participatingProjectInfos: that.data.participatingProjectInfos.concat(res.data)
              })
              wx.hideNavigationBarLoading();
            }
          })
        })
      }
    })
  },
})