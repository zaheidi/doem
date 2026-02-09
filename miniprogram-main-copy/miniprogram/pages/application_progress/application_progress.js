Page({
    data: {
      activeTab: 'all',
      sliderLeft: 0,
      sliderWidth: 0,
      applications: [],
      isLoading: false,
      noMoreData: false,
      isLoggedIn: false,
      userType: '',
      showLoginDialog: false,
      userInfo: {}
    },
  
    onLoad() {
      // 同步身份
      const isLoggedIn = wx.getStorageSync('isLoggedIn');
      const userType = wx.getStorageSync('userType');
      this.setData({
        isLoggedIn: !!isLoggedIn,
        userType: userType || ''
      });
      this.getSystemInfo();
      this.loadApplications();
    },
  
    onShow() {
      const userType = wx.getStorageSync('userType');
      const isLoggedIn = wx.getStorageSync('isLoggedIn');
      let userInfo = wx.getStorageSync('userInfo') || {};
      if (userType === 'alumni') userInfo.role = '校友';
      if (userType === 'teacher') userInfo.role = '老师';
      if (userType === 'student') userInfo.role = '学生';
      this.setData({
        isLoggedIn: !!isLoggedIn,
        userType: userType || '',
        userInfo: userInfo
      });
      // 若已登录，刷新进度列表
      if (this.data.isLoggedIn) {
        this.refreshProgressList && this.refreshProgressList();
      }
    },
  
    getSystemInfo() {
      try {
        const systemInfo = wx.getWindowInfo();
        const screenWidth = systemInfo.windowWidth;
        const tabCount = 4; // Assuming 4 tabs
        const sliderWidth = screenWidth / tabCount;
        this.setData({
          sliderWidth: sliderWidth,
        });
        this.updateSliderPosition(this.data.activeTab);
      } catch (error) {
        console.error('获取系统信息失败:', error);
        // 使用默认值
        this.setData({
          sliderWidth: 187.5, // 默认宽度
        });
      }
    },
  
    updateSliderPosition(tab) {
      const tabIndex = {
        all: 0,
        pending: 1,
        processing: 2,
        completed: 3,
      }[tab];
      const sliderLeft = this.data.sliderWidth * tabIndex;
      this.setData({
        sliderLeft: sliderLeft,
      });
    },
  
    onTabChange(e) {
    //   const tab = e.currentTarget.dataset.tab;
    //   this.setData({
    //     activeTab: tab,
    //     applications: [], // Clear existing applications when tab changes
    //     noMoreData: false,
    //   });
    //   this.updateSliderPosition(tab);
    //   this.loadApplications();
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    this.loadApplications(tab)
    },
  
    // 刷新列表（供 onShow 调用）
    refreshProgressList() {
      this.setData({
        applications: [],
        noMoreData: false
      });
      this.loadApplications();
    },
  
    // 状态到中文
    mapStatusToText(status) {
      if (status === 'pending') return '待处理';
      if (status === 'processing') return '处理中';
      if (status === 'completed') return '已完成';
      return '未知状态';
    },
  
    // 根据状态生成时间线
    buildTimeline(status, applyTime, processTime, resultTime, resultStatus) {
      return [
        { title: '已提交申请', time: applyTime || '', done: true },
        { title: '老师/校友处理中', time: processTime || '', done: status === 'processing' || status === 'completed' },
        { title: '结果', time: resultTime || '', done: status === 'completed', status: resultStatus || '' }
      ];
    },
  
    // 格式化时间
    formatDate(ts) {
      try {
        if (!ts) return '';
        // 云数据库 serverDate 存的是 Date 对象或具有 toDate 的对象
        const d = typeof ts === 'object' && typeof ts.getFullYear === 'function' ? ts : (ts.toDate ? ts.toDate() : new Date(ts));
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${y}-${m}-${day} ${hh}:${mm}`;
      } catch (e) {
        return '';
      }
    },
  
    // 合并职位信息
    async enrichWithJobDetails(apps) {
      const jobsMap = {};
      const tasks = apps.map(item => new Promise((resolve) => {
        if (!item.jobId) return resolve();
        // 缓存避免重复请求
        if (jobsMap[item.jobId]) return resolve();
        wx.cloud.callFunction({
          name: 'getJobDetail',
          data: { id: item.jobId }
        }).then(res => {
          if (res.result && res.result.code === 200) {
            jobsMap[item.jobId] = res.result.data;
          }
        }).finally(() => resolve());
      }));
      await Promise.all(tasks);
      return apps.map(app => {
        const job = jobsMap[app.jobId] || {};
        return Object.assign({}, app, {
          jobTitle: app.jobTitle || job.title || '',
          company: app.company || job.company || '',
          location: app.location || job.location || ''
        });
      });
    },
  
    loadApplications() {
      if (this.data.isLoading || this.data.noMoreData) return;
  
      this.setData({
        isLoading: true,
      });
  
      // 调用云函数获取申请进度
      wx.cloud.callFunction({
        name: 'getApplications',
        data: { status: this.data.activeTab },
        success: async res => {
          if (res.result.code === 200) {
            const raw = res.result.data || [];
            // 映射到前端展示结构
            let mapped = raw.map(r => {
              const id = r._id || r.id;
              const applyTime = this.formatDate(r.applyDate);
              const processTime = this.formatDate(r.updateTime);
              const resultTime = this.formatDate(r.resultTime || r.updateTime);
              const resultStatus = r.resultStatus || (r.result && r.result.status) || (r.remark === 'passed' ? 'passed' : (r.remark === 'failed' ? 'failed' : ''));
              return {
                id,
                jobId: r.jobId,
                jobTitle: r.jobTitle || '',
                company: r.company || '',
                location: r.location || '',
                status: r.status || 'pending',
                statusText: this.mapStatusToText(r.status),
                timeline: this.buildTimeline(r.status, applyTime, processTime, resultTime, resultStatus),
                referralInfo: r.referralInfo || '',
                referralContact: r.referralContact || '',
                referralCode: r.referralCode || '',
                applyDate: applyTime
              };
            });
            // 补充职位信息
            mapped = await this.enrichWithJobDetails(mapped);
            this.setData({
              applications: mapped,
              isLoading: false,
              noMoreData: mapped.length === 0
            });
          } else {
            this.setData({ isLoading: false });
            wx.showToast({ title: '获取进度失败', icon: 'none' });
          }
        },
        fail: err => {
          this.setData({ isLoading: false });
          console.error('getApplications云函数调用失败:', err);
          wx.showToast({ 
            title: err.errMsg || '云函数调用失败', 
            icon: 'none',
            duration: 2000
          });
        }
      });
    },
  
    onApplicationTap(e) {
      const id = e.currentTarget.dataset.id;
      console.log('Application tapped:', id);
      // navigate to job detail or application detail page
    },
  
    onViewDetailTap(e) {
      if (!this.data.isLoggedIn) {
        this.showLoginPrompt(() => this.onViewDetailTap(e));
        return;
      }
      const jobId = e.currentTarget.dataset.jobId;
      if (!jobId) {
        wx.showToast({ title: '缺少职位信息', icon: 'none' });
        return;
      }
      wx.navigateTo({
        url: `/pages/job_detail/job_detail?id=${jobId}`,
      });
    },
  
    onBrowseJobsTap() {
      wx.switchTab({
        url: '/pages/job_list/job_list',
      });
    },
  
    // 复制内推码
    copyReferralCode(e) {
      if (!this.data.isLoggedIn) {
        this.showLoginPrompt(() => this.copyReferralCode(e));
        return;
      }
      const code = e.currentTarget.dataset.code;
      wx.setClipboardData({
        data: code,
        success: () => {
          wx.showToast({
            title: '内推码已复制',
            icon: 'success'
          });
        }
      });
    },
  
    // 复制校友联系方式
    copyReferralContact(e) {
      if (!this.data.isLoggedIn) {
        this.showLoginPrompt(() => this.copyReferralContact(e));
        return;
      }
      const contact = e.currentTarget.dataset.contact;
      wx.setClipboardData({
        data: contact,
        success: () => {
          wx.showToast({
            title: '联系方式已复制',
            icon: 'success'
          });
        }
      });
    },
  
    // 登录提示，支持回调
    showLoginPrompt(cb) {
      wx.showModal({
        title: '提示',
        content: '您尚未登录，请先登录后使用完整功能',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.simulateLogin(cb);
          }
        }
      });
    },
  
    // 下拉刷新操作
    onPullDownRefresh() {
      this.setData({
        applications: [],
        noMoreData: false
      });
      this.loadApplications();
      wx.stopPullDownRefresh();
    },
  
    simulateLogin(cb) {
      const that = this;
      wx.showActionSheet({
        itemList: ['校友', '老师', '学生'],
        success(res) {
          let userType = '';
          if (res.tapIndex === 0) userType = 'alumni';
          if (res.tapIndex === 1) userType = 'teacher';
          if (res.tapIndex === 2) userType = 'student';
          that.setData({
            isLoggedIn: true,
            userType: userType
          });
          wx.setStorageSync('isLoggedIn', true);
          wx.setStorageSync('userType', userType);
          wx.showToast({ title: '登录成功', icon: 'success' });
          setTimeout(() => { that.onPullDownRefresh(); if (typeof cb === 'function') cb(); }, 300);
        },
        fail() {
          wx.showToast({ title: '请先登录', icon: 'none' });
        }
      });
    },
  });
  