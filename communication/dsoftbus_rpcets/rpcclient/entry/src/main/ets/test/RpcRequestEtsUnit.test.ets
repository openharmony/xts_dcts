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

import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from "@ohos/hypium";
import deviceManager from '@ohos.distributedDeviceManager';
import TestService from './testService.ets';
import rpc from '@ohos.rpc';
import { Driver, ON } from '@ohos.UiTest';
import abilityAccessCtrl, { Context, PermissionRequestResult } from '@ohos.abilityAccessCtrl';
import { BusinessError } from '@ohos.base';
import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';
import fs from '@ohos.file.fs';


let atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();
let deviceList: Array<deviceManager.DeviceBasicInfo>;
let localDeviceId : String;
let dmInstance : deviceManager.DeviceManager;
let deviceId : String
let syncDeviceIds: String[] = [];
let logTag = '[RpcClient:]';
const TEST_BUNDLE_NAME = 'com.acts.rpcrequest.test';
let bundleNameRpc: String = "com.acts.rpcrequest.test";
let abilityNameRpc: String = "com.acts.rpcrequest.test.MainAbility";
export default function RpcRequestEtsUnitTest() {

    describe('RpcRequestEtsUnitTest', function () {
        console.info(logTag +"-----------------------SUB_DSoftbus_RPC_API_NEW_onRemoteRequest_Test is starting-----------------------");

        const K = 1024;
        const M = 1024 * 1024;
        const G = 1024 * 1024 * 1024;
        const CODE_WRITE_REMOTEOBJECT = 1;
        const CODE_INTERFACETOKEN = 2;
        const CODE_WRITE_STRING = 3;
        const CODE_WRITE_INT = 4;
        const CODE_ALL_TYPE = 5;
        const CODE_WRITE_BYTE = 6;
        const CODE_WRITE_BYTE_MULTI = 7;
        const CODE_WRITE_SHORT = 8;
        const CODE_WRITE_SHORT_MULTI = 9;
        let gIRemoteObject = null;
        let testservice = null;

        class TestAbilityStub extends rpc.RemoteObject {
            constructor(descriptor) {
                super(descriptor);
            }
            asObject() {
                return this;
            }
            onRemoteMessageRequest(code, data, reply, option) {
                console.info("TestAbilityStub: onRemoteRequest called, code: " + code);
                let descriptor = data.readInterfaceToken();
                if (descriptor !== "TestAbilityStub") {
                    console.error("received unknown descriptor: " + descriptor);
                    return false;
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
                            return true;
                        }
                    default:
                        {
                            console.error("default case, code: " + code);
                            return false;
                        }
                }
            }
        }

        class MySequenceable {
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
                return result;
            }
        }      
        
        let getDeviceId = async () =>{
            try {
                dmInstance = deviceManager.createDeviceManager(TEST_BUNDLE_NAME);
                console.info(logTag + 'get deviceManager is success')
            } catch (error) {
                console.info(logTag + 'get deviceManager is failed' + JSON.stringify(error))
            }
            localDeviceId = dmInstance.getLocalDeviceNetworkId();
            console.info(logTag + "local device id is: " + localDeviceId);
            deviceList = dmInstance.getAvailableDeviceListSync();
            deviceId = deviceList[0].networkId;
            syncDeviceIds = [deviceId];
            console.info(logTag + "deviceid is: " + deviceId);
            console.info(logTag + "syncDeviceIds is: " + JSON.stringify(syncDeviceIds));
        }

        let sleep = (ms:number) =>{
          return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        let getPermission = async () =>{
            console.info(logTag +'getPermission is start');
            let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext;
            atManager.requestPermissionsFromUser(context,['ohos.permission.DISTRIBUTED_DATASYNC'],(err: BusinessError, data: PermissionRequestResult)  => {
                console.info(logTag +"request success" + JSON.stringify(data));
            })
        }
        async function driveFn(){
            try {
                let driver: Driver = await Driver.create()
                console.info(logTag + 'come in driveFn')
                console.info(logTag +'driver is ${JSON.stringify(driver)}')
                await sleep(1000);
                console.info(logTag + 'come in findComponent');
                let button = await driver.findComponent(ON.text('允许'));
                console.info('button is ${JSON.stringify(button)}');
                await sleep(1000);
                await button.click();
                await sleep(1000);
            } catch (err) {
                console.info(logTag +'driveFn err is ' + err);
                return;
            }
        }
        let startAbility = async () =>{
            try{
                console.info(logTag + "let startAbility begin...");
                let wantValue: Want = {
                    bundleName: bundleNameRpc,
                    abilityName: abilityNameRpc,
                    deviceId: deviceId
                }
                let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext;
                context.startAbility(wantValue).then(() => {
                    console.info(logTag + ' startAbility success.' );
                }).catch((err) => {
                    console.info(logTag + ' startAbility err: ' + err.code + err.message);
                });
            }catch(error){
                console.info(logTag + "beforeAll startAbility:error = " + error);
            }
        }       

        beforeAll(async (done: Function) => {
            console.info(logTag +'beforeAll called rpc');
            await getPermission();           
            await sleep(5000);
            await driveFn();
            await sleep(100);
            await getDeviceId();
            await sleep(3000);
            await startAbility();
            await sleep(2000);
            let testservice = new TestService();
            await testservice.toConnectAbility().then(data => {
                gIRemoteObject = data;
                console.info(logTag + "toConnectAbility data is" + data);
            })
        
            console.info(logTag +"beforeAll done");
            done();
        })
        beforeEach(function () {
            console.info(logTag +('beforeEach called'));
        })
        afterEach(function () {
            console.info(logTag +'afterEach called');
        })
        afterAll(function () {
            console.info(logTag +'afterAll called');
        })

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0010
        * @tc.name    : test Call the writeremoteobject interface to serialize the remote object
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0010", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0010---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                let testAbilityStub = new TestAbilityStub("testObject");
                data.writeRemoteObject(testAbilityStub);
                expect(data.readRemoteObject() != null).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0010 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0010---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0020
        * @tc.name    : test Invoke the writeremoteobject interface to serialize a remote object and transfer the object. 
        *               The object parameter is empty
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0020", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0020---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                let token = new TestAbilityStub(null);
                data.writeRemoteObject(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0020 error: " + error);
                expect(error != null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0020---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0030
        * @tc.name    : test Call the writeremoteobject interface to serialize the remote object and pass in the empty object
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3   
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0030", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0030---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                let token = {};
                data.writeRemoteObject(token);
                
            } catch (error) {
                let errCode = `${rpc.ErrorCode.PROXY_OR_REMOTE_OBJECT_INVALID_ERROR}`;
                expect(error.code == errCode).assertTrue();
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0030: errorMessage " + error.message);
                expect(error.message != null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0030---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0040
        * @tc.name    : test Test MessageSequence to pass an object of type iremoteobject across processes
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it('SUB_DSoftbus_RPC_API_NEW_MessageSequence_0040', 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0040---------------------------");
            function checkResult(num, str) {
                expect(num).assertEqual(123);
                expect(str).assertEqual("rpcListenerTest");
                done();
            };
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try {
                let listener = new TestListener("rpcListener", checkResult);
                data.writeRemoteObject(listener);
                data.writeInt(123);
                data.writeString("rpcListenerTest");
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_REMOTEOBJECT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    result.reply.readException();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0040 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0040---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0050
        * @tc.name    : testreadRemoteObject is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0050", 0,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0050---------------------------");
            let data = rpc.MessageSequence.create();
            try{
                let testAbilityStub = new TestAbilityStub("testObject");
                data.writeRemoteObject(testAbilityStub);
                data.reclaim();
                data.readRemoteObject();
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } 
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0050---------------------------");
        }); 

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0060
        * @tc.name    : testwriteRemoteObject is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0060", 0,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0060---------------------------");
            let data = rpc.MessageSequence.create();
            try{
                let testAbilityStub = new TestAbilityStub("testObject");
                data.reclaim();
                data.writeRemoteObject(testAbilityStub);
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0060---------------------------");
        }); 

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0070
        * @tc.name    : test Call the writeinterfacetoken interface, write the interface descriptor, and read interfacetoken
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0070", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0070---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
                let token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInterfaceToken()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0070 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0070---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0080
        * @tc.name    : test Call the WriteInterfaceToken interface, write the maximum length interface descriptor, and read 
        *               the InterfaceToken
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0080", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0080---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0080 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0080---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0090
        * @tc.name    : test The WriteInterfaceToken interface is called, the exceeding-length interface descriptor is written,
        *               and the InterfaceToken is read
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0090", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0090---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                let token = "";
                for (let i = 0; i < 40 * K; i++) {
                    token += 'a';
                }
                data.writeInterfaceToken(token);
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0090 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0090---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0100
        * @tc.name    : test Call the writeinterfacetoken interface to write a non string interface descriptor 
        *           and read interfacetoken
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0100", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0100---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                let token = 123;
                data.writeInterfaceToken(token);
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0100 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0100---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0110
        * @tc.name    : test Call the writeinterfacetoken interface to write null data
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0110", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0110---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                let token = null;
                data.writeInterfaceToken(token);
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0110 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0110---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0120
        * @tc.name    : testwriteInterfaceToken is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0120", 0,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0120---------------------------");
            let data = rpc.MessageSequence.create();
            try{
                data.reclaim();
                data.writeInterfaceToken("rpctest");
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0120---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0130
        * @tc.name    : testreadInterfaceToken is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0130", 0,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0130---------------------------");
            let data = rpc.MessageSequence.create();
            try{
                data.writeInterfaceToken("rpctest");
                data.reclaim();
                data.readInterfaceToken();
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0130---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0140
        * @tc.name    : test setSize Sets the size of the data contained in the MessageSequence instance. The getSize command
                    reads the data
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0140", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0140---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0140 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0140---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0150
        * @tc.name    : test SetSize: Increases the value of the data contained in the MessageSequence instance by 1,
                    Write setSize
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0150", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0150---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0150 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0150---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0160
        * @tc.name    : test Verify the MessageSequence instance SetSize setting and the instance capacitydata qualification verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0160", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0160---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                expect(data.getSize()).assertEqual(0);
                data.writeString("constant");
                expect(data.getSize()).assertEqual(("constant".length * 2) + 8);
                let getCapacitydata = data.getCapacity();
                expect(getCapacitydata).assertEqual(64);
                data.setSize(getCapacitydata);
                expect(data.getSize()).assertEqual(getCapacitydata);
                data.setSize(getCapacitydata + 1);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0160 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0160---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0170
        * @tc.name    : test setSize Sets the storage capacity of the MessageSequence instance to decrease by one.
                    The getSize obtains the current MessageSequence capacity
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0170", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0170---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0170 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0170---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0180
        * @tc.name    : test Validate the setSize boundary value in the MessageSequence instance
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0180", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0180---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                expect(data.getCapacity()).assertEqual(0);
                data.setSize(4 * G);
                expect(data.getSize()).assertEqual(0);
                data.setSize(4 * G - 1);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0180 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0180---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0190
        * @tc.name    : test Verify that setSize is out of bounds in a MessageSequence instance
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0190", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0190---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                data.setSize(0);
                expect(data.getSize()).assertEqual(0);
                data.setSize(2 * 4 * G);
                expect(data.getSize()).assertEqual(0);
                data.setSize(2 * G);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0190 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0190---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0200
        * @tc.name    : test setCapacity Sets the storage capacity of the null MessageSequence instance. The getCapacity
                    obtains the current MessageSequence capacity
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0200", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0200---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0200 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0200---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0210
        * @tc.name    : test setCapacity Sets the storage capacity of the MessageSequence instance. The getCapacity
                    obtains the current MessageSequence capacity
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0210", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0210---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0210 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0210---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0220
        * @tc.name    : test Setcapacity test: size limit verification of MessageSequence instance
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0220", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0220---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                expect(data.getCapacity()).assertEqual(0);
                data.writeString("constant");
                let getSizedata = data.getSize();
                data.setCapacity(getSizedata + 1);
                data.setCapacity(getSizedata);
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0220 error: " + error);
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code == errCode).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0220---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0230
        * @tc.name    : test SetCapacity Tests the storage capacity threshold of the MessageSequence instance
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0230", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0230---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
                data.writeString("constant");
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    let getSizeresult = result.reply.getSize();
                    expect(result.reply.getCapacity()).assertEqual(("constant".length * 2) + 8);
                    result.reply.setCapacity(getSizeresult + 1);
                    result.reply.setCapacity(getSizeresult);
                    expect(data.getSize == 0).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0230 error: " + error);
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code == errCode).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0230---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0240
        * @tc.name    : test Setcapacity test storage capacity boundary value verification of MessageSequence instance
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0240", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0240---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                expect(data.getSize()).assertEqual(0);
                data.setCapacity(M);
                expect(data.getCapacity()).assertEqual(M);
                data.setCapacity(2 * G);
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0240 error: " + error);
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code == errCode).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0240---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0250
        * @tc.name    : test readParcelable is Call JS callback function failedv Error message verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0250", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0250---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                let sequenceable = new MySequenceable(1, "aaa");
                data.writeParcelable(sequenceable);
                data.setCapacity(0);
                data.setSize(0);
                let ret = new MySequenceable(1, "");
                data.readParcelable(ret);
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0250 error: " + error);
                let errCode = `${rpc.ErrorCode.CALL_JS_METHOD_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code != errCode).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0250---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0260
        * @tc.name    : test Invoke the writeinterfacetoken interface, write the interface descriptor, and verify the error 
        *               code that fails to be read from the interfacetoken interface
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0260", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0260---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                let token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
                data.setCapacity(0);
                data.setSize(0);
                data.readInterfaceToken();
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0260 error: " + error);
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.message != null).assertTrue();
                expect(error.code != errCode).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0260---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0270
        * @tc.name    : test writeInterfaceToken Sequence memory alloc failed Error message verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0270", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0270---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                data.setSize(0);
                data.setCapacity(0);
                let token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0270 error: " + error);
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0270---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0280
        * @tc.name    : test writeInterfaceToken Write data to message sequence failed Error message verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0280", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0280---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                data.setSize(true);
                data.setCapacity(true);
                let token = "hello ruan zong xian";
                data.writeInterfaceToken(token);
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0280 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0280---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0290
        * @tc.name    : testsetSize is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0290", 0,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0290---------------------------");
            let data = rpc.MessageSequence.create();
            try{
                data.reclaim();
                data.setSize(0);
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0290---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0300
        * @tc.name    : test readParcelable Sequence memory alloc failed Error message verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0300", 0, function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0300---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                let sequenceable = new MySequenceable(1, "aaa");
                data.writeParcelable(sequenceable);
                let ret = new MySequenceable(0, "");
                data.setCapacity(0);
                data.readParcelable(ret);
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0300 error: " + error);
                let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0300---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0310
        * @tc.name    : test Obtaining the Writable and Readable Byte Spaces of MessageSequence
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0310", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0310---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0310 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0310---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0320
        * @tc.name    : test Obtains the writeable and readable byte space and read position of the MessageSequence
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0320", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0320---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0320 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0320---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0330
        * @tc.name    : test Get the space size of MessageSequence to pass rawdata data
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0330", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0330---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0330 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0330---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0340
        * @tc.name    : test Obtains the write and read positions of the MessageSequence
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0340", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0340---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0340 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0340---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0350
        * @tc.name    : test Basic test of the rewindWrite interface
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0350", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0350---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0350 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0350---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0360
        * @tc.name    : test RewindWrite interface write position cheap extension test
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0360", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0360---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0360 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0360---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0370
        * @tc.name    : test Test the boundary value of the rewindWrite interface
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0370", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0370---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0370 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0370---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0380
        * @tc.name    : test Test the critical value of the rewindWrite interface
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0380", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0380---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0380 errorMessage " + error.message);
                expect(error != null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0380---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0390
        * @tc.name    : test Test the function of the getWritePosition interface
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0390", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0390---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0390 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0390---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0400
        * @tc.name    : test Test on the null value of the getWritePosition interface
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0400", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0400---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                let str = "";
                data.writeString(str);
                expect(data.getWritePosition()).assertEqual(8);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0400 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0400---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0410
        * @tc.name    : test Invoke the rewindWrite interface, Set 0-bit offset and write the data after offset
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0410", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0410---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
                data.writeInt(4);
                data.rewindWrite(0);
                data.writeInt(5);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode == 0).assertTrue();
                    expect(result.reply.readInt()).assertEqual(5);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0410 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0410---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0420
        * @tc.name    : test Invoke the rewindWrite interface, Set 1-bit offset and write the data after offset
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0420", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0420---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
                data.writeInt(4);
                data.rewindWrite(1);
                data.writeInt(5);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readInt() != 5).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0420 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0420---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0430
        * @tc.name    : testrewindWrite is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0430", 0,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0430---------------------------");
            let data = rpc.MessageSequence.create();
            try{
                data.reclaim();
                data.rewindWrite(0);
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0430---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0440
        * @tc.name    : test Invoke the rewindRead interface,Set 0-bit offset and read the data after offset
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0440", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0440---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0440 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0440---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0450
        * @tc.name    : test Invoke the rewindRead interface,Set 1-bit offset and read the data after offset
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0450", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0440---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0450 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0450---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0460
        * @tc.name    : test Basic test of the rewindRead interface
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0460", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0460---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0460 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0460---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0470
        * @tc.name    : test rewindRead interface write position cheap extension test
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0470", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0470---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0470 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0470---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0480
        * @tc.name    : test Test the boundary value of the rewindRead interface
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0480", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0480---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0480 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0480---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0490
        * @tc.name    : test Test the critical value of the rewindRead interface 
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0490", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0490---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0490 errorMessage " + error.message);
                expect(error != null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0490---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0500
        * @tc.name    : testrewindRead is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0500", 0,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0500---------------------------");
            let data = rpc.MessageSequence.create();
            try{
                data.reclaim();
                data.rewindRead(0);
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0500---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0510
        * @tc.name    : test Call the writebyte interface to write data to the MessageSequence instance,
        *             and call readbyte to read data
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0510", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0510---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
                let token = 2;
                data.writeByte(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(token);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0510 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0510---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0520
        * @tc.name    : test Writebyte interface, boundary value verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0520", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0520---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0520 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0520---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0530
        * @tc.name    : test Writebyte interface, Maximum boundary value verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0530", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0530---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
                data.writeByte(-129);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(127);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0530 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0530---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0540
        * @tc.name    : test Writebyte interface, Minimum boundary value verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0540", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0540---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
                data.writeByte(128);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readByte()).assertEqual(-128);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0540 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0540---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0550
        * @tc.name    : test Writebyte interface, illegal value verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0550", 0, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0550---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            try{
                data.writeByte("error");
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0550 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0550---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0560
        * @tc.name    : testwriteByte is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0560", 0,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0560---------------------------");
            let data = rpc.MessageSequence.create();
            try{
                data.reclaim();
                data.writeByte(2);
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0560---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0570
        * @tc.name    : testreadByte is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0570", 0,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0570---------------------------");
            let data = rpc.MessageSequence.create();
            try{
                data.reclaim();
                data.readByte();
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0570---------------------------");
        });
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0580
        * @tc.name    : test Call the writeShort interface to write the short integer data to the MessageSequence instance,
        *             and call readshort to read the data
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0580", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0580---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
                let short = 8;
                data.writeShort(short);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readShort()).assertDeepEquals(short);
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0580 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0580---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0590
        * @tc.name    : test WriteShort interface, boundary value verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0590", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0590---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
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
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0590 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0590---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0600
        * @tc.name    : test WriteShort interface, Boundary value minimum value out of bounds verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3 
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0600", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0600---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
                data.writeShort(-32769);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readShort() == 32767).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0600 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0600---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0610
        * @tc.name    : test WriteShort interface, Boundary value maximum value out of bounds verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0610", 0, async function (done) {
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0610---------------------------");
            let data: rpc.MessageSequence = rpc.MessageSequence.create();
            let reply: rpc.MessageSequence = rpc.MessageSequence.create();
            let option: rpc.MessageOption = new rpc.MessageOption();
            try{
                data.writeShort(32768);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORT, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readShort() == -32768).assertTrue();
                });
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0610 error: " + error);
                expect(error == null).assertTrue();
            } finally{
                console.info("reclaim done");
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0610---------------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0620
        * @tc.name    : testwriteShort is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0620", 0,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0620---------------------------");
            let data = rpc.MessageSequence.create();
            try{
                data.reclaim();
                data.writeShort(0);
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0620---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0630
        * @tc.name    : testreadShort is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0630", 0,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0630---------------------------");
            let data = rpc.MessageSequence.create();
            try{
                data.writeShort(0);
                data.reclaim();
                data.readShort();
                expect(data.getSize == 0).assertTrue();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0630---------------------------");
        });
        console.info(logTag +"-----------------------SUB_DSoftbus_RPC_API_NEW_onRemoteRequest_Test is end-----------------------");
    });
}