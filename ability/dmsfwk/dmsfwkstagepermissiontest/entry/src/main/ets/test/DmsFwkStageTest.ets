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
import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from "@ohos/hypium"
import deviceManager from '@ohos.distributedHardware.deviceManager';
import abilityDelegatorRegistry from '@ohos.app.ability.abilityDelegatorRegistry';
import commonEvent from '@ohos.commonEvent';
import rpc from '@ohos.rpc';
let abilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();
let dvList;
let dvId;
let localDeviceId;
let connectId;
let connectId2;
let subscriber
let subscribeInfo = {
  events: ["DmsFwkService_ConnectAbility"]
}
export default function DmsFwkStageTest() {

  describe('DmsFwkStageTest', function () {

    beforeAll(async function (done) {
      function deviceManagerCallback(error, deviceManager) {
        console.info('LifeCycleTest before each called');
        let deviceList = deviceManager.getTrustedDeviceListSync();
        let deviceId = deviceList[0].deviceId;
        dvList = deviceList;
        dvId = deviceId;
        localDeviceId = deviceManager.getLocalDeviceInfoSync().deviceId;
      }
      deviceManager.createDeviceManager('com.acts.example.dmsfwkstageserver', deviceManagerCallback)
      await sleep(1000);
      done()
    });

    beforeEach(async function (done) {
      console.info('LifeCycleTest before each called');
      await sleep(1000);
      done()
    });

    afterEach(async function (done) {
      console.info('LifeCycleTest after each called');
      await sleep(1000);
      done();
    });

    var TAG;
    var listKeyTemp = [];
    var listKeyTemp1 = [];


    function sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time))
    }

    /*
     * @tc.number  SUB_DMS_StartControl_ConnectAbility_0200
     * @tc.name    Connec the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_ConnectAbility_0200", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_ConnectAbility_0200 is start---------------")
      TAG = "SUB_DMS_StartControl_ConnectAbility_0200";
      try{
        globalThis.abilityContext.connectServiceExtensionAbility({
          deviceId:dvId,
          bundleName: "com.ohos.dmstest",
          abilityName: "com.ohos.dmstest.ServiceAbility"
        }, {
          onConnect: (elementName, proxy)=>{
            console.info('SUB_DMS_StartControl_ConnectAbility_0200  onConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onDisConnect: (elementName)=>{
            console.info('SUB_DMS_StartControl_ConnectAbility_0200  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code)=>{
            console.info('SUB_DMS_StartControl_ConnectAbility_0200  onFailed: ' + code);
            expect(code).assertEqual(16000050)
            done();
          }
        });
      }catch(err){
        console.info('SUB_DMS_StartControl_ConnectAbility_0200  catch: ' + err.code);
        console.info('SUB_DMS_StartControl_ConnectAbility_0200  catch: ' + err.message);
        expect().assertFail();
        done();
      }
      console.info("---------------SUB_DMS_StartControl_ConnectAbility_0200 is end---------------")
    });
    
  })
}