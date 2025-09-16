/*
 * Copyright (C) 2024 Huawei Device Co., Ltd.
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

import deviceManager from '@ohos.distributedDeviceManager';
import common from '@ohos.app.ability.common';
import { BusinessError } from '@ohos.base';
import promptAction from '@ohos.promptAction';

let logTag = "DmsClient_TestService:  ";
let bundleNameRpc: string = "com.acts.example.dmsfwkstagetest";
let abilityNameRpc: string = "com.example.lifecycletest.MainAbility";

let deviceList: Array<deviceManager.DeviceBasicInfo>;
let dmInstance: deviceManager.DeviceManager;
let deviceId: string;
let tempData = undefined;

export default class TestService {
    callback;

    onCreate() {
        console.info(logTag + 'AceApplication onCreate');
    }

    onDestroy() {
        console.info(logTag + 'AceApplication onDestroy');
    }

    constructor() {

    }

    getDeviceList(deviceManager) {
        deviceList = deviceManager.getAvailableDeviceListSync();
        console.info(logTag + "getDeviceList success, deviceList id: " + JSON.stringify(deviceList));
    }

    toConnectAbility() {
        console.info(logTag + " -----toConnectAbility-----");
        return new Promise(resolve => {
            console.info(logTag + '-----getDeviceId is begin-----')
            try {
                dmInstance = deviceManager.createDeviceManager(bundleNameRpc);
                console.info(logTag + 'get deviceManager is success')
            } catch (error) {
                console.info(logTag + 'get deviceManager is failed' + JSON.stringify(error))
            }
            deviceList = dmInstance.getAvailableDeviceListSync();
            deviceId = deviceList[0].networkId;
            console.info(logTag + "deviceid : " + deviceId);

            console.info(logTag + '-----connectServiceExtensionAbility is begin-----');
            let context: common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext

            let want = {
                deviceId: deviceId,
                bundleName: bundleNameRpc,
                abilityName: abilityNameRpc
            };
            let connect = {
                onConnect: function (elementName, remoteProxy) {
                    console.log(logTag + 'onConnect called, remoteProxy: ' + remoteProxy);
                    resolve(remoteProxy);
                },
                onDisconnect: function (elementName) {
                    console.log(logTag + "...onDisconnect...");
                },
                onFailed: function () {
                    console.log(logTag + "...onFailed...");
                }
            }
            let connection: number;
            try {
                connection = context.connectServiceExtensionAbility(want, connect);
                console.info(logTag + "connectServiceExtensionAbility success. got id: " + connection);
            } catch (err) {
                console.info(logTag + "connectServiceExtensionAbility failed. got id: " + err);
                let code = (err as BusinessError).code;
                let message = (err as BusinessError).message;
                console.error(logTag + ` ***** connectServiceExtensionAbility failed. err code is ${code}, message is ${message}`);
            }
        })
    }

    startDiscovering() {
        let discoverParam = {
            'discoverTargetType': 1
        };
        let filterOptions = {
            'availableStatus': 0
        };

        try {
            let dmInstance = deviceManager.createDeviceManager(bundleNameRpc);
            console.info(logTag + 'startDiscovering  get deviceManager is success');
            dmInstance.on('discoverSuccess', (data) => {
                console.info(logTag + "startDiscovering success: " + JSON.stringify(data));
                promptAction.showToast({
                    message: `discoverSuccess:  ${JSON.stringify(data.device.deviceName)}`,
                    duration: 1000
                })
                if (tempData == undefined) {
                    tempData = data;
                    console.info(logTag + "tempData is: " + JSON.stringify(tempData));
                }
            })
            dmInstance.on('discoverFailure', (data) => {
                console.info(logTag + "startDiscovering failed into discoverFailure: " + JSON.stringify(data));
            })
            //设备发现时 进入discoverSuccess回调
            dmInstance.startDiscovering(discoverParam, filterOptions);
        } catch (error) {
            console.error(logTag + "startDiscovering error errCode: " + error.code + "errMessage: " + error.message);
        }
    }

    stopDiscovering() {
        try {
            let dmInstance = deviceManager.createDeviceManager(bundleNameRpc);
            console.info(logTag + 'stopDiscovering  get deviceManager is success');
            dmInstance.stopDiscovering();
        } catch (error) {
            console.error(logTag + "stopDiscovering error errCode: " + error.code + "errMessage: " + error.message);
        }
    }

    //PIN码bind
    bindStub() {
        let deviceId = undefined;
        try {
            let dmInstance = deviceManager.createDeviceManager(bundleNameRpc);
            console.info(logTag + 'bindStub  get deviceManager is success');
            console.info(logTag + "tempData is: " + JSON.stringify(tempData));
            deviceId = tempData.device.deviceId;
            console.info(logTag + 'bindStub  get deviceId is: ' + deviceId);
            let bindParam = {
                'bindType': 1, //无账号PIN码bind
                'targetPkgName': bundleNameRpc, //远端应用包名
                'appName': bundleNameRpc,
            };
            dmInstance.bindTarget(deviceId, bindParam, (error, data) => {
                if (error) {
                    console.error(logTag + "bindTarget error errCode: " + error.code + "errMessage: " + error.message);
                }
                console.info(logTag + 'bindTarget  result is: ' + JSON.stringify(tempData));
            })
        } catch (error) {
            console.error(logTag + "bindStub error errCode: " + error.code + "errMessage: " + error.message);
        }
    }

    unbindStub() {
        try {
            let dmInstance = deviceManager.createDeviceManager(bundleNameRpc);
            console.info(logTag + 'unbindStub  get deviceManager is success');
            let deviceInfoList: Array<deviceManager.DeviceBasicInfo> = dmInstance.getAvailableDeviceListSync();
            console.info(logTag + 'unbindStub  deviceInfoList.length: ' + deviceInfoList.length);
            for (let i = 0; i < deviceInfoList.length; i++) {
                dmInstance.unbindTarget(deviceInfoList[i].deviceId);
            }
        } catch (error) {
            console.error(logTag + "unbindStub error errCode: " + error.code + "errMessage: " + error.message);
        }
    }
}
