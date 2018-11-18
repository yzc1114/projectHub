// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  var usernameToBeChecked = event.username;
  const db = cloud.database();
  const _ = db.command;
  console.log(usernameToBeChecked)
  return await db.collection('UserInfos').where({
    // gt 方法用于指定一个 "大于" 条件，此处 _.gt(30) 是一个 "大于 30" 的条件
    name: _.eq(usernameToBeChecked)
  }).get();/*then(res=>{
    if(res.data.length > 0){
      console.log("isOccupied");
      var isOccupied = true;
      return new Promise((resolve, reject) => {
        
      })
      return {isOccupied};
    }else{
      var isOccupied = false;
      return isOccupied;
    }
  })*/
}