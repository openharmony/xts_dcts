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
import fileio from '@ohos.fileio'
import deviceManager from '@ohos.distributedHardware.deviceManager';
import featureAbility from "@ohos.ability.featureAbility";
import process from '@ohos.process';
import {describe, beforeAll, beforeEach, afterEach, afterAll, it, expect} from 'deccjsunit/index';

let gIRemoteObject = null;
let connectId = null;
describe('RpcJsUnitTest', function(){
    console.log("-----------------------SUB_Softbus_RPC_MessageParce_Test is starting-----------------------");

    const CODE_WRITE_BYTEARRAY = 1;
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
    const CODE_FILESDIR = 33;
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
    }

    class TestListener extends rpc.RemoteObject {
        constructor(descriptor, checkResult) {
            super(descriptor);
            this.checkResult = checkResult
        }
        onRemoteRequest(code, data, reply, option) {
            let result = false
            if (code === 1) {
                console.log("onRemoteRequest called, descriptor: " + this.getInterfaceDescriptor())
                result = true
            } else {
                console.log("unknown code: " + code)
            }
            let _checkResult = this.checkResult
            let _num = data.readInt()
            let _str = data.readString()
            setTimeout(function(){
                _checkResult(_num, _str)
            }, 2*1000);
            console.log("result:" + result)
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
                    let tmp2 = data.readByte()
                    let tmp3 = data.readShort()
                    let tmp4 = data.readShort()
                    let tmp5 = data.readInt()
                    let tmp6 = data.readInt()
                    let tmp7 = data.readLong()
                    let tmp8 = data.readLong()
                    let tmp9 = data.readFloat()
                    let tmp10 = data.readFloat()
                    let tmp11 = data.readDouble()
                    let tmp12 = data.readDouble()
                    let tmp13 = data.readBoolean()
                    let tmp14 = data.readBoolean()
                    let tmp15 = data.readChar()
                    let tmp16 = data.readString()
                    let s = new MySequenceable(null, null)
                    data.readSequenceable(s)
                    reply.writeNoException()
                    reply.writeByte(tmp1)
                    reply.writeByte(tmp2)
                    reply.writeShort(tmp3)
                    reply.writeShort(tmp4)
                    reply.writeInt(tmp5)
                    reply.writeInt(tmp6)
                    reply.writeLong(tmp7)
                    reply.writeLong(tmp8)
                    reply.writeFloat(tmp9)
                    reply.writeFloat(tmp10)
                    reply.writeDouble(tmp11)
                    reply.writeDouble(tmp12)
                    reply.writeBoolean(tmp13)
                    reply.writeBoolean(tmp14)
                    reply.writeChar(tmp15)
                    reply.writeString(tmp16)
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
                    console.log('RpcClient: onConnect called,proxy: ' + (remoteProxy instanceof rpc.RemoteProxy))
                    gIRemoteObject = remoteProxy
                    done()
                },
                onDisconnect:function (elementName) {
                    console.log("RpcClient: onDisconnect")
                },
                onFailed:function () {
                    console.log("RpcClient: onFailed")
                    gIRemoteObject = null
                }
            }
            connectId = featureAbility.connectAbility(want, connect)
            connectId.info("connect ability got id: " + connectId)
        }
        deviceManager.createDeviceManager('ohos.rpc.test', deviceManagerCallback)
        console.log("beforeAll done")
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
     * @tc.number  SUB_Softbus_RPC_MessageParcel_0100
     * @tc.name    Call the writeinterfacetoken interface, write the interface descriptor, and read interfacetoken
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_0100", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_0100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_0100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var token = "hello ruan zong xian";
            var result = data.writeInterfaceToken(token);
            console.log("SUB_Softbus_RPC_MessageParcel_0100:run writeInterfaceToken success, result is "
                + result);
            expect(result == true).assertTrue();
            if (gIRemoteObject == undefined){
                console.log("SUB_Softbus_RPC_MessageParcel_0100: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_0100: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var resultToken = result.reply.readInterfaceToken();
                console.log("SUB_Softbus_RPC_MessageParcel_0100:run readInterfaceToken success, result is "
                    + resultToken);
                assertArrayElementEqual(resultToken,token);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_0100:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_0100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_0200
     * @tc.name    Call the writeinterfacetoken interface to write a non string interface descriptor
                   and read interfacetoken
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_0200", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_0200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_0200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 123;
            var result = data.writeInterfaceToken(token);
            console.log("SUB_Softbus_RPC_MessageParcel_0200:run writeInterfaceToken success, result is "
                + result);
            expect(result == false).assertTrue();
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_0200: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_0200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_0300
     * @tc.name    Call the writeshortarray interface, write the array to the messageparcel instance,
     *             and call readshortarray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_0300", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_0300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_0300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wShortArryData = [3, 5, 9];
            var writeShortArrayResult = data.writeShortArray(wShortArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_0300:run writeshortarray success, result is "
                + writeShortArrayResult);
            expect(writeShortArrayResult).assertTrue();
            if (gIRemoteObject == undefined){
                console.log("SUB_Softbus_RPC_MessageParcel_0300: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_0300: result is " + result.errCode);

                var rShortArryData = result.reply.readShortArray();
                console.log("SUB_Softbus_RPC_MessageParcel_0300:run readshortarray success, result is "
                    + rShortArryData);
                assertArrayElementEqual(rShortArryData,wShortArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_0300: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_0300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_0400
     * @tc.name    Call the writeshortarray interface, write the short integer array to the messageparcel instance,
     *             and call readshortarray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_0400", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_0400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_0400: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wShortArryData = [3, 5, 9];
            var writeShortArrayResult = data.writeShortArray(wShortArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_0400:run writeshortarray success, result is "
                + writeShortArrayResult);
            expect(writeShortArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.log("SUB_Softbus_RPC_MessageParcel_0400: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_0400: result is " + result.errCode);

                var rShortArryData =[];
                result.reply.readShortArray(rShortArryData);
                console.log("SUB_Softbus_RPC_MessageParcel_0400:run readshortarray success, result is "
                    + rShortArryData);
                assertArrayElementEqual(rShortArryData,wShortArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_0400: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_0400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_0500
     * @tc.name    Writeshortarray interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_0500", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_0500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_0500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wShortArryData = [-32768, 0, 1, 2, 32767];
            var writeShortArrayResult = data.writeShortArray(wShortArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_0500:run writeshortarray success, result is "
                + writeShortArrayResult);
            expect(writeShortArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.log("SUB_Softbus_RPC_MessageParcel_0500: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_0500: result is " + result.errCode);

                var rShortArryData =  result.reply.readShortArray();
                console.log("SUB_Softbus_RPC_MessageParcel_0500:run readshortarray success, result is "
                    + rShortArryData);
                assertArrayElementEqual(rShortArryData,wShortArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_0500: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_0500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_0600
     * @tc.name    Writeshortarray interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_0600", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_0600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_0600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var eShortArryData = [-32769, 32768];
            var eWriteShortArrayResult = data.writeShortArray(eShortArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_0600:run  Writeshortarray success, result is "
                + eWriteShortArrayResult);
            expect(eWriteShortArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.log("SUB_Softbus_RPC_MessageParcel_0600: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_0600: result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var reShortArryData = result.reply.readShortArray();
                console.log("SUB_Softbus_RPC_MessageParcel_0600:run readshortarray success, result is "
                    + reShortArryData);
                var erShortArryData = [32767, -32768];
                assertArrayElementEqual(erShortArryData,reShortArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_0600: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_0600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_0700
     * @tc.name    Call the writelongarray interface, write the long integer array to the messageparcel instance,
     *             and call readlongarray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_0700", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_0700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_0700: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wLongArryData = [3276826, 123456, 9999999];
            var writeLongArrayResult = data.writeLongArray(wLongArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_0700:run writelongarray success, result is "
                + writeLongArrayResult);
            expect(writeLongArrayResult == true).assertTrue();

            if (gIRemoteObject == undefined){
                console.log("SUB_Softbus_RPC_MessageParcel_0700: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_0700: result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rLongArryData = result.reply.readLongArray();
                console.log("SUB_Softbus_RPC_MessageParcel_0700:run readlongarray success, result is "
                    + rLongArryData);
                assertArrayElementEqual(rLongArryData,wLongArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_0700: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_0700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_0800
     * @tc.name    Call the writelongarray interface, write the long integer array to the messageparcel instance,
     *             and call readlongarray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_0800", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_0800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_0800: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wLongArryData = [3276826, 1234567, 99999999];
            var wLongArrayResult = data.writeLongArray(wLongArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_0800:run writelongarray success, result is "
                + wLongArrayResult);
            expect(wLongArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.log("SUB_Softbus_RPC_MessageParcel_0800: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_0800: result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rLongArryData = [];
                result.reply.readLongArray(rLongArryData);
                console.log("SUB_Softbus_RPC_MessageParcel_0800:run readlongarray success, result is "
                    + rLongArryData);
                assertArrayElementEqual(rLongArryData,wLongArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_0800: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_0800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_0900
     * @tc.name    Writelongarray interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_0900", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_0900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_0900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wLongArryData = [-2147483648, 0, 1, 2, 2147483647];
            var wLongArrayResult = data.writeLongArray(wLongArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_0900:run writelongarray success, result is "
                + wLongArrayResult);
            expect(wLongArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.log("SUB_Softbus_RPC_MessageParcel_0900: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_0900: result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rLongArryData = [];
                result.reply.readLongArray(rLongArryData);
                console.log("SUB_Softbus_RPC_MessageParcel_0900:run readlongarray success, result is "
                    + rLongArryData);
                assertArrayElementEqual(rLongArryData,wLongArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_0900: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_0900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_1000
     * @tc.name    Writelongarray interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_1000", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_1000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_1000: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var wLongArryData = [-2147483649, 2147483648];
            var wLongArrayResult = data.writeLongArray(wLongArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_1000:run writelongarray success, result is "
                + wLongArrayResult);
            expect(wLongArrayResult).assertTrue();
            if (gIRemoteObject == undefined){
                console.log("SUB_Softbus_RPC_MessageParcel_1000: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_1000: result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rLongArryData = result.reply.readLongArray();
                console.log("SUB_Softbus_RPC_MessageParcel_1000:run readlongarray success, result is "
                    + rLongArryData);
                assertArrayElementEqual(rLongArryData,wLongArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_1000: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_1000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_1100
     * @tc.name    Call the writedoublearray interface, write the array to the messageparcel instance,
     *             and call readdoublearra to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_1100", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_1100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_1100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wDoubleArryData = [1.2, 235.67, 99.76];
            var writeDoubleArrayResult = data.writeDoubleArray(wDoubleArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_1100:run writedoublearray success, result is "
                + writeDoubleArrayResult);
            expect(writeDoubleArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.log("SUB_Softbus_RPC_MessageParcel_1100: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_1100: result is " + result.errCode);

                var rDoubleArryData = result.reply.readDoubleArray();
                console.log("SUB_Softbus_RPC_MessageParcel_1100:run readdoublearray success, result is "
                    + rDoubleArryData);

                assertArrayElementEqual(rDoubleArryData, wDoubleArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_1100: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_1100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_1200
     * @tc.name    Call the writedoublearray interface, write the array to the messageparcel instance,
     *             and call readdoublearra (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_1200", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_1200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_1200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wDoubleArryData = [1.2, 235.67, 99.76];
            var writeDoubleArrayResult = data.writeDoubleArray(wDoubleArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_1200:run writedoublearray success, result is "
                + writeDoubleArrayResult);
            expect(writeDoubleArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.log("SUB_Softbus_RPC_MessageParcel_1200: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_1200: result is " + result.errCode);

                var rDoubleArryData = [];
                result.reply.readDoubleArray(rDoubleArryData);
                console.log("SUB_Softbus_RPC_MessageParcel_1200:run readdoublearray success, result is "
                    + rDoubleArryData);

                assertArrayElementEqual(rDoubleArryData, wDoubleArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_1200: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_1200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_1300
     * @tc.name    Writedoublearray interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_1300", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_1300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_1300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wDoubleArryData = [-1235453.2, 235.67, 9987659.76];
            var writeDoubleArrayResult = data.writeDoubleArray(wDoubleArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_1300:run writedoublearray success, result is "
                + writeDoubleArrayResult);
            expect(writeDoubleArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.log("SUB_Softbus_RPC_MessageParcel_1300: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_1300: result is " + result.errCode);

                var rDoubleArryData = result.reply.readDoubleArray();
                console.log("SUB_Softbus_RPC_MessageParcel_1300:run readdoublearray success, result is "
                    + rDoubleArryData);

                assertArrayElementEqual(rDoubleArryData, wDoubleArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_1300: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_1300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_1400
     * @tc.name    Writedoublearray interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_1400", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_1400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_1400: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var eDoubleArryData = [-12354883737337373873853.2, 235.67, 99999999999999993737373773987659.76];
            var eWriteDoubleArrayResult = data.writeDoubleArray(eDoubleArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_1400:run writedoublearray success, result is "
                + eWriteDoubleArrayResult);
            expect(eWriteDoubleArrayResult).assertTrue();

            if (gIRemoteObject == undefined){
                console.log("SUB_Softbus_RPC_MessageParcel_1400: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_1400: result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_1400: error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_1400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_1500
     * @tc.name    Call the writebooleanarray interface, write the array to the messageparcel instance,
     *             and call readbooleanarray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_1500", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_1500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_1500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wBooleanArryData = [true, false, false];
            var writeBooleanArrayResult = data.writeBooleanArray(wBooleanArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_1500: run writeboolean success, result is "
                + writeBooleanArrayResult);
            expect(writeBooleanArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_1500: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_1500: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rBooleanArryData = result.reply.readBooleanArray();
                console.log("SUB_Softbus_RPC_MessageParcel_1500: run readboolean is success, result is "
                    + rBooleanArryData);
                assertArrayElementEqual(rBooleanArryData,wBooleanArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_1500: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_1500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_1600
     * @tc.name    Call the writebooleanarray interface, write the array to the messageparcel instance,
     *             and call readbooleanarray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_1600", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_1600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_1600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wBooleanArryData = [true, false, false];
            var writeBooleanArrayResult = data.writeBooleanArray(wBooleanArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_1600: run Writeboolean success, result is "
                + writeBooleanArrayResult);
            expect(writeBooleanArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_1600: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_1600: sendRequest success, result is " + result.errCode);

                var rBooleanArryData = [];
                result.reply.readBooleanArray(rBooleanArryData);
                console.log("SUB_Softbus_RPC_MessageParcel_1600: run readboolean is success, result is "
                    + rBooleanArryData);
                assertArrayElementEqual(rBooleanArryData,wBooleanArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_1600: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_1600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_1700
     * @tc.name    Writebooleanarray interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_1700", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_1700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_1700: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var errorBooleanArryData = [true, 9, false];
            var errorWriteBooleanArrayResult = data.writeBooleanArray(errorBooleanArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_1700: run Writeboolean success, result is "
                + errorWriteBooleanArrayResult);
            expect(errorWriteBooleanArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_1700: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_1700: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var eCharArrayData = [true, false, false];
                assertArrayElementEqual(result.reply.readBooleanArray(),eCharArrayData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_1700: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_1700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_1800
     * @tc.name    Call the writechararray interface, write the array to the messageparcel instance,
     *             and call readchararray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_1800", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_1800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_1800: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var wCharArryData = ['e', 'u', 'a'];
            var writeCharArrayResult = data.writeCharArray(wCharArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_1800: run writechararray success, result is "
                + writeCharArrayResult);
            expect(writeCharArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_1800: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_1800: sendRequest success, result is " + result.errCode);

                var rCharArryData = result.reply.readCharArray();
                console.log("SUB_Softbus_RPC_MessageParcel_1800: run readchararray is success, result is "
                    + rCharArryData);
                assertArrayElementEqual(rCharArryData,wCharArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_1800: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_1800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_1900
     * @tc.name    Call the writechararray interface, write the array to the messageparcel instance,
     *             and call readchararray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_1900", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_1900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_1900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wCharArryData = ['e', 'u', 'a'];
            var writeCharArrayResult = data.writeCharArray(wCharArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_1900: run writechararray success, result is "
                + writeCharArrayResult);
            expect(writeCharArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_1900: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_1900: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rCharArryData = [];
                result.reply.readCharArray(rCharArryData);
                console.log("SUB_Softbus_RPC_MessageParcel_1900: run readchararray is success, result is "
                    + rCharArryData);
                assertArrayElementEqual(rCharArryData,wCharArryData);
            });

        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_1900: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_1900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_2000
     * @tc.name    Writechararray interface, illegal value validation
     * @tc.desc    Function test
     */
    it("SUB_Softbus_RPC_MessageParcel_2000", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_2000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_2000: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var errorCharArryData = ['e', 'asfgdgdtu', 'a'];
            var errorWriteCharArrayResult = data.writeCharArray(errorCharArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_2000: run Writechararray success, result is "
                + errorWriteCharArrayResult);
            expect(errorWriteCharArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_2000: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_2000: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var eCharArrayData = ['e', 'a', 'a'];
                assertArrayElementEqual(result.reply.readCharArray(),eCharArrayData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_2000: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_2000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_2100
     * @tc.name    Call the writestringarray interface, write the array to the messageparcel instance,
     *             and call readstringarray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_2100", 0, async function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_2100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_2100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wStringArryData = ['abc', 'hello', 'beauty'];
            var writeStringArrayResult = data.writeStringArray(wStringArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_2100: run writestringarray success, result is "
                + writeStringArrayResult);
            expect(writeIntArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_2100: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_STRINGARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_2100: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rStringArryData = result.reply.readStringArray();
                console.log("SUB_Softbus_RPC_MessageParcel_2100: run readstringarray is success, result is "
                    + rStringArryData);
                assertArrayElementEqual(rStringArryData,wStringArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_2100: error " + error);
        }
        data.reclaim();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_2100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_2200
     * @tc.name    Call the writestringarray interface, write the array to the messageparcel instance,
     *             and call readstringarray() to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_2200", 0, async function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_2200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_2200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var wStringArryData = ['abc', 'hello', 'beauty'];
            var writeStringArrayResult = data.writeStringArray(wStringArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_2200: run writestringarray success, result is "
                + writeStringArrayResult);
            expect(writeIntArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_2200: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_STRINGARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_2200: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var rStringArryData = [];
                result.reply.readStringArray(rStringArryData);
                console.log("SUB_Softbus_RPC_MessageParcel_2200: run readstringarray is success, result is "
                    + rStringArryData);
                assertArrayElementEqual(rStringArryData,wStringArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_2200: error " + error);
        }
        data.reclaim();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_2200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_2300
     * @tc.name    Writestringarray interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_2300", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_2300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_2300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var errorStringArryData = ['abc' , 123, 'beauty'];
            var errorWriteStringArrayResult = data.writeStringArray(errorStringArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_2300: run writeFloatArray success, result is "
                + errorWriteStringArrayResult);
            expect(errorWriteStringArrayResult).assertFlase();

        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_2300: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_2300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_2400
     * @tc.name    Call the writebytearray interface, write the array to the messageparcel instance,
     *             and call readbytearray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_2400", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_2400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_2400: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            let ByteArrayVar = new Int8Array([1, 2, 3, 4, 5]);
            var writeShortArrayResult = data.writeByteArray(ByteArrayVar);
            console.log("SUB_Softbus_RPC_MessageParcel_2400: run writeShortArray success, result is "
                + writeShortArrayResult);
            expect(writeShortArrayResult == true).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_2400: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_2400: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var shortArryDataReply = result.reply.readByteArray();
                console.log("SUB_Softbus_RPC_MessageParcel_2400: run readByteArray is success, result is "
                    + shortArryDataReply);
                assertArrayElementEqual(shortArryDataReply,ByteArrayVar);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_2400: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_2400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_2500
     * @tc.name    Call the writebytearray interface, write the array to the messageparcel instance,
     *             and call readbytearray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_2500", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_2500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_2500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            let ByteArrayVar = new Int8Array([1, 2, 3, 4, 5]);
            var writeShortArrayResult = data.writeByteArray(ByteArrayVar);
            console.log("SUB_Softbus_RPC_MessageParcel_2500: run writeShortArray success, result is "
                + writeShortArrayResult);
            expect(writeShortArrayResult == true).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_2500: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_2500: sendRequest success, result is " + result.errCode);

                var newArr = new Int8Array(5)
                result.reply.readByteArray(newArr);
                console.log("SUB_Softbus_RPC_MessageParcel_2500: run readByteArray is success, result is "
                    + newArr);
                assertArrayElementEqual(newArr,ByteArrayVar);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_2500: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_2500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_2600
     * @tc.name    Writebytearray interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_2600", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_2600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_2600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            let ByteArrayVar = new Int8Array([-128, 0, 1, 2, 127]);
            var writeShortArrayResult = data.writeByteArray(ByteArrayVar);
            console.log("SUB_Softbus_RPC_MessageParcel_2600: run writeShortArray success, result is "
                + writeShortArrayResult);
            expect(writeShortArrayResult == true).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_2600: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_2600: sendRequest success, result is " + result.errCode);

                var newArr = new Int8Array(5)
                result.reply.readByteArray(newArr);
                console.log("SUB_Softbus_RPC_MessageParcel_2600: run readByteArray is success, result is "
                    + newArr);
                assertArrayElementEqual(newArr,ByteArrayVar);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_2600: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_2600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_2700
     * @tc.name    Writebytearray interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_2700", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_2700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_2700: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            let ByteArrayVar = new Int8Array([-129, 0, 1, 2, 127]);
            var writeShortArrayResult = data.writeByteArray(ByteArrayVar);
            console.log("SUB_Softbus_RPC_MessageParcel_2700: run writeShortArray success, result is "
                + writeShortArrayResult);
            expect(writeShortArrayResult == true).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_2700: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_2700: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var shortArryDataReply = result.reply.readByteArray();
                console.log("SUB_Softbus_RPC_MessageParcel_2700: run readByteArray is success, result is "
                    + shortArryDataReply);
                expect(shortArryDataReply[0] == 127).assertTrue();
                expect(shortArryDataReply[1] == ByteArrayVar[1]).assertTrue();
                expect(shortArryDataReply[2] == ByteArrayVar[2]).assertTrue();
                expect(shortArryDataReply[3] == ByteArrayVar[3]).assertTrue();
                expect(shortArryDataReply[4] == ByteArrayVar[4]).assertTrue();
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_2700: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_2700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_2800
     * @tc.name    Call the writeintarray interface, write the array to the messageparcel instance,
     *             and call readintarray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_2800", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_2800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_2800: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var intArryData = [100, 111, 112];
            var writeShortArrayResult = data.writeIntArray(intArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_2800: run writeShortArray success, result is "
                + writeShortArrayResult);
            expect(writeShortArrayResult == true).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_2800: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_2800: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var shortArryDataReply = result.reply.readIntArray();
                console.log("SUB_Softbus_RPC_MessageParcel_2800: run readByteArray is success, result is "
                    + shortArryDataReply);
                assertArrayElementEqual(shortArryDataReply,intArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_2800: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_2800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_2900
     * @tc.name    Call the writeintarray interface, write the array to the messageparcel instance,
     *             and call readintarray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_2900", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_2900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_2900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var intArryData = [100, 111, 112];
            var writeShortArrayResult = data.writeIntArray(intArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_2900: run writeShortArray success, result is "
                + writeShortArrayResult);
            expect(writeShortArrayResult == true).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_2900: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_2900: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var newArr = []
                result.reply.readIntArray(newArr);
                console.log("SUB_Softbus_RPC_MessageParcel_2900: run readIntArray is success, intArryDataReply is "
                    + newArr);
                assertArrayElementEqual(newArr,intArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_2900: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_2900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_3000
     * @tc.name    Writeintarray interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_3000", 0, async function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_3000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_3000: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var intArryData = [-2147483648, 0, 1, 2, 2147483647];
            var writeIntArrayResult = data.writeIntArray(intArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_3000: run writeShortArray success, result is "
                + writeIntArrayResult);
            expect(writeIntArrayResult).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_3000: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_3000: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var shortArryDataReply = result.reply.readIntArray();
                console.log("SUB_Softbus_RPC_MessageParcel_3000: run readByteArray is success, result is "
                    + shortArryDataReply);
                assertArrayElementEqual(shortArryDataReply,intArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_3000: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_3000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_3100
     * @tc.name    Writeintarray interface, illegal value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_3100", 0, async function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_3100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_3100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var intArryData = [-2147483649, 0, 1, 2, 2147483647];
            var writeIntArrayResult = data.writeIntArray(intArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_3100: run writeShortArray success, result is "
                + writeIntArrayResult);
            expect(writeIntArrayResult).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_3100: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_3100: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var shortArryDataReply = result.reply.readIntArray();
                console.log("SUB_Softbus_RPC_MessageParcel_3100: run readByteArray is success, result is "
                    + shortArryDataReply);
                expect(shortArryDataReply[0] == 2147483647).assertTrue();
                expect(shortArryDataReply[1] == intArryData[1]).assertTrue();
                expect(shortArryDataReply[2] == intArryData[2]).assertTrue();
                expect(shortArryDataReply[3] == intArryData[3]).assertTrue();
                expect(shortArryDataReply[4] == intArryData[4]).assertTrue();
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_3100: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_3100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_3200
     * @tc.name    Call the writefloatarray interface, write the array to the messageparcel instance,
     *             and call readfloatarray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_3200", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_3200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_3200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var floatArryData = [1.2, 1.3, 1.4];
            var writeShortArrayResult = data.writeFloatArray(floatArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_3200: run writeFloatArray success, result is "
                + writeShortArrayResult);
            expect(writeShortArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_3200: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_3200: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var floatArryDataReply = result.reply.readFloatArray();
                console.log("SUB_Softbus_RPC_MessageParcel_3200: run readFloatArray is success, floatArryDataReply is "
                    + floatArryDataReply);
                assertArrayElementEqual(floatArryDataReply,floatArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_3200: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_3200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_3300
     * @tc.name    Call the writefloatarray interface, write the array to the messageparcel instance,
     *             and call readfloatarray (datain: number []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_3300", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_3300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_3300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            var floatArryData = [1.2, 1.3, 1.4]
            var writeShortArrayResult = data.writeFloatArray(floatArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_3300: run writeFloatArray success, result is "
                + writeShortArrayResult);
            expect(writeShortArrayResult).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_3300: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_3300: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var newArr = []
                result.reply.readFloatArray(newArr);
                console.log("SUB_Softbus_RPC_MessageParcel_3300: readFloatArray is success, floatArryDataReply is "
                    + newArr);
                assertArrayElementEqual(newArr,floatArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_3300: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_3300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_3400
     * @tc.name    Writefloatarray interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_3400", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_3400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_3400: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var floatArryData = [-3.40E+38, 1.3, 3.40E+38];
            var writeShortArrayResult = data.writeFloatArray(floatArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_3400: run writeFloatArray success, result is "
                + writeShortArrayResult);
            expect(writeShortArrayResult).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_3400: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_3400: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var newArr = result.reply.readFloatArray();
                console.log("SUB_Softbus_RPC_MessageParcel_3400: run readFloatArray is success, floatArryDataReply is "
                    + newArr);
                assertArrayElementEqual(newArr,floatArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_3400: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_3400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_3500
     * @tc.name    Writefloatarray interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_3500", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_3500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_3500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var floatArryData = [-4.40E+38, 1.3, 3.40E+38];
            var writeShortArrayResult = data.writeFloatArray(floatArryData);
            console.log("SUB_Softbus_RPC_MessageParcel_3500: run writeFloatArray success, result is "
                + writeShortArrayResult);
            expect(writeShortArrayResult).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_3500: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_3500: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var newArr = result.reply.readFloatArray();
                console.log("SUB_Softbus_RPC_MessageParcel_3500: run readFloatArray is success, floatArryDataReply is "
                    + newArr);
                assertArrayElementEqual(newArr,floatArryData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_3500: error " +error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_3500---------------------------");
    });


    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_3600
     * @tc.name    Call the writeShort interface to write the short integer data to the messageparcel instance,
     *             and call readshort to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_3600", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_3600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_3600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var short = 8;
            var writeShor = data.writeShort(short);
            console.log("SUB_Softbus_RPC_MessageParcel_3600: run writeShort success, writeShor is " + writeShor);
            expect(writeShor).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_3600: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SHORT, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_3600: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var readShort = result.reply.readShort();
                console.log("SUB_Softbus_RPC_MessageParcel_3600: run readFloatArray is success, readShort is "
                    + readShort);
                assertArrayElementEqual(readShort,short);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_3600: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_3600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_3700
     * @tc.name    WriteShort interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_3700", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_3700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_3700: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeShort(-32768)).assertTrue();
            expect(data.writeShort(0)).assertTrue();
            expect(data.writeShort(1)).assertTrue();
            expect(data.writeShort(2)).assertTrue();
            expect(data.writeShort(32767)).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_3700: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_3700: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                assertArrayElementEqual(result.reply.readShort(),-32768);
                assertArrayElementEqual(result.reply.readShort(),0);
                assertArrayElementEqual(result.reply.readShort(),1);
                assertArrayElementEqual(result.reply.readShort(),2);
                assertArrayElementEqual(result.reply.readShort(),327678);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_3700: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_3700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_3800
     * @tc.name    WriteShort interface, illegal value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_3800", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_3800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_3800: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            expect(data.writeShort(-32769)).assertTrue();
            expect(data.writeShort(0)).assertTrue();
            expect(data.writeShort(1)).assertTrue();
            expect(data.writeShort(2)).assertTrue();
            expect(data.writeShort(32768)).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_3800: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_3800: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                expect(result.reply.readShort()).assertEqual(32767);
                expect(result.reply.readShort()).assertEqual(0);
                expect(result.reply.readShort()).assertEqual(1);
                expect(result.reply.readShort()).assertEqual(2);
                expect(result.reply.readShort()).assertEqual(-32768);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_3800: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_3800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_3900
     * @tc.name    Call writelong interface to write long integer data to messageparcel instance
     *             and call readlong to read data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_3900", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_3900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_3900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var short = 10000;
            var writelong = data.writeLong(short);
            console.log("SUB_Softbus_RPC_MessageParcel_3900: run writeLong success, writelong is " + writelong);
            expect(writelong == true).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_3900: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_3900: run sendRequest success, result is "
                    + result.errCode);
                expect(result.errCode == 0).assertTrue();
                var readlong = result.reply.readLong();
                console.log("SUB_Softbus_RPC_MessageParcel_3900: run readLong is success, readlong is " + readlong);
                expect(readlong == short).assertTrue();
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_3900: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_3900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_4000
     * @tc.name    Writelong interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_4000", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_4000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_4000: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var short = 2147483647;
            var writelong = data.writeLong(short);
            console.log("SUB_Softbus_RPC_MessageParcel_4000: run writeLong success, writelong is " + writelong);
            expect(writelong).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_4000: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_4000: run sendRequest success, result is "
                    + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var readlong = result.reply.readLong();
                console.log("SUB_Softbus_RPC_MessageParcel_4000: run readLong is success, readlong is " + readlong);
                expect(readlong == short).assertTrue();
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_4000: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_4000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_4100
     * @tc.name    Writelong interface, illegal value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_4100", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_4100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_4100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var short = 214748364887;
            var writelong = data.writeLong(short);
            console.log("SUB_Softbus_RPC_MessageParcel_4100: run writeLong success, writelong is " + writelong);
            expect(writelong).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_4100: gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_4100: run sendRequest success, result is "
                    + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var readlong = result.reply.readLong();
                console.log("SUB_Softbus_RPC_MessageParcel_4100: run readLong is success, readlong is " + readlong);
                assertArrayElementEqual(readlong,short);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_4100: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_4100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_4200
     * @tc.name    Call the parallel interface to read and write data to the double instance
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_4200", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_4200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_4200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 10.2;
            var result = data.writeDouble(token);
            console.log("SUB_Softbus_RPC_MessageParcel_4200:run writeDouble success, result is " + result);
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_4200: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_4200: run sendRequest success, result is "
                    + result.errCode);
                var replyReadResult = reply.readDouble();
                console.log("SUB_Softbus_RPC_MessageParcel_4200: run replyReadResult is success," +
                    "replyReadResult is " + replyReadResult);
                assertArrayElementEqual(replyReadResult,token);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_4200:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_4200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_4300
     * @tc.name    Writedouble interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_4300", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_4300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_4300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 1.79E+308;
            var result = data.writeDouble(token);
            console.log("SUB_Softbus_RPC_MessageParcel_4300:run writeDouble success, result is " + result);
            expect(result).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_4300: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_4300: run sendRequest success, result is "
                    + result.errCode);
                var replyReadResult = reply.readDouble();
                console.log("SUB_Softbus_RPC_MessageParcel_4300: run replyReadResult is success," +
                    "replyReadResult is " + replyReadResult);
                assertArrayElementEqual(replyReadResult,token);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_4300:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_4300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_4400
     * @tc.name    Writedouble interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_4400", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_4400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_4400: create object successfully.");

            var flag = false;
            var token = "1.79E+465312156";
            var result = data.writeDouble(token);
            console.log("SUB_Softbus_RPC_MessageParcel_4400:run writeDouble success, result is " + result);

            flag = true;
            data.reclaim();
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_4400:error = " + error);
            expect(flag).assertEqual(false);
        }
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_4400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_4500
     * @tc.name    Call the writeboolean interface to write the data to the messageparcel instance,
     *             and call readboolean to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_4500", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_4500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_4500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = true;
            var result = data.writeBoolean(token);
            console.log("SUB_Softbus_RPC_MessageParcel_4500:run writeBoolean success, result is " + result);
            expect(result == true).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_4500: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEAN, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_4500: run sendRequest success, result is "
                    + result.errCode);
                var replyReadResult = result.reply.readBoolean();
                console.log("SUB_Softbus_RPC_MessageParcel_4500: run readBoolean is success," +
                    "result is " + replyReadResult);
                assertArrayElementEqual(replyReadResult,token);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_4500:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_4500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_4600
     * @tc.name    Writeboolean interface, illegal value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_4600", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_4600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_4600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 9;
            var result = data.writeBoolean(token);
            console.log("SUB_Softbus_RPC_MessageParcel_4600:run writeBoolean success, result is " + result);
            expect(result).assertFalse();
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_4600:error = " + error);
        }
        data.reclaim();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_4600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_4700
     * @tc.name    Call the writechar interface to write the data to the messageparcel instance,
     *             and call readchar to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_4700", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_4700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_4700: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 'a';
            var result = data.writeChar(token);
            console.log("SUB_Softbus_RPC_MessageParcel_4700:run writeChar success, result is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_4700: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_4700: sendRequest success, result is " + result.errCode);
                var replyReadResult = result.reply.readChar();
                console.log("SUB_Softbus_RPC_MessageParcel_4700: run readChar is success," +
                    "result is " + replyReadResult);
                assertArrayElementEqual(replyReadResult,token);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_4700:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_4700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_4800
     * @tc.name    Writechar interface, illegal value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_4800", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_4800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_4800: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 'ades';
            var result = data.writeChar(token);
            console.log("SUB_Softbus_RPC_MessageParcel_4800:run writeChar success, result is " + result);
            expect(result == true).assertTrue()
            var readresult = data.readChar();
            expect(readresult).assertEqual('a')
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_4800:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_4800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_4900
     * @tc.name    Call the writestring interface to write the data to the messageparcel instance,
     *             and call readstring() to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_4900", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_4900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_4900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 'weqea';
            var result = data.writeString(token);
            console.log("SUB_Softbus_RPC_MessageParcel_4900:run writeString success, result is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_4900: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_4900: sendRequest success, result is " + result.errCode);
                var replyReadResult = result.reply.readString();
                console.log("SUB_Softbus_RPC_MessageParcel_4900: run readString is success," +
                    "result is " + replyReadResult);
                assertArrayElementEqual(replyReadResult,token);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_4900:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_4900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_5000
     * @tc.name    Writestring interface, illegal value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_5000", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_5000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_5000: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 123;
            var result = data.writeString(token);
            console.log("SUB_Softbus_RPC_MessageParcel_5000:run writeString success, result is " + result);
            expect(result).assertFalse();
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_5000:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_5000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_5100
     * @tc.name    Call the writebyte interface to write data to the messageparcel instance,
     *             and call readbyte to read data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_5100", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_5100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_5100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 2;
            var result = data.writeByte(token);
            console.log("SUB_Softbus_RPC_MessageParcel_5100:run writeByte success, result is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_5100: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_5100: sendRequest success, result is " + result.errCode);
                var replyReadResult = result.reply.readByte();
                console.log("SUB_Softbus_RPC_MessageParcel_5100: run readByte is success," +
                    "result is " + replyReadResult);
                assertArrayElementEqual(replyReadResult,token);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_5100:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_5100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_5200
     * @tc.name    Writebyte interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_5200", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_5200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_5200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            expect(data.writeByte(-128)).assertTrue();
            expect(data.writeByte(0)).assertTrue();
            expect(data.writeByte(1)).assertTrue();
            expect(data.writeByte(2)).assertTrue();
            expect(data.writeByte(127)).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_5200: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BYTE_MULTI, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_5200: sendRequest success, result is " + result.errCode);

                expect(reply.readByte()).assertEqual(-128);
                expect(reply.readByte()).assertEqual(0);
                expect(reply.readByte()).assertEqual(1);
                expect(reply.readByte()).assertEqual(2);
                expect(reply.readByte()).assertEqual(127);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_5200:error = " + error);
        }
        data.reclaim()
        reply.reclaim()
        done()
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_5200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_5300
     * @tc.name    Writebyte interface, illegal value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_5300", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_5300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_5300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            expect(data.writeByte(-129)).assertTrue();
            expect(data.writeByte(0)).assertTrue();
            expect(data.writeByte(1)).assertTrue();
            expect(data.writeByte(2)).assertTrue();
            expect(data.writeByte(128)).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_5300: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_BYTE_MULTI, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_5300: sendRequest success, result is " + result.errCode);

                expect(reply.readByte()).assertEqual(127);
                expect(reply.readByte()).assertEqual(0);
                expect(reply.readByte()).assertEqual(1);
                expect(reply.readByte()).assertEqual(2);
                expect(reply.readByte()).assertEqual(-128);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_5300:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_5300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_5400
     * @tc.name    Call the writeint interface to write the data to the messageparcel instance,
     *             and call readint to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_5400", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_5400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_5400: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 2;
            var result = data.writeInt(token);
            console.log("SUB_Softbus_RPC_MessageParcel_5400:run writeInt success, result is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_5400: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_5400: sendRequest success, result is " + result.errCode);
                var replyReadResult = result.reply.readInt();
                console.log("SUB_Softbus_RPC_MessageParcel_5400: run readInt is success," +
                    "result is " + replyReadResult);
                assertArrayElementEqual(replyReadResult,token);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_5400:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_5400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_5500
     * @tc.name    Writeint interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_5500", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_5500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_5500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            expect(data.writeInt(-2147483648)).assertTrue();
            expect(data.writeInt(0)).assertTrue();
            expect(data.writeInt(1)).assertTrue();
            expect(data.writeInt(2)).assertTrue();
            expect(data.writeInt(2147483647)).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_5500: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_5500: sendRequest success, result is " + result.errCode);
                expect(result.reply.readInt()).assertEqual(-2147483648);
                expect(result.reply.readInt()).assertEqual(0);
                expect(result.reply.readInt()).assertEqual(1);
                expect(result.reply.readInt()).assertEqual(2);
                expect(result.reply.readInt()).assertEqual(2147483647);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_5500:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_5500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_5600
     * @tc.name    Writeint interface, illegal value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_5600", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_5600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_5600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            expect(data.writeInt(-2147483649)).assertTrue();
            expect(data.writeInt(0)).assertTrue();
            expect(data.writeInt(1)).assertTrue();
            expect(data.writeInt(2)).assertTrue();
            expect(data.writeInt(2147483648)).assertTrue();

            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_5600: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_5600: sendRequest success, result is " + result.errCode);
                expect(result.reply.readInt()).assertEqual(2147483647);
                expect(result.reply.readInt()).assertEqual(0);
                expect(result.reply.readInt()).assertEqual(1);
                expect(result.reply.readInt()).assertEqual(2);
                expect(result.reply.readInt()).assertEqual(-2147483648);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_5600:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_5600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_5700
     * @tc.name    Call the writefloat interface to write data to the messageparcel instance,
     *             and call readfloat to read data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_5700", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_5700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_5700: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 2.2;
            var result = data.writeFloat(token);
            console.log("SUB_Softbus_RPC_MessageParcel_5700:run writeDouble success, result is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_5700: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_5700: sendRequest success, result is " + result.errCode);
                var replyReadResult = result.reply.readFloat();
                console.log("SUB_Softbus_RPC_MessageParcel_5700: run readFloat is success," +
                    "result is " + replyReadResult);
                assertArrayElementEqual(replyReadResult,token);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_5700:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_5700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_5800
     * @tc.name    Writefloat interface, boundary value verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_5800", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_5800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_5800: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var token = 3.4E+38;
            var result = data.writeFloat(token);
            console.log("SUB_Softbus_RPC_MessageParcel_5800:run writeFloat success, result is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_5800: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_5800: sendRequest success, result is " + result.errCode);
                var newReadResult = result.reply.readFloat();
                console.log("SUB_Softbus_RPC_MessageParcel_5800: readFloat result is " + newReadResult);
                assertArrayElementEqual(newReadResult,token);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_5800:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_5800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_5900
     * @tc.name    Writefloat interface, illegal value validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_5900", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_5900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_5900: create object successfully.");
            var token = 'a';
            var result = data.writeFloat(token);
            console.log("SUB_Softbus_RPC_MessageParcel_5900:run writeFloat success, result is " + result);
            expect(result).assertFalse();
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_5900:error = " + error);
        }
        data.reclaim();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_5900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_6000
     * @tc.name    Test messageparcel to deliver rawdata data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_6000", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_6000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_6000: create object successfully.");
            var Capacity = data.getRawDataCapacity()
            console.log("SUB_Softbus_RPC_MessageParcel_6000:run Capacity success, Capacity is " + Capacity);
            var rawdata = new Int8Array([1, 2, 3])
            var result = data.writeRawData(rawdata, rawdata.length);
            console.log("SUB_Softbus_RPC_MessageParcel_6000:run writeRawData success, result is " + result);
            expect(result == true).assertTrue();
            var newReadResult = data.readRawData(rawdata.length)
            console.log("SUB_Softbus_RPC_MessageParcel_6000:run readRawData success, result is " + newReadResult);
            assertArrayElementEqual(newReadResult,rawdata);
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_6000:error = " + error);
        }
        data.reclaim();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_6000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_6100
     * @tc.name    Illegal value passed in from writerawdata interface
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_6100", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_6100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_6100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var Capacity = data.getRawDataCapacity()
            console.log("SUB_Softbus_RPC_MessageParcel_6100:run Capacity success, result is " + Capacity);
            var token = new Int8Array([2,1,4,3,129]) ;
            var result = data.writeRawData(token, 149000000);
            console.log("SUB_Softbus_RPC_MessageParcel_6100:run writeRawData success, result is " + result);
            expect(result).assertFalse();
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_6100:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_6100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_6200
     * @tc.name    Call the writeremoteobject interface to serialize the remote object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_6200", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_6200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_6200: create object successfully.");
            let testRemoteObject = new TestRemoteObject("testObject");
            var result = data.writeRemoteObject(testRemoteObject);
            console.log("SUB_Softbus_RPC_MessageParcel_6200: result is " + result);
            expect(result).assertTrue();
            data.readRemoteObject()
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_6200:error = " + error);
        }
        data.reclaim();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_6200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_6300
     * @tc.name    Call the writeremoteobject interface to serialize the remote object and pass in the empty object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_6300", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_6300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_6300: create object successfully.");
            var token = {}
            var result = data.writeRemoteObject(token);
            console.log("SUB_Softbus_RPC_MessageParcel_6300: result is " + result);
            expect(result).assertFalse();
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_6300:error = " + error);
        }
        data.reclaim();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_6300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_6400
     * @tc.name    Call the writesequenceable interface to write the custom serialized
     *             object to the messageparcel instance
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_6400", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_6400---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_6400: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            let sequenceable = new MySequenceable(1, "aaa");
            let result = data.writeSequenceable(sequenceable);
            console.log("SUB_Softbus_RPC_MessageParcel_6400: writeSequenceable is " + result);
            let ret = new MySequenceable(0, "");
            let result2 = data.readSequenceable(ret);
            console.log("SUB_Softbus_RPC_MessageParcel_6400: readSequenceable is " + result2);
            expect(result2).assertTrue();
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_6400:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_6400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_6500
     * @tc.name    After the server finishes processing, write noexception first before writing the result,
     *             and the client calls readexception to judge whether the server is abnormal
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_6500", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_6500---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_6500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();

            data.writeNoException();
            console.log("SUB_Softbus_RPC_MessageParcel_6500: run writeNoException success");
            expect(data.writeInt(6)).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_6500: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_NOEXCEPTION, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_6500: sendRequest success, result is " + result.errCode);
                result.reply.readException()
                var replyData = result.reply.readInt();
                console.log("SUB_Softbus_RPC_MessageParcel_6500: readResult is " + replyData);
                expect(replyData).assertEqual(6);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_6500:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_6500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_6600
     * @tc.name    If the data on the server is abnormal, the client calls readexception
     *             to judge whether the server is abnormal
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_6600", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_6600---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_6600: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            data.writeNoException();
            console.log("SUB_Softbus_RPC_MessageParcel_6600: run writeNoException success");
            expect(data.writeInt(1232222223444)).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_6600: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_NOEXCEPTION, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_6600: sendRequest success, result is " + result.errCode);
                result.reply.readException()
                var replyData = result.reply.readInt();
                console.log("SUB_Softbus_RPC_MessageParcel_6600: readResult is " + replyData);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_6600:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_6600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_6700
     * @tc.name    Serializable object marshaling and unmarshalling test
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_6700", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_6700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_6700: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var sequenceable = new MySequenceable(1, "aaa");
            var result = data.writeSequenceable(sequenceable);
            console.log("SUB_Softbus_RPC_MessageParcel_6700: writeSequenceable is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_6700: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLE, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_6700: sendRequest success, result is " + result.errCode);
                var s = new MySequenceable(null,null)
                var resultReply = result.reply.readSequenceable(s);
                console.log("SUB_Softbus_RPC_MessageParcel_6700: run readSequenceable is success,result is "
                    + resultReply);
                expect(s.str).assertEqual(sequenceable.str);
                expect(s.num).assertEqual(sequenceable.num);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_6700:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_6700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_6800
     * @tc.name    Non serializable object marshaling test
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_6800", 0, async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_6800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_6800: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var sequenceable = new MySequenceable(1, "aaa");
            var result = data.writeSequenceable(sequenceable);
            console.log("SUB_Softbus_RPC_MessageParcel_6800: writeSequenceable is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_6800: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLE, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_6800: sendRequest success, result is " + result.errCode);
                var s = new MySequenceable(null,null)
                var replyReadResult = reply.readSequenceable(s);
                console.log("SUB_Softbus_RPC_MessageParcel_6800: run readSequenceable is success," +
                    "result is " + replyReadResult);
                expect(replyReadResult).assertTrue();
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_6800:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_6800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_6900
     * @tc.name    The server did not send a serializable object, and the client was ungrouped
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_6900", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_6900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_6900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var sequenceable = 10;
            var result = data.writeInt(sequenceable);
            console.log("RpcClient: writeInt is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_6900: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_6900: sendRequest success, result is " + result.errCode);
                var s = new MySequenceable(0,null)
                var replyReadResult = result.reply.readSequenceable(s);
                console.log("SUB_Softbus_RPC_MessageParcel_6900: run readSequenceable is success," +
                    "result is " + replyReadResult);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_6900:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_6900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_7000
     * @tc.name    Call the writesequenceable interface to write the custom serialized object to the
     *             messageparcel instance, and call readsequenceable to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_7000", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_7000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_7000: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var sequenceable = new MySequenceable(2, "abc");
            var result = data.writeSequenceable(sequenceable);
            console.log("RpcClient: writeSequenceable is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_7000: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLE, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_7000: sendRequest success, result is " + result.errCode);
                var s = new MySequenceable(null,null)
                var replyReadResult = result.reply.readSequenceable(s);
                console.log("SUB_Softbus_RPC_MessageParcel_7000: run readSequenceable is success," +
                    "result is " + replyReadResult);
                expect(s.str).assertEqual(sequenceable.str);
                expect(s.num).assertEqual(sequenceable.num);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_7000:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_7000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_7100
     * @tc.name    Call the writesequenceablearray interface to write the custom serialized object to the
     *             messageparcel instance, and call readsequenceablearray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_7100", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_7100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_7100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var sequenceable = [new MySequenceable(1, "aaa"),
                new MySequenceable(2, "bbb"), new MySequenceable(3, "ccc")];
            var result = data.writeSequenceableArray(sequenceable);
            console.log("SUB_Softbus_RPC_MessageParcel_7100: writeSequenceableArray is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_7100: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLEARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_7100: sendRequest success, result is " + result.errCode);
                var s = [new MySequenceable(null, null), new MySequenceable(null, null),
                    new MySequenceable(null, null)];
                result.reply.readSequenceableArray(s);
                console.log("SUB_Softbus_RPC_MessageParcel_7100: run readSequenceableArray is success.");
                for (let i = 0; i < s.length; i++) {
                    expect(s[i].str).assertEqual(sequenceable[i].str)
                    expect(s[i].num).assertEqual(sequenceable[i].num)
                }
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_7100:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_7100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_7200
     * @tc.name    Call the writesequenceablearray interface to write the custom serialized object to the
     *             messageparcel instance, and call readsequenceablearray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_7200", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_7200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_7200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var sequenceable = [new MySequenceable(4, "abc"),
                new MySequenceable(5, "bcd"), new MySequenceable(6, "cef")];
            var result = data.writeSequenceableArray(sequenceable);
            console.log("SUB_Softbus_RPC_MessageParcel_7200: writeSequenceable is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_7200: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLEARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_7200: sendRequest success, result is " + result.errCode);
                var s = [new MySequenceable(null, null),
                    new MySequenceable(null, null), new MySequenceable(null, null)]
                result.reply.readSequenceableArray(s);
                console.log("SUB_Softbus_RPC_MessageParcel_7200: run readSequenceableArray is success.");
                for (let i = 0; i < s.length; i++) {
                    expect(s[i].str).assertEqual(sequenceable[i].str)
                    expect(s[i].num).assertEqual(sequenceable[i].num)
                }
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_7200:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_7200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_7300
     * @tc.name    Call the writesequenceablearray interface to write the custom
     *             serialized object to the messageparcel instance
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_7300", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_7300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_7300: create object successfully.");
            var sequenceable = 1;
            var result = data.writeSequenceableArray(sequenceable);
            console.log("SUB_Softbus_RPC_MessageParcel_7300: writeSequenceable is " + result);
            expect(result).assertFalse();
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_7300:error = " + error);
        }
        data.reclaim();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_7300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_7400
     * @tc.name    Call the writeremoteobjectarray interface to write the object array to the messageparcel
     *             instance, and call readremoteobjectarray to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_7400", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_7400---------------------------");
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
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_7400: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeInterfaceToken("rpcTestAbility")).assertTrue()
            var listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)];
            var result = data.writeRemoteObjectArray(listeners);
            console.log("SUB_Softbus_RPC_MessageParcel_7400: writeRemoteObjectArray is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_7400: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECTARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_7400: sendRequest success, result is " + result.errCode);
                expect(result.errCode).assertEqual(0);
                expect(result.code).assertEqual(CODE_WRITE_REMOTEOBJECTARRAY);
                expect(result.data).assertEqual(data);
                expect(result.reply).assertEqual(reply);
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_7400:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_7400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_7500
     * @tc.name    Call the writeremoteobjectarray interface to write the object array to the messageparcel instance,
     *             and call readremoteobjectarray (objects: iremoteobject []) to read the data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_7500", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_7500---------------------------");
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
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_7500: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeInterfaceToken("rpcTestAbility")).assertTrue()
            var listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)];
            var result = data.writeRemoteObjectArray(listeners);
            console.log("RpcClient: writeRemoteObjectArray is " + result);
            expect(result).assertTrue();
            if (gIRemoteObject == undefined)
            {
                console.log("SUB_Softbus_RPC_MessageParcel_7500: gIRemoteObject is undefined");
            }
            await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECTARRAY, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_MessageParcel_7500: sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_7500:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_7500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_7600
     * @tc.name    Test messageparcel delivery file descriptor object
     * @tc.desc    Function test
     * @tc.level   0
     */
    // it("SUB_Softbus_RPC_MessageParcel_7600", 0,async function(done){
    //     console.log("---------------------start SUB_Softbus_RPC_MessageParcel_7600---------------------------");
    //     let context = featureAbility.getContext()
    //     await context.getFilesDir()
    //         .then(async function(path) {
    //             expect(path != null).assertTrue()
    //             let basePath = path;
    //             let filePath = basePath + "/test1.txt";
    //             let fd = fileio.openSync(filePath, 0o2| 0o100 | 0o2000, 0o666);
    //             expect(fd >= 0).assertTrue()
    //             let str = "HELLO RPC"
    //             let bytesWr = fileio.writeSync(fd, str);
    //             console.log("start SUB_Softbus_RPC_MessageParcel_7600:" + bytesWr + " "+ fd);
    //             let option = new rpc.MessageOption()
    //             let data = rpc.MessageParcel.create()
    //             let reply = rpc.MessageParcel.create()
    //
    //             let result = data.containFileDescriptors()
    //             let writeInt = data.writeInt(bytesWr)
    //             expect(writeInt == true).assertTrue()
    //
    //             let writeFileDescriptor = data.writeFileDescriptor(fd)
    //             expect(writeFileDescriptor == true).assertTrue()
    //             let result1 = data.containFileDescriptors()
    //             console.log("start SUB_Softbus_RPC_MessageParcel_7600:" + result + " " + writeInt + " " + result1);
    //             expect(data.containFileDescriptors()).assertTrue()
    //
    //             await gIRemoteObject.sendRequest(CODE_FILESDIR, data, reply, option)
    //                 .then(function(result) {
    //                     expect(result.errCode).assertEqual(0)
    //                     let buf = new ArrayBuffer(str.length * 2);
    //                     let bytesRd = fileio.readSync(fd, buf, {position:0,});
    //                     let fdResult = reply.readFileDescriptor()
    //                     let content = String.fromCharCode.apply(null, new Uint8Array(buf));
    //                     expect(content).assertEqual(str + str)
    //                     let dupFd = rpc.MessageParcel.dupFileDescriptor(fd);
    //                     let buf2 = new ArrayBuffer(str.length * 2);
    //                     let byteRd2 = fileio.readSync(dupFd, buf2, {position:0,});
    //                     let content2 = String.fromCharCode.apply(null, new Uint8Array(buf2));
    //                     console.log("start SUB_Softbus_RPC_MessageParcel_7600:" + fdResult + " " + fdResult2 + " ")
    //                     console.log("dupFd bytes read: " + byteRd2 + ", content2: " + content2);
    //                     expect(content2).assertEqual(str + str)
    //                     rpc.MessageParcel.closeFileDescriptor(fd);
    //                     rpc.MessageParcel.closeFileDescriptor(dupFd);
    //                 })
    //             try {
    //                 console.info("after close fd, write again")
    //                 fileio.writeSync(fd, str)
    //                 expect(0).assertEqual(1)
    //             } catch(e) {
    //                 console.error("got exception: " + e)
    //             }
    //         })
    //     console.log("---------------------end SUB_Softbus_RPC_MessageParcel_7600---------------------------");
    // });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_7700
     * @tc.name    Test messageparcel to deliver the reply message received in promise across processes
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_7700", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_7700---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_7700: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeByte(2)).assertTrue()
            expect(data.writeShort(3)).assertTrue()
            expect(data.writeInt(4)).assertTrue()
            expect(data.writeLong(5)).assertTrue()
            expect(data.writeFloat(1.2)).assertTrue()
            expect(data.writeDouble(10.2)).assertTrue()
            expect(data.writeBoolean(true)).assertTrue()
            expect(data.writeChar('a')).assertTrue()
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
                expect(result.reply.readChar()).assertEqual('a')
                expect(result.reply.readString()).assertEqual("HelloWorld")
                let s = new MySequenceable(0, "")
                expect(result.reply.readSequenceable(s)).assertTrue()
                expect(s.num).assertEqual(1)
                expect(s.str).assertEqual("aaa")
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_7700:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_7700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_7800
     * @tc.name    Test the cross process delivery of messageparcel and receive the reply message
     *             in the callback function
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_7800", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_7800---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_7800: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeByte(2)).assertTrue()
            expect(data.writeShort(3)).assertTrue()
            expect(data.writeInt(4)).assertTrue()
            expect(data.writeLong(5)).assertTrue()
            expect(data.writeFloat(1.2)).assertTrue()
            expect(data.writeDouble(10.2)).assertTrue()
            expect(data.writeBoolean(true)).assertTrue()
            expect(data.writeChar('a')).assertTrue()
            expect(data.writeString("HelloWorld")).assertTrue()
            expect(data.writeSequenceable(new MySequenceable(1, "aaa"))).assertTrue()
            gIRemoteObject.sendRequest(CODE_ALL_TYPE, data, reply, option,(err, result) => {
                console.info("sendRequest done, error code: " + result.errCode)
                expect(result.errCode).assertEqual(0)
                expect(result.reply.readByte()).assertEqual(2)
                expect(result.reply.readShort()).assertEqual(3)
                expect(result.reply.readInt()).assertEqual(4)
                expect(result.reply.readLong()).assertEqual(5)
                expect(result.reply.readFloat()).assertEqual(1.2)
                expect(result.reply.readDouble()).assertEqual(10.2)
                expect(result.reply.readBoolean()).assertTrue()
                expect(result.reply.readChar()).assertEqual('a')
                expect(result.reply.readString()).assertEqual("HelloWorld")
                let s = new MySequenceable(null, null)
                expect(result.reply.readSequenceable(s)).assertTrue()
                expect(s.num).assertEqual(1)
                expect(s.str).assertEqual("aaa")
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_7800:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_7800---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_7900
     * @tc.name    Test the cross process transmission of messageparcel.
     *             After receiving the reply message in promise, read various types of arrays in order
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_7900", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_7900---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_7900: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeByteArray(new Int8Array([1, 2, 3]))).assertTrue();
            expect(data.writeShortArray([4, 5, 6])).assertTrue()
            expect(data.writeIntArray([7, 8, 9])).assertTrue()
            expect(data.writeLongArray([10, 11, 12])).assertTrue()
            expect(data.writeFloatArray([1.1, 1.2, 1.3])).assertTrue()
            expect(data.writeDoubleArray([2.1, 2.2, 2.3])).assertTrue()
            expect(data.writeBooleanArray([true, true, false])).assertTrue()
            expect(data.writeCharArray(['a', 'b', 'c'])).assertTrue()
            expect(data.writeStringArray(['abc', 'seggg'])).assertTrue()
            let a = [new MySequenceable(1, "aaa"), new MySequenceable(2, "bbb"), new MySequenceable(3, "ccc")]
            expect(data.writeSequenceableArray(a)).assertTrue()
            gIRemoteObject.sendRequest(CODE_ALL_ARRAY_TYPE, data, reply, option,(err, result) => {
                expect(result.errCode).assertEqual(0)
                assertArrayElementEqual(result.reply.readByteArray(), [1, 2, 3])
                assertArrayElementEqual(result.reply.readShortArray(), [4, 5, 6])
                assertArrayElementEqual(result.reply.readIntArray(), [7, 8, 9])
                assertArrayElementEqual(result.reply.readLongArray(), [10, 11, 12])
                assertArrayElementEqual(result.reply.readFloatArray(), [1.1, 1.2, 1.3])
                assertArrayElementEqual(result.reply.readDoubleArray(), [2.1, 2.2, 2.3])
                assertArrayElementEqual(result.reply.readBooleanArray(), [true, true, false])
                assertArrayElementEqual(result.reply.readCharArray(), ['a', 'b', 'c'])
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
            console.log("SUB_Softbus_RPC_MessageParcel_7900:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_7900---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_8000
     * @tc.name    Test messageparcel cross process delivery. After receiving the reply message in promise,
     *             the client constructs an empty array in sequence and reads the data from the reply message
     *             into the corresponding array
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageParcel_8000", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_8000---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_MessageParcel_8000: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeByteArray(new Int8Array([1, 2, 3]))).assertTrue();
            expect(data.writeShortArray([4, 5, 6])).assertTrue()
            expect(data.writeIntArray([7, 8, 9])).assertTrue()
            expect(data.writeLongArray([10, 11, 12])).assertTrue()
            expect(data.writeFloatArray([1.1, 1.2, 1.3])).assertTrue()
            expect(data.writeDoubleArray([2.1, 2.2, 2.3])).assertTrue()
            expect(data.writeBooleanArray([true, true, false])).assertTrue()
            expect(data.writeCharArray(['a', 'b', 'c'])).assertTrue()
            expect(data.writeStringArray(['abc', 'seggg'])).assertTrue()
            let a = [new MySequenceable(1, "aaa"), new MySequenceable(2, "bbb"), new MySequenceable(3, "ccc")]
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
                assertArrayElementEqual(result.reply.readCharArray(), ['a', 'b', 'c'])
                assertArrayElementEqual(result.reply.readStringArray(), ['abc', 'seggg'])
                let b = [new MySequenceable(null, null), new MySequenceable(null, null),
                    new MySequenceable(null, null)]
                result.reply.readSequenceableArray(b)
                console.log("SUB_Softbus_RPC_MessageParcel_8000" + b);
                for (let i = 0; i < b.length; i++) {
                    expect(b[i].str).assertEqual(a[i].str)
                    expect(b[i].num).assertEqual(a[i].num)
                }
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_MessageParcel_8000:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_8000---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_8100
     * @tc.name    Test messageparcel to pass an object of type iremoteobject across processes
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_Softbus_RPC_MessageParcel_8100', 0, async function(done) {
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_8100---------------------------");
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
            expect(result).assertTrue()
            console.info("SUB_Softbus_RPC_MessageParcel_8100 result is:" + result)
            expect(data.writeInt(123)).assertTrue()
            expect(data.writeString("rpcListenerTest")).assertTrue()
            await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECT, data, reply, option)
                .then((result)=> {
                    console.info("sendRequest done, error code: " + result.errCode)
                    expect(result.errCode).assertEqual(0)
                    result.reply.readException()
                })
            data.reclaim();
            reply.reclaim();
            done();
        } catch(error) {
            console.log("SUB_Softbus_RPC_MessageParcel_8100: error = " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_8100---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_8200
     * @tc.name    Test messageparcel to pass an array of iremoteobject objects across processes
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_Softbus_RPC_MessageParcel_8200', 0, async function(done) {
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_8200---------------------------");

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
            expect(result).assertTrue()
            console.info("SUB_Softbus_RPC_MessageParcel_8200 result is:" + result)
            expect(data.writeInt(123)).assertTrue()
            expect(data.writeString("rpcListenerTest")).assertTrue()
            await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECTARRAY_1, data, reply, option)
                .then((result)=> {
                    console.info("sendRequest done, error code: " + result.errCode)
                    expect(result.errCode).assertEqual(0)
                    result.reply.readException()
                })
            data.reclaim();
            reply.reclaim();
        } catch(error) {
            console.log("SUB_Softbus_RPC_MessageParcel_8200: error = " + error);
        }
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_8200---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_MessageParcel_8300
     * @tc.name    Test messageparcel to pass the array of iremoteobject objects across processes. The server
     *             constructs an empty array in onremoterequest and reads it from messageparcel
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_Softbus_RPC_MessageParcel_8300', 0, async function(done) {
        console.log("---------------------start SUB_Softbus_RPC_MessageParcel_8300---------------------------");
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
            expect(result).assertTrue()
            console.info("SUB_Softbus_RPC_MessageParcel_8300 result is:" + result)
            expect(data.writeInt(123)).assertTrue()
            expect(data.writeString("rpcListenerTest")).assertTrue()
            await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECTARRAY_2, data, reply, option)
                .then((result)=> {
                    console.info("sendRequest done, error code: " + result.errCode)
                    expect(result.errCode).assertEqual(0)
                    result.reply.readException()
                })
            data.reclaim();
            reply.reclaim();
        } catch(error) {
            console.log("SUB_Softbus_RPC_MessageParcel_8300: error = " + error);
        }
        done();
        console.log("---------------------end SUB_Softbus_RPC_MessageParcel_8300---------------------------");
    })


    /*
     * @tc.number  SUB_Softbus_RPC_MessageOption_0100
     * @tc.name    Basic method of testing messageoption
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageOption_0100",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageOption_0100---------------------------");
        try{
            let option = new rpc.MessageOption();
            console.log("SUB_Softbus_RPC_MessageOption_0100: create object successfully.");
            let time = option.getWaitTime();
            console.log("SUB_Softbus_RPC_MessageOption_0100: run getWaitTime success, time is " + time);
            expect(time).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
            let flog = option.getFlags();
            console.log("SUB_Softbus_RPC_MessageOption_0100: run getFlags success, flog is " + flog);
            expect(flog).assertEqual(rpc.MessageOption.TF_SYNC);
            option.setFlags(rpc.MessageOption.TF_AYNC)
            console.log("SUB_Softbus_RPC_MessageOption_0100: run setFlags success");
            let flog2 = option.getFlags();
            console.log("SUB_Softbus_RPC_MessageOption_0100: run getFlags success, flog2 is " + flog2);
            option.setWaitTime(16);
            let time2 = option.getWaitTime();
            console.log("SUB_Softbus_RPC_MessageOption_0100: run getWaitTime success, time is " + time2);
            expect(time2).assertEqual(16);
        }catch(error){
            console.log("SUB_Softbus_RPC_MessageOption_0100: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_MessageOption_0100---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_MessageOption_0200
     * @tc.name    Setflags interface outlier detection
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_MessageOption_0200",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_MessageOption_0200---------------------------");
        try{
            let option = new rpc.MessageOption();
            console.log("SUB_Softbus_RPC_MessageOption_0200: create object successfully.");
            let time = option.getWaitTime();
            console.log("SUB_Softbus_RPC_MessageOption_0200: run getWaitTime success, time is " + time);
            expect(time).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
            let flog = option.getFlags();
            console.log("SUB_Softbus_RPC_MessageOption_0200: run getFlags success, flog is " + flog);
            expect(flog).assertEqual(rpc.MessageOption.TF_SYNC);
            option.setFlags(3);
        }catch(error){
            console.log("SUB_Softbus_RPC_MessageOption_0200: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_MessageOption_0200---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_0100
     * @tc.name    Exception parameter validation of the created anonymous shared memory object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_0100",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_0100---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", -1)
            console.log("SUB_Softbus_RPC_Ashmem_0100: ashmem " + ashmem);

            let ashmem2 = rpc.Ashmem.createAshmem(null, 1024)
            console.log("SUB_Softbus_RPC_Ashmem_0100: ashmem2 " + ashmem2);
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_0100: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_0100---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_0200
     * @tc.name    Call the getashmemsize interface to get the size of the shared memory object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_0200",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_0200---------------------------");
        try{
            let mapSize = 4096;
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize)
            console.log("SUB_Softbus_RPC_Ashmem_0200: run  createAshmem success");
            let size = ashmem.getAshmemSize()
            console.log("SUB_Softbus_RPC_Ashmem_0200: run getAshmemSize success, size is " + size);
            expect(size).assertEqual(mapSize);
            ashmem.closeAshmem();
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_0200: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_0200---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_0300
     * @tc.name    Call the getashmemsize interface to get the size of the shared memory object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_0300",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_0300---------------------------");
        try{
            let mapSize = 4096;
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize)
            console.log("SUB_Softbus_RPC_Ashmem_0300: run  createAshmem success");
            let size = ashmem.getAshmemSize()
            console.log("SUB_Softbus_RPC_Ashmem_0300: run getAshmemSize success, size is " + size);
            expect(size).assertEqual(mapSize);
            ashmem.closeAshmem();
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_0300: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_0300---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_0400
     * @tc.name    Writeashmem exception validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_0400",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_0400---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.log("SUB_Softbus_RPC_Ashmem_0400: ashmem " + ashmem);
            ashmem.closeAshmem()
            var data = rpc.MessageParcel.create();
            let writeAshmem = data.writeAshmem(ashmem);
            console.log("SUB_Softbus_RPC_Ashmem_0400: run writeAshmem success, writeAshmem is " + writeAshmem);
            expect(writeAshmem).assertFalse();
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_0400: error " + error);
        }
        data.reclaim();
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_0400---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_0500
     * @tc.name    Readfromashmem exception validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_0500",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_0500---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.log("SUB_Softbus_RPC_Ashmem_0500: ashmem " + ashmem);
            ashmem.unmapAshmem()
            console.log("SUB_Softbus_RPC_Ashmem_0500: run unmapAshmem success");
            let bytes = new Int8Array([1, 2, 3, 4, 5])
            let ret = ashmem.readFromAshmem(bytes.length, 0);
            console.log("SUB_Softbus_RPC_Ashmem_0500: run readFromAshmem result is " + ret);
            expect(ret==null).assertTrue();
            ashmem.closeAshmem();
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_0500: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_0500---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_0600
     * @tc.name    Mapashmem interface creates shared file mappings
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_0600",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_0600---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.log("SUB_Softbus_RPC_Ashmem_0600: ashmem " + ashmem);
            let result = ashmem.mapAshmem(rpc.Ashmem.PROT_READ);
            console.log("SUB_Softbus_RPC_Ashmem_0600: run mapAshmem success, result is " + result);
            expect(result).assertTrue();
            ashmem.closeAshmem()
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_0600: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_0600---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_0700
     * @tc.name    Mapashmem exception validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_0700",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_0700---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.log("SUB_Softbus_RPC_Ashmem_0700: ashmem " + ashmem);
            let result = ashmem.mapAshmem(999);
            console.log("SUB_Softbus_RPC_Ashmem_0700: run mapAshmem success, result is " + result);
            expect(result).assertFalse();
            ashmem.closeAshmem()
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_0700: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_0700---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_0800
     * @tc.name    Mapreadandwriteashmem interface creates a shared file map with the protection level of read-write
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_0800",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_0800---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024)
            console.log("SUB_Softbus_RPC_Ashmem_0800: ashmem " + ashmem);
            let result = ashmem.mapReadAndWriteAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_0800: run mapAshmem success, result is " + result);
            ashmem.closeAshmem()
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_0800: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_0800---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_0900
     * @tc.name    Mapreadandwriteashmem exception validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_0900",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_0900---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.log("SUB_Softbus_RPC_Ashmem_0900: ashmem " + ashmem);
            let result = ashmem.mapAshmem(rpc.Ashmem.PROT_READ);
            console.log("SUB_Softbus_RPC_Ashmem_0900: run mapAshmem success, result is " + result);
            expect(result).assertTrue();
            ashmem.unmapAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_0900: run unmapAshmem success");
            expect(ashmem.mapReadAndWriteAshmem()).assertFalse();
            let result2 = ashmem.mapReadAndWriteAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_0900: run mapReadAndWriteAshmem success, result2 is " + result2);
            expect(result2).assertFalse();
            ashmem.closeAshmem()
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_0900: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_0900---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_1000
     * @tc.name    Mapreadonlyashmem interface creates a shared file map with the protection level of read-write
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_1000",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_1000---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.log("SUB_Softbus_RPC_Ashmem_1000: ashmem " + ashmem);
            let result = ashmem.mapReadOnlyAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_1000: run mapReadAndWriteAshmem success, result is " + result);
            expect(result).assertTrue();
            ashmem.closeAshmem();
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_1000: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_1000---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_1100
     * @tc.name    Mapreadonlyashmem exception validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_1100",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_1100---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024)
            console.log("SUB_Softbus_RPC_Ashmem_1100: ashmem " + ashmem);

            let result = ashmem.mapAshmem(rpc.Ashmem.PROT_WRITE);
            console.log("SUB_Softbus_RPC_Ashmem_1100: run mapAshmem success, result is " + result);
            expect(result).assertTrue();

            ashmem.unmapAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_1100: run unmapAshmem success");
            ashmem.closeAshmem()
            let result2 = ashmem.mapReadOnlyAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_1100: run mapReadAndWriteAshmem success, result2 is " + result2);
            expect(result2).assertFalse();
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_1100: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_1100---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_1200
     * @tc.name    Mapreadonlyashmem exception validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_1200",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_1200---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
            let resultwrite = ashmem.setProtection(rpc.Ashmem.PROT_WRITE)
            console.log("SUB_Softbus_RPC_Ashmem_1200: run setProtection success, resultwrite is " + resultwrite);
            expect(resultwrite).assertTrue();
            let resultread = ashmem.setProtection(rpc.Ashmem.PROT_READ)
            console.log("SUB_Softbus_RPC_Ashmem_1200: run setProtection success, resultread is " + resultread);
            expect(resultread).assertFalse();

            let resultreadAndwrite = ashmem.mapReadAndWriteAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_1200: run setProtection success, mapReadAndWriteAshmem is "
                + resultreadAndwrite);
            expect(resultreadAndwrite ).assertFalse();
            let resultnone = ashmem.setProtection(rpc.Ashmem.PROT_NONE)
            console.log("SUB_Softbus_RPC_Ashmem_1200: run setProtection success, resultnone is " + resultnone);
            expect(resultnone).assertTrue();
            let resultread2 = ashmem.setProtection(rpc.Ashmem.PROT_READ)
            console.log("SUB_Softbus_RPC_Ashmem_1200: run setProtection success, resultread2 is " + resultread2);
            expect(resultread2).assertFalse();
            ashmem.closeAshmem()
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_1200: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_1200---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_1300
     * @tc.name    Setprotection exception input parameter verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_1300",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_1300---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
            console.log("SUB_Softbus_RPC_Ashmem_1300: ashmem " + ashmem);
            let result = ashmem.setProtection(3);
            console.log("SUB_Softbus_RPC_Ashmem_1300: run setProtection success, result is " + result);
            expect(result).assertTrue();
            ashmem.closeAshmem()
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_1300: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_1300---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_1400
     * @tc.name    The writetoashmem interface writes the shared file associated with the object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_1400",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_1200---------------------------");
        try{
            let mapSize = 4096
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize)
            console.log("SUB_Softbus_RPC_Ashmem_1400: ashmem " + ashmem);

            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_1400: run mapReadAndWriteAshmem success, result2 is "
                + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = new Int8Array([1, 2, 3, 4, 5]);
            let result = ashmem.writeToAshmem(bytes, bytes.length, 0);
            console.log("SUB_Softbus_RPC_Ashmem_1400: run writeToAshmem success, result is " + result);
            expect(result).assertTrue();
            ashmem.closeAshmem();
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_1400: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_1400---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_1500
     * @tc.name    The writetoashmem interface writes the shared file associated with the object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_1500",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_1500---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.log("SUB_Softbus_RPC_Ashmem_1500: ashmem " + ashmem);

            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_1500: run mapReadAndWriteAshmem success, result2 is "
                + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = new Int8Array([1, 2, 3, 4, 5]);
            let result = ashmem.writeToAshmem(bytes, bytes.length, 0);
            console.log("SUB_Softbus_RPC_Ashmem_1500: run writeToAshmem success, result is " +result);
            expect(result).assertTrue();
            let resultread = ashmem.setProtection(rpc.Ashmem.PROT_READ);
            console.log("SUB_Softbus_RPC_Ashmem_1500: run setProtection success, resultread is " + resultread);
            expect(resultread).assertTrue()
            let result2 = ashmem.writeToAshmem(bytes, bytes.length, 0);
            console.log("SUB_Softbus_RPC_Ashmem_1500: run writeToAshmem success, result is2 " + result2);
            expect(result2).assertFalse()
            ashmem.closeAshmem();
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_1500: error " +error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_1500---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_1600
     * @tc.name    Writetoashmem exception validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_1600",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_1600---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
            console.log("SUB_Softbus_RPC_Ashmem_1600: ashmem " + ashmem);
            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_1600: run mapReadAndWriteAshmem success, result2 is "
                + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = new Int8Array([1, 2, 3, 4, 5]);
            let size = bytes.length + 10;
            let result = ashmem.writeToAshmem(bytes, 3, 0);
            console.log("SUB_Softbus_RPC_Ashmem_1600: run writeToAshmem success, result is " + result);
            expect(result).assertTrue();
            ashmem.closeAshmem()
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_1600: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_1600---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_1700
     * @tc.name    Read data from the shared file associated with readfromashmem
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_1700",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_1700---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.log("SUB_Softbus_RPC_Ashmem_1700: ashmem " + ashmem);

            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_1600: run mapReadAndWriteAshmem success, result2 is "
                + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = new Int8Array([1, 2, 3, 4, 5]);
            let result = ashmem.writeToAshmem(bytes, bytes.length, 0);
            console.log("SUB_Softbus_RPC_Ashmem_1700: run writeToAshmem success, result is " + result);
            expect(result).assertTrue();
            var resultRead = ashmem.readFromAshmem(bytes.length, 0);
            console.log("SUB_Softbus_RPC_Ashmem_1700: run readFromAshmem success, result is " + resultRead);
            assertArrayElementEqual(resultRead,bytes);
            ashmem.closeAshmem()
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_1700: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_1700---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_1800
     * @tc.name    Readfromashmem exception validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_1800",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_1800---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
            console.log("SUB_Softbus_RPC_Ashmem_1800: ashmem " + ashmem);
            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_1800: run mapReadAndWriteAshmem success, result2 is "
                + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = new Int8Array([1, 2, 3, 4, 5]);
            let result = ashmem.writeToAshmem(bytes, bytes.length, 1);
            console.log("SUB_Softbus_RPC_Ashmem_1800: run writeToAshmem success, result is " + result);
            expect(result).assertTrue()
            let result2 = ashmem.readFromAshmem(bytes.length, 3);
            console.log("SUB_Softbus_RPC_Ashmem_1800: run readFromAshmem success, result2 is " + result2);
            expect(bytes[2]).assertEqual(result2[0]);
            expect(bytes[3]).assertEqual(result2[1]);
            expect(bytes[4]).assertEqual(result2[2]);
            ashmem.closeAshmem()
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_1800: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_1800---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_1900
     * @tc.name    Createashmemfromexisting copies the ashmem object description and creates a new object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_1900",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_1900---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
            console.log("SUB_Softbus_RPC_Ashmem_1900: ashmem " + ashmem);
            let resultWriteAndRead = ashmem.mapReadAndWriteAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_1900:  run mapReadAndWriteAshmem result is " + resultWriteAndRead);
            expect(resultWriteAndRead).assertTrue();
            let bytes = new Int8Array([1, 2, 3]);
            let result = ashmem.writeToAshmem(bytes, bytes.length, 1);
            console.log("SUB_Softbus_RPC_Ashmem_1900: run writeToAshmem success, result is " + result);
            expect(result).assertTrue()
            let newashmem = rpc.Ashmem.createAshmemFromExisting(ashmem);
            let resultWriteAndRead2 = newashmem.mapReadAndWriteAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_1900:  run mapReadAndWriteAshmem result is " + resultWriteAndRead2);
            expect(resultWriteAndRead2).assertTrue();

            let result2 = newashmem.readFromAshmem(bytes.length, 1);
            console.log("SUB_Softbus_RPC_Ashmem_1900: run readFromAshmem success, result2 is " + result2);
            expect(result).assertTrue();
            assertArrayElementEqual(result2,bytes);
            ashmem.closeAshmem();
            newashmem.closeAshmem();
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_1900: error " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_1900---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_2000
     * @tc.name    Create a shared memory object and call writeashmem to write the shared anonymous
      object into the messageparcel object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_2000",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_2000---------------------------");
        try{
            let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
            let data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_Ashmem_2000: ashmem " + ashmem);
            let resultMapRAndW = ashmem.mapReadAndWriteAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_2000: run mapReadAndWriteAshmem result is " + resultMapRAndW);
            expect(resultMapRAndW).assertTrue();
            let bytes = new Int8Array([1, 2, 3]);
            let result = ashmem.writeToAshmem(bytes, bytes.length, 1);
            console.log("SUB_Softbus_RPC_Ashmem_2000: run writeToAshmem success, result is " + result);
            expect(result).assertTrue()
            let result2 = data.writeAshmem(ashmem)
            console.log("SUB_Softbus_RPC_Ashmem_2000: run writeAshmem success, result is " + result2);
            expect(result2).assertTrue();
            let retReadAshmem = data.readAshmem();
            console.log("SUB_Softbus_RPC_Ashmem_2000: run readAshmem is " + retReadAshmem);
            let retBytes = retReadAshmem.readFromAshmem(bytes.length, 1);
            console.log("SUB_Softbus_RPC_Ashmem_2000: run readFromAshmem result is " + retBytes);
            for (let i = 0; i < bytes.length; i++) {
                expect(retBytes[i]).assertEqual(bytes[i])
            }
            ashmem.closeAshmem();
            data.reclaim();
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_2000: error " +error);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_2000---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_Ashmem_2100
     * @tc.name    Create a non shared memory object and call writeashmem to write the messageparcel object
      object into the messageparcel object
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_Ashmem_2100",0,function(){
        console.log("---------------------start SUB_Softbus_RPC_Ashmem_2100---------------------------");
        try{
            let data = rpc.MessageParcel.create();
            let data2 = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_Ashmem_2100: create MessageParcel object success");
            var flag = false;
            let result = data.writeAshmem(data2);
            console.log("SUB_Softbus_RPC_Ashmem_2100: run writeAshmem success, result is " + result);
            flag = true;
            data.reclaim();
            data2.reclaim();
        }catch(error){
            console.log("SUB_Softbus_RPC_Ashmem_2100: error " + error);
            expect(flag).assertEqual(false);
        }
        console.log("---------------------end SUB_Softbus_RPC_Ashmem_2100---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_IRemoteObject_0100
     * @tc.name    Call sendrequestresult interface to send data
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_IRemoteObject_0100",0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_IRemoteObject_0100---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_IRemoteObject_0100: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var sequenceable = new MySequenceable(1, "aaa");
            var result = data.writeSequenceable(sequenceable);
            console.log("SUB_Softbus_RPC_IRemoteObject_0100: run writeSequenceable success, result is " + result);

            await gIRemoteObject.sendRequest(CODE_WRITESEQUENCEABLE, data, reply, option).then((result) => {
                console.log("SUB_Softbus_RPC_IRemoteObject_0100: sendRequest success, result is " + result.errCode);
                expect(result.errCode).assertEqual(0);

                let ret = new MySequenceable(0, '');
                var shortArryDataReply = result.reply.readSequenceable(ret);
                console.log("SUB_Softbus_RPC_IRemoteObject_0100: run readSequenceable is success, result is "
                    + ret);
                expect(shortArryDataReply).assertTrue()
                expect(ret.num).assertEqual(1)
                expect(ret.str).assertEqual("aaa")
            });
        }catch(error){
            console.log("SUB_Softbus_RPC_IRemoteObject_0100: error " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_IRemoteObject_0100---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_IRemoteObject_0200
     * @tc.name    Test that messageparcel passes through the same process, and the client
     *             receives the reply message in promise
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_IRemoteObject_0200", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_IRemoteObject_0200---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_IRemoteObject_0200: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeByte(1)).assertTrue()
            expect(data.writeShort(2)).assertTrue()
            expect(data.writeInt(3)).assertTrue()
            expect(data.writeLong(10000)).assertTrue()
            expect(data.writeFloat(1.2)).assertTrue()
            expect(data.writeDouble(10.2)).assertTrue()
            expect(data.writeBoolean(true)).assertTrue()
            expect(data.writeChar('a')).assertTrue()
            expect(data.writeString("HelloWorld")).assertTrue()
            expect(data.writeSequenceable(new MySequenceable(1, "aaa"))).assertTrue()
            await gIRemoteObject.sendRequest(CODE_ALL_TYPE, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_IRemoteObject_0200: sendRequest done, error code: " + result.errCode);
                expect(result.errCode).assertEqual(0)
                expect(result.reply.readByte()).assertEqual(1)
                expect(result.reply.readShort()).assertEqual(2)
                expect(result.reply.readInt()).assertEqual(3)
                expect(result.reply.readLong()).assertEqual(10000)
                expect(result.reply.readFloat()).assertEqual(1.2)
                expect(result.reply.readDouble()).assertEqual(10.2)
                expect(result.reply.readBoolean()).assertTrue()
                expect(result.reply.readChar()).assertEqual('a')
                expect(result.reply.readString()).assertEqual("HelloWorld")
                let s = new MySequenceable(0, '')
                expect(result.reply.readSequenceable(s)).assertTrue()
                expect(s.num).assertEqual(1)
                expect(s.str).assertEqual("aaa")
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_IRemoteObject_0200:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_IRemoteObject_0200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_IRemoteObject_0300
     * @tc.name    Test that messageparcel passes through the same process, and the client
     *             receives the reply message in the callback function
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_IRemoteObject_0300", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_IRemoteObject_0300---------------------------");
        try{
            var data = rpc.MessageParcel.create();
            console.log("SUB_Softbus_RPC_IRemoteObject_0300: create object successfully.");
            var reply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            expect(data.writeByte(1)).assertTrue()
            expect(data.writeShort(2)).assertTrue()
            expect(data.writeInt(3)).assertTrue()
            expect(data.writeLong(10000)).assertTrue()
            expect(data.writeFloat(1.2)).assertTrue()
            expect(data.writeDouble(10.2)).assertTrue()
            expect(data.writeBoolean(true)).assertTrue()
            expect(data.writeChar('a')).assertTrue()
            expect(data.writeString("HelloWorld")).assertTrue()
            expect(data.writeSequenceable(new MySequenceable(1, "aaa"))).assertTrue()
            const CODE_IREMOTEOBJECT_0200 = 21;
            await gIRemoteObject.sendRequest(CODE_ALL_TYPE, data, reply, option, (err, result) => {
                console.info("SUB_Softbus_RPC_IRemoteObject_0300:sendRequest done, error code: " + result.errCode)
                expect(result.errCode).assertEqual(0)
                expect(result.reply.readByte()).assertEqual(1)
                expect(result.reply.readShort()).assertEqual(2)
                expect(result.reply.readInt()).assertEqual(3)
                expect(result.reply.readLong()).assertEqual(10000)
                expect(result.reply.readFloat()).assertEqual(1.2)
                expect(result.reply.readDouble()).assertEqual(10.2)
                expect(result.reply.readBoolean()).assertTrue()
                expect(result.reply.readChar()).assertEqual('a')
                expect(result.reply.readString()).assertEqual("HelloWorld")
                let s = new MySequenceable(0, '')
                expect(result.reply.readSequenceable(s)).assertTrue()
                expect(s.num).assertEqual(1)
                expect(s.str).assertEqual("aaa")
            });
        } catch (error) {
            console.log("SUB_Softbus_RPC_IRemoteObject_0300:error = " + error);
        }
        data.reclaim();
        reply.reclaim();
        done();
        console.log("---------------------end SUB_Softbus_RPC_IRemoteObject_0300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_IRemoteObject_0400
     * @tc.name    Iremoteobject, register death notification verification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_IRemoteObject_0400", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_IRemoteObject_0400---------------------------");
        try{
            let object = new TestAbilityStub("Test1")
            var resultAdd1 = object.addDeathRecipient(null, 0)
            console.log("SUB_Softbus_RPC_IRemoteObject_0400:run addDeathRecipient first result is " + resultAdd1);
            expect(resultAdd1).assertFalse();

            var resultRemove1 = object.removeDeathRecipient(null, 0)
            console.log("SUB_Softbus_RPC_IRemoteObject_0400:run removeDeathRecipient1 result is " + resultRemove1);
            expect(resultRemove1).assertFalse();

            let isDead = object.isObjectDead()
            console.log("SUB_Softbus_RPC_IRemoteObject_0400:run  isDead result is " + isDead);
            expect(isDead).assertFalse();
        } catch (error) {
            console.log("SUB_Softbus_RPC_IRemoteObject_0400:error = " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_IRemoteObject_0400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_IRemoteObject_0500
     * @tc.name    Do not get the server agent, do not create a remoteobject instance, and directly getcallingpid,
     *             getcallingpid, getcallingdeviceid, getlocaldeviceid
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_IRemoteObject_0500", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_IRemoteObject_0500---------------------------");
        try{
            let callingPid = rpc.RPCSkeleton.getCallingPid()
            console.log("SUB_Softbus_RPC_IRemoteObject_0500: run getCallingPid success, callingPid is " + callingPid);

            let callingUid = rpc.RPCSkeleton.getCallingUid()
            console.log("SUB_Softbus_RPC_IRemoteObject_0500: run getCallingPid success, callingPid is " + callingUid);

            let callingDeviceID = rpc.RPCSkeleton.getCallingDeviceID()
            console.log("SUB_Softbus_RPC_IRemoteObject_0500: run getCallingDeviceID success, callingDeviceID is "
                + callingDeviceID);
            expect(callingDeviceID).assertEqual("");

            let localDeviceID = rpc.RPCSkeleton.getLocalDeviceID()
            console.log("SUB_Softbus_RPC_IRemoteObject_0500: run getLocalDeviceID success, localDeviceID is "
                + localDeviceID);
            expect(localDeviceID).assertEqual("");
        } catch (error) {
            console.log("SUB_Softbus_RPC_IRemoteObject_0500:error = " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_IRemoteObject_0500---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_IRemoteObject_0600
     * @tc.name    Querylocalinterface searches for objects based on descriptors
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_IRemoteObject_0600", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_IRemoteObject_0600---------------------------");
        try{
            let object = new TestAbilityStub("Test1");
            console.log("SUB_Softbus_RPC_IRemoteObject_0600: run TestAbilityStub success");
            let result = object.isObjectDead();
            console.log("SUB_Softbus_RPC_IRemoteObject_0600: run isObjectDead success, result is " + result);
            expect(result).assertFalse();
            let callingPid = object.getCallingPid();
            console.log("SUB_Softbus_RPC_IRemoteObject_0600: run getCallingPid success, callingPid is " + callingPid);
            let callingUid = object.getCallingUid();
            console.log("SUB_Softbus_RPC_IRemoteObject_0600: run getCallingPid success, callingPid is " + callingUid);
            object.attachLocalInterface(object, "Test1");
            console.log("SUB_Softbus_RPC_IRemoteObject_0600: run attachLocalInterface success");
            let res = object.queryLocalInterface("Test1");
            console.log("SUB_Softbus_RPC_IRemoteObject_0600: run queryLocalInterface success, res2 is " + res);
        } catch (error) {
            console.log("SUB_Softbus_RPC_IRemoteObject_0600:error = " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_IRemoteObject_0600---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_IRemoteObject_0700
     * @tc.name    Getinterfacedescriptor to get the interface description
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_IRemoteObject_0700", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_IRemoteObject_0700---------------------------");
        try{
            let object = new TestAbilityStub("Test1223");
            let result = object.isObjectDead()
            console.log("SUB_Softbus_RPC_IRemoteObject_0700: run isObjectDead success, result is " + result);
            expect(result).assertFalse();
            let callingPid = object.getCallingPid();
            console.log("SUB_Softbus_RPC_IRemoteObject_0700: run getCallingPid success, callingPid is " + callingPid);
            let callingUid = object.getCallingUid();
            console.log("SUB_Softbus_RPC_IRemoteObject_0700: run getCallingPid success, callingPid is " + callingUid);
            object.attachLocalInterface(object, "test1");
            console.log("SUB_Softbus_RPC_IRemoteObject_0700: run attachLocalInterface success");
            let result2 = object.getInterfaceDescriptor();
            console.log("SUB_Softbus_RPC_IRemoteObject_0700: run getInterfaceDescriptor success, result2 is "
                + result2);
            expect(result2).assertEqual("test1");
        } catch (error) {
            console.log("SUB_Softbus_RPC_IRemoteObject_0700:error = " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_IRemoteObject_0700---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_RemoteProxy_0100
     * @tc.name    Call adddeathrecipient to register the death notification
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_RemoteProxy_0100", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_RemoteProxy_0100---------------------------");
        try{
            let recipient = new MyDeathRecipient(gIRemoteObject, null);
            var resultAdd1 = gIRemoteObject.addDeathRecipient(recipient, 0);
            console.log("SUB_Softbus_RPC_RemoteProxy_0100:run addDeathRecipient first result is " + resultAdd1);
            expect(resultAdd1).assertTrue();
            var resultAdd2 = gIRemoteObject.addDeathRecipient(recipient, 0);
            console.log("SUB_Softbus_RPC_RemoteProxy_0100:run addDeathRecipient second result is " + resultAdd2);
            expect(resultAdd2).assertTrue();
            var resultRemove1 = gIRemoteObject.removeDeathRecipient(recipient, 0);
            console.log("SUB_Softbus_RPC_RemoteProxy_0100:run removeDeathRecipient1 result is " + resultRemove1);
            expect(resultRemove1).assertTrue();
            var resultRemove2 = gIRemoteObject.removeDeathRecipient(recipient, 0);
            console.log("SUB_Softbus_RPC_RemoteProxy_0100:run  removeDeathRecipient2 result is " + resultRemove2);
            expect(resultRemove2).assertTrue();
            var resultRemove3 = gIRemoteObject.removeDeathRecipient(recipient, 0);
            console.log("SUB_Softbus_RPC_RemoteProxy_0100:run  removeDeathRecipient3 result is " + resultRemove3);
            expect(resultRemove3).assertFalse();
        } catch (error) {
            console.log("SUB_Softbus_RPC_RemoteProxy_0100:error = " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_RemoteProxy_0100---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_RemoteProxy_0200
     * @tc.name    Call isobjectdead to check whether the object is dead
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_RemoteProxy_0200", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_RemoteProxy_0200---------------------------");
        try{
            let recipient = new MyDeathRecipient(proxy, null);
            var resultAdd1 = proxy.addDeathRecipient(recipient, 0);
            console.log("SUB_Softbus_RPC_RemoteProxy_0200:run addDeathRecipient first result is " + resultAdd1);
            expect(resultAdd1).assertTrue();
            var isDead1 = proxy.isObjectDead();
            console.log("SUB_Softbus_RPC_RemoteProxy_0200: run isObjectDead result is " + isDead1);
            expect(isDead1).assertTrue();
            var resultAdd2 = proxy.addDeathRecipient(recipient, 0);
            console.log("SUB_Softbus_RPC_RemoteProxy_0200:run addDeathRecipient second result is " + resultAdd2);
            expect(resultAdd2).assertTrue();
            var resultRemove1 = proxy.removeDeathRecipient(recipient, 0);
            console.log("SUB_Softbus_RPC_RemoteProxy_0200:run removeDeathRecipient1 result is " + resultRemove1);
            expect(resultRemove1).assertTrue();
            var isDead2 = proxy.isObjectDead();
            console.log("SUB_Softbus_RPC_RemoteProxy_0200: run isObjectDead2 result is " + isDead2);
            expect(isDead1).assertFalse();
        } catch (error) {
            console.log("SUB_Softbus_RPC_RemoteProxy_0200:error = " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_RemoteProxy_0200---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_RemoteProxy_0300
     * @tc.name    Getinterfacedescriptor to get the object interface description
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_RemoteProxy_0300", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_RemoteProxy_0300---------------------------");
        try{
            let object = new TestAbilityStub("Test0300");

            let result = object.getInterfaceDescriptor()
            console.log("SUB_Softbus_RPC_RemoteProxy_0300: run getInterfaceDescriptor success, result is " + result);
            expect(result).assertEqual("Test0300");
        } catch (error) {
            console.log("SUB_Softbus_RPC_RemoteProxy_0300:error = " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_RemoteProxy_0300---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_RemoteProxy_0400
     * @tc.name    Querylocalinterface searches for objects based on descriptors
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_RemoteProxy_0400", 0,async function(){
        console.log("---------------------start SUB_Softbus_RPC_RemoteProxy_0400---------------------------");
        try{
            let object = new TestAbilityStub("Test0400");

            let result = object.isObjectDead();
            console.log("SUB_Softbus_RPC_RemoteProxy_0400: run getInterfaceDescriptor success, result is " + result);
            expect(result).assertFalse();
            let res = object.attachLocalInterface(object, "Test2");
            console.log("SUB_Softbus_RPC_RemoteProxy_0400: run attachLocalInterface success, res is " + res);
            let res2 = object.queryLocalInterface('Test2');
            console.log("SUB_Softbus_RPC_RemoteProxy_0400: run queryLocalInterface success, res2 is " + res2);
            let resultDescrip = object.getInterfaceDescriptor()
            console.log("SUB_Softbus_RPC_RemoteProxy_0400: run getInterfaceDescriptor success resultDescrip is "
                + resultDescrip);
            expect(resultDescrip).assertEqual("Test2");
        } catch (error) {
            console.log("SUB_Softbus_RPC_RemoteProxy_0400:error = " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_RemoteProxy_0400---------------------------");
    });

    /*
     * @tc.number  SUB_Softbus_RPC_RemoteProxy_0500
     * @tc.name    Transaction constant validation
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_RemoteProxy_0500", 0, async function(){
        console.log("SUB_Softbus_RPC_RemoteProxy_0500 is starting-------------")
        try {
            expect(rpc.RemoteProxy.PING_TRANSACTION).assertEqual(1599098439);
            expect(rpc.RemoteProxy.DUMP_TRANSACTION).assertEqual(1598311760);
            expect(rpc.RemoteProxy.INTERFACE_TRANSACTION).assertEqual(1598968902);
            expect(rpc.RemoteProxy.MIN_TRANSACTION_ID).assertEqual(0x1);
            expect(rpc.RemoteProxy.MAX_TRANSACTION_ID).assertEqual(0x00FFFFFF);
        } catch (error) {
            console.log("SUB_Softbus_RPC_RemoteProxy_0500 error is" + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_RemoteProxy_0500---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_RPCSkeleton_1000
     * @tc.name    Create an empty object and verify the function of the flushcommands interface
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_Softbus_RPC_RPCSkeleton_1000', 0, async function() {
        console.log("---------------------start SUB_Softbus_RPC_RPCSkeleton_1000---------------------------");
        try {
            console.info("SUB_Softbus_RPC_RPCSkeleton_1000")
            let remoteObject = {};
            let ret = rpc.RPCSkeleton.flushCommands(remoteObject);
            console.log("RpcServer: flushCommands result: " + ret);
        }
        catch (error) {
            console.log("SUB_Softbus_RPC_RPCSkeleton_1000 error is :" + error)
        }
        console.log("---------------------end SUB_Softbus_RPC_RPCSkeleton_1000---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_RPCSkeleton_2000
     * @tc.name    Do not get the server agent, do not create a remoteobject instance, and directly getcallingpid,
     *             getcallingpid, getcallingdeviceid, getlocaldeviceid
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_Softbus_RPC_RPCSkeleton_2000', 0, async function() {
        console.log("---------------------start SUB_Softbus_RPC_RPCSkeleton_2000---------------------------");
        try{
            let getCallingPid = rpc.RPCSkeleton.getCallingPid();
            console.log("SUB_Softbus_RPC_RPCSkeleton_2000: run  getCallingPid result is :" + getCallingPid);
            expect(getCallingPid.assertEqual(nll)).assertFale();
            let getCallingUid = rpc.RPCSkeleton.getCallingUid();
            console.log("SUB_Softbus_RPC_RPCSkeleton_2000: run getCallingUid result is :" + getCallingUid);
            expect(getCallingUid.assertEqual(nll)).assertFale();
            let getCallingToKenId = rpc.RPCSkeleton.getCallingToKenId();
            console.log("SUB_Softbus_RPC_RPCSkeleton_2000: run getCallingToKenId result is :" + getCallingToKenId);
            expect(getCallingToKenId.assertEqual(nll)).assertFale();
            let getLocalDeviceID = rpc.RPCSkeleton.getLocalDeviceID();
            console.log("SUB_Softbus_RPC_RPCSkeleton_2000: run getLocalDeviceID result is :" + getLocalDeviceID);
            expect(getLocalDeviceID.assertEqual(nll)).assertFale();
            let getCallingDeviceID = rpc.RPCSkeleton.getCallingDeviceID();
            console.log("SUB_Softbus_RPC_RPCSkeleton_2000: run getCallingDeviceID result is :" + getCallingDeviceID);
            expect(getCallingDeviceID.assertEqual(nll)).assertFale();
        } catch (error){
            console.log("SUB_Softbus_RPC_RPCSkeleton_2000: error = " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_RPCSkeleton_2000---------------------------");
    })

    /*
     * @tc.number  SUB_Softbus_RPC_IPCSkeleton_3000
     * @tc.name    Basic method of testing ipcskeleton
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_Softbus_RPC_IPCSkeleton_3000", 0,async function(done){
        console.log("---------------------start SUB_Softbus_RPC_IPCSkeleton_3000---------------------------");
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
            console.info("SUB_Softbus_RPC_RPCSkeleton_3000： callingPid: " + callingPid + ", callingUid: " + callingUid);
            await gIRemoteObject.sendRequest(CODE_IPCSKELETON, data, reply, option).then((result) => {
                console.info("SUB_Softbus_RPC_IPCSkeleton_3000： sendRequest done, error code: " + result.errCode)
                expect(result.errCode).assertEqual(0);
                result.reply.readException();
                let rescallingPid = result.reply.readInt();
                let rescallingUid = result.reply.readInt();
                let rescallingDeviceID = result.reply.readString();
                let reslocalDeviceID = result.reply.readString();
                let resisLocalCalling = result.reply.readBoolean();
                let restcallingPid = result.reply.readInt();
                let restcallingUid = result.reply.readInt();
                let resicallingPid = result.reply.readInt();
                let resicallingUid = result.reply.readInt();
                let resflushCommands = result.reply.readInt();

                console.info("SUB_Softbus_RPC_IPCSkeleton_3000：" + resicallingUid +" ;"+ resflushCommands);
                assertArrayElementEqual(resicallingPid,callingPid);
                assertArrayElementEqual(rescallingUid,callingUid);
                assertArrayElementEqual(resisLocalCalling,false);
                assertArrayElementEqual(restcallingPid,callingPid);
                assertArrayElementEqual(restcallingUid,callingUid);
                assertArrayElementEqual(resicallingPid,callingPid);
                assertArrayElementEqual(rescallingUid,callingUid);
                assertArrayElementEqual(resflushCommands,101);
                console.info("SUB_Softbus_RPC_IPCSkeleton_3000：:" + rescallingDeviceID + ";" +reslocalDeviceID);
            })
            data.reclaim();
            reply.reclaim();
            done();
        } catch (error) {
            console.log("SUB_Softbus_RPC_IPCSkeleton_3000:error = " + error);
        }
        console.log("---------------------end SUB_Softbus_RPC_IPCSkeleton_3000---------------------------");
    });
    console.log("-----------------------SUB_Softbus_RPC_MessageParce_Test is end-----------------------");
});
