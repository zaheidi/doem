// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-7gqppbth576f837b' })
const db = cloud.database()

exports.main = async (event, context) => {
  const { pageNum = 1, pageSize = 10 } = event
  const skip = (pageNum - 1) * pageSize


// 修改后的 formatDate 函数
const formatDate = (date) => {
    console.log('Raw date value:', date); // 调试输出原始值
    try {
      if (!date) return '';
      let d;
      if (date instanceof Date) {
        d = date;
      } else if (date.toDate) {
        // 处理云数据库的 Timestamp 类型
        d = date.toDate();
      } else {
        // 处理字符串或数字时间戳
        d = new Date(date);
      }
      if (isNaN(d.getTime())) {
        console.warn('Invalid date detected:', date);
        return '';
      }
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Date formatting error:', e);
      return '';
    }
  }

  try {
    const res = await db.collection('jobs')
      .orderBy('createTime', 'desc') 
      .skip(skip)
      .limit(pageSize)
      .get()

    const list = res.data.map(item => ({
      id: item._id,
      title: item.title,
      salary: item.salary,
      company: item.company,
      location: item.location,
      date: formatDate(item.createTime), 
      tags: item.tags || [],
      publisher: item.publisher ? item.publisher : { name: item.publisherName || '未知', tag: item.publisherType || '' }, 
      reviewer: item.reviewer ? item.reviewer : null,
      likeCount: item.likeCount || 0
    }))

    return { code: 200, data: list }
  } catch (e) {
    console.error('云函数报错:', e)
    return { code: 500, message: '获取失败', error: e }
  }
}
