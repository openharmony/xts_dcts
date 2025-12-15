/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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
let logTag = 'RpcServer_ApiMessage:  ';
export default class ApiMessage  {
    _deviceName = null;
    _className = null;
    _methodName = null;
    _apiSession = null;
    _parameterTypes = null;
    _parameters = null;
    _apiResult = null;

    constructor(deviceName, className, methodName, apiSession, parameterTypes, parameters, apiResult) {
        this._deviceName = deviceName;
        this._className = className;
        this._methodName = methodName;
        this._apiSession = apiSession;
        this._parameterTypes = parameterTypes;
        this._parameters = parameters;
        this._apiResult = apiResult;

    }
    marshalling(messageSequence) {
        console.log(logTag + "into marshalling.");
        messageSequence.writeString(this._deviceName);
        messageSequence.writeString(this._className);
        messageSequence.writeString(this._methodName);
        messageSequence.writeString(this._apiSession);
        console.log(logTag + "writeString successfully.");
        messageSequence.writeStringArray(this._parameterTypes);
        messageSequence.writeStringArray(this._parameters);
        messageSequence.writeString(this._apiResult);
        console.log(logTag + "marshalling successfully.");
        return true;
    }

    unmarshalling(messageSequence) {
        console.log(logTag + "into unmarshalling.");
        this._deviceName = messageSequence.readString();
        this._className = messageSequence.readString();
        this._methodName = messageSequence.readString();
        this._apiSession = messageSequence.readString();
        this._parameterTypes = messageSequence.readStringArray();
        this._parameters = messageSequence.readStringArray();
        this._apiResult = messageSequence.readString();
        console.log(logTag + "unmarshalling successfully.");
        return true;
    }
}
