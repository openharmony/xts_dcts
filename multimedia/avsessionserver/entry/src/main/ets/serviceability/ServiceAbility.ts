/*
 * Copyright (c) 2021-2024 Huawei Device Co., Ltd.
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

import ServiceExtension from '@ohos.app.ability.ServiceExtensionAbility';
import rpc from "@ohos.rpc"
import avSession from '@ohos.multimedia.avsession';
import backgroundTaskManager from '@ohos.backgroundTaskManager';
import wantAgent from '@ohos.wantAgent';

function startContinuousTask() {
    let wantAgentInfo = {
        wants: [
            {
                bundleName: "com.example.myapplication",
                abilityName: "com.example.myapplication.ServiceAbility"
            }
        ],
        operationType: wantAgent.OperationType.START_SERVICE,
        requestCode: 0,
        wantAgentFlags: [wantAgent.WantAgentFlags.UPDATE_PRESENT_FLAG]
    };

    wantAgent.getWantAgent(wantAgentInfo).then((wantAgentObj) => {
        try {
            backgroundTaskManager.startBackgroundRunning(this.context,
            backgroundTaskManager.BackgroundMode.MULTI_DEVICE_CONNECTION, wantAgentObj).then(() => {
                console.info(`Operation startBackgroundRunning succeeded`);
            }).catch((error) => {
                console.error(`Operation startBackgroundRunning failed. code is ${error.code}, message is ${error.message}`);
            });
        } catch (error) {
            console.error(`Operation startBackgroundRunning failed. code is ${error.code}, message is ${error.message}`);
        }
    });
}

function stopContinuousTask() {
    try {
        backgroundTaskManager.stopBackgroundRunning(this.context).then(() => {
            console.info(`Operation stopBackgroundRunning success`);
        }) .catch((error) => {
            console.error(`Operation stopBackgroundRunning failed. code is ${error.code}, message is ${error.message}`);
        })
    } catch (error) {
        console.error(`Operation stopBackgroundRunning failed. code is ${error.code}, message is ${error.message}`);
    }

}

export default class ServiceAbility extends ServiceExtension {
    onCreate(want) {
        console.info('AVSessionServer: onStart');
        startContinuousTask();
        console.info('AVSessionServer: startContinuousTask');
    }

    onConnect(want) {
        console.info('AVSessionServer: service onConnect called.')
        return new Stub("rpcTestAbility")
    }

    onDisconnect(want) {
        console.info('AVSessionServer: service onDisConnect called.')
    }

    onReconnect(want) {
        console.info('AVSessionServer: service onReConnect called.')
    }

    onRequest(want, startId){
        console.info('AVSessionServer: onCommand, want: ' + JSON.stringify(want) + ', startId: ' + startId)
    }

    onDestroy() {
        console.info('AVSessionServer: onStop');
        stopContinuousTask();
        console.info('AVSessionServer: stopContinuousTask');
    }
};

const CODE_CAST_AUDIO = 1;
let descriptor;
let controller;

class Stub extends rpc.RemoteObject {
    constructor(descriptor) {
        super(descriptor);
    }

    async onRemoteMessageRequest(code, data, reply, option) {
        try {
            console.info(`AVSessionServer: onRemoteRequest: ${code}`);
            switch (code) {
                case CODE_CAST_AUDIO:
                {
                    console.info('AVSessionServer:case  CODE_CAST_AUDIO');
                    await avSession.getAllSessionDescriptors().then((descriptors) => {
                        console.info(`${descriptors.length}`);
                        console.info('AVSessionServer: Get descriptors Successfully');
                        if (descriptors.length === 0) {
                            console.info('AVSessionServer: Get descriptors : Fail');
                        }
                        descriptor = descriptors[0];
                    }).catch((err) => {
                        console.info(`AVSessionServer: ${err.message}`);
                        return false;
                    });

                    await avSession.createController(descriptor.sessionId).then((data) => {
                        console.info('AVSessionServer: Create controller Successfully');
                        controller = data;
                    }).catch((err) => {
                        console.info(`AVSessionServer: ${err.message}`);
                        return false;
                    });

                    await controller.getAVMetadata().then((data) => {
                        console.info(data.assetId);
                        console.info(data.artist);
                        console.info('AVSessionServer: Get Metadata');
                        if (data.assetId === '121278' && data.artist === 'Eminem') {
                            console.info(`AVSessionServer: Get Metadata is ${data}`);
                            let writeResult = reply.writeString('case 1 get successfully');
                            console.info(`AVSessionServer writeString result is ${writeResult}`);
                            return true;
                        }
                    }).catch((err) => {
                        console.info(`AVSessionServer: ${err.message}`);
                        return false;
                    });

                }
                default:
                    console.error(`AVSessionServer: default case code is ${code}`);
                    return super.onRemoteMessageRequest(code, data, reply, option);
            }
        } catch (error) {
            console.info(`AVSessionServer: onRemoteRequest: ${error.message}`);
        }
        return false;
    }
}