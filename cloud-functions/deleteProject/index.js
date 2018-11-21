// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  //要删除项目
  var { OPENID, APPID, UNIONID } = cloud.getWXContext();
  const db = cloud.database();
  const _ = db.command;
  console.log(event);
  //先把workers的participatingProjects删掉
  return db.collection("Projects").doc(event.projectId).get().then(res=>{
    var promises = [];
    res.data.workersOpenid.forEach(workerOpenid=>{
      promises.push(db.collection("UserInfos").where({
        openid:workerOpenid,
      }).field({
        participatingProjects:true
      }).get().then(res=>{
        var participatingProjects = res.data[0].participatingProjects;
        console.log("删除participatingProjects之前",participatingProjects);
        if(participatingProjects.indexOf(event.projectId) !== -1){
          //如果找的到这个项目
          console.log("找到了这个项目");
          participatingProjects.splice(participatingProjects.indexOf(event.projectId), 1);
        }
        console.log("删除participatingProjects之后",participatingProjects);
        return db.collection("UserInfos").where({
          openid:workerOpenid,
        }).update({
          data:{
            participatingProjects:participatingProjects
          }
        })
      }));
    });
    return Promise.all(promises);
  }).then(results=>{
    console.log("全部的workers删除了participatingProjects中的这个project");
    //接下来删除leader的leadingProjects
    return db.collection("UserInfos").where({
      openid:OPENID,
    }).field({
      leadingProjects:true
    }).get().then(res=>{
      var leadingProjects = res.data[0].leadingProjects;
      leadingProjects.splice(leadingProjects.indexOf(event.projectId),1);
      return db.collection("UserInfos").where({
        openid:OPENID,
      }).update({
        data:{
          leadingProjects:leadingProjects,
        }
      });
    });
  }).then(res=>{
    console.log("删除了leader的leadingProjects的project",res);
    //删除这个项目条目
    return db.collection("Projects").doc(event.projectId).remove();
  });
}