// pages/teacher_review/teacher_review.js
Page({
    data: {
      reviewList: [],
      dialogVisible: false,
      activeId: ''
    },
  
    onShow() {
      this.fetchReviewTasks();
    },
  
    fetchReviewTasks() {
      const db = wx.cloud.database();
      // 模拟测试：查找分配给我的 pending 任务
      db.collection('jobs').where({
        status: '待审核',
        // reviewerId: 'MOCK_TEACHER_001' // 实际开发时取消注释
      }).get().then(res => {
        this.setData({ reviewList: res.data });
      });
    },
  
    onApprove(e) {
      this.setData({ activeId: e.currentTarget.dataset.id, dialogVisible: true });
    },
  
    async confirmApprove() {
      wx.showLoading({ title: '处理中' });
      await wx.cloud.callFunction({
        name: 'reviewJob',
        data: { jobId: this.data.activeId, action: 'approve' }
      });
      wx.hideLoading();
      this.setData({ dialogVisible: false });
      this.fetchReviewTasks(); // 刷新列表
      wx.showToast({ title: '审核已通过' });
    },

    showDetail(e) {
        // 从数据绑定中获取职位 ID
        const jobId = e.currentTarget.dataset.id;
        
        if (!jobId) {
          wx.showToast({ title: '职位信息异常', icon: 'none' });
          return;
        }
    
        // 跳转到详情页，并携带 id 参数
        wx.navigateTo({
          url: `/pages/job_detail/job_detail?id=${jobId}`,
          success: () => {
            console.log('正在查看待审核职位详情');
          },
          fail: (err) => {
            console.error('跳转失败', err);
            wx.showToast({ title: '无法打开详情页', icon: 'none' });
          }
        });
      },
      // 1. 审核通过
  onApprove(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认通过',
      content: '确定该职位符合发布要求吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateJobStatus(id, '已发布', '审核通过');
        }
      }
    });
  },

  // 2. 驳回申请
  onReject(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '驳回申请',
      content: '请输入驳回理由',
      editable: true, // 开启输入框
      placeholderText: '例如：薪资描述不明确',
      success: (res) => {
        if (res.confirm && res.content) {
          this.updateJobStatus(id, '已驳回', res.content);
        } else if (res.confirm && !res.content) {
          wx.showToast({ title: '理由不能为空', icon: 'none' });
        }
      }
    });
  },

  // 通用更新函数
  updateJobStatus(jobId, targetStatus, reason) {
    wx.showLoading({ title: '处理中' });
    // const userInfo = wx.getStorageSync('userInfo');
    // ⭐️ 模拟环境下，手动指定一个审核人名字
  const mockReviewerName = "王老师（模拟）";
    // 调用云函数执行更新（推荐）
    wx.cloud.callFunction({
      name: 'reviewJob', // 对应你之前的云函数
      data: {
        jobId: jobId,
        action: targetStatus === '已发布' ? 'approve' : 'reject',
        reason: reason,
        // reviewerName: userInfo.name || '某老师'
        reviewerName: mockReviewerName // ⭐️ 将名字传给云函数

      },
      success: res => {
        wx.hideLoading();
        wx.showToast({ title: '操作成功', icon: 'success' });
        // 刷新列表
        this.fetchReviewTasks();
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({ title: '操作失败', icon: 'none' });
      }
    });
  }
  })