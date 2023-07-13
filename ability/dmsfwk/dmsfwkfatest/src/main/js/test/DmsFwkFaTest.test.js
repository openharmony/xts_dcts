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

import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from '@ohos/hypium';
import rpc from "@ohos.rpc";
import deviceManager from '@ohos.distributedHardware.deviceManager';
import featureAbility from "@ohos.ability.featureAbility";
import { UiDriver, BY } from '@ohos.UiTest';
import abilityDelegatorRegistry from '@ohos.app.ability.abilityDelegatorRegistry';

let connectId = null;
let dvList = [];
let dvId = null;
let abilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();

export default function DmsFwkFaTest() {

  describe('DmsFwkFaTest', function () {

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function getPermission() {
      console.info(`getPermission is start`);
      let permissions = ['ohos.permission.DISTRIBUTED_DATASYNC'];
      let context = featureAbility.getContext()
      context.requestPermissionsFromUser(permissions, 666, (data) => {
        console.info("request success" + JSON.stringify(data));
      })
    }

    async function driveFn() {
      try {
        let driver = await UiDriver.create()
        console.info(` come in driveFn`)
        console.info(`driver is ${JSON.stringify(driver)}`)
        sleep(2000);
        let button = await driver.findComponent(BY.text('允许'));
        console.info(`button is ${JSON.stringify(button)}`);
        sleep(5000);
        await button.click();
      } catch (err) {
        console.info('err is ' + err);
        return;
      }
    }

    async function driveClick() {
      try {
        let driver = await UiDriver.create();
        console.info(`come in driveFn`);
        console.info(`driver is ${JSON.stringify(driver)}`);
        sleep(2000);
        let button = await driver.findComponent(BY.text('知道了'));
        console.info(`button is ${JSON.stringify(button)}`);
        sleep(5000);
        await button.click();
      } catch (err) {
        console.info('err is ' + err);
        return;
      }
    }

    beforeAll(async function (done) {
      console.info('beforeAll called dms')
      await getPermission();
      sleep(5000);
      await driveFn();
      sleep(100);

      function deviceManagerCallback(error, deviceManagers) {
        console.info("got deviceManager: " + deviceManagers + ", error: " + error)
        let deviceList = deviceManagers.getTrustedDeviceListSync()
        let deviceId = deviceList[0].networkId
        dvList = deviceList;
        dvId = deviceId;
        console.info("online device id: " + deviceId)
        done()
      }
      deviceManager.createDeviceManager('com.acts.example.dmsfwkstageserver', deviceManagerCallback)
      console.info("beforeAll done")
    })

    beforeEach(async function (done) {
      console.info(('beforeEach called'))
      done()
    })

    afterEach(async function (done) {
      console.info('afterEach called')
      await featureAbility.disconnectAbility(connectId).then((data) => {
        console.info('disconnectAbility called success');
      }).catch((err) => {
        console.info('disconnectAbility called error ' + err.message);
      })
      sleep(2000);
      done();
    })

    afterAll(async function (done) {
      console.info('afterAll called')
      await driveClick();
      sleep(5000);
      done()
    })

    /*
    * @tc.number  SUB_DMS_StartAbilityResult_0010
    * @tc.name    StartRemoteAbilityForResult remote MainAbility is success
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartAbilityResult_0010", 0, async function (done) {
      console.info("---------------SUB_DMS_StartAbilityResult_0010 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StartAbilityResult_0010 data is' + data.resultCode);
          expect(data.resultCode).assertEqual(100);
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StartAbilityResult_0010 is failed ' + err.code);
          expect().assertFail();
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartAbilityResult_0010 catch' + err.code);
        console.info('SUB_DMS_StartAbilityResult_0010 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StartAbilityResult_0010 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StartAbilityResult_0020
    * @tc.name    StartRemoteAbilityForResult deviceId is null
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartAbilityResult_0020", 0, async function (done) {
      console.info("---------------SUB_DMS_StartAbilityResult_0020 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: '',
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StartAbilityResult_0020 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StartAbilityResult_0020 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartAbilityResult_0020 catch' + err.code);
        console.info('SUB_DMS_StartAbilityResult_0020 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StartAbilityResult_0020 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StartAbilityResult_0030
    * @tc.name    StartRemoteAbilityForResult deviceId is Does not exist
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartAbilityResult_0030", 0, async function (done) {
      console.info("---------------SUB_DMS_StartAbilityResult_0030 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StartAbilityResult_0030 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StartAbilityResult_0030 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartAbilityResult_0030 catch' + err.code);
        console.info('SUB_DMS_StartAbilityResult_0030 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StartAbilityResult_0030 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StartAbilityResult_0040
    * @tc.name    StartRemoteAbilityForResult deviceId is undefined
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartAbilityResult_0040", 0, async function (done) {
      console.info("---------------SUB_DMS_StartAbilityResult_0040 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: undefined,
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StartAbilityResult_0040 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StartAbilityResult_0040 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartAbilityResult_0040 catch' + err.code);
        console.info('SUB_DMS_StartAbilityResult_0040 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StartAbilityResult_0040 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StartAbilityResult_0050
    * @tc.name    StartRemoteAbilityForResult deviceId is err
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartAbilityResult_0050", 0, async function (done) {
      console.info("---------------SUB_DMS_StartAbilityResult_0050 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: '12345678+./xts',
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StartAbilityResult_0050 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StartAbilityResult_0050 is failed ' + err.code);
          expect(err.code).assertEqual(9)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartAbilityResult_0050 catch' + err.code);
        console.info('SUB_DMS_StartAbilityResult_0050 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StartAbilityResult_0050 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StartAbilityResult_0060
    * @tc.name    StartRemoteAbilityForResult bundleName is null
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartAbilityResult_0060", 0, async function (done) {
      console.info("---------------SUB_DMS_StartAbilityResult_0060 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: "",
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StartAbilityResult_0060 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StartAbilityResult_0060 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartAbilityResult_0060 catch' + err.code);
        console.info('SUB_DMS_StartAbilityResult_0060 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StartAbilityResult_0060 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StartAbilityResult_0070
    * @tc.name    StartRemoteAbilityForResult bundleName is Does not exist
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartAbilityResult_0070", 0, async function (done) {
      console.info("---------------SUB_DMS_StartAbilityResult_0070 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StartAbilityResult_0070 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StartAbilityResult_0070 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartAbilityResult_0070 catch' + err.code);
        console.info('SUB_DMS_StartAbilityResult_0070 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StartAbilityResult_0070 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StartAbilityResult_0080
    * @tc.name    StartRemoteAbilityForResult bundleName is undefined
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartAbilityResult_0080", 0, async function (done) {
      console.info("---------------SUB_DMS_StartAbilityResult_0080 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: undefined,
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StartAbilityResult_0080 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StartAbilityResult_0080 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartAbilityResult_0080 catch' + err.code);
        console.info('SUB_DMS_StartAbilityResult_0080 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StartAbilityResult_0080 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StartAbilityResult_0090
    * @tc.name    StartRemoteAbilityForResult bundleName is err
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartAbilityResult_0090", 0, async function (done) {
      console.info("---------------SUB_DMS_StartAbilityResult_0090 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: "com.acts.example",
            abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StartAbilityResult_0090 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StartAbilityResult_0090 is failed ' + err.code);
          expect(err.code).assertEqual(9)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartAbilityResult_0090 catch' + err.code);
        console.info('SUB_DMS_StartAbilityResult_0090 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StartAbilityResult_0090 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StartAbilityResult_0100
    * @tc.name    StartRemoteAbilityForResult abilityName is null
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartAbilityResult_0100", 0, async function (done) {
      console.info("---------------SUB_DMS_StartAbilityResult_0100 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StartAbilityResult_0100 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StartAbilityResult_0100 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartAbilityResult_0100 catch' + err.code);
        console.info('SUB_DMS_StartAbilityResult_0100 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StartAbilityResult_0100 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StartAbilityResult_0110
    * @tc.name    StartRemoteAbilityForResult abilityName is Does not exist
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartAbilityResult_0110", 0, async function (done) {
      console.info("---------------SUB_DMS_StartAbilityResult_0110 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: "com.acts.example.dmsfwkstageserver",
            // abilityName: "MainAbility2",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StartAbilityResult_0110 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StartAbilityResult_0110 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartAbilityResult_0110 catch' + err.code);
        console.info('SUB_DMS_StartAbilityResult_0110 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StartAbilityResult_0110 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StartAbilityResult_0120
    * @tc.name    StartRemoteAbilityForResult abilityName is undefined
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartAbilityResult_0120", 0, async function (done) {
      console.info("---------------SUB_DMS_StartAbilityResult_0120 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: 'com.acts.example.dmsfwkstageserver',
            abilityName: undefined,
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StartAbilityResult_0120 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StartAbilityResult_0120 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartAbilityResult_0120 catch' + err.code);
        console.info('SUB_DMS_StartAbilityResult_0120 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StartAbilityResult_0120 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StartAbilityResult_0130
    * @tc.name    StartRemoteAbilityForResult abilityName is err
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartAbilityResult_0130", 0, async function (done) {
      console.info("---------------SUB_DMS_StartAbilityResult_0130 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
            deviceId: dvId,
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "123456",
            parameters: {
              startReason: "terminateSelfWithResult"
            }
          }
        }).then((data) => {
          console.info('SUB_DMS_StartAbilityResult_0130 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StartAbilityResult_0130 is failed ' + err.code);
          expect(err.code).assertEqual(9)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartAbilityResult_0130 catch' + err.code);
        console.info('SUB_DMS_StartAbilityResult_0130 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StartAbilityResult_0130 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StartAbilityResult_0140
    * @tc.name    StartRemoteAbilityForResult want is null
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartAbilityResult_0140", 0, async function (done) {
      console.info("---------------SUB_DMS_StartAbilityResult_0140 is start---------------");
      try {
        featureAbility.startAbilityForResult({
          "want": {
          }
        }).then((data) => {
          console.info('SUB_DMS_StartAbilityResult_0140 data is' + data.resultCode);
          expect().assertFail();
          done();
        }).catch((err) => {
          console.info('SUB_DMS_StartAbilityResult_0140 is failed ' + err.code);
          expect(err.code).assertEqual(1)
          done();
        })
      } catch (err) {
        console.info('SUB_DMS_StartAbilityResult_0140 catch' + err.code);
        console.info('SUB_DMS_StartAbilityResult_0140 catch' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("---------------SUB_DMS_StartAbilityResult_0140 is end---------------");
    });

    /*
    * @tc.number  SUB_DMS_StartAbilityResult_CallBack_0010
    * @tc.name    StartRemoteAbilityForResult remote MainAbility is success
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_StartAbilityResult_CallBack_0010", 0, async function (done) {
      console.info("---------------SUB_DMS_StartAbilityResult_CallBack_0010 is start---------------");
      let TAG = 'SUB_DMS_StartAbilityResult_CallBack_0010';
      let wantValue = {
        deviceId: dvId,
        bundleName: "com.acts.example.dmsfwkstageserver",
        abilityName: "MainAbility2",
        parameters: {
          startReason: "terminateSelfWithResult"
        }
      }
      featureAbility.startAbilityForResult({
        want: wantValue
      }, (error, data) => {
        try {
          if (error && error.code !== 0) {
            console.error(TAG + ' fail, error: ' + error.code);
            expect().assertFail();
          } else {
            console.log(TAG + ' success, data: ' + JSON.stringify(data));
            expect(data.resultCode).assertEqual(100);
          }
        } catch (error) {
          console.info(TAG + ":error = " + error);
          expect().assertFail();
        }
        done();
      });
      await sleep(1000);
      console.info("---------------SUB_DMS_StartAbilityResult_CallBack_0010 is end---------------");
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0010
     * @tc.name    Connect the remote ServiceAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0010", 0, async function (done) {
      console.info("-----------------SUB_DMS_ConnectAbility_0010 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_ConnectAbility_0010 msg: ' + msg)
              expect(msg == 100).assertTrue();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_ConnectAbility_0010  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_ConnectAbility_0010  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_ConnectAbility_0010 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0010 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_ConnectAbility_0010 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0020
     * @tc.name    Connect the remote Service with null bundlename.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0020", 0, async function (done) {
      console.info("-----------------SUB_DMS_ConnectAbility_0020 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_ConnectAbility_0020 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_ConnectAbility_0020  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_ConnectAbility_0020  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_ConnectAbility_0020 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0020 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_ConnectAbility_0020 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0030
     * @tc.name    Disconnect the remote ServiceAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0030", 0, async function (done) {
      console.info("-----------------SUB_DMS_ConnectAbility_0030 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_ConnectAbility_0030 msg: ' + msg)
              expect(msg == 100).assertTrue();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_ConnectAbility_0030  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_ConnectAbility_0030  onFailed: ' + code);
            expect().assertFail();
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_ConnectAbility_0030 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0030 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      featureAbility.disconnectAbility(connectId, (err, data) => {
        console.info('SUB_DMS_ConnectAbility_0030 disconnectAbility err: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0030 disconnectAbilityerr: ' + err.message);
        expect(err.code).assertEqual(0);
        done();
      })
      await sleep(1000);
      console.info("-----------------SUB_DMS_ConnectAbility_0030 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0040
     * @tc.name    Connect the remote Service with Wrong ServiceAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0040", 0, async function (done) {
      console.info("-----------------SUB_DMS_ConnectAbility_0040 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "WrongServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_ConnectAbility_0040 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_ConnectAbility_0040  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_ConnectAbility_0040  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_ConnectAbility_0040 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0040 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_ConnectAbility_0040 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0050
     * @tc.name    Connect the remote Service with Wrong deviceId.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0050", 0, async function (done) {
      console.info("-----------------SUB_DMS_ConnectAbility_0050 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: "123456",
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_ConnectAbility_0050 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_ConnectAbility_0050  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_ConnectAbility_0050  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_ConnectAbility_0050 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0050 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_ConnectAbility_0050 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0060
     * @tc.name    Connect the remote Service with null ServiceAbility.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0060", 0, async function (done) {
      console.info("-----------------SUB_DMS_ConnectAbility_0060 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: ""
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_ConnectAbility_0060 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_ConnectAbility_0060  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_ConnectAbility_0060  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_ConnectAbility_0060 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0060 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_ConnectAbility_0060 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0070
     * @tc.name    Connect the remote Service without bundleName.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0070", 0, async function (done) {
      console.info("-----------------SUB_DMS_ConnectAbility_0070 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_ConnectAbility_0070 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_ConnectAbility_0070  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_ConnectAbility_0070  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_ConnectAbility_0070 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0070 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_ConnectAbility_0070 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0080
     * @tc.name    Connect the remote Service with wrong bundleName.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0080", 0, async function (done) {
      console.info("-----------------SUB_DMS_ConnectAbility_0080 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.Wrongdmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_ConnectAbility_0080 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_ConnectAbility_0080  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_ConnectAbility_0080  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_ConnectAbility_0080 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0080 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_ConnectAbility_0080 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0090
     * @tc.name    Connect the remote Service with bundleName is undefined.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0090", 0, async function (done) {
      console.info("-----------------SUB_DMS_ConnectAbility_0090 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: undefined,
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_ConnectAbility_0090 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_ConnectAbility_0090  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_ConnectAbility_0090  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_ConnectAbility_0090 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0090 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_ConnectAbility_0090 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0100
     * @tc.name    Connect the remote Service without abilityName.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0100", 0, async function (done) {
      console.info("-----------------SUB_DMS_ConnectAbility_0100 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_ConnectAbility_0100 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_ConnectAbility_0100  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_ConnectAbility_0100  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_ConnectAbility_0100 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0100 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_ConnectAbility_0100 end------------------------");
    });

    /*
     * @tc.number  SUB_DMS_ConnectAbility_0110
     * @tc.name    Connect the remote Service with abilityName is undefined.
     * @tc.desc    Function test
     * @tc.level   0
     */
    it("SUB_DMS_ConnectAbility_0110", 0, async function (done) {
      console.info("-----------------SUB_DMS_ConnectAbility_0110 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: dvId,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: undefined
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_ConnectAbility_0110 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_ConnectAbility_0110  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_ConnectAbility_0110  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_ConnectAbility_0110 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0110 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_ConnectAbility_0110 end------------------------");
    });

    /*
    * @tc.number  SUB_DMS_ConnectAbility_0120
    * @tc.name    Connect the remote Service with deviceid is undefined.
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_ConnectAbility_0120", 0, async function (done) {
      console.info("-----------------SUB_DMS_ConnectAbility_0120 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          deviceId: undefined,
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_ConnectAbility_0120 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_ConnectAbility_0120  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_ConnectAbility_0120  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_ConnectAbility_0120 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0120 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_ConnectAbility_0120 end------------------------");
    });

    /*
    * @tc.number  SUB_DMS_ConnectAbility_0130
    * @tc.name    Connect the remote Service without deviceid.
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_ConnectAbility_0130", 0, async function (done) {
      console.info("-----------------SUB_DMS_ConnectAbility_0130 start------------------------");
      let connectId;
      try {
        connectId = featureAbility.connectAbility({
          bundleName: "com.acts.example.dmsfwkstageserver",
          abilityName: "ServiceAbility"
        }, {
          onConnect: (elementName, proxy) => {
            let option = new rpc.MessageOption();
            let data = new rpc.MessageParcel();
            let reply = new rpc.MessageParcel();
            data.writeInt(1);
            data.writeInt(99);
            proxy.sendRequest(1, data, reply, option).then((result) => {
              console.log('sendRequest success');
              let msg = result.reply.readInt();
              console.info(' SUB_DMS_ConnectAbility_0130 msg: ' + msg)
              expect(msg == 100).assertFail();
              done();
            }).catch((e) => {
              console.log('sendRequest error:' + e);
              expect().assertFail();
              done();
            });
          },
          onDisConnect: (elementName) => {
            console.info('SUB_DMS_ConnectAbility_0130  onDisConnect: ' + JSON.stringify(elementName));
            expect().assertFail();
            done();
          },
          onFailed: (code) => {
            console.info('SUB_DMS_ConnectAbility_0130  onFailed: ' + code);
            expect(code).assertEqual(0);
            done();
          }
        });
      } catch (err) {
        console.info('SUB_DMS_ConnectAbility_0130 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0130 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_ConnectAbility_0130 end------------------------");
    });

    /*
    * @tc.number  SUB_DMS_ConnectAbility_0140
    * @tc.name    Connect the remote ServiceAbility fot ten times.
    * @tc.desc    Function test
    * @tc.level   0
    */
    it("SUB_DMS_ConnectAbility_0140", 0, async function (done) {
      console.info("-----------------SUB_DMS_ConnectAbility_0140 start------------------------");
      let connectId;
      try {
        for (let i = 0; i < 10; i++) {
          connectId = featureAbility.connectAbility({
            deviceId: dvId,
            bundleName: "com.acts.example.dmsfwkstageserver",
            abilityName: "ServiceAbility"
          }, {
            onConnect: (elementName, proxy) => {
              let option = new rpc.MessageOption();
              let data = new rpc.MessageParcel();
              let reply = new rpc.MessageParcel();
              data.writeInt(1);
              data.writeInt(99);
              proxy.sendRequest(1, data, reply, option).then((result) => {
                console.log('sendRequest success');
                let msg = result.reply.readInt();
                console.info(' SUB_DMS_ConnectAbility_0140 msg: ' + msg)
                expect(msg == 100).assertTrue();
                done();
              }).catch((e) => {
                console.log('sendRequest error:' + e);
                expect().assertFail();
                done();
              });
            },
            onDisConnect: (elementName) => {
              console.info('SUB_DMS_ConnectAbility_0140  onDisConnect: ' + JSON.stringify(elementName));
              expect().assertFail();
              done();
            },
            onFailed: (code) => {
              console.info('SUB_DMS_ConnectAbility_0140  onFailed: ' + code);
              expect().assertFail();
              done();
            }
          });
          featureAbility.disconnectAbility(connectId, (err, data) => {
            console.info('SUB_DMS_ConnectAbility_0140 disconnectAbility err: ' + err.code);
            console.info('SUB_DMS_ConnectAbility_0140 disconnectAbilityerr: ' + err.message);
            expect(err.code).assertEqual(0);
            done();
          })
          console.info("SUB_DMS_ConnectAbility_0140 running at : " + i + ",here");
        }
      } catch (err) {
        console.info('SUB_DMS_ConnectAbility_0140 catch: ' + err.code);
        console.info('SUB_DMS_ConnectAbility_0140 catch: ' + err.message);
        expect().assertFail();
        done();
      }
      await sleep(1000);
      console.info("-----------------SUB_DMS_ConnectAbility_0140 end------------------------");
    });
  })
}