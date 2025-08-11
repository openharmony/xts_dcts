/*
 * Copyright (C) 2023 Huawei Device Co., Ltd.
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

var bundleName = "com.acts.rpc.request.test.server";
var abilityName = "com.acts.rpc.request.test.server.ServiceAbility";
var deviceList;
let tempData = undefined;

export default class TestService {
    constructor() {

    }

    getDeviceList(deviceManager) {

        deviceList = deviceManager.getAvailableDeviceListSync();
        console.info("getDeviceList success, deviceList id: " + JSON.stringify(deviceList))
    }

    toConnectAbility() {
        console.info("RpcClient:  toConnectAbility")
        return new Promise(resolve=>{
            let self = this;

            let dmInstance = deviceManager.createDeviceManager(bundleName);

            self.getDeviceList(dmInstance);
                console.info("RpcClient:  got deviceManager: " + dmInstance);
                let networkId = deviceList[0].networkId;
                console.info("RpcClient: deviceid : " + networkId);
                console.info("RpcClient: online deviceList id: " + JSON.stringify(deviceList));
                let want = {
                    "bundleName": bundleName,
                    "abilityName": abilityName,
                    "deviceId": networkId,
                    "flags": 256
                };
                let connect = {
                    onConnect: function (elementName, remoteProxy) {
                        console.log('RpcClient: onConnect called, remoteProxy: ' + remoteProxy);
                        resolve(remoteProxy);
                    },
                    onDisconnect: function (elementName) {
                        console.log("RpcClient: onDisconnect");
                    },
                    onFailed: function () {
                        console.log("RpcClient: onFailed");
                    }
                }
                let connectId = featureAbility.connectAbility(want, connect);
                console.info("RpcClient: connect ability got id: " + connectId);
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
           console.info('RpcClient startDiscovering  get deviceManager is success');
           dmInstance.on('discoverSuccess', (data) => {
             console.info("RpcClient startDiscovering success: " + JSON.stringify(data));
             promptAction.showToast({
                message: `discoverSuccess:  ${JSON.stringify(data.device.deviceName)}`,
                duration: 1000
             })
            if (tempData == undefined) {
                tempData = data;
                console.info("RpcClient tempData is: " + JSON.stringify(tempData));
            }
           })
           dmInstance.on('discoverFailure', (data) => {
            console.info("RpcClient startDiscovering failed into discoverFailure: " + JSON.stringify(data));
           })
           //设备发现时 进入discoverSuccess回调
           dmInstance.startDiscovering(discoverParam, filterOptions);
        } catch(error) {
            console.error("RpcClient startDiscovering error errCode: " + error.code + "errMessage: " + error.message);
        }
    }

    stopDiscovering() {
        try {
            let dmInstance = deviceManager.createDeviceManager(bundleName);
            console.info('RpcClient stopDiscovering  get deviceManager is success');
            dmInstance.stopDiscovering();
        } catch(error) {
            console.error("RpcClient stopDiscovering error errCode: " + error.code + "errMessage: " + error.message);
        }
    }

    //PIN码bind
    bindStub() {
        let deviceId = undefined;
        try {
            let dmInstance = deviceManager.createDeviceManager(bundleName);
            console.info('RpcClient bindStub  get deviceManager is success');
            console.info("RpcClient tempData is: " + JSON.stringify(tempData));
            deviceId = tempData.device.deviceId;
            console.info('RpcClient bindStub  get deviceId is: ' + deviceId);
            let bindParam = {
                'bindType': 1, //无账号PIN码bind
                'targetPkgName': bundleName, //远端应用包名
                'appName': bundleName,
            };
            dmInstance.bindTarget(deviceId, bindParam, (err, data) => {
                if (err) {
                   console.error("RpcClient bindTarget error errCode: " + error.code + "errMessage: " + error.message);
                   return;
                }
                console.info('RpcClient bindTarget  result is: ' + JSON.stringify(tempData));
            })
        } catch(error) {
            console.error("RpcClient bindStub error errCode: " + error.code + "errMessage: " + error.message);
        }
    }

    unbindStub() {
        try {
            let dmInstance = deviceManager.createDeviceManager(bundleName);
            console.info('RpcClient unbindStub  get deviceManager is success');
            let deviceInfoList = dmInstance.getAvailableDeviceListSync();
            console.info('RpcClient unbindStub  deviceInfoList.length: ' +  deviceInfoList.length);
            for (let i = 0 ; i < deviceInfoList.length; i++) {
                dmInstance.unbindTarget(deviceInfoList[i].deviceId);
            }
        } catch(error) {
            console.error("RpcClient unbindStub error errCode: " + error.code + "errMessage: " + error.message);
        }
    }
}
