/*
 * Copyright (C) 2024 Huawei Device Co., Ltd.
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
import ApiMessage from '../common/apiMessage.ets';
import ApiResult from '../common/apiResult.ets';
import deviceManager from '@ohos.distributedDeviceManager';
import common from '@ohos.app.ability.common';
import { BusinessError } from '@ohos.base';

let results;
let isConnected = false;
let bundleNameKv = "com.acts.distributekvdisets";
let abilityNameKv = "com.acts.distributekvdisets.ServiceAbility";

let deviceList: Array<deviceManager.DeviceBasicInfo>;
let dmInstance : deviceManager.DeviceManager;
let deviceId : string;

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
        console.info(logTag + " -----toConnectAbility-----");
        return new Promise(resolve=>{
            let self = this;
            console.info(logTag + '-----getDeviceId is begin-----')
            try {
                dmInstance = deviceManager.createDeviceManager(bundleNameKv);
                console.info(logTag + 'get deviceManager is success')
            } catch (error) {
                console.info(logTag + 'get deviceManager is failed' + JSON.stringify(error))
            }
            deviceList = dmInstance.getAvailableDeviceListSync();
            deviceId = deviceList[0].networkId;
            console.info(logTag + "deviceid : " + deviceId);

            console.info(logTag + '-----connectServiceExtensionAbility is begin-----');
            let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext

            let want = {
                deviceId: deviceId,
                bundleName: bundleNameKv,
                abilityName: abilityNameKv
            };
            let connect = {
                onConnect: function (elementName, remoteProxy) {
                    console.log(logTag + ' ***** onConnect called, remoteProxy: ' + remoteProxy);
                    resolve(remoteProxy);
                },
                onDisconnect: function (elementName) {
                    console.log(logTag + " ***** onDisconnect...");
                },
                onFailed: function () {
                    console.log(logTag + " ***** onFailed...");
                }
            }
            let connection: number;
            try {
              connection = context.connectServiceExtensionAbility(want, connect);
              console.info(logTag + " ***** connectServiceExtensionAbility success. got id: " + connection);
            } catch (err) {
              console.info(logTag + "  ***** connectServiceExtensionAbility failed. got id: " + connection);
              let code = (err as BusinessError).code;
              let message = (err as BusinessError).message;
              console.error(logTag + ` ***** connectServiceExtensionAbility failed. err code is ${code}, message is ${message}`);
            }
        })
    }

}
