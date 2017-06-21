// https://github.com/inexorabletash/text-encoding
var textDecoder = require("text-encoding").TextDecoder
window.decoder = new textDecoder("utf-8")

// window.WSAddr = "ws://119.29.250.181:3654"
window.WSAddr = "ws://192.168.1.33:3654"
window.ws = null
window.initWebSocket = function () {
    if (ws != null) {
        return
    }

    ws = new WebSocket(WSAddr)
    ws.binaryType = "arraybuffer"

    ws.onopen = function (evt) {
        Notification.emit("onopen")
    }

    ws.onmessage = function (evt) {
        let result = JSON.parse(decoder.decode(evt.data))
        if (result.S2C_Heartbeat) {
            sendJsonObject({ C2S_Heartbeat: {} })
            return
        }

        if (result.S2C_Login) {
            setUserInfo(result.S2C_Login)
        } else if (result.S2C_EnterRoom) {
            let obj = result.S2C_EnterRoom
            if (obj.Error === 0) { // S2C_EnterRoom_OK
                roomInfo.number = obj.RoomNumber
                roomInfo.desc = obj.RoomDesc
                roomInfo.processing = obj.GameProcessing

                userInfo.position = obj.Position
                userInfo.owner = obj.Owner
                userInfo.userReady = obj.UserReady
            }
        }

        Notification.emit("onmessage", result)
    }

    ws.onerror = function (evt) {
        cc.log("network onerror")
        Notification.emit("onerror")
    }

    ws.onclose = function (evt) {
        // After close, it's no longer possible to use it again, 
        // if you want to send another request, you need to create a new websocket instance
        ws = null
        cc.log("network onclose")
        Notification.emit("onclose")
    }
}

window.closeWebSocket = function () {
    if (ws) ws.close()
}

window.sendJsonObject = function (obj) {
    if (ws && ws.readyState == WebSocket.OPEN) ws.send(JSON.stringify(obj))
}

window.sendWeChatLogin = function () {
    sendJsonObject({
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

window.sendTokenLogin = function () {
    sendJsonObject({
        C2S_TokenLogin: {
            username: localStorageGetItem("username"),
            token: localStorageGetItem("token"),
        }
    })
}

window.sendCreateGanZhouRoom = function () {
    sendJsonObject({
        C2S_CreateGanZhouRoom: {

        }
    })
}

window.sendCreateRunJinRoom = function () {
    sendJsonObject({
        C2S_CreateRuiJinRoom: {

        }
    })
}

window.setUserInfo = function (obj) {
    userInfo.accountID = obj.AccountID
    userInfo.nickname = obj.Nickname
    userInfo.headimgurl = obj.Headimgurl
    userInfo.sex = obj.Sex
    userInfo.anotherLogin = obj.AnotherLogin
    userInfo.anotherRoom = obj.AnotherRoom

    localStorageSetItem("token", obj.Token)
    localStorageSetItem("username", obj.Username)
}
