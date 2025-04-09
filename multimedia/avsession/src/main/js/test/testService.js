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

var results;
var bundleName = "com.acts.avsessionserver";
var abilityName = "com.acts.avsessionserver.ServiceAbility";
var deviceList;
var dmInstance;

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
            dmInstance = deviceManager.createDeviceManager('com.acts.avsession.test');
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
}
