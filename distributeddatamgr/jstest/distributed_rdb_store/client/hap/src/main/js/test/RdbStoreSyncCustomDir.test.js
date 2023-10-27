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
import { UiDriver, BY } from '@ohos.UiTest'
import data_Rdb from '@ohos.data.relationalStore';
import featureAbility from '@ohos.ability.featureAbility';

var context = featureAbility.getContext();
const CREATE_TABLE_TEST = "CREATE TABLE IF NOT EXISTS test (" + "id INTEGER PRIMARY KEY AUTOINCREMENT, " + "name TEXT NOT NULL, " + "age INTEGER, " + "salary REAL, " + "blobType BLOB)";
const CREATE_TABLE_NAME = "CREATE TABLE IF NOT EXISTS test" 
const STORE_CONFIG = {
    name: "RemoteRdb.db",
    securityLevel: data_Rdb.SecurityLevel.S1,
    customDir:"/data/app/el2/100/database/bundleName/rdb"
}

var rdbStore = undefined;
var resultSet = undefined;
let dmInstance = null;
let localDeviceId = undefined;
let logTag = 'RpcClient:  ';
let testservice = null;
let gIRemoteObject = null;
let remoteHelpers = null;
let deviceId = null;
let syncDeviceIds = undefined;
let deviceList = undefined;
const TEST_BUNDLE_NAME = 'com.ohos.distributerdbdisjs';


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getPermission() {
    console.info(`getPermission is start`);
    let permissions = ['ohos.permission.DISTRIBUTED_DATASYNC'];
    let context = featureAbility.getContext()
    context.requestPermissionsFromUser(permissions, 666, (data) => {
        console.info("request success" + JSON.stringify(data));

    })
}

