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
import TestService from '../../../../../../../../../testtools/disetsTest/client/testService.ets';
import RemoteHelper from '../../../../../../../../../testtools/disetsTest/client/remoteHelper.ets';
import factory from '@ohos.data.distributedKVStore';
import { Driver, ON } from '@ohos.UiTest';
import deviceinfo from '@ohos.deviceInfo'
import common from '@ohos.app.ability.common';
import abilityAccessCtrl, { Context, PermissionRequestResult } from '@ohos.abilityAccessCtrl';
import { BusinessError } from '@ohos.base';
import StartOptions from '@ohos.app.ability.StartOptions';
import UIAbility from '@ohos.app.ability.UIAbility';
import Want from '@ohos.app.ability.Want';

const bundleNameKv  = "com.acts.distributekvdisets";
const abilityNameKv = "com.acts.distributekvdisets.MainAbility";

let dmInstance : deviceManager.DeviceManager;
let atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();
let deviceList: Array<deviceManager.DeviceBasicInfo>;
let localDeviceId : string;
let deviceId : string;
let syncDeviceIds: string[] = [];
let logTag = '[RpcClient:  ]  ';
//let gIRemoteObject = null;
let remoteHelpers;
let kvManager: factory.KVManager;
let kvStore: factory.SingleKVStore | null;

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
const TEST_BUNDLE_NAME = 'com.acts.distributekvdisets';


