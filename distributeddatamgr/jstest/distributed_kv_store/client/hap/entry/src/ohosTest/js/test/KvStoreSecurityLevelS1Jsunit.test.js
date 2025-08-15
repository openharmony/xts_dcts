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

import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, Level, Size, TestType } from "@ohos/hypium";
import deviceManager from '@ohos.distributedDeviceManager';
import TestService from '../../../../../../../../../../testtools/disjsTest/client/testService.js';
import RemoteHelper from '../../../../../../../../../../testtools/disjsTest/client/remoteHelper.js';
import factory from '@ohos.data.distributedKVStore';
import { UiDriver, BY } from '@ohos.UiTest'
import featureAbility from '@ohos.ability.featureAbility';
import deviceinfo from '@ohos.deviceInfo'

const bundleNameKv  = "com.acts.distributekvdisjs";
const abilityNameKv = "com.acts.distributekvdisjs.MainAbility";

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
let dmInstance = undefined;

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
const TEST_BUNDLE_NAME = 'com.acts.distributekvdisjs';


let g_context = featureAbility.getContext();
const config = {
  context: g_context,
  bundleName: TEST_BUNDLE_NAME,
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//检查当前应用是否有可信的设备
async function checkAvailableDevice() {
    console.info(logTag + "checkAvailableDevice in "); 
    dmInstance = deviceManager.createDeviceManager(TEST_BUNDLE_NAME);
    deviceList = dmInstance.getAvailableDeviceListSync();
    console.info(logTag + "checkAvailableDevice get deviceList " + JSON.stringify(deviceList));
    if (deviceList.length != 0) {
      console.info(logTag + "return false "); 
      return false;
    } else{
      console.info(logTag + "return true "); 
      return true;
    }
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
        await sleep(2000);
        let button = await driver.findComponent(BY.text('允许'));
        console.info(`button is ${JSON.stringify(button)}`);
        await sleep(2000);
        await button.click();
    } catch (err) {
        console.info('err is ' + err);
        return;
    }

}

