// pages/apply/apply.js
var commonData = require('../../utils/data.js')
var commonUtil = require('../../utils/util.js')
var encrypt = require('../../utils/encrypt.js');
const {Base64} = require('../../utils/util.js');
Page({
    data: {
        'attendSuccessImg': '',
        'canvasImgUrl': '',
        'picSrc1': '../../images/camera.png',
        'picSrc2': '../../images/camera.png',
        'imgClass1': 'camera-img',
        'imgClass2': 'camera-img',
        'textShow1': true,
        'textShow2': true

    },
    uploadNum: 0,
    uploadSuccessNum: 0,

    // 点击照相
    takePic1: function () {
        var that = this;
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths;
                that.setData({
                    'attendSuccessImg': tempFilePaths[0],
                    'picSrc1': tempFilePaths[0],
                    'imgClass1': 'camera-img-after',
                    'textShow1': false
                });

                // 根据图片大小缩放图片
                wx.getImageInfo({
                    src: tempFilePaths[0],
                    success: function (res) {
                        console.log(res);
                        var width;
                        var height;
                        if (res.width > 600 & res.height > 600) {
                            width = res.width;
                            height = res.height;
                            do {
                                width = width / 2;
                                height = height / 2;
                            } while (height > 600 | width > 600)
                        } else if (res.width > 600 | res.height > 600) {
                            width = res.width / 2;
                            height = res.height / 2;
                        } else if (res.width > 300 & res.height > 300) {
                            width = res.width * 0.66;
                            height = res.height * 0.66;
                        } else {
                            width = res.width;
                            height = res.height;
                        }
                        drawCanvas(width, height);
                    }
                })

                // 生成图片
                function drawCanvas(width, height) {
                    console.log(width + ',' + height);
                    const ctx = wx.createCanvasContext('myCanvas');
                    ctx.drawImage(tempFilePaths[0], 0, 0, width, height);
                    ctx.draw(false, function () {
                        wx.canvasToTempFilePath({
                            canvasId: 'myCanvas',
                            fileType: 'jpg',
                            width: width,
                            height: height,
                            destWidth: width,
                            destHeight: height,
                            success: function (res) {
                                that.setData({
                                    'canvasImgUrl': res.tempFilePath
                                });
                                console.log(res.tempFilePath);
                                that.getPhotoData(0);
                            },
                            complete: function complete(e) {

                            }
                        })
                    });
                }
            }
        });
    },

    takePic2: function () {
        var that = this;
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths;
                that.setData({
                    'attendSuccessImg': tempFilePaths[0],
                    'picSrc2': tempFilePaths[0],
                    'imgClass2': 'camera-img-after',
                    'textShow2': false
                });

                // 根据图片大小缩放图片
                wx.getImageInfo({
                    src: tempFilePaths[0],
                    success: function (res) {
                        console.log(res);
                        var width;
                        var height;
                        if (res.width > 600 & res.height > 600) {
                            width = res.width;
                            height = res.height;
                            do {
                                width = width / 2;
                                height = height / 2;
                            } while (height > 600 | width > 600)
                        } else if (res.width > 600 | res.height > 600) {
                            width = res.width / 2;
                            height = res.height / 2;
                        } else if (res.width > 300 & res.height > 300) {
                            width = res.width * 0.66;
                            height = res.height * 0.66;
                        } else {
                            width = res.width;
                            height = res.height;
                        }
                        drawCanvas(width, height);
                    }
                })

                // 生成图片
                function drawCanvas(width, height) {
                    console.log(width + ',' + height);
                    const ctx = wx.createCanvasContext('myCanvas2');
                    ctx.drawImage(tempFilePaths[0], 0, 0, width, height);
                    ctx.draw(false, function () {
                        wx.canvasToTempFilePath({
                            canvasId: 'myCanvas2',
                            fileType: 'jpg',
                            width: width,
                            height: height,
                            destWidth: width,
                            destHeight: height,
                            success: function (res) {
                                that.setData({
                                    'canvasImgUrl': res.tempFilePath
                                });
                                console.log(res.tempFilePath);
                                that.getPhotoData(1);
                            },
                            complete: function complete(e) {
                            }
                        })
                    });
                }
            }
        });


    },

    //调用OCR身份证识别接口
    getPhotoData: function (carType) {
        var that = this;
        var k = encrypt.getK();
        let sm4SecretKey = encrypt.strToBase64(k._k_p_);
        var url = commonData.getConstantData('serverURL') + 'OCRIdCardIden.do?' + commonData.getConstantData('commonUrlArg1');
        that.setData({showLoading: true});
        wx.uploadFile({
            url: url,
            filePath: this.data.canvasImgUrl,
            // filePath: this.data.picSrc1,
            name: 'UploadFile',
            formData: {
                _locale: 'zh_CN',
                ImgIndex: 1,
                MobilePhoneNo: this.data.MobilePhoneNo,
                SmsPassword: this.data.SmsPassword,
                OtpUUID: this.data.OtpUUID,
                CardType: carType,
                SimSessionId: getApp().globalData.simSessionId,
                sm4SecretKey: sm4SecretKey
            },
            page: this,
            success: function (res) {
                that.setData({showLoading: false});

                if (res.statusCode && res.statusCode != "200") {
                    reloadImg(carType);
                    commonUtil.wx_showModal('连接服务器失败,请联系服务端管理员:' + res.statusCode);
                    return;
                }
                console.log(res)
                if (res.data) {
                    res.data = JSON.parse(res.data);
                    if (getApp().globalData.sm4Encrypt) {
                        if ('6' == res.data.Result.substring(0, 1)) {
                            res.data.Result = encrypt.decryptData_ECB(res.data.Result.substr(1), k);
                        } else {
                            res.data.Result = Base64.decode(res.data.Result);
                        }
                    } else {
                        res.data.Result = Base64.decode(res.data.Result);
                    }
                    var result = JSON.parse(res.data.Result);
                    console.log("result:" + result);
                    // var result = JSON.parse(res.data);
                    if (result.Code && result.Code == '0') {
                        if (carType == '0') {
                            that.setData({
                                'IdNo': result.Idcard,
                                'ClientName': result.Name
                            });
                            getApp().globalData.clientName = result.Name;
                            getApp().globalData.idNo = result.Idcard;
                        } else {
                            var str = result.ValidDate.split('-');
                            that.setData({
                                'ValidDate': str[1]
                            });
                        }
                    } else {
                        reloadImg(carType);
                        commonUtil.wx_showModal('身份证识别失败:' + result.Msg + ',请换张照片重新尝试!');
                    }
                } else {
                    reloadImg(carType);
                    commonUtil.wx_showModal('身份证识别失败：调用接口失败！请换张照片重新尝试!');
                }

                if (that.data.IdNo && that.data.IdNo && that.data.picSrc1.indexOf('camera.png') <= -1 && that.data.picSrc2.indexOf('camera.png') <= -1) {
                    that.saveImg();
                }
            },
            fail: function (err) {
                that.setData({showLoading: false});
                console.log(err);
                commonUtil.wx_showModal('身份证识别失败！请稍后重新尝试！请换张照片重新尝试!');
                reloadImg(carType);
            }
        });

        function reloadImg(cardType) {
            if (cardType == '0') {
                that.setData({
                    'attendSuccessImg': '',
                    'picSrc1': '../../images/camera.png',
                    'imgClass1': 'camera-img',
                    'textShow1': true,
                    'IdNo': '',
                    'ClientName': ''
                });
            } else {
                that.setData({
                    'attendSuccessImg': '',
                    'picSrc2': '../../images/camera.png',
                    'imgClass2': 'camera-img',
                    'textShow2': true,
                    'ValidDate': ''
                });
            }
        }
    },


    timerHandle: null,
    maxTime: 90,
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        //  this.setData({ 'clientName': '小微1' });
        //  this.setData({ 'clientRole': 'coborrower' });
        //  this.setData({ 'applyId': '2028120100000001' });
        //  this.setData({ 'cifManager': '003004'});
        //  this.setData({ 'idNo': '445122199410081810' });
        //  this.setData({ 'mobilePhoneNo': '15988257511' });
        //  this.setData({ 'validDate': '20290412' });
        //  this.setData({ '_vTokenName': '1234' });
        var globalData = getApp().globalData;
        this.setData({'ClientRole': options.ClientRole});
        this.setData({'CifManager': globalData.CifManager});
        this.setData({'MobilePhoneNo': globalData.MobilePhoneNo});
        this.setData({'_vTokenName': globalData._vTokenName});
        this.setData({'ApplyId': globalData.ApplyId});

        //  getApp().globalData.simSessionId = 'f7a0c0c4-4e87-4de0-a495-e01afb9b84ca';

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

    getFaceVideo: function (that) {
        wx.chooseVideo({
            sourceType: ['camera'],
            maxDuration: 6,
            camera: 'front',
            compressed: true,
            success: function (res1) {
                // 这个就是最终拍摄视频的临时路径了
                var tempFilePath = res1.tempFilePath;
                var url = commonData.getConstantData('serverURL') + 'LoanFaceValid.do?' + commonData.getConstantData('commonUrlArg1');
                that.setData({showLoading: true});
                var platform = "android"
                wx.getSystemInfo({
                    success: function (res) {
                        if (res.platform == "ios") {
                            platform = "ios";
                        } else {
                            platform = "android";
                        }
                    },
                })
                wx.uploadFile({
                    url: url,
                    filePath: tempFilePath,
                    name: 'UploadFile',
                    formData: {
                        SimSessionId: getApp().globalData.simSessionId,
                        ClientName: that.data.ClientName,
                        IdNo: that.data.IdNo,
                        Platform: platform,
                        SvrSeq: 'svr_mloan'
                    },
                    page: that,
                    success: function (res) {
                        that.setData({showLoading: false});
                        if (res.statusCode && res.statusCode != "200") {
                            commonUtil.wx_showModal('连接服务器失败,请联系服务端管理员:' + res.statusCode);
                            return;
                        }
                        if (res.data) {
                            var responseData = JSON.parse(res.data);
                            var result = responseData.Result;
                            if (result && result == '0') {
                                getApp().globalData.videoValidSeq = responseData.VideoValidSeq;
                                that.submitLoan();
                            } else {
                                commonUtil.wx_showModal('人脸识别失败,请重新尝试!');
                            }
                        } else {
                            commonUtil.wx_showModal('人脸识别服务异常,请重新尝试!');
                        }
                    },
                    fail: function (err) {
                        that.setData({showLoading: false});
                        commonUtil.wx_showModal('人脸识别超时,请稍后重新尝试!');
                    }
                });
            },
            fail: function () {
                console.error("拍摄视频出错");
            }
        })
    },

    authClient: function (e) {
        //this.setData({'ShowNext':true});
        if (!this.checkInput()) {
            return;
        }
        var that = this;
        //判断设备是否支持人脸检测
        // wx.checkIsSupportFacialRecognition({
        //   success: function () {
        //     //调腾讯人脸核身接口 进行人脸识别
        //     wx.startFacialRecognitionVerifyAndUploadVideo({
        //       name: that.data.ClientName,
        //       idCardNumber: that.data.IdNo,
        //       success: function (res) {
        //         console.log(res);
        //         getApp().globalData.verifyResult = res.verifyResult;
        //         that.submitLoan();
        //       },
        //       fail: function (res) {
        //         console.log(res);
        //       }
        //     });
        //   },
        //   fail: function (res) {
        //     console.log(res);
        //     commonUtil.wx_showModal('您的设备不支持人脸检测，请更新最新版本微信或者使用其他型号手机');
        //   }
        // });
        //新的上传视频人脸识别
        wx.showModal({
            title: '提示',
            content: '即将进入人脸识别验证你的身份信息，请拍摄一个3s左右的视频进行人脸验证,确保为本人操作。',
            showCancel: true,
            success: function (res) {
                if (res.confirm) {
                    //点击确定进入人脸识别
                    that.getFaceVideo(that);
                }
            }
        })
    },

    submitLoan: function () {
        if (!this.checkInput()) {
            return;
        }
        var that = this;
        wx.showModal({
            title: '贷款关联人授权',
            content: '验证通过！是否确认提交？',
            confirmText: '提交',
            success(res) {
                if (res.confirm) {
                    console.log('验证通过！');
                    that.setData({'showLoading': true});
                    commonUtil.wx_request_pmf({
                        url: 'LoanStateSubmit.do',
                        data: {
                            ClientName: encodeURIComponent(that.data.ClientName),
                            ClientRole: that.data.ClientRole === 'coborrower' ? '01' : '02',
                            ApplyId: that.data.ApplyId,
                            ManagerNo: that.data.CifManager,
                            IdNo: that.data.IdNo,
                            MobilePhoneNo: that.data.MobilePhoneNo,
                            ObjectSource: 1,
                            VerifyResult: escape(getApp().globalData.verifyResult).replace(/\+/g, '%2B').replace(/\//g, '%2F'),
                            VideoValidSeq: getApp().globalData.videoValidSeq,
                            SvrSeq: 'svr_mloan',
                            _vTokenName: 1234
                        },
                        page: that,
                        success: function (res) {
                            that.setData({'showLoading': false});
                            console.log(res);
                            wx.showModal({
                                title: '贷款关联人授权',
                                content: '提交成功！',
                                confirmText: '完成',
                                showCancel: false, //不显示取消按钮
                                success(res) {
                                    if (res.confirm) {
                                        wx.navigateTo({
                                            url: '../index/index'
                                        });
                                    }
                                }
                            });
                        },
                        fail: function (res) {
                            console.log(res);
                        }
                    });
                }
            }
        });
    },
    bindChangeCheck: function (e) {
        if (e.detail.value[0]) {
            if (this.data.PromiseViewed & this.data.TaxAuthViewed) {
                this.setData({Checked: true});
            } else {
                this.setData({Checked: false});
                commonUtil.wx_showModal('请先阅读《个人征信授权及承诺书》和《纳税数据查询授权书》');
            }
        } else {
            this.setData({Checked: false});
        }
    },

    bindGotoPromise: function () {
        if (this.data.ClientName == null || this.data.IdNo == null) {
            commonUtil.wx_showModal('请先进行身份证识别');
            return;
        }
        this.setData({PromiseViewed: true});
        wx.navigateTo({
            url: 'promise'
        });
    },

    bindGotoTaxAuth: function () {
        this.setData({TaxAuthViewed: true});
        wx.navigateTo({
            url: 'taxauth',
        });
    },

    checkInput: function () {
        if (!this.data.ClientName) {
            commonUtil.wx_showModal('请输入姓名');
            return false;
        }
        if (this.data.ClientName.indexOf(' ') >= 0) {
            commonUtil.wx_showModal('姓名不允许包含空格');
            return false;
        }
        if (!this.data.IdNo) {
            commonUtil.wx_showModal('请输入身份证号码');
            return false;
        }
        if (!this.data.ValidDate) {
            commonUtil.wx_showModal('请输入身份证到期日');
            return false;
        }
        if (!this.data.Checked) {
            commonUtil.wx_showModal('请先阅读《个人征信授权及承诺书》和《纳税数据查询授权书》');
            return false;
        }
        if (!this.checkValidDate()) {
            commonUtil.wx_showModal('身份证已过期');
            return false;
        }
        return true;
    },

    //校验证件有效期
    checkValidDate: function () {
        var that = this;
        var date = new Date();
        //年
        var Y = date.getFullYear();
        //月
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
        //日
        var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        console.log("当前时间：" + Y + M + D);
        // var now =  parseInt(Y +''+ M +''+ D);
        // var vd = parseInt('20181031');
        var now = Y + '' + M + '' + D;
        var vDate = that.data.ValidDate;
        return vDate >= now;
    },


    inputName: function (e) {
        this.setData({'ClientName': e.detail.value});
    },
    inputIdNo: function (e) {
        this.setData({'IdNo': e.detail.value});
    },
    inputValidDate: function (e) {
        this.setData({'ValidDate': e.detail.value});
    },
    saveImg: function () {
        var that = this;
        var uploadNums = 0;
        var uploadSucessNums = 0;

        var fileList = [this.data.picSrc1, this.data.picSrc2];
        var uploadUrl = commonData.getConstantData('serverURL') + 'LoanCifImgUpload.do';

        uploadImgs();

        function uploadImgs() {
            uploadOne(uploadUrl, fileList[uploadNums], uploadNums + 1);
        }

        function uploadOne(uploadUrl, tmpFilePath, imgIndex) {
            console.log('上传第' + imgIndex + '张照片.');
            console.log('url:' + uploadUrl);
            console.log('filePath:' + tmpFilePath);
            that.setData({showLoading: true, btnDisabled: true});
            wx.uploadFile({
                url: uploadUrl,
                filePath: tmpFilePath,
                name: 'UploadFile',
                formData: {
                    SimSessionId: getApp().globalData.simSessionId,
                    ImgIndex: Number(imgIndex),
                    IdNo: that.data.IdNo,
                    _locale: 'zh_CN',
                    LoginType: 'R',
                    ClientType: 'Client'
                },
                success: function (res) {
                    that.setData({showLoading: false, btnDisabled: false});

                    var data = res.data
                    if (res.statusCode == 200) {
                        afterUpload(true);
                    } else {
                        afterUpload(false);
                    }
                    return true;
                },
                fail: function (err) {
                    afterUpload(false);

                }
            });
        }

        function afterUpload(flag) {
            console.log("upload callback: " + flag);
            uploadNums++;
            if (flag) {
                uploadSucessNums++;
            }
            if (uploadNums == 2) {
                if (uploadSucessNums == 2) {
                    console.log('上传照片成功：2');
                    return;
                } else {
                    // commonUtil.wx_showModal('上传照片失败，请重试');
                }
            } else {
                uploadImgs();
            }

        }

        this.setData({showLoading: false, btnDisabled: false});

    }


})