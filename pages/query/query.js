// pages/query/query.js
var commonData = require('../../utils/data.js')
var commonUtil = require('../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        SMSButtonText: '获取验证码',
        ImgSrc: ''
    },
    timerHandle: null,
    maxTime: 90,
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        // 页面渲染完成
        //this.setData({ 'applyId': '2033041200000002' });
        // this.setData({ 'CifManager': '003016' });
        //this.setData({ 'MobilePhoneNo': '18682373918' });
        //this.setData({ '_vTokenName': '1234' });
        //this.setData({ 'SmsPassword': '123456' });
        //this.setData({ 'OtpUUID': '123456' });

        this.refreshImgToken();
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    refreshImgToken: function (e) {
        var that = this;
        commonUtil.wx_request_pmf({
            url: 'GenTokenImgNoSession.do',
            method: 'GET',
            data: {
                SimSessionId: this.data.SimSessionId
            },
            page: this,
            success: function (res) {
                var imgSrc = res.data.ImgTokenBase64;
                that.setData({'ImgSrc': imgSrc});
                if (!!res.header['Set-Cookie']) {
                    var sc = res.header['Set-Cookie'];
                    wx.setStorageSync('cookie', res.header['Set-Cookie'])
                }

            }
        });
    },
    bindblur_VToken: function (e) {
        if (!commonUtil.validator(this.data._vTokenName, 'VToken')) {
            commonUtil.wx_showModal('图形验证码格式不正确，请重新输入');
            return false;
        }
    },
    queryLoanInfo: function (e) {
        var that = this;
        var app = getApp();
        if (!this.data.applyId) {
            commonUtil.wx_showModal('请输入申请编号');
            return false;
        }
        if (!this.data.CifManager) {
            commonUtil.wx_showModal('请输入客户经理工号');
            return false;
        }
        if (!this.data._vTokenName) {
            commonUtil.wx_showModal('请输入图形验证码');
            return false;
        }
        if (this.data.applyId.length < 16) {
            commonUtil.wx_showModal('申请编号长度错误');
            return false;
        }
        if (this.data.CifManager.length < 6) {
            commonUtil.wx_showModal('客户经理工号长度错误');
            return false;
        }
        if (!this.data.SmsPassword) {
            commonUtil.wx_showModal('请输入短信验证码');
            //return false;
        }
        if (!this.data.OtpUUID) {
            commonUtil.wx_showModal('请先获取短信验证码');
            //return false;
        }
        app.globalData.ApplyId = this.data.applyId;
        app.globalData.CifManager = this.data.CifManager;
        app.globalData.MobilePhoneNo = this.data.MobilePhoneNo;
        app.globalData._vTokenName = this.data._vTokenName;
        commonUtil.wx_request_pmf({
            url: 'LoanStateQrybyApplyId.do',
            data: {
                ApplyId: this.data.applyId,
                ManagerNo: this.data.CifManager,
                _vTokenName: this.data._vTokenName,
                MobilePhoneNo: this.data.MobilePhoneNo,
                SmsPassword: this.data.SmsPassword,
                OtpUUID: this.data.OtpUUID,
                ObjectSource: 1
            },
            page: this,
            success: function (res) {
                that.stopTimer();
                //暂时先注调
                var borrowerName = res.data.borrowerName;//借款人姓名
                var term = res.data.term;//借款期限
                var applyAmount = res.data.applyAmount;//借款金额
                var idNo = res.data.certId;
                var applyStatus = res.data.LoanApplyStatus;//
                var mobilePhoneNo = this.data.MobilePhoneNo;
                var smsPassword = this.data.SmsPassword;
                var idNoShiled = "";
                if (idNo != null && idNo != "") {
                    idNoShiled += idNo.substring(0, 6);
                    idNoShiled += "********";
                    idNoShiled += idNo.substring(14);
                }
                //接口暂无
                if (applyStatus == 0) {
                    //在这里加逻辑,不允许的交易分支
                } else {
                    //审批中或者审批通过，允许的交易分支
                    wx.navigateTo({
                        url: '../query/applyInfo?borrowerName=' + borrowerName + '&term=' + term + '&applyAmount=' + applyAmount + '&idNo=' + idNoShiled
                    });
                }
            },
            fail: function (e) {
                //可以先把跳转放在这边，把数据值先写死
                wx.showModal({
                    title: '',
                    content: e.data,
                })

                that.stopTimer();
            }
        });
    },
    changeTimerText: function () {
        if (this.maxTime > 0) {
            this.maxTime--;
            this.setData({SMSButtonText: '' + this.maxTime + '秒后可重新获取'});
        } else {
            this.stopTimer();
        }

    },

    startTimer: function () {
        this.timerHandle = setInterval(this.changeTimerText, 1000);
    },

    stopTimer: function () {
        this.setData({SMSButtonText: '获取验证码'});
        clearInterval(this.timerHandle);
        this.maxTime = 90;
        this.setData({SmsBtnLoading: false, SmsBtnDisabled: false});
    },

    //获取短信验证码
    getSMS: function () {
        if (!commonUtil.validator(this.data.MobilePhoneNo, "PhoneNumber")) {
            commonUtil.wx_showModal('手机号格式错误');
            return;
        }
        var data = '';
        if (getApp().globalData.sm4Encrypt) {
            data = {
                MobilePhoneNo: this.data.MobilePhoneNo,
                _vTokenName: this.data._vTokenName,
                IdNo: '440303198906058510',
                ClientName: '叶雄',
                MChannelId: 'MINI'
            }
        } else {
            data = 'MobilePhoneNo=' + this.data.MobilePhoneNo + '&_vTokenName=' + this.data._vTokenName + '&IdNo=440303198906058510&ClientName=叶雄&MChannelId=MINI';
        }

        var that = this;
        var setcookie = wx.getStorageSync('cookie');
        this.setData({SmsBtnLoading: true, SmsBtnDisabled: true});
        commonUtil.wx_request_pmf({
            url: 'LoanSMSPasswordApply.do',
            header: {'Cookie': setcookie},
            data: data,
            page: this,
            success: function (res) {

                that.setData({
                    OtpUUID: res.data.OtpUUID,
                    SMSButtonText: that.maxTime + '秒后可重新获取',
                    SmsBtnLoading: false
                });
                that.startTimer();
                that.setData({});
            },
            fail: function () {
                that.setData({SmsBtnLoading: false, SmsBtnDisabled: false});
                that.refreshImgToken();
            }
        });
    },
    applyIdInput: function (e) {
        this.setData({'applyId': e.detail.value});
    },
    VTokenInput: function (e) {
        this.setData({'_vTokenName': e.detail.value});
    },
    CifManagerInput: function (e) {
        this.setData({'CifManager': e.detail.value});
    },
    SMSinput: function (e) {
        this.setData({'SmsPassword': e.detail.value});
    },
    Phoneinput: function (e) {
        this.setData({'MobilePhoneNo': e.detail.value});
    }
})