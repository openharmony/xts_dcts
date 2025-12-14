/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import Stub from './disetsTest/server/service'

export default class ServiceAbility extends UIAbility {
    onCreate(want) {
        // Called to return a FormBindingData object.
        console.info("ObjectStageServer ServiceAbility onCreate")
        globalThis.extensionContext = this.context
        globalThis.startAbilityReault = true
    }

    onConnect(want) {
        // Called when the form provider is notified that a temporary form is successfully
        // converted to a normal form.
        console.info("ObjectStageServer ServiceAbility onConnect")
        let CommonEventPublishData = {
            parameters: {
                "life": "onConnect"
            }
        }
        commonEvent.publish("ObjectStageService_ConnectAbility", CommonEventPublishData, (err, data) => {
            console.info("ObjectStageService_ConnectAbility onCreate");
        });
        return new Stub("distributedobjectdisets");
    }

    onDisconnect(want) {
        // Called to notify the form provider to update a specified form.
        console.info("ObjectStageServer ServiceAbility onDisconnect")

    }

    onRequest(want, startId){
        console.info("ObjectStageServer ServiceAbility onRequest")
        // globalThis.extensionContext = this.context
        // globalThis.startAbilityReault = true
    }

    onDestroy() {
        // Called to notify the form provider that a specified form has been destroyed.
        console.info("ObjectStageServer ServiceAbility onCronDestroy")

    }
};
