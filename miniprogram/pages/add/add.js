import {
  getWeek,
  getCurDate,
  getCurDateFmt,
} from "../../uits/uits.js";

const db = wx.cloud.database();
const _ = db.command;
const priveTable = db.collection("priveTable");
var that;
Page({
  data: {
    iconStatus0: [],
    idx: 0,
    formData: [
      { type: "text", label: "备注", name: "remark", labelStyle: "", inputStyle: '', changeEven: "changeremark", value: '' },
      { type: "digit", label: "金额", name: "price", labelStyle: "", inputStyle: '', changeEven: "changeremark", value: '' }
    ],
    btnlodingstatue: false,
    formSubmit: "formSubmit",
    end: new Date().getFullYear() + "-" + (new Date().getMonth() + 1).toString() + "-" + (new Date().getDate()).toString(),
    // date: '今天',
    date: getCurDate(),
    year: (new Date().getFullYear()).toString(),
    month: (new Date().getMonth() + 1).toString(),
    day: (new Date().getDate()).toString(),
    formId: ''
  },
  onLoad(options) {
    that = this;
    that.setData({ options: options });
    if (options.status == 0) { //0是支出，展示支出的图标
      this.setData({
        iconStatus0: [
          { src: '../../images/mr.png', title: '默认', name: 'mr.png' },
          { src: '../../images/cy.png', title: '餐饮', name: 'cy.png' },
          { src: '../../images/fs.png', title: '服饰', name: 'fs.png' },
          { src: '../../images/zf.png', title: '住房', name: 'zf.png' },
          { src: '../../images/jt.png', title: '交通', name: 'jt.png' },
          { src: '../../images/qt.png', title: '其他', name: 'qt.png' }
        ]
      })
    } else {                    //否则展示收入的图标
      this.setData({
        iconStatus0: [
          { src: '../../images/mr.png', title: '默认', name: 'mr.png' },
          { src: '../../images/gz.png', title: '工资', name: 'gz.png' },
          { src: '../../images/lc.png', title: '理财', name: 'lc.png' },
          { src: '../../images/qt.png', title: '其他', name: 'qt.png' }
        ]
      })
    }
  },
  changeremark(e) {   //输入框的监听
    var value = e.detail.value;
    var index = e.currentTarget.dataset.index;
    var formData = that.data.formData;
    if (value == "") {
      this.setData({
        ["formData[" + index + "].labelStyle"]: "",
        ["formData[" + index + "].inputStyle"]: ""
      });
    } else {
      for (var item of formData) {
        item.labelStyle = ""
      }
      this.setData({
        ["formData[" + index + "].labelStyle"]: "font-size:26rpx; top:20rpx;",
        ["formData[" + index + "].inputStyle"]: "top:26rpx;"
      });
    }
    this.setData({
      ["formData[" + index + "].value"]: value,
    });
  },
  formSubmit(e) {
    console.log(e)
    var formId = e.detail.formId;
    var e = e.detail.value;
    if (that.data.formData[0].value !== "" && that.data.formData[1].value !== "") {
      that.setData({ btnlodingstatue: true, formSubmit: '', formId: formId });
      var obj = {
        prive: that.data.formData[1].value,
        remark: that.data.formData[0].value,
        status: that.data.options.status,
        icon: "../../images/" + that.data.iconStatus0[that.data.idx].name
      }
      // 云函数新增日期
      wx.cloud.callFunction({
        name: 'addListData',
        data: {
          createdTime: that.data.date == "今天" ? getCurDateFmt("年月日星期") : that.data.date + " " + getWeek(that.data.year, that.data.month, that.data.day)
        }
      }).then(res => {
        console.log(res)
        if (res.result.data.length !== 0) {
          that.addfun(res.result.data[0]._id, obj);
        } else {
          var date = that.data.date;
          var year = date.split("-");
          // 前端操作云数据库  添加日期
          priveTable.add({
            data: {
              createdTime: that.data.date == "今天" ? getCurDateFmt("年月日星期") : that.data.date + " " + getWeek(that.data.year, that.data.month, that.data.day),
              timeDaty: that.data.date == "今天" ? getCurDateFmt("年月") : that.data.YM,
              year: year[0] == "今天" ? (new Date().getFullYear()).toString() : year[0],
              dataList: [],
            }
          }).then(res => {
            that.addfun(res._id, obj);
          }).catch(err => {
            console.log(err)
            that.formSubmit();
          })
        }
      }).catch(err => { console.log(err); that.formSubmit(); })
    } else {
      if (that.data.formData[0].value == "") {
        wx.showToast({
          title: '备注不能为空',
          icon: 'none',
          mask: true
        });
      } else {
        wx.showToast({
          title: '金额不能为空',
          icon: 'none',
          mask: true
        })
      }
    }
  },
  addfun(_id, obj) {
    var keyworddata = {
      keyword1: { value: obj.status == 0 ? "支出" : "收入" },//记账类型
      keyword2: { value: obj.prive },//金额
      keyword3: { value: obj.remark },//原因备注
      keyword4: { value: getCurDateFmt("年月日星期") },//记账时间
    }
    priveTable.doc(_id).update({
      data: {
        dataList: _.unshift(obj)
      }
    }).then(res => {
      if (res.errMsg == "document.update:ok") {
        that.sendMoban(keyworddata);
        wx.showToast({
          title: '记账成功',
          icon: 'none',
          mask: true
        });
        setTimeout(() => { that.setData({ btnlodingstatue: false, formSubmit: 'formSubmit' }); wx.navigateBack({ delta: 1 }) }, 500)
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];
        var prevPage = pages[pages.length - 2];
        prevPage.setData({ state: true, year: that.data.year, month: that.data.month });
        prevPage.getDataList();
      } else {
        wx.showToast({
          title: '记账失败',
          icon: 'none',
          mask: true
        });
      }
    }).catch(err => {
      console.log(err)
      that.formSubmit();
    })
  },
  sendMoban(keyworddata) {
    wx.cloud.callFunction({
      name: 'moban',
      data: {
        data: keyworddata,
        formId: that.data.formId
      }
    }).then(res => { console.log("模板成功回调"); console.log(res) })
      .catch(err => { console.log("模板失败回调"); console.log(err) })
  },
  imgfun(e) {
    var e = e.currentTarget.dataset.index;
    this.setData({ idx: e })
  },
  bindDateChange: function (e) {
    var value = e.detail.value;
    this.setData({ date: value })
    var YM = value.split("-");
    this.setData({
      date: value,
      YM: YM[0] + "-" + YM[1],
      year: YM[0],
      month: YM[1],
      day: YM[2],
    });
    console.log(that.data.date + " " + getWeek(YM[0], YM[1], YM[2]));
    console.log(that.data.YM)
  },
})
