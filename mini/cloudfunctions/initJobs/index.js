// initJobs 云函数（开发环境专用）
// const cloud = require('wx-server-sdk')
// cloud.init({ 
//   env: 'cloud1-7gqppbth576f837b' // 替换为你的云环境ID
// })
// const db = cloud.database()

// exports.main = async (event, context) => {
//   // 测试数据（使用 createTime 字段 + 云开发时间格式）
//   const jobs = [
//     {
//       title: '前端开发工程师',
//       salary: '15K-25K',
//       company: '示例科技有限公司',
//       location: '北京市朝阳区',
//       createTime: db.serverDate(), // 关键：使用云开发服务器时间
//       tags: ['React', 'Vue', '小程序'],
//       publisher: { name: '姚经理', tag: '校友' },
//       reviewer: { name: '张教授', tag: '老师' },
//       likeCount: 12
//     },
//     {
//       title: '后端开发工程师',
//       salary: '20K-35K',
//       company: '云智科技有限公司',
//       location: '上海市浦东新区',
//       createTime: db.serverDate(),
//       tags: ['Java', 'Spring Boot', '微服务'],
//       publisher: { name: '技术总监', tag: '校友' },
//       reviewer: { name: '李教授', tag: '老师' },
//       likeCount: 25
//     },
//     {
//       title: '产品经理',
//       salary: '18K-30K',
//       company: '创新互联网公司',
//       location: '深圳市南山区',
//       createTime: db.serverDate(),
//       tags: ['用户增长', '数据分析', '产品设计'],
//       publisher: { name: '李经理', tag: '校友' },
//       reviewer: { name: '王教授', tag: '老师' },
//       likeCount: 7
//     }
//   ]

//   try {
//     // 1. 清空旧数据（批量删除）
//     // const collection = db.collection('jobs');
//     // const MAX_LIMIT = 100;
 
//     // // 循环删除直到没有数据
//     // while (true) {
//     //   const res = await collection.limit(MAX_LIMIT).get();
//     //   if (res.data.length === 0) break;
 
//     //   // 生成批量删除操作数组（修复点：使用 bulk）
//     //   const batchOps = res.data.map(doc => ({
//     //     _id: doc._id,
//     //     action: 'delete' // 指定操作为删除
//     //   }));
 
//     //   // 执行批量操作（修复点：替换 db.batch() 为 bulk）
//     //   await db.collection('jobs').bulk(batchOps);
//     // }

 
//     // 2. 插入新数据
//     for (const job of jobs) {
//       await collection.add({ data: job });
//     }
 
//     return { 
//       code: 200, 
//       message: '初始化成功', 
//       count: jobs.length,
//       tip: "仅限开发环境使用，生产环境请禁用此函数"
//     };
//   } catch (e) {
//     console.error('初始化失败:', e);
//     return { 
//       code: 500, 
//       message: '初始化失败', 
//       error: e.message 
//     };
//   }
// };