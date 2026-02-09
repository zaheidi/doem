// user_profile.js
Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '',
      isVerified: false,
      role: '游客'
    },
    stats: {
      postsCount: 0,
      appliesCount: 0,
      favoritesCount: 0
    },
    showLoginDialog: false,
    isLoggedIn: false,
    userType: ''
  },

  onLoad() {
    this.syncUserData();
    this.checkLoginStatus();
  },

  onShow() {
    this.syncUserData();
    if (this.data.isLoggedIn) {
      this.getUserStats();
    }
  },

  // 同步用户信息
  syncUserData() {
    const userType = wx.getStorageSync('userType');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    let userInfo = wx.getStorageSync('userInfo') || {};
    if (userType === 'alumni') userInfo.role = '校友';
    if (userType === 'teacher') userInfo.role = '老师';
    if (userType === 'student') userInfo.role = '学生';
    this.setData({
      isLoggedIn: !!isLoggedIn,
      userInfo: userInfo,
      userType: userType || ''
    });
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLoggedIn: true
      });
      this.getUserStats();
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: {
          avatarUrl: '',
          nickName: '未登录',
          isVerified: false,
          role: '游客'
        },
        stats: {
          postsCount: 0,
          appliesCount: 0,
          favoritesCount: 0
        }
      });
    }
  },

  // 获取用户统计数据
  getUserStats() {
    wx.cloud.callFunction({
      name: 'getUserProfile',
      data: {},
      success: res => {
        if (res.result.code === 200) {
          const { userInfo, publishedJobs, applications } = res.result.data;
          this.setData({
            userInfo: userInfo,
            stats: {
              postsCount: publishedJobs ? publishedJobs.length : 0,
              appliesCount: applications ? applications.length : 0,
              favoritesCount: 0
            }
          });
        }
      },
      fail: () => {
        wx.showToast({ title: '获取用户信息失败', icon: 'none' });
      }
    });
  },

  // 编辑头像
  onEditAvatarTap() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          'userInfo.avatarUrl': tempFilePath
        });
        wx.setStorageSync('userInfo', this.data.userInfo);
        wx.showToast({
          title: '头像更新成功',
          icon: 'success'
        });
      }
    });
  },

  // 导航到身份认证页面
  onNavigateToVerify() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    wx.navigateTo({
      url: '/pages/verify/index?userType=' + this.data.userType
    });
  },
  //我的发布
  onNavigateToMyPosts() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    wx.navigateTo({
        url: '/pages/job_management/job_management'
      });
    
  },

  onNavigateToMyApplies() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    wx.showModal({
        title: '提示',
        content: '功能开发中，敬请期待！',
        showCancel: false
      });
  },

  onNavigateToMyFavorites() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    wx.showModal({
      title: '提示',
      content: '功能开发中，敬请期待！',
      showCancel: false
    });
  },

  onNavigateToSettings() {
    wx.showModal({
      title: '提示',
      content: '功能开发中，敬请期待！',
      showCancel: false
    });
  },

  onNavigateToHelp() {
    wx.navigateTo({
      url: '/pages/help/index'
    });
  },

  onNavigateToAbout() {
    wx.navigateTo({
      url: '/pages/about/index'
    });
  },

  // 显示登录提示
  showLoginPrompt() {
    this.setData({
      showLoginDialog: true
    });
  },

  // 登录对话框确认
  onLoginDialogConfirm() {
    this.setData({ showLoginDialog: false });
    const that = this;
    wx.showActionSheet({
      itemList: ['校友', '老师', '学生'],
      success(res) {
        let userType = '';
        let role = '';
        if (res.tapIndex === 0) { userType = 'alumni'; role = '校友'; }
        if (res.tapIndex === 1) { userType = 'teacher'; role = '老师'; }
        if (res.tapIndex === 2) { userType = 'student'; role = '学生'; }
        let userInfo = that.data.userInfo || {};
        userInfo.role = role;
        userInfo.nickName = role + '用户';
        userInfo.isVerified = true;
        userInfo.userType = userType;
        that.setData({
          isLoggedIn: true,
          userType: userType,
          userInfo: userInfo
        });
        wx.setStorageSync('userType', userType);
        wx.setStorageSync('isLoggedIn', true);
        wx.setStorageSync('userInfo', userInfo);

      // ⭐️ 关键：把数据库里这个用户的 _id 存下来
      wx.cloud.database().collection('students')
      .where({ role: role })   // 这里你最好换成更唯一的条件，比如学号/手机号
      .get()
      .then(res => {
        if (res.data.length > 0) {
          wx.setStorageSync('userId', res.data[0]._id); // 存到本地
          console.log('登录成功，userId:', res.data[0]._id);
        }
      });
        wx.showToast({
          title: '已登录为' + role,
          icon: 'success'
        });
        that.updateUserProfile(userInfo);
      },
      fail() {
        wx.showToast({ title: '请先登录', icon: 'none' });
      }
    });
  },

  // 更新数据库中的用户信息
  updateUserProfile(userInfo) {
    wx.cloud.callFunction({
      name: 'updateUserProfile',
      data: { userInfo: userInfo },
      success: res => {
        if (res.result.code !== 200) {
          wx.showToast({
            title: '用户信息同步失败',
            icon: 'none'
          });
        }
      }
    });
  },

  onLoginDialogCancel() {
    this.setData({
      showLoginDialog: false
    });
  },

  // 退出或注销
  onAccountOptionsTap() {
    wx.showActionSheet({
      itemList: ['退出登录', '注销账号'],
      success: res => {
        if (res.tapIndex === 0) {
          this.logout();
        } else if (res.tapIndex === 1) {
          this.deleteAccount();
        }
      }
    });
  },

  // 退出登录
  logout() {
    wx.clearStorageSync();
    wx.showToast({ title: '已退出登录', icon: 'success' });
    setTimeout(() => { wx.reLaunch({ url: '/pages/user_profile/user_profile' }); }, 500);
  },

  // 注销账号
  deleteAccount() {
    wx.showModal({
      title: '提示',
      content: '注销账号后，您的个人数据将被删除且无法恢复，确认继续？',
      confirmText: '确认',
      cancelText: '取消',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ title: '正在注销...' });
          wx.cloud.callFunction({
            name: 'deleteUserAccount',
            data: { userType: this.data.userType },
            success: res => {
              wx.hideLoading();
              if (res.result.code === 200) {
                wx.clearStorageSync();
                wx.showToast({ title: '账号已注销', icon: 'success' });
                setTimeout(() => {
                  wx.reLaunch({ url: '/pages/user_profile/user_profile' });
                }, 1000);
              } else {
                wx.showToast({ title: res.result.message, icon: 'none' });
              }
            },
            fail: () => {
              wx.hideLoading();
              wx.showToast({ title: '注销失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  onUserInfoTap() {
    if (this.data.isLoggedIn) return;
    this.onLoginDialogConfirm();
  },

  // 职位统计
  onNavigateToTeacherStats() {
    if (!this.data.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }
    wx.navigateTo({
      url: '/pages/teacher_stats/teacher_stats'
    });
  }
});
