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

import {describe, beforeAll, beforeEach, afterEach, afterAll, it, expect} from 'deccjsunit/index';
import deviceManager from '@ohos.distributedHardware.deviceManager';
import TestService from '../../../../../../../../../../testtools/disjsTest/client/testService.js';
import RemoteHelper from '../../../../../../../../../../testtools/disjsTest/client/remoteHelper.js';
import factory from '@ohos.data.distributedData';

import data_Rdb from '@ohos.data.relationalStore';
import ability_featureAbility from '@ohos.ability.featureAbility'

var context = ability_featureAbility.getContext();
const CREATE_TABLE_TEST = "CREATE TABLE IF NOT EXISTS test (" + "id INTEGER PRIMARY KEY AUTOINCREMENT, " + "name TEXT NOT NULL, " + "age INTEGER, " + "salary REAL, " + "blobType BLOB)";
const CREATE_TABLE_NAME = "CREATE TABLE IF NOT EXISTS test" 
const CREATE_TABLE = " (" + "id INTEGER PRIMARY KEY AUTOINCREMENT, " + "name TEXT NOT NULL, " + "age INTEGER, " + "salary REAL, " + "blobType BLOB)";
const STORE_CONFIG = {
    name: "RemoteRdb.db",
    securityLevel: data_Rdb.SecurityLevel.S1
}
const TEST_BUNDLE_NAME = 'com.ohos.distributerdbdisjs';
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


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


describe('rdbSyncFirstLevelTest', function () {
    beforeAll(async function (done) {
        console.info(logTag + '-----------------beforeAll begin-----------------');
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
        let deleletPre = new data_Rdb.RdbPredicates("test");
        await rdbStore.delete(deleletPre);
        console.info(logTag + "REMOTE afterEach delete rdbStore success");
        console.info(logTag + '-----------------afterEach end-----------------');
        done();
    })

    afterAll(async function (done){
        console.info(logTag + '-----------------afterAll begin-----------------');
        rdbStore = null;
        await data_Rdb.deleteRdbStore(context, "RemoteRdb.db").then(() => {
            console.info(logTag + "delete RemoteRdb success");
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
})
