var sliderWidth = 114;
var util = require("../../utils.js");
var app = getApp();
Page({
  data: {
    curId: 0,
    inputShowed: false,
    inputVal: "",
    userInfos: [],
    tabs: ["最热", "最新"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    userInfoChecked:false, //在打开主页之前是false 然后用云函数调用 根据openid查询用户信息
                          //检查之前不显示页面 检查完毕之后再显示页面内容
    hotProjects:[],
    latestProjects:[],
  },
  onLoad:function() {
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    //云端初始化
    wx.cloud.init();
    //登录微信
    //获取openid
    wx.login({
      success: function (res) {
        if (res.code) {
          wx.cloud.callFunction({
            name: "getOpenid",
            complete: res => {
              console.log('callFunction test result: ', res);
              var OPENID = res.result.OPENID;
              console.log(OPENID);
              app.globalData.openid = OPENID;
            }
          })
        }
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showModal({
          title: '登录微信失败',
          content: '请检查你的网络连接',
          showCancel: false
        })
      }
    })//获取完毕

    //根据openid查询用户信息 可能没有注册过 也可能注册过 
    //TODO:若注册过 则修改几个按钮的行为
    wx.cloud.callFunction({
      name:"getUserInfoWithOpenId",
      complete:res=>{
        console.assert(res.result.data.length === 1 || res.result.data.length === 0,"返回数据正常","有多条数据有相同的openid???");
        if(res.result.data.length === 1){
          app.globalData.userInfoWithOpenId = res.result.data[0];
          app.globalData.isRegistered = true;
          console.log(res.result.data[0]);
        }else{
          app.globalData.isRegistered = false;
          app.globalData.userInfoWithOpenId = null;
          console.log("用户未注册");
        }
        this.setData({
          userInfoChecked : true //用户信息已经检查过了 可以展示页面了
        })
        wx.hideLoading();
      }
    })

    //navBar初始化
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: 0,
          sliderOffset:0,
          //sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    //navBar初始化结束

    //查看是否已经授权过了 若授权过了 就把userinfo加载进来
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              app.globalData.userInfo = res.userInfo
            }
          })
        } else {
          //还没授权
          app.globalData.userInfo = null
        }
      }
    })


    //初始化最热的项目
    var that = this;
    const db = wx.cloud.database();
    db.collection("Projects").orderBy("watchedTimes","desc").get({
      //由于未指定limit 所以取了二十条
      success:function(res){
        res.data.forEach(function(item){
          item.formatTime = util.formatTime(new Date(item.createTimeStamp));
        })
        that.setData({
          hotProjects:that.data.hotProjects.concat(res.data)
        })
        
      }
    })
    //初始化最新的项目
    db.collection("Projects").orderBy("createTimeStamp","desc").get({
      //由于未指定limit 所以取了二十条
      success:function(res){
        res.data.forEach(function (item) {
          item.formatTime = util.formatTime(new Date(item.createTimeStamp));
        })
        that.setData({
          latestProjects:that.data.latestProjects.concat(res.data)
        })
      }
    })
  },

  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    for (let i = 0; i < this.data.userInfos.length; i++) {
      this.data.userInfos[i].show = false
    }
    this.setData({
      inputVal: "",
      inputShowed: false,
      userInfos: this.data.userInfos
    });
  },
  clearInput: function () {
    this.data.userInfos = []
    this.setData({
      inputVal: "",
      "userInfos": this.data.userInfos
    });
  },
  inputTyping: function (e) {
    var item = {}
    item.keyword = e.detail.value
    item.id = this.data.curId++
    item.show = true
    this.data.userInfos.unshift(item)
    this.setData({
      "curId": this.data.curId,
      "inputVal": item.keyword,
      "userInfos": this.data.userInfos
    });
  },
  searchKeyword: function (e) {
    console.log(this.data.inputVal)
    //发起异步网络请求 搜索这个人
    //加入到userInfos中
    var arrayLength = this.data.userInfos.length;
  },
  tabClick: function (e) {
    console.log(e.currentTarget.id)
    console.log(e.currentTarget.offsetLeft)
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  tap1: function(e){
    console.log(e)
  },
  _firstFloatingButtonEvent:function(e){
    console.log("tapadd")
  },
  secondFloatingButtonEvent: function(e){
    console.log("tapdel")
  },
  _mainFloatingButtonEvent:function(e){
    console.log("tapMainFloatingButton");
    if(!app.globalData.isRegistered){
      wx.navigateTo({
        url: "../startPage",
      })
    }else{
      wx.navigateTo({
        url: "../editProject/editProject",
      })
    }
  },
  onPullDownRefresh:function(e){
    //初始化最热的项目
    wx.showNavigationBarLoading();
    this.setData({
      hotProjects:[],
      latestProjects:[]
    })
    var that = this;
    const db = wx.cloud.database();
    var promise1 = db.collection("Projects").orderBy("watchedTimes", "desc").get()
    var promise2 = db.collection("Projects").orderBy("createTimeStamp", "desc").get()
    Promise.all([promise1,promise2]).then((results)=>{
      console.log("两个都刷新完了",results)
      results.forEach((res)=>{
        res.data.forEach(function (item) {
          item.formatTime = util.formatTime(new Date(item.createTimeStamp));
        })
      });
      that.setData({
        hotProjects:results[0].data,
        latestProjects:results[1].data,
      });
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    })
  }
})