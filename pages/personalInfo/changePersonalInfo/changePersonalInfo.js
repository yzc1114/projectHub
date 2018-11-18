// pages/personalInfo/changePersonalInfo/changePersonalInfo.js
var app = getApp()
Page({
  data: {
    showTopTips: false,
    tipMessage: "",
    userNameInput: "",
    userNameIsLegal: true,
    warnClass: "weui-cell_warn",
    noWarnClass: "",
    telNumberInput: "",
    telNumberIsLegal: true,

    sexes: ["男", "女"],
    sexIndex: 0,

    accounts: ["微信号", "QQ", "Email"],
    accountIndex: 0,

    majors: ["软件工程", "电子信息工程"],
    majorIndex: 0,

    grades: ["大一", "大二", "大三", "大四"],
    gradeIndex: 0,
  },
  onLoad: function (options) {
    //TODO:从服务器中获取用户信息 并初始化所有的信息
    const db = wx.cloud.database();
    var that = this;
    db.collection("UserInfos").where({
      openid:app.globalData.openid
    }).get({
      success:function(res){
        console.assert(res.data.length === 1, "ok","openid有重复的?????")
        console.log("修改个人信息界面",res);
        var loadedData = res.data[0];
        var loadName = loadedData.name;
        var loadSexIndex = that.data.sexes.indexOf(loadedData.sex);
        var loadGradeIndex = that.data.grades.indexOf(loadedData.grade);
        var loadTelNumber = loadedData.telNumber;
        var loadMajorIndex = that.data.majors.indexOf(loadedData.major);
        console.log("读取到的信息",loadName,loadSexIndex,loadGradeIndex,loadTelNumber,loadMajorIndex);
        that.setData({
          userNameInput:loadName,
          sexIndex:loadSexIndex,
          gradeIndex:loadGradeIndex,
          majorIndex:loadMajorIndex,
          telNumberInput:loadTelNumber
        })
      }
    })
  },
  editButton: function(e){
    if(!this.checkIfInfoLegal()){
      return;
    }
    //TODO:向服务器传输update的信息
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    //通过云函数更新数据
    wx.cloud.callFunction({
      name:"updateOneUserMessage",
      data:{
        name: that.data.userNameInput,
        sex: that.data.sexes[that.data.sexIndex],
        grade: that.data.grades[that.data.gradeIndex],
        major: that.data.majors[that.data.majorIndex],
        telNumber:that.data.telNumberInput
      },
      success:function(e){
        wx.hideLoading();
        console.log("修改成功",e);
        wx.showToast({
          title: '修改成功！',
        });
        wx.navigateBack({})
      },
      fail:function(e){
        wx.hideLoading();
        console.log("修改失败", e);
      }
    })
  },
  checkIfInfoLegal() {
    var userName = this.data.userNameInput;
    var telNumber = this.data.telNumberInput;
    var phonetel = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    var name = /^[\u4e00-\u9fa5]+$/;
    if (userName == '') {
        this.setData({
          showTopTips: true,
          tipMessage: "用户名不能为空",
          userNameIsLegal: false
        })
        return false
    } else if (telNumber == '') {
        this.setData({
          showTopTips: true,
          tipMessage: "手机号不能为空",
          telNumberIsLegal: false
        })
        return false
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
    }
    return true;
  },


  showTopTips: function () {
    var that = this;
    this.setData({
      showTopTips: true
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },
  bindSexChange: function (e) {
    console.log('picker country 发生选择改变，携带值为', e.detail.value);

    this.setData({
      sexIndex: e.detail.value
    })
  },
  bindMajorChange: function (e) {
    console.log('picker country 发生选择改变，携带值为', e.detail.value);

    this.setData({
      majorIndex: e.detail.value
    })
  },
  bindGradeChange: function (e) {
    console.log('picker account 发生选择改变，携带值为', e.detail.value);

    this.setData({
      gradeIndex: e.detail.value
    })
  },
  userNameInputTyping: function (e) {
    this.setData({
      userNameInput: e.detail.value
    })
  },
  telNumberInputTyping: function (e) {
    this.setData({
      telNumberInput: e.detail.value
    })
  }

})