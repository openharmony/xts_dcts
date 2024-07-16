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
import ServiceExtension from '@ohos.app.ability.ServiceExtensionAbility';
import rpc from '@ohos.rpc';

let logTag = '[RpcServer:]';
class MySequenceable {
    num = null;
    str = null;
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

class Stub extends rpc.RemoteObject {
    constructor(descriptor) {
        super(descriptor);
    }
    onRemoteMessageRequest(code, data, reply, option) {
        try{
            console.info(logTag + "onRemoteMessageRequest: " + code);
            switch(code) {
                case 1:
                    {
                        console.info(logTag + "case 1 start");
                        let listener:any = data.readRemoteObject();
                        let num:number = data.readInt();
                        let str:string = data.readString();
                        console.info(logTag + "case 1 num is " + num);
                        console.info(logTag + "case 1 str is " + str);
                        let data2:any = rpc.MessageParcel.create();
                        let reply2:any = rpc.MessageParcel.create();
                        let option2:any = new rpc.MessageOption();
                        data2.writeInt(num);
                        data2.writeString(str);
                        console.info(logTag + "case 1 start sendRequest");
                        listener.sendRequest(1, data2, reply2, option2)
                            .then(function(result) {
                                console.info(logTag + "send request done, error code: " + result.errCode );
                            })
                            .catch(function(e) {
                                console.error("send request got exception: " + e);
                            })
                            .finally(() => {
                                data2.reclaim();
                                reply2.reclaim();
                                console.info(logTag + "case 1 test done");
                            })
                        reply.writeNoException();
                        console.info(logTag + "case 1 onRemoteMessageRequest success");
                        return true;
                    }
                case 2:
                    {
                        console.info(logTag + "case 2 start");
                        let tmp:any = data.readInterfaceToken();
                        console.info(logTag + "The server's getSize and readInterfaceToken result is " + tmp.length);
                        reply.writeInterfaceToken(tmp);
                        console.info(logTag + "case 2 onRemoteMessageRequest success");
                        return true;
                    }
                case 3:
                    {
                        console.info(logTag + "case 3 start");
                        let tmp1:string = data.readString();
                        console.info(logTag + "The server's readString result is " + tmp1.length);
                        reply.writeString(tmp1);
                        console.info(logTag + "case 3 onRemoteMessageRequest success");
                        return true;
                    }
                case 4:
                    {
                        console.info(logTag + "case 4 start");
                        let tmp1:number = data.readInt();
                        console.info(logTag + "The server's readInt result is " + tmp1);
                        reply.writeInt(tmp1);
                        console.info(logTag + "case 4 onRemoteMessageRequest success");
                        return true;
                    }
                case 5:
                    {
                        console.info(logTag + "case 5 start");
                        let tmp1 = data.readByte();
                        let tmp2 = data.readShort();
                        let tmp3 = data.readInt();
                        let tmp4 = data.readLong();
                        let tmp5 = data.readFloat();
                        let tmp6 = data.readDouble();
                        let tmp7 = data.readBoolean();
                        let tmp8 = data.readChar();
                        let tmp9 = data.readString();
                        let s = new MySequenceable(null, null);
                        data.readParcelable(s);
                        reply.writeByte(tmp1);
                        reply.writeShort(tmp2);
                        reply.writeInt(tmp3);
                        reply.writeLong(tmp4);
                        reply.writeFloat(tmp5);
                        reply.writeDouble(tmp6);
                        reply.writeBoolean(tmp7);
                        reply.writeChar(tmp8);
                        reply.writeString(tmp9);
                        reply.writeParcelable(s);
                        console.info(logTag + "case 5 onRemoteMessageRequest success");
                        return true;
                    }
                case 6:
                    {
                        console.info(logTag + "case 6 start");
                        let tmp1:number = data.readByte();
                        console.info(logTag + "The server's readByte result is " + tmp1);
                        reply.writeByte(tmp1);
                        console.info(logTag + "case 6 onRemoteMessageRequest success");
                        return true;
                    }
                case 7:
                    {
                        console.info(logTag + "case 7 start");
                        let tmp1 = data.readByte();
                        let tmp2 = data.readByte();
                        let tmp3 = data.readByte();
                        let tmp4 = data.readByte();
                        let tmp5 = data.readByte();
                        console.info(logTag + "The server's readByte result is " + tmp1 +";" + tmp2 +";" + tmp3 +";" + tmp4 +";" + tmp5);
                        reply.writeByte(tmp1);
                        reply.writeByte(tmp2);
                        reply.writeByte(tmp3);
                        reply.writeByte(tmp4);
                        reply.writeByte(tmp5);
                        console.info(logTag + "case 7 onRemoteMessageRequest success");
                        return true;
                    }
                case 8:
                    {
                        console.info(logTag + "case 8 start");
                        let tmp1:number = data.readShort();
                        console.info(logTag + "The server's readShort result is " + tmp1);
                        reply.writeShort(tmp1);
                        console.info(logTag + "case 8 onRemoteMessageRequest success");
                        return true;
                    }
                case 9:
                    {
                        console.info(logTag + "case 9 start");
                        let tmp1 = data.readShort();
                        let tmp2 = data.readShort();
                        let tmp3 = data.readShort();
                        let tmp4 = data.readShort();
                        let tmp5 = data.readShort();
                        console.info(logTag + "The server's readShort result is " + tmp1 +";"+ tmp2 +";" + tmp3 +";" + tmp4 +";" + tmp5);
                        reply.writeShort(tmp1);
                        reply.writeShort(tmp2);
                        reply.writeShort(tmp3);
                        reply.writeShort(tmp4);
                        reply.writeShort(tmp5);
                        console.info(logTag + "case 9 onRemoteMessageRequest success");
                        return true;
                    }
                default:
                    this.onRemoteMessageRequest(code, data, reply, option);
            }
        } catch (error) {
            console.info(logTag + "onRemoteMessageRequest: " + error);
        }
        return false
    }
}

export default class ServiceAbility extends ServiceExtension {
    onCreate(want) {
        // Called to return a FormBindingData object.
        console.info(logTag + "IpcStageServer ServiceAbility onCreate");
    }

    onConnect(want) {
        // Called when the form provider is notified that a temporary form is successfully
        console.info(logTag + "IpcStageServer ServiceAbility onConnect");
        return new Stub("rpcTestAbility");
    }

    onDisconnect(want) {
        // Called to notify the form provider to update a specified form.
        console.info(logTag + "IpcStageServer ServiceAbility onDisconnect");
    }

    onRequest(want, startId){
        console.info(logTag + "IpcStageServer ServiceAbility onRequest");

    }

    onDestroy() {
        // Called to notify the form provider that a specified form has been destroyed.
        console.info(logTag + "IpcStageServer ServiceAbility onCronDestroyeate");
    }
};