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
import TestService from "./testService";
import abilityDelegatorRegistry from '@ohos.app.ability.abilityDelegatorRegistry';

let dvList = [];
let dvId = null;
let gIRemoteObject = null;
let testservice = null;
let localDeviceId = undefined;
let abilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();

deviceManager.createDeviceManager('ohos.dms.test', async (error, deviceManager) => {
    console.info("CLIENT Create device manager success");
    localDeviceId = deviceManager.getLocalDeviceInfoSync().networkId;
    console.info("local device id is: " + localDeviceId);
    let deviceList = deviceManager.getTrustedDeviceListSync();
    dvList = deviceList;
    let deviceId = deviceList[0].networkId;
    dvId = deviceId;
    console.info("deviceid is: " + deviceId);
    console.info("deviceList is: " + JSON.stringify(deviceList));
})

export default function dmsJsUnitTest() {

    describe('dmsJsUnitTest', function () {

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function getPermission() {
            console.info(`getPermission is start`);
            let permissions = ['ohos.permission.DISTRIBUTED_DATASYNC'];
            let context = featureAbility.getContext();
            context.requestPermissionsFromUser(permissions, 666, (data) => {
                console.info("request success" + JSON.stringify(data));
            })
        }

        async function driveFn() {
            try {
                let driver = await UiDriver.create();
                console.info(`come in driveFn`);
                console.info(`driver is ${JSON.stringify(driver)}`);
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
            console.info('beforeAll called dms');
            await getPermission();
            sleep(5000);
            await driveFn();
            sleep(5000);

            testservice = new TestService();
            console.info("TestService is:");
            await testservice.toConnectAbility().then(data => {
                gIRemoteObject = data;
                console.info("toConnectAbility data is:" + data);
            })
            done();
            console.info("beforeAll done");
        })

        beforeEach(async function (done) {
            console.info(('beforeEach called'));
            done();
        })

        afterEach(async function (done) {
            console.info('afterEach called');
            setTimeout(done, 4000);
        })

        afterAll(async function (done) {
            await driveClick();
            sleep(5000);

            console.info('afterAll called');
            done();
        })

        /*
        * @tc.number  SUB_DMS_OpenHarmony_StartAbility_0100
        * @tc.name    Start the remote Ability with error bundlename.
        * @tc.desc    Function test
        * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_0100", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0100 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0100 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0100 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.Wrongdmstest",
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_0100 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0100 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0100 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0100 err: ' + err.message);
                    expect(err.code).assertEqual(9);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0100:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0100 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_0200
         * @tc.name    Start the remote Ability with bundlename is undefined.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_0200", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0200 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0200 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0200 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: undefined,
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_0200 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0200 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0200 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0200 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0200:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0200 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_0300
         * @tc.name    Start the remote Ability with bundlename is null.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_0300", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0300 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0300 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0300 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "",
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_0300 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0300 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0300 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0300 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0300:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0300 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_0400
         * @tc.name    Start the remote Ability without bundlename.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_0400", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0400 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0400 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0400 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_0400 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0400 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0400 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0400 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0400:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0400 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_0500
         * @tc.name    Start the remote Ability with abilityname is error.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_0500", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0500 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0500 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0500 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.WrongAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_0500 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0500 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0500 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0500 err: ' + err.message);
                    expect(err.code).assertEqual(9);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0500:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0500 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_0600
         * @tc.name    Start the remote Ability with abilityname is undefined.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_0600", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0600 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0600 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0600 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: undefined,
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_0600 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0600 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0600 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0600 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0600:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0600 end------------------------");
        });

        /*
        * @tc.number  SUB_DMS_OpenHarmony_StartAbility_0700
        * @tc.name    Start the remote Ability with abilityname is null.
        * @tc.desc    Function test
        * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_0700", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0700 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0700 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0700 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_0700 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0700 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0700 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0700 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0700:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0700 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_0800
         * @tc.name    Start the remote Ability without abilityname.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_0800", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0800 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0800 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0800 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_0800 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0800 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0800 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0800 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0800:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0800 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_0900
         * @tc.name    Start the remote Ability with deviceId is undefined.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_0900", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0900 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0900 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0900 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: undefined,
                    parameters: params
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_0900 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0900 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0900 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_0900 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_0900:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_0900 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_1100
         * @tc.name    Start the remote Ability without deviceId.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_1100", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1100 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1100 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1100 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    parameters: params
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_1100 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1100 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1100 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1100 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1100:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1100 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_1200
         * @tc.name    Start the remote Ability with error deviceId.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_1200", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1200 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1200 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1200 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: "1234",
                    parameters: params
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_1200 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1200 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1200 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1200 err: ' + err.message);
                    expect(err.code).assertEqual(9);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1200:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1200 end------------------------");
        });

        /*
        * @tc.number  SUB_DMS_OpenHarmony_StartAbility_1300
        * @tc.name    Start the remote Ability with dvId.
        * @tc.desc    Function test
        * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_1300", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1300 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1300 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1300 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_1300 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1300 data' + JSON.stringify(data));
                    expect(data == 0).assertTrue();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1300 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1300 err: ' + err.message);
                    expect().assertFail();
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1300:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1300 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_1400
         * @tc.name    Start the remote Ability with parmter is undefined .
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_1400", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1400 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1400 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1400 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = undefined;
                console.info('SUB_DMS_OpenHarmony_StartAbility_1400 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1400 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1400 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1400 err: ' + err.message);
                    expect(err.code).assertEqual(202);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1400:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1400 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_1500
         * @tc.name    Start the remote Ability without parmter.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_1500", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1500 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1500 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1500 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {};
                console.info('SUB_DMS_OpenHarmony_StartAbility_1500 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1500 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1500 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1500 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1500:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1500 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_1600
         * @tc.name    Start the remote Ability with parmter is null.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_1600", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1600 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1600 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1600 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = "";
                console.info('SUB_DMS_OpenHarmony_StartAbility_1600 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1600 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1600 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1600 err: ' + err.message);
                    expect(err.code).assertEqual(202);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1600:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1600 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_1700
         * @tc.name    Start the remote Ability with 10 times.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_1700", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1700 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1700 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1700 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_1700 want=' + JSON.stringify(wantValue));
                for (let i = 0; i < 10; i++) {
                    await featureAbility.startAbility({
                        want: wantValue
                    }).then((data) => {
                        console.info('SUB_DMS_OpenHarmony_StartAbility_1700 data' + JSON.stringify(data));
                        expect(data == 0).assertTrue();
                        done();
                    }).catch((err) => {
                        console.info('SUB_DMS_OpenHarmony_StartAbility_1700 err: ' + err.code);
                        console.info('SUB_DMS_OpenHarmony_StartAbility_1700 err: ' + err.message);
                        expect().assertFail();
                        done();
                    });
                    console.info("SUB_DMS_OpenHarmony_StartAbility_1700 running at : " + i + ",here");
                }
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1700:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1700 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_1900
         * @tc.name    Start the remote Ability.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_1900", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1900 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1900 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1900 no device found');
                    expect(numDevices === 0).assertFail();
                };
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.MainAbility",
                    deviceId: dvId,
                    parameters: {
                        "startReason": "terminateSelf"
                    }
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_1900 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1900 data' + JSON.stringify(data));
                    expect(data == 0).assertTrue();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1900 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_1900 err: ' + err.message);
                    expect().assertFail();
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_1900:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_1900 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_2000
         * @tc.name    Start the remote Ability after kill process of softbus_server.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_2000", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_2000 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_2000 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_2000 no device found');
                    expect(numDevices === 0).assertFail();
                };
                abilityDelegator.executeShellCommand("pidof softbus_server", (err, data) => {
                    console.info("SUB_DMS_OpenHarmony_StartAbility_2000:" + data.stdResult)
                    abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data) => {
                        console.info("SUB_DMS_OpenHarmony_StartAbility_2000:" + data.stdResult)
                    })
                })
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_2000 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_2000 data' + JSON.stringify(data));
                    expect(data == 0).assertTrue();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_2000 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_2000 err: ' + err.message);
                    expect().assertFail();
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_2000:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_2000 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_2100
         * @tc.name    Start the remote Ability after kill process of distributedsche.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_2100", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_2100 start------------------------");
            try {
                console.info("SUB_DMS_OpenHarmony_StartAbility_2100 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_2100 no device found');
                    expect(numDevices === 0).assertFail();
                };
                abilityDelegator.executeShellCommand("pidof distributedsche", (err, data) => {
                    console.info("SUB_DMS_OpenHarmony_StartAbility_2100:" + data.stdResult)
                    abilityDelegator.executeShellCommand("kill -9" + data.stdResult, (err, data) => {
                        console.info("SUB_DMS_OpenHarmony_StartAbility_2100:" + data.stdResult)
                    })
                })
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_OpenHarmony_StartAbility_2100 want=' + JSON.stringify(wantValue));
                await featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_2100 data' + JSON.stringify(data));
                    expect(data == 0).assertTrue();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_OpenHarmony_StartAbility_2100 err: ' + err.code);
                    console.info('SUB_DMS_OpenHarmony_StartAbility_2100 err: ' + err.message);
                    expect().assertFail();
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_OpenHarmony_StartAbility_2100:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_2100 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0010
         * @tc.name    Start the remote Ability with error bundlename.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0010", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0010 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0010";
            let params;
            let wantValue = {
                bundleName: "com.ohos.Wrongdmstest",
                abilityName: "com.ohos.dmstest.ServiceAbility",
                deviceId: dvId,
                parameters: params
            };
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect(error.code).assertEqual(9);
                        expect(error.message).assertEqual("StartAbility Failed");
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect().assertFail();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0010 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0020
         * @tc.name    Start the remote Ability with bundlename is undefined.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0020", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0020 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0020";
            let params;
            let wantValue = {
                bundleName: undefined,
                abilityName: "com.ohos.dmstest.ServiceAbility",
                deviceId: dvId,
                parameters: params
            };
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect(error.code).assertEqual(1);
                        expect(error.message).assertEqual("StartAbility Failed");
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect().assertFail();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0020 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0030
         * @tc.name    Start the remote Ability with bundlename is null.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0030", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0030 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0030";
            let params;
            let wantValue = {
                bundleName: "",
                abilityName: "com.ohos.dmstest.ServiceAbility",
                deviceId: dvId,
                parameters: params
            };
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect(error.code).assertEqual(1);
                        expect(error.message).assertEqual("StartAbility Failed");
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect().assertFail();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0030 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0040
         * @tc.name    Start the remote Ability without bundlename.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0040", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0040 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0040";
            let params;
            let wantValue = {
                abilityName: "com.ohos.dmstest.ServiceAbility",
                deviceId: dvId,
                parameters: params
            };
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect(error.code).assertEqual(1);
                        expect(error.message).assertEqual("StartAbility Failed");
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect().assertFail();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0040 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0050
         * @tc.name    Start the remote Ability with abilityname is error.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0050", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0050 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0050";
            let params;
            let wantValue = {
                bundleName: "com.ohos.dmstest",
                abilityName: "com.ohos.dmstest.WrongAbility",
                deviceId: dvId,
                parameters: params
            };
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect(error.code).assertEqual(9);
                        expect(error.message).assertEqual("StartAbility Failed");
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect().assertFail();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0050 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0060
         * @tc.name    Start the remote Ability with abilityname is undefined.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0060", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0060 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0060";
            let params;
            let wantValue = {
                bundleName: "com.ohos.dmstest",
                abilityName: undefined,
                deviceId: dvId,
                parameters: params
            };
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect(error.code).assertEqual(1);
                        expect(error.message).assertEqual("StartAbility Failed");
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect().assertFail();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0060 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0070
         * @tc.name    Start the remote Ability with abilityname is null.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0070", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0070 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0070";
            let params;
            let wantValue = {
                bundleName: "com.ohos.dmstest",
                abilityName: "",
                deviceId: dvId,
                parameters: params
            };
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect(error.code).assertEqual(1);
                        expect(error.message).assertEqual("StartAbility Failed");
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect().assertFail();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0070 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0080
         * @tc.name    Start the remote Ability without abilityname.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0080", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0080 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0080";
            let params;
            let wantValue = {
                bundleName: "com.ohos.dmstest",
                deviceId: dvId,
                parameters: params
            };
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect(error.code).assertEqual(1);
                        expect(error.message).assertEqual("StartAbility Failed");
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect().assertFail();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0080 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0090
         * @tc.name    Start the remote Ability with deviceId is undefined.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0090", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0090 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0090";
            let params;
            let wantValue = {
                bundleName: "com.ohos.dmstest",
                abilityName: "com.ohos.dmstest.ServiceAbility",
                deviceId: undefined,
                parameters: params
            };
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect(error.code).assertEqual(1);
                        expect(error.message).assertEqual("StartAbility Failed");
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect().assertFail();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0090 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0110
         * @tc.name    Start the remote Ability without deviceId.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0110", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0110 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0110";
            let params;
            let wantValue = {
                bundleName: "com.ohos.dmstest",
                abilityName: "com.ohos.dmstest.ServiceAbility",
                parameters: params
            };
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect(error.code).assertEqual(1);
                        expect(error.message).assertEqual("StartAbility Failed");
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect().assertFail();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0110 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0120
         * @tc.name    Start the remote Ability with error deviceId.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0120", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0120 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0120";
            let params;
            let wantValue = {
                bundleName: "com.ohos.dmstest",
                abilityName: "com.ohos.dmstest.ServiceAbility",
                deviceId: "1234",
                parameters: params
            };
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect(error.code).assertEqual(9);
                        expect(error.message).assertEqual("StartAbility Failed");
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect().assertFail();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0120 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0130
         * @tc.name    Start the remote Ability with dvId.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0130", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0130 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0130";
            console.info(TAG + " dvList:" + dvList.length);
            let numDevices = dvList.length;
            if (numDevices === 0) {
                console.info(TAG + ' no device found');
                expect(numDevices === 0).assertFail();
            };
            let params;
            let wantValue = {
                bundleName: "com.ohos.dmstest",
                abilityName: "com.ohos.dmstest.ServiceAbility",
                deviceId: dvId,
                parameters: params
            };
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect().assertFail();
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect(data == 0).assertTrue();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0130 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0140
         * @tc.name    Start the remote Ability with parmter is undefined .
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0140", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0140 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0140";
            let wantValue = undefined;
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect(error.code).assertEqual(202);
                        expect(error.message).assertEqual("StartAbility Failed");
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect().assertFail();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0140 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0150
         * @tc.name    Start the remote Ability without parmter.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0150", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0150 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0150";
            let wantValue = {};
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect(error.code).assertEqual(1);
                        expect(error.message).assertEqual("StartAbility Failed");
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect().assertFail();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0150 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0160
         * @tc.name    Start the remote Ability with parmter is null.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0160", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0160 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0160";
            let wantValue = "";
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect(error.code).assertEqual(202);
                        expect(error.message).assertEqual("StartAbility Failed");
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect().assertFail();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0160 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0170
         * @tc.name    Start the remote Ability with 10 times.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0170", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0170 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0170";
            console.info(TAG + " dvList:" + dvList.length);
            let numDevices = dvList.length;
            if (numDevices === 0) {
                console.info(TAG + ' no device found');
                expect(numDevices === 0).assertFail();
            };
            let params;
            let wantValue = {
                bundleName: "com.ohos.dmstest",
                abilityName: "com.ohos.dmstest.ServiceAbility",
                deviceId: dvId,
                parameters: params
            };
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            for (let i = 0; i < 10; i++) {
                featureAbility.startAbility({
                    want: wantValue
                }, (error, data) => {
                    try {
                        if (error && error.code !== 0) {
                            console.error(TAG + ' fail, error: ' + error.code);
                            expect().assertFail();
                        } else {
                            console.log(TAG + ' success, data: ' + JSON.stringify(data));
                            expect(data == 0).assertTrue();
                        }
                    } catch (error) {
                        console.info(TAG + ":error = " + error);
                        expect().assertFail();
                    }
                    console.info(TAG + " running at : " + i + ",here");
                    done();
                });
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0170 end------------------------");
        });

        /*
         * @tc.number  SUB_DMS_OpenHarmony_StartAbility_CallBack_0190
         * @tc.name    Start the remote Ability .
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DMS_OpenHarmony_StartAbility_CallBack_0190", 0, async function (done) {
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0190 start------------------------");
            let TAG = "SUB_DMS_OpenHarmony_StartAbility_CallBack_0190";
            console.info(TAG + " dvList:" + dvList.length);
            let numDevices = dvList.length;
            if (numDevices === 0) {
                console.info(TAG + ' no device found');
                expect(numDevices === 0).assertFail();
            };
            let wantValue = {
                bundleName: "com.ohos.dmstest",
                abilityName: "com.ohos.dmstest.MainAbility",
                deviceId: dvId,
                parameters: {
                    "startReason": "terminateSelf"
                }
            };
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            featureAbility.startAbility({
                want: wantValue
            }, (error, data) => {
                try {
                    if (error && error.code !== 0) {
                        console.error(TAG + ' fail, error: ' + error.code);
                        expect().assertFail();
                    } else {
                        console.log(TAG + ' success, data: ' + JSON.stringify(data));
                        expect(data == 0).assertTrue();
                    }
                } catch (error) {
                    console.info(TAG + ":error = " + error);
                    expect().assertFail();
                }
                done();
            });
            await sleep(1000);
            console.info("-----------------SUB_DMS_OpenHarmony_StartAbility_CallBack_0190 end------------------------");
        });
    })
}