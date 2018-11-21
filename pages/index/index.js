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
    hotPageNumber:1,
    latestProjects:[],
    latestPageNumber:1,
    showSeachResults:false,
  },
  onLoad:function() {

    //navBar初始化
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: 0,
          sliderOffset:0,
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

    var timer = setInterval(()=>{
      if(app.globalData.userInfoChecked){
        that.setData({
          userInfoChecked : true,
        })
        clearInterval(timer);
      }
    },50)


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
      userInfos: this.data.userInfos
    });
  },
  inputTyping: function (e) {
    var item = {}
    item.keyword = e.detail.value
    item.id = this.data.curId++
    item.show = true
    this.data.userInfos.unshift(item)
    this.setData({
      curId: this.data.curId,
      inputVal: item.keyword,
    });
    //TODO:根据item.keyword来搜索信息
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
      hotPageNumber:1,
      latestProjects:[],
      latestPageNumber:1,
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
  },
  onShow:function(){
    app.globalData.justShowStartPage = false;
  },
  onReachBottom:function(e){
    var that = this;
    const db = wx.cloud.database();
    console.log("跳过",20 * that.data.hotPageNumber);
    var promise1 = db.collection("Projects").orderBy("watchedTimes", "desc").skip(20 * that.data.hotPageNumber).get();
    var promise2 = db.collection("Projects").orderBy("createTimeStamp", "desc").skip(20 * that.data.latestPageNumber).get();
    Promise.all([promise1, promise2]).then((results) => {
      console.log("两个都刷新完了", results)
      if(results[0].data.length === 0){
        //没有更多了
        console.log("没有更多了");
        return;
      }
      results.forEach((res) => {
        res.data.forEach(function (item) {
          item.formatTime = util.formatTime(new Date(item.createTimeStamp));
        })
      });
      that.setData({
        hotProjects: that.data.hotProjects.concat(results[0].data),
        hotPageNumber:that.data.hotPageNumber + 1,
        latestProjects: that.data.latestProjects.concat(results[1].data),
        latestPageNumber:that.data.latestPageNumber + 1,
      });
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    })
  }
})