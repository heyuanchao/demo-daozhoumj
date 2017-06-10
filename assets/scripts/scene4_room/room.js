cc.Class({
    extends: cc.Component,

    properties: {
        dialogPrefab: cc.Prefab,
        settingPrefab: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        this.dialog = cc.instantiate(this.dialogPrefab)
        this.node.addChild(this.dialog)

        this.setting = cc.instantiate(this.settingPrefab)
        this.node.addChild(this.setting)
    },

    playEffect: function () {
        playEffect("SpecOk.mp3")
    },

    showSetting: function () {
        this.setting.getComponent("setting").hideSwitchAccount().show()
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
