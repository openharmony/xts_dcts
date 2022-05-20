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
        testservice = new testService();
        await testservice.toConnectAbility().then(data=>{
            gIRemoteObject = data;
            console.log(logTag + "toConnectAbility data is" + data);
	    remoteHelpers = new remoteHelper(testservice,gIRemoteObject);
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
