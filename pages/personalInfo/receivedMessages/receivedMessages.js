var app = getApp();
var util = require("../../../utils.js");
Page({
  data: {
    receivedMessageInfos:[],
    pageNumber:1,
  },
  onLoad(options){
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    //先看看自己的hasNewMessages是否为true 然后再决定是否更新自己的hasNewMessages
    /*
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //拿到上一个界面
    if(prevPage.data.hasNewMessages){
      wx.cloud.callFunction({
        name:"updateUserHasNew",
        data:{ 
          hasNewMessages:false,
        },
        complete:res=>{
          //修改完毕
          console.log("修改hasNewMessages完毕",res);
          prevPage.setData({
            hasNewMessages:false
          })
        }
      })
    }*/
    if(app.globalData.hasNewMessages){
      wx.cloud.callFunction({
        name: "updateUserHasNew",
        data: {
          hasNewMessages: false,
        },
        complete: res => {
          //修改完毕
          console.log("修改hasNewMessages完毕", res);
          app.globalData.hasNewMessages = false;
        }
      })
    }

    db.collection("UserInfos").where({
      openid:app.globalData.openid
    }).field({
      leftMessages:true,
    }).get().then(res=>{
      console.log("我收到的留言",res.data[0].leftMessages);
      res.data[0].leftMessages.forEach(each => {  //记录正规时间
        if(each.sendTimeStamp){
          each.formatTimeMonthAndDay = util.formatTimeMonthAndDay(new Date(each.sendTimeStamp));
        }
      })
      that.setData({
        receivedMessageInfos:that.data.receivedMessageInfos.concat(res.data[0].leftMessages),
      });
      //开始查询每个人的头像;
      var promises = [];
      for(let i = 0;i < that.data.receivedMessageInfos.length; i++){
        promises.push(db.collection("UserInfos").where({
          openid: that.data.receivedMessageInfos[i].fromWho,
        }).field({
          avatarUrl: true,
          name:true,
        }).get());
      }
      Promise.all(promises).then(results=>{
        console.log(results);
        for(let i = 0;i < that.data.receivedMessageInfos.length; i++){
          that.data.receivedMessageInfos[i].name = results[i].data[0].name;
          that.data.receivedMessageInfos[i].avatarUrl = results[i].data[0].avatarUrl;
          that.data.receivedMessageInfos[i].id = i;
        }
        that.setData({
          receivedMessageInfos:that.data.receivedMessageInfos,
        })
      })
    });
  },
  onReachBottom:function(){
    const db = wx.cloud.database();
    const _ = db.command;
    var that = this;
    wx.showNavigationBarLoading();
    db.collection("UserInfos").where({
      openid: app.globalData.openid
    }).field({
      leftMessages: true,
    }).skip(20 * that.data.pageNumber).get().then(res => {
      console.log("我收到的留言", res.data[0].leftMessages);
      if(res.data[0].leftMessages.length <= 0){
        //没有更多数据了
        wx.hideNavigationBarLoading();
        console.log("没有更多数据了");
        return;
      }else{
        //还有更多数据
        console.log("还有更多数据");
        that.setData({
          pageNumber:that.data.pageNumber + 1
        })
      }
      res.data[0].leftMessages.forEach(each => {
        if (each.sendTimeStamp) {
          each.formatTimeMonthAndDay = util.formatTimeMonthAndDay(new Date(each.sendTimeStamp));
        }
      })
      that.setData({
        receivedMessageInfos: that.data.receivedMessageInfos.concat(res.data[0].leftMessages),
      });
      //开始查询每个人的头像;
      var promises = [];
      for (let i = 0; i < that.data.receivedMessageInfos.length; i++) {
        promises.push(db.collection("UserInfos").where({
          openid: that.data.receivedMessageInfos[i].fromWho,
        }).field({
          avatarUrl: true,
          name: true,
        }).get());
      }
      Promise.all(promises).then(results => {
        console.log(results);
        for (let i = 0; i < that.data.receivedMessageInfos.length; i++) {
          that.data.receivedMessageInfos[i].name = results[i].data[0].name;
          that.data.receivedMessageInfos[i].avatarUrl = results[i].data[0].avatarUrl;
          that.data.receivedMessageInfos[i].id = i;
        }
        that.setData({
          receivedMessageInfos: that.data.receivedMessageInfos,
        })
        wx.hideNavigationBarLoading();
      })
    });
  },
  onPullDownRefresh(){
    this.setData({
      pageNumber:1,
      receivedMessageInfos:[]
    });
    this.onLoad();
    wx.stopPullDownRefresh();
  }
})