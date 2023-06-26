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

import rpc from "@ohos.rpc";
import backgroundTaskManager from '@ohos.backgroundTaskManager';
import featureAbility from '@ohos.ability.featureAbility';
import wantAgent from '@ohos.wantAgent';

function startContinuousTask() {
    let wantAgentInfo = {
        wants: [
            {
                bundleName: "com.ohos.rpcquesttest",
                abilityName: "com.ohos.rpcquesttest.ServiceAbility"
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
        console.info('RpcServer: onStart');
        startContinuousTask();
        console.info('RpcServer: startContinuousTask');
    },
    onStop() {
        console.info('RpcServer: onStop');
        stopContinuousTask();
        console.info('RpcServer: stopContinuousTask');
    },
    onCommand(want, startId) {
        console.info('RpcServer: onCommand, want: ' + JSON.stringify(want) +', startId: ' + startId);
    },
    onConnect(want) {
        console.info('RpcServer: service onConnect called.');
        return new Stub("rpcTestAbility");
    },
    onDisconnect(want) {
        console.info('RpcServer: service onDisConnect called.');
    },
    onReconnect(want) {
        console.info('RpcServer: service onReConnect called.');
    }
}

class Stub extends rpc.RemoteObject {
    constructor(descriptor) {
        super(descriptor);
    }
    onRemoteRequest(code, data, reply, option) {
        try{
            console.info("onRemoteRequest: " + code);
            if (code === 2){
                console.info("The processing mode of code value 1 is enabled on the server");
                let tmp1 = data.readString();
                let result =  reply.writeString("onRemoteRequest invoking");
                return true;
            } else {
                console.error("onRemoteRequest default case " + code);
                return super.onRemoteRequest(code, data, reply, option);
            }
        } catch (error) {
            console.info("onRemoteRequest error: " + error);
        }
        return false
    }
    async onRemoteMessageRequest(code, data, reply, option) {
        try{
            console.info("async onRemoteMessageRequest: " + code);
            if (code === 1){
                console.info("The processing mode of code value 1 is enabled on the server");
                let tmp1 = data.readString();
                let result =  reply.writeString("async onRemoteMessageRequest invoking");
            } else if (code === 2){
                console.info("The processing mode of code value 2 is enabled on the server");
                let tmp1 = data.readString();
                let result =  reply.writeString("async onRemoteMessageRequest invoking");
            }else {
                console.error("async onRemoteMessageRequest default case " + code);
                return super.onRemoteMessageRequest(code, data, reply, option);
            }
            await new Promise((resolve)=>{
                console.info("new promise")
                setTimeout(resolve,100);
            })
            return true;
        } catch (error) {
            console.info("async onRemoteMessageRequest: " + error);
        }
        return false
    }
}
