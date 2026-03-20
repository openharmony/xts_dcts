/**
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import abilityDelegatorRegistry from '@ohos.app.ability.abilityDelegatorRegistry';
import hilog from '@ohos.hilog'
import Utils from './Util.test';
import { Permissions } from 'permissions';
import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, TestType, Size, Level } from "../../../hypium"
import deviceManager from '@ohos.distributedDeviceManager';
import continueManager from '@ohos.app.ability.continueManager';
import util from '@ohos.util';
import abilityAccessCtrl, { PermissionRequestResult } from '@ohos.abilityAccessCtrl';
import { BusinessError, RecordData } from '@ohos.base';
import common from '@ohos.app.ability.common';
import { AppStorage } from '@ohos.arkui.stateManagement';
import abilityConnectionManager from '@ohos.distributedsched.abilityConnectionManager';
import AbilityConstant from '@ohos.app.ability.AbilityConstant';
import { Driver, ON } from '@ohos.UiTest';

let domain: int = 0x0000; //日志标识,domain作为测试框架的业务标识
let tag: string = 'testTag'; //日志标识字符串,作为tag标识当前runner类下的测试行为
let context: common.UIAbilityContext| undefined;
let dvId: string | undefined = undefined;
let localDeviceId: string;
let sessionId: int;
let dmInstance: deviceManager.DeviceManager| undefined;
let TAG: string = 'DmsFwkStageTest';
let deviceId: string | undefined = '';
let abilityDelegator: abilityDelegatorRegistry.AbilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();
let atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();

function sleep(count: int): Promise<int> {
  return new Promise<int>((resolve, reject) => {
    setTimeout(() => {
      resolve(0)
    }, count)
  })
}

export default function DmsFwkStageTestStaticTest() {
  describe('DmsFwkStageTestStaticTest', () => {
    hilog.info(domain, tag, "====>create finish====");

    let getDeviceId = async () => {
      console.log('getDeviceId is begin')
      try {
        dmInstance = deviceManager.createDeviceManager('com.ohos.dmsfwkstagetest.static');
        console.log('get deviceManager is success')
      } catch (err) {
        console.log('get deviceManager is failed' + JSON.stringify(err))
      }
      localDeviceId = dmInstance!.getLocalDeviceNetworkId();
      console.info("getDeviceId: local device id is: " + localDeviceId);
      let deviceList: Array<deviceManager.DeviceBasicInfo> = dmInstance!.getAvailableDeviceListSync();
      if (deviceId !== undefined) {
        console.info("deviceList is: " + deviceList);
        deviceId = deviceList[0].networkId;
        console.info("getDeviceId: deviceId !== undefined && deviceId !== null,local device id is: " + deviceId);
        dvId = deviceId;
      }
      console.info("deviceList is: " + JSON.stringify(deviceList));
    }

    let getPermission = async () => {
      console.info('getPermission is start');
      console.info('come in getPermission')
      atManager.requestPermissionsFromUser(context!, ['ohos.permission.DISTRIBUTED_DATASYNC'],
        (err: BusinessError | null, data: PermissionRequestResult | undefined) => {
          console.info("requestPermissionsFromUser success data is" + JSON.stringify(data));
          console.info("requestPermissionsFromUser failed err is" + JSON.stringify(err));
        })
    }

    let driveFn = async () => {
      try {
        let driver: Driver = Driver.create();
        console.info('come in driveFn')
        console.info('driver is ${JSON.stringify(driver)}')
        await sleep(1000);
        let button = await driver.findComponent(ON.text('允许'));
        console.info('button is ${JSON.stringify(button)}');
        await sleep(1000);
        await button!.click();
        console.info('driveFn click')
        await sleep(1000);
      } catch (err) {
        console.info('err is ' + err);
      }
    }

    beforeAll(async (done: () => void) => {
      try {
        hilog.info(domain, tag, '%{public}s', '================ beforeAll start==========');
        await sleep(2000);
        await abilityDelegator.startAbility({
          bundleName: 'com.ohos.dmsfwkstagetest.static',
          abilityName: 'EntryAbility'
        });
        hilog.info(domain, tag, '%{public}s', '================ beforeAll startAbility==========');
        await sleep(2000);
        context = AppStorage.get<common.UIAbilityContext>("abilityContextMainAbility2") as common.UIAbilityContext;
        hilog.info(domain, tag, '%{public}s', '================ beforeAll context==========');
        hilog.info(domain, tag, '%{public}s', 'onAbilityCreate enddatabaseDir:' + context!.databaseDir);
      } catch (e) {
        hilog.info(domain, tag, '%{public}s', "============beforeAll context e: " + e);
        done();
      }
      hilog.info(domain, tag, '%{public}s', '================ beforeAll start getPermission==========');
      await getPermission();
      hilog.info(domain, tag, '%{public}s', '================ beforeAll getPermission end==========');
      await driveFn();
      hilog.info(domain, tag, '%{public}s', '================ beforeAll driveFn end==========');
      hilog.info(domain, tag, '%{public}s', '================ beforeAll checkResult end==========');
      await getDeviceId();
      hilog.info(domain, tag, '%{public}s', '================ beforeAll getDeviceId end==========');
      done();
    });

    beforeEach(async (done: () => void) => {
      console.info('LifeCycleTest before each called');
      done();
    });

    afterEach(async (done: () => void) => {
      console.info('LifeCycleTest afterEach each called');
      done();
    });

    afterAll(async (done: () => void): Promise<void> => {
      console.info('afterAll start');
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_0100
    * @tc.name    abilityConnectionManager.createAbilityConnectionSession
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_0100",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_0100 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_0100'
        let peerInfo: abilityConnectionManager.PeerInfo = {
          deviceId: dvId!,
          bundleName: 'com.ohos.dmsfwkstageServer.static',
          moduleName: 'entry',
          abilityName: 'EntryAbility',
          serviceName: 'collabTest'
        };

        let myRecord: Record<string, string> = {
          "newKey1": "value1",
        };

        let options: Record<string, string> = {
          'ohos.collabrate.key.start.option': 'ohos.collabrate.value.foreground',
        };

        let connectOption: abilityConnectionManager.ConnectOptions = {
          needSendData: true,
          needSendStream: false,
          needReceiveStream: false,
          startOptions: abilityConnectionManager.StartOptionParams.START_IN_FOREGROUND,
          parameters: myRecord
        };

        try {
          sessionId =
            abilityConnectionManager.createAbilityConnectionSession("collabTest", context!, peerInfo, connectOption);
          console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession is success ${sessionId}`)
          expect(sessionId >= 100).assertTrue()
        } catch (error) {
          console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession error.code is ${error.code}`)
          if(error.code == 801){
            expect().assertTrue()
          }
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_0100 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0200
    * @tc.name    abilityConnectionManager.connect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0200",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0200 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0200';
        await abilityConnectionManager.connect(sessionId).then((ConnectResult:abilityConnectionManager.ConnectResult) =>{
          console.log(TAG + 'abilityConnectionManager.connect is success' + JSON.stringify(ConnectResult))
          expect(ConnectResult.isConnected).assertEqual(false)
          expect(ConnectResult.reason).assertEqual('')
          expect(ConnectResult.errorCode == abilityConnectionManager.ConnectErrorCode.SYSTEM_INTERNAL_ERROR).assertTrue()
          expect(ConnectResult.errorCode != abilityConnectionManager.ConnectErrorCode.CONNECTED_SESSION_EXISTS).assertTrue()
          expect(ConnectResult.errorCode != abilityConnectionManager.ConnectErrorCode.PEER_APP_REJECTED).assertTrue()
          expect(ConnectResult.errorCode != abilityConnectionManager.ConnectErrorCode.LOCAL_WIFI_NOT_OPEN).assertTrue()
          expect(ConnectResult.errorCode != abilityConnectionManager.ConnectErrorCode.PEER_WIFI_NOT_OPEN).assertTrue()
          expect(ConnectResult.errorCode != abilityConnectionManager.ConnectErrorCode.PEER_ABILITY_NO_ONCOLLABORATE).assertTrue()
          expect(ConnectResult.isConnected != true).assertTrue()
        }).catch((err: Error) =>{
          console.log('abilityConnectionManager.connect catch get e' + `, error code is ${err.code}, message is ${err.message}`);
          expect().assertFail()
        })
        await sleep(2000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0200 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onConnect_0300
    * @tc.name    abilityConnectionManager.onConnect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onConnect_0300",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onConnect_0300 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onConnect_0300';
        try {
          abilityConnectionManager.onConnect(sessionId, (callbackInfo: abilityConnectionManager.EventCallbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)
            expect(typeof(callbackInfo.sessionId)).assertEqual('number')
            expect(typeof(callbackInfo.reason)).assertEqual('onject')
            expect(typeof(callbackInfo.msg)).assertEqual('string')
            expect(typeof(callbackInfo.data)).assertEqual('ArrayBuffer')
          });
        } catch (error) {
          console.error(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onConnect_0300 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_0400
    * @tc.name    abilityConnectionManager.offConnect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_0400",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_0400 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_0400';
        try {
          abilityConnectionManager.offConnect(sessionId, (callbackInfo: abilityConnectionManager.EventCallbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo.reason)
            expect(typeof(callbackInfo.reason)).assertEqual('object')
          });
        } catch (error) {
          console.error(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_0400 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_04000
    * @tc.name    abilityConnectionManager.offConnect null callback
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_04000",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_04000 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_04000';
        try {
          abilityConnectionManager.offConnect(sessionId);
          console.log(TAG + 'abilityConnectionManager.offConnect is success')
        } catch (error) {
          console.error(TAG + ' abilityConnectionManager.offConnect catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_04000 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_0500
    * @tc.name    abilityConnectionManager.onDisconnect
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_0500",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_0500 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_0500';
        try {
          abilityConnectionManager.onDisconnect(sessionId, (callbackInfo: abilityConnectionManager.EventCallbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo.reason)
            expect(typeof(callbackInfo.reason)).assertEqual('object')
            expect(typeof(callbackInfo.sessionId)).assertEqual('number')
            expect(typeof(callbackInfo.msg)).assertEqual('string')
            expect(typeof(callbackInfo.data)).assertEqual('ArrayBuffer')
          });
        } catch (error) {
          console.log(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_0500 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_0600
    * @tc.name    abilityConnectionManager.offDisconnect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_0600",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_0600 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_0600';
        try {
          abilityConnectionManager.offDisconnect(10);
          console.log(`${TAG} abilityConnectionManager.off is success`)
          expect().assertFail()

        } catch (error) {
          console.log(TAG + ' abilityConnectionManager.off get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_0600 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_0700
    * @tc.name    abilityConnectionManager.offDisconnect
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_0700",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_0700 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_0700';
        try {
          abilityConnectionManager.offDisconnect(10, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)
            expect().assertFail()
          });
        } catch (error) {
          console.log(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_0700 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_0800
    * @tc.name    abilityConnectionManager.onReceiveMessage
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_0800",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_0800 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_0800';
        try {
          abilityConnectionManager.onReceiveMessage(sessionId, (callbackInfo: abilityConnectionManager.EventCallbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.onReceiveMessage is success' + callbackInfo.msg)
            expect(typeof(callbackInfo.msg)).assertEqual('string')
            expect(typeof(callbackInfo.reason)).assertEqual('object')
            expect(typeof(callbackInfo.sessionId)).assertEqual('number')
            expect(typeof(callbackInfo.data)).assertEqual('ArrayBuffer')
          });
        } catch (error) {
          console.log(TAG + ' abilityConnectionManager.onReceiveMessage catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_0800 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveMessage_0900
    * @tc.name    abilityConnectionManager.offReceiveMessage
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveMessage_0900",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveMessage_0900 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveMessage_0900';
        try {
          abilityConnectionManager.offReceiveMessage(10, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.off is success' + callbackInfo)
            expect().assertFail()
          });
        } catch (error) {
          console.log(TAG + ' abilityConnectionManager.off get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveMessage_0900 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_1000
    * @tc.name    abilityConnectionManager.offReceiveMessage
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_1000",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_1000 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_1000';
        try {
          abilityConnectionManager.offReceiveMessage(10)
          console.log(TAG + 'abilityConnectionManager.off is success')
          expect().assertFail()
        } catch (error) {
          console.log(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_1000 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_1100
    * @tc.name    abilityConnectionManager.onReceiveData
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_1100",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_1100 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_1100';
        try {
          abilityConnectionManager.onReceiveData(sessionId, (callbackInfo: abilityConnectionManager.EventCallbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.onReceiveData is success' + callbackInfo.data)
            expect(typeof(callbackInfo.data)).assertEqual('ArrayBuffer')
            expect(typeof(callbackInfo.msg)).assertEqual('string')
            expect(typeof(callbackInfo.reason)).assertEqual('object')
            expect(typeof(callbackInfo.sessionId)).assertEqual('number')
          });
        } catch (error) {
          console.error(TAG + 'catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_1100 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_1200
    * @tc.name    abilityConnectionManager.offReceiveData error sessionId
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_1200",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_1200 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_1200';
        try {
          abilityConnectionManager.offReceiveData(10, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.offReceiveData is success' + callbackInfo)
            expect().assertFail()
          });
        } catch (error) {
          console.log(`${TAG} abilityConnectionManager.offReceiveData receiveData error is ${error.code}`)
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_1200 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_1300
    * @tc.name    abilityConnectionManager sendData
    * @tc.desc    Function test
    * @tc.level   3
    */
    it('SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_1300',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("-----------------SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_1300 start------------------------");
        let TAG = 'SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_1300';
        let textEncoder = util.TextEncoder.create("utf-8");
        let arrayBuffer = textEncoder.encodeInto("data send success");
        abilityConnectionManager.sendData(10, arrayBuffer.buffer).then(() => {
          console.log(TAG + 'abilityConnectionManager.sendData is success')
          expect().assertFail()
        }).catch((err: Error) => {
          console.log(TAG + 'abilityConnectionManager.sendData catch get e' + `, error code is ${err.code}, message is ${err.message}`);
          expect(err.code == 401).assertTrue()
        })
        console.info("-----------------SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_1300 end------------------------");
        done()
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_1400
    * @tc.name    abilityConnectionManager.offReceiveData
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_1400",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_1400 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_1400';
        try {
          abilityConnectionManager.offReceiveData(10);
          console.log(TAG + 'abilityConnectionManager.offReceiveData is success')
          expect().assertFail()
        } catch (error) {
          console.log(`${TAG} abilityConnectionManager.offReceiveData receiveData error is ${error.code}`)
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_1400 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1500
    * @tc.name    abilityConnectionManager.createAbilityConnectionSession deviceId is ''
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1500",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1500 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1500'
        let peerInfo: abilityConnectionManager.PeerInfo = {
          deviceId: '',
          bundleName: 'com.ohos.dmsfwkstageServer.static',
          moduleName: 'entry',
          abilityName: 'EntryAbility',
          serviceName: 'collabTest'
        };

        let myRecord: Record<string, string> = {
          "newKey1": "value1",
        };

        let options: Record<string, string> = {
          'ohos.collabrate.key.start.option': 'ohos.collabrate.value.foreground',
        };

        let connectOption: abilityConnectionManager.ConnectOptions = {
          needSendData: true,
          needSendStream: false,
          needReceiveStream: false,
          startOptions: abilityConnectionManager.StartOptionParams.START_IN_FOREGROUND,
          parameters: myRecord
        };

        try {
          sessionId =
            abilityConnectionManager.createAbilityConnectionSession("collabTest", context!, peerInfo, connectOption);
          console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession is success ${sessionId}`)
          expect().assertFail()
        } catch (error) {
          console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession error.code is ${error.code}`)
          if(error.code == 801){
            expect().assertTrue()
          }
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1500 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1600
    * @tc.name    abilityConnectionManager.createAbilityConnectionSession needSendData is false
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1600",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1600 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1600'
        let peerInfo: abilityConnectionManager.PeerInfo = {
          deviceId: '',
          bundleName: 'com.ohos.dmsfwkstageServer.static',
          moduleName: 'entry',
          abilityName: 'EntryAbility',
          serviceName: 'collabTest'
        };

        let myRecord: Record<string, string> = {
          "newKey1": "value1",
        };

        let options: Record<string, string> = {
          'ohos.collabrate.key.start.option': 'ohos.collabrate.value.foreground',
        };

        let connectOption: abilityConnectionManager.ConnectOptions = {
          needSendData: false,
          needSendStream: false,
          needReceiveStream: false,
          startOptions: abilityConnectionManager.StartOptionParams.START_IN_FOREGROUND,
          parameters: myRecord
        };

        try {
          sessionId =
            abilityConnectionManager.createAbilityConnectionSession("", context!, peerInfo, connectOption);
          console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession is success ${sessionId}`)
          expect().assertFail()
        } catch (error) {
          console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession error.code is ${error.code}`)
          if(error.code == 801){
            expect().assertTrue()
          }
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1600 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1700
    * @tc.name    abilityConnectionManager.destroyAbilityConnectionSession error 
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1700",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1700 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1700'
        try {
          abilityConnectionManager.destroyAbilityConnectionSession(10)
          console.log(`${TAG} abilityConnectionManager.destroyAbilityConnectionSession is success`)
          expect().assertFail()
        } catch (error) {
          console.log(`${TAG} abilityConnectionManager.destroyAbilityConnectionSession failed`)
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1700 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1800
    * @tc.name     abilityConnectionManager.getPeerInfoById error
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1800",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1800 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1800'
        try {
          let peerInfo = abilityConnectionManager.getPeerInfoById(10)
          console.log(`${TAG} abilityConnectionManager.getPeerInfoById is succcess` + peerInfo)
          expect(peerInfo).assertEqual(null)
        } catch (error) {
          console.log(`${TAG} abilityConnectionManager.getPeerInfoById error.code is ${error.code}`)
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1800 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_1900
    * @tc.name    abilityConnectionManager.acceptConnect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_1900",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_1900 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_1900';
        abilityConnectionManager.acceptConnect(10, "ohos.dms.collabToken").then((data) => {
          console.log(`${TAG} abilityConnectionManager.acceptConnect is success ${data!}`)
          expect().assertFail()
        }).catch((error: Error) => {
          console.log(TAG + '  abilityConnectionManager.acceptConnect catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        })
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_1900 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_2000
    * @tc.name     abilityConnectionManager.disconnect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_2000",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_2000 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_2000'
        try {
          abilityConnectionManager.disconnect(10)
          console.log(`${TAG} abilityConnectionManager.disconnect is success`)
          expect().assertFail()
        } catch (error) {
          console.log(TAG + ' abilityConnectionManager.disconnect catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_2000 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_2100
    * @tc.name     abilityConnectionManager.reject
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_2100",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_2100 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_2100'
        try {
          abilityConnectionManager.reject('123', 'erc@')
          console.log(`${TAG} abilityConnectionManager.reject is succcess`)
          expect().assertFail()
        } catch (error) {
          console.log(`${TAG} abilityConnectionManager.reject error.code is ${error.code}`)
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_2100 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_2200
    * @tc.name    abilityConnectionManager.sendMessage
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_2200",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_2200 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_2200';
        abilityConnectionManager.sendMessage(10, "message send success").then((data) => {
          console.log(`${TAG} abilityConnectionManager.sendMessage is success ${data}`)
          expect().assertFail()
        }).catch((error: Error) => {
          console.log(TAG + ' catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        })
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_2200 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_StartOptionParams_2300
    * @tc.name    abilityConnectionManager StartOptionParams
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_StartOptionParams_2300",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_StartOptionParams_2300 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_StartOptionParams_2300';
        try {
          console.log(`abilityConnectionManager StartOptionParams is ${abilityConnectionManager.StartOptionParams.START_IN_FOREGROUND}`)
          expect(abilityConnectionManager.StartOptionParams.START_IN_FOREGROUND == 0).assertTrue()
        } catch (error) {
          console.log(TAG + ' catch get e' + `, error code is ${error.code}`);
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_StartOptionParams_2300 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborateEventType_2300
    * @tc.name    abilityConnectionManager CollaborateEventType
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborateEventType_2300",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborateEventType_2300 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborateEventType_2300';
        try {
          console.log(`abilityConnectionManager CollaborateEventType is ${abilityConnectionManager.CollaborateEventType.SEND_FAILURE}`)
          console.log(`abilityConnectionManager CollaborateEventType is ${abilityConnectionManager.CollaborateEventType.COLOR_SPACE_CONVERSION_FAILURE}`)
          expect(abilityConnectionManager.CollaborateEventType.SEND_FAILURE == 0).assertTrue()
          expect(abilityConnectionManager.CollaborateEventType.COLOR_SPACE_CONVERSION_FAILURE == 1).assertTrue()
        } catch (error) {
          console.log(TAG + ' catch get e' + `, error code is ${error.code}`);
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborateEventType_2300 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_2400
    * @tc.name    abilityConnectionManager DisconnectReason
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_2400",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_2400 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_2400';
        try {
          console.log(`abilityConnectionManager DisconnectReason is ${abilityConnectionManager.DisconnectReason.PEER_APP_CLOSE_COLLABORATION}`)
          console.log(`abilityConnectionManager DisconnectReason is ${abilityConnectionManager.DisconnectReason.PEER_APP_EXIT}`)
          console.log(`abilityConnectionManager DisconnectReason is ${abilityConnectionManager.DisconnectReason.NETWORK_DISCONNECTED}`)
          expect(abilityConnectionManager.DisconnectReason.PEER_APP_CLOSE_COLLABORATION == 0).assertTrue()
          expect(abilityConnectionManager.DisconnectReason.PEER_APP_EXIT == 1).assertTrue()
          expect(abilityConnectionManager.DisconnectReason.NETWORK_DISCONNECTED == 2).assertTrue()
        } catch (error) {
          console.log(TAG + ' catch get e' + `, error code is ${error.code}`);
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_DisconnectReason_2400 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_2500
    * @tc.name    abilityConnectionManager CollaborationKeys
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_2500",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_2500 is start---------------")
        try {
          console.log(`abilityConnectionManager CollaborationKeys is ${abilityConnectionManager.CollaborationKeys.PEER_INFO}`)
          console.log(`abilityConnectionManager CollaborationKeys is ${abilityConnectionManager.CollaborationKeys.CONNECT_OPTIONS}`)
          console.log(`abilityConnectionManager CollaborationKeys is ${abilityConnectionManager.CollaborationKeys.COLLABORATE_TYPE}`)
          expect((abilityConnectionManager.CollaborationKeys.PEER_INFO +'') == 'ohos.collaboration.key.peerInfo').assertTrue()
          expect((abilityConnectionManager.CollaborationKeys.CONNECT_OPTIONS +'') == 'ohos.collaboration.key.connectOptions').assertTrue()
          expect((abilityConnectionManager.CollaborationKeys.COLLABORATE_TYPE +'') == 'ohos.collaboration.key.abilityCollaborateType').assertTrue()
        } catch (error) {
          console.log(TAG + ' catch get e' + `, error code is ${error.code}`);
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_2500 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_2600
    * @tc.name    abilityConnectionManager CollaborationValues
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_2600",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_2600 is start---------------")
        try {
          console.log(`abilityConnectionManager CollaborationValues is ${abilityConnectionManager.CollaborationValues.ABILITY_COLLABORATION_TYPE_DEFAULT}`)
          console.log(`abilityConnectionManager CollaborationValues is ${abilityConnectionManager.CollaborationValues.ABILITY_COLLABORATION_TYPE_CONNECT_PROXY}`)
          expect((abilityConnectionManager.CollaborationValues.ABILITY_COLLABORATION_TYPE_DEFAULT +'') == 'ohos.collaboration.value.abilityCollab').assertTrue()
          expect((abilityConnectionManager.CollaborationValues.ABILITY_COLLABORATION_TYPE_CONNECT_PROXY+'') == 'ohos.collaboration.value.connectProxy').assertTrue()
        } catch (error) {
          console.log(TAG + ' catch get e' + `, error code is ${error.code}`);
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_CollaborationKeys_2600 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_2700
    * @tc.name     abilityConnectionManager.getPeerInfoById
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_2700",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_2700 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_2700'
        try {
          let peerInfo = abilityConnectionManager.getPeerInfoById(sessionId)
          console.log(`${TAG} abilityConnectionManager.getPeerInfoById is succcess` + peerInfo)
          expect(typeof(peerInfo!.deviceId)).assertEqual('string')
          expect(typeof(peerInfo!.bundleName)).assertEqual('string')
          expect(typeof(peerInfo!.moduleName)).assertEqual('string')
          expect(typeof(peerInfo!.abilityName)).assertEqual('string')
          expect(typeof(peerInfo!.serviceName)).assertEqual('string')
        } catch (error) {
          console.log(`${TAG} abilityConnectionManager.getPeerInfoById error.code is ${error.code}`)
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_2700 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_2800
    * @tc.name    abilityConnectionManager ConnectErrorCode
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_2800",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_2800 is start---------------")
        try {
          console.log(`abilityConnectionManager ConnectErrorCode is ${abilityConnectionManager.ConnectErrorCode.CONNECTED_SESSION_EXISTS}`)
          console.log(`abilityConnectionManager ConnectErrorCode is ${abilityConnectionManager.ConnectErrorCode.PEER_APP_REJECTED}`)
          console.log(`abilityConnectionManager ConnectErrorCode is ${abilityConnectionManager.ConnectErrorCode.LOCAL_WIFI_NOT_OPEN}`)
          console.log(`abilityConnectionManager ConnectErrorCode is ${abilityConnectionManager.ConnectErrorCode.PEER_WIFI_NOT_OPEN}`)
          console.log(`abilityConnectionManager ConnectErrorCode is ${abilityConnectionManager.ConnectErrorCode.PEER_ABILITY_NO_ONCOLLABORATE}`)
          console.log(`abilityConnectionManager ConnectErrorCode is ${abilityConnectionManager.ConnectErrorCode.SYSTEM_INTERNAL_ERROR}`)
          expect(abilityConnectionManager.ConnectErrorCode.CONNECTED_SESSION_EXISTS == 0).assertTrue()
          expect(abilityConnectionManager.ConnectErrorCode.PEER_APP_REJECTED == 1).assertTrue()
          expect(abilityConnectionManager.ConnectErrorCode.LOCAL_WIFI_NOT_OPEN == 2).assertTrue()
          expect(abilityConnectionManager.ConnectErrorCode.PEER_WIFI_NOT_OPEN == 3).assertTrue()
          expect(abilityConnectionManager.ConnectErrorCode.PEER_ABILITY_NO_ONCOLLABORATE == 4).assertTrue()
          expect(abilityConnectionManager.ConnectErrorCode.SYSTEM_INTERNAL_ERROR == 5).assertTrue()
        } catch (error) {
          console.log(TAG + ' catch get e' + `, error code is ${error.code}`);
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_ConnectErrorCode_2800 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onConnect_2900
    * @tc.name    abilityConnectionManager.onConnect sessionId is error 
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onConnect_2900",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onConnect_2900 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onConnect_2900';
        try {
          abilityConnectionManager.onConnect(-1, (callbackInfo: abilityConnectionManager.EventCallbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo.sessionId)
            expect().assertFail()
          });
        } catch (error) {
          console.error(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onConnect_2900 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_3000
    * @tc.name    abilityConnectionManager.onReceiveMessage sessionId is error 
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_3000",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_3000 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_3000';
        try {
          abilityConnectionManager.onReceiveMessage(10, (callbackInfo: abilityConnectionManager.EventCallbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.onReceiveMessage is success' + callbackInfo.msg)
            expect().assertFail()
          });
        } catch (error) {
          console.log(TAG + ' abilityConnectionManager.onReceiveMessage catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_3000 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_3100
    * @tc.name    abilityConnectionManager.offConnect error sessionId
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_3100",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_3100 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_3100';
        try {
          abilityConnectionManager.offConnect(-1, (callbackInfo: abilityConnectionManager.EventCallbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.offConnect is success' + callbackInfo.reason)
            expect().assertFail()
          });
        } catch (error) {
          console.error(TAG + ' abilityConnectionManager.offConnect catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_3100 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_3200
    * @tc.name    abilityConnectionManager.onDisconnect error sessionId
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_3200",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_3200 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_3200';
        try {
          abilityConnectionManager.onDisconnect(-1, (callbackInfo: abilityConnectionManager.EventCallbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.onDisconnect is success' + callbackInfo.reason)
            expect().assertFail()
          });
        } catch (error) {
          console.log(TAG + ' abilityConnectionManager.onDisconnect catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_3200 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_3300
    * @tc.name    abilityConnectionManager.onReceiveData error sessionId
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_3300",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_3300 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_3300';
        try {
          abilityConnectionManager.onReceiveData(10, (callbackInfo: abilityConnectionManager.EventCallbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.onReceiveData is success' + callbackInfo.data)
            expect().assertFail()
          });
        } catch (error) {
          console.error(TAG + 'catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_3300 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_3400
    * @tc.name    abilityConnectionManager.connect error sessionId
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_3400",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_3400 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_3400';
        try {
          await abilityConnectionManager.connect(10).then((ConnectResult:abilityConnectionManager.ConnectResult) =>{
            console.log(TAG + 'abilityConnectionManager.connect is success' + JSON.stringify(ConnectResult))
            expect().assertFail()
          }).catch((err: Error) =>{
            console.log('abilityConnectionManager.connect catch get e' + `, error code is ${err.code}, message is ${err.message}`);
            expect(err.code == 401).assertTrue()
          })
        } catch (error) {
          console.log(TAG + 'catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_3400 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_3500
    * @tc.name    abilityConnectionManager.acceptConnect token is ''
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_3500",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_3500 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_3500';
        abilityConnectionManager.acceptConnect(sessionId, "").then((data) => {
          console.log(`${TAG} abilityConnectionManager.acceptConnect is success ${data!}`)
          expect().assertFail()
        }).catch((error: Error) => {
          console.log(TAG + '  abilityConnectionManager.acceptConnect catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        })
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_3500 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_3600
    * @tc.name     abilityConnectionManager.reject token is ''
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_3600",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_3600 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_3600'
        try {
          abilityConnectionManager.reject('', 'erc@')
          console.log(`${TAG} abilityConnectionManager.reject is succcess`)
          expect().assertFail()
        } catch (error) {
          console.log(`${TAG} abilityConnectionManager.reject error.code is ${error.code}`)
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_3600 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_3700
    * @tc.name     abilityConnectionManager.reject reason is ''
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_3700",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_3700 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_3700'
        try {
          abilityConnectionManager.reject('collabToken', '')
          console.log(`${TAG} abilityConnectionManager.reject is succcess`)
          expect().assertFail()
        } catch (error) {
          console.log(`${TAG} abilityConnectionManager.reject error.code is ${error.code}`)
          expect(error.code == 401).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_3700 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_3800
    * @tc.name    abilityConnectionManager.sendMessage msg is ''
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_3800",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_3800 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_3800';
        abilityConnectionManager.sendMessage(sessionId, "").then((data) => {
          console.log(`${TAG} abilityConnectionManager.sendMessage is success ${data}`)
          expect().assertFail()
        }).catch((error: Error) => {
          console.log(TAG + ' catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        })
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_3800 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0100
    * @tc.name    continueManager.onPrepareContinue
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0100 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0100'
      try {
        continueManager.onPrepareContinue(context!, (err: BusinessError | null, ContinueResultInfo: continueManager.ContinueResultInfo | undefined) => {
          console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0100 onPrepareContinue okok---------------")
          if (err != undefined) {
            console.log(TAG + 'continueManager.onPrepareContinue is failed' + JSON.stringify(err!))
            expect().assertFail()
          }
          console.log(TAG + 'continueManager.onPrepareContinue is success' + ContinueResultInfo!.resultState + ContinueResultInfo!.resultInfo)
          expect(ContinueResultInfo!.resultState == continueManager.ContinueStateCode.SUCCESS).assertTrue()
          expect(typeof(ContinueResultInfo!.resultInfo) == 'string').assertTrue()
        })
      } catch (error) {
        console.log(TAG + ' catch get e' + `, error code is ${error.code}, message is ${error.message}`);
        expect().assertFail()
      }
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0100 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCode_0200
    * @tc.name    continueManager ContinueStateCode
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCode_0200",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCode_0200 is start---------------")
        try {
          console.log(`continueManager ContinueStateCode is ${continueManager.ContinueStateCode.SUCCESS}`)
          expect(continueManager.ContinueStateCode.SUCCESS == 0).assertTrue()
        } catch (error) {
          console.log(TAG + ' catch get e' + `, error code is ${error.code}`);
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCode_0200 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCode_0300
    * @tc.name    continueManager ContinueStateCode
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCode_0300",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCode_0300 is start---------------")
        try {
          console.log(`continueManager ContinueStateCode is ${continueManager.ContinueStateCode.SYSTEM_ERROR}`)
          expect(continueManager.ContinueStateCode.SYSTEM_ERROR != null).assertTrue()
        } catch (error) {
          console.log(TAG + ' catch get e' + `, error code is ${error.code}`);
          expect().assertFail()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_ContinueStateCode_0300 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_00400
    * @tc.name    continueManager.offPrepareContinue
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_00400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_00400 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_00400'
      try {
        continueManager.offPrepareContinue(context!, (err: BusinessError | null, ContinueResultInfo: continueManager.ContinueResultInfo | undefined) => {
          console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_00400 onPrepareContinue okok---------------")
          if (err != undefined) {
            console.log(TAG + 'continueManager.offPrepareContinue is failed' + JSON.stringify(err!))
            expect().assertFail()
          }
          console.log(TAG + 'continueManager.offPrepareContinue is success' + ContinueResultInfo!.resultState + ContinueResultInfo!.resultInfo)
          expect(ContinueResultInfo!.resultState == 0).assertTrue()
        })
      } catch (error) {
        console.log(TAG + ' catch get e' + `, error code is ${error.code}, message is ${error.message}`);
        expect().assertFail()
      }
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_00400 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_00500
    * @tc.name    continueManager.offPrepareContinue no callback
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_00500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_00500 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_00500'
      try {
        continueManager.offPrepareContinue(context!)
      } catch (error) {
        console.log(TAG + ' catch get e' + `, error code is ${error.code}, message is ${error.message}`);
        expect().assertFail()
      }
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_00500 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0100
    * @tc.name    context.setMissionContinueState promise INACTIVE
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0100 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0100'
      try {
        await context!.setMissionContinueState(AbilityConstant.ContinueState.INACTIVE).then(() => {
          console.log(`${TAG} context.setMissionContinueState is success`)
        }).catch((error: Error) => {
          console.log(TAG + ' catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect().assertFail()
        })
      } catch (error) {
        console.log(TAG + ' catch get e' + `, error code is ${error.code}, message is ${error.message}`);
        expect().assertFail()
      }
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0100 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0200
    * @tc.name    context.setMissionContinueState promise ACTIVE
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0200 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0200'
      try {
        await context!.setMissionContinueState(AbilityConstant.ContinueState.ACTIVE).then(() => {
          console.log(`${TAG} context.setMissionContinueState is success`)
        }).catch((error: Error) => {
          console.log(TAG + ' context.setMissionContinueState' + `, error code is ${error.code}, message is ${error.message}`);
          expect().assertFail()
        })
      } catch (error) {
        console.log(TAG + ' catch get e' + `, error code is ${error.code}, message is ${error.message}`);
        expect().assertFail()
      }
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0200 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0300
    * @tc.name    context.setMissionContinueState callback INACTIVE
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0300 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0300'
      try {
        context!.setMissionContinueState(AbilityConstant.ContinueState.INACTIVE, (err: BusinessError|null, data:string[]|undefined) => {
          console.log(`${TAG} context.setMissionContinueState is success` + JSON.stringify(err))
          expect().assertFail()
        })
      } catch (error) {
        console.log(TAG + ' catch get e' + `, error code is ${error.code}`);
        expect(error.code == 0).assertTrue()
      }
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0300 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0400
    * @tc.name    context.setMissionContinueState callback ACTIVE
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0400 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0400'
      try {
        context!.setMissionContinueState(AbilityConstant.ContinueState.ACTIVE, (err: BusinessError|null, data:string[]|undefined) => {
          console.log(`${TAG} context.setMissionContinueState is success` + JSON.stringify(err))
          expect().assertFail()
        })
      } catch (error) {
        console.log(TAG + ' catch get e' + `, error code is ${error.code}`);
        expect(error.code == 0).assertTrue()
      }
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_setMissionContinueState_0400 is end---------------")
      done();
    });
  })
}