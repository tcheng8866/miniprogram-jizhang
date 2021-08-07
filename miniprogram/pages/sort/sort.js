import { getCurDateFmt } from "../../uits/uits.js";

var app = getApp();
var that;

Page({
  data: {
    listData: [],
    active01: 'active',
    active02: '',
    end: new Date().getFullYear() + "-" + (new Date().getMonth() + 1).toString(), //选择时间不能超过当前年月份
    date: new Date().getFullYear() + "-" + ((new Date().getMonth() + 1).toString().length == 1 ? "0" + (new Date().getMonth() + 1).toString() : (new Date().getMonth() + 1).toString()),
  },
  onLoad: function (options) {
    this.setData({ options: options })
    that = this;
    // 收入/支出   按月/按年
    this.getMonthYearData(this.data.options.status);
  },
  // 云函数查询所有
  getMonthYearData(status) {
    wx.cloud.callFunction({
      name: 'allDataList'
    }).then(res => {
      console.log(res)
      var temp = [];
      // 处理数据层级
      for (var i in res.result.data) {
        for (var j in res.result.data[i].dataList) {
          // 筛选支出或收入
          if (res.result.data[i].dataList[j].status == status) {
            res.result.data[i].dataList[j].createdTime = res.result.data[i].createdTime;
            res.result.data[i].dataList[j].timeDaty = res.result.data[i].timeDaty;
            res.result.data[i].dataList[j].year = res.result.data[i].year
            temp.push(res.result.data[i].dataList[j])
          }
        }
      }
      var listData = [];
      // 处理按月、按年逻辑
      if (this.data.active01 == 'active') {
        temp.map(item => {
          if (item.timeDaty == getCurDateFmt()) {
            listData.push(item)
          }
        })
      } else {
        temp.map(item => {
          if (item.year == new Date().getFullYear()) {
            listData.push(item)
          }
        })
      }
      that.setData({ listData: listData })
    })
  },
  shourufun() {
    this.setData({
      active01: "active",
      active02: ""
    })
    this.getMonthYearData(this.data.options.status);
  },
  zhichufun() {
    this.setData({
      active01: "",
      active02: "active",
    })
    this.getMonthYearData(this.data.options.status);
  }
})