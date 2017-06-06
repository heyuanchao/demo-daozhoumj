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
        // 设置为常驻节点
        cc.game.addPersistRootNode(this.node)
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this)
    },

    onKeyUp(event) {
        cc.log('keyCode: ' + event.keyCode);
        switch (event.keyCode) {
            case cc.KEY.a:
                // cc.find('Bgm').getComponent('bgm').pause();
                break;
            case cc.KEY.b:
                // cc.find('Bgm').getComponent('bgm').resume();
                break;
            case cc.KEY.back: // 6, 返回键
                this.showExitDialog();
                break;
        }
    },

    showExitDialog() {
        if (cc.sys.isMobile) {
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                var className = "org/cocos2dx/javascript/AppActivity";
                var methodName = "showExitDialog";
                var methodSignature = "()V";
                jsb.reflection.callStaticMethod(className, methodName, methodSignature);
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
