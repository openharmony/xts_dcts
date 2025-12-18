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
import fs from '@ohos.file.fs';

let bundleName = "com.acts.fileio.test.server";
let abilityName = "com.acts.fileio.test.server.ServiceAbility";
let deviceList;
let dmInstance;
let logTag = "fileioClient:  ";

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
                let dmInstance = deviceManager.createDeviceManager(bundleName);
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
}