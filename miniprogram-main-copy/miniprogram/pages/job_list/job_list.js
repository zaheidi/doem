// job_list.js
const db = wx.cloud.database();
Page({
  data: {
    searchValue: '',
    activeFilter: 'recommend',
    cityFilterVisible: false,
    jobTypeFilterVisible: false,
    selectedCity: '全部',
    selectedJobType: '全部',
    cityList: ['全部', '北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安'],
    jobTypeList: ['全部', '前端开发', '后端开发', '产品经理', '设计师', '测试工程师', '运维工程师', '数据分析师', '人工智能', '算法工程师'],
    isLoading: false,
    noMoreData: false,
    jobList: [], // 当前显示的职位
    allJobs: [],  // 缓存所有职位数据
    userType: '', // 'alumni' | 'teacher' | 'student' | ''
    isLoggedIn: false,
    pageNum: 1,       // 当前页码
    pageSize: 20      // 每页数量
  },

  onLoad() {
    this.getJobList();
    // 自动同步身份到user_profile
    const userType = wx.getStorageSync('userType');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (userType) this.setData({ userType });
    if (isLoggedIn) this.setData({ isLoggedIn });
  },

  onPullDownRefresh() {
    this.refreshJobList();
  },

  onReachBottom() {
    this.loadMoreJobs();
  },


  // 获取职位列表（调用云开发API）
  getJobList() {
    this.setData({ isLoading: true });
    wx.cloud.callFunction({
      name: 'getJobList',
      data: { 
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
        keyword: this.data.searchValue || '' 
    },
    success: res => {
        if (res.result.code === 200) {
            const jobs = res.result.data.map(job => ({
                ...job,
                formattedDate: job.createTime ? job.createTime.split('T')[0] : ''
              }));

          const mergedJobs = this.data.pageNum === 1 
            ? jobs 
            : [...this.data.allJobs, ...jobs]; 

          this.setData({
            allJobs: mergedJobs,
            jobList: this.filterAndSortJobs(
              mergedJobs,
              this.data.activeFilter,
              this.data.selectedCity,
              this.data.selectedJobType
            ),
            isLoading: false,
            noMoreData: jobs.length < this.data.pageSize //判断是否还有更多数据
          });
        } else {
          this.setData({ isLoading: false });
          wx.showToast({ title: '获取职位失败', icon: 'none' });
        }
      },
      fail: err => {
        this.setData({ isLoading: false });
        wx.showToast({ title: '云函数调用失败', icon: 'none' });
      }
    });
  },

  // 下拉刷新重新加载数据
  refreshJobList() {
    this.setData({
      jobList: [],
      allJobs: [],
      noMoreData: false,
      pageNum: 1 
    });
    this.getJobList();
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  loadMoreJobs() {
    if (this.data.noMoreData || this.data.isLoading) return;

    this.setData({
      pageNum: this.data.pageNum + 1, // 页码+1
      isLoading: true
    });
    this.getJobList(); //继续调用云函数分页
  },



  // 搜索相关方法
  // 1. 监听搜索框输入
  onSearchChange(e) {
    this.setData({ searchValue: e.detail.value });
  },

  // 2. 点击键盘搜索或确定时触发
  onSearchSubmit() {
    this.setData({ jobList: [], noMoreData: false }); // 搜索前清空列表
    this.fetchJobList(this.data.searchValue);
  },

  // 3. 点击清空按钮时触发
  onSearchClear() {
    this.setData({ searchValue: '', jobList: [], noMoreData: false });
    this.fetchJobList(); // 加载默认列表
  },

  // 核心：支持多字段模糊搜索的查询函数
  fetchJobList(keyword = '') {
    this.setData({ isLoading: true });
    
    // 使用逻辑指令 _or，实现“职位名”或“公司名”包含关键字
    const _ = db.command;
    

    // 1. 定义基础查询条件：状态必须为“已发布”
  let queryFilter = {
    status: '已发布' 
  };
    // 2. 如果有关键字，组合搜索条件
    if (keyword) {
      const reg = db.RegExp({
        regexp: keyword,
        options: 'i', // 忽略大小写
      });
      // 使用 _.and 确保“已发布”与“关键字搜索”同时满足
    queryFilter = _.and([
        { status: '已发布' },
        _.or([
          { title: reg },
          { company: reg }
        ])
      ]);
    }
    db.collection('jobs').where(queryFilter)
    .orderBy('createTime', 'desc')
    .get()
    .then(res => {
      const formattedData = res.data.map(item => ({
          ...item,
          id: item._id, 
          formattedDate: item.createTime ? new Date(item.createTime).toLocaleDateString() : '' ,
          publisher: item.publisher || {
            name: item.publisherName || '匿名校友',
            tag: item.publisherType || '校友',
            avatar: item.publisherAvatar || ''
          }
        }));
      this.setData({
        allJobs: formattedData, 
        jobList: formattedData,
        isLoading: false,
        noMoreData: true
      });
    }).catch(err => {
      this.setData({ isLoading: false });
    });


    query.orderBy('createTime', 'desc').get().then(res => {
        const formattedData = res.data.map(item => ({
            ...item,
            id: item._id, 
            formattedDate: item.createTime ? new Date(item.createTime).toLocaleDateString() : '' ,
            publisher: item.publisher || {
              name: item.publisherName || '匿名校友',
              tag: item.publisherType || '校友',
              avatar: item.publisherAvatar || ''
            }
          }));
      this.setData({
        allJobs: formattedData, 
        jobList: formattedData,
        isLoading: false,
        noMoreData: true
      });
    }).catch(err => {
      console.error('搜索失败', err);
      this.setData({ isLoading: false });
    });
  },

  // 筛选相关方法
  onFilterTap(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      activeFilter: type,
      jobList: this.filterAndSortJobs(
        this.data.allJobs,
        type,
        this.data.selectedCity,
        this.data.selectedJobType
      )
    });
  },

  onCityFilterTap() {
    this.setData({
      cityFilterVisible: true
    });
  },

  onCityFilterClose() {
    this.setData({
      cityFilterVisible: false
    });
  },

  onCitySelect(e) {
    const city = e.currentTarget.dataset.city;
    this.setData({
      selectedCity: city,
      cityFilterVisible: false,
      jobList: this.filterAndSortJobs(
        this.data.allJobs,
        this.data.activeFilter,
        city,
        this.data.selectedJobType
      )
    });
  },

  onJobTypeFilterTap() {
    this.setData({
      jobTypeFilterVisible: true
    });
  },

  onJobTypeFilterClose() {
    this.setData({
      jobTypeFilterVisible: false
    });
  },

  onJobTypeSelect(e) {
    const jobType = e.currentTarget.dataset.jobType;
    this.setData({
      selectedJobType: jobType,
      jobTypeFilterVisible: false,
      jobList: this.filterAndSortJobs(
        this.data.allJobs,
        this.data.activeFilter,
        this.data.selectedCity,
        jobType
      )
    });
  },

  // 添加职位
  onAddJobTap() {
    if (!this.data.isLoggedIn) {
      this.simulateLogin();
      return;
    }
    if (this.data.userType === 'alumni' || this.data.userType === 'teacher') {
      // 校友和老师可以发布岗位
    wx.navigateTo({
      url: '/pages/post_job/post_job'
    });
    } else if (this.data.userType === 'student') {
      wx.showModal({
        title: '提示',
        content: '学生身份无法发布岗位，请切换为校友或老师后再试。',
        showCancel: false
      });
    }
  },
  // 点击跳转到投递管理页
  onGoToManageTap() {
    wx.navigateTo({
      url: '/pages/alumna_job_applications/alumna_job_applications',
      success: () => {
        console.log('正在进入校友管理后台...');
      },
      fail: (err) => {
        console.error('跳转失败，请检查路径是否正确', err);
        wx.showToast({
          title: '页面开发中',
          icon: 'none'
        });
      }
    });
  },

  onGoToReviewTap() {
    if (this.data.userType !== 'teacher') {
      wx.showToast({ title: '权限不足', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: '/pages/teacher_review/teacher_review', 
      success: () => {
        console.log('老师进入审核大厅');
      },
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  // 点击职位项
  onJobItemTap(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      wx.showToast({ title: '职位ID缺失', icon: 'error' });
      return;
    }
    wx.navigateTo({
      url: '/pages/job_detail/job_detail?id=' + id
    });
  },

  // 点击详情按钮
  onJobDetailTap(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      wx.showToast({ title: '职位ID缺失', icon: 'error' });
      return;
    }
    wx.navigateTo({
      url: '/pages/job_detail/job_detail?id=' + id
    });
  },


  filterAndSortJobs(jobs, filterType, city, jobType) {
    let filtered = jobs;
    if (city && city !== '全部') {
      filtered = filtered.filter(item => item.location.includes(city));
    }
    if (jobType && jobType !== '全部') {
      filtered = filtered.filter(item => item.title.includes(jobType));
    }
    if (filterType === 'newest') {
        return filtered.slice().sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
      }
    // 推荐：按喜欢数量降序
    return filtered.slice().sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
  },

  simulateLogin() {
    const that = this;
    wx.showActionSheet({
      itemList: ['校友', '老师', '学生'],
      success(res) {
        let userType = '';
        let role = '';
        if (res.tapIndex === 0) { userType = 'alumni'; role = '校友'; }
        if (res.tapIndex === 1) { userType = 'teacher'; role = '老师'; }
        if (res.tapIndex === 2) { userType = 'student'; role = '学生'; }
        that.setData({
          isLoggedIn: true,
          userType: userType
        });
        // 同步到本地缓存，供user_profile页面读取
        wx.setStorageSync('userType', userType);
        wx.setStorageSync('isLoggedIn', true);
        // 同步userInfo.role
        let userInfo = wx.getStorageSync('userInfo') || {};
        userInfo.role = role;
        wx.setStorageSync('userInfo', userInfo);
        wx.showToast({
          title: '已登录为' + role,
          icon: 'success'
        });
      },
      fail() {
        wx.showToast({ title: '请先登录', icon: 'none' });
      }
    });
  },

  onShow() {
    const userType = wx.getStorageSync('userType');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    this.setData({
      isLoggedIn: !!isLoggedIn,
      userType: userType || ''
    });
  }
}) 