var app = getApp();
var that;

Page({
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: ''
    },
    hasUserInfo: false,
    canIUseGetUserProfile: false, // 走老版 open-type="getUserInfo"
  },
  onLoad() {
    that = this;
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true  // 走新版 bindtap="getUserProfile"
      })
      // 判断是否已存在用户信息
      wx.getSetting({
        success: res => {
          console.log("authSetting", res.authSetting)
          if (res.authSetting['scope.userInfo']) {
            this.getUserProfile()
          }
        }
      })
    }
  },

  // pc端获取不到 getUserProfile 这个方法
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善完善展示资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        // 全局更新
        app.globalData.userInfo = this.data.userInfo
        // 授权后延时返回
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,  // 返回上一级页面。
            success: function () {
              console.log('成功！')
            }
          })
        }, 100)
      }
    })
  },

  // pc端 button 通过绑定 open-type="getUserInfo"  e 可以获得真实用户信息
  // 手机端  只会 返回【微信用户 - 默认灰色图像】
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    // 全局更新【小程序进程杀掉会丢失】
    app.globalData.userInfo = this.data.userInfo
    // [持久化、小程序销毁也不会丢]
    wx.setStorageSync('userInfo', this.data.userInfo)
    // 授权后延时返回
    setTimeout(() => {
      wx.navigateBack({
        delta: 1,  // 返回上一级页面。
        success: function () {
          console.log('成功！')
        }
      })
    }, 100)
  },
})