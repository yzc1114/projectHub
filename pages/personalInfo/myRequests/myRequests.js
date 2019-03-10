// pages/personalInfo/myRequests/myRequests.js
var app = getApp();
var util = require("../../../utils.js");
Page({
  data: {
    requests: [],
    requestId: 0,
    pageNumber:1,
    isCloudWorking:false
  },

  onLoad: function(options) {
    wx.showLoading({
      title: '加载中...',
    })

    //先看看自己的hasNewRequest是否为true 然后再决定是否更新自己的hasNewRequest
    /*
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //拿到上一个界面 即为personalInfo.js
    if (prevPage.data.hasNewRequest) {
      wx.cloud.callFunction({
        name: "updateUserHasNew",
        data: {
          hasNewRequest: false,
        },
        complete: res => {
          //修改完毕
          console.log("修改hasNewMessages完毕", res);
          prevPage.setData({
            hasNewRequest: false,
          })
        }
      })
    }*/
    if(app.globalData.hasNewRequest){
      wx.cloud.callFunction({
        name: "updateUserHasNew",
        data: {
          hasNewRequest: false,
        },
        complete: res => {
          //修改完毕
          console.log("修改hasNewMessages完毕", res);
          app.globalData.hasNewRequest = false;
        }
      })
    }

    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    db.collection("UserInfos").where({
      openid: app.globalData.openid,
    }).field({
      requests: true
    }).get({
      complete: res => {
        console.log("第一次搜索",res.data[0].requests);
        var requests = res.data[0].requests;
        requests.sort((a, b) => {
          if (a.requestTimeStamp > b.requestTimeStamp) return -1;
          else return 1;
        });
        console.log("排序完毕",requests);
        for (let i = 0; i < requests.length; i++) {
          if (!requests[i]) {
            continue;
          }
          requests[i].id = i;
          requests[i].requestFormatTime = util.formatTime(new Date(requests[i].requestTimeStamp));
          db.collection("UserInfos").where({
            openid: requests[i].requestOpenid,
          }).field({
            name: true,
            avatarUrl: true
          }).get().then(res => {
            //console.log("第一个promise:", res);
            requests[i].requestUserName = res.data[0].name;
            requests[i].requestUserAvatarUrl = res.data[0].avatarUrl;
            //console.log("第二个promise开始前:request", requests[i])
            return db.collection("Projects").doc(requests[i].requestProjectId).field({
              projectName: true,
            }).get();
          }).then(res => {
            //console.log("第二个promise:", res);
            requests[i].projectName = res.data.projectName;
            if (requests[i].requestStatus === "agreed" || requests[i].requestStatus === "rejected") {
              requests[i].agreedOrRejected = true;
              requests[i].textAfterTappingButton = requests[i].requestStatus === "agreed" ? "已同意" : "已拒绝";
            } else {
              requests[i].agreedOrRejected = false;
              requests[i].textAfterTappingButton = "";
            }
            that.data.requests[i] = (requests[i]);
            that.setData({
              requests: that.data.requests,
              requestId: that.data.requestId + 1,
            })
            //console.log("requests最终", that.data.requests);
          })
        }
        wx.hideLoading();
        return;
      }
    })
  },
  onReachBottom: function() {
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    wx.showNavigationBarLoading();
    db.collection("UserInfos").where({
      openid: app.globalData.openid,
    }).limit(20).field({
      requests: true
    }).skip(20 * that.data.pageNumber).get({
      complete: res => {
        console.log("到底 搜索",res);
        if(res.data.length === 0){
          console.log("没有更多了");
          wx.hideNavigationBarLoading();
          return;
        }
        var requests = res.data[0].requests;
        console.log("跳过", 20 * that.data.pageNumber);
        requests.sort((a, b) => {
          if (a.requestTimeStamp > b.requestTimeStamp) return -1;
          else return 1;
        });
        for (let i = 0; i < requests.length; i++) {
          if (!requests[i]) {
            continue;
          }
          requests[i].id = i + 20 * that.data.pageNumber;
          requests[i].requestFormatTime = util.formatTime(new Date(requests[i].requestTimeStamp));
          db.collection("UserInfos").where({
            openid: requests[i].requestOpenid,
          }).field({
            name: true,
            avatarUrl: true
          }).get().then(res => {
            //console.log("第一个promise:", res);
            requests[i].requestUserName = res.data[0].name;
            requests[i].requestUserAvatarUrl = res.data[0].avatarUrl;
            //console.log("第二个promise开始前:request", requests[i])
            return db.collection("Projects").doc(requests[i].requestProjectId).field({
              projectName: true,
            }).get();
          }).then(res => {
            //console.log("第二个promise:", res);
            requests[i].projectName = res.data.projectName;
            if (requests[i].requestStatus === "agreed" || requests[i].requestStatus === "rejected") {
              requests[i].agreedOrRejected = true;
              requests[i].textAfterTappingButton = requests[i].requestStatus === "agreed" ? "已同意" : "已拒绝";
            } else {
              requests[i].agreedOrRejected = false;
              requests[i].textAfterTappingButton = "";
            }
            that.data.requests[i + 20 * that.data.pageNumber] = (requests[i]);
            that.setData({
              requests: that.data.requests,
              requestId: that.data.requestId + 1,
            })
            //console.log("requests最终", that.data.requests);
          })
        }
        that.setData({
          pageNumber:that.data.pageNumber + 1
        })
        wx.hideNavigationBarLoading();
        return;
      }
    })
  },
  reject: function(e) {
    wx.showNavigationBarLoading();
    console.log(e);
    if(this.data.isCloudWorking){
      return;
    }
    this.setData({
      isCloudWorking:true,
    });
    var requestId = e.currentTarget.dataset.requestId;
    var request = this.data.requests[requestId];
    var that = this;
    wx.cloud.callFunction({
      name: "updateUserRequestStatus",
      data: {
        requestOpenid: request.requestOpenid,
        requestProjectId: request.requestProjectId,
        requestTimeStamp: request.requestTimeStamp,
        status: "rejected",
      },
      complete: res => {
        wx.hideNavigationBarLoading();
        console.log("拒绝完事了", res);
        //that.data.requests.splice(requestId, 1);
        that.data.requests[requestId].agreedOrRejected = true;
        that.data.requests[requestId].textAfterTappingButton = "已拒绝";
        that.setData({
          requests: that.data.requests,
          isCloudWorking:false,
        });
      }
    })
  },
  agree: function(e) {
    wx.showNavigationBarLoading();
    console.log(e);
    if (this.data.isCloudWorking) {
      return;
    }
    this.setData({
      isCloudWorking: true,
    });
    var requestId = e.currentTarget.dataset.requestId;
    var request = this.data.requests[requestId];
    var that = this;
    //先检查这个项目人有没有满 若满则无法同意
    const db = wx.cloud.database();
    db.collection("Projects").doc(request.requestProjectId).field({
      teamMemberNumber:true,
      workersOpenid:true,
    }).get({
      complete:res=>{
        if(res.data.teamMemberNumber - res.data.workersOpenid.length > 0){
          //还有位置 可以加入
          console.log("将要发送给云函数的request", request);
          wx.cloud.callFunction({
            name: "updateUserRequestStatus",
            data: {
              requestOpenid: request.requestOpenid,
              requestProjectId: request.requestProjectId,
              requestTimeStamp: request.requestTimeStamp,
              status: "agreed",
            },
            complete: res => {
              wx.hideNavigationBarLoading();
              console.log("同意完事了", res);
              that.data.requests[requestId].agreedOrRejected = true;
              that.data.requests[requestId].textAfterTappingButton = "已同意";
              that.setData({
                requests: that.data.requests,
                isCloudWorking: false,
              });
            }
          })
        }else{
          //没有位置了
          wx.showModal({
            title: '注意',
            content: '该项目已人满',
            showCancel:false,
          });
          that.setData({
            isCloudWorking: false,
          });
        }
      }
    })
  }
})