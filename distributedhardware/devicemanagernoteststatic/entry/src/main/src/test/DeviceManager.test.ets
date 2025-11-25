/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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
import { describe, it, expect, TestType, Size, Level, beforeAll, beforeEach, afterEach, afterAll } from "../../../hypium/index";
import hilog from '@ohos.hilog';
import Utils from './Util.test';
import distributedDeviceManager from '@ohos.distributedDeviceManager';
import { BusinessError } from '@ohos.base';
import abilityDelegatorRegistry from '@ohos.app.ability.abilityDelegatorRegistry';
import { Permissions } from 'permissions';
import { Driver, ON, MatchPattern } from '@ohos.UiTest';
import abilityAccessCtrl, { PermissionRequestResult, Context } from '@ohos.abilityAccessCtrl';
import { Hypium } from "../../../hypium/index";
import common from '@ohos.app.ability.common';
import UIAbility from '@ohos.app.ability.UIAbility';

let Tag: string = 'testTag';
let domain: int = 0x0000; //日志标识,0x0000作为测试框架的业务标识
let tag: string = 'testTag'; //日志标识字符串,作为tag标识当前runner类下的测试行为
const FILE_CONTENT = 'hello world';
const TEST_BUNDLE_NAME: String = 'com.acts.device.manager.static';
let dmNetworkIdNull = "";
let deviceIdNull = "";

