/*
 * Copyright (c) 2021-2022 Huawei Device Co., Ltd.
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
                bundleName: "com.ohos.rpctest",
                abilityName: "com.ohos.rpctest.MainAbility"
            }
        ],
        operationType: wantAgent.OperationType.START_SERVICE,
        requestCode: 0,
        wantAgentFlags: [wantAgent.WantAgentFlags.UPDATE_PRESENT_FLAG]
    };

    wantAgent.getWantAgent(wantAgentInfo).then((wantAgentObj) => {
        try{
            backgroundTaskManager.startBackgroundRunning(featureAbility.getContext(),
            backgroundTaskManager.BackgroundMode.DATA_TRANSFER, wantAgentObj).then(() => {
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
    onRemoteRequest(code, data, reply, option) {
        try{
            console.info("onRemoteRequest: " + code);
            console.info("-----------------syhsyhsysh:" + code);
            if (code === 37){
                console.info("case 37 start");
                let tmp1 = data.readString();
                console.info("onRemoteRequest readstring is " + tmp1);
                let result =  reply.writeString("onRemoteRequest invoking");
                console.info("onRemoteRequest writestring is " + result);
                return true
            } else if (code === 38){
                console.info("case 38 start");
                let tmp1 = data.readString();
                console.info("onRemoteRequest readstring is " + tmp1);
                let result =  reply.writeString(tmp1);
                console.info("onRemoteRequest writestring is " + result);
                return true
            }else {
                console.error("default case " + code);
                return super.onRemoteRequest(code, data, reply, option);
            }
        } catch (error) {
            console.info("onRemoteRequest: " + error);
        }
        return false
    }
    onRemoteMessageRequest(code, data, reply, option) {
        try{
            console.info("onRemoteMessageRequest: " + code);
            console.info("-----------------syhsyhsysh:" + code);
            switch(code) {
                case 1:
                    {
                        console.info("case 1 start");
                        let tmp1 = data.readByteArray();
                        console.info("The server's readByteArray result is " + tmp1.length);
                        let result =  reply.writeByteArray(tmp1);
                        console.info("The server's writeByteArray result is " + result);
                        return true
                    }
                case 2:
                    {
                        console.info("case 2 start");
                        let tmp1 = data.readIntArray();
                        console.info("The server's readIntArray " + tmp1.length);
                        let result =  reply.writeIntArray(tmp1);
                        console.info("The server's writeIntArray result is " + result);
                        return true
                    }
                case 3:
                    {
                        console.info("case 3 start");
                        let tmp1 = data.readFloatArray();
                        console.info("The server's readFloatArray result is " + tmp1.length);
                        let result =  reply.writeFloatArray(tmp1);
                        console.info("The server's writeFloatArray result is " + result);
                        return true
                    }
                case 4:
                    {
                        console.info("case 4 start");
                        let tmp1 = data.readShortArray();
                        console.info("The server's readShortArray result is " + tmp1.length);
                        let result =  reply.writeShortArray(tmp1);
                        console.info("The server's writeShortArray result is " + result);
                        return true
                    }
                case 5:
                    {
                        console.info("case 5 start");
                        let tmp1 = data.readLongArray();
                        console.info("The server's readLongArray result is " + tmp1.length);
                        let result =  reply.writeLongArray(tmp1);
                        console.info("The server's writeLongArray result is " + result);
                        return true
                    }
                case 6:
                    {
                        console.info("case 6 start");
                        let tmp1 = data.readDoubleArray();
                        console.info("The server's readDoubleArray result is " + tmp1.length);
                        let result =  reply.writeDoubleArray(tmp1);
                        console.info("The server's writeDoubleArray result is " + result);
                        return true
                    }
                case 7:
                    {
                        console.info("case 7 start");
                        let tmp1 = data.readBooleanArray();
                        console.info("The server's readBooleanArray result is " + tmp1.length);
                        let result =  reply.writeBooleanArray(tmp1);
                        console.info("The server's writeBooleanArray result is " + result);
                        return true
                    }
                case 8:
                    {
                        console.info("case 8 start");
                        let tmp1 = data.readCharArray();
                        console.info("The server's readCharArray result is " + tmp1.length);
                        let result =  reply.writeCharArray(tmp1);
                        console.info("The server's writeCharArray result is " + result);
                        return true
                    }
                case 9:
                    {
                        console.info("case 9 start");
                        let tmp1 = data.readStringArray();
                        console.info("The server's readStringArray result is " + tmp1.length);
                        let result =  reply.writeStringArray(tmp1);
                        console.info("The server's writeStringArray result is " + result);
                        return true
                    }
                case 10:
                    {
                        console.info("case 10 start");
                        let tmp1 = data.readShort();
                        console.info("The server's readShort result is " + tmp1);
                        let result =  reply.writeShort(tmp1);
                        console.info("The server's writeShort result is " + result);
                        return true
                    }
                case 11:
                    {
                        console.info("case 11 start");
                        let tmp1 = data.readLong();
                        console.info("The server's readLong result is " + tmp1);
                        let result =  reply.writeLong(tmp1);
                        console.info("The server's writeLong result is " + result);
                        return true
                    }
                case 12:
                    {
                        console.info("case 12 start");
                        let tmp1 = data.readDouble();
                        console.info("The server's readDouble result is " + tmp1);
                        let result =  reply.writeDouble(tmp1);
                        console.info("The server's writeDouble result is " + result);
                        return true
                    }
                case 13:
                    {
                        console.info("case 13 start");
                        let tmp1 = data.readBoolean();
                        console.info("The server's readBoolean result is " + tmp1);
                        let result =  reply.writeBoolean(tmp1);
                        console.info("The server's writeBoolean result is " + result);
                        return true
                    }
                case 14:
                    {
                        console.info("case 14 start");
                        let tmp1 = data.readChar();
                        console.info("The server's readChar result is " + tmp1);
                        let result =  reply.writeChar(tmp1);
                        console.info("The server's writeChar result is " + result);
                        return true
                    }
                case 15:
                    {
                        console.info("case 15 start");
                        let tmp1 = data.readString();
                        console.info("The server's readString result is " + tmp1.length);
                        let result =  reply.writeString(tmp1);
                        console.info("The server's writeString result is " + result);
                        return true
                    }
                case 16:
                    {
                        console.info("case 16 start");
                        let tmp1 = data.readByte();
                        console.info("The server's readByte result is " + tmp1);
                        let result =  reply.writeByte(tmp1);
                        console.info("The server's writeByte result is " + result);
                        return true
                    }
                case 17:
                    {
                        console.info("case 17 start");
                        let tmp1 = data.readInt();
                        console.info("The server's readInt result is " + tmp1);
                        let result =  reply.writeInt(tmp1);
                        console.info("The server's writeInt result is " + result);
                        return true
                    }
                case 18:
                    {
                        console.info("case 18 start");
                        let tmp1 = data.readFloat();
                        console.info("The server's readFloat result is " + tmp1);
                        let result =  reply.writeFloat(tmp1);
                        console.info("The server's writeFloat result is " + result);
                        return true
                    }
                case 19:
                    {
                        console.info("case 19 start");
                        var size = data.readInt();
                        console.info("The server's readInt result is " + size);
                        let tmp1 = data.readRawData(size);
                        console.info("The server's readRawData result is " + tmp1.length);
                        let size1 = reply.writeInt(size);
                        console.info("The server's writeInt result is " + size1);
                        let result = reply.writeRawData(tmp1, tmp1.length);
                        console.info("The server's writeRawData result is " + result);
                        return true
                    }
                case 20:
                    {
                        console.info("case 20 start");
                        let listener = data.readRemoteObject();
                        let num = data.readInt();
                        let str = data.readString();
                        console.info("case 20 num is " + num);
                        console.info("case 20 str is " + str);
                        let data2 = rpc.MessageParcel.create();
                        let reply2 = rpc.MessageParcel.create();
                        let option2 = new rpc.MessageOption();
                        data2.writeInt(num);
                        data2.writeString(str);
                        console.info("case 20 start sendRequest");
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
                                console.info("case 20 test done");
                            })
                        reply.writeNoException();
                        console.info("case 20 end");
                        return true
                    }
                case 21:
                    {
                        console.info("case 21 start");
                        let s = new MySequenceable(null, null);
                        var tmp1 = data.readParcelable(s);
                        console.info("server's readParcelable result is " + tmp1);
                        let result =  reply.writeParcelable(s);
                        console.info("server's writeParcelable result is " + result);
                        return true
                    }
                case 22:
                    {
                        console.info("case 22 start");
                        data.readException();
                        console.info("readExcepetion ");
                        var tmp = data.readInt();
                        console.info("readInt result is " +tmp);
                        reply.writeNoException();
                        console.info("writeNoException result is ");
                        var result = reply.writeInt(tmp);
                        return true
                    }
                case 23:
                    {
                        console.info("case 23 start");
                        var s = [new MySequenceable(null, null), new MySequenceable(null, null),
                        new MySequenceable(null, null)];
                        data.readParcelableArray(s);
                        console.info("readParcelableArray result success");
                        let result =  reply.writeParcelableArray(s);
                        console.info("writeParcelableArray result is " + result);
                        return true
                    }
                case 24:
                    {
                        console.info("case 24 start");
                        let listeners = data.readRemoteObjectArray();
                        console.info("The server's readRemoteObjectArray result is " + listeners.length);
                        for (let i = 0; i < listeners.length; i++) {
                            let option2 = new rpc.MessageOption();
                            let data2 = rpc.MessageParcel.create();
                            let reply2 = rpc.MessageParcel.create();
                            listeners[i].sendRequest(1, data2, reply2, option2)
                                .then(function(result) {
                                    console.info("send request done, error code: " + result.errCode + ", index: " + i);
                                })
                                .catch(function(e) {
                                    console.error("send request got exception: " + e);
                                })
                                .finally(() => {
                                    data2.reclaim();
                                    reply2.reclaim();
                                    console.info("case 24 test done");
                                })
                        }
                        console.info("The server's writeRemoteObjectArray result is " + result);
                        return true
                    }
                case 25:
                    {
                        console.info("case 25 start");
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
                        let tmp10 = data.readParcelable(s);
                        let result1 =  reply.writeByte(tmp1);
                        let result2 =  reply.writeShort(tmp2);
                        let result3 =  reply.writeInt(tmp3);
                        let result4 =  reply.writeLong(tmp4);
                        let result5 =  reply.writeFloat(tmp5);
                        let result6 =  reply.writeDouble(tmp6);
                        let result7 =  reply.writeBoolean(tmp7);
                        let result8 =  reply.writeChar(tmp8);
                        let result9 =  reply.writeString(tmp9);
                        let result10 =  reply.writeParcelable(s);
                        return true
                    }
                case 26:
                    {
                        console.info("case 26 start");
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
                        let tmp10 = data.readParcelableArray(s);
                        let result1 =  reply.writeByteArray(tmp1);
                        let result2 =  reply.writeShortArray(tmp2);
                        let result3 =  reply.writeIntArray(tmp3);
                        let result4 =  reply.writeLongArray(tmp4);
                        let result5 =  reply.writeFloatArray(tmp5);
                        let result6 =  reply.writeDoubleArray(tmp6);
                        let result7 =  reply.writeBooleanArray(tmp7);
                        let result8 =  reply.writeCharArray(tmp8);
                        let result9 =  reply.writeStringArray(tmp9);
                        let result10 =  reply.writeParcelableArray(s);
                        return true
                    }
                case 27:

                    {
                        console.info("case 27 start");
                        var ashmem = data.readAshmem();
                        console.info("The server's readAshmem result is " + ashmem);
                        var gongx = ashmem.mapReadOnlyAshmem();
                        console.info("The server's gongxiang result is " + gongx);
                        let huoqu = ashmem.getAshmemSize();
                        console.info("The server's huoqu result is " + huoqu);
                        let bytes = ashmem.readFromAshmem(huoqu, 0);
                        console.info("The server's readFromAshmem result is " + bytes);
                        let err = reply.writeNoException();
                        console.info("The server's writeNoException result is " + err);
                        var resultInt = reply.writeInt(bytes.length);
                        console.info("The server's writeInt result is " + resultInt);
                        let result =  reply.writeAshmem(ashmem);
                        console.info("The server's writeAshmem result is " + result);
                        ashmem.unmapAshmem();
                        console.info("unmapAshmem success " );
                        ashmem.closeAshmem();
                        console.info("closeAshmem success ");
                        return true
                    }
                case 28:
                    {
                        console.info("case 28 start");
                        let s = new MySequenceable(null, null);
                        var tmp1 = data.readParcelable(s);
                        console.info("The server's readParcelable result is " + s);
                        var result =  reply.writeParcelable(s);
                        console.info("The server's writeParcelable result is " + s);
                        return true
                    }
                case 29:
                    {
                        console.info("case 29 start");
                        var tmp1 = data.readShort();
                        var tmp2 = data.readShort();
                        var tmp3 = data.readShort();
                        var tmp4 = data.readShort();
                        var tmp5 = data.readShort();
                        console.info("The server's readShort result is " + tmp1 + tmp2 + tmp3 + tmp4 + tmp5);
                        var result1 =  reply.writeShort(tmp1);
                        var result2 =  reply.writeShort(tmp2);
                        var result3 =  reply.writeShort(tmp3);
                        var result4 =  reply.writeShort(tmp4);
                        var result5 =  reply.writeShort(tmp5);
                        console.info("The server's writeShort result is " + result1);
                        return true
                    }
                case 30:
                    {
                        console.info("case 30 start");
                        var tmp1 = data.readByte();
                        var tmp2 = data.readByte();
                        var tmp3 = data.readByte();
                        var tmp4 = data.readByte();
                        var tmp5 = data.readByte();
                        console.info("The server's readByte result is " + tmp1 + tmp2 + tmp3 + tmp4 + tmp5);
                        var result1 =  reply.writeByte(tmp1);
                        var result2 =  reply.writeByte(tmp2);
                        var result3 =  reply.writeByte(tmp3);
                        var result4 =  reply.writeByte(tmp4);
                        var result5 =  reply.writeByte(tmp5);
                        console.info("The server's writeByte result is " + result1);
                        return true
                    }
                case 31:
                    {
                        console.info("case 31 start");
                        var tmp1 = data.readInt();
                        var tmp2 = data.readInt();
                        var tmp3 = data.readInt();
                        var tmp4 = data.readInt();
                        var tmp5 = data.readInt();
                        console.info("The server's readInt result is " + tmp1 + tmp2 + tmp3 + tmp4 + tmp5);
                        var result1 =  reply.writeInt(tmp1);
                        var result2 =  reply.writeInt(tmp2);
                        var result3 =  reply.writeInt(tmp3);
                        var result4 =  reply.writeInt(tmp4);
                        var result5 =  reply.writeInt(tmp5);
                        console.info("The server's writeInt result is " + result1);
                        return true
                    }
                case 32:
                    {
                        console.info("case 32 start");
                        let callingPid = rpc.IPCSkeleton.getCallingPid();
                        let callingUid = rpc.IPCSkeleton.getCallingUid();
                        let callingDeviceID = rpc.IPCSkeleton.getCallingDeviceID();
                        let localDeviceID = rpc.IPCSkeleton.getLocalDeviceID();
                        let isLocalCalling = rpc.IPCSkeleton.isLocalCalling();
                        reply.writeNoException();
                        reply.writeInt(callingPid);
                        reply.writeInt(callingUid);
                        reply.writeString(callingDeviceID);
                        reply.writeString(localDeviceID);
                        reply.writeBoolean(isLocalCalling);
                        reply.writeInt(this.getCallingPid());
                        reply.writeInt(this.getCallingUid());
                        console.info("getCallingUid the server result success");
                        let id = rpc.IPCSkeleton.resetCallingIdentity();
                        rpc.IPCSkeleton.setCallingIdentity(id);
                        reply.writeInt(rpc.IPCSkeleton.getCallingPid());
                        reply.writeInt(rpc.IPCSkeleton.getCallingUid());
                        reply.writeInt(rpc.IPCSkeleton.flushCommands(this));
                        console.info("IPCSkeleton the server result success");
                        return true
                    }
                case 33:
                    {
                        console.info("case 33 starts");
                        let callingPid = rpc.IPCSkeleton.getCallingPid();
                        let callingUid = rpc.IPCSkeleton.getCallingUid();
                        reply.writeNoException();
                        reply.writeInt(callingPid);
                        reply.writeInt(callingUid);
                        reply.writeInt(this.getCallingPid());
                        reply.writeInt(this.getCallingUid());
                        console.info("getCallingUid the server result success");
                        let id = rpc.IPCSkeleton.resetCallingIdentity();
                        rpc.IPCSkeleton.setCallingIdentity(id);
                        reply.writeInt(rpc.IPCSkeleton.getCallingPid());
                        reply.writeInt(rpc.IPCSkeleton.getCallingUid());
                        reply.writeInt(rpc.IPCSkeleton.flushCommands(this));
                        console.info("IPCSkeleton the server result success");
                        return true
                    }
                case 34:
                    {
                        console.info("case 34 start");
                        let listeners = data.readRemoteObjectArray();
                        console.info("The server's readRemoteObjectArray result is " + listeners.length);
                        let num = data.readInt();
                        let str = data.readString();
                        let len = listeners.length;
                        console.info("num is:" + num + "str is:" + str + "len is:" + len);
                        for (let i = 0; i < len; i++) {
                            let option2 = new rpc.MessageOption();
                            let data2 = rpc.MessageParcel.create();
                            let reply2 = rpc.MessageParcel.create();
                            data2.writeInt(num);
                            data2.writeString(str);
                            console.info("case 34 start sendRequest");
                            listeners[i].sendRequest(1, data2, reply2, option2)
                                .then(function(result) {
                                    console.info("send request done, error code: " + result.errCode);
                                    console.info("result:" + reply2.readBoolean());
                                })
                                .catch(function(e) {
                                    console.error("send request got exception: " + e);
                                })
                                .finally(() => {
                                    data2.reclaim();
                                    reply2.reclaim();
                                    console.info("case 34 test done");
                                })
                        }
                        reply.writeNoException();
                        return true
                    }
                case 35:
                    {
                        console.info("case 35 start");
                        let listeners = new Array(3);
                        data.readRemoteObjectArray(listeners);
                        let num = data.readInt();
                        let str = data.readString();
                        for (let i = 0; i < listeners.length; i++) {
                            let option2 = new rpc.MessageOption();
                            let data2 = rpc.MessageParcel.create();
                            let reply2 = rpc.MessageParcel.create();
                            data2.writeInt(num);
                            data2.writeString(str);
                            console.info("case 35 start sendRequest");
                            listeners[i].sendRequest(1, data2, reply2, option2)
                                .then(function(result) {
                                    console.info("send request done, error code: " + result.errCode + ", index: " + i);
                                })
                                .catch(function(e) {
                                    console.error("send request got exception: " + e);
                                })
                                .finally(() => {
                                    data2.reclaim();
                                    reply2.reclaim();
                                    console.info("case 35 test done");
                                })
                        }
                        reply.writeNoException();
                        return true
                    }
                case 36:
                    {
                        console.info("case 36 start");
                        let tmp = data.readInterfaceToken();
                        console.info("The server's getSize and readInterfaceToken result is " + tmp.length);
                        let result =  reply.writeInterfaceToken(tmp);
                        console.info("The server's setSize and writeInterfaceToken result is " + result);
                        return true
                    }
                case 37:
                    {
                        console.info("case 37 start");
                        let tmp1 = data.readString();
                        console.info("onRemoteRequest readstring is " + tmp1);
                        let result =  reply.writeString("onRemoteMessageRequest invoking");
                        console.info("onRemoteRequest writestring is " + result);
                        return true
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