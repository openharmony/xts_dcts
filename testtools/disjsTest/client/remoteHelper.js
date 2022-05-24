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

import apiMessage from '../common/apiMessage.js'
import apiResult from '../common/apiResult.js'
import rpc from '@ohos.rpc'
var logTag = "RpcClient";
var CODE_INVOKE =1;
var results;
export default class RemoteHelper{
    testservice = undefined
    gIRemoteObject = undefined
    constructor(testservice,gIRemoteObject){
        this.testservice = testservice
	this.gIRemoteObject = gIRemoteObject
    }
    
   async add(a,b) {
            console.log(logTag+"_methodName is add");
	    let message = new ApiMessage("openHarmony","testApi","add"," ",["number","number"],[String(a),String(b)]," ");

            var messageParcel = rpc.MessageParcel.create();
            console.log(logTag + "create object successfully.");
            var messageParcelreply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var writeResult = messageParcel.writeSequenceable(message);
	    await this.gIRemoteObject.sendRequest(CODE_INVOKE, messageParcel, messageParcelreply, option);
            console.log(logTag + "sendRequest got result");
            var ret = new ApiMessage(null, null, null, null, null, null,null)
            var dataReply = messageParcelreply.readSequenceable(ret);
            console.log(logTag + "run readSequenceable success, result is" + dataReply);
            results = JSON.parse(ret._apiResult);

	    console.log(logTag + " read success, results is" + results._result);
	    return results._result;
    }
	 

    async sub(a,b) {
        console.log(logTag+"_methodName is sub");
            let message = new ApiMessage("openHarmony","testApi","sub"," ",["number","number"],[String(a),String(b)]," ");
            var messageParcel = rpc.MessageParcel.create();
            console.log(logTag + "create object successfully.");
            var messageParcelreply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var writeResult = messageParcel.writeSequenceable(message);
            await this.gIRemoteObject.sendRequest(CODE_INVOKE, messageParcel, messageParcelreply, option);
            console.log(logTag + "sendRequest got result");
            var ret = new ApiMessage(null, null, null, null, null, null,null)
            var dataReply = messageParcelreply.readSequenceable(ret);
            console.log(logTag + "run readSequenceable success, result is" + dataReply);
            results = JSON.parse(ret._apiResult);

            console.log(logTag + " read success, results is" + results._result);
            return results._result;
    }
}
