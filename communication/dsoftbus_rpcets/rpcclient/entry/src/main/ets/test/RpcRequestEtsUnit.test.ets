/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, TestType, Size, Level } from "@ohos/hypium";
import deviceManager from "@ohos.distributedDeviceManager";
import TestService from "./testService.ets";
import rpc from "@ohos.rpc";
import { Driver, ON } from "@ohos.UiTest";
import abilityAccessCtrl, { Context, PermissionRequestResult } from "@ohos.abilityAccessCtrl";
import { BusinessError } from "@ohos.base";
import Want from "@ohos.app.ability.Want";
import common from "@ohos.app.ability.common";

let atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();
let deviceList: Array<deviceManager.DeviceBasicInfo>;
let localDeviceId : String;
let dmInstance : deviceManager.DeviceManager;
let deviceId : String;
let syncDeviceIds: String[] = [];
let logTag = "[RpcClient:]";
const TEST_BUNDLE_NAME = "com.acts.rpcrequest.test";
let bundleNameRpc: String = "com.acts.rpcrequest.test";
let abilityNameRpc: String = "com.acts.rpcrequest.test.MainAbility";
export default function RpcRequestEtsUnitTest() {
  describe("RpcRequestEtsUnitTest", function () {
    console.info("-----------------------SUB_DSoftbus_RPC_API_NEW_onRemoteRequest_Test is starting-----------------------");
    const K = 1024;
    const M = 1024 * 1024;
    const G = 1024 * 1024 * 1024;
    const CODE_WRITE_REMOTEOBJECT = 1;
    const CODE_INTERFACETOKEN = 2;
    const CODE_WRITE_STRING = 3;
    const CODE_WRITE_INT = 4;
    const CODE_ALL_TYPE = 5;
    const CODE_WRITE_BYTE = 6;
    const CODE_WRITE_BYTE_MULTI = 7;
    const CODE_WRITE_SHORT = 8;
    const CODE_WRITE_SHORT_MULTI = 9;
    const CODE_WRITE_INT_MULTI = 10;
    const CODE_WRITE_LONG = 11;
    const CODE_WRITE_FLOAT = 12;
    const CODE_WRITE_DOUBLE = 13;
    const CODE_WRITE_BOOLEAN = 14;
    const CODE_WRITE_CHAR = 15;
    const CODE_WRITE_SEQUENCEABLE = 16;
    const CODE_WRITE_BYTEARRAY = 17;
    const CODE_WRITE_SHORTARRAY = 18;
    const CODE_WRITE_INTARRAY = 19;
    const CODE_WRITE_LONGARRAY = 20;
    const CODE_WRITE_FLOATARRAY = 21;
    const CODE_WRITE_DOUBLEARRAY = 22;
    const CODE_WRITE_BOOLEANARRAY = 23;
    const CODE_WRITE_CHARARRAY = 24;
    const CODE_WRITE_STRINGARRAY = 25;
    const CODE_WRITE_NOEXCEPTION = 26;
    const CODE_WRITE_SEQUENCEABLEARRAY = 27;
    const CODE_ALL_ARRAY_TYPE = 28;
    const CODE_WRITE_REMOTEOBJECTARRAY = 29;
    const CODE_WRITE_REMOTEOBJECTARRAY_1 = 30;
    const CODE_WRITE_REMOTEOBJECTARRAY_2 = 31;
    const CODE_WRITE_RAWDATA = 32;
    let gIRemoteObject = null;

    class TestAbilityStub extends rpc.RemoteObject {
      constructor(descriptor) {
        super(descriptor);
      }
      asObject() {
        return this;
      }
      onRemoteMessageRequest(code, data, reply, option) {
        console.info(logTag + "TestAbilityStub: onRemoteRequest called, code: " + code);
        let descriptor = data.readInterfaceToken();
        if (descriptor !== "TestAbilityStub") {
          console.error(logTag + "received unknown descriptor: " + descriptor);
          return false;
        }
        switch (code) {
          case 1:
            {
              let tmp1 = data.readByte();
              let tmp2 = data.readShort();
              let tmp3 = data.readInt();
              let tmp4 = data.readLong();
              let tmp5 = data.readFloat();
              let tmp6 = data.readDouble();
              let tmp7 = data.readBoolean();
              let tmp8 = data.readChar();
              let tmp9 = data.readString();
              let s = new MySequenceable(null, null);
              data.readSequenceable(s);
              reply.writeNoException();
              reply.writeByte(tmp1);
              reply.writeShort(tmp2);
              reply.writeInt(tmp3);
              reply.writeLong(tmp4);
              reply.writeFloat(tmp5);
              reply.writeDouble(tmp6);
              reply.writeBoolean(tmp7);
              reply.writeChar(tmp8);
              reply.writeString(tmp9);
              reply.writeSequenceable(s);
              return true;
            }
          default:
            {
              console.error(logTag + "default case, code: " + code);
              return false;
            }
        }
      }
    }

    class MyregisterDeathRecipient {
      constructor(gIRemoteObject, done) {
        this.gIRemoteObject = gIRemoteObject;
        this.done = done;
      }

      onRemoteDied() {
        console.info(logTag + "server died");
        expect(this.proxy.unregisterDeathRecipient(this, 0)).assertTrue();
        let _done = this.done;
        setTimeout(function () {
          _done();
        }, 1000);
      }
    }

    class MySequenceable {
      constructor(num, string) {
        this.num = num;
        this.str = string;
      }
      marshalling(MessageSequence) {
        MessageSequence.writeInt(this.num);
        MessageSequence.writeString(this.str);
        return true;
      }
      unmarshalling(MessageSequence) {
        this.num = MessageSequence.readInt();
        this.str = MessageSequence.readString();
        return true;
      }
    }

    class TestListener extends rpc.RemoteObject {
      constructor(descriptor, checkResult) {
        super(descriptor);
        this.checkResult = checkResult;
      }
      onRemoteRequest(code, data, reply, option) {
        let result = false;
        if (code === 1) {
          console.info(logTag + "onRemoteRequest called, descriptor: " + this.getInterfaceDescriptor());
          result = true;
        } else {
          console.info(logTag + "unknown code: " + code);
        }
        let _checkResult = this.checkResult;
        let _num = data.readInt();
        let _str = data.readString();
        setTimeout(function () {
          _checkResult(_num, _str);
        }, 2 * 1000);
        console.info(logTag + "result:" + result);
        return result;
      }
    }

    class TestProxy {
      remote = rpc.RemoteObject;
      constructor(remote) {
        this.remote = remote;
        console.info(logTag + "test remote");
      }
      asObject() {
        console.info(logTag + "server remote");
        return this.remote;
      }
    }

    let getDeviceId = async () =>{
      try {
        dmInstance = deviceManager.createDeviceManager(TEST_BUNDLE_NAME);
        console.info(logTag + "get deviceManager is success")
      } catch (error) {
        console.info(logTag + "get deviceManager is failed" + JSON.stringify(error))
      }
      localDeviceId = dmInstance.getLocalDeviceNetworkId();
      console.info(logTag + "local device id is: " + localDeviceId);
      deviceList = dmInstance.getAvailableDeviceListSync();
      deviceId = deviceList[0].networkId;
      syncDeviceIds = [deviceId];
      console.info(logTag + "deviceid is: " + deviceId);
      console.info(logTag + "syncDeviceIds is: " + JSON.stringify(syncDeviceIds));
    }

    let sleep = (ms:number) =>{
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    let getPermission = async () =>{
      console.info(logTag +"getPermission is start");
      let context:common.UIAbilityContext | undefined = AppStorage.get("context") as common.UIAbilityContext;
      atManager.requestPermissionsFromUser(context,["ohos.permission.DISTRIBUTED_DATASYNC"],(err: BusinessError, data: PermissionRequestResult)  => {
        console.info(logTag +"request success" + JSON.stringify(data));
      })
    }
    async function driveFn(){
      try {
        let driver: Driver = await Driver.create();
        console.info(logTag + "come in driveFn")
        console.info(logTag +`driver is ${JSON.stringify(driver)}`);
        await sleep(1000);
        console.info(logTag + "come in findComponent");
        let button = await driver.findComponent(ON.text('允许'));
        console.info(logTag + `button is ${JSON.stringify(button)}`);
        await sleep(1000);
        await button.click();
        await sleep(1000);
      } catch (err) {
        console.info(logTag +"driveFn err is " + err);
        return;
      }
    }
    let startAbility = async () =>{
      try{
        console.info(logTag + "let startAbility begin...");
        let wantValue: Want = {
          bundleName: bundleNameRpc,
          abilityName: abilityNameRpc,
          deviceId: deviceId
        }
        let context:common.UIAbilityContext | undefined = AppStorage.get("context") as common.UIAbilityContext;
        context.startAbility(wantValue).then(() => {
          console.info(logTag + " startAbility success." );
        }).catch((err) => {
          console.info(logTag + " startAbility err: " + err.code + err.message);
        });
      }catch(error){
        console.info(logTag + "beforeAll startAbility:error = " + error);
      }
    }

    beforeAll(async (done: Function) => {
      console.info(logTag +"beforeAll called rpc");
      await getPermission();
      await sleep(5000);
      await driveFn();
      await sleep(100);
      await getDeviceId();
      await sleep(3000);
      await startAbility();
      await sleep(2000);
      let testservice = new TestService();
      await testservice.toConnectAbility().then(data => {
        gIRemoteObject = data;
        console.info(logTag + "toConnectAbility data is" + data);
      })

      console.info(logTag +"beforeAll done");
      done();
    })
    beforeEach(function () {
      console.info(logTag +("beforeEach called"));
    })
    afterEach(function () {

      console.info(logTag +"afterEach called");
    })
    afterAll(function () {
      console.info(logTag +"afterAll called");
    })

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0010
    * @tc.name    : test Call the writeremoteobject interface to serialize the remote object
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0010", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0010---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let testAbilityStub = new TestAbilityStub("testObject");
        data.writeRemoteObject(testAbilityStub);
        expect(data.readRemoteObject() != null).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0010 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0010---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0020
    * @tc.name    : test Invoke the writeremoteobject interface to serialize a remote object and transfer the object.
    *               The object parameter is empty
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0020", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0020---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let token = new TestAbilityStub(null);
        data.writeRemoteObject(token);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0020 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code != errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0020---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0030
    * @tc.name    : test Call the writeremoteobject interface to serialize the remote object and pass in the empty object
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0030", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0030---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let token = {};
        data.writeRemoteObject(token);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0030 error: " + error);
        let errCode = `${rpc.ErrorCode.PROXY_OR_REMOTE_OBJECT_INVALID_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0030---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0040
    * @tc.name    : test Test MessageSequence to pass an object of type iremoteobject across processes
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0040", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0040---------------------------");
      function checkResult(num, str) {
        expect(num).assertEqual(123);
        expect(str).assertEqual("rpcListenerTest");
        done();
      };
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try {
        let listener = new TestListener("rpcListener", checkResult);
        data.writeRemoteObject(listener);
        data.writeInt(123);
        data.writeString("rpcListenerTest");
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_REMOTEOBJECT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          result.reply.readException();
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0040 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0040---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0050
    * @tc.name    : test ReadRemoteObject is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0050", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0050---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let testAbilityStub = new TestAbilityStub("testObject");
        data.writeRemoteObject(testAbilityStub);
        data.reclaim();
        data.readRemoteObject();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0050 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0050---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0060
    * @tc.name    : test WriteRemoteObject is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0060", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0060---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let testAbilityStub = new TestAbilityStub("testObject");
        data.reclaim();
        data.writeRemoteObject(testAbilityStub);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0060 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0060---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0070
    * @tc.name    : test Call the writeinterfacetoken interface, write the interface descriptor, and read interfacetoken
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0070", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0070---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = "hello ruan zong xian";
        data.writeInterfaceToken(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readInterfaceToken()).assertEqual(token);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0070 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0070---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0080
    * @tc.name    : test Call the WriteInterfaceToken interface, write the maximum length interface descriptor, and read
    *                the InterfaceToken
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0080", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0080---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      option.setWaitTime(130);
      try{
        let token = "";
        for (let i = 0; i < (40 * K - 1); i++) {
          token += "a";
        }
        data.writeInterfaceToken(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_INTERFACETOKEN, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readInterfaceToken()).assertEqual(token);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0080 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0080---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0090
    * @tc.name    : test The WriteInterfaceToken interface is called, the exceeding-length interface descriptor is written,
    *                and the InterfaceToken is read
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0090", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0090---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let token = "";
        for (let i = 0; i < 40 * K; i++) {
          token += "a";
        }
        data.writeInterfaceToken(token);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0090 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0090---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0100
    * @tc.name    : test Call the writeinterfacetoken interface to write a non string interface descriptor
    *            and read interfacetoken
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0100---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let token = 123;
        data.writeInterfaceToken(token);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0100 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0100---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0110
    * @tc.name    : test Call the writeinterfacetoken interface to write null data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0110", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0110---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let token = null;
        data.writeInterfaceToken(token);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0110 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0110---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0120
    * @tc.name    : test WriteInterfaceToken is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0120", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0120---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.writeInterfaceToken("rpctest");
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0120 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0120---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0130
    * @tc.name    : test ReadInterfaceToken is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0130", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0130---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.writeInterfaceToken("rpctest");
        data.reclaim();
        data.readInterfaceToken();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0130 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0130---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0140
    * @tc.name    : test setSize Sets the size of the data contained in the MessageSequence instance. The getSize command
                    reads the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0140", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0140---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        expect(data.getSize()).assertEqual(0);
        data.setSize(0);
        data.writeString("constant");
        expect(data.getSize()).assertEqual(("constant".length * 2) + 8);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.getSize()).assertEqual(("constant".length * 2) + 8);
          expect(result.reply.readString()).assertEqual("constant");
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0140 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0140---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0150
    * @tc.name    : test Set the size of the data contained in the MessageSequence instance to 0
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0150", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0150---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeString("constant");
        expect(data.getSize()).assertEqual(("constant".length * 2) + 8);
        data.setSize(0);
        expect(data.getSize()).assertEqual(0);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.getSize()).assertEqual(8);
          expect(result.reply.readString()).assertEqual("");
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0150 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0150---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0160
    * @tc.name    : test Verify the MessageSequence instance SetSize setting and the instance capacitydata qualification verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0160", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0160---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        expect(data.getSize()).assertEqual(0);
        data.writeString("constant");
        expect(data.getSize()).assertEqual(("constant".length * 2) + 8);
        let getCapacitydata = data.getCapacity();
        expect(getCapacitydata).assertEqual(64);
        data.setSize(getCapacitydata);
        expect(data.getSize()).assertEqual(getCapacitydata);
        data.setSize(getCapacitydata - 1);
        expect(data.getSize()).assertEqual(getCapacitydata-1);
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0160 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0160---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0170
    * @tc.name    : test setSize Sets the storage capacity of the MessageSequence instance to decrease by one.
                    The getSize obtains the current MessageSequence capacity
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0170", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0170---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeString("constant");
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readString()).assertEqual("constant");
          expect(result.reply.getSize()).assertEqual(("constant".length * 2) + 8);
          let getCapacityresult = result.reply.getCapacity();
          result.reply.setSize(getCapacityresult);
          expect(result.reply.getSize()).assertEqual(getCapacityresult);
          result.reply.setSize(getCapacityresult - 1);
          expect(result.reply.getSize()).assertEqual(getCapacityresult-1);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0170 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0170---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0180
    * @tc.name    : test Validate the setSize boundary value in the MessageSequence instance
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0180", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0180---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        expect(data.getCapacity()).assertEqual(0);
        data.setSize(4 * G);
        expect(data.getSize()).assertEqual(0);
        data.setSize(4 * G - 1);
        expect(data.getSize()).assertEqual(0);
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0180 error: " + error);
        let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0180---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0190
    * @tc.name    : test Verify that setSize is out of bounds in a MessageSequence instance
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0190", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0190---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        data.setSize(0);
        expect(data.getSize()).assertEqual(0);
        data.setSize(2 * 4 * G);
        expect(data.getSize()).assertEqual(0);
        data.setSize(2 * G + 1);
        expect(data.getSize()).assertEqual(0);
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0190 error: " + error);
        let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0190---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0200
    * @tc.name    : test setCapacity Sets the storage capacity of the null MessageSequence instance. The getCapacity
                    obtains the current MessageSequence capacity
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0200---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        expect(data.getCapacity()).assertEqual(0);
        data.setCapacity(100);
        data.writeString("constant");
        expect(data.getCapacity()).assertEqual(100);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.getCapacity()).assertEqual(("constant".length * 2) + 8);
          expect(result.reply.readString()).assertEqual("constant");
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0200 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0200---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0210
    * @tc.name    : test setCapacity Sets the storage capacity of the MessageSequence instance. After getting the
                    MessageSequence instance, get the current MessageSequence capacity
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0210", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0210---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeString("constant");
        data.setCapacity(100);
        expect(data.getCapacity()).assertEqual(100);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readString()).assertEqual("constant");
          expect(result.reply.getCapacity()).assertEqual(("constant".length * 2) + 8);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0210 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0210---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0220
    * @tc.name    : test Setcapacity test: size limit verification of MessageSequence instance
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0220", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0220---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        expect(data.getCapacity()).assertEqual(0);
        data.writeString("constant");
        let getSizedata = data.getSize();
        data.setCapacity(getSizedata + 1);
        data.setCapacity(getSizedata);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0220 error: " + error);
        let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
        expect(error.message != null).assertTrue();
        expect(error.code == errCode).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0220---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0230
    * @tc.name    : test SetCapacity Tests the storage capacity threshold of the MessageSequence instance
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0230", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0230---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeString("constant");
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let getSizeresult = result.reply.getSize();
          expect(result.reply.getCapacity()).assertEqual(("constant".length * 2) + 8);
          result.reply.setCapacity(getSizeresult + 1);
          result.reply.setCapacity(getSizeresult);
          expect(data.getSize() == 0).assertTrue();
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0230 error: " + error);
        let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
        expect(error.message != null).assertTrue();
        expect(error.code == errCode).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0230---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0240
    * @tc.name    : test Setcapacity test storage capacity boundary value verification of MessageSequence instance
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0240", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0240---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        expect(data.getSize()).assertEqual(0);
        data.setCapacity(M);
        expect(data.getCapacity()).assertEqual(M);
        data.setCapacity(2 * G);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0240 error: " + error);
        let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
        expect(error.message != null).assertTrue();
        expect(error.code == errCode).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0240---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0250
    * @tc.name    : test readParcelable is Call JS callback function failedv Error message verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0250", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0250---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let sequenceable = new MySequenceable(1, "aaa");
        data.writeParcelable(sequenceable);
        data.setCapacity(0);
        data.setSize(0);
        let ret = new MySequenceable(1, "");
        data.readParcelable(ret);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0250 error: " + error);
        let errCode = `${rpc.ErrorCode.CALL_JS_METHOD_ERROR}`;
        expect(error.message != null).assertTrue();
        expect(error.code != errCode).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0250---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0260
    * @tc.name    : test Invoke the writeinterfacetoken interface, write the interface descriptor, and verify the error
    *                code that fails to be read from the interfacetoken interface
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0260", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0260---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let token = "hello ruan zong xian";
        data.writeInterfaceToken(token);
        data.setCapacity(0);
        data.setSize(0);
        data.readInterfaceToken();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0260 error: " + error);
        let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0260---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0270
    * @tc.name    : test writeInterfaceToken Sequence memory alloc failed Error message verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0270", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0270---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        data.setSize(0);
        data.setCapacity(0);
        let token = "hello ruan zong xian";
        data.writeInterfaceToken(token);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0270 error: " + error);
        let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0270---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0280
    * @tc.name    : test writeInterfaceToken Write data to message sequence failed Error message verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0280", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0280---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        data.setSize(true);
        data.setCapacity(true);
        let token = "hello ruan zong xian";
        data.writeInterfaceToken(token);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0280 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0280---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0290
    * @tc.name    : test setSize is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0290", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0290---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.setSize(0);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0290 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0290---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0300
    * @tc.name    : test readParcelable Sequence memory alloc failed Error message verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0300---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let sequenceable = new MySequenceable(1, "aaa");
        data.writeParcelable(sequenceable);
        let ret = new MySequenceable(0, "");
        data.setCapacity(0);
        data.readParcelable(ret);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0300 error: " + error);
        let errCode = `${rpc.ErrorCode.PARCEL_MEMORY_ALLOC_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0300---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0310
    * @tc.name    : test Obtaining the Writable and Readable Byte Spaces of MessageSequence
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0310", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0310---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        expect(data.getWritableBytes()).assertEqual(0);
        data.writeInt(10);
        expect(data.getWritableBytes()).assertEqual(60);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readInt()).assertEqual(10);
          expect(result.reply.getReadableBytes()).assertEqual(0);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0310 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0310---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0320
    * @tc.name    : test Obtains the writeable and readable byte space and read position of the MessageSequence
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0320", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0320---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeInt(10);
        expect(data.getWritePosition()).assertEqual(4);
        expect(data.getWritableBytes()).assertEqual(60);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.getReadableBytes()).assertEqual(4);
          expect(result.reply.getReadPosition()).assertEqual(0);
          expect(result.reply.readInt()).assertEqual(10);
          expect(result.reply.getReadableBytes()).assertEqual(0);
          expect(result.reply.getReadPosition()).assertEqual(4);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0320 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0320---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0330
    * @tc.name    : test Get the space size of MessageSequence to pass rawdata data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0330", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0330---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeInt(10);
        expect(data.getWritePosition()).assertEqual(4);
        expect(data.getWritableBytes()).assertEqual(60);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.getReadPosition()).assertEqual(0);
          expect(result.reply.getReadableBytes()).assertEqual(4);
          expect(result.reply.readInt()).assertEqual(10);
          expect(result.reply.getReadPosition()).assertEqual(4);
          expect(result.reply.getReadableBytes()).assertEqual(0);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0330 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0330---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0340
    * @tc.name    : test Obtains the write and read positions of the MessageSequence
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0340", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0340---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        expect(data.getWritePosition()).assertEqual(0);
        data.writeInt(10);
        expect(data.getWritePosition()).assertEqual(4);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.getReadPosition()).assertEqual(0);
          expect(result.reply.readInt()).assertEqual(10);
          expect(result.reply.getReadPosition()).assertEqual(4);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0340 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0340---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0350
    * @tc.name    : test Basic test of the rewindWrite interface
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0350", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0350---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        expect(data.getWritePosition()).assertEqual(0);
        data.writeInt(4);
        expect(data.getWritePosition()).assertEqual(4);
        data.rewindWrite(0);
        expect(data.getWritePosition()).assertEqual(0);
        data.writeInt(5);
        expect(data.getWritePosition()).assertEqual(4);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
          expect(result.errCode == 0).assertTrue();
          expect(result.reply.getReadPosition()).assertEqual(0);
          expect(result.reply.readInt()).assertEqual(5);
          expect(result.reply.getReadPosition()).assertEqual(4);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0350 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0350---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0360
    * @tc.name    : test RewindWrite interface write position cheap extension test
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0360", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0360---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        expect(data.getWritePosition()).assertEqual(0);
        data.writeInt(4);
        expect(data.getWritePosition()).assertEqual(4);
        data.rewindWrite(3);
        expect(data.getWritePosition()).assertEqual(3);
        data.writeInt(5);
        expect(data.getWritePosition()).assertEqual(3 + 4);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
          expect(result.errCode == 0).assertTrue();
          expect(result.reply.readInt() != 5).assertTrue();
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0360 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0360---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0370
    * @tc.name    : test Test the boundary value of the rewindWrite interface
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0370", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0370---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let token = "";
        for (let i = 0; i < (40 * K - 1); i++) {
          token += "a";
        }
        expect(data.getWritePosition()).assertEqual(0);
        data.writeString(token);
        expect(data.getWritePosition()).assertEqual(token.length * 2 + 6);
        data.rewindWrite((token.length * 2 + 6) - 1);
        expect(data.getWritePosition()).assertEqual((token.length * 2 + 6) - 1);
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0370 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0370---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0380
    * @tc.name    : test Test the critical value of the rewindWrite interface
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0380", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0380---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let token = "";
        for (let i = 0; i < (40 * K - 1); i++) {
          token += "a";
        }
        expect(data.getWritePosition()).assertEqual(0);
        data.writeString(token);
        expect(data.getWritePosition()).assertEqual(token.length * 2 + 6);
        data.rewindWrite((token.length * 2 + 6) + 1);
        expect(data.getWritePosition()).assertEqual(token.length * 2 + 6);
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0380 errorcode " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code != errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0380---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0390
    * @tc.name    : test Test the function of the getWritePosition interface
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0390", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0390---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeByte(2);
        expect(data.getWritePosition()).assertEqual(4);
        data.writeShort(3);
        expect(data.getWritePosition()).assertEqual(4 + 4);
        data.writeInt(4);
        expect(data.getWritePosition()).assertEqual((4 + 4) + 4);
        data.writeLong(5);
        expect(data.getWritePosition()).assertEqual(((4 + 4) + 4) + 8);
        data.writeFloat(1.2);
        expect(data.getWritePosition()).assertEqual((((4 + 4) + 4) + 8) + 8);
        data.writeDouble(10.2);
        expect(data.getWritePosition()).assertEqual(((((4 + 4) + 4) + 8) + 8) + 8);
        data.writeBoolean(true);
        expect(data.getWritePosition()).assertEqual((((((4 + 4) + 4) + 8) + 8) + 8) + 4);
        data.writeChar(97);
        expect(data.getWritePosition()).assertEqual(((((((4 + 4) + 4) + 8) + 8) + 8) + 4) + 4);
        data.writeString("");
        expect(data.getWritePosition()).assertEqual((((((((4 + 4) + 4) + 8) + 8) + 8) + 4) + 4) + 8);
        data.writeParcelable(new MySequenceable(1, "aaa"));
        expect(data.getWritePosition()).assertEqual(((((((((4 + 4) + 4) + 8) + 8) + 8) + 4) + 4) + 8) + (12 + 8));
        await gIRemoteObject.sendMessageRequest(CODE_ALL_TYPE, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readByte()).assertEqual(2);
          expect(result.reply.readShort()).assertEqual(3);
          expect(result.reply.readInt()).assertEqual(4);
          expect(result.reply.readLong()).assertEqual(5);
          expect(result.reply.readFloat()).assertEqual(1.2);
          expect(result.reply.readDouble()).assertEqual(10.2);
          expect(result.reply.readBoolean()).assertTrue();
          expect(result.reply.readChar()).assertEqual(97);
          expect(result.reply.readString()).assertEqual("");
          let s = new MySequenceable(null, null);
          result.reply.readParcelable(s);
          expect(s.num).assertEqual(1);
          expect(s.str).assertEqual("aaa");
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0390 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0390---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0400
    * @tc.name    : test Test on the null value of the getWritePosition interface
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0400---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let str = "";
        data.writeString(str);
        expect(data.getWritePosition()).assertEqual(8);
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0400 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0400---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0410
    * @tc.name    : test Invoke the rewindWrite interface, Set 0-bit offset and write the data after offset
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0410", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0410---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeInt(4);
        data.rewindWrite(0);
        data.writeInt(5);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
          expect(result.errCode == 0).assertTrue();
          expect(result.reply.readInt()).assertEqual(5);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0410 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0410---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0420
    * @tc.name    : test Invoke the rewindWrite interface, Set 1-bit offset and write the data after offset
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0420", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0420---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeInt(4);
        data.rewindWrite(1);
        data.writeInt(5);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readInt() != 5).assertTrue();
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0420 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0420---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0430
    * @tc.name    : test rewindWrite is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0430", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0430---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.rewindWrite(0);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0430 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0430---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0440
    * @tc.name    : test Invoke the rewindRead interface,Set 0-bit offset and read the data after offset
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0440", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0440---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeInt(12);
        data.writeString("parcel");
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readInt()).assertEqual(12);
          result.reply.rewindRead(0);
          expect(result.reply.readInt()).assertEqual(12);
          expect(result.reply.readString()).assertEqual("");
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0440 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0440---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0450
    * @tc.name    : test Invoke the rewindRead interface,Set 1-bit offset and read the data after offset
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0450", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0440---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeInt(12);
        data.writeString("parcel");
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
          expect(result.errCode == 0).assertTrue();
          expect(result.reply.readInt()).assertEqual(12);
          result.reply.rewindRead(1);
          expect(result.reply.readInt()).assertEqual(0);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0450 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0450---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0460
    * @tc.name    : test Basic test of the rewindRead interface
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0460", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0460---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeInt(12);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
          expect(result.errCode == 0).assertTrue();
          expect(result.reply.getReadPosition()).assertEqual(0);
          expect(result.reply.readInt()).assertEqual(12);
          expect(result.reply.getReadPosition()).assertEqual(4);
          result.reply.rewindRead(1);
          expect(result.reply.getReadPosition()).assertEqual(1);
          expect(result.reply.readInt() != 12).assertTrue();
          expect(result.reply.getReadPosition()).assertEqual(1);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0460 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0460---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0470
    * @tc.name    : test rewindRead interface write position cheap extension test
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0470", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0470---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        data.writeInt(16);
        data.writeString("sequence");
        expect(data.getReadPosition()).assertEqual(0);
        expect(data.readInt()).assertEqual(16);
        expect(data.getReadPosition()).assertEqual(4);
        expect(data.readString()).assertEqual("sequence");
        expect(data.getReadPosition()).assertEqual(4 + ("sequence".length * 2 + 8));
        data.rewindRead(5);
        expect(data.getReadPosition()).assertEqual(5);
        expect(data.readInt() != 16).assertTrue();
        expect(data.getReadPosition()).assertEqual(4 + 5);
        expect(data.readString() != "sequence").assertTrue();
        expect(data.getReadPosition()).assertEqual(4 + 5);
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0470 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0470---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0480
    * @tc.name    : test Test the boundary value of the rewindRead interface
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0480", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0480---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let token = "";
        for (let i = 0; i < (40 * K - 1); i++) {
          token += "a";
        }
        data.writeString(token);
        expect(data.getReadPosition()).assertEqual(0);
        expect(data.readString().length).assertEqual(40 * K - 1);
        expect(data.getReadPosition()).assertEqual(token.length * 2 + 6);
        data.rewindRead((token.length * 2 + 6) - 1);
        expect(data.getReadPosition()).assertEqual((token.length * 2 + 6) - 1);
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0480 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0480---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0490
    * @tc.name    : test Test the critical value of the rewindRead interface
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0490", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0490---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let token = "";
        for (let i = 0; i < (40 * K - 1); i++) {
          token += "a";
        }
        data.writeString(token);
        expect(data.getReadPosition()).assertEqual(0);
        expect(data.readString().length).assertEqual(40 * K - 1);
        expect(data.getReadPosition()).assertEqual(token.length * 2 + 6);
        data.rewindRead((token.length * 2 + 6) + 1);
        expect(data.getReadPosition()).assertEqual(token.length * 2 + 6);
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0490 code " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code != errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0490---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0500
    * @tc.name    : test RewindRead is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0500---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.rewindRead(0);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0500 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0500---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0510
    * @tc.name    : test Call the writebyte interface to write data to the MessageSequence instance,
    *              and call readbyte to read data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0510", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0510---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = 2;
        data.writeByte(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readByte()).assertEqual(token);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0510 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0510---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0520
    * @tc.name    : test Writebyte interface, boundary value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0520", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0520---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeByte(128);
        data.writeByte(0);
        data.writeByte(1);
        data.writeByte(2);
        data.writeByte(127);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTE_MULTI, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(reply.readByte()).assertEqual(-128);
          expect(reply.readByte()).assertEqual(0);
          expect(reply.readByte()).assertEqual(1);
          expect(reply.readByte()).assertEqual(2);
          expect(reply.readByte()).assertEqual(127);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0520 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0520---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0530
    * @tc.name    : test Writebyte interface, Maximum boundary value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0530", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0530---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeByte(-129);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readByte()).assertEqual(127);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0530 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0530---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0540
    * @tc.name    : test Writebyte interface, Minimum boundary value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0540", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0540---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeByte(128);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTE, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readByte()).assertEqual(-128);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0540 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0540---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0550
    * @tc.name    : test Writebyte interface, illegal value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0550", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0550---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        data.writeByte("error");
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0550 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0550---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0560
    * @tc.name    : test WriteByte is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0560", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0560---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.writeByte(2);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0560 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0560---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0570
    * @tc.name    : test ReadByte is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0570", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0570---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.readByte();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0570 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0570---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0580
    * @tc.name    : test Call the writeShort interface to write the short integer data to the MessageSequence instance,
    *              and call readshort to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0580", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0580---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let short = 8;
        data.writeShort(short);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readShort()).assertDeepEquals(short);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0580 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0580---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0590
    * @tc.name    : test WriteShort interface, boundary value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0590", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0590---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeShort(-32768);
        data.writeShort(0);
        data.writeShort(1);
        data.writeShort(2);
        data.writeShort(32767);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORT_MULTI, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readShort() == -32768).assertTrue();
          expect(result.reply.readShort() == 0).assertTrue();
          expect(result.reply.readShort() == 1).assertTrue();
          expect(result.reply.readShort() == 2).assertTrue();
          expect(result.reply.readShort() == 32767).assertTrue();
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0590 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0590---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0600
    * @tc.name    : test WriteShort interface, Boundary value minimum value out of bounds verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0600---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeShort(-32769);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readShort() == 32767).assertTrue();
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0600 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0600---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0610
    * @tc.name    : test WriteShort interface, Boundary value maximum value out of bounds verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0610", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0610---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeShort(32768);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readShort() == -32768).assertTrue();
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0610 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0610---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0620
    * @tc.name    : test WriteShort is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0620", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0620---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.writeShort(0);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0620 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0620---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0630
    * @tc.name    : test ReadShort is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0630", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0630---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.writeShort(0);
        data.reclaim();
        data.readShort();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0630 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0630---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0640
    * @tc.name    : test Call the writeint interface to write the data to the MessageSequence instance,
    *              and call readint to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0640", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0640---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = 2;
        data.writeInt(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readInt()).assertEqual(token);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0640 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0640---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0650
    * @tc.name    : test Writeint interface, boundary value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0650", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0650---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeInt(-2147483648);
        data.writeInt(0);
        data.writeInt(1);
        data.writeInt(2);
        data.writeInt(2147483647);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT_MULTI, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readInt()).assertEqual(-2147483648);
          expect(result.reply.readInt()).assertEqual(0);
          expect(result.reply.readInt()).assertEqual(1);
          expect(result.reply.readInt()).assertEqual(2);
          expect(result.reply.readInt()).assertEqual(2147483647);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0650 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0650---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0660
    * @tc.name    : test Writeint interface, Verification of minimum boundary overrun value
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0660", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0660---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeInt(-2147483649);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readInt()).assertEqual(2147483647);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0660 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0660---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0670
    * @tc.name    : test Writeint interface, Verification of maximum boundary overrun value
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0670", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0670---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeInt(2147483648);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readInt()).assertEqual(-2147483648);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0670 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0670---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0680
    * @tc.name    : test Writeint interface, illegal value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0680", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0680---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        data.writeInt("error");
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0680 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0680---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0690
    * @tc.name    : test WriteInt is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0690", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0690---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.writeInt(0);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0690 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0690---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0700
    * @tc.name    : test ReadInt is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0700---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.writeInt(0);
        data.reclaim();
        data.readInt();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0700 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0700---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0710
    * @tc.name    : test Call writelong interface to write long integer data to MessageSequence instance
    *              and call readlong to read data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0710", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0710---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let long = 9007199254740991;
        data.writeLong(long);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readLong()).assertEqual(long);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0710 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0710---------------------------");
    });


    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0720
    * @tc.name    : test Writelong interface, Verification of maximum accuracy value
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0720", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0720---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let long = -9007199254740992;
        data.writeLong(long);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readLong() == long).assertTrue();
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0720 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0720---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0730
    * @tc.name    : test Writelong interface, Minimum loss accuracy verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0730", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0730---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let long = -9223372036854775300;
        data.writeLong(long);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readLong()).assertEqual(-9223372036854776000);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0730 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0730---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0740
    * @tc.name    : test Writelong interface, Maximum loss accuracy verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0740", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0740---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let short = 9223372036854775300;
        data.writeLong(short);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONG, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let readlong = result.reply.readLong();
          expect(readlong != 0).assertTrue();
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0740 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0740---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0750
    * @tc.name    : test WriteLong is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0750", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0750---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.writeLong(0);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0750 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0750---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0760
    * @tc.name    : test ReadLong is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0760", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0760---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.writeLong(0);
        data.reclaim();
        data.readLong();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0760 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0760---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0770
    * @tc.name    : test Call the writefloat interface to write data to the MessageSequence instance,
    *              and call readfloat to read data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0770", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0770---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = 2.2;
        data.writeFloat(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readFloat()).assertEqual(token);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0770 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0770---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0780
    * @tc.name    : test Writefloat interface, Minimum boundary value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0780", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0780---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = 1.4E-45;
        data.writeFloat(token);

        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readFloat()).assertEqual(token);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0780 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0780---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0790
    * @tc.name    : test Writefloat interface, Maximum boundary value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0790", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0790---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = 3.4028235E38;
        data.writeFloat(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readFloat()).assertEqual(token);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0790 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0790---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0800
    * @tc.name    : test Writefloat interface, Verification of maximum boundary overrun value
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0800---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = (3.4028235E38) + 1;
        data.writeFloat(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readFloat()).assertEqual(3.4028235e+38);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0800 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0800---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0810
    * @tc.name    : test Writefloat interface, Verification of minimum boundary overrun value
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0810", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0810---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = (1.4E-45) - 1;
        data.writeFloat(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOAT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readFloat()).assertEqual(-1);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0810 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0810---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0820
    * @tc.name    : test Writefloat interface, illegal value validation
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0820", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0820---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let token = "a";
        data.writeFloat(token);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0820 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0820---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0830
    * @tc.name    : test WriteFloat is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0830", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0830---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.writeFloat(1.0);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0830 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0830---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0840
    * @tc.name    : test ReadFloat is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0840", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0840---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.writeFloat(1.0);
        data.reclaim();
        data.readFloat();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0840 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0840---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0850
    * @tc.name    : test Call the parallel interface to read and write data to the double instance
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0850", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0850---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = 4.9E-324;
        data.writeDouble(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readDouble()).assertEqual(token);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0850 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0850---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0860
    * @tc.name    : test Writedouble interface, boundary value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0860", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0860---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = 1.79E+308;
        data.writeDouble(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readDouble()).assertEqual(token);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0860 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0860---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0870
    * @tc.name    : test Writedouble interface, Minimum boundary value out of bounds verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0870", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0870---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = (4.9E-324) - 1;
        data.writeDouble(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLE, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readDouble()).assertEqual(-1);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0870 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0870---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0880
    * @tc.name    : test WriteDouble is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0880", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0880---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.writeDouble(1.0);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0880 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0880---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0890
    * @tc.name    : test ReadDouble is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0890", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0890---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.writeDouble(1.0);
        data.reclaim();
        data.readDouble();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0890 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0890---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0900
    * @tc.name    : test Invoke the writeboolean interface to write the data true to the MessageSequence
    *                instance and invoke the readboolean interface to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0900---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = true;
        data.writeBoolean(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_BOOLEAN, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readBoolean()).assertEqual(token);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0900 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0900---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0910
    * @tc.name    : test Call the writeboolean interface to write the data to the MessageSequence instance,
    *              and call readboolean to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0910", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0910---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = false;
        data.writeBoolean(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_BOOLEAN, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readBoolean()).assertEqual(token);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0910 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0910---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0920
    * @tc.name    : test Writeboolean interface, illegal value number type verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0920", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0920---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        data.writeBoolean(9);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0920 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0920---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0930
    * @tc.name    : test Writeboolean interface, illegal value string type verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0930", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0930---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let token = "true";
        data.writeBoolean(token);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0930 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0930---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0940
    * @tc.name    : test WriteBoolean is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0940", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0940---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.writeBoolean(true);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0940 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0940---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0950
    * @tc.name    : test ReadBoolean is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0950", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0950---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.writeBoolean(true);
        data.reclaim();
        data.readBoolean();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0950 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0950---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0960
    * @tc.name    : test Call the writechar interface to write the minimum data to the MessageSequence instance,
    *                and call readchar to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0960", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0960---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = 0;
        data.writeChar(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readChar()).assertEqual(token);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0960 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0960---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0970
    * @tc.name    : test Call the writechar interface to write the maximum data to the MessageSequence instance,
    *               and call readchar to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0970", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0970---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = 255;
        data.writeChar(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readChar()).assertEqual(token);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0970 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0970---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0980
    * @tc.name    : test Call the writechar interface to write the minimum out of range data to the MessageSequence instance,
    *               and call readchar to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0980", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0980---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = -1;
        data.writeChar(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readChar()).assertEqual(255);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0980 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0980---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_0990
    * @tc.name    : test Call the writechar interface to write the maximum out of range data to the MessageSequence instance,
    *               and call readchar to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_0990", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_0990---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let token = 256;
        data.writeChar(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHAR, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readChar()).assertEqual(0);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_0990 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_0990---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1000
    * @tc.name    : test Writechar interface, illegal value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1000---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let token = "ades";
        data.writeChar(token);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1000 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1000---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1010
    * @tc.name    : test WriteChar is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1010", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1010---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.writeChar(56);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1010 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1010---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1020
    * @tc.name    : test ReadChar is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1020", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1020---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.writeChar(56);
        data.reclaim();
        data.readChar();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1020 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1020---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1030
    * @tc.name    : test Call the writestring interface to write the data to the MessageSequence instance,
    *              and call readstring() to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1030", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1030---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      option.setWaitTime(130);
      try{
        let token = "";
        for (let i = 0; i < (40 * K - 1); i++) {
          token += "a";
        }
        data.writeString(token);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRING, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readString()).assertEqual(token);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1030 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1030---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1040
    * @tc.name    : test Writestring interface Maximum data out of range verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1040", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1040---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let token = "";
        for (let i = 0; i < 40 * K; i++) {
          token += "a";
        }
        data.writeString(token);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1040 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1040---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1050
    * @tc.name    : test Writestring interface, illegal value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1050", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1050---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let token = 123;
        data.writeString(token);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1050 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1050---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1060
    * @tc.name    : test WriteString is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1060", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1060---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.writeString("rpc");
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1060 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1060---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1070
    * @tc.name    : test ReadString is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1070", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1070---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.writeString("rpc");
        data.reclaim();
        data.readString();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1070 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1070---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1080
    * @tc.name    : test Call the writeParcelable interface to write the custom serialized
    *              object to the MessageSequence instance
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1080", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1080---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let sequenceable = new MySequenceable(1, "aaa");
        data.writeParcelable(sequenceable);
        let ret = new MySequenceable(0, "");
        data.readParcelable(ret);
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1080 error: " + error);
        expect(error).assertEqual(null);
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1080---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1090
    * @tc.name    : test Call the writeParcelable interface to write the custom serialized
    *              object to the MessageSequence instance, Migration to read
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1090", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1090---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let sequenceable = new MySequenceable(1, "aaa");
        data.writeParcelable(sequenceable);
        let ret = new MySequenceable(1, "");
        data.readParcelable(ret);
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1090 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1090---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1100
    * @tc.name    : test Serializable object marshaling and unmarshalling test
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1100---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let sequenceable = new MySequenceable(1, "aaa");
        data.writeParcelable(sequenceable);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_SEQUENCEABLE, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let s = new MySequenceable(null, null);
          result.reply.readParcelable(s);
          expect(s.str).assertEqual(sequenceable.str);
          expect(s.num).assertEqual(sequenceable.num);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1100 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1100---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1110
    * @tc.name    : test Non serializable object marshaling test
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1110", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1110---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let sequenceable = new MySequenceable(1, 1);
        data.writeParcelable(sequenceable);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1110 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1110---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1120
    * @tc.name    : test Call the writeParcelable interface to write the custom serialized object to the
    *              MessageSequence instance, and call readParcelable to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1120", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1120---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let sequenceable = new MySequenceable(2, "abc");
        data.writeParcelable(sequenceable);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_SEQUENCEABLE, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let s = new MySequenceable(null, null);
          result.reply.readParcelable(s);
          expect(s.str).assertEqual(sequenceable.str);
          expect(s.num).assertEqual(sequenceable.num);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1120 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1120---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1130
    * @tc.name    : test WriteParcelable is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1130", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1130---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let sequenceable = new MySequenceable(1, "aaa");
        data.reclaim();
        data.writeParcelable(sequenceable);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1130 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1130---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1140
    * @tc.name    : test ReadParcelable is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1140", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1140---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let sequenceable = new MySequenceable(1, "aaa");
        data.writeParcelable(sequenceable);
        let ret = new MySequenceable(0, "");
        data.reclaim();
        data.readParcelable(ret);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1140 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1140---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1150
    * @tc.name    : test The server did not send a serializable object, and the client was ungrouped
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1150", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1150---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let sequenceable = 10;
        data.writeInt(sequenceable);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INT, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let s = new MySequenceable(0, null);
          result.reply.readParcelable(s);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1150 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1150---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1160
    * @tc.name    : test Call the writebytearray interface, write the array to the MessageSequence instance,
    *              and call readbytearray to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1160", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1160---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let ByteArraylet = [1, 2, 3, 4, 5];
        data.writeByteArray(ByteArraylet);

        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readByteArray()).assertDeepEquals(ByteArraylet);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1160 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1160---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1170
    * @tc.name    : test Call the writebytearray interface, write the array to the MessageSequence instance,
    *              and call readbytearray (datain: number []) to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1170", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1170---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let ByteArraylet = [-128, 0, 1, 2, 127];
        data.writeByteArray(ByteArraylet);

        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let newArr = new Array(5);
          result.reply.readByteArray(newArr);
          expect(newArr).assertDeepEquals(ByteArraylet);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1170 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1170---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1180
    * @tc.name    : test Writebytearray interface, boundary value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1180", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1180---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      option.setWaitTime(130);
      try{
        let ByteArraylet = [];
        for (let i = 0; i < (50 * K - 1); i++) {
          ByteArraylet[i] = 1;
        }
        data.writeByteArray(ByteArraylet);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let newArr = new Array(50 * K - 1);
          result.reply.readByteArray(newArr);
          expect(newArr).assertDeepEquals(ByteArraylet);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1180 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1180---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1190
    * @tc.name    : test Writebytearray interface, illegal value validation
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1190", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1190---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let ByteArraylet = [-129, 0, 1, 2, 128];
        data.writeByteArray(ByteArraylet);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_BYTEARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let shortArryDataReply = result.reply.readByteArray();
          expect(shortArryDataReply[0] == 127).assertTrue();
          expect(shortArryDataReply[1] == ByteArraylet[1]).assertTrue();
          expect(shortArryDataReply[2] == ByteArraylet[2]).assertTrue();
          expect(shortArryDataReply[3] == ByteArraylet[3]).assertTrue();
          expect(shortArryDataReply[4] == -128).assertTrue();
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1190 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1190---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1200
    * @tc.name    : test Writebytearray Interface，input parameter length verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1200---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let ByteArraylet = [];
        for (let i = 0; i < 50 * K; i++) {
          ByteArraylet[i] = 1;
        }
        data.writeByteArray(ByteArraylet);
        console.info(logTag + "writeByteArray success");
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1200 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1200---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1210
    * @tc.name    : test WriteByteArray is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1210", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1210---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [1, 2, 3, 4, 5];
        data.reclaim();
        data.writeByteArray(ByteArrayVar);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1210 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1210---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1220
    * @tc.name    : test ReadByteArray is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1220", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1220---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [1, 2, 3, 4, 5];
        data.writeByteArray(ByteArrayVar);
        data.reclaim();
        data.readByteArray();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1220 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1220---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1230
    * @tc.name    : test Call the writeshortarray interface, write the array to the MessageSequence instance,
    *              and call readshortarray to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1230", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1230---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let wShortArryData = [-1, 0, 1];
        data.writeShortArray(wShortArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readShortArray()).assertDeepEquals(wShortArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1230 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1230---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1240
    * @tc.name    : test Call the writeshortarray interface, write the short integer array to the MessageSequence instance,
    *              and call readshortarray (datain: number []) to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1240", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1240---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      option.setWaitTime(130);
      try{
        let wShortArryData: number[] = [];
        for (let i = 0; i < (50 * 1024 - 1); i++) {
          wShortArryData[i] = 1;
        }
        data.writeShortArray(wShortArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let rShortArryData = [];
          result.reply.readShortArray(rShortArryData);
          expect(rShortArryData[0]).assertEqual(wShortArryData[0]);
          expect(rShortArryData[50 * 1024 - 2]).assertEqual(wShortArryData[50 * 1024 - 2]);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1240 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1240---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1250
    * @tc.name    : test Writeshortarray interface, transmission length verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1250", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1250---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let eShortArryData = [];
        for (let i = 0; i < 50 * K; i++) {
          eShortArryData[i] = 1;
        };
        data.writeShortArray(eShortArryData);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1250 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code != errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1250---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1260
    * @tc.name    : test Writeshortarray interface, boundary value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1260", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1260---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let wShortArryData = [-32768, 0, 1, 2, 32767];
        data.writeShortArray(wShortArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readShortArray()).assertDeepEquals(wShortArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1260 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1260---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1270
    * @tc.name    : test Writeshortarray interface, illegal value validation
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1270", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1270---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let eShortArryData = [-32769, 32768];
        data.writeShortArray(eShortArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_SHORTARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let erShortArryData = [32767, -32768];
          expect(result.reply.readShortArray()).assertDeepEquals(erShortArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1270 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1270---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1280
    * @tc.name    : test WriteShortArray is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1280", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1280---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [1, 2, 3, 4, 5];
        data.reclaim();
        data.writeShortArray(ByteArrayVar);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1280 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1280---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1290
    * @tc.name    : test ReadShortArray is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1290", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1290---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [1, 2, 3, 4, 5];
        data.writeShortArray(ByteArrayVar);
        data.reclaim();
        data.readShortArray();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1290 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1290---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1300
    * @tc.name    : test Call the writeintarray interface, write the array to the MessageSequence instance,
    *              and call readintarray to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1300---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let intArryData = [100, 111, 112];
        data.writeIntArray(intArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readIntArray()).assertDeepEquals(intArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1300 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1300---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1310
    * @tc.name    : test Call the writeintarray interface, write the array to the MessageSequence instance,
    *              and call readintarray (datain: number []) to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1310", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1310---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      option.setWaitTime(130);
      try{
        let intArryData = [];
        for (let i = 0; i < (50 * K - 1); i++) {
          intArryData[i] = 1;
        };
        data.writeIntArray(intArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let newArr = new Array(3);
          result.reply.readIntArray(newArr);
          expect(newArr).assertDeepEquals(intArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1310 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1310---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1320
    * @tc.name    : test Writeintarray interface, boundary value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1320", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1320---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let intArryData = [-2147483648, 0, 1, 2, 2147483647];
        data.writeIntArray(intArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readIntArray()).assertDeepEquals(intArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1320 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1320---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1330
    * @tc.name    : test Writeintarray interface, illegal value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1330", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1330---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let intArryData = [-2147483649, 0, 1, 2, 2147483648];
        data.writeIntArray(intArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let shortArryDataReply = result.reply.readIntArray();
          expect(shortArryDataReply[0] == 2147483647).assertTrue();
          expect(shortArryDataReply[1] == intArryData[1]).assertTrue();
          expect(shortArryDataReply[2] == intArryData[2]).assertTrue();
          expect(shortArryDataReply[3] == intArryData[3]).assertTrue();
          expect(shortArryDataReply[4] == -2147483648).assertTrue();
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1330 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1330---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1340
    * @tc.name    : test Writeintarray interface, input parameter length verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1340", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1340---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let intArryData = [];
        for (let i = 0; i < 50 * K; i++) {
          intArryData[i] = 1;
        }
        data.writeIntArray(intArryData);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1340 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code != errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1340---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1350
    * @tc.name    : test WriteIntArray is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1350", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1350---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [1, 2, 3, 4, 5];
        data.reclaim();
        data.writeIntArray(ByteArrayVar);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1350 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1350---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1360
    * @tc.name    : test ReadIntArray is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1360", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1360---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [1, 2, 3, 4, 5];
        data.writeIntArray(ByteArrayVar);
        data.reclaim();
        data.readIntArray();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1360 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1360---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1370
    * @tc.name    : test Writelongarray interface, boundary value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1370", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1370---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let wLongArryData = [-9007199254740992, 0, 1, 2, 9007199254740991];
        data.writeLongArray(wLongArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let rLongArryData = [];
          result.reply.readLongArray(rLongArryData);
          expect(rLongArryData).assertDeepEquals(wLongArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1370 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1370---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1380
    * @tc.name    : test Call the writelongarray interface, write the long integer array to the MessageSequence instance,
    *              and call readlongarray (datain: number []) to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1380", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1380---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      option.setWaitTime(130);
      try{
        let wLongArryData = [];
        for (let i = 0; i < (25 * K - 1); i++) {
          wLongArryData[i] = 11;
        };
        data.writeLongArray(wLongArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let rLongArryData = [];
          result.reply.readLongArray(rLongArryData);
          expect(rLongArryData).assertDeepEquals(wLongArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1380 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1380---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1390
    * @tc.name    : test Writelongarray interface, long type precision verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1390", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1390---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let wLongArryData = [-9999999999999999, 9999999999999999];
        data.writeLongArray(wLongArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_LONGARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let rLongArryData = result.reply.readLongArray();
          let newlongdata = [-10000000000000000, 10000000000000000];
          expect(rLongArryData[0]).assertEqual(newlongdata[0]);
          expect(rLongArryData[1]).assertEqual(newlongdata[1]);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1390 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1390---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1400
    * @tc.name    : test Writelongarray Indicates an interface for verifying the input length
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1400---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let wLongArryData = [];
        for (let i = 0; i < 25 * K; i++) {
          wLongArryData[i] = 11;
        };
        data.writeLongArray(wLongArryData);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1400 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code != errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1400---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1410
    * @tc.name    : test WriteLongArray is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1410", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1410---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [1, 2, 3, 4, 5];
        data.reclaim();
        data.writeLongArray(ByteArrayVar);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1410 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1410---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1420
    * @tc.name    : test ReadLongArray is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1420", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1420---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [1, 2, 3, 4, 5];
        data.writeLongArray(ByteArrayVar);
        data.reclaim();
        data.readLongArray();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1420 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1420---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1430
    * @tc.name    : test Call the writefloatarray interface, write the array to the MessageSequence instance,
    *              and call readfloatarray (datain: number []) to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1430", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1430---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let floatArryData = [1.4E-45, 1.3, 3.4028235E38];
        data.writeFloatArray(floatArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let newArr = new Array(3);
          result.reply.readFloatArray(newArr);
          expect(newArr).assertDeepEquals(floatArryData);
          expect(newArr).assertDeepEquals(floatArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1430 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1430---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1440
    * @tc.name    : test Writefloatarray interface, parameter boundary value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1440", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1440---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let floatArryData = [(1.4E-45) - 1, 1.3, (3.4028235E38) + 1];
        data.writeFloatArray(floatArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let newArr = result.reply.readFloatArray();
          expect(newArr[0]).assertEqual(-1);
          expect(newArr[1]).assertEqual(1.3);
          expect(newArr[2]).assertEqual(3.4028235e+38);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1440 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1440---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1450
    * @tc.name    : test Writefloatarray interface, boundary value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1450", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1450---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      option.setWaitTime(130);
      try{
        let floatArryData = [];
        for (let i = 0; i < (25 * K - 1); i++) {
          floatArryData[i] = 1.1;
        };
        data.writeFloatArray(floatArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_FLOATARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readFloatArray()).assertDeepEquals(floatArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1450 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1450---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1460
    * @tc.name    : test Writefloatarray interface, Longest array verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1460", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1460---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let floatArryData = [];
        for (let i = 0; i < (25 * K); i++) {
          floatArryData[i] = 1.1;
        };
        data.writeFloatArray(floatArryData);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1460 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code != errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1460---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1470
    * @tc.name    : test WriteFloatArray is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1470", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1470---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [1.1, 2.2, 3.3];
        data.reclaim();
        data.writeFloatArray(ByteArrayVar);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1470 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1470---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1480
    * @tc.name    : test ReadFloatArray is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1480", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1480---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [1.1, 2.2, 3.3];
        data.writeFloatArray(ByteArrayVar);
        data.reclaim();
        data.readFloatArray();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1480 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1480---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1490
    * @tc.name    : test Writedoublearray interface, boundary value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1490", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1490---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let wDoubleArryData = [4.9E-324, 235.67, 1.79E+308];
        data.writeDoubleArray(wDoubleArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readDoubleArray()).assertDeepEquals(wDoubleArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1490 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1490---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1500
    * @tc.name    : test Call the writedoublearray interface, write the array to the MessageSequence instance,
    *              and call readdoublearra (datain: number []) to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1500---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      option.setWaitTime(130);
      try{
        let wDoubleArryData = [];
        for (let i = 0; i < (25 * K - 1); i++) {
          wDoubleArryData[i] = 11.1;
        };
        data.writeDoubleArray(wDoubleArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let rDoubleArryData = [];
          result.reply.readDoubleArray(rDoubleArryData);
          expect(rDoubleArryData).assertDeepEquals(wDoubleArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1500 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1500---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1510
    * @tc.name    : test Writedoublearray interface, illegal value validation
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1510", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1510---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let eDoubleArryData = [(4.9E-324) - 1, (1.79E+308) + 1];
        data.writeDoubleArray(eDoubleArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_DOUBLEARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let rDoubleArryData = result.reply.readDoubleArray();
          expect(rDoubleArryData[0]).assertEqual(-1);
          expect(rDoubleArryData[1]).assertEqual(1.79e+308);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1510 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1510---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1520
    * @tc.name    : test Writedoublearray interface, Out-of-bounds value verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1520", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1520---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let eDoubleArryData = [];
        for (let i = 0; i < 25 * K; i++) {
          eDoubleArryData[i] = 11.1;
        }
        data.writeDoubleArray(eDoubleArryData);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1520 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code != errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1520---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1530
    * @tc.name    : test WriteDoubleArray is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1530", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1530---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [11.1, 22.2, 33.3];
        data.reclaim();
        data.writeDoubleArray(ByteArrayVar);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1530 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1530---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1540
    * @tc.name    : test ReadDoubleArray is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1540", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1540---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [11.1, 22.2, 33.3];
        data.writeDoubleArray(ByteArrayVar);
        data.reclaim();
        data.readDoubleArray();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1540 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1540---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1550
    * @tc.name    : test Call the writebooleanarray interface, write the array to the MessageSequence instance,
    *              and call readbooleanarray to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1550", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1550---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let wBooleanArryData = [true, false, false];
        data.writeBooleanArray(wBooleanArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readBooleanArray()).assertDeepEquals(wBooleanArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1550 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1550---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1560
    * @tc.name    : test Call the writebooleanarray interface, write the array to the MessageSequence instance,
    *              and call readbooleanarray (datain: number []) to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1560", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1560---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      option.setWaitTime(130);
      try{
        let wBooleanArryData = [];
        for (let i = 0; i < (50 * K - 1); i++) {
          if (i % 2 == 0) {
            wBooleanArryData[i] = false;
          } else {
            wBooleanArryData[i] = true;
          }
        }
        data.writeBooleanArray(wBooleanArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let rBooleanArryData = [];
          result.reply.readBooleanArray(rBooleanArryData);
          expect(rBooleanArryData).assertDeepEquals(wBooleanArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1560 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1560---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1570
    * @tc.name    : test Writebooleanarray interface, illegal value validation
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1570", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1570---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let errorBooleanArryData = [true, 9, false];
        data.writeBooleanArray(errorBooleanArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_BOOLEANARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let eCharArrayData = [true, false, false];
          expect(result.reply.readBooleanArray()).assertDeepEquals(eCharArrayData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1570 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1570---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1580
    * @tc.name    : test Writebooleanarray Interface for length verification of input parameters
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1580", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1580---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let wBooleanArryData = [];
        for (let i = 0; i < 50 * K; i++) {
          if (i % 2 == 0) {
            wBooleanArryData[i] = false;
          } else {
            wBooleanArryData[i] = true;
          };
        }
        data.writeBooleanArray(wBooleanArryData);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1580 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code != errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1580---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1590
    * @tc.name    : test WriteBooleanArray is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1590", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1590---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [false, true, false];
        data.reclaim();
        data.writeBooleanArray(ByteArrayVar);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1590 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1590---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1600
    * @tc.name    : test ReadBooleanArray is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1600---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [false, true, false];
        data.writeBooleanArray(ByteArrayVar);
        data.reclaim();
        data.readBooleanArray();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1600 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1600---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1610
    * @tc.name    : test Call the writechararray interface, write the array to the MessageSequence instance,
    *              and call readchararray to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1610", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1610---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let wCharArryData = [0, 97, 255];
        data.writeCharArray(wCharArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readCharArray()).assertDeepEquals(wCharArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1610 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1610---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1620
    * @tc.name    : test Call the writechararray interface, write the array to the MessageSequence instance,
    *              and call readchararray (datain: number []) to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1620", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1620---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      option.setWaitTime(130);
      try{
        let wCharArryData = [];
        for (let i = 0; i < (50 * K - 1); i++) {
          wCharArryData[i] = 96;
        };
        data.writeCharArray(wCharArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let rCharArryData = [];
          result.reply.readCharArray(rCharArryData);
          expect(rCharArryData).assertDeepEquals(wCharArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1620 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1620---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1630
    * @tc.name    : test Writechararray interface, illegal value validation
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1630", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1630---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let errorCharArryData = [96, "asfgdgdtu", 97];
        data.writeCharArray(errorCharArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_CHARARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let eCharArrayData = [96, 0, 97];
          let readchardata = result.reply.readCharArray();
          expect(readchardata).assertDeepEquals(eCharArrayData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1630 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1630---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1640
    * @tc.name    : test Writechararray Indicates the length of an interface input parameter
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1640", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1640---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let errorCharArryData = [];
        for (let i = 0; i < 50 * K; i++) {
          errorCharArryData[i] = 96;
        };
        data.writeCharArray(errorCharArryData);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1640 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code != errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1640---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1650
    * @tc.name    : test WriteCharArray is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1650", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1650---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [97, 98, 88];
        data.reclaim();
        data.writeCharArray(ByteArrayVar);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1650 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1650---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1660
    * @tc.name    : test ReadCharArray is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1660", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1660---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = [97, 98, 88];
        data.writeCharArray(ByteArrayVar);
        data.reclaim();
        data.readCharArray();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1660 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1660---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1670
    * @tc.name    : test Call the writestringarray interface, write the array to the MessageSequence instance,
    *              and call readstringarray (datain: number []) to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1670", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1670---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let wStringArryData = ["abc", "hello", "beauty"];
        data.writeStringArray(wStringArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRINGARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readStringArray()).assertDeepEquals(wStringArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1670 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1670---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1680
    * @tc.name    : test Call the writestringarray interface, write the array to the MessageSequence instance,
    *              and call readstringarray() to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1680", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1680---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      option.setWaitTime(130);
      try{
        let wStringArryData = [];
        for (let i = 0; i < (10 * K - 1); i++) {
          wStringArryData[i] = "heddSDF";
        };
        data.writeStringArray(wStringArryData);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_STRINGARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let rStringArryData = [];
          result.reply.readStringArray(rStringArryData);
          expect(rStringArryData).assertDeepEquals(wStringArryData);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1680 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1680---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1690
    * @tc.name    : test Writestringarray interface, illegal value validation
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1690", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1690---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let errorStringArryData = ["abc", 123, "beauty"];
        data.writeStringArray(errorStringArryData);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1690 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1690---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1700
    * @tc.name    : test writeStringArray Interface for length verification of input parameters
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1700---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let wStringArryData = [];
        for (let i = 0; i < 10 * K; i++) {
          wStringArryData[i] = "heddSDF";
        }
        data.writeStringArray(wStringArryData);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1700 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code != errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1700---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1710
    * @tc.name    : test WriteStringArray is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1710", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1710---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = ["abc", "def"];
        data.reclaim();
        data.writeStringArray(ByteArrayVar);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1710 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1710---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1720
    * @tc.name    : test ReadStringArray is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1720", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1720---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ByteArrayVar = ["abc", "def"];
        data.writeStringArray(ByteArrayVar);
        data.reclaim();
        data.readStringArray();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1720 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1720---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1730
    * @tc.name    : test After the server finishes processing, write noexception first before writing the result,
    *              and the client calls readexception to judge whether the server is abnormal
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1730", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1730---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeNoException();
        data.writeInt(6);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_NOEXCEPTION, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          result.reply.readException();
          expect(result.reply.readInt()).assertEqual(6);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1730 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1730---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1740
    * @tc.name    : test If the data on the server is abnormal, the client calls readexception
    *              to judge whether the server is abnormal
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1740", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1740---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeNoException();
        data.writeInt(1232222223444);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_NOEXCEPTION, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          result.reply.readException();
          expect(result.reply.readInt() != 1232222223444).assertTrue();
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1740 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1740---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1750
    * @tc.name    : test WriteNoException is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1750", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1750---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.writeNoException();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1750 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1750---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1760
    * @tc.name    : test ReadException is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1760", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1760---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        data.reclaim();
        data.readException();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1760 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1760 ---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1770
    * @tc.name    : test Call the writeParcelablearray interface to write the custom serialized object array (1, 2, 3) to
    *               the MessageSequence instance, and call readParcelablearray to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1770", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1770---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let sequenceable = [new MySequenceable(1, "aaa"),
          new MySequenceable(2, "bbb"), new MySequenceable(3, "ccc")];
        data.writeParcelableArray(sequenceable);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_SEQUENCEABLEARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let s = [new MySequenceable(null, null), new MySequenceable(null, null),
            new MySequenceable(null, null)];
          result.reply.readParcelableArray(s);
          for (let i = 0; i < s.length; i++) {
            expect(s[i].str).assertEqual(sequenceable[i].str);
            expect(s[i].num).assertEqual(sequenceable[i].num);
          }
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1770 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1770---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1780
    * @tc.name    : test Call the writeParcelablearray interface to write the custom serialized object to the
    *              MessageSequence instance, and call readParcelablearray to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1780", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1780---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let sequenceable = [new MySequenceable(4, "abc"),
          new MySequenceable(5, "bcd"), new MySequenceable(6, "cef")];
        data.writeParcelableArray(sequenceable);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_SEQUENCEABLEARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let s = [new MySequenceable(null, null),
            new MySequenceable(null, null), new MySequenceable(null, null)];
          result.reply.readParcelableArray(s);
          for (let i = 0; i < s.length; i++) {
            expect(s[i].str).assertEqual(sequenceable[i].str);
            expect(s[i].num).assertEqual(sequenceable[i].num);
          };
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1780 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1780---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1790
    * @tc.name    : test Call the writeParcelablearray interface to write the custom
    *              serialized object to the MessageSequence instance
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1790", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1790---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let sequenceable = 1;
        data.writeParcelableArray(sequenceable);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1790 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1790---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1800
    * @tc.name    : test WriteParcelableArray is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1800---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let a = [new MySequenceable(1, "aaa"), new MySequenceable(2, "bbb"),
          new MySequenceable(3, "ccc")];
        data.reclaim();
        data.writeParcelableArray(a);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1800 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1800---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1810
    * @tc.name    : test ReadParcelableArray is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1810", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1810---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let a = [new MySequenceable(1, "aaa"), new MySequenceable(2, "bbb"),
          new MySequenceable(3, "ccc")];
        let b = [new MySequenceable(0, ""), new MySequenceable(0, ""), new MySequenceable(0, "")];
        data.writeParcelableArray(a);
        data.reclaim();
        data.readParcelableArray(b);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1810 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1810 ---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1820
    * @tc.name    : test Test MessageSequence to deliver the reply message received in promise across processes
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1820", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1820---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeByte(2);
        data.writeShort(3);
        data.writeInt(4);
        data.writeLong(5);
        data.writeFloat(1.2);
        data.writeDouble(10.2);
        data.writeBoolean(true);
        data.writeChar(97);
        data.writeString("HelloWorld");
        data.writeParcelable(new MySequenceable(1, "aaa"));
        await gIRemoteObject.sendMessageRequest(CODE_ALL_TYPE, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readByte()).assertEqual(2);
          expect(result.reply.readShort()).assertEqual(3);
          expect(result.reply.readInt()).assertEqual(4);
          expect(result.reply.readLong()).assertEqual(5);
          expect(result.reply.readFloat()).assertEqual(1.2);
          expect(result.reply.readDouble()).assertEqual(10.2);
          expect(result.reply.readBoolean()).assertTrue();
          expect(result.reply.readChar()).assertEqual(97);
          expect(result.reply.readString()).assertEqual("HelloWorld");
          let s = new MySequenceable(null, null);
          result.reply.readParcelable(s);
          expect(s.num).assertEqual(1);
          expect(s.str).assertEqual("aaa");
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1820 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1820---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1830
    * @tc.name    : test Test the cross process delivery of MessageSequence and receive the reply message
    *              in the callback function
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1830", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1830---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeByte(2);
        data.writeShort(3);
        data.writeInt(4);
        data.writeLong(5);
        data.writeFloat(1.2);
        data.writeDouble(10.2);
        data.writeBoolean(true);
        data.writeChar(97);
        data.writeString("HelloWorld");
        data.writeParcelable(new MySequenceable(1, "aaa"));
        function sendMessageRequestCallback(result) {
          try {
            console.info("sendMessageRequest Callback");
            expect(result.errCode).assertEqual(0);
            expect(result.reply.readByte()).assertEqual(2);
            expect(result.reply.readShort()).assertEqual(3);
            expect(result.reply.readInt()).assertEqual(4);
            expect(result.reply.readLong()).assertEqual(5);
            expect(result.reply.readFloat()).assertEqual(1.2);
            expect(result.reply.readDouble()).assertEqual(10.2);
            expect(result.reply.readBoolean()).assertTrue();
            expect(result.reply.readChar()).assertEqual(97);
            expect(result.reply.readString()).assertEqual("HelloWorld");
            let s = new MySequenceable(null, null);
            result.reply.readParcelable(s);
            expect(s.num).assertEqual(1);
            expect(s.str).assertEqual("aaa");
          } finally {
            data.reclaim();
            reply.reclaim();
            done();
          }
        }
        console.info("start send request");
        await gIRemoteObject.sendMessageRequest(CODE_ALL_TYPE, data, reply, option, sendMessageRequestCallback);

      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1830 error: " + error);
        expect(error == null).assertTrue();
      }
      console.info("--------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1830--------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1840
    * @tc.name    : test Test the cross process transmission of MessageSequence.
    *              After receiving the reply message in promise, read letious types of arrays in order
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1840", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("--------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1840--------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeByteArray([1, 2, 3]);
        data.writeShortArray([4, 5, 6]);
        data.writeIntArray([7, 8, 9]);
        data.writeLongArray([10, 11, 12]);
        data.writeFloatArray([1.1, 1.2, 1.3]);
        data.writeDoubleArray([2.1, 2.2, 2.3]);
        data.writeBooleanArray([true, true, false]);
        data.writeCharArray([65, 97, 122]);
        data.writeStringArray(["abc", "seggg"]);
        let a = [new MySequenceable(1, "aaa"), new MySequenceable(2, "bbb"),
          new MySequenceable(3, "ccc")]
        data.writeParcelableArray(a);
        await gIRemoteObject.sendMessageRequest(CODE_ALL_ARRAY_TYPE, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readByteArray()).assertDeepEquals([1, 2, 3]);
          expect(result.reply.readShortArray()).assertDeepEquals([4, 5, 6]);
          expect(result.reply.readIntArray()).assertDeepEquals([7, 8, 9]);
          expect(result.reply.readLongArray()).assertDeepEquals([10, 11, 12]);
          expect(result.reply.readFloatArray()).assertDeepEquals([1.1, 1.2, 1.3]);
          expect(result.reply.readDoubleArray()).assertDeepEquals([2.1, 2.2, 2.3]);
          expect(result.reply.readBooleanArray()).assertDeepEquals([true, true, false]);
          expect(result.reply.readCharArray()).assertDeepEquals([65, 97, 122]);
          expect(result.reply.readStringArray()).assertDeepEquals(["abc", "seggg"]);
          let b = [new MySequenceable(null, null), new MySequenceable(null, null),
            new MySequenceable(null, null)];
          result.reply.readParcelableArray(b);
          for (let i = 0; i < b.length; i++) {
            expect(b[i].str).assertEqual(a[i].str);
            expect(b[i].num).assertEqual(a[i].num);
          }
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1840 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1840---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1850
    * @tc.name    : test Test MessageSequence cross process delivery. After receiving the reply message in promise,
    *              the client constructs an empty array in sequence and reads the data from the reply message
    *              into the corresponding array
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1850", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1850---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeByteArray([1, 2, 3]);
        data.writeShortArray([4, 5, 6]);
        data.writeIntArray([7, 8, 9]);
        data.writeLongArray([10, 11, 12]);
        data.writeFloatArray([1.1, 1.2, 1.3]);
        data.writeDoubleArray([2.1, 2.2, 2.3]);
        data.writeBooleanArray([true, true, false]);
        data.writeCharArray([65, 97, 122]);
        data.writeStringArray(["abc", "seggg"]);
        let a = [new MySequenceable(1, "aaa"), new MySequenceable(2, "bbb"),
          new MySequenceable(3, "ccc")]
        data.writeParcelableArray(a);
        await gIRemoteObject.sendMessageRequest(CODE_ALL_ARRAY_TYPE, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let ByteArray = new Array();
          result.reply.readByteArray(ByteArray);
          expect(ByteArray).assertDeepEquals([1, 2, 3]);
          let ShortArray = new Array();
          result.reply.readShortArray(ShortArray);
          expect(ShortArray).assertDeepEquals([4, 5, 6]);
          let IntArray = new Array();
          result.reply.readIntArray(IntArray);
          expect(IntArray).assertDeepEquals([7, 8, 9]);
          let LongArray = new Array();
          result.reply.readLongArray(LongArray);
          expect(LongArray).assertDeepEquals([10, 11, 12]);
          let FloatArray = new Array();
          result.reply.readFloatArray(FloatArray);
          expect(FloatArray).assertDeepEquals([1.1, 1.2, 1.3]);
          let DoubleArray = new Array();
          result.reply.readDoubleArray(DoubleArray);
          expect(DoubleArray).assertDeepEquals([2.1, 2.2, 2.3]);
          let BooleanArray = new Array();
          result.reply.readBooleanArray(BooleanArray);
          expect(BooleanArray).assertDeepEquals([true, true, false]);
          let CharArray = new Array();
          result.reply.readCharArray(CharArray);
          expect(CharArray).assertDeepEquals([65, 97, 122]);
          let StringArray = new Array();
          result.reply.readStringArray(StringArray);
          expect(StringArray).assertDeepEquals(["abc", "seggg"]);
          let b = [new MySequenceable(null, null), new MySequenceable(null, null),
            new MySequenceable(null, null)];
          result.reply.readParcelableArray(b);
          for (let i = 0; i < b.length; i++) {
            expect(b[i].str).assertEqual(a[i].str);
            expect(b[i].num).assertEqual(a[i].num);
          }
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1850 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1850---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1860
    * @tc.name    : test Call the writeremoteobjectarray interface to write the object array to the MessageSequence
    *             instance, and call readremoteobjectarray to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1860", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1860---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try {
        let count = 0;
        function checkResult(num, str) {
          expect(num).assertEqual(123);
          expect(str).assertEqual("rpcListenerTest");
          count++;
          console.info("check result done, count: " + count);
          if (count == 3) {
            done();
          };
        };
        data.writeInterfaceToken("rpcTestAbility");
        let listeners = [new TestListener("rpcListener", checkResult),
          new TestListener("rpcListener2", checkResult),
          new TestListener("rpcListener3", checkResult)];
        data.writeRemoteObjectArray(listeners);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_REMOTEOBJECTARRAY, data, reply, option).then((result) => {
          console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1860: sendMessageRequest is " + result.errCode);
          expect(result.errCode).assertEqual(0);
          expect(result.code).assertEqual(CODE_WRITE_REMOTEOBJECTARRAY);
          expect(result.data).assertEqual(data);
          expect(result.reply).assertEqual(reply);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1860 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1860---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1870
    * @tc.name    : test Call the writeremoteobjectarray interface to write the object array to the MessageSequence instance,
    *             and call readremoteobjectarray (objects: iremoteobject []) to read the data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1870", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1870---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try {
        let count = 0;
        function checkResult(num, str) {
          expect(num).assertEqual(123);
          expect(str).assertEqual("rpcListenerTest");
          count++;
          console.info("check result done, count: " + count);
          if (count == 3) {
            done();
          }
        }
        data.writeInterfaceToken("rpcTestAbility");
        let listeners = [new TestListener("rpcListener", checkResult),
          new TestListener("rpcListener2", checkResult),
          new TestListener("rpcListener3", checkResult)];
        data.writeRemoteObjectArray(listeners);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_REMOTEOBJECTARRAY, data, reply, option).then((result) => {
          console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1870: sendMessageRequest is " + result.errCode);
          expect(result.errCode == 0).assertTrue();
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1870 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1870---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1880
    * @tc.name    : test Test MessageSequence to pass an array of iremoteobject objects across processes
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1880", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1880---------------------------");
      let count = 0;
      function checkResult(num, str) {
        expect(num).assertEqual(123);
        expect(str).assertEqual("rpcListenerTest");
        count++;
        console.info("check result done, count: " + count);
        if (count == 3) {
          done();
        }
      }
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try {
        let listeners = [new TestListener("rpcListener", checkResult),
          new TestListener("rpcListener2", checkResult),
          new TestListener("rpcListener3", checkResult)];
        data.writeRemoteObjectArray(listeners);
        data.writeInt(123);
        data.writeString("rpcListenerTest");
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_REMOTEOBJECTARRAY_1, data, reply, option)
          .then((result) => {
            expect(result.errCode).assertEqual(0);
            result.reply.readException();
          });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1880 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1880---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1890
    * @tc.name    : test Test MessageSequence to pass the array of iremoteobject objects across processes. The server
    *             constructs an empty array in onremoterequest and reads it from MessageSequence
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1890", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1890---------------------------");
      let count = 0;
      function checkResult(num, str) {
        expect(num).assertEqual(123);
        expect(str).assertEqual("rpcListenerTest");
        count++;
        console.info("check result done, count: " + count);
        if (count == 3) {
          done();
        }
      }
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try {
        let listeners = [new TestListener("rpcListener", checkResult),
          new TestListener("rpcListener2", checkResult),
          new TestListener("rpcListener3", checkResult)];
        data.writeRemoteObjectArray(listeners);
        data.writeInt(123);
        data.writeString("rpcListenerTest");
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_REMOTEOBJECTARRAY_2, data, reply, option)
          .then((result) => {
            expect(result.errCode).assertEqual(0);
            result.reply.readException();
          });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1890 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1890---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1900
    * @tc.name    : test WriteRemoteObjectArray is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1900---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let count = 0;
        function checkResult(num, str) {
          expect(num).assertEqual(123);
          expect(str).assertEqual("rpcListenerTest");
          count++;
          console.info("check result done, count: " + count);
          if (count == 3) {
            done();
          }
        }
        let listeners = [new TestListener("rpcListener", checkResult),
          new TestListener("rpcListener2", checkResult),
          new TestListener("rpcListener3", checkResult)];
        data.reclaim();
        data.writeRemoteObjectArray(listeners);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1900 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1900---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1910
    * @tc.name    : test ReadRemoteObjectArray is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1910", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1910---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let count = 0;
        function checkResult(num, str) {
          expect(num).assertEqual(123);
          expect(str).assertEqual("rpcListenerTest");
          count++;
          console.info("check result done, count: " + count);
          if (count == 3) {
            done();
          }
        }
        let listeners = [new TestListener("rpcListener", checkResult),
          new TestListener("rpcListener2", checkResult),
          new TestListener("rpcListener3", checkResult)];
        data.writeRemoteObjectArray(listeners);
        data.reclaim();
        data.readRemoteObjectArray();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1910 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1910 ---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1920
    * @tc.name    : test dupFileDescriptor is call os dup function failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1920", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1920---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        rpc.MessageSequence.dupFileDescriptor(-1);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1920 error: " + error);
        let errCode = `${rpc.ErrorCode.OS_DUP_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1920 ---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1930
    * @tc.name    : test Writes the specified anonymous shared object to this MessageSequence
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1930", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, function(){
      console.info("--------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1930--------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let ashmem = rpc.Ashmem.create("ashmem", 1024);
        data.writeAshmem(ashmem);
        ashmem.unmapAshmem();
        ashmem.closeAshmem();
      } catch (error) {
        expect(error == null).assertTrue();
      }finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("--------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1930--------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1940
    * @tc.name    : test Test the function of serializing the readAshmem interface in MessageSequence mode
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1940", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, function(){
      console.info("--------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1940--------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let ashmem = rpc.Ashmem.create("ashmem", 1024);
        data.writeAshmem(ashmem);
        let ashmemdata = data.readAshmem();
        expect(ashmemdata != null).assertTrue();
        ashmem.unmapAshmem();
        ashmem.closeAshmem();
      } catch (error) {
        expect(error).assertEqual(null);
      }finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("--------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1940--------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1950
    * @tc.name    : test To test the function of handling the exception of the writeAshmem interface in MessageSequence mode
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1950", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, function(){
      console.info("--------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1950--------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      try{
        let ashmem = "";
        data.writeAshmem(ashmem);
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1950 error: " + error);
        let errCode = `${rpc.ErrorCode.CHECK_PARAM_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("--------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1950--------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1960
    * @tc.name    : test WriteAshmem is write data to message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1960", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1960---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ashmem = rpc.Ashmem.create("JsAshmemTest", 1024);
        data.reclaim();
        data.writeAshmem(ashmem);
        ashmem.unmapAshmem();
        ashmem.closeAshmem();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1960 error: " + error);
        let errCode = `${rpc.ErrorCode.WRITE_DATA_TO_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1960 ---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1970
    * @tc.name    : test readAshmem is read data from message sequence failed Error verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改IPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1970", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3,async function(){
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1970---------------------------");
      let data = rpc.MessageSequence.create();
      try{
        let ashmem = rpc.Ashmem.create("JsAshmemTest", 1024);
        data.writeAshmem(ashmem);
        data.reclaim();
        data.readAshmem();
        ashmem.unmapAshmem();
        ashmem.closeAshmem();
        expect(data.getSize() == 0).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1970 error: " + error);
        let errCode = `${rpc.ErrorCode.READ_DATA_FROM_MESSAGE_SEQUENCE_ERROR}`;
        expect(error.code == errCode).assertTrue();
        expect(error.message != null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1970 ---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1980
    * @tc.name    : test Call the getRawDataCapacity interface to get the maximum amount of raw data that a MessageSequence
    *               can hold
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1980", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1980---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        expect(data.getRawDataCapacity()).assertEqual(128 * M);
        data.writeIntArray([1, 2, 3, 4, 5]);
        expect(data.getRawDataCapacity()).assertEqual(128 * M);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_INTARRAY, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
          expect(result.reply.readIntArray()).assertDeepEquals([1, 2, 3, 4, 5]);
          expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1980 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1980---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_1990
    * @tc.name    : test Test MessageSequence to deliver rawdata data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_1990", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_1990---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let arr = [1, 2, 3, 4, 5];
        data.writeInt(arr.length);
        data.writeRawData(arr, arr.length);
        expect(data.getRawDataCapacity()).assertEqual(128 * M);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_RAWDATA, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let size = result.reply.readInt();
          expect(size).assertEqual(arr.length);
          expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
          let newReadResult = result.reply.readRawData(size);
          expect(newReadResult[0]).assertEqual(arr[0]);
          expect(newReadResult[1]).assertEqual(arr[1]);
          expect(newReadResult[2]).assertEqual(arr[2]);
          expect(newReadResult[3]).assertEqual(arr[3]);
          expect(newReadResult[4]).assertEqual(arr[4]);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_1990 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_1990---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_2000
    * @tc.name    : test Test MessageSequence to pass abnormal rawdata data, and expand the capacity for verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_2000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_2000---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let arr = [1, 2, 3, 4, 5];
        data.writeInt(arr.length + 1);
        data.writeRawData(arr, (arr.length + 1));
        expect(data.getRawDataCapacity()).assertEqual(128 * M);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_RAWDATA, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let size = result.reply.readInt();
          expect(size).assertEqual(arr.length + 1);
          expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
          let newReadResult = result.reply.readRawData(size);
          expect(newReadResult[0]).assertEqual(arr[0]);
          expect(newReadResult[1]).assertEqual(arr[1]);
          expect(newReadResult[2]).assertEqual(arr[2]);
          expect(newReadResult[3]).assertEqual(arr[3]);
          expect(newReadResult[4]).assertEqual(arr[4]);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_2000 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_2000---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_2010
    * @tc.name    : test Test MessageSequence to pass exception rawdata data data interception verification
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_2010", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_2010---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let arr = [1, 2, 3, 4, 5];
        data.writeInt(arr.length - 1);
        data.writeRawData(arr, (arr.length - 1));
        expect(data.getRawDataCapacity()).assertEqual(128 * M);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_RAWDATA, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let size = result.reply.readInt();
          expect(size).assertEqual(arr.length - 1);
          expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
          let newReadResult = result.reply.readRawData(size);
          expect(newReadResult[0]).assertEqual(arr[0]);
          expect(newReadResult[1]).assertEqual(arr[1]);
          expect(newReadResult[2]).assertEqual(arr[2]);
          expect(newReadResult[3]).assertEqual(arr[3]);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_2010 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_2010---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_2020
    * @tc.name    : test Test MessageSequence to deliver out-of-bounds RawData data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_2020", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_2020---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        let arr = [-129, 2, 3, 4, 128];
        data.writeInt(arr.length);
        data.writeRawData(arr, arr.length);
        expect(data.getRawDataCapacity()).assertEqual(128 * M);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_RAWDATA, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let size = result.reply.readInt();
          expect(size).assertEqual(arr.length);
          expect(result.reply.getRawDataCapacity()).assertEqual(128 * M);
          let newReadResult = result.reply.readRawData(size);
          expect(newReadResult[0]).assertEqual(arr[0]);
          expect(newReadResult[1]).assertEqual(arr[1]);
          expect(newReadResult[2]).assertEqual(arr[2]);
          expect(newReadResult[3]).assertEqual(arr[3]);
          expect(newReadResult[4]).assertEqual(arr[4]);
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_2020 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_2020---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_2030
    * @tc.name    : test Test MessageSequence to deliver illegal RawData data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_2030", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_2030---------------------------");
      let data: rpc.MessageSequence = new rpc.MessageSequence();
      try {
        let arr = ["aaa", 1, 2, 3];
        data.writeInt(arr.length);
        data.writeRawData(arr, arr.length);
        expect(data.getRawDataCapacity()).assertEqual(128 * M);
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_2030 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_2030---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_2040
    * @tc.name    : test Test fixed MessageSequence space size to pass rawData data
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_2040", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_2040---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        expect(data.getRawDataCapacity()).assertEqual(128 * M);
        let rawdata = [1, 2, 3];
        data.writeInt(rawdata.length);
        data.writeRawData(rawdata, rawdata.length);
        expect(gIRemoteObject != undefined).assertTrue();
        await gIRemoteObject.sendMessageRequest(CODE_WRITE_RAWDATA, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          let size = result.reply.readInt();
          expect(result.reply.readRawData(size) != rawdata).assertTrue();
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_2040 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_2040---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_2050
    * @tc.name    : test Test MessageSequence delivery file descriptor object
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_2050", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_2050---------------------------");
      try {
        let testab = new TestProxy(gIRemoteObject).asObject();
        expect(testab != null).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_2050 error: " + error);
        expect(error == null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_2050---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_2060
    * @tc.name    : test Test that the asObject interface is called by a RemoteObject and returns itself
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_2060", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function () {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_2060---------------------------");
      try {
        let testAbilityStub = new TestAbilityStub("testObject");
        expect(testAbilityStub.asObject() != null).assertTrue();
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_2060 error: " + error);
        expect(error == null).assertTrue();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_2060---------------------------");
    });

    /*
    * @tc.number  : SUB_DSoftbus_RPC_API_NEW_MessageSequence_2070
    * @tc.name    : test Test the function of the getReadPosition interface
    * @tc.desc    : [G-DISTRIBUTED-0212]禁止修改RPC中定义的数据结构和接口，并提供对应完整实现
    * @tc.level   : 3
    * @tc.type    : Compatibility
    * @tc.size    : MediumTest
    */
    it("SUB_DSoftbus_RPC_API_NEW_MessageSequence_2070", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL3, async function (done) {
      console.info("---------------------start SUB_DSoftbus_RPC_API_NEW_MessageSequence_2070---------------------------");
      let data: rpc.MessageSequence = rpc.MessageSequence.create();
      let reply: rpc.MessageSequence = rpc.MessageSequence.create();
      let option: rpc.MessageOption = new rpc.MessageOption();
      try{
        data.writeByte(2);
        data.writeShort(3);
        data.writeInt(4);
        data.writeLong(5);
        data.writeFloat(1.2);
        data.writeDouble(10.2);
        data.writeBoolean(true);
        data.writeChar(97);
        data.writeString("");
        data.writeParcelable(new MySequenceable(1, "aaa"));
        await gIRemoteObject.sendMessageRequest(CODE_ALL_TYPE, data, reply, option).then((result) => {
          expect(result.errCode).assertEqual(0);
          expect(result.reply.readByte()).assertEqual(2);
          expect(result.reply.getReadPosition()).assertEqual(4);
          expect(result.reply.readShort()).assertEqual(3);
          expect(result.reply.getReadPosition()).assertEqual(4 + 4);
          expect(result.reply.readInt()).assertEqual(4);
          expect(result.reply.getReadPosition()).assertEqual((4 + 4) + 4);
          expect(result.reply.readLong()).assertEqual(5);
          expect(result.reply.getReadPosition()).assertEqual(((4 + 4) + 4) + 8);
          expect(result.reply.readFloat()).assertEqual(1.2);
          expect(result.reply.getReadPosition()).assertEqual((((4 + 4) + 4) + 8) + 8);
          expect(result.reply.readDouble()).assertEqual(10.2);
          expect(result.reply.getReadPosition()).assertEqual(((((4 + 4) + 4) + 8) + 8) + 8);
          expect(result.reply.readBoolean()).assertTrue();
          expect(result.reply.getReadPosition()).assertEqual((((((4 + 4) + 4) + 8) + 8) + 8) + 4);
          expect(result.reply.readChar()).assertEqual(97);
          expect(result.reply.getReadPosition()).assertEqual(((((((4 + 4) + 4) + 8) + 8) + 8) + 4) + 4);
          expect(result.reply.readString()).assertEqual("");
          expect(result.reply.getReadPosition()).assertEqual((((((((4 + 4) + 4) + 8) + 8) + 8) + 4) + 4) + 8);
          let s = new MySequenceable(null, null);
          result.reply.readParcelable(s);
          expect(result.reply.getReadPosition()).assertEqual(((((((((4 + 4) + 4) + 8) + 8) + 8) + 4) + 4) + 8) + (12 + 8));
          expect(s.num).assertEqual(1);
          expect(s.str).assertEqual("aaa");
        });
      } catch (error) {
        console.info(logTag + "SUB_DSoftbus_RPC_API_NEW_MessageSequence_2070 error: " + error);
        expect(error == null).assertTrue();
      } finally{
        console.info(logTag + "reclaim done");
        data.reclaim();
        reply.reclaim();
        done();
      }
      console.info("---------------------end SUB_DSoftbus_RPC_API_NEW_MessageSequence_2070---------------------------");
    });
    console.info("-----------------------SUB_DSoftbus_RPC_API_NEW_onRemoteRequest_Test is end-----------------------");
  });
}
