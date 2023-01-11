/*
 * Copyright (C) 2022 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import rpc from '@ohos.rpc';
import ApiMessage from '../common/apiMessage.js';
import ApiResult from '../common/apiResult.js';
import ReflectCallApi from './ReflectCallApi.js';

let CODE_INVOKE = 1;
let logTag = "RpcServer:  ";

export default class Stub extends rpc.RemoteObject {
    constructor(descriptor) {
        console.log(logTag +" Stub Create");
        super(descriptor);
    }

    onRemoteRequest(code, data, reply, option) {
        try {
            console.log(logTag +" ============onRemoteRequest: code is" + code);
            switch (code) {
                case CODE_INVOKE:
                {
                    console.info(logTag +" case CODE_INVOKE start");
                    let testBundle = new ApiMessage(null, null, null, null, null, null, null);
                    var tmp = data.readSequenceable(testBundle);
                    console.log( logTag +" read result is " + tmp + JSON.stringify(testBundle));
                    
                    let resultCall = new ApiResult();
                    var resCallApi = -1;
                    const reflectCallApi = new ReflectCallApi();
                    resCallApi = reflectCallApi.call(testBundle);
                    console.log(logTag+"_methodName  call success,result is "+resCallApi);
                    if (resCallApi == 1)  {
                        resultCall._resultCode = true;
                        resultCall._result = 1;
                    } else {
                        resultCall._resultCode = false;
                        resultCall._result = -1;
                    } 
                    console.log(logTag + "The server's writeSequenceable result is " + JSON.stringify(resultCall));

                    testBundle._apiResult=JSON.stringify(resultCall);
		            console.log(logTag +" The testBundle is " + JSON.stringify(testBundle));
                    let result = reply.writeSequenceable(testBundle);
                    console.log(logTag +" writeSequenceable result is " + result);
                    return true;
                }
                default:
                    console.error(logTag +" default case " + code);
                    return super.onRemoteRequest(code, data, reply, option);
            }
        } catch (error) {
            console.log(logTag +"ERROR: onRemoteRequest: " + error);
        }
        return false;
    }
}
