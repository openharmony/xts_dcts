/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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
import TestService from "./testService";
import "./testService";
import {describe, beforeAll, beforeEach, afterEach, afterAll, it, expect} from 'deccjsunit/index';

let gIRemoteObject = null;
let testservice = null;
let localDeviceId = undefined;
let dvList = [];
let dvId = null;

deviceManager.createDeviceManager('ohos.dms.test',async (error, deviceManager) =>{
    console.info("CLIENT Create device manager success");
    localDeviceId = deviceManager.getLocalDeviceInfoSync().deviceId;
    console.info("local device id is: " + localDeviceId);
    let deviceList = deviceManager.getTrustedDeviceListSync();
    dvList = deviceList; 
    let deviceId = deviceList[0].deviceId;
    dvId = deviceId;
    console.info("deviceid is: " + deviceId)
    console.info("deviceList is: " + JSON.stringify(deviceList))
})

describe('dmsJsUnitTest', function(){
    console.info("-----------------------SUB_Softbus_dms_Compatibility_MessageParce_Test is starting-----------------------");

    class ConnectRemoteService {
        onConnectCallback(element, remote) {
            gIRemoteObject = remote;
            if (gIRemoteObject == null) {
                console.info(' not connected yet')
                expect(false).assertTrue();
            }
            console.info('onConnectCallback gIRemoteObject:' + gIRemoteObject)
        }
        onDisconnectCallback(element) {
            console.info("server onDisconnectCallback")
            console.info('onConnectRemoteService onDisconnectDone element: ' + element)
        }      
        onFailedCallback(code) {
            console.info("server onFailedCallback")
            console.info('onConnectRemoteService onFailed errCode: ' + code)
        }     
    }
    
    function sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time))
    }

    beforeAll(async function(done) {
        console.info('beforeAll called ');
        testservice = new TestService
        await testservice.toConnectAbility().then(data => {
            gIRemoteObject = data;
            console.info("toConnectAbility data is:" + data);
        })
        done();
        console.info("beforeAll done");
    })
    beforeEach(function () {
        console.info('beforeEach called')
    })
    afterEach(function (){
        console.info('afterEach called')
    })
    afterAll(function (){
        console.info('afterAll called')
    })

    /*
     * @tc.number  SUB_ABILITY_FEATUREABILITY_ONSTARTREMOTEABILITY_00100
     * @tc.name    Call the writeinterfacetoken interface, write the interface descriptor, and read interfacetoken
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_ABILITY_FEATUREABILITY_ONSTARTREMOTEABILITY_00100", 0, async function(done){
        console.info("-----------------SUB_ABILITY_FEATUREABILITY_ONSTARTREMOTEABILITY_00100------------------------");
        try{
            console.info("onStartRemoteAbility001 dvList:" + dvList.length);
            let numDevices = dvList.length;
            if (numDevices === 0) {
                console.info('onStartRemoteAbility001 no device found');
                expect(numDevices === 0).assertFail();
            }
            let params;
            let wantValue = {
                "bundleName":"com.ohos.dmstest",
                "abilityName":"com.ohos.dmstest.ServiceAbility",
                "deviceId": dvId,
                "parameters": params
            };
            console.info('onStartRemoteAbility want=' + JSON.stringify(wantValue));
            await featureAbility.startAbility({
                want: wantValue
                }).then((data) => {
                console.info('onStartRemoteAbility001 ' + JSON.stringify(data));
                expect(data != null).assertTrue();
            });
        } catch (error) {
            console.info("onStartRemoteAbility001:error = " + error);
            expect(null).assertFail();
        }
       done();
    }); 


    /*
     * @tc.number  SUB_ABILITY_FEATUREABILITY_ONSTARTREMOTEABILITY_00200
     * @tc.name    Call the writeinterfacetoken interface, write the interface descriptor, and read interfacetoken
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_ABILITY_FEATUREABILITY_ONSTARTREMOTEABILITY_00200", 0, async function(done){
        console.info("-----------------SUB_ABILITY_FEATUREABILITY_ONSTARTREMOTEABILITY_00200------------------------");
        try{
            console.info("onStartRemoteAbility002 dvList:" + dvList.length);
            let numDevices = dvList.length;
            if (numDevices === 0) {
                console.info('onStartRemoteAbility002 no device found');
                expect(numDevices === 0).assertFail();
            }
            let params;
            let wantValue = {
                "bundleName":"com.ohos.dmstest",
                "abilityName":"",
                "deviceId": dvId,
                "parameters": params
            };
            await featureAbility.startAbility({
                want: wantValue
                }).then((data) => {
                console.info('onStartRemoteAbility002Data ' + JSON.stringify(data));
                expect(data != null).assertTrue();
            });
        } catch (error) {
            console.info("onStartRemoteAbility002:error = " + error);
            expect(error != null).assertTrue();
        }
       done();
    }); 


    
    /*
     * @tc.number  SUB_ABILITY_FEATUREABILITY_ONSTARTREMOTEABILITY_00300
     * @tc.name    Call the writeinterfacetoken interface, write the interface descriptor, and read interfacetoken
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_ABILITY_FEATUREABILITY_ONSTARTREMOTEABILITY_00300", 0, async function(done){
        console.info("-----------------SUB_ABILITY_FEATUREABILITY_ONSTARTREMOTEABILITY_00300------------------------");
        try{
            console.info("onStartRemoteAbility003 dvList:" + dvList.length);
            let numDevices = dvList.length;
            if (numDevices === 0) {
                console.info('onStartRemoteAbility003 no device found');
                expect(numDevices === 0).assertFail();
            }
            let params;
            let wantValue = {
                "bundleName":"com.ohos.dmstest",
                "abilityName":"com.ohos.dmstest.ServiceAbility",
                "deviceId": null,
                "parameters": params
            };
            console.info('onStartRemoteAbility want=' + JSON.stringify(wantValue));
            await featureAbility.startAbility({
                want: wantValue
                }).then((data) => {
                console.info('onStartRemoteAbility003 ' + JSON.stringify(data));
                expect(data != null).assertTrue();
            });
        } catch (error) {
            console.info("onStartRemoteAbility003:error = " + error);
            expect(error != null).assertTrue();
        }
       done();
    }); 


        
    /*
     * @tc.number  SUB_ABILITY_FEATUREABILITY_onConnectRemoteService_00100
     * @tc.name    Call the writeinterfacetoken interface, write the interface descriptor, and read interfacetoken
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_ABILITY_FEATUREABILITY_onConnectRemoteService_00100", 0, async function(done){
        console.info("-----------------SUB_ABILITY_FEATUREABILITY_onConnectRemoteService_00100------------------------");
        try{
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            await gIRemoteObject.sendRequest(1, data, reply, option).then((result) => {
                console.log('sendRequest success');
                let msg = result.reply.readInt();
                console.info(' onConnectRemoteService001 msg: ' + msg)
                expect(msg == 100).assertTrue();
            }).catch((e) => {
                console.log('sendRequest error:' + e);
            });
        } catch (error) {
            console.info("onConnectRemoteService001:error = " + error);
            expect(error == null).assertTrue();
        }
       done();
    }); 
      

    /*      
     * @tc.number  SUB_ABILITY_FEATUREABILITY_onConnectRemoteService_00200
     * @tc.name    Call the writeinterfacetoken interface, write the interface descriptor, and read interfacetoken
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_ABILITY_FEATUREABILITY_onConnectRemoteService_00200", 0, async function(done){
        console.info("-----------------SUB_ABILITY_FEATUREABILITY_onConnectRemoteService_00200------------------------");
        try{
            let connectedAbility = featureAbility.connectAbility(
                {
                    deviceId: dvId,
                    "bundleName":"com.ohos.dmstest",
                    "abilityName":"com.ohos.dmstest.ServiceAbility",
                }

            );
            console.info("onConnectRemoteService002:connectedAbility = " + connectedAbility);
            expect(connectedAbility == null).assertTrue();
        } catch (error) {
            console.info("onConnectRemoteService002:error = " + error);
            expect(error == null).assertTrue();   
        }
        done();
    }); 

});
