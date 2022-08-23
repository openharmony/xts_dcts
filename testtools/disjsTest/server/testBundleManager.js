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
import TestApi from './testApi.js'
import ApiResult from '../common/apiResult.js'

var logTag = "RpcServer";
export default class TestBundleManager{
    _classname;
    _methodName;
    _parameterTypes;
    _parameters;

    constructor(){

    }
    invoke(testBundle) {
        this._classname = testBundle._className;
        this._methodName = testBundle._methodName;
        this._parameterTypes = testBundle._parameterTypes;
        this._parameters = testBundle._parameters;

        let result = new ApiResult();

        if(this._methodName == "add") {
            let test = new TestApi();
            let resultNum = test.add(this._parameters[0], this._parameters[1]);
            console.log(logTag+"_methodName  invoke success,result is"+resultNum);
            result._resultCode = true;
            result._result = resultNum;
            return result;
        }
        else if(this._methodName == "sub")
        {
            let test = new TestApi();
            let resultNum = test.sub(this._parameters[0], this._parameters[1]);
            console.log(logTag+"_methodName  invoke success,result is"+resultNum);
            result._resultCode = true;
            result._result = resultNum;
            return result;
        }
        else
        {
            console.log(logTag+"_methodName not support");
            result._resultCode = false;
            result._result = -1;
            return result;
        }
        return result;
    }
}
