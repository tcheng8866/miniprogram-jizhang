const db = wx.cloud.database();
const priveTable = db.collection("priveTable");

var app = getApp()
var that

Page({
  data: {
    shuaixuanimg: [
      { "img": "../../images/mr.png", "text": "默认" },
      { "img": "../../images/cy.png", "text": "餐饮" },
      { "img": "../../images/fs.png", "text": "服饰" },
      { "img": "../../images/zf.png", "text": "住房" },
      { "img": "../../images/jt.png", "text": "交通" },
      { "img": "../../images/gz.png", "text": "工资" },
      { "img": "../../images/lc.png", "text": "理财" },
      { "img": "../../images/qt.png", "text": "其他" },
    ],
    shuaixuanTypeimg: [
      { "img": "../../images/sr-h.png", "text": "收入", "status": "1" },
      { "img": "../../images/zc-h.png", "text": "支出", "status": "0" }
    ],
    dataList: [],   //数据
    year: new Date().getFullYear(),                 //当前年份
    month: (new Date().getMonth() + 1).toString(),  //当前月份
    q: 0, // 处理金钱格式 如.前面数字变大，后面变小(0.oo)
    h: 0,
    end: new Date().getFullYear() + "-" + (new Date().getMonth() + 1).toString(), //选择时间不能超过当前年月份
    addimgStyle: '',
    menuStyle: '',
    state: false,  //操作滚动条到顶部的状态
    tjimg: '../../images/tj-h.png',
    tjStyle: '',
    mximg: '../../images/rl-h.png',
    mxStyle: '',
    stopPageScroll: ''
  },
  onLoad(options) {
    // 1. onLoad => onShow => onReady  
    // 2. onShow 页面激活即执行（页面未销毁、先跳转其他再跳转回来）
    // 3. 此处that为全局变量、后续任何地方可用
    // 4. 页面数据仅查询一次就好了、其他的销毁后自动查询
    that = this;
    that.getDataList();
  },
  onShow() {
    this.setData({ tjimg: '../../images/tj-h.png', mximg: '../../images/rl-h.png', mxStyle: '', tjStyle: '' })
    if (this.data.state) { wx.pageScrollTo({ scrollTop: 0 }); this.setData({ state: false }) }
  },
  onReady() {
    wx.createSelectorQuery().selectAll(".bottom-box").boundingClientRect(function (res) {
      that.setData({ BottomBoxHeight: "height:" + res[0].height + "px;" })
    }).exec();
  },
  getDataList() {
    wx.showLoading({ title: '' });  //loading加载
    wx.cloud.callFunction({         //云函数调用
      name: 'getListData',          //云函数名称
      data: {                       //参数为当前年月的数据 （格式：2019-06）
        timeDaty: that.data.year + "-" + (that.data.month.length == 1 ? "0" + that.data.month : that.data.month)
      }
    }).then(res => {
      wx.hideLoading();                 //隐藏loading
      console.log(res)
      var data = res.result.data;
      console.log(data)
      if (data.length !== 0) {
        var JL = 0;
        for (var i in data) {
          var shouru = 0;
          var zhichu = 0;
          if (data[i].dataList.length !== 0) {
            JL += 1;
          }
          if (data.length - 1 == i) {         //到最后一次循环如果JL=0就删除掉这条数据，因为这条数据里面没有子数据
            if (JL === 0) { priveTable.doc(data[i]._id).remove({}).then(res => { that.getDataList() }).catch(err => { console.log(err) }) }
          }
          for (var j in data[i].dataList) {
            if (data[i].dataList[j].status == 0) {
              zhichu -= Number(data[i].dataList[j].prive) //循环算出当天支出总数
            } else {
              shouru += Number(data[i].dataList[j].prive)//循环算出当天收入总数
            }
          }
          data[i].shouru = shouru.toFixed(2);
          data[i].zhichu = zhichu.toFixed(2);
        }
      }
      that.setData({ dataList: data }); //更新视图
      that.totalPricefun();   //计算当前月份（总支出）（总收入） //处理金钱格式 如.前面数字变大，后面变小(0.oo)
    }).catch(err => {
      console.log(err);
      wx.hideLoading();
      // that.getDataList();
    })
  },
  //选择日期监听
  bindDateChange: function (e) {
    var e = e.detail.value;
    var index = e.indexOf("-");
    if (e !== (that.data.year + that.data.month)) {
      //如果选中的年月跟当前的不相等就重新加载数据
      this.setData({      //跟新选中的年月
        year: e.substring(0, index),
        month: e.substring(index + 1, e.length)
      })
      this.getDataList(); //重新加载数据
    }
  },
  gettotalzc() {  //算出当前月份总支出金额
    let total = 0;
    for (let item of that.data.dataList) {
      for (let items of item.dataList) {
        if (items.status == 0) {
          total -= Number(items.prive);
        }
      }
    }
    return total.toFixed(2);
  },
  //算出当前月份总收入金额
  gettotalsr() {
    let total = 0;
    for (let item of that.data.dataList) {
      for (let items of item.dataList) {
        if (items.status == 1) {
          total += Number(items.prive);
        }
      }
    }
    return total.toFixed(2);
  },
  //处理金钱格式 如.前面数字变大，后面变小(0.oo)
  totalPricefun() {
    that.priceq(that.gettotalsr(), function (q) { that.setData({ s: q }) });
    that.priceh(that.gettotalsr(), function (h) { that.setData({ r: h }) });
    that.priceq(that.gettotalzc(), function (q) { that.setData({ z: q }) });
    that.priceh(that.gettotalzc(), function (h) { that.setData({ c: h }) });
  },
  addfunc(e) {
    wx.vibrateShort();  //震动
    if (this.data.menuStyle == "") {
      this.setData({ addimgStyle: 'transform: rotate(45deg);', menuStyle: 'transform: rotate(0deg);transition: all .3s;' })
    } else if (this.data.menuStyle == "transform: rotate(0deg);transition: all .3s;") {
      this.setData({ addimgStyle: '', menuStyle: 'transform: rotate(180deg);transition: all .3s;' });
      setTimeout(() => { this.setData({ addimgStyle: '', menuStyle: '' }); }, 300);
    } else {
      console.log("else")
    }
  },
  zcfun(e) {
    if (app.globalData.userInfo == null) {
      // 2101年4月后上线小程序 getUserInfo 不会弹授权框、获取不到用户微信昵称（返回'微信用户'），之前上线的小程序不受影响
      // 以前的获取一次，永久有效，除非用户取消授权
      // 现在 每一次使用都要重新获取、所以要存起来，存在app全局 杀掉进程后也会消失
      // wx.navigateTo({ url: '../user/user' });
      wx.navigateTo({ url: '../auth/auth' });
    } else {
      wx.navigateTo({ url: '../add/add?status=0' });  //跳转记账页面 参数status = 0 是支出的状态
      this.setData({ addimgStyle: '', menuStyle: 'transform: rotate(180deg);transition: all .3s;' });
      setTimeout(() => { this.setData({ addimgStyle: '', menuStyle: '' }); }, 300);
    }
  },
  srfun(e) {
    if (app.globalData.userInfo == null) {
      // wx.navigateTo({ url: '../user/user' });
      wx.navigateTo({ url: '../auth/auth' });
    } else {
      wx.navigateTo({ url: '../add/add?status=1' });   //跳转记账页面 参数status = 1 是收入的状态
      this.setData({ addimgStyle: '', menuStyle: 'transform: rotate(180deg);transition: all .3s;' });
      setTimeout(() => { this.setData({ addimgStyle: '', menuStyle: '' }); }, 300);
    }
  },
  goDetailfun(e) {
    var index = e.currentTarget.dataset.index;
    var _id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../detail/detail?_id=' + _id + '&index=' + index, //跳转详情页 参数是数据的id index是索引，用索引获取该数据的子数据
    })
  },
  priceq(num, callback) {
    var str = num.toString();
    var index = str.indexOf(".");
    if (index !== -1) {
      var q = str.substring(0, index);
      callback(q);
    }
  },
  priceh(num, callback) {
    var str = num.toString();
    var index = str.indexOf(".");
    if (index !== -1) {
      var q = str.substring(index, str.length);
      callback(q);
    }
  },
  mxfun() {
    wx.vibrateShort();
    this.setData({ mximg: "../../images/rl.png", mxStyle: 'color: #FADA63;' })
    wx.navigateTo({ url: '../record/record' })
  },
  tjfun() {
    wx.vibrateShort();
    this.setData({ tjimg: '../../images/tj.png', tjStyle: 'color: #FADA63;' })
    wx.navigateTo({ url: '../count/count' })
  },
  shuaixuanfun() {
    this.setData({ stopPageScroll: "stopPageScroll", shuaixuanboxBottom: 'bottom:0' })
  },
  close() {
    this.setData({ stopPageScroll: '', shuaixuanboxBottom: 'bottom:-100%' })
    console.log("执行")
  },
  goimgfun(e) {
    // navigateTo 当前页面和要跳转页面有层级关系，不会销毁【有返回】
    // redirectTo 这个左上角【无返回有主页】、会销毁当前，点主页回主页会刷新页面数据
    wx.redirectTo({
      url: '../sort/sort?status=' + e.currentTarget.dataset.status
    })
    this.setData({ stopPageScroll: '', shuaixuanboxBottom: 'bottom:-100%' })
  },
  stopPageScroll() { return }
})
