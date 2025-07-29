/*
 * Copyright (C) 2022-2023 Huawei Device Co., Ltd.
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
import process from '@ohos.process';

import ApiMessage from '../common/apiMessage.js';
import ApiResult from '../common/apiResult.js';
import deviceManager from '@ohos.distributedDeviceManager';
import featureAbility from '@ohos.ability.featureAbility';
import promptAction from '@ohos.promptAction';

let logTag = "RpcClient_TestService:  ";
let CODE_INVOKE = 1;

let results;
let isConnected = false;
let bundleName = "com.acts.distributekvdisjs";
let abilityName = "com.acts.distributekvdisjs.ServiceAbility";
let bundleNameObject = "com.acts.distributeobjectdisjs";
let abilityNameObject = "com.acts.distributeobjectdisjs.ServiceAbility";

let deviceList;
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
        console.info(logTag + " toConnectAbility");
        return new Promise(resolve=>{
            let self = this;
            let dmInstance = deviceManager.createDeviceManager('com.acts.distributekvdisjs');
            self.getDeviceList(dmInstance);
            console.info("got deviceManager: " + dmInstance)
            let deviceId = deviceList[0].networkId;
            console.info(logTag + "deviceid : " + deviceId);
            console.info(logTag + "online deviceList id: " + JSON.stringify(deviceList));
            let want = {
                "bundleName": bundleName,
                "abilityName": abilityName,
                "deviceId": deviceId,
                "flags": 256
            }
            let connect = {
                onConnect: function (elementName, remoteProxy) {
                    console.log(logTag + 'onConnect called, remoteProxy: ' + remoteProxy);
                    resolve(remoteProxy);
                },
                onDisconnect: function (elementName) {
                    console.log(logTag + "onDisconnect");
                },
                onFailed: function () {
                    console.log(logTag + "onFailed");
                }
            }
            let connectId = featureAbility.connectAbility(want, connect);
            console.info(logTag + "connect ability got id: " + connectId);

        })
    }

    toConnectRdbAbility() {
        console.info(logTag + " toConnectRdbAbility");
        return new Promise(resolve=>{
            let self = this;
            let dmInstance = deviceManager.createDeviceManager('com.acts.distributerdbdisjs');
            self.getDeviceList(dmInstance);
            console.info(logTag + "got deviceManager: " + dmInstance);
            let deviceId = deviceList[0].networkId;
            console.info(logTag + "deviceid : " + deviceId);
            console.info(logTag + "online deviceList id: " + JSON.stringify(deviceList));
            let want = {
                "bundleName": "com.acts.distributerdbdisjs",
                "abilityName": "com.acts.distributerdbdisjs.ServiceAbility",
                "deviceId": deviceId,
                "flags": 256
            }
            let connect = {
                onConnect: function (elementName, remoteProxy) {
                    console.log(logTag + 'onConnect called, remoteProxy: ' + remoteProxy);
                    resolve(remoteProxy);
                },
                onDisconnect: function (elementName) {
                    console.log(logTag + "onDisconnect");
                },
                onFailed: function () {
                    console.log(logTag + "onFailed");
                }
            }
            let connectId = featureAbility.connectAbility(want, connect);
            console.info(logTag + "connect ability got id: " + connectId);
        })
    }

    toConnectObjectAbility() {
        console.info(logTag + " toConnectObjectAbility");
        return new Promise(resolve=>{
            let self = this;
            let dmInstance = deviceManager.createDeviceManager('com.acts.distributeobjectdisjs');
            self.getDeviceList(dmInstance);
            console.info(logTag + "got deviceManager: " + dmInstance);
            let deviceId = deviceList[0].networkId;
            console.info(logTag + "deviceid : " + deviceId);
            console.info(logTag + "online deviceList id: " + JSON.stringify(deviceList));
            let want = {
                "bundleName": bundleNameObject,
                "abilityName": abilityNameObject,
                "deviceId": deviceId,
                "flags": 256
            }
            let connect = {
                onConnect: function (elementName, remoteProxy) {
                    console.log(logTag + 'onConnect called, remoteProxy: ' + remoteProxy);
                    resolve(remoteProxy);
                },
                onDisconnect: function (elementName) {
                    console.log(logTag + "onDisconnect");
                },
                onFailed: function () {
                    console.log(logTag + "onFailed");
                }
            }
            let connectId = featureAbility.connectAbility(want, connect);
            console.info(logTag + "connect ability got id: " + connectId);
        })
    }

    startDiscovering(bundleName) {
        let discoverParam = {
           'discoverTargetType': 1 
        };
        let filterOptions = {
            'availableStatus': 0
        };

        try {
           let dmInstance = deviceManager.createDeviceManager(bundleName);
           console.info(logTag + 'startDiscovering  get deviceManager is success');
           dmInstance.on('discoverSuccess', (data) => {
             console.info(logTag + "startDiscovering success: " + JSON.stringify(data));
             promptAction.showToast({
                message: `discoverSuccess:  ${JSON.stringify(data.device.deviceName)}`,
                duration: 1000
             })
            if (tempData === undefined) {
                tempData = data;
                console.info(logTag + "tempData is: " + JSON.stringify(tempData));
            }
           });
           dmInstance.on('discoverFailure', (data) => {
            console.info(logTag + 'startDiscovering failed into discoverFailure: ' + JSON.stringify(data));
           });
           //设备发现时 进入discoverSuccess回调
           dmInstance.startDiscovering(discoverParam, filterOptions);
        } catch (error) {
            console.error(logTag + 'startDiscovering error errCode: ' + error.code + 'errMessage: ' + error.message);
        }
    }

    stopDiscovering(bundleName) {
        try {
            let dmInstance = deviceManager.createDeviceManager(bundleName);
            console.info(logTag + 'stopDiscovering  get deviceManager is success');
            dmInstance.stopDiscovering();
        } catch (error) {
            console.error(logTag + 'stopDiscovering error errCode: ' + error.code + 'errMessage: ' + error.message);
        }
    }

    //PIN码bind
    bindStub(bundleName) {
        let deviceId = undefined;
        try {
            let dmInstance = deviceManager.createDeviceManager(bundleName);
            console.info(logTag + 'bindStub  get deviceManager is success');
            console.info(logTag + "tempData is: " + JSON.stringify(tempData));
            deviceId = tempData.device.deviceId;
            console.info(logTag + 'bindStub  get deviceId is: ' + deviceId);
            let bindParam = {
                'bindType': 1, //无账号PIN码bind
                'targetPkgName': bundleName, //远端应用包名
                'appName': bundleName,
            };
            dmInstance.bindTarget(deviceId, bindParam, (err, data) => {
                if (err) {
                   console.error(logTag + 'bindTarget error errCode: ' + error.code + 'errMessage: ' + error.message);
                   return;
                }
                console.info(logTag + 'bindTarget  result is: ' + JSON.stringify(tempData));
            });
        } catch (error) {
            console.error(logTag + 'bindStub error errCode: ' + error.code + 'errMessage: ' + error.message);
        }
    }

    unbindStub(bundleName) {
        try {
            let dmInstance = deviceManager.createDeviceManager(bundleName);
            console.info(logTag + 'unbindStub  get deviceManager is success');
            let deviceInfoList = dmInstance.getAvailableDeviceListSync();
            console.info(logTag + 'unbindStub  deviceInfoList.length: ' + deviceInfoList.length);
            for (let i = 0; i < deviceInfoList.length; i++) {
                dmInstance.unbindTarget(deviceInfoList[i].deviceId);
            }
        } catch (error) {
            console.error(logTag + 'unbindStub error errCode: ' + error.code + 'errMessage: ' + error.message);
        }
    }

}
