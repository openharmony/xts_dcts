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
import disData from '@ohos.data.distributedData';
import backgroundTaskManager from '@ohos.backgroundTaskManager';
import featureAbility from '@ohos.ability.featureAbility';
import wantAgent from '@ohos.wantAgent';
import dataRdb from '@ohos.data.rdb';
import ApiResult from '../common/apiResult';
import distributedObject from '@ohos.data.distributedDataObject';
import deviceinfo from '@ohos.deviceInfo'

const TEST_BUNDLE_NAME = 'com.ohos.distributekvdisjs';
let logTag = "[[RpcServer_TestApi:  ]]";
let kvManager = undefined;
let kvStore = undefined;
let rdbStore = undefined;

let g_object = undefined;
let context = undefined;


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

    async startBackgroundRunning(){
        console.info(logTag + " Server start background running started");
        let wantAgentInfo = {
            wants: [
                {
                    bundleName: TEST_BUNDLE_NAME,
                    abilityName: "com.ohos.distributekvdisjs.ServiceAbility"
                }
            ],
            operationType: wantAgent.OperationType.START_ABILITY,
            requestCode: 0,
            wantAgentFlags: [wantAgent.WantAgentFlags.UPDATE_PRESENT_FLAG]
        };

        await wantAgent.getWantAgent(wantAgentInfo).then(async (wantAgentObj) => {
            console.info(logTag + " Server startBackgroundRunning get want agent success");
            await backgroundTaskManager.startBackgroundRunning(featureAbility.getContext(),
                backgroundTaskManager.BackgroundMode.DATA_TRANSFER, wantAgentObj).then(() => {
                console.info("Operation startBackgroundRunning succeeded");
            }).catch((err) => {
                console.error("Operation startBackgroundRunning failed Cause: " + err);
            });
        }).catch((err) => {
            console.info(logTag + " Server startBackgroundRunning get want agent err: " + err);
        });
    }

    async stopBackgroundRunning(){
        backgroundTaskManager.stopBackgroundRunning(featureAbility.getContext()).then(() => {
            console.info("Operation stopBackgroundRunning succeeded");
        }).catch((err) => {
            console.error("Operation stopBackgroundRunning failed Cause: " + err);
        });
    }

    async createKvManager(){
        const config = {
            bundleName: TEST_BUNDLE_NAME,
            userInfo: {
                userId: '0',
                userType: disData.UserType.SAME_USER_ID
            }
        }
        console.info(logTag + "_methodName is createKvManager");
        await disData.createKVManager(config).then((manager) =>{
            console.log(logTag + "Created KVManager success");
            kvManager = manager;
            return String(true);
        }).catch((err) => {
            console.log(logTag + "Failed to create KVManager: " + err );
                return String(err);
        });
    }
    async getKvStore(storeId,SecurityLevel,encrypt){
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
            autoSync : true,
            kvStoreType : disData.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : disData.SecurityLevel.S1,
        }
        if(encrypt == "true"){
            optionsInfo.encrypt = true;
        }else{
            optionsInfo.encrypt = false;
        }

        if(SecurityLevel == "NO_LEVEL"){
            optionsInfo.securityLevel=disData.SecurityLevel.NO_LEVEL;
        }else if(SecurityLevel == "S0"){
            optionsInfo.securityLevel=disData.SecurityLevel.S0;
        }else if(SecurityLevel == "S1"){
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

        await kvManager.getKVStore(storeId,optionsInfo).then((store) =>{
            kvStore = store;
            console.info(logTag + " get kvStore success, security level is: " + optionsInfo.securityLevel);
            return String(true);
        }).catch((err) => {
            return String(err);
        });
    }
    async closeKvStore(storeId){
        await kvManager.closeKVStore(TEST_BUNDLE_NAME,storeId,kvStore).then(async () => {
            await kvManager.deleteKVStore(TEST_BUNDLE_NAME,storeId).then(() => {
                console.info(logTag + " Server delete KVStore success");
                return String(true);
            })
        }).catch((err) => {
            return String(err);
        });
    }

    async kvPut(key,value,valueType){
        let putValue = undefined;
        console.info(logTag + " putValue : " + putValue + "  value is: " + value + "  valueType is: " + valueType);
        if(valueType == "String"){
            putValue = value;
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
        console.info(logTag + " putValue : " + putValue + "  value is: " + value);
        await kvStore.put(key,putValue).then(() =>  {
            console.info(logTag + " Server  put data success ,key is : " + key + " value is: " + putValue);
            return String(true);
        }).catch((err) => {
            console.info(logTag + "Server put data fail,err: " + err);
            return String(err);
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
        if(err != null){
            console.info(logTag + " kvGet get data error: " + err);
            callback(err);
        }else{
            console.info(logTag + " kvGet get data success");
            callback(data);
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

    async getRdbStore(rdbStoreName){
        var storeConfig = {
            name: rdbStoreName,
        }
        await dataRdb.getRdbStore(storeConfig,1).then((store) => {
            console.info(logTag + " get rdbStore success");
            rdbStore = store;
            return String(true);
        }).catch((err) => {
            console.info(logTag + " get rdbStore error, err: " + err.code + err.message);
            return String(err);
        });
    }

    async createObject(objectname, age, isVis){
        try{
            console.info(logTag + "************* createObject begin ************* ");
            
            console.info(logTag + "context 1= " + context);
            context = featureAbility.getContext();
            console.info(logTag + "context 2= " + context);
            if (context == undefined || context == null) {
                console.info(logTag + "error: context = undefined");
                return false;
            }

            g_object = undefined;
            let rename = objectname;
            let reage = Number(age);
            let reisVis = Boolean(isVis);

            console.info(logTag + "objectname=" + objectname + "  age=" + age + "  isVis=" + isVis);
            console.info(logTag + "rename=" + rename + "  reage=" + reage + "  reisVis=" + reisVis);

            g_object = distributedObject.create(context, {name: rename, age: reage, isVis: reisVis});
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
