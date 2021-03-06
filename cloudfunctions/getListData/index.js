const cloud = require('wx-server-sdk')

// 按照年月筛选  “2021-09”   首页
cloud.init()
const db = cloud.database()
const MAX_LIMIT = 100
exports.main = async (event, context) => {
  console.log("getListData", event)
  let { OPENID, APPID, UNIONID } = cloud.getWXContext()
  // 先取出集合记录总数
  const countResult = await db.collection('priveTable').count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('priveTable').orderBy('createdTime', 'desc').where({
      _openid: OPENID,
      timeDaty: event.timeDaty
    }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}