/*
 * Copyright (C) 2026 Huawei Device Co., Ltd.
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

import { describe, it, expect, TestType, Size, Level, beforeAll, beforeEach, afterEach, afterAll} from '../../../hypium/index';
import { BusinessError } from '@ohos.base';
import hilog from '@ohos.hilog';
import Utils from './Util.test';
import rpc from '@ohos.rpc';
import common from '@ohos.app.ability.common';
import { AppStorage } from '@ohos.arkui.stateManagement';
import abilityDelegatorRegistry from '@ohos.app.ability.abilityDelegatorRegistry';
import abilityAccessCtrl, { Context, PermissionRequestResult } from "@ohos.abilityAccessCtrl";
import deviceManager from '@ohos.distributedDeviceManager';

let abilityDelegatorArguments = abilityDelegatorRegistry.getArguments();

let user = abilityDelegatorArguments.parameters["-u"];

let domain: int = 0x0000; //日志标识,0x0000作为测试框架的业务标识
let tag: string = 'testTag'; //日志标识字符串,作为tag标识当前runner类下的测试行为
let gIRemoteObject: rpc.IRemoteObject | undefined;
let gIRemoteObjectAsync: rpc.IRemoteObject | undefined;
let gIRemoteObjectCallingInfo: rpc.IRemoteObject | undefined;
let abilityDelegator: abilityDelegatorRegistry.AbilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();
let atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();
let bundleNameRpc: string = "com.rpctaihetest.static";
let abilityNameRpc: string = "ServiceAbility";
let abilityNameRpcAsync: string = "ServiceAsyncAbility";
let abilityNameRpcCallingInfo: string = "ServiceAsyncCallingInfoAbility";

let connectId: long;
let isDead: boolean = false;
let testFlag: boolean = true;
let strlen: int = 40960;
let PERMISION_ONT: string = "允许";

//检查当前应用是否有可信的设备
async function checkAvailableDevice() {
  hilog.info(domain, tag, '%{public}s', "checkAvailableDevice in ");
  let dmInstance = deviceManager.createDeviceManager(bundleNameRpc);
  let deviceInfoList: Array<deviceManager.DeviceBasicInfo>  = dmInstance.getAvailableDeviceListSync();
  hilog.info(domain, tag, '%{public}s', "checkAvailableDevice get deviceInfoList " + JSON.stringify(deviceInfoList));
  if (deviceInfoList.length != 0) {
    return false;
  } else{
    return true;
  }
}

class MyParcelable implements rpc.Parcelable {
  num: int = 0;
  str: string = "";

  constructor(num: int, str: string) {
    this.num = num;
    this.str = str;
  }

  marshalling(dataOut: rpc.MessageSequence): boolean {
    dataOut.writeInt(this.num);
    dataOut.writeString(this.str);
    return true;
  }

  unmarshalling(dataIn: rpc.MessageSequence): boolean {
    this.num = dataIn.readInt();
    this.str = dataIn.readString();
    return true;
  }

}

class TestCallerInfo extends rpc.RemoteObject {
  constructor(descriptor: string) {
    super(descriptor);
  }

  onRemoteMessageRequest(code: int, data: rpc.MessageSequence, reply: rpc.MessageSequence, option: rpc.MessageOption,
    callingInfo?: rpc.CallingInfo): boolean {
    hilog.info(domain, tag, '%{public}s', "TestCallerInfo onRemoteMessageRequest in code is: " + code);
    if (code === 1) {
      try {
        let callingPid: int = rpc.IPCSkeleton.getCallingPid();
        hilog.info(domain, tag, '%{public}s', "TestCallerInfo getCallingPid is:" + callingPid);
        expect(callingPid).assertEqual(callingInfo?.callerPid);
        hilog.info(domain, tag, '%{public}s', "TestCallerInfo callerPid is:" + callingInfo?.callerPid);
        let callingUid: int = rpc.IPCSkeleton.getCallingUid();
        hilog.info(domain, tag, '%{public}s', "TestCallerInfo getCallingUid is:" + callingUid);
        expect(callingUid).assertEqual(callingInfo?.callerUid);
        hilog.info(domain, tag, '%{public}s', "TestCallerInfo callerUid is:" + callingInfo?.callerUid);
        let callingTokenId: long = rpc.IPCSkeleton.getCallingTokenId();
        expect(callingTokenId).assertEqual(callingInfo?.callerTokenId);
        let remoteDeviceId: string = rpc.IPCSkeleton.getCallingDeviceID();
        expect(remoteDeviceId).assertEqual(callingInfo?.remoteDeviceId);
        let localDeviceId: string = rpc.IPCSkeleton.getLocalDeviceID();
        expect(localDeviceId).assertEqual(callingInfo?.localDeviceId);
        let isLocalCalling: boolean = rpc.IPCSkeleton.isLocalCalling();
        hilog.info(domain, tag, '%{public}s', "TestCallerInfo isLocalCalling is:" + callingInfo?.isLocalCalling);
        expect(isLocalCalling).assertEqual(callingInfo?.isLocalCalling);
        expect(callingInfo?.isLocalCalling).assertFalse();
      } catch (error) {
        error = error as BusinessError;
        hilog.info(domain, tag, '%{public}s', "TestCallerInfo onRemoteMessageRequest error is:" + error);
        testFlag = false;
        return false;
      }
      return true;
    } else {
      hilog.info(domain, tag, '%{public}s', "unknown code: " + code);
      return false;
    }
  }
}


class MyDeathRecipient implements rpc.DeathRecipient {
  onRemoteDied: () => void = () => {
    hilog.info(domain, tag, '%{public}s', 'into onRemoteDied');
    isDead = true;
  }
}

class TestOption extends rpc.MessageOption{
  constructor() {
    super();
  }
}

class TestOption2 extends rpc.MessageOption{
  constructor(syncFlags: int, waitTime: int) {
    super(syncFlags, waitTime);
  }
}

class TestOption1 extends rpc.MessageOption{
  constructor(syncFlags: int) {
    super(syncFlags);
  }
}

class TestOptionBoolean extends rpc.MessageOption{
  constructor(isAsync: boolean) {
    super(isAsync);
  }
}

function sendMessageRequestCallback_Proxy_ReadAndWrite(err: BusinessError | null, result: rpc.RequestResult | undefined) {
  try {
    if (result != null) {
      hilog.info(domain, tag, '%{public}s', 'sendMessageRequestCallback_Proxy_ReadAndWrite Callback');
      expect(result.errCode).assertEqual(0);
      let res = result.reply.readInt();
      hilog.info(domain, tag, '%{public}s', 'sendMessageRequest Callback readInt is ' + res);
      expect(res).assertEqual(112233);
      let res_s = result.reply.readString();
      hilog.info(domain, tag, '%{public}s', 'sendMessageRequest Callback readString is ' + res_s);
      expect(res_s).assertEqual("ipctest");
    }
  } catch(error) {
    hilog.info(domain, tag, '%{public}s', 'sendMessageRequest Callback err is ' + error);
    expect(error != null).assertTrue();
  }
}

function asyncCallback(err: BusinessError | null, result: rpc.RequestResult | undefined): void {
  try {
    if (result != null) {
      hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncCallback_0100 callback');
      expect(result.errCode).assertEqual(0);
            
      let replyNum: int = result.reply.readInt();
      let replyStr: string = result.reply.readString();
      hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncCallback_0100 callback replyNum: ' + replyNum + ', replyStr: ' + replyStr);
            
      expect(replyNum).assertEqual(50000);
      expect(replyStr).assertEqual("async_callback_test");
    }
  } catch (error) {
    hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncCallback_0100 callback error: ' + error);
    expect(error != null).assertTrue();
  }
}

export default function rpcTest() {

  describe("rpcTest", (): void => {
    hilog.info(domain, tag, '%{public}s', 'describe start');
    const CODE_TEST_ONE: int  = 1;
    const CODE_TESTCALLERINFO: int = 100;

    let getPermission = async () =>{
      hilog.info(domain, tag, '%{public}s', "getPermission is start");
      let context = AppStorage.get<common.UIAbilityContext>("context") as common.UIAbilityContext;
      atManager.requestPermissionsFromUser(context,["ohos.permission.DISTRIBUTED_DATASYNC"],(err: BusinessError<void> | null, data: PermissionRequestResult | undefined)  => {
        hilog.info(domain, tag, '%{public}s', "data: " + JSON.stringify(data));
        hilog.info(domain, tag, '%{public}s', "data Permissions: " + data?.permissions);
        hilog.info(domain, tag, '%{public}s', "data authResults" + data?.authResults);
        hilog.info(domain, tag, '%{public}s', "data dialogShownResults" + data?.dialogShownResults);
      })
    }

    beforeAll(async() => {
      hilog.info(domain, tag, '%{public}s', 'beforeAll in');
      try {
        let cmd = "aa start -a EntryAbility -b com.rpctaihetest.static";
        if(user !== undefined){
            cmd += ' -u ' + user;
        }
        await abilityDelegator.executeShellCommand(cmd);
        await Utils.msSleep(6000);

        await getPermission();
        await Utils.msSleep(2000);
        await Utils.clickRequestPermission(PERMISION_ONT);
        await Utils.msSleep(7000);

        //环境初始化
        let checkResult = await checkAvailableDevice();
        if (!checkResult) {
          await Utils.unbindStub();
        }
        await Utils.msSleep(500);
        let checkResult1 = await checkAvailableDevice();
        //如果有可信的设备 就不需要再通过PIN码bind
        if (checkResult1) {
          await Utils.startDiscovering();
          await Utils.msSleep(20000);
          await Utils.stopDiscovering();
          await Utils.msSleep(1000);
        }
        await Utils.msSleep(1000);
        await Utils.startAbility();
        await Utils.msSleep(900);
        await Utils.toConnectAbility(bundleNameRpc, abilityNameRpc).then(data => {
          gIRemoteObject = data;
          hilog.info(domain, tag, '%{public}s', "toConnectAbility data is" + data);
        })
        await Utils.toConnectAbility(bundleNameRpc, abilityNameRpcAsync).then(data => {
          gIRemoteObjectAsync = data;
          hilog.info(domain, tag, '%{public}s', "toConnectAbility data is" + data);
        })
        await Utils.toConnectAbility(bundleNameRpc, abilityNameRpcCallingInfo).then(data => {
          gIRemoteObjectCallingInfo = data;
          hilog.info(domain, tag, '%{public}s', "toConnectAbility data is" + data);
        })
        await Utils.msSleep(500);
        hilog.info(domain, tag, '%{public}s', "beforeAll done");
        await Utils.msSleep(4000);
        hilog.info(domain, tag, '%{public}s', 'beforeAll gIRemoteObject is ' + gIRemoteObject);
      } catch (error) {
        hilog.info(domain, tag, '%{public}s', 'beforeAll error is: ' + error);
      }
      hilog.info(domain, tag, '%{public}s', 'beforeAll done');
    })

    afterEach(async() => {
      testFlag = true;
    })
    afterAll(async() => {
      hilog.info(domain, tag, '%{public}s', "afterAll called");
      await Utils.msSleep(1000);
      // 删除当前应用的可信设备
      let checkResult = await checkAvailableDevice();
      if (!checkResult) {
        await Utils.unbindStub();
      }
      await Utils.msSleep(1000);
      hilog.info(domain, tag, '%{public}s', "afterAll done");
    })

    /**
     * @tc.name   SUB_RPC_registerDeathRecipient_0100
     * @tc.number SUB_RPC_registerDeathRecipient_0100
     * @tc.desc   test registerDeathRecipient
     * @tc.type   FUNCTION
     * @tc.size   MEDIUMTEST
     * @tc.level  LEVEL1
     */
    it("SUB_RPC_registerDeathRecipient_0100", TestType.FUNCTION|Size.MEDIUMTEST|Level.LEVEL1, async (done: () => void): Promise<void> => {
      await Utils.msSleep(500);
      hilog.info(domain, tag, '%{public}s', '-------------------- start SUB_RPC_registerDeathRecipient_0100 --------------------');
      try {
        let deathRecipient = new MyDeathRecipient();
        expect(gIRemoteObject != undefined).assertTrue();
        gIRemoteObject!.registerDeathRecipient(deathRecipient, 0);
        gIRemoteObject!.unregisterDeathRecipient(deathRecipient, 0);
      } catch (error) {
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_registerDeathRecipient_0100 error is: ' + error);
        expect(error == null).assertTrue();
      } finally {
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_registerDeathRecipient_0100 finally done');
      }
      done();
      hilog.info(domain, tag, '%{public}s', '-------------------- end SUB_RPC_registerDeathRecipient_0100 --------------------');
    });

    /**
     * @tc.name   SUB_RPC_RemoteProxy_SendMessageRequest_0100
     * @tc.number SUB_RPC_RemoteProxy_SendMessageRequest_0100
     * @tc.desc   test RemoteProxy SendMessageRequest
     * @tc.type   FUNCTION
     * @tc.size   MEDIUMTEST
     * @tc.level  LEVEL1
     */
    it("SUB_RPC_RemoteProxy_SendMessageRequest_0100", TestType.FUNCTION|Size.MEDIUMTEST|Level.LEVEL1, async (done: () => void): Promise<void> => {
      await Utils.msSleep(500);
      hilog.info(domain, tag, '%{public}s', '-------------------- start SUB_RPC_RemoteProxy_SendMessageRequest_0100 --------------------');

      let data = rpc.MessageSequence.create();
      let reply = rpc.MessageSequence.create();

      let option = new TestOption2(rpc.MessageOption.TF_SYNC, rpc.MessageOption.TF_WAIT_TIME);
      try {

        data.writeInt(4700);
        data.writeBoolean(true);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject!.sendMessageRequest(CODE_TEST_ONE, data, reply, option)
          .then((ret: rpc.RequestResult) => {
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_SendMessageRequest_0100 .then.errCode is: ' + ret.errCode);
            let res = reply.readInt();
            expect(res).assertEqual(4700);
          }).catch((err) => {
            expect(err == null).assertTrue();
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_SendMessageRequest_0100 err in catch is: ' + err);
          })
          .finally(() => {
            data.reclaim();
            reply.reclaim();
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_SendMessageRequest_0100 reclaim done');
          })
      } catch (error) {
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_SendMessageRequest_0100 error is: ' + error);
        expect(error == null).assertTrue();
      }
      done();
      hilog.info(domain, tag, '%{public}s', '-------------------- end SUB_RPC_RemoteProxy_SendMessageRequest_0100 --------------------');
    });

    /**
     * @tc.name   SUB_RPC_RemoteProxy_SendMessageRequest_0200
     * @tc.number SUB_RPC_RemoteProxy_SendMessageRequest_0200
     * @tc.desc   test RemoteProxy SendMessageRequest
     * @tc.type   FUNCTION
     * @tc.size   MEDIUMTEST
     * @tc.level  LEVEL1
     */
    it("SUB_RPC_RemoteProxy_SendMessageRequest_0200", TestType.FUNCTION|Size.MEDIUMTEST|Level.LEVEL1, async (done: () => void): Promise<void> => {
      await Utils.msSleep(500);
      hilog.info(domain, tag, '%{public}s', '-------------------- start SUB_RPC_RemoteProxy_SendMessageRequest_0200 --------------------');

      let data = rpc.MessageSequence.create();
      let reply = rpc.MessageSequence.create();

      let option = new TestOption2(rpc.MessageOption.TF_ASYNC, rpc.MessageOption.TF_WAIT_TIME);
      try {

        data.writeInt(4700);
        data.writeBoolean(true);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject!.sendMessageRequest(CODE_TEST_ONE, data, reply, option)
          .then((ret: rpc.RequestResult) => {
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_SendMessageRequest_0200 .then.errCode is: ' + ret.errCode);
            Utils.msSleep(5000);
            let res = reply.readInt();
            expect(res).assertEqual(0);
          }).catch((err) => {
            expect(err == null).assertTrue();
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_SendMessageRequest_0200 err in catch is: ' + err);
          })
          .finally(() => {
            data.reclaim();
            reply.reclaim();
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_SendMessageRequest_0200 reclaim done');
          })
      } catch (error) {
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_SendMessageRequest_0200 error is: ' + error);
        expect(error == null).assertTrue();
      }
      done();
      hilog.info(domain, tag, '%{public}s', '-------------------- end SUB_RPC_RemoteProxy_SendMessageRequest_0200 --------------------');
    });

    /**
     * @tc.name   SUB_RPC_RemoteProxy_SendMessageRequest_0300
     * @tc.number SUB_RPC_RemoteProxy_SendMessageRequest_0300
     * @tc.desc   test RemoteProxy SendMessageRequest
     * @tc.type   FUNCTION
     * @tc.size   MEDIUMTEST
     * @tc.level  LEVEL1
     */
    it("SUB_RPC_RemoteProxy_SendMessageRequest_0300", TestType.FUNCTION|Size.MEDIUMTEST|Level.LEVEL1, async (done: () => void): Promise<void> => {
      await Utils.msSleep(500);
      hilog.info(domain, tag, '%{public}s', '-------------------- start SUB_RPC_RemoteProxy_SendMessageRequest_0300 --------------------');
      try {
        let data = rpc.MessageSequence.create();
        let reply = rpc.MessageSequence.create();
        let option = new rpc.MessageOption();
        data.writeInt(4700);
        data.writeBoolean(true);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject!.sendMessageRequest(CODE_TEST_ONE, data, reply, option)
          .then((ret: rpc.RequestResult) => {
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_SendMessageRequest_0300 .then.errCode is: ' + ret.errCode);
            let res = reply.readInt();
            expect(res).assertEqual(4700);
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_SendMessageRequest_0300 reply res is: ' + res);
          })
          .catch((err) => {
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_SendMessageRequest_0300 err in catch is: ' + err);
            expect(err == null).assertTrue();
          })
          .finally(() => {
            data.reclaim();
            reply.reclaim();
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_SendMessageRequest_0300 reclaim done');
          })
      } catch (error) {
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_SendMessageRequest_0300 error is: ' + error);
        expect(error == null).assertTrue();
      }
      done();
      hilog.info(domain, tag, '%{public}s', '-------------------- end SUB_RPC_RemoteProxy_SendMessageRequest_0300 --------------------');
    });

    /**
     * @tc.name   SUB_RPC_RemoteProxy_SendMessageRequest_Callback_0100
     * @tc.number SUB_RPC_RemoteProxy_SendMessageRequest_Callback_0100
     * @tc.desc   test RemoteProxy SendMessageRequest  callback after write and read Proxy
     * @tc.type   FUNCTION
     * @tc.size   MEDIUMTEST
     * @tc.level  LEVEL1
     */
    it("SUB_RPC_RemoteProxy_SendMessageRequest_Callback_0100", TestType.FUNCTION|Size.MEDIUMTEST|Level.LEVEL1, async (done: () => void): Promise<void> => {
      await Utils.msSleep(500);
      hilog.info(domain, tag, '%{public}s', '-------------------- start SUB_RPC_RemoteProxy_SendMessageRequest_Callback_0100 --------------------');
      let data = rpc.MessageSequence.create();
      let reply = rpc.MessageSequence.create();
      try {
        let option = new rpc.MessageOption();
        data.writeInt(112233);
        data.writeString("ipctest");
        expect(gIRemoteObject != undefined).assertTrue();
        gIRemoteObject!.sendMessageRequest(2, data, reply, option, sendMessageRequestCallback_Proxy_ReadAndWrite);
        await Utils.msSleep(2000);

      } catch (error) {
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_SendMessageRequest_Callback_0100 error is: ' + error);
        expect(error == null).assertTrue();
      } finally {
        data.reclaim();
        reply.reclaim();
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_SendMessageRequest_Callback_0100 reclaim done');
      }
      done();
      hilog.info(domain, tag, '%{public}s', '-------------------- end SUB_RPC_RemoteProxy_SendMessageRequest_Callback_0100 --------------------');
    });

    /**
     * @tc.name     SUB_RPC_RemoteProxy_IsObjectDead_0100
     * @tc.number   SUB_RPC_RemoteProxy_IsObjectDead_0100
     * @tc.desc     test RemoteProxy IsObjectDead
     * @tc.type     FUNCTION
     * @tc.size     MEDIUMTEST
     * @tc.level    LEVEL1
     */
    it("SUB_RPC_RemoteProxy_IsObjectDead_0100", TestType.FUNCTION|Size.MEDIUMTEST|Level.LEVEL1, async (done: () => void): Promise<void> => {
      await Utils.msSleep(500);
      hilog.info(domain, tag, '%{public}s', '-------------------- start SUB_RPC_RemoteProxy_IsObjectDead_0100 --------------------');
      try {
        expect(gIRemoteObject != undefined).assertTrue();
        let result = gIRemoteObject!.isObjectDead();
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_IsObjectDead_0100 result is: ' + result);
        expect(result).assertFalse();
      } catch (error) {
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_IsObjectDead_0100 error is: ' + error);
        expect(error == null).assertTrue();
      } finally {
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_IsObjectDead_0100 reclaim done');
      }

      done();
      hilog.info(domain, tag, '%{public}s', '-------------------- end SUB_RPC_RemoteProxy_IsObjectDead_0100 --------------------');
    });

    /**
     * @tc.name   SUB_RPC_RemoteProxy_getDescriptor_0100
     * @tc.number SUB_RPC_RemoteProxy_getDescriptor_0100
     * @tc.desc   test RemoteProxy getDescriptor RemoteProxy
     * @tc.type   FUNCTION
     * @tc.size   MEDIUMTEST
     * @tc.level  LEVEL1
     */
    it("SUB_RPC_RemoteProxy_getDescriptor_0100", TestType.FUNCTION|Size.MEDIUMTEST|Level.LEVEL1, async (done: () => void): Promise<void> => {
      await Utils.msSleep(500);
      hilog.info(domain, tag, '%{public}s', '-------------------- start SUB_RPC_RemoteProxy_getDescriptor_0100 --------------------');
      try {
        expect(gIRemoteObject != undefined).assertTrue();
        let reult = gIRemoteObject!.getDescriptor();
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_getDescriptor_0100 getDescriptor is: ' + reult);
        expect(reult).assertEqual("rpcTestAbility");
      } catch (error) {
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_getDescriptor_0100 error is: ' + error);
        expect(error == null).assertTrue();
      } finally {
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RemoteProxy_getDescriptor_0100 reclaim done');
      }
      done();
      hilog.info(domain, tag, '%{public}s', '-------------------- end SUB_RPC_RemoteProxy_getDescriptor_0100 --------------------');
    });

    /**
     * @tc.name   SUB_RPC_onRemoteMessageRequest_0100
     * @tc.number SUB_RPC_onRemoteMessageRequest_0100
     * @tc.desc   [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
     * @tc.type   FUNCTION
     * @tc.size   MEDIUMTEST
     * @tc.level  LEVEL3
     */
    it("SUB_RPC_onRemoteMessageRequest_0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async (done: () => void): Promise<void> => {
      hilog.info(domain, tag, '%{public}s', "---------------------start SUB_RPC_onRemoteMessageRequest_0100---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      let flag: boolean = false;
      try {
        let TestCallerInfoObject = new TestCallerInfo("TestCallerInfo")
        data.writeRemoteObject(TestCallerInfoObject)
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject!.sendMessageRequest(CODE_TESTCALLERINFO, data, reply, option)
          .then((result) => {
            expect(result.errCode).assertEqual(0);
            flag = true;
          }).catch((err: Error) => {
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_0100 err in catch is: ' + err);
            expect(err != null).assertTrue();
          }).finally(() => {
            data.reclaim();
            reply.reclaim();
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_0500 reclaim done');
            expect(flag).assertTrue();
          })
      } catch (error) {
        error = error as BusinessError;
        hilog.info(domain, tag, '%{public}s', "SUB_RPC_onRemoteMessageRequest_0100 error is:" + error);
        expect(error).assertEqual(null);
      } finally {
        hilog.info(domain, tag, '%{public}s', "SUB_RPC_onRemoteMessageRequest_0100 done");
        expect(testFlag).assertTrue();
        done();
      }
      hilog.info(domain, tag, '%{public}s', "---------------------end SUB_RPC_onRemoteMessageRequest_0100---------------------------");
    });

    /**
     * @tc.name      SUB_RPC_RmoteProxy_getLocalInterface_ErrorCode_0100
     * @tc.number    SUB_RPC_RmoteProxy_getLocalInterface_ErrorCode_0100
     * @tc.desc      test getLocalInterface
     * @tc.type     FUNCTION
     * @tc.size     MEDIUMTEST
     * @tc.level    LEVEL1
     */
    it("SUB_RPC_RmoteProxy_getLocalInterface_ErrorCode_0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL1,async (done: () => void): Promise<void> => {
      await Utils.msSleep(500);
      hilog.info(domain, tag, '%{public}s','-------------------- start SUB_RPC_RmoteProxy_getLocalInterface_ErrorCode_0100 --------------------');
      try {
        expect(gIRemoteObject != undefined).assertTrue();
        let res = gIRemoteObject!.getLocalInterface('rpcTestAbility');
      } catch (err) {
        err = err as BusinessError;
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RmoteProxy_getLocalInterface_ErrorCode_0100 error is: ' + err);
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RmoteProxy_getLocalInterface_ErrorCode_0100 error code is: ' + err.code);
        expect(err.code == 1900006).assertTrue();
        expect(err.message != null).assertTrue();
      } finally {
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_RmoteProxy_getLocalInterface_ErrorCode_0100 reclaim done');
        done();
      }
      hilog.info(domain, tag, '%{public}s','-------------------- end SUB_RPC_RmoteProxy_getLocalInterface_ErrorCode_0100 --------------------');
    });

    /**
     * @tc.name     SUB_RPC_onRemoteMessageRequest_AsyncCallingInfo_0100
     * @tc.number   SUB_RPC_onRemoteMessageRequest_AsyncCallingInfo_0100
     * @tc.desc     test async onRemoteMessageRequest with CallingInfo
     * @tc.type     FUNCTION
     * @tc.size     MEDIUMTEST
     * @tc.level    LEVEL1
     */
    it("SUB_RPC_onRemoteMessageRequest_AsyncCallingInfo_0100", TestType.FUNCTION|Size.MEDIUMTEST|Level.LEVEL1, async (done: () => void): Promise<void> => {
      await Utils.msSleep(500);
      hilog.info(domain, tag, '%{public}s', '-------------------- start SUB_RPC_onRemoteMessageRequest_AsyncCallingInfo_0100 --------------------');
      const CODE_ASYNC_CALLINGINFO: int = 200;
      let data = rpc.MessageSequence.create();
      let reply = rpc.MessageSequence.create();
      let option = new rpc.MessageOption(rpc.MessageOption.TF_SYNC);
      
      try {
        data.writeInt(10000);
        data.writeString("async_callinginfo_test");
        
        expect(gIRemoteObjectCallingInfo != undefined).assertTrue();
        await gIRemoteObjectCallingInfo!.sendMessageRequest(CODE_ASYNC_CALLINGINFO, data, reply, option)
          .then((ret: rpc.RequestResult) => {
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncCallingInfo_0100 errCode: ' + ret.errCode);
            expect(ret.errCode).assertEqual(0);
            
            let callerPid: int = reply.readInt();
            let callerUid: int = reply.readInt();
            hilog.info(domain, tag, '%{public}s', 'Received CallingInfo - PID: ' + callerPid + ', UID: ' + callerUid);
            expect(callerPid).assertEqual(-1);
            expect(callerUid).assertEqual(-1);
          })
          .catch((err: Error) => {
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncCallingInfo_0100 err: ' + err);
            expect(err == null).assertTrue();
          })
          .finally(() => {
            data.reclaim();
            reply.reclaim();
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncCallingInfo_0100 reclaim done');
          });
      } catch (error) {
        error = error as BusinessError;
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncCallingInfo_0100 error: ' + error);
        expect(error == null).assertTrue();
      }
      
      done();
      hilog.info(domain, tag, '%{public}s', '-------------------- end SUB_RPC_onRemoteMessageRequest_AsyncCallingInfo_0100 --------------------');
    });

    /**
     * @tc.name     SUB_RPC_onRemoteMessageRequest_AsyncPromise_0200
     * @tc.number   SUB_RPC_onRemoteMessageRequest_AsyncPromise_0200
     * @tc.desc     test async onRemoteMessageRequest returns Promise without CallingInfo
     * @tc.type     FUNCTION
     * @tc.size     MEDIUMTEST
     * @tc.level    LEVEL1
     */
    it("SUB_RPC_onRemoteMessageRequest_AsyncPromise_0200", TestType.FUNCTION|Size.MEDIUMTEST|Level.LEVEL1, async (done: () => void): Promise<void> => {
      await Utils.msSleep(500);
      hilog.info(domain, tag, '%{public}s', '-------------------- start SUB_RPC_onRemoteMessageRequest_AsyncPromise_0200 --------------------');
      const CODE_ASYNC_NO_CALLERINFO: int = 201;
      let data = rpc.MessageSequence.create();
      let reply = rpc.MessageSequence.create();
      let option = new rpc.MessageOption(rpc.MessageOption.TF_SYNC);
      
      try {
        data.writeInt(20000);
        data.writeString("async_promise_no_callerinfo");
        
        expect(gIRemoteObjectAsync != undefined).assertTrue();
        await gIRemoteObjectAsync!.sendMessageRequest(CODE_ASYNC_NO_CALLERINFO, data, reply, option)
          .then((ret: rpc.RequestResult) => {
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncPromise_0200 errCode: ' + ret.errCode);
            expect(ret.errCode).assertEqual(0);
            
            let replyNum: int = reply.readInt();
            let replyStr: string = reply.readString();
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncPromise_0200 replyNum: ' + replyNum + ', replyStr: ' + replyStr);
            
            expect(replyNum).assertEqual(20000);
            expect(replyStr).assertEqual("async_promise_no_callerinfo");
          })
          .catch((err: Error) => {
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncPromise_0200 err: ' + err);
            expect(err == null).assertTrue();
          })
          .finally(() => {
            data.reclaim();
            reply.reclaim();
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncPromise_0200 reclaim done');
          });
      } catch (error) {
        error = error as BusinessError;
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncPromise_0200 error: ' + error);
        expect(error == null).assertTrue();
      }
      
      done();
      hilog.info(domain, tag, '%{public}s', '-------------------- end SUB_RPC_onRemoteMessageRequest_AsyncPromise_0200 --------------------');
    });

    /**
     * @tc.name     SUB_RPC_onRemoteMessageRequest_AsyncPromise_0300
     * @tc.number   SUB_RPC_onRemoteMessageRequest_AsyncPromise_0300
     * @tc.desc     test async onRemoteMessageRequest with multiple parameters
     * @tc.type     FUNCTION
     * @tc.size     MEDIUMTEST
     * @tc.level    LEVEL1
     */
    it("SUB_RPC_onRemoteMessageRequest_AsyncPromise_0300", TestType.FUNCTION|Size.MEDIUMTEST|Level.LEVEL1, async (done: () => void): Promise<void> => {
      await Utils.msSleep(500);
      hilog.info(domain, tag, '%{public}s', '-------------------- start SUB_RPC_onRemoteMessageRequest_AsyncPromise_0300 --------------------');
      const CODE_ASYNC_MULTI_PARAM: int = 202;
      let data = rpc.MessageSequence.create();
      let reply = rpc.MessageSequence.create();
      let option = new rpc.MessageOption(rpc.MessageOption.TF_SYNC);
      
      try {
        data.writeInt(30000);
        data.writeInt(40000);
        data.writeString("async_multi_param");
        data.writeDouble(3.14159);
        
        expect(gIRemoteObjectAsync != undefined).assertTrue();
        await gIRemoteObjectAsync!.sendMessageRequest(CODE_ASYNC_MULTI_PARAM, data, reply, option)
          .then((ret: rpc.RequestResult) => {
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncPromise_0300 errCode: ' + ret.errCode);
            expect(ret.errCode).assertEqual(0);
            
            let replySum: int = reply.readInt();
            let replyStr: string = reply.readString();
            let replyDbl: double = reply.readDouble();
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncPromise_0300 replySum: ' + replySum + ', replyStr: ' + replyStr + ', replyDbl: ' + replyDbl);
            
            expect(replySum).assertEqual(70000);
            expect(replyStr).assertEqual("async_multi_param");
            expect(replyDbl).assertEqual(3.14159);
          })
          .catch((err: Error) => {
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncPromise_0300 err: ' + err);
            expect(err == null).assertTrue();
          })
          .finally(() => {
            data.reclaim();
            reply.reclaim();
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncPromise_0300 reclaim done');
          });
      } catch (error) {
        error = error as BusinessError;
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncPromise_0300 error: ' + error);
        expect(error == null).assertTrue();
      }
      
      done();
      hilog.info(domain, tag, '%{public}s', '-------------------- end SUB_RPC_onRemoteMessageRequest_AsyncPromise_0300 --------------------');
    });

    /**
     * @tc.name     SUB_RPC_onRemoteMessageRequest_AsyncCallback_0100
     * @tc.number   SUB_RPC_onRemoteMessageRequest_AsyncCallback_0100
     * @tc.desc     test async onRemoteMessageRequest with callback mode
     * @tc.type     FUNCTION
     * @tc.size     MEDIUMTEST
     * @tc.level    LEVEL1
     */
    it("SUB_RPC_onRemoteMessageRequest_AsyncCallback_0100", TestType.FUNCTION|Size.MEDIUMTEST|Level.LEVEL1, async (done: () => void): Promise<void> => {
      await Utils.msSleep(500);
      hilog.info(domain, tag, '%{public}s', '-------------------- start SUB_RPC_onRemoteMessageRequest_AsyncCallback_0100 --------------------');
      const CODE_ASYNC_CALLBACK: int = 203;
      let data = rpc.MessageSequence.create();
      let reply = rpc.MessageSequence.create();
      let option = new rpc.MessageOption(rpc.MessageOption.TF_SYNC);

      try {
        data.writeInt(50000);
        data.writeString("async_callback_test");
        
        expect(gIRemoteObjectAsync != undefined).assertTrue();
        gIRemoteObjectAsync!.sendMessageRequest(CODE_ASYNC_CALLBACK, data, reply, option, asyncCallback);
        await Utils.msSleep(3000);
        
        data.reclaim();
        reply.reclaim();
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncCallback_0100 reclaim done');
      } catch (error) {
        error = error as BusinessError;
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncCallback_0100 error: ' + error);
        expect(error == null).assertTrue();
      }
      
      done();
      hilog.info(domain, tag, '%{public}s', '-------------------- end SUB_RPC_onRemoteMessageRequest_AsyncCallback_0100 --------------------');
    });

    /**
     * @tc.name     SUB_RPC_onRemoteMessageRequest_AsyncLongDelay_0100
     * @tc.number   SUB_RPC_onRemoteMessageRequest_AsyncLongDelay_0100
     * @tc.desc     test async onRemoteMessageRequest with long delay processing
     * @tc.type     FUNCTION
     * @tc.size     MEDIUMTEST
     * @tc.level    LEVEL2
     */
    it("SUB_RPC_onRemoteMessageRequest_AsyncLongDelay_0100", TestType.FUNCTION|Size.MEDIUMTEST|Level.LEVEL2, async (done: () => void): Promise<void> => {
      await Utils.msSleep(500);
      hilog.info(domain, tag, '%{public}s', '-------------------- start SUB_RPC_onRemoteMessageRequest_AsyncLongDelay_0100 --------------------');
      const CODE_ASYNC_LONG_DELAY: int = 204;
      let data = rpc.MessageSequence.create();
      let reply = rpc.MessageSequence.create();
      let option = new rpc.MessageOption(rpc.MessageOption.TF_SYNC, 10);
      
      try {
        data.writeInt(60000);
        data.writeString("async_long_delay_test");
        
        expect(gIRemoteObjectAsync != undefined).assertTrue();
        await gIRemoteObjectAsync!.sendMessageRequest(CODE_ASYNC_LONG_DELAY, data, reply, option)
          .then((ret: rpc.RequestResult) => {
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncLongDelay_0100 errCode: ' + ret.errCode);
            expect(ret.errCode).assertEqual(0);
            
            let replyNum: int = reply.readInt();
            let replyStr: string = reply.readString();
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncLongDelay_0100 replyNum: ' + replyNum + ', replyStr: ' + replyStr);
            
            expect(replyNum).assertEqual(60000);
            expect(replyStr).assertEqual("async_long_delay_test");
          })
          .catch((err: Error) => {
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncLongDelay_0100 err: ' + err);
            expect(err == null).assertTrue();
          })
          .finally(() => {
            data.reclaim();
            reply.reclaim();
            hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncLongDelay_0100 reclaim done');
          });
      } catch (error) {
        error = error as BusinessError;
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteMessageRequest_AsyncLongDelay_0100 error: ' + error);
        expect(error == null).assertTrue();
      }
      
      done();
      hilog.info(domain, tag, '%{public}s', '-------------------- end SUB_RPC_onRemoteMessageRequest_AsyncLongDelay_0100 --------------------');
    });

    /**
     * @tc.name     SUB_RPC_onRemoteDied_0100
     * @tc.number   SUB_RPC_onRemoteDied_0100
     * @tc.desc     test onRemoteDied
     * @tc.type     FUNCTION
     * @tc.size     MEDIUMTEST
     * @tc.level    LEVEL1
     */
    it("SUB_RPC_onRemoteDied_0100", TestType.FUNCTION|Size.MEDIUMTEST|Level.LEVEL1, async (done: () => void): Promise<void> => {
      await Utils.msSleep(500);
      hilog.info(domain, tag, '%{public}s', '-------------------- start SUB_RPC_onRemoteDied_0100 --------------------');
      try {
        let deathRecipient = new MyDeathRecipient();
        expect(gIRemoteObject != undefined).assertTrue();
        gIRemoteObject!.registerDeathRecipient(deathRecipient, 0);
        await Utils.disConnectAbility();
        await Utils.msSleep(3000);
        let res = gIRemoteObject!.isObjectDead();
        expect(isDead).assertFalse();
        expect(res).assertFalse();
      } catch (error) {
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteDied_0100 error is: ' + error);
        expect(error == null).assertTrue();
      } finally {
        await Utils.toConnectAbility(bundleNameRpc, abilityNameRpc);
        await Utils.msSleep(4000);
        hilog.info(domain, tag, '%{public}s', 'SUB_RPC_onRemoteDied_0100 finally done');
      }
      done();
      hilog.info(domain, tag, '%{public}s', '-------------------- end SUB_RPC_onRemoteDied_0100 --------------------');
    });
  })
}