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

import Stub from '../../../../../../../../../testtools/disjsTest/server/service.js'
import backgroundTaskManager from '@ohos.backgroundTaskManager';
import featureAbility from '@ohos.ability.featureAbility';
import wantAgent from '@ohos.wantAgent';

function startContinuousTask() {
    let wantAgentInfo = {
        wants: [
            {
                bundleName: "com.ohos.distributekvdisjs",
                abilityName: "com.ohos.distributekvdisjs.ServiceAbility"
            }
        ],
        operationType: wantAgent.OperationType.START_SERVICE,
        requestCode: 0,
        wantAgentFlags: [wantAgent.WantAgentFlags.UPDATE_PRESENT_FLAG]
    };

    wantAgent.getWantAgent(wantAgentInfo).then((wantAgentObj) => {
        try{
            backgroundTaskManager.startBackgroundRunning(featureAbility.getContext(),
            backgroundTaskManager.BackgroundMode.MULTI_DEVICE_CONNECTION, wantAgentObj).then(() => {
            console.info("Operation startBackgroundRunning succeeded");
        }).catch((err) => {
            console.error("Operation startBackgroundRunning failed Cause: " + err);
        });
        }catch(error){
            console.error(`Operation startBackgroundRunning failed. code is ${error.code} message is ${error.message}`);
        }
    });
}

function stopContinuousTask() {
    try{
        backgroundTaskManager.stopBackgroundRunning(featureAbility.getContext()).then(() => {
            console.info("Operation stopBackgroundRunning succeeded");
        }).catch((err) => {
            console.error("Operation stopBackgroundRunning failed Cause: " + err);
        });
    }catch(error){
        console.error(`Operation stopBackgroundRunning failed. code is ${error.code} message is ${error.message}`);
    }
}


export default {
    onStart() {
        console.log('RpcServer: onStart');
        startContinuousTask();
        console.info('RpcServer: startContinuousTask');
    },
    onStop() {
        console.log('RpcServer: onStop');
        stopContinuousTask();
        console.info('RpcServer: stopContinuousTask');
    },
    onCommand(want, startId) {
        console.log('RpcServer: onCommand, want: ' + JSON.stringify(want) + ', startId: ' + startId);
    },
    onConnect(want) {
        console.log('RpcServer: service onConnect called.');
        return new Stub("disjsAbility");
    },
    onDisconnect(want) {
        console.log('RpcServer: service onDisConnect called.');
    },
    onReconnect(want) {
        console.log('RpcServer: service onReConnect called.');
    }
}
