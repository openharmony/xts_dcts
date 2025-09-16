/*
 * Copyright (C) 2022 Huawei Device Co., Ltd.
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
import promptAction from '@ohos.promptAction';

var serverBundleName = "com.ohos.distributedscreenjstest";
var abilityName = "ServiceAbility";
var mainAbilityName = "MainAbility";
var deviceList;
let tempData = undefined;
let logTag = 'DmsClient';

export default class TestService {
    constructor() {
    }

    getDeviceList(deviceManager) {
        deviceList = deviceManager.getAvailableDeviceListSync();
        console.info("getDeviceList success, deviceList id: " + JSON.stringify(deviceList));
    }

    toConnectAbility() {
        console.info("DmsClient:  toConnectAbility");
        return new Promise(resolve => {
            let self = this;

            let dmInstance = deviceManager.createDeviceManager(serverBundleName);

            self.getDeviceList(dmInstance);
            console.info("DmsClient:  got deviceManager: " + dmInstance);
            let networkId = deviceList[0].networkId;
            console.info("DmsClient: deviceid : " + networkId);
            console.info("DmsClient: online deviceList id: " + JSON.stringify(deviceList));
            let want = {
                "bundleName": serverBundleName,
                "abilityName": abilityName,
                "deviceId": networkId,
                "flags": 256
            }
            let connect = {
                onConnect: function (elementName, remoteProxy) {
                    console.log('DmsClient: onConnect called, remoteProxy: ' + remoteProxy);
                    resolve(remoteProxy);
                },
                onDisconnect: function (elementName) {
                    console.log("DmsClient: onDisconnect");
                },
                onFailed: function () {
                    console.log("DmsClient: onFailed");
                }
            }
            let connectId = featureAbility.connectAbility(want, connect);
            console.info("DmsClient: connect ability got id: " + connectId);
        })
    }

    toStartAbility() {
        console.info("DmsClient:  toStartAbility");
        let self = this;
        let dmInstance = deviceManager.createDeviceManager(serverBundleName);
        self.getDeviceList(dmInstance);
        console.info("DmsClient:  got deviceManager: " + dmInstance);
        let networkId = deviceList[0].networkId;
        console.info("DmsClient: deviceid : " + networkId);
        console.info("DmsClient: online deviceList id: " + JSON.stringify(deviceList));
        try {
            let wantValue = {
                "bundleName": serverBundleName,
                "abilityName": mainAbilityName,
                "deviceId": networkId
            };
            featureAbility.startAbility({
                want: wantValue
            }).then((data) => {
                console.info("DmsClient startAbility  success. data=" + JSON.stringify(data));
            }).catch((err) => {
                console.info("DmsClient startAbility err: " + err.code + err.message);
            });
        } catch (error) {
            console.info("DmsClient startAbility:error = " + error);
        }
    }

    startDiscovering() {
        let discoverParam = {
            'discoverTargetType': 1
        };
        let filterOptions = {
            'availableStatus': 0
        };

        try {
            let dmInstance = deviceManager.createDeviceManager(serverBundleName);
            console.info('DmsClient startDiscovering  get deviceManager is success');
            dmInstance.on('discoverSuccess', (data) => {
                console.info("DmsClient startDiscovering success: " + JSON.stringify(data));
                promptAction.showToast({
                    message: `discoverSuccess:  ${JSON.stringify(data.device.deviceName)}`,
                    duration: 1000
                })
                if (tempData == undefined) {
                    tempData = data;
                    console.info("DmsClient tempData is: " + JSON.stringify(tempData));
                }
            })
            dmInstance.on('discoverFailure', (data) => {
                console.info("DmsClient startDiscovering failed into discoverFailure: " + JSON.stringify(data));
            })
            //设备发现时 进入discoverSuccess回调
            dmInstance.startDiscovering(discoverParam, filterOptions);
        } catch (error) {
            console.error("DmsClient startDiscovering error errCode: " + error.code + "errMessage: " + error.message);
        }
    }

    stopDiscovering() {
        try {
            let dmInstance = deviceManager.createDeviceManager(serverBundleName);
            console.info('DmsClient stopDiscovering  get deviceManager is success');
            dmInstance.stopDiscovering();
        } catch (error) {
            console.error("DmsClient stopDiscovering error errCode: " + error.code + "errMessage: " + error.message);
        }
    }

    //PIN码bind
    bindStub() {
        let deviceId = undefined;
        try {
            let dmInstance = deviceManager.createDeviceManager(serverBundleName);
            console.info(logTag + 'bindStub  get deviceManager is success');
            console.info(logTag + "tempData is: " + JSON.stringify(tempData));
            deviceId = tempData.device.deviceId;
            console.info(logTag + 'bindStub  get deviceId is: ' + deviceId);
            let bindParam = {
                'bindType': 1, //无账号PIN码bind
                'targetPkgName': serverBundleName, //远端应用包名
                'appName': serverBundleName,
            };
            dmInstance.bindTarget(deviceId, bindParam, (error, data) => {
                console.info(logTag + 'dmInstance.bindTarget is begin');
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
            let dmInstance = deviceManager.createDeviceManager(serverBundleName);
            console.info('RpcClient unbindStub  get deviceManager is success');
            let deviceInfoList = dmInstance.getAvailableDeviceListSync();
            console.info('RpcClient unbindStub  deviceInfoList.length: ' + deviceInfoList.length);
            for (let i = 0; i < deviceInfoList.length; i++) {
                dmInstance.unbindTarget(deviceInfoList[i].deviceId);
            }
        } catch (error) {
            console.error("RpcClient unbindStub error errCode: " + error.code + "errMessage: " + error.message);
        }
    }
}
