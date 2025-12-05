/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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

import ApiMessage from './apiMessage.ets';
import ApiResult from './apiResult.ets';
import rpc from '@ohos.rpc';

let logTag = "[RpcClient_RemoteHelper:  ]";
let CODE_INVOKE =1;
let CODE_INVOKE_TESTCASE = 99;

export default class RemoteHelper{
    testservice = undefined;
    gIRemoteObject = undefined;
    constructor(testservice,gIRemoteObject){
        this.testservice = testservice;
        this.gIRemoteObject = gIRemoteObject;
    }

    async getReq(message) {
        try {
            console.log(logTag + "getReq begin");
            console.log(logTag + "getReq. message= "+ JSON.stringify(message));
            let data= rpc.MessageSequence.create();
            let reply = rpc.MessageSequence.create();
            let option = new rpc.MessageOption();
            data.writeParcelable(message);
            await this.gIRemoteObject.sendMessageRequest(CODE_INVOKE, data, reply, option);
            console.log(logTag + "sendMessageRequest got result");
            let ret = new ApiMessage(null, null, null, null, null, null, null);
            reply.readParcelable(ret);
            let retApi = JSON.parse(ret._apiResult);
            let retApiResult = retApi._result;
            console.log(logTag + "***********   read success, results is " + retApiResult + "**************");
            return retApiResult;
        } catch(err) {
            console.error('***********catch getReq err:' + `, error code is ${err.code}, message is ${err.message}`);
            return 411;
        }
    }

    async getReqTestCase(message) {
        try {
            console.log(logTag + "getReqTestCase begin");
            console.log(logTag + "getReqTestCase. message= "+ JSON.stringify(message));
            let data= rpc.MessageSequence.create();
            let reply = rpc.MessageSequence.create();
            let option = new rpc.MessageOption();
            data.writeParcelable(message);
            await this.gIRemoteObject.sendMessageRequest(CODE_INVOKE_TESTCASE, data, reply, option);
            console.log(logTag + "sendMessageRequest got result");
            let ret = new ApiMessage(null, null, null, null, null, null, null);
            reply.readParcelable(ret);
            let retApi = JSON.parse(ret._apiResult);
            let retApiResult = retApi._result;
            console.log(logTag + "***********   read success, results is " + retApiResult + "**************");
            return retApiResult;
        } catch(err) {
            console.error('***********catch getReq err:' + `, error code is ${err.code}, message is ${err.message}`);
            return 411;
        }
    }

    async setTestCaseName(name){
        console.info(logTag + " **************** _methodName is setTestCaseName **************** ");
        let message = new ApiMessage("openHarmony","testApi","setTestCaseName"," ",
        ["string"],[String(name)]," ");
        let resGetReq = await this.getReqTestCase(message);
        return resGetReq;
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
        console.info(logTag + "_methodName is String(value)" + String(value));
        let message = new ApiMessage("openHarmony","testApi","kvPut"," ",
		    ["string",valueType,"string"],[String(key),String(value),String(valueType)]," ");
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

    async createObject(objectname, age, isVis){
        console.info(logTag + " **************** _methodName is createObject **************** ");
        let message = new ApiMessage("openHarmony","testApi","createObject"," ",
        ["string","string","string"],[String(objectname),String(age),String(isVis)]," ");
        let resGetReq = await this.getReq(message);
        return resGetReq;
    }

    async setSessionId(sessionId){
        console.info(logTag + " **************** _methodName is setSessionId **************** ");
        let message = new ApiMessage("openHarmony","testApi","setSessionId"," ",
        ["string"],[String(sessionId)]," ");
        let resGetReq = await this.getReq(message);
        return resGetReq;
    }

    async objectPut(key,value){
        console.info(logTag + "**************** _methodName is objectPut ****************");
        let message = new ApiMessage("openHarmony","testApi","objectPut"," ",
		    ["string","string"],[String(key),String(value)]," ");
        console.info(logTag + "key=" + key + " value=" + value)
        let resGetReq = await this.getReq(message);
        return resGetReq;
    }

}
