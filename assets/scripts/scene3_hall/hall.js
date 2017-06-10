cc.Class({
    extends: cc.Component,

    properties: {
        dialogPrefab: cc.Prefab,
        settingPrefab: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        Notification.on("onopen", function () {
            sendTokenLogin()
        }, this)

        Notification.on("onmessage", this.onResult, this)

        this.dialog = cc.instantiate(this.dialogPrefab)
        this.node.addChild(this.dialog)

        this.setting = cc.instantiate(this.settingPrefab)
        this.node.addChild(this.setting)
    },

    start: function () {
        if (userInfo.anotherLogin) {
            userInfo.anotherLogin = false
            cc.log("您的账号刚在其他设备上线，请您检查账号安全")
        }
    },

    onDestroy: function () {
        Notification.offType("onopen")
        Notification.offType("onmessage")
        Notification.offType("onerror")
    },

    showSetting: function() {
        playEffect("SpecOk.mp3")

        this.setting.getComponent("setting").show()
    },

    onResult(result) {
        if (result.S2C_Login) {
            cc.log('another room: ' + userInfo.anotherRoom)
            if (userinfo.anotherRoom) {
                sendEnterRoom()
            } else {
                loadUserinfo(this.nickname, userinfo.nickname, this.accountID, userinfo.accountID, this.headimg, userinfo.headimgurl, userinfo.sex)
            }
        } else if (result.S2C_Close) {
            if (result.S2C_Close.Error === 1) { // S2C_Close_LoginRepeated
                cc.log("您的账号在其他设备上线，非本人操作请注意修改密码")
                cc.director.loadScene(login)
            } else if (result.S2C_Close.Error === 2) { // S2C_Close_InnerError
                this.lobby_dialog.getComponent('lobby_dialog').show('登录态失效，请您重新登录!', 1)
            } else if (result.S2C_Close.Error === 3) { // S2C_Close_TokenInvalid
                this.lobby_dialog.getComponent('lobby_dialog').show('登录态失效，请您重新登录!', 1)
            } else if (result.S2C_Close.Error === 4) { // S2C_Close_UnionidInvalid
                this.lobby_dialog.getComponent('lobby_dialog').show('登录出错，Unionid无效')
            } else if (result.S2C_Close.Error === 5) { // S2C_Close_UsernameInvalid
                this.lobby_dialog.getComponent('lobby_dialog').show('登录态失效，请您重新登录!', 1)
            }
        } else if (result.S2C_CreateRoom) {
            if (result.S2C_CreateRoom.Error === 1) { // S2C_CreateRoom_InnerError
                this.lobby_dialog.getComponent('lobby_dialog').show('房间创建出错，请联系客服')
            } else if (result.S2C_CreateRoom.Error === 2) { // S2C_CreateRoom_CreateRepeated
                this.lobby_dialog.getComponent('lobby_dialog').show('房间: ' + result.S2C_CreateRoom.RoomNumber + ' 已存在', 1)
            } else if (result.S2C_CreateRoom.Error === 3) { // S2C_CreateRoom_InOtherRoom
                this.lobby_dialog.getComponent('lobby_dialog').show('亲，你正在其他房间对局，是否回去？', 1)
                this.onOKClick = function () {

                }
            }
        } else if (result.S2C_EnterRoom) {
            if (result.S2C_EnterRoom.Error === 0) { // S2C_EnterRoom_OK
                cc.director.loadScene('room')
            } else if (result.S2C_EnterRoom.Error === 1) { // S2C_EnterRoom_NotCreated
                this.lobby_dialog.getComponent('lobby_dialog').show('房间: ' + result.S2C_EnterRoom.RoomNumber + ' 未创建', 1)
            } else if (result.S2C_EnterRoom.Error === 2) { // S2C_EnterRoom_NotAllowBystander
                this.lobby_dialog.getComponent('lobby_dialog').show('房间: ' + result.S2C_EnterRoom.RoomNumber + ' 不允许旁观', 1)
            } else if (result.S2C_EnterRoom.Error === 3) { // S2C_EnterRoom_InOtherRoom
                this.lobby_dialog.getComponent('lobby_dialog').show('亲，你正在其他房间对局，是否回去？', 1)
                this.onOKClick = function () {

                }
            }
        } else if (result.S2C_GetPublicRoomSetting) {
            let data = result.S2C_GetPublicRoomSetting.Data
            cc.log(data)
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
