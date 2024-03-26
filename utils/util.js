var commonData = require('data.js')
var encrypt = require('encrypt.js')

function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

//从源数组中拷贝指定数量的元素到目标数组，起始位置为目标数组的长度加1
/*
srcArray 源数组
destArray 目标数组
copyLength 拷贝元素数量
*/
function addElementIntoArray(srcArray, destArray, copyLength) {
    if (!Array.isArray(srcArray)) return;
    if (!Array.isArray(destArray)) return;
    var src_length = srcArray.length;

    var copyDone = 0;

    for (var index = destArray.length; index < src_length; index++) {
        destArray.push(srcArray[index]);

        copyDone++;
        if (copyDone >= copyLength)
            break;
    }
}

//将源数组的全部元素拷贝到目标数组中
/*
srcArray 源数组
destArray 目标数组
*/
function addAllElementIntoArray(srcArray, destArray) {
    if (!Array.isArray(srcArray)) return;
    if (!Array.isArray(destArray)) return;
    var src_length = srcArray.length;

    for (var index = 0; index < src_length; index++) {
        destArray.push(srcArray[index]);
    }
}

//对数据格式进行检查
function validator(obj, type) {
    if (!obj) return true;
    //检查日期格式【yyyy-mm-dd】
    if (type == "date1") {
        var reg = /^(\d{4})\-(\d{2})\-(\d{2})$/;
        return (reg.test(obj))
    }
    //检查身份证号
    if (type == "IdNo") {
        var reg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
        return (reg.test(obj))
    }
    //检查申请编号

    //检查手机号码
    if (type == "PhoneNumber") {
        var reg = /[0-9]{11}/;
        return (reg.test(obj))
    }
    //检查图形验证码
    if (type == "VToken") {
        var reg = /[0-9a-zA-Z]{4}/;
        return (reg.test(obj))
    }
    //检查短信验证码
    if (type == "SMS") {
        var reg = /[0-9]{6}/;
        return (reg.test(obj))
    }
}

//对数据格式进行检查，当不符合时进行提示
/* 
obj为待检查数据
type为检查类型
msg为提醒信息
*/
function check(obj, type) {
    //检查是否符合手机号码格式
    if (type == "PhoneNumber") {
        if (!obj) {
            wx_showModal('手机号码不能为空')
            return false;
        }
        if (!validator(obj, "PhoneNumber")) {
            wx_showModal('手机号码格式不符合要求')
            return false;
        }

        return true;
    }
}

//显示提示框
function wx_showModal(msg) {
    wx.showModal({
        title: '提示',
        content: msg,
        showCancel: false//不显示取消按钮
    })
}

//显示提示框，点击确认后返回前一窗口
function wx_showModal_back(msg) {
    wx.showModal({
        title: '提示',
        content: msg,
        showCancel: false,//不显示取消按钮
        success: function (res) {
            if (res.confirm) {
                //点击确定后，返回前一页面
                wx.navigateBack({
                    delta: 1
                })
            }
        }
    })
}

