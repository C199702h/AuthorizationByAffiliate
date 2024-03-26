// pages/query/applyInfo.js
var commonUtil = require('../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        readFlag: false,
        radios: [
            {
                name: 'coborrower',
                value: '我同意作为该笔贷款的共同借款人',
            },
            {
                name: 'coresponser',
                value: ' 我同意作为该笔贷款的连带责任保证人',
            }
        ]
    },
    radioChange: function (e) {
        console.log('radio发生change事件，携带value值为：', e.detail.value);
        this.setData({Checked: true});
        getApp().identity = e.detail.value;
        getApp().globalData.identity = e.detail.value;
        console.log(getApp().identity);
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({'borrowerName': options.borrowerName});//借款人姓名
        this.setData({'term': options.term});//借款期限
        this.setData({'applyAmount': options.applyAmount});//借款金额
        this.setData({'idNo': options.idNo});
        //var sqxh = getApp().applyId;这个作为全局变量只要APP实例在，无论什么时候都可取出
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

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
    bindGotoRight: function () {
        this.setData({readFlag: true});
        wx.navigateTo({
            url: 'right'
        });
    },
    coBorrowerInfoInput: function (e) {
        if (this.data.readFlag) {
            wx.showModal({
                title: '',
                content: '我了解并清楚作为共同借款人和连带责任负责保证人的权利义务',
                showCancel: true,//不显示取消按钮
                success: function (res) {
                    if (res.confirm) {
                        //点击确定后，返回前一页面
                        wx.navigateTo({
                            url: '../apply/apply?ClientRole=' + getApp().identity
                        });
                    }
                }
            })
        } else {
            commonUtil.wx_showModal('请先阅读《作为共同借款人和连带责任负责保证人的权利义务》');
            return false;
        }
    }
})