// pages/apply/takePic.js
var commonData = require('../../utils/data.js')
var commonUtil = require('../../utils/util.js')
Page({
    data: {
        'picSrc1': '../../images/camera.png',
        'picSrc2': '../../images/camera.png',
        'picSrc3': '../../images/camera.png',
        'imgClass1': 'camera-img',
        'imgClass2': 'camera-img',
        'imgClass3': 'camera-img',
        'textShow1': true,
        'textShow2': true,
        'textShow3': true,
        'btnDisabled': false,
        'AuthJnlNo': null
    },
    uploadNum: 0,
    uploadSuccessNum: 0,
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
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

    takePic1: function (e) {
        var that = this;
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                console.log(res)
                that.setData({'picSrc1': res.tempFilePaths[0], 'imgClass1': 'camera-img-after', 'textShow1': false});

            }
        });
    },

    takePic2: function () {
        var that = this;
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'],
            sourceType: ['camera'],
            success: function (res) {
                that.setData({'picSrc2': res.tempFilePaths[0], 'imgClass2': 'camera-img-after', 'textShow2': false});
            }
        });
    },

    takePic3: function () {
        var that = this;
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'],
            sourceType: ['camera'],
            success: function (res) {
                that.setData({'picSrc3': res.tempFilePaths[0], 'imgClass3': 'camera-img-after', 'textShow3': false});
            }
        });
    },

    checkData: function () {
        if (this.data.picSrc1.indexOf('camera.png') > -1) {
            commonUtil.wx_showModal('请拍摄身份证正面照片');
            return false;
        }
        if (this.data.picSrc2.indexOf('camera.png') > -1) {
            commonUtil.wx_showModal('请拍摄身份证反面照片');
            return false;
        }
        if (this.data.picSrc3.indexOf('camera.png') > -1) {
            commonUtil.wx_showModal('请拍摄人脸照片');
            return false;
        }
        return true;
    },

    //开始上传
    doIt: function () {
        if (!this.checkData()) {
            return;
        }
        var that = this;

        var fileList = [this.data.picSrc1, this.data.picSrc2, this.data.picSrc3];
        var uploadUrl = commonData.getConstantData('serverURL') + 'LoanCifImgUpload.do';
        this.setData({showLoading: true, btnDisabled: true});

        uploadImgs();

        function uploadImgs() {
            uploadOne(uploadUrl, fileList[that.uploadNum], that.uploadNum + 1);
        }

        function uploadOne(uploadUrl, tmpFilePath, imgIndex) {
            console.log('上传第' + imgIndex + '张照片.');
            console.log('url:' + uploadUrl);
            console.log('filePath:' + tmpFilePath);
            wx.uploadFile({
                url: uploadUrl,
                filePath: tmpFilePath,
                name: 'UploadFile',
                formData: {
                    SimSessionId: getApp().globalData.simSessionId,
                    ImgIndex: Number(imgIndex),
                    IdNo: getApp().globalData.idNo,
                    _locale: 'zh_CN',
                    LoginType: 'R',
                    ClientType: 'Client'
                },
                success: function (res) {
                    var data = res.data
                    if (res.statusCode == 200) {
                        afterUpload(true);
                    } else {
                        afterUpload(false);
                    }
                },
                fail: function () {
                    afterUpload(false);

                }
            });
        }

        function afterUpload(flag) {
            console.log("upload callback: " + flag);
            that.uploadNum++;
            if (flag) {
                that.uploadSuccessNum++;
            }
            if (that.uploadNum == 3) {
                if (that.uploadSuccessNum == 3) {
                    wx.redirectTo({
                        url: '../apply/apply'
                    })
                } else {
                    commonUtil.wx_showModal('上传照片失败，请重试');
                    that.setData({showLoading: false, btnDisabled: false});
                }
            } else {
                uploadImgs();
            }

        }

    },
})