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

var bundleName = "com.acts.fileio.test.server";
var abilityName = "com.acts.fileio.test.server.ServiceAbility";
var deviceList;

export default class TestService {
    constructor() {

    }

    getDeviceList(dmInstance) {
        deviceList = dmInstance.getAvailableDeviceListSync();
        console.info("getDeviceList success, deviceList id: " + JSON.stringify(deviceList))
    }

    toConnectAbility() {
        console.info("fileioClient:  toConnectAbility")
        return new Promise(resolve=>{
            let self = this;
            let dmInstance = deviceManager.createDeviceManager('com.acts.fileio.test.server');
            self.getDeviceList(dmInstance);
            console.info("fileioClient:  got deviceManager: " + dmInstance)
            let networkId = deviceList[0].networkId
            console.info("fileioClient: deviceid : " + networkId)
            console.info("fileioClient: online deviceList id: " + JSON.stringify(deviceList))
            let want = {
                "bundleName": bundleName,
                "abilityName": abilityName,
                "deviceId": networkId,
                "flags": 256
            }
            let connect = {
                onConnect: function (elementName, remoteProxy) {
                    console.log('fileioClient: onConnect called, remoteProxy: ' + remoteProxy);
                    resolve(remoteProxy)
                },
                onDisconnect: function (elementName) {
                    console.log("fileioClient: onDisconnect")
                },
                onFailed: function () {
                    console.log("fileioClient: onFailed")
                }
            }
            let connectId = featureAbility.connectAbility(want, connect)
            console.info("fileioClient: connect ability got id: " + connectId)
        })
    }
}