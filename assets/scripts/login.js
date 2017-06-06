cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {
        this.effectOn = true
        this.btnWeChatLogin = cc.find("Canvas/bg/btn_wechat_login").getComponent(cc.Button)
    },

    // Java 调用
    setWeChatLoginEnabled() {
        this.btnWeChatLogin.enabled = true
    },

    wechatLogin: function () {
        this.playEffect("SpecOk.mp3")
        
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
                // this.requestWechatLogin()
            }
        })));
    },

    playEffect: function (audioName) {
        if (this.effectOn) {
            let audio = cc.url.raw("resources/audio/" + audioName)
            cc.audioEngine.play(audio, false, 1)
        }
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
                // self.requestWechatLogin()
            }
        };
        xhr.open("GET", "https://api.weixin.qq.com/sns/userinfo?access_token=" + access_token + "&openid=" + openid, true);
        xhr.send();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
