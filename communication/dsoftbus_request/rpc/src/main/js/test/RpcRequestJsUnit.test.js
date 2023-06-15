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
import TestService from "./testService"
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
        * @tc.number  SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_00100
        * @tc.name    Verifying the processing of the MessageSequence Asynchronous callback information of the async_onRemoteMessageRequest interface
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
        * @tc.name    Verifying the processing of the MessageSequence synchronous callback information of the async_onRemoteMessageRequest interface
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
        * @tc.name    Verifying the processing priority of the onRemoteRequest and async_onRemoteMessageRequest callback information Asynchronously
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
        * @tc.name    Verifying the processing priority of the onRemoteRequest and async_onRemoteMessageRequest callback information synchronously
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
        * @tc.name    Verifying the processing of the MessageParcel Asynchronous callback information of the async_onRemoteMessageRequest interface
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
        * @tc.name    Verifying the processing of the MessageParcel synchronous callback information of the async_onRemoteMessageRequest interface
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
        * @tc.name    Verifying the processing priority of the onRemoteRequest and async_onRemoteMessageRequest callback information in Asynchronous
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
        * @tc.name    Verifying the processing priority of the onRemoteRequest and async_onRemoteMessageRequest callback information in synchronous
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
        * @tc.number  SUB_Softbus_IPC_Compatibility_onRemoteMessageRequest_00900
        * @tc.name    Invoke async_onRemoteMessageRequest to process information in synchronization mode and call back in AsyncCallback mode
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_Softbus_IPC_Compatibility_onRemoteMessageRequest_00900", 0, function(done){
            console.info("--------------------start SUB_Softbus_IPC_Compatibility_onRemoteMessageRequest_00900--------------------");
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
            console.info("--------------------end SUB_Softbus_IPC_Compatibility_onRemoteMessageRequest_00900--------------------");
        });

        /*
        * @tc.number  SUB_Softbus_IPC_Compatibility_onRemoteMessageRequest_01000
        * @tc.name    Invoke async_onRemoteMessageRequest to process information in asynchronous mode and call back in AsyncCallback mode
        * @tc.desc    [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
        * @tc.level   3
        */   
        it("SUB_Softbus_IPC_Compatibility_onRemoteMessageRequest_01000", 0, function(done){
            console.info("--------------------start SUB_Softbus_IPC_Compatibility_onRemoteMessageRequest_01000--------------------");
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
            console.info("--------------------end SUB_Softbus_IPC_Compatibility_onRemoteMessageRequest_01000--------------------");
        });               
        console.info("-----------------------SUB_DSoftbus_RPC_Compatibility_onRemoteMessageRequest_Test is end-----------------------");
    });
}