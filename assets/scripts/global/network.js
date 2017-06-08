// https://github.com/inexorabletash/text-encoding
var textDecoder = require('text-encoding').TextDecoder
window.decoder = new textDecoder('utf-8')

window.WSAddr = 'ws://192.168.1.168:3653'
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
