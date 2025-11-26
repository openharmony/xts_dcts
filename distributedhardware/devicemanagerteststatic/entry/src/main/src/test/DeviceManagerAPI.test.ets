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
import { describe, beforeAll, Hypium, it, expect, TestType, Size, Level } from "../../../hypium/index";
import { BusinessError } from '@ohos.base';
import hilog from '@ohos.hilog'
import Utils from './Util.test';
import abilityAccessCtrl from '@ohos.abilityAccessCtrl';
import common from '@ohos.app.ability.common';
import { Permissions } from 'permissions';
import { PermissionRequestResult } from '@ohos.abilityAccessCtrl';
import { AppStorage } from '@ohos.arkui.stateManagement';
import abilityDelegatorRegistry from '@ohos.app.ability.abilityDelegatorRegistry';
import distributedDeviceManager from '@ohos.distributedDeviceManager';

let domain: int = 0x0000; //日志标识,domain作为测试框架的业务标识
let tag: string = 'testTag'; //日志标识字符串,作为tag标识当前runner类下的测试行为
const FILE_CONTENT = 'hello world';
const TEST_BUNDLE_NAME: String = 'com.acts.devicemanager.static';
let dmNetworkIdNull = "";
let deviceIdNull = "";
let gContext: common.UIAbilityContext;

