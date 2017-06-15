cc.Class({
    extends: cc.Component,

    properties: {
        dialogPrefab: cc.Prefab,
        settingPrefab: cc.Prefab,
        loading2Prefab: cc.Prefab,
        avatar: cc.Sprite,
        nickname: cc.Label,
        accountID: cc.Label,
        btn_create_room: cc.Button,
        btn_setting: cc.Button,
        btn_share: cc.Button,
    },

    // use this for initialization
    onLoad: function () {
        this.dialog = cc.instantiate(this.dialogPrefab)
        this.node.addChild(this.dialog)

        this.setting = cc.instantiate(this.settingPrefab)
        this.node.addChild(this.setting)

        this.loading2 = cc.instantiate(this.loading2Prefab)
        this.node.addChild(this.loading2)

        this.loadUserInfo()

        Notification.on("onopen", function () {
            sendTokenLogin()
        }, this)

        Notification.on("onmessage", this.onResult, this)

        let self = this
        Notification.on("onerror", function () {
            self.loading2.getComponent("loading2").hide()

            self.dialog.getComponent("dialog").setMessage("无法连接服务器，是否继续尝试重连?")
                .setPositiveButton(function () {
                    self.loading2.getComponent("loading2").show()
                    // 延时0.2秒等待缩放动画完成
                    self.node.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(function () {
                        initWebSocket()
                    })));
                }).setNegativeButton(function () {
                    localStorageRemoveItem("token")
                    loadScene(login)
                }).show()
        }, this)

        Notification.on("onclose", this.reconnect, this)

        Notification.on("enable", function () {
            self.setButtonsEnabled(true)
        })

        Notification.on("disable", function () {
            self.setButtonsEnabled(false)
        })

        cc.log("hall onLoad")
    },

    start: function () {
        cc.log("hall start")
        if (userInfo.anotherLogin) {
            userInfo.anotherLogin = false
            this.dialog.getComponent("dialog").setMessage("您的账号刚在其他设备上线，请您检查账号安全").show()
        }
    },

    onDestroy: function () {
        Notification.offType("onopen")
        Notification.offType("onmessage")
        Notification.offType("onerror")
        Notification.offType("onclose")

        Notification.offType("enable")
        Notification.offType("disable")
    },

    setButtonsEnabled: function (enabled) {
        this.btn_create_room.enabled = enabled
        this.btn_setting.enabled = enabled
        this.btn_share.enabled = enabled
    },

    reconnect: function () {
        cc.log("hall reconnect")
        if (this.dialog.active) {
            return
        }

        this.loading2.getComponent("loading2").show()
        initWebSocket()
    },

    loadUserInfo: function () {
        if (userInfo.nickname) {
            this.nickname.string = userInfo.nickname
        }

        if (userInfo.accountID) {
            this.accountID.string = 'ID:' + userInfo.accountID
        }

        if (!userInfo.headimgurl) {
            userInfo.headimgurl = "http://www.huafeiqipai.com/img/avatar.jpg"
        }

        let self = this
        cc.loader.load({ url: userInfo.headimgurl, type: "jpg" }, function (err, texture) {
            if (err) {
                cc.log(err)
            } else {
                self.avatar.spriteFrame = new cc.SpriteFrame(texture)
            }
        })
    },

    playEffect: function () {
        playEffect("SpecOk.mp3")
    },

    showSetting: function () {
        this.setting.getComponent("setting").show()
    },

    onResult(result) {
        cc.log(result)
        this.loading2.getComponent("loading2").hide()

        if (result.S2C_Login) {
            cc.log('hall another room: ' + userInfo.anotherRoom)
            if (userInfo.anotherRoom) {
                sendEnterRoom()
            } else {
                this.loadUserInfo()
            }
        } else if (result.S2C_Close) {
            if (result.S2C_Close.Error === 1) { // S2C_Close_LoginRepeated
                this.dialog.getComponent("dialog").setMessage("您的账号在其他设备上线，非本人操作请注意修改密码")
                    .setPositiveButton(function () {
                        localStorageRemoveItem("token")
                        cc.director.loadScene(login)
                    }).show()
            } else if (result.S2C_Close.Error === 2) { // S2C_Close_InnerError
                localStorageRemoveItem("token")
                this.dialog.getComponent("dialog").setMessage("登录出错，请您重新登录")
                    .setPositiveButton(function () {
                        cc.director.loadScene(login)
                    }).show()
            } else if (result.S2C_Close.Error === 3) { // S2C_Close_TokenInvalid
                localStorageRemoveItem("token")
                this.dialog.getComponent("dialog").setMessage("登录态失效，请您重新登录")
                    .setPositiveButton(function () {
                        cc.director.loadScene(login)
                    }).show()
            } else if (result.S2C_Close.Error === 4) { // S2C_Close_UnionidInvalid
                localStorageRemoveItem("token")
                this.dialog.getComponent("dialog").setMessage("登录出错，微信ID无效")
                    .setPositiveButton(function () {
                        cc.director.loadScene(login)
                    }).show()
            } else if (result.S2C_Close.Error === 5) { // S2C_Close_UsernameInvalid
                localStorageRemoveItem("token")
                this.dialog.getComponent("dialog").setMessage("登录出错，用户名无效")
                    .setPositiveButton(function () {
                        cc.director.loadScene(login)
                    }).show()
            }
        } else if (result.S2C_CreateRoom) {
            if (result.S2C_CreateRoom.Error === 1) { // S2C_CreateRoom_InnerError
                this.lobby_dialog.getComponent('lobby_dialog').show('房间创建出错，请联系客服')
            } else if (result.S2C_CreateRoom.Error === 2) { // S2C_CreateRoom_CreateRepeated
                this.lobby_dialog.getComponent('lobby_dialog').show('房间: ' + result.S2C_CreateRoom.RoomNumber + ' 已存在', 1)
            } else if (result.S2C_CreateRoom.Error === 3) { // S2C_CreateRoom_InOtherRoom
                this.lobby_dialog.getComponent('lobby_dialog').show('亲，你正在其他房间对局，是否回去？', 1)
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
