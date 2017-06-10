cc.Class({
    extends: cc.Component,

    properties: {
        frame: cc.Node,
        btn_switch: cc.Button,
    },

    // use this for initialization
    onLoad: function () {
        this.node.active = false
    },

    playEffect: function() {
        playEffect("SpecOk.mp3")
    },

    switchAccount: function() {
        loadScene("scene2_login")
    },

    hideSwitchAccount: function() {
        this.btn_switch.node.active = false

        return this
    },

    show: function () {
        Notification.emit("disable")

        this.node.active = true
        this.frame.runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 0.9), cc.scaleTo(0.1, 1)))
    },

    hide: function () {
        Notification.emit("enable")

        let self = this
        this.frame.runAction(cc.sequence(cc.scaleTo(0.1, 0), cc.callFunc(function () {
            self.node.active = false
        })))
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
