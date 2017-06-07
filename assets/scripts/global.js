window.debug = true

window.appid = "wx2ab2ad4bcd0cf6a9"
window.appsecret = "9cb96f7aa80193667a8e3fbcefbd07e9"

window.userInfo = {}
window.roomInfo = {}

// https://github.com/inexorabletash/text-encoding
var textDecoder = require('text-encoding').TextDecoder
window.decoder = new textDecoder('utf-8')

window.WSAddr = 'ws://192.168.1.199:3653'
window.ws = null
window.initWebSocket = function () {
    if (ws != null) {
        return
    }

    ws = new WebSocket(WSAddr)
    ws.binaryType = 'arraybuffer'

    ws.onopen = function (evt) {
        Notification.emit("onopen")
    }

    ws.onmessage = function (evt) {
        let result = JSON.parse(decoder.decode(evt.data))
        if (result.S2C_Login) {
            userInfo.accountID = result.S2C_Login.AccountID
            userInfo.nickname = result.S2C_Login.Nickname
            userInfo.headimgurl = result.S2C_Login.Headimgurl
            userInfo.sex = result.S2C_Login.Sex
            userInfo.anotherLogin = result.S2C_Login.AnotherLogin
            userInfo.anotherRoom = result.S2C_Login.AnotherRoom

            cc.sys.localStorage.setItem('token', result.S2C_Login.Token)
            cc.sys.localStorage.setItem('username', result.S2C_Login.Username)
        }
        Notification.emit("onmessage", result)
    }

    ws.onerror = function (evt) {
        Notification.emit("onerror")
    }

    ws.onclose = function (evt) {
        // After close, it's no longer possible to use it again, 
        // if you want to send another request, you need to create a new websocket instance
        ws = null
        Notification.emit("onclose")
    }
}

window.sendJSONObject = function (obj) {
    if (ws && ws.readyState == WebSocket.OPEN) ws.send(JSON.stringify(obj))
}

window.sendWeChatLogin = function () {
    sendJSONObject({
        C2S_WeChatLogin: {
            nickname: userInfo.nickname,
            sex: userInfo.sex,
            headimgurl: userInfo.headimgurl,
            unionid: userInfo.unionid,
            serial: userInfo.serial,
            model: userInfo.model,
        }
    })
}

// 全局通知
window.Notification = {
    _eventMap: [],

    on: function (type, callback, target) {
        if (this._eventMap[type] === undefined) {
            this._eventMap[type] = [];
        }
        this._eventMap[type].push({ callback: callback, target: target });
    },

    emit: function (type, parameter) {
        var array = this._eventMap[type];
        if (array === undefined) return;

        array.forEach(function (element) {
            if (element) element.callback.call(element.target, parameter);
        })

        /*
        for (var i = 0; i < array.length; i++) {
            var element = array[i];
            cc.log(element)
            if (element) element.callback.call(element.target, parameter);
        }
        */
    },

    off: function (type, callback) {
        var array = this._eventMap[type];
        if (array === undefined) return;

        for (var i = 0; i < array.length; i++) {
            var element = array[i];
            if (element && element.callback === callback) {
                array[i] = undefined;
                break;
            }
        }
    },

    offType: function (type) {
        this._eventMap[type] = undefined;
    },
}

window.trim = function (str, s) {
    if (s === null || s === '') {
        s = ' '
    }

    while (str.indexOf(s) != -1) {
        str = str.replace(s, '')
    }

    return str
}