/*
 * Copyright (C) 2024 Huawei Device Co., Ltd.
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
import disData from '@ohos.data.distributedKVStore';
import backgroundTaskManager from '@ohos.backgroundTaskManager';
import dataRdb from '@ohos.data.rdb';
import ApiResult from '../common/apiResult';
import distributedObject from '@ohos.data.distributedDataObject';
import deviceinfo from '@ohos.deviceInfo';

import common from "@ohos.app.ability.common";
const TEST_BUNDLE_NAME = 'com.acts.distributekvdisets';

let logTag = "[[RpcServer_TestApi:  ]]";
let kvManager = null;
let kvStore = null;
let rdbStore = undefined;
let g_object = undefined;


export default class TestApi{
    constructor(){}
    add(a,b) {
        console.log(logTag+"_methodName is add");
        return Number(a)+Number(b);
    }
    sub(a,b) {
        console.log(logTag+"_methodName is sub");
         return Number(a)-Number(b);
    }

    async createKvManager(){
        console.info(logTag + "_methodName is createKvManager");
        try {
            let context = globalThis.extensionContext;
            console.info(logTag + "context=" + context);
            const config = {
                context: context,
                bundleName: TEST_BUNDLE_NAME,
            }
            kvManager = disData.createKVManager(config);
            console.log(logTag + "createKvManager22 success, kvManager=" + kvManager);
        } catch (error) {
            console.error(logTag + "createKvManager22 error.code=" + error.code + "error.message=" + error.message);
        }
        console.info(logTag + "createKvManager22 end");
    }

    async getKvStore(storeId,SecurityLevel,encrypt){
        console.info(logTag + "_methodName is getKvStore, storeId=" + storeId + " SecurityLevel=" + SecurityLevel + " encrypt="+ encrypt);
        console.info(logTag + "kvManager=" + kvManager);
        if(!kvManager) {
            console.info(logTag + "createKvManager22 begin");
           console.info(logTag + "_methodName is createKvManager22");
           try {
                let context = globalThis.extensionContext;
                console.info(logTag + "context=" + context);
                const config = {
                    context: context,
                    bundleName: TEST_BUNDLE_NAME,
                }
                kvManager = disData.createKVManager(config);
                console.log(logTag + "createKvManager22 success, kvManager=" + kvManager);
            } catch (error) {
               console.error(logTag + "createKvManager22 error.code=" + error.code + "error.message=" + error.message);
            }
            console.info(logTag + "createKvManager22 end");
        } 

        let flag_41 = 1;
        let localOSVersion = "";
        let OSVersion41 = "OpenHarmony-4.1";
        let osReleaseTypeInfo = deviceinfo.osReleaseType;
        console.info(logTag + 'the value of the deviceinfo osReleaseType is :' + osReleaseTypeInfo);
        let osFullNameInfo = deviceinfo.osFullName;
        console.info(logTag + 'the value of the deviceinfo osFullName is :' + osFullNameInfo);
    
        localOSVersion = osFullNameInfo.substring(0, 15);
        console.info(logTag + "localOSVersion is: " + localOSVersion);

        var optionsInfo = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync: false,
            kvStoreType : disData.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : disData.SecurityLevel.S1,
        }
        if(encrypt == "true"){
            optionsInfo.encrypt = true;
        }else{
            optionsInfo.encrypt = false;
        }

        if(SecurityLevel == "S1"){
            optionsInfo.securityLevel=disData.SecurityLevel.S1;
        }else if(SecurityLevel == "S2"){
            optionsInfo.securityLevel=disData.SecurityLevel.S2;
        }else if(SecurityLevel == "S3"){
            optionsInfo.securityLevel=disData.SecurityLevel.S3;
        }else if(SecurityLevel == "S4"){
            optionsInfo.securityLevel=disData.SecurityLevel.S4;
        }else {
            optionsInfo.securityLevel=disData.SecurityLevel.S1;
        }

        let name = new disData.FieldNode('name');
        name.type = disData.ValueType.INTEGER;
        name.nullable = false;
        name.default = '0';

        let schema = new disData.Schema();
        schema.root.appendChild(name);
        schema.indexes = ['$.name'];
        schema.mode = 1; 

        let TEST_SCHEMA_STORE_ID_PREF = "SchemaStoreId_";
        let schemaIdPref = storeId.substring(0, 14);
        console.info(logTag + "schemaIdPref=" + schemaIdPref);
        if (schemaIdPref == TEST_SCHEMA_STORE_ID_PREF) {
            optionsInfo.schema = schema;
        } 
        console.info(logTag + "optionsInfo.schema=" + optionsInfo.schema);

        await kvManager.getKVStore(storeId,optionsInfo).then((store) =>{
            kvStore = store;
            console.info(logTag + " getKVStore success, securityLevel is: " + optionsInfo.securityLevel);
            return String(true);
        }).catch((error) => {
            console.error(logTag + "getKVStore fail, error.code=" + error.code + "error.message=" + error.message);
            return String(error);
        });
    }
    async closeKvStore(storeId){
        try{
        await kvManager.closeKVStore(TEST_BUNDLE_NAME, storeId).then(async () => {
            await kvManager.deleteKVStore(TEST_BUNDLE_NAME, storeId).then(() => {
                console.info(logTag + " Server deleteKVStore success, storeId=" + storeId);
                return String(true);
            })
        }).catch((error) => {
            console.error(logTag + "Server deleteKVStore fail, error.code=" + error.code + "error.message=" + error.message);
            return String(error);
        });
        } catch (err) {
            console.error('catch closeKvStore err:' + `, error code is ${err.code}, message is ${err.message}`);
            return String(err);
        }
    }

    async kvPut(key,value,valueType){
        let putValue = undefined;
        console.info(logTag + " putValue : " + putValue + "  value is: " + value + "  valueType is: " + valueType);
        if(valueType == "String"){
            putValue = value;
        }else if(valueType == "String_MAX_VALUE_LENGTH"){
            let maxValueLength = 4194303;
            console.info(logTag + 'maxValueLength = ' + maxValueLength);
            let maxValueLengthString = "v".repeat(maxValueLength);
            console.info(logTag + 'maxValueLengthString.length = ' + maxValueLengthString.length);
            putValue = maxValueLengthString;
        }else if(valueType == "Number"){
            putValue = Number(value);
        }else if(valueType == "Number_Min"){
            putValue = Number.MIN_VALUE;
        }else if(valueType == "Uint8Array"){
            putValue = value.split(',');
        }else if(valueType == "Boolean"){
            if(value == "false"){
                putValue = false;
            }else{
                putValue = Boolean(value);
            }
        }
        console.info(logTag + " putValue : " + putValue + "  value is: " + value + "  valueType is: " + valueType);
        await kvStore.put(key,putValue).then(() =>  {
            console.info(logTag + " Server  put data success ,key is : " + key + " value is: " + putValue);
            return String(true);
        }).catch((error) => {
            console.error(logTag + " Server  put fail, error.code=" + error.code + "error.message=" + error.message);
            return String(error);
        });
    }
     async kvGet(key,callback){
        console.info(logTag + " kvGet start");
        let errInfo = undefined;
        let result = undefined;
        kvStore.get(key, function (err, data){
            errInfo = err;
            result = data;
        })
        if(errInfo != null){
            console.info(logTag + " kvGet get data error: " + errInfo);
            callback(errInfo);
        }else{
            console.info(logTag + " kvGet get data success");
            callback(result);
        }
    }
    async kvDelete(key){
        await kvStore.delete(key).then(() => {
            console.info(logTag + "Delete data success");
            return String(true);
        }).catch((err) => {
            console.info(logTag + "Delete data error,errorInfo: " + err);
            return String(err);

        });
    }

    kvSync(deviceid,mode){
        let syncMode = undefined;
        if(mode == "PUSH"){
            syncMode = disData.SyncMode.PUSH_ONLY;
        }else if(mode == "PUSH_PULL"){
            syncMode = disData.SyncMode.PUSH_PULL;
        }
        kvStore.Sync([deviceid],syncMode);
        return JSON.stringify(syncMode);
    }

    async createObject(objectname, age, isVis){
        try{
            console.info(logTag + "************* createObject begin ************* ");

            let g_context = globalThis.extensionContext;
            console.info(logTag + "context 2= " + g_context);
            if (g_context == undefined || g_context == null) {
                console.info(logTag + "error: g_context = undefined");
                return false;
            }

            g_object = undefined;
            let rename = objectname;
            let reage = Number(age);
            let reisVis = Boolean(isVis);

            console.info(logTag + "objectname=" + objectname + "  age=" + age + "  isVis=" + isVis);
            console.info(logTag + "rename=" + rename + "  reage=" + reage + "  reisVis=" + reisVis);

            g_object = distributedObject.create(g_context, {name: rename, age: reage, isVis: reisVis});
            if (g_object == undefined || g_object == null) {
                console.info(logTag + "error:  g_object = undefined");
                return false;
            }
            console.info(logTag + "createObject success");
            console.info(logTag + g_object.name + "  " + g_object.age + "  " + g_object.isVis);

        }catch (err) {
            console.info(logTag + "createObject error, err: "+ err.code + err.message);
        }
    }

    async setSessionId(sessionId){
        try{
            console.info(logTag + "************* setSessionId begin ************* ");
            console.info(logTag +"g_object=" + g_object);
            if (g_object == undefined || g_object == null) {
                console.info(logTag + "error:  g_object = undefined");
                return false;
            }
            g_object.setSessionId(sessionId).then(() => {
                console.info(logTag + "remote join session success. sessionId=" + sessionId);
            }).catch((error) => {
                console.info(logTag + "remote join session error: " + error.code + error.message);
                return false;
            });
        }catch (err) {
            console.info(logTag + "setSessionId error, err: "+ err.code + err.message);
        }
    }
    
    async objectPut(key,value){
        console.info(logTag + "objectPut key=" + key + "  value=" + value );
        if(key == "name"){
            g_object.name = value;
            console.info(logTag + "objectPut success. name=" + g_object.name);
        }else if(key == "age"){
            g_object.age = Number(value);
            console.info(logTag + "objectPut success. age=" + g_object.age);
        }else if(key == "isVis"){
            if(value == "false"){
                g_object.isVis = false;
            }else{
                g_object.isVis = Boolean(value);
            }
            console.info(logTag + "objectPut success. isVis=" + g_object.isVis);
        }
    }

}
