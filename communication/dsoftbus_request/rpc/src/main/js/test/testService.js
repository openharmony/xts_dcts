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

var bundleName = "com.acts.rpc.request.test.server";
var abilityName = "com.acts.rpc.request.test.server.ServiceAbility";
var deviceList;

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

            let dmInstance = deviceManager.createDeviceManager('ohos.rpc.test');

            self.getDeviceList(dmInstance);
                console.info("RpcClient:  got deviceManager: " + dmInstance)
                let networkId = deviceList[0].networkId
                console.info("RpcClient: deviceid : " + networkId)
                console.info("RpcClient: online deviceList id: " + JSON.stringify(deviceList))
                let want = {
                    "bundleName": bundleName,
                    "abilityName": abilityName,
                    "deviceId": networkId,
                    "flags": 256
                }
                let connect = {
                    onConnect: function (elementName, remoteProxy) {
                        console.log('RpcClient: onConnect called, remoteProxy: ' + remoteProxy);
                        resolve(remoteProxy)
                    },
                    onDisconnect: function (elementName) {
                        console.log("RpcClient: onDisconnect")
                    },
                    onFailed: function () {
                        console.log("RpcClient: onFailed")
                    }
                }
                let connectId = featureAbility.connectAbility(want, connect)
                console.info("RpcClient: connect ability got id: " + connectId)

            })
    }
}
