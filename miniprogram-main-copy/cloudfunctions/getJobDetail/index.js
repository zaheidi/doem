// getJobDetail/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: 'cloud1-7gqppbth576f837b' });
const db = cloud.database();

const formatDate = (date) => {
    try {
      if (!date) return '未知时间';
      // 兼容处理：如果是云数据库的时间对象，转换为 JS Date
      const d = new Date(date);
      if (isNaN(d.getTime())) return '时间格式错误'; 
      
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    } catch (err) {
      return '时间解析失败';
    }
  };

exports.main = async (event, context) => {
    console.log('接收到参数 event:', event);

    if (!event.id) {
        return { code: 400, message: '缺少职位ID' };
    }

    try {
        const jobRes = await db.collection('jobs').doc(event.id).get();
        const jobData = jobRes.data;

        const resultData = {
            title: jobData.title || '',
            company: jobData.company || '',
            salary: jobData.salary || '',
            location: jobData.location || '',
            jobDescription: jobData.jobDescription || '暂无详细描述', // 关键字段
            tags: jobData.tags || [],
            publisher: {
                name: jobData.publisherName || '',
                tag: jobData.publisherType || '',
                avatar: jobData.publisherAvatar || ''
            },
            recommenderComment: jobData.recommenderComment || '',
            formattedDate: formatDate(jobData.createTime)
        };
        return { code: 200, data: resultData };
    } catch (e) {
        return { code: 500, message: '服务器内部错误' };
    }
};