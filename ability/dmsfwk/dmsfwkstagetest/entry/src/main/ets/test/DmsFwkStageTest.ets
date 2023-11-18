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
import deviceManager from '@ohos.distributedDeviceManager';
import abilityDelegatorRegistry from '@ohos.app.ability.abilityDelegatorRegistry';
import commonEvent from '@ohos.commonEventManager';
import rpc from '@ohos.rpc';
import { UiDriver, BY } from '@ohos.UiTest';
import abilityAccessCtrl from '@ohos.abilityAccessCtrl';
import missionManager from '@ohos.app.ability.missionManager';
import UIAbility from '@ohos.app.ability.UIAbility';
import AbilityConstant from '@ohos.app.ability.AbilityConstant';
import { Caller} from '@ohos.app.ability.UIAbility';

let atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();
let abilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();
let dvList: Array<deviceManager.DeviceBasicInfo>;
let dvId: string;
let localDeviceId : string;
let connectId: number;
let connectId2: number;
let extensionConnectId: number;
let extensionConnectId2: number;
let continueState;
let caller: Caller;
let dmInstance : deviceManager.DeviceManager
var TAG;

export default function DmsFwkStageTest() {

  describe('DmsFwkStageTest', function () {
    async function getDeviceId() {
      console.log('getDeviceId is begin')
      try {
          dmInstance = deviceManager.createDeviceManager('com.acts.example.dmsfwkstageserver');
          console.log('get deviceManager is success')
      } catch (error) {
          console.log('get deviceManager is failed' + JSON.stringify(error))
      }
      localDeviceId = dmInstance.getLocalDeviceNetworkId();
      console.info("local device id is: " + localDeviceId);
      let deviceList : Array<deviceManager.DeviceBasicInfo> = dmInstance.getAvailableDeviceListSync();
      dvList = deviceList;
      let deviceId: string = deviceList[0].networkId;
      dvId = deviceId;
      console.info("deviceid is: " + deviceId);
      console.info("deviceList is: " + JSON.stringify(deviceList));
    }

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
        sleep(5000);
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
      await getDeviceId();
      sleep(1000);
      done()
    });

    beforeEach(async function (done) {
      console.info('LifeCycleTest before each called');
      done()
    });

    afterEach(async function (done) {
      console.info('DmsFwkStageTest after each called');
      done();
    });



    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900
     * @tc.name    Connect remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900";
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
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      await globalThis.abilityContext.disconnectServiceExtensionAbility(connectId , (err , data) => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900  disconnectServiceExtensionAbility is success : ' + data);
        expect(data).assertEqual(undefined)
        done()
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900 is end--------------- " + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800
     * @tc.name    ConnecAbility failed after connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800", 0, async function (done) {
      console.log("------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800 start-------------");
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800";
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
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800  onFailed: ' + code);
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
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800 onConnectRemoteService001 msg: ' + msg);
            expect(msg).assertEqual(100)
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      await globalThis.abilityContext.disconnectServiceExtensionAbility(connectId , (err , data) => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800  disconnectServiceExtensionAbility is success : ' + data);
        expect(data).assertEqual(undefined)
        done()
      });
      await sleep(1000);
      await globalThis.abilityContext.disconnectServiceExtensionAbility(connectId2 , (err , data) => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800  disconnectServiceExtensionAbility is success : ' + data);
        expect(data).assertEqual(undefined)
        done()
      });
      await sleep(1000);
      console.log("------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800 end-------------" + connectId);
    });


    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200
     * @tc.name    Disconnect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200", 0, async function (done) {
      console.log("------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200 start-------------");
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200";
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
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      await globalThis.abilityContext.disconnectServiceExtensionAbility(connectId , (err , data) => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200  disconnectServiceExtensionAbility is success : ' + data);
        expect(data).assertEqual(undefined)
        done()
      });
      await sleep(1000);
      console.log("------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200 end-------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100
     * @tc.name    Disconnect the remote Ability failed after connectAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100", 0, async function (done) {
      console.log("------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100 start-------------");
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100";
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
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100  onFailed: ' + code);
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
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100 onConnectRemoteService001 msg: ' + msg);
            expect(msg).assertEqual(100)
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100  onFailed: ' + code);
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
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100  disconnectServiceExtensionAbility is success : ' + data);
        expect(data).assertEqual(undefined)
        done()
      });
      console.log("------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100 end-------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0500
     * @tc.name    Connect remote Ability with error deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0500", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0500 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0500";
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
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0500  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0500 code: ' + code);
          expect(code).assertEqual(401)
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0500 is end---------------" + connectId)
    });


    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300
     * @tc.name    Connect remote Ability with wrong abilityName.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300";
      connectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "WrongServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300  onConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300  onFailed: ' + code);
          expect(code).assertEqual(401);
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400
     * @tc.name    Connect the remote Ability with error bundle.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400";
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
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400  onFailed: ' + code);
          expect(code).assertEqual(401)
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700
     * @tc.name    Connect the remote Ability after kill process of softbus_server.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700";
      abilityDelegator.executeShellCommand("pidof softbus_server", (err, data) => {
        console.info("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700:" + data.stdResult)
        abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data) => {
          console.info("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700:" + data.stdResult)
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
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      await globalThis.abilityContext.disconnectServiceExtensionAbility(connectId , (err , data) => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700  disconnectServiceExtensionAbility is success : ' + data);
        expect(data).assertEqual(undefined)
        done()
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600
     * @tc.name     Connect the remote Ability after kill process of distributedsche.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600";
      abilityDelegator.executeShellCommand("pidof distributedsche", (err, data) => {
        console.info("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600:" + data.stdResult)
        abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data) => {
          console.info("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600:" + data.stdResult)
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
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(connectId, (err, data) => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100
     * @tc.name    Connec the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100";
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
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done()
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(connectId, (err, data) => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200
     * @tc.name    Connec the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200 is start---------------")
      let RemoteObj;
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200";
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
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200  onFailed: ' + code);
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
        console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200 sendRequest success');
        let msg = result.reply.readInt();
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200 onConnectRemoteService001 msg: ' + msg);
        expect(msg == 123).assertTrue();
        done();
      })
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(connectId, (err, data) => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400
     * @tc.name    connect remote same service ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400";
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
              console.log('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done();
            })
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
        
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400 catch: ' + err.message);
      }
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(connectId, (err, data) => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200
     * @tc.name    Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200";
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
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200  onFailed: ' + code);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200 catch: ' + err.message);
      }
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300
     * @tc.name    Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300";
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
              console.log('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done();
            })
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300 catch: ' + err.message);
      }
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(connectId, (err, data) => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300 is end---------------" + connectId)
    });


    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200
     * @tc.name    Filed start remote ability with error bundle.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200";
      try {
        connectId = globalThis.abilityContext.startAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver.err",
          abilityName: "MainAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(401);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100
     * @tc.name    Filed start remote ability with error ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100";
      try {
        connectId = globalThis.abilityContext.startAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility.err"
        }, (err, data) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(401);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400
     * @tc.name    Filed start remote ability with error device.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400";
      try {
        connectId = globalThis.abilityContext.startAbility({
          deviceId: "dvId",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(401);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300
    * @tc.name    Filed start remote ability with null device.
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300";
      try {
        connectId = globalThis.abilityContext.startAbility({
          deviceId: "",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility"
        }, (err, data) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(16000001);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300 catch: ' + err.message);
        expect().assertFail();
        done();
      }
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100
     * @tc.name    ServiceExtension Connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100";
      extensionConnectId = globalThis.abilityContext.connectServiceExtensionAbility({
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
            console.log('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(3000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(extensionConnectId , (err , data) =>{
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100  disconnectServiceExtensionAbility is success: ' + data);
        expect(data).assertEqual(undefined)
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 is end--------------- " + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200
     * @tc.name    ServiceExtension ConnecAbility failed after connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200", 0, async function (done) {
      console.log("------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200 start-------------");
      TAG = "SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200";
      extensionConnectId = globalThis.abilityContext.connectServiceExtensionAbility({
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
            console.log('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(3000);
      extensionConnectId2 = globalThis.abilityContext.connectServiceExtensionAbility({
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
            console.log('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200 onConnectRemoteService001 msg: ' + msg);
            expect(msg).assertEqual(100)
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(3000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(extensionConnectId2 , (err , data) =>{
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200  disconnectServiceExtensionAbility is success: ' + data);
        expect(data).assertEqual(undefined)
      })
      await sleep(1000);
      console.log("------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200 end-------------" + extensionConnectId);
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300
    * @tc.name    ServiceExtension Disconnect the remote Ability.
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300", 0, async function (done) {
      console.log("------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300 start-------------");
      TAG = "SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300";
      extensionConnectId = globalThis.abilityContext.connectServiceExtensionAbility({
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
            console.log('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(3000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        expect(undefined).assertEqual(data)
        done()
      })
      await sleep(1000);
      console.log("------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300 end-------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400
     * @tc.name    ServiceExtension Disconnect the remote Ability failed after connectAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400", 0, async function (done) {
      console.log("------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400 start-------------");
      TAG = "SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400";
      extensionConnectId = globalThis.abilityContext.connectServiceExtensionAbility({
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
            console.log('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(3000);
      extensionConnectId2 = globalThis.abilityContext.connectServiceExtensionAbility({
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
            console.log('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400 onConnectRemoteService001 msg: ' + msg);
            expect(msg).assertEqual(100)
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400  onFailed: ' + code);
          expect().assertFail();
        }
      });
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        expect(undefined).assertEqual(data)
        done()
      })
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(extensionConnectId2, (err, data) => {
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      console.log("------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400 end-------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300
     * @tc.name    ServiceExtension Connect the remote Ability with wrong abilityName.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300";
      extensionConnectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "WrongServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300  onConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300  onFailed: ' + code);
          expect(code).assertEqual(401);
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400
     * @tc.name    ServiceExtension Connect the remote Ability with error bundle.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400";
      extensionConnectId = globalThis.abilityContext.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver.err",
        abilityName: "ServiceAbility"
      }, {
        onConnect: (elementName, proxy) => {
          expect().assertFail();
          done();
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400  onFailed: ' + code);
          expect(code).assertEqual(401)
          done();
        }
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700
     * @tc.name    ServiceExtension Connect the remote Ability after kill process of softbus_server.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700";
      abilityDelegator.executeShellCommand("pidof softbus_server", (err, data) => {
        console.info("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700:" + data.stdResult)
        abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data) => {
          console.info("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700:" + data.stdResult)
        })
      })

      extensionConnectId = globalThis.abilityContext.connectServiceExtensionAbility({
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
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        console.info('SUB_DMS_Extension_ConnectAbility_0400  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600
     * @tc.name    ServiceExtension Connect the remote Ability after kill process of distributedsche.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600";
      abilityDelegator.executeShellCommand("pidof distributedsche", (err, data) => {
        console.info("SUB_DMS_Extension_ConnectAbility_0900:" + data.stdResult)
        abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data) => {
          console.info("SUB_DMS_Extension_ConnectAbility_0900:" + data.stdResult)
        })
      })
      extensionConnectId = globalThis.abilityContext.connectServiceExtensionAbility({
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
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        console.info('SUB_DMS_Extension_ConnectAbility_0400  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000
     * @tc.name    ServiceExtension Connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000";
      extensionConnectId = globalThis.abilityContext.connectServiceExtensionAbility({
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
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done()
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        console.info('SUB_DMS_Extension_ConnectAbility_0400  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      await sleep(1000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400
     * @tc.name    ServiceExtension Connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400 is start---------------")
      let RemoteObj;
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400";
      extensionConnectId = globalThis.abilityContext.connectServiceExtensionAbility({
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
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
          })
        },
        onDisConnect: (elementName) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed: (code) => {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400  onFailed: ' + code);
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
        console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400 sendRequest success');
        let msg = result.reply.readInt();
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400 onConnectRemoteService001 msg: ' + msg);
        expect(msg == 123).assertTrue();
        done();
      })
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        console.info('SUB_DMS_Extension_ConnectAbility_0400  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500
     * @tc.name    ServiceExtension Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500";
      try {
        extensionConnectId = globalThis.abilityContext.connectServiceExtensionAbility({
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
              console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done();
            })
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500 catch: ' + err.message);
      }
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700
     * @tc.name    ServiceExtension Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700";
      try {
        extensionConnectId = globalThis.abilityContext.connectServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility2"
        }, {
          onConnect: (elementName, proxy) => {
            expect().assertFail();
            done();
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700  onFailed: ' + code);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700 catch: ' + err.message);
      }
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800
     * @tc.name    ServiceExtension Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800", 0, async function (done) {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800";
      try {
        extensionConnectId = globalThis.abilityContext.connectServiceExtensionAbility({
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
              console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done();
            })
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800 catch: ' + err.message);
      }
      await sleep(1000);
      globalThis.abilityContext.disconnectServiceExtensionAbility(extensionConnectId, (err, data) => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800  disconnectServiceExtensionAbility: ' + err.message + " " + err.code);
        expect(undefined).assertEqual(data);
        done();
      })
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
        extensionConnectId = globalThis.abilityContext.startAbility({
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
        extensionConnectId = globalThis.abilityContext.startAbility({
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
        extensionConnectId = globalThis.abilityContext.startAbility({
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
        extensionConnectId = globalThis.abilityContext.startAbility({
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
     * @tc.number  SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1200
     * @tc.name    setMissionContinueState ContinueState is INACTIVE successful.
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1200", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1200 start------------------------");
      let TAG = "SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1200";
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
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1200 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1300
     * @tc.name    setMissionContinueState ContinueState is ACTIVE successful.
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1300", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1300 start------------------------");
      let TAG = "SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1300";
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
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1300 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0900
     * @tc.name    setMissionContinueState ContinueState is INACTIVE successful.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0900", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0900 start------------------------");
      let TAG = "SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0900";
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
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0900 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0800
     * @tc.name    setMissionContinueState ContinueState is ACTIVE successful.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0800", 0, async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0800 start------------------------");
      let TAG = "SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0800";
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
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0800 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0100
     * @tc.name    Get call is failed bundleName is null.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0100' , 0 , async function(done) {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0100 start------------------------");
      var wantVules = {
        bundleName : '',
        abilityName : 'com.example.lifecycletest.MainAbility',
        deviceId : dvId
      }
      try {
        globalThis.abilityContext.startAbilityByCall(wantVules)
        .then((data) =>{
          let caller: Caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 16000050).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertTrue()
        done()
      }
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0100 end------------------------");
    });


    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0200
     * @tc.name    Get call is failed bundleName is undefined.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0200' , 0 , async function(done) {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0200 start------------------------");
      var wantVules = {
        bundleName : undefined,
        abilityName : 'com.example.lifecycletest.MainAbility',
        deviceId : dvId
      }
      try {
        globalThis.abilityContext.startAbilityByCall(wantVules)
        .then((data) =>{
          let caller: Caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 16000050).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertTrue()
        done()
      }
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0200 end------------------------");
    });

    
    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0300
     * @tc.name    Get call is failed bundleName is err.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0300' , 0 , async function(done) {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0300 start------------------------");
      var wantVules = {
        bundleName : '125skausdas',
        abilityName : 'com.example.lifecycletest.MainAbility',
        deviceId : dvId
      }
      try {
        globalThis.abilityContext.startAbilityByCall(wantVules)
        .then((data) =>{
          let caller: Caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 401).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertTrue()
        done()
      }
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0300 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0400
     * @tc.name    Get call is failed bundleName is err.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0400' , 0 , async function(done) {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0400 start------------------------");
      var wantVules = {
        bundleName : '125skausdas',
        abilityName : 'com.example.lifecycletest.MainAbility',
        deviceId : dvId
      }
      try {
        globalThis.abilityContext.startAbilityByCall(wantVules)
        .then((data) =>{
          let caller: Caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 401).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertTrue()
        done()
      }
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0400 end------------------------");
    });


    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0500
     * @tc.name    Get call is failed abilityName is null.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0500' , 0 , async function(done) {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0500 start------------------------");
      var wantVules = {
        bundleName : 'com.acts.example.dmsfwkstagetest',
        abilityName : '',
        deviceId : dvId
      }
      try {
        globalThis.abilityContext.startAbilityByCall(wantVules)
        .then((data) =>{
          let caller: Caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 16000050).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertTrue()
        done()
      }
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0500 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0600
     * @tc.name    Get call is failed abilityName is undefined.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0600' , 0 , async function(done) {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0600 start------------------------");
      var wantVules = {
        bundleName : 'com.acts.example.dmsfwkstagetest',
        abilityName : undefined,
        deviceId : dvId
      }
      try {
        globalThis.abilityContext.startAbilityByCall(wantVules)
        .then((data) =>{
          let caller: Caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 16000050).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertTrue()
        done()
      }
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0600 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0700
     * @tc.name    Get call is failed abilityName is errparameter.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0700' , 0 , async function(done) {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0700 start------------------------");
      var wantVules = {
        bundleName : 'com.acts.example.dmsfwkstagetest',
        abilityName : 'xys123456',
        deviceId : dvId
      }
      try {
        globalThis.abilityContext.startAbilityByCall(wantVules)
        .then((data) =>{
          let caller: Caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 401).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertTrue()
        done()
      }
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0700 end------------------------");
    });


    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0800
     * @tc.name    Get call deviceId is localDeviceId
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0800' , 0 , async function(done) {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0800 start------------------------");
      var wantVules = {
        bundleName : 'com.acts.example.dmsfwkstagetest',
        abilityName : 'com.example.lifecycletest.MainAbility',
        deviceId : localDeviceId
      }
      try {
        globalThis.abilityContext.startAbilityByCall(wantVules)
        .then((data) =>{
          let caller: Caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 16000050).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertTrue()
        done()
      }
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0800 end------------------------");
      sleep(5000)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0900
     * @tc.name    Get call is success.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0900' , 0 , async function(done) {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0900 start------------------------");
      var wantVules = {
        bundleName : 'com.acts.example.dmsfwkstagetest',
        abilityName : 'com.example.lifecycletest.MainAbility',
        deviceId : dvId
      }
      try {
        globalThis.abilityContext.startAbilityByCall(wantVules)
        .then((data) =>{
          caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err == undefined).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertTrue()
        done()
      }
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0900 end------------------------");
    });


    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1000
     * @tc.name    call is onRelease.
     * @tc.desc    Function test
     * @tc.level   0
     */

    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1000' , 0 , async function (done) {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1000 start------------------------");
      try {
        caller.release();
        console.log(' caller release success ')
        expect().assertEqual(undefined)
        done()
      } catch (error) {
        console.log('Caller.onRelease catch error, error.code: $error.code}, error.message: ${error.message}');
        done()
      }
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1000 end------------------------");
    });
  })
}