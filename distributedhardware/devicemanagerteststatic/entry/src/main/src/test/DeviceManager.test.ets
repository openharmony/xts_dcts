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
let g_context: common.UIAbilityContext;

export default function DeviceManager_test() {
  let abilityDelegator: abilityDelegatorRegistry.AbilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();
  let context = abilityDelegator.getAppContext();
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
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
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
        } catch (err) {
          const e = err as BusinessError;
          hilog.error(domain, tag,
            'Test failed with error - Code: %{public}d, Msg: %{public}s',
            e.code, e.message);
          if (e.code === 11600101) {
            hilog.info(domain, tag, 'invalid input param ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
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
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
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
          if (deviceName === null || deviceName === undefined) {
            hilog.warn(domain, tag, 'getDeviceName failed for networkId: %{public}s', dmNetworkId);
            expect(false).assertTrue();
          } else {
            hilog.info(domain, tag, 'Device Name: %{public}s', deviceName);
            hilog.info(domain, tag, `Device Name Length: ${deviceName.length}`);
            expect(deviceName.length > 0).assertTrue();
          }

        } catch (err) {
          const e = err as BusinessError;
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
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
        } catch (err) {
          const e = err as BusinessError;
          hilog.error(domain, tag,
            'Test failed with error - Code: %{public}d, Msg: %{public}s',
            e.code, e.message);
          if (e.code === 11600101) {
            hilog.info(domain, tag, 'invalid input param ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
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
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
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
          dmInstance.unbindTarget(deviceId);
          hilog.info(domain, tag, 'getLocalDeviceId returned: %{public}s', deviceId);
          expect(deviceId.length > 0).assertTrue();
          hilog.info(domain, tag, 'unbindTarget (if enabled) called successfully');
          hilog.info(domain, tag, 'Test completed without exception');
          expect(true).assertTrue();

        } catch (err) {
          const e = err as BusinessError;
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
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
          hilog.info(domain, tag, 'Test unbindTarget with deviceIdNull completed (no actual call in this test).');
          expect(false).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          hilog.error(domain, tag,
            'unbindTarget test FAILED: Code = %{public}d, Msg = %{public}s', e.code, e.message);
          if (e.code === 11600101) {
            hilog.info(domain, tag, 'invalid input param ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
        }

        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0800 END--------------------------');
      });


    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_0900
     * @tc.name SUB_DH_DeviceManager_Dcts_0900
     * @tc.desc Test on('replyResult') interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_0900',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {

        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0900 START------------------------');

        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.on('replyResult', (data: distributedDeviceManager.ReplyResult) => {
            hilog.info(domain, tag, 'replyResult event received: %{public}s', JSON.stringify(data));
          });

          hilog.info(domain, tag, 'replyResult event listener registered successfully.');
          expect(true).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
        }

        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_0900 END--------------------------');
      });


    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_1000
     * @tc.name SUB_DH_DeviceManager_Dcts_1000
     * @tc.desc Test off('replyResult') interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_1000',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {

        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1000 START------------------------');

        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.off('replyResult');
          hilog.info(domain, tag, 'replyResult event listener off called successfully.');
          expect(true).assertTrue();

        } catch (err) {
          const e = err as BusinessError;
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
        }

        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1000 END--------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_1100
     * @tc.name SUB_DH_DeviceManager_Dcts_1100
     * @tc.desc Test on('discoverFailure') interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_1100',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {

        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1100 START------------------------');

        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();

          dmInstance.on('discoverFailure', (data: distributedDeviceManager.DiscoveryFailureResult) => {
            hilog.info(domain, tag, 'discoverFailure callback triggered: %{public}s', JSON.stringify(data));
          });
          hilog.info(domain, tag, 'discoverFailure event listener registered successfully.');
          expect(true).assertTrue();

        } catch (err) {
          const e = err as BusinessError;
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
        }

        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1100 END--------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_1200
     * @tc.name SUB_DH_DeviceManager_Dcts_1200
     * @tc.desc Test off('discoverFailure') interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_1200',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {

        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1200 START------------------------');

        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.off('discoverFailure', (data: distributedDeviceManager.DiscoveryFailureResult) => {
            hilog.info(domain, tag, 'discoverFailure event triggered: %{public}s', JSON.stringify(data));
          });
          hilog.info(domain, tag, 'off(discoverFailure) executed successfully.');
          expect(true).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1200 END--------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_1300
     * @tc.name SUB_DH_DeviceManager_Dcts_1300
     * @tc.desc Test on('deviceNameChange') interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_1300',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {

        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1300 START------------------------');

        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.on('deviceNameChange', (data: distributedDeviceManager.DeviceNameChangeResult) => {
            hilog.info(domain, tag, 'deviceNameChange event triggered: %{public}s', JSON.stringify(data));
          });

          hilog.info(domain, tag, 'on("deviceNameChange") registered successfully.');
          expect(true).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
        }

        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1300 END--------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_1300
     * @tc.name SUB_DH_DeviceManager_Dcts_1300
     * @tc.desc Test off('deviceNameChange') interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_1400',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {

        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1400 START------------------------');

        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.off('deviceNameChange', (data: distributedDeviceManager.DeviceNameChangeResult) => {
            hilog.info(domain, tag, 'deviceNameChange off callback: %{public}s', JSON.stringify(data));
          });

          hilog.info(domain, tag, 'off("deviceNameChange") executed successfully.');
          expect(true).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1400 END--------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_1500
     * @tc.name SUB_DH_DeviceManager_Dcts_1500
     * @tc.desc Test on("deviceStateChange") interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_1500',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {
        hilog.info(domain, tag, "-----------------SUB_DH_DeviceManager_Dcts_1500 START------------------------");

        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          dmInstance.on("deviceStateChange", (data: distributedDeviceManager.DeviceStateChangeResult) => {
            hilog.info(domain, tag, "deviceStateChange callback received: %{public}s", JSON.stringify(data));
          });
          hilog.info(domain, tag, 'deviceStateChange listener registered successfully');
          expect(true).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
        }
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_1600
     * @tc.name SUB_DH_DeviceManager_Dcts_1600
     * @tc.desc Test off('deviceStateChange') interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_1600',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {

        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1600 START------------------------');

        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.off('deviceStateChange', (data: distributedDeviceManager.DeviceStateChangeResult) => {
            hilog.info(domain, tag, 'deviceStateChange off callback: %{public}s', JSON.stringify(data));
          });

          hilog.info(domain, tag, 'off("deviceStateChange") executed successfully.');
          expect(true).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1600 END--------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_1700
     * @tc.name SUB_DH_DeviceManager_Dcts_1700
     * @tc.desc Test on('discoverSuccess') interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_1700',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1700 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.on('discoverSuccess', (data: distributedDeviceManager.DiscoverySuccessResult) => {
            hilog.info(domain, tag, 'discoverSuccess event triggered: %{public}s', JSON.stringify(data));
          });

          hilog.info(domain, tag, 'on("discoverSuccess") registered successfully.');
          expect(true).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1700 END--------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_1800
     * @tc.name SUB_DH_DeviceManager_Dcts_1800
     * @tc.desc Test off('discoverSuccess') interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_1800',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1800 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.off('discoverSuccess', (data: distributedDeviceManager.DiscoverySuccessResult) => {
            hilog.info(domain, tag, 'discoverSuccess off callback: %{public}s', JSON.stringify(data));
          });
          hilog.info(domain, tag, 'off("discoverSuccess") executed successfully.');
          expect(true).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1800 END--------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_1900
     * @tc.name SUB_DH_DeviceManager_Dcts_1900
     * @tc.desc Test on('deviceStateChange') interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_1900',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1900 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.on('deviceStateChange', (data: distributedDeviceManager.DeviceStateChangeResult) => {
            hilog.info(domain, tag, 'deviceStateChange event triggered: %{public}s', JSON.stringify(data));
          });
          hilog.info(domain, tag, 'on("deviceStateChange") registered successfully.');
          expect(true).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_1900 END--------------------------');
      });

    /**
     * @tc.number SUB_DH_DeviceManager_Dcts_2100
     * @tc.name SUB_DH_DeviceManager_Dcts_2100
     * @tc.desc Test on('serviceDie') interfaces
     * @tc.size MEDIUM
     * @tc.type Function
     * @tc.level Level 0
     * @tc.require
     */
    it('SUB_DH_DeviceManager_Dcts_2100',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {

        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_2100 START------------------------');
        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.on('serviceDie', () => {
            hilog.info(domain, tag, 'serviceDie event triggered.');
          });

          hilog.info(domain, tag, 'on("serviceDie") registered successfully.');
          expect(true).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_2100 END--------------------------');
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
    it('SUB_DH_DeviceManager_Dcts_2200',
      TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0,
      async (): Promise<void> => {

        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_2200 START------------------------');

        try {
          let dmInstance = distributedDeviceManager.createDeviceManager(TEST_BUNDLE_NAME);
          expect(dmInstance !== null && dmInstance !== undefined).assertTrue();
          dmInstance.off('serviceDie', () => {
            hilog.info(domain, tag, 'serviceDie off callback triggered.');
          });
          hilog.info(domain, tag, 'off("serviceDie") executed successfully.');
          expect(true).assertTrue();
        } catch (err) {
          const e = err as BusinessError;
          if (e.code === 96929750) {
            hilog.info(domain, tag, 'check permission failed ');
            expect(true).assertTrue();
          }
          else {
            expect(false).assertTrue();
          }
        }
        hilog.info(domain, tag, '-----------------SUB_DH_DeviceManager_Dcts_2200 END--------------------------');
      });

  })
  hilog.info(domain, tag, '%{public}s', 'DeviceManager_test end');

}