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
import commonEvent from '@ohos.commonEventManager';

import Stub from '../../../../../../../../../testtools/disjsTest/server/service.js'
let logTag = "[RpcServer_ServiceAbility:  ]";

export default class ServiceAbility extends UIAbility {

    onCreate(want) {
        // Called to return a FormBindingData object.
        console.info(logTag + "ServiceAbility onCreate")
    }

    onConnect(want) {
        // Called when the form provider is notified that a temporary form is successfully
        // converted to a normal form.
        globalThis.extensionContext = this.context;
        console.info(logTag + "ServiceAbility onConnect, globalThis.extensionContext=" + globalThis.extensionContext);
        let CommonEventPublishData = {
            parameters: {
                "life": "onConnect"
            }
        }
        commonEvent.publish(logTag + "ConnectAbility", CommonEventPublishData, (err, data) => {
            console.info(logTag + "ConnectAbility onCreate");
        });
        return new Stub("diskv");
    }

    onDisconnect(want) {
        // Called to notify the form provider to update a specified form.
        console.info(logTag + "ServiceAbility onDisconnect")

    }

    onRequest(want, startId){
        console.info(logTag + "ServiceAbility onRequest")
        globalThis.extensionContext = this.context
        console.info(logTag + "ServiceAbility onRequest, globalThis.extensionContext=" + globalThis.extensionContext);
        globalThis.startAbilityReault = true
    }

    onDestroy() {
        // Called to notify the form provider that a specified form has been destroyed.
        console.info(logTag + "ServiceAbility onCronDestroyeate")

    }
};
