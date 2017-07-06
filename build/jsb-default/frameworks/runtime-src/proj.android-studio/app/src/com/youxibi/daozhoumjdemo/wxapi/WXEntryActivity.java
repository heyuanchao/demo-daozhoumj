package com.youxibi.daozhoumjdemo.wxapi;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;

import org.cocos2dx.javascript.AppActivity;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

public class WXEntryActivity extends Activity implements IWXAPIEventHandler {
    private static final String TAG = "WXEntryActivity";

    // IWXAPI 是第三方app和微信通信的openapi接口
    private IWXAPI api;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 通过WXAPIFactory工厂，获取IWXAPI的实例
        api = WXAPIFactory.createWXAPI(this, AppActivity.APP_ID, false);
        api.handleIntent(getIntent(), this);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);

        setIntent(intent);
        api.handleIntent(intent, this);
    }

    // 微信发送请求到第三方应用时，会回调到该方法
    @Override
    public void onReq(BaseReq baseReq) {
        Log.i(TAG, baseReq.toString());
    }

    // 第三方应用发送到微信的请求处理后的响应结果，会回调到该方法
    @Override
    public void onResp(BaseResp resp) {
        switch (resp.errCode) {
            case BaseResp.ErrCode.ERR_OK:
                if (resp instanceof SendAuth.Resp) {
                    final String code = ((SendAuth.Resp) resp).code;
                    final String state = ((SendAuth.Resp) resp).state;

                    // 微信会回调两次相同的 code，具体原因待查
                    if (AppActivity.code.equals(code))  {
                        Log.i(TAG, "code 重复");
                        return;
                    }
                    Log.i(TAG, "code: " + code);
                    AppActivity.code = code;
                    final String result = code + "," + state + "," + android.os.Build.SERIAL + "," + android.os.Build.MODEL;
                    AppActivity.app.runOnGLThread(new Runnable() {
                        @Override
                        public void run() {
                            Cocos2dxJavascriptJavaBridge.evalString("cc.find(\"Canvas\").getComponent(\"login\").getWeChatLoginResult(\"" + result + "\");");
                        }
                    });
                }
                break;
            case BaseResp.ErrCode.ERR_USER_CANCEL:
                AppActivity.app.runOnGLThread(new Runnable() {
                    @Override
                    public void run() {
                        Cocos2dxJavascriptJavaBridge.evalString("cc.find(\"Canvas\").getComponent(\"login\").hideLoading();");
                    }
                });
                Toast.makeText(this, "用户取消授权", Toast.LENGTH_SHORT).show();
                break;
            case BaseResp.ErrCode.ERR_AUTH_DENIED:
                AppActivity.app.runOnGLThread(new Runnable() {
                    @Override
                    public void run() {
                        Cocos2dxJavascriptJavaBridge.evalString("cc.find(\"Canvas\").getComponent(\"login\").hideLoading();");
                    }
                });
                Toast.makeText(this, "用户拒绝授权", Toast.LENGTH_SHORT).show();
                break;
            default:
                break;
        }

        finish();
    }
}
