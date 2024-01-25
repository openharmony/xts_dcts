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
import rpc from '@ohos.rpc';
import { Driver, ON } from '@ohos.UiTest';
import abilityAccessCtrl, { Context, PermissionRequestResult } from '@ohos.abilityAccessCtrl';
import AbilityConstant from '@ohos.app.ability.AbilityConstant';
import { Caller} from '@ohos.app.ability.UIAbility';
import { MyMessageAble } from '../MainAbility/MainAbility';
import { BusinessError } from '@ohos.base';
import bundleManager from '@ohos.bundle.bundleManager';
import Want from '@ohos.app.ability.Want';
import common from '@ohos.app.ability.common';

let atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();
let abilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();
let dvList: Array<deviceManager.DeviceBasicInfo>;
let dvId: string;
let localDeviceId : string;
let connectId: number;
let connectId2: number;
let extensionConnectId: number;
let extensionConnectId2: number;
let call: Caller;
let dmInstance : deviceManager.DeviceManager;
let TAG: string;


export default function DmsFwkStageTest() {

  describe('DmsFwkStageTest', () => {
  
    let getDeviceId = async () =>{
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
      let deviceId = deviceList[0].networkId;
      dvId = deviceId;
      console.info("deviceid is: " + deviceId);
      console.info("deviceList is: " + JSON.stringify(deviceList));
    }
    
    let sleep = (ms:number) =>{
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    let getPermission = async () =>{
      console.info('getPermission is start');
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      atManager.requestPermissionsFromUser(context, ['ohos.permission.DISTRIBUTED_DATASYNC'], (err: BusinessError, data: PermissionRequestResult) => {
        console.info("request success" + JSON.stringify(data));
        console.info("request success" + JSON.stringify(err));
      })
    }

    let driveFn = async () =>{
      try {
        let driver: Driver = await Driver.create()
        console.info('come in driveFn')
        console.info('driver is ${JSON.stringify(driver)}')
        sleep(2000);
        let button = await driver.findComponent(ON.text('允许'));
        console.info('button is ${JSON.stringify(button)}');
        sleep(5000);
        await button.click();
        sleep(2000);
      } catch (err) {
        console.info('err is ' + err);
        return;
      }
    }

    let DisconnectServiceExtensionAbility = async (DMSId:number) =>{
      console.log('DmsFwkStageTest disconnectServiceExtensionAbility begin');
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        await context.disconnectServiceExtensionAbility(DMSId).then(() =>{
          console.info('DmsFwkStageTest disconnectServiceExtensionAbility called success');
        }).catch ((err: BusinessError) =>{
          console.info('DmsFwkStageTest disconnectServiceExtensionAbility called err ' + err.code);
        })
      } catch (error) {
        console.info('DmsFwkStageTest disconnectServiceExtensionAbility called error ' + error.code);
      }
      console.log('DmsFwkStageTest disconnectServiceExtensionAbility end');
    }

    beforeAll(async (done: Function) => {
      await getPermission();
      sleep(5000);
      await driveFn();
      sleep(2000);
      await getDeviceId();
      sleep(2000);
      done()
    });

    beforeEach(async (done: Function) => {
      console.info('LifeCycleTest before each called');
      done()
    });

    afterEach(async (done: Function) => {
      console.info('DmsFwkStageTest after each called');
      await DisconnectServiceExtensionAbility(connectId)
      sleep(2000)
      await DisconnectServiceExtensionAbility(connectId2)
      sleep(2000)
      await DisconnectServiceExtensionAbility(extensionConnectId)
      sleep(2000)
      await DisconnectServiceExtensionAbility(extensionConnectId2)
      sleep(2000)
      done();
    });


    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900
     * @tc.name    Connect remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      connectId = context.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      },
      {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      sleep(2000);
      await context.disconnectServiceExtensionAbility(connectId , () => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900  disconnectServiceExtensionAbility is success');
        expect(true).assertTrue()
        done()
      });
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0900 is end--------------- " + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800
     * @tc.name    ConnecAbility failed after connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800", 0, async (done: Function) => {
      console.log("------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800 start-------------");
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      let want: Want = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      };
      let options: common.ConnectOptions = {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done()
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      }
      connectId = context.connectServiceExtensionAbility(want,options);
      sleep(2000);
      let want1: Want = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "ServiceAbility"
      };
      let options1: common.ConnectOptions = {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800 onConnectRemoteService001 msg: ' + msg);
            expect(msg).assertEqual(100)
            done();
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      }
      connectId2 = context.connectServiceExtensionAbility(want1,options1);
      sleep(2000);
      await context.disconnectServiceExtensionAbility(connectId , () => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800  disconnectServiceExtensionAbility is success : ');
        expect(true).assertTrue()
        done()
      });
      sleep(2000);
      await context.disconnectServiceExtensionAbility(connectId2 , () => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800  disconnectServiceExtensionAbility is success : ');
        expect(true).assertTrue()
        done()
      });
      sleep(2000);
      console.log("------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0800 end-------------" + connectId);
    });


    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200
     * @tc.name    Disconnect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200", 0, async (done: Function) => {
      console.log("------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200 start-------------");
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      let want: Want = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      };
      let options: common.ConnectOptions = {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      }
      connectId = context.connectServiceExtensionAbility(want,options);
      sleep(2000);
      await context.disconnectServiceExtensionAbility(connectId , () => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200  disconnectServiceExtensionAbility is success : ');
        expect(true).assertTrue()
        done()
      });
      sleep(2000);
      console.log("------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1200 end-------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100
     * @tc.name    Disconnect the remote Ability failed after connectAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100", 0, async (done: Function) => {
      console.log("------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100 start-------------");
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      let want: Want = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      };
      let options: common.ConnectOptions = {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done()
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      }
      connectId = context.connectServiceExtensionAbility(want,options);
      sleep(2000);
      let want1: Want = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "ServiceAbility"
      };
      let options1: common.ConnectOptions = {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100 onConnectRemoteService001 msg: ' + msg);
            expect(msg).assertEqual(100)
            done()
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100  onFailed: ' + code);
          expect().assertFail();
        }
      }
      connectId2 = context.connectServiceExtensionAbility(want1,options1);
      sleep(2000);
      context.disconnectServiceExtensionAbility(connectId, () => {
        expect(true).assertTrue()
        done()
      })
      sleep(2000);
      await context.disconnectServiceExtensionAbility(connectId2 , () => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100  disconnectServiceExtensionAbility is success');
        expect(true).assertTrue()
        done()
      });
      sleep(2000);
      console.log("------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1100 end-------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0500
     * @tc.name    Connect remote Ability with error deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0500", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0500 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0500";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      let want: Want = {
        deviceId: "1111212151561315616131515643115616",
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      };
      let options: common.ConnectOptions = {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          expect().assertFail();
          done();
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0500  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0500 code: ' + code);
          expect(code).assertEqual(401)
          done();
        }
      }
      connectId = context.connectServiceExtensionAbility(want,options);
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0500 is end---------------" + connectId)
    });


    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300
     * @tc.name    Connect remote Ability with wrong abilityName.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      let want: Want = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "WrongServiceAbility"
      };
      let options: common.ConnectOptions = {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300  onConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300  onFailed: ' + code);
          expect(code).assertEqual(401);
          done();
        }
      };
      connectId = context.connectServiceExtensionAbility(want,options);
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400
     * @tc.name    Connect the remote Ability with error bundle.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      let want: Want = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver.err",
        abilityName: "ServiceAbility"
      };
      let options: common.ConnectOptions = {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          expect().assertFail();
          done();
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400  onFailed: ' + code);
          expect(code).assertEqual(401)
          done();
        }
      }
      connectId = context.connectServiceExtensionAbility(want,options);
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700
     * @tc.name    Connect the remote Ability after kill process of softbus_server.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700";
      abilityDelegator.executeShellCommand("pidof softbus_server", (err, data) => {
        console.info("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700:" + data.stdResult)
        abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data) => {
          console.info("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700:" + data.stdResult)
        })
      })
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      let want: Want = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      };
      let options: common.ConnectOptions = {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      }
      connectId = context.connectServiceExtensionAbility(want,options);
      sleep(2000);
      await context.disconnectServiceExtensionAbility(connectId , () => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700  disconnectServiceExtensionAbility is success');
        expect(true).assertTrue()
        done()
      });
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600
     * @tc.name     Connect the remote Ability after kill process of distributedsche.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600";
      abilityDelegator.executeShellCommand("pidof distributedsche", (err, data) => {
        console.info("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600:" + data.stdResult)
        abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data) => {
          console.info("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600:" + data.stdResult)
        })
      })
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      let want: Want = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      };
      let options: common.ConnectOptions = {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      }
      connectId = context.connectServiceExtensionAbility(want,options);
      sleep(2000);
      context.disconnectServiceExtensionAbility(connectId, () => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600  disconnectServiceExtensionAbility');
        expect(true).assertTrue()
        done();
      })
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100
     * @tc.name    Connec the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      let want: Want = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      };
      let options: common.ConnectOptions = {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          expect(remote != null).assertTrue();
          expect(elementName.bundleName).assertEqual("com.acts.example.dmsfwkstageserver");
          expect(elementName.abilityName).assertEqual("ServiceAbility");
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done()
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      }
      connectId = context.connectServiceExtensionAbility(want,options);
      sleep(2000);
      context.disconnectServiceExtensionAbility(connectId, () => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100  disconnectServiceExtensionAbility');
        expect(true).assertTrue()
        done();
      })
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0100 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200
     * @tc.name    Connec the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      connectId = context.connectServiceExtensionAbility(
        {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
        },
        {
          onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
            expect(remote != null).assertTrue();
            let option: rpc.MessageOption = new rpc.MessageOption();
            let data: rpc.MessageSequence = new rpc.MessageSequence();
            let reply: rpc.MessageSequence = new rpc.MessageSequence();
            data.writeInt(1);
            data.writeInt(99);
            remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
              console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done()
            })
            sleep(2000)
            data.writeInt(123);
            remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
              console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200 msg1: ' + msg);
              expect(msg == 123).assertTrue();
              done();
            })
          },
          onDisconnect(elementName: bundleManager.ElementName) {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200  onDisConnect: ' + JSON.stringify(elementName));
            expect(elementName != null).assertTrue();
            done();
          },
          onFailed(code: number) {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        },
      );
      context.disconnectServiceExtensionAbility(connectId, () => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200  disconnectServiceExtensionAbility');
        expect(true).assertTrue()
        done();
      })
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0200 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400
     * @tc.name    connect remote same service ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      let want: Want = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      };
      let options: common.ConnectOptions = {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          expect(remote != null).assertTrue();
          expect(elementName.bundleName).assertEqual("com.acts.example.dmsfwkstageserver");
          expect(elementName.abilityName).assertEqual("ServiceAbility");
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      }
      try {
        connectId = context.connectServiceExtensionAbility(want,options);
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400 catch: ' + err.message);
      }
      sleep(2000);
      context.disconnectServiceExtensionAbility(connectId, () => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400  disconnectServiceExtensionAbility: ');
        expect(true).assertTrue()
        done();
      })
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0400 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200
     * @tc.name    Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      let want: Want = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility2"
      };
      let options: common.ConnectOptions = {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          expect().assertFail();
          done();
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200  onFailed: ' + code);
          done();
        }
      }
      try {
        connectId = context.connectServiceExtensionAbility(want,options);
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200 catch: ' + err.message);
      }
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0200 is end---------------" + connectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300
     * @tc.name    Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        connectId = context.connectServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
            expect(remote != null).assertTrue();
            expect(elementName.bundleName).assertEqual("com.acts.example.dmsfwkstageserver");
            expect(elementName.abilityName).assertEqual("ServiceAbility");
            let option: rpc.MessageOption = new rpc.MessageOption();
            let data: rpc.MessageSequence = new rpc.MessageSequence();
            let reply: rpc.MessageSequence = new rpc.MessageSequence();
            data.writeInt(1);
            data.writeInt(99);
            remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
              console.log('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done();
            })
          },
          onDisconnect(elementName: bundleManager.ElementName) {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300  onDisConnect: ' + JSON.stringify(elementName));
            expect(elementName != null).assertTrue();
            done();
          },
          onFailed(code: number) {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300 catch: ' + err.message);
      }
      sleep(2000);
      context.disconnectServiceExtensionAbility(connectId, () => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300  disconnectServiceExtensionAbility success');
        expect(true).assertTrue()
        done();
      })
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_connectRemoteServiceAbility_0300 is end---------------" + connectId)
    });


    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100
     * @tc.name    Filed start remote ability with error bundle.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver.err",
          abilityName: "MainAbility"
        }, (err: BusinessError) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 startService result: ' + err.code);
          expect(err.code).assertEqual(401);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 is end---------------")
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200
     * @tc.name    Filed start remote ability with error ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility.err"
        }, (err: BusinessError) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200 startService result: ' + err.code);
          expect(err.code).assertEqual(401);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0200 is end---------------")
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300
     * @tc.name    Filed start remote ability with error device.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbility({
          deviceId: "dvId",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility"
        }, (err: BusinessError) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(401);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0300 is end---------------")
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400
    * @tc.name    Filed start remote ability with null device.
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbility({
          deviceId: "",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility"
        }, (err: BusinessError) => {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400 startService result: ' + err.code + " " + err.message);
          expect(err.code).assertEqual(16000001);
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0400 is end---------------")
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100
     * @tc.name    ServiceExtension Connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      extensionConnectId = context.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      sleep(2000);
      
      context.disconnectServiceExtensionAbility(extensionConnectId , () =>{
        console.info('SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100  disconnectServiceExtensionAbility is success');
        expect(true).assertTrue()
      })
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_StartAbility_StartControl_0100 is end--------------- " + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0100
     * @tc.name    ServiceExtension ConnecAbility failed after connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0100", 0, async (done: Function) => {
      console.log("------------SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0100 start-------------");
      TAG = "SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0100";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      extensionConnectId = context.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0100 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0100 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0100  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0100  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      sleep(2000);
      extensionConnectId2 = context.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "ServiceAbility"
      }, {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0100 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0100 onConnectRemoteService001 msg: ' + msg);
            expect(msg).assertEqual(100)
            done();
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0100  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0100  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      sleep(2000);
      context.disconnectServiceExtensionAbility(extensionConnectId2 , () =>{
        console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0100  disconnectServiceExtensionAbility is success');
        expect(true).assertTrue()
      })
      sleep(2000);
      console.log("------------SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0100 end-------------" + extensionConnectId);
    });

    /*
    * @tc.number  SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0200
    * @tc.name    ServiceExtension Disconnect the remote Ability.
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0200", 0, async (done: Function) => {
      console.log("------------SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0200 start-------------");
      TAG = "SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0200";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      extensionConnectId = context.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0200 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0200 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0200  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0200  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      sleep(2000);
      context.disconnectServiceExtensionAbility(extensionConnectId, () => {
        expect(true).assertTrue()
        done()
      })
      sleep(2000);
      console.log("------------SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0200 end-------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0300
     * @tc.name    ServiceExtension Disconnect the remote Ability failed after connectAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0300", 0, async (done: Function) => {
      console.log("------------SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0300 start-------------");
      TAG = "SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0300";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      extensionConnectId = context.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0300 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0300 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done()
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0300  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0300  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      sleep(2000);
      extensionConnectId2 = context.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "ServiceAbility"
      }, {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0300 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0300 onConnectRemoteService001 msg: ' + msg);
            expect(msg).assertEqual(100)
            done()
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0300  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0300  onFailed: ' + code);
          expect().assertFail();
        }
      });
      sleep(2000);
      context.disconnectServiceExtensionAbility(extensionConnectId, () => {
        expect(true).assertTrue()
        done()
      })
      sleep(2000);
      context.disconnectServiceExtensionAbility(extensionConnectId2, () => {
        console.info('SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0300  disconnectServiceExtensionAbility');
        expect(true).assertTrue();
        done();
      })
      sleep(2000);
      console.log("------------SUB_DMS_StandardOs_collaboration_ServiceExtension_ConnecAbility_0300 end-------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300
     * @tc.name    ServiceExtension Connect the remote Ability with wrong abilityName.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      extensionConnectId = context.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstagetest",
        abilityName: "WrongServiceAbility"
      }, {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300  onConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300  onFailed: ' + code);
          expect(code).assertEqual(401);
          done();
        }
      });
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0300 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400
     * @tc.name    ServiceExtension Connect the remote Ability with error bundle.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      extensionConnectId = context.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver.err",
        abilityName: "ServiceAbility"
      }, {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          expect().assertFail();
          done();
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400  onDisConnect: ' + JSON.stringify(elementName));
          expect().assertFail();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400  onFailed: ' + code);
          expect(code).assertEqual(401)
          done();
        }
      });
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0400 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700
     * @tc.name    ServiceExtension Connect the remote Ability after kill process of softbus_server.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700";
      abilityDelegator.executeShellCommand("pidof softbus_server", (err, data) => {
        console.info("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700:" + data.stdResult)
        abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data) => {
          console.info("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700:" + data.stdResult)
        })
      })
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      extensionConnectId = context.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      sleep(2000);
      context.disconnectServiceExtensionAbility(extensionConnectId, () => {
        console.info('SUB_DMS_Extension_ConnectAbility_0400  disconnectServiceExtensionAbility');
        expect(true).assertTrue();
        done();
      })
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0700 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600
     * @tc.name    ServiceExtension Connect the remote Ability after kill process of distributedsche.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600";
      abilityDelegator.executeShellCommand("pidof distributedsche", (err, data) => {
        console.info("SUB_DMS_Extension_ConnectAbility_0900:" + data.stdResult)
        abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data) => {
          console.info("SUB_DMS_Extension_ConnectAbility_0900:" + data.stdResult)
        })
      })
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      extensionConnectId = context.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          if (remote == null) {
            return;
          }
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done();
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      sleep(2000);
      context.disconnectServiceExtensionAbility(extensionConnectId, () => {
        console.info('SUB_DMS_Extension_ConnectAbility_0400  disconnectServiceExtensionAbility');
        expect(true).assertTrue();
        done();
      })
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_0600 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000
     * @tc.name    ServiceExtension Connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      extensionConnectId = context.connectServiceExtensionAbility({
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
      }, {
        onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
          expect(remote != null).assertTrue();
          expect(elementName.bundleName).assertEqual("com.acts.example.dmsfwkstageserver");
          expect(elementName.abilityName).assertEqual("ServiceAbility");
          let option: rpc.MessageOption = new rpc.MessageOption();
          let data: rpc.MessageSequence = new rpc.MessageSequence();
          let reply: rpc.MessageSequence = new rpc.MessageSequence();
          data.writeInt(1);
          data.writeInt(99);
          remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
            console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000 sendRequest success');
            let msg = result.reply.readInt();
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000 onConnectRemoteService001 msg: ' + msg);
            expect(msg == 100).assertTrue();
            done()
          })
        },
        onDisconnect(elementName: bundleManager.ElementName) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000  onDisConnect: ' + JSON.stringify(elementName));
          expect(elementName != null).assertTrue();
          done();
        },
        onFailed(code: number) {
          console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000  onFailed: ' + code);
          expect().assertFail();
          done();
        }
      });
      sleep(2000);
      context.disconnectServiceExtensionAbility(extensionConnectId, () => {
        console.info('SUB_DMS_Extension_ConnectAbility_0400  disconnectServiceExtensionAbility');
        expect(true).assertTrue();
        done();
      })
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1000 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400
     * @tc.name    ServiceExtension Connect the remote Ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      extensionConnectId = context.connectServiceExtensionAbility(
        {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "ServiceAbility"
        },
        {
          onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
            expect(remote != null).assertTrue();
            let option: rpc.MessageOption = new rpc.MessageOption();
            let data: rpc.MessageSequence = new rpc.MessageSequence();
            let reply: rpc.MessageSequence = new rpc.MessageSequence();
            data.writeInt(1);
            data.writeInt(99);
            remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
              console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done()
            })
            sleep(2000)
            data.writeInt(123);
            remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
              console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400 onConnectRemoteService001 msg 123: ' + msg);
              expect(msg == 123).assertTrue();
              done();
            })
          },
          onDisconnect(elementName: bundleManager.ElementName) {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400  onDisConnect: ' + JSON.stringify(elementName));
            expect(elementName != null).assertTrue();
            done();
          },
          onFailed(code: number) {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        }
      );
      context.disconnectServiceExtensionAbility(extensionConnectId, () => {
        console.info('SUB_DMS_Extension_ConnectAbility_0400 disconnectServiceExtensionAbility');
        expect(true).assertTrue();
        done();
      })
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1400 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500
     * @tc.name    ServiceExtension Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        extensionConnectId = context.connectServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
            expect(remote != null).assertTrue();
            expect(elementName.bundleName).assertEqual("com.acts.example.dmsfwkstageserver");
            expect(elementName.abilityName).assertEqual("ServiceAbility");
            let option: rpc.MessageOption = new rpc.MessageOption();
            let data: rpc.MessageSequence = new rpc.MessageSequence();
            let reply: rpc.MessageSequence = new rpc.MessageSequence();
            data.writeInt(1);
            data.writeInt(99);
            remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
              console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done();
            })
          },
          onDisconnect(elementName: bundleManager.ElementName) {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500  onDisConnect: ' + JSON.stringify(elementName));
            expect(elementName != null).assertTrue();
            done();
          },
          onFailed(code: number) {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500 catch: ' + err.message);
      }
      sleep(2000);
      context.disconnectServiceExtensionAbility(extensionConnectId, () => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500  disconnectServiceExtensionAbility');
        expect(true).assertTrue();
        done();
      })
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1500 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700
     * @tc.name    ServiceExtension Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        extensionConnectId = context.connectServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility2"
        }, {
          onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
            expect().assertFail();
            done();
          },
          onDisconnect(elementName: bundleManager.ElementName) {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed(code: number) {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700  onFailed: ' + code);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700 catch: ' + err.message);
      }
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1700 is end---------------" + extensionConnectId)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800
     * @tc.name    ServiceExtension Filed connect remote invisible service without permission.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800 is start---------------")
      TAG = "SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        extensionConnectId = context.connectServiceExtensionAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect(elementName: bundleManager.ElementName, remote: rpc.IRemoteObject) {
            expect(remote != null).assertTrue();
            expect(elementName.bundleName).assertEqual("com.acts.example.dmsfwkstageserver");
            expect(elementName.abilityName).assertEqual("ServiceAbility");
            let option: rpc.MessageOption = new rpc.MessageOption();
            let data: rpc.MessageSequence = new rpc.MessageSequence();
            let reply: rpc.MessageSequence = new rpc.MessageSequence();
            data.writeInt(1);
            data.writeInt(99);
            remote.sendMessageRequest(1, data, reply, option).then((result: rpc.RequestResult) => {
              console.log('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800 sendRequest success');
              let msg = result.reply.readInt();
              console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800 onConnectRemoteService001 msg: ' + msg);
              expect(msg == 100).assertTrue();
              done();
            })
          },
          onDisconnect(elementName: bundleManager.ElementName) {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800  onDisConnect: ' + JSON.stringify(elementName));
            expect(elementName != null).assertTrue();
            done();
          },
          onFailed(code: number) {
            console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800 catch: ' + err.code);
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800 catch: ' + err.message);
      }
      sleep(2000);
      context.disconnectServiceExtensionAbility(extensionConnectId, () => {
        console.info('SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800  disconnectServiceExtensionAbility');
        expect(true).assertTrue();
        done();
      })
      sleep(2000);
      console.info("---------------SUB_DMS_StandardOs_collaboration_connectAbility_StopConnectServiceExtensionAbility_1800 is end---------------" + extensionConnectId)
    });


    /*
     * @tc.number  SUB_DMS_StartControl_Extension_StartAbility_0700
     * @tc.name    ServiceExtension filed start remote ability with error bundle.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_StartAbility_0700", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_0700 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_StartAbility_0700";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver.err",
          abilityName: "MainAbility"
        }, (err: BusinessError) => {
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
      sleep(2000);
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_0700 is end---------------")
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_StartAbility_0800
     * @tc.name    ServiceExtension filed start remote ability with error ability.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_StartAbility_0800", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_0800 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_StartAbility_0800";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility.err"
        }, (err: BusinessError) => {
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
      sleep(2000);
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_0800 is end---------------")
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_StartAbility_0900
     * @tc.name    ServiceExtension filed start remote ability with err device.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_StartAbility_0900", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_0900 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_StartAbility_0900";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbility({
          deviceId: "dvId",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility"
        }, (err: BusinessError) => {
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
      sleep(2000);
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_0900 is end---------------")
    });

    /*
     * @tc.number  SUB_DMS_StartControl_Extension_StartAbility_1000
     * @tc.name    ServiceExtension filed start remote ability with null device.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StartControl_Extension_StartAbility_1000", 0, async (done: Function) => {
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_1000 is start---------------")
      TAG = "SUB_DMS_StartControl_Extension_StartAbility_1000";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbility({
          deviceId: "",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "MainAbility"
        }, (err: BusinessError) => {
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
      sleep(2000);
      console.info("---------------SUB_DMS_StartControl_Extension_StartAbility_1000 is end---------------")
    });


    /*
     * @tc.number  SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1200
     * @tc.name    setMissionContinueState ContinueState is INACTIVE successful.
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1200", 0, async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1200 start------------------------");
      let TAG = "SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1200";
      let param = AbilityConstant.ContinueState.INACTIVE;
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.setMissionContinueState(param)
        .then(() => {
          console.info(TAG + ' success');
          expect(true).assertTrue();
          done();
        }).catch((err: BusinessError) => {
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
      sleep(2000);
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1200 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1300
     * @tc.name    setMissionContinueState ContinueState is ACTIVE successful.
     * @tc.desc    Function test
     * @tc.level   0
    */
    it("SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1300", 0, async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1300 start------------------------");
      let TAG = "SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1300";
      let param = AbilityConstant.ContinueState.ACTIVE;
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.setMissionContinueState(param)
        .then(() => {
          console.info(TAG + ' success');
          expect(true).assertTrue();
          done();
        }).catch((err: BusinessError) => {
          console.info(TAG + ' failed: ' + JSON.stringify(err.code));
          console.info(TAG + ' failed: ' + JSON.stringify(err.message));
          expect(false).assertTrue()
          done();
        });
      } catch (error) {
        console.info(TAG + ' catch: ' + JSON.stringify(error.code));
        expect().assertFail();
        done();
      }
      sleep(2000);
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_1300 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0900
     * @tc.name    setMissionContinueState ContinueState is INACTIVE successful.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0900", 0, async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0900 start------------------------");
      let TAG = "SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0900";
      let param = AbilityConstant.ContinueState.INACTIVE;
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      context.setMissionContinueState(param, (err: BusinessError, result: undefined) => {
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
      sleep(2000);
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0900 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0800
     * @tc.name    setMissionContinueState ContinueState is ACTIVE successful.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0800", 0, async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0800 start------------------------");
      let TAG = "SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0800";
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      let param = AbilityConstant.ContinueState.ACTIVE;
      context.setMissionContinueState(param, (err: BusinessError, result: undefined) => {
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
      sleep(2000);
      console.info("-----------------SUB_DMS_StandardOs_supportContinueAbility_continueAbility_ComponentTransfer_0800 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0100
     * @tc.name    Get call is failed bundleName is null.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0100' , 0 , async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0100 start------------------------");
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbilityByCall({
          bundleName : '',
          abilityName : 'com.example.lifecycletest.MainAbility',
          deviceId : dvId
        })
        .then((data: Caller) =>{
          let caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err: BusinessError) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 16000050).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertFail();
        done()
      }
      sleep(2000);
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0100 end------------------------");
    });


    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0200
     * @tc.name    Get call is failed bundleName is undefined.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0200' , 0 , async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0200 start------------------------");
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbilityByCall({
          bundleName : undefined,
          abilityName : 'com.example.lifecycletest.MainAbility',
          deviceId : dvId
        })
        .then((data: Caller) =>{
          let caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err: BusinessError) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 16000050).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertFail();
        done()
      }
      sleep(2000);
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0200 end------------------------");
    });

    
    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0300
     * @tc.name    Get call is failed bundleName is err.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0300' , 0 , async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0300 start------------------------");
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbilityByCall({
          bundleName : '125skausdas',
          abilityName : 'com.example.lifecycletest.MainAbility',
          deviceId : dvId
        })
        .then((data: Caller) =>{
          let caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err: BusinessError) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 401).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertFail();
        done()
      }
      sleep(2000);
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0300 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0400
     * @tc.name    Get call is failed bundleName is err.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0400' , 0 , async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0400 start------------------------");
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbilityByCall({
          bundleName : '125skausdas',
          abilityName : 'com.example.lifecycletest.MainAbility',
          deviceId : dvId
        })
        .then((data: Caller) =>{
          let caller: Caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err: BusinessError) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 401).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertFail();
        done()
      }
      sleep(2000);
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0400 end------------------------");
    });


    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0500
     * @tc.name    Get call is failed abilityName is null.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0500' , 0 , async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0500 start------------------------");
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbilityByCall({
          bundleName : 'com.acts.example.dmsfwkstagetest',
          abilityName : '',
          deviceId : dvId
        })
        .then((data: Caller) =>{
          let caller: Caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err: BusinessError) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 16000050).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertFail();
        done()
      }
      sleep(2000);
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0500 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0600
     * @tc.name    Get call is failed abilityName is undefined.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0600' , 0 , async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0600 start------------------------");
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbilityByCall({
          bundleName : 'com.acts.example.dmsfwkstagetest',
          abilityName : undefined,
          deviceId : dvId
        })
        .then((data: Caller) =>{
          let caller: Caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err: BusinessError) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 16000050).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertFail();
        done()
      }
      sleep(2000);
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0600 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0700
     * @tc.name    Get call is failed abilityName is errparameter.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0700' , 0 , async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0700 start------------------------");
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbilityByCall({
          bundleName : 'com.acts.example.dmsfwkstagetest',
          abilityName : 'xys123456',
          deviceId : dvId
        })
        .then((data: Caller) =>{
          let caller: Caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err: BusinessError) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 401).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertFail();
        done()
      }
      sleep(2000);
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0700 end------------------------");
    });


    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0800
     * @tc.name    Get call deviceId is localDeviceId
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0800' , 0 , async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0800 start------------------------");
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbilityByCall({
          bundleName : 'com.acts.example.dmsfwkstagetest',
          abilityName : 'com.example.lifecycletest.MainAbility',
          deviceId : localDeviceId
        })
        .then((data: Caller) =>{
          let caller: Caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
        }).catch((err: BusinessError) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err.code == 16000050).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertFail();
        done()
      }
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0800 end------------------------");
      sleep(2000)
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0900
     * @tc.name    Get call is success.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0900' , 0 , async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0900 start------------------------");
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbilityByCall({
          bundleName : 'com.acts.example.dmsfwkstagetest',
          abilityName : 'com.example.lifecycletest.MainAbility',
          deviceId : dvId
        })
        .then((data: Caller) =>{
          call = data;
          console.log('get caller is success caller is ' + call)
          expect(typeof(call)).assertEqual('object')
          done()
        }).catch((err: BusinessError) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err == undefined).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertFail();
        done()
      }
      sleep(2000)
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_0900 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1000
     * @tc.name    call is release
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1000' , 0 , async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1000 start------------------------");
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbilityByCall({
          bundleName : 'com.acts.example.dmsfwkstagetest',
          abilityName : 'com.example.lifecycletest.MainAbility',
          deviceId : dvId
        })
        .then((data: Caller) =>{
          let caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
          sleep(2000)
          try {
            caller.onRelease(() =>{
              console.log('call is onRelease success')
              done()
            })
            sleep(2000)
            try {
              caller.release();
              console.log('caller release success')
              expect().assertEqual(undefined)
              done()
            } catch (error) {
              console.log('catch error is ' + JSON.stringify(error))
              expect().assertFail();
              done()
            }
          } catch (error) {
            console.log('catch error is ' + error)
            expect().failed();
            done()
          }
        }).catch((err: BusinessError) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err == undefined).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertFail();
        done()
      }
      sleep(2000);
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1000 end------------------------");
    })

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1100
     * @tc.name    call is release
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1000' , 0 , async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1000 start------------------------");
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbilityByCall({
          bundleName : 'com.acts.example.dmsfwkstagetest',
          abilityName : 'com.example.lifecycletest.MainAbility',
          deviceId : dvId
        })
        .then((data: Caller) =>{
          let caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
          sleep(2000)
          try {
            caller.onRelease(() =>{
              console.log('call is onRelease success')
              done()
            })
          } catch (error) {
            console.log('catch error is ' + error)
            expect().failed();
            done()
          }
        }).catch((err: BusinessError) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err == undefined).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertFail();
        done()
      }
      sleep(2000);
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1000 end------------------------");
    })

    /*
     * @tc.number  SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1200
     * @tc.name    call is call
     * @tc.desc    Function test
     * @tc.level   0
     */
    it('SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1200' , 0 , async (done: Function) => {
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1200 start------------------------");
      let context:common.UIAbilityContext | undefined = AppStorage.get('context') as common.UIAbilityContext
      try {
        context.startAbilityByCall({
          bundleName : 'com.acts.example.dmsfwkstagetest',
          abilityName : 'com.example.lifecycletest.MainAbility',
          deviceId : dvId
        })
        .then((data: Caller) =>{
          let caller = data;
          console.log('get caller is success caller is ' + caller)
          expect(typeof(caller)).assertEqual('object')
          done()
          sleep(2000)
          try {
            let MyMessageAble1 = new MyMessageAble(1, 'world')
            caller.call('test', MyMessageAble1);
            console.log('call.call is success')
            done()
          } catch (error) {
            console.log('call.call catch error is ' + JSON.stringify(error))
            expect().assertFail();
            done()
          }
        }).catch((err: BusinessError) =>{
          console.log('get caller is failed err is ' + JSON.stringify(err))
          expect(err == undefined).assertTrue()
          done()
        })
      } catch (error) {
        console.log('catch error is ' + JSON.stringify(error))
        expect().assertFail();
        done()
      }
      sleep(2000);
      console.info("-----------------SUB_DMS_StandardOs_Collaboration_Bycall_singletonOncall_1200 end------------------------");
    });
  })
}