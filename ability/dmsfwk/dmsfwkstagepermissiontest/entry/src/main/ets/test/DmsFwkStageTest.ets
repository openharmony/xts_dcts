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

let sessionId: number;
let context = getContext(this) as common.UIAbilityContext;
let atManager = abilityAccessCtrl.createAtManager();
let abilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();
let dvList: Array<deviceManager.DeviceBasicInfo>;
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
        abilityConnectionManager.getPeerInfoById(10).then((data) => {
          console.log(`${TAG} abilityConnectionManager.getPeerInfoById is succcess`)
          expect().assertFail()
        })
      } catch (error) {
        console.log(`${TAG} abilityConnectionManager.getPeerInfoById error.code is ${error.code}`)
        expect(error.code == 401).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1800 is end--------------- ")
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
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100
     * @tc.name    Connec the remote Ability.
     * @tc.desc    Function test
     * @tc.level   3
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
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