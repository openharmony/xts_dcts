/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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
import TestService from "./testService";
import fileio from '@ohos.fileio';
import FA from '@ohos.ability.featureAbility';
import featureAbility from '@ohos.ability.featureAbility';
import deviceManager from "@ohos.distributedDeviceManager";

import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, TestType, Size, Level } from '@ohos/hypium';
import { UiDriver, BY } from '@ohos.UiTest'

let bundleNameRpc = "com.acts.rpc.request.test.server";

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

export default function RpcRequestJsUnitTest() {

    describe('RpcRequestJsUnitTest', function () {
        console.info("-----------------------SUB_DSoftbus_RPC_API_OnRemoteRequest_Test is starting-----------------------");

        const CODE_ASYNC_ONREMOTEMESSAGE = 1;
        const CODE_ONREMOTE_ASYNC_ONREMOTEMESSAGE = 2;
        let gIRemoteObject = null;
        var testservice = null

        class MyDeathRecipient  {
            onRemoteDied() {
                console.log("server died");
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

        class TestAbilityStub extends rpc.RemoteObject {
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
            }
        }

        class TestListener extends rpc.RemoteObject {
            constructor(descriptor, checkResult) {
                super(descriptor);
                this.checkResult = checkResult;
            }
            onRemoteRequest(code, data, reply, option) {
                let result = false;
                if (code  == 1) {
                    console.info("onRemoteRequest called, descriptor: " + this.getInterfaceDescriptor());
                    result = true;
                } else {
                    console.info("unknown code: " + code);
                }
                let _checkResult = this.checkResult
                let _num = data.readInt();
                let _str = data.readString();
               
                _checkResult(_num, _str);
                sleep(2000);
                return result;
            }
        }        

        class TestRemoteObject extends rpc.RemoteObject {
            constructor(descriptor) {
                super(descriptor);
            }
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
                await sleep(2000);
                let button = await driver.findComponent(BY.text('允许'));
                console.info(`button is ${JSON.stringify(button)}`);
                await sleep(2000);
                await button.click();
            } catch (err) {
                console.info('err is ' + err);
                return;
            }
        }
        //检查当前应用是否有可信的设备
        async function checkAvailableDevice()
        {
            console.info("checkAvailableDevice in "); 
            let dmInstance = deviceManager.createDeviceManager(bundleNameRpc);
            console.info("checkAvailableDevice createDeviceManager success " );
            let deviceInfoList = dmInstance.getAvailableDeviceListSync();
            console.info("checkAvailableDevice get deviceInfoList " + JSON.stringify(deviceInfoList));
            if (deviceInfoList.length != 0) {
                return false;
            } else{
                return true;
            }
        }

        beforeAll(async function (done) {
            console.info('beforeAll called rpc');
            testservice = new TestService;
            await getPermission();           
            await sleep(2000);
            await driveFn();
            await sleep(1000);
            //环境初始化
            let checkResult = await checkAvailableDevice();
            if (!checkResult) {
                testservice.unbindStub();
            }
            await sleep(500);
            let checkResult1 = await checkAvailableDevice();
            //如果有可信的设备 就不需要再通过PIN码bind
            if (checkResult1) {
               testservice.startDiscovering();
               await sleep(2000);
               testservice.bindStub();
               await sleep(20000);
               testservice.stopDiscovering();
               await sleep(3000);
            }
            await testservice.toConnectAbility().then(data => {
                gIRemoteObject = data;
                console.info("RpcClient: toConnectAbility data is:" + data);
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
        afterAll(async function (done) {
            console.info('afterAll called');
            testservice = new TestService;
            await sleep(500);
            let checkResult = await checkAvailableDevice();
            if (!checkResult) {
                testservice.unbindStub();
             }
            done();
            await sleep(1000);
            console.info("afterAll done");
        })

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_0100
        * @tc.name    : testVerifying the processing of the MessageSequence synchronous callback information of the async_onRemoteMessageRequest interface
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */       
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_0100--------------------");
            try{
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = "async onRemoteMessageRequest invoking";
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_ASYNC_ONREMOTEMESSAGE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("async onRemoteMessageRequest invoking");
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_0100--------------------");
        });       

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_0200
        * @tc.name    : testVerifying the processing of the MessageSequence Asynchronous callback information of the async_onRemoteMessageRequest interface
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */   
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_0200--------------------");
            try{
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption(1);
                let token = "async onRemoteMessageRequest invoking";
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_ASYNC_ONREMOTEMESSAGE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("");
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_0200--------------------");
        });      

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_0300
        * @tc.name    : testVerifying the processing priority of the onRemoteRequest and async_onRemoteMessageRequest callback information synchronously
        *               invoked by the MessageSequence interface of the onRemoteMessageRequest interface
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */   
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_0300--------------------");
            try{
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = "onRemoteRequest or async onRemoteMessageRequest invoking";
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_ONREMOTE_ASYNC_ONREMOTEMESSAGE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("async onRemoteMessageRequest invoking");
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_0300--------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_0400
        * @tc.name    : testVerifying the processing priority of the onRemoteRequest and async_onRemoteMessageRequest callback information Asynchronously
        *               invoked by the MessageSequence interface of the onRemoteMessageRequest interface
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */   
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_0400--------------------");
            try{
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption(1);
                let token = "onRemoteRequest or async onRemoteMessageRequest invoking";
                data.writeString(token);
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_ONREMOTE_ASYNC_ONREMOTEMESSAGE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("");
                });
            } catch (error) {
                expect(error == null).assertTrue();
            }finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_0400--------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_0500
        * @tc.name    : testVerifying the processing of the MessageParcel synchronous callback information of the async_onRemoteMessageRequest interface
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */   
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_0500--------------------");
            try{
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = "async onRemoteMessageRequest invoking";
                var result = data.writeString(token);
                expect(result == true).assertTrue();
                if (gIRemoteObject == undefined)
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendRequest(CODE_ASYNC_ONREMOTEMESSAGE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("async onRemoteMessageRequest invoking");
                });
            } catch (error) {
                expect(error).assertEqual(null);
            }finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_0500--------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_0600
        * @tc.name    : testVerifying the processing of the MessageParcel Asynchronous callback information of the async_onRemoteMessageRequest interface
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */   
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_0600--------------------");
            try{
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption(1);
                let token = 'async onRemoteMessageRequest invoking';
                var result = data.writeString(token);
                expect(result == true).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_ASYNC_ONREMOTEMESSAGE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("");
                });
            } catch (error) {
                expect(error).assertEqual(null);
            }finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_0600--------------------");
        });  
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_0700
        * @tc.name    : testVerifying the processing priority of the onRemoteRequest and async_onRemoteMessageRequest callback information in synchronous
        *               invoking of the aa interface MessageParcel
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */   
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_0700--------------------");
            try{
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption();
                let token = 'onRemoteRequest or async onRemoteMessageRequest invoking';
                var result = data.writeString(token);
                expect(result == true).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_ONREMOTE_ASYNC_ONREMOTEMESSAGE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    var replyReadResult = result.reply.readString();
                    expect(replyReadResult).assertEqual("async onRemoteMessageRequest invoking");
                });
            } catch (error) {
                expect(error).assertEqual(null);
            }finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_0700--------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_0800
        * @tc.name    : testVerifying the processing priority of the onRemoteRequest and async_onRemoteMessageRequest callback information in Asynchronous
        *                invoking of the aa interface MessageParcel
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */   
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_0800--------------------");
            try{
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                let option = new rpc.MessageOption(1);
                let token = 'onRemoteRequest or async onRemoteMessageRequest invoking';
                var result = data.writeString(token);
                expect(result == true).assertTrue();
                expect(gIRemoteObject != undefined).assertTrue();
                await gIRemoteObject.sendMessageRequest(CODE_ONREMOTE_ASYNC_ONREMOTEMESSAGE, data, reply, option).then((result) => {
                    expect(result.errCode).assertEqual(0);
                    expect(result.reply.readString()).assertEqual("");
                });
            } catch (error) {
                expect(error).assertEqual(null);
            }finally{
                data.reclaim();
                reply.reclaim();
                done();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_0800--------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_0900
        * @tc.name    : testInvoke async_onRemoteMessageRequest to process information in synchronization mode and call back in AsyncCallback mode
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */   
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_0900--------------------");
            try{
                function sendMessageRequestCallback(result) {
                    try{
                        expect(result.errCode).assertEqual(0);
                        expect(result.reply.readString()).assertEqual("async onRemoteMessageRequest invoking");
                    } catch(e) {
                        expect(e == null).assertTrue();
                    }finally{
                        data.reclaim();
                        reply.reclaim();
                        done();
                    }
                }
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption();
                let token = "onRemoteRequest or async onRemoteMessageRequest invoking";
                data.writeString(token);
                console.info("start sendMessageRequestCallback");
                gIRemoteObject.sendMessageRequest(CODE_ASYNC_ONREMOTEMESSAGE, data, reply, option, sendMessageRequestCallback);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_0900--------------------");
        });

        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_1000
        * @tc.name    : testInvoke async_onRemoteMessageRequest to process information in asynchronous mode and call back in AsyncCallback mode
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */   
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_1000--------------------");
            try{
                var data = rpc.MessageSequence.create();
                var reply = rpc.MessageSequence.create();
                let option = new rpc.MessageOption(1);
                let token = "onRemoteRequest or async onRemoteMessageRequest invoking";
                data.writeString(token);
                function sendMessageRequestCallback(result) {
                    try{
                        expect(result.errCode).assertEqual(0);
                        expect(result.reply.readString()).assertEqual("");
                    } catch(e) {
                        expect(e == null).assertTrue();
                    }finally{
                        data.reclaim();
                        reply.reclaim();
                        done();
                    }
                }
                console.info("start sendMessageRequestCallback");
                gIRemoteObject.sendMessageRequest(CODE_ASYNC_ONREMOTEMESSAGE, data, reply, option,sendMessageRequestCallback);
            } catch (error) {
                expect(error == null).assertTrue();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_1000--------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_1100
        * @tc.name    : testWrites the specified anonymous shared object to this MessageSequence
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */   
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_1100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, function(){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_1100--------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ashmem = rpc.Ashmem.create("ashmem", 1024);
                data.writeAshmem(ashmem);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }finally{
                data.reclaim();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_1100--------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_1200
        * @tc.name    : testTest the function of serializing the readAshmem interface in MessageSequence mode
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */   
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_1200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, function(){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_1200--------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ashmem = rpc.Ashmem.create("ashmem", 1024);
                data.writeAshmem(ashmem);
                let ashmemdata = data.readAshmem();
                expect(ashmemdata != null).assertTrue();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error).assertEqual(null);
            }finally{
                data.reclaim();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_1200--------------------");
        });  
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_1300
        * @tc.name    : testTest the function of serializing the writeAshmem interface in MessageParcel mode
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */   
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_1300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, function(){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_1300--------------------");
            try{
                var data = rpc.MessageParcel.create();
                let ashmem = rpc.Ashmem.create("ashmem", 1024);
                let writedata = data.writeAshmem(ashmem);
                expect(writedata).assertTrue();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error == null).assertTrue();
            }finally{
                data.reclaim();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_1300--------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_1400
        * @tc.name    : testTest the function of serializing the readAshmem interface in MessageParcel mode
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */   
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_1400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, function(){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_1400--------------------");
            try{
                var data = rpc.MessageParcel.create();
                let ashmem = rpc.Ashmem.create("ashmem", 1024);
                let writedata = data.writeAshmem(ashmem);
                expect(writedata).assertTrue();
                let ashmemdata = data.readAshmem();
                expect(ashmemdata != null).assertTrue();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error).assertEqual(null);
            }finally{
                data.reclaim();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_1400--------------------");
        });  
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_1500
        * @tc.name    : testTo test the function of handling the exception of the writeAshmem interface in MessageSequence mode
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */   
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_1500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, function(){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_1500--------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ashmem = "";
                data.writeAshmem(ashmem);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }finally{
                data.reclaim();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_1500--------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_OnRemoteRequest_1600
        * @tc.name    : testTo test the function of handling the exception of the writeAshmem interface in MessageParcel mode
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */   
        it("SUB_DSoftbus_RPC_API_OnRemoteRequest_1600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, function(){
            console.info("--------------------start SUB_DSoftbus_RPC_API_OnRemoteRequest_1600--------------------");
            try{
                var data = rpc.MessageParcel.create();
                let weitedata = data.writeAshmem();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                expect(error != null).assertTrue();
            }finally{
                data.reclaim();
            }
            console.info("--------------------end SUB_DSoftbus_RPC_API_OnRemoteRequest_1600--------------------");
        });         
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_0100
        * @tc.name    : testwriteRemoteObject is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_0100---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let testRemoteObject = new TestRemoteObject("testObject");
                data.reclaim();
                data.writeRemoteObject(testRemoteObject);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_0100---------------------------");
        });        
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_0200
        * @tc.name    : testreadRemoteObject is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_0200---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let testRemoteObject = new TestRemoteObject("testObject");
                data.writeRemoteObject(testRemoteObject);
                data.reclaim();
                data.readRemoteObject();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } 
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_0200---------------------------");
        });         
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_0300
        * @tc.name    : testreadRemoteObject is proxy or remote object is invalid Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_0300---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.readRemoteObject();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.PROXY_OR_REMOTE_OBJECT_INVALID_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            } finally{
                data.reclaim();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_0300---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_0400
        * @tc.name    : testwriteInterfaceToken is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_0400---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeInterfaceToken("rpctest");
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_0400---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_0500
        * @tc.name    : testreadInterfaceToken is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_0500---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.writeInterfaceToken("rpctest");
                data.reclaim();
                data.readInterfaceToken();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_0500---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_0600
        * @tc.name    : testsetSize is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_0600---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.setSize(0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_0600---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_0700
        * @tc.name    : testsetCapacity is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_0700---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.setCapacity(64);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_0700---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_0800
        * @tc.name    : testrewindRead is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_0800---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.rewindRead(0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_0800---------------------------");
        });  
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_0900
        * @tc.name    : testrewindWrite is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_0900---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.rewindWrite(0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_0900---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_1000
        * @tc.name    : testwriteByte is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_1000---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeByte(2);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_1000---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_1100
        * @tc.name    : testreadByte is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_1100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_1100---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.readByte();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_1100---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_1200
        * @tc.name    : testwriteShort is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_1200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_1200---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeShort(0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_1200---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_1300
        * @tc.name    : testreadShort is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_1300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_1300---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.writeShort(0);
                data.reclaim();
                data.readShort();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_1300---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_1400
        * @tc.name    : testwriteInt is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_1400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_1400---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeInt(0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_1400---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_1500
        * @tc.name    : testreadInt is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_1500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_1500---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.writeInt(0);
                data.reclaim();
                data.readInt();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_1500---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_1600
        * @tc.name    : testwriteLong is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_1600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_1600---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeLong(0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_1600---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_1700
        * @tc.name    : testreadLong is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_1700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_1700---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.writeLong(0);
                data.reclaim();
                data.readLong();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_1700---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_1800
        * @tc.name    : testwriteFloat is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_1800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_1800---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeFloat(1.0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_1800---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_1900
        * @tc.name    : testreadFloat is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_1900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_1900---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.writeFloat(1.0);
                data.reclaim();
                data.readFloat();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_1900---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_2000
        * @tc.name    : testwriteDouble is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_2000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_2000---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeDouble(1.0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_2000---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_2100
        * @tc.name    : testreadDouble is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_2100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_2100---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.writeDouble(1.0);
                data.reclaim();
                data.readDouble();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_2100---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_2200
        * @tc.name    : testwriteBoolean is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_2200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_2200---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeBoolean(true);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_2200---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_2300
        * @tc.name    : testreadBoolean is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_2300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_2300---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.writeBoolean(true);
                data.reclaim();
                data.readBoolean();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_2300---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_2400
        * @tc.name    : testwriteChar is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_2400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_2400---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeChar(56);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_2400---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_2500
        * @tc.name    : testreadChar is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_2500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_2500---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.writeChar(56);
                data.reclaim();
                data.readChar();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_2500---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_2600
        * @tc.name    : testwriteString is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_2600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_2600---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeString("rpc");
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_2600---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_2700
        * @tc.name    : testreadString is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_2700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_2700---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.writeString("rpc");
                data.reclaim();
                data.readString();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_2700---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_2800
        * @tc.name    : testwriteParcelable is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_2800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_2800---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let sequenceable = new MySequenceable(1, "aaa");
                data.reclaim();
                data.writeParcelable(sequenceable);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_2800---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_2900
        * @tc.name    : testreadParcelable is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_2900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_2900---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let sequenceable = new MySequenceable(1, "aaa");
                data.writeParcelable(sequenceable);
                let ret = new MySequenceable(0, "");
                data.reclaim();
                data.readParcelable(ret);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_2900---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_3000
        * @tc.name    : testwriteByteArray is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_3000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_3000---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [1, 2, 3, 4, 5];
                data.reclaim();
                data.writeByteArray(ByteArrayVar);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_3000---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_3100
        * @tc.name    : testreadByteArray is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_3100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_3100---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [1, 2, 3, 4, 5];
                data.writeByteArray(ByteArrayVar);
                data.reclaim();
                data.readByteArray();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_3100---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_3200
        * @tc.name    : testwriteShortArray is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_3200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_3200---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [1, 2, 3, 4, 5];
                data.reclaim();
                data.writeShortArray(ByteArrayVar);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_3200---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_3300
        * @tc.name    : testreadShortArray is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_3300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_3300---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [1, 2, 3, 4, 5];
                data.writeShortArray(ByteArrayVar);
                data.reclaim();
                data.readShortArray();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_3300---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_3400
        * @tc.name    : testwriteIntArray is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_3400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_3400---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [1, 2, 3, 4, 5];
                data.reclaim();
                data.writeIntArray(ByteArrayVar);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_3400---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_3500
        * @tc.name    : testreadIntArray is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_3500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_3500---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [1, 2, 3, 4, 5];
                data.writeIntArray(ByteArrayVar);
                data.reclaim();
                data.readIntArray();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_3500---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_3600
        * @tc.name    : testwriteLongArray is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_3600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_3600---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [1, 2, 3, 4, 5];
                data.reclaim();
                data.writeLongArray(ByteArrayVar);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_3600---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_3700
        * @tc.name    : testreadLongArray is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_3700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_3700---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [1, 2, 3, 4, 5];
                data.writeLongArray(ByteArrayVar);
                data.reclaim();
                data.readLongArray();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_3700---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_3800
        * @tc.name    : testwriteFloatArray is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_3800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_3800---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [1.1, 2.2, 3.3];
                data.reclaim();
                data.writeFloatArray(ByteArrayVar);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_3800---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_3900
        * @tc.name    : testreadFloatArray is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_3900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_3900---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [1.1, 2.2, 3.3];
                data.writeFloatArray(ByteArrayVar);
                data.reclaim();
                data.readFloatArray();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_3900---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_4000
        * @tc.name    : testwriteDoubleArray is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_4000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_4000---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [11.1, 22.2, 33.3];
                data.reclaim();
                data.writeDoubleArray(ByteArrayVar);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_4000---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_4100
        * @tc.name    : testreadDoubleArray is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_4100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_4100---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [11.1, 22.2, 33.3];
                data.writeDoubleArray(ByteArrayVar);
                data.reclaim();
                data.readDoubleArray();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_4100---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_4200
        * @tc.name    : testwriteBooleanArray is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_4200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_4200---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [false, true, false];
                data.reclaim();
                data.writeBooleanArray(ByteArrayVar);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_4200---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_4300
        * @tc.name    : testreadBooleanArray is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_4300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_4300---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [false, true, false];
                data.writeBooleanArray(ByteArrayVar);
                data.reclaim();
                data.readBooleanArray();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_4300---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_4400
        * @tc.name    : testwriteCharArray is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_4400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_4400---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [97, 98, 88];
                data.reclaim();
                data.writeCharArray(ByteArrayVar);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_4400---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_4500
        * @tc.name    : testreadCharArray is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_4500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_4500---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = [97, 98, 88];
                data.writeCharArray(ByteArrayVar);
                data.reclaim();
                data.readCharArray();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_4500---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_4600
        * @tc.name    : testwriteStringArray is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_4600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_4600---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = ["abc", "def"];
                data.reclaim();
                data.writeStringArray(ByteArrayVar);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_4600---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_4700
        * @tc.name    : testreadStringArray is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_4700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_4700---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ByteArrayVar = ["abc", "def"];
                data.writeStringArray(ByteArrayVar);
                data.reclaim();
                data.readStringArray();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_4700---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_4800
        * @tc.name    : testwriteNoException is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_4800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_4800---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeNoException();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_4800---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_4900
        * @tc.name    : testreadException is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_4900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_4900---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.readException();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_4900 ---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_5000
        * @tc.name    : testwriteParcelableArray is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_5000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_5000---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let a = [new MySequenceable(1, "aaa"), new MySequenceable(2, "bbb"),
                new MySequenceable(3, "ccc")];
                data.reclaim();
                data.writeParcelableArray(a);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_5000---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_5100
        * @tc.name    : testreadParcelableArray is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_5100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_5100---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let a = [new MySequenceable(1, "aaa"), new MySequenceable(2, "bbb"),
                new MySequenceable(3, "ccc")];
                let b = [new MySequenceable(0, ""), new MySequenceable(0, ""), new MySequenceable(0, "")];
                data.writeParcelableArray(a);
                data.reclaim();
                data.readParcelableArray(b);                
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_5100 ---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_5200
        * @tc.name    : testwriteRemoteObjectArray is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_5200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_5200---------------------------");
            try{
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
                let listeners = [new TestListener("rpcListener", checkResult),
                    new TestListener("rpcListener2", checkResult),
                    new TestListener("rpcListener3", checkResult)];
                data.reclaim();
                data.writeRemoteObjectArray(listeners);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_5200---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_5300
        * @tc.name    : testreadRemoteObjectArray is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_5300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_5300---------------------------");
            try{
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
                let listeners = [new TestListener("rpcListener", checkResult),
                    new TestListener("rpcListener2", checkResult),
                    new TestListener("rpcListener3", checkResult)];
                data.writeRemoteObjectArray(listeners);
                data.reclaim();
                data.readRemoteObjectArray();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_5300 ---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_5400
        * @tc.name    : testdupFileDescriptor is call os dup function failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_5400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_5400---------------------------");
            try{
                rpc.MessageSequence.dupFileDescriptor(-1);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.OS_DUP_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_5400 ---------------------------");
        });         
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_5500
        * @tc.name    : testwriteFileDescriptor is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_5500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_5500---------------------------");
            try{
                let context = FA.getContext();
                await context.getFilesDir().then(async function(path) {
                    expect(path != null).assertTrue();
                    let basePath = path;
                    let filePath = basePath + "/test1.txt";
                    let fd = fileio.openSync(filePath, 0o2| 0o100 | 0o2000, 0o666);
                    var data = rpc.MessageSequence.create();
                    data.reclaim();
                    data.writeFileDescriptor(fd);
                })
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_5500 ---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_5600
        * @tc.name    : testreadFileDescriptor is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_5600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_5600---------------------------");
            try{
                let context = FA.getContext();
                await context.getFilesDir().then(async function(path) {
                    expect(path != null).assertTrue();
                    let basePath = path;
                    let filePath = basePath + "/test1.txt";
                    let fd = fileio.openSync(filePath, 0o2| 0o100 | 0o2000, 0o666);
                    var data = rpc.MessageSequence.create();
                    data.writeFileDescriptor(fd);
                    data.reclaim();
                    data.readFileDescriptor();
                })
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_5600 ---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_5700
        * @tc.name    : testwriteAshmem is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_5700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_5700---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ashmem = rpc.Ashmem.create("JsAshmemTest", 1024);
                data.reclaim();
                data.writeAshmem(ashmem);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_5700 ---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_5800
        * @tc.name    : test readAshmem is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_5800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_5800---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                let ashmem = rpc.Ashmem.create("JsAshmemTest", 1024);
                data.writeAshmem(ashmem);
                data.reclaim();
                data.readAshmem();
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_5800 ---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_5900
        * @tc.name    : testwriteRawData is write data to message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_5900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_5900---------------------------");
            try{
                var data = new rpc.MessageSequence();
                let arr = ["aaa", 1, 2, 3];
                data.reclaim();
                data.writeRawData(arr, arr.length);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_5900 ---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_6000
        * @tc.name    : testreadRawData is read data from message sequence failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_6000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_6000---------------------------");
            try{
                var data = new rpc.MessageSequence();
                let rawdata = [1, 2, 3]
                data.writeRawData(rawdata, rawdata.length);
                data.reclaim();
                data.readRawData(rawdata.length);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_6000 ---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_6100
        * @tc.name    : testregisterDeathRecipient is only proxy object permitted Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_6100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_6100---------------------------");
            try{
                let recipient = new TestAbilityStub("Test1223");
                recipient.registerDeathRecipient(null, 0)
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_Compatibility_MessageSequence_testcase error is:" + error);
                console.info("SUB_DSoftbus_RPC_Compatibility_MessageSequence_testcase error is:" + error.code);
                let errCode = `${rpc.ErrorCode.ONLY_PROXY_OBJECT_PERMITTED_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_6100 ---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_6200
        * @tc.name    : testunregisterDeathRecipient is only proxy object permitted Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_6200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_6200---------------------------");
            try{
                let recipient = new TestAbilityStub("Test1223");
                recipient.unregisterDeathRecipient(null, 0);
            } catch (error) {
                console.info("SUB_DSoftbus_RPC_Compatibility_MessageSequence_testcase error is:" + error);
                console.info("SUB_DSoftbus_RPC_Compatibility_MessageSequence_testcase error is:" + error.code);
                let errCode = `${rpc.ErrorCode.ONLY_PROXY_OBJECT_PERMITTED_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_6200 ---------------------------");
        });        
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_6300
        * @tc.name    : testwriteAshmem is write to ashmem failed Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3  
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_6300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_6300---------------------------");
            try{
                let ashmem = rpc.Ashmem.create("ashmem", 4);
                ashmem.mapReadWriteAshmem();
                let ByteArrayVar = [1, 2, 3, 4, 5];
                ashmem.writeAshmem(ByteArrayVar, 5, 0);
                ashmem.unmapAshmem();
                ashmem.closeAshmem();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_TO_ASHMEM_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_6300 ---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_6400
        * @tc.name    : testgetLocalInterface is only remote object permitted Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_6400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_6400---------------------------");
            try {
                gIRemoteObject.getLocalInterface('Test2');
            } catch (error) {
                let errCode = `${rpc.ErrorCode.ONLY_REMOTE_OBJECT_PERMITTED_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_6400---------------------------");
        }); 
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_6500
        * @tc.name    : testregisterDeathRecipient is only remote object permitted Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_6500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_6500---------------------------");
            try {
                let recipient = new MyDeathRecipient();
                gIRemoteObject.registerDeathRecipient(recipient, "");
            } catch (error) {
                let errCode = `${rpc.ErrorCode.ONLY_REMOTE_OBJECT_PERMITTED_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_6500---------------------------");
        });
        
        /*
        * @tc.number  : SUB_DSoftbus_RPC_API_Errorcode_6600
        * @tc.name    : testunregisterDeathRecipient is proxy or remote object is invalid Error verification
        * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   : 3
        * @tc.type    : Compatibility
        * @tc.size    : MediumTest
        */
        it("SUB_DSoftbus_RPC_API_Errorcode_6600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
            console.info("---------------------start SUB_DSoftbus_RPC_API_Errorcode_6600---------------------------");
            try {
                let recipient = new MyDeathRecipient();
                gIRemoteObject.registerDeathRecipient(recipient, "");
                gIRemoteObject.unregisterDeathRecipient(recipient, "");
            } catch (error) {
                let errCode = `${rpc.ErrorCode.ONLY_REMOTE_OBJECT_PERMITTED_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_DSoftbus_RPC_API_Errorcode_6600---------------------------");
        });        
        console.info("-----------------------SUB_DSoftbus_RPC_API_OnRemoteRequest_Test is end-----------------------");
    });
}