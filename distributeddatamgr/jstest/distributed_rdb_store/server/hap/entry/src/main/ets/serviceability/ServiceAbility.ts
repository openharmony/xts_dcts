/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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
import UIAbility from '@ohos.app.ability.UIAbility';
import rpc from '@ohos.rpc';
import commonEvent from '@ohos.commonEvent';
import data_rdb from '@ohos.data.relationalStore';
// import TestApi from '../../../../../../../../../../../testtools/disjsTest/server/testApi.js';

const CREATE_TABLE_TEST = "CREATE TABLE IF NOT EXISTS test (" + "id INTEGER PRIMARY KEY AUTOINCREMENT, " + "name TEXT NOT NULL, " + "age INTEGER, " + "salary REAL, " + "blobType BLOB)";

var rdbStore = undefined;
const STORE_CONFIG = {
    name: "RemoteRdb.db",
    securityLevel: data_rdb.SecurityLevel.S1
};
class StubTest extends rpc.RemoteObject {
    constructor(descriptor) {
        super(descriptor);
    }
    onRemoteRequest(code, data, reply, option) {
        console.info("onRemoteRequest: " + code)
        let tmp1 = data.readInt()
        let tmp2 = data.readInt()
        let tmp3 = tmp1 + tmp2;
        let result =  reply.writeInt(tmp3)
        console.info("The server's writeInt result is " + result);
        commonEvent.publish("RDBService_RemoteObject", {
            parameters:{
                "msg":"receiveMessage = " + data.readInt()
            }
        }, (err, data) => {
            console.info("RDBService_ConnectAbility onCreate");
        });
        return true
    }
}
export default class ServiceAbility extends UIAbility {
    onCreate(want) {
        // Called to return a FormBindingData object.
        console.info("RdbStageServer ServiceAbility onCreate")
        if(want.parameters != undefined){
            if(want.parameters.startReason == "terminateSelf"){
                setTimeout(()=>{
                    this.context.terminateSelf()
                }, 2000)
            }
        }
        this.createRDBStore(); 
    }

    onConnect(want) {
        // Called when the form provider is notified that a temporary form is successfully
        // converted to a normal form.
        console.info("RdbStageServer ServiceAbility onConnect")
        let CommonEventPublishData = {
            parameters: {
                "life": "onConnect"
            }
        }
        commonEvent.publish("RDBService_ConnectAbility", CommonEventPublishData, (err) => {
            console.info("RDBService_ConnectAbility onCreate");
        });
        return new StubTest("test");
    }

    onDisconnect(want) {
        // Called to notify the form provider to update a specified form.
        console.info("RdbStageServer ServiceAbility onDisconnect")

    }

    onRequest(want, startId){
        console.info("RdbStageServer ServiceAbility onRequest")
        globalThis.extensionContext = this.context
        globalThis.startAbilityReault = true
    }

    onDestroy() {
        // Called to notify the form provider that a specified form has been destroyed.
        console.info("RdbStageServer ServiceAbility onCronDestroyeate")

    }

    async createRDBStore(){
        console.log("first context " + this.context);
        let promise = data_rdb.getRdbStore(this.context, STORE_CONFIG);
        promise.then(async (back) => {
            rdbStore = back;
            console.log("Get RdbStore successfully rdbStore " + rdbStore);
        }).catch((err) => {
            console.log("Get RdbStore failed, err: " + err);
        })
        await promise;
        await rdbStore.executeSql(CREATE_TABLE_TEST, null);
        this.setDistributedTables();
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