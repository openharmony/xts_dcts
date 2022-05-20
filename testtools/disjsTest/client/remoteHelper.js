import apiMessage from '../common/apiMessage.js'
import apiResult from '../common/apiResult.js'
import rpc from '@ohos.rpc'
var logTag = "RpcClient";
var CODE_INVOKE =1;
var results;
export default class remoteHelper{
    testservice = undefined
    gIRemoteObject = undefined
    constructor(testservice,gIRemoteObject){
        this.testservice = testservice
	this.gIRemoteObject = gIRemoteObject
    }
    
   async add(a,b) {
            console.log(logTag+"_methodName is add");
	    let message = new apiMessage("openHarmony","testApi","add"," ",["number","number"],[String(a),String(b)]," ");

            var messageParcel = rpc.MessageParcel.create();
            console.log(logTag + "create object successfully.");
            var messageParcelreply = rpc.MessageParcel.create();
            var option = new rpc.MessageOption();
            var writeResult = messageParcel.writeSequenceable(message);
	    await this.gIRemoteObject.sendRequest(CODE_INVOKE, messageParcel, messageParcelreply, option);
            console.log(logTag + "sendRequest got result");
            var ret = new apiMessage(null, null, null, null, null, null,null)
            var dataReply = messageParcelreply.readSequenceable(ret);
            console.log(logTag + "run readSequenceable success, result is" + dataReply);
            results = JSON.parse(ret._apiResult);

	    console.log(logTag + " read success, results is" + results._result);
	    return results._result;
    }
	 

    sub(a,b) {
        console.log(logTag+"_methodName is sub");
            let message = new apiMessage("openHarmony","testApi","sub"," ",["number","number"],[String(a),String(b)]," ");
            this.testservice.invoke(this.gIRemoteObject,message).then(apiresult=>{
                console.log(logTag + "end sendRequest" + apiresult._result);
                return apiresult._result;
            })
    }
}
