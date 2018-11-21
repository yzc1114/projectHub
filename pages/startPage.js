const app = getApp()
const systemInfo = wx.getSystemInfoSync()
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showTopTips: false,
    tipMessage: "",
    userNameInput: "",
    userNameIsLegal: true,
    warnClass: "weui-cell_warn",
    noWarnClass: "",
    telNumberInput: "",
    telNumberIsLegal: true,
    addUserInfoOver: false,

    sexes: ["男", "女"],
    sexIndex: 0,

    accounts: ["微信号", "QQ", "Email"],
    accountIndex: 0,

    majors: ["软件工程", "电子信息工程"],
    majorIndex: 0,

    grades: ["大一", "大二", "大三", "大四"],
    gradeIndex: 0,

    isAgree: false
  },
  getUserInfo: function(e) {
    if (!this.checkIfInfoLegal()) {
      return;
    }
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //若第二次点击按钮 不会触发注册事件
    if (app.globalData.isRegistered === false) {
      var that = this;
      console.log("add操作即将开始");
      const db = wx.cloud.database();
      const _ = db.command;
      console.log("userNameInput:", that.data.userNameInput)
      console.log("准备add操作")
      app.globalData.isRegistered = true;
      db.collection("UserInfos").add({
        data: {
          name: that.data.userNameInput,
          sex: that.data.sexes[that.data.sexIndex],
          grade: that.data.grades[that.data.gradeIndex],
          major: that.data.majors[that.data.majorIndex],
          openid: app.globalData.openid,
          participatingProjects: [],
          collectedProjects: [],
          telNumber: that.data.telNumberInput,
          leadingProjects: [],
          requests: [],
          myRequestProjects: [],
          avatarUrl:"",
          leftMessages:[],
          hasNewParticipatingProjects:false,
          hasNewMessages:false,
        },
        success: function(E) {
          //可以优化 之后再说啊 别忘了
          that.setData({
            addUserInfoOver: true
          })
          wx.cloud.callFunction({
            name: "getUserInfoWithOpenId",
            complete: res => {
              console.assert(res.result.data.length === 1, "返回数据正常", "有多条数据有相同的openid???");
              if (res.result.data.length === 1) {
                app.globalData.userInfoWithOpenId = res.result.data[0];
                console.log(res.result.data[0]);
              }
              wx.hideLoading();
              console.log("添加成功")
            }
          })
        },
        fail: function(e) {
          wx.hideLoading();
          console.log("添加失败", e);
        }
      });
    }

    var that = this;
    //获取微信用户的个人信息
    wx.getUserInfo({
      complete: function(res) {
        console.log("在注册页面", res);
        if (res.errMsg === "getUserInfo:fail auth deny") {
          that.setData({
            userInfo: null,
            hasUserInfo: false,
          })
          wx.showModal({
            title: '提示',
            content: '请您打开授权，否则无法正常使用该小程序',
            showCancel: false
          });
          return;
        }
        app.globalData.userInfo = res.userInfo;
        //等待用户信息注册完毕
        //设置周期执行函数 每次检查是否注册完毕 若注册完毕了 就把头像的地址传到个人信息数据库中
        //不传nickName因为没有用
        var timer = setInterval(function() {
          if (that.data.addUserInfoOver !== false) {
            wx.cloud.callFunction({
              name:"updateUserAvatarUrl",
              data:{
                avatarUrl:res.userInfo.avatarUrl,
              },
              success:res=>{
                console.log("上传头像url成功",res);
                clearInterval(timer);
              },
              fail:res=>{
                console.log("上传头像url失败",res);
                clearInterval(timer);
              }
            })
          }
        }, 500);
        
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        wx.switchTab({
          //只有获得授权之后才可以进入index
          url: './index/index'
        })
      }
    })
  },
  onLoad: function(options) {
    app.globalData.justShowStartPage = true;
  },
  checkIfInfoLegal() {
    var userName = this.data.userNameInput;
    var telNumber = this.data.telNumberInput;
    var phonetel = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    var name = /^[\u4e00-\u9fa5]+$/;
    if (userName == '') {
      this.setData({
        showTopTips: true,
        tipMessage: "姓名不能为空",
        userNameIsLegal: false
      })
      return false;
    } else if (telNumber == '') {
      this.setData({
        showTopTips: true,
        tipMessage: "手机号不能为空",
        telNumberIsLegal: false
      })
      return false;
    } else if (telNumber.length != 11) {
      this.setData({
        showTopTips: true,
        tipMessage: "手机号长度有误",
        telNumberIsLegal: false
      })
      return false;
    }

    var myreg = /^1\d{10}$/;
    if (!myreg.test(telNumber)) {
      this.setData({
        showTopTips: true,
        tipMessage: "手机号有误",
        telNumberIsLegal: false
      })
      return false;
    }
    if (!name.test(userName)) {
      this.setData({
        showTopTips: true,
        tipMessage: "姓名必须为中文",
        userNameIsLegal: false
      })
      return false;
    }
    return true;
  },


  showTopTips: function() {
    var that = this;
    this.setData({
      showTopTips: true
    });
    setTimeout(function() {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },
  bindSexChange: function(e) {
    console.log('picker country 发生选择改变，携带值为', e.detail.value);

    this.setData({
      sexIndex: e.detail.value
    })
  },
  bindMajorChange: function(e) {
    console.log('picker country 发生选择改变，携带值为', e.detail.value);

    this.setData({
      majorIndex: e.detail.value
    })
  },
  bindGradeChange: function(e) {
    console.log('picker account 发生选择改变，携带值为', e.detail.value);

    this.setData({
      gradeIndex: e.detail.value
    })
  },
  userNameInputTyping: function(e) {
    this.setData({
      userNameInput: e.detail.value
    })
  },
  telNumberInputTyping: function(e) {
    this.setData({
      telNumberInput: e.detail.value
    })
  }
})