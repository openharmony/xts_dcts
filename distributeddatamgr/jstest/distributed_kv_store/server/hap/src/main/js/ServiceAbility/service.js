//require('../../../../../../../../../testtools/disjsTest/server/service.js')
import Stub from '../../../../../../../../../testtools/disjsTest/server/service.js'

export default {
    onStart() {
        console.log('RpcServer: onStart')
    },
    onStop() {
        console.log('RpcServer: onStop')
    },
    onCommand(want, startId) {
        console.log('RpcServer: onCommand, want: ' + JSON.stringify(want) + ', startId: ' + startId)
    },
    onConnect(want) {
        console.log('RpcServer: service onConnect called.')
        return new Stub("disjsAbility")
    },
    onDisconnect(want) {
        console.log('RpcServer: service onDisConnect called.')
    },
    onReconnect(want) {
        console.log('RpcServer: service onReConnect called.')
    }
}
