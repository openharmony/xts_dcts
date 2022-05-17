/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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
import rpc from "@ohos.rpc"
import fileio from '@ohos.fileio';
import process from '@ohos.process'

export default {
    onStart() {
        console.log('RpcServer: onStart')
    },
    onStop() {
        console.log('RpcServer: onStop')
    },
    onCommand(want, startId) {
        console.log('RpcServer: onCommand, want: ' + JSON.stringify(want) +', startId: ' + startId)
    },
    onConnect(want) {
        console.log('RpcServer: service onConnect called.')
        return new Stub("rpcTestAbility")
    },
    onDisconnect(want) {
        console.log('RpcServer: service onDisConnect called.')
    },
    onReconnect(want) {
        console.log('RpcServer: service onReConnect called.')
    }
}

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

class Stub extends rpc.RemoteObject {
    constructor(descriptor) {
        super(descriptor);
    }
    onRemoteRequest(code, data, reply, option) {
        try{
            console.log("onRemoteRequest: " + code)
            console.log("-----------------syhsyhsysh:" + code)

            switch(code) {
                case 1:
                {
                    console.info("case 1 start")
                    let tmp1 = data.readByteArray()
                    console.log("The server's readByteArray result is " + tmp1);
                    let result =  reply.writeByteArray(tmp1)
                    console.log("The server's writeByteArray result is " + result);
                    return true
                }
                case 2:
                {
                    console.info("case 2 start")
                    let tmp1 = data.readIntArray()
                    console.log("The server's readIntArray " + tmp1);
                    let result =  reply.writeIntArray(tmp1)
                    console.log("The server's writeIntArray result is " + result);
                    return true
                }
                case 3:
                {
                    console.info("case 3 start")
                    let tmp1 = data.readFloatArray()
                    console.log("The server's readFloatArray result is " + tmp1);
                    let result =  reply.writeFloatArray(tmp1)
                    console.log("The server's writeFloatArray result is " + result);
                    return true
                }
                case 4:
                {
                    console.info("case 4 start")
                    let tmp1 = data.readShortArray()
                    console.log("The server's readShortArray result is " + tmp1);
                    let result =  reply.writeShortArray(tmp1)
                    console.log("The server's writeShortArray result is " + result);
                    return true
                }
                case 5:
                {
                    console.info("case 5 start")
                    let tmp1 = data.readLongArray()
                    console.log("The server's readLongArray result is " + tmp1);
                    let result =  reply.writeLongArray(tmp1)
                    console.log("The server's writeLongArray result is " + result);
                    return true
                }
                case 6:
                {
                    console.info("case 6 start")
                    let tmp1 = data.readDoubleArray()
                    console.log("The server's readDoubleArray result is " + tmp1);
                    let result =  reply.writeDoubleArray(tmp1)
                    console.log("The server's writeDoubleArray result is " + result);
                    return true
                }
                case 7:
                {
                    console.info("case 7 start")
                    let tmp1 = data.readBooleanArray()
                    console.log("The server's readBooleanArray result is " + tmp1);
                    let result =  reply.writeBooleanArray(tmp1)
                    console.log("The server's writeBooleanArray result is " + result);
                    return true
                }
                case 8:
                {
                    console.info("case 8 start")
                    let tmp1 = data.readCharArray()
                    console.log("The server's readCharArray result is " + tmp1);
                    let result =  reply.writeCharArray(tmp1)
                    console.log("The server's writeCharArray result is " + result);
                    return true
                }
                case 9:
                {
                    console.info("case 9 start")
                    let tmp1 = data.readStringArray()
                    console.log("The server's readStringArray result is " + tmp1);
                    let result =  reply.writeStringArray(tmp1)
                    console.log("The server's writeStringArray result is " + result);
                    return true
                }
                case 10:
                {
                    console.info("case 10 start")
                    let tmp1 = data.readShort()
                    console.log("The server's readShort result is " + tmp1);
                    let result =  reply.writeShort(tmp1)
                    console.log("The server's writeShort result is " + result);
                    return true
                }
                case 11:
                {
                    console.info("case 11 start")
                    let tmp1 = data.readLong()
                    console.log("The server's readLong result is " + tmp1);
                    let result =  reply.writeLong(tmp1)
                    console.log("The server's writeLong result is " + result);
                    return true
                }
                case 12:
                {
                    console.info("case 12 start")
                    let tmp1 = data.readDouble()
                    console.log("The server's readDouble result is " + tmp1);
                    let result =  reply.writeDouble(tmp1)
                    console.log("The server's writeDouble result is " + result);
                    return true
                }
                case 13:
                {
                    console.info("case 13 start")
                    let tmp1 = data.readBoolean()
                    console.log("The server's readBoolean result is " + tmp1);
                    let result =  reply.writeBoolean(tmp1)
                    console.log("The server's writeBoolean result is " + result);
                    return true
                }
                case 14:
                {
                    console.info("case 14 start")
                    let tmp1 = data.readChar()
                    console.log("The server's readChar result is " + tmp1);
                    let result =  reply.writeChar(tmp1)
                    console.log("The server's writeChar result is " + result);
                    return true
                }
                case 15:
                {
                    console.info("case 15 start")
                    let tmp1 = data.readString()
                    console.log("The server's readString result is " + tmp1);
                    let result =  reply.writeString(tmp1)
                    console.log("The server's writeString result is " + result);
                    return true
                }
                case 16:
                {
                    console.info("case 16 start")
                    let tmp1 = data.readByte()
                    console.log("The server's readByte result is " + tmp1);
                    let result =  reply.writeByte(tmp1)
                    console.log("The server's writeByte result is " + result);
                    return true
                }
                case 17:
                {
                    console.info("case 17 start")
                    let tmp1 = data.readInt()
                    console.log("The server's readInt result is " + tmp1);
                    let result =  reply.writeInt(tmp1)
                    console.log("The server's writeInt result is " + result);
                    return true
                }
                case 18:
                {
                    console.info("case 18 start")
                    let tmp1 = data.readFloat()
                    console.log("The server's readFloat result is " + tmp1);
                    let result =  reply.writeFloat(tmp1)
                    console.log("The server's writeFloat result is " + result);
                    return true
                }
                case 19:
                {
                    console.info("case 19 start")
                    var size = data .readInt();
                    console.log("The server's readInt result is " + size);
                    let tmp1 = data.readRawData(size);
                    console.log("The server's readRawData result is " + tmp1);
                    let result =  reply.writeRawData(tmp1, tmp.length)
                    console.log("The server's writeRawData result is " + result);
                    return true
                }
                case 20:
                {
                    console.info("case 20 start")
                    let listener = data.readRemoteObject();
                    let num = data.readInt()
                    let str = data.readString()
                    let option2 = new rpc.MessageOption()
                    console.log("case 20 num is " + num)
                    console.log("case 20 str is " + str)
                    let data2 = rpc.MessageParcel.create()
                    let reply2 = rpc.MessageParcel.create()
                    data2.writeInt(num)
                    data2.writeString(str)
                    console.log("case 20 start sendRequest")
                    listener.sendRequest(1, data2, reply2, option2)
                        .then(function(result) {
                            console.info("send request done, error code: " + result.errCode )
                        })
                        .catch(function(e) {
                            console.error("send request got exception: " + e)
                        })
                        .finally(() => {
                            data2.reclaim()
                            reply2.reclaim()
                            console.log("case 14 test done")
                        })
                    reply.writeNoException()
                    console.log("The server's writeRemoteObjectArray result is " + result);
                    return true
                }
                case 21:
                {
                    console.info("case 21 start")
                    let s = new MySequenceable(null, null)
                    var tmp1 = data.readSequenceable(s)
                    console.log("The server's readSequenceable result is " + tmp1);
                    let result =  reply.writeSequenceable(s)
                    console.log("The server's writeSequenceable result is " + result);
                    return true
                }
                case 22:
                {
                    console.info("case 22 start")
                    data.readException()
                    console.log("The server's readExcepetion ");
                    var tmp = data.readInt();
                    console.log("The server;s readInt result is " +tmp);
                    reply.writeNoException()
                    console.log("The server's writeNoException result is ");
                    var result = reply.writeInt(tmp);
                    return true
                }
                case 23:
                {
                    console.info("case 23 start")
                    var s = [new MySequenceable(null, null), new MySequenceable(null, null),
                    new MySequenceable(null, null)];
                    data.readSequenceableArray(s);
                    console.log("The server's readSequenceableArray result success");
                    let result =  reply.writeSequenceableArray(s);
                    console.log("The server's writeSequenceableArray result is " + result);
                    return true
                }
                case 24:
                {
                    console.info("case 24 start")
                    let listeners = data.readRemoteObjectArray();
                    console.log("The server's readRemoteObjectArray result is " + listeners.length);
                    for (let i = 0; i < listeners.length; i++) {
                        let option2 = new rpc.MessageOption()
                        let data2 = rpc.MessageParcel.create()
                        let reply2 = rpc.MessageParcel.create()
                        listeners[i].sendRequest(1, data2, reply2, option2)
                            .then(function(result) {
                                console.info("send request done, error code: " + result.errCode + ", index: " + i)
                            })
                            .catch(function(e) {
                                console.error("send request got exception: " + e)
                            })
                            .finally(() => {
                                data2.reclaim()
                                reply2.reclaim()
                                console.log("case 24 test done")
                            })
                    }
                    console.log("The server's writeRemoteObjectArray result is " + result);
                    return true
                }
                case 25:
                {
                    console.info("case 25 start")
                    let tmp1 = data.readByte()
                    let tmp2 = data.readShort()
                    let tmp3 = data.readInt()
                    let tmp4 = data.readLong()
                    let tmp5 = data.readFloat()
                    let tmp6 = data.readDouble()
                    let tmp7 = data.readBoolean()
                    let tmp8 = data.readChar()
                    let tmp9 = data.readString()
                    let s = new MySequenceable(null, null)
                    let tmp10 = data.readSequenceable(s)
                    let result1 =  reply.writeByte(tmp1)
                    let result2 =  reply.writeShort(tmp2)
                    let result3 =  reply.writeInt(tmp3)
                    let result4 =  reply.writeLong(tmp4)
                    let result5 =  reply.writeFloat(tmp5)
                    let result6 =  reply.writeDouble(tmp6)
                    let result7 =  reply.writeBoolean(tmp7)
                    let result8 =  reply.writeChar(tmp8)
                    let result9 =  reply.writeString(tmp9)
                    let result10 =  reply.writeSequenceable(s)
                    return true
                }
                case 26:
                {
                    console.info("case 26 start")
                    let tmp1 = data.readByteArray()
                    let tmp2 = data.readShortArray()
                    let tmp3 = data.readIntArray()
                    let tmp4 = data.readLongArray()
                    let tmp5 = data.readFloatArray()
                    let tmp6 = data.readDoubleArray()
                    let tmp7 = data.readBooleanArray()
                    let tmp8 = data.readCharArray()
                    let tmp9 = data.readStringArray()
                    let s = [new MySequenceable(null, null), new MySequenceable(null, null),
                    new MySequenceable(null, null)]
                    let tmp10 = data.readSequenceableArray(s)
                    let result1 =  reply.writeByteArray(tmp1)
                    let result2 =  reply.writeShortArray(tmp2)
                    let result3 =  reply.writeIntArray(tmp3)
                    let result4 =  reply.writeLongArray(tmp4)
                    let result5 =  reply.writeFloatArray(tmp5)
                    let result6 =  reply.writeDoubleArray(tmp6)
                    let result7 =  reply.writeBooleanArray(tmp7)
                    let result8 =  reply.writeCharArray(tmp8)
                    let result9 =  reply.writeStringArray(tmp9)
                    let result10 =  reply.writeSequenceableArray(s)
                    return true
                }
                case 27:
                {
                    console.info("case 27 start")
                    var ashmem = data.readAshmem();
                    console.log("The server's readAshmem result is " + ashmem);
                    ashmem.mapReadAndWriteAshmem();
                    let huoqu = ashmem.getAshmemSize();
                    console.log("The server's huoqu result is " + huoqu);
                    var bytes = ashmem.readFromAshmem(huoqu, 0);
                    console.log("The server's readFromAshmem result is " + bytes);
                    var resultInt = reply.writeInt(bytes.length);
                    console.log("The server's writeInt result is " + resultInt);
                    let result =  reply.writeAshmem(ashmem)
                    console.log("The server's writeAshmem result is " + result);
                    ashmem.unmapAshmem();
                    ashmem.closeAshmem();
                    return true
                }
                case 28:
                {
                    console.info("case 28 start")
                    let s = new MySequenceable(null, null);
                    var tmp1 = data.readSequenceable(s);
                    console.log("The server's readSequenceable result is " + s);
                    var result =  reply.writeSequenceable(s);
                    console.log("The server's writeSequenceable result is " + s);
                    return true
                }
                case 29:
                {
                    console.info("case 29 start")
                    var tmp1 = data.readShort();
                    var tmp2 = data.readShort();
                    var tmp3 = data.readShort();
                    var tmp4 = data.readShort();
                    var tmp5 = data.readShort();
                    console.log("The server's readShort result is " + tmp1 + tmp2 + tmp3 + tmp4 + tmp5);
                    var result1 =  reply.writeShort(tmp1);
                    var result2 =  reply.writeShort(tmp2);
                    var result3 =  reply.writeShort(tmp3);
                    var result4 =  reply.writeShort(tmp4);
                    var result5 =  reply.writeShort(tmp5);
                    console.log("The server's writeShort result is " + result1);
                    return true
                }
                case 30:
                {
                    console.info("case 30 start")
                    var tmp1 = data.readByte();
                    var tmp2 = data.readByte();
                    var tmp3 = data.readByte();
                    var tmp4 = data.readByte();
                    var tmp5 = data.readByte();
                    console.log("The server's readByte result is " + tmp1 + tmp2 + tmp3 + tmp4 + tmp5);
                    var result1 =  reply.writeByte(tmp1);
                    var result2 =  reply.writeByte(tmp2);
                    var result3 =  reply.writeByte(tmp3);
                    var result4 =  reply.writeByte(tmp4);
                    var result5 =  reply.writeByte(tmp5);
                    console.log("The server's writeByte result is " + result1);
                    return true
                }
                case 31:
                {
                    console.info("case 31 start")
                    var tmp1 = data.readInt();
                    var tmp2 = data.readInt();
                    var tmp3 = data.readInt();
                    var tmp4 = data.readInt();
                    var tmp5 = data.readInt();
                    console.log("The server's readInt result is " + tmp1 + tmp2 + tmp3 + tmp4 + tmp5);
                    var result1 =  reply.writeInt(tmp1);
                    var result2 =  reply.writeInt(tmp2);
                    var result3 =  reply.writeInt(tmp3);
                    var result4 =  reply.writeInt(tmp4);
                    var result5 =  reply.writeInt(tmp5);
                    console.log("The server's writeInt result is " + result1);
                    return true
                }
                case 32:
                {
                    console.log("case 32 start")
                    let callingPid = rpc.IPCSkeleton.getCallingPid()
                    let callingUid = rpc.IPCSkeleton.getCallingUid()
                    let callingDeviceID = rpc.IPCSkeleton.getCallingDeviceID()
                    let localDeviceID = rpc.IPCSkeleton.getLocalDeviceID()
                    let isLocalCalling = rpc.IPCSkeleton.isLocalCalling()
                    reply.writeNoException()
                    reply.writeInt(callingPid)
                    reply.writeInt(callingUid)
                    reply.writeString(callingDeviceID)
                    reply.writeString(localDeviceID)
                    reply.writeBoolean(isLocalCalling)
                    reply.writeInt(this.getCallingPid())
                    reply.writeInt(this.getCallingUid())
                    let id = rpc.IPCSkeleton.resetCallingIdentity()
                    rpc.IPCSkeleton.setCallingIdentity(id)
                    reply.writeInt(rpc.IPCSkeleton.getCallingPid())
                    reply.writeInt(rpc.IPCSkeleton.getCallingUid())
                    reply.writeInt(rpc.IPCSkeleton.flushCommands(this))
                    return true
                }
                case 33:
                {
                    console.info("case 33 starts")
                    let bytesWr = data.readInt()
                    let fd = data.readFileDescriptor()
                    console.log("readFileDescriptor success：" + fd)
                    let writeFileResult = fileio.writeSync(fd, "HELLO RPC", {position: bytesWr + 1});
                    console.log("writeSync success"+writeFileResult)
                    rpc.MessageParcel.closeFileDescriptor(fd)
                    console.log("closeFileDescriptor success")
                    return true
                }
                case 34:
                {
                    console.info("case 34 start");
                    let listeners = data.readRemoteObjectArray();
                    console.log("The server's readRemoteObjectArray result is " + listeners.length + ";" + listeners);
                    let num = data.readInt();
                    let str = data.readString();
                    console.log("The server's readRemoteObjectArray result is " + num + ";" + str);
                    for (let i = 0; i < listeners.length; i++) {
                        let option2 = new rpc.MessageOption()
                        let data2 = rpc.MessageParcel.create()
                        let reply2 = rpc.MessageParcel.create()
                        data2.writeInt(num)
                        data2.writeString(str)
                        let lis = listeners[i];
                        console.log("The server's readRemoteObjectArray result is " + lis);
                        lis.sendRequest(1, data2, reply2, option2)
                            .then(function(result) {
                                console.info("send request done, error code: " + result.errCode + ", index: " + i)
                            })
                            .catch(function(e) {
                                console.error("send request got exception: " + e)
                            })
                            .finally(() => {
                                data2.reclaim()
                                reply2.reclaim()
                                console.log("case 34 test done")
                            })
                    }
                    reply.writeNoException()
                    return true
                }
                case 35:
                {
                    console.info("case 35 start");
                    let listeners = new Array(3);
                    data.readRemoteObjectArray(listeners);
                    let num = data.readInt();
                    let str = data.readString();
                    console.log("The server's readRemoteObjectArray result is " + num + ";" + str);
                    for (let i = 0; i < listeners.length; i++) {
                        let option2 = new rpc.MessageOption()
                        let data2 = rpc.MessageParcel.create()
                        let reply2 = rpc.MessageParcel.create()
                        data2.writeInt(num)
                        data2.writeString(str)
                        console.info("case 35 start sendRequest")
                        listeners[i].sendRequest(1, data2, reply2, option2)
                            .then(function(result) {
                                console.info("send request done, error code: " + result.errCode + ", index: " + i)
                            })
                            .catch(function(e) {
                                console.error("send request got exception: " + e)
                            })
                            .finally(() => {
                                data2.reclaim()
                                reply2.reclaim()
                                console.log("case 35 test done")
                            })
                    }
                    reply.writeNoException()
                    return true
                }
                case 36:
                {
                    console.info("case 36 start")
                    let tmp1 = data.readInterfaceToken()
                    console.log("The server's readInterfaceToken() result is " + tmp1);
                    let result =  reply.writeInterfaceToken(tmp1)
                    console.log("The server's writeInterfaceToken result is " + result);
                    return true
                }
                default:
                    console.error("default case " + code)
                    return super.onRemoteRequest(code, data, reply, option)
            }
        } catch (error) {
            console.log("onRemoteRequest: " + error);
        }
        return false
    }
}