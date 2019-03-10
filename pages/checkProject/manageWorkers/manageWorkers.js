
Page({
  data: {
    workersInfos:[],
    deleteWorking:false,
    projectId:"",
    prevPage:{},
  },
  onLoad: function (options) {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    this.setData({
      prevPage:prevPage,
      workersInfos: prevPage.data.workersInfos,
      projectId:prevPage.data.projectId,
    });
    for(let i = 0;i<this.data.workersInfos.length;i++){
      this.data.workersInfos[i].id = i;
    }
    this.setData({
      workersInfos:this.data.workersInfos,
    })
    console.log(this.data.workersInfos);
    
  },
  deleteWorker:function(e){
    //删除队员
    console.log("点击了删除队员",e);
    var worker = this.data.workersInfos[e.currentTarget.dataset.id];
    wx.showNavigationBarLoading();
    var that = this;
    that.setData({
      deleteWorking:true,
    });
    wx.cloud.callFunction({
      name:"exitProject",
      data:{
        projectId:that.data.projectId,
        openid:worker.openid,
      },
      complete:res=>{
        console.log("删除完事儿",res);
        let i = -1;
        while((i = that.data.workersInfos.indexOf(worker)) !== -1){
          that.data.workersInfos.splice(i,1);
        }
        that.setData({
          workersInfos:that.data.workersInfos,
        });
        that.data.prevPage.setData({
          workersInfos: that.data.workersInfos,
        })
        wx.hideNavigationBarLoading();
        that.setData({
          deleteWorking:false,
        });
      }
    })
  }
})