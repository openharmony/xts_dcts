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
import TestService from "./testService"
import featureAbility from '@ohos.ability.featureAbility';
import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from '@ohos/hypium';
import { UiDriver, BY } from '@ohos.UiTest'

export default function RpcJsUnitTest() {

    describe('RpcJsUnitTest', function () {
        console.info("-----------------------SUB_Softbus_RPC_Compatibility_MessageParce_Test is starting-----------------------");

        const K = 1024;
        const M = 1024 * 1024;
        const G = 1024 * 1024 * 1024;
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
        const CODE_ONREMOTEMESSAGE_OR_ONREMOTEREQUEST = 37;
        const CODE_ONREMOTEMESSAGE = 38;
        let gIRemoteObject = null;
        var testservice = null

        class MySequenceableCode {
            constructor(num, string) {
                this.num = num;
                this.str = string;
            }
            marshalling(MessageSequence) {
                MessageSequence.writeInt(this.num);
                MessageSequence.writeString(this.str);
                return true;
            }
            unmarshalling(MessageSequence) {
                this.num = MessageSequence.readInt();
                this.str = MessageSequence.readString();
                return true;
            }
        }

        class MySequenceable {
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
            asObject() {
                return this;
            }
        }

        class TestListener extends rpc.RemoteObject {
            constructor(descriptor, checkResult) {
                super(descriptor);
                this.checkResult = checkResult;
            }
            onRemoteRequest(code, data, reply, option) {
                let result = false;
                if (code === 1) {
                    console.info("onRemoteRequest called, descriptor: " + this.getInterfaceDescriptor());
                    result = true;
                } else {
                    console.info("unknown code: " + code);
                }
                let _checkResult = this.checkResult;
                let _num = data.readInt();
                let _str = data.readString();
                _checkResult(_num, _str);
                sleep(2000);
                return result;
            }
        }

        class TestAbilityStub extends rpc.RemoteObject {
            constructor(descriptor) {
                super(descriptor);
            }
            onRemoteRequest(code, data, reply, option) {
                console.info("TestAbilityStub: onRemoteRequest called, code: " + code);
                let descriptor = data.readInterfaceToken();
                if (descriptor !== "TestAbilityStub") {
                    console.error("received unknown descriptor: " + descriptor);
                    return false
                }
                switch (code) {
                    case 1:
                        {
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
                            data.readSequenceable(s);
                            reply.writeNoException();
                            reply.writeByte(tmp1);
                            reply.writeShort(tmp2);
                            reply.writeInt(tmp3);
                            reply.writeLong(tmp4);
                            reply.writeFloat(tmp5);
                            reply.writeDouble(tmp6);
                            reply.writeBoolean(tmp7);
                            reply.writeChar(tmp8);
                            reply.writeString(tmp9);
                            reply.writeSequenceable(s);
                            return true
                        }
                    default:
                        {
                            console.error("default case, code: " + code);
                            return false
                        }
                }
            }
        }

        class TestAbilityMessageStub extends rpc.RemoteObject {
            constructor(descriptor) {
                super(descriptor);
            }
            onRemoteMessageRequest(code, data, reply, option) {
                console.info("TestAbilityMessageStub: onRemoteMessageRequest called, code: " + code);
                let descriptor = data.readInterfaceToken();
                if (descriptor !== "TestAbilityMessageStub") {
                    console.error("received unknown descriptor: " + descriptor);
                    return false
                }
                switch (code) {
                    case 1:
                        {
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
                            reply.writeNoException();
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
                            return true
                        }
                    default:
                        {
                            console.error("default case, code: " + code);
                            return false
                        }
                }
            }
        }

        class MyDeathRecipient {
            constructor(gIRemoteObject, done) {
                this.gIRemoteObject = gIRemoteObject;
                this.done = done;
            }
            onRemoteDied() {
                console.info("server died");
                expect(this.gIRemoteObject.removeDeathRecipient(this, 0)).assertTrue();
                let _done = this.done;
                _done();
                sleep(1000);
            }
        }

        class MyregisterDeathRecipient {
            constructor(gIRemoteObject, done) {
                this.gIRemoteObject = gIRemoteObject;
                this.done = done;
            }

            onRemoteDied() {
                console.info("server died");
                expect(this.proxy.unregisterDeathRecipient(this, 0)).assertTrue();
                let _done = this.done;
                _done();
                sleep(1000);
            }
        }

        class TestProxy {
            remote = rpc.RemoteObject;
            constructor(remote) {
                this.remote = remote;
                console.info("test remote");
            }
            asObject() {
                console.info("server remote");
                return this.remote
            }
        }

        function assertArrayElementEqual(actual, expected) {
            expect(actual.length).assertEqual(expected.length);
            for (let i = 0; i < actual.length; i++) {
                expect(actual[i]).assertEqual(expected[i]);
            }
        }

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function getPermission() {
            console.info(`getPermission is start`);
            let permissions = ['ohos.permission.DISTRIBUTED_DATASYNC'];
            let context = featureAbility.getContext()
            context.requestPermissionsFromUser(permissions, 666, (data) => {
                console.info("request success" + JSON.stringify(data));

            })
        }
        async function driveFn() {
            try {
                let driver = await UiDriver.create()
                console.info(` come in driveFn`)
                console.info(`driver is ${JSON.stringify(driver)}`)
                sleep(2000);
                let button = await driver.findComponent(BY.text('允许'));
                console.info(`button is ${JSON.stringify(button)}`);
                sleep(5000);
                await button.click();
            } catch (err) {
                console.info('err is ' + err);
                return;
            }

        }

        beforeAll(async function (done) {
            console.info('beforeAll called rpc');

            await getPermission();
            
            sleep(5000);
            await driveFn();
            sleep(2000);

            testservice = new TestService
            await testservice.toConnectAbility().then(data => {
                gIRemoteObject = data;
                console.info("RpcClient: toConnectAbility data is： " + data);
            })
            done();
            console.info("beforeAll done");
        })
        beforeEach(function () {
            console.info(('beforeEach called'));
        })
        afterEach(function () {
            console.info('afterEach called');
        })
        afterAll(function () {
            console.info('afterAll called');
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_00100
        * @tc.name    Call the writeinterfacetoken interface, write the interface descriptor, and read interfacetoken
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_00100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_00100---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInterfaceToken()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_00100---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_00200
            * @tc.name    The writeInterfaceToken interface is looping, the interface descriptor is written, and the
                        InterfaceToken is read
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_00200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_00200---------------------------");
            try {
                for (let i = 0; i < 5; i++) {
                    var data = rpc.MessageSequence.create();
                    var reply = rpc.MessageSequence.create();
                    var option = new rpc.MessageOption();
                    let token = "hello ruan zong xian";
                    data.writeInterfaceToken(token);
                    expect(gIRemoteObject != undefined).assertTrue();
                    await gIRemoteObject.sendMessageRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
                        expect(result.errCode).assertEqual(0);
                        expect(result.reply.readInterfaceToken()).assertEqual(token);
                    });
                    data.reclaim();
                    reply.reclaim();
                }
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_00200---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_00300
            * @tc.name    Call the WriteInterfaceToken interface, write the maximum length interface descriptor, and read
                        the InterfaceToken
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_00300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_00300---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = "";
                for (let i = 0; i < (40 * K - 1); i++) {
                    token += 'a';
                }
                data.writeInterfaceToken(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInterfaceToken()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_00300---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_00400
            * @tc.name    The WriteInterfaceToken interface is called, the exceeding-length interface descriptor is written,
                        and the InterfaceToken is read
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_00400", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_00400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = "";
                for (let i = 0; i < 40 * K; i++) {
                    token += 'a';
                }
                data.writeInterfaceToken(token);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_00400---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_00500
            * @tc.name    Call the writeinterfacetoken interface to write a non string interface descriptor
                        and read interfacetoken
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_00500", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_00500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = 123;
                data.writeInterfaceToken(token);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_00500---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_00600
            * @tc.name    Call the writeshortarray interface, write the array to the MessageSequence instance,
            *             and call readshortarray to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_00600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_00600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wShortArryData = [-1, 0, 1];
                data.writeShortArray(wShortArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readShortArray(), wShortArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_00600---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_00700
            * @tc.name    Call the writeshortarray interface, write the short integer array to the MessageSequence instance,
            *             and call readshortarray (datain: number []) to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_00700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_00700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wShortArryData = [];
                for (let i = 0; i < (50 * 1024 - 1); i++) {
                    wShortArryData[i] = 1;
                }
                data.writeShortArray(wShortArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rShortArryData = [];
                    result.reply.readShortArray(rShortArryData);
                    assertArrayElementEqual(rShortArryData, wShortArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_00700---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_00800
            * @tc.name    Writeshortarray interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_00800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_00800---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wShortArryData = [-32768, 0, 1, 2, 32767];
                data.writeShortArray(wShortArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readShortArray(), wShortArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_00800---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_00900
            * @tc.name    Writeshortarray interface, illegal value validation
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_00900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_00900---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var eShortArryData = [-32769, 32768];
                data.writeShortArray(eShortArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var erShortArryData = [32767, -32768];
                    assertArrayElementEqual(result.reply.readShortArray(), erShortArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_00900---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_01000
            * @tc.name    Writeshortarray interface, transmission length verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_01000", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_01000---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var eShortArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    eShortArryData[i] = 1;
                };
                data.writeShortArray(eShortArryData);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_01000---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_01100
            * @tc.name    Call the writelongarray interface, write the long integer array to the MessageSequence instance,
            *             and call readlongarray to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_01100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_01100---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wLongArryData = [3276826, 123456, 9999999];
                data.writeLongArray(wLongArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readLongArray(), wLongArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_01100---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_01200
            * @tc.name    Call the writelongarray interface, write the long integer array to the MessageSequence instance,
            *             and call readlongarray (datain: number []) to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_01200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_01200---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wLongArryData = [];
                for (let i = 0; i < (25 * K - 1); i++) {
                    wLongArryData[i] = 11;
                };
                data.writeLongArray(wLongArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rLongArryData = [];
                    result.reply.readLongArray(rLongArryData);
                    assertArrayElementEqual(rLongArryData, wLongArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_01200---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_01300
            * @tc.name    Writelongarray interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_01300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_01300---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wLongArryData = [-9007199254740992, 0, 1, 2, 9007199254740991];
                data.writeLongArray(wLongArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rLongArryData = [];
                    result.reply.readLongArray(rLongArryData);
                    assertArrayElementEqual(rLongArryData, wLongArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_01300---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_01400
            * @tc.name    Writelongarray interface, long type precision verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_01400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_01400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wLongArryData = [-9999999999999999, 9999999999999999];
                data.writeLongArray(wLongArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rLongArryData = result.reply.readLongArray();
                    let newlongdata = [-10000000000000000, 10000000000000000];
                    expect(rLongArryData[0]).assertEqual(newlongdata[0]);
                    expect(rLongArryData[1]).assertEqual(newlongdata[1]);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_01400---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_01500
            * @tc.name    Writelongarray Indicates an interface for verifying the input length
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_01500", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_01500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var wLongArryData = [];
                for (let i = 0; i < 25 * K; i++) {
                    wLongArryData[i] = 11;
                };
                data.writeLongArray(wLongArryData);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_01500---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_01600
            * @tc.name    Call the writedoublearray interface, write the array to the MessageSequence instance,
            *             and call readdoublearra to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_01600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_01600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wDoubleArryData = [1.2, 235.67, 99.76];
                data.writeDoubleArray(wDoubleArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readDoubleArray(), wDoubleArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_01600---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_01700
            * @tc.name    Call the writedoublearray interface, write the array to the MessageSequence instance,
            *             and call readdoublearra (datain: number []) to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_01700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_01700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wDoubleArryData = [];
                for (let i = 0; i < (25 * K - 1); i++) {
                    wDoubleArryData[i] = 11.1;
                };
                data.writeDoubleArray(wDoubleArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rDoubleArryData = [];
                    result.reply.readDoubleArray(rDoubleArryData);
                    assertArrayElementEqual(rDoubleArryData, wDoubleArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_01700---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_01800
            * @tc.name    Writedoublearray interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_01800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_01800---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wDoubleArryData = [4.9E-324, 235.67, 1.79E+308];
                data.writeDoubleArray(wDoubleArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readDoubleArray(), wDoubleArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_01800---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_01900
            * @tc.name    Writedoublearray interface, illegal value validation
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_01900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_01900---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var eDoubleArryData = [(4.9E-324) - 1, (1.79E+308) + 1];
                data.writeDoubleArray(eDoubleArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rDoubleArryData = result.reply.readDoubleArray();
                    expect(rDoubleArryData[0]).assertEqual(-1);
                    expect(rDoubleArryData[1]).assertEqual(1.79e+308);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_01900---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_02000
            * @tc.name    Writedoublearray interface, Out-of-bounds value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_02000", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_02000---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var eDoubleArryData = [];
                for (let i = 0; i < 25 * K; i++) {
                    eDoubleArryData[i] = 11.1;
                }
                data.writeDoubleArray(eDoubleArryData);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_02000---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_02100
            * @tc.name    Call the writebooleanarray interface, write the array to the MessageSequence instance,
            *             and call readbooleanarray to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_02100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_02100---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wBooleanArryData = [true, false, false];
                data.writeBooleanArray(wBooleanArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readBooleanArray(), wBooleanArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_02100---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_02200
            * @tc.name    Call the writebooleanarray interface, write the array to the MessageSequence instance,
            *             and call readbooleanarray (datain: number []) to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_02200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_02200---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wBooleanArryData = [];
                for (let i = 0; i < (50 * K - 1); i++) {
                    if (i % 2 == 0) {
                        wBooleanArryData[i] = false;
                    } else {
                        wBooleanArryData[i] = true;
                    }
                }
                data.writeBooleanArray(wBooleanArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rBooleanArryData = [];
                    result.reply.readBooleanArray(rBooleanArryData);
                    assertArrayElementEqual(rBooleanArryData, wBooleanArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_02200---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_02300
            * @tc.name    Writebooleanarray interface, illegal value validation
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_02300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_02300---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var errorBooleanArryData = [true, 9, false];
                data.writeBooleanArray(errorBooleanArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var eCharArrayData = [true, false, false];
                    assertArrayElementEqual(result.reply.readBooleanArray(), eCharArrayData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_02300---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_02400
            * @tc.name    Writebooleanarray Interface for length verification of input parameters
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_02400", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_02400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var wBooleanArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    if (i % 2 == 0) {
                        wBooleanArryData[i] = false;
                    } else {
                        wBooleanArryData[i] = true;
                    };
                }
                data.writeBooleanArray(wBooleanArryData);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_02400---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_02500
            * @tc.name    Call the writechararray interface, write the array to the MessageSequence instance,
            *             and call readchararray to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_02500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_02500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wCharArryData = [0, 97, 255];
                data.writeCharArray(wCharArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readCharArray(), wCharArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_02500---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_02600
            * @tc.name    Call the writechararray interface, write the array to the MessageSequence instance,
            *             and call readchararray (datain: number []) to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_02600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_02600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wCharArryData = [];
                for (let i = 0; i < (50 * K - 1); i++) {
                    wCharArryData[i] = 96;
                };
                data.writeCharArray(wCharArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rCharArryData = [];
                    result.reply.readCharArray(rCharArryData);
                    assertArrayElementEqual(rCharArryData, wCharArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_02600---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_02700
            * @tc.name    Writechararray interface, illegal value validation
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_02700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_02700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var errorCharArryData = [96, 'asfgdgdtu', 97];
                data.writeCharArray(errorCharArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let eCharArrayData = [96, 0, 97];
                    let readchardata = result.reply.readCharArray();
                    assertArrayElementEqual(readchardata, eCharArrayData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_02700---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_02800
            * @tc.name    Writechararray Indicates the length of an interface input parameter
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_02800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_02800---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var errorCharArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    errorCharArryData[i] = 96;
                };
                data.writeCharArray(errorCharArryData);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_02800---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_02900
            * @tc.name    Call the writestringarray interface, write the array to the MessageSequence instance,
            *             and call readstringarray (datain: number []) to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_02900", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_02900---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wStringArryData = ['abc', 'hello', 'beauty'];
                data.writeStringArray(wStringArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRINGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readStringArray(), wStringArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_02900---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_03000
            * @tc.name    Call the writestringarray interface, write the array to the MessageSequence instance,
            *             and call readstringarray() to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_03000", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_03000---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wStringArryData = [];
                for (let i = 0; i < (10 * K - 1); i++) {
                    wStringArryData[i] = "heddSDF";
                };
                data.writeStringArray(wStringArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRINGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rStringArryData = [];
                    result.reply.readStringArray(rStringArryData);
                    assertArrayElementEqual(rStringArryData, wStringArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_03000---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_03100
            * @tc.name    Writestringarray interface, illegal value validation
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_03100", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_03100---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var errorStringArryData = ['abc', 123, 'beauty'];
                data.writeStringArray(errorStringArryData);

            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_03100---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_03200
            * @tc.name    writeStringArray Interface for length verification of input parameters
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_03200", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_03200---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var wStringArryData = [];
                for (let i = 0; i < 10 * K; i++) {
                    wStringArryData[i] = "heddSDF";
                }
                data.writeStringArray(wStringArryData);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_03200---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_03300
            * @tc.name    Call the writebytearray interface, write the array to the MessageSequence instance,
            *             and call readbytearray to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_03300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_03300---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                let ByteArrayVar = [1, 2, 3, 4, 5];
                data.writeByteArray(ByteArrayVar);

                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readByteArray(), ByteArrayVar);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_03300---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_03400
            * @tc.name    Call the writebytearray interface, write the array to the MessageSequence instance,
            *             and call readbytearray (datain: number []) to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_03400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_03400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                let ByteArrayVar = [-128, 0, 1, 2, 127];
                data.writeByteArray(ByteArrayVar);

                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var newArr = new Array(5);
                    result.reply.readByteArray(newArr);
                    assertArrayElementEqual(ByteArrayVar, newArr);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_03400---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_03500
            * @tc.name    Writebytearray interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_03500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_03500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();

                let ByteArrayVar = [];
                for (let i = 0; i < (40 * K - 1); i++) {
                    ByteArrayVar[i] = 1;
                }
                data.writeByteArray(ByteArrayVar);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var newArr = new Array(5)
                    result.reply.readByteArray(newArr);
                    assertArrayElementEqual(newArr, ByteArrayVar);
                });
                data.reclaim();
                reply.reclaim();
                done();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_03500---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_03600
            * @tc.name    Writebytearray interface, illegal value validation
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_03600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_03600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                let ByteArrayVar = [-129, 0, 1, 2, 128];
                data.writeByteArray(ByteArrayVar);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var shortArryDataReply = result.reply.readByteArray();
                    expect(shortArryDataReply[0] == 127).assertTrue();
                    expect(shortArryDataReply[1] == ByteArrayVar[1]).assertTrue();
                    expect(shortArryDataReply[2] == ByteArrayVar[2]).assertTrue();
                    expect(shortArryDataReply[3] == ByteArrayVar[3]).assertTrue();
                    expect(shortArryDataReply[4] == -128).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_03600---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_03700
            * @tc.name    Writebytearray Interface，input parameter length verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_03700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_03700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [];
                for (let i = 0; i < 40 * K; i++) {
                    ByteArrayVar[i] = 1;
                }
                data.writeByteArray(ByteArrayVar)
                data.reclaim();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_03700---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_03800
            * @tc.name    Call the writeintarray interface, write the array to the MessageSequence instance,
            *             and call readintarray to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_03800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_03800---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var intArryData = [100, 111, 112];
                data.writeIntArray(intArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readIntArray(), intArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_03800---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_03900
            * @tc.name    Call the writeintarray interface, write the array to the MessageSequence instance,
            *             and call readintarray (datain: number []) to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_03900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_03900---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var intArryData = [];
                for (let i = 0; i < (50 * K - 1); i++) {
                    intArryData[i] = 1;
                };
                data.writeIntArray(intArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var newArr = new Array(3);
                    result.reply.readIntArray(newArr);
                    assertArrayElementEqual(newArr, intArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_03900---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_04000
            * @tc.name    Writeintarray interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_04000", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_04000---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var intArryData = [-2147483648, 0, 1, 2, 2147483647];
                data.writeIntArray(intArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readIntArray(), intArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_04000---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_04100
            * @tc.name    Writeintarray interface, illegal value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_04100", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_04100---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var intArryData = [-2147483649, 0, 1, 2, 2147483648];
                data.writeIntArray(intArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var shortArryDataReply = result.reply.readIntArray();
                    expect(shortArryDataReply[0] == 2147483647).assertTrue();
                    expect(shortArryDataReply[1] == intArryData[1]).assertTrue();
                    expect(shortArryDataReply[2] == intArryData[2]).assertTrue();
                    expect(shortArryDataReply[3] == intArryData[3]).assertTrue();
                    expect(shortArryDataReply[4] == -2147483648).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_04100---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_04200
            * @tc.name    Writeintarray interface, input parameter length verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_04200", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_04200---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var intArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    intArryData[i] = 1;
                }
                data.writeIntArray(intArryData);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_04200---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_04300
            * @tc.name    Call the writefloatarray interface, write the array to the MessageSequence instance,
            *             and call readfloatarray to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_04300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_04300---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var floatArryData = [1.2, 1.3, 1.4];
                data.writeFloatArray(floatArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readFloatArray(), floatArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_04300---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_04400
            * @tc.name    Call the writefloatarray interface, write the array to the MessageSequence instance,
            *             and call readfloatarray (datain: number []) to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_04400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_04400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var floatArryData = [1.4E-45, 1.3, 3.4028235E38];
                data.writeFloatArray(floatArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var newArr = new Array(3);
                    result.reply.readFloatArray(newArr);
                    assertArrayElementEqual(newArr, floatArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_04400---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_04500
            * @tc.name    Writefloatarray interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_04500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_04500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var floatArryData = [(1.4E-45) - 1, 1.3, (3.4028235E38) + 1];
                data.writeFloatArray(floatArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var newArr = result.reply.readFloatArray();
                    expect(newArr[0]).assertEqual(-1);
                    expect(newArr[1]).assertEqual(1.3);
                    expect(newArr[2]).assertEqual(3.4028235e+38);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_04500---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_04600
            * @tc.name    Writefloatarray interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_04600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_04600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var floatArryData = [];
                for (let i = 0; i < (25 * K - 1); i++) {
                    floatArryData[i] = 1.1;
                };
                data.writeFloatArray(floatArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readFloatArray(), floatArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_04600---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_04700
            * @tc.name    Writefloatarray interface, Longest array verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_04700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_04700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var floatArryData = [];
                for (let i = 0; i < (25 * K); i++) {
                    floatArryData[i] = 1.1;
                };
                data.writeFloatArray(floatArryData);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_04700---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_04800
            * @tc.name    Call the writeShort interface to write the short integer data to the MessageSequence instance,
            *             and call readshort to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_04800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_04800---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var short = 8;
                data.writeShort(short);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readShort(), short);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_04800---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_04900
            * @tc.name    WriteShort interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_04900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_04900---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeShort(-32768);
                data.writeShort(0);
                data.writeShort(1);
                data.writeShort(2);
                data.writeShort(32767);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readShort() == -32768).assertTrue();
                    expect(result.reply.readShort() == 0).assertTrue();
                    expect(result.reply.readShort() == 1).assertTrue();
                    expect(result.reply.readShort() == 2).assertTrue();
                    expect(result.reply.readShort() == 32767).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_04900---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_05000
            * @tc.name    WriteShort interface, Boundary value minimum value out of bounds verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_05000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_05000---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeShort(-32769);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readShort() == 32767).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_05000---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_05100
            * @tc.name    WriteShort interface, Boundary value maximum value out of bounds verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_05100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_05100---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeShort(32768);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readShort() == -32768).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_05100---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_05200
            * @tc.name    Call writelong interface to write long integer data to MessageSequence instance
            *             and call readlong to read data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_05200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_05200---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var long = 9007199254740991;
                data.writeLong(long);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readLong()).assertEqual(long);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_05200---------------------------");
        });


        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_05300
            * @tc.name    Writelong interface, Verification of maximum accuracy value
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_05300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_05300---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var long = -9007199254740992;
                data.writeLong(long);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readLong() == long).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_05300---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_05400
            * @tc.name    Writelong interface, Minimum loss accuracy verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_05400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_05400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var long = -9223372036854775300;
                data.writeLong(long);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readLong()).assertEqual(-9223372036854776000);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_05400---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_05500
            * @tc.name    Writelong interface, Maximum loss accuracy verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_05500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_05500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var short = 9223372036854775300;
                data.writeLong(short);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let readlong = result.reply.readLong();
                    expect(readlong != 0).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_05500---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_05600
            * @tc.name    Call the parallel interface to read and write data to the double instance
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_05600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_05600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = 4.9E-324;
                data.writeDouble(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readDouble()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_05600---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_05700
            * @tc.name    Writedouble interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_05700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_05700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = 1.79E+308;
                data.writeDouble(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readDouble()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_05700---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_05800
            * @tc.name    Writedouble interface, Minimum boundary value out of bounds verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_05800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_05800---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = (4.9E-324) - 1;
                data.writeDouble(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readDouble()).assertEqual(-1);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_05800---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_05900
            * @tc.name    Writedouble interface, illegal value validation
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_05900", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_05900---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = "1.79E+465312156";
                data.writeDouble(token);
                data.reclaim();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_05900---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_06000
            * @tc.name    Call the writeboolean interface to write the data to the MessageSequence instance,
            *             and call readboolean to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_06000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_06000---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = true;
                data.writeBoolean(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BOOLEAN, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readBoolean()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_06000---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_06100
            * @tc.name    Call the writeboolean interface to write the data to the MessageSequence instance,
            *             and call readboolean to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_06100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_06100---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = false;
                data.writeBoolean(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BOOLEAN, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readBoolean()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_06100---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_06200
            * @tc.name    Writeboolean interface, illegal value number type verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_06200", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_06200---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                data.writeBoolean(9);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_06200---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_06300
            * @tc.name    Writeboolean interface, illegal value string type verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_06300", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_06300---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = "true";
                data.writeBoolean(token);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_06300---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_06400
            * @tc.name    Call the writechar interface to write the minimum data to the MessageSequence instance,
            *               and call readchar to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_06400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_06400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = 0;
                data.writeChar(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_06400---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_06500
            * @tc.name    Call the writechar interface to write the maximum data to the MessageSequence instance,
            *              and call readchar to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_06500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_06500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = 255;
                data.writeChar(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_06500---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_06600
            * @tc.name    Call the writechar interface to write the minimum out of range data to the MessageSequence instance,
            *              and call readchar to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_06600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_06600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = -1;
                data.writeChar(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(255);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_06600---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_06700
            * @tc.name    Call the writechar interface to write the maximum out of range data to the MessageSequence instance,
            *              and call readchar to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_06700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_06700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = 256;
                data.writeChar(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(0);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_06700---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_06800
            * @tc.name    Writechar interface, illegal value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_06800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_06800---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = 'ades';
                data.writeChar(token);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_06800---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_06900
            * @tc.name    Call the writestring interface to write the data to the MessageSequence instance,
            *             and call readstring() to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_06900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_06900---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = '';
                for (var i = 0; i < (40 * K - 1); i++) {
                    token += 'a';
                }
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_06900---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_07000
            * @tc.name    Writestring interface Maximum data out of range verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_07000", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_07000---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = '';
                for (var i = 0; i < 40 * K; i++) {
                    token += 'a';
                }
                data.writeString(token);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_07000---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_07100
            * @tc.name    Writestring interface, illegal value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_07100", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_07100---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = 123;
                data.writeString(token);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_07100---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_07200
            * @tc.name    Call the writebyte interface to write data to the MessageSequence instance,
            *             and call readbyte to read data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_07200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_07200---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = 2;
                data.writeByte(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_07200---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_07300
            * @tc.name    Writebyte interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_07300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_07300---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeByte(128);
                data.writeByte(0);
                data.writeByte(1);
                data.writeByte(2);
                data.writeByte(127);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTE_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(reply.readByte()).assertEqual(-128);
                    expect(reply.readByte()).assertEqual(0);
                    expect(reply.readByte()).assertEqual(1);
                    expect(reply.readByte()).assertEqual(2);
                    expect(reply.readByte()).assertEqual(127);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim()
            reply.reclaim()
            done()
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_07300---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_07400
            * @tc.name    Writebyte interface, Maximum boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_07400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_07400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeByte(-129);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(127);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_07400---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_07500
            * @tc.name    Writebyte interface, Minimum boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_07500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_07500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeByte(128);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(-128);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_07500---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_07600
            * @tc.name    Writebyte interface, illegal value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_07600", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_07600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                data.writeByte("error");
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_07600---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_07700
            * @tc.name    Call the writeint interface to write the data to the MessageSequence instance,
            *             and call readint to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_07700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_07700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = 2;
                data.writeInt(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_07700---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_07800
            * @tc.name    Writeint interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_07800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_07800---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeInt(-2147483648);
                data.writeInt(0);
                data.writeInt(1);
                data.writeInt(2);
                data.writeInt(2147483647);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(-2147483648);
                    expect(result.reply.readInt()).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(1);
                    expect(result.reply.readInt()).assertEqual(2);
                    expect(result.reply.readInt()).assertEqual(2147483647);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_07800---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_07900
            * @tc.name    Writeint interface, Verification of minimum boundary overrun value
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_07900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_07900---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeInt(-2147483649);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(2147483647);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_07900---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_08000
            * @tc.name    Writeint interface, Verification of maximum boundary overrun value
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_08000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_08000---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeInt(2147483648);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(-2147483648);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_08000---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_08100
            * @tc.name    Writeint interface, illegal value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_08100", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_08100---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                data.writeInt("error");
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_08100---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_08200
            * @tc.name    Call the writefloat interface to write data to the MessageSequence instance,
            *             and call readfloat to read data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_08200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_08200---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = 2.2;
                data.writeFloat(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_08200---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_08300
            * @tc.name    Writefloat interface, Minimum boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_08300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_08300---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = 1.4E-45;
                data.writeFloat(token);

                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_08300---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_08400
            * @tc.name    Writefloat interface, Maximum boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_08400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_08400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = 3.4028235E38;
                data.writeFloat(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_08400---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_08500
            * @tc.name    Writefloat interface, Verification of maximum boundary overrun value
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_08500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_08500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = (3.4028235E38) + 1;
                data.writeFloat(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(3.4028235e+38);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_08500---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_08600
            * @tc.name    Writefloat interface, Verification of minimum boundary overrun value
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_08600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_08600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = (1.4E-45) - 1;
                data.writeFloat(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(-1);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_08600---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_08700
            * @tc.name    Writefloat interface, illegal value validation
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_08700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_08700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = 'a';
                data.writeFloat(token);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_08700---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_08800
            * @tc.name    Call the getRawDataCapacity interface to get the maximum amount of raw data that a MessageSequence
                            can hold
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_08800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_08800---------------------------");
            try {
                let parcel = new rpc.MessageSequence();
                let reply = new rpc.MessageSequence();
                let option = new rpc.MessageOption();
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
                parcel.writeIntArray([1, 2, 3, 4, 5]);
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INTARRAY, parcel, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
                    assertArrayElementEqual(result.reply.readIntArray(), [1, 2, 3, 4, 5]);
                    expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
                });
                parcel.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_08800---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_08900
        * @tc.name    Test MessageSequence to deliver rawdata data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_08900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_08900---------------------------");
            try {
                let parcel = new rpc.MessageSequence();
                let reply = new rpc.MessageSequence();
                let option = new rpc.MessageOption();
                let arr = [1, 2, 3, 4, 5];
                parcel.writeInt(arr.length);
                parcel.writeRawData(arr, arr.length);
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_RAWDATA, parcel, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let size = result.reply.readInt();
                    expect(size).assertEqual(arr.length);
                    expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
                    assertArrayElementEqual(result.reply.readRawData(size), arr);
                });
                parcel.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_08900---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_09000
        * @tc.name    Test MessageSequence to pass abnormal rawdata data, and expand the capacity for verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_09000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_09000---------------------------");
            try {
                let parcel = new rpc.MessageSequence();
                let reply = new rpc.MessageSequence();
                let option = new rpc.MessageOption();
                let arr = [1, 2, 3, 4, 5];
                parcel.writeInt(arr.length + 1);
                parcel.writeRawData(arr, (arr.length + 1));
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_RAWDATA, parcel, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let size = result.reply.readInt();
                    expect(size).assertEqual(arr.length + 1);
                    expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
                    let newReadResult = result.reply.readRawData(size);
                    expect(arr[0]).assertEqual(newReadResult[0]);
                    expect(arr[1]).assertEqual(newReadResult[1]);
                    expect(arr[2]).assertEqual(newReadResult[2]);
                    expect(arr[3]).assertEqual(newReadResult[3]);
                    expect(arr[4]).assertEqual(newReadResult[4]);
                });
                parcel.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_09000---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_09100
        * @tc.name    Test MessageSequence to pass exception rawdata data data interception verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_09100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_09100---------------------------");
            try {
                let parcel = new rpc.MessageSequence();
                let reply = new rpc.MessageSequence();
                let option = new rpc.MessageOption();
                let arr = [1, 2, 3, 4, 5];
                parcel.writeInt(arr.length - 1);
                parcel.writeRawData(arr, (arr.length - 1));
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_RAWDATA, parcel, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let size = result.reply.readInt();
                    expect(size).assertEqual(arr.length - 1);
                    expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
                    let newReadResult = result.reply.readRawData(size);
                    expect(arr[0]).assertEqual(newReadResult[0]);
                    expect(arr[1]).assertEqual(newReadResult[1]);
                    expect(arr[2]).assertEqual(newReadResult[2]);
                    expect(arr[3]).assertEqual(newReadResult[3]);
                });
                parcel.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_09100---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_09200
        * @tc.name    Test MessageSequence to deliver out-of-bounds RawData data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_09200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_09200---------------------------");
            try {
                let parcel = new rpc.MessageSequence();
                let reply = new rpc.MessageSequence();
                let option = new rpc.MessageOption();
                let arr = [-129, 2, 3, 4, 128];
                parcel.writeInt(arr.length);
                parcel.writeRawData(arr, arr.length);
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_RAWDATA, parcel, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let size = result.reply.readInt();
                    expect(size).assertEqual(arr.length);
                    expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
                    assertArrayElementEqual(result.reply.readRawData(size), arr);
                });
                parcel.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_09200---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_09300
        * @tc.name    Test MessageSequence to deliver illegal RawData data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_09300", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_09300---------------------------");
            try {
                let parcel = new rpc.MessageSequence();
                let arr = ["aaa", 1, 2, 3];
                parcel.writeInt(arr.length);
                parcel.writeRawData(arr, arr.length);
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
                parcel.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_09300---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_09400
            * @tc.name    Call the writeremoteobject interface to serialize the remote object
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_09400", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_09400---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let testRemoteObject = new TestRemoteObject("testObject");
                data.writeRemoteObject(testRemoteObject);
                expect(data.readRemoteObject() != null).assertTrue();
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_09400---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_09500
            * @tc.name    Call the writeremoteobject interface to serialize the remote object and pass in the empty object
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_09500", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_09500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = new TestRemoteObject(null);
                data.writeRemoteObject(token);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_09500---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_09600
        * @tc.name    Call the writeremoteobject interface to serialize the remote object and pass in the empty object
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_09600", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_09600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = {};
                data.writeRemoteObject(token);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.PROXY_OR_REMOTE_OBJECT_INVALID_ERROR}`;
                expect(error.code == errCode).assertTrue();
                console.info("SUB_Softbus_RPC_Compatibility_MessageSequence_09600: errorMessage " + error.message);
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_09600---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_09700
            * @tc.name    Call the writeParcelable interface to write the custom serialized
            *             object to the MessageSequence instance
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_09700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_09700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let sequenceable = new MySequenceable(1, "aaa");
                data.writeParcelable(sequenceable);
                let ret = new MySequenceable(0, "");
                data.readParcelable(ret);
            } catch (error) {
                expect(error).assertEqual(null);
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_09700---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_09800
            * @tc.name    Call the writeParcelable interface to write the custom serialized
            *             object to the MessageSequence instance, Migration to read
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_09800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_09800---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let sequenceable = new MySequenceable(1, "aaa");
                data.writeParcelable(sequenceable);
                let ret = new MySequenceable(1, "");
                data.readParcelable(ret);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_09800---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_09900
            * @tc.name    After the server finishes processing, write noexception first before writing the result,
            *             and the client calls readexception to judge whether the server is abnormal
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_09900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_09900---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeNoException();
                data.writeInt(6);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_NOEXCEPTION, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                    expect(result.reply.readInt()).assertEqual(6);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_09900---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_10000
            * @tc.name    If the data on the server is abnormal, the client calls readexception
            *             to judge whether the server is abnormal
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_10000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_10000---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeNoException();
                data.writeInt(1232222223444);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_NOEXCEPTION, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                    expect(result.reply.readInt() != 1232222223444).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_10000---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_10100
            * @tc.name    Serializable object marshaling and unmarshalling test
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_10100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_10100---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var sequenceable = new MySequenceable(1, "aaa");
                data.writeParcelable(sequenceable);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SEQUENCEABLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var s = new MySequenceable(null, null);
                    result.reply.readParcelable(s);
                    expect(s.str).assertEqual(sequenceable.str);
                    expect(s.num).assertEqual(sequenceable.num);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_10100---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_10200
            * @tc.name    Non serializable object marshaling test
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_10200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_10200---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var sequenceable = new MySequenceable(1, 1);
                data.writeParcelable(sequenceable);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_10200---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_10300
            * @tc.name    The server did not send a serializable object, and the client was ungrouped
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_10300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_10300---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var sequenceable = 10;
                data.writeInt(sequenceable);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var s = new MySequenceable(0, null);
                    result.reply.readParcelable(s);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_10300---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_10400
            * @tc.name    Call the writeParcelable interface to write the custom serialized object to the
            *             MessageSequence instance, and call readParcelable to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_10400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_10400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var sequenceable = new MySequenceable(2, "abc");
                data.writeParcelable(sequenceable);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SEQUENCEABLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var s = new MySequenceable(null, null);
                    result.reply.readParcelable(s);
                    expect(s.str).assertEqual(sequenceable.str);
                    expect(s.num).assertEqual(sequenceable.num);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_10400---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_10500
            * @tc.name    Call the writeParcelablearray interface to write the custom serialized object array (1, 2, 3) to
            *              the MessageSequence instance, and call readParcelablearray to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_10500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_10500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var sequenceable = [new MySequenceable(1, "aaa"),
                new MySequenceable(2, "bbb"), new MySequenceable(3, "ccc")];
                data.writeParcelableArray(sequenceable);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SEQUENCEABLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var s = [new MySequenceable(null, null), new MySequenceable(null, null),
                    new MySequenceable(null, null)];
                    result.reply.readParcelableArray(s);
                    for (let i = 0; i < s.length; i++) {
                        expect(s[i].str).assertEqual(sequenceable[i].str);
                        expect(s[i].num).assertEqual(sequenceable[i].num);
                    }
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_10500---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_10600
            * @tc.name    Call the writeParcelablearray interface to write the custom serialized object to the
            *             MessageSequence instance, and call readParcelablearray to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_10600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_10600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var sequenceable = [new MySequenceable(4, "abc"),
                new MySequenceable(5, "bcd"), new MySequenceable(6, "cef")];
                data.writeParcelableArray(sequenceable);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SEQUENCEABLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var s = [new MySequenceable(null, null),
                    new MySequenceable(null, null), new MySequenceable(null, null)];
                    result.reply.readParcelableArray(s);
                    for (let i = 0; i < s.length; i++) {
                        expect(s[i].str).assertEqual(sequenceable[i].str);
                        expect(s[i].num).assertEqual(sequenceable[i].num);
                    };
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_10600---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_10700
            * @tc.name    Call the writeParcelablearray interface to write the custom
            *             serialized object to the MessageSequence instance
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_10700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_10700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var sequenceable = 1;
                data.writeParcelableArray(sequenceable);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_10700---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_10800
            * @tc.name    Call the writeremoteobjectarray interface to write the object array to the MessageSequence
            *             instance, and call readremoteobjectarray to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_10800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_10800---------------------------");
            try {
                let count = 0;
                function checkResult(num, str) {
                    expect(num).assertEqual(123);
                    expect(str).assertEqual("rpcListenerTest");
                    count++;
                    console.info("check result done, count: " + count);
                    if (count == 3) {
                        done();
                    };
                };
                let data = rpc.MessageSequence.create();
                let reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                data.writeInterfaceToken("rpcTestAbility");
                let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)];
                data.writeRemoteObjectArray(listeners);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_REMOTEOBJECTARRAY, data, reply, option).then((result) => {
                    console.info("SUB_Softbus_RPC_Compatibility_MessageSequence_10800: sendMessageRequest is " + result.errCode);
                    expect(result.errCode).assertEqual(0);
                    expect(result.code).assertEqual(CODE_WRITE_REMOTEOBJECTARRAY);
                    expect(result.data).assertEqual(data);
                    expect(result.reply).assertEqual(reply);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_10800---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_10900
            * @tc.name    Call the writeremoteobjectarray interface to write the object array to the MessageSequence instance,
            *             and call readremoteobjectarray (objects: iremoteobject []) to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_10900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_10900---------------------------");
            try {
                let count = 0;
                function checkResult(num, str) {
                    expect(num).assertEqual(123);
                    expect(str).assertEqual("rpcListenerTest");
                    count++;
                    console.info("check result done, count: " + count);
                    if (count == 3) {
                        done();
                    }
                }
                let data = rpc.MessageSequence.create();
                let reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                data.writeInterfaceToken("rpcTestAbility");
                let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)];
                data.writeRemoteObjectArray(listeners);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_REMOTEOBJECTARRAY, data, reply, option).then((result) => {
                    console.info("SUB_Softbus_RPC_Compatibility_MessageSequence_10900: sendMessageRequest is " + result.errCode);
                    expect(result.errCode == 0).assertTrue();
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_10900---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_11000
            * @tc.name    Test MessageSequence to deliver the reply message received in promise across processes
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_11000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_11000---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeByte(2);
                data.writeShort(3);
                data.writeInt(4);
                data.writeLong(5);
                data.writeFloat(1.2);
                data.writeDouble(10.2);
                data.writeBoolean(true);
                data.writeChar(97);
                data.writeString("HelloWorld");
                data.writeParcelable(new MySequenceable(1, "aaa"));
                await gIRemoteObject.sendMessageRequest(CODE_ALL_TYPE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(2);
                    expect(result.reply.readShort()).assertEqual(3);
                    expect(result.reply.readInt()).assertEqual(4);
                    expect(result.reply.readLong()).assertEqual(5);
                    expect(result.reply.readFloat()).assertEqual(1.2);
                    expect(result.reply.readDouble()).assertEqual(10.2);
                    expect(result.reply.readBoolean()).assertTrue();
                    expect(result.reply.readChar()).assertEqual(97)
                    expect(result.reply.readString()).assertEqual("HelloWorld");
                    let s = new MySequenceable(null, null);
                    result.reply.readParcelable(s);
                    expect(s.num).assertEqual(1);
                    expect(s.str).assertEqual("aaa");
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_11000---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_11100
            * @tc.name    Test the cross process delivery of MessageSequence and receive the reply message
            *             in the callback function
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_11100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_11100---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeByte(2);
                data.writeShort(3);
                data.writeInt(4);
                data.writeLong(5);
                data.writeFloat(1.2);
                data.writeDouble(10.2);
                data.writeBoolean(true);
                data.writeChar(97);
                data.writeString("HelloWorld");
                data.writeParcelable(new MySequenceable(1, "aaa"));
                function sendMessageRequestCallback(result) {
                    try {
                        console.info("sendMessageRequest Callback");
                        expect(result.errCode).assertEqual(0);
                        expect(result.reply.readByte()).assertEqual(2);
                        expect(result.reply.readShort()).assertEqual(3);
                        expect(result.reply.readInt()).assertEqual(4);
                        expect(result.reply.readLong()).assertEqual(5);
                        expect(result.reply.readFloat()).assertEqual(1.2);
                        expect(result.reply.readDouble()).assertEqual(10.2);
                        expect(result.reply.readBoolean()).assertTrue();
                        expect(result.reply.readChar()).assertEqual(97);
                        expect(result.reply.readString()).assertEqual("HelloWorld");
                        let s = new MySequenceable(null, null);
                        result.reply.readParcelable(s);
                        expect(s.num).assertEqual(1);
                        expect(s.str).assertEqual("aaa");
                    } finally {
                        result.data.reclaim();
                        result.reply.reclaim();
                        console.info("test done");
                        done();
                    }
                }
                console.info("start send request");
                await gIRemoteObject.sendMessageRequest(CODE_ALL_TYPE, data, reply, option, sendMessageRequestCallback);

            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("--------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_11100--------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_11200
            * @tc.name    Test the cross process transmission of MessageSequence.
            *             After receiving the reply message in promise, read various types of arrays in order
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_11200", 0, async function (done) {
            console.info("--------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_11200--------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeByteArray([1, 2, 3]);
                data.writeShortArray([4, 5, 6]);
                data.writeIntArray([7, 8, 9]);
                data.writeLongArray([10, 11, 12]);
                data.writeFloatArray([1.1, 1.2, 1.3]);
                data.writeDoubleArray([2.1, 2.2, 2.3]);
                data.writeBooleanArray([true, true, false]);
                data.writeCharArray([65, 97, 122]);
                data.writeStringArray(['abc', 'seggg']);
                let a = [new MySequenceable(1, "aaa"), new MySequenceable(2, "bbb"),
                new MySequenceable(3, "ccc")]
                data.writeParcelableArray(a);
                await gIRemoteObject.sendMessageRequest(CODE_ALL_ARRAY_TYPE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readByteArray(), [1, 2, 3]);
                    assertArrayElementEqual(result.reply.readShortArray(), [4, 5, 6]);
                    assertArrayElementEqual(result.reply.readIntArray(), [7, 8, 9]);
                    assertArrayElementEqual(result.reply.readLongArray(), [10, 11, 12]);
                    assertArrayElementEqual(result.reply.readFloatArray(), [1.1, 1.2, 1.3]);
                    assertArrayElementEqual(result.reply.readDoubleArray(), [2.1, 2.2, 2.3]);
                    assertArrayElementEqual(result.reply.readBooleanArray(), [true, true, false]);
                    assertArrayElementEqual(result.reply.readCharArray(), [65, 97, 122]);
                    assertArrayElementEqual(result.reply.readStringArray(), ['abc', 'seggg']);
                    let b = [new MySequenceable(null, null), new MySequenceable(null, null),
                    new MySequenceable(null, null)];
                    result.reply.readParcelableArray(b);
                    for (let i = 0; i < b.length; i++) {
                        expect(b[i].str).assertEqual(a[i].str);
                        expect(b[i].num).assertEqual(a[i].num);
                    }
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_11200---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_11300
            * @tc.name    Test MessageSequence cross process delivery. After receiving the reply message in promise,
            *             the client constructs an empty array in sequence and reads the data from the reply message
            *             into the corresponding array
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_11300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_11300---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeByteArray([1, 2, 3]);
                data.writeShortArray([4, 5, 6]);
                data.writeIntArray([7, 8, 9]);
                data.writeLongArray([10, 11, 12]);
                data.writeFloatArray([1.1, 1.2, 1.3]);
                data.writeDoubleArray([2.1, 2.2, 2.3]);
                data.writeBooleanArray([true, true, false]);
                data.writeCharArray([65, 97, 122]);
                data.writeStringArray(['abc', 'seggg']);
                let a = [new MySequenceable(1, "aaa"), new MySequenceable(2, "bbb"),
                new MySequenceable(3, "ccc")]
                data.writeParcelableArray(a);
                await gIRemoteObject.sendMessageRequest(CODE_ALL_ARRAY_TYPE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let ByteArray = new Array();
                    result.reply.readByteArray(ByteArray)
                    assertArrayElementEqual(ByteArray, [1, 2, 3]);
                    let ShortArray = new Array();
                    result.reply.readShortArray(ShortArray)
                    assertArrayElementEqual(ShortArray, [4, 5, 6]);
                    let IntArray = new Array();
                    result.reply.readIntArray(IntArray)
                    assertArrayElementEqual(IntArray, [7, 8, 9]);
                    let LongArray = new Array();
                    result.reply.readLongArray(LongArray)
                    assertArrayElementEqual(LongArray, [10, 11, 12]);
                    let FloatArray = new Array();
                    result.reply.readFloatArray(FloatArray)
                    assertArrayElementEqual(FloatArray, [1.1, 1.2, 1.3]);
                    let DoubleArray = new Array();
                    result.reply.readDoubleArray(DoubleArray)
                    assertArrayElementEqual(DoubleArray, [2.1, 2.2, 2.3]);
                    let BooleanArray = new Array();
                    result.reply.readBooleanArray(BooleanArray)
                    assertArrayElementEqual(BooleanArray, [true, true, false]);
                    let CharArray = new Array();
                    result.reply.readCharArray(CharArray)
                    assertArrayElementEqual(CharArray, [65, 97, 122]);
                    let StringArray = new Array();
                    result.reply.readStringArray(StringArray);
                    assertArrayElementEqual(StringArray, ['abc', 'seggg']);
                    let b = [new MySequenceable(null, null), new MySequenceable(null, null),
                    new MySequenceable(null, null)];
                    result.reply.readParcelableArray(b);
                    for (let i = 0; i < b.length; i++) {
                        expect(b[i].str).assertEqual(a[i].str);
                        expect(b[i].num).assertEqual(a[i].num);
                    }
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_11300---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_11400
            * @tc.name    Test MessageSequence to pass an object of type iremoteobject across processes
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it('SUB_Softbus_RPC_Compatibility_MessageSequence_11400', 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_11400---------------------------");
            function checkResult(num, str) {
                expect(num).assertEqual(123);
                expect(str).assertEqual("rpcListenerTest");
                done();
            };
            try {
                let option = new rpc.MessageOption();
                let data = rpc.MessageSequence.create();
                let reply = rpc.MessageSequence.create();
                let listener = new TestListener("rpcListener", checkResult);
                data.writeRemoteObject(listener);
                data.writeInt(123);
                data.writeString("rpcListenerTest");
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_REMOTEOBJECT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                });
                data.reclaim();
                reply.reclaim();
                done();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_11400---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_11500
            * @tc.name    Test MessageSequence to pass an array of iremoteobject objects across processes
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it('SUB_Softbus_RPC_Compatibility_MessageSequence_11500', 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_11500---------------------------");
            let count = 0;
            function checkResult(num, str) {
                expect(num).assertEqual(123);
                expect(str).assertEqual("rpcListenerTest");
                count++;
                console.info("check result done, count: " + count);
                if (count == 3) {
                    done();
                }
            }
            try {
                let option = new rpc.MessageOption();
                let data = rpc.MessageSequence.create();
                let reply = rpc.MessageSequence.create();
                let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)];
                data.writeRemoteObjectArray(listeners);
                data.writeInt(123);
                data.writeString("rpcListenerTest");
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_REMOTEOBJECTARRAY_1, data, reply, option)
                    .then((result) => {
                        expect(result.errCode).assertEqual(0);
                        result.reply.readException();
                    });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done()
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_11500---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_11600
            * @tc.name    Test MessageSequence to pass the array of iremoteobject objects across processes. The server
            *             constructs an empty array in onremoterequest and reads it from MessageSequence
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it('SUB_Softbus_RPC_Compatibility_MessageSequence_11600', 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_11600---------------------------");
            let count = 0;
            function checkResult(num, str) {
                expect(num).assertEqual(123);
                expect(str).assertEqual("rpcListenerTest");
                count++;
                console.info("check result done, count: " + count);
                if (count == 3) {
                    done();
                }
            }
            try {
                let option = new rpc.MessageOption();
                let data = rpc.MessageSequence.create();
                let reply = rpc.MessageSequence.create();
                let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)];
                data.writeRemoteObjectArray(listeners);
                data.readRemoteObjectArray();
                data.writeInt(123);
                data.writeString("rpcListenerTest");
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_REMOTEOBJECTARRAY_2, data, reply, option)
                    .then((result) => {
                        expect(result.errCode).assertEqual(0);
                        result.reply.readException();
                    })
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done()
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_11600---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_11700
            * @tc.name    Invoke the rewindRead interface,Set 0-bit offset and read the data after offset
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_11700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_11700---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                data.writeInt(12);
                data.writeString("parcel");
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(12);
                    result.reply.rewindRead(0);
                    expect(result.reply.readInt()).assertEqual(12);
                    expect(result.reply.readString()).assertEqual("");
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_11700---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_11800
            * @tc.name    Invoke the rewindRead interface,Set 1-bit offset and read the data after offset
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_11800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_11700---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                data.writeInt(12);
                data.writeString("parcel");
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode == 0).assertTrue();
                    expect(result.reply.readInt()).assertEqual(12);
                    result.reply.rewindRead(1);
                    expect(result.reply.readInt()).assertEqual(0);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_11800---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_11900
            * @tc.name    Invoke the rewindWrite interface, Set 0-bit offset and write the data after offset
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_11900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_11800---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                data.writeInt(4);
                data.rewindWrite(0);
                data.writeInt(5);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode == 0).assertTrue();
                    expect(result.reply.readInt()).assertEqual(5);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_11900---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_12000
            * @tc.name    Invoke the rewindWrite interface, Set 1-bit offset and write the data after offset
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_12000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_12000---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                data.writeInt(4);
                data.rewindWrite(1);
                data.writeInt(5);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt() != 5).assertTrue();
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_12000---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_12100
            * @tc.name    setCapacity Sets the storage capacity of the null MessageSequence instance. The getCapacity
                        obtains the current MessageSequence capacity
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_12100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_12100---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                expect(data.getCapacity()).assertEqual(0);
                data.setCapacity(100);
                data.writeString("constant");
                expect(data.getCapacity()).assertEqual(100);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.getCapacity()).assertEqual(("constant".length * 2) + 8);
                    expect(result.reply.readString()).assertEqual("constant");
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_12100---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_12200
            * @tc.name    setCapacity Sets the storage capacity of the MessageSequence instance. The getCapacity
                        obtains the current MessageSequence capacity
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_12200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_12200---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                data.writeString("constant");
                data.setCapacity(100);
                expect(data.getCapacity()).assertEqual(100);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("constant");
                    expect(result.reply.getCapacity()).assertEqual(("constant".length * 2) + 8);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_12200---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_12300
            * @tc.name    Setcapacity test: size limit verification of MessageSequence instance
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_12300", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_12300---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                expect(data.getCapacity()).assertEqual(0);
                data.writeString("constant");
                let getSizedata = data.getSize();
                data.setCapacity(getSizedata + 1);
                data.setCapacity(getSizedata);
                data.reclaim();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code == errCode).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_12300---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_12400
        * @tc.name    SetCapacity Tests the storage capacity threshold of the MessageSequence instance
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_12400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_12400---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                data.writeString("constant");
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let getSizeresult = result.reply.getSize();
                    expect(result.reply.getCapacity()).assertEqual(("constant".length * 2) + 8);
                    result.reply.setCapacity(getSizeresult + 1);
                    result.reply.setCapacity(getSizeresult);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code == errCode).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_12400---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_12500
        * @tc.name    Setcapacity test storage capacity boundary value verification of MessageSequence instance
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_12500", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_12500---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                expect(data.getSize()).assertEqual(0);
                data.setCapacity(M);
                expect(data.getCapacity()).assertEqual(M);
                data.setCapacity(2 * G);
                data.reclaim();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code == errCode).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_12500---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_12600
            * @tc.name    setSize Sets the size of the data contained in the MessageSequence instance. The getSize command
                        reads the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_12600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_12600---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                expect(data.getSize()).assertEqual(0);
                data.setSize(0);
                data.writeString("constant");
                expect(data.getSize()).assertEqual(("constant".length * 2) + 8);

                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.getSize()).assertEqual(("constant".length * 2) + 8);
                    expect(result.reply.readString()).assertEqual("constant");
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_12600---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_12700
            * @tc.name    SetSize: Increases the value of the data contained in the MessageSequence instance by 1,
                        Write setSize
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_12700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_12700---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                data.writeString("constant");
                expect(data.getSize()).assertEqual(("constant".length * 2) + 8);
                data.setSize(0);
                expect(data.getSize()).assertEqual(0);

                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.getSize()).assertEqual(8);
                    expect(result.reply.readString()).assertEqual("");
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_12700---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_12800
            * @tc.name    Verify the MessageSequence instance SetSize setting and the instance capacitydata qualification verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_12800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_12800---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                expect(data.getSize()).assertEqual(0);
                data.writeString("constant");
                expect(data.getSize()).assertEqual(("constant".length * 2) + 8);
                let getCapacitydata = data.getCapacity();
                expect(getCapacitydata).assertEqual(64);
                data.setSize(getCapacitydata);
                expect(data.getSize()).assertEqual(getCapacitydata);
                data.setSize(getCapacitydata + 1);
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_12800---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_12900
            * @tc.name    setSize Sets the storage capacity of the MessageSequence instance to decrease by one.
                        The getSize obtains the current MessageSequence capacity
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_12900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_12900---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                data.writeString("constant");
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("constant");
                    expect(result.reply.getSize()).assertEqual(("constant".length * 2) + 8);
                    let getCapacityresult = result.reply.getCapacity();
                    result.reply.setSize(getCapacityresult);
                    expect(result.reply.getSize()).assertEqual(getCapacityresult);
                    result.reply.setSize(getCapacityresult + 1);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_12900---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_13000
            * @tc.name    Validate the setSize boundary value in the MessageSequence instance
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_13000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_13000---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                expect(data.getCapacity()).assertEqual(0);
                data.setSize(4 * G);
                expect(data.getSize()).assertEqual(0);
                data.setSize(4 * G - 1);
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_13000---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_13100
            * @tc.name    Verify that setSize is out of bounds in a MessageSequence instance
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_13100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_13100---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                data.setSize(0);
                expect(data.getSize()).assertEqual(0);
                data.setSize(2 * 4 * G);
                expect(data.getSize()).assertEqual(0);
                data.setSize(2 * G);
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_13100---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_13200
            * @tc.name    Obtains the write and read positions of the MessageSequence
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_13200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_13200---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                expect(data.getWritePosition()).assertEqual(0);
                data.writeInt(10);
                expect(data.getWritePosition()).assertEqual(4);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.getReadPosition()).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(10);
                    expect(result.reply.getReadPosition()).assertEqual(4);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_13200---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_13300
            * @tc.name    Obtaining the Writable and Readable Byte Spaces of MessageSequence
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_13300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_13300---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                expect(data.getWritableBytes()).assertEqual(0);
                data.writeInt(10);
                expect(data.getWritableBytes()).assertEqual(60);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(10);
                    expect(result.reply.getReadableBytes()).assertEqual(0);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_13300---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_13400
            * @tc.name    Obtains the writeable and readable byte space and read position of the MessageSequence
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_13400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_13400---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                data.writeInt(10);
                expect(data.getWritePosition()).assertEqual(4);
                expect(data.getWritableBytes()).assertEqual(60);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.getReadableBytes()).assertEqual(4);
                    expect(result.reply.getReadPosition()).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(10);
                    expect(result.reply.getReadableBytes()).assertEqual(0);
                    expect(result.reply.getReadPosition()).assertEqual(4);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_13400---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_13500
        * @tc.name    Get the space size of MessageSequence to pass rawdata data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_13500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_13500---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                data.writeInt(10);
                expect(data.getWritePosition()).assertEqual(4);
                expect(data.getWritableBytes()).assertEqual(60);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.getReadPosition()).assertEqual(0);
                    expect(result.reply.getReadableBytes()).assertEqual(4);
                    expect(result.reply.readInt()).assertEqual(10);
                    expect(result.reply.getReadPosition()).assertEqual(4);
                    expect(result.reply.getReadableBytes()).assertEqual(0);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_13500---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_13600
            * @tc.name    Test fixed MessageSequence space size to pass rawData data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_13600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_13600---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                expect(data.getRawDataCapacity()).assertEqual(128 * M);
                let rawdata = [1, 2, 3];
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                data.writeInt(rawdata.length);
                data.writeRawData(rawdata, rawdata.length);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_RAWDATA, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let size = result.reply.readInt();
                    expect(result.reply.readRawData(size) != rawdata).assertTrue();
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_13600---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_13700
            * @tc.name    Test MessageSequence delivery file descriptor object
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_13700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_13700---------------------------");
            try {
                let testab = new TestProxy(gIRemoteObject).asObject();
                expect(testab != null).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_13700---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_13800
            * @tc.name    Test that the asObject interface is called by a RemoteObject and returns itself
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_13800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_13800---------------------------");
            try {
                let testRemoteObject = new TestRemoteObject("testObject");
                expect(testRemoteObject.asObject() != null).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_13800---------------------------");
        });

        /*
            * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_13900
            * @tc.name    MessageSequence sendMessageRequest API test
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   0
            */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_13900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_13900---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let rawdata = [1, 2, 3];
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                data.getRawDataCapacity();
                data.writeInt(rawdata.length);
                data.writeRawData(rawdata, rawdata.length);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_RAWDATA, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(rawdata.length);
                    expect(result.reply.readRawData(rawdata.length) != rawdata).assertTrue();
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_13900---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_14000
        * @tc.name    Invoke the writestring interface to write data to the MessageSequence instance sendMessageRequest Asynchronous
        *               Authentication onRemoteMessageRequest Server Processing
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_14000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_14000---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = 'onRemoteMessageRequest invoking';
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual(token);
                });
                data.reclaim();
                reply.reclaim();
                done();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_14000---------------------------");
        });


        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_14100
        * @tc.name    Invoke the writestring interface to write data to the MessageSequence instance. sendMessageRequest asynchronously
        *               verifies the priority processing levels of onRemoteMessageRequest and onRemoteRequest
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_14100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_14100---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = "onRemoteRequest or onRemoteMessageRequest invoking";
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_ONREMOTEMESSAGE_OR_ONREMOTEREQUEST, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("onRemoteMessageRequest invoking");
                });
                data.reclaim();
                reply.reclaim();
                done();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_14100---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_14200
        * @tc.name    readParcelable is Call JS callback function failedv Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_14200", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_14200---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let sequenceable = new MySequenceableCode(1, "aaa");
                data.writeParcelable(sequenceable);
                data.setCapacity(0);
                data.setSize(0);
                let ret = new MySequenceable(1, "");
                data.readParcelable(ret);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.CALL_JS_METHOD_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code != errCode).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_14200---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_14300
        * @tc.name    Call the writeinterfacetoken interface, write the interface descriptor, and read interfacetoken
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_14300", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_14300---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
                data.setCapacity(0);
                data.setSize(0);
                data.readInterfaceToken();
                data.reclaim();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code != errCode).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_14300---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_14400
        * @tc.name    writeString check param error Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_14400", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_14400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = '';
                for (var i = 0; i < 40 * K; i++) {
                    token += 'a';
                };
                data.writeString(token);
                data.reclaim();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_14400---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_14500
        * @tc.name    writeInterfaceToken Sequence memory alloc failed Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_14500", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_14500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                data.setSize(0);
                data.setCapacity(0);
                var token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
                data.reclaim();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_14500---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_14600
        * @tc.name    writeInterfaceToken Write data to message sequence failed Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_14600", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_14600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                data.setSize(true);
                data.setCapacity(true);
                var token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
                data.reclaim();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_14600---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_14700
        * @tc.name    readParcelable Sequence memory alloc failed Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_14700", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_14700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let sequenceable = new MySequenceable(1, "aaa");
                data.writeParcelable(sequenceable);
                let ret = new MySequenceable(0, "");
                data.setCapacity(0);
                data.readParcelable(ret);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_14700---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_14800
        * @tc.name    writeRemoteObject is proxy or remote object is invalid Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_14800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_14800---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = {};
                data.writeRemoteObject(token);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.PROXY_OR_REMOTE_OBJECT_INVALID_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_14800---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_14900
        * @tc.name    Basic test of the rewindWrite interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_14900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_14900---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                expect(data.getWritePosition()).assertEqual(0);
                data.writeInt(4);
                expect(data.getWritePosition()).assertEqual(4);
                data.rewindWrite(0);
                expect(data.getWritePosition()).assertEqual(0);
                data.writeInt(5);
                expect(data.getWritePosition()).assertEqual(4);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode == 0).assertTrue();
                    expect(result.reply.getReadPosition()).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(5);
                    expect(result.reply.getReadPosition()).assertEqual(4);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_14900---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_15000
        * @tc.name    RewindWrite interface write position cheap extension test
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_15000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_15000---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                expect(data.getWritePosition()).assertEqual(0);
                data.writeInt(4);
                expect(data.getWritePosition()).assertEqual(4);
                data.rewindWrite(3);
                expect(data.getWritePosition()).assertEqual(3);
                data.writeInt(5);
                expect(data.getWritePosition()).assertEqual(3 + 4);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode == 0).assertTrue();
                    expect(result.reply.readInt() != 5).assertTrue();
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_15000---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_15100
        * @tc.name    Test the boundary value of the rewindWrite interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_15100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_15100---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                var token = '';
                for (var i = 0; i < (40 * K - 1); i++) {
                    token += 'a';
                }
                expect(data.getWritePosition()).assertEqual(0);
                data.writeString(token);
                expect(data.getWritePosition()).assertEqual(token.length * 2 + 6);
                data.rewindWrite((token.length * 2 + 6) - 1);
                expect(data.getWritePosition()).assertEqual((token.length * 2 + 6) - 1);
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_15100---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_15200
        * @tc.name    Test the critical value of the rewindWrite interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_15200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_15200---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                var token = '';
                for (var i = 0; i < (40 * K - 1); i++) {
                    token += 'a';
                }
                expect(data.getWritePosition()).assertEqual(0);
                data.writeString(token);
                expect(data.getWritePosition()).assertEqual(token.length * 2 + 6);
                data.rewindWrite((token.length * 2 + 6) + 1);
                expect(data.getWritePosition()).assertEqual(token.length * 2 + 6);
                data.reclaim();
            } catch (error) {
                console.info("SUB_Softbus_RPC_Compatibility_MessageSequence_15200 errorMessage " + error.message);
                expect(error != null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_15200---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_15300
        * @tc.name    Basic test of the rewindRead interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_15300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_15300---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                data.writeInt(12);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode == 0).assertTrue();
                    expect(result.reply.getReadPosition()).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(12);
                    expect(result.reply.getReadPosition()).assertEqual(4);
                    result.reply.rewindRead(1);
                    expect(result.reply.getReadPosition()).assertEqual(1);
                    expect(result.reply.readInt() != 12).assertTrue();
                    expect(result.reply.getReadPosition()).assertEqual(1);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_15300---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_15400
        * @tc.name    rewindRead interface write position cheap extension test
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_15400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_15400---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                data.writeInt(16);
                data.writeString("sequence");
                expect(data.getReadPosition()).assertEqual(0);
                expect(data.readInt()).assertEqual(16);
                expect(data.getReadPosition()).assertEqual(4);
                expect(data.readString()).assertEqual("sequence");
                expect(data.getReadPosition()).assertEqual(4 + ("sequence".length * 2 + 8));
                data.rewindRead(5);
                expect(data.getReadPosition()).assertEqual(5);
                expect(data.readInt() != 16).assertTrue();
                expect(data.getReadPosition()).assertEqual(4 + 5);
                expect(data.readString() != "sequence").assertTrue();
                expect(data.getReadPosition()).assertEqual(4 + 5);
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_15400---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_15500
        * @tc.name    Test the boundary value of the rewindRead interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_15500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_15500---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                var token = '';
                for (var i = 0; i < (40 * K - 1); i++) {
                    token += 'a';
                }
                data.writeString(token);
                expect(data.getReadPosition()).assertEqual(0);
                expect(data.readString().length).assertEqual(40 * K - 1);
                expect(data.getReadPosition()).assertEqual(token.length * 2 + 6);
                data.rewindRead((token.length * 2 + 6) - 1);
                expect(data.getReadPosition()).assertEqual((token.length * 2 + 6) - 1);
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_15500---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_15600
        * @tc.name    Test the critical value of the rewindRead interface 
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_15600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_15600---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                var token = '';
                for (var i = 0; i < (40 * K - 1); i++) {
                    token += 'a';
                }
                data.writeString(token);
                expect(data.getReadPosition()).assertEqual(0);
                expect(data.readString().length).assertEqual(40 * K - 1);
                expect(data.getReadPosition()).assertEqual(token.length * 2 + 6);
                data.rewindRead((token.length * 2 + 6) + 1);
                expect(data.getReadPosition()).assertEqual(token.length * 2 + 6);
                data.reclaim();
            } catch (error) {
                console.info("SUB_Softbus_RPC_Compatibility_MessageSequence_15600 errorMessage " + error.message);
                expect(error != null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_15600---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_15700
        * @tc.name    Test the function of the getWritePosition interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_15700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_15700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeByte(2);
                expect(data.getWritePosition()).assertEqual(4);
                data.writeShort(3);
                expect(data.getWritePosition()).assertEqual(4 + 4);
                data.writeInt(4);
                expect(data.getWritePosition()).assertEqual((4 + 4) + 4);
                data.writeLong(5);
                expect(data.getWritePosition()).assertEqual(((4 + 4) + 4) + 8);
                data.writeFloat(1.2);
                expect(data.getWritePosition()).assertEqual((((4 + 4) + 4) + 8) + 8);
                data.writeDouble(10.2);
                expect(data.getWritePosition()).assertEqual(((((4 + 4) + 4) + 8) + 8) + 8);
                data.writeBoolean(true);
                expect(data.getWritePosition()).assertEqual((((((4 + 4) + 4) + 8) + 8) + 8) + 4);
                data.writeChar(97);
                expect(data.getWritePosition()).assertEqual(((((((4 + 4) + 4) + 8) + 8) + 8) + 4) + 4);
                data.writeString("");
                expect(data.getWritePosition()).assertEqual((((((((4 + 4) + 4) + 8) + 8) + 8) + 4) + 4) + 8);
                data.writeParcelable(new MySequenceable(1, "aaa"));
                expect(data.getWritePosition()).assertEqual(((((((((4 + 4) + 4) + 8) + 8) + 8) + 4) + 4) + 8) + (12 + 8));
                await gIRemoteObject.sendMessageRequest(CODE_ALL_TYPE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(2);
                    expect(result.reply.readShort()).assertEqual(3);
                    expect(result.reply.readInt()).assertEqual(4);
                    expect(result.reply.readLong()).assertEqual(5);
                    expect(result.reply.readFloat()).assertEqual(1.2);
                    expect(result.reply.readDouble()).assertEqual(10.2);
                    expect(result.reply.readBoolean()).assertTrue();
                    expect(result.reply.readChar()).assertEqual(97)
                    expect(result.reply.readString()).assertEqual("");
                    let s = new MySequenceable(null, null);
                    result.reply.readParcelable(s);
                    expect(s.num).assertEqual(1);
                    expect(s.str).assertEqual("aaa");
                });
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_15700---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_15800
        * @tc.name    Test on the null value of the getWritePosition interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_15800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_15800---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let str = "";
                data.writeString(str);
                expect(data.getWritePosition()).assertEqual(8);
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_15800---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_15900
        * @tc.name    Test the function of the getReadPosition interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_15900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_15900---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeByte(2);
                data.writeShort(3);
                data.writeInt(4);
                data.writeLong(5);
                data.writeFloat(1.2);
                data.writeDouble(10.2);
                data.writeBoolean(true);
                data.writeChar(97);
                data.writeString("");
                data.writeParcelable(new MySequenceable(1, "aaa"));
                await gIRemoteObject.sendMessageRequest(CODE_ALL_TYPE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(2);
                    expect(result.reply.getReadPosition()).assertEqual(4);
                    expect(result.reply.readShort()).assertEqual(3);
                    expect(result.reply.getReadPosition()).assertEqual(4 + 4);
                    expect(result.reply.readInt()).assertEqual(4);
                    expect(result.reply.getReadPosition()).assertEqual((4 + 4) + 4);
                    expect(result.reply.readLong()).assertEqual(5);
                    expect(result.reply.getReadPosition()).assertEqual(((4 + 4) + 4) + 8);
                    expect(result.reply.readFloat()).assertEqual(1.2);
                    expect(result.reply.getReadPosition()).assertEqual((((4 + 4) + 4) + 8) + 8);
                    expect(result.reply.readDouble()).assertEqual(10.2);
                    expect(result.reply.getReadPosition()).assertEqual(((((4 + 4) + 4) + 8) + 8) + 8);
                    expect(result.reply.readBoolean()).assertTrue();
                    expect(result.reply.getReadPosition()).assertEqual((((((4 + 4) + 4) + 8) + 8) + 8) + 4);
                    expect(result.reply.readChar()).assertEqual(97);
                    expect(result.reply.getReadPosition()).assertEqual(((((((4 + 4) + 4) + 8) + 8) + 8) + 4) + 4);
                    expect(result.reply.readString()).assertEqual("");
                    expect(result.reply.getReadPosition()).assertEqual((((((((4 + 4) + 4) + 8) + 8) + 8) + 4) + 4) + 8);
                    let s = new MySequenceable(null, null);
                    result.reply.readParcelable(s);
                    expect(result.reply.getReadPosition()).assertEqual(((((((((4 + 4) + 4) + 8) + 8) + 8) + 4) + 4) + 8) + (12 + 8));
                    expect(s.num).assertEqual(1);
                    expect(s.str).assertEqual("aaa");
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_15900---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_16000
        * @tc.name    Test on the null value of the getReadPosition interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_16000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_16000---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let str = "";
                data.writeString(str);
                expect(data.readString()).assertEqual(str);
                expect(data.getReadPosition()).assertEqual(8);
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_16000---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_00100
         * @tc.name    Call the writeinterfacetoken interface, write the interface descriptor, and read interfacetoken
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_00100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = "hello ruan zong xian";
                expect(data.writeInterfaceToken(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInterfaceToken()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_00200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00200---------------------------");
            try {
                for (let i = 0; i < 5; i++) {
                    var data = rpc.MessageParcel.create();
                    var reply = rpc.MessageParcel.create();
                    var option = new rpc.MessageOption();
                    let token = "hello ruan zong xian";
                    expect(data.writeInterfaceToken(token)).assertTrue();
                    expect(gIRemoteObject != undefined).assertTrue();
                    await gIRemoteObject.sendRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
                        expect(result.errCode).assertEqual(0);
                        expect(result.reply.readInterfaceToken()).assertEqual(token);
                    });
                    data.reclaim();
                    reply.reclaim();
                }
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_00200---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_00300
         * @tc.name    Call the WriteInterfaceToken interface, write the maximum length interface descriptor, and read
                        the InterfaceToken
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_00300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00300---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = "";
                for (let i = 0; i < (40 * K - 1); i++) {
                    token += 'a';
                }
                expect(data.writeInterfaceToken(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInterfaceToken()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_00400", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00400---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var token = "";
                for (let i = 0; i < 40 * K; i++) {
                    token += 'a';
                }
                expect(data.writeInterfaceToken(token)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_00400---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_00500
         * @tc.name    Call the writeinterfacetoken interface to write a non string interface descriptor
                       and read interfacetoken
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_00500", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00500---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var token = 123;
                expect(data.writeInterfaceToken(token)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_00500---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_00600
         * @tc.name    Call the writeshortarray interface, write the array to the messageparcel instance,
         *             and call readshortarray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_00600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00600---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wShortArryData = [-1, 0, 1];
                expect(data.writeShortArray(wShortArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readShortArray(), wShortArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_00700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00700---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wShortArryData = [];
                for (let i = 0; i < (50 * 1024 - 1); i++) {
                    wShortArryData[i] = 1;
                }
                expect(data.writeShortArray(wShortArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rShortArryData = [];
                    result.reply.readShortArray(rShortArryData);
                    assertArrayElementEqual(rShortArryData, wShortArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_00700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_00800
         * @tc.name    Writeshortarray interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_00800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00800---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wShortArryData = [-32768, 0, 1, 2, 32767];
                expect(data.writeShortArray(wShortArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readShortArray(), wShortArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_00800---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_00900
         * @tc.name    Writeshortarray interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_00900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_00900---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var eShortArryData = [-32769, 32768];
                expect(data.writeShortArray(eShortArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var erShortArryData = [32767, -32768];
                    assertArrayElementEqual(result.reply.readShortArray(), erShortArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_00900---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01000
         * @tc.name    Writeshortarray interface, transmission length verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_01000", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01000---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var eShortArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    eShortArryData[i] = 1;
                };
                expect(data.writeShortArray(eShortArryData)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01000---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01100
         * @tc.name    Call the writelongarray interface, write the long integer array to the messageparcel instance,
         *             and call readlongarray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_01100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wLongArryData = [3276826, 123456, 9999999];
                expect(data.writeLongArray(wLongArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readLongArray(), wLongArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_01200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01200---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wLongArryData = [];
                for (let i = 0; i < (25 * K - 1); i++) {
                    wLongArryData[i] = 11;
                };
                expect(data.writeLongArray(wLongArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rLongArryData = [];
                    result.reply.readLongArray(rLongArryData);
                    assertArrayElementEqual(rLongArryData, wLongArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01200---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01300
         * @tc.name    Writelongarray interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_01300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01300---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wLongArryData = [-9007199254740992, 0, 1, 2, 9007199254740991];
                expect(data.writeLongArray(wLongArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rLongArryData = [];
                    result.reply.readLongArray(rLongArryData);
                    assertArrayElementEqual(rLongArryData, wLongArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01300---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01400
         * @tc.name    Writelongarray interface, long type precision verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_01400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01400---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wLongArryData = [-9999999999999999, 9999999999999999];
                expect(data.writeLongArray(wLongArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rLongArryData = result.reply.readLongArray();
                    let newlongdata = [-10000000000000000, 10000000000000000];
                    expect(rLongArryData[0]).assertEqual(newlongdata[0]);
                    expect(rLongArryData[1]).assertEqual(newlongdata[1]);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01400---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01500
         * @tc.name    Writelongarray Indicates an interface for verifying the input length
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_01500", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01500---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var wLongArryData = [];
                for (let i = 0; i < 25 * K; i++) {
                    wLongArryData[i] = 11;
                };
                expect(data.writeLongArray(wLongArryData)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01500---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01600
         * @tc.name    Call the writedoublearray interface, write the array to the messageparcel instance,
         *             and call readdoublearra to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_01600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01600---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wDoubleArryData = [1.2, 235.67, 99.76];
                expect(data.writeDoubleArray(wDoubleArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readDoubleArray(), wDoubleArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_01700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01700---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wDoubleArryData = [];
                for (let i = 0; i < (25 * K - 1); i++) {
                    wDoubleArryData[i] = 11.1;
                };
                expect(data.writeDoubleArray(wDoubleArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rDoubleArryData = [];
                    result.reply.readDoubleArray(rDoubleArryData);
                    assertArrayElementEqual(rDoubleArryData, wDoubleArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01800
         * @tc.name    Writedoublearray interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_01800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01800---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wDoubleArryData = [4.9E-324, 235.67, 1.79E+308];
                expect(data.writeDoubleArray(wDoubleArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readDoubleArray(), wDoubleArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01800---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_01900
         * @tc.name    Writedoublearray interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_01900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_01900---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var eDoubleArryData = [(4.9E-324) - 1, (1.79E+308) + 1];
                expect(data.writeDoubleArray(eDoubleArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rDoubleArryData = result.reply.readDoubleArray();
                    expect(rDoubleArryData[0]).assertEqual(-1);
                    expect(rDoubleArryData[1]).assertEqual(1.79e+308);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_01900---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02000
         * @tc.name    Writedoublearray interface, Out-of-bounds value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_02000", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02000---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var eDoubleArryData = [];
                for (let i = 0; i < 25 * K; i++) {
                    eDoubleArryData[i] = 11.1;
                }
                expect(data.writeDoubleArray(eDoubleArryData)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02000---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02100
         * @tc.name    Call the writebooleanarray interface, write the array to the messageparcel instance,
         *             and call readbooleanarray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_02100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wBooleanArryData = [true, false, false];
                expect(data.writeBooleanArray(wBooleanArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readBooleanArray(), wBooleanArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_02200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02200---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wBooleanArryData = [];
                for (let i = 0; i < (50 * K - 1); i++) {
                    if (i % 2 == 0) {
                        wBooleanArryData[i] = false;
                    } else {
                        wBooleanArryData[i] = true;
                    }
                }
                expect(data.writeBooleanArray(wBooleanArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rBooleanArryData = [];
                    result.reply.readBooleanArray(rBooleanArryData);
                    assertArrayElementEqual(rBooleanArryData, wBooleanArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02200---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02300
         * @tc.name    Writebooleanarray interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_02300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02300---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var errorBooleanArryData = [true, 9, false];
                expect(data.writeBooleanArray(errorBooleanArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var eCharArrayData = [true, false, false];
                    assertArrayElementEqual(result.reply.readBooleanArray(), eCharArrayData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02300---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02400
         * @tc.name    Writebooleanarray Interface for length verification of input parameters
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_02400", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02400---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var wBooleanArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    if (i % 2 == 0) {
                        wBooleanArryData[i] = false;
                    } else {
                        wBooleanArryData[i] = true;
                    };
                }
                expect(data.writeBooleanArray(wBooleanArryData)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02400---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02500
         * @tc.name    Call the writechararray interface, write the array to the messageparcel instance,
         *             and call readchararray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_02500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02500---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wCharArryData = [0, 97, 255];
                expect(data.writeCharArray(wCharArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readCharArray(), wCharArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_02600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02600---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wCharArryData = [];
                for (let i = 0; i < (50 * K - 1); i++) {
                    wCharArryData[i] = 96;
                };
                expect(data.writeCharArray(wCharArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rCharArryData = [];
                    result.reply.readCharArray(rCharArryData);
                    assertArrayElementEqual(rCharArryData, wCharArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02600---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02700
         * @tc.name    Writechararray interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_02700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02700---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var errorCharArryData = [96, 'asfgdgdtu', 97];
                expect(data.writeCharArray(errorCharArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var eCharArrayData = [96, 0, 97];
                    assertArrayElementEqual(data.readCharArray(), eCharArrayData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02800
         * @tc.name    Writechararray Indicates the length of an interface input parameter
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_02800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02800---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var errorCharArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    errorCharArryData[i] = 96;
                };
                expect(data.writeCharArray(errorCharArryData)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02800---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_02900
         * @tc.name    Call the writestringarray interface, write the array to the messageparcel instance,
         *             and call readstringarray (datain: number []) to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_02900", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_02900---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wStringArryData = ['abc', 'hello', 'beauty'];
                expect(data.writeStringArray(wStringArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRINGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readStringArray(), wStringArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_02900---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03000
         * @tc.name    Call the writestringarray interface, write the array to the messageparcel instance,
         *             and call readstringarray() to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_03000", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03000---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var wStringArryData = [];
                for (let i = 0; i < (10 * K - 1); i++) {
                    wStringArryData[i] = "heddSDF";
                };
                expect(data.writeStringArray(wStringArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRINGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var rStringArryData = [];
                    result.reply.readStringArray(rStringArryData);
                    assertArrayElementEqual(rStringArryData, wStringArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03000---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03100
         * @tc.name    Writestringarray interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_03100", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var errorStringArryData = ['abc', 123, 'beauty'];
                expect(data.writeStringArray(errorStringArryData)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03100---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03200
         * @tc.name    writeStringArray Interface for length verification of input parameters
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_03200", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03200---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var wStringArryData = [];
                for (let i = 0; i < 10 * K; i++) {
                    wStringArryData[i] = "heddSDF";
                }
                expect(data.writeStringArray(wStringArryData)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03200---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03300
         * @tc.name    Call the writebytearray interface, write the array to the messageparcel instance,
         *             and call readbytearray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_03300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03300---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                let ByteArrayVar = [1, 2, 3, 4, 5];
                expect(data.writeByteArray(ByteArrayVar)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readByteArray(), ByteArrayVar);
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_03400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03400---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                let ByteArrayVar = [-128, 0, 1, 2, 127];
                expect(data.writeByteArray(ByteArrayVar)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var newArr = new Array(5);
                    result.reply.readByteArray(newArr);
                    assertArrayElementEqual(ByteArrayVar, newArr);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03400---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03500
         * @tc.name    Writebytearray interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_03500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03500---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                let ByteArrayVar = [];
                for (let i = 0; i < (40 * K - 1); i++) {
                    ByteArrayVar[i] = 1;
                }
                expect(data.writeByteArray(ByteArrayVar)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var newArr = new Array(5);
                    result.reply.readByteArray(newArr);
                    assertArrayElementEqual(newArr, ByteArrayVar);
                });
                data.reclaim();
                reply.reclaim();
                done();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03500---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03600
         * @tc.name    Writebytearray interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_03600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03600---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                let ByteArrayVar = [-129, 0, 1, 2, 128];
                expect(data.writeByteArray(ByteArrayVar)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var shortArryDataReply = result.reply.readByteArray();
                    expect(shortArryDataReply[0] == 127).assertTrue();
                    expect(shortArryDataReply[1] == ByteArrayVar[1]).assertTrue();
                    expect(shortArryDataReply[2] == ByteArrayVar[2]).assertTrue();
                    expect(shortArryDataReply[3] == ByteArrayVar[3]).assertTrue();
                    expect(shortArryDataReply[4] == -128).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03600---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03700
         * @tc.name    Writebytearray Interface，input parameter length verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_03700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03700---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let ByteArrayVar = [];
                for (let i = 0; i < 40 * K; i++) {
                    ByteArrayVar[i] = 1;
                }
                expect(data.writeByteArray(ByteArrayVar)).assertEqual(false)
                data.reclaim();
            } catch (error) {
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_03800
         * @tc.name    Call the writeintarray interface, write the array to the messageparcel instance,
         *             and call readintarray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_03800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03800---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var intArryData = [100, 111, 112];
                expect(data.writeIntArray(intArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readIntArray(), intArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_03900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_03900---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var intArryData = [];
                for (let i = 0; i < (50 * K - 1); i++) {
                    intArryData[i] = 1;
                };
                expect(data.writeIntArray(intArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var newArr = new Array(3)
                    result.reply.readIntArray(newArr);
                    assertArrayElementEqual(newArr, intArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_03900---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04000
         * @tc.name    Writeintarray interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_04000", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04000---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var intArryData = [-2147483648, 0, 1, 2, 2147483647];
                expect(data.writeIntArray(intArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readIntArray(), intArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04000---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04100
         * @tc.name    Writeintarray interface, illegal value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_04100", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var intArryData = [-2147483649, 0, 1, 2, 2147483648];
                expect(data.writeIntArray(intArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var shortArryDataReply = result.reply.readIntArray();
                    expect(shortArryDataReply[0] == 2147483647).assertTrue();
                    expect(shortArryDataReply[1] == intArryData[1]).assertTrue();
                    expect(shortArryDataReply[2] == intArryData[2]).assertTrue();
                    expect(shortArryDataReply[3] == intArryData[3]).assertTrue();
                    expect(shortArryDataReply[4] == -2147483648).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04100---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04200
         * @tc.name    Writeintarray interface, input parameter length verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_04200", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04200---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var intArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    intArryData[i] = 1;
                }
                expect(data.writeIntArray(intArryData)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04200---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04300
         * @tc.name    Call the writefloatarray interface, write the array to the messageparcel instance,
         *             and call readfloatarray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_04300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04300---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var floatArryData = [1.2, 1.3, 1.4];
                expect(data.writeFloatArray(floatArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readFloatArray(), floatArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_04400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04400---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var floatArryData = [1.4E-45, 1.3, 3.4028235E38];
                expect(data.writeFloatArray(floatArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var newArr = new Array(3)
                    result.reply.readFloatArray(newArr);
                    assertArrayElementEqual(newArr, floatArryData);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04400---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04500
         * @tc.name    Writefloatarray interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_04500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04500---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var floatArryData = [(1.4E-45) - 1, 1.3, (3.4028235E38) + 1];
                expect(data.writeFloatArray(floatArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var newArr = result.reply.readFloatArray();
                    expect(newArr[0]).assertEqual(-1);
                    expect(newArr[1]).assertEqual(1.3);
                    expect(newArr[2]).assertEqual(3.4028235e+38);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04500---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04600
         * @tc.name    Writefloatarray interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_04600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04600---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var floatArryData = [];
                for (let i = 0; i < (25 * K - 1); i++) {
                    floatArryData[i] = 1.1;
                };
                expect(data.writeFloatArray(floatArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readFloatArray(), floatArryData);
                });
            } catch (error) {
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_04700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04700---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var floatArryData = [];
                for (let i = 0; i < (25 * K); i++) {
                    floatArryData[i] = 1.1;
                };
                expect(data.writeFloatArray(floatArryData)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04800
         * @tc.name    Call the writeShort interface to write the short integer data to the messageparcel instance,
         *             and call readshort to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_04800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04800---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var short = 8;
                expect(data.writeShort(short)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SHORT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readShort(), short);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04800---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_04900
         * @tc.name    WriteShort interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_04900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_04900---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                expect(data.writeShort(-32768)).assertTrue();
                expect(data.writeShort(0)).assertTrue();
                expect(data.writeShort(1)).assertTrue();
                expect(data.writeShort(2)).assertTrue();
                expect(data.writeShort(32767)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readShort() == -32768).assertTrue();
                    expect(result.reply.readShort() == 0).assertTrue();
                    expect(result.reply.readShort() == 1).assertTrue();
                    expect(result.reply.readShort() == 2).assertTrue();
                    expect(result.reply.readShort() == 32767).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_04900---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05000
         * @tc.name    WriteShort interface, Boundary value minimum value out of bounds verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_05000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05000---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                expect(data.writeShort(-32769)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readShort() == 32767).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05000---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05100
         * @tc.name    WriteShort interface, Boundary value maximum value out of bounds verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_05100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                expect(data.writeShort(32768)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readShort() == -32768).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_05200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05200---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var long = 9007199254740991;
                expect(data.writeLong(long)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readLong()).assertEqual(long);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05200---------------------------");
        });


        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05300
         * @tc.name    Writelong interface, Verification of maximum accuracy value
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_05300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05300---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var long = -9007199254740992;
                expect(data.writeLong(long)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readLong() == long).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05300---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05400
         * @tc.name    Writelong interface, Minimum loss accuracy verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_05400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05400---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var long = -9223372036854775300;
                expect(data.writeLong(long)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readLong()).assertEqual(-9223372036854776000);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05400---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05500
         * @tc.name    Writelong interface, Maximum loss accuracy verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_05500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05500---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var short = 9223372036854775300;
                expect(data.writeLong(short)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let readlong = result.reply.readLong();
                    expect(readlong != 0).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05500---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05600
         * @tc.name    Call the parallel interface to read and write data to the double instance
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_05600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05600---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = 4.9E-324;
                expect(data.writeDouble(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readDouble()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05600---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05700
         * @tc.name    Writedouble interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_05700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05700---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = 1.79E+308;
                expect(data.writeDouble(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readDouble()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05800
         * @tc.name    Writedouble interface, Minimum boundary value out of bounds verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_05800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05800---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = (4.9E-324) - 1;
                expect(data.writeDouble(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readDouble()).assertEqual(-1);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05800---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_05900
         * @tc.name    Writedouble interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_05900", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_05900---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var token = "1.79E+465312156";
                expect(data.writeDouble(token)).assertEqual(false);
                data.reclaim();
            } catch (error) {
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_05900---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06000
         * @tc.name    Call the writeboolean interface to write the data to the messageparcel instance,
         *             and call readboolean to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_06000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06000---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = true;
                expect(data.writeBoolean(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEAN, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readBoolean()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_06100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = false;
                expect(data.writeBoolean(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEAN, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readBoolean()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06100---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06200
         * @tc.name    Writeboolean interface, illegal value number type verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_06200", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06200---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                expect(data.writeBoolean(9)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06200---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06300
         * @tc.name    Writeboolean interface, illegal value string type verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_06300", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06300---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var token = "true";
                expect(data.writeBoolean(token)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06300---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06400
         * @tc.name    Call the writechar interface to write the minimum data to the messageparcel instance,
         *               and call readchar to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_06400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06400---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = 0;
                expect(data.writeChar(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06400---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06500
         * @tc.name    Call the writechar interface to write the maximum data to the messageparcel instance,
         *              and call readchar to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_06500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06500---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = 255;
                expect(data.writeChar(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_06600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06600---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = -1;
                expect(data.writeChar(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(255);
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_06700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06700---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = 256;
                expect(data.writeChar(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(0);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06800
         * @tc.name    Writechar interface, illegal value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_06800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06800---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var token = 'ades';
                expect(data.writeChar(token)).assertTrue();
            } catch (error) {
                expect(error != null).assertTrue()
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06800---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_06900
         * @tc.name    Call the writestring interface to write the data to the messageparcel instance,
         *             and call readstring() to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_06900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_06900---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = '';
                for (var i = 0; i < (40 * K - 1); i++) {
                    token += 'a';
                }
                expect(data.writeString(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_06900---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07000
         * @tc.name    Writestring interface Maximum data out of range verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_07000", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07000---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var token = '';
                for (var i = 0; i < 40 * K; i++) {
                    token += 'a';
                }
                expect(data.writeString(token)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07000---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07100
         * @tc.name    Writestring interface, illegal value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_07100", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var token = 123;
                expect(data.writeString(token)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07100---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07200
         * @tc.name    Call the writebyte interface to write data to the messageparcel instance,
         *             and call readbyte to read data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_07200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07200---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = 2;
                expect(data.writeByte(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07200---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07300
         * @tc.name    Writebyte interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_07300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07300---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                expect(data.writeByte(128)).assertTrue();
                expect(data.writeByte(0)).assertTrue();
                expect(data.writeByte(1)).assertTrue();
                expect(data.writeByte(2)).assertTrue();
                expect(data.writeByte(127)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BYTE_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(reply.readByte()).assertEqual(-128);
                    expect(reply.readByte()).assertEqual(0);
                    expect(reply.readByte()).assertEqual(1);
                    expect(reply.readByte()).assertEqual(2);
                    expect(reply.readByte()).assertEqual(127);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim()
            reply.reclaim()
            done()
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07300---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07400
         * @tc.name    Writebyte interface, Maximum boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_07400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07400---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                expect(data.writeByte(-129)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(127);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07400---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07500
         * @tc.name    Writebyte interface, Minimum boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_07500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07500---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                expect(data.writeByte(128)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(-128);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07500---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07600
         * @tc.name    Writebyte interface, illegal value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_07600", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07600---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                expect(data.writeByte("error")).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07600---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07700
         * @tc.name    Call the writeint interface to write the data to the messageparcel instance,
         *             and call readint to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_07700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07700---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = 2;
                expect(data.writeInt(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07800
         * @tc.name    Writeint interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_07800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07800---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                expect(data.writeInt(-2147483648)).assertTrue();
                expect(data.writeInt(0)).assertTrue();
                expect(data.writeInt(1)).assertTrue();
                expect(data.writeInt(2)).assertTrue();
                expect(data.writeInt(2147483647)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(-2147483648);
                    expect(result.reply.readInt()).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(1);
                    expect(result.reply.readInt()).assertEqual(2);
                    expect(result.reply.readInt()).assertEqual(2147483647);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07800---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_07900
         * @tc.name    Writeint interface, Verification of minimum boundary overrun value
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_07900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_07900---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                expect(data.writeInt(-2147483649)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(2147483647);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_07900---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08000
         * @tc.name    Writeint interface, Verification of maximum boundary overrun value
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_08000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08000---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                expect(data.writeInt(2147483648)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(-2147483648);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08000---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08100
         * @tc.name    Writeint interface, illegal value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_08100", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                expect(data.writeInt("error")).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08100---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08200
         * @tc.name    Call the writefloat interface to write data to the messageparcel instance,
         *             and call readfloat to read data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_08200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08200---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = 2.2;
                expect(data.writeFloat(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08200---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08300
         * @tc.name    Writefloat interface, Minimum boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_08300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08300---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = 1.4E-45;
                expect(data.writeFloat(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08300---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08400
         * @tc.name    Writefloat interface, Maximum boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_08400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08400---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = 3.4028235E38;
                expect(data.writeFloat(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(token);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08400---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08500
         * @tc.name    Writefloat interface, Verification of maximum boundary overrun value
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_08500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08500---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = (3.4028235E38) + 1;
                expect(data.writeFloat(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(3.4028235e+38);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08500---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08600
         * @tc.name    Writefloat interface, Verification of minimum boundary overrun value
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_08600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08600---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = (1.4E-45) - 1;
                expect(data.writeFloat(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(-1);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08600---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08700
         * @tc.name    Writefloat interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_08700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08700---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var token = 'a';
                expect(data.writeFloat(token)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08800
         * @tc.name    Call the getRawDataCapacity interface to get the maximum amount of raw data that a MessageParcel
                         can hold
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_08800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08800---------------------------");
            try {
                let parcel = new rpc.MessageParcel();
                let reply = new rpc.MessageParcel();
                let option = new rpc.MessageOption();
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
                expect(parcel.writeIntArray([1, 2, 3, 4, 5])).assertTrue();
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, parcel, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
                    assertArrayElementEqual(result.reply.readIntArray(), [1, 2, 3, 4, 5]);
                    expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
                });
                parcel.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08800---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_08900
        * @tc.name    Test messageparcel to deliver rawdata data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_08900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_08900---------------------------");
            try {
                let parcel = new rpc.MessageParcel();
                let reply = new rpc.MessageParcel();
                let option = new rpc.MessageOption();
                let arr = [1, 2, 3, 4, 5];
                expect(parcel.writeInt(arr.length)).assertTrue();
                expect(parcel.writeRawData(arr, arr.length)).assertTrue();
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_RAWDATA, parcel, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let size = result.reply.readInt();
                    expect(size).assertEqual(arr.length);
                    expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
                    assertArrayElementEqual(result.reply.readRawData(size), arr);
                });
                parcel.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_08900---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09000
        * @tc.name    Test messageparcel to pass abnormal rawdata data, and expand the capacity for verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_09000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09000---------------------------");
            try {
                let parcel = new rpc.MessageParcel();
                let reply = new rpc.MessageParcel();
                let option = new rpc.MessageOption();
                let arr = [1, 2, 3, 4, 5];
                expect(parcel.writeInt(arr.length + 1)).assertTrue();
                expect(parcel.writeRawData(arr, (arr.length + 1))).assertTrue();
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_RAWDATA, parcel, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let size = result.reply.readInt();
                    expect(size).assertEqual(arr.length + 1);
                    expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
                    let newReadResult = result.reply.readRawData(size);
                    expect(arr[0]).assertEqual(newReadResult[0]);
                    expect(arr[1]).assertEqual(newReadResult[1]);
                    expect(arr[2]).assertEqual(newReadResult[2]);
                    expect(arr[3]).assertEqual(newReadResult[3]);
                    expect(arr[4]).assertEqual(newReadResult[4]);
                });
                parcel.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09000---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09100
        * @tc.name    Test messageparcel to pass exception rawdata data data interception verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_09100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09100---------------------------");
            try {
                let parcel = new rpc.MessageParcel();
                let reply = new rpc.MessageParcel();
                let option = new rpc.MessageOption();
                let arr = [1, 2, 3, 4, 5];
                expect(parcel.writeInt(arr.length - 1)).assertTrue();
                expect(parcel.writeRawData(arr, (arr.length - 1))).assertTrue();
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_RAWDATA, parcel, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let size = result.reply.readInt();
                    expect(size).assertEqual(arr.length - 1);
                    expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
                    let newReadResult = result.reply.readRawData(size);
                    expect(arr[0]).assertEqual(newReadResult[0]);
                    expect(arr[1]).assertEqual(newReadResult[1]);
                    expect(arr[2]).assertEqual(newReadResult[2]);
                    expect(arr[3]).assertEqual(newReadResult[3]);
                });
                parcel.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09100---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09200
        * @tc.name    Test messageParcel to deliver out-of-bounds RawData data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_09200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09200---------------------------");
            try {
                let parcel = new rpc.MessageParcel();
                let reply = new rpc.MessageParcel();
                let option = new rpc.MessageOption();
                let arr = [-129, 2, 3, 4, 128];
                expect(parcel.writeInt(arr.length)).assertTrue();
                expect(parcel.writeRawData(arr, arr.length)).assertTrue();
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_RAWDATA, parcel, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let size = result.reply.readInt();
                    expect(size).assertEqual(arr.length);
                    expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
                    assertArrayElementEqual(result.reply.readRawData(size), arr);
                });
                parcel.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09200---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09300
        * @tc.name    Test messageParcel to deliver illegal RawData data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_09300", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09300---------------------------");
            try {
                let parcel = new rpc.MessageParcel();
                let arr = ["aaa", 1, 2, 3];
                expect(parcel.writeInt(arr.length)).assertTrue();
                expect(parcel.writeRawData(arr, arr.length)).assertTrue();
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
                parcel.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09300---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09400
         * @tc.name    Call the writeremoteobject interface to serialize the remote object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_09400", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09400---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let testRemoteObject = new TestRemoteObject("testObject");
                expect(data.writeRemoteObject(testRemoteObject)).assertTrue();
                expect(data.readRemoteObject() != null).assertTrue();
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09400---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09500
         * @tc.name    Call the writeremoteobject interface to serialize the remote object and pass in the empty object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_09500", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09500---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var token = new TestRemoteObject(null);
                expect(data.writeRemoteObject(token)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09500---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09600
         * @tc.name    Call the writeremoteobject interface to serialize the remote object and pass in the constructor object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_09600", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09600---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var token = {}
                expect(data.writeRemoteObject(token)).assertEqual(false);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09600---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09700
         * @tc.name    Call the writesequenceable interface to write the custom serialized
         *             object to the messageparcel instance
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_09700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09700---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let sequenceable = new MySequenceable(1, "aaa");
                expect(data.writeSequenceable(sequenceable)).assertTrue();
                let ret = new MySequenceable(0, "");
                expect(data.readSequenceable(ret)).assertTrue();
            } catch (error) {
                expect(error).assertEqual(null);
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09800
         * @tc.name    Call the writesequenceable interface to write the custom serialized
         *             object to the messageparcel instance, Migration to read
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_09800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09800---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let sequenceable = new MySequenceable(1, "aaa");
                expect(data.writeSequenceable(sequenceable)).assertTrue();
                let ret = new MySequenceable(1, "");
                expect(data.readSequenceable(ret)).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_09800---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_09900
         * @tc.name    After the server finishes processing, write noexception first before writing the result,
         *             and the client calls readexception to judge whether the server is abnormal
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_09900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_09900---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                data.writeNoException();
                expect(data.writeInt(6)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_NOEXCEPTION, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                    expect(result.reply.readInt()).assertEqual(6);
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_10000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10000---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                data.writeNoException();
                expect(data.writeInt(1232222223444)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_NOEXCEPTION, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                    expect(result.reply.readInt() != 1232222223444).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_10000---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_10100
         * @tc.name    Serializable object marshaling and unmarshalling test
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_10100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var sequenceable = new MySequenceable(1, "aaa");
                expect(data.writeSequenceable(sequenceable)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var s = new MySequenceable(null, null);
                    expect(result.reply.readSequenceable(s)).assertTrue();
                    expect(s.str).assertEqual(sequenceable.str);
                    expect(s.num).assertEqual(sequenceable.num);
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_10100---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_10200
         * @tc.name    Non serializable object marshaling test
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_10200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10200---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var sequenceable = null;
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_10300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10300---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var sequenceable = 10;
                expect(data.writeInt(sequenceable)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var s = new MySequenceable(0, null);
                    expect(result.reply.readSequenceable(s)).assertTrue();
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_10400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10400---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var sequenceable = new MySequenceable(2, "abc");
                expect(data.writeSequenceable(sequenceable)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var s = new MySequenceable(null, null);
                    expect(result.reply.readSequenceable(s)).assertTrue();
                    expect(s.str).assertEqual(sequenceable.str);
                    expect(s.num).assertEqual(sequenceable.num);
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_10500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10500---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var sequenceable = [new MySequenceable(1, "aaa"),
                new MySequenceable(2, "bbb"), new MySequenceable(3, "ccc")];
                expect(data.writeSequenceableArray(sequenceable)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var s = [new MySequenceable(null, null), new MySequenceable(null, null),
                    new MySequenceable(null, null)];
                    result.reply.readSequenceableArray(s);
                    for (let i = 0; i < s.length; i++) {
                        expect(s[i].str).assertEqual(sequenceable[i].str)
                        expect(s[i].num).assertEqual(sequenceable[i].num)
                    }
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_10600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10600---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var sequenceable = [new MySequenceable(4, "abc"),
                new MySequenceable(5, "bcd"), new MySequenceable(6, "cef")];
                expect(data.writeSequenceableArray(sequenceable)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var s = [new MySequenceable(null, null),
                    new MySequenceable(null, null), new MySequenceable(null, null)]
                    result.reply.readSequenceableArray(s);
                    for (let i = 0; i < s.length; i++) {
                        expect(s[i].str).assertEqual(sequenceable[i].str)
                        expect(s[i].num).assertEqual(sequenceable[i].num)
                    }
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_10700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10700---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var sequenceable = 1;
                expect(data.writeSequenceableArray(sequenceable)).assertEqual(false);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_10700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_10800
         * @tc.name    Call the writeremoteobjectarray interface to write the object array to the messageparcel
         *             instance, and call readremoteobjectarray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_10800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10800---------------------------");
            try {
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
                let reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                expect(data.writeInterfaceToken("rpcTestAbility")).assertTrue()
                let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)];
                let result = data.writeRemoteObjectArray(listeners);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10800: writeRemoteObjectArray is " + result);
                expect(result).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
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
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_10800---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_10900
         * @tc.name    Call the writeremoteobjectarray interface to write the object array to the messageparcel instance,
         *             and call readremoteobjectarray (objects: iremoteobject []) to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_10900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_10900---------------------------");
            try {
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
                let reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                expect(data.writeInterfaceToken("rpcTestAbility")).assertTrue()
                let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)];
                let result = data.writeRemoteObjectArray(listeners);
                console.info("RpcClient: writeRemoteObjectArray is " + result);
                expect(result).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECTARRAY, data, reply, option).then((result) => {
                    console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_10900: sendRequest is " + result.errCode);
                    expect(result.errCode == 0).assertTrue();
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_10900---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11000
         * @tc.name    Test messageparcel to deliver the reply message received in promise across processes
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_11000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11000---------------------------");
            try {
                var data = rpc.MessageParcel.create();
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
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_11100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
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
                    try {
                        console.info("sendRequest Callback")
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
                expect(error == null).assertTrue();
            }
            console.info("--------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11100--------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11200
         * @tc.name    Test the cross process transmission of messageparcel.
         *             After receiving the reply message in promise, read various types of arrays in order
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_11200", 0, async function (done) {
            console.info("--------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11200--------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                expect(data.writeByteArray([1, 2, 3])).assertTrue();
                expect(data.writeShortArray([4, 5, 6])).assertTrue()
                expect(data.writeIntArray([7, 8, 9])).assertTrue()
                expect(data.writeLongArray([10, 11, 12])).assertTrue()
                expect(data.writeFloatArray([1.1, 1.2, 1.3])).assertTrue()
                expect(data.writeDoubleArray([2.1, 2.2, 2.3])).assertTrue()
                expect(data.writeBooleanArray([true, true, false])).assertTrue()
                expect(data.writeCharArray([65, 97, 122])).assertTrue()
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
                    assertArrayElementEqual(result.reply.readCharArray(), [65, 97, 122])
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
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_11300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11300---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                expect(data.writeByteArray([1, 2, 3])).assertTrue();
                expect(data.writeShortArray([4, 5, 6])).assertTrue()
                expect(data.writeIntArray([7, 8, 9])).assertTrue()
                expect(data.writeLongArray([10, 11, 12])).assertTrue()
                expect(data.writeFloatArray([1.1, 1.2, 1.3])).assertTrue()
                expect(data.writeDoubleArray([2.1, 2.2, 2.3])).assertTrue()
                expect(data.writeBooleanArray([true, true, false])).assertTrue()
                expect(data.writeCharArray([65, 97, 122])).assertTrue()
                expect(data.writeStringArray(['abc', 'seggg'])).assertTrue()
                let a = [new MySequenceable(1, "aaa"), new MySequenceable(2, "bbb"),
                new MySequenceable(3, "ccc")]
                expect(data.writeSequenceableArray(a)).assertTrue()
                await gIRemoteObject.sendRequest(CODE_ALL_ARRAY_TYPE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let ByteArray = new Array();
                    result.reply.readByteArray(ByteArray)
                    assertArrayElementEqual(ByteArray, [1, 2, 3]);
                    let ShortArray = new Array();
                    result.reply.readShortArray(ShortArray)
                    assertArrayElementEqual(ShortArray, [4, 5, 6]);
                    let IntArray = new Array();
                    result.reply.readIntArray(IntArray)
                    assertArrayElementEqual(IntArray, [7, 8, 9]);
                    let LongArray = new Array();
                    result.reply.readLongArray(LongArray)
                    assertArrayElementEqual(LongArray, [10, 11, 12]);
                    let FloatArray = new Array();
                    result.reply.readFloatArray(FloatArray)
                    assertArrayElementEqual(FloatArray, [1.1, 1.2, 1.3]);
                    let DoubleArray = new Array();
                    result.reply.readDoubleArray(DoubleArray)
                    assertArrayElementEqual(DoubleArray, [2.1, 2.2, 2.3]);
                    let BooleanArray = new Array();
                    result.reply.readBooleanArray(BooleanArray)
                    assertArrayElementEqual(BooleanArray, [true, true, false]);
                    let CharArray = new Array();
                    result.reply.readCharArray(CharArray)
                    assertArrayElementEqual(CharArray, [65, 97, 122]);
                    let StringArray = new Array();
                    result.reply.readStringArray(StringArray);
                    assertArrayElementEqual(StringArray, ['abc', 'seggg']);
                    let b = [new MySequenceable(null, null), new MySequenceable(null, null),
                    new MySequenceable(null, null)];
                    result.reply.readSequenceableArray(b)
                    for (let i = 0; i < b.length; i++) {
                        expect(b[i].str).assertEqual(a[i].str)
                        expect(b[i].num).assertEqual(a[i].num)
                    }
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            reply.reclaim();
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11300---------------------------");
        });

        
        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11400
         * @tc.name    Test messageparcel to pass an array of iremoteobject objects across processes
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_Softbus_RPC_Compatibility_MessageParcel_11400', 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11400---------------------------");

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
            try {
                let option = new rpc.MessageOption()
                let data = rpc.MessageParcel.create()
                let reply = rpc.MessageParcel.create()
                let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)]
                expect(data.writeRemoteObjectArray(listeners)).assertTrue()
                expect(data.writeInt(123)).assertTrue()
                expect(data.writeString("rpcListenerTest")).assertTrue()
                await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECTARRAY_1, data, reply, option)
                    .then((result) => {
                        expect(result.errCode).assertEqual(0)
                        result.reply.readException()
                    })

                data.reclaim()
                reply.reclaim()
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done()
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11400---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11500
         * @tc.name    Test messageparcel to pass an object of type iremoteobject across processes
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_Softbus_RPC_Compatibility_MessageParcel_11500', 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11500---------------------------");
            function checkResult(num, str) {
                expect(num).assertEqual(123)
                expect(str).assertEqual("rpcListenerTest")
                done()
            }
            try {
                let option = new rpc.MessageOption()
                let data = rpc.MessageParcel.create()
                let reply = rpc.MessageParcel.create()

                let listener = new TestListener("rpcListener", checkResult)
                expect(data.writeRemoteObject(listener)).assertTrue()
                expect(data.writeInt(123)).assertTrue()
                expect(data.writeString("rpcListenerTest")).assertTrue()
                await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                });
                data.reclaim();
                reply.reclaim();
                done();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11500---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11600
         * @tc.name    Test messageparcel to pass the array of iremoteobject objects across processes. The server
         *             constructs an empty array in onremoterequest and reads it from messageparcel
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_Softbus_RPC_Compatibility_MessageParcel_11600', 0, async function (done) {
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
            try {
                let option = new rpc.MessageOption()
                let data = rpc.MessageParcel.create()
                let reply = rpc.MessageParcel.create()
                let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)]
                expect(data.writeRemoteObjectArray(listeners)).assertTrue()
                data.readRemoteObjectArray()
                expect(data.writeInt(123)).assertTrue()
                expect(data.writeString("rpcListenerTest")).assertTrue()
                await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECTARRAY_2, data, reply, option)
                    .then((result) => {
                        expect(result.errCode).assertEqual(0)
                        result.reply.readException()
                    })
                data.reclaim()
                reply.reclaim()
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done()
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11600---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11700
         * @tc.name    Invoke the rewindRead interface,Set 0-bit offset and read the data after offset
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_11700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11700---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageParcel.create();
                expect(data.writeInt(12)).assertTrue();
                expect(data.writeString("parcel")).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(12);
                    expect(result.reply.rewindRead(0)).assertTrue();
                    expect(result.reply.readInt()).assertEqual(12);
                    expect(result.reply.readString()).assertEqual("");
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11800
         * @tc.name    Invoke the rewindRead interface,Set 1-bit offset and read the data after offset
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_11800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11700---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageParcel.create();
                expect(data.writeInt(12)).assertTrue();
                expect(data.writeString("parcel")).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode == 0).assertTrue();
                    expect(result.reply.readInt()).assertEqual(12);
                    expect(result.reply.rewindRead(1)).assertTrue();
                    expect(result.reply.readInt()).assertEqual(0);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11800---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_11900
         * @tc.name    Invoke the rewindWrite interface, Set 0-bit offset and write the data after offset
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_11900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_11800---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageParcel.create();
                expect(data.writeInt(4)).assertTrue();
                expect(data.rewindWrite(0)).assertTrue();
                expect(data.writeInt(5)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode == 0).assertTrue();
                    expect(result.reply.readInt()).assertEqual(5);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_11900---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12000
         * @tc.name    Invoke the rewindWrite interface, Set 1-bit offset and write the data after offset
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_12000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12000---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageParcel.create();
                expect(data.writeInt(4)).assertTrue();
                expect(data.rewindWrite(1)).assertTrue();
                expect(data.writeInt(5)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt() != 5).assertTrue();
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12000---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12100
         * @tc.name    setCapacity Sets the storage capacity of the null MessageParcel instance. The getCapacity
                       obtains the current MessageParcel capacity
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_12100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12100---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageParcel.create();
                expect(data.getCapacity()).assertEqual(0);
                expect(data.setCapacity(100)).assertTrue();
                expect(data.writeString("constant")).assertTrue();
                expect(data.getCapacity()).assertEqual(100);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.getCapacity()).assertEqual(("constant".length * 2) + 8);
                    expect(result.reply.readString()).assertEqual("constant");
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12100---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12200
         * @tc.name    setCapacity Sets the storage capacity of the MessageParcel instance. The getCapacity
                       obtains the current MessageParcel capacity
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_12200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12200---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageParcel.create();
                expect(data.writeString("constant")).assertTrue();
                expect(data.setCapacity(100)).assertTrue();
                expect(data.getCapacity()).assertEqual(100);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("constant");
                    expect(result.reply.getCapacity()).assertEqual(("constant".length * 2) + 8);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12200---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12300
         * @tc.name    Setcapacity test: size limit verification of messageparcel instance
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_12300", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12300---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                expect(data.getCapacity()).assertEqual(0);
                expect(data.writeString("constant")).assertTrue();
                let getSizedata = data.getSize();
                expect(data.setCapacity(getSizedata + 1)).assertTrue();
                expect(data.getCapacity()).assertEqual((getSizedata + 1));
                expect(data.setCapacity(getSizedata)).assertEqual(false);
                expect(data.getCapacity()).assertEqual((getSizedata + 1));
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12300---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12400
        * @tc.name    SetCapacity Tests the storage capacity threshold of the MessageParcel instance
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_12400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12400---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageParcel.create();
                expect(data.writeString("constant")).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let getSizeresult = result.reply.getSize();
                    expect(result.reply.getCapacity()).assertEqual(("constant".length * 2) + 8);
                    expect(result.reply.setCapacity(getSizeresult + 1)).assertTrue();
                    expect(result.reply.getCapacity()).assertEqual(getSizeresult + 1);
                    expect(result.reply.setCapacity(getSizeresult)).assertEqual(false);
                    expect(data.readString()).assertEqual("constant");
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12400---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12500
        * @tc.name    Setcapacity test storage capacity boundary value verification of messageparcel instance
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_12500", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12500---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                expect(data.getSize()).assertEqual(0);
                expect(data.setCapacity(M)).assertTrue();
                expect(data.getCapacity()).assertEqual(M);
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12500: setCapacity " + data.setCapacity(2 * G));
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_12500: setCapacity " + data.getCapacity());
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12500---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12600
         * @tc.name    setSize Sets the size of the data contained in the MessageParcel instance. The getSize command
                        reads the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_12600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12600---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageParcel.create();
                expect(data.getSize()).assertEqual(0);
                expect(data.setSize(0)).assertTrue();
                expect(data.writeString("constant")).assertTrue();
                expect(data.getSize()).assertEqual(("constant".length * 2) + 8);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.getSize()).assertEqual(("constant".length * 2) + 8);
                    expect(result.reply.readString()).assertEqual("constant");
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12600---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12700
         * @tc.name    SetSize: Increases the value of the data contained in the MessageParcel instance by 1,
                        Write setSize
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_12700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12700---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageParcel.create();
                expect(data.writeString("constant")).assertTrue();
                expect(data.getSize()).assertEqual(("constant".length * 2) + 8);
                expect(data.setSize(0)).assertTrue();
                expect(data.getSize()).assertEqual(0);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.getSize()).assertEqual(8);
                    expect(result.reply.readString()).assertEqual("");
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12800
         * @tc.name    Verify the messageparcel instance SetSize setting and the instance capacitydata qualification verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_12800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12800---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                expect(data.getSize()).assertEqual(0);
                expect(data.writeString("constant")).assertTrue();
                expect(data.getSize()).assertEqual(("constant".length * 2) + 8);
                let getCapacitydata = data.getCapacity();
                expect(data.setSize(getCapacitydata)).assertTrue();
                expect(data.getSize()).assertEqual(getCapacitydata);
                expect(data.setSize(getCapacitydata + 1)).assertEqual(false);
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12800---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_12900
         * @tc.name    setSize Sets the storage capacity of the MessageParcel instance to decrease by one.
                       The getSize obtains the current MessageParcel capacity
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_12900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_12900---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageParcel.create();
                expect(data.writeString("constant")).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("constant");
                    expect(result.reply.getSize()).assertEqual(("constant".length * 2) + 8);
                    let getCapacityresult = result.reply.getCapacity();
                    expect(result.reply.setSize(getCapacityresult)).assertTrue();
                    expect(result.reply.getSize()).assertEqual(getCapacityresult);
                    expect(result.reply.setSize(getCapacityresult + 1)).assertEqual(false);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_12900---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13000
         * @tc.name    Validate the setSize boundary value in the MessageParcel instance
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_13000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13000---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                expect(data.getCapacity()).assertEqual(0);
                expect(data.setSize(4 * G)).assertTrue();
                expect(data.getSize()).assertEqual(0);
                expect(data.setSize(4 * G - 1)).assertEqual(false);
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13000---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13100
         * @tc.name    Verify that setSize is out of bounds in a MessageParcel instance
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_13100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13100---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                expect(data.setSize(0)).assertTrue();
                expect(data.getSize()).assertEqual(0);
                expect(data.setSize(2 * 4 * G)).assertTrue();
                expect(data.getSize()).assertEqual(0);
                expect(data.setSize(2 * G)).assertEqual(false);
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13100---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13200
         * @tc.name    Obtains the write and read positions of the MessageParcel
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_13200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13200---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageParcel.create();
                expect(data.getWritePosition()).assertEqual(0);
                expect(data.writeInt(10)).assertTrue();
                expect(data.getWritePosition()).assertEqual(4);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.getReadPosition()).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(10);
                    expect(result.reply.getReadPosition()).assertEqual(4);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13200---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13300
         * @tc.name    Obtaining the Writable and Readable Byte Spaces of MessageParcel
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_13300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13300---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageParcel.create();
                expect(data.getWritableBytes()).assertEqual(0);
                expect(data.writeInt(10)).assertTrue();
                expect(data.getWritableBytes()).assertEqual(60);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(10);
                    expect(result.reply.getReadableBytes()).assertEqual(0);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13300---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13400
         * @tc.name    Obtains the writeable and readable byte space and read position of the MessageParcel
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_13400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13400---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageParcel.create();
                data.writeInt(10);
                expect(data.getWritePosition()).assertEqual(4);
                expect(data.getWritableBytes()).assertEqual(60);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.getReadableBytes()).assertEqual(4);
                    expect(result.reply.getReadPosition()).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(10);
                    expect(result.reply.getReadableBytes()).assertEqual(0);
                    expect(result.reply.getReadPosition()).assertEqual(4);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13400---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13500
        * @tc.name    Get the space size of messageparcel to pass rawdata data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_13500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13500---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let reply = rpc.MessageParcel.create();
                data.writeInt(10);
                expect(data.getWritePosition()).assertEqual(4);
                expect(data.getWritableBytes()).assertEqual(60);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.getReadPosition()).assertEqual(0);
                    expect(result.reply.getReadableBytes()).assertEqual(4);
                    expect(result.reply.readInt()).assertEqual(10);
                    expect(result.reply.getReadPosition()).assertEqual(4);
                    expect(result.reply.getReadableBytes()).assertEqual(0);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13500---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13600
         * @tc.name    Test fixed MessageParcel space size to pass rawData data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_13600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13600---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                expect(data.getRawDataCapacity()).assertEqual(128 * M);
                let rawdata = [1, 2, 3];
                let option = new rpc.MessageOption();
                let reply = rpc.MessageParcel.create();
                expect(data.writeInt(rawdata.length)).assertTrue();
                expect(data.writeRawData(rawdata, rawdata.length)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_RAWDATA, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let size = result.reply.readInt();
                    expect(result.reply.readRawData(size) != rawdata).assertTrue();
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13600---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13700
         * @tc.name    Test messageparcel delivery file descriptor object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_13700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13700---------------------------");
            try {
                let testab = new TestProxy(gIRemoteObject).asObject();
                expect(testab != null).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13800
         * @tc.name    Test that the asObject interface is called by a RemoteObject and returns itself
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_13800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13800---------------------------");
            try {
                let testRemoteObject = new TestRemoteObject("testObject");
                expect(testRemoteObject.asObject() != null).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13800---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_13900
         * @tc.name    MessageParcel sendMessageRequest API test
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_13900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_13900---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let rawdata = [1, 2, 3];
                let option = new rpc.MessageOption();
                let reply = rpc.MessageSequence.create();
                data.getRawDataCapacity();
                data.writeInt(rawdata.length);
                data.writeRawData(rawdata, rawdata.length);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_RAWDATA, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(rawdata.length);
                    expect(result.reply.readRawData(rawdata.length) != rawdata).assertTrue();
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_13900---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_14000
        * @tc.name    Invoke the writestring interface to write data to the messageparcel instance SendRequest Asynchronous
        *               Authentication onRemoteMessageRequest Server Processing
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_14000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_14000---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = 'onRemoteMessageRequest invoking';
                expect(data.writeString(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_ONREMOTEMESSAGE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual(token);
                });
                data.reclaim();
                reply.reclaim();
                done();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_14000---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_14100
        * @tc.name    Invoke the writestring interface to write data to the messageparcel instance sendMessageRequest Asynchronous
        *               Authentication onRemoteMessageRequest Server Processing
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_14100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_14100---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = 'onRemoteMessageRequest invoking';
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_ONREMOTEMESSAGE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual(token);
                });
                data.reclaim();
                reply.reclaim();
                done();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_14100---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_14200
        * @tc.name    Invoke the writestring interface to write data to the messageparcel instance. SendRequest asynchronously
        *               verifies the priority processing levels of onRemoteMessageRequest and onRemoteRequest
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_14200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_14200---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var token = "onRemoteRequest or onRemoteMessageRequest invoking";
                expect(data.writeString(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_ONREMOTEMESSAGE_OR_ONREMOTEREQUEST, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("onRemoteMessageRequest invoking");
                });
                data.reclaim();
                reply.reclaim();
                done();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_14200---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_14300
        * @tc.name   Invoke the writestring interface to write data to the messageparcel instance. sendMessageRequest asynchronously verifies
        *               the priority processing levels of onRemoteMessageRequest and onRemoteRequest
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_14300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_14300---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = "onRemoteRequest or onRemoteMessageRequest invoking";
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_ONREMOTEMESSAGE_OR_ONREMOTEREQUEST, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("onRemoteMessageRequest invoking");
                });
                data.reclaim();
                reply.reclaim();
                done();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_14300---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_14400
        * @tc.name    writeString check param error Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_14400", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_14400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = '';
                for (var i = 0; i < 40 * K; i++) {
                    token += 'a';
                };
                data.writeString(token);
                data.reclaim();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_14400---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_14500
        * @tc.name    writeInterfaceToken Sequence memory alloc failed Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_14500", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_14500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                data.setSize(0);
                data.setCapacity(0);
                var token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
                data.reclaim();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_14500---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_14600
        * @tc.name    writeInterfaceToken Write data to message sequence failed Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_14600", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_14600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                data.setSize(true);
                data.setCapacity(true);
                var token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
                data.reclaim();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_14600---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_14700
        * @tc.name    readParcelable Sequence memory alloc failed Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_14700", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_14700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let sequenceable = new MySequenceable(1, "aaa");
                data.writeParcelable(sequenceable);
                let ret = new MySequenceable(0, "");
                data.setCapacity(0);
                data.readParcelable(ret);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_14700---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_14800
        * @tc.name    writeRemoteObject is proxy or remote object is invalid Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_14800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_14800---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = {};
                data.writeRemoteObject(token);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.PROXY_OR_REMOTE_OBJECT_INVALID_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_14800---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_14900
        * @tc.name    readParcelable is Call JS callback function failedv Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_14900", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_14900---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                console.info("SUB_Softbus_RPC_Compatibility_MessageParcel_14900: create object successfully.");
                let sequenceable = new MySequenceableCode(1, "aaa");
                data.writeParcelable(sequenceable);
                data.setCapacity(0);
                data.setSize(0);
                let ret = new MySequenceable(1, "");
                data.readParcelable(ret);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.CALL_JS_METHOD_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code != errCode).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_14900---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageParcel_15000
        * @tc.name    Call the writeinterfacetoken interface, write the interface descriptor, and read interfacetoken
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageParcel_15000", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageParcel_15000---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
                data.setCapacity(0);
                data.setSize(0);
                data.readInterfaceToken();
                data.reclaim();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code != errCode).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageParcel_15000---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00100
         * @tc.name    Test the getwaittime basic method of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_00100", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00100---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getWaitTime()).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
                option.setWaitTime(16);
                expect(option.getWaitTime()).assertEqual(16);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00100---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00200
         * @tc.name    Test the getwaittime boundary value of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_00200", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00200---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getWaitTime()).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
                option.setWaitTime(0);
                expect(option.getWaitTime()).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
                option.setWaitTime(60);
                expect(option.getWaitTime()).assertEqual(60);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00200---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00300
         * @tc.name    Test the getwaittime minimum out of range value of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_00300", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00300---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getWaitTime()).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
                option.setWaitTime(-1);
                expect(option.getWaitTime()).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00300---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00400
         * @tc.name    Test the getwaittime maxmum out of range value of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_00400", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00400---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getWaitTime()).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
                option.setWaitTime(61);
                expect(option.getWaitTime()).assertEqual(61);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00400---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00500
         * @tc.name    Test the getflags basic method of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_00500", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00500---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getFlags()).assertEqual(rpc.MessageOption.TF_SYNC);
                option.setFlags(1);
                expect(option.getFlags()).assertEqual(rpc.MessageOption.TF_ASYNC);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00500---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00600
         * @tc.name    Test the setflags basic method of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_00600", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00600---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getFlags()).assertEqual(rpc.MessageOption.TF_SYNC);
                option.setFlags(1);
                expect(option.getFlags()).assertEqual(rpc.MessageOption.TF_ASYNC);
                option.setFlags(0)
                expect(option.getFlags()).assertEqual(rpc.MessageOption.TF_ASYNC);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00600---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00700
         * @tc.name    Test the setflags exception value of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_00700", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00700---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getFlags()).assertEqual(rpc.MessageOption.TF_SYNC);
                option.setFlags(-1);
                expect(option.getFlags()).assertEqual(-1);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00700---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00800
         * @tc.name    Test the unqualified value of setflags of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_00800", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00800---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getFlags()).assertEqual(rpc.MessageOption.TF_SYNC);
                option.setFlags(3);
                expect(option.getFlags()).assertEqual(3);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00800---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_00900
         * @tc.name    Test constant value detection of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_00900", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_00900---------------------------");
            try {
                expect(rpc.MessageOption.TF_SYNC).assertEqual(0);
                expect(rpc.MessageOption.TF_ASYNC).assertEqual(1);
                expect(rpc.MessageOption.TF_WAIT_TIME).assertEqual(4);
                expect(rpc.MessageOption.TF_ACCEPT_FDS).assertEqual(0x10);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_00900---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_01000
         * @tc.name    Basic method of testing messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_01000", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_01000---------------------------");
            try {

                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                option.setWaitTime(20);
                option.setFlags(0);
                var token = "option";
                expect(data.writeString(token)).assertTrue();
                expect(option.getFlags()).assertEqual(0);
                expect(option.getWaitTime()).assertEqual(20);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual(token);
                    expect(option.getFlags()).assertEqual(0);
                    expect(option.getWaitTime()).assertEqual(20);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_01000---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_01100
         * @tc.name    Test the setflags of messageoption asynchronously and the sendrequest callback result
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_01100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_01100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                option.setFlags(1);
                var token = "option";
                expect(data.writeString(token)).assertTrue();
                expect(option.getFlags()).assertEqual(1);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("");
                    expect(option.getFlags()).assertEqual(1);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_01100---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_01200
         * @tc.name    MessageOption sendMessageRequest test
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_01200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_01200---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                option.setFlags(1);
                data.writeString("option");
                expect(option.getFlags()).assertEqual(1);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("");
                    expect(option.getFlags()).assertEqual(1);

                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_01200---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_01300
        * @tc.name    setAsync sendMessageRequest test
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_01300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_01300---------------------------");
            try {
                var option = new rpc.MessageOption();
                option.setAsync(3);
            } catch (error) {
                expect(error != null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_01300---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_01400
        * @tc.name    MessageOption sendMessageRequest test
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_01400", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_01400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                var token = "option";
                data.writeString(token);
                expect(option.isAsync()).assertEqual(false);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(option.isAsync()).assertEqual(false);
                    expect(result.reply.readString()).assertEqual(token);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_01400---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_01500
        * @tc.name    MessageOption setAsync is true test
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_01500", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_01500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                option.setAsync(true);
                var token = "option";
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(option.isAsync()).assertTrue();
                    expect(result.reply.readString()).assertEqual("");
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_01500---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageOption_01600
        * @tc.name    setAsync is false sendMessageRequest test
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_MessageOption_01600", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageOption_01600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                option.setAsync(false);
                var token = "option";
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(option.isAsync()).assertEqual(false);
                    expect(result.reply.readString()).assertEqual(token);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageOption_01600---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00100
         * @tc.name    Exception parameter validation of the created anonymous shared memory object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_00100", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00100---------------------------");
            try {
                expect(rpc.Ashmem.createAshmem("JsAshmemTest", -1) == null).assertTrue();
                expect(rpc.Ashmem.createAshmem(null, 1024) == null).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00100---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00200
         * @tc.name    Call the getashmemsize interface to get the size of the shared memory object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_00200", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00200---------------------------");
            try {
                var mapSize = 2 * G - 1;
                var jsash = "";
                for (let i = 0; i < (256 - 1); i++) {
                    jsash += "a";
                }
                let ashmem = rpc.Ashmem.createAshmem(jsash, mapSize)
                expect(ashmem != null).assertTrue();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00200---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00300
         * @tc.name    Call the getashmemsize interface to get the size of the exception shared memory object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_00300", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00300---------------------------");
            try {
                let mapSize = 2 * G - 1;
                let jsash = "";
                for (let i = 0; i < 256; i++) {
                    jsash += "a";
                }
                let ashmem = rpc.Ashmem.createAshmem(jsash, mapSize);
                expect(ashmem == undefined).assertTrue();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00300---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00400
         * @tc.name    Call the getashmemsize interface to get the size of the maximum shared memory object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_00400", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00400---------------------------");
            try {
                let mapSize = 2 * G - 1;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize)
                expect(ashmem != null).assertTrue();
                expect(ashmem.getAshmemSize()).assertEqual(mapSize);
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00400---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00500
         * @tc.name    Call the getashmemsize interface to obtain the maximum size of the out of bounds shared memory object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_00500", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00500---------------------------");
            try {
                let mapSize = 2 * G;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize)
                expect(ashmem == undefined).assertTrue();
                expect(ashmem.getAshmemSize()).assertEqual(mapSize);
                ashmem.closeAshmem();
            } catch (error) {
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00500---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00600
         * @tc.name    Writeashmem exception validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_00600", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00600---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
                expect(ashmem != null).assertTrue();
                ashmem.closeAshmem();
                var data = rpc.MessageParcel.create();
                expect(data.writeAshmem(ashmem)).assertEqual(false);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            data.reclaim();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00600---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00700
         * @tc.name    Readfromashmem exception validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_00700", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00700---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
                expect(ashmem != null).assertTrue();
                ashmem.unmapAshmem();
                let bytes = [1, 2, 3, 4, 5];
                expect(ashmem.readFromAshmem(bytes.length, 0) == null).assertTrue();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00700---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00800
         * @tc.name    Mapashmem interface creates shared file mappings
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_00800", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00800---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
                expect(ashmem != null).assertTrue();
                expect(ashmem.mapAshmem(rpc.Ashmem.PROT_READ)).assertTrue();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00800---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_00900
         * @tc.name    Mapashmem exception validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_00900", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_00900---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", (2 * G - 1))
                expect(ashmem != null).assertTrue();
                expect(ashmem.mapAshmem(999)).assertEqual(false);
                ashmem.closeAshmem();
            } catch (error) {
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_00900---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01000
         * @tc.name    Mapreadandwriteashmem interface creates a shared file map with the protection level of read-write
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_01000", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01000---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
                expect(ashmem != null).assertTrue();
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01000---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01100
         * @tc.name    Mapreadandwriteashmem exception validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_01100", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01100---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem != null).assertTrue();
                expect(ashmem.mapAshmem(rpc.Ashmem.PROT_READ)).assertTrue();
                ashmem.unmapAshmem();
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01100---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01200
         * @tc.name    Mapreadonlyashmem interface creates a shared file map with the protection level of read-write
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_01200", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01200---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem != null).assertTrue();
                expect(ashmem.mapReadOnlyAshmem()).assertTrue();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01200---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01300
         * @tc.name    Mapreadonlyashmem exception validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_01300", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01300---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
                expect(ashmem != null).assertTrue();
                expect(ashmem.mapAshmem(rpc.Ashmem.PROT_WRITE)).assertTrue();

                ashmem.unmapAshmem();
                ashmem.closeAshmem()
                expect(ashmem.mapReadOnlyAshmem()).assertEqual(false);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01300---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01400
         * @tc.name    Setprotection: sets the protection level of the memory area to which the shared file is mapped
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_01400", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01400---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
                expect(ashmem.setProtection(rpc.Ashmem.PROT_WRITE)).assertTrue();
                expect(ashmem.setProtection(rpc.Ashmem.PROT_READ)).assertEqual(false);
                expect(ashmem.mapReadAndWriteAshmem()).assertEqual(false);
                expect(ashmem.setProtection(rpc.Ashmem.PROT_NONE)).assertTrue();
                expect(ashmem.setProtection(rpc.Ashmem.PROT_READ)).assertEqual(false)();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01400---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01500
         * @tc.name    Setprotection exception input parameter verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_01500", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01500---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
                expect(ashmem.setProtection(3)).assertTrue();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01500---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01600
         * @tc.name    The writetoashmem interface writes the shared file associated with the object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_01600", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01600---------------------------");
            try {
                let mapSize = 4096;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [1, 2, 3, 4, 5];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertTrue();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01600---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01700
         * @tc.name    Writetoashmem interface writes the shared file associated with the object (file boundary value)
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_01700", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01700---------------------------");
            try {
                let mapSize = 4096;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [-2147483648, 2147483647];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertTrue();
                assertArrayElementEqual(ashmem.readFromAshmem(bytes.length, 0), bytes);
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01700---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01800
         * @tc.name    The writetoashmem interface writes the shared data associated with the object minimum boundary crossing file
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_01800", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01800---------------------------");
            try {
                let mapSize = 4096;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [-2147483649, 2147483647];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertTrue();
                let readresult = ashmem.readFromAshmem(bytes.length, 0);
                expect(readresult[0]).assertEqual(2147483647);
                expect(readresult[1]).assertEqual(bytes[1]);
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01800---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_01900
         * @tc.name    The writetoashmem interface writes the shared data associated with the object maximum boundary crossing file
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_01900", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_01900---------------------------");
            try {
                let mapSize = 4096;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [-2147483648, 2147483648];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertTrue();
                let reresult = ashmem.readFromAshmem(bytes.length, 0);
                expect(reresult[0]).assertEqual(bytes[0]);
                expect(reresult[1]).assertEqual(-2147483648);
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_01900---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02000
         * @tc.name    Writetoashmem interface: writes the boundary location to the shared file associated with the object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_02000", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02000---------------------------");
            try {
                let mapSize = 2 * M;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [0, 1];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 2147483647)).assertEqual(false);
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02000---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02100
         * @tc.name    Writetoashmem interface: writes the shared file associated with the object at the out of bounds position
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_02100", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02100---------------------------");
            try {
                let mapSize = 2 * M;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [0, 1];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 2147483648)).assertTrue();
                let readresult1 = ashmem.readFromAshmem(bytes.length, 0);
                assertArrayElementEqual(readresult1, bytes);
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02100---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02200
         * @tc.name    After the permission is set, the writetoashmem interface writes the shared file associated with the object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_02200", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02200---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [1, 2, 3, 4, 5];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertTrue();
                expect(ashmem.setProtection(rpc.Ashmem.PROT_READ)).assertTrue();
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertEqual(false);
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02200---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02300
         * @tc.name    Writetoashmem exception validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_02300", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02300---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [1, 2, 3, 4, 5];
                let size = bytes.length + 10;
                expect(ashmem.writeToAshmem(bytes, 3, 0)).assertTrue();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02300---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02400
         * @tc.name    Read data from the shared file associated with readfromashmem
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_02400", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02400---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096)
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [1, 2, 3, 4, 5];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertTrue();
                var resultRead = ashmem.readFromAshmem(bytes.length, 0);
                assertArrayElementEqual(resultRead, bytes);
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02400---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02500
         * @tc.name    Readfromashmem exception validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_02500", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02500---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [1, 2, 3, 4, 5];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 1)).assertTrue()
                let result2 = ashmem.readFromAshmem(bytes.length, 3);
                expect(bytes[2]).assertEqual(result2[0]);
                expect(bytes[3]).assertEqual(result2[1]);
                expect(bytes[4]).assertEqual(result2[2]);
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02500---------------------------");
        })


        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02600
         * @tc.name    Createashmemfromexisting copies the ashmem object description and creates a new object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_02600", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02600---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [1, 2, 3];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 1)).assertTrue()
                let newashmem = rpc.Ashmem.createAshmemFromExisting(ashmem);
                expect(newashmem.mapReadAndWriteAshmem()).assertTrue();
                assertArrayElementEqual(newashmem.readFromAshmem(bytes.length, 1), bytes);
                ashmem.closeAshmem();
                newashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02600---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02700
         * @tc.name    Create a shared memory object and call writeashmem to write the shared anonymous
          object into the messageparcel object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_02700", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02700---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
                let data = rpc.MessageParcel.create();
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [1, 2, 3];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertTrue();
                expect(data.writeAshmem(ashmem)).assertTrue();
                let retReadAshmem = data.readAshmem();
                assertArrayElementEqual(ashmem.readFromAshmem(bytes.length, 0), bytes);
                expect(retReadAshmem.readFromAshmem(bytes.length, 0) == undefined).assertTrue();
                ashmem.closeAshmem();
                data.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02700---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02800
         * @tc.name    Create a non shared memory object and call writeashmem to write the messageparcel object
          object into the messageparcel object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_02800", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02800---------------------------");
            try {
                let data = rpc.MessageParcel.create();
                let data2 = rpc.MessageParcel.create();
                expect(data.writeAshmem(data2)).assertEqual(false);
                data.reclaim();
                data2.reclaim();
            } catch (error) {
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02800---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_02900
         * @tc.name    Test the ashmem object passed by messageparcel
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_02900", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_02900---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
                expect(ashmem.setProtection(rpc.Ashmem.PROT_EXEC)).assertTrue();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_02900---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_03000
        * @tc.name    mapTypedAshmem interface creates shared file mappings
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_03000", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_03000---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", 4 * K);
                expect(ashmem != null).assertTrue();
                ashmem.mapTypedAshmem(ashmem.PROT_READ | ashmem.PROT_WRITE);
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_03000---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_03100
        * @tc.name    mapTypedAshmem exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_03100", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_03100---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", (2 * G - 1));
                expect(ashmem != null).assertTrue();
                ashmem.mapTypedAshmem(999);
                ashmem.closeAshmem();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_03100---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_03200
        * @tc.name    mapTypedAshmem exception errorcode validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_03200", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_03200---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", (2 * G));
                expect(ashmem != null).assertTrue();
                ashmem.mapTypedAshmem(ashmem.PROT_READ | ashmem.PROT_WRITE);
                ashmem.closeAshmem();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_03200---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_03300
        * @tc.name    mapReadWriteAshmem interface creates a shared file map with the protection level of read-write
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_03300", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_03300---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", K);
                ashmem.mapReadWriteAshmem();
                console.info("SUB_Softbus_RPC_Compatibility_Ashmem_03300: run mapReadWriteAshmem is success");
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_03300---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_03400
        * @tc.name    mapReadWriteAshmem exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_03400", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_03400---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", 4096);
                expect(ashmem != null).assertTrue();
                ashmem.mapTypedAshmem(rpc.Ashmem.PROT_READ);
                ashmem.unmapAshmem();
                ashmem.mapReadWriteAshmem();
                console.info("SUB_Softbus_RPC_Compatibility_Ashmem_03400: run mapReadWriteAshmem is success");
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_03400---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_03500
        * @tc.name    Mapreadonlyashmem interface creates a shared file map with the protection level of read-write
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_03500", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_03500---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", 4096);
                expect(ashmem != null).assertTrue();
                ashmem.mapReadonlyAshmem();
                console.info("SUB_Softbus_RPC_Compatibility_Ashmem_03500: run mapReadonlyAshmem is success");
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_03500---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_03600
        * @tc.name    mapReadWriteAshmem exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_03600", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_03600---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", K);
                ashmem.setProtectionType(rpc.Ashmem.PROT_WRITE);
                ashmem.setProtectionType(rpc.Ashmem.PROT_READ);
                ashmem.mapReadWriteAshmem();
                ashmem.setProtectionType(rpc.Ashmem.PROT_NONE);
                ashmem.setProtectionType(rpc.Ashmem.PROT_READ);
                console.info("SUB_Softbus_RPC_Compatibility_Ashmem_03600: run is success");
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_03600---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_03700
        * @tc.name    setProtectionType exception input parameter verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_03700", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_03700---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", K);
                expect(ashmem != null).assertTrue();
                ashmem.setProtectionType(3);
                console.info("SUB_Softbus_RPC_Compatibility_Ashmem_03700: run setProtectionType is success");
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_03700---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_03800
        * @tc.name    The writetoashmem interface writes the shared file associated with the object
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_03800", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_03800---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", 4096);
                expect(ashmem != null).assertTrue();
                ashmem.mapReadWriteAshmem();
                let bytes = [1, 2, 3, 4, 5];
                let result = ashmem.writeToAshmem(bytes, bytes.length, 0);
                expect(result).assertTrue();
                ashmem.setProtectionType(rpc.Ashmem.PROT_READ);
                let result2 = ashmem.writeToAshmem(bytes, bytes.length, 0);
                expect(result2).assertEqual(false);
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_03800---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_03900
        * @tc.name    Create a non shared memory object and call setProtectionType to write the messageparcel object
        *               object into the messageparcel object
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_03900", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_03900---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", K);
                ashmem.setProtectionType(rpc.Ashmem.PROT_EXEC);
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_03900---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_04000
        * @tc.name    Mapreadonlyashmem exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_04000", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_04000---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", K);
                expect(ashmem != null).assertTrue();
                ashmem.mapTypedAshmem(rpc.Ashmem.PROT_WRITE);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
                ashmem.mapReadonlyAshmem();
                console.info("SUB_Softbus_RPC_Compatibility_Ashmem_04000: run mapReadonlyAshmem is success");
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_04000---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_04100
        * @tc.name    createAshmem check param error Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_04100", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_04100---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("ashmem", (2 * G + 1));
                console.info("SUB_Softbus_RPC_Compatibility_Ashmem_04100: ashmem " + ashmem);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_04100---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_04200
        * @tc.name    mapReadWriteAshmem exception validation 1900001
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_04200", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_04200---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("ashmem", (4 * G - 1));
                expect(ashmem != null).assertTrue();
                ashmem.mapReadWriteAshmem();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.OS_MMAP_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_04200---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_04300
        * @tc.name    createAshmem check param error Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_04300", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_04300---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("ashmem", 0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_04300---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_04400
        * @tc.name    setProtectionType exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_04400", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_04400---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("ashmem", 1024 * 1024);
                expect(ashmem != null).assertTrue();
                ashmem.setProtectionType(0);
                console.info("SUB_Softbus_RPC_Compatibility_Ashmem_04400: run setProtectionType is success");
            } catch (error) {
                expect(error).assertEqual(null);
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_04400---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_04500
        * @tc.name    setProtectionType check param error Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_04500", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_04500---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("ashmem", 1024 * 1024);
                expect(ashmem != null).assertTrue();
                ashmem.setProtectionType(rpc.Ashmem.PROT_WRITE, rpc.Ashmem.PROT_READ);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_04500---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_04600
        * @tc.name    setProtectionType is 1900002 exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_04600", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_04600---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("ashmem", 1024 * 1024);
                expect(ashmem != null).assertTrue();
                ashmem.setProtectionType(null);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.OS_IOCTL_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_04600---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_04700
        * @tc.name    writeAshmem errCode 1900003 exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_04700", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_04700---------------------------");
            try {
                let data = rpc.MessageSequence.create();
                let data2 = rpc.MessageSequence.create();
                data.writeAshmem(data2);
                data.reclaim();
                data2.reclaim();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_TO_ASHMEM_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_04700---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_04800
        * @tc.name    readAshmem exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_04800", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_04800---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("ashmem", 1024);
                expect(ashmem != null).assertTrue();
                ashmem.mapReadWriteAshmem();
                var ByteArrayVar = [1, 2, 3, 4, 5];
                ashmem.writeAshmem(ByteArrayVar, 5, 0);
                let readResult = ashmem.readAshmem(5, 0);
                assertArrayElementEqual(readResult, ByteArrayVar);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_FROM_ASHMEM_ERROR}`;
                expect(error.code != errCode).assertEqual(null);
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_04800---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_04900
        * @tc.name    mapTypedAshmem check param error Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_04900", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_04900---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", (2 * G - 1))
                expect(ashmem != null).assertTrue();
                let result = ashmem.mapTypedAshmem(999);
                expect(result).assertEqual(false);
                ashmem.closeAshmem();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_04900---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_05000
        * @tc.name    mapTypedAshmem exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_05000", 0, function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_05000---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", (2 * G - 1))
                expect(ashmem != null).assertTrue();
                ashmem.mapTypedAshmem(999);
                ashmem.closeAshmem();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.OS_MMAP_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_05000---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_00100
         * @tc.name    Call sendrequestresult interface to send data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00100", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                var sequenceable = new MySequenceable(1, "aaa");
                expect(data.writeSequenceable(sequenceable)).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITESEQUENCEABLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let ret = new MySequenceable(0, '');
                    expect(result.reply.readSequenceable(ret)).assertTrue();
                    expect(ret.num).assertEqual(1);
                    expect(ret.str).assertEqual("aaa");
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00200---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                expect(data.writeByte(1)).assertTrue();
                expect(data.writeShort(2)).assertTrue();
                expect(data.writeInt(3)).assertTrue();
                expect(data.writeLong(10000)).assertTrue();
                expect(data.writeFloat(1.2)).assertTrue();
                expect(data.writeDouble(10.2)).assertTrue();
                expect(data.writeBoolean(true)).assertTrue();
                expect(data.writeChar(96)).assertTrue();
                expect(data.writeString("HelloWorld")).assertTrue();
                expect(data.writeSequenceable(new MySequenceable(1, "aaa"))).assertTrue();
                await gIRemoteObject.sendRequest(CODE_ALL_TYPE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(1);
                    expect(result.reply.readShort()).assertEqual(2);
                    expect(result.reply.readInt()).assertEqual(3);
                    expect(result.reply.readLong()).assertEqual(10000);
                    expect(result.reply.readFloat()).assertEqual(1.2);
                    expect(result.reply.readDouble()).assertEqual(10.2);
                    expect(result.reply.readBoolean()).assertTrue();
                    expect(result.reply.readChar()).assertEqual(96);
                    expect(result.reply.readString()).assertEqual("HelloWorld");
                    let s = new MySequenceable(0, '');
                    expect(result.reply.readSequenceable(s)).assertTrue();
                    expect(s.num).assertEqual(1);
                    expect(s.str).assertEqual("aaa");
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00300---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                expect(data.writeByte(1)).assertTrue();
                expect(data.writeShort(2)).assertTrue();
                expect(data.writeInt(3)).assertTrue();
                expect(data.writeLong(10000)).assertTrue();
                expect(data.writeFloat(1.2)).assertTrue();
                expect(data.writeDouble(10.2)).assertTrue();
                expect(data.writeBoolean(true)).assertTrue();
                expect(data.writeChar(96)).assertTrue();
                expect(data.writeString("HelloWorld")).assertTrue();
                expect(data.writeSequenceable(new MySequenceable(1, "aaa"))).assertTrue();
                function sendRequestCallback(result) {
                    try {
                        expect(result.errCode).assertEqual(0);
                        expect(result.reply.readByte()).assertEqual(1);
                        expect(result.reply.readShort()).assertEqual(2);
                        expect(result.reply.readInt()).assertEqual(3);
                        expect(result.reply.readLong()).assertEqual(10000);
                        expect(result.reply.readFloat()).assertEqual(1.2);
                        expect(result.reply.readDouble()).assertEqual(10.2);
                        expect(result.reply.readBoolean()).assertTrue();
                        expect(result.reply.readChar()).assertEqual(96);
                        expect(result.reply.readString()).assertEqual("HelloWorld");
                        let s = new MySequenceable(null, null);
                        expect(result.reply.readSequenceable(s)).assertTrue();
                        expect(s.num).assertEqual(1);
                        expect(s.str).assertEqual("aaa");
                    } finally {
                        result.data.reclaim();
                        result.reply.reclaim();
                        done();
                    }
                }
                console.info("start send request");
                await gIRemoteObject.sendRequest(CODE_ALL_TYPE, data, reply, option, sendRequestCallback);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("--------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_00300--------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_00400
         * @tc.name    Iremoteobject, register death notification verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00400", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00400---------------------------");
            try {
                let object = new TestAbilityStub("Test1");
                expect(object.addDeathRecipient(null, 0)).assertEqual(false);
                expect(object.removeDeathRecipient(null, 0)).assertEqual(false);
                expect(object.isObjectDead()).assertEqual(false);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_00400---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_00500
         * @tc.name    Do not get the server agent, do not create a remoteobject instance, and directly getcallingpid,
         *             getcallingpid, getcallingdeviceid, getlocaldeviceid
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00500", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00500---------------------------");
            try {
                expect(rpc.IPCSkeleton.getCallingPid() != null).assertTrue();
                expect(rpc.IPCSkeleton.getCallingUid() != null).assertTrue();
                expect(rpc.IPCSkeleton.getCallingDeviceID()).assertEqual("");
                expect(rpc.IPCSkeleton.getLocalDeviceID()).assertEqual("");
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_00500---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_00600
         * @tc.name    Querylocalinterface searches for objects based on descriptors
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00600", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00600---------------------------");
            try {
                let object = new TestAbilityStub("Test1");
                expect(object.isObjectDead()).assertEqual(false);
                expect(object.getCallingPid() != null).assertTrue();
                expect(object.getCallingUid() != null).assertTrue();
                object.attachLocalInterface(object, "Test1");
                expect(object.queryLocalInterface("Test1") != null).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_00600---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_00700
         * @tc.name    Getinterfacedescriptor to get the interface description
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00700---------------------------");
            try {
                let object = new TestAbilityStub("Test1223");
                expect(object.isObjectDead()).assertEqual(false);
                expect(object.getCallingPid() != null).assertTrue();
                expect(object.getCallingUid() != null).assertTrue();
                object.attachLocalInterface(object, "test1");
                expect(object.getInterfaceDescriptor() != null).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_00700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_00800
         * @tc.name    IRemoteObject sendMessageRequest API Test
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00800---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeByte(1);
                data.writeShort(2);
                data.writeInt(3);
                data.writeLong(10000);
                data.writeFloat(1.2);
                data.writeDouble(10.2);
                data.writeBoolean(true);
                data.writeChar(96);
                data.writeString("HelloWorld");
                data.writeParcelable(new MySequenceable(1, "aaa"));
                gIRemoteObject.sendMessageRequest(CODE_ALL_TYPE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(1);
                    expect(result.reply.readShort()).assertEqual(2);
                    expect(result.reply.readInt()).assertEqual(3);
                    expect(result.reply.readLong()).assertEqual(10000);
                    expect(result.reply.readFloat()).assertEqual(1.2);
                    expect(result.reply.readDouble()).assertEqual(10.2);
                    expect(result.reply.readBoolean()).assertTrue();
                    expect(result.reply.readChar()).assertEqual(96);
                    expect(result.reply.readString()).assertEqual("HelloWorld");
                    let s = new MySequenceable(0, '');
                    expect(result.reply.readParcelable(s)).assertTrue();
                    expect(s.num).assertEqual(1);
                    expect(s.str).assertEqual("aaa");
                });
            } catch (error) {
                expect(error == null).assertTrue();
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
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_00900", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_00900---------------------------");
            try {
                let object = new TestAbilityStub("TestAbilityStub")
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
                expect(data.writeInterfaceToken("TestAbilityStub")).assertTrue();
                expect(data.writeByte(2)).assertTrue();
                expect(data.writeShort(3)).assertTrue();
                expect(data.writeInt(4)).assertTrue();
                expect(data.writeLong(5)).assertTrue();
                expect(data.writeFloat(1.2)).assertTrue();
                expect(data.writeDouble(10.2)).assertTrue();
                expect(data.writeBoolean(true)).assertTrue();
                expect(data.writeChar(5)).assertTrue();
                expect(data.writeString("HelloWorld")).assertTrue();
                expect(data.writeSequenceable(new MySequenceable(1, "aaa"))).assertTrue();
                function sendRequestCallback(result) {
                    try {
                        expect(result.errCode).assertEqual(0);
                        result.reply.readException();
                        expect(result.reply.readByte()).assertEqual(2);
                        expect(result.reply.readShort()).assertEqual(3);
                        expect(result.reply.readInt()).assertEqual(4);
                        expect(result.reply.readLong()).assertEqual(5);
                        expect(result.reply.readFloat()).assertEqual(1.2);
                        expect(result.reply.readDouble()).assertEqual(10.2);
                        expect(result.reply.readBoolean()).assertTrue();
                        expect(result.reply.readChar()).assertEqual(5);
                        expect(result.reply.readString()).assertEqual("HelloWorld");
                        let s = new MySequenceable(null, null);
                        expect(result.reply.readSequenceable(s)).assertTrue();
                        expect(s.num).assertEqual(1);
                        expect(s.str).assertEqual("aaa");
                    } finally {
                        result.data.reclaim();
                        result.reply.reclaim();
                        console.info("test done");
                        done();
                    }
                }
                console.info("start send request");
                object.sendRequest(CODE_SAME_PROCESS, data, reply, option, sendRequestCallback);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_00900---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_01100
        * @tc.name    getDescriptor to get the interface description
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_01100", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_01100---------------------------");
            try {
                let object = new TestAbilityMessageStub("Test1223");
                let result = object.isObjectDead();
                expect(result == false).assertTrue();
                let callingPid = object.getCallingPid();
                expect(callingPid != null).assertTrue();
                let callingUid = object.getCallingUid();
                expect(callingUid != null).assertTrue();
                object.modifyLocalInterface(object, "test1");
                let result2 = object.getDescriptor();
                expect(result2 != null).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_01100---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_01200
        * @tc.name    Test that MessageSequence passes through the same process, and the client
        *             receives the reply message in the callback function
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_01200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_01200---------------------------");
            try {
                let object = new TestAbilityMessageStub("TestAbilityMessageStub")
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                var option = new rpc.MessageOption();
                data.writeInterfaceToken("TestAbilityMessageStub");
                data.writeByte(2);
                data.writeShort(3);
                data.writeInt(4);
                data.writeLong(5);
                data.writeFloat(1.2);
                data.writeDouble(10.2);
                data.writeBoolean(true);
                data.writeChar(5);
                data.writeString("HelloWorld");
                data.writeParcelable(new MySequenceable(1, "aaa"));
                console.info("data is success");
                function sendRequestCallback(result) {
                    try {
                        expect(result.errCode).assertEqual(0);
                        result.reply.readException();
                        expect(result.reply.readByte()).assertEqual(2);
                        expect(result.reply.readShort()).assertEqual(3);
                        expect(result.reply.readInt()).assertEqual(4);
                        expect(result.reply.readLong()).assertEqual(5);
                        expect(result.reply.readFloat()).assertEqual(1.2);
                        expect(result.reply.readDouble()).assertEqual(10.2);
                        expect(result.reply.readBoolean()).assertTrue();
                        expect(result.reply.readChar()).assertEqual(5);
                        expect(result.reply.readString()).assertEqual("HelloWorld");
                        let s = new MySequenceable(null, null);
                        expect(result.reply.readParcelable(s)).assertTrue();
                        expect(s.str).assertEqual("aaa");
                    } finally {
                        result.data.reclaim();
                        result.reply.reclaim();
                        done();
                    }
                }
                console.info("start send request");
                object.sendMessageRequest(CODE_SAME_PROCESS, data, reply, option, sendRequestCallback);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_01200---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_01300
        * @tc.name    Iremoteobject, register death notification verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_01300", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_01300---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null);
                gIRemoteObject.registerDeathRecipient(recipient, 0);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_01300---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_01400
        * @tc.name    Iremoteobject, register death notification verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0
        */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_01400", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_01400---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null);
                gIRemoteObject.registerDeathRecipient(recipient, 0);
                gIRemoteObject.unregisterDeathRecipient(recipient, 0);
                console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_01400:run unregisterDeathRecipient is done");
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_01400---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_01500
        * @tc.name    RemoteObject, registerDeathRecipient notification verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_01500", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_01500---------------------------");
            try {
                let object = new TestAbilityMessageStub("Test1");
                object.registerDeathRecipient(null, 0);
                console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_01500:run registerDeathRecipient is done");
            } catch (error) {
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_01500---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_01600
        * @tc.name    RemoteObject, unregisterDeathRecipient notification verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_01600", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_01600---------------------------");
            try {
                let object = new TestAbilityMessageStub("Test1");
                object.unregisterDeathRecipient(null, 0);
                console.info("SUB_Softbus_RPC_Compatibility_IRemoteObject_01600:run unregisterDeathRecipient result is done");
            } catch (error) {
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_01600---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00100
         * @tc.name    Call adddeathrecipient to register the death notification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00100", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00100---------------------------");
            try {
                let recipient = new MyDeathRecipient(gIRemoteObject, null);
                expect(gIRemoteObject.addDeathRecipient(recipient, 0)).assertTrue();
                expect(gIRemoteObject.addDeathRecipient(recipient, 0)).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, 0)).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, 0)).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, 0)).assertEqual(false)();
            } catch (error) {
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00100---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00200
         * @tc.name    Adddeathrecipient verifies the minimum boundary out of range value of the interface flag
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00200", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00200---------------------------");
            try {
                let recipient = new MyDeathRecipient(gIRemoteObject, null);
                expect(gIRemoteObject.addDeathRecipient(recipient, -(2 * G))).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, -(2 * G))).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00200---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00300
         * @tc.name    Adddeathrecipient verifies the maximum boundary out of range value of the interface flag
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00300", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00300---------------------------");
            try {
                let recipient = new MyDeathRecipient(gIRemoteObject, null);
                expect(gIRemoteObject.addDeathRecipient(recipient, (2 * G - 1))).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, (2 * G - 1))).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00300---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00400
         * @tc.name    Adddeathrecipient verifies the minimum boundary out of range value of the interface flag
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00400", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00400---------------------------");
            try {
                let recipient = new MyDeathRecipient(gIRemoteObject, null);
                expect(gIRemoteObject.addDeathRecipient(recipient, 2 * G)).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, 2 * G)).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00400---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00500
         * @tc.name    Adddeathrecipient verifies the maximum boundary out of range value of the interface flag
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00500", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00500---------------------------");
            try {
                let recipient = new MyDeathRecipient(gIRemoteObject, null);
                expect(gIRemoteObject.addDeathRecipient(recipient, -(2 * G + 1))).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, -(2 * G + 1))).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00500---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00600
         * @tc.name    Call isobjectdead to check whether the object is dead
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00600", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00600---------------------------");
            try {
                let recipient = new MyDeathRecipient(gIRemoteObject, null);
                expect(gIRemoteObject.isObjectDead() == false).assertTrue();
                expect(gIRemoteObject.addDeathRecipient(recipient, 0)).assertTrue();
                expect(gIRemoteObject.isObjectDead() == false).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, 0)).assertTrue();
                expect(gIRemoteObject.addDeathRecipient(recipient, 0)).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, 0)).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, 0) == false).assertTrue();
                expect(gIRemoteObject.isObjectDead() == false).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00600---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00700
         * @tc.name    Getinterfacedescriptor to get the object interface description
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00700---------------------------");
            try {
                let object = new TestAbilityStub("Test0300");
                expect(object.getInterfaceDescriptor()).assertEqual("Test0300");
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00800
         * @tc.name    Querylocalinterface searches for objects based on descriptors
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_00800---------------------------");
            try {
                let object = new TestAbilityStub("Test0400");
                expect(object.isObjectDead()).assertEqual(false);
                object.attachLocalInterface(object, "Test2");
                expect(object.queryLocalInterface('Test2') != null).assertTrue();
                expect(object.getInterfaceDescriptor() != null).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00800---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_00900
         * @tc.name    Transaction constant validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_00900", 0, async function () {
            console.info("----------------------------SUB_Softbus_RPC_Compatibility_RemoteProxy_00900 is starting-------------");
            try {
                expect(rpc.RemoteProxy.PING_TRANSACTION).assertEqual(1599098439);
                expect(rpc.RemoteProxy.DUMP_TRANSACTION).assertEqual(1598311760);
                expect(rpc.RemoteProxy.INTERFACE_TRANSACTION).assertEqual(1598968902);
                expect(rpc.RemoteProxy.MIN_TRANSACTION_ID).assertEqual(0x1);
                expect(rpc.RemoteProxy.MAX_TRANSACTION_ID).assertEqual(0x00FFFFFF);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_00900---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_01000
        * @tc.name    Call isobjectdead to check whether the object is dead
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_01000", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_01000---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null)
                var isDead = gIRemoteObject.isObjectDead();
                expect(isDead == false).assertTrue();
                gIRemoteObject.registerDeathRecipient(recipient, 0)
                var isDead1 = gIRemoteObject.isObjectDead();
                expect(isDead1 == false).assertTrue();
                gIRemoteObject.unregisterDeathRecipient(recipient, 0)
                gIRemoteObject.registerDeathRecipient(recipient, 0)
                gIRemoteObject.unregisterDeathRecipient(recipient, 0)
                gIRemoteObject.unregisterDeathRecipient(recipient, 0)
                var isDead2 = gIRemoteObject.isObjectDead();
                expect(isDead2 == false).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_01000---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_01100
        * @tc.name    getDescriptor to get the object interface description
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_01100", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_01100---------------------------");
            try {
                let object = new TestAbilityStub("Test0300");
                let result = object.getDescriptor();
                expect(result).assertEqual("Test0300");
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_01100---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_01200
        * @tc.name    getLocalInterface searches for objects based on descriptors
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_01200", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_01200---------------------------");
            try {
                let object = new TestAbilityStub("Test0400");
                let result = object.isObjectDead();
                expect(result).assertEqual(false);
                object.modifyLocalInterface(object, "Test2");
                let res2 = object.getLocalInterface('Test2');
                expect(res2 != null).assertTrue();
                let resultDescrip = object.getDescriptor();
                expect(resultDescrip != null).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_01200---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_01300
        * @tc.name    Call registerDeathRecipient to register the death notification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_01300", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_01300---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null);
                gIRemoteObject.registerDeathRecipient(recipient, 0);
                gIRemoteObject.registerDeathRecipient(recipient, 0);
                gIRemoteObject.unregisterDeathRecipient(recipient, 0);
                gIRemoteObject.unregisterDeathRecipient(recipient, 0);
                gIRemoteObject.unregisterDeathRecipient(recipient, 0);
                console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_01300: unregisterDeathRecipient2 is success");
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_01300---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_01400
        * @tc.name    registerDeathRecipient Validates the interface flags input parameter boundary value
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_01400", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_01400---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null);
                gIRemoteObject.registerDeathRecipient(recipient, -(2 * G));
                gIRemoteObject.unregisterDeathRecipient(recipient, -(2 * G));
                console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_01400: unregisterDeathRecipient2 is success");
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_01400---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_01500
        * @tc.name    registerDeathRecipient Validates the interface flags input parameter boundary value
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_01500", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_01500---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null);
                gIRemoteObject.registerDeathRecipient(recipient, (2 * G - 1));
                gIRemoteObject.unregisterDeathRecipient(recipient, (2 * G - 1));
                console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_01500: unregisterDeathRecipient2 is success");
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_01500---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_01600
        * @tc.name    registerDeathRecipient Validates the interface flags input parameter boundary value
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_01600", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_01600---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null);
                gIRemoteObject.registerDeathRecipient(recipient, 2 * G);
                gIRemoteObject.unregisterDeathRecipient(recipient, 2 * G);
                console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_01600: unregisterDeathRecipient2 is success");
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_01600---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_01700
        * @tc.name    registerDeathRecipient Validates the interface flags input parameter boundary value
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_01700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_01700---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null);
                gIRemoteObject.registerDeathRecipient(recipient, -(2 * G + 1));
                gIRemoteObject.unregisterDeathRecipient(recipient, -(2 * G + 1));
                console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_01700: unregisterDeathRecipient is success");
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_01700---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_01800
        * @tc.name    getLocalInterface 1900005 searches for objects based on descriptors
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_01800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_01800---------------------------");
            try {
                let object = new TestAbilityStub("Test0400");
                let result = object.isObjectDead();
                expect(result).assertEqual(false);
                object.modifyLocalInterface(object, "Test2");
                console.info("SUB_Softbus_RPC_Compatibility_RemoteProxy_01800: run modifyLocalInterface success");
                object.getLocalInterface(null);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.ONLY_PROXY_OBJECT_PERMITTED_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_01800---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00100
         * @tc.name    Create exception object and verify the function of flushcommands interface
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_Softbus_RPC_Compatibility_IPCSkeleton_00100', 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00100---------------------------");
            try {
                let remoteObject = new TestRemoteObject("aaa");
                expect(rpc.IPCSkeleton.flushCommands(remoteObject)).assertEqual(101);
            }
            catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00100---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00200
         * @tc.name    Establish constructor object and verify the function of flushcommands interface
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it('SUB_Softbus_RPC_Compatibility_IPCSkeleton_00200', 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00200---------------------------");
            try {
                let remoteObject = {};
                expect(rpc.IPCSkeleton.flushCommands(remoteObject)).assertEqual(101);
            }
            catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00200---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00300
         * @tc.name    Create object, getContextObject interface function verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_Softbus_RPC_Compatibility_IPCSkeleton_00300', 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00300---------------------------");
            try {
                let samgr = rpc.IPCSkeleton.getContextObject();
                expect(samgr != null).assertTrue();
            }
            catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00300---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00400
         * @tc.name    Call getCallingPid, getCallingUid to get the local value
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_Softbus_RPC_Compatibility_IPCSkeleton_00400', 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00400---------------------------");
            try {
                expect(rpc.IPCSkeleton.getCallingPid() != null).assertTrue();
                expect(rpc.IPCSkeleton.getCallingUid() != null).assertTrue();
            }
            catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00400---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00500
         * @tc.name    Call getlocaldeviceid, getcallingdeviceid to get the local value
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_Softbus_RPC_Compatibility_IPCSkeleton_00500', 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00500---------------------------");
            try {
                expect(rpc.IPCSkeleton.getLocalDeviceID() != null).assertTrue();
                expect(rpc.IPCSkeleton.getCallingDeviceID() != null).assertTrue();
            }
            catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00500---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00600
         * @tc.name    Do not get the server agent, do not create a remoteobject instance, and directly getcallingpid,
         *             getcallingpid, getcallingdeviceid, getlocaldeviceid
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_Softbus_RPC_Compatibility_IPCSkeleton_00600', 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00600---------------------------");
            try {
                expect(rpc.IPCSkeleton.getCallingPid() != null).assertTrue();
                expect(rpc.IPCSkeleton.getCallingUid() != null).assertTrue();
                expect(rpc.IPCSkeleton.getCallingTokenId() != null).assertTrue();
                expect(rpc.IPCSkeleton.getLocalDeviceID() != null).assertTrue();
                expect(rpc.IPCSkeleton.getCallingDeviceID() != null).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00600---------------------------");
        })

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00700
         * @tc.name    Test the getcallingpid and getcallinguid basic methods of ipcskeleton
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00700", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00700---------------------------");
            try {
                let callingPid = rpc.IPCSkeleton.getCallingPid();
                let callingUid = rpc.IPCSkeleton.getCallingUid();
                let option = new rpc.MessageOption();
                let data = rpc.MessageParcel.create();
                let reply = rpc.MessageParcel.create();
                expect(data.writeInterfaceToken("rpcTestAbility")).assertTrue();
                expect(callingUid != null).assertTrue();
                expect(callingPid != null).assertTrue();
                await gIRemoteObject.sendRequest(CODE_IPCSKELETON, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                    expect(result.reply.readInt()).assertEqual(callingPid);
                    expect(result.reply.readInt()).assertEqual(callingUid);
                })
                data.reclaim();
                reply.reclaim();
                done();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00700---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00800
         * @tc.name    Basic method of testing ipcskeleton
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00800", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00800---------------------------");
            try {
                let callingPid = rpc.IPCSkeleton.getCallingPid();
                let callingUid = rpc.IPCSkeleton.getCallingUid();
                let option = new rpc.MessageOption();
                let data = rpc.MessageParcel.create();
                let reply = rpc.MessageParcel.create();
                expect(data.writeInterfaceToken("rpcTestAbility")).assertTrue();
                await gIRemoteObject.sendRequest(CODE_IPCSKELETON_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                    expect(result.reply.readInt()).assertEqual(callingPid);
                    expect(result.reply.readInt()).assertEqual(callingUid);
                    expect(result.reply.readInt()).assertEqual(callingPid);
                    expect(result.reply.readInt()).assertEqual(callingUid);
                    expect(result.reply.readInt()).assertEqual(callingPid);
                    expect(result.reply.readInt()).assertEqual(callingUid);
                    expect(result.reply.readInt()).assertEqual(101);
                });
                data.reclaim();
                reply.reclaim();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00800---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_00900
         * @tc.name    Setcallingidentity interface flag input parameter is null authentication
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   0
         */
        it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_00900", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_00900---------------------------");
            try {
                let id = "";
                expect(rpc.IPCSkeleton.setCallingIdentity(id)).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_00900---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_01000
         * @tc.name    Setcallingidentity interface flag input parameter is 0 authentication
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01000", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_01000---------------------------");
            try {
                let id = 0;
                expect(rpc.IPCSkeleton.setCallingIdentity(id)).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_01000---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_01100
         * @tc.name    Setcallingidentity interface flag input parameter is boundary value authentication
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01100", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_01100---------------------------");
            try {
                var id = "";
                for (let i = 0; i < (40 * K - 1); i++) {
                    id += "a";
                }
                expect(rpc.IPCSkeleton.setCallingIdentity(id)).assertTrue();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_01100---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_01200
         * @tc.name    Basic method of verifying ipcskeleton
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01200", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_01200---------------------------");
            try {
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
                await gIRemoteObject.sendRequest(CODE_IPCSKELETON, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                    expect(result.reply.readInt()).assertEqual(callingPid);
                    expect(result.reply.readInt()).assertEqual(callingUid);
                    expect(result.reply.readString() != null).assertTrue();
                    expect(result.reply.readString() != null).assertTrue();
                    expect(result.reply.readBoolean()).assertEqual(false);
                    expect(result.reply.readInt()).assertEqual(callingPid);
                    expect(result.reply.readInt()).assertEqual(callingUid);
                    expect(result.reply.readInt()).assertEqual(callingPid);
                    expect(result.reply.readInt()).assertEqual(callingUid);
                    expect(result.reply.readInt()).assertEqual(101);
                })
                data.reclaim();
                reply.reclaim();
                done();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_01200---------------------------");
        });

        /*
         * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_01300
         * @tc.name    IPCSkeleton sendMessageRequest API test
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01300", 0, async function (done) {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_01300---------------------------");
            try {
                let callingPid = rpc.IPCSkeleton.getCallingPid();
                let callingUid = rpc.IPCSkeleton.getCallingUid();
                expect(callingUid != null).assertTrue();
                expect(callingPid != null).assertTrue();
                let option = new rpc.MessageOption();
                let data = rpc.MessageSequence.create();
                let reply = rpc.MessageSequence.create();
                data.writeInterfaceToken("rpcTestAbility");
                await gIRemoteObject.sendMessageRequest(CODE_IPCSKELETON, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                    expect(result.reply.readInt()).assertEqual(callingPid);
                    expect(result.reply.readInt()).assertEqual(callingUid);
                })
                data.reclaim();
                reply.reclaim();
                done();
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_01300---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_01400
        * @tc.name    Create an empty object and verify the function of the flushCmdBuffer interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01400", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_01400---------------------------");
            try {
                let remoteObject = new TestRemoteObject("aaa");
                let ret = rpc.IPCSkeleton.flushCmdBuffer(remoteObject);
                console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01400 RpcServer: flushCmdBuffer is success");
            }
            catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_01400---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_01500
        * @tc.name    Create an null object and verify the function of the flushCmdBuffer interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01500", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_01500---------------------------");
            try {
                let remoteObject = {};
                let ret = rpc.IPCSkeleton.flushCmdBuffer(remoteObject);
                console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01500 RpcServer: flushCmdBuffer is success");
            }
            catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_01500---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_01600
        * @tc.name    Basic method of testing ipcskeleton Communication failed
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01600", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_01600---------------------------");
            try {
                let object = rpc.IPCSkeleton.getContextObject();
                object.getDescriptor();
                console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01600: is success");
            } catch (error) {
                let errCode = `${rpc.ErrorCode.COMMUNICATION_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code == errCode).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_01600---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_01700
        * @tc.name    Create an empty object and verify the function of the flushCmdBuffer interface Only remote object permitted.
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01700", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_01700---------------------------");
            try {
                let remoteObject = null;
                rpc.IPCSkeleton.flushCmdBuffer(remoteObject);
                console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01700 RpcServer: flushCmdBuffer is success");
            }
            catch (error) {
                let errCode = `${rpc.ErrorCode.ONLY_REMOTE_OBJECT_PERMITTED_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code != errCode).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_01700---------------------------");
        })

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_01800
        * @tc.name    restoreCallingIdentity Interface flags input parameter boundary value verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01800", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_01800---------------------------");
            try {
                let id = "";
                rpc.IPCSkeleton.restoreCallingIdentity(id);
                console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01800 restoreCallingIdentity is success");
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_01800---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_01900
        * @tc.name    restoreCallingIdentity Interface flags input parameter 0 value verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01900", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_01900---------------------------");
            try {
                let id = 0;
                rpc.IPCSkeleton.restoreCallingIdentity(id);
                console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_01900 restoreCallingIdentity is success");
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_01900---------------------------");
        });

        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_IPCSkeleton_02000
        * @tc.name    restoreCallingIdentity Interface flags input parameter null value verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_IPCSkeleton_02000", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IPCSkeleton_02000---------------------------");
            try {
                let id = "";
                for (let i = 0; i < (40 * K - 1); i++) {
                    id += "a";
                }
                rpc.IPCSkeleton.restoreCallingIdentity(id);
                console.info("SUB_Softbus_RPC_Compatibility_IPCSkeleton_02000 restoreCallingIdentity is success");
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IPCSkeleton_02000---------------------------");
        });
        console.info("-----------------------SUB_Softbus_RPC_Compatibility_MessageParce_Test is end-----------------------");
    });
}