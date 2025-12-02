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
import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, TestType, Size, Level } from "@ohos/hypium"
import deviceManager from '@ohos.distributedDeviceManager';
import abilityDelegatorRegistry from '@ohos.app.ability.abilityDelegatorRegistry';
import { UiDriver, BY } from '@ohos.UiTest';
import abilityAccessCtrl from '@ohos.abilityAccessCtrl';
import continueManager from '@ohos.app.ability.continueManager';
import abilityConnectionManager from '@ohos.distributedsched.abilityConnectionManager';
import { BusinessError } from '@ohos.base';
import common from '@ohos.app.ability.common';
import util from '@ohos.util';
import { Caller } from '@ohos.app.ability.UIAbility';
import rpc from '@ohos.rpc';
import bundleManager from '@ohos.bundle.bundleManager';
import Want from '@ohos.app.ability.Want';
import TestService from "./testService.ets";

let sessionId: number;
let context = getContext(this) as common.UIAbilityContext;
let atManager = abilityAccessCtrl.createAtManager();
let abilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();
let dvList: Array<deviceManager.DeviceBasicInfo>;
let dvId: string;
let localDeviceId: string;
let dmInstance: deviceManager.DeviceManager
let TAG: string = 'dmsfwkstagepermissiontest'
let call: Caller;
let extensionConnectId: number;
let connectId: number;

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
      let deviceList: Array<deviceManager.DeviceBasicInfo> = dmInstance.getAvailableDeviceListSync();
      dvList = deviceList;
      let deviceId: string = deviceList[0].networkId;
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

    //检查当前应用是否有可信的设备
    let checkAvailableDevice = async () => {
      console.info(TAG + "checkAvailableDevice begin");
      let dmInstance = deviceManager.createDeviceManager('com.acts.example.dmsfwkstageserver');
      let deviceInfoList: Array<deviceManager.DeviceBasicInfo> = dmInstance.getAvailableDeviceListSync();
      console.info(TAG + "checkAvailableDevice get deviceInfoList " + JSON.stringify(deviceInfoList));
      if (deviceInfoList.length != 0) {
        console.info(TAG + "false deviceInfoList.length is" + JSON.stringify(deviceInfoList));
        return false;
      } else {
        console.info(TAG + "true deviceInfoList.length  is" + JSON.stringify(deviceInfoList));
        return true;
      }
    }

    let checkResult = async () => {
      console.info(TAG + "checkResult begin");
      let testservice = new TestService();
      try {
        let checkResult = await checkAvailableDevice();
        console.info(TAG + "checkResult is" + checkResult);
        if (!checkResult) {
          testservice.unbindStub();
        }
        await sleep(500);
        let checkResult1 = await checkAvailableDevice();
        //如果有可信的设备 就不需要再通过PIN码bind
        if (checkResult1) {
          testservice.startDiscovering();
          await sleep(3000);
          testservice.bindStub();
          await sleep(20000);
          testservice.stopDiscovering();
          await sleep(3000);
        }
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
      await checkResult()
      await sleep(3000);
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

    afterAll(async function (done) {
      console.info('LifeCycleTest after each called');
      console.info('afterAll start');
      let testservice = new TestService();
      // 删除当前应用的可信设备
      let checkResult = await checkAvailableDevice();
      console.info('afterAll checkResult is ' + checkResult);
      if (!checkResult) {
        console.info('checkResult is ' + checkResult);
        testservice.unbindStub();
      }
      await sleep(2000);
      console.info('afterAll start');
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_on_0100
    * @tc.name    continueManager.on
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_on_0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_on_0100 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_on_0100'
      try {
        continueManager.on('prepareContinue', context, (ContinueResultInfo) => {
          console.log(TAG + 'continueManager.on is success' + ContinueResultInfo.resultInfo + ContinueResultInfo.resultState)
          expect().assertTrue()
        })
      } catch (error) {
        console.log(TAG + 'continueManager.on is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_on_0100 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCod_SUCCESS_0200
    * @tc.name    continueManager.ContinueStateCode.SUCCESS
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCod_SUCCESS_0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCod_SUCCESS_0200 is start---------------")
      try {
        console.log(`continueManager.ContinueStateCode.SUCCESS is ${continueManager.ContinueStateCode.SUCCESS}`)
        expect(continueManager.ContinueStateCode.SUCCESS).assertEqual(0)
      } catch (error) {
        console.log('get continueManager.ContinueStateCode.SUCCESS  is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCod_SUCCESS_0200 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCode_SYSTEM_ERROR_0300
    * @tc.name    continueManager.ContinueStateCode.SYSTEM_ERROR.
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCode_SYSTEM_ERROR_0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCode_SYSTEM_ERROR_0300 is start---------------")
      try {
        console.log(`continueManager.ContinueStateCode.SYSTEM_ERROR is ${continueManager.ContinueStateCode.SYSTEM_ERROR}`)
        expect(continueManager.ContinueStateCode.SYSTEM_ERROR != 0).assertTrue();
      } catch (error) {
        console.log('get continueManager.ContinueStateCode.SYSTEM_ERROR is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCode_SYSTEM_ERROR_0300 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_off_0400
    * @tc.name    continueManager.off
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_off_0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_off_0400 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_off_0400'
      try {
        continueManager.off('prepareContinue', context, (err, ContinueResultInfo) => {
          if (err != undefined) {
            console.log(TAG + 'continueManager.off is failed' + JSON.stringify(err))
            expect().assertFail()
          }
          console.log(TAG + 'continueManager.off is success' + ContinueResultInfo.resultState + ContinueResultInfo.resultInfo)
          expect(ContinueResultInfo.resultState == 0).assertTrue()
        })
      } catch (error) {
        console.log(TAG + 'continueManager.off is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_off_0400 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_on_0500
    * @tc.name    continueManager.on
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_on_0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_on_0500 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_on_0500'
      try {
        continueManager.on('ssssssssssssss', context, (ContinueResultInfo) => {
          console.log(TAG + 'continueManager.on is success' + ContinueResultInfo.resultInfo + ContinueResultInfo.resultState)
          expect().assertFail()
        })
      } catch (error) {
        console.log(TAG + 'continueManager.on is catch' + JSON.stringify(error))
        expect(error.code == 16300501).assertTrue()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_on_0500 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_off_0600
    * @tc.name    continueManager.off
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_off_0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_off_0600 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_off_0600'
      try {
        continueManager.off('dddddddddddddd', context, (err, ContinueResultInfo) => {
          if (err != undefined) {
            console.log(TAG + 'continueManager.off is failed' + JSON.stringify(err))
            expect().assertFail()
          }
          console.log(TAG + 'continueManager.off is success' + ContinueResultInfo.resultState + ContinueResultInfo.resultInfo)
          expect().assertFail()
        })
      } catch (error) {
        console.log(TAG + 'continueManager.off is catch' + JSON.stringify(error))
        expect(error.code == 16300501).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_off_0600 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_off_0700
    * @tc.name    continueManager.off
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_off_0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_off_0700 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_off_0700'
      try {
        continueManager.off('dddddddddddddd', context)
        console.log(TAG + 'continueManager.off is success')
        expect().assertFail()
      } catch (error) {
        console.log(TAG + 'continueManager.off is catch' + JSON.stringify(error))
        expect(error.code == 16300501).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_off_0700 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_on_0800
    * @tc.name    continueManager.on
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_on_0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_on_0800 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_on_0800'
      try {
        continueManager.on('prepareContinue', 'context1', (ContinueResultInfo) => {
          console.log(TAG + 'continueManager.on is success' + ContinueResultInfo)
          expect().assertFail()
        })
      } catch (error) {
        console.log(TAG + 'continueManager.on is catch' + JSON.stringify(error))
        expect(error.code == 401).assertTrue()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_on_0800 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_off_0900
    * @tc.name    continueManager.off
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_off_0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_off_0900 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_off_0900'
      try {
        continueManager.off('prepareContinue', 'context', () => {
          console.log(TAG + 'continueManager.off is success')
          expect().assertFail()
        })
      } catch (error) {
        console.log(TAG + 'continueManager.off is catch' + JSON.stringify(error))
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_off_0900 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_off_1000
    * @tc.name    continueManager.off
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_off_1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_off_1000 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_off_1000'
      try {
        continueManager.off('prepareContinue', 'context')
        console.log(TAG + 'continueManager.off is success')
        expect().assertFail()
      } catch (error) {
        console.log(TAG + 'continueManager.off is catch' + JSON.stringify(error))
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_off_1000 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0100
    * @tc.name    abilityConnectionManager.connect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0100 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0100'
      abilityConnectionManager.connect(-1)
        .then((ConnectResult: abilityConnectionManager.ConnectResult) => {
          console.log(`${TAG} get abilityConnectionManager.connect is success ${ConnectResult}`)
          expect().assertFail()
        })
        .catch((err: BusinessError) => {
          console.log(`${TAG} get abilityConnectionManager.connect is failed ${err.code}`)
          expect(err.code == 401).assertTrue()
        })
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0100 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0200
    * @tc.name    abilityConnectionManager.connect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0200 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0200'
      try {
        abilityConnectionManager.connect(null)
          .then((ConnectResult: abilityConnectionManager.ConnectResult) => {
            console.log(`${TAG} get abilityConnectionManager.connect is success ${ConnectResult}`)
            expect().assertFail()
          })
      } catch (error) {
        console.log(`${TAG} get abilityConnectionManager.connect is failed ${error.code}`)
        expect(error.code == 401).assertTrue()
      }

      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0200 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_0300
    * @tc.name     abilityConnectionManager.disconnect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_0300 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_0300'
      try {
        abilityConnectionManager.disconnect(0)
        console.log(`${TAG} abilityConnectionManager.disconnect is success`)
        expect().assertFail()
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.disconnect is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_0300 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_0400
    * @tc.name    abilityConnectionManager.on connect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_0400 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_0400';
      try {
        abilityConnectionManager.on("connect", 10, (callbackInfo) => {
          console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)
          expect().assertFail()
        });
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.on error is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_0400 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_0500
    * @tc.name    abilityConnectionManager.on disconnect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_0600 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_0600';
      try {
        abilityConnectionManager.on("disconnect", 10, (callbackInfo) => {
          console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)
          expect().assertFail()
        });
      } catch (error) {
        console.log(`${TAG}  abilityConnectionManager.on disconnect error is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_0600 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_0600
    * @tc.name    abilityConnectionManager.on receiveMessage
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_0600 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_0600';
      try {
        abilityConnectionManager.on("receiveMessage", 10, (callbackInfo) => {
          console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)
          expect().assertFail()
        });
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.on receiveMessage is error ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_0600 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_0700
    * @tc.name    abilityConnectionManager.off connect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_0700 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_0700';
      try {
        abilityConnectionManager.off("connect", 10, (callbackInfo) => {
          console.log(TAG + 'abilityConnectionManager.off is success' + callbackInfo)
          expect().assertFail()
        });
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.off connect error is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_0700 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_0800
    * @tc.name    abilityConnectionManager.off disconnect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_0800 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_0800';
      try {
        abilityConnectionManager.off("disconnect", 10, (callbackInfo) => {
          console.log(TAG + 'abilityConnectionManager.off is success' + callbackInfo)
          expect().assertFail()
        });
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.off disconnect error is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_0800 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_0900
    * @tc.name    abilityConnectionManager.off receiveMessage
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_0900 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_0900';
      try {
        abilityConnectionManager.off("receiveMessage", 10, (callbackInfo) => {
          console.log(TAG + 'abilityConnectionManager.off is success' + callbackInfo)
          expect().assertFail()
        });
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.off receiveMessage error is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_0900 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_1000
    * @tc.name    abilityConnectionManager.off connect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_1000 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_1000';
      try {
        abilityConnectionManager.off("connect", 10);
        console.log(`${TAG} abilityConnectionManager.off is success`)
        expect().assertFail()
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.off connect error is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_1000 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_1100
    * @tc.name    abilityConnectionManager.off disconnect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_1100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_1100 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_1100';
      try {
        abilityConnectionManager.off("disconnect", 10);
        console.log(`${TAG} abilityConnectionManager.off is success`)
        expect().assertFail()
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.off disconnect error is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_1100 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_1200
    * @tc.name    abilityConnectionManager.off receiveMessage
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_1200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_1200 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_1200';
      try {
        abilityConnectionManager.off("receiveMessage", 10);
        console.log(`${TAG} abilityConnectionManager.off is success`)
        expect().assertFail()
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.off receiveMessage error is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_1200 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_1300
    * @tc.name    abilityConnectionManager.acceptConnect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_1300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_1300 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_1300';
      abilityConnectionManager.acceptConnect(10, "ohos.dms.collabToken").then((data) => {
        console.log(`${TAG} abilityConnectionManager.acceptConnect is success ${data}`)
        expect().assertFail()
      }).catch((error) => {
        console.log(`${TAG} abilityConnectionManager.acceptConnect is failed ${error.code}`)
        expect(error.code == 401).assertTrue()
      })
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_1300 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_1500
    * @tc.name    abilityConnectionManager.sendMessage
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_1500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_1500 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_1500';
      abilityConnectionManager.sendMessage(10, "message send success").then((data) => {
        console.log(`${TAG} abilityConnectionManager.sendMessage is success ${data}`)
        expect().assertFail()
      }).catch((error) => {
        console.log(`${TAG} abilityConnectionManager.sendMessage is failed ${error.code}`)
        expect(error.code == 401).assertTrue()
      })
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_1500 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_1600
    * @tc.name    abilityConnectionManager.sendMessage
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_1600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_1600 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_1600';
      try {
        abilityConnectionManager.sendMessage(null, "message send success").then((data) => {
          console.log(`${TAG} abilityConnectionManager.sendMessage is success ${data}`)
          expect().assertFail()
        })
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.sendMessage is failed ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_1600 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1700
    * @tc.name     abilityConnectionManager.destroyAbilityConnectionSession
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1700 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1700'
      try {
        abilityConnectionManager.destroyAbilityConnectionSession(10)
        console.log(`${TAG} abilityConnectionManager.destroyAbilityConnectionSession is succcess`)
        expect().assertFail()
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.destroyAbilityConnectionSession error.code is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1700 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1800
    * @tc.name     abilityConnectionManager.getPeerInfoById
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1800 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1800'
      try {
        let peerInfo = abilityConnectionManager.getPeerInfoById(10)
        console.log(`${TAG} abilityConnectionManager.getPeerInfoById is succcess`)
        expect(peerInfo).assertEqual(undefined)
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.getPeerInfoById error.code is ${error.code}`)
        expect().assertFail()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1800 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1900
    * @tc.name     abilityConnectionManager.getPeerInfoById
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1900 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1900'
      try {
        let peerInfo = abilityConnectionManager.getPeerInfoById('10', true)
        console.log(`${TAG} abilityConnectionManager.getPeerInfoById is succcess`)
        expect().assertFail()
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.getPeerInfoById error.code is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1900 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_2100
    * @tc.name     abilityConnectionManager.reject
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_2100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_2100 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_2100'
      try {
        abilityConnectionManager.reject('123', 'erc@').then(() => {
          console.log(`${TAG} abilityConnectionManager.reject is succcess`)
          expect().assertFail()
        })
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.reject error.code is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_2100 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_setSurfaceId_2200
    * @tc.name     abilityConnectionManager.setSurfaceId
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_setSurfaceId_2200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_setSurfaceId_2200 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_setSurfaceId_2200'
      try {
        abilityConnectionManager.setSurfaceId(123, 'erc@', '7894').then(() => {
          console.log(`${TAG} abilityConnectionManager.reject is succcess`)
          expect().assertFail()
        })
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.reject error.code is ${error.code}`)
        expect(error.code == 202).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_setSurfaceId_2200 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getSurfaceId_2300
    * @tc.name     abilityConnectionManager.getSurfaceId
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getSurfaceId_2300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getSurfaceId_2300 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getSurfaceId_2300'
      try {
        abilityConnectionManager.getSurfaceId(123, '7894').then((data) => {
          console.log(`${TAG} abilityConnectionManager.getSurfaceId is succcess` + data)
          expect().assertFail()
        })
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.getSurfaceId error.code is ${error.code}`)
        expect(error.code == 202).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getSurfaceId_2300 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_updateSurfaceParam_2400
    * @tc.name     abilityConnectionManager.updateSurfaceParam
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_updateSurfaceParam_2400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_updateSurfaceParam_2400 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_updateSurfaceParam_2400'
      try {
        abilityConnectionManager.updateSurfaceParam(123, '7894').then((data) => {
          console.log(`${TAG} abilityConnectionManager.updateSurfaceParam is succcess` + data)
          expect().assertFail()
        })
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.updateSurfaceParam error.code is ${error.code}`)
        expect(error.code == 202).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_updateSurfaceParam_2400 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_startStream_2500
    * @tc.name     abilityConnectionManager.updateSurfaceParam
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_startStream_2500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_startStream_2500 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_startStream_2500'
      try {
        abilityConnectionManager.updateSurfaceParam(123).then(() => {
          console.log(`${TAG} abilityConnectionManager.updateSurfaceParam is succcess`)
          expect().assertFail()
        })
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.updateSurfaceParam error.code is ${error.code}`)
        expect(error.code == 202).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_startStream_2500 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_startStream_2600
    * @tc.name     abilityConnectionManager.startStream
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_startStream_2600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_startStream_2600 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_startStream_2600'
      try {
        abilityConnectionManager.startStream(123).then(() => {
          console.log(`${TAG} abilityConnectionManager.updateSurfaceParam is succcess`)
          expect().assertFail()
        })
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.updateSurfaceParam error.code is ${error.code}`)
        expect(error.code == 202).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_startStream_2600 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_stopStream_2700
    * @tc.name     abilityConnectionManager.stopStream
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_stopStream_2700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_stopStream_2700 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_stopStream_2700'
      try {
        abilityConnectionManager.stopStream(123).then(() => {
          console.log(`${TAG} abilityConnectionManager.stopStream is succcess`)
          expect().assertFail()
        })
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.stopStream error.code is ${error.code}`)
        expect(error.code == 202).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_stopStream_2700 is end--------------- ")
      done();
    });


    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendImage_2800
    * @tc.name    abilityConnectionManager.sendImage
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendImage_2800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendImage_2800 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendImage_2800'
      let pixelMap = ''
      try {
        abilityConnectionManager.sendImage(10, pixelMap).then(() => {
          console.log(`${TAG} abilityConnectionManager.sendImage is success`)
          expect().assertFail()
        })
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.sendImage error.code is ${error.code}`)
        expect(error.code == 202).assertTrue()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendImage_2800 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_createStream_2900
    * @tc.name    abilityConnectionManager.createStream
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_createStream_2900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_createStream_2900 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_createStream_2900'
      try {
        abilityConnectionManager.createStream(10, { name: 'receive', role: 0 }).then((data) => {
          console.log(`${TAG} abilityConnectionManager.createStream is success` + JSON.stringify(data))
          expect().assertFail()
        })
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.createStream error.code is ${error.code}`)
        expect(error.code == 202).assertTrue()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_createStream_2900 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyStream_3000
    * @tc.name    abilityConnectionManager.destroyStream
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyStream_3000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyStream_3000 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyStream_3000'
      let pixelMap = ''
      try {
        abilityConnectionManager.destroyStream(sessionId)
        console.log(`${TAG} abilityConnectionManager.destroyStream is success`)
        expect().assertFail()
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.destroyStream error.code is ${error.code}`)
        expect(error.code == 202).assertTrue()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyStream_3000 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_3100
    * @tc.name    abilityConnectionManager.createAbilityConnectionSession
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_3100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_3100 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_3100'
      let peerInfo: abilityConnectionManager.PeerInfo = {
        deviceId: dvId,
        bundleName: 'com.acts.example.dmsfwkstageserver',
        moduleName: 'entry',
        abilityName: 'MainAbility',
        serverId: 'collabTest'
      };

      let myRecord: Record<string, string> = {
        "newKey1": "value1",
      };

      let options: Record<string, string> = {
        'ohos.collabrate.key.start.option': 'ohos.collabrate.value.foreground',
      };

      let connectOption: abilityConnectionManager.ConnectOption = {
        needSendData: true,
        needSendStream: false,
        needReceiveStream: false,
        options: options,
        parameters: myRecord
      };

      try {
        sessionId = abilityConnectionManager.createAbilityConnectionSession("collabTest", context, peerInfo, connectOption);
        console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession is success ${sessionId}`)
        expect(typeof sessionId == 'number').assertTrue()
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession error.code is ${error.code}`)
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_3100 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_3200
    * @tc.name    abilityConnectionManager.connect
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_3200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_3200 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_3200'
      abilityConnectionManager.connect(sessionId).then((ConnectResult) => {
        console.log(`${TAG} abilityConnectionManager.connect is success ${JSON.stringify(ConnectResult)}`)
        expect(ConnectResult.isConnected == false).assertTrue()
      }).catch((error) => {
        console.log(`${TAG} abilityConnectionManager.connect error.code is ${error.code}`)
        expect().assertFail()
      })
      await sleep(5000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_3200 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_3300
    * @tc.name    abilityConnectionManager.destroyAbilityConnectionSession
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_3300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_3300 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_3300'
      try {
        abilityConnectionManager.destroyAbilityConnectionSession(sessionId)
        console.log(`${TAG} abilityConnectionManager.destroyAbilityConnectionSession is success`)
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.destroyAbilityConnectionSession failed`)
        expect().assertFail()
        done()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_3300 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_3500
    * @tc.name    abilityConnectionManager.sendMessage
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_3500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_3500 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_3500';
      try {
        abilityConnectionManager.sendMessage(null).then((data) => {
          console.log(`${TAG} abilityConnectionManager.sendMessage is success ${data}`)
          expect().assertFail()
        })
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.sendMessage is failed ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_3500 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_3600
    * @tc.name    abilityConnectionManager.createAbilityConnectionSession
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_3600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_3600 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_3600'
      try {
        sessionId = abilityConnectionManager.createAbilityConnectionSession(null);
        console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession is success ${sessionId}`)
        expect().assertFail()
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession error.code is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_3600 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_3700
    * @tc.name    abilityConnectionManager.DisconnectReason.NETWORK_DISCONNECTED
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_3700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_3700 is start---------------")
      try {
        console.log(`abilityConnectionManager.DisconnectReason.NETWORK_DISCONNECTED is ${abilityConnectionManager.DisconnectReason.NETWORK_DISCONNECTED}`)
        expect(abilityConnectionManager.DisconnectReason.NETWORK_DISCONNECTED).assertEqual(2)
      } catch (error) {
        console.log('abilityConnectionManager.DisconnectReason.NETWORK_DISCONNECTED is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_3700 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_3800
     * @tc.name    abilityConnectionManager.DisconnectReason.PEER_APP_EXIT
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_3800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_3800 is start---------------")
      try {
        console.log(`abilityConnectionManager.DisconnectReason.PEER_APP_EXIT is ${abilityConnectionManager.DisconnectReason.PEER_APP_EXIT}`)
        expect(abilityConnectionManager.DisconnectReason.PEER_APP_EXIT).assertEqual(1)
      } catch (error) {
        console.log('abilityConnectionManager.DisconnectReason.PEER_APP_EXIT is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_3800 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_3900
     * @tc.name    abilityConnectionManager.DisconnectReason.PEER_APP_CLOSE_COLLABORATION
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_3900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_3900 is start---------------")
      try {
        console.log(`abilityConnectionManager.DisconnectReason.PEER_APP_CLOSE_COLLABORATION is ${abilityConnectionManager.DisconnectReason.PEER_APP_CLOSE_COLLABORATION}`)
        expect(abilityConnectionManager.DisconnectReason.PEER_APP_CLOSE_COLLABORATION).assertEqual(0)
      } catch (error) {
        console.log('abilityConnectionManager.DisconnectReason.PEER_APP_CLOSE_COLLABORATION is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_3900 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4000
     * @tc.name    abilityConnectionManager.ConnectErrorCode.CONNECTED_SESSION_EXISTS
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4000 is start---------------")
      try {
        console.log(`abilityConnectionManager.ConnectErrorCode.CONNECTED_SESSION_EXISTS is ${abilityConnectionManager.ConnectErrorCode.CONNECTED_SESSION_EXISTS}`)
        expect(abilityConnectionManager.ConnectErrorCode.CONNECTED_SESSION_EXISTS).assertEqual(0)
      } catch (error) {
        console.log('abilityConnectionManager.ConnectErrorCode.CONNECTED_SESSION_EXISTS is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4000 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4100
     * @tc.name    abilityConnectionManager.ConnectErrorCode.PEER_APP_REJECTED
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4100 is start---------------")
      try {
        console.log(`abilityConnectionManager.ConnectErrorCode.PEER_APP_REJECTED is ${abilityConnectionManager.ConnectErrorCode.PEER_APP_REJECTED}`)
        expect(abilityConnectionManager.ConnectErrorCode.PEER_APP_REJECTED).assertEqual(1)
      } catch (error) {
        console.log('abilityConnectionManager.ConnectErrorCode.PEER_APP_REJECTED is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4100 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4200
     * @tc.name    abilityConnectionManager.ConnectErrorCode.LOCAL_WIFI_NOT_OPEN
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4200 is start---------------")
      try {
        console.log(`abilityConnectionManager.ConnectErrorCode.LOCAL_WIFI_NOT_OPEN is ${abilityConnectionManager.ConnectErrorCode.LOCAL_WIFI_NOT_OPEN}`)
        expect(abilityConnectionManager.ConnectErrorCode.LOCAL_WIFI_NOT_OPEN).assertEqual(2)
      } catch (error) {
        console.log('abilityConnectionManager.ConnectErrorCode.LOCAL_WIFI_NOT_OPEN is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4200 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4300
     * @tc.name    abilityConnectionManager.ConnectErrorCode.PEER_WIFI_NOT_OPEN
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4300 is start---------------")
      try {
        console.log(`abilityConnectionManager.ConnectErrorCode.PEER_WIFI_NOT_OPEN is ${abilityConnectionManager.ConnectErrorCode.PEER_WIFI_NOT_OPEN}`)
        expect(abilityConnectionManager.ConnectErrorCode.PEER_WIFI_NOT_OPEN).assertEqual(3)
      } catch (error) {
        console.log('abilityConnectionManager.ConnectErrorCode.PEER_WIFI_NOT_OPEN is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4300 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4400
     * @tc.name    abilityConnectionManager.ConnectErrorCode.PEER_ABILITY_NO_ONCOLLABORATE
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4400 is start---------------")
      try {
        console.log(`abilityConnectionManager.ConnectErrorCode.PEER_ABILITY_NO_ONCOLLABORATE is ${abilityConnectionManager.ConnectErrorCode.PEER_ABILITY_NO_ONCOLLABORATE}`)
        expect(abilityConnectionManager.ConnectErrorCode.PEER_ABILITY_NO_ONCOLLABORATE).assertEqual(4)
      } catch (error) {
        console.log('abilityConnectionManager.ConnectErrorCode.PEER_ABILITY_NO_ONCOLLABORATE is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4400 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4500
     * @tc.name    abilityConnectionManager.ConnectErrorCode.SYSTEM_INTERNAL_ERROR
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4500 is start---------------")
      try {
        console.log(`abilityConnectionManager.ConnectErrorCode.SYSTEM_INTERNAL_ERROR is ${abilityConnectionManager.ConnectErrorCode.SYSTEM_INTERNAL_ERROR}`)
        expect(abilityConnectionManager.ConnectErrorCode.SYSTEM_INTERNAL_ERROR).assertEqual(5)
      } catch (error) {
        console.log('abilityConnectionManager.ConnectErrorCode.SYSTEM_INTERNAL_ERROR is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_4500 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_StartOptionParams_4600
     * @tc.name    abilityConnectionManager.StartOptionParams.START_IN_FOREGROUND
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_StartOptionParams_4600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_StartOptionParams_4600 is start---------------")
      try {
        console.log(`abilityConnectionManager.StartOptionParams.START_IN_FOREGROUND is ${abilityConnectionManager.StartOptionParams.START_IN_FOREGROUND}`)
        expect(abilityConnectionManager.StartOptionParams.START_IN_FOREGROUND).assertEqual(0)
      } catch (error) {
        console.log('abilityConnectionManager.StartOptionParams.START_IN_FOREGROUND is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_StartOptionParams_4600 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_StartOptionParams_4700
     * @tc.name    abilityConnectionManager.StartOptionParams.START_IN_BACKGROUND
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_StartOptionParams_4700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_StartOptionParams_4700 is start---------------")
      try {
        console.log(`abilityConnectionManager.StartOptionParams.START_IN_BACKGROUND is ${abilityConnectionManager.StartOptionParams.START_IN_BACKGROUND}`)
        expect(abilityConnectionManager.StartOptionParams.START_IN_BACKGROUND).assertEqual(1)
      } catch (error) {
        console.log('abilityConnectionManager.StartOptionParams.START_IN_BACKGROUND is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_StartOptionParams_4700 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborateEventType_4800
     * @tc.name    abilityConnectionManager.CollaborateEventType.SEND_FAILURE
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborateEventType_4800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborateEventType_4800 is start---------------")
      try {
        console.log(`abilityConnectionManager.CollaborateEventType.SEND_FAILURE is ${abilityConnectionManager.CollaborateEventType.SEND_FAILURE}`)
        expect(abilityConnectionManager.CollaborateEventType.SEND_FAILURE).assertEqual(0)
      } catch (error) {
        console.log('abilityConnectionManager.CollaborateEventType.SEND_FAILURE is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborateEventType_4800 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborateEventType_4900
     * @tc.name    abilityConnectionManager.CollaborateEventType.COLOR_SPACE_CONVERSION_FAILURE
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborateEventType_4900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborateEventType_4900 is start---------------")
      try {
        console.log(`abilityConnectionManager.CollaborateEventType.COLOR_SPACE_CONVERSION_FAILURE is ${abilityConnectionManager.CollaborateEventType.COLOR_SPACE_CONVERSION_FAILURE}`)
        expect(abilityConnectionManager.CollaborateEventType.COLOR_SPACE_CONVERSION_FAILURE).assertEqual(1)
      } catch (error) {
        console.log('abilityConnectionManager.CollaborateEventType.COLOR_SPACE_CONVERSION_FAILURE is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborateEventType_4900 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_5000
     * @tc.name    abilityConnectionManager.CollaborationKeys.PEER_INFO
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_5000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_5000 is start---------------")
      try {
        console.log(`abilityConnectionManager.CollaborationKeys.PEER_INFO is ${abilityConnectionManager.CollaborationKeys.PEER_INFO}`)
        expect(abilityConnectionManager.CollaborationKeys.PEER_INFO).assertEqual('ohos.collaboration.key.peerInfo')
      } catch (error) {
        console.log('abilityConnectionManager.CollaborationKeys.PEER_INFO is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_5000 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_5100
     * @tc.name    abilityConnectionManager.CollaborationKeys.CONNECT_OPTIONS
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_5100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_5100 is start---------------")
      try {
        console.log(`abilityConnectionManager.CollaborationKeys.CONNECT_OPTIONS is ${abilityConnectionManager.CollaborationKeys.CONNECT_OPTIONS}`)
        expect(abilityConnectionManager.CollaborationKeys.CONNECT_OPTIONS).assertEqual('ohos.collaboration.key.connectOptions')
      } catch (error) {
        console.log('abilityConnectionManager.CollaborationKeys.CONNECT_OPTIONS is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_5100 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_5200
     * @tc.name    abilityConnectionManager.CollaborationKeys.COLLABORATE_TYPE
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_5200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_5200 is start---------------")
      try {
        console.log(`abilityConnectionManager.CollaborationKeys.COLLABORATE_TYPE is ${abilityConnectionManager.CollaborationKeys.COLLABORATE_TYPE}`)
        expect(abilityConnectionManager.CollaborationKeys.COLLABORATE_TYPE).assertEqual('ohos.collaboration.key.abilityCollaborateType')
      } catch (error) {
        console.log('abilityConnectionManager.CollaborationKeys.COLLABORATE_TYPE is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_5200 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationValues_5300
     * @tc.name    abilityConnectionManager.CollaborationValues.ABILITY_COLLABORATION_TYPE_DEFAULT
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationValues_5300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationValues_5300 is start---------------")
      try {
        console.log(`abilityConnectionManager.CollaborationValues.ABILITY_COLLABORATION_TYPE_DEFAULT is ${abilityConnectionManager.CollaborationValues.ABILITY_COLLABORATION_TYPE_DEFAULT}`)
        expect(abilityConnectionManager.CollaborationValues.ABILITY_COLLABORATION_TYPE_DEFAULT).assertEqual('ohos.collaboration.value.abilityCollab')
      } catch (error) {
        console.log('abilityConnectionManager.CollaborationValues.ABILITY_COLLABORATION_TYPE_DEFAULT is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationValues_5300 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationValues_5400
     * @tc.name    abilityConnectionManager.CollaborationValues.ABILITY_COLLABORATION_TYPE_CONNECT_PROXY
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationValues_5400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationValues_5400 is start---------------")
      try {
        console.log(`abilityConnectionManager.CollaborationValues.ABILITY_COLLABORATION_TYPE_CONNECT_PROXY is ${abilityConnectionManager.CollaborationValues.ABILITY_COLLABORATION_TYPE_CONNECT_PROXY}`)
        expect(abilityConnectionManager.CollaborationValues.ABILITY_COLLABORATION_TYPE_CONNECT_PROXY).assertEqual('ohos.collaboration.value.connectProxy')
      } catch (error) {
        console.log('abilityConnectionManager.CollaborationValues.ABILITY_COLLABORATION_TYPE_CONNECT_PROXY is catch' + JSON.stringify(error))
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationValues_5400 is end---------------")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_5500
     * @tc.name    Get abilityConnectionManager sendData
     * @tc.desc    Function test
     * @tc.level   3
     */
    it('SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_5500', TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_5500 start------------------------");
      let TAG = 'SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_5500';
      let sessionId = 0;
      let textEncoder = util.TextEncoder.create("utf-8");
      let arrayBuffer = textEncoder.encodeInto("data send success");
      abilityConnectionManager.sendData(sessionId, arrayBuffer.buffer).then(() => {
        console.log(TAG + 'abilityConnectionManager.sendData is success')
        expect().assertFail()
      }).catch((err) => {
        console.log(TAG + 'abilityConnectionManager.sendData is failed' + err.code)
        expect(err.code == 401).assertTrue()
      })
      await sleep(1000)
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_5500 end------------------------");
      done()
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_5600
    * @tc.name    abilityConnectionManager.on receiveData
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_5600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_5600 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_5600';
      try {
        abilityConnectionManager.on("receiveData", 10, (callbackInfo) => {
          console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)
          expect().assertFail()
        });
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.on error is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_on_5600 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_5700
    * @tc.name    abilityConnectionManager.off receiveData
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_5700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_5700 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_5700';
      try {
        abilityConnectionManager.off("receiveData", 10, (callbackInfo) => {
          console.log(TAG + 'abilityConnectionManager.off is success' + callbackInfo)
          expect().assertFail()
        });
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.off receiveData error is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_5700 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_5800
    * @tc.name    abilityConnectionManager.off receiveData
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_5800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_5800 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_5800';
      try {
        abilityConnectionManager.off("receiveData", 10);
        console.log(`${TAG} abilityConnectionManager.off is success`)
        expect().assertFail()
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.off receiveData error is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_off_5800 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_5900
    * @tc.name     abilityConnectionManager.disconnect error parameter
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_5900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_5900 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_5900'
      try {
        abilityConnectionManager.disconnect(null)
        console.log(`${TAG} abilityConnectionManager.disconnect is success`)
        expect().assertFail()
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.disconnect is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_5900 is end--------------- ")
      done();
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_6000
     * @tc.name    Get abilityConnectionManager sendData error parameter
     * @tc.desc    Function test
     * @tc.level   3
     */
    it('SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_6000', TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_6000 start------------------------");
      let TAG = 'SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_6000';
      let sessionId = 0;
      let textEncoder = util.TextEncoder.create("utf-8");
      let arrayBuffer = textEncoder.encodeInto("data send success");
      try {
        abilityConnectionManager.sendData('').then(() => {
          console.log(TAG + 'abilityConnectionManager.sendData is success')
          expect().assertFail()
        })
      } catch (error) {
        console.log(TAG + 'abilityConnectionManager.sendData is failed' + error.code)
        expect(error.code == 401).assertTrue()
      }
      await sleep(1000)
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_6000 end------------------------");
      done()
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_6100
    * @tc.name     abilityConnectionManager.destroyAbilityConnectionSession
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_6100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_6100 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_6100'
      try {
        abilityConnectionManager.destroyAbilityConnectionSession(null)
        console.log(`${TAG} abilityConnectionManager.destroyAbilityConnectionSession is succcess`)
        expect().assertFail()
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.destroyAbilityConnectionSession error.code is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_6100 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_6200
    * @tc.name    abilityConnectionManager.acceptConnect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_6200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_6200 is start---------------")
      try {
        abilityConnectionManager.acceptConnect(null).then((data) => {
          console.log(`${TAG} abilityConnectionManager.acceptConnect is success ${data}`)
          expect().assertFail()
        })
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.acceptConnect is failed ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_6200 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_3100
    * @tc.name    abilityConnectionManager.createAbilityConnectionSession
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_3100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_3100 is start---------------")
      let TAG = 'SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_3100'
      let peerInfo: abilityConnectionManager.PeerInfo = {
        deviceId: 123,
        bundleName: 'com.acts.example.dmsfwkstageserver',
        moduleName: 'entry',
        abilityName: 'MainAbility',
        serverId: 'collabTest'
      };

      let myRecord: Record<string, string> = {
        "newKey1": "value1",
      };

      let options: Record<string, string> = {
        'ohos.collabrate.key.start.option': 'ohos.collabrate.value.foreground',
      };

      let connectOption: abilityConnectionManager.ConnectOption = {
        needSendData: true,
        needSendStream: false,
        needReceiveStream: false,
        options: options,
        parameters: myRecord
      };

      try {
        sessionId = abilityConnectionManager.createAbilityConnectionSession("collabTest", context, peerInfo, connectOption);
        console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession is success ${sessionId}`)
        expect().assertFail()
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession error.code is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_3100 is end--------------- ")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100
    * @tc.name    Connec the remote Ability.
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100";
      try {
        connectId = context.connectServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100  onConnect: ' + JSON.stringify(connectId));
            done();
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100  onFailed: ' + code);
            expect(code).assertEqual(16000050)
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100  catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100  catch: ' + err.message);
        expect().assertFail();
        done();
      }
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100 is end---------------")
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200
    * @tc.name    Filed connect remote invisible service without permission.
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200 is start---------------")
      let want: Want = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      };
      let options: common.ConnectOptions = {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          done();
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200  onFailed: ' + code);
          expect(code == 16000050).assertTrue()
          done();
        }
      }
      try {
        connectId = context.connectServiceExtensionAbility(want, options);
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200 catch: ' + err.message);
      }
      await sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700
     * @tc.name    ServiceExtension Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700 is start---------------")
      try {
        extensionConnectId = context.connectServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
            done();
          },
          onDisconnect(elementName: bundleManager.ElementName) {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed(code: number) {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700  onFailed: ' + code);
            expect(code == 16000050).assertTrue();
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700 catch: ' + err.message);
      }
      await sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1600
     * @tc.name    Get call various applications
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1600', TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1600 start------------------------");
      context.startAbilityByCall({
        bundleName: 'com.acts.example.dmsfwkstageserver',
        abilityName: '',
        deviceId: dvId
      })
        .then((data: Caller) => {
          call = data;
          console.log('get caller is success caller is ' + call)
          expect().assertFail()
        }).catch((err: BusinessError) => {
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 16000050).assertTrue()
        })
      await sleep(2000)
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1600 end------------------------");
      done()
    });
  })
}