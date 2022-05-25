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

import app from '@system.app'
import {describe, beforeAll, beforeEach, afterEach, afterAll, it, expect} from 'deccjsunit/index'
import apiMessage from '../../../../../../../../../../testtools/disjsTest/common/apiMessage.js'
import testService from '../../../../../../../../../../testtools/disjsTest/client/testService.js'
import remoteHelper from '../../../../../../../../../../testtools/disjsTest/client/remoteHelper.js'

var logTag = 'RpcClient'
var testservice = null
var gIRemoteObject = null;
var remoteHelpers = null;
describe('addTest', function () {

    beforeAll(async function (done) {
        console.info(logTag + 'beforeAll')
        testservice = new TestService();
        await testservice.toConnectAbility().then(data=>{
            gIRemoteObject = data;
            console.log(logTag + "toConnectAbility data is" + data);
	    remoteHelpers = new RemoteHelper(testservice,gIRemoteObject);
        })
        done();
    })

    it('add_test_001', 0, async function (done) {
        console.log(logTag + "test_add");
	await remoteHelpers.add(2,3).then(result=>{
	console.log(logTag + "test_add reult " + result);
        expect(result).assertEqual(5);
	})
	done();
    })
}) 
