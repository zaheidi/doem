// teacher_stats.js

Page({
  data: {
    overview: {
      totalStudents: 320,
      totalApplies: 180,
      pendingApplies: 40,
      passRate: 78
    },
    timeFilters: [
      { label: '本周', value: 'week' },
      { label: '本月', value: 'month' },
      { label: '本学期', value: 'semester' },
      { label: '全部', value: 'all' }
    ],
    timeFilterActive: 'week',
    statusFilter: 'all',
    classFilter: 'all',
    classes: [
      { label: '计算机2001班', value: 'cs2001' },
      { label: '计算机2002班', value: 'cs2002' },
      { label: '软件工程2001班', value: 'se2001' },
      { label: '软件工程2002班', value: 'se2002' }
    ],
    showMoreFilters: false,
    
    // 申请状态分布数据
    statusDistribution: [
      { status: '待处理', count: 40, percentage: 22.2, color: '#FAA61A' },
      { status: '已通过', count: 110, percentage: 61.1, color: '#36B37E' },
      { status: '已拒绝', count: 30, percentage: 16.7, color: '#FF4D4F' }
    ],
    
    // 申请趋势数据
    weekTrendData: [
      { date: '05-01', count: 15 },
      { date: '05-08', count: 28 },
      { date: '05-15', count: 36 },
      { date: '05-22', count: 32 },
      { date: '05-29', count: 40 }
    ],
    monthTrendData: [
      { date: '01月', count: 45 },
      { date: '02月', count: 52 },
      { date: '03月', count: 69 },
      { date: '04月', count: 85 },
      { date: '05月', count: 96 }
    ],
    semesterTrendData: [
      { date: '2月', count: 68 },
      { date: '3月', count: 95 },
      { date: '4月', count: 121 },
      { date: '5月', count: 142 },
      { date: '6月', count: 180 }
    ],
    allTrendData: [
      { date: '2024-Q3', count: 120 },
      { date: '2024-Q4', count: 156 },
      { date: '2024-Q1', count: 198 },
      { date: '2024-Q2', count: 245 },
      { date: '至今', count: 320 }
    ],
    currentTrendData: [],
    
    // 岗位热度排行
    hotJobsData: [
      { title: '前端开发', count: 42, percentage: 26.7 },
      { title: '后端开发', count: 38, percentage: 24.2 },
      { title: '产品经理', count: 34, percentage: 21.7 },
      { title: '数据分析', count: 25, percentage: 15.9 },
      { title: 'UI设计', count: 18, percentage: 11.5 }
    ],
    
    // 新增三个统计模块的数据
    // 1. 发布内推岗位较多的校友
    topReferralPosters: [
      {
        alumnusId: "A001",
        name: "李明远",
        graduationYear: 2010,
        company: "蓝天科技股份有限公司",
        department: "计算机科学与技术系",
        referralsPostedCount: 25,
        avatar: "https://tdesign.gtimg.com/site/avatar.jpg"
      },
      {
        alumnusId: "A008",
        name: "王芳华",
        graduationYear: 2012,
        company: "启航教育集团",
        department: "外国语言文学系",
        referralsPostedCount: 18,
        avatar: "https://tdesign.gtimg.com/site/avatar.jpg"
      },
      {
        alumnusId: "A003",
        name: "陈志强",
        graduationYear: 2008,
        company: "新思路咨询有限公司",
        department: "经济管理学院",
        referralsPostedCount: 15,
        avatar: "https://tdesign.gtimg.com/site/avatar.jpg"
      },
      {
        alumnusId: "A012",
        name: "张文博",
        graduationYear: 2015,
        company: "科技创新有限公司",
        department: "计算机科学与技术系",
        referralsPostedCount: 12,
        avatar: "https://tdesign.gtimg.com/site/avatar.jpg"
      },
      {
        alumnusId: "A020",
        name: "林小雨",
        graduationYear: 2013,
        company: "未来科技集团",
        department: "物理学院",
        referralsPostedCount: 10,
        avatar: "https://tdesign.gtimg.com/site/avatar.jpg"
      }
    ],
    
    // 2. 处理职位申请响应度低的校友
    lowResponsivenessAlumni: [
      {
        alumnusId: "A015",
        name: "张伟",
        graduationYear: 2014,
        company: "创新工场",
        department: "信息工程学院",
        pendingApplicationsCount: 8,
        lastActiveOnReferral: "2024-05-10",
        avatar: "https://tdesign.gtimg.com/site/avatar.jpg"
      },
      {
        alumnusId: "A022",
        name: "刘敏",
        graduationYear: 2011,
        company: "远大集团",
        department: "机械工程系",
        pendingApplicationsCount: 5,
        lastActiveOnReferral: "2024-05-15",
        avatar: "https://tdesign.gtimg.com/site/avatar.jpg"
      },
      {
        alumnusId: "A009",
        name: "王小明",
        graduationYear: 2016,
        company: "智联科技",
        department: "计算机科学与技术系",
        pendingApplicationsCount: 4,
        lastActiveOnReferral: "2024-05-12",
        avatar: "https://tdesign.gtimg.com/site/avatar.jpg"
      }
    ],
    
    // 3. 申请职位成功率较高的学生
    highSuccessRateStudents: [
      {
        studentId: "S007",
        name: "赵雪",
        department: "计算机科学与技术系",
        major: "软件工程",
        applicationsMade: 10,
        applicationsSuccessful: 7,
        successRate: 0.70,
        avatar: "https://tdesign.gtimg.com/site/avatar.jpg"
      },
      {
        studentId: "S012",
        name: "孙鹏",
        department: "电子信息工程学院",
        major: "通信工程",
        applicationsMade: 8,
        applicationsSuccessful: 5,
        successRate: 0.625,
        avatar: "https://tdesign.gtimg.com/site/avatar.jpg"
      },
      {
        studentId: "S003",
        name: "周琳",
        department: "计算机科学与技术系",
        major: "人工智能",
        applicationsMade: 12,
        applicationsSuccessful: 7,
        successRate: 0.583,
        avatar: "https://tdesign.gtimg.com/site/avatar.jpg"
      },
      {
        studentId: "S021",
        name: "李明宇",
        department: "软件工程系",
        major: "软件工程",
        applicationsMade: 6,
        applicationsSuccessful: 3,
        successRate: 0.5,
        avatar: "https://tdesign.gtimg.com/site/avatar.jpg"
      }
    ],
    
    popularJobs: [
      { id: 1, title: '前端开发工程师', company: '示例科技有限公司', applicants: 28 },
      { id: 2, title: '后端开发工程师', company: '云智科技有限公司', applicants: 22 },
      { id: 3, title: '产品经理', company: '创新互联网公司', applicants: 19 },
      { id: 4, title: 'UI设计师', company: '视觉创意设计公司', applicants: 15 },
      { id: 5, title: '数据分析师', company: '数据智能公司', applicants: 12 }
    ],
    recentApplications: [
      {
        id: 1,
        studentName: '张三',
        studentAvatar: '',
        studentClass: '计算机2001班',
        jobTitle: '前端开发工程师',
        company: '示例科技有限公司',
        status: 'pending',
        statusText: '待处理',
        applyTime: '2024-03-20 10:30'
      },
      {
        id: 2,
        studentName: '李四',
        studentAvatar: '',
        studentClass: '软件工程2001班',
        jobTitle: '后端开发工程师',
        company: '云智科技有限公司',
        status: 'approved',
        statusText: '已通过',
        applyTime: '2024-03-19 14:15'
      },
      {
        id: 3,
        studentName: '王五',
        studentAvatar: '',
        studentClass: '计算机2002班',
        jobTitle: '产品经理',
        company: '创新互联网公司',
        status: 'rejected',
        statusText: '已拒绝',
        applyTime: '2024-03-18 16:20'
      }
    ],
    teacherInfo: {
      name: '张教授',
      avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
      role: '老师'
    },
    totalApplications: 20,
    totalPassed: 15,
    totalPassRate: 75, // 百分比
    avgMatchScore: 82, // 匹配度分数
    jobStats: [
      {
        jobTitle: '前端开发工程师',
        total: 5,
        passed: 4,
        passRate: 80,
        avgMatch: 85
      },
      {
        jobTitle: '后端工程师',
        total: 10,
        passed: 7,
        passRate: 70,
        avgMatch: 78
      },
      {
        jobTitle: '产品经理',
        total: 5,
        passed: 4,
        passRate: 80,
        avgMatch: 83
      }
    ],
    funnelStages: [
      {
        name: '提交申请',
        count: 120,
        nextCount: 100,
        conversion: 83,
        dropoff: 17,
        avgMatch: 78
      },
      {
        name: '进入审核',
        count: 100,
        nextCount: 70,
        conversion: 70,
        dropoff: 30,
        avgMatch: 82
      },
      {
        name: '审核通过',
        count: 70,
        nextCount: 60,
        conversion: 86,
        dropoff: 14,
        avgMatch: 88
      },
      {
        name: '发放内推码',
        count: 60,
        nextCount: null,
        conversion: null,
        dropoff: null,
        avgMatch: 91
      }
    ],
    explain: '',
    // 岗位列表，0为全部岗位
    jobList: [
      { label: '全部岗位', value: 0 },
      { label: '前端开发工程师', value: 1 },
      { label: '后端开发工程师', value: 2 },
      { label: '产品经理', value: 3 },
      { label: 'UI设计师', value: 4 }
    ],
    // 岗位信息
    jobInfoMap: {
      0: { title: '全部岗位', desc: '所有岗位的汇总统计' },
      1: { title: '前端开发工程师', desc: '负责Web/小程序前端开发' },
      2: { title: '后端开发工程师', desc: '负责服务端开发与维护' },
      3: { title: '产品经理', desc: '负责产品规划与需求分析' },
      4: { title: 'UI设计师', desc: '负责界面与交互设计' }
    },
    // 各岗位及全部岗位的漏斗数据
    jobFunnels: {
      0: [
        { name: '提交申请', count: 180, nextCount: 150, conversion: 83, dropoff: 17, avgMatch: 80 },
        { name: '进入审核', count: 150, nextCount: 110, conversion: 73, dropoff: 27, avgMatch: 82 },
        { name: '审核通过', count: 110, nextCount: 90, conversion: 82, dropoff: 18, avgMatch: 88 },
        { name: '发放内推码', count: 90, nextCount: null, conversion: null, dropoff: null, avgMatch: 91 }
      ],
      1: [
        { name: '提交申请', count: 50, nextCount: 40, conversion: 80, dropoff: 20, avgMatch: 78 },
        { name: '进入审核', count: 40, nextCount: 30, conversion: 75, dropoff: 25, avgMatch: 82 },
        { name: '审核通过', count: 30, nextCount: 25, conversion: 83, dropoff: 17, avgMatch: 88 },
        { name: '发放内推码', count: 25, nextCount: null, conversion: null, dropoff: null, avgMatch: 91 }
      ],
      2: [
        { name: '提交申请', count: 60, nextCount: 50, conversion: 83, dropoff: 17, avgMatch: 80 },
        { name: '进入审核', count: 50, nextCount: 35, conversion: 70, dropoff: 30, avgMatch: 85 },
        { name: '审核通过', count: 35, nextCount: 30, conversion: 86, dropoff: 14, avgMatch: 90 },
        { name: '发放内推码', count: 30, nextCount: null, conversion: null, dropoff: null, avgMatch: 93 }
      ],
      3: [
        { name: '提交申请', count: 40, nextCount: 32, conversion: 80, dropoff: 20, avgMatch: 75 },
        { name: '进入审核', count: 32, nextCount: 25, conversion: 78, dropoff: 22, avgMatch: 80 },
        { name: '审核通过', count: 25, nextCount: 20, conversion: 80, dropoff: 20, avgMatch: 85 },
        { name: '发放内推码', count: 20, nextCount: null, conversion: null, dropoff: null, avgMatch: 88 }
      ],
      4: [
        { name: '提交申请', count: 30, nextCount: 25, conversion: 83, dropoff: 17, avgMatch: 82 },
        { name: '进入审核', count: 25, nextCount: 18, conversion: 72, dropoff: 28, avgMatch: 86 },
        { name: '审核通过', count: 18, nextCount: 15, conversion: 83, dropoff: 17, avgMatch: 90 },
        { name: '发放内推码', count: 15, nextCount: null, conversion: null, dropoff: null, avgMatch: 92 }
      ]
    },
    currentJobId: 0,
    currentFunnel: [],
    currentJobInfo: {},
    trendData: [
      { date: '05-01', count: 15 },
      { date: '05-08', count: 28 },
      { date: '05-15', count: 36 },
      { date: '05-22', count: 32 },
      { date: '05-29', count: 40 }
    ],
    hotData: [
      { title: '前端开发', count: 42 },
      { title: '后端开发', count: 38 },
      { title: '产品经理', count: 34 },
      { title: '数据分析', count: 25 },
      { title: 'UI设计', count: 18 }
    ]
  },

  onLoad: function() {
    // 初始化趋势数据
    this.updateChartData('week');
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '教师统计'
    });
    
    // 模拟数据加载
    wx.showLoading({
      title: '加载中...',
    });
    
    setTimeout(() => {
      wx.hideLoading();
    }, 500);
  },

  onShow: function() {
    // 检查页面样式是否需要更新
    this.checkStyleUpdate();
  },
  
  // 检查样式更新
  checkStyleUpdate: function() {
    // 强制样式更新
    this.setData({
      styleUpdateTimestamp: new Date().getTime()
    });
  },
  
  onTimeFilterChange: function(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      timeFilterActive: value
    });
    this.updateChartData(value);
  },
  
  updateChartData: function(timeRange) {
    let trendData = [];
    let hotJobsData = [];
    
    switch(timeRange) {
      case 'week':
        trendData = this.data.weekTrendData;
        hotJobsData = [
          { title: '前端开发', count: 42, percentage: 26.7 },
          { title: '后端开发', count: 38, percentage: 24.2 },
          { title: '产品经理', count: 34, percentage: 21.7 },
          { title: '数据分析', count: 25, percentage: 15.9 },
          { title: 'UI设计', count: 18, percentage: 11.5 }
        ];
        break;
      case 'month':
        trendData = this.data.monthTrendData;
        hotJobsData = [
          { title: '前端开发', count: 86, percentage: 28.0 },
          { title: '后端开发', count: 72, percentage: 23.5 },
          { title: '产品经理', count: 65, percentage: 21.2 },
          { title: '数据分析', count: 48, percentage: 15.7 },
          { title: 'UI设计', count: 36, percentage: 11.8 }
        ];
        break;
      case 'semester':
        trendData = this.data.semesterTrendData;
        hotJobsData = [
          { title: '前端开发', count: 120, percentage: 26.1 },
          { title: '后端开发', count: 105, percentage: 22.8 },
          { title: '产品经理', count: 92, percentage: 20.0 },
          { title: '数据分析', count: 78, percentage: 17.0 },
          { title: 'UI设计', count: 65, percentage: 14.1 }
        ];
        break;
      case 'all':
        trendData = this.data.allTrendData;
        hotJobsData = [
          { title: '前端开发', count: 180, percentage: 25.7 },
          { title: '后端开发', count: 165, percentage: 23.6 },
          { title: '产品经理', count: 140, percentage: 20.0 },
          { title: '数据分析', count: 120, percentage: 17.1 },
          { title: 'UI设计', count: 95, percentage: 13.6 }
        ];
        break;
      default:
        trendData = this.data.weekTrendData;
        hotJobsData = [
          { title: '前端开发', count: 42, percentage: 26.7 },
          { title: '后端开发', count: 38, percentage: 24.2 },
          { title: '产品经理', count: 34, percentage: 21.7 },
          { title: '数据分析', count: 25, percentage: 15.9 },
          { title: 'UI设计', count: 18, percentage: 11.5 }
        ];
    }
    
    this.setData({
      currentTrendData: trendData,
      hotJobsData: hotJobsData
    });
    
    // 强制重新渲染以确保样式生效
    setTimeout(() => {
      this.checkStyleUpdate();
    }, 100);
  },

  toggleMoreFilters() {
    this.setData({
      showMoreFilters: true
    });
  },

  closeMoreFilters() {
    this.setData({
      showMoreFilters: false
    });
  },

  onPopupVisibleChange(e) {
    if (!e.detail.visible) {
      this.setData({
        showMoreFilters: false
      });
    }
  },

  onStatusFilterChange(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      statusFilter: value
    });
  },

  onClassFilterChange(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      classFilter: value
    });
  },

  resetFilters() {
    this.setData({
      statusFilter: 'all',
      classFilter: 'all'
    });
  },

  applyFilters() {
    this.setData({
      showMoreFilters: false
    });
    
    // 这里应该根据筛选条件调用API获取数据
    wx.showToast({
      title: '筛选已应用',
      icon: 'success'
    });
  },

  // 导航到所有申请页面
  navigateToAllApplications() {
    wx.navigateTo({
      url: '/pages/all_applications/index'
    });
  },

  // 查看申请详情
  viewApplicationDetail(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: '/pages/application_detail/index?id=' + id
    });
  },

  // 处理申请
  handleApplication(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: '/pages/handle_application/index?id=' + id
    });
  },

  // 下拉选择岗位切换漏斗
  onJobDropdownChange(e) {
    const val = Number(e.detail.value);
    this.setData({ currentJobId: val });
    if (this.data.jobFunnels[val]) {
      this.setData({
        currentFunnel: this.data.jobFunnels[val],
        currentJobInfo: this.data.jobInfoMap[val]
      });
    } else {
      wx.showToast({ title: '无此岗位数据', icon: 'none' });
    }
  },

  // 查看更多发布岗位较多的校友
  viewMoreTopAlumni() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 感谢校友
  thankAlumnus(e) {
    const alumnusId = e.currentTarget.dataset.id;
    // 查找对应校友信息
    const alumnus = this.data.topReferralPosters.find(item => item.alumnusId === alumnusId);
    if (alumnus) {
      wx.showToast({
        title: `已向${alumnus.name}发送感谢信息`,
        icon: 'success'
      });
    }
  },

  // 查看更多响应度低的校友
  viewMoreLowResponseAlumni() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 提醒校友处理申请
  contactAlumnus(e) {
    const alumnusId = e.currentTarget.dataset.id;
    // 查找对应校友信息
    const alumnus = this.data.lowResponsivenessAlumni.find(item => item.alumnusId === alumnusId);
    if (alumnus) {
      wx.showModal({
        title: '提醒校友',
        content: `确定要向${alumnus.name}发送提醒消息？`,
        success(res) {
          if (res.confirm) {
            wx.showToast({
              title: '提醒已发送',
              icon: 'success'
            });
          }
        }
      });
    }
  },

  // 查看更多成功率高的学生
  viewMoreSuccessfulStudents() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 邀请学生分享经验
  inviteShareExperience(e) {
    const studentId = e.currentTarget.dataset.id;
    // 查找对应学生信息
    const student = this.data.highSuccessRateStudents.find(item => item.studentId === studentId);
    if (student) {
      wx.showModal({
        title: '邀请分享',
        content: `确定要邀请${student.name}分享求职经验？`,
        success(res) {
          if (res.confirm) {
            wx.showToast({
              title: '邀请已发送',
              icon: 'success'
            });
          }
        }
      });
    }
  }
}) 