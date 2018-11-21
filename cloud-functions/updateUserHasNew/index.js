// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var { OPENID, APPID, UNIONID } = cloud.getWXContext();
  const db = cloud.database();
  const _ = db.command;
  console.log(event);
  if(event.hasNewMessages){
    //如果是查看了消息列表
    return db.collection("UserInfos").where({
      _openid:OPENID,
    }).update({
      hasNewMessages:event.hasNewMessages,
    });
  }else if(event.hasNewParticipatingProjects){
    //如果是查看了参加的项目列表
    return db.collection("UserInfos").where({
      _openid:OPENID
    }).update({
      hasNewParticipatingProjects:event.hasNewParticipatingProjects,
    })
  }
}