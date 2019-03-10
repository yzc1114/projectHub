// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  const db = cloud.database();
  const _ = db.command;
  var results = [];
  console.log(event.projectTypes);
  var searchProjectsDependsOnName = db.collection("Projects").where({
    projectName: new db.RegExp({
      regexp: "^.*" + event.keyword + ".*$",
      options: "i",
    }),
    //projectType: _.in(event.projectTypes),
  }).field({
    projectId: true,
    projectName: true,
    projectDescription: true,
    teamMemberNumber: true,
    workersOpenid: true,
    projectType: true,
    projectProgress: true,
    watchedTimes:true,
    }).orderBy("watchedTimes","desc").skip(10 * event.searchResultPages).limit(10).get().then(res => {
    console.log("搜索projects有结果", res);
    res.data.forEach(each => {
      each.isProject = true;
      if (results.indexOf(each) === -1) {
        results.push(each); //保证不会重复加入同一个项目
      }
    });
    return "ok";
  });
  var searchProjectsDependsOnType = db.collection("Projects").where({
    //projectType: new db.RegExp({
    //  regexp: "^.*" + event.keyword + ".*$",
    //  options: "i",
    //}),
    projectType: new db.RegExp({
      regexp: "^.*" + event.keyword + ".*$",
      options: "i"}),
  }).field({
    projectId: true,
    projectName: true,
    projectDescription: true,
    teamMemberNumber: true,
    workersOpenid: true,
    projectType: true,
    projectProgress: true,
    }).orderBy("watchedTimes", "desc").skip(10 * event.searchResultPages).limit(10).get().then(res => {
    console.log("通过type搜索projects有结果", res);
    res.data.forEach(each => {
      each.isProject = true;
      if (results.indexOf(each) === -1) {
        results.push(each); //保证不会重复加入同一个项目
      }
    });
    return "ok";
  });
  var searchPersonDependsOnName = db.collection("UserInfos").where({
    nickName: new db.RegExp({
      regexp: "^.*" + event.keyword + ".*$",
      options: "i",
    }),
    hasIntentToDoProject: true
  }).field({
    openid: true,
    avatarUrl: true,
    name:true,
    nickName: true,
    goodAt: true,
    }).skip(10 * event.searchResultPages).limit(10).get().then(res => {
    console.log("搜索users有结果", res);
    res.data.forEach(each => {
      /*
      var IWantU = false;
      if (each.goodAt) {
        each.goodAt.forEach(eachGoodAt => {
          if (event.goodAt.indexOf(eachGoodAt) !== -1) {
            IWantU = true;
          }
        })
        if (IWantU) {
          each.isUser = true;
          if (results.indexOf(each) === -1) {
            results.push(each); //保证不会重复加入同一个人
          }
        }
      }*/
      each.isUser = true;
      if (results.indexOf(each) === -1) {
        results.push(each); //保证不会重复加入同一个人
      }
    })
    return "ok";
  });
  var searchPersonDependsOnMajor = db.collection("UserInfos").where({
    major: new db.RegExp({
      regexp: "^.*" + event.keyword + ".*$",
      options: "i",
    }),
    hasIntentToDoProject: true
  }).field({
    openid: true,
    avatarUrl: true,
    name: true,
    nickName:true,
    goodAt: true,
    }).skip(10 * event.searchResultPages).limit(10).get().then(res => {
    console.log("搜索users有结果", res);
    res.data.forEach(each => {
      /*
      var IWantU = false;
      if (each.goodAt) {
        each.goodAt.forEach(eachGoodAt => {
          if (event.goodAt.indexOf(eachGoodAt) !== -1) {
            IWantU = true;
          }
        })
        if (IWantU) {
          each.isUser = true;
          if (results.indexOf(each) === -1) {
            results.push(each); //保证不会重复加入同一个人
          }
        }
      }*/
      each.isUser = true;
      if (results.indexOf(each) === -1) {
        results.push(each); //保证不会重复加入同一个人
      }
    })
    return "ok";
  });
  var searchPersonDependsOnGoodAt = db.collection("UserInfos").where({
    goodAt: new db.RegExp({
      regexp: "^.*" + event.keyword + ".*$",
      options: "i",
    }),
    hasIntentToDoProject: true
  }).field({
    openid: true,
    avatarUrl: true,
    name: true,
    nickName: true,
    goodAt: true,
    }).skip(10 * event.searchResultPages).limit(10).get().then(res => {
    console.log("搜索users有结果", res);
    res.data.forEach(each => {
      /*
      var IWantU = false;
      if (each.goodAt) {
        each.goodAt.forEach(eachGoodAt => {
          if (event.goodAt.indexOf(eachGoodAt) !== -1) {
            IWantU = true;
          }
        })
        if (IWantU) {
          each.isUser = true;
          if (results.indexOf(each) === -1) {
            results.push(each); //保证不会重复加入同一个人
          }
        }
      }*/
      each.isUser = true;
      if (results.indexOf(each) === -1) {
        results.push(each); //保证不会重复加入同一个人
      }
    })
    return "ok";
  });
  return Promise.all([searchProjectsDependsOnName, searchProjectsDependsOnType,searchPersonDependsOnName, searchPersonDependsOnMajor]).then(finsih => {
    console.log("结束", finsih);
    //
    //results.push(event.keyword);
    //
    return results;
  })

}