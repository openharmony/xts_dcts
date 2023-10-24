/*
 * Copyright (C) 2023 Huawei Device Co., Ltd.
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

import {describe, beforeAll, beforeEach, afterEach, afterAll, it, expect} from '@ohos/hypium';
import deviceManager from '@ohos.distributedDeviceManager';
import TestService from '../../../../../../../../../testtools/disjsTest/client/testService.js';
import RemoteHelper from '../../../../../../../../../testtools/disjsTest/client/remoteHelper.js';
import { UiDriver, BY } from '@ohos.UiTest'
import featureAbility from '@ohos.ability.featureAbility';
import distributedObject from '@ohos.data.distributedDataObject';
import deviceinfo from '@ohos.deviceInfo'
import rpc from '@ohos.rpc';

let context = featureAbility.getContext();

let localDeviceId = undefined;
let logTag = '[RpcClient:  ]';
let testservice = null;
let gIRemoteObject = null;
let remoteHelpers = null;
let deviceId = null;
let deviceList = undefined;

const TEST_BUNDLE_NAME = 'com.ohos.distributeobjectdisjs'; 

let localName = "Amylocal";
let localAge = 18;
let localIsVis = false;

let localName2 = "Amylocal2";
let localAge2 = 28;
let localIsVis2 = false;

let reName = "Lucyremote";
let reAge = 88;
let reIsVis = true;

const TEST_NAME_KEY = "name";
const TEST_AGE_KEY = "age";
const TEST_ISVIS_KEY = "isVis";

const TEST_NAME_VALUE = "Lucyremotetest";
const TEST_AGE_VALUE = 98;
const TEST_ISVIS_VALUE = false;

let CODE_INVOKE_OSVERSION = 88;
let flag_32Rlease = 1;
let remoteOSVersion = "";
let OSVersion32 = "OpenHarmony-3.2";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function getPermission() {
    console.info(`getPermission is start`);
    let permissions = ['ohos.permission.DISTRIBUTED_DATASYNC'];
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

export default function dataObjectTest() {
describe('dataObjectTest', function () {
    beforeAll(async function (done) {
        console.info(logTag + '-----------------beforeAll begin-----------------');

       let osReleaseTypeInfo = deviceinfo.osReleaseType;
       console.info('the value of the deviceinfo osReleaseType is :' + osReleaseTypeInfo);
       let osFullNameInfo = deviceinfo.osFullName;
       console.info('the value of the deviceinfo osFullName is :' + osFullNameInfo);

        await getPermission();
        sleep(5000);
        await driveFn();
        sleep(2000);

        testservice = new TestService();
        console.info(logTag + "deviceId: " + deviceId);
     
        await testservice.toConnectObjectAbility().then(data => {
            gIRemoteObject = data;
            console.info(logTag + "toConnectObjectAbility data is" + data);
            remoteHelpers = new RemoteHelper(testservice,gIRemoteObject);
        })
      
        let dmInstance = deviceManager.createDeviceManager(TEST_BUNDLE_NAME);
        deviceList = dmInstance.getAvailableDeviceListSync();
        deviceId = deviceList[0].networkId;
        console.info(logTag + "deviceId is: " + deviceId);
        syncDeviceIds = [deviceId];

        //get remote device os version
        console.info(logTag + "get remote device os version");
        let data = rpc.MessageSequence.create();
        let reply = rpc.MessageSequence.create();
        let option = new rpc.MessageOption();
        let token = "OpenHarmony-4.0";

        data.writeString(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_INVOKE_OSVERSION, data, reply, option).then((result) => {
            expect(result.errCode).assertEqual(0);
            let re =  result.reply.readString();
            remoteOSVersion = re.substring(0, 15);
            console.info(logTag + "re is: " + re);
            console.info(logTag + "remoteOSVersion is: " + remoteOSVersion);

            if (remoteOSVersion == OSVersion32) {
                flag_32Rlease = 0;
                console.info(logTag + "flag_32Rlease is: " + flag_32Rlease);
            } else {
                flag_32Rlease = 1;
                console.info(logTag + "flag_32Rlease is: " + flag_32Rlease);
            }
        });
        console.info(logTag + '-----------------beforeAll end-----------------');
        done();
    })

    beforeEach(async function(done){
        console.info(logTag + "-----------------beforeEach 0 -----------------");
        done();
    })

    afterEach(async function (done) {
        console.info(logTag + '-----------------afterEach -----------------');
        done();
    })

    afterAll(async function (done){
        console.info(logTag + '-----------------afterAll -----------------');
        flag_32Rlease = 1;
        done();
    })

    /**
     * @tc.number: SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0100
     * @tc.name: SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0100
     * @tc.desc: sessionId1 genSessionId, remote join sessionId1, sync success
     */
    it("SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0100", 0, async function(done){
        console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0100 start *************");
        console.info(logTag + "flag_32Rlease is: " + flag_32Rlease);
        if (flag_32Rlease == 0) {
            done();
        } else {

            await remoteHelpers.setTestCaseName("SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0100");

            console.info(logTag + "local: create object start");
            let g_object;
            g_object = distributedObject.create(context, {name: localName, age: localAge, isVis: localIsVis});
            expect(g_object != undefined).assertEqual(true);

            g_object.on("change", function (sessionId, changeData) {
                console.info(logTag + "change start " + sessionId);
                if (changeData != null && changeData != undefined) {
                    changeData.forEach(element => {
                        console.info(logTag + "changed ! " + element + " " + g_object[element]);
                    });
                }
                console.info(logTag + " change end.");
            });

            let sessionId1 = distributedObject.genSessionId();
            console.info(logTag + " sessionId1=" + sessionId1);
            await g_object.setSessionId(sessionId1).then(() => {
                console.info(logTag + "local: join session");
                expect(sessionId1 == g_object.__sessionId).assertEqual(true);
            }).catch((error) => {
                console.info(logTag + "join error: " + error.code + error.message);
                expect(null).assertFail();
            });
            
            console.info(logTag + "remote: create object start");
            await remoteHelpers.createObject(reName, reAge, reIsVis);
            await sleep(1000);
            console.info(logTag + "remote: setSessionId start");
            await remoteHelpers.setSessionId(sessionId1);
            await sleep(2000);

            expect(g_object.name == reName).assertEqual(true);
            expect(g_object.age == reAge).assertEqual(true);
            expect(g_object.isVis == reIsVis).assertEqual(true);

            console.info(logTag + " off change");
            g_object.off("change");
            g_object.setSessionId().then (()=>{
                console.info("leave all lession.");
            }).catch((error)=>{
                console.info("error:" + error.code + error.message);
            });
            await remoteHelpers.setSessionId();
            await sleep(1000);

            console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0100 end *************");
            done();
        }
    })

    /**
     * @tc.number: SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0200
     * @tc.name: SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0200
     * @tc.desc: sessionId1 "abcde", remote join sessionId1, sync success
     */
    it("SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0200", 0, async function(done){
        console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0200 start *************");
        console.info(logTag + "flag_32Rlease is: " + flag_32Rlease);
        if (flag_32Rlease == 0) {
            done();
        } else {

            await remoteHelpers.setTestCaseName("SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0200");

            console.info(logTag + "local: create object start");
            let g_object;
            g_object = distributedObject.create(context, {name: localName, age: localAge, isVis: localIsVis});
            expect(g_object != undefined).assertEqual(true);

            g_object.on("change", function (sessionId, changeData) {
                console.info(logTag + "change start " + sessionId);
                if (changeData != null && changeData != undefined) {
                    changeData.forEach(element => {
                        console.info(logTag + "changed ! " + element + " " + g_object[element]);
                    });
                }
                console.info(logTag + " change end.");
            });

            let sessionId1 = "abcde";
            console.info(logTag + " sessionId1=" + sessionId1);
            await g_object.setSessionId(sessionId1).then(() => {
                console.info(logTag + "local: join session");
                expect(sessionId1 == g_object.__sessionId).assertEqual(true);
            }).catch((error) => {
                console.info(logTag + "join error: " + error.code + error.message);
                expect(null).assertFail();
            });

            console.info(logTag + "remote: create object start");
            await remoteHelpers.createObject(reName, reAge, reIsVis);
            await sleep(1000);
            console.info(logTag + "remote: setSessionId start");
            await remoteHelpers.setSessionId(sessionId1);
            await sleep(2000);

            expect(g_object.name == reName).assertEqual(true);
            expect(g_object.age == reAge).assertEqual(true);
            expect(g_object.isVis == reIsVis).assertEqual(true);

            console.info(logTag + " off change");
            g_object.off("change");
            g_object.setSessionId().then (()=>{
                console.info("leave all lession.");
            }).catch((error)=>{
                console.info("error:" + error.code + error.message);
            });
            await remoteHelpers.setSessionId();
            await sleep(1000);

            console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0200 end *************");
            done();
            }
    })

    /**
     * @tc.number: SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0400
     * @tc.name: SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0400
     * @tc.desc: sessionId1 "123456", remote join sessionId1, sync success
     */
    it("SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0400", 0, async function(done){
        console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0400 start *************");
        console.info(logTag + "flag_32Rlease is: " + flag_32Rlease);
        if (flag_32Rlease == 0) {
            done();
        } else {

            await remoteHelpers.setTestCaseName("SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0400");
            console.info(logTag + "local: create object start");
            let g_object;
            g_object = distributedObject.create(context, {name: localName, age: localAge, isVis: localIsVis});
            expect(g_object != undefined).assertEqual(true);
        
            g_object.on("change", function (sessionId, changeData) {
                console.info(logTag + "change start " + sessionId);
                if (changeData != null && changeData != undefined) {
                    changeData.forEach(element => {
                        console.info(logTag + "changed ! " + element + " " + g_object[element]);
                    });
                }
                console.info(logTag + " change end.");
            });
        
            let sessionId1 = "123456";
            console.info(logTag + " sessionId1=" + sessionId1);
            await g_object.setSessionId(sessionId1).then(() => {
                console.info(logTag + "local: join session");
                expect(sessionId1 == g_object.__sessionId).assertEqual(true);
            }).catch((error) => {
                console.info(logTag + "join error: " + error.code + error.message);
                expect(null).assertFail();
            });
            
        
            console.info(logTag + "remote: create object start");
            await remoteHelpers.createObject(reName, reAge, reIsVis);
            await sleep(1000);
            console.info(logTag + "remote: setSessionId start");
            await remoteHelpers.setSessionId(sessionId1);
            await sleep(2000);
        
            expect(g_object.name == reName).assertEqual(true);
            expect(g_object.age == reAge).assertEqual(true);
            expect(g_object.isVis == reIsVis).assertEqual(true);
        
            console.info(logTag + " off change");
            g_object.off("change");
            g_object.setSessionId().then (()=>{
                console.info("leave all lession.");
            }).catch((error)=>{
                console.info("error:" + error.code + error.message);
            });
            await remoteHelpers.setSessionId();
            await sleep(1000);

            console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0400 end *************");
            done();
        }
    })

    /**
     * @tc.number: SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0900
     * @tc.name: SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0900
     * @tc.desc: local join sessionId1 , remote join sessionId2, sync fail
     */
     it("SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0900", 0, async function(done){
        console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0900 start *************");
        console.info(logTag + "flag_32Rlease is: " + flag_32Rlease);
        if (flag_32Rlease == 0) {
            done();
        } else {

            await remoteHelpers.setTestCaseName("SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0900");
            console.info(logTag + "local: create object start");
            let g_object;
            g_object = distributedObject.create(context, {name: localName, age: localAge, isVis: localIsVis});
            expect(g_object != undefined).assertEqual(true);
        
            g_object.on("change", function (sessionId, changeData) {
                console.info(logTag + "change start " + sessionId);
                if (changeData != null && changeData != undefined) {
                    changeData.forEach(element => {
                        console.info(logTag + "changed ! " + element + " " + g_object[element]);
                    });
                }
                console.info(logTag + " change end.");
            });
        
            let sessionId1 = "10001";
            console.info(logTag + " sessionId1=" + sessionId1);
            try{
                await g_object.setSessionId(sessionId1).then(() => {
                    console.info(logTag + "local: join session");
                }).catch((error) => {
                    console.info(logTag + "join failed, error.code: " + error.code + " error.message: " + error.message);
                });
            }catch(e){
                console.info(logTag + "join failed, e.code: " + e.code + " e.message: " + e.message);
            }

            console.info(logTag + "remote: create object start");
            await remoteHelpers.createObject(reName, reAge, reIsVis);
            await sleep(1000);
            let sessionId2 = "10002";
            console.info(logTag + "remote: setSessionId start");
            await remoteHelpers.setSessionId(sessionId2);
            await sleep(2000);
        
            //sync fail
            expect(g_object.name == localName).assertEqual(true);
            expect(g_object.age == localAge).assertEqual(true);
            expect(g_object.isVis == localIsVis).assertEqual(true);
        
            console.info(logTag + " off change");
            g_object.off("change");
            g_object.setSessionId().then (()=>{
                console.info("leave all lession.");
            }).catch((error)=>{
                console.info("error:" + error.code + error.message);
            });
            await remoteHelpers.setSessionId();
            await sleep(1000);

            console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_SetSessionId_0900 end *************");
            done();
        }
    })   

    /**
     * @tc.number: SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0100
     * @tc.name: SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0100
     * @tc.desc: local  modify name2 , sync success
     */
     it("SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0100", 0, async function(done){
        console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0100 start *************");
        console.info(logTag + "flag_32Rlease is: " + flag_32Rlease);
        if (flag_32Rlease == 0) {
            done();
        } else {
            await remoteHelpers.setTestCaseName("SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0100");

            console.info(logTag + "local: create object start");
            let g_object;
            g_object = distributedObject.create(context, {name: localName, age: localAge, isVis: localIsVis});
            expect(g_object != undefined).assertEqual(true);

            g_object.on("change", function (sessionId, changeData) {
                console.info(logTag + "change start " + sessionId);
                if (changeData != null && changeData != undefined) {
                    changeData.forEach(element => {
                        console.info(logTag + "changed ! " + element + " " + g_object[element]);
                    });
                }
                console.info(logTag + " change end.");
            });

            let sessionId1 = distributedObject.genSessionId();
            console.info(logTag + " sessionId1=" + sessionId1);
            await g_object.setSessionId(sessionId1).then(() => {
                console.info(logTag + "local: join session");
                expect(sessionId1 == g_object.__sessionId).assertEqual(true);
            }).catch((error) => {
                console.info(logTag + "join error: " + error.code + error.message);
                expect(null).assertFail();
            });

            console.info(logTag + "remote: create object start");
            await remoteHelpers.createObject(reName, reAge, reIsVis);
            await sleep(1000);
            console.info(logTag + "remote: setSessionId start");
            await remoteHelpers.setSessionId(sessionId1);
            await sleep(2000);

            expect(g_object.name == reName).assertEqual(true);
            expect(g_object.age == reAge).assertEqual(true);
            expect(g_object.isVis == reIsVis).assertEqual(true);

            //local modify name 
            console.info(logTag + "local: objectPut start");

            if (g_object != undefined && g_object != null) {
                g_object.name = localName2;
                g_object.age = localAge2;
                g_object.isVis = localIsVis2;
                expect(g_object.name == localName2).assertEqual(true);
                expect(g_object.age == localAge2).assertEqual(true);
                expect(g_object.isVis == localIsVis2).assertEqual(true);
                console.info(logTag + " put data success!");
            } else {
                console.info(logTag + " object is null,put name fail");
            }

            console.info(logTag + " off change");
            g_object.off("change");
            g_object.setSessionId().then (()=>{
                console.info("leave all lession.");
            }).catch((error)=>{
                console.info("error:" + error.code + error.message);
            });
            await remoteHelpers.setSessionId();
            await sleep(1000);

            console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0100 end *************");
            done();
        }
    })    


    /**
     * @tc.number: SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0200
     * @tc.name: SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0200
     * @tc.desc: local  modify name null, sync success
     */
     it("SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0200", 0, async function(done){
        console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0200 start *************");
        console.info(logTag + "flag_32Rlease is: " + flag_32Rlease);
        if (flag_32Rlease == 0) {
            done();
        } else {
            await remoteHelpers.setTestCaseName("SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0200");

            console.info(logTag + "local: create object start");
            let g_object;
            g_object = distributedObject.create(context, {name: localName, age: localAge, isVis: localIsVis});
            expect(g_object != undefined).assertEqual(true);

            g_object.on("change", function (sessionId, changeData) {
                console.info(logTag + "change start " + sessionId);
                if (changeData != null && changeData != undefined) {
                    changeData.forEach(element => {
                        console.info(logTag + "changed ! " + element + " " + g_object[element]);
                    });
                }
                console.info(logTag + " change end.");
            });

            let sessionId1 = distributedObject.genSessionId();
            console.info(logTag + " sessionId1=" + sessionId1);
            await g_object.setSessionId(sessionId1).then(() => {
                console.info(logTag + "local: join session");
                expect(sessionId1 == g_object.__sessionId).assertEqual(true);
            }).catch((error) => {
                console.info(logTag + "join error: " + error.code + error.message);
                expect(null).assertFail();
            });
            

            console.info(logTag + "remote: create object start");
            await remoteHelpers.createObject(reName, reAge, reIsVis);
            await sleep(1000);
            console.info(logTag + "remote: setSessionId start");
            await remoteHelpers.setSessionId(sessionId1);
            await sleep(2000);

            expect(g_object.name == reName).assertEqual(true);
            expect(g_object.age == reAge).assertEqual(true);
            expect(g_object.isVis == reIsVis).assertEqual(true);

            //local modify name 
            console.info(logTag + "local: objectPut start");

            if (g_object != undefined && g_object != null) {
                g_object.name = null;
                g_object.age = null;
                g_object.isVis = null;
                
                expect(g_object.name == null).assertEqual(true);
                expect(g_object.age == null).assertEqual(true);
                expect(g_object.isVis == null).assertEqual(true);
                console.info(logTag + " put data success!");
            } else {
                console.info(logTag + " object is null,put name fail");
            }

            console.info(logTag + " off change");
            g_object.off("change");
            g_object.setSessionId().then (()=>{
                console.info("leave all lession.");
            }).catch((error)=>{
                console.info("error:" + error.code + error.message);
            });
            await remoteHelpers.setSessionId();
            await sleep(1000);

            console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0200 end *************");
            done();
        }
    }) 

    /**
     * @tc.number: SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0300
     * @tc.name: SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0300
     * @tc.desc: local  modify name null, sync success
     */
     it("SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0300", 0, async function(done){
        console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0300 start *************");
        console.info(logTag + "flag_32Rlease is: " + flag_32Rlease);
        if (flag_32Rlease == 0) {
            done();
        } else {
            await remoteHelpers.setTestCaseName("SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0300");

            console.info(logTag + "local: create object start");
            let g_object;
            g_object = distributedObject.create(context, {name: localName, age: localAge, isVis: localIsVis});
            expect(g_object != undefined).assertEqual(true);

            g_object.on("change", function (sessionId, changeData) {
                console.info(logTag + "change start " + sessionId);
                if (changeData != null && changeData != undefined) {
                    changeData.forEach(element => {
                        console.info(logTag + "changed ! " + element + " " + g_object[element]);
                    });
                }
                console.info(logTag + " change end.");
            });

            let sessionId1 = distributedObject.genSessionId();
            console.info(logTag + " sessionId1=" + sessionId1);
            await g_object.setSessionId(sessionId1).then(() => {
                console.info(logTag + "local: join session");
                expect(sessionId1 == g_object.__sessionId).assertEqual(true);
            }).catch((error) => {
                console.info(logTag + "join error: " + error.code + error.message);
                expect(null).assertFail();
            });

            console.info(logTag + "remote: create object start");
            await remoteHelpers.createObject(reName, reAge, reIsVis);
            await sleep(1000);
            console.info(logTag + "remote: setSessionId start");
            await remoteHelpers.setSessionId(sessionId1);
            await sleep(2000);

            expect(g_object.name == reName).assertEqual(true);
            expect(g_object.age == reAge).assertEqual(true);
            expect(g_object.isVis == reIsVis).assertEqual(true);

            //local modify name 
            console.info(logTag + "local: objectPut start");

            if (g_object != undefined && g_object != null) {
                g_object.name = undefined;
                g_object.age = undefined;
                g_object.isVis = undefined;
                
                expect(g_object.name == undefined).assertEqual(true);
                expect(g_object.age == undefined).assertEqual(true);
                expect(g_object.isVis == undefined).assertEqual(true);
                console.info(logTag + " put data success!");
            } else {
                console.info(logTag + " object is null,put name fail");
            }

            console.info(logTag + " off change");
            g_object.off("change");
            g_object.setSessionId().then (()=>{
                console.info("leave all lession.");
            }).catch((error)=>{
                console.info("error:" + error.code + error.message);
            });
            await remoteHelpers.setSessionId();
            await sleep(1000);

            console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_Modify_Local_0300 end *************");
            done();
        }
    }) 
    /**
     * @tc.number: SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0100
     * @tc.name: SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0100
     * @tc.desc: remote  modify name , sync success
     */
     it("SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0100", 0, async function(done){
        console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0100 start *************");
        console.info(logTag + "flag_32Rlease is: " + flag_32Rlease);
        if (flag_32Rlease == 0) {
            done();
        } else {
            await remoteHelpers.setTestCaseName("SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0100");

            console.info(logTag + "local: create object start");
            let g_object;
            g_object = distributedObject.create(context, {name: localName, age: localAge, isVis: localIsVis});
            expect(g_object != undefined).assertEqual(true);

            g_object.on("change", function (sessionId, changeData) {
                console.info(logTag + "change start " + sessionId);
                if (changeData != null && changeData != undefined) {
                    changeData.forEach(element => {
                        console.info(logTag + "changed ! " + element + " " + g_object[element]);
                    });
                }
                console.info(logTag + " change end.");
            });

            let sessionId1 = distributedObject.genSessionId();
            console.info(logTag + " sessionId1=" + sessionId1);
            await g_object.setSessionId(sessionId1).then(() => {
                console.info(logTag + "local: join session");
                expect(sessionId1 == g_object.__sessionId).assertEqual(true);
            }).catch((error) => {
                console.info(logTag + "join error: " + error.code + error.message);
                expect(null).assertFail();
            });
            
            console.info(logTag + "remote: create object start");
            await remoteHelpers.createObject(reName, reAge, reIsVis);
            await sleep(1000);
            console.info(logTag + "remote: setSessionId start");
            await remoteHelpers.setSessionId(sessionId1);
            await sleep(2000);

            expect(g_object.name == reName).assertEqual(true);
            expect(g_object.age == reAge).assertEqual(true);
            expect(g_object.isVis == reIsVis).assertEqual(true);

            //remote modify name 
            console.info(logTag + "remote: objectPut start");
            await remoteHelpers.objectPut(TEST_NAME_KEY, TEST_NAME_VALUE);
            await sleep(2000);

            expect(g_object.name == TEST_NAME_VALUE).assertEqual(true);

            console.info(logTag + " off change");
            g_object.off("change");
            g_object.setSessionId().then (()=>{
                console.info("leave all lession.");
            }).catch((error)=>{
                console.info("error:" + error.code + error.message);
            });
            await remoteHelpers.setSessionId();
            await sleep(1000);

            console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0100 end *************");
            done();
        }
    })    

    /**
     * @tc.number: SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0200
     * @tc.name: SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0200
     * @tc.desc: remote  modify number , sync success
     */
     it("SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0200", 0, async function(done){
        console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0200 start *************");
        console.info(logTag + "flag_32Rlease is: " + flag_32Rlease);
        if (flag_32Rlease == 0) {
            done();
        } else {
            await remoteHelpers.setTestCaseName("SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0200");

            console.info(logTag + "local: create object start");
            let g_object;
            g_object = distributedObject.create(context, {name: localName, age: localAge, isVis: localIsVis});
            expect(g_object != undefined).assertEqual(true);

            g_object.on("change", function (sessionId, changeData) {
                console.info(logTag + "change start " + sessionId);
                if (changeData != null && changeData != undefined) {
                    changeData.forEach(element => {
                        console.info(logTag + "changed ! " + element + " " + g_object[element]);
                    });
                }
                console.info(logTag + " change end.");
            });

            let sessionId1 = distributedObject.genSessionId();
            console.info(logTag + " sessionId1=" + sessionId1);
            await g_object.setSessionId(sessionId1).then(() => {
                console.info(logTag + "local: join session");
                expect(sessionId1 == g_object.__sessionId).assertEqual(true);
            }).catch((error) => {
                console.info(logTag + "join error: " + error.code + error.message);
                expect(null).assertFail();
            });
            
            console.info(logTag + "remote: create object start");
            await remoteHelpers.createObject(reName, reAge, reIsVis);
            await sleep(1000);
            console.info(logTag + "remote: setSessionId start");
            await remoteHelpers.setSessionId(sessionId1);
            await sleep(2000);

            expect(g_object.name == reName).assertEqual(true);
            expect(g_object.age == reAge).assertEqual(true);
            expect(g_object.isVis == reIsVis).assertEqual(true);

            //remote modify name 
            console.info(logTag + "remote: objectPut start");
            await remoteHelpers.objectPut(TEST_AGE_KEY, TEST_AGE_VALUE);
            await sleep(2000);

            expect(g_object.age == TEST_AGE_VALUE).assertEqual(true);

            console.info(logTag + " off change");
            g_object.off("change");
            g_object.setSessionId().then (()=>{
                console.info("leave all lession.");
            }).catch((error)=>{
                console.info("error:" + error.code + error.message);
            });
            await remoteHelpers.setSessionId();
            await sleep(1000);

            console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0200 end *************");
            done();
        }
    })    

    /**
     * @tc.number: SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0300
     * @tc.name: SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0300
     * @tc.desc: remote  modify bool , sync success
     */
     it("SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0300", 0, async function(done){
        console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0300 start *************");
        console.info(logTag + "flag_32Rlease is: " + flag_32Rlease);
        if (flag_32Rlease == 0) {
            done();
        } else {
            await remoteHelpers.setTestCaseName("SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0300");

            console.info(logTag + "local: create object start");
            let g_object;
            g_object = distributedObject.create(context, {name: localName, age: localAge, isVis: localIsVis});
            expect(g_object != undefined).assertEqual(true);

            g_object.on("change", function (sessionId, changeData) {
                console.info(logTag + "change start " + sessionId);
                if (changeData != null && changeData != undefined) {
                    changeData.forEach(element => {
                        console.info(logTag + "changed ! " + element + " " + g_object[element]);
                    });
                }
                console.info(logTag + " change end.");
            });

            let sessionId1 = distributedObject.genSessionId();
            console.info(logTag + " sessionId1=" + sessionId1);
            await g_object.setSessionId(sessionId1).then(() => {
                console.info(logTag + "local: join session");
                expect(sessionId1 == g_object.__sessionId).assertEqual(true);
            }).catch((error) => {
                console.info(logTag + "join error: " + error.code + error.message);
                expect(null).assertFail();
            });
            
            console.info(logTag + "remote: create object start");
            await remoteHelpers.createObject(reName, reAge, reIsVis);
            await sleep(1000);
            console.info(logTag + "remote: setSessionId start");
            await remoteHelpers.setSessionId(sessionId1);
            await sleep(2000);

            expect(g_object.name == reName).assertEqual(true);
            expect(g_object.age == reAge).assertEqual(true);
            expect(g_object.isVis == reIsVis).assertEqual(true);

            //remote modify name 
            console.info(logTag + "remote: objectPut start");
            await remoteHelpers.objectPut(TEST_ISVIS_KEY, TEST_ISVIS_VALUE);
            await sleep(2000);

            expect(g_object.isVis == TEST_ISVIS_VALUE).assertEqual(true);

            console.info(logTag + " off change");
            g_object.off("change");
            g_object.setSessionId().then (()=>{
                console.info("leave all lession.");
            }).catch((error)=>{
                console.info("error:" + error.code + error.message);
            });
            await remoteHelpers.setSessionId();
            await sleep(1000);

            console.info(logTag + "************* SUB_DDM_DISTRIBUTEDOBJECT_Modify_Server_0300 end *************");
            done();
        }
    })   

})
}