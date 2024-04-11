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

import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from '@ohos/hypium';
import rpc from "@ohos.rpc";
import deviceManager from '@ohos.distributedDeviceManager';
import featureAbility from "@ohos.ability.featureAbility";
import { UiDriver, BY } from '@ohos.UiTest';
import abilityDelegatorRegistry from '@ohos.app.ability.abilityDelegatorRegistry';

let connectId = null;
let dvList = [];
let dvId = null;
let abilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();
let dmInstance 
export default function DmsFwkFaTest() {

  describe('DmsFwkFaTest', function () {
    async function getDeviceId() {
      console.log('getDeviceId is begin')
      try {
          dmInstance = deviceManager.createDeviceManager('com.acts.example.dmsfwkstageservert');
          console.log('get deviceManager is success')
      } catch (error) {
          console.log('get deviceManager is failed' + JSON.stringify(error))
      }
      let localDeviceId = dmInstance.getLocalDeviceNetworkId();
      console.info("local device id is: " + localDeviceId);
      let deviceList = dmInstance.getAvailableDeviceListSync();
      dvList = deviceList;
      let deviceId = deviceList[0].networkId;
      dvId = deviceId;
      console.info("deviceid is: " + deviceId);
      console.info("deviceList is: " + JSON.stringify(deviceList));
    }

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
        await sleep(1000);
        let button = await driver.findComponent(BY.text('允许'));
        console.info(`button is ${JSON.stringify(button)}`);
        await sleep(1000);
        await button.click();
        await sleep(1000);
      } catch (err) {
        console.info('err is ' + err);
        return;
      }
    }

    async function driveClick() {
      try {
        let driver = await UiDriver.create();
        console.info(`come in driveFn`);
        console.info(`driver is ${JSON.stringify(driver)}`);
        await sleep(1000);
        let button = await driver.findComponent(BY.text('知道了'));
        console.info(`button is ${JSON.stringify(button)}`);
        await sleep(1000);
        await button.click();
      } catch (err) {
        console.info('err is ' + err);
        return;
      }
    }

    beforeAll(async function (done) {
      console.info('beforeAll called dms')
      getDeviceId()
      await getPermission();
      await sleep(1000);
      await driveFn();
      await sleep(1000);
      await getDeviceId()
      await sleep(1000);
      done()
    })

    beforeEach(async function (done) {
      console.info(('beforeEach called'))
      done()
    })

    afterEach(async function (done) {
      console.info('afterEach called')
      done();
    })

    afterAll(async function (done) {
      console.info('afterAll called')
      await driveClick();
      sleep(5000);
      done()
    })

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2800
    * @tc.name    StartRemoteAbilityForResult remote MainAbility is success
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2800", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2800 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2800 data is' + data.resultCode);
          expect(data.resultCode).assertEqual(100);
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2800 is failed ' + err.code);
          expect().assertFail();
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2800 catch' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2800 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2800 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2600
    * @tc.name    StartRemoteAbilityForResult deviceId is null
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2600", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2600 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: '',
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2600 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2600 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2600 catch' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2600 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2600 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900
    * @tc.name    StartRemoteAbilityForResult deviceId is Does not exist
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900 catch' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2500
    * @tc.name    StartRemoteAbilityForResult deviceId is undefined
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2500", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2500 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: undefined,
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2500 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2500 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2500 catch' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2500 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2500 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2700
    * @tc.name    StartRemoteAbilityForResult deviceId is err
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2700", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2700 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: '12345678+./xts',
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2700 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2700 is failed ' + err.code);
          expect(err.code).assertEqual(9)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2700 catch' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2700 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2700 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2300
    * @tc.name    StartRemoteAbilityForResult bundleName is null
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2300", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2300 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: "",
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2300 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2300 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2300 catch' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2300 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2300 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1600
    * @tc.name    StartRemoteAbilityForResult bundleName is Does not exist
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1600", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1600 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1600 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1600 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1600 catch' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1600 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1600 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2200
    * @tc.name    StartRemoteAbilityForResult bundleName is undefined
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2200", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2200 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: undefined,
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2200 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2200 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2200 catch' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2200 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2200 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2400
    * @tc.name    StartRemoteAbilityForResult bundleName is err
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2400", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2400 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: "com.acts.example",
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2400 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2400 is failed ' + err.code);
          expect(err.code).assertEqual(9)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2400 catch' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2400 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2400 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2000
    * @tc.name    StartRemoteAbilityForResult abilityName is null
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2000", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2000 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2000 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2000 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2000 catch' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2000 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2000 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1500
    * @tc.name    StartRemoteAbilityForResult without abilityName 
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1500", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1500 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: "com.acts.example.dmsfwkstageserver",
            // abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1500 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1500 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1500 catch' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1500 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1500 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1900
    * @tc.name    StartRemoteAbilityForResult abilityName is undefined
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1900", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1900 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: 'com.acts.example.dmsfwkstageserver',
            abilityName: undefined,
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1900 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1900 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1900 catch' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1900 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1900 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2100
    * @tc.name    StartRemoteAbilityForResult abilityName is err
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2100", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2100 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "123456",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2100 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2100 is failed ' + err.code);
          expect(err.code).assertEqual(9)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2100 catch' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2100 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_2100 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1800
    * @tc.name    StartRemoteAbilityForResult want is null
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1800", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1800 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
          }
        }).then((data) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1800 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1800 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1800 catch' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1800 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1800 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1400
    * @tc.name    StartRemoteAbilityForResult remote MainAbility is success
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1400", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1400 is start---------------");
      let TAG = 'SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1400';
      let wantValue = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "MainAbility2",
        parameters: {
          startReason: "terminateSelfWithResult"
        }
      }
      featureAbility.startAbilityForResult({
        want: wantValue
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.error(TAG + ' fail, error: ' + error.code);
            expect().assertFail();
          } else {
            console.log(TAG + ' success, data: ' + JSON.stringify(data));
            expect(data.resultCode).assertEqual(100);
          }
        } catch (error) {
          console.info(TAG + ":error = " + error);
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_1400 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0100
    * @tc.name    StartRemoteAbilityForResult remote MainAbility is whitout abilityName
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0100", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0100 is start---------------");
      let TAG = 'SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0100';
      let wantValue = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        parameters: {
          startReason: "terminateSelfWithResult"
        }
      }
      featureAbility.startAbilityForResult({
        want: wantValue
      }, (error) => {
        if (error && error.code !== 0) {
          console.error(TAG + ' fail, error: ' + error.code);
          expect(error.code).assertEqual(1);
          done();
        } else {
          console.log(TAG + ' StartAbilityForResult_callback success');
          expect().assertFail()
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0100 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0200
    * @tc.name    StartRemoteAbilityForResult remote MainAbility is whitout bundleName
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0200", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0200 is start---------------");
      let TAG = 'SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0200';
      let wantValue = {
        deviceId: dvId,
        abilityName: "MainAbility2",
        parameters: {
          startReason: "terminateSelfWithResult"
        }
      }
      featureAbility.startAbilityForResult({
        want: wantValue
      }, (error) => {
        if (error && error.code !== 0) {
          console.error(TAG + ' fail, error: ' + error.code);
          expect(error.code).assertEqual(1);
          done();
        } else {
          console.log(TAG + ' StartAbilityForResult_callback success');
          expect().assertFail()
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0200 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0300
    * @tc.name    StartRemoteAbilityForResult remote MainAbility is whitout deviceId
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0300", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0300 is start---------------");
      let TAG = 'SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0300';
      let wantValue = {
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "MainAbility2",
        parameters: {
          startReason: "terminateSelfWithResult"
        }
      }
      featureAbility.startAbilityForResult({
        want: wantValue
      }, (error) => {
        if (error && error.code !== 0) {
          console.error(TAG + ' fail, error: ' + error.code);
          expect(error.code).assertEqual(1);
          done();
        } else {
          console.log(TAG + ' StartAbilityForResult_callback success');
          expect().assertFail()
          done();
        }
      });
      done();
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0300 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0400
    * @tc.name    StartRemoteAbilityForResult remote MainAbility want is null
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0400", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0400 is start---------------");
      let TAG = 'SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0400';
      let wantValue = {
      }
      featureAbility.startAbilityForResult({
        want: wantValue
      }, (error) => {
        if (error && error.code !== 0) {
          console.error(TAG + ' fail, error: ' + error.code);
          expect(error.code).assertEqual(1);
        } else {
          console.log(TAG + ' StartAbilityForResult_callback success');
          expect().assertFail()
        }
      });
      done();
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0400 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0500
    * @tc.name    StartRemoteAbilityForResult remote MainAbility abilityName is undefined
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0500", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0500 is start---------------");
      let TAG = 'SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0500';
      let wantValue = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: undefined,
        parameters: {
          startReason: "terminateSelfWithResult"
        }
      }
      featureAbility.startAbilityForResult({
        want: wantValue
      }, (error) => {
        if (error && error.code !== 0) {
          console.error(TAG + ' fail, error: ' + error.code);
          expect(error.code).assertEqual(1);
        } else {
          console.log(TAG + ' StartAbilityForResult_callback success');
          expect().assertFail()
        }
      });
      done();
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0500 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0600
    * @tc.name    StartRemoteAbilityForResult remote MainAbility abilityName is null
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0600", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0600 is start---------------");
      let TAG = 'SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0600';
      let wantValue = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: null,
        parameters: {
          startReason: "terminateSelfWithResult"
        }
      }
      featureAbility.startAbilityForResult({
        want: wantValue
      }, (error) => {
        if (error && error.code !== 0) {
          console.error(TAG + ' fail, error: ' + error.code);
          expect(error.code).assertEqual(1);
        } else {
          console.log(TAG + ' StartAbilityForResult_callback success');
          expect().assertFail()
        }
      });
      done();
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0600 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0700
    * @tc.name    StartRemoteAbilityForResult remote MainAbility abilityName is err
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0700", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0700 is start---------------");
      let TAG = 'SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0700';
      let wantValue = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: 's1234wersds',
        parameters: {
          startReason: "terminateSelfWithResult"
        }
      }
      featureAbility.startAbilityForResult({
        want: wantValue
      }, (error) => {
        if (error && error.code !== 0) {
          console.error(TAG + ' fail, error: ' + error.code);
          expect(error.code).assertEqual(9);
        } else {
          console.log(TAG + ' StartAbilityForResult_callback success');
          expect().assertFail()
        }
      });
      done();
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_Startability_StartAbilityForResult_callback_0700 is end---------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connetability_connectRemoteAbility_1300
     * @tc.name    Connect the remote ServiceAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connetability_connectRemoteAbility_1300", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connetability_connectRemoteAbility_1300 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_StandardOs_collaboration_connetability_connectRemoteAbility_1300 msg: ' + msg)
              expect(msg == 100).assertTrue();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connetability_connectRemoteAbility_1300  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connetability_connectRemoteAbility_1300  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connetability_connectRemoteAbility_1300 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connetability_connectRemoteAbility_1300 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connetability_connectRemoteAbility_1300 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_02000356
     * @tc.name    Connect the remote Service with null bundlename.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900
     * @tc.name    Disconnect the remote ServiceAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900 msg: ' + msg)
              expect(msg == 100).assertTrue();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      featureAbility.disconnectAbility(connectId, (err, data) => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900 disconnectAbility err: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900 disconnectAbilityerr: ' + err.message);
        expect(err.code).assertEqual(0);
        done();
      })
      await sleep(1000);
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_1900 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100
     * @tc.name    Connect the remote Service with Wrong ServiceAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "WrongServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0800
     * @tc.name    Connect the remote Service with Wrong deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0800", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0800 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: "123456",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0800 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0800  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0800  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0800 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0800 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0800 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2600
     * @tc.name    Connect the remote Service with null ServiceAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2600", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2600 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: ""
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2600 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2600  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2600  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2600 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2600 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2600 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200
     * @tc.name    Connect the remote Service without bundleName.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0200 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0700
     * @tc.name    Connect the remote Service with wrong bundleName.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0700", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0700 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.Wrongdmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0700 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0700  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0700  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0700 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0700 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0700 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2700
     * @tc.name    Connect the remote Service with bundleName is undefined.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2700", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2700 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: undefined,
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2700 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2700  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2700  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2700 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2700 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2700 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100
     * @tc.name    Connect the remote Service without abilityName.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0100 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2800
     * @tc.name    Connect the remote Service with abilityName is undefined.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2800", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2800 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: undefined
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2800 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2800  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2800  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2800 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2800 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2800 end------------------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2900
    * @tc.name    Connect the remote Service with deviceid is undefined.
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2900", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2900 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: undefined,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2900 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2900  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2900  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2900 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2900 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_2900 end------------------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0300
    * @tc.name    Connect the remote Service without deviceid.
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0300", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0300 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0300 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0300  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0300  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0300 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0300 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteAbility_0300 end------------------------");
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_stability_StabilityTest_0100
    * @tc.name    Connect the remote ServiceAbility fot ten times.
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_stability_StabilityTest_0100", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_stability_StabilityTest_0100 start------------------------");
      let connectId;
      try {
        for (let i = 0; i < 10; i++) {
          connectId = featureAbility.connectAbility({
            deviceId: dvId,
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "ServiceAbility"
          }, {
            onConnect: (elementName, proxy) => {
              let option = new rpc.MessageOption();
              let data = new rpc.MessageParcel();
              let reply = new rpc.MessageParcel();
              data.writeInt(1);
              data.writeInt(99);
              proxy.sendRequest(1, data, reply, option).then((result) => {
                console.log('sendRequest success');
                let msg = result.reply.readInt();
                console.info(' SUB_DMS_StandardOs_stability_StabilityTest_0100 msg: ' + msg)
                expect(msg == 100).assertTrue();
                done();
              }).catch((e) => {
                console.log('sendRequest error:' + e);
                expect().assertFail();
                done();
              });
            },
            onDisConnect: (elementName) => {
              console.info('SUB_DMS_StandardOs_stability_StabilityTest_0100  onDisConnect: ' + JSON.stringify(elementName));
              expect().assertFail();
              done();
            },
            onFailed: (code) => {
              console.info('SUB_DMS_StandardOs_stability_StabilityTest_0100  onFailed: ' + code);
              expect().assertFail();
              done();
            }
          });
          featureAbility.disconnectAbility(connectId, (err, data) => {
            console.info('SUB_DMS_StandardOs_stability_StabilityTest_0100 disconnectAbility err: ' + err.code);
            console.info('SUB_DMS_StandardOs_stability_StabilityTest_0100 disconnectAbilityerr: ' + err.message);
            expect(err.code).assertEqual(0);
            done();
          })
          console.info("SUB_DMS_StandardOs_stability_StabilityTest_0100 running at : " + i + ",here");
        }
      } catch (err) {
        console.info('SUB_DMS_StandardOs_stability_StabilityTest_0100 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbilitySUB_DMS_StandardOs_stability_StabilityTest_0100_0140 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_StandardOs_stability_StabilityTest_0100 end------------------------");
    });
  })
}