/*
在发送HTTP请求时，请求URL会加上固定URL，请求参数会加上固定参数
在调用该方法时，传入参数的request.page应传入调用者页面的this对象
*/
function wx_request_pmf(request) {
    var url
    var header = {}
    var method
    var dataType
    var data
    var page = request.page

    // 获取加密的key值

    url = commonData.getConstantData("serverURL") + request.url;
    if (request.header) {
        header = request.header
    }

    if (getApp().globalData.sm4Encrypt) {
        //请求URL增加服务器的地址信息
        var k = encrypt.getK();

        //加密的请求使用POST
        method = "POST"

        //设置Content-Type
        header['Content-Type'] = 'application/json'
        //设置Accept: application/json, text/plain, */*
        header['Accept'] = 'application/json, text/plain, */*';
        header['Accept-Language'] = 'zh-cn,zh';
        //在POST数据开头增加公共数据
        var dataStr = "";
        if (!!getApp().globalData.simSessionId) {
            request.data.SimSessionId = getApp().globalData.simSessionId;
        }
        var commonUrlArg2 = commonData.getConstantData("commonUrlArg2");
        Object.assign(request.data, commonUrlArg2);
        data = JSON.stringify(request.data);
        data = encrypt.encryptDataByAA(data, k);
        // data=encrypt.decryptData_ECB(data,k);
        data = '6' + data;
    } else {

        //请求URL增加服务器的地址信息
        url = commonData.getConstantData("serverURL") + request.url
        //默认使用POST
        method = request.method ? request.method : "POST"

        if (request.header) {
            header = request.header
        }

        //设置header中的Content-Type信息
        if (!(request.header_type) || request.header_type == "form") {
            //默认使用表单类型

            //设置Content-Type
            header['Content-Type'] = 'application/x-www-form-urlencoded'

            //设置Accept: application/json, text/plain, */*
            header['Accept'] = 'application/json, text/plain, */*'

            //在POST数据开头增加公共数据
            var dataStr = "";
            if (typeof request.data == 'object') {
                for (var i in request.data) {
                    if (request.data[i]) {
                        dataStr += i + '=' + request.data[i] + '&';
                    }
                }
            } else {
                dataStr = request.data;
            }
            if (dataStr.endsWith("&")) {
                dataStr = dataStr.substr(0, dataStr.length - 1);
            }
            if (!!getApp().globalData.simSessionId) {
                dataStr = dataStr + '&SimSessionId=' + getApp().globalData.simSessionId;
            }

            data = commonData.getConstantData("commonUrlArg1") + dataStr
        } else if (request.header_type == "json") {
            //json数据

            //设置Content-Type
            header['Content-Type'] = 'application/json'

            data = request.data
            if (!!getApp().globalData.simSessionId) {
                data.SimSessionId = getApp().globalData.simSessionId;
            }
        }

        if (method == 'GET') {
            url = url + '?' + data;
        }
    }
    dataType = request.dataType

    if (!page) {
        wx_showModal('未传入当前页面！')
    } else {
        //将显示loading界面的标志设为true
        page.setData({showLoading: true})
    }
    wx.request({
        url: url,
        data: data,
        header: header,
        method: method,
        dataType: request.dataType,
        success: function (res) {

            if (!!res.data && !!res.data.SimSessionId) {
                getApp().globalData.simSessionId = res.data.SimSessionId;
            }
            //将显示loading界面的标志设为false
            page.setData({showLoading: false})

            //判断HTTP返回码
            if (res.statusCode && res.statusCode != "200") {
                //请求的HTTP返回码非200

                //显示错误提示
                wx_showModal('交易失败，返回码为 ' + res.statusCode)
            } else {
                //请求的HTTP返回码为200
                //保存cookie
                //判断返回错误码
                if (res.data.jsonError) {
                    //返回的错误码非空
                    var errMsg = res.data.jsonError[0]._exceptionMessage
                    errMsg = !errMsg ? "未知错误" : errMsg

                    //显示错误提示
                    wx_showModal('交易失败 ' + errMsg);
                    if (request.fail) {
                        request.fail(errMsg);
                    }
                } else {
                    //返回的错误码为空

                    if (request.success) {
                        //执行自定义方法
                        request.success(res)
                    }
                }
            }
        },
        fail: function (err) {
            //将显示loading界面的标志设为false
            page.setData({showLoading: false})

            //显示错误提示
            wx_showModal('交易失败' + err.errMsg)

            if (request.fail) {
                //执行自定义方法
                request.fail(err)
            }
        },
        complete: function (res) {
            if (request.complete) {
                request.complete(res)
            }
        }
    })
}

//向其他服务器发送请求
/*
需要指定参数errMsg，指定统一的错误提示
*/
function wx_request_other(request) {
    var url
    var header = {}
    var method
    var dataType
    var data
    //使用指定的错误提示
    var errMsg = request.errMsg

    //请求URL增加服务器的地址信息
    url = request.url

    //默认使用POST
    method = request.method ? request.method : "POST"

    if (request.header) {
        header = request.header
    }

    //设置header中的Content-Type信息
    if (!(request.header_type) || request.header_type == "form") {
        //默认使用表单类型

        //设置Content-Type
        header['Content-Type'] = 'application/x-www-form-urlencoded'
    }

    dataType = request.dataType
    data = request.data

    //导航条显示正在加载
    wx.showNavigationBarLoading()

    wx.request({
        url: url,
        data: data,
        header: header,
        method: method,
        dataType: request.dataType,
        success: function (res) {
            //导航条隐藏正在加载
            wx.hideNavigationBarLoading()
            if (request.success) {

                //返回HTTP返回码
                if (res.statusCode && res.statusCode != "200") {
                    //请求的HTTP返回码非200

                    //显示错误提示
                    wx_showModal(errMsg + ' 返回码为 ' + res.statusCode)
                } else {
                    //请求的HTTP返回码为200

                    //执行自定义方法
                    request.success(res)
                }
            }
        },
        fail: function (err) {
            //导航条隐藏正在加载
            wx.hideNavigationBarLoading()

            //显示错误提示
            wx_showModal(errMsg + ' ' + err.errMsg)
            if (request.fail) {

                //执行自定义方法
                request.fail(err)
            }
        },
        complete: function (res) {
            if (request.complete) {
                request.complete(res)
            }
        }
    })
}

module.exports = {
    formatTime: formatTime,
    addElementIntoArray: addElementIntoArray,
    addAllElementIntoArray: addAllElementIntoArray,
    validator: validator,
    check: check,
    wx_request_pmf: wx_request_pmf,
    wx_request_other: wx_request_other,
    wx_showModal: wx_showModal,
    wx_showModal_back: wx_showModal_back
}
