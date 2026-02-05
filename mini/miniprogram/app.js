// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-7gqppbth576f837b',
        traceUser: true
      })
    }
    // ✅ 在这里加载本地字体
   wx.loadFontFace({
    family: 't', 
    source: 'url("assets/fonts/t.woff")',
    success(res) {
      console.log('字体加载成功', res)
    },
    fail(err) {
      console.error('字体加载失败', err)
    }
  })
  },
  globalData: {
    userInfo: null
  }

})