let g_context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext;
console.info(logTag + "g_context=" + g_context);
const config = {
  context: g_context,
  bundleName: TEST_BUNDLE_NAME,
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

let getDeviceId = async () =>{
    console.info(logTag + 'let getDeviceId is begin...')
    try {
        dmInstance = deviceManager.createDeviceManager(TEST_BUNDLE_NAME);
        console.info(logTag + "get deviceManager is success")
        deviceList = dmInstance.getAvailableDeviceListSync();
        console.info(logTag + "deviceList.length is: " + deviceList.length);
        deviceId = deviceList[0].networkId;
        syncDeviceIds = [deviceId];
        console.info(logTag + "deviceid is: " + deviceId);
        console.info(logTag + "syncDeviceIds is: " + JSON.stringify(syncDeviceIds));
        console.info(logTag + 'get deviceManager is success')
    } catch (error) {
        console.info(logTag + 'get deviceManager is failed' + JSON.stringify(error))
    }
}


let sleep = (ms:number) =>{
    return new Promise(resolve => setTimeout(resolve, ms));
}

let getPermission = async () =>{
    console.info(logTag + 'let getPermission is begin...');
    let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
    atManager.requestPermissionsFromUser(context, ['ohos.permission.DISTRIBUTED_DATASYNC'], (err: BusinessError, data: PermissionRequestResult) => {
        console.info(logTag + "request success" + JSON.stringify(data));
        console.info(logTag + "request success" + JSON.stringify(err));
    })
}

let driveFn = async () =>{
    try {
        console.info(logTag + 'let driveFn begin...')
        let driver: Driver = await Driver.create()
        console.info(logTag + 'come in driveFn')
        console.info(logTag + 'driver is ${JSON.stringify(driver)}')
        await sleep(2000);
        let button = await driver.findComponent(ON.text('允许'));
        console.info(logTag + 'button is ${JSON.stringify(button)}');
        await sleep(2000);
        await button.click();
        await sleep(1000);
        } catch (err) {
        console.info(logTag + 'err is ' + err);
        return;
    }
}

let startAbility = async () =>{
    try{
        console.info(logTag + "let startAbility begin...");
        let wantValue: Want = {
            bundleName: bundleNameKv,
            abilityName: abilityNameKv,
            deviceId: deviceId
        };

        let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
        context.startAbility(wantValue).then(() => {
            console.info(logTag + ' startAbility success.' );
        }).catch((err) => {
            console.info(logTag + ' startAbility err: ' + err.code + err.message);
        });
    }catch(error){
        console.info(logTag + "beforeAll startAbility:error = " + error);
    }
}

export default function kvSyncTestS1Ets() {
    describe('kvSyncTestS1Ets', function () {
        beforeAll(async function (done) {
            console.info(logTag + '-----------------beforeAll begin-----------------');
            await getPermission();
            await sleep(2000);
            await driveFn();
            await sleep(1000);

            let testservice = new TestService();
            await sleep(1000);

            //环境初始化
            let checkResult = await checkAvailableDevice();
            console.info(logTag + ' ========== checkResult' + checkResult);
            //如果有可信的设备 就unbindStub
            if (!checkResult) {
                console.info(logTag + ' ==========checkResult  unbindStub');
                testservice.unbindStub(TEST_BUNDLE_NAME);
            }
            await sleep(1000);
            let checkResult1 = await checkAvailableDevice();
            console.info(logTag + ' ========== checkResult1' + checkResult1);
            //如果没有可信的设备 就需要再通过PIN码bind
            if (checkResult1) {
                console.info(logTag + ' ==========checkResult1  startDiscovering');
                testservice.startDiscovering(TEST_BUNDLE_NAME);
                await sleep(3000);
                console.info(logTag + ' ==========checkResult1  bindStub');
                testservice.bindStub(TEST_BUNDLE_NAME);
                await sleep(20000);
                console.info(logTag + ' ==========checkResult1  stopDiscovering');
                testservice.stopDiscovering(TEST_BUNDLE_NAME);
                await sleep(3000);
            }

            await getDeviceId();
            await sleep(1000);
            await startAbility();
            await sleep(2000);

            kvManager = factory.createKVManager(config);
            console.info(logTag + "CLIENT create kvManager success, kvManager=" + kvManager);

            await testservice.toConnectAbility().then(data => {
                let gIRemoteObject = data;
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
            console.info(logTag + '-----------------afterAll -----------------');
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_LocalKeyMax_0100
         * @tc.name testEtsLocalKeyMax0100
         * @tc.desc Server kvStore security is S1,client kvStore security is S1, key len=1024
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsLocalKeyMax0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testEtsSyncLocalKeyMax0100 start");

            const options: factory.Options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
                kvStore = store;
                console.info(logTag + " get kvStore success. kvStore=" + kvStore);
                expect(kvStore != null).assertTrue();  
            }).catch((err: BusinessError) => {
                console.error(logTag + `Failed to get KVStore.code is ${err.code},message is ${err.message}`);
                expect(null).assertFail();
              }); 

            let maxKeyLength:number= factory.Constants.MAX_KEY_LENGTH;
            console.info(logTag + 'maxKeyLength = ' + maxKeyLength);
            expect(maxKeyLength == 1024).assertTrue();

            let maxValueLength:number = factory.Constants.MAX_VALUE_LENGTH;
            console.info(logTag + 'maxValueLength = ' + maxValueLength);
            expect(maxValueLength == 4194303).assertTrue();

            let maxKeyLengthString:number = "k".repeat(1024);
            let maxValueLengthString:number = "v".repeat(10);
            console.info(logTag + 'maxKeyLengthString.length = ' + maxKeyLengthString.length);
            console.info(logTag + 'maxValueLengthString.length = ' + maxValueLengthString.length);

            try {
                await kvStore.put(maxKeyLengthString, maxValueLengthString).then(async (data) => {
                  console.info(logTag + ' put success');
                  expect(data == undefined).assertTrue();
                  await kvStore.get(maxKeyLengthString).then((data) => {
                    console.info(logTag + ' get success, data.length= ' + data.length);
                    expect(maxValueLengthString.length == data.length).assertTrue(); 
                    done();
                  }).catch((err) => {
                    console.error(logTag + ' get fail ' + `, error code is ${err.code}, message is ${err.message}`);
                    expect(null).assertFail();
                    done();
                  });
                }).catch((err) => {
                  console.error(logTag + ' put fail ' + `, error code is ${err.code}, message is ${err.message}`);
                  expect(null).assertFail();
                  done();
                });
              } catch (e) {
                console.error(logTag + ' put e ' + `, error code is ${e.code}, message is ${e.message}`);
                expect(null).assertFail();
                done();
              }

            console.info(logTag + "testEtsSyncLocalKeyMax0100 end");
            done();

        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_LocalKeyMax_0200
         * @tc.name testEtsLocalKeyMax0200
         * @tc.desc Server kvStore security is S1,client kvStore security is S1, key len=1025, fail
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsLocalKeyMax0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testEtsSyncLocalKeyMax0200 start");

            const options: factory.Options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
                kvStore = store;
                console.info(logTag + " get kvStore success. kvStore=" + kvStore);
                expect(kvStore != null).assertTrue();  
            }).catch((err: BusinessError) => {
                console.error(logTag + `Failed to get KVStore.code is ${err.code},message is ${err.message}`);
                expect(null).assertFail();
              });

            let maxKeyLength:number= factory.Constants.MAX_KEY_LENGTH;
            console.info(logTag + 'maxKeyLength = ' + maxKeyLength);
            expect(maxKeyLength == 1024).assertTrue();

            let maxValueLength:number = factory.Constants.MAX_VALUE_LENGTH;
            console.info(logTag + 'maxValueLength = ' + maxValueLength);
            expect(maxValueLength == 4194303).assertTrue();

            let maxKeyLengthString:number = "k".repeat(1025);
            let maxValueLengthString:number = "v".repeat(10);
            console.info(logTag + 'maxKeyLengthString.length = ' + maxKeyLengthString.length);
            console.info(logTag + 'maxValueLengthString.length = ' + maxValueLengthString.length);

            try {
                await kvStore.put(maxKeyLengthString, maxValueLengthString).then(async (data) => {
                  console.info(logTag + ' put success');
                  expect(null).assertFail();
                }).catch((err) => {
                  console.error(logTag + ' put fail ' + `, error code is ${err.code}, message is ${err.message}`);
                  expect(err.code == 401).assertTrue();
                  done();
                });
              } catch (e) {
                console.error(logTag + ' put e ' + `, error code is ${e.code}, message is ${e.message}`);
                expect(null).assertFail();
                done();
              }

            console.info(logTag + "testEtsSyncLocalKeyMax0200 end");
            done();

        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_LocalValueMax_0100
         * @tc.name testEtsLocalValueMax0100
         * @tc.desc Server kvStore security is S1,client kvStore security is S1, value len=4194303
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsLocalValueMax0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testEtsLocalValueMax0100 start");

            const options: factory.Options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
                kvStore = store;
                console.info(logTag + " get kvStore success. kvStore=" + kvStore);
                expect(kvStore != null).assertTrue();  
            }).catch((err: BusinessError) => {
                console.error(logTag + `Failed to get KVStore.code is ${err.code},message is ${err.message}`);
                expect(null).assertFail();
              });

            let maxKeyLength:number= factory.Constants.MAX_KEY_LENGTH;
            console.info(logTag + 'maxKeyLength = ' + maxKeyLength);
            expect(maxKeyLength == 1024).assertTrue();

            let maxValueLength:number = factory.Constants.MAX_VALUE_LENGTH;
            console.info(logTag + 'maxValueLength = ' + maxValueLength);
            expect(maxValueLength == 4194303).assertTrue();

            let maxKeyLengthString:number = "k".repeat(1024);
            let maxValueLengthString:number = "v".repeat(4194303);
            console.info(logTag + 'maxKeyLengthString.length = ' + maxKeyLengthString.length);
            console.info(logTag + 'maxValueLengthString.length = ' + maxValueLengthString.length);

            try {
                await kvStore.put(maxKeyLengthString, maxValueLengthString).then(async (data) => {
                  console.info(logTag + ' put success');
                  expect(data == undefined).assertTrue();
                  await kvStore.get(maxKeyLengthString).then((data) => {
                    console.info(logTag + ' get success, data.length= ' + data.length);
                    expect(maxValueLengthString.length == data.length).assertTrue(); 
                    done();
                  }).catch((err) => {
                    console.error(logTag + ' get fail ' + `, error code is ${err.code}, message is ${err.message}`);
                    expect(null).assertFail();
                    done();
                  });
                }).catch((err) => {
                  console.error(logTag + ' put fail ' + `, error code is ${err.code}, message is ${err.message}`);
                  expect(null).assertFail();
                  done();
                });
              } catch (e) {
                console.error(logTag + ' put e ' + `, error code is ${e.code}, message is ${e.message}`);
                expect(null).assertFail();
                done();
              }

            console.info(logTag + "testEtsLocalValueMax0100 end");
            done();

        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_LocalValueMax_0200
         * @tc.name testEtsLocalValueMax0200
         * @tc.desc Server kvStore security is S1,client kvStore security is S1, value len=4194304, fail
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsLocalValueMax0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testEtsLocalValueMax0200 start");

            const options: factory.Options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
                kvStore = store;
                console.info(logTag + " get kvStore success. kvStore=" + kvStore);
                expect(kvStore != null).assertTrue();  
            }).catch((err: BusinessError) => {
                console.error(logTag + `Failed to get KVStore.code is ${err.code},message is ${err.message}`);
                expect(null).assertFail();
              }); 

            let maxKeyLength:number= factory.Constants.MAX_KEY_LENGTH;
            console.info(logTag + 'maxKeyLength = ' + maxKeyLength);
            expect(maxKeyLength == 1024).assertTrue();

            let maxValueLength:number = factory.Constants.MAX_VALUE_LENGTH;
            console.info(logTag + 'maxValueLength = ' + maxValueLength);
            expect(maxValueLength == 4194303).assertTrue();

            let maxKeyLengthString:number = "k".repeat(1024);
            let maxValueLengthString:number = "v".repeat(4194304);
            console.info(logTag + 'maxKeyLengthString.length = ' + maxKeyLengthString.length);
            console.info(logTag + 'maxValueLengthString.length = ' + maxValueLengthString.length);

            try {
                await kvStore.put(maxKeyLengthString, maxValueLengthString).then(async (data) => {
                  console.info(logTag + ' put success');
                  expect(null).assertFail();
                }).catch((err) => {
                  console.error(logTag + ' put fail ' + `, error code is ${err.code}, message is ${err.message}`);
                  expect(err.code == 401).assertTrue();
                  done();
                });
              } catch (e) {
                console.error(logTag + ' put e ' + `, error code is ${e.code}, message is ${e.message}`);
                expect(null).assertFail();
                done();
              }

            console.info(logTag + "testEtsLocalValueMax0200 end");
            done();

        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S1_0500
         * @tc.name testEtsServerS1Security0500
         * @tc.desc Server kvStore security is S1,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS1Security0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security0500 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
  
            const options: factory.Options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
                kvStore = store;
                console.info(logTag + " get kvStore success. kvStore=" + kvStore);
            }).catch((err: BusinessError) => {
                console.error(logTag + `Failed to get KVStore.code is ${err.code},message is ${err.message}`);
              });

            if (kvStore == null) {
                console.info(logTag + " get kvStore success. kvStore=" + kvStore);
                return;
            }
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S1_0600
         * @tc.name testEtsServerS1Security0600
         * @tc.desc Server kvStore security is S1,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS1Security0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security0600 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S1_0700
         * @tc.name testEtsServerS1Security0700
         * @tc.desc Server kvStore security is S1,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS1Security0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security0700 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S2,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S1_0800
         * @tc.name testEtsServerS1Security0800
         * @tc.desc Server kvStore security is S1,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS1Security0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security0800 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S2,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
        * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S1_0900
        * @tc.name testEtsServerS1Security0900
        * @tc.desc Server kvStore security is S1,client kvStore security is S3
        * @tc.level: Level 2
        * @tc.type: Functiontion
        * @tc.size: MediumTest
        */
        it("testEtsServerS1Security0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security0900 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S3,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S1_1000
         * @tc.name testEtsServerS1Security1000
         * @tc.desc Server kvStore security is S1,client kvStore security is S3
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS1Security1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security1000 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S3,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S1_1100
         * @tc.name testEtsServerS1Security1100
         * @tc.desc Server kvStore security is S1,client kvStore security is S4
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS1Security1100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security1100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S4,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
        * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S1_1200
        * @tc.name testEtsServerS1Security1200
        * @tc.desc Server kvStore security is S1,client kvStore security is S4
        * @tc.level: Level 2
        * @tc.type: Functiontion
        * @tc.size: MediumTest
        */
        it("testEtsServerS1Security1200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS1Security1200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S4,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S2_0500
         * @tc.name testEtsServerS2Security0500
         * @tc.desc Server kvStore security is S2,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS2Security0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security0500 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S2", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S2_0600
         * @tc.name testEtsServerS2Security0600
         * @tc.desc Server kvStore security is S2,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS2Security0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security0600 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S2", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S2_0700
         * @tc.name testEtsServerS2Security0700
         * @tc.desc Server kvStore security is S4,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS2Security0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security0700 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S2,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S2_0800
         * @tc.name testEtsServerS2Security0800
         * @tc.desc Server kvStore security is S4,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS2Security0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security0800 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S2,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S2_0900
         * @tc.name testEtsServerS2Security0900
         * @tc.desc Server kvStore security is S2,client kvStore security is S3
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS2Security0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security0900 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S2", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S3,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S2_1000
         * @tc.name testEtsServerS2Security1000
         * @tc.desc Server kvStore security is S2,client kvStore security is S3
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS2Security1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security1000 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S2", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S3,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S2_1100
         * @tc.name testEtsServerS2Security1100
         * @tc.desc Server kvStore security is S2,client kvStore security is S4
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS2Security1100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security1100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S2", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S4,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S2_1200
         * @tc.name testEtsServerS2Security1200
         * @tc.desc Server kvStore security is S2,client kvStore security is S4
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS2Security1200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS2Security1200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S2", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S4,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S3_0500
         * @tc.name testEtsServerS3Security0500
         * @tc.desc Server kvStore security is S3,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS3Security0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security0500 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S3", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S3_0600
         * @tc.name testEtsServerS3Security0600
         * @tc.desc Server kvStore security is S3,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS3Security0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security0600 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S3", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S3_0700
         * @tc.name testEtsServerS3Security0700
         * @tc.desc Server kvStore security is S3,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS3Security0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security0700 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S3", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S2,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S3_0800
         * @tc.name testEtsServerS3Security0800
         * @tc.desc Server kvStore security is S3,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS3Security0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security0800 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S3", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S2,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S3_0900
         * @tc.name testEtsServerS3Security0900
         * @tc.desc Server kvStore security is S4,client kvStore security is S3
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS3Security0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security0900 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S3,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S3_1000
         * @tc.name testEtsServerS3Security1000
         * @tc.desc Server kvStore security is S4,client kvStore security is S3
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS3Security1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security1000 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S3,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S3_1100
         * @tc.name testEtsServerS3Security1100
         * @tc.desc Server kvStore security is S3,client kvStore security is S4
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS3Security1100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security1100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S3", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S4,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S3_1200
         * @tc.name testEtsServerS3Security1200
         * @tc.desc Server kvStore security is S3,client kvStore security is S4
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS3Security1200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS3Security1200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S3", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S4,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S4_0500
         * @tc.name testEtsServerS4Security0500
         * @tc.desc Server kvStore security is S4,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS4Security0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security0500 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S4_0600
         * @tc.name testEtsServerS4Security0600
         * @tc.desc Server kvStore security is S4,client kvStore security is S1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS4Security0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security0600 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S4_0700
         * @tc.name testEtsServerS4Security0700
         * @tc.desc Server kvStore security is S4,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS4Security0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security0700 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S4_0800
         * @tc.name testEtsServerS4Security0800
         * @tc.desc Server kvStore security is S4,client kvStore security is S2
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS4Security0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security0800 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S4_0900
         * @tc.name testEtsServerS4Security0900
         * @tc.desc Server kvStore security is S4,client kvStore security is S3
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS4Security0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security0900 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S4_1000
         * @tc.name testEtsServerS4Security1000
         * @tc.desc Server kvStore security is S4,client kvStore security is S3
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS4Security1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security1000 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S4_1100
         * @tc.name testEtsServerS4Security1100
         * @tc.desc Server kvStore security is S4,client kvStore security is S4
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS4Security1100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security1100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_S4_1200
         * @tc.name testEtsServerS4Security1200
         * @tc.desc Server kvStore security is S4,client kvStore security is S4
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerS4Security1200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerS4Security1200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S4", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERSTOREID_0100
         * @tc.name testEtsServerKvStoreId0100
         * @tc.desc Get server kvstore with length of storeId is 129 bit.
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerKvStoreId0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerKvStoreId0100 start");
            await remoteHelpers.getKvStore("x".repeat(129), "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERSTOREID_0200
         * @tc.name testEtsServerKvStoreId0200
         * @tc.desc Get server kvstore with length of storeId is 129 bit.
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerKvStoreId0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerKvStoreId0200 start");
            await remoteHelpers.getKvStore("x".repeat(129), "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERSTOREID_0300
         * @tc.name testEtsServerKvStoreId0300
         * @tc.desc Get server kvstore with length of storeId is 128 bit.
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerKvStoreId0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerKvStoreId0300 start");
            await remoteHelpers.getKvStore("x".repeat(128), "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>("x".repeat(128), options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERSTOREID_0400
         * @tc.name testEtsServerKvStoreId0400
         * @tc.desc Get server kvstore with length of storeId is 128 bit.PUSH_PULL
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerKvStoreId0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerKvStoreId0400 start");
            await remoteHelpers.getKvStore("x".repeat(128), "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>("x".repeat(128), options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERSTOREID_0500
         * @tc.name testEtsServerKvStoreId0500
         * @tc.desc The storeId of the two devices' kvstores are inconsistent
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerKvStoreId0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerKvStoreId0500 start");
            await remoteHelpers.getKvStore("SERVER_KVSTORE", "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERSTOREID_0600
         * @tc.name testEtsServerKvStoreId0600
         * @tc.desc The storeId of the two devices' kvstores are inconsistent
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerKvStoreId0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerKvStoreId0600 start");
            await remoteHelpers.getKvStore("SERVER_KVSTORE", "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERENCRYPTSTORE_0100
         * @tc.name testEtsServerEncryptKVStore0100
         * @tc.desc Unencrypt kvStore PULL from encrypt kvStore
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerEncryptKVStore0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerEncryptKVStore0100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", true);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERENCRYPTSTORE_0200
         * @tc.name testEtsServerEncryptKVStore0200
         * @tc.desc Unencrypt kvStore PUSH_PULL to encrypt kvStore
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerEncryptKVStore0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerEncryptKVStore0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", true);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERENCRYPTSTORE_0300
         * @tc.name testEtsServerEncryptKVStore0300
         * @tc.desc Encrypt kvStore PULL from encrypt kvStore
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerEncryptKVStore0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerEncryptKVStore0300 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", true);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: true,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERENCRYPTSTORE_0400
         * @tc.name testEtsServerEncryptKVStore0400
         * @tc.desc Encrypt kvStore PUSH_PULL to encrypt kvStore
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerEncryptKVStore0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerEncryptKVStore0400 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", true);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: true,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERENCRYPTSTORE_0500
         * @tc.name testEtsServerEncryptKVStore0500
         * @tc.desc Encrypt kvStore PULL from unencrypt kvStore
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerEncryptKVStore0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerEncryptKVStore0500 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: true,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERENCRYPTSTORE_0600
         * @tc.name testEtsServerEncryptKVStore0600
         * @tc.desc Encrypt kvStore PUSH_PULL unencrypt kvStore
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerEncryptKVStore0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerEncryptKVStore0600 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: true,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERMAXKEYLENGTH_0100
         * @tc.name testEtsServerMaxKeyLength0100
         * @tc.desc Length of key greater than 1024
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerMaxKeyLength0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerMaxKeyLength0100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERMAXKEYLENGTH_0200
         * @tc.name testEtsServerMaxKeyLength0200
         * @tc.desc Length of key greater than 1024
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerMaxKeyLength0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testServerMaxKeyLength0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERMAXKEYLENGTH_0300
         * @tc.name testEtsServerMaxKeyLength0300
         * @tc.desc Length of key is 1024
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerMaxKeyLength0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
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
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SERVERMAXKEYLENGTH_0400
         * @tc.name testEtsServerMaxKeyLength0400
         * @tc.desc Length of key is 1024
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsServerMaxKeyLength0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
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
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCSTRINGTYPE_0100
         * @tc.name testEtsSyncStringType0100
         * @tc.desc Sync string type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncStringType0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncStringType0100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCSTRINGTYPE_0200
         * @tc.name testEtsSyncStringType0200
         * @tc.desc Sync string type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncStringType0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncStringType0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCINTTYPE_0100
         * @tc.name testEtsSyncIntType0100
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncIntType0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCINTTYPE_0200
         * @tc.name testEtsSyncIntType0200
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncIntType0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCINTTYPE_0300
         * @tc.name testEtsSyncIntType0300
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncIntType0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0300 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCINTTYPE_0400
         * @tc.name testEtsSyncIntType0400
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncIntType0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0400 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCINTTYPE_0500
         * @tc.name testEtsSyncIntType0500
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncIntType0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0500 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCINTTYPE_0600
         * @tc.name testEtsSyncIntType0600
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncIntType0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0600 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCINTTYPE_0700
         * @tc.name testEtsSyncIntType0700
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncIntType0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0700 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCINTTYPE_0800
         * @tc.name testEtsSyncIntType0800
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncIntType0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0800 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCINTTYPE_0900
         * @tc.name testEtsSyncIntType0900
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncIntType0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType0900 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCINTTYPE_1000
         * @tc.name testEtsSyncIntType1000
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncIntType1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType1000 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCINTTYPE_1100
         * @tc.name testEtsSyncIntType1100
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncIntType1100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType1100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCINTTYPE_1200
         * @tc.name testEtsSyncIntType1200
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncIntType1200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType1200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCINTTYPE_1300
         * @tc.name testEtsSyncIntType1300
         * @tc.desc Sync int type data MaxValue+1
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
         it("testEtsSyncIntType1300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType1300 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCINTTYPE_1400
         * @tc.name testEtsSyncIntType1400
         * @tc.desc Sync int type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
         it("testEtsSyncIntType1400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncIntType1400 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCFLOATTYPE_0100
         * @tc.name testEtsSyncFloatType0100
         * @tc.desc Sync float type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncFloatType0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncFloatType0100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCFLOATTYPE_0200
         * @tc.name testEtsSyncFloatType0200
         * @tc.desc Sync float type data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncFloatType0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncFloatType0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCMULTIPLEDATA_0100
         * @tc.name testEtsSyncMultipleData0100
         * @tc.desc Synchronize multiple pieces of data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncMultipleData0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
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
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCMULTIPLEDATA_0200
         * @tc.name testEtsSyncMultipleData0200
         * @tc.desc Synchronize multiple pieces of data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncMultipleData0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncMultipleData0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCDELETEYSYNC_0100
         * @tc.name testEtsSyncDeleteSync0100
         * @tc.desc Synchronize multiple pieces of data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncDeleteSync0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncDeleteSync0100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
            kvStore.on('dataChange', factory.SubscribeType.SUBSCRIBE_TYPE_LOCAL, (data) => {
                console.info(logTag + "local device data has changed,key is:  " + data);
            })
            await sleep(2000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
            await sleep(600);

        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCDELETEYSYNC_0200
         * @tc.name testEtsSyncDeleteSync0200
         * @tc.desc Synchronize multiple pieces of data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncDeleteSync0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncDeleteSync0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
            kvStore.on('dataChange', factory.SubscribeType.SUBSCRIBE_TYPE_LOCAL, (data) => {
                console.info(logTag + "local device data has changed,key is:  " + data);
            })
            await sleep(2000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
            await sleep(600);

        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCMODIFYSYNC_0100
         * @tc.name testEtsSyncModifySync0100
         * @tc.desc Synchronize multiple pieces of data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncModifySync0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncModifySync0100 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
            kvStore.on('dataChange', factory.SubscribeType.SUBSCRIBE_TYPE_LOCAL, (data) => {
                console.info(logTag + "local device data has changed,key is:  " + data);
            })
            await sleep(2000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PULL);
            await sleep(600);
        })

        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCMODIFYSYNC_0200
         * @tc.name testEtsSyncModifySync0200
         * @tc.desc Synchronize multiple pieces of data
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncModifySync0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncModifySync0200 start");
            await remoteHelpers.getKvStore(TEST_STORE_ID, "S1", false);
            await sleep(1000);
            const options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }
            await kvManager.getKVStore<factory.SingleKVStore>(TEST_STORE_ID, options).then((store : factory.SingleKVStore) => {
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
            kvStore.on('dataChange', factory.SubscribeType.SUBSCRIBE_TYPE_LOCAL, (data) => {
                console.info(logTag + "local device data has changed,key is:  " + data);
            })
            await sleep(2000);
            console.info(logTag + "Client sync start");
            kvStore.sync(syncDeviceIds, PUSH_PULL);
            await sleep(600);
        })

        
        /**
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCSCHEMA_0100
         * @tc.name testEtsSyncSchema0100
         * @tc.desc Server kvStore security is S1,client kvStore security is S1, prefixKey("test_"), PULL
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncSchema0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncSchema0100 start");
            
            let options: factory.Options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
                securityLevel: factory.SecurityLevel.S1,
            }

            let name: factory.FieldNode = new factory.FieldNode('name');
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

            await kvManager.getKVStore<factory.SingleKVStore>(TEST_SCHEMA_STORE_ID, options).then((store : factory.SingleKVStore) => {
                kvStore = store;
                console.info(logTag + "testSyncSchema0100 getKVStore success. kvStore=" + kvStore);
                expect(store != null).assertTrue();
            }).catch((error) => {
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
            await sleep(4000);

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

            await kvManager.closeKVStore(TEST_BUNDLE_NAME, TEST_SCHEMA_STORE_ID, async function () {
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
         * @tc.number SUB_DistributedData_KVStore_DistributedSync_SDK_DifferentLevelSyncTestEts_SYNCSCHEMA_0200
         * @tc.name testEtsSyncSchema0200
         * @tc.desc Server kvStore security is S1,client kvStore security is S1, prefixKey("test_"), PUSH_PULL
         * @tc.level: Level 2
         * @tc.type: Functiontion
         * @tc.size: MediumTest
         */
        it("testEtsSyncSchema0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async function (done) {
            console.info(logTag + "testSyncSchema0200 start");
            
            let options = {
                createIfMissing: true,
                encrypt: false,
                backup: false,
                autoSync: false,
                kvStoreType: factory.KVStoreType.SINGLE_VERSION,
                schema: undefined,
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

            await kvManager.getKVStore<factory.SingleKVStore>(TEST_SCHEMA_STORE_ID, options).then((store : factory.SingleKVStore) => {
                kvStore = store;
                console.info(logTag + "testSyncSchema0200 getKVStore success. kvStore=" + kvStore);
                expect(store != null).assertTrue();
            }).catch((error) => {
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
            await sleep(4000);

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
                } catch (error) {
                    console.error('testSyncSchema0200 catch get err:' + `, error code is ${err.code}, message is ${err.message}`);
                }
            })
            await sleep(1000);

            await kvManager.closeKVStore(TEST_BUNDLE_NAME, TEST_SCHEMA_STORE_ID, async function () {
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

        /**
     * @tc.name test_SUB_DDM_DKV_SINGLEKVSTORE_ERRCODE_0010
     * @tc.number SUB_DDM_DKV_SINGLEKVSTORE_ERRCODE_0010
     * @tc.desc distributedKVStore sync errcode 15100004
     * @tc.size MediumTest
     * @tc.type Function
     * @tc.level Level 2
     */
    it('SUB_DDM_DKV_SINGLEKVSTORE_ERRCODE_0010', TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done) => {
        console.info('SUB_DDM_DKV_SINGLEKVSTORE_ERRCODE_0010 start');
        try {
          await kvManager?.deleteKVStore(TEST_BUNDLE_NAME, TEST_STORE_ID);
          console.info('Succeeded in deleteKVStore');
          kvStore?.sync(syncDeviceIds, factory.SyncMode.PULL_ONLY);
          console.info(`Succeeded in sync `);
          expect().assertFail();
        } catch (err) {
          console.error(`Failed to sync.code is ${err.code},message is ${err.message}`);
          expect(err.code).assertEqual(15100004);
        };
        done();
      });
  
      /**
       * @tc.name test_SUB_DDM_DKV_SINGLEKVSTORE_ERRCODE_0020
       * @tc.number SUB_DDM_DKV_SINGLEKVSTORE_ERRCODE_0020
       * @tc.desc distributedKVStore sync errcode 15100004 
       * @tc.size MediumTest
       * @tc.type Function
       * @tc.level Level 2
       */
      it('SUB_DDM_DKV_SINGLEKVSTORE_ERRCODE_0020', TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done) => {
        console.info('SUB_DDM_DKV_SINGLEKVSTORE_ERRCODE_0020 start');
        try {
          let query: factory.Query | null = new factory.Query();
          await kvManager?.deleteKVStore(TEST_BUNDLE_NAME, TEST_STORE_ID);
          console.info('Succeeded in deleteKVStore');
          kvStore?.sync(syncDeviceIds, query, factory.SyncMode.PULL_ONLY);
          console.info(`Succeeded in sync `);
          expect().assertFail();
        } catch (err) {
          console.error(`Failed to sync.code is ${err.code},message is ${err.message}`);
          expect(err.code).assertEqual(15100004);
        };
        done();
      });

    })
}