// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const _ = db.command;
  console.log("项目id为",event.projectId);
  return db.collection("Projects").doc(event.projetcId).update({
    data:{
      watchedTimes:_.inc(1),
    }
  })
}