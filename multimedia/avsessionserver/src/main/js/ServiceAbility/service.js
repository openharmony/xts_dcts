// @ts-nocheck
// @ts-nocheck
// @ts-nocheck

import rpc from "@ohos.rpc"
import avSession from '@ohos.multimedia.avsession';

export default {
    onStart() {
        console.info('AVSessionServer: onStart')
    },
    onStop() {
        console.info('AVSessionServer: onStop')
    },
    onCommand(want, startId) {
        console.info('AVSessionServer: onCommand, want: ' + JSON.stringify(want) + ', startId: ' + startId)
    },
    onConnect(want) {
        console.info('AVSessionServer: service onConnect called.')
        return new Stub("rpcTestAbility")
    },
    onDisconnect(want) {
        console.info('AVSessionServer: service onDisConnect called.')
    },
    onReconnect(want) {
        console.info('AVSessionServer: service onReConnect called.')
    }
}

const CODE_CAST_AUDIO = 1;
let descriptor;
let controller;

class Stub extends rpc.RemoteObject {
    constructor(descriptor) {
        super(descriptor);
    }

    async onRemoteMessageRequest(code, data, reply, option) {
        try {
            console.info(`AVSessionServer: onRemoteRequest: ${code}`);
            switch (code) {
                case CODE_CAST_AUDIO:
                {
                    console.info('AVSessionServer:case  CODE_CAST_AUDIO');
                    await avSession.getAllSessionDescriptors().then((descriptors) => {
                        console.info(descriptors.length);
                        console.info('AVSessionServer: Get descriptors Successfully');
                        if (descriptors.length === 0) {
                            console.info('AVSessionServer: Get descriptors : Fail');
                        }
                        descriptor = descriptors[0];
                    }).catch((err) => {
                        console.info(`AVSessionServer: ${err.message}`);
                        return false;
                    });

                    await avSession.createController(descriptor.sessionId).then((data) => {
                        console.info('AVSessionServer: Create controller Successfully');
                        controller = data;
                    }).catch((err) => {
                        console.info(`AVSessionServer: ${err.message}`);
                        return false;
                    });

                    await controller.getAVMetadata().then((data) => {
                        console.info(data.assetId);
                        console.info(data.artist);
                        console.info('AVSessionServer: Get Metadata');
                        if (data.assetId === '121278' && data.artist === 'Eminem') {
                            console.info(`AVSessionServer: Get Metadata is ${data}`);
                            let writeResult = reply.writeString('case 1 get successfully');
                            console.info(`AVSessionServer writeString result is ${writeResult}`);
                            return true;
                        }
                    }).catch((err) => {
                        console.info(`AVSessionServer: ${err.message}`);
                        return false;
                    });

                }
                default:
                    console.error(`AVSessionServer: default case code is ${code}`);
                    return super.onRemoteMessageRequest(code, data, reply, option);
            }
        } catch (error) {
            console.info(`AVSessionServer: onRemoteRequest: ${error.message}`);
        }
        return false;
    }
}