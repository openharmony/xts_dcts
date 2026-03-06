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

export default function DmsFwkStageNoStaticTest() {
  describe('DmsFwkStageNoStaticTest', () => {
    hilog.info(domain, tag, "====>create finish====");

    let getDeviceId = async () => {
      console.log('getDeviceId is begin')
      try {
        dmInstance = deviceManager.createDeviceManager('com.ohos.dmsfwkstagenotest.static');
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
      atManager.requestPermissionsFromUser(context!, ['ohos.permission.DISTRIBUTED_DATASYNC'],
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
      } catch (err) {
        console.info('err is ' + err);
      }
    }

    beforeAll(async (done: () => void) => {
      try {
        hilog.info(domain, tag, '%{public}s', '================ beforeAll start==========');
        await sleep(2000);
        await abilityDelegator.startAbility({
          bundleName: 'com.ohos.dmsfwkstagenotest.static',
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
            abilityConnectionManager.createAbilityConnectionSession("collabTest", context, peerInfo, connectOption);
          console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession is success ${sessionId}`)
          expect().assertFail()
        } catch (error: Error) {
          console.log(`${TAG} abilityConnectionManager.createAbilityConnectionSession error.code is ${error.code}`)
          expect(error.code == 201).assertTrue()
        }
        console.info("---------------SUB_DMS_StandardOs_collaboration_createAbilityConnectionSession_0100 is end--------------- ")
        done();
      });
  })
}