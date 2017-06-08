cc.Class({
    extends: cc.Component,

    properties: {
        title: cc.Label,
        message: cc.Label,
        frame: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.node.active = false
    },

    setTitle: function (title) {
        if (title != null && trim(title, " ").length != 0) {
            this.title.string = title
        }

        return this
    },

    setMessage: function (message) {
        this.message.string = message

        return this
    },

    show: function () {
        Notification.emit("disable")

        this.node.active = true
        this.frame.runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 0.9), cc.scaleTo(0.1, 1)))
    },

    hide: function () {
        Notification.emit("enable")

        playEffect("SpecOk.mp3")

        let self = this
        this.frame.runAction(cc.sequence(cc.scaleTo(0.1, 0), cc.callFunc(function () {
            self.node.active = false
        })))
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
