/*
 * Copyright (c) 2024-2025 Huawei Device Co., Ltd.
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
import Ability from '@ohos.app.ability.UIAbility'
import AcCtrl from '@ohos.abilityAccessCtrl'
import data_rdb from '@ohos.data.relationalStore';
import datardb from '@ohos.data.rdb';
let AcManager = AcCtrl.createAtManager()

const CREATE_TABLE_TEST = "CREATE TABLE IF NOT EXISTS test (" + "id INTEGER PRIMARY KEY AUTOINCREMENT, " + "name TEXT NOT NULL, " + "age INTEGER, " + "salary REAL, " + "blobType BLOB)";

var rdbStore = undefined;
var rdbStore1 = undefined;
const STORE_CONFIG = {
    name: "RemoteRdb.db",
    securityLevel: data_rdb.SecurityLevel.S1
};
const STORE_CONFIG1 = {
    name: "RemoteRdb.db",
};
export default class MainAbility3 extends Ability {
    onCreate(want, launchParam) {
        console.log("[Demo] MainAbility onCreate")
        globalThis.abilityWant = want;
        const self = this;
        AcManager.requestPermissionsFromUser(this.context, ['ohos.permission.DISTRIBUTED_DATASYNC'], function (result) {
            console.info('Calc[IndexPage] grantPermission,requestPermissionsFromUser')
            self.createRDBStore(self.context);
        })
    }

    onDestroy() {
        console.log("[Demo] MainAbility onDestroy")
    }

    onWindowStageCreate(windowStage) {
        // Main window is created, set main page for this ability
        console.log("[Demo] MainAbility onWindowStageCreate")
        globalThis.abilityContext = this.context;
        windowStage.setUIContent(this.context, "MainAbility/pages/MainAbility_pages", null)
    }

    onWindowStageDestroy() {
        // Main window is destroyed, release UI related resources
        console.log("[Demo] MainAbility onWindowStageDestroy")
    }

    onForeground() {
        // Ability has brought to foreground
        console.log("[Demo] MainAbility onForeground")
    }

    onBackground() {
        // Ability has back to background
        console.log("[Demo] MainAbility onBackground")
    }

    async createRDBStore(context){
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
        this.setDistributedTables();


        let promise1 = datardb.getRdbStore(context, STORE_CONFIG1);
        promise1.then(async (back) => {
            rdbStore1 = back;
            console.log("Get RdbStore successfully rdbStore1 " + rdbStore1);
        }).catch((err) => {
            console.log("Get RdbStore1 failed, err: " + err);
        })
        await promise1;
        await rdbStore1.executeSql(CREATE_TABLE_TEST, null);
        await rdbStore1.setDistributedTables(["test"]);
        console.info("SetDistributedTables1 successfully.");
        const valueBucket = {
            "id": 1,
            "name": "Lisa",
            "age": 18,
            "salary": 100.5,
            "blobType": new Uint8Array([1, 2, 3, 4, 5])
        }
        console.log("Insert insertData start1.");
        try{
            let rowId = await rdbStore1.insert("test", valueBucket);
            console.log("Insert1 is successful, rowId = " + rowId);
        }catch(err){
            console.log("Insert1 is failed err: "+err.code+" "+err.message);
        }
    }
    setDistributedTables(){
        console.info("setDistributedTables before");
        let back = rdbStore.setDistributedTables(["test"]);
        back.then(() => {
            console.info("SetDistributedTables successfully.");
            this.insertData();
        }).catch((err) => {
            console.info("SetDistributedTables failed, err: " + err.code);
        })
    }

    async insertData(){
        const valueBucket = {
            "id": 1,
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
};
