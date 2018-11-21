// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var { OPENID, APPID, UNIONID } = cloud.getWXContext();
  const db = cloud.database();
  const _ = db.command;
  return db.collection("UserInfos").where({
    openid:OPENID,
  }).field({
    participatingProjects:true,
  }).get().then(res=>{
    console.log("获得了用户的participatingProjects",res.data[0].participatingProjects);
    var participatingProjects = res.data[0].participatingProjects;
    participatingProjects.splice(participatingProjects.indexOf(event.projectId),1);
    return db.collection("UserInfos").where({
      openid:OPENID
    }).update({
      data:{
        participatingProjects:participatingProjects,
      }
    });
  })
}