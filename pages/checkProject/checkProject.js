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
    workersInfos: [],
    buttonSrc: "../images/未收藏.png",
    showApply: false,
    showDelete: false,
    showExit: false,
    collectWorking: false,
    isButtonDisabled: true,
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
        if (res.data[0].collectedProjects.indexOf(that.data.projectId) !== -1) {
          //收藏了
          that.setData({
            buttonSrc: CollectedButtonSrc
          })
        } else {
          //未收藏
          that.setData({
            buttonSrc: unCollectedButtonSrc
          })
        }
      }
    })


    const _ = db.command;
    db.collection("Projects")
      .doc(that.data.projectId)
      .get()
      .catch(res => {
        console.log("查Projects出错", res);
        //没有查找到项目
        wx.showModal({
          title: '错误',
          content: '该项目不存在',
          showCancel: false,
          success: res => {
            if (res.confirm) {
              wx.navigateBack();
            }
          }
        });
      })
      .then(function(res) {
        console.log("查看项目", res);
        if (!res) {
          //没有查找到项目
          wx.showModal({
            title: '错误',
            content: '该项目不存在',
            showCancel: false,
            success: res => {
              if (res.confirm) {
                wx.navigateBack();
              }
            }
          })
        }
        that.setData({
          projectName: res.data.projectName,
          leaderOpenid: res.data.leaderOpenid,
          workersOpenids: res.data.workersOpenid,
          projectDescription: res.data.projectDescription,
          teamMemberDescription: res.data.teamMemberDescription,
          teamMemberNumber: res.data.teamMemberNumber,
          createTimeStamp: res.data.createTimeStamp
        });
        //看看自己是不是leader
        if (res.data.leaderOpenid === app.globalData.openid) {
          //是leader
          that.setData({
            showApply: false,
            showDelete: true,
          })
        } else {
          //不是leader
          that.setData({
            showApply: true,
            showDelete: false,
          })
          //看看自己是不是队员
          var isWorker = false;
          for (let i = 0; i < that.data.workersOpenids; i++) {
            if (that.data.workersOpenids[i] === app.globalData.openid) {
              //是队员
              isWorker = true;
              that.setData({
                showApply: false,
                showDelete: false,
                showExit: true,
              })
            }
          };
          if (!isWorker) {
            //不是队员
            that.setData({
              showApply: true,
              showDelete: false,
              showExit: false,
            });
            //把访问量加1 因为不是leader也不是worker查看的
            wx.cloud.callFunction({
              name: "increaseWatchTimesOfProject",
              data: {
                projetcId: that.data.projectId,
              },
              complete: res => {
                console.log("访问量自增完成");
              }
            })
          }
        }


        console.log("准备查询项目的人物信息", that.data.leaderOpenid);



        db.collection("UserInfos").where({
          openid: that.data.leaderOpenid
        }).get({
          success: res => {
            console.assert(res.length === 1 ? "正常" : "openid有重复");
            console.log("查找leader成功", res);
            console.log("res.data[0].avatarUrl:", res.data[0].avatarUrl);
            that.setData({
              leaderName: res.data[0].name,
              leaderAvatarUrl: res.data[0].avatarUrl
            });

            //检查自己是否向发起人申请过该项目 然后改按钮
            db.collection("UserInfos").where({
              openid: that.data.leaderOpenid
            }).field({
              requests: true
            }).get({
              success: res => {
                var requests = res.data[0].requests;
                console.log("检查自己是否向发起人申请过该项目:", requests);
                var ifButtonAvalible = true;
                for (let i = 0; i < requests.length; i++) {
                  if (!requests[i]) {
                    continue;
                  }
                  if (requests[i].requestProjectId === that.data.projectId &&
                    requests[i].requestOpenid === app.globalData.openid) {
                    ifButtonAvalible = false;
                    break;
                  }
                }
                that.setData({
                  isButtonDisabled: !ifButtonAvalible,
                });
              }
            })
          },
          fail: res => {
            console.log("查找user出错", res);
          }
        });
        var workersInfos = [];
        console.log("准备查询workers", that.data.workersOpenids);
        var promises = [];
        that.data.workersOpenids.forEach(function(workerOpenid) {
          promises.push(db.collection("UserInfos").where({
            openid: workerOpenid
          }).field({
            name: true,
            avatarUrl: true
          }).get());
        });
        Promise.all(promises).then(results => {
          console.log(results);
          results.forEach(res => {
            workersInfos.push(res.data[0]);
          })
          that.setData({
            workersInfos: workersInfos
          })
        });
      });
  },
  collectButtonTap: function(e) {
    //如果没有注册 就不让你收藏
    if (!app.globalData.isRegistered) {
      wx.showModal({
        title: '注意',
        content: '请您先注册，再收藏',
        success: res => {
          if (res.confirm) {
            wx.navigateTo({
              url: '../startPage',
            });
            return;
          } else {
            return;
          }
        }
      });
    } else {
      var that = this;
      if (that.data.collectWorking) {
        //如果正在收藏过程中 直接return
        return;
      }
      that.setData({
        collectWorking: true
      })
      if (that.data.buttonSrc === CollectedButtonSrc) {
        //取消收藏
        //云端数据库无法直接删除数组中的元素
        //先获得全部的收藏的项目,再在本地删除然后上传上去
        const db = wx.cloud.database();
        db.collection("UserInfos").where({
          openid: app.globalData.openid
        }).field({
          collectedProjects: true
        }).get({
          success: res => {
            console.log("点击取消收藏", res);
            console.assert(res.data.length === 1 ? "正常" : "不正常");
            var collectedProjects = res.data[0].collectedProjects;
            console.log("收到的项目", collectedProjects);
            collectedProjects
              .splice(collectedProjects.indexOf(that.data.projectId), 1);
            console.log("删除后的数组", collectedProjects);
            wx.cloud.callFunction({
              name: "updateUserCollectedProjectsWhenCancelCollect",
              data: {
                collectedProjects: collectedProjects
              },
              complete: res => {
                console.log("取消收藏", res);
                that.setData({
                  buttonSrc: unCollectedButtonSrc,
                  collectWorking: false,
                })
              }
            })
          }
        })
      } else {
        wx.cloud.callFunction({
          name: "updateUserCollectedProjects",
          data: {
            projectId: that.data.projectId
          },
          complete: res => {
            console.log("收藏完毕", res);
            that.setData({
              buttonSrc: CollectedButtonSrc,
              collectWorking: false,
            })
          }
        })
      }
    }
  },
  requestAttend: function(e) {
    //如果没有注册的时候就点击了申请
    //就让它注册 再回来
    if (!app.globalData.isRegistered) {
      wx.showModal({
        title: '注意',
        content: '您还没有注册,请先注册个人信息',
        success: res => {
          if (res.confirm) {
            wx.navigateTo({
              url: '../startPage',
            })
            return;
          } else {
            return;
          }
        }
      });
      return;
    } else {
      wx.showLoading({
        title: '申请中...',
      })
      //申请加入该项目
      var that = this;
      wx.cloud.callFunction({
        name: "requestJoinProject",
        data: {
          requestProjectId: that.data.projectId,
          leaderOpenid: that.data.leaderOpenid,
          requestTimeStamp: Date.now()
        },
        complete: function(e) {
          console.log("申请完毕", e);
          that.setData({
            isButtonDisabled: true,
          });
          wx.hideLoading();
          wx.showToast({
            title: '申请完毕!',
          })
        }
      })
    }

  },
  clickAvatar: function(e) {
    console.log("点击头像", e);
    if (e.currentTarget.dataset.user === "leader") {
      wx.navigateTo({
        url: '../checkPerson/checkPerson?openid=' + this.data.leaderOpenid,
      })
    } else {
      wx.navigateTo({
        url: '../checkPerson/checkPerson?openid=' + this.data.workersOpenids[e.currentTarget.dataset.index],
      })
    }
  },
  deleteProject: function(e) {
    //在这里不能用拉姆达表达式
    var that = this;
    console.log("点击了删除", that.data);

    wx.showLoading({
      title: '删除中...',
    })
    wx.cloud.callFunction({
      name: "deleteProject",
      data: {
        projectId: that.data.projectId
      },
      complete: res => {
        console.log("删除完事了", res);
        wx.showToast({
          title: '删除完毕',
        });
        wx.navigateBack();
      }
    })
  },
  exitProject: function(e) {
    var that = this;
    console.log("点击了退出项目");
    wx.cloud.callFunction({
      name: "exitProject",
      data: {
        projectId: that.data.projectId
      },
      complete: res => {
        console.log("退出完事了", res);
        //需要将页面中的按钮以及参与者的信息修改掉
        var workersOpenids = that.data.workersOpenids;
        workersOpenids.splice(workersOpenids.indexOf(app.globalData.openid));
        that.setData({
          workersOpenids: workersOpenids,
          showDelete: false,
          showApply: true,
        });
      }
    })
  },
  editProject: function(e) {
    var that = this;
    console.log("点击了修改项目", e);
    wx.navigateTo({
      url: '../editProject/editProject?openType=edit&projectId=' + that.data.projectId,
    });
  },
})