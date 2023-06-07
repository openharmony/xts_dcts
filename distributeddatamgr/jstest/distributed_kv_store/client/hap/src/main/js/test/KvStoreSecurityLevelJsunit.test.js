/*
 * Copyright (C) 2023 Huawei Device Co., Ltd.
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

import {describe, beforeAll, beforeEach, afterEach, afterAll, it, expect} from '@ohos/hypium';
import deviceManager from '@ohos.distributedHardware.deviceManager';
import TestService from '../../../../../../../../../testtools/disjsTest/client/testService.js';
import RemoteHelper from '../../../../../../../../../testtools/disjsTest/client/remoteHelper.js';
import factory from '@ohos.data.distributedData';
import { UiDriver, BY } from '@ohos.UiTest';
import featureAbility from '@ohos.ability.featureAbility';

let localDeviceId = undefined;
let logTag = 'RpcClient:  ';
let testservice = null;
let gIRemoteObject = null;
let remoteHelpers = null;
let deviceId = null;
let kvManager = null;
let kvStore = null;
let syncDeviceIds = undefined;
let deviceList = undefined;
const PULL = factory.SyncMode.PULL_ONLY;
const PUSH = factory.SyncMode.PUSH_ONLY;
const PUSH_PULL = factory.SyncMode.PUSH_PULL;
const TEST_STRING_KEY = "TEST_STRING_KEY";
const TEST_STRING_VALUE = "TEST_STRING_VALUE";
const TEST_INT_KEY = "TEST_INT_KEY";
const TEST_INT_VALUE = 1;
const TEST_FLOAT_KEY = "TEST_FLOAT_KEY";
const TEST_FLOAT_VALUE = 1.1;
const TEST_STORE_ID = 'clientStoreId';
const SERVET_STORE_ID = 'clientStoreId';
const TEST_BUNDLE_NAME = 'com.ohos.distributekvdisjs';
const config = {
    bundleName : TEST_BUNDLE_NAME,
    userInfo : {
        userId : '0',
        userType : factory.UserType.SAME_USER_ID
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function getPermission() {
    console.info(`getPermission is start`);
    let permissions = ['ohos.permission.DISTRIBUTED_DATASYNC'];
    let context = featureAbility.getContext();
    context.requestPermissionsFromUser(permissions, 666, (data) => {
        console.info("request success" + JSON.stringify(data));

    })
}
async function driveFn() {
    try {
        let driver = await UiDriver.create();
        console.info(` come in driveFn`);
        console.info(`driver is ${JSON.stringify(driver)}`);
        sleep(2000);
        let button = await driver.findComponent(BY.text('允许'));
        console.info(`button is ${JSON.stringify(button)}`);
        sleep(5000);
        await button.click();
    } catch (err) {
        console.info('err is ' + err);
        return;
    }

}


export default function kvSyncTest() {
describe('kvSyncTest', function () {
    beforeAll(async function (done) {
        console.info(logTag + '-----------------beforeAll begin-----------------');

        await getPermission();
        sleep(5000);
        await driveFn();
        sleep(2000);

        testservice = new TestService();

        console.info(logTag + "deviceId: " + deviceId);
        factory.createKVManager(config, function (err, manager) {
            kvManager = manager;
            console.info(logTag + "CLIENT create kvManager success");
        })
        await testservice.toConnectAbility().then(data => {
            gIRemoteObject = data;
            console.info(logTag + "toConnectAbility data is" + data);
            remoteHelpers = new RemoteHelper(testservice,gIRemoteObject);
        })
        await remoteHelpers.createKvManager().then(async (data) => {
            console.info(logTag + "REMOTE create KvManager success,ret: " + data);
        })
        deviceManager.createDeviceManager(TEST_BUNDLE_NAME,async (error, deviceManager) =>{
            console.info(logTag + "CLIENT Create device manager success");
            localDeviceId = deviceManager.getLocalDeviceInfoSync().deviceId;
            console.info(logTag + "local device id is: " + localDeviceId);

            deviceList = deviceManager.getTrustedDeviceListSync();
            deviceId = deviceList[0].deviceId;
            syncDeviceIds = [deviceId];
        })
        console.info(logTag + '-----------------beforeAll end-----------------');
        done();
    })

    beforeEach(async function(done){
        console.info(logTag + "-----------------beforeEach 0 -----------------");

        done();
    })

    afterEach(async function (done) {
        console.info(logTag + '-----------------afterEach begin-----------------');
        await kvManager.closeKVStore(TEST_BUNDLE_NAME, TEST_STORE_ID, kvStore, async function () {
            console.info(logTag + 'CLIENT afterEach closeKVStore success');
            await kvManager.deleteKVStore(TEST_BUNDLE_NAME, TEST_STORE_ID, function () {
                console.info(logTag + 'CLIENT afterEach deleteKVStore success');
            });
        });
        await remoteHelpers.closeKvStore(SERVET_STORE_ID).then(async (ret) => {
            console.info(logTag + "REMOTE afterEach close server kvStore success: " + ret);
        })
        await sleep(2000);
        kvStore = null;
        console.info(logTag + '-----------------afterEach end-----------------');
        done();
    })

    afterAll(async function (done){
        console.info(logTag + '-----------------afterAll begin-----------------');
        await kvManager.closeKVStore(TEST_BUNDLE_NAME, TEST_STORE_ID, kvStore, async function () {
            console.info(logTag + 'CLIENT afterEach closeKVStore success');
            await kvManager.deleteKVStore(TEST_BUNDLE_NAME, TEST_STORE_ID, function () {
                console.info(logTag + 'CLIENT afterEach deleteKVStore success');
            });
        });
        await remoteHelpers.closeKvStore(SERVET_STORE_ID).then(async (ret) => {
            console.info(logTag + "REMOTE afterEach close server kvStore success: " + ret);
        })
        await sleep(5000);
        kvStore = null;
        console.info(logTag + '-----------------afterAll end-----------------');
        done();
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_NO_LEVEL_0100
     * @tc.name testServerNoLevelSecurity0100
     * @tc.desc Server kvStore security is NO_LEVEL,client kvStore security is NO_LEVEL
     */
    it("testServerNoLevelSecurity0100", 0, async function(done){
        console.info(logTag + "testServerNoLevelSecurity0100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        });

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerNoLevelSecurity0100 end");
                    kvStore.off("syncComplete",call);
                    done();
                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }
            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
        await sleep(500);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_NO_LEVEL_0200
     * @tc.name testServerNoLevelSecurity0200
     * @tc.desc Server kvStore security is NO_LEVEL,client kvStore security is NO_LEVEL
     */
     it("testServerNoLevelSecurity0200", 0, async function(done){
        console.info(logTag + "testServerNoLevelSecurity0200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
            await sleep(1000);
            const options = {
                createIfMissing : true,
                encrypt : false,
                backup : false,
                autoSync : false,
                kvStoreType : factory.KVStoreType.SINGLE_VERSION,
                schema : '',
                securityLevel : factory.SecurityLevel.NO_LEVEL,
            }
            await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            });
    
            let result = undefined;
            function call(data) {
                    console.info(logTag + "syncComplete: " + data);
                    kvStore.get(TEST_STRING_KEY,(err, data) => {
                        try{
                            console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                            if(err != null){
                                console.info(logTag + " Sync complete get data error,err: " + err);
                            }else{
                                console.info(logTag + " Sycn complete get data success,result is: " + data);
                                result = data;
                            }
                            console.info(logTag + " get data finish,result is: " + result);
                            expect(result).assertEqual(TEST_STRING_VALUE);
                            console.info(logTag + "testServerNoLevelSecurity0200 end");
                            kvStore.off("syncComplete",call);
                            done();
                        }catch(err){
                            console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                            done();
                        }

                    })

            }
            kvStore.on("syncComplete",call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);

    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_NO_LEVEL_0300
     * @tc.name testServerNoLevelSecurity0300
     * @tc.desc Server kvStore security is NO_LEVEL,client kvStore security is S0
     */
     it("testServerNoLevelSecurity0300", 0, async function(done){
        console.info(logTag + "testServerNoLevelSecurity0300 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S0,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerNoLevelSecurity0300 end");
                    kvStore.off("syncComplete",call);
                    done();
                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }
            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
        
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_NO_LEVEL_0400
     * @tc.name testServerNoLevelSecurity0400
     * @tc.desc Server kvStore security is NO_LEVEL,client kvStore security is S0
     */
     it("testServerNoLevelSecurity0400", 0, async function(done){
        console.info(logTag + "testServerNoLevelSecurity0400 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S0,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerNoLevelSecurity0400 end");
                    kvStore.off("syncComplete",call);
                    done();
                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }
            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_NO_LEVEL_0500
     * @tc.name testServerNoLevelSecurity0500
     * @tc.desc Server kvStore security is NO_LEVEL,client kvStore security is S1
     */
    it("testServerNoLevelSecurity0500", 0, async function(done){
        console.info(logTag + "testServerNoLevelSecurity0500 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerNoLevelSecurity0500 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }
            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_NO_LEVEL_0600
     * @tc.name testServerNoLevelSecurity0600
     * @tc.desc Server kvStore security is NO_LEVEL,client kvStore security is S1
     */
        it("testServerNoLevelSecurity0600", 0, async function(done){
        console.info(logTag + "testServerNoLevelSecurity0600 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerNoLevelSecurity0600 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }
            })

        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_NO_LEVEL_0700
     * @tc.name testServerNoLevelSecurity0700
     * @tc.desc Server kvStore security is NO_LEVEL,client kvStore security is S2
     */
        it("testServerNoLevelSecurity0700", 0, async function(done){
        console.info(logTag + "testServerNoLevelSecurity0700 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S2,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerNoLevelSecurity0700 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }
            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
        await sleep(500);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_NO_LEVEL_0800
     * @tc.name testServerNoLevelSecurity0800
     * @tc.desc Server kvStore security is NO_LEVEL,client kvStore security is S2
     */
        it("testServerNoLevelSecurity0800", 0, async function(done){
        console.info(logTag + "testServerNoLevelSecurity0800 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S2,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerNoLevelSecurity0800 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }
            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_NO_LEVEL_0900
     * @tc.name testServerNoLevelSecurity0900
     * @tc.desc Server kvStore security is NO_LEVEL,client kvStore security is S3
     */
    it("testServerNoLevelSecurity0900", 0, async function(done){
        console.info(logTag + "testServerNoLevelSecurity0900 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S3,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerNoLevelSecurity0900 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }
            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

     /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_NO_LEVEL_1000
     * @tc.name testServerNoLevelSecurity1000
     * @tc.desc Server kvStore security is NO_LEVEL,client kvStore security is S3
     */
    it("testServerNoLevelSecurity1000", 0, async function(done){
        console.info(logTag + "testServerNoLevelSecurity1000 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S3,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerNoLevelSecurity1000 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }
            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_NO_LEVEL_1100
     * @tc.name testServerNoLevelSecurity1100
     * @tc.desc Server kvStore security is NO_LEVEL,client kvStore security is S4
     */
    it("testServerNoLevelSecurity1100", 0, async function(done){
        console.info(logTag + "testServerNoLevelSecurity1100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S4,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerNoLevelSecurity1100 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }
            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_NO_LEVEL_1200
     * @tc.name testServerNoLevelSecurity1200
     * @tc.desc Server kvStore security is NO_LEVEL,client kvStore security is S4
     */
    it("testServerNoLevelSecurity1200", 0, async function(done){
        console.info(logTag + "testServerNoLevelSecurity1200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S4,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerNoLevelSecurity1200 end");
                    kvStore.off("syncComplete",call);
                    done();
                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }
            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })


    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_NO_LEVEL_1300
     * @tc.name testServerNoLevelSecurity1300
     * @tc.desc Server kvStore security is NO_LEVEL,client kvStore security is null
     */
     it("testServerNoLevelSecurity1300", 0, async function(done){
        console.info(logTag + "testServerNoLevelSecurity1300 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {};
        try{
            await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
                kvStore = store;
                console.info(logTag + " testServerNoLevelSecurity1300 get kvStore success");
            })
        }catch(err){
            console.info(logTag + " testServerNoLevelSecurity1300 get kvStore err"+err.code);
        }

        let result = undefined;

        function call(data) {
            console.info("syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(undefined);
                    console.info(logTag + "testServerNoLevelSecurity1300 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S0_0100
     * @tc.name testServerS0Security0100
     * @tc.desc Server kvStore security is S0,client kvStore security is NO_LEVEL
     */
     it("testServerS0Security0100", 0, async function(done){
        console.info(logTag + "testServerS0Security0100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S0",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerS0Security0100 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

     /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S0_0200
     * @tc.name testServerS0Security0200
     * @tc.desc Server kvStore security is S0,client kvStore security is NO_LEVEL
     */
      it("testServerS0Security0200", 0, async function(done){
        console.info(logTag + "testServerS0Security0200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S0",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerS0Security0200 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S0_0300
     * @tc.name testServerS0Security0300
     * @tc.desc Server kvStore security is S0,client kvStore security is S0
     */
     it("testServerS0Security0300", 0, async function(done){
        console.info(logTag + "testServerS0Security0300 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S0",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S0,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;

        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerS0Security0300 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S0_0400
     * @tc.name testServerS0Security0400
     * @tc.desc Server kvStore security is S0,client kvStore security is S0
     */
    it("testServerS0Security0400", 0, async function(done){
        console.info(logTag + "testServerS0Security0400 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S0",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S0,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
       
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerS0Security0400 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S0_0500
     * @tc.name testServerS0Security0500
     * @tc.desc Server kvStore security is S0,client kvStore security is S1
     */
    it("testServerS0Security0500", 0, async function(done){
        console.info(logTag + "testServerS0Security0500 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S0",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS0Security0500 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }

        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S0_0600
     * @tc.name testServerS0Security0600
     * @tc.desc Server kvStore security is S0,client kvStore security is S1
     */
    it("testServerS0Security0600", 0, async function(done){
        console.info(logTag + "testServerS0Security0600 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S0",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS0Security0600 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }

        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S0_0700
     * @tc.name testServerS0Security0700
     * @tc.desc Server kvStore security is S0,client kvStore security is S2
     */
    it("testServerS0Security0700", 0, async function(done){
        console.info(logTag + "testServerS0Security0700 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S0",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S2,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS0Security0700 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }

        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S0_0800
     * @tc.name testServerS0Security0800
     * @tc.desc Server kvStore security is S0,client kvStore security is S2
     */
     it("testServerS0Security0800", 0, async function(done){
        console.info(logTag + "testServerS0Security0800 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S0",false)
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S2,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS0Security0800 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S0_0900
     * @tc.name testServerS0Security0900
     * @tc.desc Server kvStore security is S0,client kvStore security is S3
     */
    it("testServerS0Security0900", 0, async function(done){
        console.info(logTag + "testServerS0Security0900 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S0",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S3,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS0Security0900 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S0_1000
     * @tc.name testServerS0Security1000
     * @tc.desc Server kvStore security is S0,client kvStore security is S3
     */
    it("testServerS0Security1000", 0, async function(done){
        console.info(logTag + "testServerS0Security1000 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S0",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S3,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS0Security1000 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S0_1100
     * @tc.name testServerS0Security1100
     * @tc.desc Server kvStore security is S0,client kvStore security is S4
     */
    it("testServerS0Security1100", 0, async function(done){
        console.info(logTag + "testServerS0Security1100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S0",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S4,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS0Security1100 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);

    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S0_1200
     * @tc.name testServerS0Security1200
     * @tc.desc Server kvStore security is S0,client kvStore security is S4
     */
    it("testServerS0Security1200", 0, async function(done){
        console.info(logTag + "testServerS0Security1200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S0",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S4,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS0Security1200 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);

    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S1_0100
     * @tc.name testServerS1Security0100
     * @tc.desc Server kvStore security is S1,client kvStore security is NO_LEVEL
     */
    it("testServerS1Security0100", 0, async function(done){
        console.info(logTag + "testServerS1Security0100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S1",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerS1Security0100 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");

        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S1_0200
     * @tc.name testServerS1Security0200
     * @tc.desc Server kvStore security is S1,client kvStore security is NO_LEVEL
     */
    it("testServerS1Security0200", 0, async function(done){
        console.info(logTag + "testServerS1Security0200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S1",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerS1Security0200 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");

        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S1_0300
     * @tc.name testServerS1Security0300
     * @tc.desc Server kvStore security is S1,client kvStore security is S0
     */
     it("testServerS1Security0300", 0, async function(done){
        console.info(logTag + "testServerS1Security0300 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S1",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S0,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS1Security0300 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S1_0400
     * @tc.name testServerS1Security0400
     * @tc.desc Server kvStore security is S1,client kvStore security is S0
     */
     it("testServerS1Security0400", 0, async function(done){
        console.info(logTag + "testServerS1Security0400 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S1",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S0,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS1Security0400 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S1_0500
     * @tc.name testServerS1Security0500
     * @tc.desc Server kvStore security is S1,client kvStore security is S1
     */
     it("testServerS1Security0500", 0, async function(done){
        console.info(logTag + "testServerS1Security0500 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S1",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerS1Security0500 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");

        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S1_0600
     * @tc.name testServerS1Security0600
     * @tc.desc Server kvStore security is S1,client kvStore security is S1
     */
     it("testServerS1Security0600", 0, async function(done){
        console.info(logTag + "testServerS1Security0600 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S1",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    console.info(logTag + "testServerS1Security0600 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S1_0700
     * @tc.name testServerS1Security0700
     * @tc.desc Server kvStore security is S1,client kvStore security is S2
     */
    it("testServerS1Security0700", 0, async function(done){
        console.info(logTag + "testServerS1Security0700 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S1",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S2,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS1Security0700 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S1_0800
     * @tc.name testServerS1Security0800
     * @tc.desc Server kvStore security is S1,client kvStore security is S2
     */
    it("testServerS1Security0800", 0, async function(done){
        console.info(logTag + "testServerS1Security0800 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S1",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S2,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS1Security0800 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

     /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S1_0900
     * @tc.name testServerS1Security0900
     * @tc.desc Server kvStore security is S1,client kvStore security is S3
     */
    it("testServerS1Security0900", 0, async function(done){
        console.info(logTag + "testServerS1Security0900 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S1",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S3,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS1Security0900 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })
    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S1_1000
     * @tc.name testServerS1Security1000
     * @tc.desc Server kvStore security is S1,client kvStore security is S3
     */
    it("testServerS1Security1000", 0, async function(done){
        console.info(logTag + "testServerS1Security1000 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S1",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S3,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS1Security1000 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S1_1100
     * @tc.name testServerS1Security1100
     * @tc.desc Server kvStore security is S1,client kvStore security is S4
     */
    it("testServerS1Security1100", 0, async function(done){
        console.info(logTag + "testServerS1Security1100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S1",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S4,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS1Security1100 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

     /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S1_1200
     * @tc.name testServerS1Security1200
     * @tc.desc Server kvStore security is S1,client kvStore security is S4
     */
    it("testServerS1Security1200", 0, async function(done){
        console.info(logTag + "testServerS1Security1200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S1",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S4,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS1Security1200 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S2_0100
     * @tc.name testServerS2Security0100
     * @tc.desc Server kvStore security is S2,client kvStore security is NO_LEVEL
     */
     it("testServerS2Security0100", 0, async function(done){
        console.info(logTag + "testServerS2Security0100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S2",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS2Security0100 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);

    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S2_0200
     * @tc.name testServerS2Security0200
     * @tc.desc Server kvStore security is S2,client kvStore security is NO_LEVEL
     */
     it("testServerS2Security0200", 0, async function(done){
        console.info(logTag + "testServerS2Security0200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S2",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS2Security0200 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S2_0300
     * @tc.name testServerS2Security0300
     * @tc.desc Server kvStore security is S2,client kvStore security is S0
     */
     it("testServerS2Security0300", 0, async function(done){
        console.info(logTag + "testServerS2Security0300 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S2",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S0,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS2Security0300 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S2_0400
     * @tc.name testServerS2Security0400
     * @tc.desc Server kvStore security is S2,client kvStore security is S0
     */
    it("testServerS2Security0400", 0, async function(done){
        console.info(logTag + "testServerS2Security0400 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S2",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S0,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS2Security0400 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S2_0500
     * @tc.name testServerS2Security0500
     * @tc.desc Server kvStore security is S2,client kvStore security is S1
     */
    it("testServerS2Security0500", 0, async function(done){
        console.info(logTag + "testServerS2Security0500 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S2",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS2Security0500 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S2_0600
     * @tc.name testServerS2Security0600
     * @tc.desc Server kvStore security is S2,client kvStore security is S1
     */
    it("testServerS2Security0600", 0, async function(done){
        console.info(logTag + "testServerS2Security0600 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S2",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS2Security0600 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S2_0700
     * @tc.name testServerS2Security0700
     * @tc.desc Server kvStore security is S2,client kvStore security is S2
     */
    it("testServerS2Security0700", 0, async function(done){
        console.info(logTag + "testServerS2Security0700 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S2",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S2,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS2Security0700 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S2_0800
     * @tc.name testServerS2Security0800
     * @tc.desc Server kvStore security is S2,client kvStore security is S2
     */
     it("testServerS2Security0800", 0, async function(done){
        console.info(logTag + "testServerS2Security0800 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S2",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S2,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS2Security0800 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S2_0900
     * @tc.name testServerS2Security0900
     * @tc.desc Server kvStore security is S2,client kvStore security is S3
    */
    it("testServerS2Security0900", 0, async function(done){
        console.info(logTag + "testServerS2Security0900 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S2",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S3,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS2Security0900 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S2_1000
     * @tc.name testServerS2Security1000
     * @tc.desc Server kvStore security is S2,client kvStore security is S3
    */
    it("testServerS2Security1000", 0, async function(done){
        console.info(logTag + "testServerS2Security1000 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S2",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S3,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS2Security1000 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S2_1100
     * @tc.name testServerS2Security1100
     * @tc.desc Server kvStore security is S2,client kvStore security is S4
    */
    it("testServerS2Security1100", 0, async function(done){
        console.info(logTag + "testServerS2Security1100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S2",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S4,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS2Security1100 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S2_1200
     * @tc.name testServerS2Security1200
     * @tc.desc Server kvStore security is S2,client kvStore security is S4
    */
    it("testServerS2Security1200", 0, async function(done){
        console.info(logTag + "testServerS2Security1200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S2",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S4,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS2Security1200 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S3_0100
     * @tc.name testServerS3Security0100
     * @tc.desc Server kvStore security is S3,client kvStore security is NO_LEVEL
    */
    it("testServerS3Security0100", 0, async function(done){
        console.info(logTag + "testServerS3Security0100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S3",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS3Security0100 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S3_0200
     * @tc.name testServerS3Security0200
     * @tc.desc Server kvStore security is S3,client kvStore security is NO_LEVEL
    */
    it("testServerS3Security0200", 0, async function(done){
        console.info(logTag + "testServerS3Security0200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S3",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS3Security0200 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S3_0300
     * @tc.name testServerS3Security0300
     * @tc.desc Server kvStore security is S3,client kvStore security is S0
    */
    it("testServerS3Security0300", 0, async function(done){
        console.info(logTag + "testServerS3Security0300 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S3",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S0,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS3Security0300 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S3_0400
     * @tc.name testServerS3Security0400
     * @tc.desc Server kvStore security is S3,client kvStore security is S0
    */
    it("testServerS3Security0400", 0, async function(done){
        console.info(logTag + "testServerS3Security0400 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S3",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S0,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS3Security0400 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S3_0500
     * @tc.name testServerS3Security0500
     * @tc.desc Server kvStore security is S3,client kvStore security is S1
    */
    it("testServerS3Security0500", 0, async function(done){
        console.info(logTag + "testServerS3Security0500 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S3",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS3Security0500 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S3_0600
     * @tc.name testServerS3Security0600
     * @tc.desc Server kvStore security is S3,client kvStore security is S1
    */
    it("testServerS3Security0600", 0, async function(done){
        console.info(logTag + "testServerS3Security0600 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S3",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS3Security0600 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S3_0700
     * @tc.name testServerS3Security0700
     * @tc.desc Server kvStore security is S3,client kvStore security is S2
    */
     it("testServerS3Security0700", 0, async function(done){
        console.info(logTag + "testServerS3Security0700 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S3",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S2,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS3Security0700 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S3_0800
     * @tc.name testServerS3Security0800
     * @tc.desc Server kvStore security is S3,client kvStore security is S2
    */
    it("testServerS3Security0800", 0, async function(done){
        console.info(logTag + "testServerS3Security0800 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S3",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S2,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS3Security0800 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S3_0900
     * @tc.name testServerS3Security0900
     * @tc.desc Server kvStore security is S3,client kvStore security is S3
    */
     it("testServerS3Security0900", 0, async function(done){
        console.info(logTag + "testServerS3Security0900 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S3",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S3,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS3Security0900 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S3_1000
     * @tc.name testServerS3Security1000
     * @tc.desc Server kvStore security is S3,client kvStore security is S3
    */
    it("testServerS3Security1000", 0, async function(done){
        console.info(logTag + "testServerS3Security1000 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S3",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S3,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS3Security1000 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S3_1100
     * @tc.name testServerS3Security1100
     * @tc.desc Server kvStore security is S3,client kvStore security is S4
    */
     it("testServerS3Security1100", 0, async function(done){
        console.info(logTag + "testServerS3Security1100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S3",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S4,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS3Security1100 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S3_1200
     * @tc.name testServerS3Security1200
     * @tc.desc Server kvStore security is S3,client kvStore security is S4
    */
     it("testServerS3Security1200", 0, async function(done){
        console.info(logTag + "testServerS3Security1200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S3",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S4,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS3Security1200 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S4_0100
     * @tc.name testServerS4Security0100
     * @tc.desc Server kvStore security is S4,client kvStore security is NO_LEVEL
    */
    it("testServerS4Security0100", 0, async function(done){
        console.info(logTag + "testServerS4Security0100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S4",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS4Security0100 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S4_0200
     * @tc.name testServerS4Security0200
     * @tc.desc Server kvStore security is S4,client kvStore security is NO_LEVEL
    */
    it("testServerS4Security0200", 0, async function(done){
        console.info(logTag + "testServerS4Security0200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S4",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS4Security0200 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S4_0300
     * @tc.name testServerS4Security0300
     * @tc.desc Server kvStore security is S4,client kvStore security is S0
    */
    it("testServerS4Security0300", 0, async function(done){
        console.info(logTag + "testServerS4Security0300 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S4",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S0,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS4Security0300 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S4_0400
     * @tc.name testServerS4Security0400
     * @tc.desc Server kvStore security is S4,client kvStore security is S0
    */
     it("testServerS4Security0400", 0, async function(done){
        console.info(logTag + "testServerS4Security0400 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S4",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S0,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS4Security0400 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);

    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S4_0500
     * @tc.name testServerS4Security0500
     * @tc.desc Server kvStore security is S4,client kvStore security is S1
    */
    it("testServerS4Security0500", 0, async function(done){
        console.info(logTag + "testServerS4Security0500 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S4",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS4Security0500 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S4_0600
     * @tc.name testServerS4Security0600
     * @tc.desc Server kvStore security is S4,client kvStore security is S1
    */
    it("testServerS4Security0600", 0, async function(done){
        console.info(logTag + "testServerS4Security0600 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S4",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS4Security0600 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S4_0700
     * @tc.name testServerS4Security0700
     * @tc.desc Server kvStore security is S4,client kvStore security is S2
    */
     it("testServerS4Security0700", 0, async function(done){
        console.info(logTag + "testServerS4Security0700 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S4",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS4Security0700 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S4_0800
     * @tc.name testServerS4Security0800
     * @tc.desc Server kvStore security is S4,client kvStore security is S2
    */
     it("testServerS4Security0800", 0, async function(done){
        console.info(logTag + "testServerS4Security0800 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S4",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS4Security0800 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S4_0900
     * @tc.name testServerS4Security0900
     * @tc.desc Server kvStore security is S4,client kvStore security is S3
    */
     it("testServerS4Security0900", 0, async function(done){
        console.info(logTag + "testServerS4Security0900 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S4",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS4Security0900 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S4_1000
     * @tc.name testServerS4Security1000
     * @tc.desc Server kvStore security is S4,client kvStore security is S3
    */
    it("testServerS4Security1000", 0, async function(done){
        console.info(logTag + "testServerS4Security1000 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S4",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS4Security1000 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S4_1100
     * @tc.name testServerS4Security1100
     * @tc.desc Server kvStore security is S4,client kvStore security is S4
    */
     it("testServerS4Security1100", 0, async function(done){
        console.info(logTag + "testServerS4Security1100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S4",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS4Security1100 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_S4_1200
     * @tc.name testServerS4Security1200
     * @tc.desc Server kvStore security is S4,client kvStore security is S4
    */
     it("testServerS4Security1200", 0, async function(done){
        console.info(logTag + "testServerS4Security1200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"S4",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.S1,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerS4Security1200 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERSTOREID_0100
     * @tc.name testServerKvStoreId0100
     * @tc.desc Get server kvstore with length of storeId is 129 bit.
     */
     it("testServerKvStoreId0100", 0, async function(done){
        console.info(logTag + "testServerKvStoreId0100 start");
        await remoteHelpers.getKvStore("x".repeat(129),"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerKvStoreId0100 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERSTOREID_0200
     * @tc.name testServerKvStoreId0200
     * @tc.desc Get server kvstore with length of storeId is 129 bit.
     */
     it("testServerKvStoreId0200", 0, async function(done){
        console.info(logTag + "testServerKvStoreId0200 start");
        await remoteHelpers.getKvStore("x".repeat(129),"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    console.info(logTag + "testServerKvStoreId0200 end");
                    kvStore.off("syncComplete",call);
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERSTOREID_0300
     * @tc.name testServerKvStoreId0300
     * @tc.desc Get server kvstore with length of storeId is 128 bit.
     */
     it("testServerKvStoreId0300", 0, async function(done){
        console.info(logTag + "testServerKvStoreId0300 start");
        await remoteHelpers.getKvStore("x".repeat(128),"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore("x".repeat(128),options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    kvStore.off("syncComplete",call);
                    kvManager.deleteKVStore(TEST_BUNDLE_NAME, "x".repeat(128), (err, data) => {
                        console.info(logTag + 'afterEach deleteKVStore success');
                    })
                    remoteHelpers.closeKvStore("x".repeat(128)).then(async (ret) => {
                        console.info(logTag + "afterEach close server kvStore success: " + ret)
                    })
                    console.info(logTag + "testServerKvStoreId0300 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERSTOREID_0400
     * @tc.name testServerKvStoreId0400
     * @tc.desc Get server kvstore with length of storeId is 128 bit.
     */
     it("testServerKvStoreId0400", 0, async function(done){
        console.info(logTag + "testServerKvStoreId0400 start");
        await remoteHelpers.getKvStore("x".repeat(128),"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore("x".repeat(128),options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    kvStore.off("syncComplete",call);
                    kvManager.deleteKVStore(TEST_BUNDLE_NAME, "x".repeat(128), (err, data) => {
                        console.info(logTag + 'afterEach deleteKVStore success');
                    })
                    remoteHelpers.closeKvStore("x".repeat(128)).then(async (ret) => {
                        console.info(logTag + "afterEach close server kvStore success: " + ret)
                    })
                    console.info(logTag + "testServerKvStoreId0400 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }
            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERSTOREID_0500
     * @tc.name testServerKvStoreId0500
     * @tc.desc The storeId of the two devices' kvstores are inconsistent
     */
     it("testServerKvStoreId0500", 0, async function(done){
        console.info(logTag + "testServerKvStoreId0500 start");
        await remoteHelpers.getKvStore("SERVER_KVSTORE","NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    kvStore.off("syncComplete",call);
                    remoteHelpers.closeKvStore("SERVER_KVSTORE")
                    console.info(logTag + "testServerKvStoreId0500 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERSTOREID_0600
     * @tc.name testServerKvStoreId0600
     * @tc.desc The storeId of the two devices' kvstores are inconsistent
     */
     it("testServerKvStoreId0600", 0, async function(done){
        console.info(logTag + "testServerKvStoreId0600 start");
        await remoteHelpers.getKvStore("SERVER_KVSTORE","NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    kvStore.off("syncComplete",call);
                    remoteHelpers.closeKvStore("SERVER_KVSTORE")
                    console.info(logTag + "testServerKvStoreId0600 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERENCRYPTSTORE_0100
     * @tc.name testServerEncryptKVStore0100
     * @tc.desc Unencrypt kvStore PULL from encrypt kvStore
     */
     it("testServerEncryptKVStore0100", 0, async function(done){
        console.info(logTag + "testServerEncryptKVStore0100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",true);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testServerEncryptKVStore0100 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERENCRYPTSTORE_0200
     * @tc.name testServerEncryptKVStore0200
     * @tc.desc Unencrypt kvStore PUSH_PULL to encrypt kvStore
     */
     it("testServerEncryptKVStore0200", 0, async function(done){
        console.info(logTag + "testServerEncryptKVStore0200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",true);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testServerEncryptKVStore0200 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERENCRYPTSTORE_0300
     * @tc.name testServerEncryptKVStore0300
     * @tc.desc Encrypt kvStore PULL from encrypt kvStore
     */
     it("testServerEncryptKVStore0300", 0, async function(done){
        console.info(logTag + "testServerEncryptKVStore0300 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",true);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : true,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testServerEncryptKVStore0300 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERENCRYPTSTORE_0400
     * @tc.name testServerEncryptKVStore0400
     * @tc.desc Encrypt kvStore PUSH_PULL to encrypt kvStore
     */
     it("testServerEncryptKVStore0400", 0, async function(done){
        console.info(logTag + "testServerEncryptKVStore0400 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",true);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : true,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testServerEncryptKVStore0400 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERENCRYPTSTORE_0500
     * @tc.name testServerEncryptKVStore0500
     * @tc.desc Encrypt kvStore PULL from unencrypt kvStore
     */
     it("testServerEncryptKVStore0500", 0, async function(done){
        console.info(logTag + "testServerEncryptKVStore0500 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : true,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testServerEncryptKVStore0500 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERENCRYPTSTORE_0600
     * @tc.name testServerEncryptKVStore0600
     * @tc.desc Encrypt kvStore PUSH_PULL unencrypt kvStore
     */
     it("testServerEncryptKVStore0600", 0, async function(done){
        console.info(logTag + "testServerEncryptKVStore0600 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : true,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testServerEncryptKVStore0600 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERMAXKEYLENGTH_0100
     * @tc.name testServerMaxKeyLength0100
     * @tc.desc Length of key greater than 1024
     */
    it("testServerMaxKeyLength0100", 0, async function(done){
        console.info(logTag + "testServerMaxKeyLength0100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testServerMaxKeyLength0100 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut("x".repeat(1025), TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERMAXKEYLENGTH_0200
     * @tc.name testServerMaxKeyLength0200
     * @tc.desc Length of key greater than 1024
     */
    it("testServerMaxKeyLength0200", 0, async function(done){
        console.info(logTag + "testServerMaxKeyLength0200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testServerMaxKeyLength0200 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }
  
            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut("x".repeat(1025), TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERMAXKEYLENGTH_0300
     * @tc.name testServerMaxKeyLength0300
     * @tc.desc Length of key is 1024
     */
     it("testServerMaxKeyLength0300", 0, async function(done){
        console.info(logTag + "testServerMaxKeyLength0300 start");
        const KEY = "x".repeat(1024)
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + KEY)
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testServerMaxKeyLength0300 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SERVERMAXKEYLENGTH_0400
     * @tc.name testServerMaxKeyLength0400
     * @tc.desc Length of key is 1024
     */
    it("testServerMaxKeyLength0400", 0, async function(done){
        console.info(logTag + "testServerMaxKeyLength0400 start");
        const KEY = "x".repeat(1024)
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + KEY)
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testServerMaxKeyLength0400 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCSTRINGTYPE_0100
     * @tc.name testSyncStringType0100
     * @tc.desc Sync string type data
     */
     it("testSyncStringType0100", 0, async function(done){
        console.info(logTag + "testSyncStringType0100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testSyncStringType0100 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

     /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCSTRINGTYPE_0200
     * @tc.name testSyncStringType0200
     * @tc.desc Sync string type data
     */
      it("testSyncStringType0200", 0, async function(done){
        console.info(logTag + "testSyncStringType0200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_STRING_VALUE);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testSyncStringType0200 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCINTTYPE_0100
     * @tc.name testSyncIntType0100
     * @tc.desc Sync int type data
     */
    it("testSyncIntType0100", 0, async function(done){
        console.info(logTag + "testSyncIntType0100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_INT_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY)
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_INT_VALUE);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testSyncIntType0100 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_INT_KEY, TEST_INT_VALUE, "Number")
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCINTTYPE_0200
     * @tc.name testSyncIntType0200
     * @tc.desc Sync int type data
     */
    it("testSyncIntType0200", 0, async function(done){
        console.info(logTag + "testSyncIntType0200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_INT_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY)
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_INT_VALUE);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testSyncIntType0200 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_INT_KEY, TEST_INT_VALUE, "Number")
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    
    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCINTTYPE_0300
     * @tc.name testSyncIntType0300
     * @tc.desc Sync int type data
     */
     it("testSyncIntType0300", 0, async function(done){
        console.info(logTag + "testSyncIntType0300 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        let intValue = Number.MAX_VALUE;
        console.info(logTag + "testSyncIntType0300  intValue " + intValue);
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_INT_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(intValue);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testSyncIntType0300 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

        /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCINTTYPE_0400
     * @tc.name testSyncIntType0400
     * @tc.desc Sync int type data
     */
         it("testSyncIntType0400", 0, async function(done){
            console.info(logTag + "testSyncIntType0400 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
            await sleep(1000);
            const options = {
                createIfMissing : true,
                encrypt : false,
                backup : false,
                autoSync : false,
                kvStoreType : factory.KVStoreType.SINGLE_VERSION,
                schema : '',
                securityLevel : factory.SecurityLevel.NO_LEVEL,
            }
            await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.MAX_VALUE;
            let putValue = Number(intValue);
            console.info(logTag + "testSyncIntType0400  intValue = " + intValue + "   putValue = " + putValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY,(err, data) => {
                    try{
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if(err != null){
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        }else{
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(intValue);
                        kvStore.off("syncComplete",call);
                        console.info(logTag + "testSyncIntType0400 end");
                        done();

                    }catch(err){
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete",call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCINTTYPE_0500
     * @tc.name testSyncIntType0500
     * @tc.desc Sync int type data
     */
     it("testSyncIntType0500", 0, async function(done){
        console.info(logTag + "testSyncIntType0500 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let result = undefined;
        let intValue = Number.MIN_VALUE;
        console.info(logTag + "testSyncIntType0500  intValue " + intValue);
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_INT_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(intValue);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testSyncIntType0500 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number_Min");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

        /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCINTTYPE_0600
     * @tc.name testSyncIntType0600
     * @tc.desc Sync int type data
     */
         it("testSyncIntType0600", 0, async function(done){
            console.info(logTag + "testSyncIntType0600 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
            await sleep(1000);
            const options = {
                createIfMissing : true,
                encrypt : false,
                backup : false,
                autoSync : false,
                kvStoreType : factory.KVStoreType.SINGLE_VERSION,
                schema : '',
                securityLevel : factory.SecurityLevel.NO_LEVEL,
            }
            await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.MIN_VALUE;
            console.info(logTag + "testSyncIntType0600  intValue " + intValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY,(err, data) => {
                    try{
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if(err != null){
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        }else{
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(intValue);
                        kvStore.off("syncComplete",call);
                        console.info(logTag + "testSyncIntType0600 end");
                        done();

                    }catch(err){
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete",call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number_Min");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })


    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCINTTYPE_0700
     * @tc.name testSyncIntType0700
     * @tc.desc Sync int type data
     */
     it("testSyncIntType0700", 0, async function(done){
        console.info(logTag + "testSyncIntType0700 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        let intValue = Number.NaN;
        console.info(logTag + "testSyncIntType0700  intValue " + intValue);
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_INT_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(Number.isNaN(result)).assertTrue();
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testSyncIntType0700 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

        /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCINTTYPE_0800
     * @tc.name testSyncIntType0800
     * @tc.desc Sync int type data
     */
         it("testSyncIntType0800", 0, async function(done){
            console.info(logTag + "testSyncIntType0800 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
            await sleep(1000);
            const options = {
                createIfMissing : true,
                encrypt : false,
                backup : false,
                autoSync : false,
                kvStoreType : factory.KVStoreType.SINGLE_VERSION,
                schema : '',
                securityLevel : factory.SecurityLevel.NO_LEVEL,
            }
            await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.NaN;
            console.info(logTag + "testSyncIntType0800  intValue " + intValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY,(err, data) => {
                    try{
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if(err != null){
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        }else{
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(Number.isNaN(result)).assertTrue();
                        kvStore.off("syncComplete",call);
                        console.info(logTag + "testSyncIntType0800 end");
                        done();

                    }catch(err){
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete",call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })


        
    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCINTTYPE_0900
     * @tc.name testSyncIntType0900
     * @tc.desc Sync int type data
     */
     it("testSyncIntType0900", 0, async function(done){
        console.info(logTag + "testSyncIntType0900 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        let intValue = Number.NEGATIVE_INFINITY;
        console.info(logTag + "testSyncIntType0900  intValue " + intValue);
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_INT_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(intValue);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testSyncIntType0900 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

        /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCINTTYPE_1000
     * @tc.name testSyncIntType1000
     * @tc.desc Sync int type data
     */
         it("testSyncIntType1000", 0, async function(done){
            console.info(logTag + "testSyncIntType1000 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
            await sleep(1000);
            const options = {
                createIfMissing : true,
                encrypt : false,
                backup : false,
                autoSync : false,
                kvStoreType : factory.KVStoreType.SINGLE_VERSION,
                schema : '',
                securityLevel : factory.SecurityLevel.NO_LEVEL,
            }
            await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.NEGATIVE_INFINITY;
            console.info(logTag + "testSyncIntType1000  intValue " + intValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY,(err, data) => {
                    try{
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if(err != null){
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        }else{
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(intValue);
                        kvStore.off("syncComplete",call);
                        console.info(logTag + "testSyncIntType1000 end");
                        done();

                    }catch(err){
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete",call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

                
    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCINTTYPE_1100
     * @tc.name testSyncIntType1100
     * @tc.desc Sync int type data
     */
     it("testSyncIntType1100", 0, async function(done){
        console.info(logTag + "testSyncIntType1100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        let intValue = Number.POSITIVE_INFINITY;
        console.info(logTag + "testSyncIntType1100  intValue " + intValue);
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_INT_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(intValue);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testSyncIntType1100 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

        /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCINTTYPE_1200
     * @tc.name testSyncIntType1200
     * @tc.desc Sync int type data
     */
         it("testSyncIntType1200", 0, async function(done){
            console.info(logTag + "testSyncIntType1200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
            await sleep(1000);
            const options = {
                createIfMissing : true,
                encrypt : false,
                backup : false,
                autoSync : false,
                kvStoreType : factory.KVStoreType.SINGLE_VERSION,
                schema : '',
                securityLevel : factory.SecurityLevel.NO_LEVEL,
            }
            await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.POSITIVE_INFINITY;
            console.info(logTag + "testSyncIntType1200  intValue " + intValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY,(err, data) => {
                    try{
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if(err != null){
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        }else{
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(intValue);
                        kvStore.off("syncComplete",call);
                        console.info(logTag + "testSyncIntType1200 end");
                        done();

                    }catch(err){
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete",call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })


    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCFLOATTYPE_0100
     * @tc.name testSyncFloatType0100
     * @tc.desc Sync float type data
     */
    it("testSyncFloatType0100", 0, async function(done){
        console.info(logTag + "testSyncFloatType0100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_FLOAT_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_FLOAT_KEY)
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    expect(result).assertEqual(TEST_FLOAT_VALUE);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testSyncFloatType0100 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_FLOAT_KEY, TEST_FLOAT_VALUE, "Number")
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCFLOATTYPE_0200
     * @tc.name testSyncFloatType0200
     * @tc.desc Sync float type data
     */
    it("testSyncFloatType0200", 0, async function(done){
        console.info(logTag + "testSyncFloatType0200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_FLOAT_KEY,(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is " + TEST_FLOAT_KEY)
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual(TEST_FLOAT_VALUE);
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testSyncFloatType0200 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_FLOAT_KEY, TEST_FLOAT_VALUE, "Number")
        await sleep(1000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCMULTIPLEDATA_0100
     * @tc.name testSyncMultipleData0100
     * @tc.desc Synchronize multiple pieces of data
     */
    it("testSyncMultipleData0100", 0, async function(done){
        console.info(logTag + "testSyncMultipleData0100 start");
        let value1 = undefined;
        let value2 = undefined;
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                console.info(logTag + " Sync complete get data,key1 is " + TEST_STRING_KEY)
                if(err != null){
                    console.info(logTag + " Sync complete get data1 error,err: " + err)
                }else{
                    console.info(logTag + " Sycn complete get data1 success,result1 is: " + data)
                    value1 = data
                }
                kvStore.get(TEST_FLOAT_KEY,(err, data) => {
                    try{
                        console.info(logTag + " Sync complete get data,key2 is " + TEST_FLOAT_KEY)
                        if(err != null){
                            console.info(logTag + " Sync complete get data2 error,err: " + err)
                        }else{
                            console.info(logTag + " Sycn complete get data2 success,result2 is: " + data)
                            value2 = data
                        }
                        console.info(logTag + " get data finish")
                        expect(value1).assertEqual(TEST_STRING_VALUE)
                        expect(value2).assertEqual(TEST_FLOAT_VALUE);
                        kvStore.off("syncComplete",call);
                        console.info(logTag + "testSyncMultipleData0100 end");
                        done();

                    }catch(err){
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            })

        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await remoteHelpers.kvPut(TEST_FLOAT_KEY, TEST_FLOAT_VALUE, "Number")
        await sleep(2000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCMULTIPLEDATA_0200
     * @tc.name testSyncMultipleData0200
     * @tc.desc Synchronize multiple pieces of data
     */
    it("testSyncMultipleData0200", 0, async function(done){
        console.info(logTag + "testSyncMultipleData0200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })

        let value1 = undefined;
        let value2 = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get(TEST_STRING_KEY,(err, data) => {
                console.info(logTag + " Sync complete get data,key1 is " + TEST_STRING_KEY)
                if(err != null){
                    console.info(logTag + " Sync complete get data1 error,err: " + err)
                }else{
                    console.info(logTag + " Sycn complete get data1 success,result1 is: " + data)
                    value1 = data
                }
                kvStore.get(TEST_FLOAT_KEY,(err, data) => {
                    try{
                        console.info(logTag + " Sync complete get data,key2 is " + TEST_FLOAT_KEY)
                        if(err != null){
                            console.info(logTag + " Sync complete get data2 error,err: " + err)
                        }else{
                            console.info(logTag + " Sycn complete get data2 success,result2 is: " + data)
                            value2 = data
                        }
                        console.info(logTag + " get data finish")
                        expect(value1).assertEqual(TEST_STRING_VALUE)
                        expect(value2).assertEqual(TEST_FLOAT_VALUE);
                        kvStore.off("syncComplete",call);
                        console.info(logTag + "testSyncMultipleData0200 end");
                        done();

                    }catch(err){
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            })
        }
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
        await remoteHelpers.kvPut(TEST_FLOAT_KEY, TEST_FLOAT_VALUE, "Number")
        await sleep(2000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PUSH_PULL);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCDELETEYSYNC_0100
     * @tc.name testSyncDeleteSync0100
     * @tc.desc Synchronize multiple pieces of data
     */
     it("testSyncDeleteSync0100", 0, async function(done){
        console.info(logTag + "testSyncDeleteSync0100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        await kvStore.put("key1","value1");
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get("key1",(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is key1");
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testSyncDeleteSync0100 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.sync(syncDeviceIds, PUSH);
        await sleep(2000);

        kvStore.on("syncComplete",call);
        await remoteHelpers.kvDelete("key1");
        kvStore.on('dataChange', factory.SubscribeType.SUBSCRIBE_TYPE_LOCAL, function (data, err){
            console.info( logTag + "local device data has changed,key is:  " + data.deleteEntries.key);
        })
        await sleep(2000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds, PULL);
        await sleep(600);

    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCDELETEYSYNC_0200
     * @tc.name testSyncDeleteSync0200
     * @tc.desc Synchronize multiple pieces of data
     */
     it("testSyncDeleteSync0200", 0, async function(done){
        console.info(logTag + "testSyncDeleteSync0200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        await kvStore.put("key1","value1");
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get("key1",(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is key1");
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result == undefined).assertTrue();
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testSyncDeleteSync0200 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.sync(syncDeviceIds, PUSH_PULL);
        await sleep(2000);
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvDelete("key1");
        kvStore.on('dataChange', factory.SubscribeType.SUBSCRIBE_TYPE_LOCAL, function (data, err){
            console.info( logTag + "local device data has changed,key is:  " + data.deleteEntries.key);
        })
        await sleep(2000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds,PUSH_PULL);
        await sleep(600);

    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCMODIFYSYNC_0100
     * @tc.name testSyncModifySync0100
     * @tc.desc Synchronize multiple pieces of data
     */
     it("testSyncModifySync0100", 0, async function(done){
        console.info(logTag + "testSyncModifySync0100 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        await kvStore.put("key1","value1");
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get("key1",(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is key1");
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual("value2");
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testSyncModifySync0100 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }

            })
        }
        kvStore.sync(syncDeviceIds, PUSH);
        await sleep(2000);
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut("key1","value2","String");
        kvStore.on('dataChange', factory.SubscribeType.SUBSCRIBE_TYPE_LOCAL, function (data, err){
            console.info( logTag + "local device data has changed,key is:  " + data.updateEntries.key);
        })
        await sleep(2000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds,PULL);
        await sleep(600);
    })

    /**
     * @tc.number SUB_DISTRIBUTEDDATAMGR_SINGLEKVSTORE_SYNCMODIFYSYNC_0200
     * @tc.name testSyncModifySync0200
     * @tc.desc Synchronize multiple pieces of data
     */
     it("testSyncModifySync0200", 0, async function(done){
        console.info(logTag + "testSyncModifySync0200 start");
        await remoteHelpers.getKvStore(TEST_STORE_ID,"NO_LEVEL",false);
        await sleep(1000);
        const options = {
            createIfMissing : true,
            encrypt : false,
            backup : false,
            autoSync : false,
            kvStoreType : factory.KVStoreType.SINGLE_VERSION,
            schema : '',
            securityLevel : factory.SecurityLevel.NO_LEVEL,
        }
        await kvManager.getKVStore(TEST_STORE_ID,options).then((store) => {
            kvStore = store;
            console.info(logTag + " get kvStore success");
        })
        await kvStore.put("key1","value1");
        let result = undefined;
        function call(data) {
            console.info(logTag + "syncComplete: " + data);
            kvStore.get("key1",(err, data) => {
                try{
                    console.info(logTag + " Sync complete get data,key is key1");
                    if(err != null){
                        console.info(logTag + " Sync complete get data error,err: " + err);
                    }else{
                        console.info(logTag + " Sycn complete get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + " get data finish,result is: " + result);
                    expect(result).assertEqual("value2");
                    kvStore.off("syncComplete",call);
                    console.info(logTag + "testSyncModifySync0200 end");
                    done();

                }catch(err){
                    console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                    done();
                }
            })
        }
        kvStore.sync(syncDeviceIds, PUSH_PULL);
        await sleep(2000);
        kvStore.on("syncComplete",call);
        await remoteHelpers.kvPut("key1","value2","String");
        kvStore.on('dataChange', factory.SubscribeType.SUBSCRIBE_TYPE_LOCAL, function (data, err){
            console.info( logTag + "local device data has changed,key is:  " + data.updateEntries.key);
            expect(data.updateEntries.key).assertEqual("key1");
        })
        await sleep(2000);
        console.info(logTag + "Client sync start");
        kvStore.sync(syncDeviceIds,PUSH_PULL);
        await sleep(600);
    })
})
}