export default function kvSyncTestS1() {
    describe('kvSyncTestS1', function () {
        beforeAll(async function (done) {
            console.info(logTag + '-----------------beforeAll begin-----------------');

            let flag_41 = 1;
            let localOSVersion = "";
            let OSVersion41 = "OpenHarmony-4.1";

            let osReleaseTypeInfo = deviceinfo.osReleaseType;
            console.info(logTag + 'the value of the deviceinfo osReleaseType is :' + osReleaseTypeInfo);
            let osFullNameInfo = deviceinfo.osFullName;
            console.info(logTag + 'the value of the deviceinfo osFullName is :' + osFullNameInfo);

            localOSVersion = osFullNameInfo.substring(0, 15);
            console.info(logTag + "localOSVersion is: " + localOSVersion);

            if (localOSVersion == OSVersion41) {
                flag_41 = 1;
                console.info(logTag + "flag_41 is: " + flag_41);
            } else {
                flag_41 = 0;
                console.info(logTag + "flag_41 is: " + flag_41);
            }
            await getPermission();
            await sleep(2000);
            await driveFn();
            await sleep(2000);

            testservice = new TestService();
            //环境初始化
            let checkResult = await checkAvailableDevice();
            console.info(logTag + ' ========== checkResult' + checkResult);
            //如果有可信的设备 就unbindStub
            if (!checkResult) {
                console.info(logTag + ' ==========checkResult unbindStub');
                testservice.unbindStub(TEST_BUNDLE_NAME);
            }
            await sleep(1000);
            let checkResult1 = await checkAvailableDevice();
            console.info(logTag + ' ========== checkResult1' + checkResult1);
            //如果没有可信的设备 需要通过PIN码bind
            if (checkResult1) {
                console.info(logTag + ' ==========checkResult1 startDiscovering');
                testservice.startDiscovering(TEST_BUNDLE_NAME);
                await sleep(3000);
                console.info(logTag + ' ==========checkResult1 bindStub');
                testservice.bindStub(TEST_BUNDLE_NAME);
                await sleep(20000);
                console.info(logTag + ' ==========checkResult1 stopDiscovering');
                testservice.stopDiscovering(TEST_BUNDLE_NAME);
                await sleep(3000);
            }

            console.info(logTag + ' ========== createDeviceManager');
            dmInstance = deviceManager.createDeviceManager(TEST_BUNDLE_NAME);
            deviceList = dmInstance.getAvailableDeviceListSync();
            console.info(logTag + "deviceList.length is: " + deviceList.length);
            deviceId = deviceList[0].networkId;
            console.info(logTag + "deviceId is: " + deviceId);
            syncDeviceIds = [deviceId];
            console.info(logTag + "syncDeviceIds is: " + JSON.stringify(syncDeviceIds));

            try{
                console.info(logTag + "deviceId: " + deviceId);
                let wantValue = {
                    bundleName: bundleNameKv,
                    abilityName: abilityNameKv,
                    deviceId: deviceId
                };
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info(logTag + ' startAbility  success. data=' + JSON.stringify(data));
                }).catch((err) => {
                    console.info(logTag + ' startAbility err: ' + err.code + err.message);
                });
            }catch(error){
                console.info(logTag + "beforeAll startAbility:error = " + error);
            }
            await sleep(1000);
            
            kvManager = factory.createKVManager(config);
            console.info(logTag + "CLIENT create kvManager success, kvManager=" + kvManager);

            await testservice.toConnectAbility().then(data => {
                gIRemoteObject = data;
                console.info(logTag + "toConnectAbility data is" + data);
                remoteHelpers = new RemoteHelper(testservice, gIRemoteObject);
            })
            await remoteHelpers.createKvManager().then(async (data) => {
                console.info(logTag + "REMOTE create KvManager success,ret: " + data);
            })

            console.info(logTag + '-----------------beforeAll end-----------------');
            done();
        })

        beforeEach(async function (done) {
            console.info(logTag + "-----------------beforeEach 0 -----------------");
            done();
        })

        afterEach(async function (done) {
            try{
                console.info(logTag + '-----------------afterEach begin-----------------');
                await kvManager.closeKVStore(TEST_BUNDLE_NAME, TEST_STORE_ID).then(async () => {
                    console.info(logTag + 'CLIENT afterEach closeKVStore success');
                    await kvManager.deleteKVStore(TEST_BUNDLE_NAME, TEST_STORE_ID).then(() => {
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

            } catch (err) {
                console.error('catch afterEach err:' + `, error code is ${err.code}, message is ${err.message}`);
                done();
            }

        })

        afterAll(async function (done) {
            console.info(logTag + '-----------------afterAll-----------------');
            let testservice = new TestService();
            await sleep(1000);
            // 删除当前应用的可信设备
            let checkResult = await checkAvailableDevice();
            if (!checkResult) {
                testservice.unbindStub();
            }
            await sleep(1000);
            console.info(logTag +"afterAll done");
             done();
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0660
         * @tc.name testServerS1Security0500
         * @tc.desc Server kvStore security is S1,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS1Security0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security0500 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_STRING_VALUE);
                        console.info(logTag + "testServerS1Security0500 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");

            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0670
         * @tc.name testServerS1Security0600
         * @tc.desc Server kvStore security is S1,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS1Security0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security0600 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_STRING_VALUE);
                        console.info(logTag + "testServerS1Security0600 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0680
         * @tc.name testServerS1Security0700
         * @tc.desc Server kvStore security is S1,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS1Security0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security0700 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S2,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS1Security0700 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0690
         * @tc.name testServerS1Security0800
         * @tc.desc Server kvStore security is S1,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS1Security0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security0800 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S2,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS1Security0800 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
        * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0700
        * @tc.name testServerS1Security0900
        * @tc.desc Server kvStore security is S1,client kvStore security is S3
        * @tc.level: Level 2
        * @tc.type: Functiontion
        * @tc.size: MediumTest
        */
        it("testServerS1Security0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security0900 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S3,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS1Security0900 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })
        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0710
         * @tc.name testServerS1Security1000
         * @tc.desc Server kvStore security is S1,client kvStore security is S3
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS1Security1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security1000 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S3,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS1Security1000 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0720
         * @tc.name testServerS1Security1100
         * @tc.desc Server kvStore security is S1,client kvStore security is S4
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS1Security1100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security1100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S4,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS1Security1100 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
        * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0730
        * @tc.name testServerS1Security1200
        * @tc.desc Server kvStore security is S1,client kvStore security is S4
        * @tc.level: Level 2
        * @tc.type: Functiontion
        * @tc.size: MediumTest
        */
        it("testServerS1Security1200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security1200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S4,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS1Security1200 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0760
         * @tc.name testServerS2Security0500
         * @tc.desc Server kvStore security is S2,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS2Security0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security0500 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S2", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS2Security0500 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0820
         * @tc.name testServerS2Security0600
         * @tc.desc Server kvStore security is S2,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS2Security0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security0600 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S2", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS2Security0600 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0770
         * @tc.name testServerS2Security0700
         * @tc.desc Server kvStore security is S4,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS2Security0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security0700 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S2,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS2Security0700 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0830
         * @tc.name testServerS2Security0800
         * @tc.desc Server kvStore security is S4,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS2Security0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security0800 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S2,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS2Security0800 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0780
         * @tc.name testServerS2Security0900
         * @tc.desc Server kvStore security is S2,client kvStore security is S3
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS2Security0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security0900 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S2", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S3,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS2Security0900 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0840
         * @tc.name testServerS2Security1000
         * @tc.desc Server kvStore security is S2,client kvStore security is S3
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS2Security1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security1000 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S2", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S3,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS2Security1000 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0790
         * @tc.name testServerS2Security1100
         * @tc.desc Server kvStore security is S2,client kvStore security is S4
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS2Security1100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security1100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S2", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S4,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS2Security1100 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0850
         * @tc.name testServerS2Security1200
         * @tc.desc Server kvStore security is S2,client kvStore security is S4
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS2Security1200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security1200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S2", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S4,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS2Security1200 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0880
         * @tc.name testServerS3Security0500
         * @tc.desc Server kvStore security is S3,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS3Security0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security0500 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S3", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS3Security0500 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0940
         * @tc.name testServerS3Security0600
         * @tc.desc Server kvStore security is S3,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS3Security0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security0600 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S3", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS3Security0600 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0890
         * @tc.name testServerS3Security0700
         * @tc.desc Server kvStore security is S3,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS3Security0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security0700 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S3", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S2,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS3Security0700 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0950
         * @tc.name testServerS3Security0800
         * @tc.desc Server kvStore security is S3,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS3Security0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security0800 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S3", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S2,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS3Security0800 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0900
         * @tc.name testServerS3Security0900
         * @tc.desc Server kvStore security is S4,client kvStore security is S3
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS3Security0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security0900 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S3,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS3Security0900 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0960
         * @tc.name testServerS3Security1000
         * @tc.desc Server kvStore security is S4,client kvStore security is S3
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS3Security1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security1000 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S3,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS3Security1000 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0910
         * @tc.name testServerS3Security1100
         * @tc.desc Server kvStore security is S3,client kvStore security is S4
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS3Security1100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security1100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S3", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S4,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS3Security1100 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0970
         * @tc.name testServerS3Security1200
         * @tc.desc Server kvStore security is S3,client kvStore security is S4
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS3Security1200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security1200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S3", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S4,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS3Security1200 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_1000
         * @tc.name testServerS4Security0500
         * @tc.desc Server kvStore security is S4,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS4Security0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security0500 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS4Security0500 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_1060
         * @tc.name testServerS4Security0600
         * @tc.desc Server kvStore security is S4,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS4Security0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security0600 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS4Security0600 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_1010
         * @tc.name testServerS4Security0700
         * @tc.desc Server kvStore security is S4,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS4Security0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security0700 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS4Security0700 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_1070
         * @tc.name testServerS4Security0800
         * @tc.desc Server kvStore security is S4,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS4Security0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security0800 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS4Security0800 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_1020
         * @tc.name testServerS4Security0900
         * @tc.desc Server kvStore security is S4,client kvStore security is S3
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS4Security0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security0900 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS4Security0900 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_1080
         * @tc.name testServerS4Security1000
         * @tc.desc Server kvStore security is S4,client kvStore security is S3
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS4Security1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security1000 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS4Security1000 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_1030
         * @tc.name testServerS4Security1100
         * @tc.desc Server kvStore security is S4,client kvStore security is S4
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS4Security1100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security1100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS4Security1100 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_1090
         * @tc.name testServerS4Security1200
         * @tc.desc Server kvStore security is S4,client kvStore security is S4
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerS4Security1200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security1200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerS4Security1200 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0040
         * @tc.name testServerKvStoreId0100
         * @tc.desc Get server kvstore with length of storeId is 129 bit.
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerKvStoreId0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerKvStoreId0100 start");
            await remoteHelpers.getKvStore("x".repeat(129), "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerKvStoreId0100 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0200
         * @tc.name testServerKvStoreId0200
         * @tc.desc Get server kvstore with length of storeId is 129 bit.
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerKvStoreId0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerKvStoreId0200 start");
            await remoteHelpers.getKvStore("x".repeat(129), "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        console.info(logTag + "testServerKvStoreId0200 end");
                        kvStore.off("syncComplete", call);
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0030
         * @tc.name testServerKvStoreId0300
         * @tc.desc Get server kvstore with length of storeId is 128 bit.
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerKvStoreId0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerKvStoreId0300 start");
            await remoteHelpers.getKvStore("x".repeat(128), "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore("x".repeat(128), options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, async(err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_STRING_VALUE);
                        kvStore.off("syncComplete", call);

                        console.info(logTag + " ##### deleteKVStore begin #####" );
                        await kvManager.closeKVStore(TEST_BUNDLE_NAME, "x".repeat(128)).then(async () => {
                            console.info(logTag + 'testServerKvStoreId0300 CLIENT  closeKVStore success');
                            await kvManager.deleteKVStore(TEST_BUNDLE_NAME, "x".repeat(128)).then(() => {
                                console.info(logTag + 'testServerKvStoreId0300 CLIENT  deleteKVStore success');
                            });
                        });
                        await remoteHelpers.closeKvStore("x".repeat(128)).then(async (ret) => {
                            console.info(logTag + "testServerKvStoreId0300 remoteHelpers closeKvStore success: " + ret)
                        })
                        await sleep(2000);
                        console.info(logTag + "testServerKvStoreId0300 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0190
         * @tc.name testServerKvStoreId0400
         * @tc.desc Get server kvstore with length of storeId is 128 bit. PUSH_PULL
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerKvStoreId0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerKvStoreId0400 start");
            await remoteHelpers.getKvStore("x".repeat(128), "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore("x".repeat(128), options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, async(err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_STRING_VALUE);
                        kvStore.off("syncComplete", call);

                        console.info(logTag + " ##### deleteKVStore begin #####" );
                        await kvManager.closeKVStore(TEST_BUNDLE_NAME, "x".repeat(128)).then(async () => {
                            console.info(logTag + 'testServerKvStoreId0400 CLIENT  closeKVStore success');
                            await kvManager.deleteKVStore(TEST_BUNDLE_NAME, "x".repeat(128)).then(() => {
                                console.info(logTag + 'testServerKvStoreId0400 CLIENT  deleteKVStore success');
                            });
                        });
                        await remoteHelpers.closeKvStore("x".repeat(128)).then(async (ret) => {
                            console.info(logTag + "testServerKvStoreId0400 remoteHelpers closeKvStore success: " + ret)
                        })
                        await sleep(2000);
                        console.info(logTag + "testServerKvStoreId0400 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }
                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0020
         * @tc.name testServerKvStoreId0500
         * @tc.desc The storeId of the two devices' kvstores are inconsistent
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerKvStoreId0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerKvStoreId0500 start");
            await remoteHelpers.getKvStore("SERVER_KVSTORE", "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, async(err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        kvStore.off("syncComplete", call);

                        console.info(logTag + " ##### deleteKVStore begin #####" );
                        await remoteHelpers.closeKvStore("SERVER_KVSTORE").then(async (ret) => {
                            console.info(logTag + "testServerKvStoreId0500 remoteHelpers closeKvStore success: " + ret)
                        })
                        await sleep(2000);
                        console.info(logTag + "testServerKvStoreId0500 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0180
         * @tc.name testServerKvStoreId0600
         * @tc.desc The storeId of the two devices' kvstores are inconsistent
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerKvStoreId0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerKvStoreId0600 start");
            await remoteHelpers.getKvStore("SERVER_KVSTORE", "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, async(err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        kvStore.off("syncComplete", call);

                        console.info(logTag + " ##### deleteKVStore begin #####" );
                        await remoteHelpers.closeKvStore("SERVER_KVSTORE").then(async (ret) => {
                            console.info(logTag + "testServerKvStoreId0600 remoteHelpers closeKvStore success: " + ret)
                        })
                        await sleep(2000);
                        console.info(logTag + "testServerKvStoreId0600 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0330
         * @tc.name testServerEncryptKVStore0100
         * @tc.desc Unencrypt kvStore PULL from encrypt kvStore
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerEncryptKVStore0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerEncryptKVStore0100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", true);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_STRING_VALUE);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testServerEncryptKVStore0100 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0350
         * @tc.name testServerEncryptKVStore0200
         * @tc.desc Unencrypt kvStore PUSH_PULL to encrypt kvStore
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerEncryptKVStore0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerEncryptKVStore0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", true);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_STRING_VALUE);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testServerEncryptKVStore0200 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0340
         * @tc.name testServerEncryptKVStore0300
         * @tc.desc Encrypt kvStore PULL from encrypt kvStore
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerEncryptKVStore0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerEncryptKVStore0300 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", true);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: true,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_STRING_VALUE);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testServerEncryptKVStore0300 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0360
         * @tc.name testServerEncryptKVStore0400
         * @tc.desc Encrypt kvStore PUSH_PULL to encrypt kvStore
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerEncryptKVStore0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerEncryptKVStore0400 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", true);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: true,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_STRING_VALUE);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testServerEncryptKVStore0400 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0310
         * @tc.name testServerEncryptKVStore0500
         * @tc.desc Encrypt kvStore PULL from unencrypt kvStore
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerEncryptKVStore0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerEncryptKVStore0500 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: true,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_STRING_VALUE);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testServerEncryptKVStore0500 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0320
         * @tc.name testServerEncryptKVStore0600
         * @tc.desc Encrypt kvStore PUSH_PULL unencrypt kvStore
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerEncryptKVStore0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerEncryptKVStore0600 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: true,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_STRING_VALUE);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testServerEncryptKVStore0600 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_1100
         * @tc.name testServerMaxKeyLength0100
         * @tc.desc Length of key greater than 1024
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerMaxKeyLength0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerMaxKeyLength0100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testServerMaxKeyLength0100 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut("x".repeat(1025), TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_1110
         * @tc.name testServerMaxKeyLength0200
         * @tc.desc Length of key greater than 1024
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerMaxKeyLength0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerMaxKeyLength0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testServerMaxKeyLength0200 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut("x".repeat(1025), TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_1120
         * @tc.name testServerMaxKeyLength0300
         * @tc.desc Length of key is 1024
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerMaxKeyLength0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerMaxKeyLength0300 start");
            const KEY = "x".repeat(1024)
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + KEY)
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_STRING_VALUE);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testServerMaxKeyLength0300 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_1130
         * @tc.name testServerMaxKeyLength0400
         * @tc.desc Length of key is 1024
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testServerMaxKeyLength0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerMaxKeyLength0400 start");
            const KEY = "x".repeat(1024)
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + KEY)
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_STRING_VALUE);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testServerMaxKeyLength0400 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0140
         * @tc.name testSyncStringType0100
         * @tc.desc Sync string type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncStringType0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncStringType0100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_STRING_VALUE);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncStringType0100 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0280
         * @tc.name testSyncStringType0200
         * @tc.desc Sync string type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncStringType0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncStringType0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_STRING_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_STRING_VALUE);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncStringType0200 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0060
         * @tc.name testSyncIntType0100
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncIntType0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY)
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_INT_VALUE);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncIntType0100 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_INT_KEY, TEST_INT_VALUE, "Number")
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0220
         * @tc.name testSyncIntType0200
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncIntType0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY)
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_INT_VALUE);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncIntType0200 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_INT_KEY, TEST_INT_VALUE, "Number")
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })


        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0070
         * @tc.name testSyncIntType0300
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncIntType0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0300 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.MAX_VALUE;
            console.info(logTag + "testSyncIntType0300  intValue " + intValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(intValue);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncIntType0300 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0230
         * @tc.name testSyncIntType0400
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncIntType0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0400 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.MAX_VALUE;
            let putValue = Number(intValue);
            console.info(logTag + "testSyncIntType0400  intValue = " + intValue + "   putValue = " + putValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(intValue);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncIntType0400 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0090
         * @tc.name testSyncIntType0500
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncIntType0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0500 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let result = undefined;
            let intValue = Number.MIN_VALUE;
            console.info(logTag + "testSyncIntType0500  intValue " + intValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(intValue);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncIntType0500 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number_Min");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0240
         * @tc.name testSyncIntType0600
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncIntType0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0600 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.MIN_VALUE;
            console.info(logTag + "testSyncIntType0600  intValue " + intValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(intValue);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncIntType0600 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number_Min");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })


        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0110
         * @tc.name testSyncIntType0700
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncIntType0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0700 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.NaN;
            console.info(logTag + "testSyncIntType0700  intValue " + intValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(Number.isNaN(result)).assertTrue();
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncIntType0700 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0250
         * @tc.name testSyncIntType0800
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncIntType0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0800 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.NaN;
            console.info(logTag + "testSyncIntType0800  intValue " + intValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(Number.isNaN(result)).assertTrue();
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncIntType0800 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0120
         * @tc.name testSyncIntType0900
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncIntType0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0900 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.NEGATIVE_INFINITY;
            console.info(logTag + "testSyncIntType0900  intValue " + intValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(intValue);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncIntType0900 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0260
         * @tc.name testSyncIntType1000
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncIntType1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType1000 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.NEGATIVE_INFINITY;
            console.info(logTag + "testSyncIntType1000  intValue " + intValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(intValue);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncIntType1000 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })


        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0130
         * @tc.name testSyncIntType1100
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncIntType1100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType1100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.POSITIVE_INFINITY;
            console.info(logTag + "testSyncIntType1100  intValue " + intValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(intValue);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncIntType1100 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0270
         * @tc.name testSyncIntType1200
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncIntType1200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType1200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.POSITIVE_INFINITY;
            console.info(logTag + "testSyncIntType1200  intValue " + intValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(intValue);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncIntType1200 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0050
         * @tc.name testSyncIntType1300
         * @tc.desc Sync int type data MaxValue+1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
         it("testSyncIntType1300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType1300 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.MAX_VALUE+1;
            console.info(logTag + "testSyncIntType1300  intValue " + intValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_INT_KEY);
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(intValue);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncIntType1300 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0210
         * @tc.name testSyncIntType1400
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
         it("testSyncIntType1400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType1400 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            let intValue = Number.MIN_VALUE-1;
            console.info(logTag + "testSyncIntType1400  intValue " + intValue);
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_INT_KEY, (err, data) => {
                    try {
                        console.info(logTag + "testSyncIntType1400 Sync complete get data,key is " + TEST_INT_KEY);
                        if (err != null) {
                            console.info(logTag + "testSyncIntType1400 Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + "testSyncIntType1400 Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + "testSyncIntType1400 get data finish,result is: " + result);
                        expect(result).assertEqual(intValue);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncIntType1400 end");
                        done();

                    } catch (err) {
                        console.error('testSyncIntType1400 catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_INT_KEY, intValue, "Number");
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0010
         * @tc.name testSyncFloatType0100
         * @tc.desc Sync float type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncFloatType0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncFloatType0100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_FLOAT_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_FLOAT_KEY)
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        expect(result).assertEqual(TEST_FLOAT_VALUE);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncFloatType0100 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_FLOAT_KEY, TEST_FLOAT_VALUE, "Number")
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0160
         * @tc.name testSyncFloatType0200
         * @tc.desc Sync float type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncFloatType0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncFloatType0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_FLOAT_KEY, (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is " + TEST_FLOAT_KEY)
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual(TEST_FLOAT_VALUE);
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncFloatType0200 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_FLOAT_KEY, TEST_FLOAT_VALUE, "Number")
            await sleep(1000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0290
         * @tc.name testSyncMultipleData0100
         * @tc.desc Synchronize multiple pieces of data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncMultipleData0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncMultipleData0100 start");
            let value1 = undefined;
            let value2 = undefined;
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    console.info(logTag + " Sync complete get data,key1 is " + TEST_STRING_KEY)
                    if (err != null) {
                        console.info(logTag + " Sync complete get data1 error,err: " + err)
                    } else {
                        console.info(logTag + " Sycn complete get data1 success,result1 is: " + data)
                        value1 = data
                    }
                    kvStore.get(TEST_FLOAT_KEY, (err, data) => {
                        try {
                            console.info(logTag + " Sync complete get data,key2 is " + TEST_FLOAT_KEY)
                            if (err != null) {
                                console.info(logTag + " Sync complete get data2 error,err: " + err)
                            } else {
                                console.info(logTag + " Sycn complete get data2 success,result2 is: " + data)
                                value2 = data
                            }
                            console.info(logTag + " get data finish")
                            expect(value1).assertEqual(TEST_STRING_VALUE)
                            expect(value2).assertEqual(TEST_FLOAT_VALUE);
                            kvStore.off("syncComplete", call);
                            console.info(logTag + "testSyncMultipleData0100 end");
                            done();

                        } catch (err) {
                            console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                            done();
                        }

                    })
                })

            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await remoteHelpers.kvPut(TEST_FLOAT_KEY, TEST_FLOAT_VALUE, "Number")
            await sleep(2000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0150
         * @tc.name testSyncMultipleData0200
         * @tc.desc Synchronize multiple pieces of data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncMultipleData0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncMultipleData0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })

            let value1 = undefined;
            let value2 = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get(TEST_STRING_KEY, (err, data) => {
                    console.info(logTag + " Sync complete get data,key1 is " + TEST_STRING_KEY)
                    if (err != null) {
                        console.info(logTag + " Sync complete get data1 error,err: " + err)
                    } else {
                        console.info(logTag + " Sycn complete get data1 success,result1 is: " + data)
                        value1 = data
                    }
                    kvStore.get(TEST_FLOAT_KEY, (err, data) => {
                        try {
                            console.info(logTag + " Sync complete get data,key2 is " + TEST_FLOAT_KEY)
                            if (err != null) {
                                console.info(logTag + " Sync complete get data2 error,err: " + err)
                            } else {
                                console.info(logTag + " Sycn complete get data2 success,result2 is: " + data)
                                value2 = data
                            }
                            console.info(logTag + " get data finish")
                            expect(value1).assertEqual(TEST_STRING_VALUE)
                            expect(value2).assertEqual(TEST_FLOAT_VALUE);
                            kvStore.off("syncComplete", call);
                            console.info(logTag + "testSyncMultipleData0200 end");
                            done();

                        } catch (err) {
                            console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                            done();
                        }

                    })
                })
            }
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut(TEST_STRING_KEY, TEST_STRING_VALUE, "String");
            await remoteHelpers.kvPut(TEST_FLOAT_KEY, TEST_FLOAT_VALUE, "Number")
            await sleep(2000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0300
         * @tc.name testSyncDeleteSync0100
         * @tc.desc Synchronize multiple pieces of data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncDeleteSync0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncDeleteSync0100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            await kvStore.put("key1", "value1");
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get("key1", (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is key1");
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncDeleteSync0100 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.sync(syncDeviceIds, PUSH);
            await sleep(3000);

            kvStore.on("syncComplete", call);
            await remoteHelpers.kvDelete("key1");
            kvStore.on('dataChange', factory.SubscribeType.SUBSCRIBE_TYPE_LOCAL, function (data, err) {
                console.info(logTag + "local device data has changed,key is:  " + data.deleteEntries.key);
            })
            await sleep(2000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
            await sleep(600);

        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0170
         * @tc.name testSyncDeleteSync0200
         * @tc.desc Synchronize multiple pieces of data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncDeleteSync0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncDeleteSync0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            await kvStore.put("key1", "value1");
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get("key1", (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is key1");
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result == undefined).assertTrue();
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncDeleteSync0200 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.sync(syncDeviceIds, PUSH_PULL);
            await sleep(3000);
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvDelete("key1");
            kvStore.on('dataChange', factory.SubscribeType.SUBSCRIBE_TYPE_LOCAL, function (data, err) {
                console.info(logTag + "local device data has changed,key is:  " + data.deleteEntries.key);
            })
            await sleep(2000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
            await sleep(600);

        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0230
         * @tc.name testSyncModifySync0100
         * @tc.desc Synchronize multiple pieces of data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncModifySync0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncModifySync0100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            await kvStore.put("key1", "value1");
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get("key1", (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is key1");
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual("value2");
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncModifySync0100 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }

                })
            }
            kvStore.sync(syncDeviceIds, PUSH);
            await sleep(3000);
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut("key1", "value2", "String");
            kvStore.on('dataChange', factory.SubscribeType.SUBSCRIBE_TYPE_LOCAL, function (data, err) {
                console.info(logTag + "local device data has changed,key is:  " + data.updateEntries.key);
            })
            await sleep(2000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
            await sleep(600);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_0090
         * @tc.name testSyncModifySync0200
         * @tc.desc Synchronize multiple pieces of data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncModifySync0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncModifySync0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: '',
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore(TEST_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + " get kvStore success");
            })
            await kvStore.put("key1", "value1");
            let result = undefined;
            function call(data) {
                console.info(logTag + "syncComplete: " + data);
                kvStore.get("key1", (err, data) => {
                    try {
                        console.info(logTag + " Sync complete get data,key is key1");
                        if (err != null) {
                            console.info(logTag + " Sync complete get data error,err: " + err);
                        } else {
                            console.info(logTag + " Sycn complete get data success,result is: " + data);
                            result = data;
                        }
                        console.info(logTag + " get data finish,result is: " + result);
                        expect(result).assertEqual("value2");
                        kvStore.off("syncComplete", call);
                        console.info(logTag + "testSyncModifySync0200 end");
                        done();

                    } catch (err) {
                        console.error('catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                        done();
                    }
                })
            }
            kvStore.sync(syncDeviceIds, PUSH_PULL);
            await sleep(3000);
            kvStore.on("syncComplete", call);
            await remoteHelpers.kvPut("key1", "value2", "String");
            kvStore.on('dataChange', factory.SubscribeType.SUBSCRIBE_TYPE_LOCAL, function (data, err) {
                console.info(logTag + "local device data has changed,key is:  " + data.updateEntries.key);
                expect(data.updateEntries.key).assertEqual("key1");
            })
            await sleep(2000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
            await sleep(600);
        })

        
        /** 
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_SYNCSCHEMA_0100
         * @tc.name testSyncSchema0100
         * @tc.desc Server kvStore security is S1,client kvStore security is S1, prefixKey("test_"), PULL
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncSchema0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncSchema0100 start");
            
            let options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: {},
                securityLevel: factory.SecurityLevel.S1,
            }

            let name = new factory.FieldNode('name');
            name.type = factory.ValueType.INTEGER;
            name.nullable = false;
            name.default = '0';

            let schema = new factory.Schema();
            schema.root.appendChild(name);
            schema.indexes = ['$.name'];
            schema.mode = 1; 

            let TEST_SCHEMA_STORE_ID = "SchemaStoreId_0100";
            let TEST_SCHEMA_STORE_ID_PREF = "SchemaStoreId_";
            let schemaIdPref = TEST_SCHEMA_STORE_ID.substring(0, 14);
            console.info(logTag + "testSyncSchema0100 schemaIdPref=" + schemaIdPref);
            if (schemaIdPref == TEST_SCHEMA_STORE_ID_PREF) {
                options.schema = schema;
            } 
            console.info(logTag + "testSyncSchema0100 options.schema=" + options.schema);
            
            await remoteHelpers.getKvStore(TEST_SCHEMA_STORE_ID, "S1", false);
            await sleep(1000);

            await kvManager.getKVStore(TEST_SCHEMA_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + "testSyncSchema0100 getKVStore success. kvStore=" + kvStore);
                expect(store != null).assertTrue();
            }).catch((err) => {
                console.info(logTag + 'testSyncSchema0100 getKVStore fail. error= ' + error.code + error.message);
                expect(null).assertFail();
            });

            let schemaKey = "test_key_1";
            let schemaValue = '{"name":1}';

            let result = undefined;
            await remoteHelpers.kvPut(schemaKey, schemaValue, "String");
            await sleep(1000);
            console.info(logTag + "testSyncSchema0100 Client sync start");

            const query = new factory.Query();
            query.prefixKey("test_");          
            kvStore.sync(syncDeviceIds, query, PULL, 1000);
            await sleep(5000);

            await kvStore.get(schemaKey, (err, data) => {
                try {
                    console.info(logTag + "testSyncSchema0100  get data,key is " + schemaKey);
                    if (err != null) {
                        console.info(logTag + "testSyncSchema0100 get data error,err: " + err);
                    } else {
                        console.info(logTag + "testSyncSchema0100  get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + "testSyncSchema0100 get data finish,result is: " + result);
                    expect(result).assertEqual(schemaValue);
                    console.info(logTag + "testSyncSchema0100 end");
                } catch (err) {
                    console.error('testSyncSchema0100 catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                }

            })
            await sleep(1000);

            await kvManager.closeKVStore(TEST_BUNDLE_NAME, TEST_SCHEMA_STORE_ID, kvStore, async function () {
                console.info(logTag + 'testSyncSchema0100 CLIENT  closeKVStore success');
                await kvManager.deleteKVStore(TEST_BUNDLE_NAME, TEST_SCHEMA_STORE_ID, function () {
                    console.info(logTag + 'testSyncSchema0100 CLIENT  deleteKVStore success');
                });
            });
            await remoteHelpers.closeKvStore(TEST_SCHEMA_STORE_ID).then(async (ret) => {
                console.info(logTag + "testSyncSchema0100 REMOTE  close server kvStore success: " + ret);
            })
            await sleep(2000);
            kvStore = null;
            console.info(logTag + '-----------------testSyncSchema0100 end-----------------');
            done();
        }) 

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentGradeSyncTest_SYNCSCHEMA_0200
         * @tc.name testSyncSchema0200
         * @tc.desc Server kvStore security is S1,client kvStore security is S1, prefixKey("test_"), PUSH_PULL
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testSyncSchema0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncSchema0200 start");
            
            let options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: {},
                securityLevel: factory.SecurityLevel.S1,
            }

            let name = new factory.FieldNode('name');
            name.type = factory.ValueType.INTEGER;
            name.nullable = false;
            name.default = '0';

            let schema = new factory.Schema();
            schema.root.appendChild(name);
            schema.indexes = ['$.name'];
            schema.mode = 1; 

            let TEST_SCHEMA_STORE_ID = "SchemaStoreId_0200";
            let TEST_SCHEMA_STORE_ID_PREF = "SchemaStoreId_";
            let schemaIdPref = TEST_SCHEMA_STORE_ID.substring(0, 14);
            console.info(logTag + "testSyncSchema0200 schemaIdPref=" + schemaIdPref);
            if (schemaIdPref == TEST_SCHEMA_STORE_ID_PREF) {
                options.schema = schema;
            } 
            console.info(logTag + "testSyncSchema0200 options.schema=" + options.schema);
            
            await remoteHelpers.getKvStore(TEST_SCHEMA_STORE_ID, "S1", false);
            await sleep(1000);

            await kvManager.getKVStore(TEST_SCHEMA_STORE_ID, options).then((store) => {
                kvStore = store;
                console.info(logTag + "testSyncSchema0200 getKVStore success. kvStore=" + kvStore);
                expect(store != null).assertTrue();
            }).catch((err) => {
                console.info(logTag + 'testSyncSchema0200 getKVStore fail. error= ' + error.code + error.message);
                expect(null).assertFail();
            });

            let schemaKey = "test_key_1";
            let schemaValue = '{"name":1}';

            let result = undefined;
            await remoteHelpers.kvPut(schemaKey, schemaValue, "String");
            await sleep(1000);
            console.info(logTag + "testSyncSchema0200 Client sync start");

            const query = new factory.Query();
            query.prefixKey("test_");          
            kvStore.sync(syncDeviceIds, query, PUSH_PULL, 1000);
            await sleep(5000);

            await kvStore.get(schemaKey, (err, data) => {
                try {
                    console.info(logTag + "testSyncSchema0200  get data,key is " + schemaKey);
                    if (err != null) {
                        console.info(logTag + "testSyncSchema0200 get data error,err: " + err);
                    } else {
                        console.info(logTag + "testSyncSchema0200  get data success,result is: " + data);
                        result = data;
                    }
                    console.info(logTag + "testSyncSchema0200 get data finish,result is: " + result);
                    expect(result).assertEqual(schemaValue);
                    console.info(logTag + "testSyncSchema0200 end");
                } catch (err) {
                    console.error('testSyncSchema0200 catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                }
            })
            await sleep(1000);

            await kvManager.closeKVStore(TEST_BUNDLE_NAME, TEST_SCHEMA_STORE_ID, kvStore, async function () {
                console.info(logTag + 'testSyncSchema0200 CLIENT  closeKVStore success');
                await kvManager.deleteKVStore(TEST_BUNDLE_NAME, TEST_SCHEMA_STORE_ID, function () {
                    console.info(logTag + 'testSyncSchema0200 CLIENT  deleteKVStore success');
                });
            });
            await remoteHelpers.closeKvStore(TEST_SCHEMA_STORE_ID).then(async (ret) => {
                console.info(logTag + "testSyncSchema0200 REMOTE  close server kvStore success: " + ret);
            })
            await sleep(2000);
            kvStore = null;
            console.info(logTag + '-----------------testSyncSchema0200 end-----------------');
            done();
        }) 

    })
}