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

import {describe, beforeAll, beforeEach, afterEach, afterAll, it, expect} from '@ohos/hypium';
import deviceManager from '@ohos.distributedDeviceManager';
import TestService from '../../../../../../../../../testtools/disjsTest/client/testService.js';
import RemoteHelper from '../../../../../../../../../testtools/disjsTest/client/remoteHelper.js';
import factory from '@ohos.data.distributedData';
import { UiDriver, BY } from '@ohos.UiTest'
import data_Rdb from '@ohos.data.relationalStore';
import UIAbility from '@ohos.app.ability.UIAbility';
import { BusinessError } from "@ohos.base";
import common from '@ohos.app.ability.common';
import abilityAccessCtrl, { Context, PermissionRequestResult } from '@ohos.abilityAccessCtrl';

const CREATE_TABLE_TEST = "CREATE TABLE IF NOT EXISTS test (" + "id INTEGER PRIMARY KEY AUTOINCREMENT, " + "name TEXT NOT NULL, " + "age INTEGER, " + "salary REAL, " + "blobType BLOB)";
const CREATE_TABLE_NAME = "CREATE TABLE IF NOT EXISTS test" 
const STORE_CONFIG = {
    name: "RemoteRdbStage.db",
    securityLevel: data_Rdb.SecurityLevel.S1,
    customDir:"data/app/el2/100/database/bundleName/rdb"
}

var rdbStore = undefined;
var resultSet = undefined;
let dmInstance = null;
let localDeviceId = undefined;
let logTag = 'CustomClient:  ';
let testservice = null;
let gIRemoteObject = null;
let remoteHelpers = null;
let deviceId = null;
let syncDeviceIds = undefined;
let deviceList = undefined;
let connection: number;
const TEST_BUNDLE_NAME = 'com.acts.distributerdbdisets';
let atManager = abilityAccessCtrl.createAtManager();

