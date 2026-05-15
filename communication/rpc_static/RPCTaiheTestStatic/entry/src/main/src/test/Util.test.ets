/*
 * Copyright (C) 2026 Huawei Device Co., Ltd.
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

import rpc from '@ohos.rpc';
import deviceManager from '@ohos.distributedDeviceManager';
import common from '@ohos.app.ability.common';
import Want from '@ohos.app.ability.Want';
import { BusinessError } from '@ohos.base';
import hilog from '@ohos.hilog';
import { AppStorage } from '@ohos.arkui.stateManagement';
import bundleManager from '@ohos.bundle.bundleManager';
import { Driver, MatchPattern, ON } from '@ohos.UiTest';

let bundleNameRpc: string = "com.rpctaihetest.static";
let mainAbilityNameeRpc: string = "EntryAbility";
let deviceList: Array<deviceManager.DeviceBasicInfo>;
let dmInstance: deviceManager.DeviceManager;
let deviceID: string;
let tempData: deviceManager.DiscoverySuccessResult | undefined = undefined;
let connectId: long;
let remoteproxy: rpc.IRemoteObject;
let domain: int = 0x0000; //日志标识,0x0000作为测试框架的业务标识
let tag: string = 'testTag_RpcClientTestService'; //日志标识字符串,作为tag标识当前runner类下的测试行为

export default class Utils{
  static async msSleep(count:int) : Promise<int> {
    return new Promise<int>((resolve, reject) => {
      setTimeout(() => {
        resolve(0)
      }, count)
    })
  }

  static async toConnectAbility(bundleName: string, abilityName: string): Promise<rpc.IRemoteObject>  {
    return new Promise <rpc.IRemoteObject> (resolve => {
      hilog.info(domain, tag, " -----toConnectAbility-----");
      hilog.info(domain, tag, '%{public}s', '-----connectServiceExtensionAbility is begin-----');
      //获取networkId
      try {
        let deviceId: string | undefined
        dmInstance = deviceManager.createDeviceManager(bundleName);
        hilog.info(domain, tag, '%{public}s', 'get deviceManager success');
        deviceList = dmInstance.getAvailableDeviceListSync();
        deviceId = deviceList[0].networkId;
        hilog.info(domain, tag, '%{public}s', "deviceId is: " + deviceId);
        let wantValue: Want = {
          deviceId: deviceId,
          bundleName: bundleName,
          abilityName: abilityName
        }
        hilog.info(domain, tag, '%{public}s', 'start connect');
        hilog.info(domain, tag, '%{public}s', "Want info: " + JSON.stringify(wantValue));
        let context = AppStorage.get<common.UIAbilityContext>("context") as common.UIAbilityContext;
        hilog.info(domain, tag, '%{public}s', 'connectServiceExtensionAbility, context: ' + context);
        connectId = context.connectServiceExtensionAbility(wantValue, {
          onConnect: (elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) =>  {
            hilog.info(domain, tag, '%{public}s', "connectServiceExtensionAbility is  onConnect");
            remoteproxy = remote;
            hilog.info(domain, tag, '%{public}s', "Connect remoteproxy is " + remoteproxy);
            resolve(remoteproxy);
          },
          onDisconnect: (elementName: bundleManager.ElementName) =>  {
            hilog.info(domain, tag, '%{public}s', "connectServiceExtensionAbility is  onDisconnect " + elementName);
          },
          onFailed: (code: int) => {
            hilog.info(domain, tag, '%{public}s', "connectServiceExtensionAbility is  onFailed code is: " + code);
          }
        });
      } catch (err) {
        let code = (err as BusinessError).code;
        let message = (err as BusinessError).message;
        hilog.error(domain, tag, '%{public}s', ` ***** connectServiceExtensionAbility failed. err code is ${code}, message is ${message}`);
      }
    })
  }

  static async disConnectAbility(): Promise<void> {
    hilog.info(domain, tag, '%{public}s', " -----disConnectAbility-----");
    try {
      hilog.info(domain, tag, '%{public}s', '-----disconnectServiceExtensionAbility is begin-----');
      let context = AppStorage.get<common.UIAbilityContext>("context") as common.UIAbilityContext;
      hilog.info(domain, tag, '%{public}s', 'disconnectServiceExtensionAbility, context: ' + context);
      context.disconnectServiceExtensionAbility(connectId).then(() => {
        hilog.info(domain, tag, '%{public}s', 'disconnectServiceExtensionAbility, done');
      }).catch((err) => {
        hilog.error(domain, tag, '%{public}s', "disconnectServiceExtensionAbility failed: " + err);
      });
    } catch (err) {
      hilog.error(domain, tag, '%{public}s', "disConnectAbility failed: " + err);
    }
  }

  static async startAbility(): Promise<void> {
    try{
      hilog.info(domain, tag, '%{public}s', "let startAbility begin...");
      let deviceId: string | undefined
      dmInstance = deviceManager.createDeviceManager(bundleNameRpc);
      hilog.info(domain, tag, '%{public}s', 'get deviceManager success');
      deviceList = dmInstance.getAvailableDeviceListSync();
      deviceId = deviceList[0].networkId;
      hilog.info(domain, tag, '%{public}s', "deviceId is: " + deviceId);
      let wantValue: Want = {
        bundleName: bundleNameRpc,
        abilityName: mainAbilityNameeRpc,
        deviceId: deviceId
      }
      let context = AppStorage.get<common.UIAbilityContext>("context") as common.UIAbilityContext;
      context.startAbility(wantValue).then(() => {
        hilog.info(domain, tag, '%{public}s', " startAbility success." );
      }).catch((err) => {
        hilog.info(domain, tag, '%{public}s', " startAbility err: " + err);
      });
    }catch(error){
      hilog.info(domain, tag, '%{public}s', "startAbility:error = " + error);
    }
  }

  static async startDiscovering(): Promise<void> {
    let discoverParam: Record<string, int | string> = {
      'discoverTargetType': 1
    };
    let filterOptions: Record<string, int | string> = {
      'availableStatus': 0
    };

    try {
      let dmInstance: deviceManager.DeviceManager = deviceManager.createDeviceManager(bundleNameRpc);
      hilog.info(domain, tag, 'startDiscovering  get deviceManager is success');
      dmInstance.onDiscoverSuccess((data: deviceManager.DiscoverySuccessResult) => {
        hilog.info(domain, tag, "startDiscovering success: " + JSON.stringify(data));

        if (tempData == undefined) {
          tempData = data;
          hilog.info(domain, tag, "tempData is: " + JSON.stringify(tempData));
          deviceID = tempData!.device.deviceId;
          hilog.info(domain, tag, '%{public}s', 'bindStub  get deviceID is: ' + deviceID);
          let bindParam: Record<string, int | string> = {
            'bindType': 1, //无账号PIN码bind
            'targetPkgName': bundleNameRpc, //远端应用包名

          };
          dmInstance.bindTarget(deviceID, bindParam, (err: BusinessError<void> | null, data: deviceManager.BindTargetResult | undefined) => {
            hilog.info(domain, tag, '%{public}s', "bindTarget in");
            if (err) {
              hilog.error(domain, tag, '%{public}s', "bindTarget error errCode: " + err.code + "errMessage: " + err.message);
              return;
            }
            hilog.info(domain, tag, '%{public}s', 'bindTarget  result is: ' + JSON.stringify(data));
          })

        }
      })
      dmInstance.onDiscoverFailure((data: deviceManager.DiscoveryFailureResult) => {
        hilog.info(domain, tag, "startDiscovering failed into discoverFailure: " + JSON.stringify(data));
      })
      //设备发现时 进入discoverSuccess回调
      dmInstance.startDiscovering(discoverParam, filterOptions);
    } catch(error) {
      let code = (error as BusinessError).code;
      let message = (error as BusinessError).message;
      hilog.error(domain, tag, '%{public}s', ` ***** connectServiceExtensionAbility failed. err code is ${code}, message is ${message}`);
    }
  }

  static async stopDiscovering(): Promise<void> {
    try {
      let dmInstance: deviceManager.DeviceManager = deviceManager.createDeviceManager(bundleNameRpc);
      hilog.info(domain, tag, 'stopDiscovering  get deviceManager is success');
      dmInstance.stopDiscovering();
    } catch(error) {
      hilog.error(domain, tag, '%{public}s', "stopDiscovering error errCode: " + error.code + "errMessage: " + error.message);
    }
  }

  static async unbindStub(): Promise<void> {
    try {
      let dmInstance: deviceManager.DeviceManager = deviceManager.createDeviceManager(bundleNameRpc);
      hilog.info(domain, tag, 'unbindStub  get deviceManager is success');
      let deviceInfoList: Array<deviceManager.DeviceBasicInfo> = dmInstance.getAvailableDeviceListSync();
      hilog.info(domain, tag, 'unbindStub  deviceInfoList.length: ' +  deviceInfoList.length);
      for (let i = 0 ; i < deviceInfoList.length; i++) {
        dmInstance.unbindTarget(deviceInfoList[i].deviceId);
      }
    } catch(error) {
      hilog.error(domain, tag, '%{public}s', "unbindStub error errCode: " + error.code + "errMessage: " + error.message);
    }
  }

  static async clickRequestPermission(mess: string): Promise<void> {
    hilog.info(domain, tag, 'clickRequestPermission start');
    try {
      let driver = Driver.create();
      let permissionButton = await driver.waitForComponent(ON.text(mess, MatchPattern.EQUALS), 10000);
      if (permissionButton != null) {
        await permissionButton.click();
        hilog.info(domain, tag, 'clickRequestPermission end');
      }
    } catch (err) {
      hilog.info(domain, tag, 'clickRequestPermission get err:' + err);
    }
  }
}