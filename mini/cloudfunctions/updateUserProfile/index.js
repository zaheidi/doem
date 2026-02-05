//云函数 updateUserProfile
//云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-7gqppbth576f837b' })
const db = cloud.database()

exports.main = async (event, context) => {
  const { userInfo } = event;
  const { OPENID } = cloud.getWXContext();

  // 检查 userInfo 中是否有 userType 字段（校友/老师/学生）
  if (!userInfo.userType) {
    return { 
      code: 400, 
      message: '用户类型(userType)未指定，请传入 alumni/teacher/student' 
    };
  }

  // 根据 userType 确定集合名称
  const collectionMap = {
    alumni: 'alumni',
    teacher: 'teachers',
    student: 'students'
  };

  const collectionName = collectionMap[userInfo.userType];
  if (!collectionName) {
    return { 
      code: 400, 
      message: '无效的用户类型(userType)，请传入 alumni/teacher/student' 
    };
  }

  try {
    // 更新对应集合中的用户信息
    await db.collection(collectionName).doc(OPENID).set({
      data: userInfo
    });
    return { code: 200, message: '用户信息更新成功' };
  } catch (err) {
    // 捕获集合不存在的错误（如首次运行时集合未创建）
    if (err.errCode === -502005) {
      return { 
        code: 500, 
        message: '数据库集合不存在',
        error: `集合 "${collectionName}" 未创建，请先在数据库中初始化该集合`,
        solution: '前往云开发控制台 > 数据库 > 创建集合，或通过代码调用 db.createCollection()'
      };
    }
    return { code: 500, message: '用户信息更新失败', error: err };
  }
};


 