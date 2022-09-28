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
import deviceManager from '@ohos.distributedHardware.deviceManager';
import featureAbility from "@ohos.ability.featureAbility";
import {describe, beforeAll, beforeEach, afterEach, afterAll, it, expect} from 'deccjsunit/index';

let gIRemoteObject = null;
let connectId = null;
describe('FeatureAbilityTest', function(){
    console.info("-----------------------SUB_DMSFWK_MessageParce_Test is starting-----------------------");
    var dvList = [];
    var dvId = null;
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
            dvList = deviceList;
            dvId = deviceId;
            console.info("online device id: " + deviceId)
            let want = {
                "bundleName":"ohos.rpc.test.server",
                "abilityName":"ohos.rpc.test.server.ServiceAbility",
                "deviceId":deviceId,
                "flags": 256
            }
            let connect = {
                onConnect:function (elementName, remoteProxy) {
                    console.info('RpcClient: onConnect called,proxy: ' + (remoteProxy instanceof rpc.RemoteProxy))
                    console.info('RpcClient: onConnect called,elementName: ' + elementName)
                    gIRemoteObject = remoteProxy
                    done()
                },
                onDisconnect:function (elementName) {
                    console.info("RpcClient: onDisconnect")
                },
                onFailed:function () {
                    console.info("RpcClient: onFailed")
                    gIRemoteObject = null
                }
            }
            connectId = featureAbility.connectAbility(want, connect)
            connectId.info("connect ability got id: " + connectId)
        }

        deviceManager.createDeviceManager('ohos.rpc.test', deviceManagerCallback)
        console.info("beforeAll done")
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
                "bundleName":"ohos.rpc.test.server",
                "abilityName":"ohos.rpc.test.server.ServiceAbility",
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
                "bundleName":"ohos.rpc.test.server",
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
                "bundleName":"ohos.rpc.test.server",
                "abilityName":"ohos.rpc.test.server.ServiceAbility",
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
                expect(msg == 1).assertTrue();
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
     * @tc.number  SUB_ABILITY_FEATUREABILITY_onConnectRemoteService_00100
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
                    "bundleName":"ohos.rpc.test.server",
                    "abilityName":"ohos.rpc.test.server.ServiceAbility",
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