// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-7gqppbth576f837b' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID
  const jobData = event
  try {
    // 添加发布人openid
    jobData['publisher'] = jobData['publisher'] || {}
    jobData['publisher'].openid = userId
    jobData['createTime'] = db.serverDate()
    const res = await db.collection('jobs').add({ data: jobData })
    return { code: 200, message: '发布成功', id: res._id }
  } catch (e) {
    return { code: 500, message: '发布失败', error: e }
  }
} 