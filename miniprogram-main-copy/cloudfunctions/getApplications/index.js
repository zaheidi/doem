// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-7gqppbth576f837b' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID
  const { status } = event // ✅ 接收前端传过来的 status

  try {
    let query = { _openid: userId }

    // 先取申请列表
    const appsRes = await db.collection('applications')
      .where(query)
      .orderBy('applyTime', 'desc')
      .get()
    const applications = appsRes.data || []

    if (applications.length === 0) {
      return { code: 200, data: [] }
    }

    // 拉取职位信息，构建映射
    const jobIds = Array.from(new Set(applications.map(a => a.jobId).filter(Boolean)))
    let jobsMap = {}
    if (jobIds.length > 0) {
      const batchSize = 20
      for (let i = 0; i < jobIds.length; i += batchSize) {
        const slice = jobIds.slice(i, i + batchSize)
        const jobsRes = await db.collection('jobs').where({ _id: db.command.in(slice) }).get()
        ;(jobsRes.data || []).forEach(j => { jobsMap[j._id] = j })
      }
    }

    // 规范化并合并字段
    const list = applications.map(r => {
      const job = jobsMap[r.jobId] || {}

      // 计算 status
      let computedStatus = 'pending'
      if (r.resultTime) {
        computedStatus = 'completed'
      } else if (r.updateTime) {
        computedStatus = 'processing'
      }

      // ✅ 添加 statusText 字段
      const statusText = {
        pending: '待处理',
        processing: '处理中',
        completed: '已完成'
      }[computedStatus]

      return {
        id: r._id,
        jobId: r.jobId,
        jobTitle: r.jobTitle || job.title || '',
        company: r.company || job.company || '',
        location: r.location || job.location || '',
        status: computedStatus,
        statusText, // ✅ 前端直接显示
        applyDate: r.applyDate || null,
        updateTime: r.updateTime || null,
        resultTime: r.resultTime || null,
        referralInfo: r.referralInfo || '',
        referralContact: r.referralContact || '',
        referralCode: r.referralCode || '',
        remark: r.remark || ''
      }
    })

    // ✅ 根据前端传来的 status 过滤
    let filteredList = list
    if (status && status !== 'all') {
      filteredList = list.filter(a => a.status === status)
    }

    return {
      code: 200,
      data: filteredList
    }
  } catch (e) {
    return { code: 500, message: '获取申请进度失败', error: e }
  }
}
