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
        console.info("-----------------------SUB_DSoftbus_RPC_API_MessageParce_Test is starting-----------------------");

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
        let testservice = null

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
                setTimeout(function () {
                    _checkResult(_num, _str);
                }, 2 * 1000);
                console.info("result:" + result);
                return result
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
                setTimeout(function () {
                    _done();
                }, 1000);
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
                setTimeout(function () {
                    _done();
                }, 1000);
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
                let driver = await UiDriver.create();
                console.info(` come in driveFn`);
                console.info(`driver is ${JSON.stringify(driver)}`);
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
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0010
        * @tc.name    Call the writeinterfacetoken interface, write the interface descriptor, and read interfacetoken
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0010", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0010---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInterfaceToken()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0010 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0010---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0020
        * @tc.name    The writeInterfaceToken interface is looping, the interface descriptor is written, and the 
        *               InterfaceToken is read
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0020", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0020---------------------------");
            try {
                for (let i = 0; i < 5; i++) {
                    var data = rpc.MessageSequence.create();
                    var reply = rpc.MessageSequence.create();
                    let option = new rpc.MessageOption();
                    let token = "hello ruan zong xian";
                    data.writeInterfaceToken(token);
                    expect(gIRemoteObject != undefined).assertTrue();
                    await gIRemoteObject.sendMessageRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
                        expect(result.errCode).assertEqual(0);
                        expect(result.reply.readInterfaceToken()).assertEqual(token);
                    });
                }
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0020 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0020---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0030
        * @tc.name    Call the WriteInterfaceToken interface, write the maximum length interface descriptor, and read 
        *               the InterfaceToken
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0030", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0030---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = "";
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
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0030 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0030---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0040
        * @tc.name    The WriteInterfaceToken interface is called, the exceeding-length interface descriptor is written,
        *               and the InterfaceToken is read
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0040", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0040---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = "";
                for (let i = 0; i < 40 * K; i++) {
                    token += 'a';
                }
                data.writeInterfaceToken(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0040 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0040---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0050
        * @tc.name    Call the writeinterfacetoken interface to write a non string interface descriptor 
        *           and read interfacetoken
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0050", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0050---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = 123;
                data.writeInterfaceToken(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0050 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0050---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0060
        * @tc.name    Call the writeshortarray interface, write the array to the MessageSequence instance,
        *             and call readshortarray to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0060", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0060---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wShortArryData = [-1, 0, 1];
                data.writeShortArray(wShortArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readShortArray(), wShortArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0060 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0060---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0070
        * @tc.name    Call the writeshortarray interface, write the short integer array to the MessageSequence instance,
        *             and call readshortarray (datain: number []) to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0070", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0070---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wShortArryData = [];
                for (let i = 0; i < (50 * 1024 - 1); i++) {
                    wShortArryData[i] = 1;
                }
                data.writeShortArray(wShortArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rShortArryData = [];
                    result.reply.readShortArray(rShortArryData);
                    assertArrayElementEqual(rShortArryData, wShortArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0070 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0070---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0080
        * @tc.name    Writeshortarray interface, boundary value verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0080", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0080---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wShortArryData = [-32768, 0, 1, 2, 32767];
                data.writeShortArray(wShortArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readShortArray(), wShortArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0080 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0080---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0090
        * @tc.name    Writeshortarray interface, illegal value validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0090", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0090---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let eShortArryData = [-32769, 32768];
                data.writeShortArray(eShortArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let erShortArryData = [32767, -32768];
                    assertArrayElementEqual(result.reply.readShortArray(), erShortArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0090 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0090---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0100
        * @tc.name    Writeshortarray interface, transmission length verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0100", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0100---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let eShortArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    eShortArryData[i] = 1;
                };
                data.writeShortArray(eShortArryData);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0100 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0100---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0110
        * @tc.name    Call the writelongarray interface, write the long integer array to the MessageSequence instance,
        *             and call readlongarray to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0110", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0110---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wLongArryData = [3276826, 123456, 9999999];
                data.writeLongArray(wLongArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readLongArray(), wLongArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0110 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0110---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0120
        * @tc.name    Call the writelongarray interface, write the long integer array to the MessageSequence instance,
        *             and call readlongarray (datain: number []) to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0120", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0120---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wLongArryData = [];
                for (let i = 0; i < (25 * K - 1); i++) {
                    wLongArryData[i] = 11;
                };
                data.writeLongArray(wLongArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rLongArryData = [];
                    result.reply.readLongArray(rLongArryData);
                    assertArrayElementEqual(rLongArryData, wLongArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0120 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0120---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0130
        * @tc.name    Writelongarray interface, boundary value verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0130", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0130---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wLongArryData = [-9007199254740992, 0, 1, 2, 9007199254740991];
                data.writeLongArray(wLongArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rLongArryData = [];
                    result.reply.readLongArray(rLongArryData);
                    assertArrayElementEqual(rLongArryData, wLongArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0130 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0130---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0140
        * @tc.name    Writelongarray interface, long type precision verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0140", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0140---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wLongArryData = [-9999999999999999, 9999999999999999];
                data.writeLongArray(wLongArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rLongArryData = result.reply.readLongArray();
                    let newlongdata = [-10000000000000000, 10000000000000000];
                    expect(rLongArryData[0]).assertEqual(newlongdata[0]);
                    expect(rLongArryData[1]).assertEqual(newlongdata[1]);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0140 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0140---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0150
        * @tc.name    Writelongarray Indicates an interface for verifying the input length
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0150", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0150---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let wLongArryData = [];
                for (let i = 0; i < 25 * K; i++) {
                    wLongArryData[i] = 11;
                };
                data.writeLongArray(wLongArryData);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0150 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0150---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0160
        * @tc.name    Call the writedoublearray interface, write the array to the MessageSequence instance,
        *             and call readdoublearra to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0160", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0160---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wDoubleArryData = [1.2, 235.67, 99.76];
                data.writeDoubleArray(wDoubleArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readDoubleArray(), wDoubleArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0160 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0160---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0170
        * @tc.name    Call the writedoublearray interface, write the array to the MessageSequence instance,
        *             and call readdoublearra (datain: number []) to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0170", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0170---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wDoubleArryData = [];
                for (let i = 0; i < (25 * K - 1); i++) {
                    wDoubleArryData[i] = 11.1;
                };
                data.writeDoubleArray(wDoubleArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rDoubleArryData = [];
                    result.reply.readDoubleArray(rDoubleArryData);
                    assertArrayElementEqual(rDoubleArryData, wDoubleArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0170 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0170---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0180
        * @tc.name    Writedoublearray interface, boundary value verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0180", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0180---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wDoubleArryData = [4.9E-324, 235.67, 1.79E+308];
                data.writeDoubleArray(wDoubleArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readDoubleArray(), wDoubleArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0180 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0180---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0190
        * @tc.name    Writedoublearray interface, illegal value validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0190", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0190---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let eDoubleArryData = [(4.9E-324) - 1, (1.79E+308) + 1];
                data.writeDoubleArray(eDoubleArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rDoubleArryData = result.reply.readDoubleArray();
                    expect(rDoubleArryData[0]).assertEqual(-1);
                    expect(rDoubleArryData[1]).assertEqual(1.79e+308);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0190 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0190---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0200
        * @tc.name    Writedoublearray interface, Out-of-bounds value verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0200", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0200---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let eDoubleArryData = [];
                for (let i = 0; i < 25 * K; i++) {
                    eDoubleArryData[i] = 11.1;
                }
                data.writeDoubleArray(eDoubleArryData);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0200 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0200---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0210
        * @tc.name    Call the writebooleanarray interface, write the array to the MessageSequence instance,
        *             and call readbooleanarray to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0210", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0210---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wBooleanArryData = [true, false, false];
                data.writeBooleanArray(wBooleanArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readBooleanArray(), wBooleanArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0210 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0210---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0220
        * @tc.name    Call the writebooleanarray interface, write the array to the MessageSequence instance,
        *             and call readbooleanarray (datain: number []) to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0220", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0220---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wBooleanArryData = [];
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
                    let rBooleanArryData = [];
                    result.reply.readBooleanArray(rBooleanArryData);
                    assertArrayElementEqual(rBooleanArryData, wBooleanArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0220 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0220---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0230
        * @tc.name    Writebooleanarray interface, illegal value validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0230", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0230---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let errorBooleanArryData = [true, 9, false];
                data.writeBooleanArray(errorBooleanArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let eCharArrayData = [true, false, false];
                    assertArrayElementEqual(result.reply.readBooleanArray(), eCharArrayData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0230 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0230---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0240
        * @tc.name    Writebooleanarray Interface for length verification of input parameters
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0240", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0240---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let wBooleanArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    if (i % 2 == 0) {
                        wBooleanArryData[i] = false;
                    } else {
                        wBooleanArryData[i] = true;
                    };
                }
                data.writeBooleanArray(wBooleanArryData);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0240 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0240---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0250
        * @tc.name    Call the writechararray interface, write the array to the MessageSequence instance,
        *             and call readchararray to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0250", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0250---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wCharArryData = [0, 97, 255];
                data.writeCharArray(wCharArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readCharArray(), wCharArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0250 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0250---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0260
        * @tc.name    Call the writechararray interface, write the array to the MessageSequence instance,
        *             and call readchararray (datain: number []) to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0260", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0260---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wCharArryData = [];
                for (let i = 0; i < (50 * K - 1); i++) {
                    wCharArryData[i] = 96;
                };
                data.writeCharArray(wCharArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rCharArryData = [];
                    result.reply.readCharArray(rCharArryData);
                    assertArrayElementEqual(rCharArryData, wCharArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0260 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0260---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0270
        * @tc.name    Writechararray interface, illegal value validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0270", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0270---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let errorCharArryData = [96, 'asfgdgdtu', 97];
                data.writeCharArray(errorCharArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let eCharArrayData = [96, 0, 97];
                    let readchardata = result.reply.readCharArray();
                    assertArrayElementEqual(readchardata, eCharArrayData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0270 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0270---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0280
        * @tc.name    Writechararray Indicates the length of an interface input parameter
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0280", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0280---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let errorCharArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    errorCharArryData[i] = 96;
                };
                data.writeCharArray(errorCharArryData);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0280 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0280---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0290
        * @tc.name    Call the writestringarray interface, write the array to the MessageSequence instance,
        *             and call readstringarray (datain: number []) to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0290", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0290---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wStringArryData = ['abc', 'hello', 'beauty'];
                data.writeStringArray(wStringArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRINGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readStringArray(), wStringArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0290 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0290---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0300
        * @tc.name    Call the writestringarray interface, write the array to the MessageSequence instance,
        *             and call readstringarray() to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0300", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0300---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let wStringArryData = [];
                for (let i = 0; i < (10 * K - 1); i++) {
                    wStringArryData[i] = "heddSDF";
                };
                data.writeStringArray(wStringArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRINGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rStringArryData = [];
                    result.reply.readStringArray(rStringArryData);
                    assertArrayElementEqual(rStringArryData, wStringArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0300 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0300---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0310
        * @tc.name    Writestringarray interface, illegal value validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0310", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0310---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let errorStringArryData = ['abc', 123, 'beauty'];
                data.writeStringArray(errorStringArryData);

            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0310 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0310---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0320
        * @tc.name    writeStringArray Interface for length verification of input parameters
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0320", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0320---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let wStringArryData = [];
                for (let i = 0; i < 10 * K; i++) {
                    wStringArryData[i] = "heddSDF";
                }
                data.writeStringArray(wStringArryData);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0320 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0320---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0330
        * @tc.name    Call the writebytearray interface, write the array to the MessageSequence instance,
        *             and call readbytearray to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0330", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0330---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let ByteArraylet = [1, 2, 3, 4, 5];
                data.writeByteArray(ByteArraylet);

                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readByteArray(), ByteArraylet);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0330 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0330---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0340
        * @tc.name    Call the writebytearray interface, write the array to the MessageSequence instance,
        *             and call readbytearray (datain: number []) to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0340", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0340---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let ByteArraylet = [-128, 0, 1, 2, 127];
                data.writeByteArray(ByteArraylet);

                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let newArr = new Array(5);
                    result.reply.readByteArray(newArr);
                    assertArrayElementEqual(ByteArraylet, newArr);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0340 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0340---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0350
        * @tc.name    Writebytearray interface, boundary value verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0350", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0350---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();

                let ByteArraylet = [];
                for (let i = 0; i < (40 * K - 1); i++) {
                    ByteArraylet[i] = 1;
                }
                data.writeByteArray(ByteArraylet);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let newArr = new Array(5);
                    result.reply.readByteArray(newArr);
                    assertArrayElementEqual(newArr, ByteArraylet);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0350 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0350---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0360
        * @tc.name    Writebytearray interface, illegal value validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0360", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0360---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let ByteArraylet = [-129, 0, 1, 2, 128];
                data.writeByteArray(ByteArraylet);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let shortArryDataReply = result.reply.readByteArray();
                    expect(shortArryDataReply[0] == 127).assertTrue();
                    expect(shortArryDataReply[1] == ByteArraylet[1]).assertTrue();
                    expect(shortArryDataReply[2] == ByteArraylet[2]).assertTrue();
                    expect(shortArryDataReply[3] == ByteArraylet[3]).assertTrue();
                    expect(shortArryDataReply[4] == -128).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0360 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0360---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0370
        * @tc.name    Writebytearray Interface，input parameter length verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0370", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0370---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let ByteArraylet = [];
                for (let i = 0; i < 40 * K; i++) {
                    ByteArraylet[i] = 1;
                }
                data.writeByteArray(ByteArraylet);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0370 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0370---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0380
        * @tc.name    Call the writeintarray interface, write the array to the MessageSequence instance,
        *             and call readintarray to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0380", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0380---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let intArryData = [100, 111, 112];
                data.writeIntArray(intArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readIntArray(), intArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0380 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0380---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0390
        * @tc.name    Call the writeintarray interface, write the array to the MessageSequence instance,
        *             and call readintarray (datain: number []) to read the data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0390", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0390---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let intArryData = [];
                for (let i = 0; i < (50 * K - 1); i++) {
                    intArryData[i] = 1;
                };
                data.writeIntArray(intArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let newArr = new Array(3);
                    result.reply.readIntArray(newArr);
                    assertArrayElementEqual(newArr, intArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0390 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0390---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0400
            * @tc.name    Writeintarray interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0400", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let intArryData = [-2147483648, 0, 1, 2, 2147483647];
                data.writeIntArray(intArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readIntArray(), intArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0400 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0400---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0410
            * @tc.name    Writeintarray interface, illegal value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0410", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0410---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let intArryData = [-2147483649, 0, 1, 2, 2147483648];
                data.writeIntArray(intArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let shortArryDataReply = result.reply.readIntArray();
                    expect(shortArryDataReply[0] == 2147483647).assertTrue();
                    expect(shortArryDataReply[1] == intArryData[1]).assertTrue();
                    expect(shortArryDataReply[2] == intArryData[2]).assertTrue();
                    expect(shortArryDataReply[3] == intArryData[3]).assertTrue();
                    expect(shortArryDataReply[4] == -2147483648).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0410 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0410---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0420
            * @tc.name    Writeintarray interface, input parameter length verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0420", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0420---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let intArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    intArryData[i] = 1;
                }
                data.writeIntArray(intArryData);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0420 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0420---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0430
            * @tc.name    Call the writefloatarray interface, write the array to the MessageSequence instance,
            *             and call readfloatarray to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0430", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0430---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let floatArryData = [1.2, 1.3, 1.4];
                data.writeFloatArray(floatArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readFloatArray(), floatArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0430 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0430---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0440
            * @tc.name    Call the writefloatarray interface, write the array to the MessageSequence instance,
            *             and call readfloatarray (datain: number []) to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0440", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0440---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let floatArryData = [1.4E-45, 1.3, 3.4028235E38];
                data.writeFloatArray(floatArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let newArr = new Array(3);
                    result.reply.readFloatArray(newArr);
                    assertArrayElementEqual(newArr, floatArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0440 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0440---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0450
            * @tc.name    Writefloatarray interface, parameter boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0450", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0450---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let floatArryData = [(1.4E-45) - 1, 1.3, (3.4028235E38) + 1];
                data.writeFloatArray(floatArryData);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let newArr = result.reply.readFloatArray();
                    expect(newArr[0]).assertEqual(-1);
                    expect(newArr[1]).assertEqual(1.3);
                    expect(newArr[2]).assertEqual(3.4028235e+38);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0450 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0450---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0460
            * @tc.name    Writefloatarray interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0460", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0460---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let floatArryData = [];
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
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0460 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0460---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0470
            * @tc.name    Writefloatarray interface, Longest array verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0470", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0470---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let floatArryData = [];
                for (let i = 0; i < (25 * K); i++) {
                    floatArryData[i] = 1.1;
                };
                data.writeFloatArray(floatArryData);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0470 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0470---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0480
            * @tc.name    Call the writeShort interface to write the short integer data to the MessageSequence instance,
            *             and call readshort to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0480", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0480---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let short = 8;
                data.writeShort(short);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readShort(), short);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0480 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0480---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0490
            * @tc.name    WriteShort interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0490", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0490---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
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
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0490 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0490---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0500
            * @tc.name    WriteShort interface, Boundary value minimum value out of bounds verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0500", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                data.writeShort(-32769);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readShort() == 32767).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0500 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0500---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0510
            * @tc.name    WriteShort interface, Boundary value maximum value out of bounds verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0510", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0510---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                data.writeShort(32768);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readShort() == -32768).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0510 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0510---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0520
            * @tc.name    Call writelong interface to write long integer data to MessageSequence instance
            *             and call readlong to read data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0520", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0520---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let long = 9007199254740991;
                data.writeLong(long);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readLong()).assertEqual(long);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0520 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0520---------------------------");
        });


        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0530
            * @tc.name    Writelong interface, Verification of maximum accuracy value
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0530", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0530---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let long = -9007199254740992;
                data.writeLong(long);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readLong() == long).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0530 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0530---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0540
            * @tc.name    Writelong interface, Minimum loss accuracy verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0540", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0540---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let long = -9223372036854775300;
                data.writeLong(long);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readLong()).assertEqual(-9223372036854776000);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0540 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0540---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0550
            * @tc.name    Writelong interface, Maximum loss accuracy verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0550", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0550---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let short = 9223372036854775300;
                data.writeLong(short);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let readlong = result.reply.readLong();
                    expect(readlong != 0).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0550 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0550---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0560
            * @tc.name    Call the parallel interface to read and write data to the double instance
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0560", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0560---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = 4.9E-324;
                data.writeDouble(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readDouble()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0560 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0560---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0570
            * @tc.name    Writedouble interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0570", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0570---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = 1.79E+308;
                data.writeDouble(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readDouble()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0570 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0570---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0580
            * @tc.name    Writedouble interface, Minimum boundary value out of bounds verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0580", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0580---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = (4.9E-324) - 1;
                data.writeDouble(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readDouble()).assertEqual(-1);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0580 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0580---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0590
            * @tc.name    Writedouble interface, illegal value validation
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0590", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0590---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = "1.79E+465312156";
                data.writeDouble(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0590 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0590---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0600
            * @tc.name    Invoke the writeboolean interface to write the data true to the MessageSequence 
            *               instance and invoke the readboolean interface to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0600", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = true;
                data.writeBoolean(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BOOLEAN, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readBoolean()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0600 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0600---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0610
            * @tc.name    Call the writeboolean interface to write the data to the MessageSequence instance,
            *             and call readboolean to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0610", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0610---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = false;
                data.writeBoolean(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BOOLEAN, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readBoolean()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0610 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0610---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0620
            * @tc.name    Writeboolean interface, illegal value number type verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0620", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0620---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                data.writeBoolean(9);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0620 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0620---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0630
            * @tc.name    Writeboolean interface, illegal value string type verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0630", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0630---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = "true";
                data.writeBoolean(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0630 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0630---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0640
            * @tc.name    Call the writechar interface to write the minimum data to the MessageSequence instance,
            *               and call readchar to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0640", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0640---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = 0;
                data.writeChar(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0640 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0640---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0650
            * @tc.name    Call the writechar interface to write the maximum data to the MessageSequence instance,
            *              and call readchar to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0650", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0650---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = 255;
                data.writeChar(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0650 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0650---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0660
            * @tc.name    Call the writechar interface to write the minimum out of range data to the MessageSequence instance,
            *              and call readchar to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0660", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0660---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = -1;
                data.writeChar(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(255);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0660 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0660---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0670
            * @tc.name    Call the writechar interface to write the maximum out of range data to the MessageSequence instance,
            *              and call readchar to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0670", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0670---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = 256;
                data.writeChar(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(0);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0670 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0670---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0680
            * @tc.name    Writechar interface, illegal value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0680", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0680---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = 'ades';
                data.writeChar(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0680 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0680---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0690
            * @tc.name    Call the writestring interface to write the data to the MessageSequence instance,
            *             and call readstring() to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0690", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0690---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = '';
                for (let i = 0; i < (40 * K - 1); i++) {
                    token += 'a';
                }
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0690 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0690---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0700
            * @tc.name    Writestring interface Maximum data out of range verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0700", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = '';
                for (let i = 0; i < 40 * K; i++) {
                    token += 'a';
                }
                data.writeString(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0700 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0700---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0710
            * @tc.name    Writestring interface, illegal value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0710", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0710---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = 123;
                data.writeString(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0710 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0710---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0720
            * @tc.name    Call the writebyte interface to write data to the MessageSequence instance,
            *             and call readbyte to read data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0720", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0720---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = 2;
                data.writeByte(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0720 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0720---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0730
            * @tc.name    Writebyte interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0730", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0730---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
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
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0730 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0730---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0740
            * @tc.name    Writebyte interface, Maximum boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0740", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0740---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                data.writeByte(-129);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(127);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0740 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0740---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0750
            * @tc.name    Writebyte interface, Minimum boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0750", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0750---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                data.writeByte(128);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(-128);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0750 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0750---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0760
            * @tc.name    Writebyte interface, illegal value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0760", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0760---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                data.writeByte("error");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0760 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0760---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0770
            * @tc.name    Call the writeint interface to write the data to the MessageSequence instance,
            *             and call readint to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0770", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0770---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = 2;
                data.writeInt(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0770 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0770---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0780
            * @tc.name    Writeint interface, boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0780", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0780---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
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
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0780 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0780---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0790
            * @tc.name    Writeint interface, Verification of minimum boundary overrun value
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0790", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0790---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                data.writeInt(-2147483649);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(2147483647);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0790 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0790---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0800
            * @tc.name    Writeint interface, Verification of maximum boundary overrun value
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0800", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0800---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                data.writeInt(2147483648);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(-2147483648);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0800 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0800---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0810
            * @tc.name    Writeint interface, illegal value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0810", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0810---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                data.writeInt("error");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0810 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0810---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0820
            * @tc.name    Call the writefloat interface to write data to the MessageSequence instance,
            *             and call readfloat to read data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0820", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0820---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = 2.2;
                data.writeFloat(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0820 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0820---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0830
            * @tc.name    Writefloat interface, Minimum boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0830", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0830---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = 1.4E-45;
                data.writeFloat(token);

                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0830 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0830---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0840
            * @tc.name    Writefloat interface, Maximum boundary value verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0840", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0840---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = 3.4028235E38;
                data.writeFloat(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0840 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0840---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0850
            * @tc.name    Writefloat interface, Verification of maximum boundary overrun value
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0850", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0850---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = (3.4028235E38) + 1;
                data.writeFloat(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(3.4028235e+38);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0850 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0850---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0860
            * @tc.name    Writefloat interface, Verification of minimum boundary overrun value
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0860", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0860---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = (1.4E-45) - 1;
                data.writeFloat(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(-1);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0860 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0860---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0870
            * @tc.name    Writefloat interface, illegal value validation
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0870", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0870---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = 'a';
                data.writeFloat(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0870 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0870---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0880
        * @tc.name    Call the getRawDataCapacity interface to get the maximum amount of raw data that a MessageSequence 
        *               can hold
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0880", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0880---------------------------");
            try {
                var parcel = new rpc.MessageSequence();
                var reply = new rpc.MessageSequence();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0880 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                parcel.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0880---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0890
        * @tc.name    Test MessageSequence to deliver rawdata data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0890", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0890---------------------------");
            try {
                var parcel = new rpc.MessageSequence();
                var reply = new rpc.MessageSequence();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0890 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                parcel.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0890---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0900
        * @tc.name    Test MessageSequence to pass abnormal rawdata data, and expand the capacity for verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0900", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0900---------------------------");
            try {
                var parcel = new rpc.MessageSequence();
                var reply = new rpc.MessageSequence();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0900 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                parcel.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0900---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0910
        * @tc.name    Test MessageSequence to pass exception rawdata data data interception verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0910", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0910---------------------------");
            try {
                var parcel = new rpc.MessageSequence();
                var reply = new rpc.MessageSequence();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0910 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                parcel.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0910---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0920
        * @tc.name    Test MessageSequence to deliver out-of-bounds RawData data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0920", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0920---------------------------");
            try {
                var parcel = new rpc.MessageSequence();
                var reply = new rpc.MessageSequence();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0920 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                parcel.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0920---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0930
        * @tc.name    Test MessageSequence to deliver illegal RawData data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0930", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0930---------------------------");
            try {
                var parcel = new rpc.MessageSequence();
                let arr = ["aaa", 1, 2, 3];
                parcel.writeInt(arr.length);
                parcel.writeRawData(arr, arr.length);
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0930 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                parcel.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0930---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0940
        * @tc.name    Call the writeremoteobject interface to serialize the remote object
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0940", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0940---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let testRemoteObject = new TestRemoteObject("testObject");
                data.writeRemoteObject(testRemoteObject);
                expect(data.readRemoteObject() != null).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0940 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0940---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0950
        * @tc.name    Invoke the writeremoteobject interface to serialize a remote object and transfer the object. 
        *               The object parameter is empty
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0950", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0950---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = new TestRemoteObject(null);
                data.writeRemoteObject(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0950 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0950---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0960
        * @tc.name    Call the writeremoteobject interface to serialize the remote object and pass in the empty object
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3   
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0960", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0960---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = {};
                data.writeRemoteObject(token);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.PROXY_OR_REMOTE_OBJECT_INVALID_ERROR}`;
                expect(error.code == errCode).assertTrue();
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0960: errorMessage " + error.message);
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0960---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0970
        * @tc.name    Call the writeParcelable interface to write the custom serialized
        *             object to the MessageSequence instance
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0970", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0970---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let sequenceable = new MySequenceable(1, "aaa");
                data.writeParcelable(sequenceable);
                let ret = new MySequenceable(0, "");
                data.readParcelable(ret);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0970 error: " + error);
                expect(error).assertEqual(null);
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0970---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0980
        * @tc.name    Call the writeParcelable interface to write the custom serialized
        *             object to the MessageSequence instance, Migration to read
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0980", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0980---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let sequenceable = new MySequenceable(1, "aaa");
                data.writeParcelable(sequenceable);
                let ret = new MySequenceable(1, "");
                data.readParcelable(ret);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0980 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0980---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_0990
            * @tc.name    After the server finishes processing, write noexception first before writing the result,
            *             and the client calls readexception to judge whether the server is abnormal
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_0990", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_0990---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                data.writeNoException();
                data.writeInt(6);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_NOEXCEPTION, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                    expect(result.reply.readInt()).assertEqual(6);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_0990 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_0990---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1000
            * @tc.name    If the data on the server is abnormal, the client calls readexception
            *             to judge whether the server is abnormal
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1000", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1000---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                data.writeNoException();
                data.writeInt(1232222223444);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_NOEXCEPTION, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                    expect(result.reply.readInt() != 1232222223444).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1000 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1000---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1010
            * @tc.name    Serializable object marshaling and unmarshalling test
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1010", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1010---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let sequenceable = new MySequenceable(1, "aaa");
                data.writeParcelable(sequenceable);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SEQUENCEABLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let s = new MySequenceable(null, null);
                    result.reply.readParcelable(s);
                    expect(s.str).assertEqual(sequenceable.str);
                    expect(s.num).assertEqual(sequenceable.num);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1010 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1010---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1020
            * @tc.name    Non serializable object marshaling test
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1020", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1020---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let sequenceable = new MySequenceable(1, 1);
                data.writeParcelable(sequenceable);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1020 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1020---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1030
            * @tc.name    The server did not send a serializable object, and the client was ungrouped
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1030", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1030---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let sequenceable = 10;
                data.writeInt(sequenceable);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let s = new MySequenceable(0, null);
                    result.reply.readParcelable(s);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1030 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1030---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1040
            * @tc.name    Call the writeParcelable interface to write the custom serialized object to the
            *             MessageSequence instance, and call readParcelable to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1040", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1040---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let sequenceable = new MySequenceable(2, "abc");
                data.writeParcelable(sequenceable);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SEQUENCEABLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let s = new MySequenceable(null, null);
                    result.reply.readParcelable(s);
                    expect(s.str).assertEqual(sequenceable.str);
                    expect(s.num).assertEqual(sequenceable.num);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1040 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1040---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1050
            * @tc.name    Call the writeParcelablearray interface to write the custom serialized object array (1, 2, 3) to
            *              the MessageSequence instance, and call readParcelablearray to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1050", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1050---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let sequenceable = [new MySequenceable(1, "aaa"),
                new MySequenceable(2, "bbb"), new MySequenceable(3, "ccc")];
                data.writeParcelableArray(sequenceable);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SEQUENCEABLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let s = [new MySequenceable(null, null), new MySequenceable(null, null),
                    new MySequenceable(null, null)];
                    result.reply.readParcelableArray(s);
                    for (let i = 0; i < s.length; i++) {
                        expect(s[i].str).assertEqual(sequenceable[i].str);
                        expect(s[i].num).assertEqual(sequenceable[i].num);
                    }
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1050 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1050---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1060
            * @tc.name    Call the writeParcelablearray interface to write the custom serialized object to the
            *             MessageSequence instance, and call readParcelablearray to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1060", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1060---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let sequenceable = [new MySequenceable(4, "abc"),
                new MySequenceable(5, "bcd"), new MySequenceable(6, "cef")];
                data.writeParcelableArray(sequenceable);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SEQUENCEABLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let s = [new MySequenceable(null, null),
                    new MySequenceable(null, null), new MySequenceable(null, null)];
                    result.reply.readParcelableArray(s);
                    for (let i = 0; i < s.length; i++) {
                        expect(s[i].str).assertEqual(sequenceable[i].str);
                        expect(s[i].num).assertEqual(sequenceable[i].num);
                    };
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1060 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1060---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1070
            * @tc.name    Call the writeParcelablearray interface to write the custom
            *             serialized object to the MessageSequence instance
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1070", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1070---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let sequenceable = 1;
                data.writeParcelableArray(sequenceable);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1070 error: " + error);
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1070---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1080
            * @tc.name    Call the writeremoteobjectarray interface to write the object array to the MessageSequence
            *             instance, and call readremoteobjectarray to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1080", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1080---------------------------");
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
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                data.writeInterfaceToken("rpcTestAbility");
                let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)];
                data.writeRemoteObjectArray(listeners);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_REMOTEOBJECTARRAY, data, reply, option).then((result) => {
                    console.info("SUB_DSoftbus_RPC_API_MessageSequence_1080: sendMessageRequest is " + result.errCode);
                    expect(result.errCode).assertEqual(0);
                    expect(result.code).assertEqual(CODE_WRITE_REMOTEOBJECTARRAY);
                    expect(result.data).assertEqual(data);
                    expect(result.reply).assertEqual(reply);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1080 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1080---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1090
            * @tc.name    Call the writeremoteobjectarray interface to write the object array to the MessageSequence instance,
            *             and call readremoteobjectarray (objects: iremoteobject []) to read the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1090", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1090---------------------------");
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
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                data.writeInterfaceToken("rpcTestAbility");
                let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)];
                data.writeRemoteObjectArray(listeners);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_REMOTEOBJECTARRAY, data, reply, option).then((result) => {
                    console.info("SUB_DSoftbus_RPC_API_MessageSequence_1090: sendMessageRequest is " + result.errCode);
                    expect(result.errCode == 0).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1090 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1090---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1100
            * @tc.name    Test MessageSequence to deliver the reply message received in promise across processes
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1100", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1100---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
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
                    expect(result.reply.readChar()).assertEqual(97);
                    expect(result.reply.readString()).assertEqual("HelloWorld");
                    let s = new MySequenceable(null, null);
                    result.reply.readParcelable(s);
                    expect(s.num).assertEqual(1);
                    expect(s.str).assertEqual("aaa");
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1100 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1100---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1110
            * @tc.name    Test the cross process delivery of MessageSequence and receive the reply message
            *             in the callback function
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1110", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1110---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
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
                        data.reclaim();
                        reply.reclaim();
                        done();
                    }
                }
                console.info("start send request");
                await gIRemoteObject.sendMessageRequest(CODE_ALL_TYPE, data, reply, option, sendMessageRequestCallback);

            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1110 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_MessageSequence_1110--------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1120
            * @tc.name    Test the cross process transmission of MessageSequence.
            *             After receiving the reply message in promise, read letious types of arrays in order
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1120", 0, async function (done) {
            console.info("--------------------start SUB_DSoftbus_RPC_API_MessageSequence_1120--------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
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
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1120 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1120---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1130
            * @tc.name    Test MessageSequence cross process delivery. After receiving the reply message in promise,
            *             the client constructs an empty array in sequence and reads the data from the reply message
            *             into the corresponding array
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1130", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1130---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
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
                    result.reply.readByteArray(ByteArray);
                    assertArrayElementEqual(ByteArray, [1, 2, 3]);
                    let ShortArray = new Array();
                    result.reply.readShortArray(ShortArray);
                    assertArrayElementEqual(ShortArray, [4, 5, 6]);
                    let IntArray = new Array();
                    result.reply.readIntArray(IntArray);
                    assertArrayElementEqual(IntArray, [7, 8, 9]);
                    let LongArray = new Array();
                    result.reply.readLongArray(LongArray);
                    assertArrayElementEqual(LongArray, [10, 11, 12]);
                    let FloatArray = new Array();
                    result.reply.readFloatArray(FloatArray);
                    assertArrayElementEqual(FloatArray, [1.1, 1.2, 1.3]);
                    let DoubleArray = new Array();
                    result.reply.readDoubleArray(DoubleArray);
                    assertArrayElementEqual(DoubleArray, [2.1, 2.2, 2.3]);
                    let BooleanArray = new Array();
                    result.reply.readBooleanArray(BooleanArray);
                    assertArrayElementEqual(BooleanArray, [true, true, false]);
                    let CharArray = new Array();
                    result.reply.readCharArray(CharArray);
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
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1130 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1130---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1140
            * @tc.name    Test MessageSequence to pass an object of type iremoteobject across processes
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it('SUB_DSoftbus_RPC_API_MessageSequence_1140', 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1140---------------------------");
            function checkResult(num, str) {
                expect(num).assertEqual(123);
                expect(str).assertEqual("rpcListenerTest");
                done();
            };
            try {
                let option = new rpc.MessageOption();
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let listener = new TestListener("rpcListener", checkResult);
                data.writeRemoteObject(listener);
                data.writeInt(123);
                data.writeString("rpcListenerTest");
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_REMOTEOBJECT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1140 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1140---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1150
            * @tc.name    Test MessageSequence to pass an array of iremoteobject objects across processes
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it('SUB_DSoftbus_RPC_API_MessageSequence_1150', 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1150---------------------------");
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
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1150 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1150---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1160
            * @tc.name    Test MessageSequence to pass the array of iremoteobject objects across processes. The server
            *             constructs an empty array in onremoterequest and reads it from MessageSequence
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3
            */
        it('SUB_DSoftbus_RPC_API_MessageSequence_1160', 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1160---------------------------");
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
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
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
                    });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1160 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1160---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1170
            * @tc.name    Invoke the rewindRead interface,Set 0-bit offset and read the data after offset
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1170", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1170---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1170 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1170---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1180
            * @tc.name    Invoke the rewindRead interface,Set 1-bit offset and read the data after offset
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1180", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1170---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
                data.writeInt(12);
                data.writeString("parcel");
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode == 0).assertTrue();
                    expect(result.reply.readInt()).assertEqual(12);
                    result.reply.rewindRead(1);
                    expect(result.reply.readInt()).assertEqual(0);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1180 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1180---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1190
            * @tc.name    Invoke the rewindWrite interface, Set 0-bit offset and write the data after offset
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1190", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1180---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
                data.writeInt(4);
                data.rewindWrite(0);
                data.writeInt(5);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode == 0).assertTrue();
                    expect(result.reply.readInt()).assertEqual(5);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1190 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1190---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1200
            * @tc.name    Invoke the rewindWrite interface, Set 1-bit offset and write the data after offset
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1200", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1200---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
                data.writeInt(4);
                data.rewindWrite(1);
                data.writeInt(5);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt() != 5).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1200 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1200---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1210
            * @tc.name    setCapacity Sets the storage capacity of the null MessageSequence instance. The getCapacity
                        obtains the current MessageSequence capacity
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1210", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1210---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1210 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1210---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1220
            * @tc.name    setCapacity Sets the storage capacity of the MessageSequence instance. The getCapacity
                        obtains the current MessageSequence capacity
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1220", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1220---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
                data.writeString("constant");
                data.setCapacity(100);
                expect(data.getCapacity()).assertEqual(100);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("constant");
                    expect(result.reply.getCapacity()).assertEqual(("constant".length * 2) + 8);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1220 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1220---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1230
            * @tc.name    Setcapacity test: size limit verification of MessageSequence instance
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1230", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1230---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                expect(data.getCapacity()).assertEqual(0);
                data.writeString("constant");
                let getSizedata = data.getSize();
                data.setCapacity(getSizedata + 1);
                data.setCapacity(getSizedata);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1230 error: " + error);
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code == errCode).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1230---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1240
        * @tc.name    SetCapacity Tests the storage capacity threshold of the MessageSequence instance
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1240", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1240---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
                data.writeString("constant");
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let getSizeresult = result.reply.getSize();
                    expect(result.reply.getCapacity()).assertEqual(("constant".length * 2) + 8);
                    result.reply.setCapacity(getSizeresult + 1);
                    result.reply.setCapacity(getSizeresult);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1240 error: " + error);
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code == errCode).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1240---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1250
        * @tc.name    Setcapacity test storage capacity boundary value verification of MessageSequence instance
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1250", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1250---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                expect(data.getSize()).assertEqual(0);
                data.setCapacity(M);
                expect(data.getCapacity()).assertEqual(M);
                data.setCapacity(2 * G);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1250 error: " + error);
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code == errCode).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1250---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1260
            * @tc.name    setSize Sets the size of the data contained in the MessageSequence instance. The getSize command
                        reads the data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1260", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1260---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1260 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1260---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1270
            * @tc.name    SetSize: Increases the value of the data contained in the MessageSequence instance by 1,
                        Write setSize
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1270", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1270---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1270 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1270---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1280
            * @tc.name    Verify the MessageSequence instance SetSize setting and the instance capacitydata qualification verification
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1280", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1280---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                expect(data.getSize()).assertEqual(0);
                data.writeString("constant");
                expect(data.getSize()).assertEqual(("constant".length * 2) + 8);
                let getCapacitydata = data.getCapacity();
                expect(getCapacitydata).assertEqual(64);
                data.setSize(getCapacitydata);
                expect(data.getSize()).assertEqual(getCapacitydata);
                data.setSize(getCapacitydata + 1);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1280 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1280---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1290
            * @tc.name    setSize Sets the storage capacity of the MessageSequence instance to decrease by one.
                        The getSize obtains the current MessageSequence capacity
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1290", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1290---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1290 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1290---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1300
            * @tc.name    Validate the setSize boundary value in the MessageSequence instance
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1300", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1300---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                expect(data.getCapacity()).assertEqual(0);
                data.setSize(4 * G);
                expect(data.getSize()).assertEqual(0);
                data.setSize(4 * G - 1);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1300 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1300---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1310
            * @tc.name    Verify that setSize is out of bounds in a MessageSequence instance
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1310", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1310---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                data.setSize(0);
                expect(data.getSize()).assertEqual(0);
                data.setSize(2 * 4 * G);
                expect(data.getSize()).assertEqual(0);
                data.setSize(2 * G);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1310 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1310---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1320
            * @tc.name    Obtains the write and read positions of the MessageSequence
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1320", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1320---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1320 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1320---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1330
            * @tc.name    Obtaining the Writable and Readable Byte Spaces of MessageSequence
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1330", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1330---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
                expect(data.getWritableBytes()).assertEqual(0);
                data.writeInt(10);
                expect(data.getWritableBytes()).assertEqual(60);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(10);
                    expect(result.reply.getReadableBytes()).assertEqual(0);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1330 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1330---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1340
            * @tc.name    Obtains the writeable and readable byte space and read position of the MessageSequence
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1340", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1340---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1340 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1340---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1350
        * @tc.name    Get the space size of MessageSequence to pass rawdata data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1350", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1350---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1350 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1350---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1360
            * @tc.name    Test fixed MessageSequence space size to pass rawData data
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1360", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1360---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                expect(data.getRawDataCapacity()).assertEqual(128 * M);
                let rawdata = [1, 2, 3];
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
                data.writeInt(rawdata.length);
                data.writeRawData(rawdata, rawdata.length);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_RAWDATA, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let size = result.reply.readInt();
                    expect(result.reply.readRawData(size) != rawdata).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1360 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1360---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1370
            * @tc.name    Test MessageSequence delivery file descriptor object
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1370", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1370---------------------------");
            try {
                let testab = new TestProxy(gIRemoteObject).asObject();
                expect(testab != null).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1370 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1370---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1380
            * @tc.name    Test that the asObject interface is called by a RemoteObject and returns itself
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1380", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1380---------------------------");
            try {
                let testRemoteObject = new TestRemoteObject("testObject");
                expect(testRemoteObject.asObject() != null).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1380 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1380---------------------------");
        });

        /*
            * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1390
            * @tc.name    MessageSequence sendMessageRequest API test
            * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
            * @tc.level   3 
            */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1390", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1390---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let rawdata = [1, 2, 3];
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
                data.getRawDataCapacity();
                data.writeInt(rawdata.length);
                data.writeRawData(rawdata, rawdata.length);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_RAWDATA, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(rawdata.length);
                    expect(result.reply.readRawData(rawdata.length) != rawdata).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1390 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1390---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1400
        * @tc.name    Invoke the writestring interface to write data to the MessageSequence instance sendMessageRequest Asynchronous
        *               Authentication onRemoteMessageRequest Server Processing
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1400", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = 'onRemoteMessageRequest invoking';
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1400 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1400---------------------------");
        });


        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1410
        * @tc.name    Invoke the writestring interface to write data to the MessageSequence instance. sendMessageRequest asynchronously
        *               verifies the priority processing levels of onRemoteMessageRequest and onRemoteRequest
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1410", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1410---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = "onRemoteRequest or onRemoteMessageRequest invoking";
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_ONREMOTEMESSAGE_OR_ONREMOTEREQUEST, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("onRemoteMessageRequest invoking");
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1410 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1410---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1420
        * @tc.name    readParcelable is Call JS callback function failedv Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1420", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1420---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let sequenceable = new MySequenceableCode(1, "aaa");
                data.writeParcelable(sequenceable);
                data.setCapacity(0);
                data.setSize(0);
                let ret = new MySequenceable(1, "");
                data.readParcelable(ret);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1420 error: " + error);
                let errCode = `${rpc.ErrorCode.CALL_JS_METHOD_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code != errCode).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1420---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1430
        * @tc.name    Invoke the writeinterfacetoken interface, write the interface descriptor, and verify the error 
        *               code that fails to be read from the interfacetoken interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1430", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1430---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
                data.setCapacity(0);
                data.setSize(0);
                data.readInterfaceToken();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1430 error: " + error);
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code != errCode).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1430---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1440
        * @tc.name    writeString check param error Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1440", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1440---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = '';
                for (let i = 0; i < 40 * K; i++) {
                    token += 'a';
                };
                data.writeString(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1440 error: " + error);
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1440---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1450
        * @tc.name    writeInterfaceToken Sequence memory alloc failed Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1450", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1450---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                data.setSize(0);
                data.setCapacity(0);
                let token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1450 error: " + error);
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1450---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1460
        * @tc.name    writeInterfaceToken Write data to message sequence failed Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1460", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1460---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                data.setSize(true);
                data.setCapacity(true);
                let token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1460 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1460---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1470
        * @tc.name    readParcelable Sequence memory alloc failed Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1470", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1470---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let sequenceable = new MySequenceable(1, "aaa");
                data.writeParcelable(sequenceable);
                let ret = new MySequenceable(0, "");
                data.setCapacity(0);
                data.readParcelable(ret);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1470 error: " + error);
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1470---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1480
        * @tc.name    writeRemoteObject is proxy or remote object is invalid Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3    
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1480", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1480---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = {};
                data.writeRemoteObject(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1480 error: " + error);
                let errCode = `${rpc.ErrorCode.PROXY_OR_REMOTE_OBJECT_INVALID_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1480---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1490
        * @tc.name    Basic test of the rewindWrite interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1490", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1490---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1490 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1490---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1500
        * @tc.name    RewindWrite interface write position cheap extension test
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1500", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1500 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1500---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1510
        * @tc.name    Test the boundary value of the rewindWrite interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1510", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1510---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = '';
                for (let i = 0; i < (40 * K - 1); i++) {
                    token += 'a';
                }
                expect(data.getWritePosition()).assertEqual(0);
                data.writeString(token);
                expect(data.getWritePosition()).assertEqual(token.length * 2 + 6);
                data.rewindWrite((token.length * 2 + 6) - 1);
                expect(data.getWritePosition()).assertEqual((token.length * 2 + 6) - 1);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1510 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1510---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1520
        * @tc.name    Test the critical value of the rewindWrite interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1520", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1520---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = '';
                for (let i = 0; i < (40 * K - 1); i++) {
                    token += 'a';
                }
                expect(data.getWritePosition()).assertEqual(0);
                data.writeString(token);
                expect(data.getWritePosition()).assertEqual(token.length * 2 + 6);
                data.rewindWrite((token.length * 2 + 6) + 1);
                expect(data.getWritePosition()).assertEqual(token.length * 2 + 6);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1520 errorMessage " + error.message);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1520---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1530
        * @tc.name    Basic test of the rewindRead interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1530", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1530---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1530 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1530---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1540
        * @tc.name    rewindRead interface write position cheap extension test
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1540", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1540---------------------------");
            try {
                var data = rpc.MessageSequence.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1540 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1540---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1550
        * @tc.name    Test the boundary value of the rewindRead interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1550", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1550---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = '';
                for (let i = 0; i < (40 * K - 1); i++) {
                    token += 'a';
                }
                data.writeString(token);
                expect(data.getReadPosition()).assertEqual(0);
                expect(data.readString().length).assertEqual(40 * K - 1);
                expect(data.getReadPosition()).assertEqual(token.length * 2 + 6);
                data.rewindRead((token.length * 2 + 6) - 1);
                expect(data.getReadPosition()).assertEqual((token.length * 2 + 6) - 1);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1550 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1550---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1560
        * @tc.name    Test the critical value of the rewindRead interface 
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1560", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1560---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = '';
                for (let i = 0; i < (40 * K - 1); i++) {
                    token += 'a';
                }
                data.writeString(token);
                expect(data.getReadPosition()).assertEqual(0);
                expect(data.readString().length).assertEqual(40 * K - 1);
                expect(data.getReadPosition()).assertEqual(token.length * 2 + 6);
                data.rewindRead((token.length * 2 + 6) + 1);
                expect(data.getReadPosition()).assertEqual(token.length * 2 + 6);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1560 errorMessage " + error.message);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1560---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1570
        * @tc.name    Test the function of the getWritePosition interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1570", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1570---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
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
                    expect(result.reply.readChar()).assertEqual(97);
                    expect(result.reply.readString()).assertEqual("");
                    let s = new MySequenceable(null, null);
                    result.reply.readParcelable(s);
                    expect(s.num).assertEqual(1);
                    expect(s.str).assertEqual("aaa");
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1570 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1570---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1580
        * @tc.name    Test on the null value of the getWritePosition interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1580", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1580---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let str = "";
                data.writeString(str);
                expect(data.getWritePosition()).assertEqual(8);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1580 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1580---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1590
        * @tc.name    Test the function of the getReadPosition interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1590", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1590---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
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
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1590 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1590---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageSequence_1600
        * @tc.name    Test on the null value of the getReadPosition interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageSequence_1600", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageSequence_1600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let str = "";
                data.writeString(str);
                expect(data.readString()).assertEqual(str);
                expect(data.getReadPosition()).assertEqual(8);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageSequence_1600 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageSequence_1600---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0010
         * @tc.name    Call the writeinterfacetoken interface, write the interface descriptor, and read interfacetoken
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0010", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0010---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = "hello ruan zong xian";
                expect(data.writeInterfaceToken(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInterfaceToken()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0010 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0010---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0020
         * @tc.name    The writeInterfaceToken interface is looping, the interface descriptor is written, and the
                        InterfaceToken is read
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0020", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0020---------------------------");
            try {
                for (let i = 0; i < 5; i++) {
                    var data = rpc.MessageParcel.create();
                    var reply = rpc.MessageParcel.create();
                    let option = new rpc.MessageOption();
                    let token = "hello ruan zong xian";
                    expect(data.writeInterfaceToken(token)).assertTrue();
                    expect(gIRemoteObject != undefined).assertTrue();
                    await gIRemoteObject.sendRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
                        expect(result.errCode).assertEqual(0);
                        expect(result.reply.readInterfaceToken()).assertEqual(token);
                    });
                }
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0020 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0020---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0030
         * @tc.name    Call the WriteInterfaceToken interface, write the maximum length interface descriptor, and read
                        the InterfaceToken
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0030", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0030---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = "";
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
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0030 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0030---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0040
         * @tc.name    The WriteInterfaceToken interface is called, the exceeding-length interface descriptor is written,
                        and the InterfaceToken is read
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0040", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0040---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let token = "";
                for (let i = 0; i < 40 * K; i++) {
                    token += 'a';
                }
                expect(data.writeInterfaceToken(token)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0040 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0040---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0050
         * @tc.name    Call the writeinterfacetoken interface to write a non string interface descriptor
                       and read interfacetoken
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0050", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0050---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let token = 123;
                expect(data.writeInterfaceToken(token)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0050 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0050---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0060
         * @tc.name    Call the writeshortarray interface, write the array to the messageparcel instance,
         *             and call readshortarray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0060", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0060---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wShortArryData = [-1, 0, 1];
                expect(data.writeShortArray(wShortArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readShortArray(), wShortArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0060 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0060---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0070
         * @tc.name    Call the writeshortarray interface, write the short integer array to the messageparcel instance,
         *             and call readshortarray (datain: number []) to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0070", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0070---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wShortArryData = [];
                for (let i = 0; i < (50 * 1024 - 1); i++) {
                    wShortArryData[i] = 1;
                }
                expect(data.writeShortArray(wShortArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rShortArryData = [];
                    result.reply.readShortArray(rShortArryData);
                    assertArrayElementEqual(rShortArryData, wShortArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0070 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0070---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0080
         * @tc.name    Writeshortarray interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0080", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0080---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wShortArryData = [-32768, 0, 1, 2, 32767];
                expect(data.writeShortArray(wShortArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readShortArray(), wShortArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0080 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0080---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0090
         * @tc.name    Writeshortarray interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0090", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0090---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let eShortArryData = [-32769, 32768];
                expect(data.writeShortArray(eShortArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let erShortArryData = [32767, -32768];
                    assertArrayElementEqual(result.reply.readShortArray(), erShortArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0090 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0090---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0100
         * @tc.name    Writeshortarray interface, transmission length verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0100", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let eShortArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    eShortArryData[i] = 1;
                };
                expect(data.writeShortArray(eShortArryData)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0100 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0100---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0110
         * @tc.name    Call the writelongarray interface, write the long integer array to the messageparcel instance,
         *             and call readlongarray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0110", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0110---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wLongArryData = [3276826, 123456, 9999999];
                expect(data.writeLongArray(wLongArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readLongArray(), wLongArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0110 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0110---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0120
         * @tc.name    Call the writelongarray interface, write the long integer array to the messageparcel instance,
         *             and call readlongarray (datain: number []) to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0120", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0120---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wLongArryData = [];
                for (let i = 0; i < (25 * K - 1); i++) {
                    wLongArryData[i] = 11;
                };
                expect(data.writeLongArray(wLongArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rLongArryData = [];
                    result.reply.readLongArray(rLongArryData);
                    assertArrayElementEqual(rLongArryData, wLongArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0120 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0120---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0130
         * @tc.name    Writelongarray interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0130", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0130---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wLongArryData = [-9007199254740992, 0, 1, 2, 9007199254740991];
                expect(data.writeLongArray(wLongArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rLongArryData = [];
                    result.reply.readLongArray(rLongArryData);
                    assertArrayElementEqual(rLongArryData, wLongArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0130 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0130---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0140
         * @tc.name    Writelongarray interface, long type precision verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0140", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0140---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wLongArryData = [-9999999999999999, 9999999999999999];
                expect(data.writeLongArray(wLongArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rLongArryData = result.reply.readLongArray();
                    let newlongdata = [-10000000000000000, 10000000000000000];
                    expect(rLongArryData[0]).assertEqual(newlongdata[0]);
                    expect(rLongArryData[1]).assertEqual(newlongdata[1]);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0140 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0140---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0150
         * @tc.name    Writelongarray Indicates an interface for verifying the input length
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0150", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0150---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let wLongArryData = [];
                for (let i = 0; i < 25 * K; i++) {
                    wLongArryData[i] = 11;
                };
                expect(data.writeLongArray(wLongArryData)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0150 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0150---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0160
         * @tc.name    Call the writedoublearray interface, write the array to the messageparcel instance,
         *             and call readdoublearra to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0160", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0160---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wDoubleArryData = [1.2, 235.67, 99.76];
                expect(data.writeDoubleArray(wDoubleArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readDoubleArray(), wDoubleArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0160 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0160---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0170
         * @tc.name    Call the writedoublearray interface, write the array to the messageparcel instance,
         *             and call readdoublearra (datain: number []) to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0170", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0170---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wDoubleArryData = [];
                for (let i = 0; i < (25 * K - 1); i++) {
                    wDoubleArryData[i] = 11.1;
                };
                expect(data.writeDoubleArray(wDoubleArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rDoubleArryData = [];
                    result.reply.readDoubleArray(rDoubleArryData);
                    assertArrayElementEqual(rDoubleArryData, wDoubleArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0170 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0170---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0180
         * @tc.name    Writedoublearray interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0180", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0180---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wDoubleArryData = [4.9E-324, 235.67, 1.79E+308];
                expect(data.writeDoubleArray(wDoubleArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readDoubleArray(), wDoubleArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0180 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0180---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0190
         * @tc.name    Writedoublearray interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0190", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0190---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let eDoubleArryData = [(4.9E-324) - 1, (1.79E+308) + 1];
                expect(data.writeDoubleArray(eDoubleArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rDoubleArryData = result.reply.readDoubleArray();
                    expect(rDoubleArryData[0]).assertEqual(-1);
                    expect(rDoubleArryData[1]).assertEqual(1.79e+308);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0190 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0190---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0200
         * @tc.name    Writedoublearray interface, Out-of-bounds value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0200", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0200---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let eDoubleArryData = [];
                for (let i = 0; i < 25 * K; i++) {
                    eDoubleArryData[i] = 11.1;
                }
                expect(data.writeDoubleArray(eDoubleArryData)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0200 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0200---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0210
         * @tc.name    Call the writebooleanarray interface, write the array to the messageparcel instance,
         *             and call readbooleanarray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0210", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0210---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wBooleanArryData = [true, false, false];
                expect(data.writeBooleanArray(wBooleanArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readBooleanArray(), wBooleanArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0210 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0210---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0220
         * @tc.name    Call the writebooleanarray interface, write the array to the messageparcel instance,
         *             and call readbooleanarray (datain: number []) to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0220", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0220---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wBooleanArryData = [];
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
                    let rBooleanArryData = [];
                    result.reply.readBooleanArray(rBooleanArryData);
                    assertArrayElementEqual(rBooleanArryData, wBooleanArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0220 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0220---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0230
         * @tc.name    Writebooleanarray interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0230", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0230---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let errorBooleanArryData = [true, 9, false];
                expect(data.writeBooleanArray(errorBooleanArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let eCharArrayData = [true, false, false];
                    assertArrayElementEqual(result.reply.readBooleanArray(), eCharArrayData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0230 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0230---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0240
         * @tc.name    Writebooleanarray Interface for length verification of input parameters
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0240", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0240---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let wBooleanArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    if (i % 2 == 0) {
                        wBooleanArryData[i] = false;
                    } else {
                        wBooleanArryData[i] = true;
                    };
                }
                expect(data.writeBooleanArray(wBooleanArryData)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0240 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0240---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0250
         * @tc.name    Call the writechararray interface, write the array to the messageparcel instance,
         *             and call readchararray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0250", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0250---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wCharArryData = [0, 97, 255];
                expect(data.writeCharArray(wCharArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readCharArray(), wCharArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0250 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0250---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0260
         * @tc.name    Call the writechararray interface, write the array to the messageparcel instance,
         *             and call readchararray (datain: number []) to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0260", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0260---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wCharArryData = [];
                for (let i = 0; i < (50 * K - 1); i++) {
                    wCharArryData[i] = 96;
                };
                expect(data.writeCharArray(wCharArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rCharArryData = [];
                    result.reply.readCharArray(rCharArryData);
                    assertArrayElementEqual(rCharArryData, wCharArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0260 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0260---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0270
         * @tc.name    Writechararray interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0270", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0270---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let errorCharArryData = [96, 'asfgdgdtu', 97];
                expect(data.writeCharArray(errorCharArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let eCharArrayData = [96, 0, 97];
                    assertArrayElementEqual(data.readCharArray(), eCharArrayData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0270 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0270---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0280
         * @tc.name    Writechararray Indicates the length of an interface input parameter
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0280", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0280---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let errorCharArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    errorCharArryData[i] = 96;
                };
                expect(data.writeCharArray(errorCharArryData)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0280 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0280---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0290
         * @tc.name    Call the writestringarray interface, write the array to the messageparcel instance,
         *             and call readstringarray (datain: number []) to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0290", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0290---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wStringArryData = ['abc', 'hello', 'beauty'];
                expect(data.writeStringArray(wStringArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRINGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readStringArray(), wStringArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0290 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0290---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0300
         * @tc.name    Call the writestringarray interface, write the array to the messageparcel instance,
         *             and call readstringarray() to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0300", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0300---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let wStringArryData = [];
                for (let i = 0; i < (10 * K - 1); i++) {
                    wStringArryData[i] = "heddSDF";
                };
                expect(data.writeStringArray(wStringArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRINGARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let rStringArryData = [];
                    result.reply.readStringArray(rStringArryData);
                    assertArrayElementEqual(rStringArryData, wStringArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0300 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0300---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0310
         * @tc.name    Writestringarray interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0310", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0310---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let errorStringArryData = ['abc', 123, 'beauty'];
                expect(data.writeStringArray(errorStringArryData)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0310 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0310---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0320
         * @tc.name    writeStringArray Interface for length verification of input parameters
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0320", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0320---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let wStringArryData = [];
                for (let i = 0; i < 10 * K; i++) {
                    wStringArryData[i] = "heddSDF";
                }
                expect(data.writeStringArray(wStringArryData)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0320 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0320---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0330
         * @tc.name    Call the writebytearray interface, write the array to the messageparcel instance,
         *             and call readbytearray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0330", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0330---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let ByteArraylet = [1, 2, 3, 4, 5];
                expect(data.writeByteArray(ByteArraylet)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readByteArray(), ByteArraylet);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0330 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0330---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0340
         * @tc.name    Call the writebytearray interface, write the array to the messageparcel instance,
         *             and call readbytearray (datain: number []) to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0340", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0340---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let ByteArraylet = [-128, 0, 1, 2, 127];
                expect(data.writeByteArray(ByteArraylet)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let newArr = new Array(5);
                    result.reply.readByteArray(newArr);
                    assertArrayElementEqual(ByteArraylet, newArr);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0340 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0340---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0350
         * @tc.name    Writebytearray interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0350", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0350---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let ByteArraylet = [];
                for (let i = 0; i < (40 * K - 1); i++) {
                    ByteArraylet[i] = 1;
                }
                expect(data.writeByteArray(ByteArraylet)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let newArr = new Array(5);
                    result.reply.readByteArray(newArr);
                    assertArrayElementEqual(newArr, ByteArraylet);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0350 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0350---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0360
         * @tc.name    Writebytearray interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0360", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0360---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let ByteArraylet = [-129, 0, 1, 2, 128];
                expect(data.writeByteArray(ByteArraylet)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let shortArryDataReply = result.reply.readByteArray();
                    expect(shortArryDataReply[0] == 127).assertTrue();
                    expect(shortArryDataReply[1] == ByteArraylet[1]).assertTrue();
                    expect(shortArryDataReply[2] == ByteArraylet[2]).assertTrue();
                    expect(shortArryDataReply[3] == ByteArraylet[3]).assertTrue();
                    expect(shortArryDataReply[4] == -128).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0360 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0360---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0370
         * @tc.name    Writebytearray Interface，input parameter length verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0370", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0370---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let ByteArraylet = [];
                for (let i = 0; i < 40 * K; i++) {
                    ByteArraylet[i] = 1;
                }
                expect(data.writeByteArray(ByteArraylet)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0370 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0370---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0380
         * @tc.name    Call the writeintarray interface, write the array to the messageparcel instance,
         *             and call readintarray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0380", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0380---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let intArryData = [100, 111, 112];
                expect(data.writeIntArray(intArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readIntArray(), intArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0380 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0380---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0390
         * @tc.name    Call the writeintarray interface, write the array to the messageparcel instance,
         *             and call readintarray (datain: number []) to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0390", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0390---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let intArryData = [];
                for (let i = 0; i < (50 * K - 1); i++) {
                    intArryData[i] = 1;
                };
                expect(data.writeIntArray(intArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let newArr = new Array(3);
                    result.reply.readIntArray(newArr);
                    assertArrayElementEqual(newArr, intArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0390 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0390---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0400
         * @tc.name    Writeintarray interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0400", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0400---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let intArryData = [-2147483648, 0, 1, 2, 2147483647];
                expect(data.writeIntArray(intArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readIntArray(), intArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0400 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0400---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0410
         * @tc.name    Writeintarray interface, illegal value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0410", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0410---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let intArryData = [-2147483649, 0, 1, 2, 2147483648];
                expect(data.writeIntArray(intArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let shortArryDataReply = result.reply.readIntArray();
                    expect(shortArryDataReply[0] == 2147483647).assertTrue();
                    expect(shortArryDataReply[1] == intArryData[1]).assertTrue();
                    expect(shortArryDataReply[2] == intArryData[2]).assertTrue();
                    expect(shortArryDataReply[3] == intArryData[3]).assertTrue();
                    expect(shortArryDataReply[4] == -2147483648).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0410 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0410---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0420
         * @tc.name    Writeintarray interface, input parameter length verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0420", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0420---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let intArryData = [];
                for (let i = 0; i < 50 * K; i++) {
                    intArryData[i] = 1;
                }
                expect(data.writeIntArray(intArryData)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0420 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0420---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0430
         * @tc.name    Call the writefloatarray interface, write the array to the messageparcel instance,
         *             and call readfloatarray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0430", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0430---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let floatArryData = [1.2, 1.3, 1.4];
                expect(data.writeFloatArray(floatArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readFloatArray(), floatArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0430 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0430---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0440
         * @tc.name    Call the writefloatarray interface, write the array to the messageparcel instance,
         *             and call readfloatarray (datain: number []) to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0440", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0440---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let floatArryData = [1.4E-45, 1.3, 3.4028235E38];
                expect(data.writeFloatArray(floatArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let newArr = new Array(3);
                    result.reply.readFloatArray(newArr);
                    assertArrayElementEqual(newArr, floatArryData);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0440 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0440---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0450
         * @tc.name    Writefloatarray interface, parameter boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0450", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0450---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let floatArryData = [(1.4E-45) - 1, 1.3, (3.4028235E38) + 1];
                expect(data.writeFloatArray(floatArryData)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let newArr = result.reply.readFloatArray();
                    expect(newArr[0]).assertEqual(-1);
                    expect(newArr[1]).assertEqual(1.3);
                    expect(newArr[2]).assertEqual(3.4028235e+38);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0450 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0450---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0460
         * @tc.name    Writefloatarray interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0460", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0460---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let floatArryData = [];
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
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0460 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0460---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0470
         * @tc.name    Writefloatarray interface, Longest array verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0470", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0470---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let floatArryData = [];
                for (let i = 0; i < (25 * K); i++) {
                    floatArryData[i] = 1.1;
                };
                expect(data.writeFloatArray(floatArryData)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0470 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0470---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0480
         * @tc.name    Call the writeShort interface to write the short integer data to the messageparcel instance,
         *             and call readshort to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0480", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0480---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let short = 8;
                expect(data.writeShort(short)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SHORT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    assertArrayElementEqual(result.reply.readShort(), short);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0480 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0480---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0490
         * @tc.name    WriteShort interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0490", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0490---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
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
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0490 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0490---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0500
         * @tc.name    WriteShort interface, Boundary value minimum value out of bounds verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0500", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0500---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                expect(data.writeShort(-32769)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readShort() == 32767).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0500 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0500---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0510
         * @tc.name    WriteShort interface, Boundary value maximum value out of bounds verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0510", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0510---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                expect(data.writeShort(32768)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readShort() == -32768).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0510 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0510---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0520
         * @tc.name    Call writelong interface to write long integer data to messageparcel instance
         *             and call readlong to read data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0520", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0520---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let long = 9007199254740991;
                expect(data.writeLong(long)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readLong()).assertEqual(long);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0520 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0520---------------------------");
        });


        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0530
         * @tc.name    Writelong interface, Verification of maximum accuracy value
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0530", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0530---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let long = -9007199254740992;
                expect(data.writeLong(long)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readLong() == long).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0530 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0530---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0540
         * @tc.name    Writelong interface, Minimum loss accuracy verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0540", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0540---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let long = -9223372036854775300;
                expect(data.writeLong(long)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readLong()).assertEqual(-9223372036854776000);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0540 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0540---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0550
         * @tc.name    Writelong interface, Maximum loss accuracy verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0550", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0550---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let short = 9223372036854775300;
                expect(data.writeLong(short)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let readlong = result.reply.readLong();
                    expect(readlong != 0).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0550 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0550---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0560
         * @tc.name    Call the parallel interface to read and write data to the double instance
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0560", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0560---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = 4.9E-324;
                expect(data.writeDouble(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readDouble()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0560 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0560---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0570
         * @tc.name    Writedouble interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0570", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0570---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = 1.79E+308;
                expect(data.writeDouble(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readDouble()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0570 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0570---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0580
         * @tc.name    Writedouble interface, Minimum boundary value out of bounds verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0580", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0580---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = (4.9E-324) - 1;
                expect(data.writeDouble(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readDouble()).assertEqual(-1);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0580 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0580---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0590
         * @tc.name    Writedouble interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0590", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0590---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let token = "1.79E+465312156";
                expect(data.writeDouble(token)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0590 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0590---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0600
         * @tc.name    Invoke the writeboolean interface to write the data true to the MessageSequence instance 
         *              and invoke the readboolean interface to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0600", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0600---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = true;
                expect(data.writeBoolean(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEAN, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readBoolean()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0600 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0600---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0610
         * @tc.name    Call the writeboolean interface to write the data to the messageparcel instance,
         *             and call readboolean to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0610", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0610---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = false;
                expect(data.writeBoolean(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BOOLEAN, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readBoolean()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0610 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0610---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0620
         * @tc.name    Writeboolean interface, illegal value number type verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0620", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0620---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                expect(data.writeBoolean(9)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0620 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0620---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0630
         * @tc.name    Writeboolean interface, illegal value string type verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0630", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0630---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let token = "true";
                expect(data.writeBoolean(token)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0630 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0630---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0640
         * @tc.name    Call the writechar interface to write the minimum data to the messageparcel instance,
         *               and call readchar to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0640", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0640---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = 0;
                expect(data.writeChar(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0640 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0640---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0650
         * @tc.name    Call the writechar interface to write the maximum data to the messageparcel instance,
         *              and call readchar to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0650", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0650---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = 255;
                expect(data.writeChar(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0650 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0650---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0660
         * @tc.name    Call the writechar interface to write the minimum out of range data to the messageparcel instance,
         *              and call readchar to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0660", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0660---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = -1;
                expect(data.writeChar(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(255);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0660 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0660---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0670
         * @tc.name    Call the writechar interface to write the maximum out of range data to the messageparcel instance,
         *              and call readchar to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0670", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0670---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = 256;
                expect(data.writeChar(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readChar()).assertEqual(0);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0670 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0670---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0680
         * @tc.name    Writechar interface, illegal value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0680", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0680---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let token = 'ades';
                expect(data.writeChar(token)).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0680 error: " + error);
                expect(error != null).assertTrue()
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0680---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0690
         * @tc.name    Call the writestring interface to write the data to the messageparcel instance,
         *             and call readstring() to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0690", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0690---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = '';
                for (let i = 0; i < (40 * K - 1); i++) {
                    token += 'a';
                }
                expect(data.writeString(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0690 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0690---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0700
         * @tc.name    Writestring interface Maximum data out of range verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0700", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0700---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let token = '';
                for (let i = 0; i < 40 * K; i++) {
                    token += 'a';
                }
                expect(data.writeString(token)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0700 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0700---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0710
         * @tc.name    Writestring interface, illegal value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0710", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0710---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let token = 123;
                expect(data.writeString(token)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0710 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0710---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0720
         * @tc.name    Call the writebyte interface to write data to the messageparcel instance,
         *             and call readbyte to read data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0720", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0720---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = 2;
                expect(data.writeByte(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0720 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0720---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0730
         * @tc.name    Writebyte interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0730", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0730---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
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
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0730 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0730---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0740
         * @tc.name    Writebyte interface, Maximum boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0740", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0740---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                expect(data.writeByte(-129)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(127);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0740 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0740---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0750
         * @tc.name    Writebyte interface, Minimum boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0750", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0750---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                expect(data.writeByte(128)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(-128);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0750 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0750---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0760
         * @tc.name    Writebyte interface, illegal value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0760", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0760---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                expect(data.writeByte("error")).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0760 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0760---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0770
         * @tc.name    Call the writeint interface to write the data to the messageparcel instance,
         *             and call readint to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0770", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0770---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = 2;
                expect(data.writeInt(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0770 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0770---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0780
         * @tc.name    Writeint interface, boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0780", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0780---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
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
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0780 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0780---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0790
         * @tc.name    Writeint interface, Verification of minimum boundary overrun value
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0790", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0790---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                expect(data.writeInt(-2147483649)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(2147483647);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0790 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0790---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0800
         * @tc.name    Writeint interface, Verification of maximum boundary overrun value
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0800", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0800---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                expect(data.writeInt(2147483648)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(-2147483648);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0800 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0800---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0810
         * @tc.name    Writeint interface, illegal value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0810", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0810---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                expect(data.writeInt("error")).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0810 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0810---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0820
         * @tc.name    Call the writefloat interface to write data to the messageparcel instance,
         *             and call readfloat to read data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0820", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0820---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = 2.2;
                expect(data.writeFloat(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0820 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0820---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0830
         * @tc.name    Writefloat interface, Minimum boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0830", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0830---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = 1.4E-45;
                expect(data.writeFloat(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0830 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0830---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0840
         * @tc.name    Writefloat interface, Maximum boundary value verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0840", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0840---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = 3.4028235E38;
                expect(data.writeFloat(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0840 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0840---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0850
         * @tc.name    Writefloat interface, Verification of maximum boundary overrun value
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0850", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0850---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = (3.4028235E38) + 1;
                expect(data.writeFloat(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(3.4028235e+38);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0850 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0850---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0860
         * @tc.name    Writefloat interface, Verification of minimum boundary overrun value
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0860", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0860---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = (1.4E-45) - 1;
                expect(data.writeFloat(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readFloat()).assertEqual(-1);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0860 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0860---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0870
         * @tc.name    Writefloat interface, illegal value validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0870", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0870---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let token = 'a';
                expect(data.writeFloat(token)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0870 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0870---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0880
         * @tc.name    Call the getRawDataCapacity interface to get the maximum amount of raw data that a MessageParcel
                         can hold
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0880", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0880---------------------------");
            try {
                var parcel = new rpc.MessageParcel();
                var reply = new rpc.MessageParcel();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0880 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                parcel.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0880---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0890
        * @tc.name    Test messageparcel to deliver rawdata data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0890", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0890---------------------------");
            try {
                var parcel = new rpc.MessageParcel();
                var reply = new rpc.MessageParcel();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0890 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                parcel.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0890---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0900
        * @tc.name    Test messageparcel to pass abnormal rawdata data, and expand the capacity for verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0900", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0900---------------------------");
            try {
                var parcel = new rpc.MessageParcel();
                var reply = new rpc.MessageParcel();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0900 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                parcel.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0900---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0910
        * @tc.name    Test messageparcel to pass exception rawdata data data interception verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0910", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0910---------------------------");
            try {
                var parcel = new rpc.MessageParcel();
                var reply = new rpc.MessageParcel();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0910 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                parcel.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0910---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0920
        * @tc.name    Test messageParcel to deliver out-of-bounds RawData data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0920", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0920---------------------------");
            try {
                var parcel = new rpc.MessageParcel();
                var reply = new rpc.MessageParcel();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0920 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                parcel.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0920---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0930
        * @tc.name    Test messageParcel to deliver illegal RawData data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0930", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0930---------------------------");
            try {
                var parcel = new rpc.MessageParcel();
                let arr = ["aaa", 1, 2, 3];
                expect(parcel.writeInt(arr.length)).assertTrue();
                expect(parcel.writeRawData(arr, arr.length)).assertTrue();
                expect(parcel.getRawDataCapacity()).assertEqual(128 * M);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0930 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                parcel.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0930---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0940
         * @tc.name    Call the writeremoteobject interface to serialize the remote object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0940", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0940---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let testRemoteObject = new TestRemoteObject("testObject");
                expect(data.writeRemoteObject(testRemoteObject)).assertTrue();
                expect(data.readRemoteObject() != null).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0940 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0940---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0950
         * @tc.name    Call the writeremoteobject interface to serialize the remote object and pass in the empty object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0950", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0950---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let token = new TestRemoteObject(null);
                expect(data.writeRemoteObject(token)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0950 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0950---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0960
         * @tc.name    Call the writeremoteobject interface to serialize the remote object and pass in the constructor object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0960", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0960---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let token = {}
                expect(data.writeRemoteObject(token)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0960 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0960---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0970
         * @tc.name    Call the writesequenceable interface to write the custom serialized
         *             object to the messageparcel instance
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0970", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0970---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let sequenceable = new MySequenceable(1, "aaa");
                expect(data.writeSequenceable(sequenceable)).assertTrue();
                let ret = new MySequenceable(0, "");
                expect(data.readSequenceable(ret)).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0970 error: " + error);
                expect(error).assertEqual(null);
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0970---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0980
         * @tc.name    Call the writesequenceable interface to write the custom serialized
         *             object to the messageparcel instance, Migration to read
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0980", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0980---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let sequenceable = new MySequenceable(1, "aaa");
                expect(data.writeSequenceable(sequenceable)).assertTrue();
                let ret = new MySequenceable(1, "");
                expect(data.readSequenceable(ret)).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0980 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0980---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_0990
         * @tc.name    After the server finishes processing, write noexception first before writing the result,
         *             and the client calls readexception to judge whether the server is abnormal
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_0990", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_0990---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                data.writeNoException();
                expect(data.writeInt(6)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_NOEXCEPTION, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                    expect(result.reply.readInt()).assertEqual(6);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_0990 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_0990---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1000
         * @tc.name    If the data on the server is abnormal, the client calls readexception
         *             to judge whether the server is abnormal
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1000", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1000---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                data.writeNoException();
                expect(data.writeInt(1232222223444)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_NOEXCEPTION, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                    expect(result.reply.readInt() != 1232222223444).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1000 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1000---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1010
         * @tc.name    Serializable object marshaling and unmarshalling test
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1010", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1010---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let sequenceable = new MySequenceable(1, "aaa");
                expect(data.writeSequenceable(sequenceable)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let s = new MySequenceable(null, null);
                    expect(result.reply.readSequenceable(s)).assertTrue();
                    expect(s.str).assertEqual(sequenceable.str);
                    expect(s.num).assertEqual(sequenceable.num);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1010 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1010---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1020
         * @tc.name    Non serializable object marshaling test
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1020", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1020---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let sequenceable = null;
                expect(data.writeSequenceable(sequenceable)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1020 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1020---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1030
         * @tc.name    The server did not send a serializable object, and the client was ungrouped
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1030", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1030---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let sequenceable = 10;
                expect(data.writeInt(sequenceable)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let s = new MySequenceable(0, null);
                    expect(result.reply.readSequenceable(s)).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1030 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1030---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1040
         * @tc.name    Call the writesequenceable interface to write the custom serialized object to the
         *             messageparcel instance, and call readsequenceable to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1040", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1040---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let sequenceable = new MySequenceable(2, "abc");
                expect(data.writeSequenceable(sequenceable)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let s = new MySequenceable(null, null);
                    expect(result.reply.readSequenceable(s)).assertTrue();
                    expect(s.str).assertEqual(sequenceable.str);
                    expect(s.num).assertEqual(sequenceable.num);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1040 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1040---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1050
         * @tc.name    Call the writesequenceablearray interface to write the custom serialized object array (1, 2, 3) to
         *              the messageparcel instance, and call readsequenceablearray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1050", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1050---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let sequenceable = [new MySequenceable(1, "aaa"),
                new MySequenceable(2, "bbb"), new MySequenceable(3, "ccc")];
                expect(data.writeSequenceableArray(sequenceable)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let s = [new MySequenceable(null, null), new MySequenceable(null, null),
                    new MySequenceable(null, null)];
                    result.reply.readSequenceableArray(s);
                    for (let i = 0; i < s.length; i++) {
                        expect(s[i].str).assertEqual(sequenceable[i].str);
                        expect(s[i].num).assertEqual(sequenceable[i].num);
                    }
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1050 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1050---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1060
         * @tc.name    Call the writesequenceablearray interface to write the custom serialized object to the
         *             messageparcel instance, and call readsequenceablearray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1060", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1060---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let sequenceable = [new MySequenceable(4, "abc"),
                new MySequenceable(5, "bcd"), new MySequenceable(6, "cef")];
                expect(data.writeSequenceableArray(sequenceable)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_SEQUENCEABLEARRAY, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let s = [new MySequenceable(null, null),
                    new MySequenceable(null, null), new MySequenceable(null, null)]
                    result.reply.readSequenceableArray(s);
                    for (let i = 0; i < s.length; i++) {
                        expect(s[i].str).assertEqual(sequenceable[i].str);
                        expect(s[i].num).assertEqual(sequenceable[i].num);
                    }
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1060 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1060---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1070
         * @tc.name    Call the writesequenceablearray interface to write the custom
         *             serialized object to the messageparcel instance
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1070", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1070---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let sequenceable = 1;
                expect(data.writeSequenceableArray(sequenceable)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1070 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1070---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1080
         * @tc.name    Call the writeremoteobjectarray interface to write the object array to the messageparcel
         *             instance, and call readremoteobjectarray to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1080", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1080---------------------------");
            try {
                let count = 0
                function checkResult(num, str) {
                    expect(num).assertEqual(123);
                    expect(str).assertEqual("rpcListenerTest");
                    count++
                    console.info("check result done, count: " + count);
                    if (count == 3) {
                        done();
                    }
                }
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                expect(data.writeInterfaceToken("rpcTestAbility")).assertTrue();
                let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)];
                let result = data.writeRemoteObjectArray(listeners);
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1080: writeRemoteObjectArray is " + result);
                expect(result).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECTARRAY, data, reply, option).then((result) => {
                    console.info("SUB_DSoftbus_RPC_API_MessageParcel_1080: sendRequest is " + result.errCode);
                    expect(result.errCode).assertEqual(0);
                    expect(result.code).assertEqual(CODE_WRITE_REMOTEOBJECTARRAY);
                    expect(result.data).assertEqual(data);
                    expect(result.reply).assertEqual(reply);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1080 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1080---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1090
         * @tc.name    Call the writeremoteobjectarray interface to write the object array to the messageparcel instance,
         *             and call readremoteobjectarray (objects: iremoteobject []) to read the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1090", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1090---------------------------");
            try {
                let count = 0
                function checkResult(num, str) {
                    expect(num).assertEqual(123);
                    expect(str).assertEqual("rpcListenerTest");
                    count++;
                    console.info("check result done, count: " + count);
                    if (count == 3) {
                        done();
                    }
                }
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                expect(data.writeInterfaceToken("rpcTestAbility")).assertTrue();
                let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)];
                let result = data.writeRemoteObjectArray(listeners);
                console.info("RpcClient: writeRemoteObjectArray is " + result);
                expect(result).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECTARRAY, data, reply, option).then((result) => {
                    console.info("SUB_DSoftbus_RPC_API_MessageParcel_1090: sendRequest is " + result.errCode);
                    expect(result.errCode == 0).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1090 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1090---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1100
         * @tc.name    Test messageparcel to deliver the reply message received in promise across processes
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1100", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                expect(data.writeByte(2)).assertTrue();
                expect(data.writeShort(3)).assertTrue();
                expect(data.writeInt(4)).assertTrue();
                expect(data.writeLong(5)).assertTrue();
                expect(data.writeFloat(1.2)).assertTrue();
                expect(data.writeDouble(10.2)).assertTrue();
                expect(data.writeBoolean(true)).assertTrue();
                expect(data.writeChar(97)).assertTrue();
                expect(data.writeString("HelloWorld")).assertTrue();
                expect(data.writeSequenceable(new MySequenceable(1, "aaa"))).assertTrue();
                await gIRemoteObject.sendRequest(CODE_ALL_TYPE, data, reply, option).then((result) => {
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
                    let s = new MySequenceable(0, "");
                    expect(result.reply.readSequenceable(s)).assertTrue();
                    expect(s.num).assertEqual(1);
                    expect(s.str).assertEqual("aaa");
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1100 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1100---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1110
         * @tc.name    Test the cross process delivery of messageparcel and receive the reply message
         *             in the callback function
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1110", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1110---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                expect(data.writeByte(2)).assertTrue();
                expect(data.writeShort(3)).assertTrue();
                expect(data.writeInt(4)).assertTrue();
                expect(data.writeLong(5)).assertTrue();
                expect(data.writeFloat(1.2)).assertTrue();
                expect(data.writeDouble(10.2)).assertTrue();
                expect(data.writeBoolean(true)).assertTrue();
                expect(data.writeChar(97)).assertTrue();
                expect(data.writeString("HelloWorld")).assertTrue();
                expect(data.writeSequenceable(new MySequenceable(1, "aaa"))).assertTrue();
                function sendRequestCallback(result) {
                    try {
                        console.info("sendRequest Callback");
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
                        expect(result.reply.readSequenceable(s)).assertTrue();
                        expect(s.num).assertEqual(1);
                        expect(s.str).assertEqual("aaa");
                    } finally {
                        data.reclaim();
                        reply.reclaim();
                        done();
                    }
                }
                console.info("start send request");
                await gIRemoteObject.sendRequest(CODE_ALL_TYPE, data, reply, option, sendRequestCallback)

            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1110 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_MessageParcel_1110--------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1120
         * @tc.name    Test the cross process transmission of messageparcel.
         *             After receiving the reply message in promise, read letious types of arrays in order
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1120", 0, async function (done) {
            console.info("--------------------start SUB_DSoftbus_RPC_API_MessageParcel_1120--------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                expect(data.writeByteArray([1, 2, 3])).assertTrue();
                expect(data.writeShortArray([4, 5, 6])).assertTrue();
                expect(data.writeIntArray([7, 8, 9])).assertTrue();
                expect(data.writeLongArray([10, 11, 12])).assertTrue();
                expect(data.writeFloatArray([1.1, 1.2, 1.3])).assertTrue();
                expect(data.writeDoubleArray([2.1, 2.2, 2.3])).assertTrue();
                expect(data.writeBooleanArray([true, true, false])).assertTrue();
                expect(data.writeCharArray([65, 97, 122])).assertTrue();
                expect(data.writeStringArray(['abc', 'seggg'])).assertTrue();
                let a = [new MySequenceable(1, "aaa"), new MySequenceable(2, "bbb"),
                new MySequenceable(3, "ccc")]
                expect(data.writeSequenceableArray(a)).assertTrue();
                await gIRemoteObject.sendRequest(CODE_ALL_ARRAY_TYPE, data, reply, option).then((result) => {
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
                    new MySequenceable(null, null)]
                    result.reply.readSequenceableArray(b);
                    for (let i = 0; i < b.length; i++) {
                        expect(b[i].str).assertEqual(a[i].str);
                        expect(b[i].num).assertEqual(a[i].num);
                    }
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1120 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1120---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1130
         * @tc.name    Test messageparcel cross process delivery. After receiving the reply message in promise,
         *             the client constructs an empty array in sequence and reads the data from the reply message
         *             into the corresponding array
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1130", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1130---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                expect(data.writeByteArray([1, 2, 3])).assertTrue();
                expect(data.writeShortArray([4, 5, 6])).assertTrue();
                expect(data.writeIntArray([7, 8, 9])).assertTrue();
                expect(data.writeLongArray([10, 11, 12])).assertTrue();
                expect(data.writeFloatArray([1.1, 1.2, 1.3])).assertTrue();
                expect(data.writeDoubleArray([2.1, 2.2, 2.3])).assertTrue();
                expect(data.writeBooleanArray([true, true, false])).assertTrue();
                expect(data.writeCharArray([65, 97, 122])).assertTrue();
                expect(data.writeStringArray(['abc', 'seggg'])).assertTrue();
                let a = [new MySequenceable(1, "aaa"), new MySequenceable(2, "bbb"),
                new MySequenceable(3, "ccc")]
                expect(data.writeSequenceableArray(a)).assertTrue();
                await gIRemoteObject.sendRequest(CODE_ALL_ARRAY_TYPE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let ByteArray = new Array();
                    result.reply.readByteArray(ByteArray);
                    assertArrayElementEqual(ByteArray, [1, 2, 3]);
                    let ShortArray = new Array();
                    result.reply.readShortArray(ShortArray);
                    assertArrayElementEqual(ShortArray, [4, 5, 6]);
                    let IntArray = new Array();
                    result.reply.readIntArray(IntArray);
                    assertArrayElementEqual(IntArray, [7, 8, 9]);
                    let LongArray = new Array();
                    result.reply.readLongArray(LongArray);
                    assertArrayElementEqual(LongArray, [10, 11, 12]);
                    let FloatArray = new Array();
                    result.reply.readFloatArray(FloatArray);
                    assertArrayElementEqual(FloatArray, [1.1, 1.2, 1.3]);
                    let DoubleArray = new Array();
                    result.reply.readDoubleArray(DoubleArray);
                    assertArrayElementEqual(DoubleArray, [2.1, 2.2, 2.3]);
                    let BooleanArray = new Array();
                    result.reply.readBooleanArray(BooleanArray);
                    assertArrayElementEqual(BooleanArray, [true, true, false]);
                    let CharArray = new Array();
                    result.reply.readCharArray(CharArray);
                    assertArrayElementEqual(CharArray, [65, 97, 122]);
                    let StringArray = new Array();
                    result.reply.readStringArray(StringArray);
                    assertArrayElementEqual(StringArray, ['abc', 'seggg']);
                    let b = [new MySequenceable(null, null), new MySequenceable(null, null),
                    new MySequenceable(null, null)];
                    result.reply.readSequenceableArray(b);
                    for (let i = 0; i < b.length; i++) {
                        expect(b[i].str).assertEqual(a[i].str);
                        expect(b[i].num).assertEqual(a[i].num);
                    }
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1130 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1130---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1140
         * @tc.name    Test messageparcel to pass an object of type iremoteobject across processes
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_DSoftbus_RPC_API_MessageParcel_1140', 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1140---------------------------");
            function checkResult(num, str) {
                expect(num).assertEqual(123);
                expect(str).assertEqual("rpcListenerTest");
                done();
            }
            try {
                let option = new rpc.MessageOption();
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create()

                let listener = new TestListener("rpcListener", checkResult);
                expect(data.writeRemoteObject(listener)).assertTrue();
                expect(data.writeInt(123)).assertTrue();
                expect(data.writeString("rpcListenerTest")).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1140 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1140---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1150
         * @tc.name    Test messageparcel to pass an array of iremoteobject objects across processes
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_DSoftbus_RPC_API_MessageParcel_1150', 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1150---------------------------");

            let count = 0;
            function checkResult(num, str) {
                expect(num).assertEqual(123);
                expect(str).assertEqual("rpcListenerTest");
                count++
                console.info("check result done, count: " + count);
                if (count == 3) {
                    done();
                }
            }
            try {
                let option = new rpc.MessageOption();
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)]
                expect(data.writeRemoteObjectArray(listeners)).assertTrue();
                expect(data.writeInt(123)).assertTrue();
                expect(data.writeString("rpcListenerTest")).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECTARRAY_1, data, reply, option)
                    .then((result) => {
                        expect(result.errCode).assertEqual(0);
                        result.reply.readException();
                    })
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1150 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1150---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1160
         * @tc.name    Test messageparcel to pass the array of iremoteobject objects across processes. The server
         *             constructs an empty array in onremoterequest and reads it from messageparcel
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_DSoftbus_RPC_API_MessageParcel_1160', 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1160---------------------------");
            let count = 0;
            function checkResult(num, str) {
                expect(num).assertEqual(123);
                expect(str).assertEqual("rpcListenerTest");
                count++
                console.info("check result done, count: " + count);
                if (count == 3) {
                    done();
                }
            }
            try {
                let option = new rpc.MessageOption();
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let listeners = [new TestListener("rpcListener", checkResult),
                new TestListener("rpcListener2", checkResult),
                new TestListener("rpcListener3", checkResult)]
                expect(data.writeRemoteObjectArray(listeners)).assertTrue();
                data.readRemoteObjectArray();
                expect(data.writeInt(123)).assertTrue();
                expect(data.writeString("rpcListenerTest")).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_REMOTEOBJECTARRAY_2, data, reply, option)
                    .then((result) => {
                        expect(result.errCode).assertEqual(0);
                        result.reply.readException();
                    })
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1160 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1160---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1170
         * @tc.name    Invoke the rewindRead interface,Set 0-bit offset and read the data after offset
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1170", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1170---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageParcel.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1170 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1170---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1180
         * @tc.name    Invoke the rewindRead interface,Set 1-bit offset and read the data after offset
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1180", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1170---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageParcel.create();
                expect(data.writeInt(12)).assertTrue();
                expect(data.writeString("parcel")).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode == 0).assertTrue();
                    expect(result.reply.readInt()).assertEqual(12);
                    expect(result.reply.rewindRead(1)).assertTrue();
                    expect(result.reply.readInt()).assertEqual(0);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1180 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1180---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1190
         * @tc.name    Invoke the rewindWrite interface, Set 0-bit offset and write the data after offset
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1190", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1180---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageParcel.create();
                expect(data.writeInt(4)).assertTrue();
                expect(data.rewindWrite(0)).assertTrue();
                expect(data.writeInt(5)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode == 0).assertTrue();
                    expect(result.reply.readInt()).assertEqual(5);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1190 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1190---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1200
         * @tc.name    Invoke the rewindWrite interface, Set 1-bit offset and write the data after offset
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1200", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1200---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageParcel.create();
                expect(data.writeInt(4)).assertTrue();
                expect(data.rewindWrite(1)).assertTrue();
                expect(data.writeInt(5)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt() != 5).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1200 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1200---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1210
         * @tc.name    setCapacity Sets the storage capacity of the null MessageParcel instance. The getCapacity
                       obtains the current MessageParcel capacity
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1210", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1210---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageParcel.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1210 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1210---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1220
         * @tc.name    setCapacity Sets the storage capacity of the MessageParcel instance. The getCapacity
                       obtains the current MessageParcel capacity
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1220", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1220---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageParcel.create();
                expect(data.writeString("constant")).assertTrue();
                expect(data.setCapacity(100)).assertTrue();
                expect(data.getCapacity()).assertEqual(100);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("constant");
                    expect(result.reply.getCapacity()).assertEqual(("constant".length * 2) + 8);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1220 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1220---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1230
         * @tc.name    Setcapacity test: size limit verification of messageparcel instance
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1230", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1230---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                expect(data.getCapacity()).assertEqual(0);
                expect(data.writeString("constant")).assertTrue();
                let getSizedata = data.getSize();
                expect(data.setCapacity(getSizedata + 1)).assertTrue();
                expect(data.getCapacity()).assertEqual((getSizedata + 1));
                expect(data.setCapacity(getSizedata)).assertEqual(false);
                expect(data.getCapacity()).assertEqual((getSizedata + 1));
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1230 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1230---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1240
        * @tc.name    SetCapacity Tests the storage capacity threshold of the MessageParcel instance
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1240", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1240---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageParcel.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1240 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1240---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1250
        * @tc.name    Setcapacity test storage capacity boundary value verification of messageparcel instance
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1250", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1250---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                expect(data.getSize()).assertEqual(0);
                expect(data.setCapacity(M)).assertTrue();
                expect(data.getCapacity()).assertEqual(M);
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1250: setCapacity " + data.setCapacity(2 * G));
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1250: setCapacity " + data.getCapacity());
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1250 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1250---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1260
         * @tc.name    setSize Sets the size of the data contained in the MessageParcel instance. The getSize command
                        reads the data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1260", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1260---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageParcel.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1260 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1260---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1270
         * @tc.name    SetSize: Increases the value of the data contained in the MessageParcel instance by 1,
                        Write setSize
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1270", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1270---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageParcel.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1270 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1270---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1280
         * @tc.name    Verify the messageparcel instance SetSize setting and the instance capacitydata qualification verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1280", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1280---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                expect(data.getSize()).assertEqual(0);
                expect(data.writeString("constant")).assertTrue();
                expect(data.getSize()).assertEqual(("constant".length * 2) + 8);
                let getCapacitydata = data.getCapacity();
                expect(data.setSize(getCapacitydata)).assertTrue();
                expect(data.getSize()).assertEqual(getCapacitydata);
                expect(data.setSize(getCapacitydata + 1)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1280 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1280---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1290
         * @tc.name    setSize Sets the storage capacity of the MessageParcel instance to decrease by one.
                       The getSize obtains the current MessageParcel capacity
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1290", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1290---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageParcel.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1290 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1290---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1300
         * @tc.name    Validate the setSize boundary value in the MessageParcel instance
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1300", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1300---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                expect(data.getCapacity()).assertEqual(0);
                expect(data.setSize(4 * G)).assertTrue();
                expect(data.getSize()).assertEqual(0);
                expect(data.setSize(4 * G - 1)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1300 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1300---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1310
         * @tc.name    Verify that setSize is out of bounds in a MessageParcel instance
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1310", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1310---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                expect(data.setSize(0)).assertTrue();
                expect(data.getSize()).assertEqual(0);
                expect(data.setSize(2 * 4 * G)).assertTrue();
                expect(data.getSize()).assertEqual(0);
                expect(data.setSize(2 * G)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1310 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1310---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1320
         * @tc.name    Obtains the write and read positions of the MessageParcel
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1320", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1320---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageParcel.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1320 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1320---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1330
         * @tc.name    Obtaining the Writable and Readable Byte Spaces of MessageParcel
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1330", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1330---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageParcel.create();
                expect(data.getWritableBytes()).assertEqual(0);
                expect(data.writeInt(10)).assertTrue();
                expect(data.getWritableBytes()).assertEqual(60);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(10);
                    expect(result.reply.getReadableBytes()).assertEqual(0);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1330 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1330---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1340
         * @tc.name    Obtains the writeable and readable byte space and read position of the MessageParcel
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1340", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1340---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageParcel.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1340 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1340---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1350
        * @tc.name    Get the space size of messageparcel to pass rawdata data
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1350", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1350---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                var reply = rpc.MessageParcel.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1350 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1350---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1360
         * @tc.name    Test fixed MessageParcel space size to pass rawData data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1360", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1360---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                expect(data.getRawDataCapacity()).assertEqual(128 * M);
                let rawdata = [1, 2, 3];
                let option = new rpc.MessageOption();
                var reply = rpc.MessageParcel.create();
                expect(data.writeInt(rawdata.length)).assertTrue();
                expect(data.writeRawData(rawdata, rawdata.length)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_RAWDATA, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let size = result.reply.readInt();
                    expect(result.reply.readRawData(size) != rawdata).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1360 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1360---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1370
         * @tc.name    Test messageparcel delivery file descriptor object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1370", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1370---------------------------");
            try {
                let testab = new TestProxy(gIRemoteObject).asObject();
                expect(testab != null).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1370 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1370---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1380
         * @tc.name    Test that the asObject interface is called by a RemoteObject and returns itself
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1380", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1380---------------------------");
            try {
                let testRemoteObject = new TestRemoteObject("testObject");
                expect(testRemoteObject.asObject() != null).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1380 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1380---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1390
         * @tc.name    MessageParcel sendMessageRequest API test
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1390", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1390---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let rawdata = [1, 2, 3];
                let option = new rpc.MessageOption();
                var reply = rpc.MessageSequence.create();
                data.getRawDataCapacity();
                data.writeInt(rawdata.length);
                data.writeRawData(rawdata, rawdata.length);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_RAWDATA, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt()).assertEqual(rawdata.length);
                    expect(result.reply.readRawData(rawdata.length) != rawdata).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1390 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1390---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1400
        * @tc.name    Invoke the writestring interface to write data to the messageparcel instance SendRequest Asynchronous
        *               Authentication onRemoteMessageRequest Server Processing
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1400", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1400---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = 'onRemoteMessageRequest invoking';
                expect(data.writeString(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_ONREMOTEMESSAGE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1400 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1400---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1410
        * @tc.name    Invoke the writestring interface to write data to the messageparcel instance sendMessageRequest Asynchronous
        *               Authentication onRemoteMessageRequest Server Processing
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1410", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1410---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = 'onRemoteMessageRequest invoking';
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_ONREMOTEMESSAGE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1410 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1410---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1420
        * @tc.name    Invoke the writestring interface to write data to the messageparcel instance. SendRequest asynchronously
        *               verifies the priority processing levels of onRemoteMessageRequest and onRemoteRequest
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1420", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1420---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = "onRemoteRequest or onRemoteMessageRequest invoking";
                expect(data.writeString(token)).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_ONREMOTEMESSAGE_OR_ONREMOTEREQUEST, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("onRemoteMessageRequest invoking");
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1420 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1420---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1430
        * @tc.name   Invoke the writestring interface to write data to the messageparcel instance. sendMessageRequest asynchronously verifies
        *               the priority processing levels of onRemoteMessageRequest and onRemoteRequest
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1430", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1430---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = "onRemoteRequest or onRemoteMessageRequest invoking";
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_ONREMOTEMESSAGE_OR_ONREMOTEREQUEST, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("onRemoteMessageRequest invoking");
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1430 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1430---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1440
        * @tc.name    writeString check param error Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1440", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1440---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = '';
                for (let i = 0; i < 40 * K; i++) {
                    token += 'a';
                };
                data.writeString(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1440 error: " + error);
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1440---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1450
        * @tc.name    writeInterfaceToken Sequence memory alloc failed Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1450", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1450---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                data.setSize(0);
                data.setCapacity(0);
                let token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1450 error: " + error);
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1450---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1460
        * @tc.name    writeInterfaceToken Write data to message sequence failed Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1460", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1460---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                data.setSize(true);
                data.setCapacity(true);
                let token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1460 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1460---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1470
        * @tc.name    readParcelable Sequence memory alloc failed Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1470", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1470---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let sequenceable = new MySequenceable(1, "aaa");
                data.writeParcelable(sequenceable);
                let ret = new MySequenceable(0, "");
                data.setCapacity(0);
                data.readParcelable(ret);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1470 error: " + error);
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1470---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1480
        * @tc.name    writeRemoteObject is proxy or remote object is invalid Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3    
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1480", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1480---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = {};
                data.writeRemoteObject(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1480 error: " + error);
                let errCode = `${rpc.ErrorCode.PROXY_OR_REMOTE_OBJECT_INVALID_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1480---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1490
        * @tc.name    readParcelable is Call JS callback function failedv Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1490", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1490---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1490: create object successfully.");
                let sequenceable = new MySequenceableCode(1, "aaa");
                data.writeParcelable(sequenceable);
                data.setCapacity(0);
                data.setSize(0);
                let ret = new MySequenceable(1, "");
                data.readParcelable(ret);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1490 error: " + error);
                let errCode = `${rpc.ErrorCode.CALL_JS_METHOD_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code != errCode).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1490---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageParcel_1500
        * @tc.name    Invoke the writeinterfacetoken interface, write the interface descriptor, and verify the error code 
        *               that fails to be read from the interfacetoken interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageParcel_1500", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageParcel_1500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                let token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
                data.setCapacity(0);
                data.setSize(0);
                data.readInterfaceToken();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageParcel_1500 error: " + error);
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code != errCode).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageParcel_1500---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_0100
         * @tc.name    Test the getwaittime basic method of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageOption_0100", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_0100---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getWaitTime()).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
                option.setWaitTime(16);
                expect(option.getWaitTime()).assertEqual(16);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_0100 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_0100---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_0200
         * @tc.name    Test the getwaittime boundary value of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageOption_0200", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_0200---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getWaitTime()).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
                option.setWaitTime(0);
                expect(option.getWaitTime()).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
                option.setWaitTime(60);
                expect(option.getWaitTime()).assertEqual(60);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_0200 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_0200---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_0300
         * @tc.name    Test the getwaittime minimum out of range value of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageOption_0300", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_0300---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getWaitTime()).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
                option.setWaitTime(-1);
                expect(option.getWaitTime()).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_0300 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_0300---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_0400
         * @tc.name    Test the getwaittime maxmum out of range value of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageOption_0400", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_0400---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getWaitTime()).assertEqual(rpc.MessageOption.TF_WAIT_TIME);
                option.setWaitTime(61);
                expect(option.getWaitTime()).assertEqual(61);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_0400 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_0400---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_0500
         * @tc.name    Test the getflags basic method of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageOption_0500", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_0500---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getFlags()).assertEqual(rpc.MessageOption.TF_SYNC);
                option.setFlags(1);
                expect(option.getFlags()).assertEqual(rpc.MessageOption.TF_ASYNC);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_0500 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_0500---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_0600
         * @tc.name    Test the setflags basic method of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageOption_0600", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_0600---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getFlags()).assertEqual(rpc.MessageOption.TF_SYNC);
                option.setFlags(1);
                expect(option.getFlags()).assertEqual(rpc.MessageOption.TF_ASYNC);
                option.setFlags(0);
                expect(option.getFlags()).assertEqual(rpc.MessageOption.TF_ASYNC);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_0600 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_0600---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_0700
         * @tc.name    Test the setflags exception value of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageOption_0700", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_0700---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getFlags()).assertEqual(rpc.MessageOption.TF_SYNC);
                option.setFlags(-1);
                expect(option.getFlags()).assertEqual(-1);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_0700 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_0700---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_0800
         * @tc.name    Test the unqualified value of setflags of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageOption_0800", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_0800---------------------------");
            try {
                let option = new rpc.MessageOption();
                expect(option.getFlags()).assertEqual(rpc.MessageOption.TF_SYNC);
                option.setFlags(3);
                expect(option.getFlags()).assertEqual(3);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_0800 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_0800---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_0900
         * @tc.name    Test constant value detection of messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_MessageOption_0900", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_0900---------------------------");
            try {
                expect(rpc.MessageOption.TF_SYNC).assertEqual(0);
                expect(rpc.MessageOption.TF_ASYNC).assertEqual(1);
                expect(rpc.MessageOption.TF_WAIT_TIME).assertEqual(4);
                expect(rpc.MessageOption.TF_ACCEPT_FDS).assertEqual(0x10);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_0900 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_0900---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_1000
         * @tc.name    Basic method of testing messageoption
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageOption_1000", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_1000---------------------------");
            try {

                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                option.setWaitTime(20);
                option.setFlags(0);
                let token = "option";
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_1000 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_1000---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_1100
         * @tc.name    Test the setflags of messageoption asynchronously and the sendrequest callback result
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageOption_1100", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_1100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                option.setFlags(1);
                let token = "option";
                expect(data.writeString(token)).assertTrue();
                expect(option.getFlags()).assertEqual(1);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("");
                    expect(option.getFlags()).assertEqual(1);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_1100 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_1100---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_1200
         * @tc.name    MessageOption sendMessageRequest test
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_MessageOption_1200", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_1200---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                option.setFlags(1);
                data.writeString("option");
                expect(option.getFlags()).assertEqual(1);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("");
                    expect(option.getFlags()).assertEqual(1);

                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_1200 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_1200---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_1300
        * @tc.name    setAsync sendMessageRequest test
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageOption_1300", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_1300---------------------------");
            try {
                let option = new rpc.MessageOption();
                option.setAsync(3);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_1300 error: " + error);
                expect(error != null).assertTrue();
            }
            done();
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_1300---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_1400
        * @tc.name    MessageOption sendMessageRequest test
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageOption_1400", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_1400---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = "option";
                data.writeString(token);
                expect(option.isAsync()).assertEqual(false);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(option.isAsync()).assertEqual(false);
                    expect(result.reply.readString()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_1400 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_1400---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_1500
        * @tc.name    MessageOption setAsync is true test
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_MessageOption_1500", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_1500---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                option.setAsync(true);
                let token = "option";
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(option.isAsync()).assertTrue();
                    expect(result.reply.readString()).assertEqual("");
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_1500 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_1500---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_MessageOption_1600
        * @tc.name    setAsync is false sendMessageRequest test
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_MessageOption_1600", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_MessageOption_1600---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                option.setAsync(false);
                let token = "option";
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(option.isAsync()).assertEqual(false);
                    expect(result.reply.readString()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_MessageOption_1600 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_MessageOption_1600---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_0100
         * @tc.name    Exception parameter validation of the created anonymous shared memory object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_0100", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_0100---------------------------");
            try {
                expect(rpc.Ashmem.createAshmem("JsAshmemTest", -1) == null).assertTrue();
                expect(rpc.Ashmem.createAshmem(null, 1024) == null).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_0100 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_0100---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_0200
         * @tc.name    Call the getashmemsize interface to get the size of the shared memory object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_0200", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_0200---------------------------");
            try {
                let mapSize = 2 * G - 1;
                let jsash = "";
                for (let i = 0; i < (256 - 1); i++) {
                    jsash += "a";
                }
                let ashmem = rpc.Ashmem.createAshmem(jsash, mapSize);
                expect(ashmem != null).assertTrue();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_0200 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_0200---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_0300
         * @tc.name    Call the getashmemsize interface to get the size of the exception shared memory object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_0300", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_0300---------------------------");
            try {
                let mapSize = 2 * G - 1;
                let jsash = "";
                for (let i = 0; i < 256; i++) {
                    jsash += "a";
                }
                let ashmem = rpc.Ashmem.createAshmem(jsash, mapSize);
                expect(ashmem == undefined).assertTrue();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_0300 error: " + error);
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_0300---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_0400
         * @tc.name    Call the getashmemsize interface to get the size of the maximum shared memory object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_0400", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_0400---------------------------");
            try {
                let mapSize = 2 * G - 1;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize);
                expect(ashmem != null).assertTrue();
                expect(ashmem.getAshmemSize()).assertEqual(mapSize);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_0400 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_0400---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_500
         * @tc.name    Call the getashmemsize interface to obtain the maximum size of the out of bounds shared memory object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_0500", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_0500---------------------------");
            try {
                let mapSize = 2 * G;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize);
                expect(ashmem == undefined).assertTrue();
                expect(ashmem.getAshmemSize()).assertEqual(mapSize);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_0500 error: " + error);
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_0500---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_0600
         * @tc.name    Writeashmem exception validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_0600", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_0600---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem != null).assertTrue();
                ashmem.closeAshmem();
                var data = rpc.MessageParcel.create();
                expect(data.writeAshmem(ashmem)).assertEqual(false);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_0600 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_0600---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_0700
         * @tc.name    Verifying the Readfromashmem Interface and Disabling the Ashmem Interface
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_0700", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_0700---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem != null).assertTrue();
                ashmem.unmapAshmem();
                let bytes = [1, 2, 3, 4, 5];
                expect(ashmem.readFromAshmem(bytes.length, 0) == null).assertTrue();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_0700 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_0700---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_0800
         * @tc.name    Mapashmem interface creates shared file mappings
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_0800", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_0800---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem != null).assertTrue();
                expect(ashmem.mapAshmem(rpc.Ashmem.PROT_READ)).assertTrue();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_0800 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_0800---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_0900
         * @tc.name    Mapashmem exception validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_0900", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_0900---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", (2 * G - 1));
                expect(ashmem != null).assertTrue();
                expect(ashmem.mapAshmem(999)).assertEqual(false);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_0900 error: " + error);
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_0900---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_1000
         * @tc.name    Mapreadandwriteashmem interface creates a shared file map with the protection level of read-write
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_1000", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_1000---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
                expect(ashmem != null).assertTrue();
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_1000 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_1000---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_1100
         * @tc.name    Mapreadandwriteashmem exception validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_1100", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_1100---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem != null).assertTrue();
                expect(ashmem.mapAshmem(rpc.Ashmem.PROT_READ)).assertTrue();
                ashmem.unmapAshmem();
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_1100 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_1100---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_1200
         * @tc.name    Mapreadonlyashmem interface createAshmem a shared file map with the protection level of read-write
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_1200", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_1200---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem != null).assertTrue();
                expect(ashmem.mapReadOnlyAshmem()).assertTrue();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_1200 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_1200---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_1300
         * @tc.name    Mapreadonlyashmem exception validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_1300", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_1300---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
                expect(ashmem != null).assertTrue();
                expect(ashmem.mapAshmem(rpc.Ashmem.PROT_WRITE)).assertTrue();

                ashmem.unmapAshmem();
                ashmem.closeAshmem();
                expect(ashmem.mapReadOnlyAshmem()).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_1300 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_1300---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_1400
         * @tc.name    Setprotection: sets the protection level of the memory area to which the shared file is mapped
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_1400", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_1400---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
                expect(ashmem.setProtection(rpc.Ashmem.PROT_WRITE)).assertTrue();
                expect(ashmem.setProtection(rpc.Ashmem.PROT_READ)).assertEqual(false);
                expect(ashmem.mapReadAndWriteAshmem()).assertEqual(false);
                expect(ashmem.setProtection(rpc.Ashmem.PROT_NONE)).assertTrue();
                expect(ashmem.setProtection(rpc.Ashmem.PROT_READ)).assertEqual(false);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_1400 error: " + error);
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_1400---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_1500
         * @tc.name    Setprotection exception input parameter verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_1500", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_1500---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
                expect(ashmem.setProtection(3)).assertTrue();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_1500 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_1500---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_1600
         * @tc.name    The writetoashmem interface writes the shared file associated with the object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_1600", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_1600---------------------------");
            try {
                let mapSize = 4096;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [1, 2, 3, 4, 5];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertTrue();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_1600 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_1600---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_1700
         * @tc.name    Writetoashmem interface writes the shared file associated with the object (file boundary value)
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_1700", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_1700---------------------------");
            try {
                let mapSize = 4096;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [-2147483648, 2147483647];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertTrue();
                assertArrayElementEqual(ashmem.readFromAshmem(bytes.length, 0), bytes);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_1700 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_1700---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_1800
         * @tc.name    The writetoashmem interface writes the shared data associated with the object minimum boundary crossing file
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_1800", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_1800---------------------------");
            try {
                let mapSize = 4096;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [-2147483649, 2147483647];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertTrue();
                let readresult = ashmem.readFromAshmem(bytes.length, 0);
                expect(readresult[0]).assertEqual(2147483647);
                expect(readresult[1]).assertEqual(bytes[1]);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_1800 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_1800---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_1900
         * @tc.name    The writetoashmem interface writes the shared data associated with the object maximum boundary crossing file
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_1900", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_1900---------------------------");
            try {
                let mapSize = 4096;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [-2147483648, 2147483648];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertTrue();
                let reresult = ashmem.readFromAshmem(bytes.length, 0);
                expect(reresult[0]).assertEqual(bytes[0]);
                expect(reresult[1]).assertEqual(-2147483648);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_1900 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_1900---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_2000
         * @tc.name    Writetoashmem interface: writes the boundary location to the shared file associated with the object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_2000", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_2000---------------------------");
            try {
                let mapSize = 2 * M;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [0, 1];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 2147483647/4)).assertEqual(false);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_2000 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_2000---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_2100
         * @tc.name    Writetoashmem interface: writes the shared file associated with the object at the out of bounds position
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_2100", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_2100---------------------------");
            try {
                let mapSize = 2 * M;
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", mapSize);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [0, 1];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 2147483648/4)).assertEqual(false);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_2100 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_2100---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_2200
         * @tc.name    After the permission is set, the writetoashmem interface writes the shared file associated with the object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_2200", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_2200---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [1, 2, 3, 4, 5];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertTrue();
                expect(ashmem.setProtection(rpc.Ashmem.PROT_READ)).assertTrue();
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertEqual(false);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_2200 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_2200---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_2300
         * @tc.name    Writetoashmem exception validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_2300", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_2300---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [1, 2, 3, 4, 5];
                let size = bytes.length + 10;
                expect(ashmem.writeToAshmem(bytes, 3, 0)).assertTrue();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_2300 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_2300---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_2400
         * @tc.name    Read data from the shared file associated with readfromashmem
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_2400", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_2400---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [1, 2, 3, 4, 5];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertTrue();
                let resultRead = ashmem.readFromAshmem(bytes.length, 0);
                assertArrayElementEqual(resultRead, bytes);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_2400 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_2400---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_2500
         * @tc.name    Readfromashmem exception validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_2500", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_2500---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [1, 2, 3, 4, 5];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 1)).assertTrue();
                let result2 = ashmem.readFromAshmem(bytes.length, 3);
                expect(bytes[2]).assertEqual(result2[0]);
                expect(bytes[3]).assertEqual(result2[1]);
                expect(bytes[4]).assertEqual(result2[2]);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_2500 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_2500---------------------------");
        })


        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_2600
         * @tc.name    Createashmemfromexisting copies the ashmem object description and creates a new object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_2600", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_2600---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 4096);
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [1, 2, 3];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 1)).assertTrue();
                let newashmem = rpc.Ashmem.createAshmemFromExisting(ashmem);
                expect(newashmem.mapReadAndWriteAshmem()).assertTrue();
                assertArrayElementEqual(newashmem.readFromAshmem(bytes.length, 1), bytes);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
                newashmem.unmapAshmem();
                newashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_2600 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_2600---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_2700
         * @tc.name    Create a shared memory object and call writeashmem to write the shared anonymous
          object into the messageparcel object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_2700", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_2700---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
                var data = rpc.MessageParcel.create();
                expect(ashmem.mapReadAndWriteAshmem()).assertTrue();
                let bytes = [1, 2, 3];
                expect(ashmem.writeToAshmem(bytes, bytes.length, 0)).assertTrue();
                expect(data.writeAshmem(ashmem)).assertTrue();
                let retReadAshmem = data.readAshmem();
                assertArrayElementEqual(ashmem.readFromAshmem(bytes.length, 0), bytes);
                expect(retReadAshmem.readFromAshmem(bytes.length, 0) == undefined).assertTrue();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_2700 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_2700---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_2800
         * @tc.name    Create a non shared memory object and call writeashmem to write the messageparcel object
          object into the messageparcel object
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_2800", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_2800---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var data2 = rpc.MessageParcel.create();
                expect(data.writeAshmem(data2)).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_2800 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
                data2.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_2800---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_2900
         * @tc.name    Test the ashmem object passed by messageparcel
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_Ashmem_2900", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_2900---------------------------");
            try {
                let ashmem = rpc.Ashmem.createAshmem("JsAshmemTest", 1024);
                expect(ashmem.setProtection(rpc.Ashmem.PROT_EXEC)).assertTrue();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_2900 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_2900---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_3000
        * @tc.name    mapTypedAshmem interface creates shared file mappings
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_3000", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_3000---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", 4 * K);
                expect(ashmem != null).assertTrue();
                ashmem.mapTypedAshmem(ashmem.PROT_READ | ashmem.PROT_WRITE);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_3000 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_3000---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_3100
        * @tc.name    mapTypedAshmem exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_3100", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_3100---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", (2 * G - 1));
                expect(ashmem != null).assertTrue();
                ashmem.mapTypedAshmem(999);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_3100 error: " + error);
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_3100---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_3200
        * @tc.name    mapTypedAshmem exception errorcode validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_3200", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_3200---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", (2 * G));
                expect(ashmem != null).assertTrue();
                ashmem.mapTypedAshmem(ashmem.PROT_READ | ashmem.PROT_WRITE);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_3200 error: " + error);
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_3200---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_3300
        * @tc.name    mapReadWriteAshmem interface creates a shared file map with the protection level of read-write
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_3300", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_3300---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", K);
                ashmem.mapReadWriteAshmem();
                console.info("SUB_DSoftbus_RPC_API_Ashmem_3300: run mapReadWriteAshmem is success");
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_3300 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_3300---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_3400
        * @tc.name    mapReadWriteAshmem exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_3400", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_3400---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", 4096);
                expect(ashmem != null).assertTrue();
                ashmem.mapTypedAshmem(rpc.Ashmem.PROT_READ);
                ashmem.unmapAshmem();
                ashmem.mapReadWriteAshmem();
                console.info("SUB_DSoftbus_RPC_API_Ashmem_3400: run mapReadWriteAshmem is success");
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_3400 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_3400---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_3500
        * @tc.name    Mapreadonlyashmem interface creates a shared file map with the protection level of read-write
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_3500", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_3500---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", 4096);
                expect(ashmem != null).assertTrue();
                ashmem.mapReadonlyAshmem();
                console.info("SUB_DSoftbus_RPC_API_Ashmem_3500: run mapReadonlyAshmem is success");
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_3500 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_3500---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_3600
        * @tc.name    MapReadWriteAshmem level setting, exception verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_3600", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_3600---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", K);
                ashmem.setProtectionType(rpc.Ashmem.PROT_WRITE);
                ashmem.setProtectionType(rpc.Ashmem.PROT_READ);
                ashmem.mapReadWriteAshmem();
                ashmem.setProtectionType(rpc.Ashmem.PROT_NONE);
                ashmem.setProtectionType(rpc.Ashmem.PROT_READ);
                console.info("SUB_DSoftbus_RPC_API_Ashmem_3600: run is success");
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_3600 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_3600---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_3700
        * @tc.name    setProtectionType exception input parameter verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_3700", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_3700---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", K);
                expect(ashmem != null).assertTrue();
                ashmem.setProtectionType(3);
                console.info("SUB_DSoftbus_RPC_API_Ashmem_3700: run setProtectionType is success");
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_3700 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_3700---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_3800
        * @tc.name    setProtectionType: Set the protection level and writeToAshmem write verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_3800", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_3800---------------------------");
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
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_3800 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_3800---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_3900
        * @tc.name    Create a non shared memory object and call setProtectionType to write the messageparcel object
        *               object into the messageparcel object
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_3900", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_3900---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", K);
                ashmem.setProtectionType(rpc.Ashmem.PROT_EXEC);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_3900 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_3900---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_4000
        * @tc.name    Verify that the read-only memory deletion ID is abnormal
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_4000", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_4000---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", K);
                expect(ashmem != null).assertTrue();
                ashmem.mapTypedAshmem(rpc.Ashmem.PROT_WRITE);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
                ashmem.mapReadonlyAshmem();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
                console.info("SUB_DSoftbus_RPC_API_Ashmem_4000: run mapReadonlyAshmem is success");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_4000 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_4000---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_4100
        * @tc.name    createAshmem Check Parameter Out-of-Bounds Error Message Verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_4100", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_4100---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("ashmem", (2 * G + 1));
                console.info("SUB_DSoftbus_RPC_API_Ashmem_4100: ashmem " + ashmem);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_4100 error: " + error);
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_4100---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_4200
        * @tc.name    mapReadWriteAshmem exception validation 1900001
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_4200", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_4200---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("ashmem", (4 * G - 1));
                expect(ashmem != null).assertTrue();
                ashmem.mapReadWriteAshmem();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_4200 error: " + error);
                let errCode = `${rpc.ErrorCode.OS_MMAP_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_4200---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_4300
        * @tc.name    createAshmem check param error Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_4300", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_4300---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("ashmem", 0);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_4300 error: " + error);
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_4300---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_4400
        * @tc.name    setProtectionType exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_4400", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_4400---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("ashmem", 1024 * 1024);
                expect(ashmem != null).assertTrue();
                ashmem.setProtectionType(0);
                console.info("SUB_DSoftbus_RPC_API_Ashmem_4400: run setProtectionType is success");
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_4400 error: " + error);
                expect(error).assertEqual(null);
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_4400---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_4500
        * @tc.name    setProtectionType check param error Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_4500", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_4500---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("ashmem", 1024 * 1024);
                expect(ashmem != null).assertTrue();
                ashmem.setProtectionType(rpc.Ashmem.PROT_WRITE, rpc.Ashmem.PROT_READ);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_4500 error: " + error);
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_4500---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_4600
        * @tc.name    setProtectionType is 1900002 exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_4600", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_4600---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("ashmem", 1024 * 1024);
                expect(ashmem != null).assertTrue();
                ashmem.setProtectionType(null);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_4600 error: " + error);
                let errCode = `${rpc.ErrorCode.OS_IOCTL_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_4600---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_4700
        * @tc.name    writeAshmem errCode 1900003 exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_4700", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_4700---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var data2 = rpc.MessageSequence.create();
                data.writeAshmem(data2);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_4700 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_TO_ASHMEM_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error != null).assertTrue();
            } finally{
                data.reclaim();
                data2.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_4700---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_4800
        * @tc.name    readAshmem exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_4800", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_4800---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("ashmem", 1024);
                expect(ashmem != null).assertTrue();
                ashmem.mapReadWriteAshmem();
                let ByteArraylet = [1, 2, 3, 4, 5];
                ashmem.writeAshmem(ByteArraylet, 5, 0);
                let readResult = ashmem.readAshmem(5, 0);
                assertArrayElementEqual(readResult, ByteArraylet);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_4800 error: " + error);
                let errCode = `${rpc.ErrorCode.READ_FROM_ASHMEM_ERROR}`;
                expect(error.code != errCode).assertEqual(null);
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_4800---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_4900
        * @tc.name    mapTypedAshmem check param error Error message verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_4900", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_4900---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", (2 * G - 1));
                expect(ashmem != null).assertTrue();
                let result = ashmem.mapTypedAshmem(999);
                expect(result).assertEqual(false);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_4900 error: " + error);
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_4900---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_Ashmem_5000
        * @tc.name    mapTypedAshmem exception validation
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_Ashmem_5000", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Ashmem_5000---------------------------");
            try {
                let ashmem = rpc.Ashmem.create("JsAshmemTest", (2 * G - 1));
                expect(ashmem != null).assertTrue();
                ashmem.mapTypedAshmem(999);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_Ashmem_5000 error: " + error);
                let errCode = `${rpc.ErrorCode.OS_MMAP_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Ashmem_5000---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IRemoteObject_0100
         * @tc.name    Call sendrequestresult interface to send data
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_IRemoteObject_0100", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IRemoteObject_0100---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let sequenceable = new MySequenceable(1, "aaa");
                expect(data.writeSequenceable(sequenceable)).assertTrue();
                await gIRemoteObject.sendRequest(CODE_WRITESEQUENCEABLE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let ret = new MySequenceable(0, '');
                    expect(result.reply.readSequenceable(ret)).assertTrue();
                    expect(ret.num).assertEqual(1);
                    expect(ret.str).assertEqual("aaa");
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_0100 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IRemoteObject_0100---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IRemoteObject_0200
         * @tc.name    Test that messageparcel passes through the same process, and the client
         *             receives the reply message in promise
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_IRemoteObject_0200", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IRemoteObject_0200---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
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
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_0200 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IRemoteObject_0200---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IRemoteObject_0300
         * @tc.name    Test that messageparcel passes through the same process, and the client
         *             receives the reply message in the callback function
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_IRemoteObject_0300", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IRemoteObject_0300---------------------------");
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
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
                        data.reclaim();
                        reply.reclaim();
                        done();
                    }
                }
                console.info("start send request");
                await gIRemoteObject.sendRequest(CODE_ALL_TYPE, data, reply, option, sendRequestCallback);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_0300 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_IRemoteObject_0300--------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IRemoteObject_0400
         * @tc.name    addDeathRecipient, register death notification verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_IRemoteObject_0400", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IRemoteObject_0400---------------------------");
            try {
                let object = new TestAbilityStub("Test1");
                expect(object.addDeathRecipient(null, 0)).assertEqual(false);
                expect(object.removeDeathRecipient(null, 0)).assertEqual(false);
                expect(object.isObjectDead()).assertEqual(false);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_0400 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IRemoteObject_0400---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IRemoteObject_0500
         * @tc.name    Do not get the server agent, do not create a remoteobject instance, and directly getcallingpid,
         *             getcallingpid, getcallingdeviceid, getlocaldeviceid
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_IRemoteObject_0500", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IRemoteObject_0500---------------------------");
            try {
                expect(rpc.IPCSkeleton.getCallingPid() != null).assertTrue();
                expect(rpc.IPCSkeleton.getCallingUid() != null).assertTrue();
                expect(rpc.IPCSkeleton.getCallingDeviceID()).assertEqual("");
                expect(rpc.IPCSkeleton.getLocalDeviceID()).assertEqual("");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_0500 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IRemoteObject_0500---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IRemoteObject_0600
         * @tc.name    Querylocalinterface searches for objects based on descriptors
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_IRemoteObject_0600", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IRemoteObject_0600---------------------------");
            try {
                let object = new TestAbilityStub("Test1");
                expect(object.isObjectDead()).assertEqual(false);
                expect(object.getCallingPid() != null).assertTrue();
                expect(object.getCallingUid() != null).assertTrue();
                object.attachLocalInterface(object, "Test1");
                expect(object.queryLocalInterface("Test1") != null).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_0600 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IRemoteObject_0600---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IRemoteObject_0700
         * @tc.name    Getinterfacedescriptor to get the interface description
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_IRemoteObject_0700", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IRemoteObject_0700---------------------------");
            try {
                let object = new TestAbilityStub("Test1223");
                expect(object.isObjectDead()).assertEqual(false);
                expect(object.getCallingPid() != null).assertTrue();
                expect(object.getCallingUid() != null).assertTrue();
                object.attachLocalInterface(object, "test1");
                expect(object.getInterfaceDescriptor() != null).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_0700 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IRemoteObject_0700---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IRemoteObject_0800
         * @tc.name    IRemoteObject sendMessageRequest API Test
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_IRemoteObject_0800", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IRemoteObject_0800---------------------------");
            try {
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
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
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_0800 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IRemoteObject_0800---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IRemoteObject_0900
         * @tc.name    Test that messageparcel passes through the same process, and the client
         *             receives the reply message in the callback function
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_IRemoteObject_0900", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IRemoteObject_0900---------------------------");
            try {
                let object = new TestAbilityStub("TestAbilityStub");
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
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
                        data.reclaim();
                        reply.reclaim();
                        done();
                    }
                }
                console.info("start send request");
                object.sendRequest(CODE_SAME_PROCESS, data, reply, option, sendRequestCallback);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_0900 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IRemoteObject_0900---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_IRemoteObject_1100
        * @tc.name    getDescriptor to get the interface description
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_IRemoteObject_1100", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IRemoteObject_1100---------------------------");
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
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_1100 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IRemoteObject_1100---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_IRemoteObject_1200
        * @tc.name    Test that MessageSequence passes through the same process, and the client
        *             receives the reply message in the callback function
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_IRemoteObject_1200", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IRemoteObject_1200---------------------------");
            try {
                let object = new TestAbilityMessageStub("TestAbilityMessageStub");
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
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
                        data.reclaim();
                        reply.reclaim();
                        done();
                    }
                }
                console.info("start send request");
                object.sendMessageRequest(CODE_SAME_PROCESS, data, reply, option, sendRequestCallback);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_1200 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IRemoteObject_1200---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_IRemoteObject_1300
        * @tc.name    Iremoteobject, register death notification verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_IRemoteObject_1300", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IRemoteObject_1300---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null);
                gIRemoteObject.registerDeathRecipient(recipient, 0);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_1300 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IRemoteObject_1300---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_IRemoteObject_1400
        * @tc.name    Iremoteobject, register death notification verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3 
        */
        it("SUB_DSoftbus_RPC_API_IRemoteObject_1400", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IRemoteObject_1400---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null);
                gIRemoteObject.registerDeathRecipient(recipient, 0);
                gIRemoteObject.unregisterDeathRecipient(recipient, 0);
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_1400:run unregisterDeathRecipient is done");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_1400 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IRemoteObject_1400---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_IRemoteObject_1500
        * @tc.name    RemoteObject, registerDeathRecipient notification verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_IRemoteObject_1500", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IRemoteObject_1500---------------------------");
            try {
                let object = new TestAbilityMessageStub("Test1");
                object.registerDeathRecipient(null, 0);
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_1500:run registerDeathRecipient is done");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_1500 error: " + error);
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IRemoteObject_1500---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_IRemoteObject_1600
        * @tc.name    RemoteObject, unregisterDeathRecipient notification verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_IRemoteObject_1600", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IRemoteObject_1600---------------------------");
            try {
                let object = new TestAbilityMessageStub("Test1");
                object.unregisterDeathRecipient(null, 0);
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_1600:run unregisterDeathRecipient result is done");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IRemoteObject_1600 error: " + error);
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IRemoteObject_1600---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_0100
         * @tc.name    Call adddeathrecipient to register the death notification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_0100", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_0100---------------------------");
            try {
                let recipient = new MyDeathRecipient(gIRemoteObject, null);
                expect(gIRemoteObject.addDeathRecipient(recipient, 0)).assertTrue();
                expect(gIRemoteObject.addDeathRecipient(recipient, 0)).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, 0)).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, 0)).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, 0)).assertEqual(false)();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_0100 error: " + error);
                expect(error != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_0100---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_0200
         * @tc.name    Adddeathreceiver Verify the minimum boundary value of the interface flag
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_0200", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_0200---------------------------");
            try {
                let recipient = new MyDeathRecipient(gIRemoteObject, null);
                expect(gIRemoteObject.addDeathRecipient(recipient, -(2 * G))).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, -(2 * G))).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_0200 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_0200---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_0300
         * @tc.name    Adddeathreceiver Verify the maximum boundary value of the interface flag
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_0300", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_0300---------------------------");
            try {
                let recipient = new MyDeathRecipient(gIRemoteObject, null);
                expect(gIRemoteObject.addDeathRecipient(recipient, (2 * G - 1))).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, (2 * G - 1))).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_0300 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_0300---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_0400
         * @tc.name    Adddeathreceiver verifies the minimum out-of-bounds value of the interface flag
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_0400", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_0400---------------------------");
            try {
                let recipient = new MyDeathRecipient(gIRemoteObject, null);
                expect(gIRemoteObject.addDeathRecipient(recipient, 2 * G)).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, 2 * G)).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_0400 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_0400---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_0500
         * @tc.name    Adddeathreceiver verifies the maximum out-of-bounds value of the interface flag
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_0500", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_0500---------------------------");
            try {
                let recipient = new MyDeathRecipient(gIRemoteObject, null);
                expect(gIRemoteObject.addDeathRecipient(recipient, -(2 * G + 1))).assertTrue();
                expect(gIRemoteObject.removeDeathRecipient(recipient, -(2 * G + 1))).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_0500 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_0500---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_0600
         * @tc.name   Verification of the death notification callback scenario
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_0600", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_0600---------------------------");
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
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_0600 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_0600---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_0700
         * @tc.name    Getinterfacedescriptor to get the object interface description
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_0700", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_0700---------------------------");
            try {
                let object = new TestAbilityStub("Test0300");
                expect(object.getInterfaceDescriptor()).assertEqual("Test0300");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_0700 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_0700---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_0800
         * @tc.name    Querylocalinterface searches for objects based on descriptors
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_0800", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_0800---------------------------");
            try {
                let object = new TestAbilityStub("Test0400");
                expect(object.isObjectDead()).assertEqual(false);
                object.attachLocalInterface(object, "Test2");
                expect(object.queryLocalInterface('Test2') != null).assertTrue();
                expect(object.getInterfaceDescriptor() != null).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_0800 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_0800---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_0900
         * @tc.name    Transaction constant validation
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_0900", 0, async function () {
            console.info("----------------------------SUB_DSoftbus_RPC_API_RemoteProxy_0900 is starting-------------");
            try {
                expect(rpc.RemoteProxy.PING_TRANSACTION).assertEqual(1599098439);
                expect(rpc.RemoteProxy.DUMP_TRANSACTION).assertEqual(1598311760);
                expect(rpc.RemoteProxy.INTERFACE_TRANSACTION).assertEqual(1598968902);
                expect(rpc.RemoteProxy.MIN_TRANSACTION_ID).assertEqual(0x1);
                expect(rpc.RemoteProxy.MAX_TRANSACTION_ID).assertEqual(0x00FFFFFF);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_0900 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_0900---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_1000
        * @tc.name    Call isobjectdead to check whether the object is dead
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_1000", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_1000---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null);
                let isDead = gIRemoteObject.isObjectDead();
                expect(isDead == false).assertTrue();
                gIRemoteObject.registerDeathRecipient(recipient, 0);
                let isDead1 = gIRemoteObject.isObjectDead();
                expect(isDead1 == false).assertTrue();
                gIRemoteObject.unregisterDeathRecipient(recipient, 0);
                gIRemoteObject.registerDeathRecipient(recipient, 0);
                gIRemoteObject.unregisterDeathRecipient(recipient, 0);
                gIRemoteObject.unregisterDeathRecipient(recipient, 0);
                let isDead2 = gIRemoteObject.isObjectDead();
                expect(isDead2 == false).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_1000 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_1000---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_1100
        * @tc.name    getDescriptor to get the object interface description
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_1100", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_1100---------------------------");
            try {
                let object = new TestAbilityStub("Test0300");
                let result = object.getDescriptor();
                expect(result).assertEqual("Test0300");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_1100 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_1100---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_1200
        * @tc.name    getLocalInterface searches for objects based on descriptors
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_1200", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_1200---------------------------");
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
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_1200 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_1200---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_1300
        * @tc.name    Call registerDeathRecipient to register the death notification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_1300", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_1300---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null);
                gIRemoteObject.registerDeathRecipient(recipient, 0);
                gIRemoteObject.registerDeathRecipient(recipient, 0);
                gIRemoteObject.unregisterDeathRecipient(recipient, 0);
                gIRemoteObject.unregisterDeathRecipient(recipient, 0);
                gIRemoteObject.unregisterDeathRecipient(recipient, 0);
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_1300: unregisterDeathRecipient2 is success");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_1300 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_1300---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_1400
        * @tc.name    registerDeathRecipient Validates the interface flags input parameter boundary value
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_1400", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_1400---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null);
                gIRemoteObject.registerDeathRecipient(recipient, -(2 * G));
                gIRemoteObject.unregisterDeathRecipient(recipient, -(2 * G));
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_1400: unregisterDeathRecipient2 is success");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_1400 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_1400---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_1500
        * @tc.name    registerDeathRecipient Validates the interface flags input parameter boundary value
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_1500", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_1500---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null);
                gIRemoteObject.registerDeathRecipient(recipient, (2 * G - 1));
                gIRemoteObject.unregisterDeathRecipient(recipient, (2 * G - 1));
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_1500: unregisterDeathRecipient2 is success");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_1500 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_1500---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_1600
        * @tc.name    registerDeathRecipient Validates the interface flags input parameter boundary value
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_1600", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_1600---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null);
                gIRemoteObject.registerDeathRecipient(recipient, 2 * G);
                gIRemoteObject.unregisterDeathRecipient(recipient, 2 * G);
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_1600: unregisterDeathRecipient2 is success");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_1600 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_1600---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_1700
        * @tc.name    registerDeathRecipient Validates the interface flags input parameter boundary value
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_1700", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_1700---------------------------");
            try {
                let recipient = new MyregisterDeathRecipient(gIRemoteObject, null);
                gIRemoteObject.registerDeathRecipient(recipient, -(2 * G + 1));
                gIRemoteObject.unregisterDeathRecipient(recipient, -(2 * G + 1));
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_1700: unregisterDeathRecipient is success");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_1700 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_1700---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_RemoteProxy_1800
        * @tc.name    getLocalInterface 1900005 searches for objects based on descriptors
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_RemoteProxy_1800", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_RemoteProxy_1800---------------------------");
            try {
                let object = new TestAbilityStub("Test0400");
                let result = object.isObjectDead();
                expect(result).assertEqual(false);
                object.modifyLocalInterface(object, "Test2");
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_1800: run modifyLocalInterface success");
                object.getLocalInterface(null);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_RemoteProxy_1800 error: " + error);
                let errCode = `${rpc.ErrorCode.ONLY_PROXY_OBJECT_PERMITTED_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_RemoteProxy_1800---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_0100
         * @tc.name    Create exception object and verify the function of flushcommands interface
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_DSoftbus_RPC_API_IPCSkeleton_0100', 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_0100---------------------------");
            try {
                let remoteObject = new TestRemoteObject("aaa");
                expect(rpc.IPCSkeleton.flushCommands(remoteObject)).assertEqual(101);
            }
            catch (error) {
                expect(error == null).assertTrue();
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_0100 error: " + error);
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_0100---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_0200
         * @tc.name    Establish constructor object and verify the function of flushcommands interface
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it('SUB_DSoftbus_RPC_API_IPCSkeleton_0200', 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_0200---------------------------");
            try {
                let remoteObject = {};
                expect(rpc.IPCSkeleton.flushCommands(remoteObject)).assertEqual(101);
            }
            catch (error) {
                expect(error == null).assertTrue();
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_0200 error: " + error);
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_0200---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_0300
         * @tc.name    Create object, getinterfacedescriptor interface function verification
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_DSoftbus_RPC_API_IPCSkeleton_0300', 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_0300---------------------------");
            try {
                let samgr = rpc.IPCSkeleton.getContextObject();
                expect(samgr != null).assertTrue();
            }
            catch (error) {
                expect(error == null).assertTrue();
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_0300 error: " + error);
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_0300---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_0400
         * @tc.name    Call getCallingPid, getCallingUid to get the local value
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_DSoftbus_RPC_API_IPCSkeleton_0400', 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_0400---------------------------");
            try {
                expect(rpc.IPCSkeleton.getCallingPid() != null).assertTrue();
                expect(rpc.IPCSkeleton.getCallingUid() != null).assertTrue();
            }
            catch (error) {
                expect(error == null).assertTrue();
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_0400 error: " + error);
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_0400---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_0500
         * @tc.name    Call getlocaldeviceid, getcallingdeviceid to get the local value
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_DSoftbus_RPC_API_IPCSkeleton_0500', 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_0500---------------------------");
            try {
                expect(rpc.IPCSkeleton.getLocalDeviceID() != null).assertTrue();
                expect(rpc.IPCSkeleton.getCallingDeviceID() != null).assertTrue();
            }
            catch (error) {
                expect(error == null).assertTrue();
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_0500 error: " + error);
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_0500---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_0600
         * @tc.name    Do not get the server agent, do not create a remoteobject instance, and directly getcallingpid,
         *             getcallingpid, getcallingdeviceid, getlocaldeviceid
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it('SUB_DSoftbus_RPC_API_IPCSkeleton_0600', 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_0600---------------------------");
            try {
                expect(rpc.IPCSkeleton.getCallingPid() != null).assertTrue();
                expect(rpc.IPCSkeleton.getCallingUid() != null).assertTrue();
                expect(rpc.IPCSkeleton.getCallingTokenId() != null).assertTrue();
                expect(rpc.IPCSkeleton.getLocalDeviceID() != null).assertTrue();
                expect(rpc.IPCSkeleton.getCallingDeviceID() != null).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_0600 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_0600---------------------------");
        })

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_0700
         * @tc.name    Test the getcallingpid and getcallinguid basic methods of ipcskeleton
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_IPCSkeleton_0700", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_0700---------------------------");
            try {
                let callingPid = rpc.IPCSkeleton.getCallingPid();
                let callingUid = rpc.IPCSkeleton.getCallingUid();
                let option = new rpc.MessageOption();
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                expect(data.writeInterfaceToken("rpcTestAbility")).assertTrue();
                expect(callingUid != null).assertTrue();
                expect(callingPid != null).assertTrue();
                await gIRemoteObject.sendRequest(CODE_IPCSKELETON, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                    expect(result.reply.readInt()).assertEqual(callingPid);
                    expect(result.reply.readInt()).assertEqual(callingUid);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_0700 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_0700---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_0800
         * @tc.name    Basic method of testing ipcskeleton
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_IPCSkeleton_0800", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_0800---------------------------");
            try {
                let callingPid = rpc.IPCSkeleton.getCallingPid();
                let callingUid = rpc.IPCSkeleton.getCallingUid();
                let option = new rpc.MessageOption();
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_0800 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_0800---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_0900
         * @tc.name    Setcallingidentity interface flag input parameter is null authentication
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3 
         */
        it("SUB_DSoftbus_RPC_API_IPCSkeleton_0900", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_0900---------------------------");
            try {
                let id = "";
                expect(rpc.IPCSkeleton.setCallingIdentity(id)).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_0900 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_0900---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_1000
         * @tc.name    Setcallingidentity interface flag input parameter is 0 authentication
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_IPCSkeleton_1000", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_1000---------------------------");
            try {
                let id = 0;
                expect(rpc.IPCSkeleton.setCallingIdentity(id)).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1000 error: " + error);
                expect(error == null).assertTrue();

            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_1000---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_1100
         * @tc.name    Setcallingidentity interface flag input parameter is boundary value authentication
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_IPCSkeleton_1100", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_1100---------------------------");
            try {
                let id = "";
                for (let i = 0; i < (40 * K - 1); i++) {
                    id += "a";
                }
                expect(rpc.IPCSkeleton.setCallingIdentity(id)).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1100 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_1100---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_1200
         * @tc.name    Basic method of verifying ipcskeleton
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_IPCSkeleton_1200", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_1200---------------------------");
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
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
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
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1200 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_1200---------------------------");
        });

        /*
         * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_1300
         * @tc.name    IPCSkeleton sendMessageRequest API test
         * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
         * @tc.level   3
         */
        it("SUB_DSoftbus_RPC_API_IPCSkeleton_1300", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_1300---------------------------");
            try {
                let callingPid = rpc.IPCSkeleton.getCallingPid();
                let callingUid = rpc.IPCSkeleton.getCallingUid();
                expect(callingUid != null).assertTrue();
                expect(callingPid != null).assertTrue();
                let option = new rpc.MessageOption();
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                data.writeInterfaceToken("rpcTestAbility");
                await gIRemoteObject.sendMessageRequest(CODE_IPCSKELETON, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                    expect(result.reply.readInt()).assertEqual(callingPid);
                    expect(result.reply.readInt()).assertEqual(callingUid);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1300 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_1300---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_1400
        * @tc.name    Create an empty object and verify the function of the flushCmdBuffer interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_IPCSkeleton_1400", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_1400---------------------------");
            try {
                let remoteObject = new TestRemoteObject("aaa");
                let ret = rpc.IPCSkeleton.flushCmdBuffer(remoteObject);
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1400 RpcServer: flushCmdBuffer is success");
            }
            catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1400 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_1400---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_1500
        * @tc.name    Create an null object and verify the function of the flushCmdBuffer interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_IPCSkeleton_1500", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_1500---------------------------");
            try {
                let remoteObject = {};
                let ret = rpc.IPCSkeleton.flushCmdBuffer(remoteObject);
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1500 RpcServer: flushCmdBuffer is success");
            }
            catch(error) {
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1500 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_1500---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_1600
        * @tc.name    Basic method of testing ipcskeleton Communication failed
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_IPCSkeleton_1600", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_1600---------------------------");
            try {
                let object = rpc.IPCSkeleton.getContextObject();
                object.getDescriptor();
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1600: is success");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1600 error: " + error);
                let errCode = `${rpc.ErrorCode.COMMUNICATION_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code == errCode).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_1600---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_1700
        * @tc.name    Create an empty object and verify the function of the flushCmdBuffer interface Only remote object permitted.
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_IPCSkeleton_1700", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_1700---------------------------");
            try {
                let remoteObject = null;
                rpc.IPCSkeleton.flushCmdBuffer(remoteObject);
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1700 RpcServer: flushCmdBuffer is success");
            }
            catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1700 error: " + error);
                let errCode = `${rpc.ErrorCode.ONLY_REMOTE_OBJECT_PERMITTED_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code != errCode).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_1700---------------------------");
        })

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_1800
        * @tc.name    restoreCallingIdentity Interface flags input parameter boundary value verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_IPCSkeleton_1800", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_1800---------------------------");
            try {
                let id = "";
                rpc.IPCSkeleton.restoreCallingIdentity(id);
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1800 restoreCallingIdentity is success");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1800 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_1800---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_1900
        * @tc.name    restoreCallingIdentity Interface flags input parameter 0 value verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_IPCSkeleton_1900", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_1900---------------------------");
            try {
                let id = 0;
                rpc.IPCSkeleton.restoreCallingIdentity(id);
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1900 restoreCallingIdentity is success");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_1900 error: " + error);
                expect(error == null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_1900---------------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_API_IPCSkeleton_2000
        * @tc.name    restoreCallingIdentity Interface flags input parameter null value verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_DSoftbus_RPC_API_IPCSkeleton_2000", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_IPCSkeleton_2000---------------------------");
            try {
                let id = "";
                for (let i = 0; i < (40 * K - 1); i++) {
                    id += "a";
                }
                rpc.IPCSkeleton.restoreCallingIdentity(id);
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_2000 restoreCallingIdentity is success");
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_IPCSkeleton_2000 error: " + error);
                expect(error == null).assertTrue();               
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_IPCSkeleton_2000---------------------------");
        });
        console.info("-----------------------SUB_DSoftbus_RPC_API_MessageParce_Test is end-----------------------");
    });
}