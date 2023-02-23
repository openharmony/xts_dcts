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

import ApiMessage from '../common/apiMessage.js';
import ApiResult from '../common/apiResult.js';
import rpc from '@ohos.rpc';
let logTag = "RpcClient_RemoteHelper:  ";
let CODE_INVOKE =1;
export default class RemoteHelper{
    testservice = undefined;
    gIRemoteObject = undefined;
    constructor(testservice,gIRemoteObject){
        this.testservice = testservice;
        this.gIRemoteObject = gIRemoteObject;
    }

    async getReq(message) {
        console.log(logTag + "getReq begin");
        let messageParcel = rpc.MessageParcel.create();
        console.log(logTag + "create object successfully.");
        let messageParcelreply = rpc.MessageParcel.create();
        let option = new rpc.MessageOption();
        let writeResult = messageParcel.writeSequenceable(message);
        await this.gIRemoteObject.sendRequest(CODE_INVOKE, messageParcel, messageParcelreply, option);
        console.log(logTag + "sendRequest got result");
        let ret = new ApiMessage(null, null, null, null, null, null, null);
        let dataReply = messageParcelreply.readSequenceable(ret);
        console.log(logTag + "run readSequenceable success, result is" + dataReply);
        let retApi = JSON.parse(ret._apiResult);
        let retApiResult = retApi._result;
        console.log(logTag + " read success, results is" + retApiResult);
        return retApiResult;
}

    async startBackgroundRunning(){
        console.info(logTag + "_methodName is startBackgroundRunning");
        let message = new ApiMessage("openHarmony","testApi","startBackgroundRunning"," ",[],[]," ");
        let resGetReq = await this.getReq(message);
        return resGetReq;
    }

    async stopBackgroundRunning(){
        console.info(logTag + "_methodName is stopBackgroundRunning");
        let message = new ApiMessage("openHarmony","testApi","stopBackgroundRunning"," ",[],[]," ");
        let resGetReq = await this.getReq(message);
        return resGetReq;
    }
   async add(a,b) {
        console.log(logTag+"_methodName is add");
	    let message = new ApiMessage("openHarmony","testApi","add"," ",
		    ["number","number"],[String(a),String(b)]," ");
        let resGetReq = await this.getReq(message);
        return resGetReq;
    }


    async sub(a,b) {
        console.log(logTag+"_methodName is sub");
        let message = new ApiMessage("openHarmony","testApi","sub"," ",
		    ["number","number"],[String(a),String(b)]," ");
        let resGetReq = await this.getReq(message);
        return resGetReq;
    }
    async createKvManager(){
        console.info(logTag + "_methodName is createKvManager");
        let message = new ApiMessage("openHarmony","testApi","createKvManager"," ",[],[]," ");
        let resGetReq = await this.getReq(message);
        return resGetReq;
    }

    async getKvStore(storeId,SecurityLevel,encrypt){
        // if SecurityLevel in ["S0","S1","S2","S3","S4"],the kvstore corresponding to the security level will be created
        // if SecurityLevel not in ["S0","S1","S2","S3","S4"],  the kvstore with security level is NO_LEVEL will be created
        // if encrypt is true,it will create encrypt kvStore,otherwise it weill create unencrypt kvStore
        console.info(logTag + "_methodName is getKvStore");
        let message = new ApiMessage("openHarmony","testApi","getKvStore"," ",
        ["string","string","string"],[String(storeId),String(SecurityLevel),String(encrypt)]," ");
        let resGetReq = await this.getReq(message);
        return resGetReq;
    }
    async closeKvStore(storeId){
        console.info(logTag + "_methodName is closeKvStore");
        let message = new ApiMessage("openHarmony","testApi","closeKvStore"," ",
        ["string"],[String(storeId)]," ");
        let resGetReq = await this.getReq(message);
        return resGetReq;
    }

    async kvPut(key,value,valueType){
        // valueType<string>: The type of value.
        // Available values:["String","Number","Uint8Array","Boolean"]
        // To avoid unknown errors, it is recommended to pass in only values of string type
        // If insert data successful,it will return true, otherwise it will return errInfo
        console.info(logTag + "_methodName is kvPut");
        let message = new ApiMessage("openHarmony","testApi","kvPut"," ",
		    ["string",valueType,"string"],[String(key),value.toString(),String(valueType)]," ");
        console.info(logTag + " test key is: " + key + " value is " + value.toString())
        let resGetReq = await this.getReq(message);
        return resGetReq;
    }

    async kvGet(key){
        console.info(logTag + "_methodName is kvGet");
        let message = new ApiMessage("openHarmony","testApi","kvGet"," ",
		    ["string"],[String(key)]," ");
        let resGetReq = await this.getReq(message);
        return resGetReq;
    }

    async kvDelete(key){
        console.info(logTag + "_methodName is kvDelete");
        let message = new ApiMessage("openHarmony","testApi","kvDelete"," ",
		    ["string"],[String(key)]," ");
        let resGetReq = await this.getReq(message);
        return resGetReq;
    }

    async kvSync(deviceID,mode){
        // deviceID<string>
        // mode<string>,Available values:["PUSH","PUSH_PULL"]
        console.info(logTag + "_methodName is kvDelete");
        let message = new ApiMessage("openHarmony","testApi","kvSync"," ",
		    ["string","string"],[String(deviceID),String(mode)]," ");
        let resGetReq = await this.getReq(message);
        return resGetReq;
    }

    async getRdbStore(rdbStoreName){
        // rdbStoreName<string>: Name of relational store.Example: "UpdataTest.db"
        console.info(logTag + "_methodName is getRdbStore");
        let message = new ApiMessage("openHarmony","testApi","getRdbStore"," ",
		    ["string"],[String(rdbStoreName)]," ");
        let resGetReq = await this.getReq(message);
        return resGetReq;
    }

}
