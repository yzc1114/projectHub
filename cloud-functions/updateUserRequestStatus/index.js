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
    openid: _.eq(event.requestOpenid)
  }).get().then(res=>{
    var requests = res.data[0].myRequestProjects;
    console.log(requests);
    for(let i = 0;i<requests.length;i++){
      if(!requests[i]){
        continue;
      }
      //找到申请人申请的该项目 把状态修改为event给的状态
      if (requests[i].requestProjectId === event.requestProjectId
      && requests[i].requestTimeStamp === event.requestTimeStamp) {
        requests[i].requestStatus = event.status;
        break;
      }
    }
    console.log("准备修改申请状态了");
    if(event.status === "agreed"){
      return db.collection('UserInfos').where({
        openid: _.eq(event.requestOpenid)
      }).update({
        data: {
          myRequestProjects: requests,
          participatingProjects:_.push(event.requestProjectId),
          //让被申请人直到自己有新参与的项目了
          hasNewParticipatingProjects:true,
        }
      })
    }else{
      return db.collection('UserInfos').where({
        openid: _.eq(event.requestOpenid)
      }).update({
        data: {
          myRequestProjects: requests,
        }
      })
    }
  }).then(res=>{
    console.log("修改完申请状态了");
    if(event.status === "agreed"){
      console.log("准备更新项目中的workers");
      return db.collection("Projects").doc(event.requestProjectId).update({
        data: {
          workersOpenid: _.push(event.requestOpenid),
        }
      })
    }else{
      console.log("不更新workers");
      return res;
    }
  }).then(res=>{
    //将发起人中的被申请信息删除
    return db.collection("UserInfos").where({
      openid:OPENID,
    }).field({
      requests:true,
    }).get()
  }).then(res=>{
    var requests = res.data[0];
    console.log("获得的requests",requests);
    var newRequests = [];
    for(let i = 0;i<requests.length;i++){
      if(requests[i]){ //确保不会是傻逼null
        if(requests[i].requestOpenid === event.requestOpenid
        && requests[i].requestProjectId === event.requestProjectId){
          continue;
        }else{
          newRequests.push(requests[i]);
        }
      }
    }
    return db.collection("UserInfos").where({
      openid:OPENID
    }).update({
      data:{
        requests:newRequests
      }
    })
  })
}