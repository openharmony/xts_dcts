import ServiceExtension from '@ohos.app.ability.ServiceExtensionAbility';
import rpc from '@ohos.rpc';
import commonEvent from '@ohos.commonEvent';
class StubTest extends rpc.RemoteObject {
    constructor(descriptor) {
        super(descriptor);
    }
    onRemoteRequest(code, data, reply, option) {
        console.info("onRemoteRequest: " + code)
        let tmp1 = data.readInt()
        let tmp2 = data.readInt()
        let tmp3 = tmp1 + tmp2;
        let result =  reply.writeInt(tmp3)
        console.info("The server's writeInt result is " + result);
        commonEvent.publish("DmsFwkService_RemoteObject", {
            parameters:{
                "msg":"receiveMessage = " + data.readInt()
            }
        }, (err, data) => {
            console.info("DmsFwkService_ConnectAbility onCreate");
        });
        return true
    }
}
export default class ServiceAbility extends ServiceExtension {
    onCreate(want) {
        // Called to return a FormBindingData object.
        console.info("DmsFwkStageServer ServiceAbility onCreate")
    }

    onConnect(want) {
        // Called when the form provider is notified that a temporary form is successfully
        // converted to a normal form.
        console.info("DmsFwkStageServer ServiceAbility onConnect")
        let CommonEventPublishData = {
            parameters: {
                "life": "onConnect"
            }
        }
        commonEvent.publish("DmsFwkService_ConnectAbility", CommonEventPublishData, (err) => {
            console.info("DmsFwkService_ConnectAbility onCreate");
        });
        return new StubTest("test");
    }

    onDisconnect(want) {
        // Called to notify the form provider to update a specified form.
        console.info("DmsFwkStageServer ServiceAbility onDisconnect")

    }

    onRequest(want, startId){
        console.info("DmsFwkStageServer ServiceAbility onRequest")

    }

    onDestroy() {
        // Called to notify the form provider that a specified form has been destroyed.
        console.info("DmsFwkStageServer ServiceAbility onCronDestroyeate")

    }
};