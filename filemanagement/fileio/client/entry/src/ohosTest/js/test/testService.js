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

import deviceManager from '@ohos.distributedDeviceManager';
import featureAbility from '@ohos.ability.featureAbility';
import fs from '@ohos.file.fs';
import promptAction from '@ohos.promptAction';

let bundleName = "com.acts.fileio.test.server";
let abilityName = "com.acts.fileio.test.server.ServiceAbility";
let deviceList;
let dmInstance;
let logTag = "fileioClient:  ";
let tempData = undefined;

export default class TestService {
    constructor() {

    }

    getDeviceList(dmInstance) {
        deviceList = dmInstance.getAvailableDeviceListSync();
        console.info(logTag + "getDeviceList success, deviceList id: " + JSON.stringify(deviceList))
    }

    toConnectAbility() {
        console.info(logTag + "toConnectAbility");
        return new Promise(resolve=>{
            let self = this;
            try {
                dmInstance = deviceManager.createDeviceManager(bundleName);
                console.info(logTag + "got deviceManager: " + dmInstance);
                deviceList = dmInstance.getAvailableDeviceListSync();
                let networkId = deviceList[0].networkId
                console.info(logTag + "deviceid : " + networkId)
                console.info(logTag + "online deviceList id: " + JSON.stringify(deviceList));

                let listeners = {
                    onStatus(networkId, status) {
                        console.info('onStatus' + status + networkId);
                    }
                };
                fs.connectDfs(networkId, listeners).then(() => {
                    console.info(logTag + "Success to connectDfs");
                }).catch((err) => {
                    console.error(logTag + `Failed to connectDfs. Code: ${err.code}, message: ${err.message}`);
                });

                let want = {
                    "bundleName": bundleName,
                    "abilityName": abilityName,
                    "deviceId": networkId,
                    "flags": 256
                }
                let connect = {
                    onConnect: function (elementName, remoteProxy) {
                        console.info(logTag + 'onConnect called, remoteProxy: ' + remoteProxy);
                        resolve(remoteProxy)
                    },
                    onDisconnect: function (elementName) {
                        console.info(logTag + "onDisconnect")
                    },
                    onFailed: function () {
                        console.info(logTag + "onFailed")
                    }
                }
                let connectId = featureAbility.connectAbility(want, connect)
                console.info(logTag + "connect ability got id: " + connectId)
            } catch (error) {
                console.info(logTag + "failed" + JSON.stringify(error));
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
           let dmInstance = deviceManager.createDeviceManager(bundleName);
           console.info(logTag + 'RpcClient startDiscovering  get deviceManager is success');
           dmInstance.on('discoverSuccess', (data) => {
             console.info(logTag + "RpcClient startDiscovering success: " + JSON.stringify(data));
             promptAction.showToast({
                message: `discoverSuccess:  ${JSON.stringify(data.device.deviceName)}`,
                duration: 1000
             })
            if (tempData == undefined) {
                tempData = data;
                console.info(logTag + "RpcClient tempData is: " + JSON.stringify(tempData));
            }
           })
           dmInstance.on('discoverFailure', (data) => {
            console.info(logTag + "startDiscovering failed into discoverFailure: " + JSON.stringify(data));
           })
           //设备发现时 进入discoverSuccess回调
           dmInstance.startDiscovering(discoverParam, filterOptions);
        } catch(error) {
            console.error(logTag + "startDiscovering error errCode: " + error.code + "errMessage: " + error.message);
        }
    }

    stopDiscovering() {
        try {
            let dmInstance = deviceManager.createDeviceManager(bundleName);
            console.info(logTag + 'RpcClient stopDiscovering  get deviceManager is success');
            dmInstance.stopDiscovering();
        } catch(error) {
            console.error(logTag + "stopDiscovering error errCode: " + error.code + "errMessage: " + error.message);
        }
    }

    //PIN码bind
    bindStub() {
        let deviceId = undefined;
        try {
            let dmInstance = deviceManager.createDeviceManager(bundleName);
            console.info(logTag + 'RpcClient bindStub  get deviceManager is success');
            console.info(logTag + "RpcClient tempData is: " + JSON.stringify(tempData));
            deviceId = tempData.device.deviceId;
            console.info(logTag + 'RpcClient bindStub  get deviceId is: ' + deviceId);
            let bindParam = {
                'bindType': 1, //无账号PIN码bind
                'targetPkgName': bundleName, //远端应用包名
                'appName': bundleName,
            };
            dmInstance.bindTarget(deviceId, bindParam, (err, data) => {
                if (err) {
                   console.error(logTag + "bindTarget error errCode: " + err.code + "errMessage: " + err.message);
                   return;
                }
                console.info(logTag + 'bindTarget  result is: ' + JSON.stringify(tempData));
            })
        } catch(error) {
            console.error(logTag + "bindStub error errCode: " + error.code + "errMessage: " + error.message);
        }
    }

    unbindStub() {
        try {
            let dmInstance = deviceManager.createDeviceManager(bundleName);
            console.info(logTag + 'RpcClient unbindStub  get deviceManager is success');
            let deviceInfoList = dmInstance.getAvailableDeviceListSync();
            console.info(logTag + 'RpcClient unbindStub  deviceInfoList.length: ' +  deviceInfoList.length);
            for (let i = 0 ; i < deviceInfoList.length; i++) {
                dmInstance.unbindTarget(deviceInfoList[i].deviceId);
            }
        } catch(error) {
            console.error(logTag + "unbindStub error errCode: " + error.code + "errMessage: " + error.message);
        }
    }
}