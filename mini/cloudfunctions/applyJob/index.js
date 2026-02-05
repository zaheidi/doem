// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-7gqppbth576f837b' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID
  const { jobId, ...rest } = event
  try {
    // 检查是否已申请
    const exist = await db.collection('applications').where({ jobId, userId }).get()
    if (exist.data && exist.data.length > 0) {
      return { code: 400, message: '您已申请过该职位' }
    }
    // 创建申请记录
    const application = {
      jobId,
      userId,
      status: 'pending',
      applyDate: db.serverDate(),
      ...rest
    }
    await db.collection('applications').add({ data: application })
    return { code: 200, message: '申请成功' }
  } catch (e) {
    return { code: 500, message: '申请失败', error: e }
  }
} 