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

import rpc from "@ohos.rpc";
import deviceManager from '@ohos.distributedDeviceManager';
import featureAbility from '@ohos.ability.featureAbility';
import promptAction from '@ohos.promptAction';

var results;
var bundleName = "com.acts.avsessionserver";
var abilityName = "com.acts.avsessionserver.ServiceAbility";
var deviceList;
var dmInstance;
let CODE_INVOKE = 1;
let tempData = undefined;
let logTag = "DctsAvsession"

export default class TestService {

    constructor() {

    }

    getDeviceList(dmInstance) {
        deviceList = dmInstance.getAvailableDeviceListSync();
        console.info("getDeviceList success, deviceList id: " + JSON.stringify(deviceList));
    }

    toConnectAbility() {
        console.info("avsessionClient: toConnectAbility")
        return new Promise(resolve=>{
            let self = this;
            dmInstance = deviceManager.createDeviceManager("com.acts.avsessionserver");
            if (dmInstance) {
                self.getDeviceList(dmInstance);
                console.info("avsessionClient:  got dmInstance: " + dmInstance)
                let networkId = deviceList[0].networkId
                console.info("avsessionClient: networkId : " + networkId)
                console.info("avsessionClient: online deviceList id: " + JSON.stringify(deviceList))
                let want = {
                    "bundleName": bundleName,
                    "abilityName": abilityName,
                    "deviceId": networkId,
                    "flags": 256
                }
                let connect = {
                    onConnect: function (elementName, remoteProxy) {
                        console.log('avsessionClient: onConnect called, remoteProxy: ' + remoteProxy);
                        resolve(remoteProxy)
                    },
                    onDisconnect: function (elementName) {
                        console.log("avsessionClient: onDisconnect")
                    },
                    onFailed: function () {
                        console.log("avsessionClient: onFailed")
                    }
                }
                let connectId = featureAbility.connectAbility(want, connect)
                console.info("connect ability got id: " + connectId)
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
        } catch(error) {
            console.error(logTag + "startDiscovering error errCode: " + error.code + "errMessage: " + error.message);
        }
    }

    stopDiscovering() {
        try {
            let dmInstance = deviceManager.createDeviceManager(bundleName);
            console.info(logTag + 'stopDiscovering  get deviceManager is success');
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
            console.info(logTag + 'unbindStub  get deviceManager is success');
            let deviceInfoList = dmInstance.getAvailableDeviceListSync();
            console.info(logTag + 'unbindStub  deviceInfoList.length: ' +  deviceInfoList.length);
            for (let i = 0 ; i < deviceInfoList.length; i++) {
                dmInstance.unbindTarget(deviceInfoList[i].deviceId);
            }
        } catch(error) {
            console.error(logTag + "unbindStub error errCode: " + error.code + "errMessage: " + error.message);
        }
    }
}