export default function rdbSyncCustomDirlTest(){
    describe('rdbSyncCustomDirlTest', function () {
        
        async function getDeviceId() {
            console.log('getDeviceId is begin')
            try {
                dmInstance = deviceManager.createDeviceManager('com.acts.example.dmsfwkstageserver');
                console.log('get deviceManager is success')
            } catch (error) {
                console.log('get deviceManager is failed' + JSON.stringify(error))
            }
            localDeviceId = dmInstance.getLocalDeviceNetworkId();
            console.info("local device id is: " + localDeviceId);
            let deviceList : Array<deviceManager.DeviceBasicInfo> = dmInstance.getAvailableDeviceListSync();
            deviceList= deviceList;
            let deviceId : string= deviceList[0].networkId;
            deviceId = deviceId;
            console.info("deviceid is: " + deviceId);
            console.info("deviceList is: " + JSON.stringify(deviceList));
        }
    
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    
        let getPermission = async () =>{
            console.info('getPermission is start');
            let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext;
            atManager.requestPermissionsFromUser(context, ['ohos.permission.DISTRIBUTED_DATASYNC'], (err: BusinessError, data: PermissionRequestResult) => {
              console.info("request success" + JSON.stringify(data));
              console.info("request success" + JSON.stringify(err));
            })
          }
    
        async function driveFn() {
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
        beforeAll(async function (done) {
            console.info(logTag + '-----------------beforeAll begin-----------------');
            await getPermission();
            sleep(5000);
            await driveFn();
            sleep(100);

            let dmInstance = deviceManager.createDeviceManager(TEST_BUNDLE_NAME);
            deviceList = dmInstance.getAvailableDeviceListSync();
            deviceId = deviceList[0].networkId;                                                                                                                                                                  
            console.info(logTag + "deviceId is: " + deviceId);
            syncDeviceIds = [deviceId];

            let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext;
            let want = {
                deviceId: deviceId,
                bundleName: "com.acts.distributerdbdisets",
                abilityName: "com.acts.distributerdbdisets.ServiceAbility"
            };
            let connect = {
                onConnect: function (elementName, remoteProxy) {
                    console.log(logTag + 'onConnect called, remoteProxy: ' + remoteProxy);
                },
                onDisconnect: function (elementName) {
                    console.log(logTag + "onDisconnect...");
                },
                onFailed: function () {
                    console.log(logTag + "onFailed...");
                }
            }
            try {
              connection = context.connectServiceExtensionAbility(want, connect);
              console.info(logTag + "connect ability got id: " + connection);
            } catch (err) {
              console.info(logTag + "connect ability got id: " + connection);
              let code = (err as BusinessError).code;
              let message = (err as BusinessError).message;
              console.error(logTag + `connectServiceExtensionAbility failed, code is ${code}, message is ${message}`);
            };
            sleep(100);
            rdbStore = await data_Rdb.getRdbStore(context, STORE_CONFIG);
            console.info(logTag + "create RemoteRdbStage.db success");
            await rdbStore.executeSql(CREATE_TABLE_TEST, null);
            console.info(logTag + "create  remote RemoteRdbStage.db success");
            //setDistributedTables
            let back = rdbStore.setDistributedTables(["test"]);
            back.then(() => {
                console.info("SetDistributedTables successfully.");
            }).catch((err) => {
                console.info("SetDistributedTables failed, err: " + err.code);
            })
            await back;
    

            dmInstance.on("deviceStateChange", (data) => {
                console.log("deviceStateChange: " + JSON.stringify(data));
            });

            function storeObserver(devices) {
                for (let i = 0; i < devices.length; i++) {
                    console.log('device=' + devices[i] + ' data changed');
                }
            }
            try {
                rdbStore.on('dataChange', data_Rdb.SubscribeType.SUBSCRIBE_TYPE_REMOTE, storeObserver);
            } catch (err) {
                console.log('Register observer failed'); 
            }
            console.info(logTag + '-----------------beforeAll end-----------------');
            done();
        })

        beforeEach(async function(done){
            console.info(logTag + "-----------------beforeEach 0 -----------------");
            done();
        })

        afterEach(async function (done) {
            console.info(logTag + '-----------------afterEach begin-----------------');
            try {
                let deleletPre = new data_Rdb.RdbPredicates("test");
                await rdbStore.delete(deleletPre);
                console.info(logTag + "REMOTE afterEach delete rdbStore success");
            } catch (error) {
                console.info(logTag + "REMOTE afterEach delete rdbStore error: " + error.message);
            }
            console.info(logTag + '-----------------afterEach end-----------------');
            done();
        })

        afterAll(async function (done){
            console.info(logTag + '-----------------afterAll begin-----------------');
            rdbStore = null;
            let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext;
            await data_Rdb.deleteRdbStore(context, "RemoteRdbStage.db").then(() => {
                console.info(logTag + "delete RemoteRdb success");
            });
            await data_Rdb.deleteRdbStore(context, "RemoteS2Rdb.db").then(() => {
                console.info(logTag + "delete RemoteS2Rdb success");
            });
            await sleep(50);
            console.info(logTag + '-----------------afterAll end-----------------');
            done();
        })
    
        /**
         * @tc.number SUB_DistributedData_RelationalStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_2800
         * @tc.name testRdbSyncCustomStageEtsTest0100
         * @tc.desc Server rdbStore Insert first and synchronize
		 * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 3
         */
         it("testRdbSyncCustomStageEtsTest0100", 0, async function (done) {
            console.info(logTag + "testRdbSyncCustomStageEtsTest0100 start");
            var u8 = new Uint8Array([1, 2, 3]);
            {
                const valueBucket = {
                    "name": "lisi",
                    "age": 20,
                    "salary": 80.5,
                    "blobType": u8
                }
                await rdbStore.insert("test", valueBucket);
                console.info("testRdbSyncCustomStageEtsTest0100 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "lisi");
            let resultSet = await rdbStore.query(predicates);
            try {
                expect(true).assertEqual(resultSet.goToFirstRow());
                const id = resultSet.getLong(resultSet.getColumnIndex("id"));
                const name = resultSet.getString(resultSet.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncCustomStageEtsTest0100 id=" + id + ", name=" + name);
                expect(1).assertEqual(id);
                expect("lisi").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncCustomStageEtsTest0100 insert error " + e);
                expect().assertFail();
            }
            resultSet = null;
            predicates.inDevices(syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promise.then((result) => {
                console.log('testRdbSyncCustomStageEtsTest0100 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomStageEtsTest0100 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomStageEtsTest0100 sync failed' + err.code);
                expect().assertFail();
            })
            await promise;
            
            done();
            console.info(logTag + "************* testRdbSyncCustomStageEtsTest0100 end *************");
        })
    
         /**
         * @tc.number SUB_DistributedData_RelationalStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_2900
         * @tc.name testRdbSyncCustomStageEtsTest0200
         * @tc.desc Server rdbStore Insert twice and synchronize twice
		 * @tc.size MediumTest
         * @tc.type Function
         * @tc.level Level 3
         */
        it("testRdbSyncCustomStageEtsTest0200", 0, async function (done) {
            console.info(logTag + "testRdbSyncCustomStageEtsTest0200 start");
            //push data to remote device
            var u8 = new Uint8Array([1, 2, 3]);
            {
                const valueBucket = {
                    "name": "wangmazi",
                    "age": 200,
                    "salary": 100.533,
                    "blobType": u8
                }
                await rdbStore.insert("test", valueBucket);
                console.info("testRdbSyncCustomStageEtsTest0200 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            
            predicates.inDevices(syncDeviceIds);
            console.info(logTag + "testRdbSyncCustomStageEtsTest0200 sync before" + syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promise.then((result) => {
                console.log('testRdbSyncCustomStageEtsTest0200 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomStageEtsTest0200 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomStageEtsTest0200 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
    
            let  u8Arr = new Uint8Array([1,2,3,4,5]);
            {
                const valueBucket1 = {
                    "name": "wangmazi22",
                    "age": 50,
                    "salary": 50.366,
                    "blobType": u8Arr
                }
                await rdbStore.insert("test", valueBucket1);
                console.info("testRdbSyncCustomStageEtsTest0200 insert success");
            }
            //query
            let resultSet = await rdbStore.query(predicates);
            try {
                console.info(logTag + "testRdbSyncCustomStageEtsTest0200 resultSet.rowCount: "+ resultSet.rowCount);
                expect(2).assertEqual(resultSet.rowCount);
            } catch (e) {
                console.info("testRdbSyncCustomStageEtsTest0200 query error " + e);
                expect().assertFail();
            }
            resultSet = null;
            let promiseTwo = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promiseTwo.then((result) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomStageEtsTest0200 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomStageEtsTest0200 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
    
            done();
            console.info(logTag + "************* testRdbSyncCustomStageEtsTest0200 end *************");
        })
    
        /**
        * @tc.number SUB_DistributedData_RelationalStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_3000
        * @tc.name testRdbSyncCustomStageEtsTest0300
        * @tc.desc Server rdbStore Insert synchronization and then update synchronization
		* @tc.size MediumTest
        * @tc.type Function
        * @tc.level Level 3
        */
        it("testRdbSyncCustomStageEtsTest0300", 0, async function (done) {
            console.info(logTag + "testRdbSyncCustomStageEtsTest0300 start");
    
            //push data to remote device
            var u8 = new Uint8Array([1, 2, 3]);
            {
                const valueBucket = {
                    "name": "zhangmazi",
                    "age": 300,
                    "salary": 80.533,
                    "blobType": u8
                }
                await rdbStore.insert("test", valueBucket);
                console.info("testRdbSyncCustomStageEtsTest0300 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates)
            promise.then((result) => {
                console.log('testRdbSyncCustomStageEtsTest0300 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomStageEtsTest0300 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomStageEtsTest0300 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
    
            let  u8Arr = new Uint8Array([1,2,3,4,5]);
            {
                const valueBucket1 = {
                    "name": "zhangmazi22",
                    "age": 50,
                    "salary": 50.366,
                    "blobType": u8Arr
                }
                let updatePromise = rdbStore.update(valueBucket1, predicates);
                await updatePromise.then(async (ret) => {
                    expect(1).assertEqual(ret);
                    let resultSet = await rdbStore.query(predicates);
                    expect(true).assertEqual(resultSet.goToFirstRow());
                    const name = await resultSet.getString(resultSet.getColumnIndex("name"));
                    expect("zhangmazi22").assertEqual(name);
                    resultSet = null;
                }).catch((err) => {
                    console.info("testRdbSyncCustomStageEtsTest0300 update err: "+err.message);
                    expect(null).assertFail();
                })
            }
            let promiseTwo = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promiseTwo.then((result) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomStageEtsTest0300 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomStageEtsTest0300 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
    
            done();
            console.info(logTag + "************* testRdbSyncCustomStageEtsTest0300 end *************");
        })
    
    
        /**
        * @tc.number SUB_DistributedData_RelationalStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_3100
        * @tc.name testRdbSyncCustomStageEtsTest0400
        * @tc.desc Server rdbStore Insert synchronization, and then delete synchronization
		* @tc.size MediumTest
        * @tc.type Function
        * @tc.level Level 3
        */
        it("testRdbSyncCustomStageEtsTest0400", 0, async function (done) {
            console.info(logTag + "testRdbSyncCustomStageEtsTest0400 start");
    
            //push data to remote device
            var u8 = new Uint8Array([1, 2, 3]);
            {
                const valueBucket = {
                    "name": "xuewang",
                    "age": 300,
                    "salary": 20.533,
                    "blobType": u8
                }
                await rdbStore.insert("test", valueBucket);
                console.info("testRdbSyncCustomStageEtsTest0400 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promise.then((result) => {
                console.log('testRdbSyncCustomStageEtsTest0400 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomStageEtsTest0400 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomStageEtsTest0400 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
            predicates.equalTo("name", "xuewang");
            await rdbStore.delete(predicates).then((number) => {
                expect(1).assertEqual(number)
            }).then(async () => {
                resultSet = await rdbStore.query(predicates).catch((err) =>{
                    console.log("testRdbSyncCustomStageEtsTest0400 query failed err: " + err);
                    expect().assertFalse();
                })
            })
            let promiseTwo = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promiseTwo.then((result) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomStageEtsTest0400 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomStageEtsTest0400 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
            done();
            console.info(logTag + "************* testRdbSyncCustomStageEtsTest0400 end *************");
        })
    
    
    
        /**
        * @tc.number SUB_DistributedData_RelationalStore_CrossDevice_SDK_RemoteQueryJsAPIStageTest_3200
        * @tc.name testRdbSyncCustomStageEtsTest0500
        * @tc.desc Server rdbStore batchInsert sync
		* @tc.size MediumTest
        * @tc.type Function
        * @tc.level Level 3
        */
        it("testRdbSyncCustomStageEtsTest0500", 0, async function (done) {
            console.info(logTag + "testRdbSyncCustomStageEtsTest0500 start");
    
            //push data to remote device
            {
                var u8 = new Uint8Array([1, 2, 3])
                const valueBucket1 = {
                    "name": "zhangsan",
                    "age": 18,
                    "salary": 100.5,
                    "blobType": u8
                }
                const valueBucket2 = {
                    "name": "lisi",
                    "age": 23,
                    "salary": 200,
                    "blobType": u8
                }
                const valueBucket3 = {
                    "name": "wangwu",
                    "age": 20,
                    "salary": 100.5,
                    "blobType": u8
                }
                const valueBuckets = [valueBucket1, valueBucket2, valueBucket3];
                await rdbStore.batchInsert("test", valueBuckets).then((number) => {
                    console.info(logTag + "testRdbSyncCustomStageEtsTest0500 batchInsert");
                    expect(3).assertEqual(number);
                }).catch((err) =>{
                    console.info(logTag + "testRdbSyncCustomStageEtsTest0500 err: " + err.message);
                    expect().assertFalse();
                })
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            let resultSet = await rdbStore.query(predicates);
            try {
                console.info(logTag + "testRdbSyncCustomStageEtsTest0500 resultSet.rowCount: "+ resultSet.rowCount);
                expect(3).assertEqual(resultSet.rowCount);
            } catch (e) {
                console.info("testRdbSyncCustomStageEtsTest0500 query error " + e);
                expect().assertFail();
            }
            predicates.inDevices(syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promise.then((result) => {
                console.log('testRdbSyncCustomStageEtsTest0500 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomStageEtsTest0500 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomStageEtsTest0500 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
            done();
            console.info(logTag + "************* testRdbSyncCustomStageEtsTest0500 end *************");
        })
    })
}