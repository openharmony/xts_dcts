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
import deviceManager from '@ohos.distributedHardware.deviceManager';
import featureAbility from '@ohos.ability.featureAbility';


var results;
var bundleName = "com.ohos.rpctest";
var abilityName = "com.ohos.rpctest.ServiceAbility";
var deviceList;

export default class TestService {
    constructor() {

    }

    getDeviceList(deviceManager) {
        deviceList = deviceManager.getTrustedDeviceListSync();
        console.info("getDeviceList success, deviceList id: " + JSON.stringify(deviceList))
    }

    toConnectAbility() {
        console.info("RpcClient:  toConnectAbility")
        return new Promise(resolve=>{
            let self = this;
            deviceManager.createDeviceManager('ohos.rpc.test', (error, deviceManager) => {
                self.getDeviceList(deviceManager);
                console.info("RpcClient:  got deviceManager: " + deviceManager)
                let deviceId = deviceList[0].deviceId
                console.info("RpcClient: deviceid : " + deviceId)
                console.info("RpcClient: online deviceList id: " + JSON.stringify(deviceList))
                let want = {
                    "bundleName": bundleName,
                    "abilityName": abilityName,
                    "deviceId": deviceId,
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
        })

    }
}
