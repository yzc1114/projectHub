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
    studentIdInput: "",
    studentIdIsLegal: true,

    sexes: ["男", "女"],
    sexIndex: 0,

    accounts: ["微信号", "QQ", "Email"],
    accountIndex: 0,

    majors: ["软件学院",
      "电子信息工程学院",
      "汽车学院",
      "机械与能源工程学院",
      "材料科学与工程学院",
      "环境科学与工程学院",
      "测绘与地理信息学院",
      "土木工程学院",
      "建筑与城市规划学院",
      "设计与艺术学院",
      "交通运输工程学院",
      "铁道与城市轨道交通研究院",
      "中德学院",
      "外国语学院",
      "理学部",
      "生命科学与技术学院",
      "医学院",
      "人文学院",
      "政治与国际关系学院",
      "法学院",
      "马克思主义学院",
      "经济与管理学院"
    ].sort(),
    majorIndex: 0,

    grades: ["大一", "大二", "大三", "大四", "大五", "研究生", "博士"],
    gradeIndex: 0,

    intents: ["有", "无"],
    intentIndex: 0,

    goodAt: ["设计", "编程", "测试", "策划", "美工", "文案"],
    goodAtItems: [{
        name: '设计',
        value: '0',
        checked: false
      },
      {
        name: '编程',
        value: '1',
        checked: false
      },
      {
        name: '测试',
        value: '2',
        checked: false
      },
      {
        name: '策划',
        value: '3',
        checked: false
      },
      {
        name: '美工',
        value: '4',
        checked: false
      },
      {
        name: '文案',
        value: '5',
        checked: false
      },
    ],
  },
  onLoad: function(options) {
    //TODO:从服务器中获取用户信息 并初始化所有的信息
    const db = wx.cloud.database();
    var that = this;
    db.collection("UserInfos").where({
      openid: app.globalData.openid
    }).field({
      sex: true,
      grade: true,
      name: true,
      telNumber: true,
      major: true,
      hasIntentToDoProject: true,
      goodAt: true,
      studentId: true,
    }).get({
      success: function(res) {
        console.log("修改个人信息界面", res);
        var loadedData = res.data[0];
        var loadName = loadedData.name;
        var loadSexIndex = that.data.sexes.indexOf(loadedData.sex);
        var loadGradeIndex = that.data.grades.indexOf(loadedData.grade);
        var loadTelNumber = loadedData.telNumber;
        var loadMajorIndex = that.data.majors.indexOf(loadedData.major);
        var loadIntentIndex = loadedData.hasIntentToDoProject ? 0 : 1;
        var loadGoodAt = loadedData.goodAt;
        var loadStudentId = loadedData.studentId;
        loadGoodAt.forEach(each => {
          that.data.goodAtItems[that.data.goodAt.indexOf(each)].checked = true;
        });
        console.log("读取到的信息", loadName, loadSexIndex, loadGradeIndex, loadTelNumber, loadMajorIndex);
        that.setData({
          userNameInput: loadName,
          sexIndex: loadSexIndex,
          gradeIndex: loadGradeIndex,
          majorIndex: loadMajorIndex,
          telNumberInput: loadTelNumber,
          intentIndex: loadIntentIndex,
          goodAtItems: that.data.goodAtItems,
          studentIdInput: loadStudentId,
        });
      }
    })
  },
  editButton: function(e) {
    if (!this.checkIfInfoLegal()) {
      return;
    }
    //TODO:向服务器传输update的信息
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    var goodAtItems = that.data.goodAtItems;
    var filtedGoodAtItems = goodAtItems.filter(each => {
      if (each.checked) {
        return true;
      } else return false;
    });
    var goodAt = [];
    filtedGoodAtItems.forEach(each => {
      goodAt.push(each.name);
    })

    //通过云函数更新数据
    wx.cloud.callFunction({
      name: "updateOneUserMessage",
      data: {
        name: that.data.userNameInput,
        sex: that.data.sexes[that.data.sexIndex],
        grade: that.data.grades[that.data.gradeIndex],
        major: that.data.majors[that.data.majorIndex],
        telNumber: that.data.telNumberInput,
        studentId: that.data.studentIdInput,
        goodAt: goodAt,
      },
      success: function(e) {
        wx.hideLoading();
        console.log("修改成功", e);
        wx.showToast({
          title: '修改成功！',
        });
        wx.navigateBack({})
      },
      fail: function(e) {
        wx.hideLoading();
        console.log("修改失败", e);
      }
    })
  },
  checkIfInfoLegal() {
    var userName = this.data.userNameInput;
    var telNumber = this.data.telNumberInput;
    var studentId = this.data.studentIdInput;
    var phonetel = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    var name = /^[\u4e00-\u9fa5]+$/;
    if (userName == '') {
      this.setData({
        showTopTips: true,
        tipMessage: "用户名不能为空",
        userNameIsLegal: false
      })
      setTimeout(() => {
        this.setData({
          showTopTips: false
        });
      }, 3000);
      return false
    } else if (telNumber == '') {
      this.setData({
        showTopTips: true,
        tipMessage: "手机号不能为空",
        telNumberIsLegal: false
      })
      setTimeout(() => {
        this.setData({
          showTopTips: false
        });
      }, 3000);
      return false
    } else if (telNumber.length != 11) {
      this.setData({
        showTopTips: true,
        tipMessage: "手机号长度有误",
        telNumberIsLegal: false
      })
      setTimeout(() => {
        this.setData({
          showTopTips: false
        });
      }, 3000);
      return false;
    }

    var myreg = /^1\d{10}$/;
    if (!myreg.test(telNumber)) {
      this.setData({
        showTopTips: true,
        tipMessage: "手机号有误",
        telNumberIsLegal: false
      });
      setTimeout(() => {
        this.setData({
          showTopTips: false
        });
      }, 3000);
      return false;
    }
    myreg = /^\d{7}$/;
    if (!myreg.test(studentId)) {
      this.setData({
        showTopTips: true,
        tipMessage: "学号应为7位",
        studentIdIsLegal: false
      });
      setTimeout(() => {
        this.setData({
          showTopTips: false
        });
      }, 3000);
      return false;
    }
    if (!name.test(userName)) {
      this.setData({
        showTopTips: true,
        tipMessage: "姓名必须为中文",
        userNameIsLegal: false
      });
      setTimeout(() => {
        this.setData({
          showTopTips: false
        });
      }, 3000);
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
  bindIntentChange: function(e) {
    console.log('picker account 发生选择改变，携带值为', e.detail.value);

    this.setData({
      intentIndex: e.detail.value
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
  },
  studentIdInputTyping: function (e) {
    this.setData({
      studentIdInput: e.detail.value
    });
  },
  checkboxChange: function(e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);

    var checkboxItems = this.data.goodAtItems,
      values = e.detail.value;
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;

      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          break;
        }
      }
    }

    this.setData({
      goodAtItems: checkboxItems
    });
  },

})