// pages/checkProject/checkProject.js
var utils = require("../../utils.js");
var app = getApp();
var unCollectedButtonSrc = "../images/未收藏.png";
var CollectedButtonSrc = "../images/收藏的.png"

Page({

  data: {
    projectId: "",
    projectName: "",
    leaderOpenid: "",
    workersOpenids: [],
    teamMemberNumber: 0,
    projectDescription: "",
    teamMemberDescription: "",
    createTimeStamp: 0,
    leaderAvatarUrl: "",
    leaderName: "",
    workersInfos:[],
    buttonSrc:"../images/未收藏.png",
    collectWorking:false,
    isButtonDisabled:false,
  },

  onLoad: function(options) {
    this.setData({
      projectId: options.projectId
    })
    var that = this;
    const db = wx.cloud.database();


    db.collection("UserInfos").where({
      openid: app.globalData.openid,
    }).get({
      success: res => {
        console.assert(res.length === 1 ? "正常" : "不正常");
        if (res.data[0].collectedProjects.indexOf(that.data.projectId) !== -1){
          //收藏了
          that.setData({
            buttonSrc: CollectedButtonSrc
          })
        }else{
          //未收藏
          that.setData({
            buttonSrc: unCollectedButtonSrc
          })
        }
      }
    })

    //TODO:检查自己是否是worker或者leader

    const _ = db.command;
    db.collection("Projects")
      .doc(that.data.projectId)
      .get()
      .catch(res => {
        console.log("查Projects出错", res);
      })
      .then(function(res) {
        console.log("查看项目", res);
        that.setData({
          projectName: res.data.projectName,
          leaderOpenid: res.data.leaderOpenid,
          workersOpenids: res.data.workersOpenid,
          projectDescription: res.data.projectDescription,
          teamMemberDescription: res.data.teamMemberDescription,
          teamMemberNumber: res.data.teamMemberNumber,
          createTimeStamp: res.data.createTimeStamp
        });
        console.log("准备查询项目的人物信息", that.data.leaderOpenid);
        db.collection("UserInfos").where({
          openid:that.data.leaderOpenid
        }).get({
          success: res => {
            console.assert(res.length === 1 ? "正常" : "openid有重复");
            console.log("查找leader成功",res);
            console.log("res.data[0].avatarUrl:",res.data[0].avatarUrl);
            that.setData({
              leaderName: res.data[0].name,
              leaderAvatarUrl: res.data[0].avatarUrl
            });

            //检查自己是否向发起人申请过该项目 然后改按钮
            db.collection("UserInfos").where({
              openid:that.data.leaderOpenid
            }).field({
              requests:true
            }).get({
              success:res=>{
                var requests = res.data[0].requests;
                console.log("检查自己是否向发起人申请过该项目:", requests);
                for(let i = 0;i < requests.length;i++){
                  if(!requests[i]){
                    continue;
                  }
                  if (requests[i].requestProjectId === that.data.projectId
                    &&requests[i].requestOpenid === that.data.leaderOpenid){
                      that.setData({
                        isButtonDisabled: true,
                      });
                      break;
                    }
                }
              }
            })

          },
          fail: res => {
            console.log("查找user出错", res);
          }
        });
        var workersInfos = [];
        console.log("准备查询workers",that.data.workersOpenids);
        var promises = [];
        that.data.workersOpenids.forEach(function(workerOpenid) {
          promises.push(db.collection("UserInfos").where({
            openid:workerOpenid
          }).field({
            name:true,
            avatarUrl:true
          }).get());
        });
        Promise.all(promises).then(results=>{
          console.log(results);
          results.forEach(res=>{
            workersInfos.push(res.data[0]);
          })
          that.setData({
            workersInfos: workersInfos
          })
        });
      });
  },
  collectButtonTap:function(e){
    var that = this;
    that.setData({
      collectWorking:true
    })
    if (that.data.buttonSrc === CollectedButtonSrc){
      //取消收藏
      //云端数据库无法直接删除数组中的元素
      //先获得全部的收藏的项目,再在本地删除然后上传上去
      const db = wx.cloud.database();
      db.collection("UserInfos").where({
        openid:app.globalData.openid
      }).field({
        collectedProjects:true
      }).get({
        success:res=>{
          console.log("点击取消收藏",res);
          console.assert(res.data.length === 1?"正常":"不正常");
          var collectedProjects = res.data[0].collectedProjects;
          console.log("收到的项目",collectedProjects);
          collectedProjects
          .splice(collectedProjects.indexOf(that.data.projectId),1);
          console.log("删除后的数组",collectedProjects);
          wx.cloud.callFunction({
            name:"updateUserCollectedProjectsWhenCancelCollect",
            data:{
              collectedProjects: collectedProjects
            },
            complete:res=>{
              console.log("取消收藏",res);
              that.setData({
                buttonSrc:unCollectedButtonSrc,
                collectWorking:false,
              })
            }
          })
        }
      })
    }else{
      wx.cloud.callFunction({
        name:"updateUserCollectedProjects",
        data:{
          projectId:that.data.projectId
        },
        complete:res=>{
          console.log("收藏完毕",res);
          that.setData({
            buttonSrc:CollectedButtonSrc,
            collectWorking:false,
          })
        }
      })
    }
  },
  requestAttend:function(e){
    //申请加入该项目
    var that = this;
    wx.cloud.callFunction({
      name:"requestJoinProject",
      data:{
        requestProjectId:that.data.projectId,
        requestOpenid: that.data.leaderOpenid,
      },
      complete:function(e){
        console.log("申请完毕",e);
        that.setData({
          isButtonDisabled:true,
        });
        wx.showToast({
          title: '申请完毕!',
        })
      }
    })
  },
  clickAvatar:function(e){
    console.log("点击头像",e);
    if(e.currentTarget.dataset.user === "leader"){
      wx.navigateTo({
        url: '../checkPerson/checkPerson?openid=' + this.data.leaderOpenid,
      })
    }else{
      wx.navigateTo({
        url: '../checkPerson/checkPerson?openid=' + this.data.workersOpenids[e.currentTarget.dataset.index],
      })
    }
  }
})