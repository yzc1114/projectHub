// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var { OPENID, APPID, UNIONID } = cloud.getWXContext();
  const db = cloud.database();
  const _ = db.command;
  console.log(event);
  var request = {
    requestOpenid:OPENID,
    requestProjectId:event.requestProjectId,
    requestTimeStamp:event.requestTimeStamp,
  }

  

  return await db.collection('UserInfos').where({
    openid:event.leaderOpenid,
  }).update({
    data: {
      requests: _.push(request)
    }
  }).then(res=>{
    return db.collection('UserInfos').where({
      openid: OPENID,
    }).update({
      data: {
        myRequestProjects: _.push({
          requestProjectId:event.requestProjectId,
          requestStatus:"requesting",
          requestTimeStamp:event.requestTimeStamp,
        }),
      }
    })
  })
}