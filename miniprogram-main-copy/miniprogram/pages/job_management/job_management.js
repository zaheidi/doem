// pages/job_management.js
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    tabs: ['全部', '开放中', '审核中', '已关闭'],
    activeTab: 0, // 当前选中的筛选栏索引
    jobList: [],
    loading: true
  },

  onShow() {
    // 每次页面显示（包括从发布页返回）都重新拉取数据
    if (wx.getStorageSync('userType') === 'alumni') {
      this.fetchAlumniJobs();
    }
  },
  
  onLoad() {
    // onLoad 里的 fetch 逻辑可以删掉，保留权限检查即可
    const userType = wx.getStorageSync('userType');
    if (userType !== 'alumni') {
      wx.showModal({
        title: '权限提示',
        content: '该页面仅对校友开放',
        showCancel: false,
        success: () => wx.navigateBack()
      });
    }
  },

  // 切换筛选栏
  onTabChange(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index, loading: true });
    this.fetchAlumniJobs();
  },

  // 获取数据逻辑
  async fetchAlumniJobs() {
    this.setData({ loading: true });
    try {
      const { activeTab, tabs } = this.data;
      const statusLabel = tabs[activeTab]; // 获取当前 Tab 的文字内容
  
      // 基础查询条件：锁定当前校友
      let query = {
        // _openid: '{openid}' ,
        publisherType: '校友'
      };
  
      // ⭐️ 动态追加状态过滤条件，必须匹配数据库中的真实 status 字段值
      if (statusLabel === '开放中') query.status = '已发布';
      else if (statusLabel === '审核中') query.status = '待审核';
      else if (statusLabel === '已关闭'){
        // 使用指令同时查询“已关闭”和“已驳回”
        const _ = wx.cloud.database().command;
        query.status = _.in(['已关闭', '已驳回']);
      }
      // 如果是“全部”，则不加 status 条件
  
      const res = await db.collection('jobs')
        .where(query)
        .orderBy('createTime', 'desc') // 确保新发布的排在最上面
        .get();
  
      if (res && res.data) {
        this.setData({ 
          jobList: res.data,
          loading: false 
        });
      }
    } catch (err) {
      console.error("加载失败:", err);
      this.setData({ loading: false });
    }
    console.log("当前环境缓存的 OpenID:", wx.getStorageSync('openid'));
  },

  // 跳转编辑页面
  goToEdit(e) {
    const jobId = e.currentTarget.dataset.id;
    if (!jobId) return;
    wx.navigateTo({
      url: `/pages/post_job/post_job?id=${jobId}` // 携带ID跳转到发布页进行修改
    });
  },
// 跳转立即发布页面
  goToPost() {
    wx.navigateTo({
      url: '/pages/post_job/post_job',
      fail: (err) => {
        console.error("跳转失败，请检查路径是否正确", err);
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  // 停止招聘点击事件
  onStopJob(e) {
    const jobId = e.currentTarget.dataset.id; // 获取当前职位的 ID

    if (!jobId) return;

    wx.showModal({
      title: '提示',
      content: '确定要停止招聘该职位吗？停止后学生将不再可见。',
      confirmColor: '#e34d59', // 警示色
      success: (res) => {
        if (res.confirm) {
          this.executeStopJob(jobId);
        }
      }
    });
  },

  // 执行数据库更新
  executeStopJob(jobId) {
    wx.showLoading({ title: '处理中' });

    // 直接在前端更新状态为“已关闭”
    db.collection('jobs').doc(jobId).update({
      data: {
        status: '已关闭',
        updateTime: db.serverDate() // 记录操作时间
      }
    }).then(res => {
      wx.hideLoading();
      wx.showToast({ title: '职位已关闭', icon: 'success' });
      
      // 关键：更新成功后重新拉取当前列表数据，让卡片消失或变换状态
      this.fetchAlumniJobs(); 
    }).catch(err => {
      wx.hideLoading();
      console.error('停止招聘失败', err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  }

});