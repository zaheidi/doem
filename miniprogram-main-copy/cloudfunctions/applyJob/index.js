// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-7gqppbth576f837b' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    const { OPENID } = cloud.getWXContext()
    const { jobId, jobTitle, company, location, aiScore } = event
  
    try {
      const exist = await db.collection('applications').where({
        jobId: jobId,
        userId: OPENID
      }).get()
  
      if (exist.data.length > 0) {
        return { 
          code: 400, 
          message: '系统记录显示您已投递过该职位，无需重复操作。' 
        }
      }
  
      // 正常写入数据库
      await db.collection('applications').add({
        data: {
          jobId,
          userId: OPENID,
          jobTitle,
          company, 
          location,
          aiScore,
          status: 'pending',
          applyDate: db.serverDate()
        }
      })
  
      return { code: 200, message: '申请成功' }
    } catch (e) {
      return { code: 500, message: '服务器异常', error: e }
    }
  }