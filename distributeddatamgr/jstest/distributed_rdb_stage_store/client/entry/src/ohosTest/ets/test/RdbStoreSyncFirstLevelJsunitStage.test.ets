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
import TestService from './disetsTest/client/testService';
import RemoteHelper from './disetsTest/client/remoteHelper';
import factory from '@ohos.data.distributedData';
import { UiDriver, BY } from '@ohos.UiTest'
import data_Rdb from '@ohos.data.relationalStore';
import UIAbility from '@ohos.app.ability.UIAbility';
import { BusinessError } from "@ohos.base";
import common from '@ohos.app.ability.common';
import abilityAccessCtrl, { Context, PermissionRequestResult } from '@ohos.abilityAccessCtrl';
import Want from '@ohos.app.ability.Want';

const CREATE_TABLE_TEST : string = "CREATE TABLE IF NOT EXISTS test (" + "id INTEGER PRIMARY KEY AUTOINCREMENT, " + "name TEXT NOT NULL, " + "age INTEGER, " + "salary REAL, " + "blobType BLOB)";
const CREATE_TABLE_NAME : string = "CREATE TABLE IF NOT EXISTS test"

const STORE_CONFIG: data_Rdb.StoreConfig = {
    name: "RemoteRdbStage.db",
    securityLevel: data_Rdb.SecurityLevel.S1
}
let rdbStore: data_Rdb.RdbStore | undefined = undefined;
let rdbSecondStore: data_Rdb.RdbStore | undefined = undefined;
let resultSet: data_Rdb.ResultSet;
let dmInstance: deviceManager.DeviceManager;
let localDeviceId : string|undefined = undefined;
let logTag = 'rdbSyncFirstLevelTest:  ';
let remoteHelpers:RemoteHelper|undefined = undefined;;
let deviceId: string|undefined = undefined;
let syncDeviceIds: string[]|undefined = [];

