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
import rpc from '@ohos.rpc';

class Stub extends rpc.RemoteObject {
    constructor(descriptor) {
        super(descriptor);
    }
    onRemoteRequest(code, data, reply, option) {
        try{
            console.info("onRemoteRequest: " + code);
            console.info("-----------------syhsyhsysh:" + code);
            if (code === 37){
                console.info("case 37 start");
                let tmp1:string = data.readString();
                console.info("onRemoteRequest readstring is " + tmp1);
                reply.writeString("onRemoteRequest invoking");
                console.info("case 37 onRemoteMessageRequest success");
                return true;
            } else if (code === 38){
                console.info("case 38 start");
                let tmp1:string = data.readString();
                console.info("onRemoteRequest readstring is " + tmp1);
                reply.writeString(tmp1);
                console.info("case 37 onRemoteMessageRequest success");
                return true;
            }else {
                console.error("default case " + code);
                return super.onRemoteRequest(code, data, reply, option);
            }
        } catch (error) {
            console.info("onRemoteRequest: " + error);
        }
        return false;
    }
    onRemoteMessageRequest(code, data, reply, option) {
        try{
            console.info("onRemoteMessageRequest: " + code);
            switch(code) {
                case 1:
                    {
                        console.info("case 1 start");
                        let listener:any = data.readRemoteObject();
                        let num:number = data.readInt();
                        let str:string = data.readString();
                        console.info("case 1 num is " + num);
                        console.info("case 1 str is " + str);
                        let data2:any = rpc.MessageParcel.create();
                        let reply2:any = rpc.MessageParcel.create();
                        let option2:any = new rpc.MessageOption();
                        data2.writeInt(num);
                        data2.writeString(str);
                        console.info("case 1 start sendRequest");
                        listener.sendRequest(1, data2, reply2, option2)
                            .then(function(result) {
                                console.info("send request done, error code: " + result.errCode );
                            })
                            .catch(function(e) {
                                console.error("send request got exception: " + e);
                            })
                            .finally(() => {
                                data2.reclaim();
                                reply2.reclaim();
                                console.info("case 1 test done");
                            })
                        reply.writeNoException();
                        console.info("case 1 onRemoteMessageRequest success");
                        return true;
                    }
                case 2:
                    {
                        console.info("case 2 start");
                        let tmp:any = data.readInterfaceToken();
                        console.info("The server's getSize and readInterfaceToken result is " + tmp.length);
                        reply.writeInterfaceToken(tmp);
                        console.info("case 2 onRemoteMessageRequest success");
                        return true;
                    }
                case 3:
                    {
                        console.info("case 3 start");
                        let tmp1:string = data.readString();
                        console.info("The server's readString result is " + tmp1.length);
                        reply.writeString(tmp1);
                        console.info("case 3 onRemoteMessageRequest success");
                        return true;
                    }
                default:
                    this.onRemoteRequest(code, data, reply, option);
            }
        } catch (error) {
            console.info("onRemoteMessageRequest: " + error);
        }
        return false
    }
}

export default class ServiceAbility extends ServiceExtension {
    onCreate(want) {
        // Called to return a FormBindingData object.
        console.info("IpcStageServer ServiceAbility onCreate");
    }

    onConnect(want) {
        // Called when the form provider is notified that a temporary form is successfully
        console.info("IpcStageServer ServiceAbility onConnect");
        return new Stub("rpcTestAbility");
    }

    onDisconnect(want) {
        // Called to notify the form provider to update a specified form.
        console.info("IpcStageServer ServiceAbility onDisconnect");
    }

    onRequest(want, startId){
        console.info("IpcStageServer ServiceAbility onRequest");

    }

    onDestroy() {
        // Called to notify the form provider that a specified form has been destroyed.
        console.info("IpcStageServer ServiceAbility onCronDestroyeate");
    }
};