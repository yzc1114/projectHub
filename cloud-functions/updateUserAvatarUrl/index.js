// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var { OPENID, APPID, UNIONID } = cloud.getWXContext();
  const db = cloud.database();
  const _ = db.command;
  console.log(event);
  return await db.collection('UserInfos').where({
    openid: _.eq(OPENID)
  }).update({
    data: {
      avatarUrl: event.avatarUrl,
      nickName: event.nickName,
    }
  });
}