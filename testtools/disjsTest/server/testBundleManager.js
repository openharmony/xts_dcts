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

function sleep(ms) {
    var start = (new Date()).getTime();
    while ((new Date()).getTime() - start < ms) {
      continue;
    }
  }

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
            console.log(logTag+"_methodName  invoke success,result is "+resultNum);
            result._resultCode = true;
            result._result = resultNum;
            return result;
        }
        else if(this._methodName == "sub")
        {
            let test = new TestApi();
            let resultNum = test.sub(this._parameters[0], this._parameters[1]);
            console.log(logTag+"_methodName  invoke success,result is "+resultNum);
            result._resultCode = true;
            result._result = resultNum;
            return result;
        }
        else if(this._methodName == "startBackgroundRunning"){
            let test = new TestApi();
            test.startBackgroundRunning()
            console.info(logTag + "_methodName invoke success");
            result._resultCode = true;
            result._result = createResult
            return true
        }
        else if(this._methodName == "stopBackgroundRunning"){
            let test = new TestApi();
            test.stopBackgroundRunning()
            console.info(logTag + "_methodName invoke success");
            result._resultCode = true;
            result._result = createResult
            return true
        }
        else if(this._methodName == "createKvManager"){
            let test = new TestApi();
            let createResult = undefined;
            test.createKvManager()
            console.info(logTag + "_methodName invoke success " + createResult);
            result._resultCode = true;
            result._result = createResult
            return true
        }
        else if(this._methodName == "getKvStore"){
            let test = new TestApi();
            let getKvStoreResult = undefined;
            test.getKvStore(this._parameters[0],this._parameters[1],this._methodName[2]);
            console.info(logTag + "_methodName invoke success "  + getKvStoreResult);
            result._resultCode = true;
            result._result = getKvStoreResult;
            console.info(logTag + " Result is: " + result._result);;
            return true
        }
        else if(this._methodName == "closeKvStore"){
            let test = new TestApi();
            let colseKvStoreResult = undefined;
            test.closeKvStore(this._parameters[0]);
            console.info(logTag + "_methodName invoke success " + colseKvStoreResult);
            result._resultCode = true;
            result._result = colseKvStoreResult;
            console.info(logTag + " Result is: " + result._result);
            return true
        }
        else if(this._methodName == "deleteKvStore"){
            let test = new TestApi();
            let deleteKvStoreResult = undefined;
            test.closeKvStore(this._parameters[0]);
            console.info(logTag + "_methodName invoke success " + deleteKvStoreResult);
            result._resultCode = true;
            result._result = deleteKvStoreResult;
            console.info(logTag + " Result is: " + result._result);
            return true
        }
        else if(this._methodName == "kvPut"){
            let test = new TestApi();
            let putResult = undefined;
            test.kvPut(this._parameters[0], this._parameters[1],this._parameters[2]);
            console.info(logTag + "_methodName invoke success " + putResult);
            result._resultCode = true;
            result._result = putResult;
            console.info(logTag + " Result is: " + result._result);
            return true
        }

        else if(this._methodName == "kvGet"){
            let test = new TestApi();
            let getResult = undefined
            test.kvGet(this._parameters[0])
            console.info(logTag + " _methodName kvGet invoke success"  + getResult);
            result._resultCode = true;
            result._result = getResult
            console.info(logTag + " Result is: " + result._result)
            return result;
        }

        else if(this._methodName == "kvDelete"){
            let test = new TestApi();
            let deleteResult = undefined;
            test.kvDelete(this._parameters[0]);
            console.info(logTag + "_methodName invoke success " + deleteResult);
            result._resultCode = true;
            result._result = deleteResult;
            console.info(logTag + " Result is: " + result._result);
            return result;
        }

        else if(this._methodName == "kvSync"){
            let test = new TestApi();
            let syncResult = undefined;
            syncResult= test.kvSync(this._parameters[0],this._parameters[1]);
            console.info(logTag + "_methodName invoke success " + deleteResult);
            result._resultCode = true;
            result._result = syncResult;
            console.info(logTag + " Result is: " + result._result);
            return result;
        }

        else if(this._methodName == "getRdbStore"){
            let test = new TestApi();
            let getRdbStoreResult = test.kvGet(this._parameters[0]);
            console.info(logTag + "_methodName invoke success " + getRdbStoreResult);
            result._resultCode = true;
            result._result = getRdbStoreResult;
            console.info(logTag + " Result is: " + result._result);
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
