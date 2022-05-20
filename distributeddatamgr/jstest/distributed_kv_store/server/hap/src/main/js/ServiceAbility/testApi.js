
var logTag = "RpcServer";
export default class testApi{
    constructor(){

    }
    add(a,b) {
        console.log(logTag+"_methodName is add");
        return Number(a)+Number(b);
    }
    sub(a,b) {
        console.log(logTag+"_methodName is sub");
         return Number(a)-Number(b);
    }
}
