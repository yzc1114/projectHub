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
    userInfoChecked: false, //在打开主页之前是false 然后用云函数调用 根据openid查询用户信息
    //检查之前不显示页面 检查完毕之后再显示页面内容
    hotProjects: [],
    hotPageNumber: 1,
    latestProjects: [],
    latestPageNumber: 1,

    searchResults: [],
    isSearching: false,
    showSearchResults: false,
    searchCount: 0,
    searchResultPages: 0,

    animationMain:null,
    rotated:false,

    goodAt: ["设计", "编程", "测试", "策划", "美工", "文案"],
    goodAtItems: [{
      name: '设计',
      value: '0',
      checked: true
    },
    {
      name: '编程',
      value: '1',
      checked: true
    },
    {
      name: '测试',
      value: '2',
      checked: true
    },
    {
      name: '策划',
      value: '3',
      checked: true
    },
    {
      name: '美工',
      value: '4',
      checked: true
    },
    {
      name: '文案',
      value: '5',
      checked: true
    },
    ],

    projectTypes: ["社科", "理科", "工科", "艺术"],
    projectTypeItems: [{
      name: '社科',
      value: '0',
      checked: true
    },
    {
      name: '理科',
      value: '1',
      checked: true
    },
    {
      name: '工科',
      value: '2',
      checked: true
    },
    {
      name: '艺术',
      value: '3',
      checked: true
    },
    ],

  },
  onLoad: function() {

    //navBar初始化
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          sliderLeft: 0,
          sliderOffset: 0,
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

    var timer = setInterval(() => {
      if (app.globalData.userInfoChecked) {
        that.setData({
          userInfoChecked: true,
        })
        clearInterval(timer);
      }
    }, 50)


    //初始化最热的项目
    var that = this;
    const db = wx.cloud.database();
    db.collection("Projects").orderBy("watchedTimes", "desc").get({
      //由于未指定limit 所以取了二十条
      success: function(res) {
        res.data.forEach(function(item) {
          item.formatTime = util.formatTime(new Date(item.createTimeStamp));
        })
        that.setData({
          hotProjects: that.data.hotProjects.concat(res.data)
        })

      }
    })
    //初始化最新的项目
    db.collection("Projects").orderBy("createTimeStamp", "desc").get({
      //由于未指定limit 所以取了二十条
      success: function(res) {
        res.data.forEach(function(item) {
          item.formatTime = util.formatTime(new Date(item.createTimeStamp));
        })
        that.setData({
          latestProjects: that.data.latestProjects.concat(res.data)
        })
      }
    })
  },
  showInput: function() {
    this.setData({
      inputShowed: true,
      showSearchResults: true,
    });
  },
  hideInput: function() {
    this.setData({
      inputVal: "",
      inputShowed: false,
      searchResults:[],
      showSearchResults:false,
      searchResultPages:0,
    });
    wx.hideLoading();
  },
  clearInput: function() {
    this.setData({
      inputVal: "",
      inputShowed:true,
      searchResults:[],
      searchResultPages:0,
    });
  },
  inputTyping: function(e) {
    let currSearchCount = this.data.searchCount + 1;
    let currKeyword = e.detail.value;
    this.setData({
      inputVal: currKeyword,
      searchResults:[],
      searchResultPages:0,
      searchCount: this.data.searchCount + 1
    });
    wx.showLoading({
      title: '加载中',
      mask:true,
    });
    //TODO:根据item.keyword来搜索信息
    //如果上次的搜索没有结束 结束它并且开始新的搜索
    //searchCount记录这是第几次搜索 在搜索结束时如果是最新的一次搜索 则把结果加入results
    if(currKeyword === ""){
      this.setData({
        searchResults:[],
      });
      wx.hideLoading();
      return;
    }
    this.searchKeyword(currKeyword, currSearchCount, this.data.searchResultPages);
  },
  searchKeyword: function (keyword, searchCount, searchResultPages) {
    console.log("搜索的字符串为：", keyword);
    //发起异步网络请求 搜索这个人
    //加入到userInfos中
    this.setData({
      isSearching: true,
    })
    var that = this;
    //获取筛选条件
    /*
    var goodAtItems = that.data.goodAtItems;
    var filtedGoodAtItems = goodAtItems.filter(each => {
      if (each.checked) {
        return true;
      } else return false;
    });
    var goodAt = [];
    filtedGoodAtItems.forEach(each => {
      goodAt.push(each.name);
    });
    var projectTypeItems = that.data.projectTypeItems;
    var filtedProjectTypeItems = projectTypeItems.filter(each => {
      if (each.checked) {
        return true;
      } else return false;
    });
    var projectTypes = [];
    filtedProjectTypeItems.forEach(each => {
      projectTypes.push(each.name);
    });
    */
    console.log("搜索之前的searchResultPages",searchResultPages);

    var mission = wx.cloud.callFunction({
      name: "search",
      data: {
        keyword: keyword,
        searchResultPages: searchResultPages
        //goodAt:goodAt,
        //projectTypes:projectTypes,
      },
      complete: res => {
        console.log("搜索完成", res);
        if (searchCount === that.data.searchCount) {
          console.log("searchCount相等");
          res.result.forEach(each => {
            each.id = that.data.curId;
            that.data.curId++;
          });
          if(this.data.searchResultPages === 0){
            that.setData({
              curId: that.data.curId,
              searchResults: res.result
            });
          }else{
            that.setData({
              curId: that.data.curId,
              searchResults: that.data.searchResults.concat(res.result),
            });
          }
          console.log(that.data.searchResults);
          wx.hideLoading();
          wx.hideNavigationBarLoading();
        }
      }
    });


  },
  tabClick: function(e) {
    console.log(e.currentTarget.id)
    console.log(e.currentTarget.offsetLeft)
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  tap1: function(e) {
    console.log(e)
  },
  _mainFloatingButtonEvent: function(e) {
    console.log("tapMainFloatingButton");
    this.popp();
    if (!app.globalData.isRegistered) {
      wx.navigateTo({
        url: "../startPage",
      })
    } else {
      wx.navigateTo({
        url: "../editProject/editProject",
      })
    }
  },
  onPullDownRefresh: function(e) {
    //如果正在查看搜索项目的话 不要刷新任何东西
    if(this.data.showSearchResults){
      wx.stopPullDownRefresh();
      return;
    }
    //初始化最热的项目
    wx.showNavigationBarLoading();
    this.setData({
      hotProjects: [],
      hotPageNumber: 1,
      latestProjects: [],
      latestPageNumber: 1,
    })
    var that = this;
    const db = wx.cloud.database();
    var promise1 = db.collection("Projects").orderBy("watchedTimes", "desc").get()
    var promise2 = db.collection("Projects").orderBy("createTimeStamp", "desc").get()
    Promise.all([promise1, promise2]).then((results) => {
      console.log("两个都刷新完了", results)
      results.forEach((res) => {
        res.data.forEach(function(item) {
          item.formatTime = util.formatTime(new Date(item.createTimeStamp));
        })
      });
      that.setData({
        hotProjects: results[0].data,
        latestProjects: results[1].data,
      });
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    })
  },
  onShow: function() {
    app.globalData.justShowStartPage = false;
  },
  onReachBottom: function(e) {
    if (this.data.showSearchResults) {
      //在搜索界面的话 把当前的搜索往下进行十发
      wx.showNavigationBarLoading();
      this.setData({
        searchResultPages: this.data.searchResultPages + 1
      });
      wx.showLoading({
        title: '加载中',
        mask:true,
      });
      this.searchKeyword(this.data.inputVal, this.data.searchCount,this.data.searchResultPages);
      //往下搜索一页
      return;
    }
    wx.showNavigationBarLoading();
    var that = this;
    const db = wx.cloud.database();
    console.log("跳过", 20 * that.data.hotPageNumber);
    var promise1 = db.collection("Projects").orderBy("watchedTimes", "desc").skip(20 * that.data.hotPageNumber).get();
    var promise2 = db.collection("Projects").orderBy("createTimeStamp", "desc").skip(20 * that.data.latestPageNumber).get();
    Promise.all([promise1, promise2]).then((results) => {
      console.log("两个都刷新完了", results)
      if (results[0].data.length === 0) {
        //没有更多了
        console.log("没有更多了");
        wx.hideNavigationBarLoading();
        return;
      }
      results.forEach((res) => {
        res.data.forEach(function(item) {
          item.formatTime = util.formatTime(new Date(item.createTimeStamp));
        })
      });
      that.setData({
        hotProjects: that.data.hotProjects.concat(results[0].data),
        hotPageNumber: that.data.hotPageNumber + 1,
        latestProjects: that.data.latestProjects.concat(results[1].data),
        latestPageNumber: that.data.latestPageNumber + 1,
      });
      wx.hideNavigationBarLoading();
    })
  },
  onFocus: function(e) {
    console.log("onFocus");
    //this.setData({
    //  showSearchResults: true,
    //});
  },
  onBlur: function(e) {
    wx.hideLoading();
  },
  clickSearchResult:function(e){
    console.log("点击了搜索项",e);
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    });

  },
  popp: function () {
    //main按钮顺时针旋转
    var animationMain = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out'
    })
    if(!this.data.rotated){
      animationMain.rotateZ(90).step();
      this.setData({
        rotated:true
      })
    }else{
      animationMain.rotateZ(0).step();
      this.setData({
        rotated: false
      })
    }
    this.setData({
      animationMain: animationMain.export(),
    })
  },
  checkButton:function(e){
    console.log("点击了选项按钮",e);
    if(e.currentTarget.dataset.projectType){
      console.log(this.data.projectTypes.indexOf(e.currentTarget.dataset.projectType));
      this.setData({
          inputVal: e.currentTarget.dataset.projectType
      });
      //模拟出一个输入事件 来触发inputTyping事件
      var e = {};
      e.detail = {};
      e.detail.value = this.data.inputVal;
      this.inputTyping(e);
      /*
      this.data.projectTypeItems[this.data.projectTypes.indexOf(e.currentTarget.dataset.projectType)].checked = this.data.projectTypeItems[this.data.projectTypes.indexOf(e.currentTarget.dataset.projectType)].checked ? false : true;
      this.setData({
        projectTypeItems:this.data.projectTypeItems
      })*/
    }else if(e.currentTarget.dataset.goodAt){
      console.log(this.data.goodAt.indexOf(e.currentTarget.dataset.goodAt));
      this.setData({
        inputVal: e.currentTarget.dataset.goodAt
      });
      //模拟出一个输入事件 来触发inputTyping事件
      var e = {};
      e.detail = {};
      e.detail.value = this.data.inputVal;
      this.inputTyping(e);
      /*
      this.data.goodAtItems[this.data.goodAt.indexOf(e.currentTarget.dataset.goodAt)].checked = this.data.goodAtItems[this.data.goodAt.indexOf(e.currentTarget.dataset.goodAt)].checked ? false : true;
      this.setData({
        goodAtItems: this.data.goodAtItems
      })
      */
    }
  }
})