async function driveFn() {
    try {
        let driver = await UiDriver.create()
        console.info(` come in driveFn`)
        console.info(`driver is ${JSON.stringify(driver)}`)
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

export default function rdbSyncFirstLevelTest(){
    describe('rdbSyncFirstLevelTest', function () {
        beforeAll(async function (done) {
            console.info(logTag + '-----------------beforeAll begin-----------------');
            await getPermission();
            sleep(5000);
            await driveFn();
            sleep(100);

            testservice = new TestService();
            console.info(logTag + "deviceId: " + deviceId);
            await testservice.toConnectRdbAbility().then(data => {
                gIRemoteObject = data;
                console.info(logTag + "toConnectAbility data is" + data);
                remoteHelpers = new RemoteHelper(testservice,gIRemoteObject);
            })
            rdbStore = await data_Rdb.getRdbStore(context, STORE_CONFIG);
            console.info(logTag + "create RemoteRdb.db success");
            await rdbStore.executeSql(CREATE_TABLE_TEST, null);
            console.info(logTag + "create  remote RemoteRdb.db success");
            //setDistributedTables
            let back = rdbStore.setDistributedTables(["test"]);
            back.then(() => {
                console.info("SetDistributedTables successfully.");
            }).catch((err) => {
                console.info("SetDistributedTables failed, err: " + err.code);
            })
            await back;
    
            await deviceManager.createDeviceManager(TEST_BUNDLE_NAME,async (error, deviceManager) =>{
                console.info(logTag + "CLIENT Create device manager success");
                localDeviceId = deviceManager.getLocalDeviceInfoSync().deviceId;
                console.info(logTag + "local device id is: " + localDeviceId);
                deviceList = deviceManager.getTrustedDeviceListSync();
                deviceId = deviceList[0].networkId;
                syncDeviceIds = [deviceId];
                dmInstance = deviceManager;
                dmInstance.on("deviceStateChange", (data) => {
                    console.log("deviceStateChange: " + JSON.stringify(data));
                });
            })
    
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
            await data_Rdb.deleteRdbStore(context, "RemoteRdb.db").then(() => {
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
         * @tc.number SUB_DistributedData_RelationalStore_CrossDevice_SDK_RemoteQueryJsAPITest_2800
         * @tc.name testRdbSyncCustomTest0300
         * @tc.desc Server rdbStore Insert first and synchronize
         */
         it("testRdbSyncCustomTest0300", 0, async function (done) {
            console.info(logTag + "testRdbSyncCustomTest0300 start");
            var u8 = new Uint8Array([1, 2, 3]);
            {
                const valueBucket = {
                    "name": "lisi",
                    "age": 20,
                    "salary": 80.5,
                    "blobType": u8
                }
                await rdbStore.insert("test", valueBucket);
                console.info("testRdbSyncCustomTest0300 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "lisi");
            let resultSet = await rdbStore.query(predicates);
            try {
                expect(true).assertEqual(resultSet.goToFirstRow());
                const id = resultSet.getLong(resultSet.getColumnIndex("id"));
                const name = resultSet.getString(resultSet.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncCustomTest0300 id=" + id + ", name=" + name);
                expect(1).assertEqual(id);
                expect("lisi").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncCustomTest0300 insert error " + e);
                expect().assertFail();
            }
            resultSet = null;
            predicates.inDevices(syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promise.then((result) => {
                console.log('testRdbSyncCustomTest0300 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomTest0300 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomTest0300 sync failed' + err.code);
                expect().assertFail();
            })
            await promise;
            
            done();
            console.info(logTag + "************* testRdbSyncCustomTest0300 end *************");
        })
    
         /**
         * @tc.number SUB_DistributedData_RelationalStore_CrossDevice_SDK_RemoteQueryJsAPITest_2900
         * @tc.name testRdbSyncTest0310
         * @tc.desc Server rdbStore Insert twice and synchronize twice
         */
        it("testRdbSyncCustomTest0310", 0, async function (done) {
            console.info(logTag + "testRdbSyncCustomTest0310 start");
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
                console.info("testRdbSyncCustomTest0310 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            
            predicates.inDevices(syncDeviceIds);
            console.info(logTag + "testRdbSyncCustomTest0310 sync before" + syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promise.then((result) => {
                console.log('testRdbSyncCustomTest0310 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomTest0310 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomTest0310 sync failed' + err.code);
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
                console.info("testRdbSyncCustomTest0310 insert success");
            }
            //query
            let resultSet = await rdbStore.query(predicates);
            try {
                console.info(logTag + "testRdbSyncCustomTest0310 resultSet.rowCount: "+ resultSet.rowCount);
                expect(2).assertEqual(resultSet.rowCount);
            } catch (e) {
                console.info("testRdbSyncCustomTest0310 query error " + e);
                expect().assertFail();
            }
            resultSet = null;
            let promiseTwo = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promiseTwo.then((result) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomTest0310 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomTest0310 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
    
            done();
            console.info(logTag + "************* testRdbSyncCustomTest0310 end *************");
        })
    
        /**
        * @tc.number SUB_DistributedData_RelationalStore_CrossDevice_SDK_RemoteQueryJsAPITest_3000
        * @tc.name testRdbSyncTest0030
        * @tc.desc Server rdbStore Insert synchronization and then update synchronization
        */
        it("testRdbSyncCustomTest0320", 0, async function (done) {
            console.info(logTag + "testRdbSyncCustomTest0320 start");
    
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
                console.info("testRdbSyncCustomTest0320 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates)
            promise.then((result) => {
                console.log('testRdbSyncCustomTest0320 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomTest0320 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomTest0320 sync failed' + err.code);
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
                    console.info("testRdbSyncCustomTest0320 update err: "+err.message);
                    expect(null).assertFail();
                })
            }
            let promiseTwo = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promiseTwo.then((result) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomTest0320 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomTest0320 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
    
            done();
            console.info(logTag + "************* testRdbSyncCustomTest0320 end *************");
        })
    
    
        /**
        * @tc.number SUB_DistributedData_RelationalStore_CrossDevice_SDK_RemoteQueryJsAPITest_3100
        * @tc.name testRdbSyncCustomTest0330
        * @tc.desc Server rdbStore Insert synchronization, and then delete synchronization
        */
        it("testRdbSyncCustomTest0330", 0, async function (done) {
            console.info(logTag + "testRdbSyncCustomTest0330 start");
    
            //push data to remote device
            var u8 = new Uint8Array([1, 2, 3])
            {
                const valueBucket = {
                    "name": "xuewang",
                    "age": 300,
                    "salary": 20.533,
                    "blobType": u8
                }
                await rdbStore.insert("test", valueBucket);
                console.info("testRdbSyncCustomTest0330 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promise.then((result) => {
                console.log('testRdbSyncCustomTest0330 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomTest0330 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomTest0330 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
            predicates.equalTo("name", "xuewang");
            await rdbStore.delete(predicates).then((number) => {
                expect(1).assertEqual(number)
            }).then(async () => {
                resultSet = await rdbStore.query(predicates).catch((err) =>{
                    console.log("testRdbSyncCustomTest0330 query failed err: " + err);
                    expect().assertFalse();
                })
            })
            let promiseTwo = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promiseTwo.then((result) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomTest0330 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomTest0330 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
            done();
            console.info(logTag + "************* testRdbSyncCustomTest0330 end *************");
        })
    
    
    
        /**
        * @tc.number SUB_DistributedData_RelationalStore_CrossDevice_SDK_RemoteQueryJsAPITest_3200
        * @tc.name testRdbSyncCustomTest0340
        * @tc.desc Server rdbStore batchInsert sync
        */
        it("testRdbSyncCustomTest0340", 0, async function (done) {
            console.info(logTag + "testRdbSyncCustomTest0340 start");
    
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
                    console.info(logTag + "testRdbSyncCustomTest0340 batchInsert");
                    expect(3).assertEqual(number);
                }).catch((err) =>{
                    console.info(logTag + "testRdbSyncCustomTest0340 err: " + err.message);
                    expect().assertFalse();
                })
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            let resultSet = await rdbStore.query(predicates);
            try {
                console.info(logTag + "testRdbSyncCustomTest0340 resultSet.rowCount: "+ resultSet.rowCount);
                expect(3).assertEqual(resultSet.rowCount);
            } catch (e) {
                console.info("testRdbSyncCustomTest0340 query error " + e);
                expect().assertFail();
            }
            predicates.inDevices(syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promise.then((result) => {
                console.log('testRdbSyncCustomTest0340 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncCustomTest0340 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncCustomTest0340 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
            done();
            console.info(logTag + "************* testRdbSyncCustomTest0340 end *************");
        })
    })
}