export default function DeviceManagerAPI_test() {
  describe('DeviceManagerAPI_test', () => {
    hilog.info(domain, tag, "====>create finish====");

    beforeAll(async (done: () => void): Promise<void> => {
      hilog.info(domain, tag, "====>DeviceManagerAPI_test beforeAll start====");
      let abilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();
      await abilityDelegator.executeShellCommand("aa start -a EntryAbility -b com.acts.devicemanager.static");
      await Utils.msSleep(2000);
      try {
        gContext = AppStorage.get<common.UIAbilityContext>('UIAbilityContext') as common.UIAbilityContext;
        if (gContext) {
          let atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();
          let permissions: Array<Permissions> = ['ohos.permission.DISTRIBUTED_DATASYNC'];
          hilog.info(domain, tag, "====>start requestPermissionsFromUser");
          atManager.requestPermissionsFromUser(gContext, permissions,
            (err: BusinessError<void> | null, data: PermissionRequestResult | undefined) => {
              hilog.info(domain, tag, "====>request success permissions" + JSON.stringify(data));
              hilog.info(domain, tag, "====>getPermissionRequestResult err" + JSON.stringify(err));
              done();
            });
          await Utils.msSleep(3000);
          await Utils.clickRequestPermission('允许');
        } else {
          hilog.error(domain, tag, '====>context is undefined====');
        }
      } catch (err: BusinessError) {
        hilog.info(domain, tag, "====>beforeAll failed, err: " + JSON.stringify(err));
      }
    });

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
          if (deviceId === null) {
            console.log("getLocalDeviceId fail");
          }
          hilog.info(domain, tag, `Local Device Id: ${deviceId}`);
          expect(deviceId !== null).assertTrue();
        } catch (err) {
          hilog.info(domain, tag, '%{public}s', 'SUB_DH_DeviceManager_Dcts_0100 failed for ' + err);
          const e = err as BusinessError;
          hilog.info(domain, tag, `getLocalDeviceId failed err.code: ${e.code}`);
          expect().assertFail()
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
          expect().assertFail()
        } catch (err) {
          const e = err as BusinessError;
          hilog.error(domain, tag,
            'Test failed with error - Code: %{public}d, Msg: %{public}s',
            e.code, e.message);
          hilog.info(domain, tag, `invalid input param err.code: ${e.code}`);
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
          hilog.info(domain, tag, `getLocalDeviceNetworkId failed err.code: ${e.code}`);
          expect().assertFail()
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
          hilog.info(domain, tag, `getLocalDeviceNetworkId failed err.code: ${e.code}`);
          expect().assertFail()
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
          expect().assertFail()
        } catch (err) {
          const e = err as BusinessError;
          hilog.error(domain, tag,
            'Test failed with error - Code: %{public}d, Msg: %{public}s',
            e.code, e.message);
          hilog.info(domain, tag, `invalid input param err.code: ${e.code}`);
          expect(e.code === 401).assertTrue();
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
          hilog.info(domain, tag, `getLocalDeviceNetworkId failed err.code: ${e.code}`);
          expect().assertFail()
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
          if (deviceId !== null) {
            dmInstance.unbindTarget(deviceId);
            console.log("unbindTarget success");
            expect().assertFail()
          } else {
            console.log("unbindTarget deviceId is null");
            expect().assertFail()
          }
        } catch (err) {
          const e = err as BusinessError;
          hilog.error(domain, tag, 'unbindTarget test FAILED: Code = %{public}d, Msg = %{public}s', e.code, e.message);
          expect(e.code == 11600101).assertTrue()
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
          hilog.info(domain, tag, `invalid input param err.code: ${e.code}`);
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
          hilog.info(domain, tag, `createDeviceManager failed1 err.code: ${e.code}`);
          expect().assertFail();
        }
      } catch (err) {
        const e = err as BusinessError;
        hilog.info(domain, tag, `get deviceInfoList failed err.code: ${e.code}`);
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
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_3600 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.getAvailableDeviceList((err: BusinessError<void> | null, data: Array<distributedDeviceManager.DeviceBasicInfo> | undefined) => {
            if (err) {
              console.error('getAvailableDeviceList errCode:' + err.code + ',errMessage:' + err.message);
            }
            hilog.info(domain, tag, 'get available device info: ' + JSON.stringify(data));
            if (data != undefined) {
              expect(data.length > 0).assertTrue();
            }
          });
          hilog.info(domain, tag, 'getAvailableDeviceList successfully.');
        } catch (err) {
          const e = err as BusinessError;
          hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
          expect().assertFail();
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_3600 END--------------------------');
        done();
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
          dmInstance.getAvailableDeviceList().then((data: Array<distributedDeviceManager.DeviceBasicInfo>) => {
            hilog.info(domain, tag, 'getAvailableDeviceList event triggered: %{public}s', JSON.stringify(data));
            expect(data.length > 0).assertTrue();
          });
          hilog.info(domain, tag, 'getAvailableDeviceList successfully.');
        } catch (err) {
          const e = err as BusinessError;
          hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
          expect().assertFail();
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
          expect(true).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
          expect().assertFail();
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
          expect().assertFail();
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
          expect(true).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
          expect().assertFail();
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
        "targetPkgName": "com.acts.devicemanager.static",
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
          deviceId = DeviceBasicInfo[0].deviceId
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
          hilog.info(domain, tag, `get dmInstance.bindTarget failed err.code: ${e.code}`);
          expect(e.code == 11600101).assertTrue();
        }
      } catch (err) {
        const e = err as BusinessError;
        hilog.info(domain, tag, `createDeviceManager failed err.code: ${e.code}`);
        expect().assertFail();
      }
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_4100 END--------------------------');
      done()
    });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_4200
     * @tc.name SUB_DH_DeviceManager_Dcts_4200
     * @tc.desc Test createDeviceManager interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_4200',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_4200 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager("");
          hilog.info(domain, tag, 'get distributedDeviceManager.createDeviceManager successfully' + dmInstance);
          expect().assertFail();
        } catch (err) {
          const e = err as BusinessError;
          hilog.info(domain, tag, `get distributedDeviceManager.createDeviceManager successfully failed err.code: ${e.code}`);
          expect(e.code == 401).assertTrue();
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_4200 END--------------------------');
        done();
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_4300
     * @tc.name SUB_DH_DeviceManager_Dcts_4300
     * @tc.desc Test getDeviceName interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_4300', TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_4300 START------------------------');
      try {
        let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
        expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
        let networkIdName = '';
        const deviceName = dmInstance.getDeviceName(networkIdName);
        hilog.info(domain, tag, 'Device Name: %{public}s', deviceName);
        expect().assertFail();
      } catch (err) {
        const e = err as BusinessError;
        hilog.error(domain, tag, 'Test failed with error - Code: %{public}d, Msg: %{public}s', e.code, e.message);
        expect(e.code == 401).assertTrue();
      }
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_4300 END--------------------------');
      done();
    });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_4400
     * @tc.name SUB_DH_DeviceManager_Dcts_4400
     * @tc.desc Test getDeviceType interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_4400', TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_4400 START------------------------');
      try {
        let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
        expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
        const dmNetworkId: String = dmInstance.getLocalDeviceNetworkId();
        hilog.info(domain, tag, 'dmNetworkId: %{public}s', dmNetworkId);
        const deviceType = dmInstance.getDeviceType(dmNetworkId);
        hilog.info(domain, tag, 'Device Name: %{public}s', deviceType);
        expect(deviceType !== null).assertTrue();
      } catch (err) {
        const e = err as BusinessError;
        hilog.error(domain, tag, 'Test failed with error - Code: %{public}d, Msg: %{public}s', e.code, e.message);
        expect().assertFail();
      }
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_4400 END--------------------------');
      done();
    });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_4700
     * @tc.name SUB_DH_DeviceManager_Dcts_4700
     * @tc.desc Test unbindTarget interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_4700', TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_4700 START------------------------');
      try {
        let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
        expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
        hilog.info(domain, tag, 'BEGIN call getLocalDeviceId');
        try {
          let unDeviceId = '';
          dmInstance.unbindTarget(unDeviceId);
          hilog.info(domain, tag, 'unbindTarget (if enabled) called successfully');
          expect().assertFail();
        } catch (error) {
          const e = error as BusinessError;
          hilog.error(domain, tag, 'unbindTarget test FAILED: Code = %{public}d, Msg = %{public}s', e.code, e.message);
          expect(e.code == 401).assertTrue();
        }
      } catch (err) {
        const e = err as BusinessError;
        hilog.error(domain, tag, 'unbindTarget test FAILED: Code = %{public}d, Msg = %{public}s', e.code, e.message);
        expect().assertFail();
      }
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_4700 END------------------------');
      done()
    })

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_5700
     * @tc.name SUB_DH_DeviceManager_Dcts_5700
     * @tc.desc Test createDeviceManager interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_5700', TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_5700 START------------------------');
      try {
        let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
        hilog.info(domain, tag, 'get distributedDeviceManager.createDeviceManager successfully' + dmInstance);
        expect(typeof (dmInstance) == 'object').assertTrue();
      } catch (err) {
        const e = err as BusinessError;
        hilog.info(domain, tag, `get distributedDeviceManager.createDeviceManager successfully failed err.code: ${e.code}`);
        expect().assertFail();
      }
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_5700 END--------------------------');
      done();
    });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_5800
     * @tc.name SUB_DH_DeviceManager_Dcts_5800
     * @tc.desc Test DeviceBasicInfo interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_5800', TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_5800 START------------------------');
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
          expect(DeviceBasicInfo.length > 0).assertTrue();
        } catch (error) {
          const e = error as BusinessError;
          hilog.info(domain, tag, `check permission failed1 err.code: ${e.code}`);
          expect().assertFail();
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
    * @tc.number SUB_DH_DeviceManager_Dcts_5900
    * @tc.name SUB_DH_DeviceManager_Dcts_5900
    * @tc.desc Test getAvailableDeviceList interfaces
    * @tc.size MEDIUM
    * @tc.type Function
    * @tc.level Level 0
    * @tc.require
    */
    it('SUB_DH_DeviceManager_Dcts_5900', TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_5900 START------------------------');
      try {
        let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
        expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
        dmInstance.getAvailableDeviceList((err: BusinessError<void> | null, data: Array<distributedDeviceManager.DeviceBasicInfo> | undefined) => {
          if (err) {
            console.error('getAvailableDeviceList errCode:' + err.code + ',errMessage:' + err.message);
            expect().assertFail();
          }
          hilog.info(domain, tag, 'get available device info: ' + JSON.stringify(data));
          if (data != undefined) {
            expect(data.length > 0).assertTrue();
          }
        });
        hilog.info(domain, tag, 'getAvailableDeviceList successfully.');
      } catch (err) {
        const e = err as BusinessError;
        hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
        expect().assertFail();
      }
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_5900 END--------------------------');
      done();
    });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_6000
     * @tc.name SUB_DH_DeviceManager_Dcts_6000
     * @tc.desc Test getAvailableDeviceList interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_6000', TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async (done: () => void): Promise<void> => {
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_6000 START------------------------');
      try {
        let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
        expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
        dmInstance.getAvailableDeviceList().then((data: Array<distributedDeviceManager.DeviceBasicInfo>) => {
          hilog.info(domain, tag, 'getAvailableDeviceList event triggered: %{public}s', JSON.stringify(data));
          expect(data.length > 0).assertTrue();
        });
        hilog.info(domain, tag, 'getAvailableDeviceList successfully.');
      } catch (err) {
        const e = err as BusinessError;
        hilog.info(domain, tag, `check permission failed err.code: ${e.code}`);
        expect().assertFail();
      }
      hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_6000 END--------------------------');
      done();
    });
  })
}