let deviceList: Array<deviceManager.DeviceBasicInfo>;
let connection: number;
const TEST_BUNDLE_NAME = 'com.acts.distributerdbdisets';
let atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();
//检查当前应用是否有可信的设备
async function checkAvailableDevice() {
  console.info(logTag + "checkAvailableDevice in "); 
  dmInstance = deviceManager.createDeviceManager(TEST_BUNDLE_NAME);
  deviceList = dmInstance.getAvailableDeviceListSync();
  console.info(logTag + "checkAvailableDevice get deviceList " + JSON.stringify(deviceList));
  if (deviceList.length != 0) {
    return false;
  } else{
    return true;
  }
}
async function sleep(ms: number): Promise<void> {
   return new Promise(resolve => setTimeout(resolve, ms));
}
export default function rdbSyncFirstLevelTest(){
    describe('rdbSyncFirstLevelTest', ()=> {
        let getPermission = async () =>{
            console.info('getPermission is start');
            let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext;
            atManager.requestPermissionsFromUser(context, ['ohos.permission.DISTRIBUTED_DATASYNC'], (err: BusinessError, data: PermissionRequestResult) => {
              console.info("request success" + JSON.stringify(data));
              console.info("request success" + JSON.stringify(err));
            })
          }
    
        let driveFn = async () =>{
            try {
                let driver = await UiDriver.create()
                console.info('come in driveFn')
                console.info('driver is ${JSON.stringify(driver)}')
                await sleep(1000);
                let button = await driver.findComponent(BY.text('允许'));
                console.info('button is ${JSON.stringify(button)}');
                await sleep(1000);
                await button.click();
                await sleep(1000);
            } catch (err) {
                console.info('err is ' + err);
                return;
            }
        }

        beforeAll(async (done:Function) => {
            console.info(logTag + '-----------------beforeAll begin-----------------');
            let testservice = new TestService();
            await getPermission();
            await sleep(5000);
            await driveFn();
            await sleep(100);
           //环境初始化
           let checkResult = await checkAvailableDevice();
           if (!checkResult) {
            testservice.unbindStub(TEST_BUNDLE_NAME);
           }
           await sleep(500);
           //如果无可信的设备 需要通过PIN码bind
           if (checkResult) {
            testservice.startDiscovering(TEST_BUNDLE_NAME);
            await sleep(3000);
            testservice.bindStub(TEST_BUNDLE_NAME);
            await sleep(20000);
            testservice.stopDiscovering(TEST_BUNDLE_NAME);
            await sleep(3000);
           }
           let checkResult1 = await checkAvailableDevice();
           //如果有可信的设备，获取可信设备deviceId
           if (checkResult1 === false) {
            deviceId = deviceList[0].networkId;                                                                                                                                                                  
            console.info(logTag + "deviceId is: " + deviceId);
            syncDeviceIds = [deviceId as string];
            console.info(logTag + "syncDeviceIds: " + syncDeviceIds);
           }
            let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext;
            let want: Want = {
                deviceId: deviceId,
                bundleName: "com.acts.distributerdbdisets",
                abilityName: "com.acts.distributerdbdisets.ServiceAbility"
            };
			let connect: common.ConnectOptions = {
                onConnect(elementName, remoteProxy) {
                    console.log(logTag + 'onConnect called, remoteProxy: ' + remoteProxy);
                },
                onDisconnect(elementName) {
                    console.log(logTag + "...onDisconnect...");
                },
                onFailed(code) {
                    console.log(logTag + "...onFailed...");
                }
            }
            try {
              connection = context.connectServiceExtensionAbility(want, connect);
              console.info(logTag + "connect ability got id: " + connection);
            } catch (err) {
              console.info(logTag + "connect ability got id: " + connection);
              console.error(logTag + 'connectServiceExtensionAbility failed' + err);
            };
            await sleep(100);
            rdbStore = await data_Rdb.getRdbStore(context, STORE_CONFIG);
            console.info('Get RdbStore successfully.')
            await rdbStore?.executeSql(CREATE_TABLE_TEST, null);
            console.info(logTag + "create  remote RemoteRdbStage.db success");
            //setDistributedTables
            rdbStore?.setDistributedTables(["test"]).then(() => {
                console.info("SetDistributedTables successfully.");
            }).catch((err: BusinessError) => {
                console.info("SetDistributedTables failed, err: " + err.code);
            })
            await sleep(300);
    

            dmInstance.on("deviceStateChange", (data) => {
                console.log("deviceStateChange: " + JSON.stringify(data));
            });

            let storeObserver = (devices: Array<string>) => {
                for (let i = 0; i < devices.length; i++) {
                    console.log('device=' + devices[i] + ' data changed');
                }
            }
			
            try {
                rdbStore?.on('dataChange', data_Rdb.SubscribeType.SUBSCRIBE_TYPE_REMOTE, storeObserver);
            } catch (err) {
                console.log('Register observer failed' + err); 
            }
            console.info(logTag + '-----------------beforeAll end-----------------');
            done();
        })
    
        beforeEach(async (done:Function) =>{
            console.info(logTag + "-----------------beforeEach 0 -----------------");
            done();
        })
    
        afterEach(async (done:Function) => {
            console.info(logTag + '-----------------afterEach begin-----------------');
            try {
                let deletePre = new data_Rdb.RdbPredicates("test");
                await rdbStore?.delete(deletePre);
                console.info(logTag + "REMOTE afterEach delete rdbStore success");
            } catch (error) {
                console.info(logTag + "REMOTE afterEach delete rdbStore error: " + error);
            }
            console.info(logTag + '-----------------afterEach end-----------------');
            done();
        })
    
        afterAll(async (done:Function) =>{
            console.info(logTag + '-----------------afterAll begin-----------------');
            rdbStore = undefined;
            let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext;
            await data_Rdb.deleteRdbStore(context, "RemoteRdbStage.db");
            console.info(logTag + "delete RemoteRdb success");
            await data_Rdb.deleteRdbStore(context, "RemoteS2Rdb.db");
            console.info(logTag + "delete RemoteS2Rdb success");
            await sleep(50);
            let testservice = new TestService();
            await sleep(1000);
            // 删除当前应用的可信设备
            let checkResult = await checkAvailableDevice();
            console.info(logTag + "checkResult " + checkResult);
            if (!checkResult) {
              testservice.unbindStub(TEST_BUNDLE_NAME);
            }
           await sleep(1000);
           done();
           console.info(logTag + '-----------------afterAll end-----------------');
        })
    
        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_1000
         * @tc.name testRdbSyncStageEtsTest0010
         * @tc.desc Server rdbStore Insert first and synchronize
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
         */
         it("testRdbSyncStageEtsTest0010", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0010 start");
            await sleep(3000);
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket : data_Rdb.ValuesBucket = {
                "name": "zhangsan",
                "age": 18,
                "salary": 100.5,
                "blobType": u8
            }
            await rdbStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0010 insert success");

            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "zhangsan");
            let resultSet = await rdbStore?.query(predicates);
            try {
                expect(true).assertEqual(resultSet?.goToFirstRow());
                const id = resultSet?.getLong(resultSet?.getColumnIndex("id"));
                const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncStageEtsTest0010 id=" + id + ", name=" + name);
                expect(1).assertEqual(id);
                expect("zhangsan").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0010 insert error " + e);
                expect().assertFail();
            }
            resultSet?.close();
            predicates.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0010 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0010 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0010 sync failed' + err.code);
                expect().assertFail();
            })
            await sleep(800);
            done();
            console.info(logTag + "************* testRdbStoreInsert0001 end *************");
        })
    
         /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_1800
         * @tc.name testRdbSyncStageEtsTest0020
         * @tc.desc Server rdbStore Insert twice and synchronize twice
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
         */
        it("testRdbSyncStageEtsTest0020", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0020 start");
            //push data to remote device
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket : data_Rdb.ValuesBucket = {
                "name": "xuewang",
                "age": 300,
                "salary": 20.533,
                "blobType": u8
            }
            await rdbStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0020 insert success");

            let predicates = new data_Rdb.RdbPredicates('test');
            
            predicates.inDevices(syncDeviceIds);
            console.info(logTag + "testRdbSyncStageEtsTest0020 sync before" + syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0020 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0020 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0020 sync failed' + err.code);
                expect().assertFalse();
            })
            await sleep(800);
            let  u8Arr = new Uint8Array([1,2,3,4,5]);
            const valueBucket1: data_Rdb.ValuesBucket = {
                "name": "xuewang22",
                "age": 10,
                "salary": 50.366,
                "blobType": u8Arr
            }
            await rdbStore?.insert("test", valueBucket1);
            console.info("testRdbSyncStageEtsTest0020 insert success");
            //query
            let resultSet = await rdbStore?.query(predicates);
            try {
                console.info(logTag + "testRdbSyncStageEtsTest0020 resultSet.rowCount: "+ resultSet?.rowCount);
                expect(2).assertEqual(resultSet?.rowCount);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0020 query error " + e);
                expect().assertFail();
            }
            resultSet?.close();
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0020 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0020 sync failed' + err.code);
                expect().assertFalse();
            })
              await sleep(800);
            done();
            console.info(logTag + "************* testRdbStoreInsert0010 end *************");
        })
    
        /**
        * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_2300
        * @tc.name testRdbSyncStageEtsTest0030
        * @tc.desc Server rdbStore Insert synchronization and then update synchronization
        * @tc.size MediumTest
        * @tc.type Function
        * @tc.level Level 2
        */
        it("testRdbSyncStageEtsTest0030", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0030 start");
    
            //push data to remote device
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket : data_Rdb.ValuesBucket = {
                "name": "xuewang",
                "age": 300,
                "salary": 20.533,
                "blobType": u8
            }
            await rdbStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0030 insert success");

            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0030 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0030 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0030 sync failed' + err.code);
                expect().assertFalse();
            })
            await sleep(800);
            let  u8Arr = new Uint8Array([1,2,3,4,5]);
            {
                const valueBucket1: data_Rdb.ValuesBucket = {
                    "name": "xuewang22",
                    "age": 10,
                    "salary": 50.366,
                    "blobType": u8Arr
                }
                rdbStore?.update(valueBucket1, predicates).then(async (ret: number) => {
                    expect(1).assertEqual(ret);
                    let resultSet = await rdbStore?.query(predicates);
                    expect(true).assertEqual(resultSet?.goToFirstRow());
                    const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                    expect("xuewang22").assertEqual(name);
                    resultSet?.close();
                }).catch((err: BusinessError) => {
                    console.info("testRdbSyncStageEtsTest0030 update err: "+err.message);
                    expect(null).assertFail();
                })
            }
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0030 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0030 sync failed' + err.code);
                expect().assertFalse();
            })
            await sleep(800);
            done();
            console.info(logTag + "************* testRdbSyncStageEtsTest0030 end *************");
        })
    
    
        /**
        * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_2100
        * @tc.name testRdbSyncStageEtsTest0040
        * @tc.desc Server rdbStore Insert synchronization, and then delete synchronization
        * @tc.size MediumTest
        * @tc.type Function
        * @tc.level Level 2
        */
        it("testRdbSyncStageEtsTest0040", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0040 start");
    
            //push data to remote device
            let u8 = new Uint8Array([1, 2, 3])
            const valueBucket : data_Rdb.ValuesBucket = {
                "name": "xuewang",
                "age": 300,
                "salary": 20.533,
                "blobType": u8
            }
            await rdbStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0040 insert success");

            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0040 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0040 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0040 sync failed' + err.code);
                expect().assertFalse();
            })
			await sleep(800);
            predicates.equalTo("name", "xuewang");
            let number = await rdbStore?.delete(predicates);
            expect(1).assertEqual(number)
            let resultSet = await rdbStore?.query(predicates);
            console.log("testRdbSyncStageEtsTest0040 query resultSet.rowcount: " + resultSet?.rowCount);
            expect(0).assertEqual(resultSet?.rowCount);
			resultSet?.close();
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0040 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0040 sync failed' + err.code);
                expect().assertFalse();
            })
			await sleep(800);
            done();
            console.info(logTag + "************* testRdbSyncStageEtsTest0040 end *************");
        })
    
    
    
        /**
        * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_1100
        * @tc.name testRdbSyncStageEtsTest0050
        * @tc.desc Server rdbStore batchInsert sync
        * @tc.size MediumTest
        * @tc.type Function
        * @tc.level Level 2
        */
        it("testRdbSyncStageEtsTest0050", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0050 start");
    
            //push data to remote device
            let u8 = new Uint8Array([1, 2, 3])
            const valueBucket1: data_Rdb.ValuesBucket = {
                "name": "zhangsan",
                "age": 18,
                "salary": 100.5,
                "blobType": u8
            }
            const valueBucket2: data_Rdb.ValuesBucket = {
                "name": "lisi",
                "age": 23,
                "salary": 200,
                "blobType": u8
            }
            const valueBucket3: data_Rdb.ValuesBucket = {
                "name": "wangwu",
                "age": 20,
                "salary": 100.5,
                "blobType": u8
            }
            const valueBuckets = [valueBucket1, valueBucket2, valueBucket3];
            await rdbStore?.batchInsert("test", valueBuckets).then((number: number) => {
                console.info(logTag + "testRdbSyncStageEtsTest0050 batchInsert");
                expect(3).assertEqual(number);
            }).catch((err: BusinessError) =>{
                console.info(logTag + "testRdbSyncStageEtsTest0050 err: " + err.message);
                expect().assertFalse();
            })

            let predicates = new data_Rdb.RdbPredicates('test');
            let resultSet = await rdbStore?.query(predicates);
            try {
                console.info(logTag + "testRdbSyncStageEtsTest0050 resultSet.rowCount: "+ resultSet?.rowCount);
                expect(3).assertEqual(resultSet?.rowCount);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0050 query error " + e);
                expect().assertFail();
            }
			resultSet?.close();
            predicates.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0050 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0050 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0050 sync failed' + err.code);
                expect().assertFalse();
            })
			await sleep(800);
            done();
            console.info(logTag + "************* testRdbSyncStageEtsTest0050 end *************");
        })
    
    
        /**
        * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_1600
        * @tc.name testRdbSyncStageEtsTest0060
        * @tc.desc Server rdbStore BatchInsert synchronization and then update synchronization
        * @tc.size MediumTest
        * @tc.type Function
        * @tc.level Level 2
        */
        it("testRdbSyncStageEtsTest0060", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0060 start");
            //push data to remote device

            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket1: data_Rdb.ValuesBucket = {
                "name": "lover",
                "age": 18,
                "salary": 100.5,
                "blobType": u8
            }
            const valueBucket2: data_Rdb.ValuesBucket = {
                "name": "lucy",
                "age": 23,
                "salary": 200,
                "blobType": u8
            }
            const valueBucket3: data_Rdb.ValuesBucket = {
                "name": "jiajiahui",
                "age": 88,
                "salary": 20.5,
                "blobType": u8
            }
            const valueBuckets = [valueBucket1, valueBucket2, valueBucket3];
            await rdbStore?.batchInsert("test", valueBuckets).then((number: number) => {
                console.info(logTag + "testRdbSyncStageEtsTest0060 batchInsert number: "+ number);
                expect(3).assertEqual(number);
            }).catch((err: BusinessError) =>{
                console.info(logTag + "testRdbSyncStageEtsTest0060 err: " + err.message);
                expect().assertFalse();
            })

            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates, (err: BusinessError, result: Object[][])=> {
                if (err) {
                    console.log("testRdbSyncStageEtsTest0060 query error " + err);
                    return;
                }
                console.log('testRdbSyncStageEtsTest0060 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0060 device=' + result[i][0] + ' status=' + result[i][1]);
                }
            });
    
            let  u8ArrUpdate = new Uint8Array([1,2,3,4,5]);
            {
                const valueBucketUpdate: data_Rdb.ValuesBucket = {
                    "name": "mingmingUpdate",
                    "age": 10,
                    "salary": 50.366,
                    "blobType": u8ArrUpdate
                }
                let predicatesUpdate = new data_Rdb.RdbPredicates('test');
                predicatesUpdate.equalTo("name", "lucy");
                await rdbStore?.update(valueBucketUpdate, predicatesUpdate).then(async (ret: number) => {
                    expect(1).assertEqual(ret);
                    console.info("testRdbSyncStageEtsTest0030 update done: " + ret);
                }).catch((err: BusinessError) => {
                    console.info("testRdbSyncStageEtsTest0030 update err: "+err.message);
                    expect(null).assertFail();
                })
            }
            let promise = rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0060 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0060 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0060 sync failed' + err.code);
                expect().assertFalse();
            })
			await sleep(800);
            let resultSet = await rdbStore?.query(predicates);
            expect(true).assertEqual(resultSet?.goToRow(1));
            const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
            expect("mingmingUpdate").assertEqual(name);
            resultSet?.close();
            done();
            console.info(logTag + "************* testRdbSyncStageEtsTest0060 end *************");
        })
    
    
    
        /**
        * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_1300
        * @tc.name testRdbSyncStageEtsTest0070
        * @tc.desc Server rdbStore BatchInsert synchronization, and then delete synchronization
        * @tc.size MediumTest
        * @tc.type Function
        * @tc.level Level 2
        */
         it("testRdbSyncStageEtsTest0070", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0070 start");
    
            //push data to remote device
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket1: data_Rdb.ValuesBucket = {
                "name": "catty",
                "age": 18,
                "salary": 100.55,
                "blobType": u8
            }
            const valueBucket2: data_Rdb.ValuesBucket = {
                "name": "lucy",
                "age": 23,
                "salary": 200,
                "blobType": u8
            }
            const valueBucket3: data_Rdb.ValuesBucket = {
                "name": "jiajiahui",
                "age": 88,
                "salary": 20.5,
                "blobType": u8
            }
            const valueBuckets = [valueBucket1, valueBucket2, valueBucket3];
            await rdbStore?.batchInsert("test", valueBuckets).then((number: number) => {
                console.info(logTag + "testRdbSyncStageEtsTest0070 batchInsert number: "+ number);
                expect(3).assertEqual(number);
            }).catch((err: BusinessError) =>{
                console.info(logTag + "testRdbSyncStageEtsTest0070 err: " + err.message);
                expect().assertFalse();
            })
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates, (err: BusinessError, result: Object[][])=> {
                if (err) {
                    console.log("testRdbSyncStageEtsTest0070 query error " + err);
                    expect().assertFail();
                    return;
                }
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0070 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            });
            
            predicates.equalTo("name", "catty");
            await rdbStore?.delete(predicates).then((number: number) => {
                expect(1).assertEqual(number);
            });
			let predicatesSelect = new data_Rdb.RdbPredicates('test');
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0070 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0070 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0070 sync failed' + err.code);
                expect().assertFalse();
            });
			
            let resultSet = await rdbStore?.query(predicatesSelect);
            console.log('testRdbSyncStageEtsTest0070 resultSet=' +resultSet?.rowCount);
            expect(2).assertEqual(resultSet?.rowCount);
			resultSet?.close();
            done();
            console.info(logTag + "************* testRdbSyncStageEtsTest0070 end *************");
        })
    
        /**
        * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_1500
        * @tc.name testRdbSyncStageEtsTest0080
        * @tc.desc Server rdbStore BatchInsert synchronization, and then delete synchronization,and then update synchronization
        * @tc.size MediumTest
        * @tc.type Function
        * @tc.level Level 2
        */
        it("testRdbSyncStageEtsTest0080", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0080 start");
    
            //push data to remote device
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket1: data_Rdb.ValuesBucket = {
                "name": "liqiang",
                "age": 18,
                "salary": 100.55,
                "blobType": u8
            }
            const valueBucket2: data_Rdb.ValuesBucket = {
                "name": "lucy",
                "age": 23,
                "salary": 200,
                "blobType": u8
            }
            const valueBucket3: data_Rdb.ValuesBucket = {
                "name": "update0080",
                "age": 88,
                "salary": 20.5,
                "blobType": u8
            }
            const valueBuckets = [valueBucket1, valueBucket2, valueBucket3];
            await rdbStore?.batchInsert("test", valueBuckets).then((number: number) => {
                console.info(logTag + "testRdbSyncStageEtsTest0080 batchInsert number: "+ number);
                expect(3).assertEqual(number);
            }).catch((err: BusinessError) =>{
                console.info(logTag + "testRdbSyncStageEtsTest0080 err: " + err.message);
                expect().assertFalse();
            })
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates, (err: BusinessError, result: Object[][])=> {
                if (err) {
                    console.log("testRdbSyncStageEtsTest0080 query error " + err);
                    expect().assertFail();
                    return;
                }
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0080 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            });
            
            predicates.equalTo("name", "liqiang");
            await rdbStore?.delete(predicates).then((number: number) => {
                console.log("testRdbSyncStageEtsTest0080 delete number: "+ number);
                expect(1).assertEqual(number);
            });
			let predicatesSelect = new data_Rdb.RdbPredicates('test');
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0080 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0080 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0080 sync failed' + err.code);
                expect().assertFalse();
            });
			await sleep(800);
            let resultSet = await rdbStore?.query(predicatesSelect);
            console.log('testRdbSyncStageEtsTest0080 resultSet=' +resultSet?.rowCount);
            expect(2).assertEqual(resultSet?.rowCount);
    
            let u8Arr1 = new Uint8Array([1,2,3,4,5]);
            const valueBucketUp: data_Rdb.ValuesBucket = {
                "name": "liyaoyao",
                "age": 10,
                "salary": 654,
                "blobType": u8Arr1
            }
            let preUpdate = new data_Rdb.RdbPredicates('test');
            preUpdate.equalTo("name", "update0080");
            await rdbStore?.update(valueBucketUp, preUpdate).then(async (ret: number) => {
                expect(1).assertEqual(ret);
            }).catch((err: BusinessError) => {
                console.info("testRdbSyncStageEtsTest0080 update err: "+err.message);
                expect(null).assertFail();
            })
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0080 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0080 sync failed' + err.code);
                expect().assertFalse();
            })
            await sleep(800);
            done();
            console.info(logTag + "************* testRdbSyncStageEtsTest0080 end *************");
        })
    
    
        /**
        * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_1400
        * @tc.name testRdbSyncStageEtsTest0090
        * @tc.desc Server rdbStore BatchInsert synchronization, and then delete synchronization, and then insert synchronization
        * @tc.size MediumTest
        * @tc.type Function
        * @tc.level Level 2
        */
         it("testRdbSyncStageEtsTest0090", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0090 start");
    
            //push data to remote device
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket1: data_Rdb.ValuesBucket = {
                "name": "mimiy",
                "age": 18,
                "salary": 100.55,
                "blobType": u8
            }
            const valueBucket2: data_Rdb.ValuesBucket = {
                "name": "lucy",
                "age": 23,
                "salary": 200,
                "blobType": u8
            }
            const valueBucket3: data_Rdb.ValuesBucket = {
                "name": "jiajiahui",
                "age": 88,
                "salary": 20.5,
                "blobType": u8
            }
            const valueBuckets = [valueBucket1, valueBucket2, valueBucket3];
            await rdbStore?.batchInsert("test", valueBuckets).then((number: number) => {
                console.info(logTag + "testRdbSyncStageEtsTest0090 batchInsert number: "+ number);
                expect(3).assertEqual(number);
            }).catch((err: BusinessError) =>{
                console.info(logTag + "testRdbSyncStageEtsTest0090 err: " + err.message);
                expect().assertFalse();
            })
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates, (err: BusinessError, result: Object[][])=> {
                if (err) {
                    console.log("testRdbSyncStageEtsTest0090 query error " + err);
                    expect().assertFail();
                    return;
                }
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0090 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            });
            
            predicates.equalTo("name", "mimiy");
            await rdbStore?.delete(predicates).then((number: number) => {
                expect(1).assertEqual(number);
            });
			let predicatesSelect = new data_Rdb.RdbPredicates('test');
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0090 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0090 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0090 sync failed' + err.code);
                expect().assertFalse();
            });
			await sleep(800);
            let resultSet = await rdbStore?.query(predicatesSelect);
            console.log('testRdbSyncStageEtsTest0090 resultSet=' +resultSet?.rowCount);
            expect(2).assertEqual(resultSet?.rowCount);
            resultSet?.close();
            let  u8Arr = new Uint8Array([1,2,3,4,5]);
            try {
                const valueBucket1: data_Rdb.ValuesBucket = {
                    "name": "xuewang09",
                    "age": 10,
                    "salary": 50.466,
                    "blobType": u8Arr
                }
                console.log('testRdbSyncStageEtsTest0090 last insert before');
                await rdbStore?.insert("test", valueBucket1).then(async (ret: number) => {
                    console.log("testRdbSyncStageEtsTest0090 insertLast ret: " + ret);
                }).catch((err: BusinessError) => {
                    console.info("testRdbSyncStageEtsTest0090 insert err: "+err.message);
                    expect(null).assertFail();
                })
            } catch (error) {
                console.info("testRdbSyncStageEtsTest0090 insert err: "+ error);
            }
            let preLast = new data_Rdb.RdbPredicates('test');
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, preLast).then((result: Object[][]) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0090 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0090 sync failed' + err.code);
                expect().assertFalse();
            })
            await sleep(800);
            done();
            console.info(logTag + "************* testRdbSyncStageEtsTest0090 end *************");
        })
    
    
        /**
        * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_1200
        * @tc.name testRdbSyncStageEtsTest0100
        * @tc.desc Server rdbStore BatchInsert synchronization callback
        * @tc.size MediumTest
        * @tc.type Function
        * @tc.level Level 2
        */
        it("testRdbSyncStageEtsTest0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0100 start");
    
            //push data to remote device
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket1: data_Rdb.ValuesBucket = {
                "name": "mimiy",
                "age": 18,
                "salary": 100.55,
                "blobType": u8
            }
            const valueBucket2: data_Rdb.ValuesBucket = {
                "name": "lucy",
                "age": 23,
                "salary": 200,
                "blobType": u8
            }
            const valueBucket3: data_Rdb.ValuesBucket = {
                "name": "jiajiahui",
                "age": 88,
                "salary": 20.5,
                "blobType": u8
            }
            const valueBucket4: data_Rdb.ValuesBucket = {
                "name": "subby",
                "age": 32,
                "salary": 20.5,
                "blobType": u8
            }
            const valueBucket5: data_Rdb.ValuesBucket = {
                "name": "kang",
                "age": 64,
                "salary": 34444,
                "blobType": u8
            }
            const valueBuckets = [valueBucket1, valueBucket2, valueBucket3,valueBucket4,valueBucket5];
            for(let i = 0; i < 20; i++){
                await rdbStore?.batchInsert("test", valueBuckets).then((number: number) => {
                    console.info(logTag + "testRdbSyncStageEtsTest0100 batchInsert number: " + number + ", i = " + i);
                    expect(5).assertEqual(number);
                }).catch((err: BusinessError) =>{
                    console.info(logTag + "testRdbSyncStageEtsTest0100 err: " + err.message);
                    expect().assertFalse();
                })
            }

            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates, (err: BusinessError, result: Object[][])=> {
                if (err) {
                    console.log("testRdbSyncStageEtsTest0100 query error " + err);
                    expect().assertFail();
                    return;
                }
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0100 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
                done();
            });
            console.info(logTag + "************* testRdbSyncStageEtsTest0100 end *************");
        })
    
    
        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_0800
         * @tc.name testRdbSyncStageEtsTest0110
         * @tc.desc Server rdbStore Insert first and synchronize salary Number.MIN_VALUE-1
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
         */
         it("testRdbSyncStageEtsTest0110", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0110 start");
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket : data_Rdb.ValuesBucket = {
                "name": "zhangsan",
                "age": 18,
                "salary": Number.MIN_VALUE-1,
                "blobType": u8
            }
            await rdbStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0010 insert success");
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "zhangsan");
            let resultSet = await rdbStore?.query(predicates);
            try {
                expect(true).assertEqual(resultSet?.goToFirstRow());
                const id = resultSet?.getLong(resultSet?.getColumnIndex("id"));
                const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncStageEtsTest0110 id=" + id + ", name=" + name);
                expect("zhangsan").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0110 insert error " + e);
                expect().assertFail();
            }
            resultSet?.close();
            let syncPre = new data_Rdb.RdbPredicates('test');
            syncPre.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, syncPre).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0110 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0110 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0110 sync failed' + err.code);
                expect().assertFail();
            })
			await sleep(800);
            done();
            console.info(logTag + "************* testRdbSyncStageEtsTest0110 end *************");
        })
    
    
        /**
        * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_1700
        * @tc.name testRdbSyncStageEtsTest0120
        * @tc.desc Server rdbStore BatchInsert synchronization, and then update synchronization，and then update synchronization
        * @tc.size MediumTest
        * @tc.type Function
        * @tc.level Level 2
        */
         it("testRdbSyncStageEtsTest0120", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0120 start");
    
            //push data to remote device
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket1: data_Rdb.ValuesBucket = {
                "name": "mimiy",
                "age": 18,
                "salary": 100.55,
                "blobType": u8
            }
            const valueBucket2: data_Rdb.ValuesBucket = {
                "name": "lucy",
                "age": 23,
                "salary": 200,
                "blobType": u8
            }
            const valueBucket3: data_Rdb.ValuesBucket = {
                "name": "jiajiahui",
                "age": 88,
                "salary": 20.5,
                "blobType": u8
            }
            const valueBuckets = [valueBucket1, valueBucket2, valueBucket3];
            await rdbStore?.batchInsert("test", valueBuckets).then((number: number) => {
                console.info(logTag + "testRdbSyncStageEtsTest0120 batchInsert number: "+ number);
                expect(3).assertEqual(number);
            }).catch((err: BusinessError) =>{
                console.info(logTag + "testRdbSyncStageEtsTest0120 err: " + err.message);
                expect().assertFalse();
            })

            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates, (err: BusinessError, result: Object[][])=> {
                if (err) {
                    console.log("testRdbSyncStageEtsTest0120 query error " + err);
                    expect().assertFail();
                    return;
                }
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0120 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            });
            
            let  u8ArrUp = new Uint8Array([1,2,3,4,5]);
            {
                const valueBucket1: data_Rdb.ValuesBucket = {
                    "name": "xuewang12Up",
                    "age": 10,
                    "salary": 50.366,
                    "blobType": u8ArrUp
                }
                let preUpdate = new data_Rdb.RdbPredicates('test');
                preUpdate.equalTo("name", "mimiy");
                await rdbStore?.update(valueBucket1, preUpdate).then(async (ret: number) => {
                    expect(1).assertEqual(ret);
                    let resultSet = await rdbStore?.query(predicates);
                    expect(true).assertEqual(resultSet?.goToFirstRow());
                    const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                    expect("xuewang12Up").assertEqual(name);
                    resultSet?.close();
                }).catch((err: BusinessError) => {
                    console.info("testRdbSyncStageEtsTest0120 update err: "+err.message);
                    expect(null).assertFail();
                })
            }
			let predicatesSelect = new data_Rdb.RdbPredicates('test');
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0120 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0120 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0120 sync failed' + err.code);
                expect().assertFalse();
            });
		    await sleep(800);
            let resultSet = await rdbStore?.query(predicatesSelect);
            console.log('testRdbSyncStageEtsTest0120 resultSet=' +resultSet?.rowCount);
            expect(3).assertEqual(resultSet?.rowCount);
    
            let  u8Arr = new Uint8Array([1,2,3,4,5]);
            {
                const valueBucket1: data_Rdb.ValuesBucket = {
                    "name": "xuewang12Insert",
                    "age": 50,
                    "salary": 50.4,
                    "blobType": u8Arr
                }
                await rdbStore?.insert("test", valueBucket1).then(async (ret: number) => {
                    let resultSet = await rdbStore?.query(predicates);
                    expect(4).assertEqual(resultSet?.rowCount);
                    resultSet?.close();
                }).catch((err: BusinessError) => {
                    console.info("testRdbSyncStageEtsTest0120 insert err: "+err.message);
                    expect(null).assertFail();
                })
            }
            let preLast = new data_Rdb.RdbPredicates('test');
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, preLast).then((result: Object[][]) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0120 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0120 sync failed' + err.code);
                expect().assertFalse();
            })
			await sleep(800);
            done();
            console.info(logTag + "************* testRdbSyncStageEtsTest0120 end *************");
        })
    
    
        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_0700
         * @tc.name testRdbSyncStageEtsTest0130
         * @tc.desc Server rdbStore Insert first and synchronize salary Number.MAX_VALUE+1
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
        */
        it("testRdbSyncStageEtsTest0130", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0130 start");
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket : data_Rdb.ValuesBucket = {
                "name": "xiaobin0130",
                "age": 18,
                "salary": Number.MAX_VALUE+1,
                "blobType": u8
            }
            await rdbStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0130 insert success");
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "xiaobin0130");
            let resultSet = await rdbStore?.query(predicates);
            try {
                expect(true).assertEqual(resultSet?.goToFirstRow());
                const id = resultSet?.getLong(resultSet?.getColumnIndex("id"));
                const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncStageEtsTest0130 id=" + id + ", name=" + name);
                expect("xiaobin0130").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0130 insert error " + e);
                expect().assertFail();
            }
            resultSet?.close();
            let syncPre = new data_Rdb.RdbPredicates('test');
            syncPre.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, syncPre).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0130 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0130 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0130 sync failed' + err.code);
                expect().assertFail();
            })
			await sleep(800);
            done();
            console.info(logTag + "************* testRdbSyncStageEtsTest0130 end *************");
        })
    
    
        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_2200
         * @tc.name testRdbSyncStageEtsTest0140
         * @tc.desc Server rdbStore Insert first and synchronize,delete all
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
        */
         it("testRdbSyncStageEtsTest0140", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0140 start");
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket : data_Rdb.ValuesBucket = {
                "name": "xiaoLi0140",
                "age": 18,
                "salary": 1230,
                "blobType": u8
            }
            await rdbStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0140 insert success");

            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "xiaoLi0140");
            let resultSet = await rdbStore?.query(predicates);
            try {
                expect(true).assertEqual(resultSet?.goToFirstRow());
                const id = resultSet?.getLong(resultSet?.getColumnIndex("id"));
                const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncStageEtsTest0140 id=" + id + ", name=" + name);
                expect("xiaoLi0140").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0140 insert error " + e);
                expect().assertFail();
            }
            resultSet?.close();
            let syncPre = new data_Rdb.RdbPredicates('test');
            syncPre.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, syncPre).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0140 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0140 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0140 sync failed' + err.code);
                expect().assertFail();
            })
		    await sleep(800);
            let deleletPre = new data_Rdb.RdbPredicates("test");
            console.log('testRdbSyncStageEtsTest0140 delete bdefore ' );
            await rdbStore?.delete(deleletPre);
            console.log('testRdbSyncStageEtsTest0140 delete after ' );
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, syncPre).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0140 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0140 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                    done();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0140 sync failed' + err.code);
                expect().assertFail();
                done();
            })
			await sleep(800);
            console.info(logTag + "************* testRdbSyncStageEtsTest0140 end *************");
        })
    
        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_1900
         * @tc.name testRdbSyncStageEtsTest0160
         * @tc.desc Server rdbStore Insert first and synchronize, Sync the null character of the pre-device id
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
        */
        it("testRdbSyncStageEtsTest0160", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0160 start");
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket : data_Rdb.ValuesBucket = {
                "name": "zhangsan",
                "age": 18,
                "salary": 100.5,
                "blobType": u8
            }
            await rdbStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0160 insert success");
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "zhangsan");
            let resultSet = await rdbStore?.query(predicates);
            try {
                expect(true).assertEqual(resultSet?.goToFirstRow());
                const id = resultSet?.getLong(resultSet?.getColumnIndex("id"));
                const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncStageEtsTest0160 id=" + id + ", name=" + name);
                expect("zhangsan").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0160 insert error " + e);
                expect().assertFail();
            }
            resultSet?.close();
            let syncPre = new data_Rdb.RdbPredicates('emp');
            let devId = [""];
            syncPre.inDevices(devId);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, syncPre).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0160 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0160 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertFail();
                    done();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0160 sync failed' + err.code);
                expect(err != null).assertTrue();
                done();
            })
			await sleep(800);
            console.info(logTag + "************* testRdbSyncStageEtsTest0160 end *************");
        })

        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_2000
         * @tc.name testRdbSyncStageEtsTest0170
         * @tc.desc Server rdbStore Insert first and synchronize, Error in synchronization of pre-tableName
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
         */
         it("testRdbSyncStageEtsTest0170", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0170 start");
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket : data_Rdb.ValuesBucket = {
                "name": "zhangsan",
                "age": 18,
                "salary": 100.5,
                "blobType": u8
            }
            await rdbStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0170 insert success");
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "zhangsan");
            let resultSet = await rdbStore?.query(predicates);
            try {
                expect(true).assertEqual(resultSet?.goToFirstRow());
                const id = resultSet?.getLong(resultSet?.getColumnIndex("id"));
                const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncStageEtsTest0170 id=" + id + ", name=" + name);
                expect("zhangsan").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0170 insert error " + e);
                expect().assertFail();
            }
            resultSet?.close();
            try { 
                let syncPre = new data_Rdb.RdbPredicates('emp');
                syncPre.inDevices(syncDeviceIds);
                rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, syncPre).then((result: Object[][]) => {
                    console.log('testRdbSyncStageEtsTest0170 sync done.');
                    for (let i = 0; i < result?.length; i++) {
                        console.log('testRdbSyncStageEtsTest0170 device=' + result[i][0] + ' status=' + result[i][1]);
                        let status = result[i][1];
                        expect(status == 0).assertFail();
                        done();
                    }
                }).catch((err: BusinessError) => {
                    console.log('testRdbSyncStageEtsTest0170 sync failed' + err.code);
                    expect(err != null).assertTrue();
                    done();
                })
            } catch (error) {
                console.log('testRdbSyncStageEtsTest0170 sync failed error.code message: ' + error);
                expect(error != null).assertTrue();
                done();
            }
			await sleep(800);
            console.info(logTag + "************* testRdbSyncStageEtsTest0170 end *************");
        })
        
        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_0900
         * @tc.name testRdbSyncStageEtsTest0180
         * @tc.desc Server rdbStore Insert first and synchronize, Pass null in synchronous mode
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
        */
        it("testRdbSyncStageEtsTest0180", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0180 start");
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket : data_Rdb.ValuesBucket = {
                "name": "zhangsan",
                "age": 18,
                "salary": 100.5,
                "blobType": u8
            }
            await rdbStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0180 insert success");
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "zhangsan");
            let resultSet = await rdbStore?.query(predicates);
            try {
                expect(true).assertEqual(resultSet?.goToFirstRow());
                const id = resultSet?.getLong(resultSet?.getColumnIndex("id"));
                const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncStageEtsTest0180 id=" + id + ", name=" + name);
                expect("zhangsan").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0180 insert error " + e);
                expect().assertFail();
            }
            resultSet?.close();
            try {
                predicates.inDevices(syncDeviceIds);
                rdbStore!.sync(null, predicates).then((result: Object[][]) => {
                    console.log('testRdbSyncStageEtsTest0180 sync done.');
                    for (let i = 0; i < result?.length; i++) {
                        console.log('testRdbSyncStageEtsTest0180 device=' + result[i][0] + ' status=' + result[i][1]);
                        let status = result[i][1];
                        expect(status == 0).assertFail();
                    }
                    done();
                }).catch((err: BusinessError) => {
                    console.log('testRdbSyncStageEtsTest0180 sync failed' + JSON.stringify(err));
                    expect().assertFail();
                    done();
                })
            } catch (error) {
                console.log('testRdbSyncStageEtsTest0180 sync failed error.code message: ' + error);
				let code = (error as BusinessError).code;
                expect(code == 401).assertTrue();
                done();
            }
			await sleep(300);
            console.info(logTag + "************* testRdbSyncStageEtsTest0180 end *************");
        })

        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_2500
         * @tc.name testRdbSyncStageEtsTest0190
         * @tc.desc Server get rdbStoreS2 level, Name different
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
         */
        it("testRdbSyncStageEtsTest0190", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0190 start");
            const STORE_CONFIGS2: data_Rdb.StoreConfig = {
                name: "RemoteS2Rdb.db",
                securityLevel: data_Rdb.SecurityLevel.S2
            };
            const CREATE_TABLE_TEST_S2 = "CREATE TABLE IF NOT EXISTS test (" + "id INTEGER PRIMARY KEY AUTOINCREMENT, " + "name TEXT NOT NULL, " + "age INTEGER, " + "salary REAL, " + "blobType BLOB)";

            let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext;
            await data_Rdb.getRdbStore(context, STORE_CONFIGS2).then(async (store: data_Rdb.RdbStore) => {
                rdbSecondStore = store;
                console.info("testRdbSyncStageEtsTest0190 create RemoteS2Rdb.db success");
            }).catch((err: BusinessError) => {
                console.error(`testRdbSyncStageEtsTest0190 create RemoteS2Rdb.db failed, code is ${err.code},message is ${err.message}`);
            })
            await rdbSecondStore?.executeSql(CREATE_TABLE_TEST_S2, null);
            console.info(logTag + "create RemoteS2Rdb.db table success");
            //setDistributedTables
            rdbSecondStore?.setDistributedTables(["test"]).then(() => {
                console.info("SetDistributedTables successfully.");
            }).catch((err: BusinessError) => {
                console.info("SetDistributedTables failed, err: " + err.code);
            })
            await sleep(300);
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket: data_Rdb.ValuesBucket = {
                "name": "S2Test",
                "age": 18,
                "salary": 100.5,
                "blobType": u8
            }
            await rdbSecondStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0190 insert success");

            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "S2Test");
            let resultSet = await rdbSecondStore?.query(predicates);
            try {
                expect(true).assertEqual(resultSet?.goToFirstRow());
                const id = resultSet?.getLong(resultSet?.getColumnIndex("id"));
                const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncStageEtsTest0190 id=" + id + ", name=" + name);
                expect("S2Test").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0190 select error " + e);
                expect().assertFail();
            }
            resultSet?.close();
            try {
                predicates.inDevices(syncDeviceIds);
                rdbSecondStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                    console.log('testRdbSyncStageEtsTest0190 sync done.');
                    for (let i = 0; i < result.length; i++) {
                        let status = result[i][1];
                        console.log('testRdbSyncStageEtsTest0190 device=' + result[i][0] + ' status=' + result[i][1]);
                        console.log('testRdbSyncStageEtsTest0190  status=' + status);
                        expect(status == 1).assertTrue();
                        rdbSecondStore = undefined;
                        done();
                    }
                }).catch((err: BusinessError) => {
                    console.log('testRdbSyncStageEtsTest0190 sync failed' + err.code);
                    expect().assertFail();
                    done();
                })
            } catch (error) {
                console.log('testRdbSyncStageEtsTest0190 sync failed error.code message: ' + error);
                expect().assertFail();
                done();
            }
			await sleep(800);
            console.info(logTag + "************* testRdbSyncStageEtsTest0190 end *************");
        })


        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_2400
         * @tc.name testRdbSyncStageEtsTest0200
         * @tc.desc Server get rdbStoreS2 level, Name different
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
         */
        it("testRdbSyncStageEtsTest0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0200 start");
            const STORE_CONFIGS2: data_Rdb.StoreConfig = {
                name: "RemoteRdbStage.db",
                securityLevel: data_Rdb.SecurityLevel.S1
            };
            let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext;
            await data_Rdb.getRdbStore(context, STORE_CONFIGS2).then(async (store: data_Rdb.RdbStore) => {
                rdbSecondStore = store;
                console.info("testRdbSyncStageEtsTest0200 create RemoteRdbStage.db success");
            }).catch((err: BusinessError) => {
                console.error(`ExecuteSql failed, code is ${err.code},message is ${err.message}`);
            })
            await rdbSecondStore?.executeSql(CREATE_TABLE_TEST, null);
            console.info(logTag + "create RemoteRdbStage.db table success");
            //setDistributedTables
            rdbSecondStore?.setDistributedTables(["test"]).then(() => {
                console.info("testRdbSyncStageEtsTest0200 SetDistributedTables successfully.");
            }).catch((err: BusinessError) => {
                console.info("testRdbSyncStageEtsTest0200 SetDistributedTables failed, err: " + err.code);
            })
            await sleep(300);
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket: data_Rdb.ValuesBucket = {
                "name": "S2Test",
                "age": 18,
                "salary": 100.5,
                "blobType": u8
            }
            await rdbSecondStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0200 insert success");

            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "S2Test");
            let resultSet = await rdbSecondStore?.query(predicates);
            try {
                expect(true).assertEqual(resultSet?.goToFirstRow());
                const id = resultSet?.getLong(resultSet?.getColumnIndex("id"));
                const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncStageEtsTest0200 id=" + id + ", name=" + name);
                expect("S2Test").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0200 select error " + e);
                expect().assertFail();
            }
            resultSet?.close();
            try {
                predicates.inDevices(syncDeviceIds);
                rdbSecondStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                    console.log('testRdbSyncStageEtsTest0200 sync done.');
                    console.log('testRdbSyncStageEtsTest0200 device=' + JSON.stringify(result));
                    for (let i = 0; i < result.length; i++) {
                        let status = result[i][1];
                        console.log('testRdbSyncStageEtsTest0200 device=' + result[i][0] + ' status=' + result[i][1]);
                        console.log('testRdbSyncStageEtsTest0200  status=' + status);
                        expect(status == 0).assertTrue();
                        rdbSecondStore = undefined;
                        done();
                    }
                }).catch((err: BusinessError) => {
                    console.log('testRdbSyncStageEtsTest0200 sync failed' + err.code);
                    expect().assertFail();
                    done();
                })
            } catch (error) {
                console.log('testRdbSyncStageEtsTest0200 sync failed error.code message: ' + error);
                expect().assertFail();
                done();
            }
			await sleep(800);
            console.info(logTag + "************* testRdbSyncStageEtsTest0200 end *************");
        })

        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_2600
         * @tc.name testRdbSyncStageEtsTest0210
         * @tc.desc Server rdbStore get rdbStoreS2 level, Name equal
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
         */
        it("testRdbSyncStageEtsTest0210", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0210 start");
            let rdbENStore: data_Rdb.RdbStore | undefined = undefined;
            const STORE_CONFIGS3: data_Rdb.StoreConfig = {
                name: "RemoteRdbStage.db",
                securityLevel: data_Rdb.SecurityLevel.S1
            };
            const CREATE_TABLE_TEST_S3 = "CREATE TABLE IF NOT EXISTS testENSecond (" + "id INTEGER PRIMARY KEY AUTOINCREMENT, " + "name TEXT NOT NULL, " + "age INTEGER, " + "salary REAL, " + "blobType BLOB)";
            let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext;
            rdbENStore = await data_Rdb.getRdbStore(context, STORE_CONFIGS3);
            console.info("testRdbSyncStageEtsTest0210 create RemoteRdbStage.db success");
            await rdbENStore?.executeSql(CREATE_TABLE_TEST_S3, null);
            console.info(logTag + " testRdbSyncStageEtsTest0210 create RemoteRdbStage.db table success");
            try{
                //setDistributedTables
                rdbENStore?.setDistributedTables(["testENSSecond"]).then(() => {
                    console.info("testRdbSyncStageEtsTest0210 SetDistributedTables successfully.");
                    expect().assertFail()
                    done();
                }).catch((err: BusinessError) => {
                    console.info("testRdbSyncStageEtsTest0210 SetDistributedTables failed, err: " + JSON.stringify(err));
                    expect(err.code == 14800000).assertTrue()
                    done();
                })
            }catch(error){
                console.info("testRdbSyncStageEtsTest0210 SetDistributedTables failed, error: " + error);
                expect().assertFail();
                done();
            }
			await sleep(200);
            console.info(logTag + "************* testRdbSyncStageEtsTest0210 end *************");
        })


        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_0100
         * @tc.name testRdbSyncStageEtsTest0220
         * @tc.desc Server get rdbStoreS2 level, Name different
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
         */
        it("testRdbSyncStageEtsTest0220", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0220 start");
            let predicates = new data_Rdb.RdbPredicates('test');
            try {
			    console.info(`testRdbSyncStageEtsTest0220 deviceId:  `+ deviceId);
                rdbStore!.remoteQuery(deviceId, "test", predicates, ["id", "name", "age", "salary", "blobType"]).then(async(resultSet: data_Rdb.ResultSet) => {
                    console.info(`testRdbSyncStageEtsTest0220 ResultSet row count: ${resultSet?.rowCount}`);
                    resultSet?.goToFirstRow();
                    const name = resultSet?.getString(resultSet.getColumnIndex("name"));
                    const age = resultSet?.getLong(resultSet.getColumnIndex("age"));
                    console.info(`testRdbSyncStageEtsTest0220 ResultSet name: ` + JSON.stringify(name));
                    console.info(`testRdbSyncStageEtsTest0220 ResultSet age: ` + JSON.stringify(age));
                    expect(resultSet?.rowCount).assertEqual(1);
                    expect(name).assertEqual("Lisa");
                    expect(age).assertEqual(18);
					resultSet?.close();
                    done();
                }).catch((err: BusinessError) => {
                    console.error(`testRdbSyncStageEtsTest0220 Failed to remoteQuery, err: ` + JSON.stringify(err));
                    expect().assertFail();
                    done();
                })
            } catch (error) {
                console.error(`testRdbSyncStageEtsTest0220 Failed to remoteQuery, error: ` + error);
                expect().assertFail();
                done();
            }
            console.info(logTag + "************* testRdbSyncStageEtsTest0220 end *************");
        })


        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_2700
         * @tc.name testRdbSyncStageEtsTest0230
         * @tc.desc Server get rdbStoreS2 level, Name different
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
         */
        it("testRdbSyncStageEtsTest0230", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0230 start");
            const STORE_CONFIG023: data_Rdb.StoreConfig = {
                name: "RemoteRdbStage.db",
                securityLevel: data_Rdb.SecurityLevel.S2
            };
            let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext;
            rdbSecondStore = await data_Rdb.getRdbStore(context, STORE_CONFIG);
            console.info(`testRdbSyncStageEtsTest0230 S1 Get RdbStore successfully.`);
            try{
                await data_Rdb.getRdbStore(context, STORE_CONFIG023).then(async (rdbStore) => {
                    rdbSecondStore = rdbStore;
                    console.info(`testRdbSyncStageEtsTest0230 Get RdbStore successfully.`);
                    expect(rdbSecondStore != null).assertTrue();
                }).catch((err: BusinessError) => {
                    console.error(`testRdbSyncStageEtsTest0230 Get RdbStore failed, code is ${err.code},message is ${err.message}`);
                    expect().assertFail();
                })
                await data_Rdb.getRdbStore(context, STORE_CONFIG).then(async (rdbStore) => {
                    rdbSecondStore = rdbStore;
                    console.info(`testRdbSyncStageEtsTest0230 S1 Get RdbStore successfully.`);
                    expect().assertFail();
                    done();
                }).catch((err: BusinessError) => {
                    console.error(`testRdbSyncStageEtsTest0230 S1 Get RdbStore failed, code is ${err.code},message is ${err.message}`);
                    expect(err.code).assertEqual(14800017);
                    done();
                })
            }catch(error){
                console.error('testRdbSyncStageEtsTest0230 Get RdbStore failed error' + error);
                expect().assertFail();
                done();
            }
            console.info(logTag + "************* testRdbSyncStageEtsTest0230 end *************");
        })

        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_0500
         * @tc.name testRdbSyncStageEtsTest0240
         * @tc.desc Server rdbStore Insert first and synchronize, intValue = Max
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
         */
        it("testRdbSyncStageEtsTest0240", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0240 start");
            let intMaxValue = Number.MAX_VALUE;
            let u8 = new Uint8Array([1, 2, intMaxValue]);
            const valueBucket: data_Rdb.ValuesBucket = {
                "name": "zhangsan",
                "age": intMaxValue,
                "salary": 100.5,
                "blobType": u8
            }
            await rdbStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0240 insert success");

            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "zhangsan");
            let resultSet = await rdbStore?.query(predicates);
            try {
                expect(true).assertEqual(resultSet?.goToFirstRow());
                const id = resultSet?.getLong(resultSet?.getColumnIndex("id"));
                const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncStageEtsTest0240 id=" + id + ", name=" + name);
                expect("zhangsan").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0240 insert error " + e);
                expect().assertFail();
            }
            resultSet?.close();
            predicates.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0240 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0240 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0240 sync failed' + err.code);
                expect().assertFail();
            })
            await sleep(800);

            done();
            console.info(logTag + "************* testRdbSyncStageEtsTest0240 end *************");
        })


        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_0600
         * @tc.name testRdbSyncStageEtsTest0250
         * @tc.desc Server rdbStore Insert first and synchronize, intValue = Min
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
         */
        it("testRdbSyncStageEtsTest0250", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0250 start");
            let intMinValue = Number.MIN_VALUE;
            let u8 = new Uint8Array([1, 2, intMinValue]);

            const valueBucket: data_Rdb.ValuesBucket = {
                "name": "zhangsan",
                "age": intMinValue,
                "salary": 100.5,
                "blobType": u8
            }
            await rdbStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0250 insert success");

            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "zhangsan");
            let resultSet = await rdbStore?.query(predicates);
            try {
                expect(true).assertEqual(resultSet?.goToFirstRow());
                const id = resultSet?.getLong(resultSet?.getColumnIndex("id"));
                const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncStageEtsTest0250 id=" + id + ", name=" + name);
                expect("zhangsan").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0250 insert error " + e);
                expect().assertFail();
            }
            resultSet?.close();
            predicates.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0250 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0250 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0250 sync failed' + err.code);
                expect().assertFail();
            })
            await sleep(800);
            done();
            console.info(logTag + "************* testRdbSyncStageEtsTest0250 end *************");
        })


        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_0200
         * @tc.name testRdbSyncStageEtsTest0260
         * @tc.desc Server rdbStore Insert first and synchronize, intValue = NaN
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
         */
        it("testRdbSyncStageEtsTest0260", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0260 start");
            let intNanValue = Number.NaN;
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket: data_Rdb.ValuesBucket = {
                "name": "zhangsan",
                "age": intNanValue,
                "salary": 100.5,
                "blobType": u8
            }
            await rdbStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0260 insert success");

            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "zhangsan");
            let resultSet = await rdbStore?.query(predicates);
            try {
                expect(true).assertEqual(resultSet?.goToFirstRow());
                const id = resultSet?.getLong(resultSet?.getColumnIndex("id"));
                const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncStageEtsTest0260 id=" + id + ", name=" + name);
                expect("zhangsan").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0260 insert error " + e);
                expect().assertFail();
            }
            resultSet?.close();
            predicates.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0260 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0260 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0260 sync failed' + err.code);
                expect().assertFail();
            })
            await sleep(800);
            done();
            console.info(logTag + "************* testRdbSyncStageEtsTest0260 end *************");
        })


        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_0400
         * @tc.name testRdbSyncStageEtsTest0270
         * @tc.desc Server rdbStore Insert first and synchronize, intValue = POSITIVE_INFINITY
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
         */
        it("testRdbSyncStageEtsTest0270", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0270 start");
            let intValue = Number.POSITIVE_INFINITY;
            let u8 = new Uint8Array([1, 2, 3]);
            const valueBucket: data_Rdb.ValuesBucket = {
                "name": "testRdbSyncStageEtsTest0270",
                "age": intValue,
                "salary": 100.5,
                "blobType": u8
            }
            await rdbStore?.insert("test", valueBucket);
            console.info("testRdbSyncStageEtsTest0270 insert success");

            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "testRdbSyncStageEtsTest0270");
            let resultSet = await rdbStore?.query(predicates);
            try {
                expect(true).assertEqual(resultSet?.goToFirstRow());
                const id = resultSet?.getLong(resultSet?.getColumnIndex("id"));
                const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncStageEtsTest0270 id=" + id + ", name=" + name);
                expect("testRdbSyncStageEtsTest0270").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0270 insert error " + e);
                expect().assertFail();
            }
            resultSet?.close();
            predicates.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0270 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0270 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0270 sync failed' + err.code);
                expect().assertFail();
            })
            await sleep(800);
            done();
            console.info(logTag + "************* testRdbSyncStageEtsTest0270 end *************");
        })


        /**
         * @tc.number SUB_DistributedData_RelastionStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_0300
         * @tc.name testRdbSyncStageEtsTest0280
         * @tc.desc Server rdbStore Insert first and synchronize, intValue = NEGATIVE_INFINITY
         * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 2
         */
        it("testRdbSyncStageEtsTest0280", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL2, async (done:Function) => {
            console.info(logTag + "testRdbSyncStageEtsTest0280 start");
            let intValue = Number.NEGATIVE_INFINITY;
            let u8 = new Uint8Array([1, 2, 3]);
            {
                const valueBucket: data_Rdb.ValuesBucket = {
                    "name": "testRdbSyncStageEtsTest0280",
                    "age": intValue,
                    "salary": 100.5,
                    "blobType": u8
                }
                await rdbStore?.insert("test", valueBucket);
                console.info("testRdbSyncStageEtsTest0280 insert success");
            }

            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "testRdbSyncStageEtsTest0280");
            let resultSet = await rdbStore?.query(predicates);
            try {
                expect(true).assertEqual(resultSet?.goToFirstRow());
                const id = resultSet?.getLong(resultSet?.getColumnIndex("id"));
                const name = resultSet?.getString(resultSet?.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncStageEtsTest0280 id=" + id + ", name=" + name);
                expect("testRdbSyncStageEtsTest0280").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncStageEtsTest0280 insert error " + e);
                expect().assertFail();
            }
            resultSet?.close();
            predicates.inDevices(syncDeviceIds);
            rdbStore?.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates).then((result: Object[][]) => {
                console.log('testRdbSyncStageEtsTest0280 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncStageEtsTest0280 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err: BusinessError) => {
                console.log('testRdbSyncStageEtsTest0280 sync failed' + err.code);
                expect().assertFail();
            })
            await sleep(800);
            done();
            console.info(logTag + "************* testRdbSyncStageEtsTest0280 end *************");
        })
    })
}
