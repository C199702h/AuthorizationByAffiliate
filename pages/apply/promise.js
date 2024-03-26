var commonUtil = require('../../utils/util.js')

// pages/apply/promise.js
Page({
    data: {},
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        this.setData({'identity': getApp().globalData.identity})
        this.calculateAge(getApp().globalData.idNo);
        this.setData({'userName': getApp().globalData.clientName});
        this.setData({'certNo': getApp().globalData.idNo});
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        // 页面显示
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    },
    bindClose: function () {
        wx.navigateBack({
            delta: 1 // 回退前 delta(默认为1) 页面
        });
    },
    calculateAge(idNo) {
        if (idNo.length == 15) {
            var birth = '19' + idNo.substr(6, 6);
        } else if (idNo.length == 18) {
            var birth = idNo.substr(6, 8);
        } else {
            commonUtil.wx_showModal('身份证识别有误')
        }
        var year = (parseInt(birth.substr(0, 4)) + 14).toString();

        var month = parseInt(birth.substr(4, 2)) - 1;
        var date = birth.substr(6, 2);
        console.log(year + '--' + month + '--' + date)
        var newTime = new Date(year, month, date);
        var now = new Date();
        if (now > newTime) {
            this.setData({'ffixed': true});
        } else {
            this.setData({'ffixed': false});
        }
        var nowYear = now.getFullYear();
        var nowMonth = now.getMonth() + 1 > 10 ? (now.getMonth() + 1) : '0' + (now.getMonth() + 1);
        var nowDate = now.getDate() > 10 ? now.getDate() : '0' + now.getDate();
        var nowTime = nowYear + '-' + nowMonth + '-' + nowDate;
        this.setData({'nowTime': nowTime});
    }
})