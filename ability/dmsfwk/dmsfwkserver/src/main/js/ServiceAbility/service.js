/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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

import rpc from "@ohos.rpc";

export default {
    onStart() {
        console.info('DmsServer: onStart')
    },
    onStop() {
        console.info('DmsServer: onStop')
    },
    onCommand(want, startId) {
        console.info('DmsServer: onCommand, want: ' + JSON.stringify(want) +', startId: ' + startId)
    },
    onConnect(want) {
        console.info('DmsServer: service onConnect called.')
        return new Stub("rpcTestAbility")
    },
    onDisconnect(want) {
        console.info('DmsServer: service onDisConnect called.')
    },
    onReconnect(want) {
        console.info('DmsServer: service onReConnect called.')
    }
}

class Stub extends rpc.RemoteObject {
    constructor(descriptor) {
        super(descriptor);
    }

    onRemoteRequest(code, data, reply, option) {
        try{
            console.info("onRemoteRequest: " + code)
            console.info("-----------------syhsyhsysh:" + code)
            switch(code) {
                case 1:
                    {
                        console.info("case 1 start")
                        let tmp1 = data.readInt()
                        console.info("The server's readInt result is " + tmp1);
                        let tmp2 = data.readInt()
                        console.info("The server's readInt result is " + tmp2);
                        let tmp3 = tmp1 + tmp2;
                        console.info("The server's tmp3 result is " + tmp3);
                        let result =  reply.writeInt(tmp3)
                        console.info("The server's writeInt result is " + result);
                        return true
                    }
                default:
                    console.error("default case " + code)
                    return super.onRemoteRequest(code, data, reply, option)
            }
        } catch (error) {
            console.info("onRemoteRequest: " + error);
        }
        return false
    }
}