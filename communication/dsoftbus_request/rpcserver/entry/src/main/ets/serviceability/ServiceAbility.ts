/*
 * Copyright (c) 2023 - 2024 Huawei Device Co., Ltd.
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
import rpc from '@ohos.rpc';
import fileio from '@ohos.fileio';
import wantAgent from '@ohos.wantAgent';
import backgroundTaskManager from '@ohos.backgroundTaskManager';

class MySequenceable {
    num = null
    str = null
    constructor(num, string) {
        this.num = num;
        this.str = string;
    }

    marshalling(messageParcel) {
        messageParcel.writeInt(this.num);
        messageParcel.writeString(this.str);
        return true;
    }

    unmarshalling(messageParcel) {
        this.num = messageParcel.readInt();
        this.str = messageParcel.readString();
        return true;
    }
}

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
            backgroundTaskManager.startBackgroundRunning(this.context,
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
        backgroundTaskManager.stopBackgroundRunning(this.context).then(() => {
            console.info("Operation stopBackgroundRunning succeeded");
        }).catch((err) => {
            console.error("Operation stopBackgroundRunning failed Cause: " + err);
        });
    }catch(error){
        console.error(`Operation stopBackgroundRunning failed. code is ${error.code} message is ${error.message}`);
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
                return true;
            } else if (code === 2){
                console.info("The processing mode of code value 2 is enabled on the server");
                let tmp1 = data.readString();
                let result =  reply.writeString("async onRemoteMessageRequest invoking");
                return true;
            }else {
                console.error("async onRemoteMessageRequest default case " + code);
                return super.onRemoteMessageRequest(code, data, reply, option);
            }
            
        } catch (error) {
            console.info("async onRemoteMessageRequest: " + error);
        }
        return false
    }
}


export default class ServiceAbility extends ServiceExtension {
    onCreate(want) {
        // Called to return a FormBindingData object.
        console.info("IpcStageServer ServiceAbility onCreate")
    }

    onConnect(want) {
        // Called when the form provider is notified that a temporary form is successfully
        console.info("IpcStageServer ServiceAbility onConnect")
        return new Stub("rpcTestAbility");
    }

    onDisconnect(want) {
        // Called to notify the form provider to update a specified form.
        console.info("IpcStageServer ServiceAbility onDisconnect")
    }

    onRequest(want, startId){
        console.info("IpcStageServer ServiceAbility onRequest")

    }

    onDestroy() {
        // Called to notify the form provider that a specified form has been destroyed.
        console.info("IpcStageServer ServiceAbility onCronDestroyeate")

    }
};