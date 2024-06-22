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
import abilityDelegatorRegistry from '@ohos.app.ability.abilityDelegatorRegistry';
import rpc from '@ohos.rpc';
import { Driver, ON } from '@ohos.UiTest';
import abilityAccessCtrl, { Context, PermissionRequestResult } from '@ohos.abilityAccessCtrl';
import AbilityConstant from '@ohos.app.ability.AbilityConstant';
import { Caller} from '@ohos.app.ability.UIAbility';
import { BusinessError } from '@ohos.base';
import bundleManager from '@ohos.bundle.bundleManager';
import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';


let atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();
let abilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();
let deviceList: Array<deviceManager.DeviceBasicInfo>;
let dvId: String;
let localDeviceId : String;
let connectId: number;
let connectId2: number;
let extensionConnectId: number;
let extensionConnectId2: number;
let call: Caller;
let dmInstance : deviceManager.DeviceManager;
let TAG: String;
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
        const CODE_SAME_PROCESS = 1;
        const CODE_WRITE_REMOTEOBJECT = 1;
        const CODE_INTERFACETOKEN = 2;
        const CODE_WRITE_STRING = 3;
        let gIRemoteObject = null;
        let testservice = null;

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
            let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
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
                let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
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
                let testRemoteObject = new TestRemoteObject("testObject");
                data.writeRemoteObject(testRemoteObject);
                expect(data.readRemoteObject() != null).assertTrue();
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0010 error: " + error);
                expect(error == null).assertTrue();
            } finally{
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
                let token = new TestRemoteObject(null);
                data.writeRemoteObject(token);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0020 error: " + error);
                expect(error != null).assertTrue();
            } finally{
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
                let testRemoteObject = new TestRemoteObject("testObject");
                data.writeRemoteObject(testRemoteObject);
                data.reclaim();
                data.readRemoteObject();
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
                let testRemoteObject = new TestRemoteObject("testObject");
                data.reclaim();
                data.writeRemoteObject(testRemoteObject);
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0090 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0100 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
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
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0110 error: " + error);
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
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
                data.reclaim();
                done();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0190---------------------------");
        });        
        console.info(logTag +"-----------------------SUB_DSoftbus_RPC_API_NEW_onRemoteRequest_Test is end-----------------------");
    });
}