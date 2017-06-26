cc.Class({
    extends: cc.Component,

    properties: {
        dialogPrefab: cc.Prefab,
        settingPrefab: cc.Prefab,
        loading2Prefab: cc.Prefab,
        roomNumber: cc.Label,
        avatar: cc.Sprite,
        nickname: cc.Label,
        btnSetUp: cc.Button,
        btnInviteFriend: cc.Button,
        btnDisbandRoom: cc.Button,
    },

    // use this for initialization
    onLoad: function () {
        this.initializeVariable()

        this.dialog = cc.instantiate(this.dialogPrefab)
        this.node.addChild(this.dialog)

        this.setting = cc.instantiate(this.settingPrefab)
        this.node.addChild(this.setting)

        this.loading2 = cc.instantiate(this.loading2Prefab)
        this.node.addChild(this.loading2)

        if (roomInfo.number) {
            this.roomNumber.string += roomInfo.number
        }

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
                    cc.sys.localStorage.removeItem("token")
                    cc.director.loadScene(login)
                }).show()
        }, this)

        Notification.on("onclose", this.reconnect, this)

        Notification.on("enable", function () {
            self.setButtonsEnabled(true)
        })

        Notification.on("disable", function () {
            self.setButtonsEnabled(false)
        })
    },

    start: function () {
        cc.log("room start")
        if (ws === null) {
            this.reconnect()
        } else {
            if (userInfo.anotherLogin) {
                userInfo.anotherLogin = false
                this.dialog.getComponent("dialog").setMessage("您的账号刚在其他设备上线，请您检查账号安全").show()
            }

            this.user1.active = false
            this.user2.active = false
            this.user3.active = false
            this.user4.active = false
            sendGetPlayerInfo()
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

    initializeVariable: function () {
        this.user1 = cc.find("Canvas/bg/user1")
        this.user2 = cc.find("Canvas/bg/user2")
        this.user3 = cc.find("Canvas/bg/user3")
        this.user4 = cc.find("Canvas/bg/user4")

        this.user1_nickname = cc.find("Canvas/bg/user1/bg/nickname").getComponent(cc.Label)
        this.user2_nickname = cc.find("Canvas/bg/user2/bg/nickname").getComponent(cc.Label)
        this.user3_nickname = cc.find("Canvas/bg/user3/bg/nickname").getComponent(cc.Label)
        this.user4_nickname = cc.find("Canvas/bg/user4/bg/nickname").getComponent(cc.Label)

        this.user1_avatar = cc.find("Canvas/bg/user1/bg/avatar_mask/avatar").getComponent(cc.Sprite)
        this.user2_avatar = cc.find("Canvas/bg/user2/bg/avatar_mask/avatar").getComponent(cc.Sprite)
        this.user3_avatar = cc.find("Canvas/bg/user3/bg/avatar_mask/avatar").getComponent(cc.Sprite)
        this.user4_avatar = cc.find("Canvas/bg/user4/bg/avatar_mask/avatar").getComponent(cc.Sprite)

        this.usre1_owner = cc.find("Canvas/bg/user1/bg/owner")
        this.usre2_owner = cc.find("Canvas/bg/user2/bg/owner")
        this.usre3_owner = cc.find("Canvas/bg/user3/bg/owner")
        this.usre4_owner = cc.find("Canvas/bg/user4/bg/owner")

        this.user1_banker = cc.find("Canvas/bg/user1/bg/banker")
        this.user2_banker = cc.find("Canvas/bg/user2/bg/banker")
        this.user3_banker = cc.find("Canvas/bg/user3/bg/banker")
        this.user4_banker = cc.find("Canvas/bg/user4/bg/banker")
    },

    setButtonsEnabled: function (enabled) {
        this.btnSetUp.enabled = enabled
        this.btnInviteFriend.enabled = enabled
        this.btnDisbandRoom.enabled = enabled
    },

    reconnect: function () {
        cc.log("room reconnect")
        if (this.dialog.active) {
            return
        }

        this.loading2.getComponent("loading2").show()
        initWebSocket()
    },

    loadUserInfo: function (nicknameLabel, nickname, avatarSprite, headimgurl) {
        if (nickname) {
            nicknameLabel.string = nickname
        }

        if (!headimgurl) {
            headimgurl = "http://www.huafeiqipai.com/img/avatar.jpg"
        }

        cc.loader.load({ url: headimgurl, type: "jpg" }, function (err, texture) {
            if (err) {
                cc.log(err)
            } else {
                avatarSprite.spriteFrame = new cc.SpriteFrame(texture)
            }
        })
    },

    playOkEffect: function () {
        playEffect("SpecOk.wav")
    },

    playCancelEffect: function () {
        playEffect("SpecCancelOrReturn.wav")
    },

    showSetting: function () {
        this.setting.getComponent("setting").hideSwitchAccount().show()
    },

    onResult(result) {
        cc.log(result)
        this.loading2.getComponent("loading2").hide()

        if (result.S2C_Login) {
            cc.log('room another room: ' + userInfo.anotherRoom)
            if (userInfo.anotherRoom) {
                sendEnterRoom("")
            } else {
                this.dialog.getComponent("dialog").setMessage("您已离开房间，即将返回大厅").
                    setPositiveButton(function () {
                        cc.director.loadScene(hall)
                    }).show()
            }
        } else if (result.S2C_Close) {
            if (result.S2C_Close.Error === 1) { // S2C_Close_LoginRepeated
                this.dialog.getComponent("dialog").setMessage("您的账号在其他设备上线，非本人操作请注意修改密码").
                    setPositiveButton(function () {
                        cc.sys.localStorage.removeItem("token")
                        cc.director.loadScene(login)
                    }).show()
            } else if (result.S2C_Close.Error === 2) { // S2C_Close_InnerError
                cc.sys.localStorage.removeItem("token")
                this.dialog.getComponent("dialog").setMessage("登录出错，请您重新登录").
                    setPositiveButton(function () {
                        cc.director.loadScene(login)
                    }).show()
            } else if (result.S2C_Close.Error === 3) { // S2C_Close_TokenInvalid
                cc.sys.localStorage.removeItem("token")
                this.dialog.getComponent("dialog").setMessage("登录态失效，请您重新登录").
                    setPositiveButton(function () {
                        cc.director.loadScene(login)
                    }).show()
            } else if (result.S2C_Close.Error === 4) { // S2C_Close_UnionidInvalid
                cc.sys.localStorage.removeItem("token")
                this.dialog.getComponent("dialog").setMessage("登录出错，微信ID无效").
                    setPositiveButton(function () {
                        cc.director.loadScene(login)
                    }).show()
            } else if (result.S2C_Close.Error === 5) { // S2C_Close_UsernameInvalid
                cc.sys.localStorage.removeItem("token")
                this.dialog.getComponent("dialog").setMessage("登录出错，用户名无效").
                    setPositiveButton(function () {
                        cc.director.loadScene(login)
                    }).show()
            }
        } else if (result.S2C_EnterRoom) {
            if (result.S2C_EnterRoom.Error === 0) { // S2C_EnterRoom_OK
                cc.director.loadScene(room)
            } else if (result.S2C_EnterRoom.Error === 1) { // S2C_EnterRoom_NotCreated
                this.dialog.getComponent("dialog").show('房间：' + result.S2C_EnterRoom.RoomNumber + ' 未创建', 1)
            } else if (result.S2C_EnterRoom.Error === 2) { // S2C_EnterRoom_NotAllowBystander
                this.dialog.getComponent("dialog").show('房间：' + result.S2C_EnterRoom.RoomNumber + ' 不允许旁观', 1)
            } else if (result.S2C_EnterRoom.Error === 3) { // S2C_EnterRoom_InOtherRoom
                this.dialog.getComponent("dialog").setMessage("正在其他房间对局，是否回去？").
                    setPositiveButton(function () {

                    }).show()
            } else if (result.S2C_EnterRoom.Error === 4) { // S2C_EnterRoom_Unknown
                this.dialog.getComponent("dialog").setMessage("进入房间：" + result.S2C_EnterRoom.RoomNumber + " 出错，请稍后重试").
                    setPositiveButton(function () {

                    }).show()
            }
        } else if (result.S2C_ExitRoom) {
            let obj = result.S2C_ExitRoom

            let pos = obj.Position
            if (pos == userInfo.position) {
                cc.director.loadScene(hall)
            } else if (pos == (userInfo.position + 1) % roomInfo.maxPlayers) {
                this.user2.active = false
            } else if (pos == (userInfo.position + 2) % roomInfo.maxPlayers) {
                this.user3.active = false
            } else if (pos == (userInfo.position + 3) % roomInfo.maxPlayers) {
                this.user4.active = false
            }
        } else if (result.S2C_GetPlayerInfo) {
            let obj = result.S2C_GetPlayerInfo

            let pos = obj.Position
            let owner = obj.Owner
            let accID = obj.AccountID
			let nickname = obj.Nickname
			let headimgurl = obj.Headimgurl
			let sex = obj.Sex
            let userReady = obj.UserReady

            cc.log('加入, 位置:', pos, owner, accID, nickname, sex, userReady)

            if (pos == userInfo.position) {
                this.user1.active = true
                this.loadUserInfo(this.user1_nickname, nickname, this.user1_avatar, headimgurl)
                if (owner) {
                    this.usre1_owner.active = true
                }
            } else if (pos == (userInfo.position + 1) % roomInfo.maxPlayers) {
                this.user2.active = true
                this.loadUserInfo(this.user2_nickname, nickname, this.user2_avatar, headimgurl)
                if (owner) {
                    this.usre2_owner.active = true
                }
            } else if (pos == (userInfo.position + 2) % roomInfo.maxPlayers) {
                this.user3.active = true
                this.loadUserInfo(this.user3_nickname, nickname, this.user3_avatar, headimgurl)
                if (owner) {
                    this.usre3_owner.active = true
                }
            } else if (pos == (userInfo.position + 3) % roomInfo.maxPlayers) {
                this.user4.active = true
                this.loadUserInfo(this.user4_nickname, nickname, this.user4_avatar, headimgurl)
                if (owner) {
                    this.usre4_owner.active = true
                }
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
