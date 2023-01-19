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
import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from "@ohos/hypium"
import deviceManager from '@ohos.distributedHardware.deviceManager';
import abilityDelegatorRegistry from '@ohos.app.ability.abilityDelegatorRegistry';
import commonEvent from '@ohos.commonEventManager';
import rpc from '@ohos.rpc';
let abilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();
let dvList;
let dvId;
let localDeviceId;
let connectId;
let connectId2;
let subscriber
let subscribeInfo = {
  events: ["DmsFwkService_ConnectAbility"]
}
export default function DmsFwkStageTest() {

  describe('DmsFwkStageTest', function () {

    beforeAll(async function (done) {
      function deviceManagerCallback(error, deviceManager) {
        console.info('LifeCycleTest before each called');
        let deviceList = deviceManager.getTrustedDeviceListSync();
        let deviceId = deviceList[0].deviceId;
        dvList = deviceList;
        dvId = deviceId;
        localDeviceId = deviceManager.getLocalDeviceInfoSync().deviceId;
      }
      deviceManager.createDeviceManager('com.acts.example.dmsfwkstageserver', deviceManagerCallback)
      await sleep(1000);
      done()
    });

    beforeEach(async function (done) {
      console.info('LifeCycleTest before each called');
      await sleep(4000);
      done()
    });

    afterEach(async function (done) {
      console.info('DmsFwkStageTest after each called');
      await globalThis.abilityContext.disconnectServiceExtensionAbility(connectId).then((data)=>{
        console.info('DmsFwkStageTest disconnectServiceExtensionAbility called success');
      }).catch((err)=>{
        console.info('DmsFwkStageTest disconnectServiceExtensionAbility called error ' + err.message);
      })
      await sleep(2000);
      done();
    });

    var TAG;
    function sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time))
    }

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0100
     * @tc.name    Connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0100", 0, async function (done) {
      console.info("---------------SUB_DMS_ConnectAbility_0100 is start---------------")
      TAG = "SUB_DMS_ConnectAbility_0100";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId:dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy)=>{
          if(proxy == null){
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('SUB_DMS_ConnectAbility_0100 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_ConnectAbility_0100 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done();
          })
        },
        onDisConnect: (elementName)=>{
          console.info('SUB_DMS_ConnectAbility_0100  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code)=>{
          console.info('SUB_DMS_ConnectAbility_0100  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_ConnectAbility_0100 is end--------------- " + connectId)
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0200
     * @tc.name    ConnecAbility failed after connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0200", 0, async function (done) {
      console.log("------------SUB_DMS_ConnectAbility_0200 start-------------");
      TAG = "SUB_DMS_ConnectAbility_0200";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId:dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy)=>{
          if(proxy == null){
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('SUB_DMS_ConnectAbility_0200 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_ConnectAbility_0200 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
          })
        },
        onDisConnect: (elementName)=>{
          console.info('SUB_DMS_ConnectAbility_0200  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code)=>{
          console.info('SUB_DMS_ConnectAbility_0200  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(3000);
      connectId2 = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId:dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy)=>{
          if(proxy == null){
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('SUB_DMS_ConnectAbility_0200 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_ConnectAbility_0200 onConnectRemoteService001 msg: ' + msg);
              expect(msg).assertEqual(100)
              done();
          })
        },
        onDisConnect: (elementName)=>{
          console.info('SUB_DMS_ConnectAbility_0200  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code)=>{
          console.info('SUB_DMS_ConnectAbility_0200  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      console.log("------------SUB_DMS_ConnectAbility_0200 end-------------" + connectId);
    });


     /*
     * @tc.number  SUB_DMS_ConnectAbility_0300
     * @tc.name    Disconnect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
     it("SUB_DMS_ConnectAbility_0300", 0, async function (done) {
      console.log("------------SUB_DMS_ConnectAbility_0300 start-------------");
      TAG = "SUB_DMS_ConnectAbility_0300";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId:dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy)=>{
          if(proxy == null){
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('SUB_DMS_ConnectAbility_0300 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_ConnectAbility_0300 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done();
          })
        },
        onDisConnect: (elementName)=>{
          console.info('SUB_DMS_ConnectAbility_0300  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code)=>{
          console.info('SUB_DMS_ConnectAbility_0300  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(3000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(connectId, (err, data)=>{
        expect(undefined).assertEqual(data)
      })
      await sleep(1000);
      console.log("------------SUB_DMS_ConnectAbility_0300 end-------------");
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0400
     * @tc.name    Disconnect the remote Ability failed after connectAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0400", 0, async function (done) {
      console.log("------------SUB_DMS_ConnectAbility_0400 start-------------");
      TAG = "SUB_DMS_ConnectAbility_0400";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId:dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy)=>{
          if(proxy == null){
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('SUB_DMS_ConnectAbility_0400 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_ConnectAbility_0400 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
          })
        },
        onDisConnect: (elementName)=>{
          console.info('SUB_DMS_ConnectAbility_0400  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code)=>{
          console.info('SUB_DMS_ConnectAbility_0400  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(3000);
      connectId2 = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId:dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy)=>{
          if(proxy == null){
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('SUB_DMS_ConnectAbility_0400 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_ConnectAbility_0400 onConnectRemoteService001 msg: ' + msg);
              expect(msg).assertEqual(100)
          })
        },
        onDisConnect: (elementName)=>{
          console.info('SUB_DMS_ConnectAbility_0400  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code)=>{
          console.info('SUB_DMS_ConnectAbility_0400  onFailed: ' + code);
          expect().assertFail();
        }
      });
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(connectId, (err, data)=>{
        expect(undefined).assertEqual(data)
      })
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(connectId2, (err, data)=>{
        console.info('SUB_DMS_ConnectAbility_0400  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      console.log("------------SUB_DMS_ConnectAbility_0400 end-------------");
    });

    
    /*
     * @tc.number  SUB_DMS_ConnectAbility_0500
     * @tc.name    Connect the remote Ability with error deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0500", 0, async function (done) {
      console.info("---------------SUB_DMS_ConnectAbility_0500 is start---------------")
      TAG = "SUB_DMS_ConnectAbility_0500";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId:"1111212151561315616131515643115616",
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy)=>{
          expect().assertFail();
          done();
        },
        onDisConnect: (elementName)=>{
          console.info('SUB_DMS_ConnectAbility_0500  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code)=>{
          console.info('SUB_DMS_ConnectAbility_0500 code: ' + code);
          expect(code).assertEqual(16000050)
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_ConnectAbility_0500 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0600
     * @tc.name    Connect the remote Ability with local deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0600", 0, async function (done) {
      console.info("---------------SUB_DMS_ConnectAbility_0600 is start---------------")
      TAG = "SUB_DMS_ConnectAbility_0600";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId:localDeviceId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy)=>{
          if(proxy == null){
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('SUB_DMS_ConnectAbility_0600 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_ConnectAbility_0600 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done();
          })
        },
        onDisConnect: (elementName)=>{
          console.info('SUB_DMS_ConnectAbility_0600  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code)=>{
          console.info('SUB_DMS_ConnectAbility_0600  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_ConnectAbility_0600 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0700
     * @tc.name    Connect the remote Ability with empty deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0700", 0, async function (done) {
      console.info("---------------SUB_DMS_ConnectAbility_0700 is start---------------")
      TAG = "SUB_DMS_ConnectAbility_0700";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId:"",
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy)=>{
          if(proxy == null){
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('SUB_DMS_ConnectAbility_0700 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_ConnectAbility_0700 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done();
          })
        },
        onDisConnect: (elementName)=>{
          console.info('SUB_DMS_ConnectAbility_0700  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code)=>{
          console.info('SUB_DMS_ConnectAbility_0700  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_ConnectAbility_0700 is end---------------" + connectId)
    });
    /*
     * @tc.number  SUB_DMS_ConnectAbility_0800
     * @tc.name    Connect the remote Ability with error bundle.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0800", 0, async function (done) {
      console.info("---------------SUB_DMS_ConnectAbility_0800 is start---------------")
      TAG = "SUB_DMS_ConnectAbility_0800";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId:dvId,
        bundleName: "com.acts.example.dmsfwkstageserver.err",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy)=>{
          expect().assertFail();
          done();
        },
        onDisConnect: (elementName)=>{
          console.info('SUB_DMS_ConnectAbility_0800  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code)=>{
          console.info('SUB_DMS_ConnectAbility_0800  onFailed: ' + code);
          expect(code).assertEqual(16000050)
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_ConnectAbility_0600 is end---------------" + connectId)
    });


    /*
     * @tc.number  SUB_DMS_ConnectAbility_0900
     * @tc.name    Connect the remote Ability after kill process of softbus_server.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0900", 0, async function (done) {
      console.info("---------------SUB_DMS_ConnectAbility_0900 is start---------------")
      TAG = "SUB_DMS_ConnectAbility_0900";
      abilityDelegator.executeShellCommand("pidof softbus_server", (err, data)=>{
        console.info("SUB_DMS_ConnectAbility_0900:" + data.stdResult)
        abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data)=>{
          console.info("SUB_DMS_ConnectAbility_0900:" + data.stdResult)
        })
      })
      
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId:dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy)=>{
          if(proxy == null){
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('SUB_DMS_ConnectAbility_0900 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_ConnectAbility_0900 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done();
          })
        },
        onDisConnect: (elementName)=>{
          console.info('SUB_DMS_ConnectAbility_0900  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code)=>{
          console.info('SUB_DMS_ConnectAbility_0900  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_ConnectAbility_0900 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0110
     * @tc.name     Connect the remote Ability after kill process of distributedsche.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0110", 0, async function (done) {
      console.info("---------------SUB_DMS_ConnectAbility_0110 is start---------------")
      TAG = "SUB_DMS_ConnectAbility_0110";
      abilityDelegator.executeShellCommand("pidof distributedsche", (err, data)=>{
        console.info("SUB_DMS_ConnectAbility_0900:" + data.stdResult)
        abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data)=>{
          console.info("SUB_DMS_ConnectAbility_0900:" + data.stdResult)
        })
      })
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId:dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy)=>{
          if(proxy == null){
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('SUB_DMS_ConnectAbility_0110 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_ConnectAbility_0110 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done();
          })
        },
        onDisConnect: (elementName)=>{
          console.info('SUB_DMS_ConnectAbility_0110  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code)=>{
          console.info('SUB_DMS_ConnectAbility_0110  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_ConnectAbility_0110 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0180
     * @tc.name    Connec the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0180", 0, async function (done) {
      console.info("---------------SUB_DMS_ConnectAbility_0180 is start---------------")
      TAG = "SUB_DMS_ConnectAbility_0180";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId:dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy)=>{
          expect(proxy != null).assertTrue();
          expect(elementName.bundleName).assertEqual("com.acts.example.dmsfwkstageserver");
          expect(elementName.abilityName).assertEqual("ServiceAbility");
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('SUB_DMS_ConnectAbility_0180 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_ConnectAbility_0180 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done()
          })
        },
        onDisConnect: (elementName)=>{
          console.info('SUB_DMS_ConnectAbility_0180  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code)=>{
          console.info('SUB_DMS_ConnectAbility_0180  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_ConnectAbility_0180 is end---------------" + connectId)
    });


    
    /*
     * @tc.number  SUB_DMS_ConnectAbility_0190
     * @tc.name    Connec the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0190", 0, async function (done) {
      console.info("---------------SUB_DMS_ConnectAbility_0190 is start---------------")
      let RemoteObj;
      TAG = "SUB_DMS_ConnectAbility_0190";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId:dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy)=>{
          expect(proxy != null).assertTrue();
          RemoteObj = proxy;
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('SUB_DMS_ConnectAbility_0190 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_ConnectAbility_0190 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
          })
        },
        onDisConnect: (elementName)=>{
          console.info('SUB_DMS_ConnectAbility_0190  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code)=>{
          console.info('SUB_DMS_ConnectAbility_0190  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(2000);
      let option = new rpc.MessageOption();
      let data = new rpc.MessageParcel();
      let reply = new rpc.MessageParcel();
      data.writeInt(123);
      RemoteObj.sendRequest(1, data, reply, option).then((result) => {
          console.log('SUB_DMS_ConnectAbility_0190 sendRequest success');
          let msg = result.reply.readInt();
          console.info('SUB_DMS_ConnectAbility_0190 onConnectRemoteService001 msg: ' + msg);
          expect(msg == 123).assertTrue();
          done();
      })
      console.info("---------------SUB_DMS_ConnectAbility_0190 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StartControl_ConnectAbility_0100
     * @tc.name    Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_ConnectAbility_0100", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_ConnectAbility_0100 is start---------------")
      TAG = "SUB_DMS_StartControl_ConnectAbility_0100";
      try{
        connectId = globalThis.abilityContext.connectServiceExtensionAbility({
          deviceId:dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy)=>{
            expect(proxy != null).assertTrue();
            expect(elementName.bundleName).assertEqual("com.acts.example.dmsfwkstageserver");
            expect(elementName.abilityName).assertEqual("ServiceAbility");
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
                console.log('SUB_DMS_StartControl_ConnectAbility_0100 sendRequest success');
                let msg = result.reply.readInt();
                console.info('SUB_DMS_StartControl_ConnectAbility_0100 onConnectRemoteService001 msg: ' + msg);
                expect(msg == 100).assertTrue();
                done();
            })
          },
          onDisConnect: (elementName)=>{
            console.info('SUB_DMS_StartControl_ConnectAbility_0100  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code)=>{
            console.info('SUB_DMS_StartControl_ConnectAbility_0100  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
      }catch(err){
        console.info('SUB_DMS_StartControl_ConnectAbility_0100 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_ConnectAbility_0100 catch: ' + err.message);
      }
    });
    
    /*
     * @tc.number  SUB_DMS_StartControl_ConnectAbility_0400
     * @tc.name    Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_ConnectAbility_0400", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_ConnectAbility_0400 is start---------------")
      TAG = "SUB_DMS_StartControl_ConnectAbility_0400";
      try{
        connectId = globalThis.abilityContext.connectServiceExtensionAbility({
          deviceId:dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility2"
        }, {
          onConnect: (elementName, proxy)=>{
            expect().assertFail();
            done();
          },
          onDisConnect: (elementName)=>{
            console.info('SUB_DMS_StartControl_ConnectAbility_0400  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code)=>{
            console.info('SUB_DMS_StartControl_ConnectAbility_0400  onFailed: ' + code);
            done();
          }
        });
      }catch(err){
        console.info('SUB_DMS_StartControl_ConnectAbility_0400 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_ConnectAbility_0400 catch: ' + err.message);
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_ConnectAbility_0300
     * @tc.name    Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_ConnectAbility_0300", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_ConnectAbility_0300 is start---------------")
      TAG = "SUB_DMS_StartControl_ConnectAbility_0300";
      try{
        connectId = globalThis.abilityContext.connectServiceExtensionAbility({
          deviceId:dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy)=>{
            expect(proxy != null).assertTrue();
            expect(elementName.bundleName).assertEqual("com.acts.example.dmsfwkstageserver");
            expect(elementName.abilityName).assertEqual("ServiceAbility");
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
                console.log('SUB_DMS_StartControl_ConnectAbility_0300 sendRequest success');
                let msg = result.reply.readInt();
                console.info('SUB_DMS_StartControl_ConnectAbility_0300 onConnectRemoteService001 msg: ' + msg);
                expect(msg == 100).assertTrue();
                done();
            })
          },
          onDisConnect: (elementName)=>{
            console.info('SUB_DMS_StartControl_ConnectAbility_0300  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code)=>{
            console.info('SUB_DMS_StartControl_ConnectAbility_0300  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
      }catch(err){
        console.info('SUB_DMS_StartControl_ConnectAbility_0300 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_ConnectAbility_0300 catch: ' + err.message);
      }
    });
    
  })
}