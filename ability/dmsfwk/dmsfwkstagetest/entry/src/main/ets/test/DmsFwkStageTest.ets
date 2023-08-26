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
import { UiDriver, BY } from '@ohos.UiTest';
import abilityAccessCtrl from '@ohos.abilityAccessCtrl';
import distributedMissionManager from '@ohos.distributedMissionManager';
import missionManager from '@ohos.app.ability.missionManager';
import UIAbility from '@ohos.app.ability.UIAbility';
import AbilityConstant from '@ohos.app.ability.AbilityConstant';

let atManager = abilityAccessCtrl.createAtManager();
let abilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();
let dvList;
let dvId;
let localDeviceId;
let connectId;
let connectId2;
let extensionConnectId;
let extensionConnectId2;
let continueState;
let subscriber
let call
let subscribeInfo = {
  events: ["DmsFwkService_ConnectAbility"]
}
export default function DmsFwkStageTest() {

  describe('DmsFwkStageTest', function () {

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function getPermission() {
      console.info('getPermission is start');
      atManager.requestPermissionsFromUser(globalThis.abilityContext, ['ohos.permission.DISTRIBUTED_DATASYNC'], (data) => {
        console.info("request success" + JSON.stringify(data));
      })
    }

    async function driveFn() {
      try {
        let driver = await UiDriver.create()
        console.info('come in driveFn')
        console.info('driver is ${JSON.stringify(driver)}')
        sleep(2000);
        let button = await driver.findComponent(BY.text('允许'));
        console.info('button is ${JSON.stringify(button)}');
        sleep(5000);
        await button.click();
      } catch (err) {
        console.info('err is ' + err);
        return;
      }
    }

    beforeAll(async function (done) {
      await getPermission();
      sleep(5000);
      await driveFn();
      sleep(1000);

      function deviceManagerCallback(error, deviceManager) {
        console.info('LifeCycleTest before each called');
        let deviceList = deviceManager.getTrustedDeviceListSync();
        let deviceId = deviceList[0].networkId;
        dvList = deviceList;
        dvId = deviceId;
        localDeviceId = deviceManager.getLocalDeviceInfoSync().networkId;
        console.info('deviceId is' + dvId);
        console.info('localDeviceId is' + localDeviceId);
      }
      deviceManager.createDeviceManager('com.acts.example.dmsfwkstageserver', deviceManagerCallback)
      await sleep(1000);
      done()
    });

    beforeEach(async function (done) {
      console.info('LifeCycleTest before each called');
      await globalThis.abilityContext.startServiceExtensionAbility({
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "ServiceAbility"
      }).then((data) => {
        console.info('DmsFwkStageTest startServiceExtensionAbility called success');
      }).catch((err) => {
        console.info('DmsFwkStageTest startServiceExtensionAbility called error ' + err.message);
      })
      await sleep(4000);
      done()
    });

    afterEach(async function (done) {
      console.info('DmsFwkStageTest after each called');
      done();
    });

    var TAG;

    /*
     * @tc.number  SUB_DMS_connectServiceExtensionAbility_0100
     * @tc.name    Connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_connectServiceExtensionAbility_0100", 0, async function (done) {
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0100 is start---------------")
      TAG = "SUB_DMS_connectServiceExtensionAbility_0100";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_connectServiceExtensionAbility_0100 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_connectServiceExtensionAbility_0100 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0100  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0100  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      await globalThis.abilityContext.disconnectServiceExtensionAbility(connectId , (err , data) => {
        console.info('SUB_DMS_connectServiceExtensionAbility_0100  disconnectServiceExtensionAbility is success : ' + data);
        expect(data).assertEqual(undefined)
        done()
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0100 is end--------------- " + connectId)
    });

    /*
     * @tc.number  SUB_DMS_connectServiceExtensionAbility_0200
     * @tc.name    ConnecAbility failed after connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_connectServiceExtensionAbility_0200", 0, async function (done) {
      console.log("------------SUB_DMS_connectServiceExtensionAbility_0200 start-------------");
      TAG = "SUB_DMS_connectServiceExtensionAbility_0200";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_connectServiceExtensionAbility_0200 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_connectServiceExtensionAbility_0200 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0200  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0200  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(3000);
      connectId2 = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_connectServiceExtensionAbility_0200 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_connectServiceExtensionAbility_0200 onConnectRemoteService001 msg: ' + msg);
            expect(msg).assertEqual(100)
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0200  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0200  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      await globalThis.abilityContext.disconnectServiceExtensionAbility(connectId , (err , data) => {
        console.info('SUB_DMS_connectServiceExtensionAbility_0200  disconnectServiceExtensionAbility is success : ' + data);
        expect(data).assertEqual(undefined)
        done()
      });
      await sleep(1000);
      await globalThis.abilityContext.disconnectServiceExtensionAbility(connectId2 , (err , data) => {
        console.info('SUB_DMS_connectServiceExtensionAbility_0200  disconnectServiceExtensionAbility is success : ' + data);
        expect(data).assertEqual(undefined)
        done()
      });
      await sleep(1000);
      console.log("------------SUB_DMS_connectServiceExtensionAbility_0200 end-------------" + connectId);
    });


    /*
     * @tc.number  SUB_DMS_connectServiceExtensionAbility_0300
     * @tc.name    Disconnect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_connectServiceExtensionAbility_0300", 0, async function (done) {
      console.log("------------SUB_DMS_connectServiceExtensionAbility_0300 start-------------");
      TAG = "SUB_DMS_connectServiceExtensionAbility_0300";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_connectServiceExtensionAbility_0300 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_connectServiceExtensionAbility_0300 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0300  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0300  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      await globalThis.abilityContext.disconnectServiceExtensionAbility(connectId , (err , data) => {
        console.info('SUB_DMS_connectServiceExtensionAbility_0300  disconnectServiceExtensionAbility is success : ' + data);
        expect(data).assertEqual(undefined)
        done()
      });
      await sleep(1000);
      console.log("------------SUB_DMS_connectServiceExtensionAbility_0300 end-------------");
    });

    /*
     * @tc.number  SUB_DMS_connectServiceExtensionAbility_0400
     * @tc.name    Disconnect the remote Ability failed after connectAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_connectServiceExtensionAbility_0400", 0, async function (done) {
      console.log("------------SUB_DMS_connectServiceExtensionAbility_0400 start-------------");
      TAG = "SUB_DMS_connectServiceExtensionAbility_0400";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_connectServiceExtensionAbility_0400 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_connectServiceExtensionAbility_0400 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0400  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0400  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(3000);
      connectId2 = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_connectServiceExtensionAbility_0400 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_connectServiceExtensionAbility_0400 onConnectRemoteService001 msg: ' + msg);
            expect(msg).assertEqual(100)
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0400  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0400  onFailed: ' + code);
          expect().assertFail();
        }
      });
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(connectId, (err, data) => {
        expect(undefined).assertEqual(data)
        done()
      })
      await sleep(1000);
      await globalThis.abilityContext.disconnectServiceExtensionAbility(connectId2 , (err , data) => {
        console.info('SUB_DMS_connectServiceExtensionAbility_0400  disconnectServiceExtensionAbility is success : ' + data);
        expect(data).assertEqual(undefined)
        done()
      });
      console.log("------------SUB_DMS_connectServiceExtensionAbility_0400 end-------------");
    });

    /*
     * @tc.number  SUB_DMS_connectServiceExtensionAbility_0500
     * @tc.name    Connect the remote Ability with error deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_connectServiceExtensionAbility_0500", 0, async function (done) {
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0500 is start---------------")
      TAG = "SUB_DMS_connectServiceExtensionAbility_0500";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: "1111212151561315616131515643115616",
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          expect().assertFail();
          done();
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0500  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0500 code: ' + code);
          expect(code).assertEqual(401)
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0500 is end---------------" + connectId)
    });


    /*
     * @tc.number  SUB_DMS_connectServiceExtensionAbility_0700
     * @tc.name    Connect the remote Ability with wrong abilityName.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_connectServiceExtensionAbility_0700", 0, async function (done) {
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0700 is start---------------")
      TAG = "SUB_DMS_connectServiceExtensionAbility_0700";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "WrongServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0700  onConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0700  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0700  onFailed: ' + code);
          expect(code).assertEqual(401);
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0700 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_connectServiceExtensionAbility_0800
     * @tc.name    Connect the remote Ability with error bundle.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_connectServiceExtensionAbility_0800", 0, async function (done) {
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0800 is start---------------")
      TAG = "SUB_DMS_connectServiceExtensionAbility_0800";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver.err",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          expect().assertFail();
          done();
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0800  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0800  onFailed: ' + code);
          expect(code).assertEqual(401)
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0800 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_connectServiceExtensionAbility_0900
     * @tc.name    Connect the remote Ability after kill process of softbus_server.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_connectServiceExtensionAbility_0900", 0, async function (done) {
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0900 is start---------------")
      TAG = "SUB_DMS_connectServiceExtensionAbility_0900";
      abilityDelegator.executeShellCommand("pidof softbus_server", (err, data) => {
        console.info("SUB_DMS_connectServiceExtensionAbility_0900:" + data.stdResult)
        abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data) => {
          console.info("SUB_DMS_connectServiceExtensionAbility_0900:" + data.stdResult)
        })
      })

      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_connectServiceExtensionAbility_0900 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_connectServiceExtensionAbility_0900 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0900  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0900  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      await globalThis.abilityContext.disconnectServiceExtensionAbility(connectId , (err , data) => {
        console.info('SUB_DMS_connectServiceExtensionAbility_0900  disconnectServiceExtensionAbility is success : ' + data);
        expect(data).assertEqual(undefined)
        done()
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0900 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_connectServiceExtensionAbility_0110
     * @tc.name     Connect the remote Ability after kill process of distributedsche.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_connectServiceExtensionAbility_0110", 0, async function (done) {
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0110 is start---------------")
      TAG = "SUB_DMS_connectServiceExtensionAbility_0110";
      abilityDelegator.executeShellCommand("pidof distributedsche", (err, data) => {
        console.info("SUB_DMS_connectServiceExtensionAbility_0110:" + data.stdResult)
        abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data) => {
          console.info("SUB_DMS_connectServiceExtensionAbility_0110:" + data.stdResult)
        })
      })
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_connectServiceExtensionAbility_0110 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_connectServiceExtensionAbility_0110 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0110  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0110  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(connectId, (err, data) => {
        console.info('SUB_DMS_connectServiceExtensionAbility_0110  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0110 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_connectServiceExtensionAbility_0180
     * @tc.name    Connec the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_connectServiceExtensionAbility_0180", 0, async function (done) {
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0180 is start---------------")
      TAG = "SUB_DMS_connectServiceExtensionAbility_0180";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          expect(proxy != null).assertTrue();
          expect(elementName.bundleName).assertEqual("com.acts.example.dmsfwkstageserver");
          expect(elementName.abilityName).assertEqual("ServiceAbility");
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_connectServiceExtensionAbility_0180 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_connectServiceExtensionAbility_0180 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done()
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0180  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0180  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(connectId, (err, data) => {
        console.info('SUB_DMS_connectServiceExtensionAbility_0180  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0180 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_connectServiceExtensionAbility_0190
     * @tc.name    Connec the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_connectServiceExtensionAbility_0190", 0, async function (done) {
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0190 is start---------------")
      let RemoteObj;
      TAG = "SUB_DMS_connectServiceExtensionAbility_0190";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          expect(proxy != null).assertTrue();
          RemoteObj = proxy;
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_connectServiceExtensionAbility_0190 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_connectServiceExtensionAbility_0190 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0190  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_connectServiceExtensionAbility_0190  onFailed: ' + code);
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
        console.log('SUB_DMS_connectServiceExtensionAbility_0190 sendRequest success');
        let msg = result.reply.readInt();
        console.info('SUB_DMS_connectServiceExtensionAbility_0190 onConnectRemoteService001 msg: ' + msg);
        expect(msg == 123).assertTrue();
        done();
      })
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(connectId, (err, data) => {
        console.info('SUB_DMS_connectServiceExtensionAbility_0190  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_connectServiceExtensionAbility_0190 is end---------------" + connectId)
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
      try {
        connectId = globalThis.abilityContext.connectServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
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
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StartControl_ConnectAbility_0100  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StartControl_ConnectAbility_0100  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
        
      } catch (err) {
        console.info('SUB_DMS_StartControl_ConnectAbility_0100 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_ConnectAbility_0100 catch: ' + err.message);
      }
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(connectId, (err, data) => {
        console.info('SUB_DMS_StartControl_ConnectAbility_0100  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_StartControl_ConnectAbility_0100 is end---------------" + connectId)
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
      try {
        connectId = globalThis.abilityContext.connectServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility2"
        }, {
          onConnect: (elementName, proxy) => {
            expect().assertFail();
            done();
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StartControl_ConnectAbility_0400  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StartControl_ConnectAbility_0400  onFailed: ' + code);
            done();
          }
        });
      } catch (err) {
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
      try {
        connectId = globalThis.abilityContext.connectServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
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
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StartControl_ConnectAbility_0300  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StartControl_ConnectAbility_0300  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StartControl_ConnectAbility_0300 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_ConnectAbility_0300 catch: ' + err.message);
      }
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(connectId, (err, data) => {
        console.info('SUB_DMS_StartControl_ConnectAbility_0300  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_StartControl_ConnectAbility_0300 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StartControl_StartAbility_0100
     * @tc.name    Success startServiceExtensionAbility with remote.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_StartAbility_0100", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_StartAbility_0100 is start---------------")
      TAG = "SUB_DMS_StartControl_StartAbility_0100";
      try {
        connectId = globalThis.abilityContext.startServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_StartAbility_0100 startService result: ' + err.code + " " + err.message);
          console.info('SUB_DMS_StartControl_StartAbility_0100 startService err.code: ' + err.code);
          console.info('SUB_DMS_StartControl_StartAbility_0100 startService err.message: ' + err.message);
          expect(err.code).assertEqual(16000001);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_StartAbility_0100 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_StartAbility_0100 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_StartAbility_0200
     * @tc.name    Filed start remote service with error bundle.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_StartAbility_0200", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_StartAbility_0200 is start---------------")
      TAG = "SUB_DMS_StartControl_StartAbility_0200";
      try {
        connectId = globalThis.abilityContext.startServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageservererr",
          abilityName: "ServiceAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_StartAbility_0200 startService result: ' + err.code + " " + err.message);
          console.info('SUB_DMS_StartControl_StartAbility_0200 startService err.code: ' + err.code);
          console.info('SUB_DMS_StartControl_StartAbility_0200 startService err.message: ' + err.message);
          expect(err.code).assertEqual(16000001);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_StartAbility_0200 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_StartAbility_0200 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_StartAbility_0300
     * @tc.name    Filed start remote service with error ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_StartAbility_0300", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_StartAbility_0300 is start---------------")
      TAG = "SUB_DMS_StartControl_StartAbility_0300";
      try {
        connectId = globalThis.abilityContext.startServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbilityErr"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_StartAbility_0300 startService result: ' + err.code + " " + err.message);
          console.info('SUB_DMS_StartControl_StartAbility_0300 startService err.code: ' + err.code);
          console.info('SUB_DMS_StartControl_StartAbility_0300 startService err.message: ' + err.message);
          expect(err.code).assertEqual(16000001);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_StartAbility_0300 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_StartAbility_0300 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_StartAbility_0400
     * @tc.name    Filed start remote service with error device.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_StartAbility_0400", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_StartAbility_0400 is start---------------")
      TAG = "SUB_DMS_StartControl_StartAbility_0400";
      try {
        connectId = globalThis.abilityContext.startServiceExtensionAbility({
          deviceId: "dvId",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_StartAbility_0400 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(16000001);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_StartAbility_0400 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_StartAbility_0400 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_StartAbility_0500
     * @tc.name    Filed start remote service with null device.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_StartAbility_0500", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_StartAbility_0500 is start---------------")
      TAG = "SUB_DMS_StartControl_StartAbility_0500";
      try {
        connectId = globalThis.abilityContext.startServiceExtensionAbility({
          deviceId: "",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_StartAbility_0400 startService result: ' + err);
          console.info('SUB_DMS_StartControl_StartAbility_0400 startService result: ' + err);
          console.info('SUB_DMS_StartControl_StartAbility_0400 startService result: ' + err);
        })
        await sleep(3000)
        expect(globalThis.startAbilityReault).assertTrue();
        done();
      } catch (err) {
        console.info('SUB_DMS_StartControl_StartAbility_0500 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_StartAbility_0500 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_StartAbility_0700
     * @tc.name    Filed start remote ability with error bundle.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_StartAbility_0700", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_StartAbility_0700 is start---------------")
      TAG = "SUB_DMS_StartControl_StartAbility_0700";
      try {
        connectId = globalThis.abilityContext.startAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver.err",
          abilityName: "MainAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_StartAbility_0700 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(401);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_StartAbility_0700 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_StartAbility_0700 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_StartAbility_0800
     * @tc.name    Filed start remote ability with error ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_StartAbility_0800", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_StartAbility_0800 is start---------------")
      TAG = "SUB_DMS_StartControl_StartAbility_0800";
      try {
        connectId = globalThis.abilityContext.startAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility.err"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_StartAbility_0800 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(401);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_StartAbility_0800 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_StartAbility_0800 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_StartAbility_0900
     * @tc.name    Filed start remote ability with error device.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_StartAbility_0900", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_StartAbility_0900 is start---------------")
      TAG = "SUB_DMS_StartControl_StartAbility_0900";
      try {
        connectId = globalThis.abilityContext.startAbility({
          deviceId: "dvId",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_StartAbility_0900 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(401);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_StartAbility_0900 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_StartAbility_0900 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
    * @tc.number  SUB_DMS_StartControl_StartAbility_1000
    * @tc.name    Filed start remote ability with null device.
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartControl_StartAbility_1000", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_StartAbility_1000 is start---------------")
      TAG = "SUB_DMS_StartControl_StartAbility_1000";
      try {
        connectId = globalThis.abilityContext.startAbility({
          deviceId: "",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_StartAbility_1000 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(16000001);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_StartAbility_1000 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_StartAbility_1000 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_StartAbility_1100
     * @tc.name    Filed start remote ability with startServiceExtensionAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_StartAbility_1100", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_StartAbility_1100 is start---------------")
      TAG = "SUB_DMS_StartControl_StartAbility_1100";
      try {
        connectId = globalThis.abilityContext.startServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_StartAbility_1100 startService result: ' + err.code);
          expect(err.code).assertEqual(16000001);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_StartAbility_1100 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_StartAbility_1100 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_Extension_ConnectAbility_0100
     * @tc.name    ServiceExtension Connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_Extension_ConnectAbility_0100", 0, async function (done) {
      console.info("---------------SUB_DMS_Extension_ConnectAbility_0100 is start---------------")
      TAG = "SUB_DMS_Extension_ConnectAbility_0100";
      extensionConnectId = globalThis.extensionContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_Extension_ConnectAbility_0100 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_Extension_ConnectAbility_0100 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0100  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0100  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(3000);
      globalThis.extensionContext.disconnectServiceExtensionAbility(extensionConnectId , (err , data) =>{
        console.info('SUB_DMS_Extension_ConnectAbility_0100  disconnectServiceExtensionAbility is success: ' + data);
        expect(data).assertEqual(undefined)
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_Extension_ConnectAbility_0100 is end--------------- " + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_Extension_ConnectAbility_0200
     * @tc.name    ServiceExtension ConnecAbility failed after connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_Extension_ConnectAbility_0200", 0, async function (done) {
      console.log("------------SUB_DMS_Extension_ConnectAbility_0200 start-------------");
      TAG = "SUB_DMS_Extension_ConnectAbility_0200";
      extensionConnectId = globalThis.extensionContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_Extension_ConnectAbility_0200 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_Extension_ConnectAbility_0200 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0200  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0200  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(3000);
      extensionConnectId2 = globalThis.extensionContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_Extension_ConnectAbility_0200 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_Extension_ConnectAbility_0200 onConnectRemoteService001 msg: ' + msg);
            expect(msg).assertEqual(100)
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0200  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0200  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(3000);
      globalThis.extensionContext.disconnectServiceExtensionAbility(extensionConnectId2 , (err , data) =>{
        console.info('SUB_DMS_Extension_ConnectAbility_0200  disconnectServiceExtensionAbility is success: ' + data);
        expect(data).assertEqual(undefined)
      })
      await sleep(1000);
      console.log("------------SUB_DMS_Extension_ConnectAbility_0200 end-------------" + extensionConnectId);
    });

    /*
    * @tc.number  SUB_DMS_Extension_ConnectAbility_0300
    * @tc.name    ServiceExtension Disconnect the remote Ability.
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_Extension_ConnectAbility_0300", 0, async function (done) {
      console.log("------------SUB_DMS_Extension_ConnectAbility_0300 start-------------");
      TAG = "SUB_DMS_Extension_ConnectAbility_0300";
      extensionConnectId = globalThis.extensionContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_Extension_ConnectAbility_0300 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_Extension_ConnectAbility_0300 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0300  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0300  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(3000);
      globalThis.extensionContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        expect(undefined).assertEqual(data)
        done()
      })
      await sleep(1000);
      console.log("------------SUB_DMS_Extension_ConnectAbility_0300 end-------------");
    });

    /*
     * @tc.number  SUB_DMS_Extension_ConnectAbility_0400
     * @tc.name    ServiceExtension Disconnect the remote Ability failed after connectAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_Extension_ConnectAbility_0400", 0, async function (done) {
      console.log("------------SUB_DMS_Extension_ConnectAbility_0400 start-------------");
      TAG = "SUB_DMS_Extension_ConnectAbility_0400";
      extensionConnectId = globalThis.extensionContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_Extension_ConnectAbility_0400 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_Extension_ConnectAbility_0400 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0400  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0400  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(3000);
      extensionConnectId2 = globalThis.extensionContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_Extension_ConnectAbility_0400 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_Extension_ConnectAbility_0400 onConnectRemoteService001 msg: ' + msg);
            expect(msg).assertEqual(100)
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0400  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0400  onFailed: ' + code);
          expect().assertFail();
        }
      });
      await sleep(1000);
      globalThis.extensionContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        expect(undefined).assertEqual(data)
        done()
      })
      await sleep(1000);
      globalThis.extensionContext.disconnectServiceExtensionAbility(extensionConnectId2, (err, data) => {
        console.info('SUB_DMS_Extension_ConnectAbility_0400  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      console.log("------------SUB_DMS_Extension_ConnectAbility_0400 end-------------");
    });

    /*
     * @tc.number  SUB_DMS_Extension_ConnectAbility_0700
     * @tc.name    ServiceExtension Connect the remote Ability with wrong abilityName.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_Extension_ConnectAbility_0700", 0, async function (done) {
      console.info("---------------SUB_DMS_Extension_ConnectAbility_0700 is start---------------")
      TAG = "SUB_DMS_Extension_ConnectAbility_0700";
      extensionConnectId = globalThis.extensionContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "WrongServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0700  onConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0700  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0700  onFailed: ' + code);
          expect(code).assertEqual(401);
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_Extension_ConnectAbility_0700 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_Extension_ConnectAbility_0800
     * @tc.name    ServiceExtension Connect the remote Ability with error bundle.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_Extension_ConnectAbility_0800", 0, async function (done) {
      console.info("---------------SUB_DMS_Extension_ConnectAbility_0800 is start---------------")
      TAG = "SUB_DMS_Extension_ConnectAbility_0800";
      extensionConnectId = globalThis.extensionContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver.err",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          expect().assertFail();
          done();
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0800  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0800  onFailed: ' + code);
          expect(code).assertEqual(401)
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_Extension_ConnectAbility_0600 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_Extension_ConnectAbility_0900
     * @tc.name    ServiceExtension Connect the remote Ability after kill process of softbus_server.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_Extension_ConnectAbility_0900", 0, async function (done) {
      console.info("---------------SUB_DMS_Extension_ConnectAbility_0900 is start---------------")
      TAG = "SUB_DMS_Extension_ConnectAbility_0900";
      abilityDelegator.executeShellCommand("pidof softbus_server", (err, data) => {
        console.info("SUB_DMS_Extension_ConnectAbility_0900:" + data.stdResult)
        abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data) => {
          console.info("SUB_DMS_Extension_ConnectAbility_0900:" + data.stdResult)
        })
      })

      extensionConnectId = globalThis.extensionContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_Extension_ConnectAbility_0900 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_Extension_ConnectAbility_0900 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0900  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0900  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      globalThis.extensionContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        console.info('SUB_DMS_Extension_ConnectAbility_0400  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_Extension_ConnectAbility_0900 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_Extension_ConnectAbility_0110
     * @tc.name    ServiceExtension Connect the remote Ability after kill process of distributedsche.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_Extension_ConnectAbility_0110", 0, async function (done) {
      console.info("---------------SUB_DMS_Extension_ConnectAbility_0110 is start---------------")
      TAG = "SUB_DMS_Extension_ConnectAbility_0110";
      abilityDelegator.executeShellCommand("pidof distributedsche", (err, data) => {
        console.info("SUB_DMS_Extension_ConnectAbility_0900:" + data.stdResult)
        abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data) => {
          console.info("SUB_DMS_Extension_ConnectAbility_0900:" + data.stdResult)
        })
      })
      extensionConnectId = globalThis.extensionContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          if (proxy == null) {
            return;
          }
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_Extension_ConnectAbility_0110 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_Extension_ConnectAbility_0110 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0110  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0110  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      globalThis.extensionContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        console.info('SUB_DMS_Extension_ConnectAbility_0400  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_Extension_ConnectAbility_0110 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_Extension_ConnectAbility_0180
     * @tc.name    ServiceExtension Connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_Extension_ConnectAbility_0180", 0, async function (done) {
      console.info("---------------SUB_DMS_Extension_ConnectAbility_0180 is start---------------")
      TAG = "SUB_DMS_Extension_ConnectAbility_0180";
      extensionConnectId = globalThis.extensionContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          expect(proxy != null).assertTrue();
          expect(elementName.bundleName).assertEqual("com.acts.example.dmsfwkstageserver");
          expect(elementName.abilityName).assertEqual("ServiceAbility");
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_Extension_ConnectAbility_0180 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_Extension_ConnectAbility_0180 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done()
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0180  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0180  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      globalThis.extensionContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        console.info('SUB_DMS_Extension_ConnectAbility_0400  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_Extension_ConnectAbility_0180 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_Extension_ConnectAbility_0190
     * @tc.name    ServiceExtension Connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_Extension_ConnectAbility_0190", 0, async function (done) {
      console.info("---------------SUB_DMS_Extension_ConnectAbility_0190 is start---------------")
      let RemoteObj;
      TAG = "SUB_DMS_Extension_ConnectAbility_0190";
      extensionConnectId = globalThis.extensionContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          expect(proxy != null).assertTrue();
          RemoteObj = proxy;
          let option = new rpc.MessageOption();
          let data = new rpc.MessageParcel();
          let reply = new rpc.MessageParcel();
          data.writeInt(1);
          data.writeInt(99);
          proxy.sendRequest(1, data, reply, option).then((result) => {
            console.log('SUB_DMS_Extension_ConnectAbility_0190 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_Extension_ConnectAbility_0190 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0190  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_Extension_ConnectAbility_0190  onFailed: ' + code);
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
        console.log('SUB_DMS_Extension_ConnectAbility_0190 sendRequest success');
        let msg = result.reply.readInt();
        console.info('SUB_DMS_Extension_ConnectAbility_0190 onConnectRemoteService001 msg: ' + msg);
        expect(msg == 123).assertTrue();
        done();
      })
      await sleep(1000);
      globalThis.extensionContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        console.info('SUB_DMS_Extension_ConnectAbility_0400  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      console.info("---------------SUB_DMS_Extension_ConnectAbility_0190 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_ConnectAbility_0100
     * @tc.name    ServiceExtension Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_ConnectAbility_0100", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_Extension_ConnectAbility_0100 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_ConnectAbility_0100";
      try {
        extensionConnectId = globalThis.extensionContext.connectServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            expect(proxy != null).assertTrue();
            expect(elementName.bundleName).assertEqual("com.acts.example.dmsfwkstageserver");
            expect(elementName.abilityName).assertEqual("ServiceAbility");
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('SUB_DMS_StartControl_Extension_ConnectAbility_0100 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0100 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done();
            })
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0100  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0100  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0100 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0100 catch: ' + err.message);
      }
      await sleep(1000);
      globalThis.extensionContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0100  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_ConnectAbility_0400
     * @tc.name    ServiceExtension Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_ConnectAbility_0400", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_Extension_ConnectAbility_0400 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_ConnectAbility_0400";
      try {
        extensionConnectId = globalThis.extensionContext.connectServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility2"
        }, {
          onConnect: (elementName, proxy) => {
            expect().assertFail();
            done();
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0400  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0400  onFailed: ' + code);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0400 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0400 catch: ' + err.message);
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_ConnectAbility_0300
     * @tc.name    ServiceExtension Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_ConnectAbility_0300", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_Extension_ConnectAbility_0300 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_ConnectAbility_0300";
      try {
        extensionConnectId = globalThis.extensionContext.connectServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            expect(proxy != null).assertTrue();
            expect(elementName.bundleName).assertEqual("com.acts.example.dmsfwkstageserver");
            expect(elementName.abilityName).assertEqual("ServiceAbility");
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('SUB_DMS_StartControl_Extension_ConnectAbility_0300 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0300 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done();
            })
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0300  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0300  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0300 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0300 catch: ' + err.message);
      }
      await sleep(1000);
      globalThis.extensionContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        console.info('SUB_DMS_StartControl_Extension_ConnectAbility_0100  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_StartAbility_0100
     * @tc.name    ServiceExtension success start remote service.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControlExtension__StartAbility_0100", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_0100 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_StartAbility_0100";
      try {
        extensionConnectId = globalThis.extensionContext.startServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_Extension_StartAbility_0100 startService result: ' + + err.code + " " + err.message);
          expect(err.code).assertEqual(16000001);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0100 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0100 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_StartAbility_0200
     * @tc.name    ServiceExtension filed start remote ability with error bundle.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_StartAbility_0200", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_0200 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_StartAbility_0200";
      try {
        extensionConnectId = globalThis.extensionContext.startServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageservererr",
          abilityName: "ServiceAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_Extension_StartAbility_0200 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(16000001);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0200 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0200 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_StartAbility_0300
     * @tc.name    ServiceExtension filed start remote ability with error ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_StartAbility_0300", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_0300 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_StartAbility_0300";
      try {
        extensionConnectId = globalThis.extensionContext.startServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbilityErr"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_Extension_StartAbility_0300 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(16000001);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0300 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0300 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_StartAbility_0400
     * @tc.name    ServiceExtension filed start remote ability with error device.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_StartAbility_0400", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_0400 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_StartAbility_0400";
      try {
        extensionConnectId = globalThis.extensionContext.startServiceExtensionAbility({
          deviceId: "dvId",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_Extension_StartAbility_0400 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(16000001);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0400 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0400 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_StartAbility_0500
     * @tc.name    ServiceExtension filed start remote service with null bundle.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_StartAbility_0500", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_0500 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_StartAbility_0500";
      try {
        extensionConnectId = globalThis.extensionContext.startServiceExtensionAbility({
          deviceId: "",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_Extension_StartAbility_0500 startService result: ' + err);
        })
        await sleep(3000)
        expect(globalThis.startAbilityReault).assertTrue();
        done();
      } catch (err) {
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0500 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0500 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_StartAbility_0700
     * @tc.name    ServiceExtension filed start remote ability with error bundle.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_StartAbility_0700", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_0700 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_StartAbility_0700";
      try {
        extensionConnectId = globalThis.extensionContext.startAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver.err",
          abilityName: "MainAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_Extension_StartAbility_0700 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(401);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0700 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0700 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_StartAbility_0800
     * @tc.name    ServiceExtension filed start remote ability with error ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_StartAbility_0800", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_0800 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_StartAbility_0800";
      try {
        extensionConnectId = globalThis.extensionContext.startAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility.err"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_Extension_StartAbility_0800 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(401);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0800 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0800 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_StartAbility_0900
     * @tc.name    ServiceExtension filed start remote ability with err device.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_StartAbility_0900", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_0900 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_StartAbility_0900";
      try {
        extensionConnectId = globalThis.extensionContext.startAbility({
          deviceId: "dvId",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_Extension_StartAbility_0900 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(401);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0900 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_Extension_StartAbility_0900 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_StartAbility_1000
     * @tc.name    ServiceExtension filed start remote ability with null device.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_StartAbility_1000", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_1000 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_StartAbility_1000";
      try {
        extensionConnectId = globalThis.extensionContext.startAbility({
          deviceId: "",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_Extension_StartAbility_1000 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(16000001);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_Extension_StartAbility_1000 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_Extension_StartAbility_1000 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_StartAbility_1100
     * @tc.name    ServiceExtension filed start remote ability with startServiceExtensionAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_StartAbility_1100", 0, async function (done) {
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_1100 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_StartAbility_1100";
      try {
        extensionConnectId = globalThis.extensionContext.startServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StartControl_Extension_StartAbility_1100 startService result: ' + + err.code + " " + err.message);
          expect(err.code).assertEqual(16000001);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartControl_Extension_StartAbility_1100 catch: ' + err.code);
        console.info('SUB_DMS_StartControl_Extension_StartAbility_1100 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_registerMissionListener_0010
     * @tc.name    registerMissionListener successful.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_registerMissionListener_0010", 0, async function (done) {
      console.info("-----------------SUB_DMS_registerMissionListener_0010 start------------------------");
      let TAG = "SUB_DMS_registerMissionListener_0010";
      function NotifyMissionsChanged(deviceId) {
        console.info(TAG + 'NotifyMissionsChanged deviceId ' + JSON.stringify(deviceId));
      }
      function NotifySnapshot(deviceId, missionId) {
        console.info(TAG + 'NotifySnapshot deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifySnapshot missionId ' + JSON.stringify(missionId));
      }
      function NotifyNetDisconnect(deviceId, state) {
        console.info(TAG + 'NotifyNetDisconnect deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifyNetDisconnect state ' + JSON.stringify(state));
      }
      try {
        await distributedMissionManager.registerMissionListener({
          deviceId: dvId
        }, {
          notifyMissionsChanged: NotifyMissionsChanged,
          notifySnapshot: NotifySnapshot,
          notifyNetDisconnect: NotifyNetDisconnect
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect(data).assertEqual(undefined);
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect().assertFail();
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_registerMissionListener_0010 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_registerMissionListener_0020
     * @tc.name    registerMissionListener with wrong deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_registerMissionListener_0020", 0, async function (done) {
      console.info("-----------------SUB_DMS_registerMissionListener_0020 start------------------------");
      let TAG = "SUB_DMS_registerMissionListener_0020";
      function NotifyMissionsChanged(deviceId) {
        console.info(TAG + 'NotifyMissionsChanged deviceId ' + JSON.stringify(deviceId));
      }
      function NotifySnapshot(deviceId, missionId) {
        console.info(TAG + 'NotifySnapshot deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifySnapshot missionId ' + JSON.stringify(missionId));
      }
      function NotifyNetDisconnect(deviceId, state) {
        console.info(TAG + 'NotifyNetDisconnect deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifyNetDisconnect state ' + JSON.stringify(state));
      }
      try {
        await distributedMissionManager.registerMissionListener({
          deviceId: "1234"
        }, {
          notifyMissionsChanged: NotifyMissionsChanged,
          notifySnapshot: NotifySnapshot,
          notifyNetDisconnect: NotifyNetDisconnect
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect(error.code).assertEqual(401);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_registerMissionListener_0020 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_registerMissionListener_0030
     * @tc.name    registerMissionListener with null deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_registerMissionListener_0030", 0, async function (done) {
      console.info("-----------------SUB_DMS_registerMissionListener_0030 start------------------------");
      let TAG = "SUB_DMS_registerMissionListener_0030";
      function NotifyMissionsChanged(deviceId) {
        console.info(TAG + 'NotifyMissionsChanged deviceId ' + JSON.stringify(deviceId));
      }
      function NotifySnapshot(deviceId, missionId) {
        console.info(TAG + 'NotifySnapshot deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifySnapshot missionId ' + JSON.stringify(missionId));
      }
      function NotifyNetDisconnect(deviceId, state) {
        console.info(TAG + 'NotifyNetDisconnect deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifyNetDisconnect state ' + JSON.stringify(state));
      }
      try {
        await distributedMissionManager.registerMissionListener({
          deviceId: ' '
        }, {
          notifyMissionsChanged: NotifyMissionsChanged,
          notifySnapshot: NotifySnapshot,
          notifyNetDisconnect: NotifyNetDisconnect
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect(error.code).assertEqual(401);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_registerMissionListener_0030 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_registerMissionListener_0040
     * @tc.name    registerMissionListener with localDeviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_registerMissionListener_0040", 0, async function (done) {
      console.info("-----------------SUB_DMS_registerMissionListener_0040 start------------------------");
      let TAG = "SUB_DMS_registerMissionListener_0040";
      function NotifyMissionsChanged(deviceId) {
        console.info(TAG + 'NotifyMissionsChanged deviceId ' + JSON.stringify(deviceId));
      }
      function NotifySnapshot(deviceId, missionId) {
        console.info(TAG + 'NotifySnapshot deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifySnapshot missionId ' + JSON.stringify(missionId));
      }
      function NotifyNetDisconnect(deviceId, state) {
        console.info(TAG + 'NotifyNetDisconnect deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifyNetDisconnect state ' + JSON.stringify(state));
      }
      try {
        await distributedMissionManager.registerMissionListener({
          deviceId: localDeviceId
        }, {
          notifyMissionsChanged: NotifyMissionsChanged,
          notifySnapshot: NotifySnapshot,
          notifyNetDisconnect: NotifyNetDisconnect
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect(error.code).assertEqual(401);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_registerMissionListener_0040 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_startSyncRemoteMissions_0010
     * @tc.name    startSyncRemoteMissions successful.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_startSyncRemoteMissions_0010", 0, async function (done) {
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_0010 start------------------------");
      let TAG = "SUB_DMS_startSyncRemoteMissions_0010";
      try {
        await distributedMissionManager.startSyncRemoteMissions({
          deviceId: dvId,
          fixConflict: false,
          tag: 0
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect(data).assertEqual(undefined);
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect().assertFail();
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_0010 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_startSyncRemoteMissions_0020
     * @tc.name    startSyncRemoteMissions with wrong deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_startSyncRemoteMissions_0020", 0, async function (done) {
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_0020 start------------------------");
      let TAG = "SUB_DMS_registerMissionListener_0010";
      try {
        await distributedMissionManager.startSyncRemoteMissions({
          deviceId: "12345",
          fixConflict: false,
          tag: 0
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect(error.code).assertEqual(401);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_0020 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_startSyncRemoteMissions_0030
     * @tc.name    startSyncRemoteMissions with null deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_startSyncRemoteMissions_0030", 0, async function (done) {
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_0030 start------------------------");
      let TAG = "SUB_DMS_startSyncRemoteMissions_0030";
      try {
        await distributedMissionManager.startSyncRemoteMissions({
          deviceId: ' ',
          fixConflict: false,
          tag: 0
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect(error.code).assertEqual(401);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_0030 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_startSyncRemoteMissions_0040
     * @tc.name    startSyncRemoteMissions with localDeviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_startSyncRemoteMissions_0040", 0, async function (done) {
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_0040 start------------------------");
      let TAG = "SUB_DMS_startSyncRemoteMissions_0040";
      try {
        await distributedMissionManager.startSyncRemoteMissions({
          deviceId: localDeviceId,
          fixConflict: false,
          tag: 0
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect(error.code).assertEqual(401);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_0040 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_stopSyncRemoteMissions_0010
     * @tc.name    stopSyncRemoteMissions successful.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_stopSyncRemoteMissions_0010", 0, async function (done) {
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_0010 start------------------------");
      let TAG = "SUB_DMS_stopSyncRemoteMissions_0010";
      try {
        await distributedMissionManager.stopSyncRemoteMissions({
          deviceId: dvId
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect(data).assertEqual(undefined);
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect().assertFail();
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_0010 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_stopSyncRemoteMissions_0020
     * @tc.name    stopSyncRemoteMissions with wrong deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_stopSyncRemoteMissions_0020", 0, async function (done) {
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_0020 start------------------------");
      let TAG = "SUB_DMS_stopSyncRemoteMissions_0020";
      try {
        await distributedMissionManager.stopSyncRemoteMissions({
          deviceId: "12345"
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect(error.code).assertEqual(16300501);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_0020 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_stopSyncRemoteMissions_0030
     * @tc.name    stopSyncRemoteMissions with null deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_stopSyncRemoteMissions_0030", 0, async function (done) {
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_0030 start------------------------");
      let TAG = "SUB_DMS_stopSyncRemoteMissions_0030";
      try {
        await distributedMissionManager.stopSyncRemoteMissions({
          deviceId: ' '
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect(error.code).assertEqual(16300501);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_0030 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_stopSyncRemoteMissions_0040
     * @tc.name    stopSyncRemoteMissions with localDeviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_stopSyncRemoteMissions_0040", 0, async function (done) {
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_0040 start------------------------");
      let TAG = "SUB_DMS_stopSyncRemoteMissions_0040";
      try {
        await distributedMissionManager.stopSyncRemoteMissions({
          deviceId: localDeviceId
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect(error.code).assertEqual(16300501);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_0040 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_unRegisterMissionListener_0010
     * @tc.name    unRegisterMissionListener with wrong deviceId after registerMissionListener.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_unRegisterMissionListener_0010", 0, async function (done) {
      console.info("-----------------SUB_DMS_unRegisterMissionListener_0010 start------------------------");
      let TAG = "SUB_DMS_unRegisterMissionListener_0010";
      try {
        await distributedMissionManager.unRegisterMissionListener({
          deviceId: "12345"
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect(error.code).assertEqual(16300501);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_unRegisterMissionListener_0010 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_unRegisterMissionListener_0020
     * @tc.name    unRegisterMissionListener successful.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_unRegisterMissionListener_0020", 0, async function (done) {
      console.info("-----------------SUB_DMS_unRegisterMissionListener_0020 start------------------------");
      let TAG = "SUB_DMS_unRegisterMissionListener_0020";
      try {
        await distributedMissionManager.unRegisterMissionListener({
          deviceId: dvId
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect(data).assertEqual(undefined);
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect().assertFail();
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_unRegisterMissionListener_0020 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_unRegisterMissionListener_0030
     * @tc.name    unRegisterMissionListener with wrong deviceId befoer registerMissionListener.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_unRegisterMissionListener_0030", 0, async function (done) {
      console.info("-----------------SUB_DMS_unRegisterMissionListener_0030 start------------------------");
      let TAG = "SUB_DMS_unRegisterMissionListener_0030";
      try {
        await distributedMissionManager.unRegisterMissionListener({
          deviceId: "12345"
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect(error.code).assertEqual(16300501);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_unRegisterMissionListener_0030 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_unRegisterMissionListener_0040
     * @tc.name    unRegisterMissionListener before registerMissionListener.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_unRegisterMissionListener_0040", 0, async function (done) {
      console.info("-----------------SUB_DMS_unRegisterMissionListener_0040 start------------------------");
      let TAG = "SUB_DMS_unRegisterMissionListener_0040";
      try {
        await distributedMissionManager.unRegisterMissionListener({
          deviceId: dvId
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect(error.code).assertEqual(16300501);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_unRegisterMissionListener_0040 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_unRegisterMissionListener_0050
     * @tc.name    unRegisterMissionListener with localDeviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_unRegisterMissionListener_0050", 0, async function (done) {
      console.info("-----------------SUB_DMS_unRegisterMissionListener_0050 start------------------------");
      let TAG = "SUB_DMS_unRegisterMissionListener_0050";
      try {
        await distributedMissionManager.unRegisterMissionListener({
          deviceId: localDeviceId
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          console.info(TAG + ' failed: ' + JSON.stringify(error.message));
          expect(error.code).assertEqual(16300501);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        console.info(TAG + ' catch: ' + JSON.stringify(error.message));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_unRegisterMissionListener_0050 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_registerMissionListener_CallBack_0010
     * @tc.name    registerMissionListener successful.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_registerMissionListener_CallBack_0010", 0, async function (done) {
      console.info("-----------------SUB_DMS_registerMissionListener_CallBack_0010 start------------------------");
      let TAG = "SUB_DMS_registerMissionListener_CallBack_0010";
      function NotifyMissionsChanged(deviceId) {
        console.info(TAG + 'NotifyMissionsChanged deviceId ' + JSON.stringify(deviceId));
      }
      function NotifySnapshot(deviceId, missionId) {
        console.info(TAG + 'NotifySnapshot deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifySnapshot missionId ' + JSON.stringify(missionId));
      }
      function NotifyNetDisconnect(deviceId, state) {
        console.info(TAG + 'NotifyNetDisconnect deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifyNetDisconnect state ' + JSON.stringify(state));
      }
      distributedMissionManager.registerMissionListener({
        deviceId: dvId
      }, {
        notifyMissionsChanged: NotifyMissionsChanged,
        notifySnapshot: NotifySnapshot,
        notifyNetDisconnect: NotifyNetDisconnect
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect().assertFail();
          } else {
            console.info('registerMissionListener finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect(data).assertEqual(undefined);
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_registerMissionListener_CallBack_0010 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_registerMissionListener_CallBack_0020
     * @tc.name    registerMissionListener with wrong deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_registerMissionListener_CallBack_0020", 0, async function (done) {
      console.info("-----------------SUB_DMS_registerMissionListener_CallBack_0020 start------------------------");
      let TAG = "SUB_DMS_registerMissionListener_CallBack_0020";
      function NotifyMissionsChanged(deviceId) {
        console.info(TAG + 'NotifyMissionsChanged deviceId ' + JSON.stringify(deviceId));
      }
      function NotifySnapshot(deviceId, missionId) {
        console.info(TAG + 'NotifySnapshot deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifySnapshot missionId ' + JSON.stringify(missionId));
      }
      function NotifyNetDisconnect(deviceId, state) {
        console.info(TAG + 'NotifyNetDisconnect deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifyNetDisconnect state ' + JSON.stringify(state));
      }
      distributedMissionManager.registerMissionListener({
        deviceId: "1234"
      }, {
        notifyMissionsChanged: NotifyMissionsChanged,
        notifySnapshot: NotifySnapshot,
        notifyNetDisconnect: NotifyNetDisconnect
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect(error.code).assertEqual(401);
          } else {
            console.info('registerMissionListener finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect().assertFail();
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_registerMissionListener_CallBack_0020 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_registerMissionListener_CallBack_0030
     * @tc.name    registerMissionListener with null deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_registerMissionListener_CallBack_0030", 0, async function (done) {
      console.info("-----------------SUB_DMS_registerMissionListener_CallBack_0030 start------------------------");
      let TAG = "SUB_DMS_registerMissionListener_CallBack_0030";
      function NotifyMissionsChanged(deviceId) {
        console.info(TAG + 'NotifyMissionsChanged deviceId ' + JSON.stringify(deviceId));
      }
      function NotifySnapshot(deviceId, missionId) {
        console.info(TAG + 'NotifySnapshot deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifySnapshot missionId ' + JSON.stringify(missionId));
      }
      function NotifyNetDisconnect(deviceId, state) {
        console.info(TAG + 'NotifyNetDisconnect deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifyNetDisconnect state ' + JSON.stringify(state));
      }
      distributedMissionManager.registerMissionListener({
        deviceId: ' '
      }, {
        notifyMissionsChanged: NotifyMissionsChanged,
        notifySnapshot: NotifySnapshot,
        notifyNetDisconnect: NotifyNetDisconnect
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect(error.code).assertEqual(401);
          } else {
            console.info('registerMissionListener finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect().assertFail();
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_registerMissionListener_CallBack_0030 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_registerMissionListener_CallBack_0040
     * @tc.name    registerMissionListener with localDeviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_registerMissionListener_CallBack_0040", 0, async function (done) {
      console.info("-----------------SUB_DMS_registerMissionListener_CallBack_0040 start------------------------");
      let TAG = "SUB_DMS_registerMissionListener_CallBack_0040";
      function NotifyMissionsChanged(deviceId) {
        console.info(TAG + 'NotifyMissionsChanged deviceId ' + JSON.stringify(deviceId));
      }
      function NotifySnapshot(deviceId, missionId) {
        console.info(TAG + 'NotifySnapshot deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifySnapshot missionId ' + JSON.stringify(missionId));
      }
      function NotifyNetDisconnect(deviceId, state) {
        console.info(TAG + 'NotifyNetDisconnect deviceId ' + JSON.stringify(deviceId));
        console.info(TAG + 'NotifyNetDisconnect state ' + JSON.stringify(state));
      }
      distributedMissionManager.registerMissionListener({
        deviceId: localDeviceId
      }, {
        notifyMissionsChanged: NotifyMissionsChanged,
        notifySnapshot: NotifySnapshot,
        notifyNetDisconnect: NotifyNetDisconnect
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect(error.code).assertEqual(401);
          } else {
            console.info('registerMissionListener finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect().assertFail();
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_registerMissionListener_CallBack_0040 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_startSyncRemoteMissions_CallBack_0010
     * @tc.name    startSyncRemoteMissions successful.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_startSyncRemoteMissions_CallBack_0010", 0, async function (done) {
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_CallBack_0010 start------------------------");
      let TAG = "SUB_DMS_startSyncRemoteMissions_CallBack_0010";
      distributedMissionManager.startSyncRemoteMissions({
        deviceId: dvId,
        fixConflict: false,
        tag: 0
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect().assertFail();
          } else {
            console.info('startSyncRemoteMissions finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect(data).assertEqual(undefined);
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_CallBack_0010 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_startSyncRemoteMissions_CallBack_0020
     * @tc.name    startSyncRemoteMissions with wrong deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_startSyncRemoteMissions_CallBack_0020", 0, async function (done) {
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_CallBack_0020 start------------------------");
      let TAG = "SUB_DMS_startSyncRemoteMissions_CallBack_0020";
      distributedMissionManager.startSyncRemoteMissions({
        deviceId: '12345',
        fixConflict: false,
        tag: 0
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect(error.code).assertEqual(401);
          } else {
            console.info('startSyncRemoteMissions finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect().assertFail();
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_CallBack_0020 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_startSyncRemoteMissions_CallBack_0030
     * @tc.name    startSyncRemoteMissions with null deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_startSyncRemoteMissions_CallBack_0030", 0, async function (done) {
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_CallBack_0030 start------------------------");
      let TAG = "SUB_DMS_startSyncRemoteMissions_CallBack_0030";
      distributedMissionManager.startSyncRemoteMissions({
        deviceId: ' ',
        fixConflict: false,
        tag: 0
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect(error.code).assertEqual(401);
          } else {
            console.info('startSyncRemoteMissions finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect().assertFail();
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_CallBack_0030 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_startSyncRemoteMissions_CallBack_0040
     * @tc.name    startSyncRemoteMissions with localDeviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_startSyncRemoteMissions_CallBack_0040", 0, async function (done) {
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_CallBack_0040 start------------------------");
      let TAG = "SUB_DMS_startSyncRemoteMissions_CallBack_0040";
      distributedMissionManager.startSyncRemoteMissions({
        deviceId: localDeviceId,
        fixConflict: false,
        tag: 0
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect(error.code).assertEqual(401);
          } else {
            console.info('startSyncRemoteMissions finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect().assertFail();
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_startSyncRemoteMissions_CallBack_0040 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_stopSyncRemoteMissions_CallBack_0010
     * @tc.name    stopSyncRemoteMissions successful.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_stopSyncRemoteMissions_CallBack_0010", 0, async function (done) {
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_CallBack_0010 start------------------------");
      let TAG = "SUB_DMS_stopSyncRemoteMissions_CallBack_0010";
      distributedMissionManager.stopSyncRemoteMissions({
        deviceId: dvId
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect().assertFail();
          } else {
            console.info('stopSyncRemoteMissions finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect(data).assertEqual(undefined);
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_CallBack_0010 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_stopSyncRemoteMissions_CallBack_0020
     * @tc.name    stopSyncRemoteMissions with wrong deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_stopSyncRemoteMissions_CallBack_0020", 0, async function (done) {
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_CallBack_0020 start------------------------");
      let TAG = "SUB_DMS_stopSyncRemoteMissions_CallBack_0020";
      distributedMissionManager.stopSyncRemoteMissions({
        deviceId: '12345'
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect(error.code).assertEqual(16300501);
          } else {
            console.info('stopSyncRemoteMissions finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect().assertFail();
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_CallBack_0020 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_stopSyncRemoteMissions_CallBack_0030
     * @tc.name    stopSyncRemoteMissions with null deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_stopSyncRemoteMissions_CallBack_0030", 0, async function (done) {
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_CallBack_0030 start------------------------");
      let TAG = "SUB_DMS_stopSyncRemoteMissions_CallBack_0030";
      distributedMissionManager.stopSyncRemoteMissions({
        deviceId: ' '
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect(error.code).assertEqual(16300501);
          } else {
            console.info('stopSyncRemoteMissions finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect().assertFail();
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_CallBack_0030 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_stopSyncRemoteMissions_CallBack_0040
     * @tc.name    stopSyncRemoteMissions with localDeviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_stopSyncRemoteMissions_CallBack_0040", 0, async function (done) {
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_CallBack_0040 start------------------------");
      let TAG = "SUB_DMS_stopSyncRemoteMissions_CallBack_0040";
      distributedMissionManager.stopSyncRemoteMissions({
        deviceId: localDeviceId
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect(error.code).assertEqual(16300501);
          } else {
            console.info('stopSyncRemoteMissions finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect().assertFail();
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_stopSyncRemoteMissions_CallBack_0040 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_unRegisterMissionListener_CallBack_0010
     * @tc.name    unRegisterMissionListener with wrong deviceId after registerMissionListener.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_unRegisterMissionListener_CallBack_0010", 0, async function (done) {
      console.info("-----------------SUB_DMS_unRegisterMissionListener_CallBack_0010 start------------------------");
      let TAG = "SUB_DMS_unRegisterMissionListener_CallBack_0010";
      distributedMissionManager.unRegisterMissionListener({
        deviceId: '12345'
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect(error.code).assertEqual(16300501);
          } else {
            console.info('unRegisterMissionListener finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect().assertFail();
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_unRegisterMissionListener_CallBack_0010 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_unRegisterMissionListener_CallBack_0020
     * @tc.name    unRegisterMissionListener successful.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_unRegisterMissionListener_CallBack_0020", 0, async function (done) {
      console.info("-----------------SUB_DMS_unRegisterMissionListener_CallBack_0020 start------------------------");
      let TAG = "SUB_DMS_unRegisterMissionListener_CallBack_0020";
      distributedMissionManager.unRegisterMissionListener({
        deviceId: dvId
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect().assertFail();
          } else {
            console.info('unRegisterMissionListener finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect(data).assertEqual(undefined);
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_unRegisterMissionListener_CallBack_0020 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_unRegisterMissionListener_CallBack_0030
     * @tc.name    unRegisterMissionListener with wrong deviceId befoer registerMissionListener.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_unRegisterMissionListener_CallBack_0030", 0, async function (done) {
      console.info("-----------------SUB_DMS_unRegisterMissionListener_CallBack_0030 start------------------------");
      let TAG = "SUB_DMS_unRegisterMissionListener_CallBack_0030";
      distributedMissionManager.unRegisterMissionListener({
        deviceId: '12345'
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect(error.code).assertEqual(16300501);
          } else {
            console.info('unRegisterMissionListener finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect().assertFail();
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_unRegisterMissionListener_CallBack_0030 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_unRegisterMissionListener_CallBack_0040
     * @tc.name    unRegisterMissionListener before registerMissionListener.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_unRegisterMissionListener_CallBack_0040", 0, async function (done) {
      console.info("-----------------SUB_DMS_unRegisterMissionListener_CallBack_0040 start------------------------");
      let TAG = "SUB_DMS_unRegisterMissionListener_CallBack_0040";
      distributedMissionManager.unRegisterMissionListener({
        deviceId: dvId
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect(error.code).assertEqual(16300501);
          } else {
            console.info('unRegisterMissionListener finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect().assertFail()
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_unRegisterMissionListener_CallBack_0040 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_unRegisterMissionListener_CallBack_0050
     * @tc.name    unRegisterMissionListener successful.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_unRegisterMissionListener_CallBack_0050", 0, async function (done) {
      console.info("-----------------SUB_DMS_unRegisterMissionListener_CallBack_0050 start------------------------");
      let TAG = "SUB_DMS_unRegisterMissionListener_CallBack_0050";
      distributedMissionManager.unRegisterMissionListener({
        deviceId: localDeviceId
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(error.code));
            console.info(TAG + ' failed: ' + JSON.stringify(error.message));
            expect(error.code).assertEqual(16300501);
          } else {
            console.info('unRegisterMissionListener finished');
            console.info(TAG + ' finished: ' + JSON.stringify(data));
            expect().assertFail();
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_unRegisterMissionListener_CallBack_0050 end------------------------");
    });

    /**
    * @tc.number   SUB_DMS_on_0010
    * @tc.name     register on successful.
    * @tc.desc     Test on function
    * @tc.level    0
    */
    it('SUB_DMS_on_0010', 0, function (done) {
      console.info("---------------------SUB_DMS_on_0010 start---------------------------");
      let TAG = "SUB_DMS_on_0010";
      function onCall(data) {
        console.info(TAG + " onCall : result : " + JSON.stringify(data));
        if (data.info) {
          console.info(TAG + " onCall : srcDeviceId = " + data.info.srcDeviceId);
          console.info(TAG + " onCall : bundleName = " + data.info.bundleName);
        }
      }
      try {
        distributedMissionManager.on('continueStateChange', onCall);
        done();
      } catch {
        expect().assertFail();
        done();
      }
      console.info("---------------------SUB_DMS_on_0010 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_off_0010
    * @tc.name     unRegister off successful.
    * @tc.desc     Test off function
    * @tc.level    0
    */
    it('SUB_DMS_off_0010', 0, function (done) {
      console.info("---------------------SUB_DMS_off_0010 start---------------------------");
      let TAG = "SUB_DMS_off_0010";
      function offCall(data) {
        console.info(TAG + " offCall: result : " + JSON.stringify(data));
      }
      try {
        distributedMissionManager.off('continueStateChange', offCall);
        done();
      } catch {
        expect().assertFail();
        done();
      }
      console.info("---------------------SUB_DMS_off_0010 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_CallBack_0010
    * @tc.name     continueMission with wrong bundleName.
    * @tc.desc     Test continueMission callback function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_CallBack_0010', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_CallBack_0010 start---------------------------");
      let TAG = "SUB_DMS_continueMission_CallBack_0010";
      try {
        distributedMissionManager.continueMission({
          srcDeviceId: localDeviceId,
          dstDeviceId: dvId,
          bundleName: "wrongtest",
          wantParam: { "key": "value" }
        }, (error, data) => {
          if (error && error.code !== 0) {
            console.error(TAG + ' failed, cause: ' + JSON.stringify(error));
            expect(error.code).assertEqual(401);
            done();
          } else {
            console.info(TAG + ' finished' + JSON.stringify(data));
            expect().assertFail();
            done();
          }
        })
      } catch (error) {
        console.error(TAG + ' error, cause: ' + JSON.stringify(error));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_CallBack_0010 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_CallBack_0020
    * @tc.name     continueMission with null bundleName.
    * @tc.desc     Test continueMission callback function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_CallBack_0020', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_CallBack_0020 start---------------------------");
      let TAG = "SUB_DMS_continueMission_CallBack_0020";
      try {
        distributedMissionManager.continueMission({
          srcDeviceId: localDeviceId,
          dstDeviceId: dvId,
          bundleName: " ",
          wantParam: { "key": "value" }
        }, (error, data) => {
          if (error && error.code !== 0) {
            console.error(TAG + ' failed, cause: ' + JSON.stringify(error));
            expect(error.code).assertEqual(401);
            done();
          } else {
            console.info(TAG + ' finished' + JSON.stringify(data));
            expect().assertFail();
            done();
          }
        })
      } catch (error) {
        console.error(TAG + ' error, cause: ' + JSON.stringify(error));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_CallBack_0020 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_CallBack_0030
    * @tc.name     continueMission with undefined bundleName.
    * @tc.desc     Test continueMission callback function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_CallBack_0030', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_CallBack_0030 start---------------------------");
      let TAG = "SUB_DMS_continueMission_CallBack_0030";
      try {
        distributedMissionManager.continueMission({
          srcDeviceId: localDeviceId,
          dstDeviceId: dvId,
          bundleName: undefined,
          wantParam: { "key": "value" }
        }, (error, data) => {
          if (error && error.code !== 0) {
            console.error(TAG + ' failed, cause: ' + JSON.stringify(error));
            expect().assertFail();
            done();
          } else {
            console.info(TAG + ' finished' + JSON.stringify(data));
            expect().assertFail();
            done();
          }
        })
      } catch (error) {
        console.error(TAG + ' error, cause: ' + JSON.stringify(error));
        expect(error.code).assertEqual(401);
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_CallBack_0030 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_CallBack_0040
    * @tc.name     continueMission with wrong srcDeviceId.
    * @tc.desc     Test continueMission callback function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_CallBack_0040', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_CallBack_0040 start---------------------------");
      let TAG = "SUB_DMS_continueMission_CallBack_0040";
      try {
        distributedMissionManager.continueMission({
          srcDeviceId: '12345',
          dstDeviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstagetest",
          wantParam: { "key": "value" }
        }, (error, data) => {
          if (error && error.code !== 0) {
            console.error(TAG + ' failed, cause: ' + JSON.stringify(error));
            expect(error.code).assertEqual(16300505);
            done();
          } else {
            console.info(TAG + ' finished' + JSON.stringify(data));
            expect().assertFail();
            done();
          }
        })
      } catch (error) {
        console.error(TAG + ' error, cause: ' + JSON.stringify(error));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_CallBack_0040 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_CallBack_0050
    * @tc.name     continueMission with undefined srcDeviceId.
    * @tc.desc     Test continueMission callback function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_CallBack_0050', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_CallBack_0050 start---------------------------");
      let TAG = "SUB_DMS_continueMission_CallBack_0050";
      try {
        distributedMissionManager.continueMission({
          srcDeviceId: undefined,
          dstDeviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstagetest",
          wantParam: { "key": "value" }
        }, (error, data) => {
          if (error && error.code !== 0) {
            console.error(TAG + ' failed, cause: ' + JSON.stringify(error));
            expect().assertFail();
            done();
          } else {
            console.info(TAG + ' finished' + JSON.stringify(data));
            expect().assertFail();
            done();
          }
        })
      } catch (error) {
        console.error(TAG + ' error, cause: ' + JSON.stringify(error));
        expect(error.code).assertEqual(401);
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_CallBack_0050 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_CallBack_0060
    * @tc.name     continueMission with wrong dstDeviceId.
    * @tc.desc     Test continueMission callback function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_CallBack_0060', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_CallBack_0060 start---------------------------");
      let TAG = "SUB_DMS_continueMission_CallBack_0060";
      try {
        distributedMissionManager.continueMission({
          srcDeviceId: localDeviceId,
          dstDeviceId: '12345',
          bundleName: "com.acts.example.dmsfwkstagetest",
          wantParam: { "key": "value" }
        }, (error, data) => {
          if (error && error.code !== 0) {
            console.error(TAG + ' failed, cause: ' + JSON.stringify(error));
            expect(error.code).assertEqual(16300501);
            done();
          } else {
            console.info(TAG + ' finished' + JSON.stringify(data));
            expect().assertFail();
            done();
          }
        })
      } catch (error) {
        console.error(TAG + ' error, cause: ' + JSON.stringify(error));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_CallBack_0060 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_CallBack_0070
    * @tc.name     continueMission with null dstDeviceId.
    * @tc.desc     Test continueMission callback function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_CallBack_0070', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_CallBack_0070 start---------------------------");
      let TAG = "SUB_DMS_continueMission_CallBack_0070";
      try {
        distributedMissionManager.continueMission({
          srcDeviceId: localDeviceId,
          dstDeviceId: ' ',
          bundleName: "com.acts.example.dmsfwkstagetest",
          wantParam: { "key": "value" }
        }, (error, data) => {
          if (error && error.code !== 0) {
            console.error(TAG + ' failed, cause: ' + JSON.stringify(error));
            expect(error.code).assertEqual(16300501);
            done();
          } else {
            console.info(TAG + ' finished' + JSON.stringify(data));
            expect().assertFail();
            done();
          }
        })
      } catch (error) {
        console.error(TAG + ' error, cause: ' + JSON.stringify(error));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_CallBack_0070 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_CallBack_0080
    * @tc.name     continueMission with undefined dstDeviceId.
    * @tc.desc     Test continueMission callback function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_CallBack_0080', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_CallBack_0080 start---------------------------");
      let TAG = "SUB_DMS_continueMission_CallBack_0080";
      try {
        distributedMissionManager.continueMission({
          srcDeviceId: localDeviceId,
          dstDeviceId: undefined,
          bundleName: "com.acts.example.dmsfwkstagetest",
          wantParam: { "key": "value" }
        }, (error, data) => {
          if (error && error.code !== 0) {
            console.error(TAG + ' failed, cause: ' + JSON.stringify(error));
            expect().assertFail();
            done();
          } else {
            console.info(TAG + ' finished' + JSON.stringify(data));
            expect().assertFail();
            done();
          }
        })
      } catch (error) {
        console.error(TAG + ' error, cause: ' + JSON.stringify(error));
        expect(error.code).assertEqual(401);
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_CallBack_0080 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_CallBack_0090
    * @tc.name     continueMission with wrong srcDeviceId.
    * @tc.desc     Test continueMission callback function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_CallBack_0090', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_CallBack_0090 start---------------------------");
      let TAG = "SUB_DMS_continueMission_CallBack_0090";
      let allLocalMissions = await missionManager.getMissionInfos("", 20).catch(function (err) {
        console.info(TAG + 'getMissionInfos err,' + err);
      });
      let localMissionId = await allLocalMissions[0].missionId;
      console.info(TAG + 'localMissionId is,' + localMissionId);
      function onContinueDone(resultCode) {
        console.info(TAG + 'onContinueDone resultCode: ' + JSON.stringify(resultCode));
      };
      try {
        distributedMissionManager.continueMission({
          srcDeviceId: '12345',
          dstDeviceId: dvId,
          missionId: localMissionId,
          wantParam: { "key": "value" }
        }, {
          onContinueDone: onContinueDone
        }, (error, data) => {
          if (error && error.code !== 0) {
            console.error(TAG + ' failed, cause: ' + JSON.stringify(error));
            expect(error.code).assertEqual(16300505);
            done();
          } else {
            console.info(TAG + ' finished' + JSON.stringify(data));
            expect().assertFail();
            done();
          }
        })
      } catch (error) {
        console.error(TAG + ' error, cause: ' + JSON.stringify(error));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_CallBack_0090 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_CallBack_0100
    * @tc.name     continueMission with undefined srcDeviceId.
    * @tc.desc     Test continueMission callback function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_CallBack_0100', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_CallBack_0100 start---------------------------");
      let TAG = "SUB_DMS_continueMission_CallBack_0100";
      let allLocalMissions = await missionManager.getMissionInfos("", 20).catch(function (err) {
        console.info(TAG + 'getMissionInfos err,' + err);
      });
      let localMissionId = await allLocalMissions[0].missionId;
      console.info(TAG + 'localMissionId is,' + localMissionId);
      function onContinueDone(resultCode) {
        console.info(TAG + 'onContinueDone resultCode: ' + JSON.stringify(resultCode));
      };
      try {
        distributedMissionManager.continueMission({
          srcDeviceId: undefined,
          dstDeviceId: dvId,
          missionId: localMissionId,
          wantParam: { "key": "value" }
        }, {
          onContinueDone: onContinueDone
        }, (error, data) => {
          if (error && error.code !== 0) {
            console.error(TAG + ' failed, cause: ' + JSON.stringify(error));
            expect().assertFail();
            done();
          } else {
            console.info(TAG + ' finished' + JSON.stringify(data));
            expect().assertFail();
            done();
          }
        })
      } catch (error) {
        console.error(TAG + ' error, cause: ' + JSON.stringify(error));
        expect(error.code).assertEqual(401);
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_CallBack_0100 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_CallBack_0110
    * @tc.name     continueMission with wrong dstDeviceId.
    * @tc.desc     Test continueMission callback function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_CallBack_0110', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_CallBack_0110 start---------------------------");
      let TAG = "SUB_DMS_continueMission_CallBack_0110";
      let allLocalMissions = await missionManager.getMissionInfos("", 20).catch(function (err) {
        console.info(TAG + 'getMissionInfos err,' + err);
      });
      let localMissionId = await allLocalMissions[0].missionId;
      console.info(TAG + 'localMissionId is,' + localMissionId);
      function onContinueDone(resultCode) {
        console.info(TAG + 'onContinueDone resultCode: ' + JSON.stringify(resultCode));
      };
      try {
        distributedMissionManager.continueMission({
          srcDeviceId: localDeviceId,
          dstDeviceId: '12345',
          missionId: localMissionId,
          wantParam: { "key": "value" }
        }, {
          onContinueDone: onContinueDone
        }, (error, data) => {
          if (error && error.code !== 0) {
            console.error(TAG + ' failed, cause: ' + JSON.stringify(error));
            expect(error.code).assertEqual(16300501);
            done();
          } else {
            console.info(TAG + ' finished' + JSON.stringify(data));
            expect().assertFail();
            done();
          }
        })
      } catch (error) {
        console.error(TAG + ' error, cause: ' + JSON.stringify(error));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_CallBack_0110 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_CallBack_0120
    * @tc.name     continueMission with null dstDeviceId.
    * @tc.desc     Test continueMission callback function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_CallBack_0120', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_CallBack_0120 start---------------------------");
      let TAG = "SUB_DMS_continueMission_CallBack_0120";
      let allLocalMissions = await missionManager.getMissionInfos("", 20).catch(function (err) {
        console.info(TAG + 'getMissionInfos err,' + err);
      });
      let localMissionId = await allLocalMissions[0].missionId;
      console.info(TAG + 'localMissionId is,' + localMissionId);
      function onContinueDone(resultCode) {
        console.info(TAG + 'onContinueDone resultCode: ' + JSON.stringify(resultCode));
      };
      try {
        distributedMissionManager.continueMission({
          srcDeviceId: localDeviceId,
          dstDeviceId: ' ',
          missionId: localMissionId,
          wantParam: { "key": "value" }
        }, {
          onContinueDone: onContinueDone
        }, (error, data) => {
          if (error && error.code !== 0) {
            console.error(TAG + ' failed, cause: ' + JSON.stringify(error));
            expect(error.code).assertEqual(16300501);
            done();
          } else {
            console.info(TAG + ' finished' + JSON.stringify(data));
            expect().assertFail();
            done();
          }
        })
      } catch (error) {
        console.error(TAG + ' error, cause: ' + JSON.stringify(error));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_CallBack_0120 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_CallBack_0130
    * @tc.name     continueMission with undefined dstDeviceId.
    * @tc.desc     Test continueMission callback function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_CallBack_0130', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_CallBack_0130 start---------------------------");
      let TAG = "SUB_DMS_continueMission_CallBack_0130";
      let allLocalMissions = await missionManager.getMissionInfos("", 20).catch(function (err) {
        console.info(TAG + 'getMissionInfos err,' + err);
      });
      let localMissionId = await allLocalMissions[0].missionId;
      console.info(TAG + 'localMissionId is,' + localMissionId);
      function onContinueDone(resultCode) {
        console.info(TAG + 'onContinueDone resultCode: ' + JSON.stringify(resultCode));
      };
      try {
        distributedMissionManager.continueMission({
          srcDeviceId: localDeviceId,
          dstDeviceId: undefined,
          missionId: localMissionId,
          wantParam: { "key": "value" }
        }, {
          onContinueDone: onContinueDone
        }, (error, data) => {
          if (error && error.code !== 0) {
            console.error(TAG + ' failed, cause: ' + JSON.stringify(error));
            expect().assertFail();
            done();
          } else {
            console.info(TAG + ' finished' + JSON.stringify(data));
            expect().assertFail();
            done();
          }
        })
      } catch (error) {
        console.error(TAG + ' error, cause: ' + JSON.stringify(error));
        expect(error.code).assertEqual(401);
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_CallBack_0130 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_CallBack_0140
    * @tc.name     continue successful.
    * @tc.desc     Test continueMission callback function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_CallBack_0140', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_CallBack_0140 start---------------------------");
      let TAG = "SUB_DMS_continueMission_CallBack_0140";
      let allLocalMissions = await missionManager.getMissionInfos("", 20).catch(function (err) {
        console.info(TAG + 'getMissionInfos err,' + err);
      });
      let localMissionId = await allLocalMissions[0].missionId;
      console.info(TAG + 'localMissionId is,' + localMissionId);
      function onContinueDone(resultCode) {
        console.info(TAG + 'onContinueDone resultCode: ' + JSON.stringify(resultCode));
      };
      try {
        distributedMissionManager.continueMission({
          srcDeviceId: localDeviceId,
          dstDeviceId: dvId,
          missionId: localMissionId,
          wantParam: { "key": "value" }
        }, {
          onContinueDone: onContinueDone
        }, (error, data) => {
          if (error && error.code !== 0) {
            console.error(TAG + ' failed, cause: ' + JSON.stringify(error));
            expect().assertFail();
            done();
          } else {
            console.info(TAG + ' finished' + JSON.stringify(data));
            expect(data).assertEqual(undefined);
            done();
          }
        })
      } catch (error) {
        console.error(TAG + ' error, cause: ' + JSON.stringify(error));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_CallBack_0140 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_0010
    * @tc.name     continueMission with wrong bundleName.
    * @tc.desc     Test continueMission promise function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_0010', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_0010 start---------------------------");
      let TAG = "SUB_DMS_continueMission_0010";
      try {
        let param = {
          srcDeviceId: localDeviceId,
          dstDeviceId: dvId,
          bundleName: "test",
          wantParam: { "key": "value" }
        };
        await distributedMissionManager.continueMission(param).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error));
          expect(error.code).assertEqual(401);
          done();
        });
      } catch (error) {
        expect().assertFail();
        console.info(TAG + ' catch: ' + JSON.stringify(error));
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_0010 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_0020
    * @tc.name     continueMission with null bundleName.
    * @tc.desc     Test continueMission promise function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_0020', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_0020 start---------------------------");
      let TAG = "SUB_DMS_continueMission_0020";
      try {
        let param = {
          srcDeviceId: localDeviceId,
          dstDeviceId: dvId,
          bundleName: " ",
          wantParam: { "key": "value" }
        };
        await distributedMissionManager.continueMission(param).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error));
          expect(error.code).assertEqual(401);
          done();
        });
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_0020 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_0030
    * @tc.name     continueMission with undefined bundleName.
    * @tc.desc     Test continueMission promise function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_0030', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_0030 start---------------------------");
      let TAG = "SUB_DMS_continueMission_0030";
      try {
        let param = {
          srcDeviceId: localDeviceId,
          dstDeviceId: dvId,
          bundleName: undefined,
          wantParam: { "key": "value" }
        };
        await distributedMissionManager.continueMission(param).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error));
          expect().assertFail();
          done();
        });
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error));
        expect(error.code).assertEqual(401);
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_0030 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_0040
    * @tc.name     continueMission with wrong srcDeviceId.
    * @tc.desc     Test continueMission promise function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_0040', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_0040 start---------------------------");
      let TAG = "SUB_DMS_continueMission_0040";
      try {
        let param = {
          srcDeviceId: '12345',
          dstDeviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstagetest",
          wantParam: { "key": "value" }
        };
        await distributedMissionManager.continueMission(param).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error));
          expect(error.code).assertEqual(16300505);
          done();
        });
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_0040 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_0050
    * @tc.name     continueMission with undefined srcDeviceId.
    * @tc.desc     Test continueMission promise function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_0050', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_0050 start---------------------------");
      let TAG = "SUB_DMS_continueMission_0050";
      try {
        let param = {
          srcDeviceId: undefined,
          dstDeviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstagetest",
          wantParam: { "key": "value" }
        };
        await distributedMissionManager.continueMission(param).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error));
          expect().assertFail();
          done();
        });
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error));
        expect(error.code).assertEqual(401);
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_0050 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_0060
    * @tc.name     continueMission with wrong dstDeviceId.
    * @tc.desc     Test continueMission promise function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_0060', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_0060 start---------------------------");
      let TAG = "SUB_DMS_continueMission_0060";
      try {
        let param = {
          srcDeviceId: localDeviceId,
          dstDeviceId: '12345',
          bundleName: "com.acts.example.dmsfwkstagetest",
          wantParam: { "key": "value" }
        };
        await distributedMissionManager.continueMission(param).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error));
          expect(error.code).assertEqual(16300501);
          done();
        });
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_0060 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_0070
    * @tc.name     continueMission with null dstDeviceId.
    * @tc.desc     Test continueMission promise function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_0070', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_0070 start---------------------------");
      let TAG = "SUB_DMS_continueMission_0070";
      try {
        let param = {
          srcDeviceId: localDeviceId,
          dstDeviceId: ' ',
          bundleName: "com.acts.example.dmsfwkstagetest",
          wantParam: { "key": "value" }
        };
        await distributedMissionManager.continueMission(param).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error));
          expect(error.code).assertEqual(16300501);
          done();
        });
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_0070 end---------------------------");
    });

    /**
    * @tc.number   SUB_DMS_continueMission_0080
    * @tc.name     continueMission with undefined dstDeviceId.
    * @tc.desc     Test continueMission promise function
    * @tc.level    0
    */
    it('SUB_DMS_continueMission_0080', 0, async function (done) {
      console.info("---------------------SUB_DMS_continueMission_0080 start---------------------------");
      let TAG = "SUB_DMS_continueMission_0080";
      try {
        let param = {
          srcDeviceId: localDeviceId,
          dstDeviceId: undefined,
          bundleName: "com.acts.example.dmsfwkstagetest",
          wantParam: { "key": "value" }
        };
        await distributedMissionManager.continueMission(param).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error));
          expect().assertFail();
          done();
        });
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error));
        expect(error.code).assertEqual(401);
        done();
      }
      await sleep(1000);
      console.info("---------------------SUB_DMS_continueMission_0080 end---------------------------");
    });

    /*
     * @tc.number  SUB_DMS_continueMission_0090
     * @tc.name    continueMission with wrong srcDeviceId.
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_DMS_continueMission_0090", 0, async function (done) {
      console.info("-----------------SUB_DMS_continueMission_0090 start------------------------");
      let TAG = "SUB_DMS_continueMission_0090";
      let allLocalMissions = await missionManager.getMissionInfos("", 20).catch(function (err) {
        console.info(TAG + 'getMissionInfos err,' + err);
      });
      let localMissionId = await allLocalMissions[0].missionId;
      console.info(TAG + 'localMissionId is,' + localMissionId);
      function onContinueDone(resultCode) {
        console.info(TAG + 'onContinueDone resultCode: ' + JSON.stringify(resultCode));
      };
      try {
        await distributedMissionManager.continueMission({
          srcDeviceId: '12345',
          dstDeviceId: dvId,
          missionId: localMissionId,
          wantParam: { "key": "value" }
        }, {
          onContinueDone: onContinueDone
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          expect(error.code).assertEqual(16300505);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_continueMission_0090 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_continueMission_0100
     * @tc.name    continueMission with undefined srcDeviceId.
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_DMS_continueMission_0100", 0, async function (done) {
      console.info("-----------------SUB_DMS_continueMission_0100 start------------------------");
      let TAG = "SUB_DMS_continueMission_0100";
      let allLocalMissions = await missionManager.getMissionInfos("", 20).catch(function (err) {
        console.info(TAG + 'getMissionInfos err,' + err);
      });
      let localMissionId = await allLocalMissions[0].missionId;
      console.info(TAG + 'localMissionId is,' + localMissionId);
      function onContinueDone(resultCode) {
        console.info(TAG + 'onContinueDone resultCode: ' + JSON.stringify(resultCode));
      };
      try {
        await distributedMissionManager.continueMission({
          srcDeviceId: undefined,
          dstDeviceId: dvId,
          missionId: localMissionId,
          wantParam: { "key": "value" }
        }, {
          onContinueDone: onContinueDone
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          expect().assertFail();
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        expect(error.code).assertEqual(401);
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_continueMission_0100 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_continueMission_0110
     * @tc.name    continueMission with wrong dstDeviceId.
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_DMS_continueMission_0110", 0, async function (done) {
      console.info("-----------------SUB_DMS_continueMission_0110 start------------------------");
      let TAG = "SUB_DMS_continueMission_0110";
      let allLocalMissions = await missionManager.getMissionInfos("", 20).catch(function (err) {
        console.info(TAG + 'getMissionInfos err,' + err);
      });
      let localMissionId = await allLocalMissions[0].missionId;
      console.info(TAG + 'localMissionId is,' + localMissionId);
      function onContinueDone(resultCode) {
        console.info(TAG + 'onContinueDone resultCode: ' + JSON.stringify(resultCode));
      };
      try {
        await distributedMissionManager.continueMission({
          srcDeviceId: localDeviceId,
          dstDeviceId: '12345',
          missionId: localMissionId,
          wantParam: { "key": "value" }
        }, {
          onContinueDone: onContinueDone
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          expect(error.code).assertEqual(16300501);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_continueMission_0110 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_continueMission_0120
     * @tc.name    continueMission with null dstDeviceId.
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_DMS_continueMission_0120", 0, async function (done) {
      console.info("-----------------SUB_DMS_continueMission_0120 start------------------------");
      let TAG = "SUB_DMS_continueMission_0120";
      let allLocalMissions = await missionManager.getMissionInfos("", 20).catch(function (err) {
        console.info(TAG + 'getMissionInfos err,' + err);
      });
      let localMissionId = await allLocalMissions[0].missionId;
      console.info(TAG + 'localMissionId is,' + localMissionId);
      function onContinueDone(resultCode) {
        console.info(TAG + 'onContinueDone resultCode: ' + JSON.stringify(resultCode));
      };
      try {
        await distributedMissionManager.continueMission({
          srcDeviceId: localDeviceId,
          dstDeviceId: ' ',
          missionId: localMissionId,
          wantParam: { "key": "value" }
        }, {
          onContinueDone: onContinueDone
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          expect(error.code).assertEqual(16300501);
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_continueMission_0120 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_continueMission_0130
     * @tc.name    continueMission with undefined dstDeviceId.
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_DMS_continueMission_0130", 0, async function (done) {
      console.info("-----------------SUB_DMS_continueMission_0130 start------------------------");
      let TAG = "SUB_DMS_continueMission_0130";
      let allLocalMissions = await missionManager.getMissionInfos("", 20).catch(function (err) {
        console.info(TAG + 'getMissionInfos err,' + err);
      });
      let localMissionId = await allLocalMissions[0].missionId;
      console.info(TAG + 'localMissionId is,' + localMissionId);
      function onContinueDone(resultCode) {
        console.info(TAG + 'onContinueDone resultCode: ' + JSON.stringify(resultCode));
      };
      try {
        await distributedMissionManager.continueMission({
          srcDeviceId: localDeviceId,
          dstDeviceId: undefined,
          missionId: localMissionId,
          wantParam: { "key": "value" }
        }, {
          onContinueDone: onContinueDone
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect().assertFail();
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          expect().assertFail();
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        expect(error.code).assertEqual(401);
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_continueMission_0130 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_continueMission_0140
     * @tc.name    continueMission successful.
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_DMS_continueMission_0140", 0, async function (done) {
      console.info("-----------------SUB_DMS_continueMission_0140 start------------------------");
      let TAG = "SUB_DMS_continueMission_0140";
      let allLocalMissions = await missionManager.getMissionInfos("", 20).catch(function (err) {
        console.info(TAG + 'getMissionInfos err,' + err);
      });
      let localMissionId = await allLocalMissions[0].missionId;
      console.info(TAG + 'localMissionId is,' + localMissionId);
      function onContinueDone(resultCode) {
        console.info(TAG + 'onContinueDone resultCode: ' + JSON.stringify(resultCode));
      };
      try {
        await distributedMissionManager.continueMission({
          srcDeviceId: localDeviceId,
          dstDeviceId: dvId,
          missionId: localMissionId,
          wantParam: { "key": "value" }
        }, {
          onContinueDone: onContinueDone
        }).then(data => {
          console.info(TAG + ' finished: ' + JSON.stringify(data));
          expect(data).assertEqual(undefined);
          done();
        }).catch(error => {
          console.info(TAG + ' failed: ' + JSON.stringify(error.code));
          expect().assertFail();
          done();
        })
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_continueMission_0140 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_setMissionContinueState_0010
     * @tc.name    setMissionContinueState ContinueState is INACTIVE successful.
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_DMS_setMissionContinueState_0010", 0, async function (done) {
      console.info("-----------------SUB_DMS_setMissionContinueState_0010 start------------------------");
      let TAG = "SUB_DMS_setMissionContinueState_0010";
      let param = AbilityConstant.ContinueState.INACTIVE;
      try {
        continueState = globalThis.abilityContext.setMissionContinueState(param
        ).then((data) => {
          console.info(TAG + ' success');
          expect(data).assertEqual(undefined);
          done();
        }).catch((err) => {
          console.info(TAG + ' failed: ' + JSON.stringify(err.code));
          console.info(TAG + ' failed: ' + JSON.stringify(err.message));
          expect().assertFail();
          done();
        });
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_setMissionContinueState_0010 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_setMissionContinueState_0020
     * @tc.name    setMissionContinueState ContinueState is ACTIVE successful.
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_DMS_setMissionContinueState_0020", 0, async function (done) {
      console.info("-----------------SUB_DMS_setMissionContinueState_0020 start------------------------");
      let TAG = "SUB_DMS_setMissionContinueState_0020";
      let param = AbilityConstant.ContinueState.ACTIVE;
      try {
        continueState = globalThis.abilityContext.setMissionContinueState(param
        ).then((data) => {
          console.info(TAG + ' success');
          expect(data).assertEqual(undefined);
          done();
        }).catch((err) => {
          console.info(TAG + ' failed: ' + JSON.stringify(err.code));
          console.info(TAG + ' failed: ' + JSON.stringify(err.message));
          expect().assertFail();
          done();
        });
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_setMissionContinueState_0020 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_setMissionContinueState_CallBack_0010
     * @tc.name    setMissionContinueState ContinueState is INACTIVE successful.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_setMissionContinueState_CallBack_0010", 0, async function (done) {
      console.info("-----------------SUB_DMS_setMissionContinueState_CallBack_0010 start------------------------");
      let TAG = "SUB_DMS_setMissionContinueState_CallBack_0010";
      let param = AbilityConstant.ContinueState.INACTIVE;
      continueState = globalThis.abilityContext.setMissionContinueState(param, (err, result) => {
        try {
          if (err && err.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(err.code));
            console.info(TAG + ' failed: ' + JSON.stringify(err.message));
            expect().assertFail();
          } else {
            console.info(TAG + ' finished: ' + JSON.stringify(result));
            expect(result).assertEqual(undefined);
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_setMissionContinueState_CallBack_0010 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_setMissionContinueState_CallBack_0020
     * @tc.name    setMissionContinueState ContinueState is ACTIVE successful.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_setMissionContinueState_CallBack_0020", 0, async function (done) {
      console.info("-----------------SUB_DMS_setMissionContinueState_CallBack_0020 start------------------------");
      let TAG = "SUB_DMS_setMissionContinueState_CallBack_0020";
      let param = AbilityConstant.ContinueState.ACTIVE;
      continueState = globalThis.abilityContext.setMissionContinueState(param, (err, result) => {
        try {
          if (err && err.code !== 0) {
            console.info(TAG + ' failed: ' + JSON.stringify(err.code));
            console.info(TAG + ' failed: ' + JSON.stringify(err.message));
            expect().assertFail();
          } else {
            console.info(TAG + ' finished: ' + JSON.stringify(result));
            expect(result).assertEqual(undefined);
          }
        } catch (error) {
          console.info(TAG + ' catch: ' + JSON.stringify(error.code));
          console.info(TAG + ' catch: ' + JSON.stringify(error.message));
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("-----------------SUB_DMS_setMissionContinueState_CallBack_0020 end------------------------");
    });
    
    /*
     * @tc.number  SUB_DMS_Get_call_0010
     * @tc.name    Get call is success.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_Get_call_0010' , 0 , async function(done) {
      console.info("-----------------SUB_DMS_Get_call_0010 start------------------------");
      var wantVules = {
        bundleName : 'com.acts.example.dmsfwkstagetest',
        abilityName : 'com.example.lifecycletest.MainAbility',
        deviceId : dvId
      }
      try {
        globalThis.abilityContext.startAbilityByCall(wantVules)
        .then((data) =>{
          call = data;
          console.log('get call is success call is ' + call)
          expect(typeof(call)).assertEqual('object')
          done()
        }).catch((err) =>{
          console.log('get call is failed err is ' + JSON.stringify(err))
          expect(err == undefined).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertTrue()
        done()
      }
      console.info("-----------------SUB_DMS_Get_call_0010 end------------------------");
    });
  })
}