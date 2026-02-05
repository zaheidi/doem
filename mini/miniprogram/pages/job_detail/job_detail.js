// Page({
//     data: {
//       jobId: '',
//       jobDetail: {},
//       recommenderNodes: [],
//       isLoggedIn: false,
//       userType: '',
//       isFavorite: false,
//       filteredStudents: [],
//       screenshotUser: { name: '贾明', id: '2202203321' },
//       aiAssessment: null, 
//       isAiLoading: false  
//     },
  
//     onLoad(options) {
//       if (options.id) {
//         this.setData({ jobId: options.id });
//         this.getJobDetail(options.id);
//       }
//       this.initUserStatus();
//     },
  
//     initUserStatus() {
//       const userType = wx.getStorageSync('userType');
//       const isLoggedIn = wx.getStorageSync('isLoggedIn');
//       this.setData({
//         isLoggedIn: !!isLoggedIn,
//         userType: userType || ''
//       });
//     },
  
//     getJobDetail(id) {
//       wx.showLoading({ title: '加载中', mask: true });
//       wx.cloud.callFunction({
//         name: 'getJobDetail',
//         data: { id },
//         success: res => {
//           wx.hideLoading();
//           if (res.result.code === 200 && res.result.data) {
//             const job = res.result.data;
//             let formattedDate = '';
//             if (job.createTime) {
//               const date = new Date(job.createTime);
//               formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
//             }
//             const recommenderNodes = [{ name: 'div', style: 'line-height:1.6;color:#666;', children: [{ type: 'text', text: job.recommenderComment || '暂无内推寄语' }] }];
  
//             this.setData({
//               jobDetail: { ...job, formattedDate },
//               recommenderNodes
//             }, () => {
//               this.filterStudentsByUserType();
//             });
//           }
//         },
//         fail: () => wx.hideLoading()
//       });
//     },
  
//     // AI 评估逻辑
//     runAiAssessment() {
//       if (!this.data.isLoggedIn) {
//         this.showLoginPrompt(() => this.runAiAssessment());
//         return;
//       }
//       const userInfo = wx.getStorageSync('userInfo');
//       if (!userInfo?.resumeContent) {
//         wx.showModal({ title: '简历缺失', content: '请先完善个人简历。', showCancel: false });
//         return;
//       }
  
//       this.setData({ isAiLoading: true });
//       wx.cloud.callFunction({
//         name: 'getAiScore',
//         data: {
//           resumeText: userInfo.resumeContent.substring(0, 2000),
//           jobDescription: (this.data.jobDetail.jobDescription || "").substring(0, 1000)
//         },
//         success: res => {
//           const aiData = res.result.data || { score: 70, reason: "评估完成。" };
//           this.setData({ aiAssessment: aiData, isAiLoading: false });
//           wx.showToast({ title: '评估完成', icon: 'success' });
//         },
//         fail: () => {
//           this.setData({ isAiLoading: false });
//           wx.showToast({ title: '评估超时', icon: 'none' });
//         }
//       });
//     },
  
//     // 正式投递逻辑
//     applyJob() {
//       if (!this.data.aiAssessment) {
//         wx.showToast({ title: '请先完成 AI 评估', icon: 'none' });
//         return;
//       }
//       wx.showModal({
//         title: '确认投递',
//         content: `系统将携带 AI 评估分（${this.data.aiAssessment.score}分）进行投递。`,
//         confirmText: '确认投递',
//         success: res => {
//           if (res.confirm) this.executeFinalApply();
//         }
//       });
//     },
  
//     executeFinalApply() {
//       wx.showLoading({ title: '正在提交...', mask: true });
//       const { jobDetail, jobId, aiAssessment } = this.data;
//       wx.cloud.callFunction({
//         name: 'applyJob',
//         data: {
//           jobId,
//           publisherName: jobDetail.publisherName || '校友',
//           aiScore: aiAssessment.score,
//           aiReason: aiAssessment.reason,
//           jobTitle: jobDetail.title,
//           company: jobDetail.company
//         },
//         success: res => {
//           wx.hideLoading();
//           if (res.result.code === 200) {
//             wx.showToast({ title: '投递成功', icon: 'success' });
//             setTimeout(() => wx.switchTab({ url: '/pages/applications/applications' }), 1500);
//           }
//         }
//       });
//     },
  
//     filterStudentsByUserType() {
//       const { userType, jobDetail, screenshotUser } = this.data;
//       let filteredStudents = [];
//       if (userType === 'alumni' || userType === 'teacher') {
//         filteredStudents = jobDetail.association?.students || [];
//       } else {
//         filteredStudents = (jobDetail.association?.students || []).filter(s => s.name === screenshotUser.name);
//       }
//       this.setData({ filteredStudents });
//     },
  
//     toggleFavorite() {
//       this.setData({ isFavorite: !this.data.isFavorite });
//     },
  
//     showLoginPrompt(cb) {
//       wx.showModal({
//         title: '登录提示',
//         content: '请先登录。',
//         success: res => {
//           if (res.confirm) {
//             wx.setStorageSync('isLoggedIn', true);
//             wx.setStorageSync('userType', 'student');
//             this.initUserStatus();
//             if (cb) cb();
//           }
//         }
//       });
//     }
//   });
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
      }
      this.initUserStatus();
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
              jobDetail: job,
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
      if (!this.data.aiAssessment) return;
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
      wx.cloud.callFunction({
        name: 'applyJob',
        data: {
          jobId,
          jobTitle: jobDetail.title,
          company: jobDetail.company,
          aiScore: aiAssessment.score,
          // 这里初始状态设为“待评价”，投递后老师才能看到并评价
          teacherEvaluation: '待评价' 
        },
        success: res => {
          if (res.result.code === 200) {
            wx.showToast({ title: '已申请', icon: 'success' });
            setTimeout(() => wx.switchTab({ url: '/pages/applications/applications' }), 1500);
          }
        }
      });
    },
  
    toggleFavorite() {
      this.setData({ isFavorite: !this.data.isFavorite });
    },
  
    showLoginPrompt(cb) {
      wx.showModal({
        title: '登录提示',
        content: '请先登录。',
        success: res => {
          if (res.confirm) {
            wx.setStorageSync('isLoggedIn', true);
            wx.setStorageSync('userType', 'student');
            this.initUserStatus();
            if (cb) cb();
          }
        }
      });
    }
  });