export default function DeviceManager_test() {
  describe("DeviceManager_test", (): void => {
    hilog.info(domain, tag, '%{public}s', 'DeviceManager_test start');

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_0100
     * @tc.name SUB_DH_DeviceManager_Dcts_0100
     * @tc.desc Test getLocalDeviceId() interfaces
     * Test Get the device id of the local device.
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_0100',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0100 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          const deviceId: String = dmInstance.getLocalDeviceId();
          expect(deviceId.length > 0).assertTrue();
          hilog.info(domain, tag, `Local Device Id: ${deviceId}`);
        } catch (err) {
          hilog.info(domain, tag, '%{public}s', 'SUB_DH_DeviceManager_Dcts_0100 failed for ' + err);
          const e = err as BusinessError;
          hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
          expect(e.code == 201).assertTrue();
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0100 END--------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_0200
     * @tc.name SUB_DH_DeviceManager_Dcts_0200
     * @tc.desc Test getDeviceType() interfaces
     * Test getDeviceType with invalid input param.
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_0200',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0200 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          const deviceType = dmInstance.getDeviceType(dmNetworkIdNull);
          hilog.info(domain, tag, `Device type: ${deviceType}`);
          expect(deviceType !== null).assertFail();
        } catch (err) {
          const e = err as BusinessError;
          hilog.error(domain, tag,
            'Test failed with error - Code: %{public}d, Msg: %{public}s',
            e.code, e.message);
          hilog.info(domain, tag, 'invalid input param ');
          expect(e.code == 401).assertTrue();
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0200 END--------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_0300
     * @tc.name SUB_DH_DeviceManager_Dcts_0300
     * @tc.desc Test getLocalDeviceNetworkId() interfaces
     * Test get networkId of the local device.
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_0300',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0300 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          const dmNetworkId: String = dmInstance.getLocalDeviceNetworkId();
          hilog.info(domain, tag, 'getLocalDeviceNetworkId: %{public}s', dmNetworkId);
          expect(dmNetworkId.length > 0).assertTrue();
          const deviceTypeReal = dmInstance.getDeviceType(dmNetworkId);
          expect(deviceTypeReal !== null && deviceTypeReal !== undefined).assertTrue();
          hilog.info(domain, tag, 'getDeviceType: %{public}s', deviceTypeReal);
        } catch (err) {
          hilog.info(domain, tag, '%{public}s', 'SUB_DH_DeviceManager_Dcts_0300 failed for ' + err);
          const e = err as BusinessError;
          hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
          expect(e.code == 201).assertTrue();
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0300 END--------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_0400
     * @tc.name SUB_DH_DeviceManager_Dcts_0400
     * @tc.desc Test getLocalDeviceNetworkId interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_0400',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0400 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          const dmNetworkId = dmInstance.getLocalDeviceNetworkId();
          hilog.info(domain, tag, 'getLocalDeviceNetworkId: %{public}s', dmNetworkId);
          expect(dmNetworkId.length > 0).assertTrue();
          const deviceName = dmInstance.getDeviceName(dmNetworkId);
          hilog.info(domain, tag, 'Device Name: %{public}s', deviceName);
          hilog.info(domain, tag, `Device Name Length: ${deviceName.length}`);
          expect(deviceName.length > 0).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
          expect(e.code == 201).assertTrue();
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0400 END--------------------------');
      })

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_0500
     * @tc.name SUB_DH_DeviceManager_Dcts_0500
     * @tc.desc Test getDeviceName interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_0500',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0500 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          const deviceName = dmInstance.getDeviceName(dmNetworkIdNull);
          hilog.info(domain, tag, 'Device Name: %{public}s', deviceName);
          expect(deviceName !== null).assertFail();
        } catch (err) {
          const e = err as BusinessError;
          hilog.error(domain, tag,
            'Test failed with error - Code: %{public}d, Msg: %{public}s',
            e.code, e.message);
          hilog.info(domain, tag, 'invalid input param ');
          expect(e.code == 401).assertTrue();
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0500 END--------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_0600
     * @tc.name SUB_DH_DeviceManager_Dcts_0600
     * @tc.desc Test getLocalDeviceNetworkId interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_0600',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0600 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          const dmNetworkId = dmInstance.getLocalDeviceNetworkId();
          hilog.info(domain, tag, 'getLocalDeviceNetworkId: %{public}s', dmNetworkId);
          expect(dmNetworkId.length > 0).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
          expect(e.code == 201).assertTrue();
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0600 END--------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_0700
     * @tc.name SUB_DH_DeviceManager_Dcts_0700
     * @tc.desc Test unbindTarget interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_0700',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0700 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          hilog.info(domain, tag, 'BEGIN call getLocalDeviceId');
          const deviceId = dmInstance.getLocalDeviceId();
          hilog.info(domain, tag, 'getLocalDeviceId returned: %{public}s', deviceId);
          dmInstance.unbindTarget(deviceId);
          expect(typeof deviceId == 'string').assertTrue();
          hilog.info(domain, tag, 'unbindTarget (if enabled) called successfully');
        } catch (err) {
          const e = err as BusinessError;
          hilog.error(domain, tag,
            'unbindTarget test FAILED: Code = %{public}d, Msg = %{public}s', e.code, e.message);
          hilog.info(domain, tag, 'UnbindTarget for failed ');
          expect(e.code == 201).assertTrue();
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0700 END------------------------');
      })

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_0800
     * @tc.name SUB_DH_DeviceManager_Dcts_0800
     * @tc.desc Test unbindTarget interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_0800',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0800 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.unbindTarget(deviceIdNull);
          hilog.info(domain, tag, 'Test unbindTarget with deviceIdNull completed.');
          expect(false).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          hilog.error(domain, tag,
            'unbindTarget test FAILED: Code = %{public}d, Msg = %{public}s', e.code, e.message);
          hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
          expect(e.code == 401).assertTrue();
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0800 END--------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_2200
     * @tc.name SUB_DH_DeviceManager_Dcts_2200
     * @tc.desc Test off('serviceDie') interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_2200', TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_2200 START------------------------');
      try {
        let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
        hilog.info(domain, tag, 'get dmInstance is successfully');
        expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
        try {
          let DeviceBasicInfo: Array<distributedDeviceManager.DeviceBasicInfo> = dmInstance.getAvailableDeviceListSync();
          hilog.info(domain, tag, 'get deviceInfoList is' + JSON.stringify(DeviceBasicInfo));
          for (let i = 0; i < DeviceBasicInfo.length; i++) {
            hilog.info(domain, tag, 'get deviceInfoList deviceId' + JSON.stringify(DeviceBasicInfo[i].deviceId));
            hilog.info(domain, tag, 'get deviceInfoList deviceName' + JSON.stringify(DeviceBasicInfo[i].deviceName));
            hilog.info(domain, tag, 'get deviceInfoList deviceType' + JSON.stringify(DeviceBasicInfo[i].deviceType));
            hilog.info(domain, tag, 'get deviceInfoList networkId' + JSON.stringify(DeviceBasicInfo[i].networkId));
          }
          hilog.info(domain, tag, 'get deviceInfoList successfully');
          expect(DeviceBasicInfo.length > 0).assertTrue()
        } catch (error) {
          const e = error as BusinessError;
          hilog.info(domain, tag, `check permission failed1 err.code: ${e.code}`);
          expect(e.code == 201).assertTrue();
        }
      } catch (err) {
        const e = err as BusinessError;
        hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
        expect().assertFail();
      }
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_2200 END--------------------------');
      done();
    });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_2300
     * @tc.name SUB_DH_DeviceManager_Dcts_2300
     * @tc.desc Test DeviceStateChange enumeration
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_2300', TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_2300 START------------------------');
      try {
        let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
        hilog.info(domain, tag, 'get dmInstance is successfully');
        expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
        expect(distributedDeviceManager.DeviceStateChange.UNKNOWN == 0).assertTrue();
        expect(distributedDeviceManager.DeviceStateChange.AVAILABLE == 1).assertTrue();
        expect(distributedDeviceManager.DeviceStateChange.UNAVAILABLE == 2).assertTrue();
      } catch (err) {
        const e = err as BusinessError;
        hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
        expect().assertFail();
      }
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_2300 END--------------------------');
      done();
    });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_3600
     * @tc.name SUB_DH_DeviceManager_Dcts_3600
     * @tc.desc Test getAvailableDeviceList interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_3600',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_3600 start------------------------');
        const dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
        dmInstance.getAvailableDeviceList((err, data) => {
          if (err) {
            const e = err as BusinessError;
            hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
            expect(e.code).assertEqual(201);
          } else {
            expect().assertFail();
          }
          done();
        });
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_3600 end------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_3700
     * @tc.name SUB_DH_DeviceManager_Dcts_3700
     * @tc.desc Test getAvailableDeviceList interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_3700',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_3700 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          await dmInstance.getAvailableDeviceList();
          hilog.info(domain, tag, 'getAvailableDeviceList successfully.');
          expect().assertFail();
        } catch (err) {
          const e = err as BusinessError;
          hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
          expect(e.code == 201).assertTrue();
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_3700 END--------------------------');
        done();
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_3800
     * @tc.name SUB_DH_DeviceManager_Dcts_3800
     * @tc.desc Test startDiscovering interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_3800',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_3800 START------------------------');
        let discoverParam: Record<string, Object> = {
          'discoverTargetType': 1
        };
        let filterOptions: Record<string, Object> = {
          'availableStatus': 0
        };
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.startDiscovering(discoverParam, filterOptions);
          hilog.info(domain, tag, 'startDiscovering successfully.');
          expect().assertFail();
        } catch (err) {
          const e = err as BusinessError;
          hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
          expect(e.code == 201).assertTrue();
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_3800 END--------------------------');
        done();
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_4000
     * @tc.name SUB_DH_DeviceManager_Dcts_4000
     * @tc.desc Test stopDiscovering interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_4000',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_4000 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.stopDiscovering();
          hilog.info(domain, tag, 'stopDiscovering successfully.');
          expect(true).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
          expect(e.code == 201).assertTrue();
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_4000 END--------------------------');
        done();
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_3900
     * @tc.name SUB_DH_DeviceManager_Dcts_3900
     * @tc.desc Test startDiscovering interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_3900',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_3900 START------------------------');
        let discoverParam: Record<string, Object> = {
          'discoverTargetType': 1
        };
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.startDiscovering(discoverParam);
          hilog.info(domain, tag, 'startDiscovering successfully.');
          expect().assertFail();
        } catch (err) {
          const e = err as BusinessError;
          hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
          expect(e.code == 201).assertTrue();
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_3900 END--------------------------');
        done();
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_4100
     * @tc.name SUB_DH_DeviceManager_Dcts_4100
     * @tc.desc Test bindTarget interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_4100', TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_4100 START------------------------');
      let deviceId: string = '';
      let bindParam: Record<string, string | Object> = {
        "bindType": 1,
        "targetPkgName": "com.acts.device.manager.static",
        "appName": "DctsDeviceManagerStaticTest",
        "appOperation": "想要连接本机。",
        "customDescription": "device manager"
      };
      try {
        let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
        hilog.info(domain, tag, 'get dmInstance is successfully');
        expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
        try {
          let DeviceBasicInfo: Array<distributedDeviceManager.DeviceBasicInfo> = dmInstance.getAvailableDeviceListSync();
          hilog.info(domain, tag, 'get deviceInfoList is' + JSON.stringify(DeviceBasicInfo));
          deviceId = DeviceBasicInfo[1].deviceId
          hilog.info(domain, tag, 'get deviceId is' + deviceId);
          dmInstance.bindTarget(deviceId, bindParam, (err: BusinessError<void> | null, data: distributedDeviceManager.BindTargetResult | undefined) => {
            if (err) {
              hilog.info(domain, tag, 'dmInstance.bindTarget is failed' + err.code);
            }
            hilog.info(domain, tag, 'bindTarget result is' + data);
            expect(data !== null).assertTrue();
          })
        } catch (error) {
          const e = error as BusinessError;
          hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
          expect(e.code === 201).assertTrue();
        }
      } catch (err) {
        const e = err as BusinessError;
        hilog.info(domain, tag, `createDeviceManager failed err.code: ${e.code}`);
        expect().assertFail();
      }
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_4100 END--------------------------');
      done()
    });
  })
}