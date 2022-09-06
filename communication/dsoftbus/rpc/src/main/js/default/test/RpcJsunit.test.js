/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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
import deviceManager from '@ohos.distributedHardware.deviceManager';
import featureAbility from "@ohos.ability.featureAbility";
import {describe, beforeAll, beforeEach, afterEach, afterAll, it, expect} from 'deccjsunit/index';

let gIRemoteObject = null;
let connectId = null;
describe('RpcJsUnitTest', function(){
    console.info("-----------------------SUB_Softbus_RPC_Compatibility_MessageParce_Test is starting-----------------------");

    const K = 1024;
    const M = 1024*1024;
    const G = 1024*1024*1024;
    const T = 1024*1024*1024*1024;
    const P = 1024*1024*1024*1024*1024;
    const CODE_WRITE_BYTEARRAY = 1;
    const CODE_SAME_PROCESS = 1;
    const CODE_WRITE_INTARRAY = 2;
    const CODE_WRITE_FLOATARRAY = 3;
    const CODE_WRITE_SHORTARRAY = 4;
    const CODE_WRITE_LONGARRAY = 5;
    const CODE_WRITE_DOUBLEARRAY = 6;
    const CODE_WRITE_BOOLEANARRAY = 7;
    const CODE_WRITE_CHARARRAY = 8;
    const CODE_WRITE_STRINGARRAY = 9;
    const CODE_WRITE_SHORT = 10;
    const CODE_WRITE_LONG = 11;
    const CODE_WRITE_DOUBLE = 12;
    const CODE_WRITE_BOOLEAN = 13;
    const CODE_WRITE_CHAR = 14;
    const CODE_WRITE_STRING = 15;
    const CODE_WRITE_BYTE = 16;
    const CODE_WRITE_INT = 17;
    const CODE_WRITE_FLOAT = 18;
    const CODE_WRITE_RAWDATA = 19;
    const CODE_WRITE_REMOTEOBJECT = 20;
    const CODE_WRITE_SEQUENCEABLE = 21;
    const CODE_WRITE_NOEXCEPTION = 22;
    const CODE_WRITE_SEQUENCEABLEARRAY = 23;
    const CODE_WRITE_REMOTEOBJECTARRAY = 24;
    const CODE_ALL_TYPE = 25;
    const CODE_ALL_ARRAY_TYPE = 26;
    const CODE_WRITEINT8_ASHMEM = 27;
    const CODE_WRITESEQUENCEABLE = 28;
    const CODE_WRITE_SHORT_MULTI = 29;
    const CODE_WRITE_BYTE_MULTI = 30;
    const CODE_WRITE_INT_MULTI = 31;
    const CODE_IPCSKELETON = 32;
    const CODE_IPCSKELETON_INT = 33;
    const CODE_WRITE_REMOTEOBJECTARRAY_1 = 34;
    const CODE_WRITE_REMOTEOBJECTARRAY_2 = 35;
    const CODE_INTERFACETOKEN = 36;

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

    class TestRemoteObject extends rpc.RemoteObject {
        constructor(descriptor) {
            super(descriptor);
        }
        asObject(){
            return this;
        }
    }

    class TestListener extends rpc.RemoteObject {
        constructor(descriptor, checkResult) {
            super(descriptor);
            this.checkResult = checkResult
        }
        onRemoteRequest(code, data, reply, option) {
            let result = false
            if (code === 1) {
                console.info("onRemoteRequest called, descriptor: " + this.getInterfaceDescriptor())
                result = true
            } else {
                console.info("unknown code: " + code)
            }
            let _checkResult = this.checkResult
            let _num = data.readInt()
            let _str = data.readString()
            setTimeout(function(){
                _checkResult(_num, _str)
            }, 2*1000);
            console.info("result:" + result)
            return result
        }
    }

    class TestAbilityStub extends rpc.RemoteObject {
        constructor(descriptor) {
            super(descriptor)
        }
        onRemoteRequest(code, data, reply, option) {
            console.info("TestAbilityStub: onRemoteRequest called, code: " + code)
            let descriptor = data.readInterfaceToken()
            if (descriptor !== "TestAbilityStub") {
                console.error("received unknown descriptor: " + descriptor)
                return false
            }
            switch (code) {
                case 1:
                {
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
                    data.readSequenceable(s)
                    reply.writeNoException()
                    reply.writeByte(tmp1)
                    reply.writeShort(tmp2)
                    reply.writeInt(tmp3)
                    reply.writeLong(tmp4)
                    reply.writeFloat(tmp5)
                    reply.writeDouble(tmp6)
                    reply.writeBoolean(tmp7)
                    reply.writeChar(tmp8)
                    reply.writeString(tmp9)
                    reply.writeSequenceable(s)
                    return true
                }
                default:
                {
                    console.error("default case, code: " + code)
                    return false
                }
            }
        }
    }

    class MyDeathRecipient {
        constructor(gIRemoteObject, done) {
            this.gIRemoteObject = gIRemoteObject
            this.done = done
        }
        onRemoteDied() {
            console.info("server died")
            expect(this.gIRemoteObject.removeDeathRecipient(this, 0)).assertTrue()
            let _done = this.done
            setTimeout(function() {
                _done()
            }, 1000)
        }
    }

    class TestProxy {
        remote = rpc.RemoteObject;
        constructor(remote) {
            this.remote = remote;
            console.info("test remote")
        }
        asObject() {
            console.info("server remote")
            return this.remote;
        }
    }

    function assertArrayElementEqual(actual, expected) {
        expect(actual.length).assertEqual(expected.length)
        for (let i = 0; i < actual.length; i++) {
            expect(actual[i]).assertEqual(expected[i])
        }
    }

    function sleep(numberMillis){
        var now = new Date();
        var exitTime = now.getTime() + numberMillis;
        while (true) {
            now = new Date();
            if (now.getTime() > exitTime)
                return;
        }
    }

    beforeAll(async function(done) {
        console.info('beforeAll called rpc')
        function deviceManagerCallback(error, deviceManager) {
            console.info("got deviceManager: " + deviceManager + ", error: " + error)
            let deviceList = deviceManager.getTrustedDeviceListSync()
            let deviceId = deviceList[0].deviceId
            console.info("online device id: " + deviceId)

            let want = {
                "bundleName":"ohos.rpc.test.server",
                "abilityName":"ohos.rpc.test.server.ServiceAbility",
                "deviceId":deviceId,
                "flags": 256
            }
            let connect = {
                onConnect:function (elementName, remoteProxy) {
                    console.info('RpcClient: onConnect called,proxy: ' + (remoteProxy instanceof rpc.RemoteProxy))
                    gIRemoteObject = remoteProxy
                    done()
                },
                onDisconnect:function (elementName) {
                    console.info("RpcClient: onDisconnect")
                },
                onFailed:function () {
                    console.info("RpcClient: onFailed")
                    gIRemoteObject = null
                }
            }
            connectId = featureAbility.connectAbility(want, connect)
            connectId.info("connect ability got id: " + connectId)
        }
        deviceManager.createDeviceManager('ohos.rpc.test', deviceManagerCallback)
        console.info("beforeAll done")
    })
    beforeEach(function (){
        console.info(('beforeEach called'))
    })
    afterEach(function (){
        console.info('afterEach called')
    })
    afterAll(function (){
        console.info('afterAll called')
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_00100
     * @tc.name    Call the writeinterfacetoken interface, write the interface descriptor, and read interfacetoken
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_00100", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var token = "hello ruan zong xian";
            var result = data.writeInterfaceToken(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00100:run writeInterfaceToken is "
                + result);
            expect(result == true).assertTrue();
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00100: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00100: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var resultToken = result.reply.readInterfaceToken();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00100:run readInterfaceToken is " + resultToken);
                expect(resultToken).assertEqual(token);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00100:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_00100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_00200
     * @tc.name    The writeInterfaceToken interface is looping, the interface descriptor is written, and the
                    InterfaceToken is read
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_00200", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00200---------------------------");
        try{
            for (let i = 0; i < 5;i++){
                var data = rpc.MessageParcel.create();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00200: create object successfully.");
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                expect(data.writeInterfaceToken("hello dusoftbus")).assertTrue();
                if (gIRemoteObject == undefined){
                    console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00200: gIRemoteObject undefined");
                }
                await gIRemoteObject.sendRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
                    console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00200: sendRequest success, result " + result.errCode);
                    expect(result.errCode == 0).assertTrue();
                    expect(result.reply.readInterfaceToken()).assertEqual(token);
                });
                data.reclaim();
                reply.reclaim();
            }
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00200:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_00200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_00300
     * @tc.name    Call the WriteInterfaceToken interface, write the maximum length interface descriptor, and read
                    the InterfaceToken
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_00300", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var token = "";
            for(let i = 0; i < (40*K - 1); i++){
                token += 'a';
            };
            var result = data.writeInterfaceToken(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00300:run writeInterfaceToken is " + result);
            expect(result == true).assertTrue();
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00300: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00300: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var resultToken = result.reply.readInterfaceToken();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00300:run readInterfaceToken is "
                    + resultToken.length);
                expect(resultToken).assertEqual(token);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00300:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_00300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_00400
     * @tc.name    The WriteInterfaceToken interface is called, the exceeding-length interface descriptor is written,
                    and the InterfaceToken is read
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_00400", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00400: create object successfully.");

            var token = "";
            for(let i = 0; i < 40*K; i++){
                token += 'a';
            };
            var result = data.writeInterfaceToken(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00400:run writeInterfaceToken is "
                + result);
            expect(result).assertEqual(false);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00400:error = " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_00400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_00500
     * @tc.name    Call the writeinterfacetoken interface to write a non string interface descriptor
                   and read interfacetoken
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_00500", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00500: create object successfully.");
            var token = 123;
            var result = data.writeInterfaceToken(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00500:run writeInterfaceToken is "
                + result);
            expect(result).assertEqual(false);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00500: error = " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_00500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_00600
     * @tc.name    Call the writeshortarray interface, write the array to the messageparcel instance,
     *             and call readshortarray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_00600", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wShortArryData = [-1, 0, 1];
            var writeShortArrayResult = data.writeShortArray(wShortArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00600:run writeshortarray is "
                + writeShortArrayResult);
            expect(writeShortArrayResult).assertTrue();
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00600: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00600: result is " + result.errCode);

                var rShortArryData = result.reply.readShortArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00600:run readshortarray is "
                    + rShortArryData);
                assertArrayElementEqual(rShortArryData,wShortArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00600: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_00600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_00700
     * @tc.name    Call the writeshortarray interface, write the short integer array to the messageparcel instance,
     *             and call readshortarray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_00700", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00700: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wShortArryData = [];
            for(let i=0;i<(50*1024 - 1);i++){
                wShortArryData[i] = 1;
            }
            var writeShortArrayResult = data.writeShortArray(wShortArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00700:run writeshortarray is "
                + writeShortArrayResult);
            expect(writeShortArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00700: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00700: result is " + result.errCode);

                var rShortArryData =[];
                result.reply.readShortArray(rShortArryData);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00700:run readshortarray is "
                    + rShortArryData.length);
                assertArrayElementEqual(rShortArryData,wShortArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00700: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_00700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_00800
     * @tc.name    Writeshortarray interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_00800", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00800: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wShortArryData = [-32768, 0, 1, 2, 32767];
            var writeShortArrayResult = data.writeShortArray(wShortArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00800:run writeshortarray is "
                + writeShortArrayResult);
            expect(writeShortArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00800: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00800: result is " + result.errCode);

                var rShortArryData =  result.reply.readShortArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00800:run readshortarray is "
                    + rShortArryData);
                assertArrayElementEqual(rShortArryData,wShortArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00800: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_00800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_00900
     * @tc.name    Writeshortarray interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_00900", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var eShortArryData = [-32769, 32768];
            var eWriteShortArrayResult = data.writeShortArray(eShortArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00900:run  Writeshortarray is "
                + eWriteShortArrayResult);
            expect(eWriteShortArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00900: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00900: result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var reShortArryData = result.reply.readShortArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00900:run readshortarray is "
                    + reShortArryData);
                var erShortArryData = [32767, -32768];
                assertArrayElementEqual(erShortArryData,reShortArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_00900: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_00900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01000
     * @tc.name    Writeshortarray interface, transmission length verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_01000", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01000: create object successfully.");
            var eShortArryData = [];
            for(let i=0;i<50*K;i++){
                eShortArryData[i] = 1;
            };
            var eWriteShortArrayResult = data.writeShortArray(eShortArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01000:run  Writeshortarray is "
                + eWriteShortArrayResult);
            expect(eWriteShortArrayResult).assertEqual(false);

        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01000: error = " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01100
     * @tc.name    Call the writelongarray interface, write the long integer array to the messageparcel instance,
     *             and call readlongarray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_01100", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wLongArryData = [3276826, 123456, 9999999];
            var writeLongArrayResult = data.writeLongArray(wLongArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01100:run writelongarray is "
                + writeLongArrayResult);
            expect(writeLongArrayResult == true).assertTrue();

            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01100: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01100: result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rLongArryData = result.reply.readLongArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01100:run readlongarray is "
                    + rLongArryData);
                assertArrayElementEqual(rLongArryData,wLongArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01100: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01200
     * @tc.name    Call the writelongarray interface, write the long integer array to the messageparcel instance,
     *             and call readlongarray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_01200", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wLongArryData = [];
            for(let i=0;i<(25*K - 1);i++){
                wLongArryData[i] = 11;
            };
            var wLongArrayResult = data.writeLongArray(wLongArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01200:run writelongarray is "
                + wLongArrayResult);
            expect(wLongArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01200: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01200: result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rLongArryData = [];
                result.reply.readLongArray(rLongArryData);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01200:run readlongarray is "
                    + rLongArryData.length);
                assertArrayElementEqual(rLongArryData,wLongArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01200: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01300
     * @tc.name    Writelongarray interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_01300", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wLongArryData = [-9007199254740992, 0, 1, 2, 9007199254740991];
            var wLongArrayResult = data.writeLongArray(wLongArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01300:run writelongarray is "
                + wLongArrayResult);
            expect(wLongArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01300: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01300: result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rLongArryData = [];
                result.reply.readLongArray(rLongArryData);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01300:run readlongarray is "
                    + rLongArryData);
                assertArrayElementEqual(rLongArryData,wLongArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01300: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01400
     * @tc.name    Writelongarray interface, long type precision verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_01400", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01400: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var wLongArryData = [-9999999999999999, 9999999999999999];
            var wLongArrayResult = data.writeLongArray(wLongArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01400:run writelongarray is "
                + wLongArrayResult);
            expect(wLongArrayResult).assertTrue();
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01400: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01400: result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rLongArryData = result.reply.readLongArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01400:run readlongarray is "
                    + rLongArryData);
                let newlongdata = [-10000000000000000,10000000000000000];
                expect(rLongArryData[0]).assertEqual(newlongdata[0]);
                expect(rLongArryData[1]).assertEqual(newlongdata[1]);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01400: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01500
     * @tc.name    Writelongarray Indicates an interface for verifying the input length
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_01500", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01500: create object successfully.");
            var wLongArryData = [];
            for(let i=0;i<25*K;i++){
                wLongArryData[i] = 11;
            };
            var wLongArrayResult = data.writeLongArray(wLongArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01500:run writelongarray is "
                + wLongArrayResult);
            expect(wLongArrayResult).assertEqual(false);

        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01500: error = " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01600
     * @tc.name    Call the writedoublearray interface, write the array to the messageparcel instance,
     *             and call readdoublearra to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_01600", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wDoubleArryData = [1.2, 235.67, 99.76];
            var writeDoubleArrayResult = data.writeDoubleArray(wDoubleArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01600:run writedoublearray is "
                + writeDoubleArrayResult);
            expect(writeDoubleArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01600: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01600: result is " + result.errCode);

                var rDoubleArryData = result.reply.readDoubleArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01600:run readdoublearray is "
                    + rDoubleArryData);

                assertArrayElementEqual(rDoubleArryData, wDoubleArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01600: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01700
     * @tc.name    Call the writedoublearray interface, write the array to the messageparcel instance,
     *             and call readdoublearra (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_01700", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01700: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wDoubleArryData = [];
            for(let i = 0;i < (25*K - 1);i++){
                wDoubleArryData[i] = 11.1;
            };
            var writeDoubleArrayResult = data.writeDoubleArray(wDoubleArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01700:run writedoublearray is "
                + writeDoubleArrayResult);
            expect(writeDoubleArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01700: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01700: result is " + result.errCode);

                var rDoubleArryData = [];
                result.reply.readDoubleArray(rDoubleArryData);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01700:run readdoublearray is "
                    + rDoubleArryData.length);

                assertArrayElementEqual(rDoubleArryData, wDoubleArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01700: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01800
     * @tc.name    Writedoublearray interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_01800", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01800: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wDoubleArryData = [4.9E-324, 235.67, 1.79E+308];
            var writeDoubleArrayResult = data.writeDoubleArray(wDoubleArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01800:run writedoublearray is "
                + writeDoubleArrayResult);
            expect(writeDoubleArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01800: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01800: result is " + result.errCode);

                var rDoubleArryData = result.reply.readDoubleArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01800:run readdoublearray is "
                    + rDoubleArryData);

                assertArrayElementEqual(rDoubleArryData, wDoubleArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01800: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01900
     * @tc.name    Writedoublearray interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_01900", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var eDoubleArryData = [(4.9E-324) - 1, (1.79E+308) + 1];
            var eWriteDoubleArrayResult = data.writeDoubleArray(eDoubleArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01900:run writedoublearray is "
                + eWriteDoubleArrayResult);
            expect(eWriteDoubleArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01900: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01900: result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rDoubleArryData = result.reply.readDoubleArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01900:run readdoublearray is "
                    + rDoubleArryData);
                expect(rDoubleArryData[0]).assertEqual(-1);
                expect(rDoubleArryData[1]).assertEqual(1.79e+308);

            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_01900: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02000
     * @tc.name    Writedoublearray interface, Out-of-bounds value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_02000", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02000: create object successfully.");
            var eDoubleArryData = [];
            for(let i = 0;i < 25*K;i++){
                eDoubleArryData[i] = 11.1;
            }
            var eWriteDoubleArrayResult = data.writeDoubleArray(eDoubleArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02000:run writedoublearray is "
                + eWriteDoubleArrayResult);
            expect(eWriteDoubleArrayResult).assertEqual(false);

        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02000: error = " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02100
     * @tc.name    Call the writebooleanarray interface, write the array to the messageparcel instance,
     *             and call readbooleanarray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_02100", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wBooleanArryData = [true, false, false];
            var writeBooleanArrayResult = data.writeBooleanArray(wBooleanArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02100: run writeboolean is "
                + writeBooleanArrayResult);
            expect(writeBooleanArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02100: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02100: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rBooleanArryData = result.reply.readBooleanArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02100: run readboolean is "
                    + rBooleanArryData);
                assertArrayElementEqual(rBooleanArryData,wBooleanArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02100: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02200
     * @tc.name    Call the writebooleanarray interface, write the array to the messageparcel instance,
     *             and call readbooleanarray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_02200", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wBooleanArryData = [];
            for (let i=0;i<(50*K - 1);i++){
                if (i % 2 == 0){
                    wBooleanArryData[i] = false;
                }else {
                    wBooleanArryData[i] = true;
                }
            }
            var writeBooleanArrayResult = data.writeBooleanArray(wBooleanArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02200: run Writeboolean is "
                + writeBooleanArrayResult);
            expect(writeBooleanArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02200: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02200: sendRequest is " + result.errCode);

                var rBooleanArryData = [];
                result.reply.readBooleanArray(rBooleanArryData);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02200: run readboolean is "
                    + rBooleanArryData.length);
                assertArrayElementEqual(rBooleanArryData,wBooleanArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02200: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02300
     * @tc.name    Writebooleanarray interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_02300", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var errorBooleanArryData = [true, 9, false];
            var errorWriteBooleanArrayResult = data.writeBooleanArray(errorBooleanArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02300: run Writeboolean is "
                + errorWriteBooleanArrayResult);
            expect(errorWriteBooleanArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02300: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02300: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var eCharArrayData = [true, false, false];
                assertArrayElementEqual(result.reply.readBooleanArray(),eCharArrayData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02300: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02400
     * @tc.name    Writebooleanarray Interface for length verification of input parameters
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_02400", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02400: create object successfully.");
            var wBooleanArryData = [];
            for (let i=0;i<50*K;i++){
                if (i % 2 == 0){
                    wBooleanArryData[i] = false;
                }else {
                    wBooleanArryData[i] = true;
                };
            }
            var errorWriteBooleanArrayResult = data.writeBooleanArray(wBooleanArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02400: run Writeboolean is "
                + errorWriteBooleanArrayResult);
            expect(errorWriteBooleanArrayResult).assertEqual(false);

        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02400: error " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02500
     * @tc.name    Call the writechararray interface, write the array to the messageparcel instance,
     *             and call readchararray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_02500", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var wCharArryData = [0,97,255];
            var writeCharArrayResult = data.writeCharArray(wCharArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02500: run writechararray is "
                + writeCharArrayResult);
            expect(writeCharArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02500: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02500: sendRequest is " + result.errCode);

                var rCharArryData = result.reply.readCharArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02500: run readchararray is "
                    + rCharArryData);
                assertArrayElementEqual(rCharArryData,wCharArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02500: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02600
     * @tc.name    Call the writechararray interface, write the array to the messageparcel instance,
     *             and call readchararray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_02600", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wCharArryData = [];
            for(let i=0;i<(50*K - 1);i++){
                wCharArryData[i] = 96;
            };
            var writeCharArrayResult = data.writeCharArray(wCharArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02600: run writechararray is "
                + writeCharArrayResult);
            expect(writeCharArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02600: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02600: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rCharArryData = [];
                result.reply.readCharArray(rCharArryData);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02600: run readchararray is "
                    + rCharArryData.length);
                assertArrayElementEqual(rCharArryData,wCharArryData);
            });

        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02600: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02700
     * @tc.name    Writechararray interface, illegal value validation
     * @tc.desc    Function test
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_02700", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02700: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var errorCharArryData = [96, 'asfgdgdtu', 97];
            var errorWriteCharArrayResult = data.writeCharArray(errorCharArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02700: run Writechararray is "
                + errorWriteCharArrayResult);
            expect(errorWriteCharArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02700: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02700: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var errorWriteCharArrayResult = data.readCharArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02700: run Writechararray is "
                    + errorWriteCharArrayResult);
                var eCharArrayData = [96, 0, 97];
                assertArrayElementEqual(errorWriteCharArrayResult,eCharArrayData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02700: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02800
     * @tc.name    Writechararray Indicates the length of an interface input parameter
     * @tc.desc    Function test
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_02800", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02800: create object successfully.");
            var errorCharArryData = [];
            for(let i=0;i<50*K;i++){
                errorCharArryData[i] = 96;
            };
            var errorWriteCharArrayResult = data.writeCharArray(errorCharArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02800: run Writechararray is "
                + errorWriteCharArrayResult);
            expect(errorWriteCharArrayResult).assertEqual(false);

        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02800: error " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02900
     * @tc.name    Call the writestringarray interface, write the array to the messageparcel instance,
     *             and call readstringarray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_02900", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wStringArryData = ['abc', 'hello', 'beauty'];
            var writeStringArrayResult = data.writeStringArray(wStringArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02900: run writestringarray is "
                + writeStringArrayResult);
            expect(writeStringArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02900: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_STRINGARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02900: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rStringArryData = result.reply.readStringArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02900: run readstringarray is "
                    + rStringArryData);
                assertArrayElementEqual(rStringArryData,wStringArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_02900: error " + error);
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03000
     * @tc.name    Call the writestringarray interface, write the array to the messageparcel instance,
     *             and call readstringarray() to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_03000", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03000: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wStringArryData = [];
            for (let i = 0;i < (10*K - 1);i++){
                wStringArryData[i] = "heddSDF";
            };
            var writeStringArrayResult = data.writeStringArray(wStringArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03000: run writestringarray is "
                + writeStringArrayResult);
            expect(writeStringArrayResult).assertTrue();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03000: run writestringarray is "
                + data.getCapacity());

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03000: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_STRINGARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03000: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rStringArryData = [];
                result.reply.readStringArray(rStringArryData);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03000: run readstringarray is "
                    + rStringArryData.length);
                assertArrayElementEqual(rStringArryData,wStringArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03000: error " + error);
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03100
     * @tc.name    Writestringarray interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_03100", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03100: create object successfully.");

            var errorStringArryData = ['abc' , 123, 'beauty'];
            var errorWriteString = data.writeStringArray(errorStringArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03100: run writeStringArray is "
                + errorWriteString);
            expect(errorWriteString).assertEqual(false);

        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03100: error " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03200
     * @tc.name    writeStringArray Interface for length verification of input parameters
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_03200", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wStringArryData = [];
            for (let i = 0;i < 10 * K;i++){
                wStringArryData[i] = "heddSDF";
            }
            var writeStringArrayResult = data.writeStringArray(wStringArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03200: run writestringarray is "
                + writeStringArrayResult);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03200: run getCapacity is "
                + data.getCapacity());
            expect(writeStringArrayResult).assertEqual(false);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03200: error " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03300
     * @tc.name    Call the writebytearray interface, write the array to the messageparcel instance,
     *             and call readbytearray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_03300", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            let ByteArrayVar = [1, 2, 3, 4, 5];
            var writeByteArrayResult = data.writeByteArray(ByteArrayVar);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03300: run writeByteArray is "
                + writeByteArrayResult);
            expect(writeByteArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03300: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03300: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var shortArryDataReply = result.reply.readByteArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03300: run readByteArray is "
                    + shortArryDataReply);
                assertArrayElementEqual(shortArryDataReply,ByteArrayVar);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03300: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03400
     * @tc.name    Call the writebytearray interface, write the array to the messageparcel instance,
     *             and call readbytearray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_03400", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03400: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            let ByteArrayVar = [-128, 0, 1, 2, 127];
            var writeByteArrayResult = data.writeByteArray(ByteArrayVar);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03400: run writeByteArray is "
                + writeByteArrayResult);
            expect(writeByteArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03400: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03400: sendRequest is " + result.errCode);

                var newArr = new Array(5);
                result.reply.readByteArray(newArr);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03400: run readByteArray is "
                    + newArr);
                assertArrayElementEqual(ByteArrayVar,newArr);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03400: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03500
     * @tc.name    Writebytearray interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_03500", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            let ByteArrayVar = [];
            for (let i=0;i<(40*K - 1);i++){
                ByteArrayVar[i] = 1;

            }
            var writeByteArrayResult = data.writeByteArray(ByteArrayVar);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03500: run writeByteArray is "
                + writeByteArrayResult);
            expect(writeByteArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03500: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03500: sendRequest is " + result.errCode);

                var newArr = new Array(5)
                result.reply.readByteArray(newArr);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03500: run readByteArray is "
                    + newArr.length);
                assertArrayElementEqual(newArr,ByteArrayVar);
            });
            data.reclaim();
            reply.reclaim();
            done();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03500: error " +error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03600
     * @tc.name    Writebytearray interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_03600", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            let ByteArrayVar = [-129, 0, 1, 2, 128];
            var writeByteArrayResult = data.writeByteArray(ByteArrayVar);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03600: run writeByteArray is "
                + writeByteArrayResult);
            expect(writeByteArrayResult).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03600: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03600: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var shortArryDataReply = result.reply.readByteArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03600: run readByteArray is "
                    + shortArryDataReply);
                expect(shortArryDataReply[0] == 127).assertTrue();
                expect(shortArryDataReply[1] == ByteArrayVar[1]).assertTrue();
                expect(shortArryDataReply[2] == ByteArrayVar[2]).assertTrue();
                expect(shortArryDataReply[3] == ByteArrayVar[3]).assertTrue();
                expect(shortArryDataReply[4] == -128).assertTrue();
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03600: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03700
     * @tc.name    Writebytearray Interface，input parameter length verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_03700", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03700: create object successfully.");
            let ByteArrayVar = [];
            for (let i=0;i<40*K;i++){
                ByteArrayVar[i] = 1;
            }

            var writeByteArrayResult = data.writeByteArray(ByteArrayVar);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03700: run writeByteArray is "
                + writeByteArrayResult);
            data.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03700: error " +error);
            expect(error != null).assertTrue();
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03800
     * @tc.name    Call the writeintarray interface, write the array to the messageparcel instance,
     *             and call readintarray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_03800", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03800: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var intArryData = [100, 111, 112];
            var writeIntArrayResult = data.writeIntArray(intArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03800: run writeIntArray is "
                + writeIntArrayResult);
            expect(writeIntArrayResult == true).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03800: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03800: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var shortArryDataReply = result.reply.readIntArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03800: run readByteArray is "
                    + shortArryDataReply);
                assertArrayElementEqual(shortArryDataReply,intArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03800: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03900
     * @tc.name    Call the writeintarray interface, write the array to the messageparcel instance,
     *             and call readintarray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_03900", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var intArryData = [];
            for (let i=0;i<(50*K - 1);i++){
                intArryData[i] = 1;
            };
            var writeIntArrayResult = data.writeIntArray(intArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03900: run writeIntArray is "
                + writeIntArrayResult);
            expect(writeIntArrayResult == true).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03900: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03900: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var newArr = new Array(3)
                result.reply.readIntArray(newArr);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03900: run readIntArray is success, intArryDataReply is "
                    + newArr.length);
                assertArrayElementEqual(newArr,intArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_03900: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04000
     * @tc.name    Writeintarray interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_04000", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04000: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var intArryData = [-2147483648, 0, 1, 2, 2147483647];
            var writeIntArrayResult = data.writeIntArray(intArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04000: run writeIntArray is "
                + writeIntArrayResult);
            expect(writeIntArrayResult).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04000: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04000: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var shortArryDataReply = result.reply.readIntArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04000: run readByteArray is "
                    + shortArryDataReply);
                assertArrayElementEqual(shortArryDataReply,intArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04000: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04100
     * @tc.name    Writeintarray interface, illegal value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_04100", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var intArryData = [-2147483649, 0, 1, 2, 2147483648];
            var writeIntArrayResult = data.writeIntArray(intArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04100: run writeIntArray is "
                + writeIntArrayResult);
            expect(writeIntArrayResult).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04100: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04100: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var shortArryDataReply = result.reply.readIntArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04100: run readByteArray is "
                    + shortArryDataReply);
                expect(shortArryDataReply[0] == 2147483647).assertTrue();
                expect(shortArryDataReply[1] == intArryData[1]).assertTrue();
                expect(shortArryDataReply[2] == intArryData[2]).assertTrue();
                expect(shortArryDataReply[3] == intArryData[3]).assertTrue();
                expect(shortArryDataReply[4] == -2147483648).assertTrue();
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04100: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04200
     * @tc.name    Writeintarray interface, input parameter length verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_04200", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04200: create object successfully.");
            var intArryData = [];
            for (let i=0;i<50*K;i++){
                intArryData[i] = 1;
            }
            var writeIntArrayResult = data.writeIntArray(intArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04200: run writeIntArray is " + writeIntArrayResult);
            expect(writeIntArrayResult).assertEqual(false);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04200: error " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04300
     * @tc.name    Call the writefloatarray interface, write the array to the messageparcel instance,
     *             and call readfloatarray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_04300", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var floatArryData = [1.2, 1.3, 1.4];
            var writeFloatArrayResult = data.writeFloatArray(floatArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04300: run writeFloatArray is "
                + writeFloatArrayResult);
            expect(writeFloatArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04300: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04300: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var floatArryDataReply = result.reply.readFloatArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04300: run readFloatArray is " + floatArryDataReply);
                assertArrayElementEqual(floatArryDataReply,floatArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04300: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04400
     * @tc.name    Call the writefloatarray interface, write the array to the messageparcel instance,
     *             and call readfloatarray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_04400", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04400: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var floatArryData = [1.4E-45, 1.3, 3.4028235E38];
            var writeFloatArrayResult = data.writeFloatArray(floatArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04400: run writeFloatArray is "
                + writeFloatArrayResult);
            expect(writeFloatArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04400: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04400: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var newArr = new Array(3)
                result.reply.readFloatArray(newArr);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04400: readFloatArray is " + newArr);
                assertArrayElementEqual(newArr,floatArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04400: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04500
     * @tc.name    Writefloatarray interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_04500", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var floatArryData = [(1.4E-45) - 1, 1.3, (3.4028235E38) + 1];
            var writeFloatArrayResult = data.writeFloatArray(floatArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04500: run writeFloatArray is "
                + writeFloatArrayResult);
            expect(writeFloatArrayResult).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04500: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04500: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var newArr = result.reply.readFloatArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04500: run readFloatArray is " + newArr);
                expect(newArr[0]).assertEqual(-1);
                expect(newArr[1]).assertEqual(1.3);
                expect(newArr[2]).assertEqual(3.4028235e+38);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04500: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04600
     * @tc.name    Writefloatarray interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_04600", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var floatArryData = [];
            for (let i = 0;i < (25*K - 1);i++){
                floatArryData[i] = 1.1;
            };

            var writeFloatArrayResult = data.writeFloatArray(floatArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04600: run writeFloatArray is " + writeFloatArrayResult);
            expect(writeFloatArrayResult).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04600: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04600: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var newArr = result.reply.readFloatArray();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04600: run readFloatArray is " + newArr.length);
                assertArrayElementEqual(newArr,floatArryData);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04600: error " +error);
            expect(error == null).assertTrue();
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04700
     * @tc.name    Writefloatarray interface, Longest array verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_04700", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04700: create object successfully.");

            var floatArryData = [];
            for (let i = 0;i < (25*K);i++){
                floatArryData[i] = 1.1;
            };

            var writeFloatArrayResult = data.writeFloatArray(floatArryData);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04700: run writeFloatArray is "
                + writeFloatArrayResult);
            expect(writeFloatArrayResult).assertEqual(false);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04700: error " +error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04800
     * @tc.name    Call the writeShort interface to write the short integer data to the messageparcel instance,
     *             and call readshort to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_04800", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04800: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var short = 8;
            var writeShor = data.writeShort(short);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04800: run writeShort success, writeShor is " + writeShor);
            expect(writeShor).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04800: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SHORT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04800: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var readShort = result.reply.readShort();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04800: run readFloatArray is success, readShort is "
                    + readShort);
                assertArrayElementEqual(readShort,short);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04800: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04900
     * @tc.name    WriteShort interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_04900", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeShort(-32768)).assertTrue();
            expect(data.writeShort(0)).assertTrue();
            expect(data.writeShort(1)).assertTrue();
            expect(data.writeShort(2)).assertTrue();
            expect(data.writeShort(32767)).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04900: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04900: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                expect(result.reply.readShort() == -32768).assertTrue();
                expect(result.reply.readShort() == 0).assertTrue();
                expect(result.reply.readShort() == 1).assertTrue();
                expect(result.reply.readShort() == 2).assertTrue();
                expect(result.reply.readShort() == 32767).assertTrue();
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_04900: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05000
     * @tc.name    WriteShort interface, Boundary value minimum value out of bounds verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_05000", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05000: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            let ewriteShort = data.writeShort(-32769);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05000: writeShort is " + ewriteShort);
            expect(ewriteShort).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05000: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05000: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let ereadShort = result.reply.readShort();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05000: readShort is " + ereadShort);
                expect(ereadShort == 32767).assertTrue();
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05000: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05100
     * @tc.name    WriteShort interface, Boundary value maximum value out of bounds verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_05100", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            let ewriteShort = data.writeShort(32768);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05100: writeShort is " + ewriteShort);
            expect(ewriteShort).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05100: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05100: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let ereadShort = result.reply.readShort();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05100: readShort is " + ereadShort);
                expect(ereadShort == -32768).assertTrue();
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05100: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05200
     * @tc.name    Call writelong interface to write long integer data to messageparcel instance
     *             and call readlong to read data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_05200", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var long = 9007199254740991;
            var writelong = data.writeLong(long);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05200: run writeLong success, writelong is " + writelong);
            expect(writelong).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05200: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05200: run sendRequest is "
                    + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var readlong = result.reply.readLong();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05200: run readLong is " + readlong);
                expect(readlong).assertEqual(long);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05200: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05200---------------------------");
    });


    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05300
     * @tc.name    Writelong interface, Verification of maximum accuracy value
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_05300", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var long = -9007199254740992;
            var writelong = data.writeLong(long);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05300: run writeLong success, writelong is " + writelong);
            expect(writelong).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05300: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05300: run sendRequest is "
                    + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var readlong = result.reply.readLong();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05300: run readLong is " + readlong);
                expect(readlong == long).assertTrue();
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05300: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05400
     * @tc.name    Writelong interface, Minimum loss accuracy verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_05400", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05400: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var long = -9223372036854775300;
            var writelong = data.writeLong(long);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05400: run writeLong success, writelong is " + writelong);
            expect(writelong).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05400: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05400: run sendRequest is "
                    + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var readlong = result.reply.readLong();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05400: run readLong is " + readlong);
                expect(readlong).assertEqual(-9223372036854776000);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05400: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05500
     * @tc.name    Writelong interface,Maximum loss accuracy verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_05500", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var short = 9223372036854775300;
            var writelong = data.writeLong(short);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05500: run writeLong success, writelong is " + writelong);
            expect(writelong).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05500: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05500: run sendRequest is "
                    + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var readlong = result.reply.readLong();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05500: run readLong is " + readlong);
                expect(readlong).assertEqual(-9223372036854776000)
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05500: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05600
     * @tc.name    Call the parallel interface to read and write data to the double instance
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_05600", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 4.9E-324;
            var result = data.writeDouble(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05600:run writeDouble is " + result);
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05600: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05600: run sendRequest is "
                    + result.errCode);
                var replyReadResult = reply.readDouble();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05600: run replyReadResult is " + replyReadResult);
                expect(replyReadResult).assertEqual(token);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05600:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05700
     * @tc.name    Writedouble interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_05700", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05700: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 1.79E+308;
            var result = data.writeDouble(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05700:run writeDouble is " + result);
            expect(result).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05700: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05700: run sendRequest is "
                    + result.errCode);
                var replyReadResult = reply.readDouble();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05700: run replyReadResult is success,replyReadResult is "
                    + replyReadResult);
                expect(replyReadResult).assertEqual(token);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05700:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05800
     * @tc.name    Writedouble interface, Minimum boundary value out of bounds verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_05800", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05800: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = (4.9E-324) - 1;
            var result = data.writeDouble(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05800:run writeDouble is " + result);
            expect(result).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05800: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05800: run sendRequest is "
                    + result.errCode);
                var replyReadResult = reply.readDouble();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05800: run replyReadResult is success,replyReadResult is "
                    + replyReadResult);
                expect(replyReadResult).assertEqual(-1);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05800:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05900
     * @tc.name    Writedouble interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_05900", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05900: create object successfully.");
            var token = "1.79E+465312156";
            var result = data.writeDouble(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05900:run writeDouble is " + result);

            data.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_05900:error = " + error);
            expect(error != null).assertTrue();
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06000
     * @tc.name    Call the writeboolean interface to write the data to the messageparcel instance,
     *             and call readboolean to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_06000", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06000: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = true;
            var result = data.writeBoolean(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06000:run writeBoolean is " + result);
            expect(result == true).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06000: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEAN, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06000: run sendRequest is "
                    + result.errCode);
                var replyReadResult = result.reply.readBoolean();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06000: run readBoolean is success,result is "
                    + replyReadResult);
                expect(replyReadResult).assertEqual(token);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06000:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06100
     * @tc.name    Call the writeboolean interface to write the data to the messageparcel instance,
     *             and call readboolean to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_06100", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = false;
            var result = data.writeBoolean(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06100:run writeBoolean is " + result);
            expect(result == true).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06100: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEAN, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06100: run sendRequest is "
                    + result.errCode);
                var replyReadResult = result.reply.readBoolean();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06100: run readBoolean is success,result is "
                    + replyReadResult);
                expect(replyReadResult).assertEqual(token);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06100:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06200
     * @tc.name    Writeboolean interface, illegal value number type verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_06200", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06200: create object successfully.");
            var token = 9;
            var result = data.writeBoolean(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06200:run writeBoolean is " + result);
            expect(result).assertEqual(false);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06200:error = " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06300
     * @tc.name    Writeboolean interface, illegal value string type verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_06300", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06300: create object successfully.");
            var token = "true";
            var result = data.writeBoolean(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06300:run writeBoolean is " + result);
            expect(result).assertEqual(false);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06300:error = " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06400
     * @tc.name    Call the writechar interface to write the minimum data to the messageparcel instance,
     *               and call readchar to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_06400", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06400: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 0;
            var result = data.writeChar(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06400:run writeChar is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06400: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06400: sendRequest is " + result.errCode);
                var replyReadResult = result.reply.readChar();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06400: run readChar is success,result is "
                    + replyReadResult);
                expect(replyReadResult).assertEqual(token);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06400:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06500
     * @tc.name    Call the writechar interface to write the maximum data to the messageparcel instance,
     *               and call readchar to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_06500", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 255;
            var result = data.writeChar(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06500:run writeChar is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06500: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06500: sendRequest is " + result.errCode);
                var replyReadResult = result.reply.readChar();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06500: run readChar is success,result is "
                    + replyReadResult);
                expect(replyReadResult).assertEqual(token);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06500:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06600
     * @tc.name    Call the writechar interface to write the minimum out of range data to the messageparcel instance,
     *              and call readchar to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_06600", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = -1;
            var result = data.writeChar(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06600:run writeChar is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06600: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06600: sendRequest is " + result.errCode);
                var replyReadResult = result.reply.readChar();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06600: run readChar is success,result is "
                    + replyReadResult);
                expect(replyReadResult).assertEqual(255);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06600:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06700
     * @tc.name    Call the writechar interface to write the maximum out of range data to the messageparcel instance,
     *              and call readchar to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_06700", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06700: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 256;
            var result = data.writeChar(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06700:run writeChar is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06700: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06700: sendRequest is " + result.errCode);
                var replyReadResult = result.reply.readChar();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06700: run readChar is successresult is "
                    + replyReadResult);
                expect(replyReadResult).assertEqual(0);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06700:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06800
     * @tc.name    Writechar interface, illegal value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_06800", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06800: create object successfully.");
            var token = 'ades';
            var result = data.writeChar(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06800:run writeChar is " + result);

        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06800:error = " + error);
            expect(error != null).assertTrue()
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06900
     * @tc.name    Call the writestring interface to write the data to the messageparcel instance,
     *             and call readstring() to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_06900", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = '';
            for(var i = 0; i < (40*K - 1); i++){
                token += 'a';
            };
            var result = data.writeString(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06900:run writeString is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06900: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06900: sendRequest is " + result.errCode);
                var replyReadResult = result.reply.readString();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06900: run readString is success,result is "
                    + replyReadResult.length);
                expect(replyReadResult).assertEqual(token);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_06900:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07000
     * @tc.name    Writestring interface Maximum data out of range verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_07000", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07000: create object successfully.");
            var token = '';
            for(var i = 0; i < 40*K; i++){
                token += 'a';
            };
            var result = data.writeString(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07000:run writeString is " + result);
            expect(result).assertEqual(false);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07000:error = " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07100
     * @tc.name    Writestring interface, illegal value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_07100", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07100: create object successfully.");
            var token = 123;
            var result = data.writeString(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07100:run writeString is " + result);
            expect(result).assertEqual(false);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07100:error = " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07200
     * @tc.name    Call the writebyte interface to write data to the messageparcel instance,
     *             and call readbyte to read data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_07200", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 2;
            var result = data.writeByte(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07200:run writeByte is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07200: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07200: sendRequest is " + result.errCode);
                var replyReadResult = result.reply.readByte();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07200: run readByte is " + replyReadResult);
                expect(replyReadResult).assertEqual(token);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07200:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07300
     * @tc.name    Writebyte interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_07300", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            expect(data.writeByte(128)).assertTrue();
            expect(data.writeByte(0)).assertTrue();
            expect(data.writeByte(1)).assertTrue();
            expect(data.writeByte(2)).assertTrue();
            expect(data.writeByte(127)).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07300: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BYTE_MULTI, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07300: sendRequest is " + result.errCode);

                expect(reply.readByte()).assertEqual(-128);
                expect(reply.readByte()).assertEqual(0);
                expect(reply.readByte()).assertEqual(1);
                expect(reply.readByte()).assertEqual(2);
                expect(reply.readByte()).assertEqual(127);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07300:error = " + error);
        }
        data.reclaim()
        reply.reclaim()
        done()
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07400
     * @tc.name    Writebyte interface, Maximum boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_07400", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07400: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var ywriteByte = data.writeByte(-129);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07400: writeByte success,result is" + ywriteByte);
            expect(ywriteByte).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07400: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07400: sendRequest is " + result.errCode);
                var yreadByte = data.readByte();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07400: writeByte success,result is" + yreadByte);
                expect(yreadByte).assertEqual(127);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07400:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07500
     * @tc.name    Writebyte interface, Minimum boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_07500", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var ywriteByte = data.writeByte(128);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07500: writeByte success,result is" + ywriteByte);
            expect(ywriteByte).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07500: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07500: sendRequest is " + result.errCode);
                var yreadByte = data.readByte();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07500: writeByte success,result is" + yreadByte);
                expect(yreadByte).assertEqual(-128);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07500:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07600
     * @tc.name    Writebyte interface, illegal value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_07600", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07600: create object successfully.");
            var ywriteByte = data.writeByte("error");
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07600: writeByte success,result is" + ywriteByte);
            expect(ywriteByte).assertEqual(false);

        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07600:error = " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07700
     * @tc.name    Call the writeint interface to write the data to the messageparcel instance,
     *             and call readint to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_07700", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07700: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 2;
            var result = data.writeInt(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07700:run writeInt is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07700: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07700: sendRequest is " + result.errCode);
                var replyReadResult = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07700: run readInt is " + replyReadResult);
                expect(replyReadResult).assertEqual(token);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07700:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07800
     * @tc.name    Writeint interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_07800", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07800: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            expect(data.writeInt(-2147483648)).assertTrue();
            expect(data.writeInt(0)).assertTrue();
            expect(data.writeInt(1)).assertTrue();
            expect(data.writeInt(2)).assertTrue();
            expect(data.writeInt(2147483647)).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07800: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07800: sendRequest is " + result.errCode);
                expect(result.reply.readInt()).assertEqual(-2147483648);
                expect(result.reply.readInt()).assertEqual(0);
                expect(result.reply.readInt()).assertEqual(1);
                expect(result.reply.readInt()).assertEqual(2);
                expect(result.reply.readInt()).assertEqual(2147483647);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07800:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07900
     * @tc.name    Writeint interface, Verification of minimum boundary overrun value
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_07900", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var  ywriteInt = data.writeInt(-2147483649);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07900: writeInt is " + ywriteInt);
            expect(ywriteInt).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07900: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07900: sendRequest is " + result.errCode);
                var yreadInt = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07900: readInt is " + yreadInt);
                expect(yreadInt).assertEqual(2147483647);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_07900:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08000
     * @tc.name    Writeint interface, Verification of maximum boundary overrun value
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_08000", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08000: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var  ywriteInt = data.writeInt(2147483648);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08000: writeInt is " + ywriteInt);
            expect(ywriteInt).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08000: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08000: sendRequest is " + result.errCode);
                var yreadInt = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08000: readInt is " + yreadInt);
                expect(yreadInt).assertEqual(-2147483648);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08000:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08100
     * @tc.name    Writeint interface, illegal value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_08100", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08100: create object successfully.");
            var  ywriteInt = data.writeInt("error");
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08100: writeInt is " + ywriteInt);
            expect(ywriteInt).assertEqual(false);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08100:error = " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08200
     * @tc.name    Call the writefloat interface to write data to the messageparcel instance,
     *             and call readfloat to read data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_08200", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 2.2;
            var result = data.writeFloat(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08200:run writeDouble is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08200: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08200: sendRequest is " + result.errCode);
                var replyReadResult = result.reply.readFloat();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08200: run readFloat is " + replyReadResult);
                expect(replyReadResult).assertEqual(token);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08200:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08300
     * @tc.name    Writefloat interface, Minimum boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_08300", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 1.4E-45;
            var result = data.writeFloat(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08300:run writeFloat is " + result);
            expect(result).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08300: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08300: sendRequest is " + result.errCode);
                var newReadResult = result.reply.readFloat();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08300: readFloat result is " + newReadResult);
                expect(newReadResult).assertEqual(token);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08300:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08400
     * @tc.name    Writefloat interface, Maximum boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_08400", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08400: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 3.4028235E38;
            var result = data.writeFloat(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08400:run writeFloat is "+ result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08400: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08400: sendRequest is " + result.errCode);
                var newReadResult = result.reply.readFloat();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08400: readFloat result is " + newReadResult);
                expect(newReadResult).assertEqual(token);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08400:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08500
     * @tc.name    Writefloat interface, Verification of maximum boundary overrun value
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_08500", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = (3.4028235E38) + 1;
            var result = data.writeFloat(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08500:run writeFloat is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08500: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08500: sendRequest is " + result.errCode);

                var newReadResult = result.reply.readFloat();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08500: readFloat result is " + newReadResult);
                expect(newReadResult).assertEqual(3.4028235e+38);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08500:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08600
     * @tc.name    Writefloat interface, Verification of minimum boundary overrun value
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_08600", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = (1.4E-45) - 1;
            var result = data.writeFloat(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08600:run writeFloat is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08600: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08600: sendRequest is " + result.errCode);
                var newReadResult = result.reply.readFloat();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08600: readFloat result is " + newReadResult);
                expect(newReadResult).assertEqual(-1);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08600:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08700
     * @tc.name    Writefloat interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_08700", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08700: create object successfully.");
            var token = 'a';
            var result = data.writeFloat(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08700:run writeFloat is " + result);
            expect(result).assertEqual(false);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08700:error = " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08800
     * @tc.name    Call the getRawDataCapacity interface to get the maximum amount of raw data that a MessageParcel
                     can hold
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_08800", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08800---------------------------");
        try{
            let parcel = new rpc.MessageParcel();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08800: create object successfully.");
            let reply = new rpc.MessageParcel();
            let option = new  rpc.MessageOption();
            let Capacity = parcel.getRawDataCapacity();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08800:run Capacity success, Capacity is " + Capacity);
            expect(Capacity).assertEqual(128*M);
            expect(parcel.writeIntArray([1, 2, 3, 4, 5])).assertTrue();
            let Capacity1 = parcel.getRawDataCapacity();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08800:run Capacity is " + Capacity1);
            expect(Capacity1).assertEqual(128*M);
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08800: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, parcel, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08800: sendRequest is " + result.errCode);
                let reCapacity = parcel.getRawDataCapacity();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08800:run Capacity, Capacity is " + reCapacity);
                expect(reCapacity).assertEqual(128*M);
                assertArrayElementEqual(result.reply.readIntArray(),[1, 2, 3, 4, 5]);
                let reCapacity1 = parcel.getRawDataCapacity();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08800:run Capacity, Capacity is " + reCapacity1);
                expect(reCapacity).assertEqual(128*M);
            });
            parcel.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08800:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08800---------------------------");
    });

    /*
    * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08900
    * @tc.name    Test messageparcel to deliver rawdata data
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_08900", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08900---------------------------");
        try{
            let parcel = new rpc.MessageParcel();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08900: create object successfully.");
            let reply = new rpc.MessageParcel();
            let option = new rpc.MessageOption();
            let arr = [1, 2, 3, 4, 5];
            expect(parcel.writeInt(arr.length)).assertTrue();
            let isWriteSuccess = parcel.writeRawData(arr, arr.length);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08900: parcel writeRawData is : " + isWriteSuccess);
            expect(isWriteSuccess).assertTrue();
            let Capacity = parcel.getRawDataCapacity()
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08900:run Capacity, Capacity is " + Capacity);
            expect(Capacity).assertEqual(128*M);
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08900: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_RAWDATA, parcel, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08900: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let size = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08900:run readInt is " + size);
                expect(size).assertEqual(arr.length);
                let reCapacity = parcel.getRawDataCapacity()
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08900:run Capacity, Capacity is " + reCapacity);
                expect(reCapacity).assertEqual(128*M);
                let newReadResult = result.reply.readRawData(size);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08900:run readRawData, result is " + newReadResult);
                assertArrayElementEqual(newReadResult,arr);
            });
            parcel.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_08900:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08900---------------------------");
    });

    /*
    * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09000
    * @tc.name    Test messageparcel to pass abnormal rawdata data, and expand the capacity for verification
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_09000", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09000---------------------------");
        try{
            let parcel = new rpc.MessageParcel();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09000: create object successfully.");
            let reply = new rpc.MessageParcel();
            let option = new rpc.MessageOption();
            let arr = [1, 2, 3, 4, 5];
            expect(parcel.writeInt(arr.length + 1)).assertTrue();
            let isWriteSuccess = parcel.writeRawData(arr, (arr.length + 1));
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09000: parcel write raw data is : " + isWriteSuccess);
            expect(isWriteSuccess).assertTrue();
            let Capacity = parcel.getRawDataCapacity()
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09000:run Capacity, Capacity is " + Capacity);
            expect(Capacity).assertEqual(128*M);
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09000: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_RAWDATA, parcel, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09000: result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let size = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09000:run readInt, result is " + size);
                expect(size).assertEqual(arr.length + 1);
                let reCapacity = parcel.getRawDataCapacity()
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09000:run Capacity, Capacity is " + reCapacity);
                expect(reCapacity).assertEqual(128*M);
                let newReadResult = result.reply.readRawData(size);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09000:run readRawData, result is " + newReadResult);
                expect(arr[0]).assertEqual(newReadResult[0]);
                expect(arr[1]).assertEqual(newReadResult[1]);
                expect(arr[2]).assertEqual(newReadResult[2]);
                expect(arr[3]).assertEqual(newReadResult[3]);
                expect(arr[4]).assertEqual(newReadResult[4]);
            });
            parcel.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09000:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09000---------------------------");
    });

    /*
    * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09100
    * @tc.name    Test messageparcel to pass exception rawdata data data interception verification
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_09100", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09100---------------------------");
        try{
            let parcel = new rpc.MessageParcel();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09100: create object successfully.");
            let reply = new rpc.MessageParcel();
            let option = new rpc.MessageOption();
            let arr = [1, 2, 3, 4, 5];
            expect(parcel.writeInt(arr.length - 1)).assertTrue();
            let isWriteSuccess = parcel.writeRawData(arr, (arr.length - 1));
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09100: parcel writeRawData result is : " + isWriteSuccess);
            expect(isWriteSuccess).assertTrue();
            let Capacity = parcel.getRawDataCapacity()
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09100:run Capacity, Capacity is " + Capacity);
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09100: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_RAWDATA, parcel, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09100: result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let size = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09100:run readInt, result is " + size);
                expect(size).assertEqual(arr.length - 1);
                let reCapacity = parcel.getRawDataCapacity()
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09100:run Capacity, Capacity is" + reCapacity);
                let newReadResult = result.reply.readRawData(size);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09100:run readRawData, result is" + newReadResult);
                expect(arr[0]).assertEqual(newReadResult[0]);
                expect(arr[1]).assertEqual(newReadResult[1]);
                expect(arr[2]).assertEqual(newReadResult[2]);
                expect(arr[3]).assertEqual(newReadResult[3]);
            });
            parcel.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09100:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09100---------------------------");
    });

    /*
    * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09200
    * @tc.name    Test messageParcel to deliver out-of-bounds RawData data
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_09200", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09200---------------------------");
        try{
            let parcel = new rpc.MessageParcel();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09200: create object successfully.");
            let reply = new rpc.MessageParcel();
            let option = new rpc.MessageOption();
            let arr = [-129, 2, 3, 4, 128];
            expect(parcel.writeInt(arr.length)).assertTrue();
            let isWriteSuccess = parcel.writeRawData(arr, arr.length);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09200: parcel writeRawData is : " + isWriteSuccess);
            expect(isWriteSuccess).assertTrue();
            let Capacity = parcel.getRawDataCapacity()
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09200:run Capacity, Capacity is " + Capacity);
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09200: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_RAWDATA, parcel, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09200: result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let size = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09200:run readInt, result is " + size);
                expect(size).assertEqual(arr.length);
                let reCapacity = parcel.getRawDataCapacity()
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09200:run Capacity, Capacity is " + reCapacity);
                let newReadResult = result.reply.readRawData(size);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09200:run readRawData, result is " + newReadResult);
                assertArrayElementEqual(newReadResult,arr);
            });
            parcel.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09200:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09200---------------------------");
    });

    /*
    * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09300
    * @tc.name    Test messageParcel to deliver illegal RawData data
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_09300", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09300---------------------------");
        try{
            let parcel = new rpc.MessageParcel();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09300: create object successfully.");
            let arr = ["aaa", 1, 2, 3];
            expect(parcel.writeInt(arr.length)).assertTrue();
            let isWriteSuccess = parcel.writeRawData(arr, arr.length);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09300: parcel writeRawData is : " + isWriteSuccess);
            expect(isWriteSuccess).assertTrue();
            let Capacity = parcel.getRawDataCapacity()
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09300:run Capacity success is " + Capacity);
            expect(Capacity).assertEqual(128*M);
            parcel.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09300:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09400
     * @tc.name    Call the writeremoteobject interface to serialize the remote object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_09400", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09400---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09400: create object successfully.");
            let testRemoteObject = new TestRemoteObject("testObject");
            let result = data.writeRemoteObject(testRemoteObject);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09400: writeRemoteObject result is " + result);
            expect(result).assertTrue();
            let reobject = data.readRemoteObject();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09400: readRemoteObject result is " + reobject);
            expect( reobject != null).assertTrue();
            data.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09400:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09500
     * @tc.name    Call the writeremoteobject interface to serialize the remote object and pass in the empty object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_09500", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09500: create object successfully.");
            var token = new TestRemoteObject(null);
            var result = data.writeRemoteObject(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09500: result is " + result);
            expect(result).assertEqual(false);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09500:error = " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09600
     * @tc.name    Call the writeremoteobject interface to serialize the remote object and pass in the constructor object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_09600", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09600: create object successfully.");
            var token = {}
            var result = data.writeRemoteObject(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09600: result is " + result);
            expect(result).assertEqual(false);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09600:error = " + error);
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09700
     * @tc.name    Call the writesequenceable interface to write the custom serialized
     *             object to the messageparcel instance
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_09700", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09700: create object successfully.");
            let sequenceable = new MySequenceable(1, "aaa");
            let result = data.writeSequenceable(sequenceable);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09700: writeSequenceable is " + result);
            let ret = new MySequenceable(0, "");
            let result2 = data.readSequenceable(ret);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09700: readSequenceable is " + result2);
            expect(result2).assertTrue();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09700:error = " + error);
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09800
     * @tc.name    Call the writesequenceable interface to write the custom serialized
     *             object to the messageparcel instance, Migration to read
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_09800", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09800: create object successfully.");
            let sequenceable = new MySequenceable(1, "aaa");
            let result = data.writeSequenceable(sequenceable);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09800: writeSequenceable is " + result);
            let ret = new MySequenceable(1, "");
            let result2 = data.readSequenceable(ret);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09800: readSequenceable is " + result2);
            expect(result2).assertTrue();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09800:error = " + error);
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09900
     * @tc.name    After the server finishes processing, write noexception first before writing the result,
     *             and the client calls readexception to judge whether the server is abnormal
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_09900", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            data.writeNoException();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09900: run writeNoException success");
            expect(data.writeInt(6)).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09900: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_NOEXCEPTION, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09900: sendRequest is " + result.errCode);
                result.reply.readException()
                var replyData = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09900: readResult is " + replyData);
                expect(replyData).assertEqual(6);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_09900:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_10000
     * @tc.name    If the data on the server is abnormal, the client calls readexception
     *             to judge whether the server is abnormal
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_10000", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10000: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            data.writeNoException();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10000: run writeNoException success");
            expect(data.writeInt(1232222223444)).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10000: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_NOEXCEPTION, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10000: sendRequest is " + result.errCode);
                result.reply.readException()
                var replyData = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10000: readResult is " + replyData);
                expect(replyData != 1232222223444).assertTrue();
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10000:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_10000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_10100
     * @tc.name    Serializable object marshaling and unmarshalling test
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_10100", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var sequenceable = new MySequenceable(1, "aaa");
            var result = data.writeSequenceable(sequenceable);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10100: writeSequenceable is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10100: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLE, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10100: sendRequest is " + result.errCode);
                var s = new MySequenceable(null,null)
                var resultReply = result.reply.readSequenceable(s);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10100: run readSequenceable is " + resultReply);
                expect(s.str).assertEqual(sequenceable.str);
                expect(s.num).assertEqual(sequenceable.num);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10100:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_10100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_10200
     * @tc.name    Non serializable object marshaling test
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_10200", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var sequenceable = new MySequenceable(1, 1);
            expect(data.writeSequenceable(sequenceable)).assertEqual(false);
        } catch (error) {
            expect(error == null).assertTrue();
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_10200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_10300
     * @tc.name    The server did not send a serializable object, and the client was ungrouped
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_10300", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var sequenceable = 10;
            var result = data.writeInt(sequenceable);
            console.info("RpcClient: writeInt is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10300: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10300: sendRequest is " + result.errCode);
                var s = new MySequenceable(0,null)
                var replyReadResult = result.reply.readSequenceable(s);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10300: run,result is " + replyReadResult);
                expect(replyReadResult).assertTrue();
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10300:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_10300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_10400
     * @tc.name    Call the writesequenceable interface to write the custom serialized object to the
     *             messageparcel instance, and call readsequenceable to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_10400", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10400: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var sequenceable = new MySequenceable(2, "abc");
            var result = data.writeSequenceable(sequenceable);
            console.info("RpcClient: writeSequenceable is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10400: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLE, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10400: sendRequest is " + result.errCode);
                var s = new MySequenceable(null,null)
                var replyReadResult = result.reply.readSequenceable(s);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10400: run readSequenceable is success," +
                    "result is " + replyReadResult);
                expect(s.str).assertEqual(sequenceable.str);
                expect(s.num).assertEqual(sequenceable.num);
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10400:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_10400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_10500
     * @tc.name    Call the writesequenceablearray interface to write the custom serialized object array (1, 2, 3) to
     *              the messageparcel instance, and call readsequenceablearray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_10500", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var sequenceable = [new MySequenceable(1, "aaa"),
                new MySequenceable(2, "bbb"), new MySequenceable(3, "ccc")];
            var result = data.writeSequenceableArray(sequenceable);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10500: writeSequenceableArray is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10500: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLEARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10500: sendRequest is " + result.errCode);
                var s = [new MySequenceable(null, null), new MySequenceable(null, null),
                    new MySequenceable(null, null)];
                result.reply.readSequenceableArray(s);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10500: run readSequenceableArray is success.");
                for (let i = 0; i < s.length; i++) {
                    expect(s[i].str).assertEqual(sequenceable[i].str)
                    expect(s[i].num).assertEqual(sequenceable[i].num)
                }
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10500:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_10500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_10600
     * @tc.name    Call the writesequenceablearray interface to write the custom serialized object to the
     *             messageparcel instance, and call readsequenceablearray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_10600", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var sequenceable = [new MySequenceable(4, "abc"),
                new MySequenceable(5, "bcd"), new MySequenceable(6, "cef")];
            var result = data.writeSequenceableArray(sequenceable);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10600: writeSequenceable is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10600: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLEARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10600: sendRequest is " + result.errCode);
                var s = [new MySequenceable(null, null),
                    new MySequenceable(null, null), new MySequenceable(null, null)]
                result.reply.readSequenceableArray(s);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10600: run readSequenceableArray is success.");
                for (let i = 0; i < s.length; i++) {
                    expect(s[i].str).assertEqual(sequenceable[i].str)
                    expect(s[i].num).assertEqual(sequenceable[i].num)
                }
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10600:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_10600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_10700
     * @tc.name    Call the writesequenceablearray interface to write the custom
     *             serialized object to the messageparcel instance
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_10700", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10700: create object successfully.");
            var sequenceable = 1;
            var result = data.writeSequenceableArray(sequenceable);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10700: writeSequenceable is " + result);
            expect(result).assertEqual(false);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10700:error = " + error);
            expect(error != null).assertTrue();
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_10700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_10800
     * @tc.name    Call the writeremoteobjectarray interface to write the object array to the messageparcel
     *             instance, and call readremoteobjectarray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_10800", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10800---------------------------");
        try{
            let count = 0
            function checkResult(num, str) {
                expect(num).assertEqual(123)
                expect(str).assertEqual("rpcListenerTest")
                count++
                console.info("check result done, count: " + count)
                if (count == 3) {
                    done()
                }
            }

            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10800: create object successfully.");
            let reply = rpc.MessageParcel.create();
            let option = new rpc.MessageOption();
            expect(data.writeInterfaceToken("rpcTestAbility")).assertTrue()
            let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)];
            let result = data.writeRemoteObjectArray(listeners);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10800: writeRemoteObjectArray is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10800: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECTARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10800: sendRequest is " + result.errCode);
                expect(result.errCode).assertEqual(0);
                expect(result.code).assertEqual(CODE_WRITE_REMOTEOBJECTARRAY);
                expect(result.data).assertEqual(data);
                expect(result.reply).assertEqual(reply);
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10800:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_10800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_10900
     * @tc.name    Call the writeremoteobjectarray interface to write the object array to the messageparcel instance,
     *             and call readremoteobjectarray (objects: iremoteobject []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_10900", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10900---------------------------");
        try{
            let count = 0
            function checkResult(num, str) {
                expect(num).assertEqual(123)
                expect(str).assertEqual("rpcListenerTest")
                count++;
                console.info("check result done, count: " + count)
                if (count == 3) {
                    done()
                }
            }
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10900: create object successfully.");
            let reply = rpc.MessageParcel.create();
            let option = new rpc.MessageOption();
            expect(data.writeInterfaceToken("rpcTestAbility")).assertTrue()
            let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)];
            let result = data.writeRemoteObjectArray(listeners);
            console.info("RpcClient: writeRemoteObjectArray is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10900: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECTARRAY, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10900: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10900:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_10900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11000
     * @tc.name    Test messageparcel to deliver the reply message received in promise across processes
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_11000", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11000: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeByte(2)).assertTrue()
            expect(data.writeShort(3)).assertTrue()
            expect(data.writeInt(4)).assertTrue()
            expect(data.writeLong(5)).assertTrue()
            expect(data.writeFloat(1.2)).assertTrue()
            expect(data.writeDouble(10.2)).assertTrue()
            expect(data.writeBoolean(true)).assertTrue()
            expect(data.writeChar(97)).assertTrue()
            expect(data.writeString("HelloWorld")).assertTrue()
            expect(data.writeSequenceable(new MySequenceable(1, "aaa"))).assertTrue()
            await gIRemoteObject.sendRequest(CODE_ALL_TYPE, data, reply, option).then((result) => {
                console.info("sendRequest done, error code: " + result.errCode)
                expect(result.errCode).assertEqual(0)
                expect(result.reply.readByte()).assertEqual(2)
                expect(result.reply.readShort()).assertEqual(3)
                expect(result.reply.readInt()).assertEqual(4)
                expect(result.reply.readLong()).assertEqual(5)
                expect(result.reply.readFloat()).assertEqual(1.2)
                expect(result.reply.readDouble()).assertEqual(10.2)
                expect(result.reply.readBoolean()).assertTrue()
                expect(result.reply.readChar()).assertEqual(97)
                expect(result.reply.readString()).assertEqual("HelloWorld")
                let s = new MySequenceable(0, "")
                expect(result.reply.readSequenceable(s)).assertTrue()
                expect(s.num).assertEqual(1)
                expect(s.str).assertEqual("aaa")
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11000:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11100
     * @tc.name    Test the cross process delivery of messageparcel and receive the reply message
     *             in the callback function
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_11100", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeByte(2)).assertTrue()
            expect(data.writeShort(3)).assertTrue()
            expect(data.writeInt(4)).assertTrue()
            expect(data.writeLong(5)).assertTrue()
            expect(data.writeFloat(1.2)).assertTrue()
            expect(data.writeDouble(10.2)).assertTrue()
            expect(data.writeBoolean(true)).assertTrue()
            expect(data.writeChar(97)).assertTrue()
            expect(data.writeString("HelloWorld")).assertTrue()
            expect(data.writeSequenceable(new MySequenceable(1, "aaa"))).assertTrue()


            function sendRequestCallback(result) {
                try{
                    console.info("sendRequest Callback")
                    console.info("sendRequest done, error code: " + result.errCode)
                    expect(result.errCode).assertEqual(0)
                    expect(result.reply.readByte()).assertEqual(2)
                    expect(result.reply.readShort()).assertEqual(3)
                    expect(result.reply.readInt()).assertEqual(4)
                    expect(result.reply.readLong()).assertEqual(5)
                    expect(result.reply.readFloat()).assertEqual(1.2)
                    expect(result.reply.readDouble()).assertEqual(10.2)
                    expect(result.reply.readBoolean()).assertTrue()
                    expect(result.reply.readChar()).assertEqual(97)
                    expect(result.reply.readString()).assertEqual("HelloWorld")
                    let s = new MySequenceable(null, null)
                    expect(result.reply.readSequenceable(s)).assertTrue()
                    expect(s.num).assertEqual(1)
                    expect(s.str).assertEqual("aaa")
                } finally {
                    result.data.reclaim();
                    result.reply.reclaim();
                    console.info("test done")
                    done()
                }
            }
            console.info("start send request")
            await gIRemoteObject.sendRequest(CODE_ALL_TYPE, data, reply, option, sendRequestCallback)

        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11100:error = " + error);
        }
        console.info("--------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11100--------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11200
     * @tc.name    Test the cross process transmission of messageparcel.
     *             After receiving the reply message in promise, read various types of arrays in order
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_11200", 0,async function(done){
        console.info("--------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11200--------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeByteArray([1, 2, 3])).assertTrue();
            expect(data.writeShortArray([4, 5, 6])).assertTrue()
            expect(data.writeIntArray([7, 8, 9])).assertTrue()
            expect(data.writeLongArray([10, 11, 12])).assertTrue()
            expect(data.writeFloatArray([1.1, 1.2, 1.3])).assertTrue()
            expect(data.writeDoubleArray([2.1, 2.2, 2.3])).assertTrue()
            expect(data.writeBooleanArray([true, true, false])).assertTrue()
            expect(data.writeCharArray([65,97,122])).assertTrue()
            expect(data.writeStringArray(['abc', 'seggg'])).assertTrue()
            let a = [new MySequenceable(1, "aaa"), new MySequenceable(2, "bbb"),
                new MySequenceable(3, "ccc")]
            expect(data.writeSequenceableArray(a)).assertTrue()
            await gIRemoteObject.sendRequest(CODE_ALL_ARRAY_TYPE, data, reply, option,(err, result) => {
                expect(result.errCode).assertEqual(0)
                assertArrayElementEqual(result.reply.readByteArray(), [1, 2, 3])
                assertArrayElementEqual(result.reply.readShortArray(), [4, 5, 6])
                assertArrayElementEqual(result.reply.readIntArray(), [7, 8, 9])
                assertArrayElementEqual(result.reply.readLongArray(), [10, 11, 12])
                assertArrayElementEqual(result.reply.readFloatArray(), [1.1, 1.2, 1.3])
                assertArrayElementEqual(result.reply.readDoubleArray(), [2.1, 2.2, 2.3])
                assertArrayElementEqual(result.reply.readBooleanArray(), [true, true, false])
                assertArrayElementEqual(result.reply.readCharArray(), [65,97,122])
                assertArrayElementEqual(result.reply.readStringArray(), ['abc', 'seggg'])
                let b = [new MySequenceable(null, null), new MySequenceable(null, null),
                    new MySequenceable(null, null)]
                result.reply.readSequenceableArray(b)
                for (let i = 0; i < b.length; i++) {
                    expect(b[i].str).assertEqual(a[i].str)
                    expect(b[i].num).assertEqual(a[i].num)
                }
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11200:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11300
     * @tc.name    Test messageparcel cross process delivery. After receiving the reply message in promise,
     *             the client constructs an empty array in sequence and reads the data from the reply message
     *             into the corresponding array
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_11300", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeByteArray([1, 2, 3])).assertTrue();
            expect(data.writeShortArray([4, 5, 6])).assertTrue()
            expect(data.writeIntArray([7, 8, 9])).assertTrue()
            expect(data.writeLongArray([10, 11, 12])).assertTrue()
            expect(data.writeFloatArray([1.1, 1.2, 1.3])).assertTrue()
            expect(data.writeDoubleArray([2.1, 2.2, 2.3])).assertTrue()
            expect(data.writeBooleanArray([true, true, false])).assertTrue()
            expect(data.writeCharArray([65,97,122])).assertTrue()
            expect(data.writeStringArray(['abc', 'seggg'])).assertTrue()
            let a = [new MySequenceable(1, "aaa"), new MySequenceable(2, "bbb"),
                new MySequenceable(3, "ccc")]
            expect(data.writeSequenceableArray(a)).assertTrue()
            await gIRemoteObject.sendRequest(CODE_ALL_ARRAY_TYPE, data, reply, option).then((result) => {
                expect(result.errCode).assertEqual(0)
                assertArrayElementEqual(result.reply.readByteArray(), [1, 2, 3])
                assertArrayElementEqual(result.reply.readShortArray(), [4, 5, 6])
                assertArrayElementEqual(result.reply.readIntArray(), [7, 8, 9])
                assertArrayElementEqual(result.reply.readLongArray(), [10, 11, 12])
                assertArrayElementEqual(result.reply.readFloatArray(), [1.1, 1.2, 1.3])
                assertArrayElementEqual(result.reply.readDoubleArray(), [2.1, 2.2, 2.3])
                assertArrayElementEqual(result.reply.readBooleanArray(), [true, true, false])
                assertArrayElementEqual(result.reply.readCharArray(), [65,97,122])
                assertArrayElementEqual(result.reply.readStringArray(), ['abc', 'seggg'])
                let b = [new MySequenceable(null, null), new MySequenceable(null, null),
                    new MySequenceable(null, null)]
                result.reply.readSequenceableArray(b)
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11300" + b);
                for (let i = 0; i < b.length; i++) {
                    expect(b[i].str).assertEqual(a[i].str)
                    expect(b[i].num).assertEqual(a[i].num)
                }
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11300:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11400
     * @tc.name    Test messageparcel to pass an object of type iremoteobject across processes
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_Softbus_RPC_Compatibility_MessageParcel_11400', 0, async function(done) {
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11400---------------------------");
        function checkResult(num, str) {
            expect(num).assertEqual(123)
            expect(str).assertEqual("rpcListenerTest")
            done()
        }
        try{
            let option = new rpc.MessageOption()
            let data = rpc.MessageParcel.create()
            let reply = rpc.MessageParcel.create()

            let listener = new TestListener("rpcListener", checkResult)
            let result = data.writeRemoteObject(listener)
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11400 result is:" + result)
            expect(result).assertTrue()
            expect(data.writeInt(123)).assertTrue()
            expect(data.writeString("rpcListenerTest")).assertTrue()
            await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECT, data, reply, option).then((result)=> {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11400:sendRequest error code: " + result.errCode);
                expect(result.errCode).assertEqual(0);
                result.reply.readException();
            });
            data.reclaim();
            reply.reclaim();
            done();
        } catch(error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11400: error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11400---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11500
     * @tc.name    Test messageparcel to pass an array of iremoteobject objects across processes
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_Softbus_RPC_Compatibility_MessageParcel_11500', 0, async function(done) {
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11500---------------------------");

        let count = 0;
        function checkResult(num, str) {
            expect(num).assertEqual(123)
            expect(str).assertEqual("rpcListenerTest")
            count++
            console.info("check result done, count: " + count)
            if (count == 3) {
                done()
            }
        }

        try{
            let option = new rpc.MessageOption()
            let data = rpc.MessageParcel.create()
            let reply = rpc.MessageParcel.create()
            let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)]
            let result = data.writeRemoteObjectArray(listeners)
            expect(result == true).assertTrue()
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11500 result is:" + result)
            expect(data.writeInt(123)).assertTrue()
            expect(data.writeString("rpcListenerTest")).assertTrue()
            await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECTARRAY_1, data, reply, option)
                .then((result)=> {
                    console.info("sendRequest done, error code: " + result.errCode)
                    expect(result.errCode).assertEqual(0)
                    result.reply.readException()
                })

            data.reclaim()
            reply.reclaim()
        } catch(error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11500: error = " + error);
        }
        done()
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11500---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11600
     * @tc.name    Test messageparcel to pass the array of iremoteobject objects across processes. The server
     *             constructs an empty array in onremoterequest and reads it from messageparcel
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_Softbus_RPC_Compatibility_MessageParcel_11600', 0, async function(done) {
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11600---------------------------");
        let count = 0;
        function checkResult(num, str) {
            expect(num).assertEqual(123)
            expect(str).assertEqual("rpcListenerTest")
            count++
            console.info("check result done, count: " + count)
            if (count == 3) {
                done()
            }
        }
        try{
            let option = new rpc.MessageOption()
            let data = rpc.MessageParcel.create()
            let reply = rpc.MessageParcel.create()
            let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)]
            let result = data.writeRemoteObjectArray(listeners)
            expect(result == true).assertTrue()
            data.readRemoteObjectArray()
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11600 result is:" + result)
            expect(data.writeInt(123)).assertTrue()
            expect(data.writeString("rpcListenerTest")).assertTrue()
            await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECTARRAY_2, data, reply, option)
                .then((result)=> {
                    console.info("sendRequest done, error code: " + result.errCode)
                    expect(result.errCode).assertEqual(0)
                    result.reply.readException()
                })
            data.reclaim()
            reply.reclaim()
        } catch(error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11600: error = " + error);
        }
        done()
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11600---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11700
     * @tc.name    Invoke the rewindRead interface,Set 0-bit offset and read the data after offset
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_11700", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11700---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11700: create object successfully");
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            expect(data.writeInt(12)).assertTrue();
            expect(data.writeString("parcel")).assertTrue();
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11700: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11700: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let number1 = result.reply.readInt();
                expect(number1).assertEqual(12);
                expect(result.reply.rewindRead(0)).assertTrue();
                let number2 = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11700:run readInt is "
                    + number1 + ";" + number2);
                expect(number2).assertEqual(12);

                let reString = result.reply.readString();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11700:run readInt is " + reString);
                expect(reString).assertEqual("");
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11700:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11800
     * @tc.name    Invoke the rewindRead interface,Set 1-bit offset and read the data after offset
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_11800", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11700---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11800: create object successfully");
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            expect(data.writeInt(12)).assertTrue();
            expect(data.writeString("parcel")).assertTrue();
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11800: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11800: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let number1 = result.reply.readInt();
                expect(result.reply.rewindRead(1)).assertTrue();
                let number2 = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11800:run readInt is "
                    + number1 + ";" + number2);
                expect(number1).assertEqual(12);
                expect(number2).assertEqual(0);
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11800:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11900
     * @tc.name    Invoke the rewindWrite interface, Set 0-bit offset and write the data after offset
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_11900", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11800---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11900: create object successfully");
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            expect(data.writeInt(4)).assertTrue();
            expect(data.rewindWrite(0)).assertTrue();
            expect(data.writeInt(5)).assertTrue();
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11900: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11900: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let number = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11900:run readInt is "
                    + number);
                expect(number).assertEqual(5);
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_11900:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12000
     * @tc.name    Invoke the rewindWrite interface, Set 1-bit offset and write the data after offset
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_12000", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12000---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12000: create object successfully");
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            expect(data.writeInt(4)).assertTrue();
            expect(data.rewindWrite(1)).assertTrue();
            expect(data.writeInt(5)).assertTrue();
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12000: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12000: sendRequest, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let number = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12000:run readInt is "
                    + number);
                expect(number != 5).assertTrue();
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12000:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12100
     * @tc.name    setCapacity Sets the storage capacity of the null MessageParcel instance. The getCapacity
                   obtains the current MessageParcel capacity
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_12100", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12100---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12100: create object successfully.");
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            expect(data.getCapacity()).assertEqual(0);
            let setCapacitydata = data.setCapacity(100);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12100:run setCapacity, result is " + setCapacitydata);
            expect(setCapacitydata).assertTrue();
            expect(data.writeString("constant")).assertTrue();
            expect(data.getCapacity()).assertEqual(100);
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12100: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12100: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let getCapacitydata = result.reply.getCapacity();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12100:run getCapacity result is " + getCapacitydata);
                expect(getCapacitydata).assertEqual(("constant".length * 2) + 8);
                expect(result.reply.readString()).assertEqual("constant");
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12100:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12200
     * @tc.name    setCapacity Sets the storage capacity of the MessageParcel instance. The getCapacity
                   obtains the current MessageParcel capacity
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_12200", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12200---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12200: create object successfully.");
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            expect(data.writeString("constant")).assertTrue();
            expect(data.setCapacity(100)).assertTrue();
            expect(data.getCapacity()).assertEqual(100);
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12200: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12200: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                expect(result.reply.readString()).assertEqual("constant");
                let getCapacityresult = result.reply.getCapacity();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12200:run getCapacity result is " + getCapacityresult);
                expect(getCapacityresult).assertEqual(("constant".length * 2) + 8);
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12200:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12300
     * @tc.name    Setcapacity test: size limit verification of messageparcel instance
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_12300", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12300---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12300: create object successfully.");

            let getCapacitydata0 = data.getCapacity();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12300:run getCapacity is " + getCapacitydata0);

            expect(data.writeString("constant")).assertTrue();
            let getSizedata = data.getSize();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12300:run getSize result is " + getSizedata);
            let getCapacitydata = data.getCapacity();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12300:run getCapacity result is " + getCapacitydata);

            let setCapacitydata1 = data.setCapacity(getSizedata + 1);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12300:run setCapacity result is " + setCapacitydata1);
            expect(setCapacitydata1).assertTrue();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12300:run getCapacity result is " + data.getCapacity());
            expect(data.getCapacity()).assertEqual((getSizedata + 1));

            let setCapacitydata2 = data.setCapacity(getSizedata);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12300:run setCapacity result is " + setCapacitydata2);
            expect(setCapacitydata2).assertEqual(false);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12300:run getCapacity result is " + data.getCapacity());
            expect(data.getCapacity()).assertEqual((getSizedata + 1));
            data.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12300:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12300---------------------------");
    });

    /*
    * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12400
    * @tc.name    SetCapacity Tests the storage capacity threshold of the MessageParcel instance
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_12400", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12400---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            expect(data.writeString("constant")).assertTrue();

            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12400: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12400: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                let getSizeresult = result.reply.getSize();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12400:run getSize, result is " + getSizeresult);
                let setCapacityresult = result.reply.getCapacity();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12400:run getCapacity, result is " + setCapacityresult);
                expect(setCapacityresult).assertEqual(("constant".length * 2) + 8);

                let setCapacityresult1 = result.reply.setCapacity(getSizeresult + 1);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12400:run setCapacity result is " + setCapacityresult1);
                expect(setCapacityresult1).assertTrue();
                let getCapacitydata1 = result.reply.getCapacity();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12400:run getCapacity result is " + getCapacitydata1);
                expect(getCapacitydata1).assertEqual(getSizeresult + 1);

                let setCapacityresult2 = result.reply.setCapacity(getSizeresult);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12400:run setCapacity result is " + setCapacityresult2);
                expect(setCapacityresult2).assertEqual(false);

                expect(data.readString()).assertEqual("constant");
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12400:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12400---------------------------");
    });

    /*
    * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12500
    * @tc.name    Setcapacity test storage capacity boundary value verification of messageparcel instance
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_12500", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12500---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12500: create object successfully.");
            let getSizedata = data.getSize();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12500:run setCapacity , result is " + getSizedata);
            expect(getSizedata).assertEqual(0);

            let setMeCapacity = data.setCapacity(M);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12500:run setCapacity , result is " + setMeCapacity);
            expect(setMeCapacity).assertTrue();
            let getCapacitydata = data.getCapacity();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12500:run getCapacity , result is " + getCapacitydata);
            expect(getCapacitydata).assertEqual(M);

            let setMeCapacity1 = data.setCapacity(2*G);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12500:run setCapacity , result is " + setMeCapacity1);
            expect(setMeCapacity1).assertEqual(false);
            let getCapacitydata1 = data.getCapacity();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12500:run getCapacity , result is " + getCapacitydata1);

            data.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12500:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12600
     * @tc.name    setSize Sets the size of the data contained in the MessageParcel instance. The getSize command
                    reads the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_12600", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12600---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12600: create object successfully.");
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            expect(data.getSize()).assertEqual(0);
            let setSizedata = data.setSize(0);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12600:run setSize , result is " + setSizedata);
            expect(setSizedata).assertTrue();
            expect(data.writeString("constant")).assertTrue();
            let getSizedata = data.getSize();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12600:run getSize , result is " + getSizedata);
            expect(getSizedata).assertEqual(("constant".length * 2) + 8);

            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12600: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12600: sendRequest , result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                let getSizeresult = result.reply.getSize();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12600:run getSize , result is " + getSizeresult);
                expect(getSizeresult).assertEqual(("constant".length * 2) + 8);

                expect(result.reply.readString()).assertEqual("constant");
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12600:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12700
     * @tc.name    SetSize: Increases the value of the data contained in the MessageParcel instance by 1,
                    Write setSize
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_12700", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12700---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12700: create object successfully.");
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            expect(data.writeString("constant")).assertTrue();
            expect(data.getSize()).assertEqual(("constant".length * 2) + 8);
            expect(data.setSize(0)).assertTrue();

            let getSizedata = data.getSize();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12700:run setSize , result is " + getSizedata);
            expect(getSizedata).assertEqual(0);

            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12700: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12700: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                let getSizeresult = result.reply.getSize();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12700:run getSize , result is " + getSizeresult);
                expect(getSizeresult).assertEqual( 8);
                let writeresult = result.reply.readString();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12700:run readString is "
                    + writeresult);
                expect(writeresult).assertEqual("");
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12700:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12800
     * @tc.name    Verify the messageparcel instance SetSize setting and the instance capacitydata qualification verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_12800", 0, async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12800---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12800: create object successfully.");
            expect(data.getSize()).assertEqual(0);
            expect(data.writeString("constant")).assertTrue();
            expect(data.getSize()).assertEqual(("constant".length * 2) + 8);

            let getCapacitydata = data.getCapacity();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12800:run getCapacity , result is " + getCapacitydata);

            let setSizedata1 = data.setSize(getCapacitydata);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12800:run setSize , result is " + setSizedata1);
            expect(setSizedata1).assertTrue();

            expect(data.getSize()).assertEqual(getCapacitydata);

            let setSizedata2 = data.setSize(getCapacitydata + 1);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12800:run setSize , result is " + setSizedata2);
            expect(setSizedata2).assertEqual(false);

            data.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12800:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12900
     * @tc.name    setSize Sets the storage capacity of the MessageParcel instance to decrease by one.
                   The getSize obtains the current MessageParcel capacity
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_12900", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12900---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12900: create object successfully.");
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            expect(data.writeString("constant")).assertTrue();
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12900: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12900: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                expect(result.reply.readString()).assertEqual("constant");
                expect(result.reply.getSize()).assertEqual(("constant".length * 2) + 8);

                let getCapacityresult = result.reply.getCapacity();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12900:run getCapacity result is " + getCapacityresult);

                let setSizeresult1 = result.reply.setSize(getCapacityresult);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12900:run setSize result is " + setSizeresult1);
                expect(setSizeresult1).assertTrue();
                expect(result.reply.getSize()).assertEqual(getCapacityresult);

                let setSizeresult2 = result.reply.setSize(getCapacityresult + 1);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12900:run setSize result is " + setSizeresult2);
                expect(setSizeresult2).assertEqual(false);
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12900:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13000
     * @tc.name    Validate the setSize boundary value in the MessageParcel instance
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_13000", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13000---------------------------");
        try{

            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13000: create object successfully.");

            let getCapacitydata = data.getCapacity();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13000:run getCapacity result is " + getCapacitydata);
            expect(getCapacitydata).assertEqual(0);

            let setSizedata1 = data.setSize(4*G);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13000:run setSize result is " + setSizedata1);
            expect(setSizedata1).assertTrue();
            let getSizedata1 = data.getSize();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13000:run getCapacity result is " + getSizedata1);
            expect(getSizedata1).assertEqual(0);

            let setSizedata = data.setSize(4*G - 1);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13000:run setSize result is " + setSizedata);
            expect(setSizedata).assertEqual(false);
            data.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13000:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13100
     * @tc.name    Verify that setSize is out of bounds in a MessageParcel instance
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_13100", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13100---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13100: create object successfully.");

            let setSizedata = data.setSize(0);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13100:run setCapacity result is " + setSizedata);
            expect(setSizedata).assertTrue();
            expect(data.getSize()).assertEqual(0);

            let setSizedata1 = data.setSize(2*4*G);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13100:run setCapacity result is " + setSizedata1);
            expect(setSizedata1).assertTrue();
            expect(data.getSize()).assertEqual(0);

            let setSizedata2 = data.setSize(2*G);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13100:run setCapacity result is " + setSizedata2);
            expect(setSizedata2).assertEqual(false);
            data.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13100:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13200
     * @tc.name    Obtains the write and read positions of the MessageParcel
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_13200", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13200---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13200: create object successfully.");
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            let getwPos1 = data.getWritePosition();
            expect(data.writeInt(10)).assertTrue();
            let getwPos2 = data.getWritePosition();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13200:result getWritePosition is "
                + getwPos1 + ";" + getwPos2);
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13200: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13200: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let getrPos1 = result.reply.getReadPosition();
                let readint = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13200:result readInt is " + readint);
                let getrPos2 = result.reply.getReadPosition();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13200:result getReadPosition is "
                    + getrPos1 + ";" + getrPos2);
                expect(getwPos1).assertEqual(getrPos1);
                expect(getwPos2).assertEqual(getrPos2);
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13200:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13300
     * @tc.name    Obtaining the Writable and Readable Byte Spaces of MessageParcel
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_13300", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13300---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13300: create object successfully.");
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            let getwbyte1 = data.getWritableBytes();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13300:result getWritableBytes is " + getwbyte1);
            expect(data.writeInt(10)).assertTrue();
            let getwbyte2 = data.getWritableBytes();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13300:result getWritableBytes is " + getwbyte2);
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13300: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13300: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let getrbyte1 = result.reply.getReadableBytes();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13300:result getReadableBytes is " + getrbyte1);
                let readint = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13300:result readInt is " + readint);
                let getrbyte2 = result.reply.getReadableBytes();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13300:result getReadableBytes is " + getrbyte2);
                expect(readint).assertEqual(10);
                expect(getrbyte2).assertEqual(0);
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13300:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13400
     * @tc.name    Obtains the writeable and readable byte space and read position of the MessageParcel
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_13400", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13400---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13400: create object successfully.");
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            data.writeInt(10);
            let getwPos = data.getWritePosition();
            let getwbyte = data.getWritableBytes();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13400:result getWritePosition is "
                + getwPos + "getWritableBytes is " + getwbyte);
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13400: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13400: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let getrbyte = result.reply.getReadableBytes();
                let getrPos = result.reply.getReadPosition();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13400:result getReadableBytes is "
                    + getrbyte + "getReadPosition is" + getrPos);
                expect(getrbyte).assertEqual(4);
                expect(getrPos).assertEqual(0);

                let readint = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13400:result readInt is " + readint);
                expect(readint).assertEqual(10);
                let getrbyte1 = result.reply.getReadableBytes();
                let getrPos1 = result.reply.getReadPosition();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13400:result getReadableBytes is "
                    + getrbyte1 + "getReadPosition is" + getrPos1);
                expect(getrbyte1).assertEqual(0);
                expect(getrPos1).assertEqual(getwPos);
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13400:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13400---------------------------");
    });

    /*
    * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13400
    * @tc.name    Get the space size of messageparcel to pass rawdata data
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_13500", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13500---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13500: create object successfully.");
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            data.writeInt(10);
            let getwPos = data.getWritePosition();
            let getwbyte = data.getWritableBytes();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13500:result getWritePosition is "
                + getwPos + "getWritableBytes is " + getwbyte);
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13500: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13500: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let getrPos = result.reply.getReadPosition();
                let getrbyte = result.reply.getReadableBytes();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13500:result getReadPosition is "
                    + getrPos + "getReadableBytes is" + getrbyte);
                let readint = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13500:result readInt is " + readint);
                expect(readint).assertEqual(10);
                let getrPos1 = result.reply.getReadPosition();
                expect(getrPos1).assertEqual(getwPos);
                let getrbyte1 = result.reply.getReadableBytes();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13500:result getReadPosition is "
                    + getrPos1 + "getReadableBytes is" + getrbyte1);
                expect(getrbyte1).assertEqual(0);
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13500:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13600
     * @tc.name    Test fixed MessageParcel space size to pass rawData data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_13600", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13600---------------------------");
        try{
            let maxsize = 1024;
            let data = rpc.MessageParcel.create();
            let Capacity = data.getRawDataCapacity()
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13600:run Capacity success, Capacity is " + Capacity);
            let rawdata = [1, 2, 3];
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            expect(data.writeInt(maxsize)).assertTrue();
            let result = data.writeRawData(rawdata, maxsize);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13600:run writeRawData is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13600: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_RAWDATA, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13600: sendRequest is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let size = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13600:run readInt is " + size);
                var newReadResult = result.reply.readRawData(size)
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13600:run readRawData is "
                    + newReadResult.length);
                expect(newReadResult != rawdata).assertTrue();
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13600:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13700
     * @tc.name    Test messageparcel delivery file descriptor object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_13700", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13700---------------------------");
        try{
            let testab = new TestProxy(gIRemoteObject).asObject();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13700: asObject is" + testab);
            expect(testab != null).assertTrue();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13700:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13800
     * @tc.name    Test that the asObject interface is called by a RemoteObject and returns itself
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_13800", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13800---------------------------");
        try{
            let testRemoteObject = new TestRemoteObject("testObject");
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13800: TestRemoteObject is" + testRemoteObject);
            let testab = testRemoteObject.asObject();
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13800: asObject is" + testab);
            expect(testab != null).assertTrue();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13800:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13900
     * @tc.name    MessageParcel sendRequestAsync API test
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageParcel_13900", 0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13900---------------------------");
        try{
            let maxsize = 1024;
            let data = rpc.MessageParcel.create();
            let Capacity = data.getRawDataCapacity()
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13900:run Capacity success, Capacity is " + Capacity);
            let rawdata = [1, 2, 3];
            let option = new rpc.MessageOption();
            let reply = rpc.MessageParcel.create();
            expect(data.writeInt(maxsize)).assertTrue();
            let result = data.writeRawData(rawdata, maxsize);
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13900:run writeRawData is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined){
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13900: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequestAsync(CODE_WRITE_RAWDATA, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13900: sendRequestAsync is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                let size = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13900:run readInt is " + size);
                var newReadResult = result.reply.readRawData(size)
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13900:run readRawData is "
                    + newReadResult.length);
                expect(newReadResult != rawdata).assertTrue();
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_13900:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13900---------------------------");
    });


    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00100
     * @tc.name    Test the getwaittime basic method of messageoption
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageOption_00100",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00100---------------------------");
        try{
            let option = new rpc.MessageOption();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00100: create object successfully.");
            let time = option.getWaitTime();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00100: run getWaitTime success, time is " + time);
            expect(time).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
            option.setWaitTime(16);
            let time2 = option.getWaitTime();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00100: run getWaitTime success, time is " + time2);
            expect(time2).assertEqual(16);
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00100: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00100---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00200
     * @tc.name    Test the getwaittime boundary value of messageoption
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageOption_00200",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00200---------------------------");
        try{
            let option = new rpc.MessageOption();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00200: create object successfully.");
            let time = option.getWaitTime();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00200: run getWaitTime success, time is " + time);
            expect(time).assertEqual(rpc.MessageOption.TF_WAIT_TIME);

            option.setWaitTime(0);
            let time2 = option.getWaitTime();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00200: run getWaitTime success, time is " + time2);
            expect(time2).assertEqual(rpc.MessageOption.TF_WAIT_TIME);

            option.setWaitTime(60);
            let time3 = option.getWaitTime();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00200: run getWaitTime success, time is " + time3);
            expect(time3).assertEqual(60);

        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00200: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00200---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00300
     * @tc.name    Test the getwaittime minimum out of range value of messageoption
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageOption_00300",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00300---------------------------");
        try{
            let option = new rpc.MessageOption();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00300: create object successfully.");
            let time = option.getWaitTime();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00300: run getWaitTime success, time is " + time);
            expect(time).assertEqual(rpc.MessageOption.TF_WAIT_TIME);

            option.setWaitTime(-1);
            let time2 = option.getWaitTime();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00300: run getWaitTime success, time is " + time2);
            expect(time2).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00300: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00300---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00400
     * @tc.name    Test the getwaittime maximum out of range value of messageoption
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageOption_00400",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00400---------------------------");
        try{
            let option = new rpc.MessageOption();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00400: create object successfully.");
            let time = option.getWaitTime();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00400: run getWaitTime success, time is " + time);
            expect(time).assertEqual(rpc.MessageOption.TF_WAIT_TIME);

            option.setWaitTime(61);
            let time2 = option.getWaitTime();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00400: run getWaitTime success, time is " + time2);
            expect(time2).assertEqual(61);
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00400: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00400---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00500
     * @tc.name    Test the getflags basic method of messageoption
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageOption_00500",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00500---------------------------");
        try{
            let option = new rpc.MessageOption();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00500: create object successfully.");
            let flog = option.getFlags();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00500: run getFlags success, flog is " + flog);
            expect(flog).assertEqual(rpc.MessageOption.TF_SYNC);

            option.setFlags(1)
            let flog2 = option.getFlags();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00500: run getFlags success, flog2 is " + flog2);
            expect(flog2).assertEqual(rpc.MessageOption.TF_ASYNC);
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00500: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00500---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00600
     * @tc.name    Test the setflags basic method of messageoption
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageOption_00600",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00600---------------------------");
        try{
            let option = new rpc.MessageOption();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00600: create object successfully.");
            let flog = option.getFlags();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00600: run getFlags success, flog is " + flog);
            expect(flog).assertEqual(rpc.MessageOption.TF_SYNC);

            option.setFlags(1);
            let flog2 = option.getFlags();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00600: run getFlags success, flog2 is " + flog2);
            expect(flog2).assertEqual(rpc.MessageOption.TF_ASYNC);

            option.setFlags(0)
            let flog3 = option.getFlags();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00600: run getFlags success, flog2 is " + flog3);
            expect(flog2).assertEqual(rpc.MessageOption.TF_ASYNC);
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00600: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00600---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00700
     * @tc.name    Test the setflags exception value of messageoption
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageOption_00700",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00700---------------------------");
        try{
            let option = new rpc.MessageOption();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00700: create object successfully.");
            let flog = option.getFlags();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00700: run getFlags success, flog is " + flog);
            expect(flog).assertEqual(rpc.MessageOption.TF_SYNC);

            option.setFlags(-1);
            let flog2 = option.getFlags();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00700: run getFlags success, flog2 is " + flog2);
            expect(flog2).assertEqual(-1);
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00700: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00700---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00800
     * @tc.name    Test the unqualified value of setflags of messageoption
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageOption_00800",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00800---------------------------");
        try{
            let option = new rpc.MessageOption();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00800: create object successfully.");
            let flog = option.getFlags();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00800: run getFlags success, flog is " + flog);
            expect(flog).assertEqual(rpc.MessageOption.TF_SYNC);

            option.setFlags(3);
            let flog2 = option.getFlags();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00800: run getFlags success, flog2 is " + flog2);
            expect(flog2).assertEqual(3);
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00800: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00800---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00900
     * @tc.name    Test constant value detection of messageoption
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageOption_00900",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00900---------------------------");
        try{
            expect(rpc.MessageOption.TF_SYNC).assertEqual(0);

            expect(rpc.MessageOption.TF_ASYNC).assertEqual(1);

            expect(rpc.MessageOption.TF_WAIT_TIME).assertEqual(4);

            expect(rpc.MessageOption.TF_ACCEPT_FDS).assertEqual(0x10);
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_00900: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00900---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_01000
     * @tc.name    Basic method of testing messageoption
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageOption_01000",0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_01000---------------------------");
        try{

            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01000: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            option.setWaitTime(20);
            option.setFlags(0);
            var token = "option";
            var result = data.writeString(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01000:run writeString is " + result);
            expect(result).assertTrue();
            expect(option.getFlags()).assertEqual(0);
            expect(option.getWaitTime()).assertEqual(20);

            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01000: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01000: sendRequest is " + result.errCode);

                var replyReadResult = result.reply.readString();
                console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01100: run readString is " + replyReadResult);
                expect(replyReadResult).assertEqual(token);
                expect(option.getFlags()).assertEqual(0);
                expect(option.getWaitTime()).assertEqual(20);

            });
            data.reclaim();
            reply.reclaim();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01000: error " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_01000---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_01100
     * @tc.name    Test the setflags of messageoption asynchronously and the sendrequest callback result
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageOption_01100",0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_01100---------------------------");
        try{

            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            option.setFlags(1);
            var token = "option";
            var result = data.writeString(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01100:run writeString is " + result);
            expect(result).assertTrue();
            expect(option.getFlags()).assertEqual(1);
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01100: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01100: sendRequest is " + result.errCode);
                var replyReadResult = result.reply.readString();
                console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01100: run readString is " + replyReadResult);
                expect(replyReadResult).assertEqual("");
                expect(option.getFlags()).assertEqual(1);

            });
            data.reclaim();
            reply.reclaim();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01100: error " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_01100---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_01200
     * @tc.name    MessageOption sendRequestAsync test
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_MessageOption_01200",0, async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_01200---------------------------");
        try{

            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            option.setFlags(1);
            var token = "option";
            var result = data.writeString(token);
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01200:run writeString is " + result);
            expect(result).assertTrue();
            expect(option.getFlags()).assertEqual(1);
            if (gIRemoteObject == undefined)
            {
                console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01200: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequestAsync(CODE_WRITE_STRING, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01200: sendRequestAsync is " + result.errCode);
                var replyReadResult = result.reply.readString();
                console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01200: run readString is " + replyReadResult);
                expect(replyReadResult).assertEqual("");
                expect(option.getFlags()).assertEqual(1);

            });
            data.reclaim();
            reply.reclaim();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_MessageOption_01200: error " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_01200---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00100
     * @tc.name    Exception parameter validation of the created anonymous shared memory object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_00100",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00100---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", -1)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00100: ashmem " + ashmem);
            expect(ashmem == null).assertTrue();

            let ashmem2 = rpc.Ashmem.createAshmem(null, 1024)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00100: ashmem2 " + ashmem2);
            expect(ashmem2 == null).assertTrue();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00100: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00100---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00200
     * @tc.name    Call the getashmemsize interface to get the size of the shared memory object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_00200",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00200---------------------------");
        try{
            var mapSize = 2*G - 1;
            var jsash = "";
            for (let i = 0;i < (256 - 1);i++){
                jsash += "a";
            }
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00200: run  createAshmem success" + jsash.length);
            let ashmem = rpc.Ashmem.createAshmem(jsash, mapSize)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00200: run  createAshmem success" + ashmem);
            expect(ashmem != null).assertTrue();
            ashmem.closeAshmem();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00200: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00200---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00300
     * @tc.name    Call the getashmemsize interface to get the size of the exception shared memory object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_00300",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00300---------------------------");
        try{
            let mapSize = 2*G - 1;
            let jsash = "";
            for (let i = 0;i < 256;i++){
                jsash += "a";
            }
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00300: run  createAshmem success" + jsash.length);
            let ashmem = rpc.Ashmem.createAshmem(jsash, mapSize)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00300: run  createAshmem success" + ashmem);
            ashmem.closeAshmem();
        }catch(error){
            expect(error != null).assertTrue();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00300: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00300---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00400
     * @tc.name    Call the getashmemsize interface to get the size of the maximum shared memory object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_00400",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00400---------------------------");
        try{
            let mapSize = 2*G - 1;
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00400: run  createAshmem success " + ashmem);
            let size = ashmem.getAshmemSize()
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00400: run getAshmemSize success, size is " + size);
            expect(size).assertEqual(mapSize);
            ashmem.closeAshmem();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00400: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00400---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00500
     * @tc.name    Call the getashmemsize interface to obtain the maximum size of the out of bounds shared memory object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_00500",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00500---------------------------");
        try{
            let mapSize = 2*G;
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00500: run  createAshmem success " + ashmem);
            let size = ashmem.getAshmemSize()
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00500: run getAshmemSize success, size is " + size);
            expect(size).assertEqual(mapSize);
            ashmem.closeAshmem();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00500: error " + error);
            expect(error != null).assertTrue();
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00500---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00600
     * @tc.name    Writeashmem exception validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_00600",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00600---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00600: ashmem " + ashmem);
            ashmem.closeAshmem()

            var data = rpc.MessageParcel.create();
            let writeAshmem = data.writeAshmem(ashmem);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00600: run writeAshmem success, writeAshmem is " + writeAshmem);
            expect(writeAshmem).assertEqual(false);
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00600: error " + error);
        }
        data.reclaim();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00600---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00700
     * @tc.name    Readfromashmem exception validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_00700",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00700---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00700: ashmem " + ashmem);
            ashmem.unmapAshmem()
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00700: run unmapAshmem success");
            let bytes = [1, 2, 3, 4, 5];
            let ret = ashmem.readFromAshmem(bytes.length, 0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00700: run readFromAshmem result is " + ret);
            expect(ret == null).assertTrue();
            ashmem.closeAshmem();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00700: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00700---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00800
     * @tc.name    Mapashmem interface creates shared file mappings
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_00800",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00800---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00800: ashmem " + ashmem);
            let result = ashmem.mapAshmem(rpc.Ashmem.PROT_READ);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00800: run mapAshmem is " + result);
            expect(result).assertTrue();
            ashmem.closeAshmem()
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00800: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00800---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00900
     * @tc.name    Mapashmem exception validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_00900",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00900---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", (2*G - 1))
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00900: ashmem " + ashmem);
            let result = ashmem.mapAshmem(999);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00900: run mapAshmem is " + result);
            expect(result).assertEqual(false);
            ashmem.closeAshmem()
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_00900: error " + error);
            expect(error != null).assertTrue();
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00900---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01000
     * @tc.name    Mapreadandwriteashmem interface creates a shared file map with the protection level of read-write
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_01000",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01000---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01000: ashmem " + ashmem);
            let result = ashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01000: run mapAshmem is " + result);
            expect(result).assertTrue();
            ashmem.closeAshmem()
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01000: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01000---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01100
     * @tc.name    Mapreadandwriteashmem exception validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_01100",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01100---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01100: ashmem " + ashmem);
            let result = ashmem.mapAshmem(rpc.Ashmem.PROT_READ);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01100: run mapAshmem is " + result);
            expect(result).assertTrue();

            ashmem.unmapAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01100: run unmapAshmem success");

            let result2 = ashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01100: run mapReadAndWriteAshmem success, result2 is " + result2);
            expect(result2).assertTrue();
            ashmem.closeAshmem()
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01100: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01100---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01200
     * @tc.name    Mapreadonlyashmem interface creates a shared file map with the protection level of read-write
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_01200",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01200---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01200: ashmem " + ashmem);
            let result = ashmem.mapReadOnlyAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01200: run mapReadAndWriteAshmem is " + result);
            expect(result).assertTrue();
            ashmem.closeAshmem();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01200: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01200---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01300
     * @tc.name    Mapreadonlyashmem exception validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_01300",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01300---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01300: ashmem " + ashmem);

            let result = ashmem.mapAshmem(rpc.Ashmem.PROT_WRITE);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01300: run mapAshmem is " + result);
            expect(result).assertTrue();

            ashmem.unmapAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01300: run unmapAshmem success");
            ashmem.closeAshmem()
            let result2 = ashmem.mapReadOnlyAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01300: run mapReadAndWriteAshmem is " + result2);
            expect(result2).assertEqual(false);
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01300: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01300---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01400
     * @tc.name    Setprotection: sets the protection level of the memory area to which the shared file is mapped
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_01400",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01400---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
            let resultwrite = ashmem.setProtection(rpc.Ashmem.PROT_WRITE)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01400: run setProtection is " + resultwrite);
            expect(resultwrite).assertTrue();

            let resultread = ashmem.setProtection(rpc.Ashmem.PROT_READ)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01400: run setProtection is " + resultread);
            expect(resultread).assertEqual(false);

            let resultreadAndwrite = ashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01400: run mapReadAndWriteAshmem is " + resultreadAndwrite);
            expect(resultreadAndwrite ).assertEqual(false)();

            let resultnone = ashmem.setProtection(rpc.Ashmem.PROT_NONE)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01400: run setProtection is " + resultnone);
            expect(resultnone).assertTrue();

            let resultread2 = ashmem.setProtection(rpc.Ashmem.PROT_READ)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01400: run setProtection is " + resultread2);
            expect(resultread2).assertEqual(false)();

            ashmem.closeAshmem()
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01400: error " + error);
            expect(error != null).assertTrue();
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01400---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01500
     * @tc.name    Setprotection exception input parameter verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_01500",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01500---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01500: ashmem " + ashmem);
            let result = ashmem.setProtection(3);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01500: run setProtection is " + result);
            expect(result).assertTrue();
            ashmem.closeAshmem()
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01500: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01500---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01600
     * @tc.name    The writetoashmem interface writes the shared file associated with the object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_01600",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01600---------------------------");
        try{
            let mapSize = 4096
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01600: ashmem " + ashmem);

            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01600: run mapReadAndWriteAshmem success, result2 is "
                + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = [1, 2, 3, 4, 5];
            let result = ashmem.writeToAshmem(bytes, bytes.length, 0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01600: run writeToAshmem is " + result);
            expect(result).assertTrue();
            ashmem.closeAshmem();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01600: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01600---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01700
     * @tc.name    Writetoashmem interface writes the shared file associated with the object (file boundary value)
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_01700",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01700---------------------------");
        try{
            let mapSize = 4096
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01700: ashmem " + ashmem);

            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01700: run mapReadAndWriteAshmem success, result2 is "
                + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = [-2147483648,2147483647];
            let result = ashmem.writeToAshmem(bytes, bytes.length, 0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01700: run writeToAshmem is " + result + ";" + bytes.length);
            expect(result).assertTrue();
            let readresult = ashmem.readFromAshmem(bytes.length,0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01700: run readFromAshmem is " + readresult);
            assertArrayElementEqual(readresult,bytes);
            ashmem.closeAshmem();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01700: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01700---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01800
     * @tc.name    The writetoashmem interface writes the shared data associated with the object minimum boundary crossing file
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_01800",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01800---------------------------");
        try{
            let mapSize = 4096
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01800: ashmem " + ashmem);

            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01800: run mapReadAndWriteAshmem success, result2 is "
                + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = [-2147483649,2147483647];
            let result = ashmem.writeToAshmem(bytes, bytes.length, 0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01800: run writeToAshmem is " + result);
            expect(result).assertTrue();
            let readresult = ashmem.readFromAshmem(bytes.length,0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01800: run readFromAshmem is " + readresult);
            expect(readresult[0]).assertEqual(2147483647);
            expect(readresult[1]).assertEqual(bytes[1]);

            ashmem.closeAshmem();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01800: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01800---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01900
     * @tc.name    The writetoashmem interface writes the shared data associated with the object maximum boundary crossing file
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_01900",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01900---------------------------");
        try{
            let mapSize = 4096
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01900: ashmem " + ashmem);

            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01900: run mapReadAndWriteAshmem success, result2 is "
                + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = [-2147483648,2147483648];
            let result = ashmem.writeToAshmem(bytes, bytes.length, 0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01900: run writeToAshmem is " + result);
            expect(result).assertTrue();
            let reresult = ashmem.readFromAshmem(bytes.length,0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01900: run readFromAshmem is " + reresult);
            expect(reresult[0]).assertEqual(bytes[0]);
            expect(reresult[1]).assertEqual(-2147483648);

            ashmem.closeAshmem();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_01900: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01900---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02000
     * @tc.name    Writetoashmem interface: writes the boundary location to the shared file associated with the object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_02000",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02000---------------------------");
        try{
            let mapSize = 2*M;
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02000: ashmem " + ashmem);

            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02000: run mapReadAndWriteAshmem is "
                + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = [0,1];
            let result = ashmem.writeToAshmem(bytes, bytes.length, 2147483647);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02000: run writeToAshmem is " + result);
            expect(result).assertEqual(false);

            ashmem.closeAshmem();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02000: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02000---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02100
     * @tc.name    Writetoashmem interface: writes the shared file associated with the object at the out of bounds position
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_02100",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02100---------------------------");
        try{
            let mapSize = 2*M;
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02100: ashmem " + ashmem);

            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02100: run mapReadAndWriteAshmem is "
                + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = [0,1];
            let result = ashmem.writeToAshmem(bytes, bytes.length, 2147483648);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02100: run writeToAshmem is " + result);
            expect(result).assertTrue();
            let readresult1 = ashmem.readFromAshmem(bytes.length,0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02100: run readFromAshmem is " + readresult1);
            assertArrayElementEqual(readresult1,bytes);

            ashmem.closeAshmem();
        }catch(error) {
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02100: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02100---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02200
     * @tc.name    After the permission is set, the writetoashmem interface writes the shared file associated with the object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_02200",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02200---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02200: ashmem " + ashmem);

            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02200: run mapReadAndWriteAshmem success, result2 is "
                + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = [1, 2, 3, 4, 5];
            let result = ashmem.writeToAshmem(bytes, bytes.length, 0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02200: run writeToAshmem is " +result);
            expect(result).assertTrue();
            let resultread = ashmem.setProtection(rpc.Ashmem.PROT_READ);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02200: run setProtection success, resultread is " + resultread);
            expect(resultread).assertTrue()
            let result2 = ashmem.writeToAshmem(bytes, bytes.length, 0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02200: run writeToAshmem success, result2 is " + result2);
            expect(result2).assertEqual(false)
            ashmem.closeAshmem();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02200: error " +error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02200---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02300
     * @tc.name    Writetoashmem exception validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_02300",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02300---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02300: ashmem " + ashmem);
            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02300: run mapReadAndWriteAshmem success, result2 is "
                + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = [1, 2, 3, 4, 5];
            let size = bytes.length + 10;
            let result = ashmem.writeToAshmem(bytes, 3, 0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02300: run writeToAshmem is " + result);
            expect(result).assertTrue();
            ashmem.closeAshmem()
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02300: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02300---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02400
     * @tc.name    Read data from the shared file associated with readfromashmem
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_02400",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02400---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02400: ashmem " + ashmem);

            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02400: run mapReadAndWriteAshmem success, result2 is "
                + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = [1, 2, 3, 4, 5];
            let result = ashmem.writeToAshmem(bytes, bytes.length, 0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02400: run writeToAshmem is " + result);
            expect(result).assertTrue();
            var resultRead = ashmem.readFromAshmem(bytes.length, 0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02400: run readFromAshmem is " + resultRead);
            assertArrayElementEqual(resultRead,bytes);
            ashmem.closeAshmem()
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02400: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02400---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02500
     * @tc.name    Readfromashmem exception validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_02500",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02500---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02500: ashmem " + ashmem);
            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02500: run mapReadAndWriteAshmem success, result2 is "
                + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = [1, 2, 3, 4, 5];
            let result = ashmem.writeToAshmem(bytes, bytes.length, 1);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02500: run writeToAshmem is " + result);
            expect(result).assertTrue()

            let result2 = ashmem.readFromAshmem(bytes.length, 3);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02500: run readFromAshmem success, result2 is " + result2);
            expect(bytes[2]).assertEqual(result2[0]);
            expect(bytes[3]).assertEqual(result2[1]);
            expect(bytes[4]).assertEqual(result2[2]);
            ashmem.closeAshmem()
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02500: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02500---------------------------");
    })


    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02600
     * @tc.name    Createashmemfromexisting copies the ashmem object description and creates a new object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_02600",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02600---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02600: ashmem " + ashmem);
            let resultWriteAndRead = ashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02600:  run mapReadAndWriteAshmem result is " + resultWriteAndRead);
            expect(resultWriteAndRead).assertTrue();
            let bytes = [1, 2, 3];
            let result = ashmem.writeToAshmem(bytes, bytes.length, 1);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02600: run writeToAshmem is " + result);
            expect(result).assertTrue()
            let newashmem = rpc.Ashmem.createAshmemFromExisting(ashmem);
            let resultWriteAndRead2 = newashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02600:  run mapReadAndWriteAshmem result is " + resultWriteAndRead2);
            expect(resultWriteAndRead2).assertTrue();

            let result2 = newashmem.readFromAshmem(bytes.length, 1);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02600: run readFromAshmem success, result2 is " + result2);
            expect(result).assertTrue();
            assertArrayElementEqual(result2,bytes);
            ashmem.closeAshmem();
            newashmem.closeAshmem();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02600: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02600---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02700
     * @tc.name    Create a shared memory object and call writeashmem to write the shared anonymous
      object into the messageparcel object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_02700",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02700---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
            let data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02700: ashmem " + ashmem);
            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02700: run mapReadAndWriteAshmem result is " + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = [1, 2, 3];
            let result = ashmem.writeToAshmem(bytes, bytes.length, 0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02700: run writeToAshmem is " + result);
            expect(result).assertTrue()
            let result2 = data.writeAshmem(ashmem)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02700: run writeAshmem is " + result2);
            expect(result2).assertTrue();
            let retReadAshmem = data.readAshmem();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02700: run readAshmem is " + retReadAshmem);
            let retByte = ashmem.readFromAshmem(bytes.length, 0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02700: run readFromAshmem result is " + retByte);
            let retBytes = retReadAshmem.readFromAshmem(bytes.length, 0);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02700: run readFromAshmem result is " + retBytes);
            ashmem.closeAshmem();
            data.reclaim();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02700: error " +error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02700---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02800
     * @tc.name    Create a non shared memory object and call writeashmem to write the messageparcel object
      object into the messageparcel object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_02800",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02800---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            let data2 = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02800: create MessageParcel object success");
            let result = data.writeAshmem(data2);
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02800: run writeAshmem is " + result);

            data.reclaim();
            data2.reclaim();
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02800: error " + error);
            expect(error != null).assertTrue();
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02800---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02900
     * @tc.name    Test the ashmem object passed by messageparcel
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_Ashmem_02900",0,function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02900---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);

            let resultwrite = ashmem.setProtection(rpc.Ashmem.PROT_EXEC)
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02900: run setProtection success, resultwrite is " + resultwrite);
            expect(resultwrite).assertTrue();

            ashmem.closeAshmem()
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_Ashmem_02900: error " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02900---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_00100
     * @tc.name    Call sendrequestresult interface to send data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00100",0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var sequenceable = new MySequenceable(1, "aaa");
            var result = data.writeSequenceable(sequenceable);
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00100: run writeSequenceable is " + result);
            await gIRemoteObject.sendRequest(CODE_WRITESEQUENCEABLE, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00100: sendRequest is " + result.errCode);
                expect(result.errCode).assertEqual(0);
                let ret = new MySequenceable(0, '');
                var shortArryDataReply = result.reply.readSequenceable(ret);
                console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00100: run readSequenceable is "
                    + ret);
                expect(shortArryDataReply).assertTrue()
                expect(ret.num).assertEqual(1)
                expect(ret.str).assertEqual("aaa")
            });
        }catch(error){
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00100: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_00100---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_00200
     * @tc.name    Test that messageparcel passes through the same process, and the client
     *             receives the reply message in promise
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00200", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeByte(1)).assertTrue()
            expect(data.writeShort(2)).assertTrue()
            expect(data.writeInt(3)).assertTrue()
            expect(data.writeLong(10000)).assertTrue()
            expect(data.writeFloat(1.2)).assertTrue()
            expect(data.writeDouble(10.2)).assertTrue()
            expect(data.writeBoolean(true)).assertTrue()
            expect(data.writeChar(96)).assertTrue()
            expect(data.writeString("HelloWorld")).assertTrue()
            expect(data.writeSequenceable(new MySequenceable(1, "aaa"))).assertTrue()
            await gIRemoteObject.sendRequest(CODE_ALL_TYPE, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00200: sendRequest done, error code: " + result.errCode);
                expect(result.errCode).assertEqual(0)
                expect(result.reply.readByte()).assertEqual(1)
                expect(result.reply.readShort()).assertEqual(2)
                expect(result.reply.readInt()).assertEqual(3)
                expect(result.reply.readLong()).assertEqual(10000)
                expect(result.reply.readFloat()).assertEqual(1.2)
                expect(result.reply.readDouble()).assertEqual(10.2)
                expect(result.reply.readBoolean()).assertTrue()
                expect(result.reply.readChar()).assertEqual(96)
                expect(result.reply.readString()).assertEqual("HelloWorld")
                let s = new MySequenceable(0, '')
                expect(result.reply.readSequenceable(s)).assertTrue()
                expect(s.num).assertEqual(1)
                expect(s.str).assertEqual("aaa")
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00200:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_00200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_00300
     * @tc.name    Test that messageparcel passes through the same process, and the client
     *             receives the reply message in the callback function
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00300", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeByte(1)).assertTrue()
            expect(data.writeShort(2)).assertTrue()
            expect(data.writeInt(3)).assertTrue()
            expect(data.writeLong(10000)).assertTrue()
            expect(data.writeFloat(1.2)).assertTrue()
            expect(data.writeDouble(10.2)).assertTrue()
            expect(data.writeBoolean(true)).assertTrue()
            expect(data.writeChar(96)).assertTrue()
            expect(data.writeString("HelloWorld")).assertTrue()
            expect(data.writeSequenceable(new MySequenceable(1, "aaa"))).assertTrue()

            function sendRequestCallback(result) {
                try{
                    console.info("sendRequest Callback")
                    console.info("sendRequest done, error code: " + result.errCode)
                    expect(result.errCode).assertEqual(0)
                    expect(result.reply.readByte()).assertEqual(1)
                    expect(result.reply.readShort()).assertEqual(2)
                    expect(result.reply.readInt()).assertEqual(3)
                    expect(result.reply.readLong()).assertEqual(10000)
                    expect(result.reply.readFloat()).assertEqual(1.2)
                    expect(result.reply.readDouble()).assertEqual(10.2)
                    expect(result.reply.readBoolean()).assertTrue()
                    expect(result.reply.readChar()).assertEqual(96)
                    expect(result.reply.readString()).assertEqual("HelloWorld")
                    let s = new MySequenceable(null, null)
                    expect(result.reply.readSequenceable(s)).assertTrue()
                    expect(s.num).assertEqual(1)
                    expect(s.str).assertEqual("aaa")
                } finally {
                    result.data.reclaim();
                    result.reply.reclaim();
                    console.info("test done")
                    done()
                }
            }
            console.info("start send request")
            await gIRemoteObject.sendRequest(CODE_ALL_TYPE, data, reply, option, sendRequestCallback)

        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00300:error = " + error);
        }
        console.info("--------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_00300--------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_00400
     * @tc.name    Iremoteobject, register death notification verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00400", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00400---------------------------");
        try{
            let object = new TestAbilityStub("Test1")
            var resultAdd1 = object.addDeathRecipient(null, 0)
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00400:run addDeathRecipient is " + resultAdd1);
            expect(resultAdd1).assertEqual(false);

            var resultRemove1 = object.removeDeathRecipient(null, 0)
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00400:run removeDeathRecipient1 is " + resultRemove1);
            expect(resultRemove1).assertEqual(false);

            let isDead = object.isObjectDead()
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00400:run  isDead result is " + isDead);
            expect(isDead).assertEqual(false);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00400:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_00400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_00500
     * @tc.name    Do not get the server agent, do not create a remoteobject instance, and directly getcallingpid,
     *             getcallingpid, getcallingdeviceid, getlocaldeviceid
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00500", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00500---------------------------");
        try{
            let callingPid = rpc.IPCSkeleton.getCallingPid()
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00500: run getCallingPid is " + callingPid);
            expect(callingPid != null).assertTrue();

            let callingUid = rpc.IPCSkeleton.getCallingUid()
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00500: run getCallingPid is " + callingUid);
            expect(callingUid != null).assertTrue();

            let callingDeviceID = rpc.IPCSkeleton.getCallingDeviceID()
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00500: run getCallingDeviceID is " + callingDeviceID);
            expect(callingDeviceID).assertEqual("");

            let localDeviceID = rpc.IPCSkeleton.getLocalDeviceID()
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00500: run getLocalDeviceID is " + localDeviceID);
            expect(localDeviceID).assertEqual("");
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00500:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_00500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_00600
     * @tc.name    Querylocalinterface searches for objects based on descriptors
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00600", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00600---------------------------");
        try{
            let object = new TestAbilityStub("Test1");
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00600: run TestAbilityStub success");
            let result = object.isObjectDead()
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00600: run isObjectDead is " + result);
            expect(result).assertEqual(false)

            let callingPid = object.getCallingPid()
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00600: run getCallingPid is " + callingPid);

            let callingUid = object.getCallingUid()
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00600: run getCallingUid is " + callingUid);

            object.attachLocalInterface(object, "Test1")
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00600: run attachLocalInterface success");

            let res = object.queryLocalInterface("Test1")
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00600: run queryLocalInterface is " + res);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00600:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_00600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_00700
     * @tc.name    Getinterfacedescriptor to get the interface description
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00700", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00700---------------------------");
        try{
            let object = new TestAbilityStub("Test1223");
            let result = object.isObjectDead()
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00700: run isObjectDead is " + result);
            expect(result).assertEqual(false);

            let callingPid = object.getCallingPid();
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00700: run getCallingPid is " + callingPid);

            let callingUid = object.getCallingUid();
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00700: run getCallingPid is " + callingUid);

            object.attachLocalInterface(object, "test1");
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00700: run attachLocalInterface success");

            let result2 = object.getInterfaceDescriptor();
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00700: run getInterfaceDescriptor is " + result2);
            expect(result2).assertEqual("test1");
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00700:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_00700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_00800
     * @tc.name    IRemoteObject sendRequestAsync API Test
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00800", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00800: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeByte(1)).assertTrue()
            expect(data.writeShort(2)).assertTrue()
            expect(data.writeInt(3)).assertTrue()
            expect(data.writeLong(10000)).assertTrue()
            expect(data.writeFloat(1.2)).assertTrue()
            expect(data.writeDouble(10.2)).assertTrue()
            expect(data.writeBoolean(true)).assertTrue()
            expect(data.writeChar(96)).assertTrue()
            expect(data.writeString("HelloWorld")).assertTrue()
            expect(data.writeSequenceable(new MySequenceable(1, "aaa"))).assertTrue()

            await gIRemoteObject.sendRequestAsync(CODE_ALL_TYPE, data, reply, option, (err, result) => {
                console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00800:sendRequest done, error code: " + result.errCode)
                expect(result.errCode).assertEqual(0)
                expect(result.reply.readByte()).assertEqual(1)
                expect(result.reply.readShort()).assertEqual(2)
                expect(result.reply.readInt()).assertEqual(3)
                expect(result.reply.readLong()).assertEqual(10000)
                expect(result.reply.readFloat()).assertEqual(1.2)
                expect(result.reply.readDouble()).assertEqual(10.2)
                expect(result.reply.readBoolean()).assertTrue()
                expect(result.reply.readChar()).assertEqual(96)
                expect(result.reply.readString()).assertEqual("HelloWorld")
                let s = new MySequenceable(0, '')
                expect(result.reply.readSequenceable(s)).assertTrue()
                expect(s.num).assertEqual(1)
                expect(s.str).assertEqual("aaa")
            });
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00800:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_00800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_00900
     * @tc.name    Test that messageparcel passes through the same process, and the client
     *             receives the reply message in the callback function
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00900", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00900---------------------------");
        try{
            let object = new TestAbilityStub("TestAbilityStub")
            var data = rpc.MessageParcel.create();
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeInterfaceToken("TestAbilityStub")).assertTrue()
            expect(data.writeByte(2)).assertTrue()
            expect(data.writeShort(3)).assertTrue()
            expect(data.writeInt(4)).assertTrue()
            expect(data.writeLong(5)).assertTrue()
            expect(data.writeFloat(1.2)).assertTrue()
            expect(data.writeDouble(10.2)).assertTrue()
            expect(data.writeBoolean(true)).assertTrue()
            expect(data.writeChar(5)).assertTrue()
            expect(data.writeString("HelloWorld")).assertTrue()
            expect(data.writeSequenceable(new MySequenceable(1, "aaa"))).assertTrue()

            function sendRequestCallback(result) {
                try{
                    console.info("sendRequest Callback")
                    console.info("sendRequest done, error code: " + result.errCode)
                    expect(result.errCode).assertEqual(0)
                    result.reply.readException()
                    expect(result.reply.readByte()).assertEqual(2)
                    expect(result.reply.readShort()).assertEqual(3)
                    expect(result.reply.readInt()).assertEqual(4)
                    expect(result.reply.readLong()).assertEqual(5)
                    expect(result.reply.readFloat()).assertEqual(1.2)
                    expect(result.reply.readDouble()).assertEqual(10.2)
                    expect(result.reply.readBoolean()).assertTrue()
                    expect(result.reply.readChar()).assertEqual(5)
                    expect(result.reply.readString()).assertEqual("HelloWorld")
                    let s = new MySequenceable(null, null)
                    expect(result.reply.readSequenceable(s)).assertTrue()
                    expect(s.num).assertEqual(1)
                    expect(s.str).assertEqual("aaa")
                } finally {
                    result.data.reclaim();
                    result.reply.reclaim();
                    console.info("test done")
                    done()
                }
            }

            console.info("start send request")
            object.sendRequest(CODE_SAME_PROCESS, data, reply, option, sendRequestCallback)

        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_00900:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_00900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00100
     * @tc.name    Call adddeathrecipient to register the death notification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00100", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00100---------------------------");
        try{
            let recipient = new MyDeathRecipient(gIRemoteObject, null);
            var resultAdd1 = gIRemoteObject.addDeathRecipient(recipient, 0);
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00100:run addDeathRecipient first is " + resultAdd1);
            expect(resultAdd1).assertTrue();
            var resultAdd2 = gIRemoteObject.addDeathRecipient(recipient, 0);
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00100:run addDeathRecipient second is " + resultAdd2);
            expect(resultAdd2).assertTrue();
            var resultRemove1 = gIRemoteObject.removeDeathRecipient(recipient, 0);
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00100:run removeDeathRecipient1 is " + resultRemove1);
            expect(resultRemove1).assertTrue();
            var resultRemove2 = gIRemoteObject.removeDeathRecipient(recipient, 0);
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00100:run  removeDeathRecipient2 is " + resultRemove2);
            expect(resultRemove2).assertTrue();
            var resultRemove3 = gIRemoteObject.removeDeathRecipient(recipient, 0);
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00100:run  removeDeathRecipient3 is " + resultRemove3);
            expect(resultRemove3).assertEqual(false)();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00100:error = " + error);
            expect(error != null).assertTrue();
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00200
     * @tc.name    Adddeathrecipient verifies the minimum boundary out of range value of the interface flag
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00200", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00200---------------------------");
        try{
            let recipient = new MyDeathRecipient(gIRemoteObject, null);
            var resultAdd = gIRemoteObject.addDeathRecipient(recipient, -(2*G));
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00200:run addDeathRecipient first is " + resultAdd);
            expect(resultAdd).assertTrue();
            var resultRemove = gIRemoteObject.removeDeathRecipient(recipient, -(2*G));
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00300:run removeDeathRecipient1 is " + resultRemove);
            expect(resultRemove).assertTrue();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00200:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00300
     * @tc.name    Adddeathrecipient verifies the maximum boundary out of range value of the interface flag
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00300", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00300---------------------------");
        try{
            let recipient = new MyDeathRecipient(gIRemoteObject, null);
            var resultAdd = gIRemoteObject.addDeathRecipient(recipient, (2*G - 1));
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00300:run addDeathRecipient is " + resultAdd);
            expect(resultAdd).assertTrue();
            var resultRemove = gIRemoteObject.removeDeathRecipient(recipient, (2*G - 1));
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00300:run removeDeathRecipient1 is " + resultRemove);
            expect(resultRemove).assertTrue();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00300:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00400
     * @tc.name    Adddeathrecipient verifies the minimum boundary out of range value of the interface flag
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00400", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00400---------------------------");
        try{
            let recipient = new MyDeathRecipient(gIRemoteObject, null);
            var resultAdd = gIRemoteObject.addDeathRecipient(recipient, 2*G);
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00400:run addDeathRecipient first is " + resultAdd);
            expect(resultAdd).assertTrue();
            var resultRemove = gIRemoteObject.removeDeathRecipient(recipient, 2*G);
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00400:run removeDeathRecipient1 is " + resultRemove);
            expect(resultRemove).assertTrue();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00400:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00500
     * @tc.name    Adddeathrecipient verifies the maximum boundary out of range value of the interface flag
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00500", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00500---------------------------");
        try{
            let recipient = new MyDeathRecipient(gIRemoteObject, null);
            var resultAdd = gIRemoteObject.addDeathRecipient(recipient, -(2*G + 1));
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00500:run addDeathRecipient first is " + resultAdd);
            expect(resultAdd).assertTrue();
            var resultRemove = gIRemoteObject.removeDeathRecipient(recipient, -(2*G + 1));
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00300:run removeDeathRecipient1 is " + resultRemove);
            expect(resultRemove).assertTrue();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00500:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00600
     * @tc.name    Call isobjectdead to check whether the object is dead
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00600", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00600---------------------------");
        try{
            let recipient = new MyDeathRecipient(gIRemoteObject, null)
            var isDead = gIRemoteObject.isObjectDead();
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00600: run isObjectDead is " + isDead);
            expect(isDead == false).assertTrue();

            var resultAdd1 = gIRemoteObject.addDeathRecipient(recipient, 0)
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00600:run addDeathRecipient is " + resultAdd1);
            expect(resultAdd1 == true).assertTrue();

            var isDead1 = gIRemoteObject.isObjectDead();
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00600: run isObjectDead is " + isDead1);
            expect(isDead1 == false).assertTrue();

            var resultRemove1 = gIRemoteObject.removeDeathRecipient(recipient, 0)
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00600:run removeDeathRecipient is " + resultRemove1);
            expect(resultRemove1 == true).assertTrue();

            var resultAdd2 = gIRemoteObject.addDeathRecipient(recipient, 0)
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00600:run addDeathRecipient is " + resultAdd2);
            expect(resultAdd2 == true).assertTrue();

            var resultRemove2 = gIRemoteObject.removeDeathRecipient(recipient, 0)
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00600:run removeDeathRecipient1 is " + resultRemove2);
            expect(resultRemove2 == true).assertTrue();

            var resultRemove3 = gIRemoteObject.removeDeathRecipient(recipient, 0)
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00600:run removeDeathRecipient3 is " + resultRemove3);
            expect(resultRemove3 == false).assertTrue();

            var isDead2 = gIRemoteObject.isObjectDead();
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00600: run isObjectDead2 is " + isDead2);
            expect(isDead2 == false).assertTrue();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00600:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00700
     * @tc.name    Getinterfacedescriptor to get the object interface description
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00700", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00700---------------------------");
        try{
            let object = new TestAbilityStub("Test0300");

            let result = object.getInterfaceDescriptor()
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00700: run getInterfaceDescriptor is " + result);
            expect(result).assertEqual("Test0300");
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00700:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00800
     * @tc.name    Querylocalinterface searches for objects based on descriptors
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00800", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00800---------------------------");
        try{
            let object = new TestAbilityStub("Test0400");

            let result = object.isObjectDead();
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00800: run getInterfaceDescriptor is " + result);
            expect(result).assertEqual(false);
            object.attachLocalInterface(object, "Test2");
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00800: run attachLocalInterface success");
            let res2 = object.queryLocalInterface('Test2');
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00800: run queryLocalInterface is " + res2);
            let resultDescrip = object.getInterfaceDescriptor()
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00800: run getInterfaceDescriptor is " + resultDescrip);
            expect(resultDescrip).assertEqual("Test2");
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00800:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00900
     * @tc.name    Transaction constant validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00900", 0, async function(){
        console.info("----------------------------SUB_Softbus_RPC_Compatibility_RemoteProxy_00900 is starting-------------");
        try {
            expect(rpc.RemoteProxy.PING_TRANSACTION).assertEqual(1599098439);
            expect(rpc.RemoteProxy.DUMP_TRANSACTION).assertEqual(1598311760);
            expect(rpc.RemoteProxy.INTERFACE_TRANSACTION).assertEqual(1598968902);
            expect(rpc.RemoteProxy.MIN_TRANSACTION_ID).assertEqual(0x1);
            expect(rpc.RemoteProxy.MAX_TRANSACTION_ID).assertEqual(0x00FFFFFF);
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_00900 error is" + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00900---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00100
     * @tc.name    Create exception object and verify the function of flushcommands interface
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_Softbus_RPC_Compatibility_IPCSkeleton_00100', 0, async function() {
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00100---------------------------");
        try {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00100 testcase")
            let remoteObject = new TestRemoteObject("aaa");
            let ret = rpc.IPCSkeleton.flushCommands(remoteObject);
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00100 RpcServer: flushCommands result: " + ret);
            expect(ret).assertEqual(101);
        }
        catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00100 error is :" + error)
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00100---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00200
     * @tc.name    Establish constructor object and verify the function of flushcommands interface
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_Softbus_RPC_Compatibility_IPCSkeleton_00200', 0, async function() {
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00200---------------------------");
        try {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00200 testcase")
            let remoteObject = {};
            let ret = rpc.IPCSkeleton.flushCommands(remoteObject);
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00200 RpcServer: flushCommands result: " + ret);
            expect(ret).assertEqual(101);
        }
        catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00200 error is :" + error)
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00200---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00300
     * @tc.name    Create object, getinterfacedescriptor interface function verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_Softbus_RPC_Compatibility_IPCSkeleton_00300', 0, async function() {
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00300---------------------------");
        try {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00300 testcase")
            let samgr = rpc.IPCSkeleton.getContextObject();
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00300 getContextObject result: " + samgr);
            expect(samgr != null).assertTrue();
            let geinde = samgr.getInterfaceDescriptor();
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00300 getInterfaceDescriptor result: " + geinde);
            expect(geinde).assertEqual("");
        }
        catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00300 error is :" + error)
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00300---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00400
     * @tc.name    getCallingPid, getCallingUid to get the local value
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_Softbus_RPC_Compatibility_IPCSkeleton_00400', 0, async function() {
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00400---------------------------");
        try {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00400 testcase")
            let getCallingPid = rpc.IPCSkeleton.getCallingPid();
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00400 getCallingPid result: " + getCallingPid);
            expect(getCallingPid != null).assertTrue();
            let getCallingUid = rpc.IPCSkeleton.getCallingUid();
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00400 getCallingUid result: " + getCallingUid);
            expect(getCallingUid != null).assertTrue();
        }
        catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00400 error is :" + error)
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00400---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00500
     * @tc.name    Call getlocaldeviceid, getcallingdeviceid to get the local value
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_Softbus_RPC_Compatibility_IPCSkeleton_00500', 0, async function() {
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00500---------------------------");
        try {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00500 testcase")
            let getCallingPid = rpc.IPCSkeleton.getLocalDeviceID();
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00500 getCallingPid result: " + getCallingPid);
            expect(getCallingPid != null).assertTrue();
            let getCallingUid = rpc.IPCSkeleton.getCallingDeviceID();
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00500 getCallingUid result: " + getCallingUid);
            expect(getCallingUid != null).assertTrue();
        }
        catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00500 error is :" + error)
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00500---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00600
     * @tc.name    Do not get the server agent, do not create a remoteobject instance, and directly getcallingpid,
     *             getcallingpid, getcallingdeviceid, getlocaldeviceid
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_Softbus_RPC_Compatibility_IPCSkeleton_00600', 0, async function() {
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00600---------------------------");
        try{
            let getCallingPid = rpc.IPCSkeleton.getCallingPid();
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00600: run  getCallingPid is :" + getCallingPid);
            expect(getCallingPid != null).assertTrue();

            let getCallingUid = rpc.IPCSkeleton.getCallingUid();
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00600: run getCallingUid is :" + getCallingUid);
            expect(getCallingUid != null).assertTrue();

            let getCallingToKenId = rpc.IPCSkeleton.getCallingTokenId();
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00600: run getCallingToKenId is :" + getCallingToKenId);
            expect(getCallingToKenId != null).assertTrue();

            let getLocalDeviceID = rpc.IPCSkeleton.getLocalDeviceID();
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00600: run getLocalDeviceID is :" + getLocalDeviceID);
            expect(getLocalDeviceID != null).assertTrue();

            let getCallingDeviceID = rpc.IPCSkeleton.getCallingDeviceID();
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00600: run getCallingDeviceID is :" + getCallingDeviceID);
            expect(getCallingDeviceID != null).assertTrue();
        } catch (error){
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00600: error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00600---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00700
     * @tc.name    Test the getcallingpid and getcallinguid basic methods of ipcskeleton
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00700", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00700---------------------------");
        try{
            expect(rpc.IPCSkeleton.getContextObject().getInterfaceDescriptor()).assertEqual("");
            let callingPid = rpc.IPCSkeleton.getCallingPid();
            let callingUid = rpc.IPCSkeleton.getCallingUid();
            let option = new rpc.MessageOption();
            let data = rpc.MessageParcel.create();
            let reply = rpc.MessageParcel.create();
            expect(data.writeInterfaceToken("rpcTestAbility")).assertTrue();
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00700： callingPid: " + callingPid
                + ", callingUid: " + callingUid);
            expect(callingUid != null).assertTrue();
            expect(callingPid != null).assertTrue();
            await gIRemoteObject.sendRequest(CODE_IPCSKELETON, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00700： sendRequest done, error code: " + result.errCode)
                expect(result.errCode).assertEqual(0);
                result.reply.readException();
                let rescallingPid = result.reply.readInt();
                let rescallingUid = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00700：" + rescallingPid +" ;"+ rescallingUid);
                expect(rescallingPid).assertEqual(callingPid);
                expect(rescallingUid).assertEqual(callingUid);
            })
            data.reclaim();
            reply.reclaim();
            done();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00700:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00800
     * @tc.name    Basic method of testing ipcskeleton
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00800", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00800---------------------------");
        try{
            let callingPid = rpc.IPCSkeleton.getCallingPid();
            let callingUid = rpc.IPCSkeleton.getCallingUid();
            let option = new rpc.MessageOption();
            let data = rpc.MessageParcel.create();
            let reply = rpc.MessageParcel.create();
            expect(data.writeInterfaceToken("rpcTestAbility")).assertTrue();
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00800： callingPid: " + callingPid
                + ", callingUid: " + callingUid);
            await gIRemoteObject.sendRequest(CODE_IPCSKELETON_INT, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00800： sendRequest done, error code: " + result.errCode);
                expect(result.errCode).assertEqual(0);
                result.reply.readException();
                let rescallingPid = result.reply.readInt();
                let rescallingUid = result.reply.readInt();
                let restcallingPid = result.reply.readInt();
                let restcallingUid = result.reply.readInt();
                let resicallingPid = result.reply.readInt();
                let resicallingUid = result.reply.readInt();
                let resflushCommands = result.reply.readInt();

                console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00800：" + resicallingUid +" ;"+ resflushCommands);
                expect(rescallingPid).assertEqual(callingPid);
                expect(rescallingUid).assertEqual(callingUid);
                expect(restcallingPid).assertEqual(callingPid);
                expect(restcallingUid).assertEqual(callingUid);
                expect(resicallingPid).assertEqual(callingPid);
                expect(resicallingUid).assertEqual(callingUid);
                expect(resflushCommands).assertEqual(101);
            });
            data.reclaim();
            reply.reclaim();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00800:error = " + error);
        }
        done();
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00900
     * @tc.name    Setcallingidentity interface flag input parameter is null authentication
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00900", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00900---------------------------");
        try{
            let id = "";
            let ret = rpc.IPCSkeleton.setCallingIdentity(id);
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00900： setCallingIdentity is: " + ret);
            expect(ret).assertTrue();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00900:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_01000
     * @tc.name    Setcallingidentity interface flag input parameter is 0 authentication
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01000", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_01000---------------------------");
        try{
            let id = 0;
            let ret = rpc.IPCSkeleton.setCallingIdentity(id);
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01000： setCallingIdentity is: " + ret);
            expect(ret).assertTrue();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01000:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_01000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_01100
     * @tc.name    Setcallingidentity interface flag input parameter is boundary value authentication
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01100", 0,async function(){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_01100---------------------------");
        try{
            var id = "";
            for (let i = 0; i < (40*K - 1); i++){
                id += "a";
            }
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01100： id length is: " + id.length);

            let ret = rpc.IPCSkeleton.setCallingIdentity(id);
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01100： setCallingIdentity is: " + ret);
            expect(ret).assertTrue();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01100:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_01100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_01200
     * @tc.name    Basic method of verifying ipcskeleton
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01200",0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_01200---------------------------");
        try{
            expect(rpc.IPCSkeleton.getContextObject().getInterfaceDescriptor()).assertEqual("");
            let callingPid = rpc.IPCSkeleton.getCallingPid();
            let callingUid = rpc.IPCSkeleton.getCallingUid();

            expect(rpc.IPCSkeleton.getCallingDeviceID()).assertEqual("");
            expect(rpc.IPCSkeleton.getLocalDeviceID()).assertEqual("");
            expect(rpc.IPCSkeleton.isLocalCalling()).assertTrue();
            let id = rpc.IPCSkeleton.resetCallingIdentity();
            let ret = rpc.IPCSkeleton.setCallingIdentity(id);
            expect(id).assertEqual("");
            expect(ret).assertTrue();
            expect(rpc.IPCSkeleton.flushCommands(gIRemoteObject)).assertEqual(0);

            let option = new rpc.MessageOption();
            let data = rpc.MessageParcel.create();
            let reply = rpc.MessageParcel.create();
            expect(data.writeInterfaceToken("rpcTestAbility")).assertTrue();
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01200： callingPid: " + callingPid
                + ", callingUid: " + callingUid);
            await gIRemoteObject.sendRequest(CODE_IPCSKELETON, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01200： sendRequest done, error code: " + result.errCode)
                expect(result.errCode).assertEqual(0);
                result.reply.readException();
                expect(result.reply.readInt()).assertEqual(callingPid);
                expect(result.reply.readInt()).assertEqual(callingUid);
                let rescallingDeviceID = result.reply.readString();
                let reslocalDeviceID = result.reply.readString();
                expect(result.reply.readBoolean()).assertEqual(false);
                expect(result.reply.readInt()).assertEqual(callingPid);
                expect(result.reply.readInt()).assertEqual(callingUid);
                expect(result.reply.readInt()).assertEqual(callingPid);
                expect(result.reply.readInt()).assertEqual(callingUid);
                expect(result.reply.readInt()).assertEqual(101);
                console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01200：:" + rescallingDeviceID + ";" +reslocalDeviceID);
            })
            data.reclaim();
            reply.reclaim();
            done();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01200:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_01200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_01300
     * @tc.name    IPCSkeleton sendRequestAsync API test
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01300", 0,async function(done){
        console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_01300---------------------------");
        try{
            expect(rpc.IPCSkeleton.getContextObject().getInterfaceDescriptor()).assertEqual("");
            let callingPid = rpc.IPCSkeleton.getCallingPid();
            let callingUid = rpc.IPCSkeleton.getCallingUid();
            let option = new rpc.MessageOption();
            let data = rpc.MessageParcel.create();
            let reply = rpc.MessageParcel.create();
            expect(data.writeInterfaceToken("rpcTestAbility")).assertTrue();
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01300 callingPid: " + callingPid
                + ", callingUid: " + callingUid);
            expect(callingUid != null).assertTrue();
            expect(callingPid != null).assertTrue();
            await gIRemoteObject.sendRequestAsync(CODE_IPCSKELETON, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01300 sendRequest done, error code: " + result.errCode)
                expect(result.errCode).assertEqual(0);
                result.reply.readException();
                let rescallingPid = result.reply.readInt();
                let rescallingUid = result.reply.readInt();
                console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01300" + rescallingPid +" ;"+ rescallingUid);
                expect(rescallingPid).assertEqual(callingPid);
                expect(rescallingUid).assertEqual(callingUid);
            })
            data.reclaim();
            reply.reclaim();
            done();
        } catch (error) {
            console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01300:error = " + error);
        }
        console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_01300---------------------------");
    });
    console.info("-----------------------SUB_Softbus_RPC_Compatibility_MessageParce_Test is end-----------------------");
});
