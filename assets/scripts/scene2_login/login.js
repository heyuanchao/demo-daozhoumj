cc.Class({
    extends: cc.Component,

    properties: {
        dialogPrefab: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        this.btnWeChatLogin = cc.find("Canvas/bg/btn_wechat_login").getComponent(cc.Button)

        this.dotCount = 0
        this.loading = cc.find("Canvas/loading")
        this.loading_txt = this.loading.getChildByName("loading_txt").getComponent(cc.Label)

        this.dialog = cc.instantiate(this.dialogPrefab)
        this.node.addChild(this.dialog)

        Notification.on("onopen", function () {
            sendWeChatLogin()
        }, this)

        Notification.on("onmessage", this.onResult, this)

        let self = this
        Notification.on("onerror", function () {
            self.stopLoading()
            this.dialog.getComponent("dialog").setTitle("   ").setMessage("登录失败，请稍后重试").show()

            // self.btnWeChatLogin.enabled = true
        }, this)

        Notification.on("enable", function() {
            self.btnWeChatLogin.enabled = true
        })

        Notification.on("disable", function() {
            self.btnWeChatLogin.enabled = false
        })
    },

    onDestroy: function () {
        Notification.offType("onopen")
        Notification.offType("onmessage")
        Notification.offType("onerror")

        Notification.offType("enable")
        Notification.offType("disable")
    },

    startLoading() {
        if (this.loading.active) return

        this.loading.active = true
        this.schedule(this.updateLoadingLabel, 0.3, this)
    },

    stopLoading() {
        if (this.loading.active) {
            this.loading.active = false
            this.unschedule(this.updateLoadingLabel)
        }
    },

    updateLoadingLabel() {
        this.loading_txt.string += '.'
        this.dotCount += 1;
        if (this.dotCount > 3) {
            this.dotCount = 0
            this.loading_txt.string = trim(this.loading_txt.string, '.')
        }
    },

    // Java 调用
    setWeChatLoginEnabled() {
        this.btnWeChatLogin.enabled = true
    },

    wechatLogin: function () {
        playEffect("SpecOk.mp3")

        let self = this
        this.node.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
            self.node.stopAllActions()
            self.btnWeChatLogin.enabled = false

            if (cc.sys.isMobile) {
                // cc.find('Bgm').getComponent('bgm').pause();

                if (cc.sys.os == cc.sys.OS_ANDROID) {
                    var className = "org/cocos2dx/javascript/AppActivity"
                    var methodName = "wechatLogin"
                    var methodSignature = "()V"
                    jsb.reflection.callStaticMethod(className, methodName, methodSignature)
                }
            } else if (cc.sys.isBrowser) {
                // userInfo = JSON.parse("{\"openid\":\"ogveqvz3OnJdvicWmZDFXf1I8Xt4\",\"nickname\":\"我是谁\",\"sex\":1,\"language\":\"zh_CN\",\"city\":\"Shenzhen\",\"province\":\"Guangdong\",\"country\":\"CN\",\"headimgurl\":\"http:\/\/wx.qlogo.cn\/mmopen\/Po9mkm3Z42tolYpxUVpY6mvCmqalibOpcJ2jG3Qza5qgtibO1NLFNUF7icwCibxPicbGmkoiciaqKEIdvvveIBfEQqal8vkiavHIeqFT\/0\",\"privilege\":[],\"unionid\":\"o8c-nt6tO8aIBNPoxvXOQTVJUxY0\"}");
                userInfo = JSON.parse("{\"openid\":\"ogveqvz3OnJdvicWmZDFXf1I8Xt4\",\"nickname\":\"在努力的龙小博\",\"sex\":1,\"language\":\"zh_CN\",\"city\":\"Shenzhen\",\"province\":\"Guangdong\",\"country\":\"CN\",\"headimgurl\":\"http:\/\/wx.qlogo.cn\/mmopen\/WT9MJf6I7WAkic7ficWBuYbvkMscic97pBa0BbicwKCmOvicsPr1GozNMWnp4gfwMib0A5zdDyUOjaFFSdrz0viao3oKpsXqAeF9ZJ1\/0\",\"privilege\":[],\"unionid\":\"o8c-nt2jC5loIHg1BQGgYW6aqe60\"}");
                // userInfo = JSON.parse("{\"openid\":\"ogveqvz3OnJdvicWmZDFXf1I8Xt4\",\"nickname\":\"honey\",\"sex\":1,\"language\":\"zh_CN\",\"city\":\"Shenzhen\",\"province\":\"Guangdong\",\"country\":\"CN\",\"headimgurl\":\"http:\/\/wx.qlogo.cn\/mmopen\/Po9mkm3Z42vkKC5g0b6kzjwUiaCice6Znv9wpCpOIpUjM4fTicPrldibAww7YtTZMlW3teKndBe9GcqBHcStictz3KPayVWnwGicKF\/0\",\"privilege\":[],\"unionid\":\"o8c-ntxW4cW601v6RjaAsExy98w4\"}");
                self.requestWeChatLogin()
            }
        })));
    },

    // Java 调用
    getWeChatLoginResult(result) {
        let r = result.split(",")

        userInfo.serial = r[2]
        userInfo.model = r[3]
        // cc.log(results[4] + ", " + results[5])
        this.getAccessToken(r[0], r[1])
    },

    getAccessToken(code, state) {
        if (debug) {
            cc.log("code: " + code + ", state: " + state)
        }

        var self = this;
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 300)) {
                if (debug) {
                    cc.log(xhr.responseText);
                }
                let token = JSON.parse(xhr.responseText);
                self.getUserInfo(token.access_token, token.openid);
            }
        };
        xhr.open("GET", "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + appid + "&secret=" + appsecret + "&code=" + code + "&grant_type=authorization_code", true);
        xhr.send();
    },

    getUserInfo(access_token, openid) {
        var self = this
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 300)) {
                if (debug) {
                    cc.log(xhr.responseText);
                }
                let info = JSON.parse(xhr.responseText)
                // userInfo.openid = info.openid
                userInfo.nickname = info.nickname
                userInfo.sex = info.sex
                // userInfo.language = info.language
                // userInfo.city = info.city
                // userInfo.province = info.province
                // userInfo.country = info.country
                userInfo.headimgurl = info.headimgurl
                userInfo.unionid = info.unionid
                self.requestWeChatLogin()
            }
        };
        xhr.open("GET", "https://api.weixin.qq.com/sns/userinfo?access_token=" + access_token + "&openid=" + openid, true);
        xhr.send();
    },

    requestWeChatLogin() {
        this.startLoading()

        this.node.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(function () {
            if (ws == null) {
                initWebSocket()
            }
        })))
    },

    onResult(result) {
        this.stopLoading()
        cc.log(result)
        if (result.S2C_Login) {
            cc.log('another room: ' + userInfo.anotherRoom)
            if (userInfo.anotherRoom) {
                sendEnterRoom()
            } else {
                cc.director.loadScene(hall)
            }
        } else if (result.S2C_Close) {
            if (result.S2C_Close.Error === 1) { // S2C_Close_LoginRepeated
                //this.launch_dialog.getComponent('launch_dialog').show('您的账号在其他设备上线，非本人操作请注意修改密码')
            } else if (result.S2C_Close.Error === 2) { // S2C_Close_InnerError
                this.dialog.getComponent("dialog").setTitle("a").setMessage("登录出错，请联系客服").show()
            } else if (result.S2C_Close.Error === 3) { // S2C_Close_TokenInvalid

            } else if (result.S2C_Close.Error === 4) { // S2C_Close_UnionidInvalid
                this.launch_dialog.getComponent('launch_dialog').show('登录出错，Unionid无效')
            } else if (result.S2C_Close.Error === 5) { // S2C_Close_UsernameInvalid

            }
        } else if (result.S2C_EnterRoom) {
            if (result.S2C_EnterRoom.Error === 0) { // S2C_EnterRoom_OK
                // 加载房间
            } else if (result.S2C_EnterRoom.Error === 1) { // S2C_EnterRoom_NotCreated
                this.launch_dialog.getComponent('launch_dialog').show('房间: ' + result.S2C_EnterRoom.RoomNumber + ' 未创建', 1)
                // 加载大厅
            } else if (result.S2C_EnterRoom.Error === 2) { // S2C_EnterRoom_NotAllowBystander
                this.launch_dialog.getComponent('launch_dialog').show('房间: ' + result.S2C_EnterRoom.RoomNumber + ' 不允许旁观', 1)
                // 加载大厅
            } else if (result.S2C_EnterRoom.Error === 3) { // S2C_EnterRoom_InOtherRoom
                this.launch_dialog.getComponent('launch_dialog').show('亲，你正在其他房间对局，是否回去？', 1)
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
