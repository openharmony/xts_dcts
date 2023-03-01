/*
* Copyright (c) 2023 Huawei Device Co., Ltd.
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import featureAbility from '@ohos.ability.featureAbility';

import data_rdb from '@ohos.data.relationalStore';
import deviceManager from '@ohos.distributedHardware.deviceManager';
import TestApi from '../../../../../../../../../../../testtools/disjsTest/server/testApi.js';

let context = featureAbility.getContext();
globalThis.abilityContext = context; 

const CREATE_TABLE_TEST = "CREATE TABLE IF NOT EXISTS test (" + "id INTEGER PRIMARY KEY AUTOINCREMENT, " + "name TEXT NOT NULL, " + "age INTEGER, " + "salary REAL, " + "blobType BLOB)";

var rdbStore = undefined;
const STORE_CONFIG = {
    name: "RemoteRdb.db",
    securityLevel: data_rdb.SecurityLevel.S1
};

export default {
    
    data: {
        title: ""
    },

    onInit() {
        this.createRDBStore();
    },
    onShow(){

    },
    
    getIndexContext(){
        console.log("rdbStore " + rdbStore);
        return rdbStore;
        
    },
    
    async initDeviceMonitor() {
        console.log("create device manager before");
        try {
            await deviceManager.createDeviceManager('com.ohos.distributerdbdisjs', (err, manager) => {
                if (err) {
                    console.log("create device manager failed, err=" + err);
                    return;
                }
                let dmInstance = manager;
                console.log("create device manager success dmInstance: "+  JSON.stringify(dmInstance));
                dmInstance.on("deviceStateChange", (data) => {
                    console.log("deviceStateChange: " + JSON.stringify(data));
                });
            });
        } catch (error) {
            console.log("createDeviceManager error : " + error.message);
        }

    },
    async createRDBStore(){
        console.log("first context " + context);
        let promise = data_rdb.getRdbStore(context, STORE_CONFIG);
        promise.then(async (back) => {
            rdbStore = back;
            console.log("Get RdbStore successfully rdbStore " + rdbStore);
        }).catch((err) => {
            console.log("Get RdbStore failed, err: " + err);
        })
        await promise;
        await rdbStore.executeSql(CREATE_TABLE_TEST, null);
        let testApi = new TestApi();
        this.setDistributedTables();
    },

    setDistributedTables(){
        console.info("setDistributedTables before");
        let back = rdbStore.setDistributedTables(["test"]);
        back.then(() => {
            console.info("SetDistributedTables successfully.");
            this.insertData();
        }).catch((err) => {
            console.info("SetDistributedTables failed, err: " + err.code);
        })
    },

    async insertData(){
        const valueBucket = {
            "name": "Lisa",
            "age": 18,
            "salary": 100.5,
            "blobType": new Uint8Array([1, 2, 3, 4, 5])
        }
        console.log("Insert insertData start.");
        let promise = rdbStore.insert("test", valueBucket);
        promise.then((rowId) => {
            console.log("Insert is successful, rowId = " + rowId);
        }).catch((err) => {
            console.log("Insert is failed err: "+err.code+" "+err.message);
        })
        await promise;
    }
}
