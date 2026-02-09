const db = wx.cloud.database();
Page({
    data: {
      jobId: '',
      jobDetail: {},
      recommenderNodes: [],
      jobDescriptionNodes: [], // 新增：职位描述节点
      isLoggedIn: false,
      userType: '',
      isFavorite: false,
      aiAssessment: null,
      isAiLoading: false
    },
  
    onLoad(options) {
      if (options.id) {
        this.setData({ jobId: options.id });
        this.getJobDetail(options.id);
        this.checkIfFavorite(options.id);
      }
      this.initUserStatus();
    },

   // 检查当前用户是否已收藏该职位
  checkIfFavorite(jobId) {
    const loginStatus = wx.getStorageSync('isLoggedIn');
    if (!loginStatus) return;

    db.collection('favorites').where({
      jobId: jobId
    }).get().then(res => {
      console.log('收藏查询结果：', res.data); // 可以在控制台看看有没有数据
      if (res.data.length > 0) {
        this.setData({ isFavorite: true });
      } else {
        this.setData({ isFavorite: false });
      }
    }).catch(err => {
      console.error("检查收藏失败", err);
    });
  },

  // 切换收藏状态
  async toggleFavorite() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (!isLoggedIn) {
      this.showLoginPrompt(() => this.toggleFavorite());
      return;
    }
    // 确保页面 data 里的登录状态也是最新的
    if (!this.data.isLoggedIn) {
        this.setData({ isLoggedIn: true });
    }

    const { isFavorite, jobId, jobDetail } = this.data;
    const favoritesCol = db.collection('favorites');
    
    if (!isFavorite) {
        // 执行添加收藏
        try {
          await favoritesCol.add({
            data: {
              jobId: jobId,
              title: jobDetail.title,
              company: jobDetail.company,
              createTime: db.serverDate()
            }
          });
          this.setData({ isFavorite: true });
          wx.showToast({ title: '收藏成功', icon: 'success' });
        } catch (e) {
          wx.showToast({ title: '收藏失败', icon: 'none' });
        }
      } else {
        // 执行取消收藏
        try {
          await favoritesCol.where({ jobId: jobId }).remove();
          this.setData({ isFavorite: false });
          wx.showToast({ title: '已取消收藏', icon: 'none' });
        } catch (e) {
          wx.showToast({ title: '取消失败', icon: 'none' });
        }
      }
    },
  
    initUserStatus() {
      this.setData({
        isLoggedIn: !!wx.getStorageSync('isLoggedIn'),
        userType: wx.getStorageSync('userType') || ''
      });
    },
  
    getJobDetail(id) {
      wx.showLoading({ title: '加载中' });
      wx.cloud.callFunction({
        name: 'getJobDetail',
        data: { id },
        success: res => {
          wx.hideLoading();
          if (res.result.code === 200) {
            const job = res.result.data;
            
            // 处理职位描述富文本（将换行符转为简单 HTML）
            const description = job.jobDescription || '暂无职位描述';
            const jobDescriptionNodes = [{
              name: 'div',
              attrs: { style: 'white-space: pre-wrap; color: #666;' },
              children: [{ type: 'text', text: description }]
            }];
  
            const recommenderNodes = [{
              name: 'div',
              attrs: { style: 'color: #666;' },
              children: [{ type: 'text', text: job.recommenderComment || '暂无寄语' }]
            }];
  
            this.setData({
              jobDetail: res.result.data,
              jobDescriptionNodes,
              recommenderNodes
            });
          }
        },
        fail: () => wx.hideLoading()
      });
    },
  
    runAiAssessment() {
      if (!this.data.isLoggedIn) {
        this.showLoginPrompt(() => this.runAiAssessment());
        return;
      }
      const userInfo = wx.getStorageSync('userInfo');
      if (!userInfo?.resumeContent) {
        wx.showModal({ title: '简历缺失', content: '请先完善个人简历。', showCancel: false });
        return;
      }
  
      this.setData({ isAiLoading: true });
      wx.cloud.callFunction({
        name: 'getAiScore',
        data: {
          resumeText: userInfo.resumeContent,
          jobDescription: this.data.jobDetail.jobDescription || ""
        },
        success: res => {
          this.setData({ aiAssessment: res.result.data, isAiLoading: false });
          wx.showToast({ title: '评估完成', icon: 'success' });
        },
        fail: () => {
          this.setData({ isAiLoading: false });
          wx.showToast({ title: '评估失败', icon: 'none' });
        }
      });
    },
  
    applyJob() {
      wx.showModal({
        title: '确认投递',
        content: '投递后，系统将邀请专业老师对您的简历进行推介评价。',
        confirmText: '确认投递',
        success: res => {
          if (res.confirm) this.executeFinalApply();
        }
      });
    },
  
    executeFinalApply() {
        const { jobDetail, jobId, aiAssessment } = this.data;

  // 1. 强力调试：查看当前 jobDetail 到底长什么样
  console.log('--- 投递前数据检查 ---');
  console.log('完整 jobDetail:', jobDetail);
  console.log('公司名值:', jobDetail ? jobDetail.company : '对象不存在');

  // 2. 容错校验：如果标题存在但公司名丢失，先放行以测试链路，给个默认值
  if (!jobDetail || !jobDetail.title) {
    wx.showToast({ title: '职位数据加载中...', icon: 'none' });
    return;
  }

  // 提取变量，防止下面传参报错
  const finalCompany = jobDetail.company || "未知公司";
  const finalScore = aiAssessment ? (aiAssessment.score || 0) : 0;

  wx.showLoading({ title: '提交中...' });

  wx.cloud.callFunction({
    name: 'applyJob',
    data: {
      jobId: jobId,
      jobTitle: jobDetail.title,
      company: finalCompany, 
      location: jobDetail.location || "未知地点",
      aiScore: finalScore,
      teacherEvaluation: '待评价' 
    },
        success: res => {
          wx.hideLoading();
          if (res.result.code === 200) {
            wx.showToast({ title: '已申请', icon: 'success' });
            setTimeout(() => wx.switchTab({ url: '/pages/applications/applications' }), 1500);
          }else if (res.result.code === 400) {
            // 重复投递的提示
            wx.showModal({
              title: '提示',
              content: res.result.message || '您已经投递过该职位，请勿重复投递。',
              showCancel: false,
              confirmText: '我知道了'
            });
          } else {
            // 其他错误提示
            wx.showToast({ title: res.result.message || '申请失败', icon: 'none' });
          }
        },fail: err => {
            wx.hideLoading();
            wx.showToast({ title: '网络异常，请稍后再试', icon: 'none' });
            console.error('调用云函数失败', err);
        }
      });
    },
  
  
    showLoginPrompt(cb) {
        wx.showModal({
            title: '登录提示',
            content: '请先登录。',
            success: res => {
              if (res.confirm) {
                wx.setStorageSync('isLoggedIn', true);
                wx.setStorageSync('userType', 'student');
                
                // 手动更新 data 确保同步，不再仅仅依赖异步的 initUserStatus
                this.setData({
                  isLoggedIn: true,
                  userType: 'student'
                }, () => {
                  // 在 setData 的回调中执行，确保 isLoggedIn 已经变为 true
                  if (cb) cb();
                });
              }
            }
          });
    }
  });