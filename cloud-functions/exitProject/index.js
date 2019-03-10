// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var OPENID = event.openid;
  const db = cloud.database();
  const _ = db.command;
  return db.collection("UserInfos").where({
    openid:OPENID,
  }).field({
    participatingProjects:true,
  }).get().then(res=>{
    console.log("获得了用户的participatingProjects",res.data[0].participatingProjects);
    var participatingProjects = res.data[0].participatingProjects;
    while (participatingProjects.indexOf(event.projectId) !== -1){
      participatingProjects.splice(participatingProjects.indexOf(event.projectId), 1);
    }
    return db.collection("UserInfos").where({
      openid:OPENID
    }).update({
      data:{
        participatingProjects:participatingProjects,
      }
    });
  }).then(()=>{
    //在项目中删除这个人的workerOpenid
    return db.collection("Projects").doc(event.projectId).field({
      workersOpenid:true,
    }).get();
  }).then(res=>{
    var workersOpenids = res.data.workersOpenid;
    while(workersOpenids.indexOf(OPENID) !== -1){
      workersOpenids.splice(workersOpenids.indexOf(event.projectId), 1);
    };
    return db.collection("Projects").doc(event.projectId).update({
      data: {
        workersOpenid: workersOpenids,
      }
    });
  })
}