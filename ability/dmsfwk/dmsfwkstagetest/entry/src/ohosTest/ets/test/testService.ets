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
let tempData: deviceManager.DeviceBasicInfo | undefined;

interface DisData {
  device: deviceManager.DeviceBasicInfo
}

export default class TestService {

    onCreate() {
        console.info(logTag + 'AceApplication onCreate');
    }

    onDestroy() {
        console.info(logTag + 'AceApplication onDestroy');
    }

    constructor() {

    }

    getDeviceList(deviceManager: deviceManager.DeviceManager) {
        deviceList = deviceManager.getAvailableDeviceListSync();
        console.info(logTag + "getDeviceList success, deviceList id: " + JSON.stringify(deviceList));
    }

    startDiscovering() {
        let discoverParam: Record<string, Object> = {
            'discoverTargetType': 1
        };
        let filterOptions: Record<string, Object> = {
            'availableStatus': 0
        };

        try {
            let dmInstance = deviceManager.createDeviceManager(bundleNameRpc);
            console.info(logTag + 'startDiscovering  get deviceManager is success');
            dmInstance.on('discoverSuccess', (data: DisData) => {
                console.info(logTag + "startDiscovering success: " + JSON.stringify(data));
                promptAction.showToast({
                    message: `discoverSuccess:  ${JSON.stringify(data.device.deviceName)}`,
                    duration: 1000
                })
                if (data != undefined) {
                    tempData = data.device;
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
        let deviceId: string = '';
        try {
            let dmInstance = deviceManager.createDeviceManager(bundleNameRpc);
            console.info(logTag + 'bindStub  get deviceManager is success');
            console.info(logTag + "tempData is: " + JSON.stringify(tempData));
            if (tempData != undefined) {
                deviceId = tempData.deviceId;
            }
            console.info(logTag + 'bindStub  get deviceId is: ' + deviceId);
            let bindParam: Record<string, string | Object> = {
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
