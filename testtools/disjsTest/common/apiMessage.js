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
export default class ApiMessage {
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
    marshalling(messageParcel) {
        console.log(logTag + "into marshalling.");
        messageParcel.writeString(this._deviceName);
        messageParcel.writeString(this._className);
        messageParcel.writeString(this._methodName);
        messageParcel.writeString(this._apiSession);
        console.log(logTag + "writeString successfully.");
        messageParcel.writeStringArray(this._parameterTypes);
        messageParcel.writeStringArray(this._parameters);
        messageParcel.writeString(this._apiResult);
        console.log(logTag + "marshalling successfully.");
        return true;
    }

    unmarshalling(messageParcel) {
        console.log(logTag + "into unmarshalling.");
        this._deviceName = messageParcel.readString();
        this._className = messageParcel.readString();
        this._methodName = messageParcel.readString();
        this._apiSession = messageParcel.readString();
        this._parameterTypes = messageParcel.readStringArray();
        this._parameters = messageParcel.readStringArray();
        this._apiResult = messageParcel.readString();
        console.log(logTag + "unmarshalling successfully.");
        return true;
    }
}
