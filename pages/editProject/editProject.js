// pages/editProject/editProject.js
var utils = require("../../utils.js");
var app = getApp();

Page({

  data: {
    openType:"",
    projectId:"",
    projectNameInput: "",
    teamMemberNumberInput: "",
    projectDescriptionInput: "",
    projectDescriptionInputLength: 0,
    teamMemberDescriptionInput: "",
    teamMemberDescriptionInputLength: 0,
    showTopTips: false,
    tipMessage: "",
  },

  onLoad: function(options) {
    var that = this;
    if(options.openType === "edit"){
      this.setData({
        openType:options.openType,
        buttonText:"提交修改",
        projectId:options.projectId
      });
      //加载项目的各种信息
      const db = wx.cloud.database();
      const _ = db.command;
      db.collection("Projects").doc(that.data.projectId).get().then(res=>{
        that.setData({
          projectNameInput:res.data.projectName,
          teamMemberNumberInput:res.data.teamMemberNumber,
          projectDescriptionInput:res.data.projectDescription,
          projectDescriptionInputLength:res.data.projectDescription.length,
          teamMemberDescriptionInput:res.data.teamMemberDescription,
          teamMemberDescriptionInputLength:res.data.teamMemberDescription.length,
        });
        console.log("加载数据完毕");
      })
    }else{
      that.setData({
        buttonText: "上传项目"
      })
    }
  },
  
  //提交项目按钮
  finsihButton:function(e){
    var that = this;
    //检查是否合法
    if(this.data.projectNameInput === ""){
      //项目名为空
      this.setData({
        showTopTips:true,
        tipMessage:"项目名不能为空"
      });
      setTimeout(()=>{
        this.setData({
          showTopTips:false
        });
      },3000);
      return;
    } else if (this.data.teamMemberNumberInput === ""){
      //待会检查一下这个值是多少
      this.setData({
        showTopTips: true,
        tipMessage: "队友数量不能为空"
      });
      setTimeout(() => {
        this.setData({
          showTopTips: false
        });
      }, 3000);
      return;
    } else if (this.data.projectDescriptionInput === ""){
      //项目描述为空
      this.setData({
        showTopTips: true,
        tipMessage: "项目描述不能为空"
      });
      setTimeout(() => {
        this.setData({
          showTopTips: false
        });
      }, 3000);
      return;
    } else if (this.data.teamMemberDescriptionInput === ""){
      //队友要求为空
      this.setData({
        showTopTips: true,
        tipMessage: "队友要求不能为空"
      });
      setTimeout(() => {
        this.setData({
          showTopTips: false
        });
      }, 3000);
      return;
    }

    wx.showLoading({
      title: '上传中',
    })

    if(this.data.openType === "edit"){
      //调用云函数更新项目信息
      wx.cloud.callFunction({
        name:"editProject",
        data:{
          projectId:that.data.projectId,
          projectDescription: that.data.projectDescriptionInput,
          projectName: that.data.projectNameInput,
          teamMemberDescription: that.data.teamMemberDescriptionInput,
          teamMemberNumber: that.data.teamMemberNumberInput,
        },
        complete:res=>{
          console.log("更新完毕");
          wx.hideLoading();
          //让之前的页面刷新
          //通过把栈里的页面调出来 给指定数据 来刷新
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2]; //这是前一个页面;
          prevPage.setData({
            projectDescription: that.data.projectDescriptionInput,
            projectName: that.data.projectNameInput,
            teamMemberDescription: that.data.teamMemberDescriptionInput,
            teamMemberNumber: that.data.teamMemberNumberInput,
          })
          wx.navigateBack()
        }
      })
    }else{
      var that = this;
      const db = wx.cloud.database();
      const _ = db.command;
      //获取
      //向项目数据库中添加条目
      db.collection("Projects").add({
        data: {
          leaderOpenid: app.globalData.openid,
          workersOpenid: [],
          projectDescription: that.data.projectDescriptionInput,
          projectName: that.data.projectNameInput,
          teamMemberDescription: that.data.teamMemberDescriptionInput,
          teamMemberNumber: that.data.teamMemberNumberInput,
          createTimeStamp: Date.now(),
          watchedTimes: 0
        },
        success: function (res) {
          wx.hideLoading();
          wx.cloud.callFunction({
            name: "updateUserLeadingProjects",
            data: {
              projectId: res._id
            },
            complete: (res2) => { console.log("updateUserLeadingProjects完毕", res2) }
          })
          console.log("添加项目成功", res);
          wx.navigateBack({});
        },
        fail: function (res) {
          wx.hideLoading();
          wx.showToast({
            title: '添加项目失败',
          })
          console.log("添加项目失败", res);
        }
      })
    }
  },

  onProjectNameInputTyping: function(res) {
    this.setData({
      projectNameInput: res.detail.value,
    })
  },

  onteamMemberNumberInputTyping: function(res) {
    console.log(res.detail);
    this.setData({
      teamMemberNumberInput: res.detail.value,
    })
  },

  onProjectDescriptionInputTyping: function(res) {
    this.setData({
      projectDescriptionInput: res.detail.value,
      projectDescriptionInputLength: res.detail.value.length
    })
  },

  onteamMemberDescriptionInputTyping: function(res) {
    this.setData({
      teamMemberDescriptionInput: res.detail.value,
      teamMemberDescriptionInputLength: res.detail.value.length
    })
  }
})