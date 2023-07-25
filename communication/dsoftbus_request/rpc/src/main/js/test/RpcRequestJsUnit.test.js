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
import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from '@ohos/hypium';
import { UiDriver, BY } from '@ohos.UiTest'
export default function RpcRequestJsUnitTest() {

    describe('RpcRequestJsUnitTest', function () {
        console.info("-----------------------SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_Test is starting-----------------------");

        const CODE_ASYNC_ONREMOTEMESSAGE = 1;
        const CODE_ONREMOTE_ASYNC_ONREMOTEMESSAGE = 2;
        let gIRemoteObject = null;
        var testservice = null

        function sleep(numberMillis)
        {
            var now = new Date();
            var exitTime = now.getTime() + numberMillis;
            while (true) {
                now = new Date();
                if (now.getTime() > exitTime)
                    return;
            }
        }

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
        * @tc.number  SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00100
        * @tc.name    Verifying the processing of the MessageSequence synchronous callback information of the async_onRemoteMessageRequest interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */       
        it("SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00100", 0, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00100--------------------");
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
            console.info("--------------------end SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00100--------------------");
        });       

        /*
        * @tc.number  SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00200
        * @tc.name    Verifying the processing of the MessageSequence Asynchronous callback information of the async_onRemoteMessageRequest interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00200", 0, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00200--------------------");
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
            console.info("--------------------end SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00200--------------------");
        });      

        /*
        * @tc.number  SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00300
        * @tc.name    Verifying the processing priority of the onRemoteRequest and async_onRemoteMessageRequest callback information synchronously
        *               invoked by the MessageSequence interface of the onRemoteMessageRequest interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00300", 0, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00300--------------------");
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
            console.info("--------------------end SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00300--------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00400
        * @tc.name    Verifying the processing priority of the onRemoteRequest and async_onRemoteMessageRequest callback information Asynchronously
        *               invoked by the MessageSequence interface of the onRemoteMessageRequest interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00400", 0, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00400--------------------");
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
            console.info("--------------------end SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00400--------------------");
        });
        
        /*
        * @tc.number  SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00500
        * @tc.name    Verifying the processing of the MessageParcel synchronous callback information of the async_onRemoteMessageRequest interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00500", 0, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00500--------------------");
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
            console.info("--------------------end SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00500--------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00600
        * @tc.name    Verifying the processing of the MessageParcel Asynchronous callback information of the async_onRemoteMessageRequest interface
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00600", 0, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00600--------------------");
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
            console.info("--------------------end SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00600--------------------");
        });  
        
        /*
        * @tc.number  SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00700
        * @tc.name    Verifying the processing priority of the onRemoteRequest and async_onRemoteMessageRequest callback information in synchronous
        *               invoking of the aa interface MessageParcel
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00700", 0, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00700--------------------");
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
            console.info("--------------------end SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00700--------------------");
        });
        
        /*
        * @tc.number  SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00800
        * @tc.name    Verifying the processing priority of the onRemoteRequest and async_onRemoteMessageRequest callback information in Asynchronous
        *                invoking of the aa interface MessageParcel
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00800", 0, async function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00800--------------------");
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
            console.info("--------------------end SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00800--------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00900
        * @tc.name    Invoke async_onRemoteMessageRequest to process information in synchronization mode and call back in AsyncCallback mode
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00900", 0, function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00900--------------------");
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
            console.info("--------------------end SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00900--------------------");
        });

        /*
        * @tc.number  SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_01000
        * @tc.name    Invoke async_onRemoteMessageRequest to process information in asynchronous mode and call back in AsyncCallback mode
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_01000", 0, function(done){
            console.info("--------------------start SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_01000--------------------");
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
            console.info("--------------------end SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_01000--------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01100
        * @tc.name    Writes the specified anonymous shared object to this MessageSequence
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01100", 0, function(){
            console.info("--------------------start SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01100--------------------");
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
            console.info("--------------------end SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01100--------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01200
        * @tc.name    Test the function of serializing the readAshmem interface in MessageSequence mode
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01200", 0, function(){
            console.info("--------------------start SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01200--------------------");
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
            console.info("--------------------end SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01200--------------------");
        });  
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01300
        * @tc.name    Test the function of serializing the writeAshmem interface in MessageParcel mode
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01300", 0, function(){
            console.info("--------------------start SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01300--------------------");
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
            console.info("--------------------end SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01300--------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01400
        * @tc.name    Test the function of serializing the readAshmem interface in MessageParcel mode
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01400", 0, function(){
            console.info("--------------------start SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01400--------------------");
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
            console.info("--------------------end SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01400--------------------");
        });  
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01500
        * @tc.name    To test the function of handling the exception of the writeAshmem interface in MessageSequence mode
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01500", 0, function(){
            console.info("--------------------start SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01500--------------------");
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
            console.info("--------------------end SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01500--------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01600
        * @tc.name    To test the function of handling the exception of the writeAshmem interface in MessageParcel mode
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01600", 0, function(){
            console.info("--------------------start SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01600--------------------");
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
            console.info("--------------------end SUB_Softbus_RPC_Compatibility_onRemoteMessageRequest_01600--------------------");
        });         
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00100
        * @tc.name    writeRemoteObject is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00100", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00100---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00100---------------------------");
        });        
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00200
        * @tc.name    readRemoteObject is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00200", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00200---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00200---------------------------");
        });         
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00300
        * @tc.name    readRemoteObject is proxy or remote object is invalid Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00300", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00300---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00300---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00400
        * @tc.name    writeInterfaceToken is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00400", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00400---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeInterfaceToken("rpctest");
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00400---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00500
        * @tc.name    readInterfaceToken is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00500", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00500---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00500---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00600
        * @tc.name    setSize is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00600", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00600---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.setSize(0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00600---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00700
        * @tc.name    setCapacity is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00700", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00700---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.setCapacity(64);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00700---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00800
        * @tc.name    rewindRead is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00800", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00800---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.rewindRead(0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00800---------------------------");
        });  
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00900
        * @tc.name    rewindWrite is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00900", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00900---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.rewindWrite(0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_00900---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01000
        * @tc.name    writeByte is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01000", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01000---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeByte(2);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01000---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01100
        * @tc.name    readByte is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01100", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01100---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.readByte();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01100---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01200
        * @tc.name    writeShort is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01200", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01200---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeShort(0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01200---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01300
        * @tc.name    readShort is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01300", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01300---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01300---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01400
        * @tc.name    writeInt is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01400", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01400---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeInt(0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01400---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01500
        * @tc.name    readInt is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01500", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01500---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01500---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01600
        * @tc.name    writeLong is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01600", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01600---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeLong(0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01600---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01700
        * @tc.name    readLong is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01700", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01700---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01700---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01800
        * @tc.name    writeFloat is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01800", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01800---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeFloat(1.0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01800---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01900
        * @tc.name    readFloat is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01900", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01900---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_01900---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02000
        * @tc.name    writeDouble is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02000", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02000---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeDouble(1.0);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02000---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02100
        * @tc.name    readDouble is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02100", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02100---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02100---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02200
        * @tc.name    writeBoolean is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02200", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02200---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeBoolean(true);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02200---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02300
        * @tc.name    readBoolean is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02300", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02300---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02300---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02400
        * @tc.name    writeChar is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02400", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02400---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeChar(56);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02400---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02500
        * @tc.name    readChar is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02500", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02500---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02500---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02600
        * @tc.name    writeString is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02600", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02600---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeString("rpc");
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02600---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02700
        * @tc.name    readString is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02700", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02700---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02700---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02800
        * @tc.name    writeParcelable is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02800", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02800---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02800---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02900
        * @tc.name    readString is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02900", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02900---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_02900---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03000
        * @tc.name    writeByteArray is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03000", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03000---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03000---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03100
        * @tc.name    readByteArray is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03100", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03100---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03100---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03200
        * @tc.name    writeShortArray is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03200", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03200---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03200---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03300
        * @tc.name    readShortArray is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03300", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03300---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03300---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03400
        * @tc.name    writeIntArray is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03400", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03400---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03400---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03500
        * @tc.name    readIntArray is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03500", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03500---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03500---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03600
        * @tc.name    writeLongArray is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03600", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03600---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03600---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03700
        * @tc.name    readLongArray is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03700", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03700---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03700---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03800
        * @tc.name    writeFloatArray is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03800", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03800---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03800---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03900
        * @tc.name    readFloatArray is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03900", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03900---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_03900---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04000
        * @tc.name    writeDoubleArray is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04000", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04000---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04000---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04100
        * @tc.name    readDoubleArray is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04100", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04100---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04100---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04200
        * @tc.name    writeBooleanArray is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04200", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04200---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04200---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04300
        * @tc.name    readBooleanArray is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04300", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04300---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04300---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04400
        * @tc.name    writeCharArray is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04400", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04400---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04400---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04500
        * @tc.name    readCharArray is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04500", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04500---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04500---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04600
        * @tc.name    writeStringArray is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04600", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04600---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04600---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04700
        * @tc.name    readStringArray is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04700", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04700---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04700---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04800
        * @tc.name    writeNoException is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04800", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04800---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.writeNoException();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04800---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04900
        * @tc.name    readException is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04900", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04900---------------------------");
            try{
                var data = rpc.MessageSequence.create();
                data.reclaim();
                data.readException();
            } catch (error) {
                let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_04900 ---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05000
        * @tc.name    writeParcelableArray is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05000", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05000---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05000---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05100
        * @tc.name    readParcelableArray is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05100", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05100---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05100 ---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05200
        * @tc.name    writeRemoteObjectArray is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05200", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05200---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05200---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05300
        * @tc.name    readRemoteObjectArray is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05300", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05300---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05300 ---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05400
        * @tc.name    dupFileDescriptor is call os dup function failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05400", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05400---------------------------");
            try{
                rpc.MessageSequence.dupFileDescriptor(-1);
            } catch (error) {
                let errCode = `${rpc.ErrorCode.OS_DUP_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05400 ---------------------------");
        });         
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05500
        * @tc.name    writeFileDescriptor is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05500", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05500---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05500 ---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05600
        * @tc.name    readFileDescriptor is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05600", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05600---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05600 ---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05700
        * @tc.name    writeAshmem is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05700", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05700---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05700 ---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05800
        * @tc.name     readAshmem is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05800", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05800---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05800 ---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05900
        * @tc.name    writeRawData is write data to message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05900", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05900---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_05900 ---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_06000
        * @tc.name    readRawData is read data from message sequence failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_06000", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_06000---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_MessageSequence_errorcode_06000 ---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_errorcode_00100
        * @tc.name    registerDeathRecipient is only proxy object permitted Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_errorcode_00100", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_errorcode_00100---------------------------");
            try{
                let recipient = new TestAbilityStub("Test1223");
                recipient.registerDeathRecipient(null, 0)
            } catch (error) {
                console.info("SUB_Softbus_RPC_Compatibility_MessageSequence_testcase error is:" + error);
                console.info("SUB_Softbus_RPC_Compatibility_MessageSequence_testcase error is:" + error.code);
                let errCode = `${rpc.ErrorCode.ONLY_PROXY_OBJECT_PERMITTED_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_errorcode_00100 ---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_IRemoteObject_errorcode_00200
        * @tc.name    unregisterDeathRecipient is only proxy object permitted Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_IRemoteObject_errorcode_00200", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_IRemoteObject_errorcode_00200---------------------------");
            try{
                let recipient = new TestAbilityStub("Test1223");
                recipient.unregisterDeathRecipient(null, 0);
            } catch (error) {
                console.info("SUB_Softbus_RPC_Compatibility_MessageSequence_testcase error is:" + error);
                console.info("SUB_Softbus_RPC_Compatibility_MessageSequence_testcase error is:" + error.code);
                let errCode = `${rpc.ErrorCode.ONLY_PROXY_OBJECT_PERMITTED_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_IRemoteObject_errorcode_00200 ---------------------------");
        });        
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_Ashmem_errorcode_00100
        * @tc.name    writeAshmem is write to ashmem failed Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   0   
        */
        it("SUB_Softbus_RPC_Compatibility_Ashmem_errorcode_00100", 0,async function(){
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_Ashmem_errorcode_00100---------------------------");
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
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_Ashmem_errorcode_00100 ---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_errorcode_00100
        * @tc.name    getLocalInterface is only remote object permitted Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_errorcode_00100", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_errorcode_00100---------------------------");
            try {
                gIRemoteObject.getLocalInterface('Test2');
            } catch (error) {
                let errCode = `${rpc.ErrorCode.ONLY_REMOTE_OBJECT_PERMITTED_ERROR}`;
                expect(error.code == errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_errorcode_00100---------------------------");
        }); 
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_errorcode_00200
        * @tc.name    registerDeathRecipient is only remote object permitted Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_errorcode_00200", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_errorcode_00200---------------------------");
            try {
                let recipient = new MyDeathRecipient();
                gIRemoteObject.registerDeathRecipient(recipient, "");
            } catch (error) {
                let errCode = `${rpc.ErrorCode.ONLY_REMOTE_OBJECT_PERMITTED_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_errorcode_00200---------------------------");
        });
        
        /*
        * @tc.number  SUB_Softbus_RPC_Compatibility_RemoteProxy_errorcode_00300
        * @tc.name    unregisterDeathRecipient is proxy or remote object is invalid Error verification
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */
        it("SUB_Softbus_RPC_Compatibility_RemoteProxy_errorcode_00300", 0, async function () {
            console.info("---------------------start SUB_Softbus_RPC_Compatibility_RemoteProxy_errorcode_00300---------------------------");
            try {
                let recipient = new MyDeathRecipient();
                gIRemoteObject.registerDeathRecipient(recipient, "");
                gIRemoteObject.unregisterDeathRecipient(recipient, "");
            } catch (error) {
                let errCode = `${rpc.ErrorCode.ONLY_REMOTE_OBJECT_PERMITTED_ERROR}`;
                expect(error.code != errCode).assertTrue();
                expect(error.message != null).assertTrue();
            }
            console.info("---------------------end SUB_Softbus_RPC_Compatibility_RemoteProxy_errorcode_00300---------------------------");
        });        
        console.info("-----------------------SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_Test is end-----------------------");
    });
}