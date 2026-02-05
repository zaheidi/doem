// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-7gqppbth576f837b' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { applicationId, status, remark } = event
  try {
    await db.collection('applications').doc(applicationId).update({
      data: {
        status,
        remark: remark || '',
        updateTime: db.serverDate()
      }
    })
    return { code: 200, message: '状态更新成功' }
  } catch (e) {
    return { code: 500, message: '状态更新失败', error: e }
  }
} 