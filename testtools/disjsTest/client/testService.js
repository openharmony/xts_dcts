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

let logTag = "RpcClient_TestService:  ";
let CODE_INVOKE = 1;
import ApiMessage from '../common/apiMessage.js';
import ApiResult from '../common/apiResult.js';
import deviceManager from '@ohos.distributedHardware.deviceManager';
import featureAbility from '@ohos.ability.featureAbility';

let results;
let isConnected = false;
let bundleName = "com.ohos.distributekvdisjs";
let abilityName = "com.ohos.distributekvdisjs.ServiceAbility";
let deviceList;

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

    async invoke(gIRemoteObject,message) {
            var messageParcel = rpc.MessageParcel.create();
            console.log(logTag + "create object successfully.");
            var messageParcelreply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var writeResult = messageParcel.writeSequenceable(message);
        gIRemoteObject.sendRequest(CODE_INVOKE, messageParcel, messageParcelreply, option).then(function (result) {
            if (result.errCode === 0) {
                console.log(logTag + "sendRequest got result");
                var ret = new ApiMessage(null, null, null, null, null, null,null);
                var dataReply = result.reply.readSequenceable(ret);
                 console.log(logTag + "run readSequenceable success, result is" + dataReply);
                 results = JSON.parse(ret._apiResult);
                 console.log(logTag + " read success, results is" + results._result);
                 return results._result;
            } else {
                console.log(logTag + "sendRequest failed, errCode: " + errCode);
            }
        }).catch(function (e) {
            console.log(logTag + " sendRequest got exception: " + e.message);
        });
    }

    getDeviceList(deviceManager) {
        deviceList = deviceManager.getTrustedDeviceListSync();
        console.info(logTag + "getDeviceList success, deviceList id: " + JSON.stringify(deviceList));
    }

    toConnectAbility() {
        console.info(logTag + " toConnectAbility");
        return new Promise(resolve=>{
            let self = this;
            deviceManager.createDeviceManager('com.ohos.distributekvdisjs', (error, deviceManager) => {
                self.getDeviceList(deviceManager);
                console.info(logTag + "got deviceManager: " + deviceManager);
                let deviceId = deviceList[0].deviceId;
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
        })
    }

    toConnectRdbAbility() {
        console.info(logTag + " toConnectRdbAbility");
        return new Promise(resolve=>{
            let self = this;
            deviceManager.createDeviceManager('distributerdbdisjs', (error, deviceManager) => {
                self.getDeviceList(deviceManager);
                console.info(logTag + "got deviceManager: " + deviceManager);
                let deviceId = deviceList[0].deviceId;
                console.info(logTag + "deviceid : " + deviceId);
                console.info(logTag + "online deviceList id: " + JSON.stringify(deviceList));
                let want = {
                    "bundleName": "com.ohos.distributerdbdisjs",
                    "abilityName": "com.ohos.distributerdbdisjs.ServiceAbility",
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
        })
    }
}
