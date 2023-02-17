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
