//getUserProfile
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-7gqppbth576f837b' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID
  try {
    // 获取用户基本信息
    const userRes = await db.collection('users').where({ _openid: userId }).get()
    const userInfo = userRes.data[0] || {}
    // 获取用户发布的职位
    const jobsRes = await db.collection('jobs').where({ 'publisher.openid': userId }).get()
    // 获取用户申请的职位
    const applicationsRes = await db.collection('applications').where({ userId }).get()
    return {
      code: 200,
      data: {
        userInfo,
        publishedJobs: jobsRes.data,
        applications: applicationsRes.data
      }
    }
  } catch (e) {
    return { code: 500, message: '获取用户信息失败', error: e }
  }
} 