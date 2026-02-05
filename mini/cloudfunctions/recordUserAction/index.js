// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-7gqppbth576f837b' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID
  const { jobId, action, time } = event
  try {
    await db.collection('userActions').add({
      data: {
        userId,
        jobId,
        action,
        time: time || new Date(),
        createTime: db.serverDate()
      }
    })
    return { code: 200, message: '记录成功' }
  } catch (e) {
    return { code: 500, message: '记录失败', error: e }
  }
} 