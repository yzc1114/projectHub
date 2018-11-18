// pages/checkPerson/checkPersonProjects/checkPersonProjects.js
var util = require("../../../utils.js");
Page({
  data: {
    openType:"",
    userOpenid:"",
    Projects:[],
    pageNumber:1,
    participatingProjectIds: [],
  },
  onLoad: function (options) {
    console.log(options);
    this.setData({
      userOpenid:options.openid,
      openType:options.type,
    });
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    var getLeaderProjects = that.data.openType === "leader" ? true : false;
    console.log(getLeaderProjects);
    if(getLeaderProjects){
      db.collection("Projects").where({
        leaderOpenid: that.data.userOpenid,
      }).get({
        success: (res) => {
          console.log("已发布的项目加载完毕", res);
          res.data.forEach(item => {
            item.formatTime = util.formatTime(new Date(item.createTimeStamp));
          })
          that.setData({
            Projects: res.data,
          })
        }
      })
    }else{
      var that = this;
      db.collection("UserInfos").where({
        openid: that.data.userOpenid
      }).field({
        participatingProjects: true
      }).get({
        success: (res) => {
          console.log("查询到参与的项目", res.data);
          console.assert(res.data.length === 1 ? "正常" : "不正常");
          var participatingProjectIds = res.data[0].participatingProjects;
          that.setData({
            participatingProjectIds: participatingProjectIds
          });
          participatingProjectIds.forEach(id => {
            const db = wx.cloud.database();
            db.collection("Projects").doc(id).get({
              success: res => {
                res.data.formatTime = util.formatTime(new Date(res.data.createTimeStamp));
                console.log(res);
                that.setData({
                  Projects: that.data.Projects.concat(res.data)
                })
              }
            })
          })
        }
      })
    }
  },
  onReachBottom: function () {
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    if(that.data.openType === "leader"){
      db.collection("Projects").where({
        leaderOpenid: that.data.userOpenid,
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
              Projects: that.data.Projects.concat(res.data),
              pageNumber: that.data.pageNumber + 1,
            })
          }
        }
      })
    }else{
      db.collection("UserInfos").where({
        openid: that.data.userOpenid
      }).skip(20 * that.data.pageNumber).field({
        participatingProjects: true
      }).get({
        success: (res) => {
          console.log("查询到参与的项目", res.data);
          console.assert(res.data.length === 1 ? "正常" : "不正常");
          if (res.data[0].length === 0) {
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
                  Projects: that.data.Projects.concat(res.data)
                })
              }
            })
          })
        }
      })
    }
  }
})
