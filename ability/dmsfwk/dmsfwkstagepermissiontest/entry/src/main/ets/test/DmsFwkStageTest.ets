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
import deviceManager from '@ohos.distributedDeviceManager';
import abilityDelegatorRegistry from '@ohos.app.ability.abilityDelegatorRegistry';
import { UiDriver, BY } from '@ohos.UiTest';
import abilityAccessCtrl from '@ohos.abilityAccessCtrl'
let atManager = abilityAccessCtrl.createAtManager();

let abilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();
let dvList: Array<deviceManager.DeviceBasicInfo>
let dvId: string;
let localDeviceId: string;
let dmInstance : deviceManager.DeviceManager
let TAG:string;

export default function DmsFwkStageTest() {

  describe('DmsFwkStageTest', function () {
    async function getDeviceId() {
      console.log('getDeviceId is begin')
      try {
          dmInstance = deviceManager.createDeviceManager('com.acts.example.dmsfwkstageserver');
          console.log('get deviceManager is success')
      } catch (error) {
          console.log('get deviceManager is failed' + JSON.stringify(error))
      }
      localDeviceId = dmInstance.getLocalDeviceNetworkId();
      console.info("local device id is: " + localDeviceId);
      let deviceList : Array<deviceManager.DeviceBasicInfo> = dmInstance.getAvailableDeviceListSync();
      dvList= deviceList;
      let deviceId : string= deviceList[0].networkId;
      dvId = deviceId;
      console.info("deviceid is: " + deviceId);
      console.info("deviceList is: " + JSON.stringify(deviceList));
    }

    function sleep(ms) {
		  return new Promise(resolve => setTimeout(resolve, ms));
	  }

    async function getPermission() {
		  console.info('getPermission is start');
		  atManager.requestPermissionsFromUser(globalThis.abilityContext, ['ohos.permission.DISTRIBUTED_DATASYNC'], (data) => {
		  console.info("request success" + JSON.stringify(data));
		  })
	  }

    async function driveFn() {
		  try {
			  let driver = await UiDriver.create()
			  console.info('come in driveFn')
			  console.info('driver is ${JSON.stringify(driver)}')
			  await sleep(1000);
			  let button = await driver.findComponent(BY.text('允许'));
			  console.info('button is ${JSON.stringify(button)}');
			  await sleep(1000);
			  await button.click();
        await sleep(1000);
		  } catch (err) {
			  console.info('err is ' + err);
			  return;
		  }
	  }

    beforeAll(async function (done) {
      console.log('DMS before began')
      await getPermission();
	    await sleep(1000);
	    await driveFn();
	    await sleep(1000);
      await getDeviceId();
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



    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100
     * @tc.name    Connec the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100";
      try{
        globalThis.abilityContext.connectServiceExtensionAbility({
          deviceId:dvId,
          bundleName: "com.ohos.dmstest",
          abilityName: "com.ohos.dmstest.ServiceAbility"
        }, {
          onConnect: (elementName, proxy)=>{
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100  onConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onDisConnect: (elementName)=>{
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code)=>{
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100  onFailed: ' + code);
            expect(code).assertEqual(16000050)
            done();
          }
        });
      }catch(err){
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100  catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100  catch: ' + err.message);
        expect().assertFail();
        done();
      }
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100 is end---------------")
    });
    
  })
}