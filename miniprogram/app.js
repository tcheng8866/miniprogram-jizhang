var that
App({
  // 全局数据/方法
  globalData: {
    userInfo: null
  },
  onLaunch: function () {
    that = this;
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud-6jtgy',
        traceUser: true,
      })
    }
    // 检查版本升级
    if (wx.canIUse("getUpdateManager")) {
      // 检查是否存在新版本
      wx.getUpdateManager().onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        console.log("是否有新版本：" + res.hasUpdate);
        //如果有新版本
        if (res.hasUpdate) {
          console.log("************存在新版本************")
          wx.clearStorageSync()
          // 小程序有新版本，会主动触发下载操作（无需开发者触发）
          wx.getUpdateManager().onUpdateReady(function () {//当新版本下载完成，会进行回调
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，单击确定重启应用',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  wx.getUpdateManager().applyUpdate();
                }
              }
            })

          })
          // 小程序有新版本，会主动触发下载操作（无需开发者触发）
          wx.getUpdateManager().onUpdateFailed(function () {//当新版本下载失败，会进行回调
            wx.showModal({
              title: '提示',
              content: '检查到有新版本，但下载失败，请检查网络设置',
              showCancel: false,
            })
          })
        }
      })
    }
    console.log("************用户信息：加载************", JSON.stringify(that.globalData.userInfo))
    //用户静默登录
    that.auth_login()
  },
  auth_login: function () {
    // 获取存储信息[持久化、小程序销毁也不会丢]
    wx.getStorage({
      key: 'userInfo',
      success: function (res) {
        console.log("************用户信息：获取缓存************", JSON.stringify(res.data))
        that.globalData.userInfo = res.data
      },
      fail: function (err) {
        console.log("************用户信息：获取缓存: 失败************", JSON.stringify(err))
        // that.globalData.userInfo = res.data
      }
    })
  }
})
