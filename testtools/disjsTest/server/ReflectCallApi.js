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

//@ts-nocheck
import testApi from './testApi.js';

var logTag = "RpcServer_Call:  ";

export default class ReflectCallApi {
  getModuleObj() {
    console.log(logTag + 'getModuleObj ' );
    return require("./testApi.js");
  }

  call(request) {
    console.log(logTag + 'call begin   ' );
    let rtn = String(-1);

    console.info(logTag + '  _methodName: [%s].', request._methodName);
    console.info(logTag + '  _parameters: [%s].', request._parameters);

    if( typeof request._methodName !== 'undefined' ) {
      try {
        const obj = this.getModuleObj();
        const myObj = obj.default.prototype;
        const funcList = Reflect.ownKeys(myObj).toString();
        console.info(logTag + 'funcList: [%s].', funcList);
        if(funcList.indexOf(request._methodName) === -1) {
          console.info(logTag + ' ERROR: function: [%s] does not exist.', request._methodName);
          return -1;
        }
        rtn = myObj[request._methodName].apply(null, request._parameters);
        console.info(logTag + ' reflect call %s, return: %s.', request._methodName, rtn);
      } catch (error) {
        console.log(logTag + 'ERROR: catch error= ' + error);
        return -1;
      }
    }else {
      console.log(logTag + 'ERROR: request._methodName = undefined ');
      return -1;
    }
    console.log(logTag + 'call end   ' );
    return 1;
  }


}