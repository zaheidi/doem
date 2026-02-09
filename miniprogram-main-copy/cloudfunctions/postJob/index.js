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
      // --- 1. 获取审核老师池 ---
      const teacherRes = await db.collection('teachers').get()
      const teachers = teacherRes.data
  
      if (!teachers || teachers.length === 0) {
        return { code: 400, message: '系统暂无审核老师，请联系管理员添加' }
      }
  
      // --- 2. 执行随机分配逻辑 ---
      const randomIndex = Math.floor(Math.random() * teachers.length)
      const selectedTeacher = teachers[randomIndex]
  
      // --- 3. 组装数据并入库 ---
      jobData['publisher'] = jobData['publisher'] || {}
      jobData['publisher'].openid = userId
      jobData['createTime'] = db.serverDate()
      
      // 强制设置状态为待审核
      jobData['status'] = 'pending' 
      // 绑定随机分配的老师信息
      jobData['reviewerId'] = selectedTeacher._id 
      jobData['reviewerName'] = selectedTeacher.name
  
      const res = await db.collection('jobs').add({ data: jobData })
      
      return { 
        code: 200, 
        message: '职位已提交审核', 
        id: res._id,
        assignedTo: selectedTeacher.name // 反馈给前端是哪位老师审核
      }
    } catch (e) {
      return { code: 500, message: '发布失败', error: e }
    }
  }