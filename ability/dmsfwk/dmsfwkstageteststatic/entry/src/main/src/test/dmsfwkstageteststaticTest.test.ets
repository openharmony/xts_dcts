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
import { Driver, ON } from '@ohos.UiTest';

let domain: int = 0x0000; //日志标识,domain作为测试框架的业务标识
let tag: string = 'testTag'; //日志标识字符串,作为tag标识当前runner类下的测试行为
let context: common.UIAbilityContext;
let dvId: string | undefined = undefined;
let localDeviceId: string;
let sessionId: int;
let dmInstance: deviceManager.DeviceManager;
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
      } catch (err: Error) {
        console.log('get deviceManager is failed' + JSON.stringify(err))
      }
      localDeviceId = dmInstance.getLocalDeviceNetworkId();
      console.info("getDeviceId: local device id is: " + localDeviceId);
      let deviceList: Array<deviceManager.DeviceBasicInfo> = dmInstance.getAvailableDeviceListSync();
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
      atManager.requestPermissionsFromUser(context, ['ohos.permission.DISTRIBUTED_DATASYNC'],
        (err: BusinessError | null, data: PermissionRequestResult | undefined) => {
          console.info("requestPermissionsFromUser success data is" + JSON.stringify(data));
          console.info("requestPermissionsFromUser failed err is" + JSON.stringify(err));
          console.info(TAG + ' catch get e' + `, error code is ${err!.code}, message is ${err!.message}`);
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
      } catch (err: Error) {
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
      } catch (e: Error) {
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
          deviceId: dvId,
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
          parameters: myRecord
        };

        try {
          sessionId =
            abilityConnectionManager.createAbilityConnectionSession("collabTest", context, peerInfo, connectOption);
          console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession is success ${sessionId}`)
          expect(sessionId >= 100).assertTrue()
        } catch (error: Error) {
          console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession error.code is ${error.code}`)
          expect().assertFail()
        }
        await sleep(1000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_0100 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0200
    * @tc.name    abilityConnectionManager.connect
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0200",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        try {
          console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0200 is start---------------")
          console.log(`${TAG} abilityConnectionManager.sessionId = ${sessionId}`)
          abilityConnectionManager.connect(sessionId).then((ConnectResult: abilityConnectionManager.ConnectResult) => {
            console.log(`${TAG} abilityConnectionManager.connect is : ${JSON.stringify(ConnectResult)}`)
            expect(ConnectResult.isConnected == true).assertFail()
            console.log(`${TAG} abilityConnectionManager.connect is ConnectResult.isConnected == true : ${JSON.stringify(ConnectResult)}`)
            done()
          }).catch((error: Error) => {
            console.error(TAG + 'abilityConnectionManager.connect catch get e' + `, error code is ${error.code}, message is ${error.message}`);
            expect(error.code == 0).assertTrue()
            done()
          })
        } catch (error: Error) {
          console.error(`${TAG}: Unexpected error:`, error)
          expect().assertFail()
          done()
        }
        await sleep(1000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_0200 is end--------------- ")
      })

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
          abilityConnectionManager.onConnect(sessionId, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)
          });
        } catch (error: Error) {
          console.error(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);
        }
        await sleep(1000)
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
          abilityConnectionManager.offConnect(sessionId, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)
          });
        } catch (error: Error) {
          console.error(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);
        }
        await sleep(1000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_0400 is end--------------- ")
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
          abilityConnectionManager.onDisconnect(sessionId, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)
          });
        } catch (error: Error) {
          console.log(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);
        }
        await sleep(2000)
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
          abilityConnectionManager.offDisconnect(sessionId);
          console.log(`${TAG} abilityConnectionManager.off is success`)

        } catch (error: Error) {
          console.log(TAG + ' abilityConnectionManager.off get e' + `, error code is ${error.code}, message is ${error.message}`);

        }
        await sleep(1000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_0600 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_0700
    * @tc.name    abilityConnectionManager.onDisconnect
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_0700",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_0700 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_0700';
        try {
          abilityConnectionManager.onDisconnect(sessionId, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)
          });

          abilityConnectionManager.offDisconnect(sessionId, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)
          });
        } catch (error: Error) {
          console.log(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);
        }
        await sleep(2000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_0700 is end--------------- ")
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
          abilityConnectionManager.onReceiveMessage(sessionId, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)

          });
        } catch (error: Error) {
          console.log(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);

        }
        await sleep(2000)
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
          abilityConnectionManager.offReceiveMessage(sessionId, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.off is success' + callbackInfo)

          });
        } catch (error: Error) {
          console.log(TAG + ' abilityConnectionManager.off get e' + `, error code is ${error.code}, message is ${error.message}`);

        }
        await sleep(2000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveMessage_0900 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_1000
    * @tc.name    abilityConnectionManager.onReceiveMessage
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_1000",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_1000 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_1000';
        try {
          abilityConnectionManager.onReceiveMessage(sessionId, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)
          });
          abilityConnectionManager.offReceiveMessage(sessionId)
          console.log(TAG + 'abilityConnectionManager.off is success')

        } catch (error: Error) {
          console.log(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);

        }
        await sleep(2000)
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
          abilityConnectionManager.onReceiveData(sessionId, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)

          });
        } catch (error: Error) {
          console.error(TAG + ' SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_1100 catch get e' + `, error code is ${error.code}, message is ${error.message}`);

        }
        await sleep(2000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_1100 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_1200
    * @tc.name    abilityConnectionManager.offReceiveData
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_1200",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_1200 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_1200';
        try {
          abilityConnectionManager.offReceiveData(sessionId, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.off is success' + callbackInfo)

          });
        } catch (error: Error) {
          console.log(`${TAG} abilityConnectionManager.off receiveData error is ${error.code}`)

        }
        await sleep(2000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_1200 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_1300
    * @tc.name    abilityConnectionManager.onReceiveData
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_1300",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_1300 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_1300';
        try {
          abilityConnectionManager.onReceiveData(sessionId, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)

          });

          abilityConnectionManager.offReceiveData(sessionId)

        } catch (error: Error) {
          console.error(TAG + ' SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_1300 catch get e' + `, error code is ${error.code}, message is ${error.message}`);

        }
        await sleep(2000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_1300 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_1400
    * @tc.name    Get abilityConnectionManager sendData
    * @tc.desc    Function test
    * @tc.level   3
    */
    it('SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_1400',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("-----------------SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_1400 start------------------------");
        let TAG = 'SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_1400';
        let textEncoder = util.TextEncoder.create("utf-8");
        let arrayBuffer = textEncoder.encodeInto("data send success");
        abilityConnectionManager.sendData(sessionId, arrayBuffer.buffer).then(() => {
          console.log(TAG + 'abilityConnectionManager.sendData is success')

        }).catch((err: Error) => {
          console.log(TAG + 'abilityConnectionManager.sendData catch get e' + `, error code is ${err.code}, message is ${err.message}`);

        })
        await sleep(1000)
        console.info("-----------------SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_1400 end------------------------");
        done()
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1500
    * @tc.name     abilityConnectionManager.getPeerInfoById
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1500",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1500 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1500'
        try {
          let peerInfo = abilityConnectionManager.getPeerInfoById(sessionId)
          console.log(`${TAG} abilityConnectionManager.getPeerInfoById is succcess`)
          // expect(peerInfo).assertEqual(undefined)
        } catch (error: Error) {
          console.log(`${TAG} abilityConnectionManager.getPeerInfoById error.code is ${error.code}`)
          // expect().assertFail()
        }
        await sleep(2000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_1500 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_1600
    * @tc.name     abilityConnectionManager.disconnect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_1600",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_1600 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_1600'
        try {
          abilityConnectionManager.disconnect(sessionId)
          console.log(`${TAG} abilityConnectionManager.disconnect is success`)

        } catch (error: Error) {
          console.log(TAG + ' abilityConnectionManager.disconnect catch get e' + `, error code is ${error.code}, message is ${error.message}`);

        }
        await sleep(1000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_1600 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1700
    * @tc.name    abilityConnectionManager.destroyAbilityConnectionSession
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1600",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1600 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1600'
        try {
          abilityConnectionManager.destroyAbilityConnectionSession(sessionId)
          console.log(`${TAG} abilityConnectionManager.destroyAbilityConnectionSession is success`)
          expect().assertTrue()
        } catch (error: Error) {
          console.log(`${TAG} abilityConnectionManager.destroyAbilityConnectionSession failed`)
          expect().assertFail()
          done()
        }
        await sleep(1000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1600 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1800
    * @tc.name    abilityConnectionManager.createAbilityConnectionSession error context
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1800",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void): Promise<void> => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1800 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1800'
        console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1800 get-------------- ")
        let peerInfo: abilityConnectionManager.PeerInfo = {
          deviceId: dvId,
          bundleName: 'com.ohos.dmsfwkstageServer.static',
          moduleName: 'entry',
          abilityName: 'EntryAbility',
          serviceName: 'collabTest'
        };
        console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1800 PeerInfo-------------- ")
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
          parameters: myRecord
        };

        try {
          sessionId = abilityConnectionManager.createAbilityConnectionSession("collabTest", context, peerInfo, connectOption);
          console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession is success ${sessionId}`)

        } catch (error: Error) {
          console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession error.code is ${error.code}`)

        }
        await sleep(1000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_1800 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1900
    * @tc.name    abilityConnectionManager.destroyAbilityConnectionSession error 
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1900",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1900 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1900'
        try {
          abilityConnectionManager.destroyAbilityConnectionSession(10)
          console.log(`${TAG} abilityConnectionManager.destroyAbilityConnectionSession is success`)

        } catch (error: Error) {
          console.log(`${TAG} abilityConnectionManager.destroyAbilityConnectionSession failed`)


        }
        await sleep(1000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_destroyAbilityConnectionSession_1900 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_2000
    * @tc.name     abilityConnectionManager.getPeerInfoById error
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_2000",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_2000 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_2000'
        try {
          let peerInfo = abilityConnectionManager.getPeerInfoById(10)
          console.log(`${TAG} abilityConnectionManager.getPeerInfoById is succcess`)
          // expect(peerInfo).assertEqual(undefined)
        } catch (error: Error) {
          console.log(`${TAG} abilityConnectionManager.getPeerInfoById error.code is ${error.code}`)
          // expect().assertFail()
        }
        await sleep(1000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_getPeerInfoById_2000 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_2100
    * @tc.name    abilityConnectionManager.connect
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_2100",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        try {
          console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_2100 is start---------------")

          abilityConnectionManager.connect(10)
            .then((ConnectResult: abilityConnectionManager.ConnectResult) => {
              console.log(`${TAG} abilityConnectionManager.connect is : ${JSON.stringify(ConnectResult)}`)

              done()
            })
            .catch((error: Error) => {
              console.error(TAG + 'abilityConnectionManager.connect catch get e' + `, error code is ${error.code}, message is ${error.message}`);

              done()
            })
        } catch (error: Error) {
          console.error(`${TAG}: Unexpected error:`, error)

          done()
        }
        await sleep(1000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_connect_2100 is end--------------- ")
      })

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_2200
    * @tc.name    abilityConnectionManager.acceptConnect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_2200",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_2200 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_2200';
        abilityConnectionManager.acceptConnect(10, "ohos.dms.collabToken").then((data) => {
          console.log(`${TAG} abilityConnectionManager.acceptConnect is success ${data!}`)
          expect().assertFail()
        }).catch((error: Error) => {
          console.log(TAG + '  abilityConnectionManager.acceptConnect catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        })
        await sleep(1000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_acceptConnect_2200 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_2300
    * @tc.name     abilityConnectionManager.disconnect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_2300",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_2300 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_2300'
        try {
          abilityConnectionManager.disconnect(10)
          console.log(`${TAG} abilityConnectionManager.disconnect is success`)

        } catch (error: Error) {
          console.log(TAG + ' abilityConnectionManager.disconnect catch get e' + `, error code is ${error.code}, message is ${error.message}`);

        }
        await sleep(1000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_disconnect_2300 is end--------------- ")
        done();
      });


    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_2400
    * @tc.name     abilityConnectionManager.reject
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_2400",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_2400 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_2400'
        try {
          abilityConnectionManager.reject('123', 'erc@')
          console.log(`${TAG} abilityConnectionManager.reject is succcess`)
          expect().assertFail()
        } catch (error: Error) {
          console.log(`${TAG} abilityConnectionManager.reject error.code is ${error.code}`)
          expect(error.code == 401).assertTrue()
        }
        await sleep(2000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_reject_2400 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onConnect_2500
    * @tc.name    abilityConnectionManager.on connect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onConnect_2500",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onConnect_2500 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onConnect_2500';
        try {
          abilityConnectionManager.onConnect(10, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)
            expect().assertFail()
          });
        } catch (error: Error) {
          console.error(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        }
        await sleep(2000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onConnect_2500 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_2600
    * @tc.name    abilityConnectionManager.offConnect
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_2600",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_2600 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_2600';
        try {
          abilityConnectionManager.offConnect(10, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)
          });
        } catch (error: Error) {
          console.error(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);
        }
        await sleep(1000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offConnect_2600 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_2700
    * @tc.name    abilityConnectionManager.onDisconnect
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_2700",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_2700 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_2700';
        try {
          abilityConnectionManager.onDisconnect(10, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)
          });
        } catch (error: Error) {
          console.log(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);
        }
        await sleep(2000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onDisconnect_2700 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_2800
    * @tc.name    abilityConnectionManager.offDisconnect error
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_2800",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_2800 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_2800';
        try {
          abilityConnectionManager.offDisconnect(10, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.off is success' + callbackInfo)
            expect().assertFail()
          });
        } catch (error: Error) {
          console.log(`${TAG} abilityConnectionManager.off disconnect error is ${error.code}`)
          expect(error.code == 401).assertTrue()
        }
        await sleep(2000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offDisconnect_2800 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_2900
    * @tc.name    abilityConnectionManager.onReceiveMessage
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_2900",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_2900 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_2900';
        try {
          abilityConnectionManager.onReceiveMessage(10, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)

          });
        } catch (error: Error) {
          console.log(TAG + ' abilityConnectionManager.on catch get e' + `, error code is ${error.code}, message is ${error.message}`);

        }
        await sleep(2000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveMessage_2900 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveMessage_3000
    * @tc.name    abilityConnectionManager.offReceiveMessage
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveMessage_3000",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveMessage_3000 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveMessage_3000';
        try {
          abilityConnectionManager.offReceiveMessage(10);
          console.log(`${TAG} abilityConnectionManager.off is success`)
          expect().assertFail()
        } catch (error: Error) {
          console.log(TAG + ' abilityConnectionManager.off get e' + `, error code is ${error.code}, message is ${error.message}`);
          expect(error.code == 401).assertTrue()
        }
        await sleep(1000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveMessage_3000 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_3100
    * @tc.name    abilityConnectionManager.onReceiveData
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_3100",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_3100 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_3100';
        try {
          abilityConnectionManager.onReceiveData(10, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.on is success' + callbackInfo)

          });
        } catch (error: Error) {
          console.error(TAG + 'catch get e' + `, error code is ${error.code}, message is ${error.message}`);

        }
        await sleep(2000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_onReceiveData_3100 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_3200
    * @tc.name    abilityConnectionManager.offReceiveData
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_3200",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_3200 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_3200';
        try {
          abilityConnectionManager.offReceiveData(10, (callbackInfo) => {
            console.log(TAG + 'abilityConnectionManager.off is success' + callbackInfo)

          });
        } catch (error: Error) {
          console.log(`${TAG} abilityConnectionManager.off receiveData error is ${error.code}`)

        }
        await sleep(2000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_offReceiveData_3200 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_3300
    * @tc.name    abilityConnectionManager.sendMessage
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_3300",
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_3300 is start---------------")
        let TAG = 'SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_3300';
        abilityConnectionManager.sendMessage(10, "message send success").then((data) => {
          console.log(`${TAG} abilityConnectionManager.sendMessage is success ${data}`)

        }).catch((error: Error) => {

          console.log(TAG + ' catch get e' + `, error code is ${error.code}, message is ${error.message}`);

        })
        await sleep(2000)
        console.info("---------------SUB_DMS_StandardOs_collaboration_abilityConnectionManager_sendMessage_3300 is end--------------- ")
        done();
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_3400
    * @tc.name    Get abilityConnectionManager sendData
    * @tc.desc    Function test
    * @tc.level   3
    */
    it('SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_3400',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
        console.info("-----------------SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_3400 start------------------------");
        let TAG = 'SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_3400';
        let textEncoder = util.TextEncoder.create("utf-8");
        let arrayBuffer = textEncoder.encodeInto("data send success");
        abilityConnectionManager.sendData(10, arrayBuffer.buffer).then(() => {
          console.log(TAG + 'abilityConnectionManager.sendData is success')

        }).catch((err: Error) => {
          console.log(TAG + 'abilityConnectionManager.sendData catch get e' + `, error code is ${err.code}, message is ${err.message}`);

        })
        await sleep(1000)
        console.info("-----------------SUB_DMS_StandardOs_Collaboration_abilityConnectionManager_sendData_3400 end------------------------");
        done()
      });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_0100
    * @tc.name    continueManager.offPrepareContinue
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_0100 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_0100'
      try {
        continueManager.offPrepareContinue(context, (err: BusinessError | null, ContinueResultInfo: continueManager.ContinueResultInfo | undefined) => {
          console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_0100 offPrepareContinue okok---------------")
          if (err != undefined) {
            console.log(TAG + 'continueManager.off is failed' + JSON.stringify(err!))
            console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_0100 err != undefined---------------")
            expect().assertFail()
          }
          console.log(TAG + 'continueManager.off is success' + ContinueResultInfo!.resultState + ContinueResultInfo!.resultInfo)
          expect(ContinueResultInfo!.resultState == 0).assertTrue()
        })
      } catch (error: Error) {
        console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_0100 offPrepareContinue error---------------")
        console.log(TAG + ' catch get e' + `, error code is ${error.code}, message is ${error.message}`);
        expect().assertFail()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_0100 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0200
    * @tc.name    continueManager.onPrepareContinue
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0200 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0200'
      try {
        let task = (err: BusinessError<void> | null, info: continueManager.ContinueResultInfo | undefined) => {
          try {
            if (err != null) {
              console.log(TAG + `SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0200 task error`);
              expect().assertFail()
            }
            ;
            if (info != undefined) {
              console.log(TAG + `task  type:prepareContinue into async callback ${info.resultInfo}`);
            }
          } catch (error: Error) {

            console.log(TAG + `task catch error:` + JSON.stringify(error));
            expect().assertFail()
          }
        }
        continueManager.onPrepareContinue(context, task);
        expect().assertFail()
      } catch (err1: Error) {
        console.log(TAG, `catch error:`, err1);
        expect(err1.code == 16300501).assertTrue()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0200 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_0300
    * @tc.name    continueManager.offPrepareContinue
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_0300 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_0300'
      try {
        continueManager.offPrepareContinue(context, (err: BusinessError | null, ContinueResultInfo: continueManager.ContinueResultInfo | undefined) => {
          if (err != undefined) {
            console.log(TAG + 'continueManager.off is failed' + JSON.stringify(err!))
          }
          console.log(TAG + 'continueManager.off is success' + ContinueResultInfo!.resultState + ContinueResultInfo!.resultInfo)
          expect().assertFail()
        })
      } catch (error: Error) {
        console.log(TAG + ' catch get e' + `, error code is ${error.code}, message is ${error.message}`);
        expect(error.code == 16300501).assertTrue()
      }
      await sleep(2000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_offPrepareContinue_0300 is end---------------")
      done();
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0400
    * @tc.name    continueManager.on
    * @tc.desc    Function test
    * @tc.level   3
    */
    it("SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async (done: () => void) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0400 is start---------------")
      TAG = 'SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0400'
      try {
        let task = (err: BusinessError<void> | null, info: continueManager.ContinueResultInfo | undefined) => {
          try {
            if (err != null) {
              console.log(TAG + `SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0400 task error`);
            }
            ;
            if (info != undefined) {
              console.log(TAG + `task  type:prepareContinue into async callback ${info.resultInfo}`);
            }
          } catch (error) {

            console.log(TAG + `task catch error:` + JSON.stringify(error));
            expect().assertFail()
          }
        }
        continueManager.onPrepareContinue(context, task);
        expect().assertTrue()
      } catch (err1) {
        console.log(TAG, `catch error:`, err1);
        expect().assertFail()
      }
      await sleep(1000)
      console.info("---------------SUB_DMS_StandardOs_collaboration_continueManager_onPrepareContinue_0400 is end---------------")
      done();
    });
  })
}