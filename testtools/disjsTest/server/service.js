// @ts-nocheck
import rpc from '@ohos.rpc';
import apiMessage from '../common/apiMessage.js'
import testBundleManager from './testBundleManager.js'

var CODE_INVOKE = 1;
var logTag = "RpcServer";

export default class Stub extends rpc.RemoteObject {
    constructor(descriptor) {
	console.log(logTag +" Stub Create")
        super(descriptor);
    }

    onRemoteRequest(code, data, reply, option) {
        try {
            console.log(logTag +" ============onRemoteRequest: code is" + code)
            switch (code) {
                case CODE_INVOKE:
                {
                    console.info(logTag +" case CODE_INVOKE start")
                    let testBundle = new apiMessage(null, null, null, null, null, null, null)
                    var tmp = data.readSequenceable(testBundle);
                    console.log( logTag +" The server's readSequenceable result is " + tmp + JSON.stringify(testBundle));
                    let test_BundleManager = new testBundleManager();
                    let testBundleResult = test_BundleManager.invoke(testBundle);
                    console.log( logTag +" testBundleManager invoke success result is " + JSON.stringify(testBundleResult));

                    testBundle._apiResult=JSON.stringify(testBundleResult);
		    console.log(logTag +" The testBundle is " + JSON.stringify(testBundle));
                    let result = reply.writeSequenceable(testBundle);
                    console.log(logTag +" writeSequenceable result is " + result);
                    return true
                }
                default:
                    console.error(logTag +" default case " + code)
                    return super.onRemoteRequest(code, data, reply, option)
            }
        } catch (error) {
            console.log(logTag +" onRemoteRequest: " + error);
        }
        return false
    }
}
