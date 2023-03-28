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
    securityLevel: data_Rdb.SecurityLevel.S1
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
                deviceId = deviceList[0].deviceId;
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
         * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_0100
         * @tc.name testRdbSyncTest0010
         * @tc.desc Server rdbStore Insert first and synchronize
         */
         it("testRdbSyncTest0010", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0010 start");
            var u8 = new Uint8Array([1, 2, 3]);
            {
                const valueBucket = {
                    "name": "zhangsan",
                    "age": 18,
                    "salary": 100.5,
                    "blobType": u8
                }
                await rdbStore.insert("test", valueBucket);
                console.info("testRdbSyncTest0010 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "zhangsan");
            let resultSet = await rdbStore.query(predicates);
            try {
                expect(true).assertEqual(resultSet.goToFirstRow());
                const id = resultSet.getLong(resultSet.getColumnIndex("id"));
                const name = resultSet.getString(resultSet.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncTest0010 id=" + id + ", name=" + name);
                expect(1).assertEqual(id);
                expect("zhangsan").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncTest0010 insert error " + e);
                expect().assertFail();
            }
            resultSet = null;
            predicates.inDevices(syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promise.then((result) => {
                console.log('testRdbSyncTest0010 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0010 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0010 sync failed' + err.code);
                expect().assertFail();
            })
            await promise;
            
            done();
            console.info(logTag + "************* testRdbStoreInsert0001 end *************");
        })
    
         /**
         * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_0200
         * @tc.name testRdbSyncTest0020
         * @tc.desc Server rdbStore Insert twice and synchronize twice
         */
        it("testRdbSyncTest0020", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0020 start");
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
                console.info("testRdbSyncTest0020 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            
            predicates.inDevices(syncDeviceIds);
            console.info(logTag + "testRdbSyncTest0020 sync before" + syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promise.then((result) => {
                console.log('testRdbSyncTest0020 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0020 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0020 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
    
            let  u8Arr = new Uint8Array([1,2,3,4,5]);
            {
                const valueBucket1 = {
                    "name": "xuewang22",
                    "age": 10,
                    "salary": 50.366,
                    "blobType": u8Arr
                }
                await rdbStore.insert("test", valueBucket1);
                console.info("testRdbSyncTest0020 insert success");
            }
            //query
            let resultSet = await rdbStore.query(predicates);
            try {
                console.info(logTag + "testRdbSyncTest0020 resultSet.rowCount: "+ resultSet.rowCount);
                expect(2).assertEqual(resultSet.rowCount);
            } catch (e) {
                console.info("testRdbSyncTest0020 query error " + e);
                expect().assertFail();
            }
            resultSet = null;
            let promiseTwo = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promiseTwo.then((result) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0020 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0020 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
    
            done();
            console.info(logTag + "************* testRdbStoreInsert0010 end *************");
        })
    
        /**
        * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_0300
        * @tc.name testRdbSyncTest0030
        * @tc.desc Server rdbStore Insert synchronization and then update synchronization
        */
        it("testRdbSyncTest0030", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0030 start");
    
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
                console.info("testRdbSyncTest0030 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates)
            promise.then((result) => {
                console.log('testRdbSyncTest0030 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0030 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0030 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
    
            let  u8Arr = new Uint8Array([1,2,3,4,5]);
            {
                const valueBucket1 = {
                    "name": "xuewang22",
                    "age": 10,
                    "salary": 50.366,
                    "blobType": u8Arr
                }
                let updatePromise = rdbStore.update(valueBucket1, predicates);
                await updatePromise.then(async (ret) => {
                    expect(1).assertEqual(ret);
                    let resultSet = await rdbStore.query(predicates);
                    expect(true).assertEqual(resultSet.goToFirstRow());
                    const name = await resultSet.getString(resultSet.getColumnIndex("name"));
                    expect("xuewang22").assertEqual(name);
                    resultSet = null;
                }).catch((err) => {
                    console.info("testRdbSyncTest0030 update err: "+err.message);
                    expect(null).assertFail();
                })
            }
            let promiseTwo = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promiseTwo.then((result) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0030 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0030 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
    
            done();
            console.info(logTag + "************* testRdbSyncTest0030 end *************");
        })
    
    
        /**
        * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_0400
        * @tc.name testRdbSyncTest0040
        * @tc.desc Server rdbStore Insert synchronization, and then delete synchronization
        */
        it("testRdbSyncTest0040", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0040 start");
    
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
                console.info("testRdbSyncTest0040 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promise.then((result) => {
                console.log('testRdbSyncTest0040 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0040 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0040 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
            predicates.equalTo("name", "xuewang");
            await rdbStore.delete(predicates).then((number) => {
                expect(1).assertEqual(number)
            }).then(async () => {
                resultSet = await rdbStore.query(predicates).catch((err) =>{
                    console.log("testRdbSyncTest0040 query failed err: " + err);
                    expect().assertFalse();
                })
            })
            let promiseTwo = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promiseTwo.then((result) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0040 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0040 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
            done();
            console.info(logTag + "************* testRdbSyncTest0040 end *************");
        })
    
    
    
        /**
        * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_0500
        * @tc.name testRdbSyncTest0050
        * @tc.desc Server rdbStore batchInsert sync
        */
        it("testRdbSyncTest0050", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0050 start");
    
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
                    console.info(logTag + "testRdbSyncTest0050 batchInsert");
                    expect(3).assertEqual(number);
                }).catch((err) =>{
                    console.info(logTag + "testRdbSyncTest0050 err: " + err.message);
                    expect().assertFalse();
                })
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            let resultSet = await rdbStore.query(predicates);
            try {
                console.info(logTag + "testRdbSyncTest0050 resultSet.rowCount: "+ resultSet.rowCount);
                expect(3).assertEqual(resultSet.rowCount);
            } catch (e) {
                console.info("testRdbSyncTest0050 query error " + e);
                expect().assertFail();
            }
            predicates.inDevices(syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promise.then((result) => {
                console.log('testRdbSyncTest0050 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0050 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0050 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
            done();
            console.info(logTag + "************* testRdbSyncTest0050 end *************");
        })
    
    
        /**
        * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_0600
        * @tc.name testRdbSyncTest0060
        * @tc.desc Server rdbStore BatchInsert synchronization and then update synchronization
        */
        it("testRdbSyncTest0060", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0060 start");
            //push data to remote device
            {
                var u8 = new Uint8Array([1, 2, 3]);
                const valueBucket1 = {
                    "name": "lover",
                    "age": 18,
                    "salary": 100.5,
                    "blobType": u8
                }
                const valueBucket2 = {
                    "name": "lucy",
                    "age": 23,
                    "salary": 200,
                    "blobType": u8
                }
                const valueBucket3 = {
                    "name": "jiajiahui",
                    "age": 88,
                    "salary": 20.5,
                    "blobType": u8
                }
                const valueBuckets = [valueBucket1, valueBucket2, valueBucket3];
                await rdbStore.batchInsert("test", valueBuckets).then((number) => {
                    console.info(logTag + "testRdbSyncTest0060 batchInsert number: "+ number);
                    expect(3).assertEqual(number);
                }).catch((err) =>{
                    console.info(logTag + "testRdbSyncTest0060 err: " + err.message);
                    expect().assertFalse();
                })
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            await rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates, function (err, result) {
                if (err) {
                    console.log("testRdbSyncTest0060 query error " + err);
                    return;
                }
                console.log('testRdbSyncTest0060 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0060 device=' + result[i][0] + ' status=' + result[i][1]);
                }
            });
    
            let  u8ArrUpdate = new Uint8Array([1,2,3,4,5]);
            {
                const valueBucketUpdate = {
                    "name": "mingmingUpdate",
                    "age": 10,
                    "salary": 50.366,
                    "blobType": u8ArrUpdate
                }
                let predicatesUpdate = new data_Rdb.RdbPredicates('test');
                predicatesUpdate.equalTo("name", "lucy");
                let updatePromise = rdbStore.update(valueBucketUpdate, predicatesUpdate);
                await updatePromise.then(async (ret) => {
                    expect(1).assertEqual(ret);
                    console.info("testRdbSyncTest0030 update done: " + ret);
                }).catch((err) => {
                    console.info("testRdbSyncTest0030 update err: "+err.message);
                    expect(null).assertFail();
                })
            }
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            
            promise.then((result) => {
                console.log('testRdbSyncTest0060 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0060 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0060 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
            let resultSet = await rdbStore.query(predicates);
            expect(true).assertEqual(resultSet.goToRow(1));
            const name = await resultSet.getString(resultSet.getColumnIndex("name"));
            expect("mingmingUpdate").assertEqual(name);
            resultSet = null;
            done();
            console.info(logTag + "************* testRdbSyncTest0060 end *************");
        })
    
    
    
        /**
        * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_0700
        * @tc.name testRdbSyncTest0070
        * @tc.desc Server rdbStore BatchInsert synchronization, and then delete synchronization
        */
         it("testRdbSyncTest0070", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0070 start");
    
            //push data to remote device
            {
                var u8 = new Uint8Array([1, 2, 3]);
                const valueBucket1 = {
                    "name": "catty",
                    "age": 18,
                    "salary": 100.55,
                    "blobType": u8
                }
                const valueBucket2 = {
                    "name": "lucy",
                    "age": 23,
                    "salary": 200,
                    "blobType": u8
                }
                const valueBucket3 = {
                    "name": "jiajiahui",
                    "age": 88,
                    "salary": 20.5,
                    "blobType": u8
                }
                const valueBuckets = [valueBucket1, valueBucket2, valueBucket3];
                await rdbStore.batchInsert("test", valueBuckets).then((number) => {
                    console.info(logTag + "testRdbSyncTest0070 batchInsert number: "+ number);
                    expect(3).assertEqual(number);
                }).catch((err) =>{
                    console.info(logTag + "testRdbSyncTest0070 err: " + err.message);
                    expect().assertFalse();
                })
            }
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            await rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates, function (err, result) {
                if (err) {
                    console.log("testRdbSyncTest0070 query error " + err);
                    expect().assertFail();
                    return;
                }
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0070 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            });
            
            predicates.equalTo("name", "catty");
            await rdbStore.delete(predicates).then((number) => {
                expect(1).assertEqual(number);
            });
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            let predicatesSelect = new data_Rdb.RdbPredicates('test');
            promise.then((result) => {
                console.log('testRdbSyncTest0070 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0070 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0070 sync failed' + err.code);
                expect().assertFalse();
            });
            await promise;
            let resultSet = await rdbStore.query(predicatesSelect);
            console.log('testRdbSyncTest0070 resultSet=' +resultSet.rowCount);
            expect(2).assertEqual(resultSet.rowCount);
            done();
            console.info(logTag + "************* testRdbSyncTest0070 end *************");
        })
    
        /**
        * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_0800
        * @tc.name testRdbSyncTest0080
        * @tc.desc Server rdbStore BatchInsert synchronization, and then delete synchronization,and then update synchronization
        */
        it("testRdbSyncTest0080", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0080 start");
    
            //push data to remote device
            {
                var u8 = new Uint8Array([1, 2, 3]);
                const valueBucket1 = {
                    "name": "liqiang",
                    "age": 18,
                    "salary": 100.55, 
                    "blobType": u8
                }
                const valueBucket2 = {
                    "name": "lucy",
                    "age": 23,
                    "salary": 200,
                    "blobType": u8
                }
                const valueBucket3 = {
                    "name": "update0080",
                    "age": 88,
                    "salary": 20.5,
                    "blobType": u8
                }
                const valueBuckets = [valueBucket1, valueBucket2, valueBucket3];
                await rdbStore.batchInsert("test", valueBuckets).then((number) => {
                    console.info(logTag + "testRdbSyncTest0080 batchInsert number: "+ number);
                    expect(3).assertEqual(number);
                }).catch((err) =>{
                    console.info(logTag + "testRdbSyncTest0080 err: " + err.message);
                    expect().assertFalse();
                })
            }
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            await rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates, function (err, result) {
                if (err) {
                    console.log("testRdbSyncTest0080 query error " + err);
                    expect().assertFail();
                    return;
                }
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0080 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            });
            
            predicates.equalTo("name", "liqiang");
            await rdbStore.delete(predicates).then((number) => {
                console.log("testRdbSyncTest0080 delete number: "+ number);
                expect(1).assertEqual(number);
            });
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            let predicatesSelect = new data_Rdb.RdbPredicates('test');
            promise.then((result) => {
                console.log('testRdbSyncTest0080 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0080 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0080 sync failed' + err.code);
                expect().assertFalse();
            });
            await promise;
            let resultSet = await rdbStore.query(predicatesSelect);
            console.log('testRdbSyncTest0080 resultSet=' +resultSet.rowCount);
            expect(2).assertEqual(resultSet.rowCount);
    
            let  u8Arr1 = new Uint8Array([1,2,3,4,5]);
            {
                const valueBucketUp = {
                    "name": "liyaoyao",
                    "age": 10,
                    "salary": 654,
                    "blobType": u8Arr1
                }
                let preUpdate = new data_Rdb.RdbPredicates('test');
                preUpdate.equalTo("name", "update0080");
                let updatePromise = rdbStore.update(valueBucketUp, preUpdate);
                await updatePromise.then(async (ret) => {
                    expect(1).assertEqual(ret);
                }).catch((err) => {
                    console.info("testRdbSyncTest0080 update err: "+err.message);
                    expect(null).assertFail();
                })
            }
            let promiseTwo = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            promiseTwo.then((result) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0080 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0080 sync failed' + err.code);
                expect().assertFalse();
            })
            await promise;
    
            done();
            console.info(logTag + "************* testRdbSyncTest0080 end *************");
        })
    
    
        /**
        * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_0900
        * @tc.name testRdbSyncTest0090
        * @tc.desc Server rdbStore BatchInsert synchronization, and then delete synchronization, and then insert synchronization
        */
         it("testRdbSyncTest0090", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0090 start");
    
            //push data to remote device
            {
                var u8 = new Uint8Array([1, 2, 3]);
                const valueBucket1 = {
                    "name": "mimiy",
                    "age": 18,
                    "salary": 100.55,
                    "blobType": u8
                }
                const valueBucket2 = {
                    "name": "lucy",
                    "age": 23,
                    "salary": 200,
                    "blobType": u8
                }
                const valueBucket3 = {
                    "name": "jiajiahui",
                    "age": 88,
                    "salary": 20.5,
                    "blobType": u8
                }
                const valueBuckets = [valueBucket1, valueBucket2, valueBucket3];
                await rdbStore.batchInsert("test", valueBuckets).then((number) => {
                    console.info(logTag + "testRdbSyncTest0090 batchInsert number: "+ number);
                    expect(3).assertEqual(number);
                }).catch((err) =>{
                    console.info(logTag + "testRdbSyncTest0090 err: " + err.message);
                    expect().assertFalse();
                })
            }
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            await rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates, function (err, result) {
                if (err) {
                    console.log("testRdbSyncTest0090 query error " + err);
                    expect().assertFail();
                    return;
                }
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0090 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            });
            
            predicates.equalTo("name", "mimiy");
            await rdbStore.delete(predicates).then((number) => {
                expect(1).assertEqual(number);
            });
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            let predicatesSelect = new data_Rdb.RdbPredicates('test');
            promise.then((result) => {
                console.log('testRdbSyncTest0090 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0090 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0090 sync failed' + err.code);
                expect().assertFalse();
            });
            await promise;
            let resultSet = await rdbStore.query(predicatesSelect);
            console.log('testRdbSyncTest0090 resultSet=' +resultSet.rowCount);
            expect(2).assertEqual(resultSet.rowCount);
            resultSet = null;
            let  u8Arr = new Uint8Array([1,2,3,4,5]);
            try {
                const valueBucket1 = {
                    "name": "xuewang09",
                    "age": 10,
                    "salary": 50.466,
                    "blobType": u8Arr
                }
                console.log('testRdbSyncTest0090 last insert before');
                let insertPromise = rdbStore.insert("test", valueBucket1);
                await insertPromise.then(async (ret) => {
                    console.log("testRdbSyncTest0090 insertLast ret: " + ret);
                }).catch((err) => {
                    console.info("testRdbSyncTest0090 insert err: "+err.message);
                    expect(null).assertFail();
                })
            } catch (error) {
                console.info("testRdbSyncTest0090 insert err: "+error.message);
            }
            let preLast = new data_Rdb.RdbPredicates('test');
            let promiseTwo = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, preLast);
            promiseTwo.then((result) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0090 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0090 sync failed' + err.code);
                expect().assertFalse();
            })
            await promiseTwo;
    
            done();
            console.info(logTag + "************* testRdbSyncTest0090 end *************");
        })
    
    
        /**
        * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_1000
        * @tc.name testRdbSyncTest0100
        * @tc.desc Server rdbStore BatchInsert synchronization callback, 
        */
        it("testRdbSyncTest0100", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0100 start");
    
            //push data to remote device
            {
                var u8 = new Uint8Array([1, 2, 3]);
                const valueBucket1 = {
                    "name": "mimiy",
                    "age": 18,
                    "salary": 100.55,
                    "blobType": u8
                }
                const valueBucket2 = {
                    "name": "lucy",
                    "age": 23,
                    "salary": 200,
                    "blobType": u8
                }
                const valueBucket3 = {
                    "name": "jiajiahui",
                    "age": 88,
                    "salary": 20.5,
                    "blobType": u8
                }
                const valueBucket4 = {
                    "name": "subby",
                    "age": 32,
                    "salary": 20.5,
                    "blobType": u8
                }
                const valueBucket5 = {
                    "name": "kang",
                    "age": 64,
                    "salary": 34444,
                    "blobType": u8
                }
                const valueBuckets = [valueBucket1, valueBucket2, valueBucket3,valueBucket4,valueBucket5];
                for(var i = 0; i < 20; i++){
                    await rdbStore.batchInsert("test", valueBuckets).then((number) => {
                        console.info(logTag + "testRdbSyncTest0100 batchInsert number: " + number + ", i = " + i);
                        expect(5).assertEqual(number);
                    }).catch((err) =>{
                        console.info(logTag + "testRdbSyncTest0100 err: " + err.message);
                        expect().assertFalse();
                    })
                }
            }
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            await rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates, function (err, result) {
                if (err) {
                    console.log("testRdbSyncTest0100 query error " + err);
                    expect().assertFail();
                    return;
                }
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0100 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
                done();
            });
            console.info(logTag + "************* testRdbSyncTest0100 end *************");
        })
    
    
        /**
         * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_1100
         * @tc.name testRdbSyncTest0110
         * @tc.desc Server rdbStore Insert first and synchronize salary Number.MIN_VALUE-1
         */
         it("testRdbSyncTest0110", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0110 start");
            var u8 = new Uint8Array([1, 2, 3]);
            {
                const valueBucket = {
                    "name": "zhangsan",
                    "age": 18,
                    "salary": Number.MIN_VALUE-1,
                    "blobType": u8
                }
                await rdbStore.insert("test", valueBucket);
                console.info("testRdbSyncTest0010 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "zhangsan");
            let resultSet = await rdbStore.query(predicates);
            try {
                expect(true).assertEqual(resultSet.goToFirstRow());
                const id = resultSet.getLong(resultSet.getColumnIndex("id"));
                const name = resultSet.getString(resultSet.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncTest0110 id=" + id + ", name=" + name);
                expect("zhangsan").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncTest0110 insert error " + e);
                expect().assertFail();
            }
            resultSet = null;
            let syncPre = new data_Rdb.RdbPredicates('test');
            syncPre.inDevices(syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, syncPre);
            promise.then((result) => {
                console.log('testRdbSyncTest0110 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0110 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0110 sync failed' + err.code);
                expect().assertFail();
            })
            await promise;
            done();
            console.info(logTag + "************* testRdbSyncTest0110 end *************");
        })
    
    
        /**
        * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_1200
        * @tc.name testRdbSyncTest0120
        * @tc.desc Server rdbStore BatchInsert synchronization, and then update synchronization，and then update synchronization
        */
         it("testRdbSyncTest0120", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0120 start");
    
            //push data to remote device
            {
                var u8 = new Uint8Array([1, 2, 3]);
                const valueBucket1 = {
                    "name": "mimiy",
                    "age": 18,
                    "salary": 100.55,
                    "blobType": u8
                }
                const valueBucket2 = {
                    "name": "lucy",
                    "age": 23,
                    "salary": 200,
                    "blobType": u8
                }
                const valueBucket3 = {
                    "name": "jiajiahui",
                    "age": 88,
                    "salary": 20.5,
                    "blobType": u8
                }
                const valueBuckets = [valueBucket1, valueBucket2, valueBucket3];
                await rdbStore.batchInsert("test", valueBuckets).then((number) => {
                    console.info(logTag + "testRdbSyncTest0120 batchInsert number: "+ number);
                    expect(3).assertEqual(number);
                }).catch((err) =>{
                    console.info(logTag + "testRdbSyncTest0120 err: " + err.message);
                    expect().assertFalse();
                })
            }
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.inDevices(syncDeviceIds);
            await rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates, function (err, result) {
                if (err) {
                    console.log("testRdbSyncTest0120 query error " + err);
                    expect().assertFail();
                    return;
                }
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0120 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            });
            
            let  u8ArrUp = new Uint8Array([1,2,3,4,5]);
            {
                const valueBucket1 = {
                    "name": "xuewang12Up",
                    "age": 10,
                    "salary": 50.366,
                    "blobType": u8ArrUp
                }
                let preUpdate = new data_Rdb.RdbPredicates('test');
                preUpdate.equalTo("name", "mimiy");
                let updatePromise = rdbStore.update(valueBucket1, preUpdate);
                await updatePromise.then(async (ret) => {
                    expect(1).assertEqual(ret);
                    let resultSet = await rdbStore.query(predicates);
                    expect(true).assertEqual(resultSet.goToFirstRow());
                    const name = await resultSet.getString(resultSet.getColumnIndex("name"));
                    expect("xuewang12Up").assertEqual(name);
                    resultSet = null;
                }).catch((err) => {
                    console.info("testRdbSyncTest0120 update err: "+err.message);
                    expect(null).assertFail();
                })
            }
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
            let predicatesSelect = new data_Rdb.RdbPredicates('test');
            promise.then((result) => {
                console.log('testRdbSyncTest0120 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0120 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0120 sync failed' + err.code);
                expect().assertFalse();
            });
            await promise;
            let resultSet = await rdbStore.query(predicatesSelect);
            console.log('testRdbSyncTest0120 resultSet=' +resultSet.rowCount);
            expect(3).assertEqual(resultSet.rowCount);
    
            let  u8Arr = new Uint8Array([1,2,3,4,5]);
            {
                const valueBucket1 = {
                    "name": "xuewang12Insert",
                    "age": 50,
                    "salary": 50.4,
                    "blobType": u8Arr
                }
                let insertPromise = rdbStore.insert("test", valueBucket1);
                await insertPromise.then(async (ret) => {
                    let resultSet = await rdbStore.query(predicates);
                    expect(4).assertEqual(resultSet.rowCount);
                    resultSet = null;
                }).catch((err) => {
                    console.info("testRdbSyncTest0120 insert err: "+err.message);
                    expect(null).assertFail();
                })
            }
            let preLast = new data_Rdb.RdbPredicates('test');
            let promiseTwo = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, preLast);
            promiseTwo.then((result) => {
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0120 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0120 sync failed' + err.code);
                expect().assertFalse();
            })
            await promiseTwo;
            done();
            console.info(logTag + "************* testRdbSyncTest0120 end *************");
        })
    
    
        /**
         * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_1300
         * @tc.name testRdbSyncTest0130
         * @tc.desc Server rdbStore Insert first and synchronize salary Number.MAX_VALUE+1
        */
        it("testRdbSyncTest0130", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0130 start");
            var u8 = new Uint8Array([1, 2, 3]);
            {
                const valueBucket = {
                    "name": "xiaobin0130",
                    "age": 18,
                    "salary": Number.MAX_VALUE+1,
                    "blobType": u8
                }
                await rdbStore.insert("test", valueBucket);
                console.info("testRdbSyncTest0130 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "xiaobin0130");
            let resultSet = await rdbStore.query(predicates);
            try {
                expect(true).assertEqual(resultSet.goToFirstRow());
                const id = resultSet.getLong(resultSet.getColumnIndex("id"));
                const name = resultSet.getString(resultSet.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncTest0130 id=" + id + ", name=" + name);
                expect("xiaobin0130").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncTest0130 insert error " + e);
                expect().assertFail();
            }
            resultSet = null;
            let syncPre = new data_Rdb.RdbPredicates('test');
            syncPre.inDevices(syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, syncPre);
            promise.then((result) => {
                console.log('testRdbSyncTest0130 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0130 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0130 sync failed' + err.code);
                expect().assertFail();
            })
            await promise;
            done();
            console.info(logTag + "************* testRdbSyncTest0130 end *************");
        })
    
    
        /**
         * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_1400
         * @tc.name testRdbSyncTest0140
         * @tc.desc Server rdbStore Insert first and synchronize,delete all
        */
         it("testRdbSyncTest0140", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0140 start");
            var u8 = new Uint8Array([1, 2, 3]);
            {
                const valueBucket = {
                    "name": "xiaoLi0140",
                    "age": 18,
                    "salary": 1230,
                    "blobType": u8
                }
                await rdbStore.insert("test", valueBucket);
                console.info("testRdbSyncTest0140 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "xiaoLi0140");
            let resultSet = await rdbStore.query(predicates);
            try {
                expect(true).assertEqual(resultSet.goToFirstRow());
                const id = resultSet.getLong(resultSet.getColumnIndex("id"));
                const name = resultSet.getString(resultSet.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncTest0140 id=" + id + ", name=" + name);
                expect("xiaoLi0140").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncTest0140 insert error " + e);
                expect().assertFail();
            }
            resultSet = null;
            let syncPre = new data_Rdb.RdbPredicates('test');
            syncPre.inDevices(syncDeviceIds);
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, syncPre);
            promise.then((result) => {
                console.log('testRdbSyncTest0140 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0140 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0140 sync failed' + err.code);
                expect().assertFail();
            })
            await promise;
            let deleletPre = new data_Rdb.RdbPredicates("test");
            console.log('testRdbSyncTest0140 delete bdefore ' );
            await rdbStore.delete(deleletPre);
            console.log('testRdbSyncTest0140 delete after ' );
            let delPromise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, syncPre);
            delPromise.then((result) => {
                console.log('testRdbSyncTest0140 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0140 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertTrue();
                    done();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0140 sync failed' + err.code);
                expect().assertFail();
                done();
            })
            await delPromise;
            console.info(logTag + "************* testRdbSyncTest0140 end *************");
        })
    
        /**
         * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_1600
         * @tc.name testRdbSyncTest0160
         * @tc.desc Server rdbStore Insert first and synchronize, Sync the null character of the pre-device id
        */
        it("testRdbSyncTest0160", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0160 start");
            var u8 = new Uint8Array([1, 2, 3]);
            {
                const valueBucket = {
                    "name": "zhangsan",
                    "age": 18,
                    "salary": 100.5,
                    "blobType": u8
                }
                await rdbStore.insert("test", valueBucket);
                console.info("testRdbSyncTest0160 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "zhangsan");
            let resultSet = await rdbStore.query(predicates);
            try {
                expect(true).assertEqual(resultSet.goToFirstRow());
                const id = resultSet.getLong(resultSet.getColumnIndex("id"));
                const name = resultSet.getString(resultSet.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncTest0160 id=" + id + ", name=" + name);
                expect("zhangsan").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncTest0160 insert error " + e);
                expect().assertFail();
            }
            resultSet = null;
            let syncPre = new data_Rdb.RdbPredicates('emp');
            syncPre.inDevices(" ");
            let promise = rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, syncPre);
            promise.then((result) => {
                console.log('testRdbSyncTest0160 sync done.');
                for (let i = 0; i < result.length; i++) {
                    console.log('testRdbSyncTest0160 device=' + result[i][0] + ' status=' + result[i][1]);
                    let status = result[i][1];
                    expect(status == 0).assertFail();
                    done();
                }
            }).catch((err) => {
                console.log('testRdbSyncTest0160 sync failed' + err.code);
                expect(err != null).assertTrue();
                done();
            })
            await promise;
            console.info(logTag + "************* testRdbSyncTest0160 end *************");
        })
    
    
        
        /**
         * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_1700
         * @tc.name testRdbSyncTest0170
         * @tc.desc Server rdbStore Insert first and synchronize, Error in synchronization of pre-tableName
         */
         it("testRdbSyncTest0170", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0170 start");
            var u8 = new Uint8Array([1, 2, 3]);
            {
                const valueBucket = {
                    "name": "zhangsan",
                    "age": 18,
                    "salary": 100.5,
                    "blobType": u8
                }
                await rdbStore.insert("test", valueBucket);
                console.info("testRdbSyncTest0170 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "zhangsan");
            let resultSet = await rdbStore.query(predicates);
            try {
                expect(true).assertEqual(resultSet.goToFirstRow());
                const id = resultSet.getLong(resultSet.getColumnIndex("id"));
                const name = resultSet.getString(resultSet.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncTest0170 id=" + id + ", name=" + name);
                expect("zhangsan").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncTest0170 insert error " + e);
                expect().assertFail();
            }
            resultSet = null;
            try {
                let syncPre = new data_Rdb.RdbPredicates('emp');
                syncPre.inDevices(syncDeviceIds);
                let promise = await rdbStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, syncPre);
                promise.then((result) => {
                    console.log('testRdbSyncTest0170 sync done.');
                    for (let i = 0; i < result.length; i++) {
                        console.log('testRdbSyncTest0170 device=' + result[i][0] + ' status=' + result[i][1]);
                        let status = result[i][1];
                        expect(status == 0).assertFail();
                        done();
                    }
                }).catch((err) => {
                    console.log('testRdbSyncTest0170 sync failed' + err.code);
                    expect().assertFail();
                    done();
                })
            } catch (error) {
                console.log('testRdbSyncTest0170 sync failed error.code message: ' + error.code + error.message);
                expect(error != null).assertTrue();
                done();
            }
            console.info(logTag + "************* testRdbSyncTest0170 end *************");
        })
        
        /**
         * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_1800
         * @tc.name testRdbSyncTest0180
         * @tc.desc Server rdbStore Insert first and synchronize, Pass null in synchronous mode
        */
        it("testRdbSyncTest0180", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0180 start");
            var u8 = new Uint8Array([1, 2, 3]);
            {
                const valueBucket = {
                    "name": "zhangsan",
                    "age": 18,
                    "salary": 100.5,
                    "blobType": u8
                }
                await rdbStore.insert("test", valueBucket);
                console.info("testRdbSyncTest0180 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "zhangsan");
            let resultSet = await rdbStore.query(predicates);
            try {
                expect(true).assertEqual(resultSet.goToFirstRow());
                const id = resultSet.getLong(resultSet.getColumnIndex("id"));
                const name = resultSet.getString(resultSet.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncTest0180 id=" + id + ", name=" + name);
                expect("zhangsan").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncTest0180 insert error " + e);
                expect().assertFail();
            }
            resultSet = null;
            try {
                predicates.inDevices(syncDeviceIds);
                let promise = rdbStore.sync(null, predicates);
                promise.then((result) => {
                    console.log('testRdbSyncTest0180 sync done.');
                    for (let i = 0; i < result.length; i++) {
                        console.log('testRdbSyncTest0180 device=' + result[i][0] + ' status=' + result[i][1]);
                        let status = result[i][1];
                        expect(status == 0).assertFail();
                    }
                    done();
                }).catch((err) => {
                    console.log('testRdbSyncTest0180 sync failed' + JSON.stringify(err));
                    expect().assertFail();
                    done();
                })
            } catch (error) {
                console.log('testRdbSyncTest0180 sync failed error.code message: ' + error.code + error.message);
                expect(error.code == 401).assertTrue();
                done();
            }
            // await promise;
            console.info(logTag + "************* testRdbSyncTest0180 end *************");
        })

        /**
         * @tc.number SUB_DISTRIBUTEDDATAMGR_SyncRDBTest_1900
         * @tc.name testRdbSyncTest0190
         * @tc.desc Server get rdbStoreS2 level, Name different
        */
         it("testRdbSyncTest0190", 0, async function (done) {
            console.info(logTag + "testRdbSyncTest0190 start");
            var rdbSecondStore = {};
            const STORE_CONFIGS2 = {
                name: "RemoteS2Rdb.db",
                securityLevel: data_Rdb.SecurityLevel.S2
            };
            const CREATE_TABLE_TEST_S2 = "CREATE TABLE IF NOT EXISTS test (" + "id INTEGER PRIMARY KEY AUTOINCREMENT, " + "name TEXT NOT NULL, " + "age INTEGER, " + "salary REAL, " + "blobType BLOB)";
    
            rdbSecondStore = await data_Rdb.getRdbStore(context, STORE_CONFIGS2);
            console.info("testRdbSyncTest0190 create RemoteS2Rdb.db success");
            await rdbSecondStore.executeSql(CREATE_TABLE_TEST_S2, null);
            console.info(logTag + "create RemoteS2Rdb.db table success");
            //setDistributedTables
            let back = rdbSecondStore.setDistributedTables(["test"]);
            back.then(() => {
                console.info("SetDistributedTables successfully.");
            }).catch((err) => {
                console.info("SetDistributedTables failed, err: " + err.code);
            })
            await back;
            var u8 = new Uint8Array([1, 2, 3]);
            {
                const valueBucket = {
                    "name": "S2Test",
                    "age": 18,
                    "salary": 100.5,
                    "blobType": u8
                }
                await rdbSecondStore.insert("test", valueBucket);
                console.info("testRdbSyncTest0190 insert success");
            }
    
            let predicates = new data_Rdb.RdbPredicates('test');
            predicates.equalTo("name", "S2Test");
            let resultSet = await rdbSecondStore.query(predicates);
            try {
                expect(true).assertEqual(resultSet.goToFirstRow());
                const id = resultSet.getLong(resultSet.getColumnIndex("id"));
                const name = resultSet.getString(resultSet.getColumnIndex("name"));
                console.info(logTag + "testRdbSyncTest0190 id=" + id + ", name=" + name);
                expect("S2Test").assertEqual(name);
            } catch (e) {
                console.info("testRdbSyncTest0190 select error " + e);
                expect().assertFail();
            }
            resultSet = null;
            try {
                predicates.inDevices(syncDeviceIds);
                let promise = rdbSecondStore.sync(data_Rdb.SyncMode.SYNC_MODE_PUSH, predicates);
                promise.then((result) => {
                    console.log('testRdbSyncTest0190 sync done.');
                    for (let i = 0; i < result.length; i++) {
                        let status = result[i][1];
                        console.log('testRdbSyncTest0190 device=' + result[i][0] + ' status=' + result[i][1]);
                        console.log('testRdbSyncTest0190  status=' + status);
                        expect(status == 26).assertTrue();
                        rdbSecondStore = null;
                        done();
                    }
                }).catch((err) => {
                    console.log('testRdbSyncTest0190 sync failed' + err.code);
                    expect().assertFail();
                    done();
                })
            } catch (error) {
                console.log('testRdbSyncTest0190 sync failed error.code message: ' + error.code + error.message);
                expect().assertFail();
                done();
            }
            console.info(logTag + "************* testRdbSyncTest0190 end *************");
        })
    })
}
