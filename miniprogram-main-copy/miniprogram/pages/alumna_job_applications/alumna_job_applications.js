// pages/alumna_job_applications/alumna_job_applications.js
Page({
    data: {
      applicantList: [],
      loading: false
    },
  
    onShow() {
      this.fetchAlumniApplicants();
    },
  
    async fetchAlumniApplicants() {
      if (this.data.loading) return;
      this.setData({ loading: true });
  
      try {
        const res = await wx.cloud.callFunction({
          name: 'alumniGetApplicants',
          data: {
            // 强行指定校友 ID，绕过 wxContext.OPENID
            mockOpenID: 'otHlL15qE43GuPjpiBf2IXRi98Qo' 
          },
        });
  
        if (res.result && res.result.code === 200) {
          // 增加一个模拟的时间格式化转换（可选）
          const formattedList = res.result.data.map(item => ({
            ...item,
            applyTime: item.applyTime ? item.applyTime.split('T')[0] : '最近'
          }));
          
          this.setData({
            applicantList: formattedList,
            loading: false
          });
        }
      } catch (err) {
        console.error(err);
        this.setData({ loading: false });
      }
    },
  
    // 实现下拉刷新
    async onPullDownRefresh() {
      await this.fetchAlumniApplicants();
      wx.stopPullDownRefresh();
      wx.vibrateShort(); // 刷新成功给一个触感反馈
    },
  
    goToPost() {
      wx.switchTab({ url: '/pages/job_detail/job_detail' }); // 或者跳转到发布页
    }
  })