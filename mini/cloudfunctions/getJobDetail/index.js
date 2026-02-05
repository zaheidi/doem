// getJobDetail/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: 'cloud1-7gqppbth576f837b' });
const db = cloud.database();

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