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
import ServiceExtension from "@ohos.app.ability.ServiceExtensionAbility";
import rpc from "@ohos.rpc";

let logTag = "[RpcServer:]";
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
                        console.info(logTag + "The server is getSize and readInterfaceToken result is " + tmp.length);
                        reply.writeInterfaceToken(tmp);
                        console.info(logTag + "case 2 onRemoteMessageRequest success");
                        return true;
                    }
                case 3:
                    {
                        console.info(logTag + "case 3 start");
                        let tmp1:string = data.readString();
                        console.info(logTag + "The server is readString result is " + tmp1.length);
                        reply.writeString(tmp1);
                        console.info(logTag + "case 3 onRemoteMessageRequest success");
                        return true;
                    }
                case 4:
                    {
                        console.info(logTag + "case 4 start");
                        let tmp1:number = data.readInt();
                        console.info(logTag + "The server is readInt result is " + tmp1);
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
                        console.info(logTag + "The server is readByte result is " + tmp1);
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
                        console.info(logTag + "The server is readByte result is " + tmp1 +";" + tmp2 +";" + tmp3 +";" + tmp4 +";" + tmp5);
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
                        console.info(logTag + "The server is readShort result is " + tmp1);
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
                        console.info(logTag + "The server is readShort result is " + tmp1 +";"+ tmp2 +";" + tmp3 +";" + tmp4 +";" + tmp5);
                        reply.writeShort(tmp1);
                        reply.writeShort(tmp2);
                        reply.writeShort(tmp3);
                        reply.writeShort(tmp4);
                        reply.writeShort(tmp5);
                        console.info(logTag + "case 9 onRemoteMessageRequest success");
                        return true;
                    }
                case 10:
                    {
                        console.info(logTag + "case 10 start");
                        let tmp1 = data.readInt();
                        let tmp2 = data.readInt();
                        let tmp3 = data.readInt();
                        let tmp4 = data.readInt();
                        let tmp5 = data.readInt();
                        console.info(logTag + "The server is readInt result is " + tmp1 +";" + tmp2 +";" + tmp3 +";" + tmp4 +";" + tmp5);
                        reply.writeInt(tmp1);
                        reply.writeInt(tmp2);
                        reply.writeInt(tmp3);
                        reply.writeInt(tmp4);
                        reply.writeInt(tmp5);
                        console.info(logTag + "case 10 onRemoteMessageRequest success");
                        return true;
                    }
                case 11:
                    {
                        console.info(logTag + "case 11 start");
                        let tmp1:number = data.readLong();
                        console.info(logTag + "The server is readLong result is " + tmp1);
                        reply.writeLong(tmp1);
                        console.info(logTag + "case 11 onRemoteMessageRequest success");
                        return true;
                    }
                case 12:
                    {
                        console.info(logTag + "case 12 start");
                        let tmp1:number = data.readFloat();
                        console.info(logTag + "The server is readFloat result is " + tmp1);
                        reply.writeFloat(tmp1);
                        console.info(logTag + "case 12 onRemoteMessageRequest success");
                        return true;
                    }
                case 13:
                    {
                        console.info(logTag + "case 13 start");
                        let tmp1:number = data.readDouble();
                        console.info(logTag + "The server is readDouble result is " + tmp1);
                        reply.writeDouble(tmp1);
                        console.info(logTag + "case 13 onRemoteMessageRequest success");
                        return true;
                    }
                case 14:
                    {
                        console.info(logTag + "case 14 start");
                        let tmp1:boolean = data.readBoolean();
                        console.info(logTag + "The server is readBoolean result is " + tmp1);
                        reply.writeBoolean(tmp1);
                        console.info(logTag + "case 14 onRemoteMessageRequest success");
                        return true;
                    }
                case 15:
                    {
                        console.info(logTag + "case 15 start");
                        let tmp1:string = data.readChar();
                        console.info(logTag + "The server is readChar result is " + tmp1);
                        reply.writeChar(tmp1);
                        console.info(logTag + "case 15 onRemoteMessageRequest success");
                        return true;
                    }
                case 16:
                    {
                        console.info(logTag + "case 16 start");
                        let s = new MySequenceable(null, null);
                        let tmp1:boolean = data.readParcelable(s);
                        console.info(logTag + "server is readParcelable result is " + tmp1);
                        reply.writeParcelable(s);
                        console.info(logTag + "case 16 onRemoteMessageRequest success");
                        return true;
                    }
                case 17:
                    {
                        console.info(logTag + "case 17 start");
                        let tmp1:number[] = data.readByteArray();
                        console.info(logTag + "The server is readByteArray result is " + tmp1.length);
                        reply.writeByteArray(tmp1);
                        console.info(logTag + "case 17 onRemoteMessageRequest success");
                        return true;
                    }
                case 18:
                    {
                        console.info(logTag + "case 4 start");
                        let tmp1:number[] = data.readShortArray();
                        console.info(logTag + "The server is readShortArray result is " + tmp1.length);
                        reply.writeShortArray(tmp1);
                        console.info(logTag + "case 4 onRemoteMessageRequest success");
                        return true;
                    }
                case 19:
                    {
                        console.info(logTag + "case 19 start");
                        let tmp1:number[] = data.readIntArray();
                        console.info(logTag + "The server is readIntArray " + tmp1.length);
                        reply.writeIntArray(tmp1);
                        console.info(logTag + "case 19 onRemoteMessageRequest success");
                        return true;
                    }
                case 20:
                    {
                        console.info(logTag + "case 20 start");
                        let tmp1:number[] = data.readLongArray();
                        console.info(logTag + "The server is readLongArray result is " + tmp1.length);
                        reply.writeLongArray(tmp1);
                        console.info(logTag + "case 20 onRemoteMessageRequest success");
                        return true;
                    }   
                case 21:
                    {
                        console.info(logTag + "case 21 start");
                        let tmp1:number[] = data.readFloatArray();
                        console.info(logTag + "The server is readFloatArray result is " + tmp1.length);
                        reply.writeFloatArray(tmp1);
                        console.info(logTag + "case 21 onRemoteMessageRequest success");
                        return true;
                    }
                case 22:
                    {
                        console.info(logTag + "case 22 start");
                        let tmp1:number[] = data.readDoubleArray();
                        console.info(logTag + "The server is readDoubleArray result is " + tmp1.length);
                        reply.writeDoubleArray(tmp1);
                        console.info(logTag + "case 22 onRemoteMessageRequest success");
                        return true;
                    }
                case 23:
                    {
                        console.info(logTag + "case 23 start");
                        let tmp1:boolean[] = data.readBooleanArray();
                        console.info(logTag + "The server is readBooleanArray result is " + tmp1.length);
                        reply.writeBooleanArray(tmp1);
                        console.info(logTag + "case 23 onRemoteMessageRequest success");
                        return true;
                    }
                case 24:
                    {
                        console.info(logTag + "case 24 start");
                        let tmp1:string[] = data.readCharArray();
                        console.info(logTag + "The server is readCharArray result is " + tmp1.length);
                        reply.writeCharArray(tmp1);
                        console.info(logTag + "case 24 onRemoteMessageRequest success");
                        return true;
                    }
                case 25:
                    {
                        console.info(logTag + "case 25 start");
                        let tmp1:string[] = data.readStringArray();
                        console.info(logTag + "The server is readStringArray result is " + tmp1.length);
                        reply.writeStringArray(tmp1);
                        console.info(logTag + "case 25 onRemoteMessageRequest success");
                        return true;
                    }
                case 26:
                    {
                        console.info(logTag + "case 26 start");
                        data.readException();
                        console.info(logTag + "readExcepetion ");
                        let tmp:number = data.readInt();
                        console.info(logTag + "readInt result is " +tmp);
                        reply.writeNoException();
                        console.info(logTag + "writeNoException result is ");
                        reply.writeInt(tmp);
                        console.info(logTag + "case 26 onRemoteMessageRequest success");
                        return true;
                    }
                case 27:
                    {
                        console.info(logTag + "case 27 start");
                        let s:any = [new MySequenceable(null, null), new MySequenceable(null, null),
                        new MySequenceable(null, null)];
                        data.readParcelableArray(s);
                        console.info(logTag + "readParcelableArray result success");
                        reply.writeParcelableArray(s);
                        console.info(logTag + "case 27 onRemoteMessageRequest success");
                        return true;
                    }
                case 28:
                    {
                        console.info(logTag + "case 28 start");
                        let tmp1 = data.readByteArray();
                        let tmp2 = data.readShortArray();
                        let tmp3 = data.readIntArray();
                        let tmp4 = data.readLongArray();
                        let tmp5 = data.readFloatArray();
                        let tmp6 = data.readDoubleArray();
                        let tmp7 = data.readBooleanArray();
                        let tmp8 = data.readCharArray();
                        let tmp9 = data.readStringArray();
                        let s = [new MySequenceable(null, null), new MySequenceable(null, null),
                        new MySequenceable(null, null)];
                        data.readParcelableArray(s);
                        reply.writeByteArray(tmp1);
                        reply.writeShortArray(tmp2);
                        reply.writeIntArray(tmp3);
                        reply.writeLongArray(tmp4);
                        reply.writeFloatArray(tmp5);
                        reply.writeDoubleArray(tmp6);
                        reply.writeBooleanArray(tmp7);
                        reply.writeCharArray(tmp8);
                        reply.writeStringArray(tmp9);
                        reply.writeParcelableArray(s);
                        console.info(logTag + "case 28 onRemoteMessageRequest success");
                        return true;
                    }
                case 29:
                    {
                        console.info(logTag + "case 29 start");
                        let InterfaceToken:string = data.readInterfaceToken();
                        let listeners:any = data.readRemoteObjectArray();
                        console.info("readRemoteObjectArray is " + listeners.length + "readInterfaceToken: " + InterfaceToken);
                        for (let i = 0; i < listeners.length; i++) {
                            let option2 = new rpc.MessageOption();
                            let data2 = rpc.MessageParcel.create();
                            let reply2 = rpc.MessageParcel.create();
                            data2.writeInt(123);
                            data2.writeString("rpcListenerTest");
                            listeners[i].sendRequest(1, data2, reply2, option2)
                                .then(function(result) {
                                    console.info(logTag + "send request done, error code: " + result.errCode + ", index: " + i);
                                })
                                .catch(function(e) {
                                    console.error("send request got exception: " + e);
                                })
                                .finally(() => {
                                    data2.reclaim();
                                    reply2.reclaim();
                                    console.info(logTag + "case 24 test done");
                                })
                        }
                        console.info(logTag + "case 24 onRemoteMessageRequest success");
                        return true;
                    }
                case 30:
                    {
                        console.info(logTag + "case 30 start");
                        let listeners:any = data.readRemoteObjectArray();
                        console.info(logTag + "The server is readRemoteObjectArray result is " + listeners.length);
                        let num:number = data.readInt();
                        let str:string = data.readString();
                        let len:number = listeners.length;
                        console.info(logTag + "num is:" + num + "str is:" + str + "len is:" + len);
                        for (let i = 0; i < len; i++) {
                            let option2:any = new rpc.MessageOption();
                            let data2:any = rpc.MessageParcel.create();
                            let reply2:any = rpc.MessageParcel.create();
                            data2.writeInt(num);
                            data2.writeString(str);
                            console.info(logTag + "case 30 start sendRequest");
                            listeners[i].sendRequest(1, data2, reply2, option2)
                                .then(function(result) {
                                    console.info(logTag + "send request done, error code: " + result.errCode);
                                    console.info(logTag + "result:" + reply2.readBoolean());
                                })
                                .catch(function(e) {
                                    console.error("send request got exception: " + e);
                                })
                                .finally(() => {
                                    data2.reclaim();
                                    reply2.reclaim();
                                    console.info(logTag + "case 30 test done");
                                })
                        }
                        reply.writeNoException();
                        console.info(logTag + "case 30 onRemoteMessageRequest success");
                        return true;
                    }
                case 31:
                    {
                        console.info(logTag + "case 31 start");
                        let listeners:any = new Array(3);
                        data.readRemoteObjectArray(listeners);
                        let num:number = data.readInt();
                        let str:string = data.readString();
                        for (let i = 0; i < listeners.length; i++) {
                            let option2:any = new rpc.MessageOption();
                            let data2:any = rpc.MessageParcel.create();
                            let reply2:any = rpc.MessageParcel.create();
                            data2.writeInt(num);
                            data2.writeString(str);
                            console.info(logTag + "case 31 start sendRequest");
                            listeners[i].sendRequest(1, data2, reply2, option2)
                                .then(function(result) {
                                    console.info(logTag + "send request done, error code: " + result.errCode + ", index: " + i);
                                })
                                .catch(function(e) {
                                    console.error("send request got exception: " + e);
                                })
                                .finally(() => {
                                    data2.reclaim();
                                    reply2.reclaim();
                                    console.info(logTag + "case 31 test done");
                                })
                        }
                        reply.writeNoException();
                        console.info(logTag + "case 31 onRemoteMessageRequest success");
                        return true;
                    }
                case 32:
                    {
                        console.info(logTag + "case 32 start");
                        let size:number= data.readInt();
                        console.info(logTag + "The server is readInt result is " + size);
                        let tmp1:any = data.readRawData(size);
                        console.info(logTag + "The server is readRawData result is " + tmp1.length);
                        reply.writeInt(size);
                        reply.writeRawData(tmp1, tmp1.length);
                        console.info(logTag + "case 32 onRemoteMessageRequest success");
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