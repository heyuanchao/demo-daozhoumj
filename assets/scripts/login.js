cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        this.effectOn = true
    },

    weChatLogin: function (event, sceneName) {
        cc.log(sceneName)
        this.node.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
            cc.director.loadScene("hall_3")
        })));
    },

    playEffect: function (event, audioName) {
        cc.log(audioName)
        if (this.effectOn) {
            let audio = cc.url.raw("resources/audio/" + audioName)
            cc.audioEngine.play(audio, false, 1)
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
