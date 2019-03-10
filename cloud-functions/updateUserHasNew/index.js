// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var { OPENID, APPID, UNIONID } = cloud.getWXContext();
  const db = cloud.database();
  const _ = db.command;
  console.log(event);
  if(event.hasNewMessages === false){
    //如果是查看了消息列表
    return db.collection("UserInfos").where({
      _openid:OPENID,
    }).update({
      data:{
        hasNewMessages: event.hasNewMessages,
      }
    });
  }else if(event.hasNewParticipatingProjects === false){
    //如果是查看了参加的项目列表
    return db.collection("UserInfos").where({
      _openid:OPENID
    }).update({
      data:{
        hasNewParticipatingProjects: event.hasNewParticipatingProjects,
      }
    })
  }else if(event.hasNewRequest === false){
    return db.collection("UserInfos").where({
      _openid: OPENID
    }).update({
      data: {
        hasNewRequest: event.hasNewRequest,
      }
    })
  }
}