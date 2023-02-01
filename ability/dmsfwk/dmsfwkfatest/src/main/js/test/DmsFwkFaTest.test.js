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

import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from '@ohos/hypium'
import rpc from "@ohos.rpc";
import deviceManager from '@ohos.distributedHardware.deviceManager';
import featureAbility from "@ohos.ability.featureAbility";

let connectId = null;
let dvList = [];
let dvId = null;
let TAG;
export default function DmsFwkFaTest() {
describe('DmsFwkFaTest', function () {
    beforeAll(async function(done) {
        console.info('beforeAll called dms')
        function deviceManagerCallback(error, deviceManagers) {
            console.info("got deviceManager: " + deviceManagers + ", error: " + error)
            let deviceList = deviceManagers.getTrustedDeviceListSync()
            let deviceId = deviceList[0].deviceId
            dvList = deviceList;
            dvId = deviceId;
            console.info("online device id: " + deviceId)
            done()
        }
        deviceManager.createDeviceManager('com.acts.example.dmsfwkstageserver', deviceManagerCallback)
        console.info("beforeAll done")
    })
    beforeEach(async function (done){
        console.info(('beforeEach called'))
        done()
    })
    afterEach(async function (done){
        console.info('afterEach called')
        setTimeout(done, 4000)
    })
    afterAll(async function (done){
        console.info('afterAll called')
        done()
    })
    
    /*
     * @tc.number  SUB_DMS_ConnectAbility_0210
     * @tc.name    Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0210", 0, async function (done) {
        console.info("---------------SUB_DMS_ConnectAbility_0210 is start---------------")
        TAG = "SUB_DMS_ConnectAbility_0210";
        try{
          featureAbility.connectAbility({
            deviceId:dvId,
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "ServiceAbility2"
          }, {
            onConnect: (elementName, proxy)=>{
              expect().assertFail();
              done();
            },
            onDisConnect: (elementName)=>{
              console.info('SUB_DMS_ConnectAbility_0210  onDisConnect: ' + JSON.stringify(elementName));
              expect().assertFail();
              done();
            },
            onFailed: (code)=>{
              console.info('SUB_DMS_ConnectAbility_0210  onFailed: ' + code);
              expect(code).assertEqual(0)
              done();
            }
          });
        }catch(err){
          console.info('SUB_DMS_ConnectAbility_0210 catch: ' + err.code);
          console.info('SUB_DMS_ConnectAbility_0210 catch: ' + err.message);
          done();
        }
    });

   /*
     * @tc.number  SUB_DMS_ConnectAbility_0230
     * @tc.name    Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
   it("SUB_DMS_ConnectAbility_0230", 0, async function (done) {
    console.info("---------------SUB_DMS_ConnectAbility_0230 is start---------------")
    TAG = "SUB_DMS_ConnectAbility_0230";
    featureAbility.startAbility({
      "want":{
        deviceId:dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }
    }).then((data)=>{
      console.info('SUB_DMS_ConnectAbility_0230 data: ' +JSON.stringify(data));
      expect(data).assertEqual(0)
      done()
    })
  });
    /*
    * @tc.number  SUB_DMS_ConnectAbility_0240
    * @tc.name    Filed connect remote invisible service without permission.
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_ConnectAbility_0240", 0, async function (done) {
    console.info("---------------SUB_DMS_ConnectAbility_0240 is start---------------")
    TAG = "SUB_DMS_ConnectAbility_0240";
    try{
      featureAbility.startAbility({
        "want":{
          deviceId:dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility2",
          parameters:{
            "startReason": "terminateSelf"
          }
        }
      }).then((data)=>{
        console.info('SUB_DMS_ConnectAbility_0230 data: ' +JSON.stringify(data));
        expect(data).assertEqual(0)
        done()
      }).catch((err)=>{
        console.info('SUB_DMS_ConnectAbility_0240 err: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0240 err: ' + err.message);
        expect().assertFail();
        done();
      })
    }catch(err){
      console.info('SUB_DMS_ConnectAbility_0240 catch: ' + err.code);
      console.info('SUB_DMS_ConnectAbility_0240 catch: ' + err.message);
      expect().assertFail();
      done();
    }
  });
  
  /*
   * @tc.number  SUB_DMS_ConnectAbility_0260
   * @tc.name    Filed connect remote invisible service without permission.
   * @tc.desc    Function test
   * @tc.level   0
   */
  it("SUB_DMS_ConnectAbility_0260", 0, async function (done) {
    console.info("---------------SUB_DMS_ConnectAbility_0260 is start---------------")
    TAG = "SUB_DMS_ConnectAbility_0260";
    try{
      featureAbility.startAbility({
        "want":{
          deviceId:"12423748651348643464315313463431",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility2"
        }
      }, (err)=>{
        console.info('SUB_DMS_ConnectAbility_0260 err: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0260 err: ' + err.message);
        expect(err.code).assertEqual(9)
        expect(err.message).assertEqual("StartAbility Failed")
        done()
      });
    }catch(err){
      console.info('SUB_DMS_ConnectAbility_0260 catch: ' + err.code);
      console.info('SUB_DMS_ConnectAbility_0260 catch: ' + err.message);
      expect().assertFail();
      done();
    }
  });

     /*
     * @tc.number  SUB_DMS_ConnectAbility_0270
     * @tc.name    Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
     it("SUB_DMS_ConnectAbility_0270", 0, async function (done) {
      console.info("---------------SUB_DMS_ConnectAbility_0270 is start---------------")
      TAG = "SUB_DMS_ConnectAbility_0270";
      try{
        featureAbility.startAbility({
          "want":{
            deviceId:dvId,
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "MainAbility3",
            parameters:{
              "startReason": "terminateSelf"
            }
          }
        }, (err)=>{
          console.info('SUB_DMS_ConnectAbility_0270 err: ' + err.code);
          console.info('SUB_DMS_ConnectAbility_0270 err: ' + err.message);
          expect(err.code).assertEqual(1)
          expect(err.message).assertEqual("StartAbility Failed")
          done()
        });
      }catch(err){
        console.info('SUB_DMS_ConnectAbility_0270 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0270 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });
    
    /*
     * @tc.number  SUB_DMS_ConnectAbility_0220
     * @tc.name    Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0220", 0, async function (done) {
      console.info("---------------SUB_DMS_ConnectAbility_0220 is start---------------")
      TAG = "SUB_DMS_ConnectAbility_0220";
      let connectId;
      try{
        connectId = featureAbility.connectAbility({
          deviceId:dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy)=>{
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
                console.log('sendRequest success');
                let msg = result.reply.readInt();
                console.info(' onConnectRemoteService001 msg: ' + msg)
                expect(msg == 100).assertTrue();
            }).catch((e) => {
                console.log('sendRequest error:' + e);
                expect().assertFail();
                done();
            });
          },
          onDisConnect: (elementName)=>{
            console.info('SUB_DMS_ConnectAbility_0220  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code)=>{
            console.info('SUB_DMS_ConnectAbility_0220  onFailed: ' + code);
            done();
          }
        });
      }catch(err){
        console.info('SUB_DMS_ConnectAbility_0220 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0220 catch: ' + err.message);
        expect(err.code).assertEqual(0);
        done();
      }
      setTimeout(() => {
        featureAbility.disconnectAbility(connectId, (err, data)=>{
          console.info('SUB_DMS_ConnectAbility_0220 disconnectAbility err: ' + err.code);
          console.info('SUB_DMS_ConnectAbility_0220 disconnectAbilityerr: ' + err.message);
          done();
        }) 
      }, 3000);
  });
})
}