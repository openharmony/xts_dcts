/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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
import commonEvent from '@ohos.commonEventManager';
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
        commonEvent.publish("DmsFwkService_RemoteObject", {
            parameters:{
                "msg":"receiveMessage = " + tmp1
            }
        }, (err, data) => {
            console.info("DmsFwkService_ConnectAbility onCreate");
        });
        return true
    }
}
export default class ServiceAbility extends UIAbility {
    onCreate(want) {
        // Called to return a FormBindingData object.
        console.info("DmsFwkStageServer ServiceAbility onCreate")
    }

    onConnect(want) {
        // Called when the form provider is notified that a temporary form is successfully
        // converted to a normal form.
        console.info("DmsFwkStageServer ServiceAbility onConnect")
        let CommonEventPublishData = {
            parameters: {
                "life": "onConnect"
            }
        }
        commonEvent.publish("DmsFwkService_ConnectAbility", CommonEventPublishData, (err, data) => {
            console.info("DmsFwkService_ConnectAbility onCreate");
        });
        return new StubTest("test");
    }

    onDisconnect(want) {
        // Called to notify the form provider to update a specified form.
        console.info("DmsFwkStageServer ServiceAbility onDisconnect")

    }

    onRequest(want, startId){
        console.info("DmsFwkStageServer ServiceAbility onRequest")

    }

    onDestroy() {
        // Called to notify the form provider that a specified form has been destroyed.
        console.info("DmsFwkStageServer ServiceAbility onCronDestroyeate")

    }
};