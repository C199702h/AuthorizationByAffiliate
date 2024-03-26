//index.js
var commonUtil = require('../../utils/util.js')
var commonData = require('../../utils/data.js')
//获取应用实例
var app = getApp()
Page({
    data: {
        userInfo: {}
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: function () {
        var url = commonData.getConstantData('serverURL') + 'Sm4EncryptQry.do?' + "_locale=zh_CN&LoginType=R&ClientType=Client&MacAddress=ccvenus123456&TerminalType=undefined&TerminalId=undefined&"
        wx.request({
            url: url,
            data: this.data.SimSessionId,
            method: 'POST',
            dataType: '',
            success: function (res) {
                getApp().globalData.sm4Encrypt = res.data.Flag == 'false' ? false : true;
                wx.redirectTo({
                    url: '../query/query'
                    //url: '../apply/apply'
                });
            },
            fail: function () {
                getApp().globalData.sm4Encrypt = true;
                wx.redirectTo({
                    url: '../query/query'
                    //url: '../apply/apply'
                });
            }
        })


    },
})
