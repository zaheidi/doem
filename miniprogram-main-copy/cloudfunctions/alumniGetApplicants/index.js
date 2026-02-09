// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'cloud1-7gqppbth576f837b' }) // 使用当前云环境


const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate // 获取聚合操作符

/**
 * 功能：校友查看投递自己职位的学生列表及老师评价
 */
exports.main = async (event, context) => {
    const { OPENID: realOpenID } = cloud.getWXContext()
    const OPENID = event.mockOpenID || realOpenID

  try {
    // 使用聚合查询实现三表关联：applications -> jobs -> students
    const result = await db.collection('applications').aggregate()
      // 1. 关联职位表，确认该投递属于哪个职位
      .lookup({
        from: 'jobs',
        localField: 'jobId',
        foreignField: '_id',
        as: 'jobDetail'
      })
      .unwind('$jobDetail') // 将数组展开为对象

      // 2. 关键过滤：仅筛选出由当前校友（OPENID）发布的职位收到的投递
      .match({
        'jobDetail.status': '已发布', 
        'jobDetail._openid': OPENID 
      })

      // 3. 关联学生表，获取学生基本信息和老师评价
      .lookup({
        from: 'students',
        localField: 'userId',
        foreignField: '_id',
        as: 'studentDetail'
      })
      .unwind('$studentDetail')

      // 4. 按投递时间倒序排列（最新的在前面）
      .sort({
        applyTime: -1
      })
      
      // 5. 格式化输出字段（可选，保护隐私）
      .project({
        _id: 1,
        applyTime: 1,
        status: 1,
        'jobDetail.title': 1,
        'studentDetail.name': 1,
        'studentDetail.major': 1,
        'studentDetail.avatarUrl': 1,
        'studentDetail.teacherEvaluation': 1, // 老师评价内容
        'studentDetail.evaluatorName': 1,     // 评价老师姓名
        'studentDetail.phone': 1              // 联系方式
      })
      .end()

    return {
      code: 200,
      data: result.list,
      msg: '获取成功'
    }
  } catch (err) {
    console.error('查询投递列表失败：', err)
    return {
      code: 500,
      msg: '服务器内部错误',
      error: err
    }
  }
}