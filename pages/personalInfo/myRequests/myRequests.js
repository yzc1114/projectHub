// pages/personalInfo/myRequests/myRequests.js
var app = getApp();

Page({
  data: {
    requests:[],
    requestId:0,
  },

  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    db.collection("UserInfos").where({
      openid:app.globalData.openid,
    }).field({
      requests:true
    }).get({
      complete:res=>{
        console.assert(res.data.length === 1?"正常":"不正常");
        console.log(res.data[0].requests);
        var requests = res.data[0].requests;
        var requestToBeAdded = {};
        for(let i = 0;i < requests.length;i++){
          if (!requests[i]){
            continue;
          }
          requestToBeAdded.requestOpenid = requests[i].requestOpenid;
          requestToBeAdded.requestProjectId = requests[i].requestProjectId;
          db.collection("UserInfos").where({
            openid: requests[i].requestOpenid,
          }).field({
            name:true,
            avatarUrl:true
          }).get().then(res=>{
            console.log("第一个promise:",res);
            requestToBeAdded.requestUserName = res.data[0].name;
            requestToBeAdded.requestUserAvatarUrl = res.data[0].avatarUrl;
            console.log("第二个promise开始前:request", requests[i])
            return db.collection("Projects").doc(requests[i].requestProjectId).field({
              projectName:true,
            }).get();
          }).then(res=>{
            console.log("第二个promise:",res);
            requestToBeAdded.projectName = res.data.projectName;
            requestToBeAdded.requestId = that.data.requestId;
            that.data.requests.push(requestToBeAdded);
            that.setData({
              requests:that.data.requests,
              requestId:that.data.requestId + 1,
            })
          })
        }
        wx.hideLoading();
        return;
      }
    })
  },
  reject:function(e){
    console.log(e);
    var requestId = e.currentTarget.dataset.requestId;
    var request = this.data.requests[requestId];
    wx.cloud.callFunction({
      name:"updateUserRequestStatus",
      data:{
        requestOpenid:request.requestOpenid,
        requestProjectId:request.requestProjectId,
        status:"rejected",
      },
      complete:res=>{
        console.log("拒绝完事了",res);
        /*
        that.data.requests.splice(requestId,1);
        that.setData({
          requests:that.data.requests,
        });*/
      }
    })
  },
  agree:function(e){
    console.log(e);
    var requestId = e.currentTarget.dataset.requestId;
    var request = this.data.requests[requestId];
    var that = this;
    console.log("将要发送给云函数的request",request);
    wx.cloud.callFunction({
      name: "updateUserRequestStatus",
      data: {
        requestOpenid: request.requestOpenid,
        requestProjectId: request.requestProjectId,
        status: "agreed",
      },
      complete: res => {
        console.log("同意完事了", res);
        that.data.requests.splice(requestId,1);
        that.setData({
          requests:that.data.requests,
        });
      }
    })
  }
})