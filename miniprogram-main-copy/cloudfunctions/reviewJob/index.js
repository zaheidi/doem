// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
const db = cloud.database()

exports.main = async (event, context) => {
    const { jobId, action, reason , reviewerName} = event;
    
    // ⭐️ 关键点：将前端传来的 'approve'/'reject' 映射回数据库字段内容
    const targetStatus = action === 'approve' ? '已发布' : '已驳回';
  
    try {
      return await db.collection('jobs').doc(jobId).update({
        data: {
          status: targetStatus,       // 更新状态字段
          reviewerReason: reason || '',
          reviewerName: reviewerName,
          reviewTime: db.serverDate()
        }
      });
    } catch (e) {
      return e;
    }
  }