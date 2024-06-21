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
    marshalling(MessageSequence) {
        console.log(logTag + "into marshalling.");
        MessageSequence.writeString(this._deviceName);
        MessageSequence.writeString(this._className);
        MessageSequence.writeString(this._methodName);
        MessageSequence.writeString(this._apiSession);
        console.log(logTag + "writeString successfully.");
        MessageSequence.writeStringArray(this._parameterTypes);
        MessageSequence.writeStringArray(this._parameters);
        MessageSequence.writeString(this._apiResult);
        console.log(logTag + "marshalling successfully.");
        return true;
    }

    unmarshalling(MessageSequence) {
        console.log(logTag + "into unmarshalling.");
        this._deviceName = MessageSequence.readString();
        this._className = MessageSequence.readString();
        this._methodName = MessageSequence.readString();
        this._apiSession = MessageSequence.readString();
        this._parameterTypes = MessageSequence.readStringArray();
        this._parameters = MessageSequence.readStringArray();
        this._apiResult = MessageSequence.readString();
        console.log(logTag + "unmarshalling successfully.");
        return true;
    }
}
