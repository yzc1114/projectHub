// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const _ = db.command;
  return db.collection("Projects").doc(event.projectId).update({
    data:{
      projectName:event.projectName,
      teamMemberNumber:event.teamMemberNumber,
      projectDescription:event.projectDescription,
      teamMemberDescription:event.teamMemberDescription,
      projectProgress: event.projectProgress,
      projectType: event.projectType,
      deadline:event.deadline,
    }
  });
}