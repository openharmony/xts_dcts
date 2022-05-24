// @ts-nocheck
import testApi from './testApi.js'
import apiResult from '../common/apiResult.js'

var logTag = "RpcServer";
export default class testBundleManager{
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

        let result = new apiResult();

        if(this._methodName == "add") {
            let test = new testApi();
            let resultNum = test.add(this._parameters[0], this._parameters[1]);
            console.log(logTag+"_methodName  invoke success,result is"+resultNum);
            result._resultCode = true;
            result._result = resultNum;
            return result;
        }
        else if(this._methodName == "sub")
        {
            let test = new testApi();
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
