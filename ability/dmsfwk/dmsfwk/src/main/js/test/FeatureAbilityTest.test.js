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

import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect, TestType, Size, Level } from '@ohos/hypium';
import rpc from "@ohos.rpc";
import deviceManager from '@ohos.distributedDeviceManager';
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
let dmInstance


export default function dmsJsUnitTest() {

    describe('dmsJsUnitTest', function () {

        async function getDeviceId() {
            console.log('get deviceManager is begin')
            try {
                dmInstance = deviceManager.createDeviceManager('ohos.dms.test');
                console.log('get deviceManager is success')
            } catch (error) {
                console.log('get deviceManager is failed' + JSON.stringify(error))
            }
            localDeviceId = dmInstance.getLocalDeviceNetworkId();
            console.info("local device id is: " + localDeviceId);
            let deviceList = dmInstance.getAvailableDeviceListSync();
            dvList = deviceList;
            let deviceId = deviceList[0].networkId;
            dvId = deviceId;
            console.info("deviceid is: " + deviceId);
            console.info("deviceList is: " + JSON.stringify(deviceList));
        }

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
                await sleep(1000);
                let button = await driver.findComponent(BY.text('允许'));
                console.info(`button is ${JSON.stringify(button)}`);
                await sleep(1000);
                await button.click();
                await sleep(1000);
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
                await sleep(1000);
                let button = await driver.findComponent(BY.text('知道了'));
                console.info(`button is ${JSON.stringify(button)}`);
                await sleep(1000);
                await button.click();

            } catch (err) {
                console.info('err is ' + err);
                return;
            }
        }

        beforeAll(async function (done) {
            console.info('beforeAll called dms');
            await getPermission();
            await sleep(1000);
            await driveFn();
            await sleep(1000);
            await getDeviceId();
            await sleep(1000);
            console.info("beforeAll done");
            done();
        })

        beforeEach(async function (done) {
            console.info(('beforeEach called'));
            done();
        })

        afterEach(async function (done) {
            console.info('afterEach called');
            setTimeout(done, 4000);
            await sleep(1000)
        })

        afterAll(async function (done) {
            await driveClick();
            await sleep(1000);

            console.info('afterAll called');
            done();
        })

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2800
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2800
         * @tc.desc    Start remote Ability with error bundlename.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2800 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2800 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2800 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.Wrongdmstest",
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2800 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2800 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2800 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2800 err: ' + err.message);
                    expect(err.code).assertEqual(9);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2800:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2800 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2600
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2600
         * @tc.desc    Start remote Ability with bundlename is undefined.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2600 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2600 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2600 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: undefined,
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2600 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2600 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2600 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2600 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2600:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2600 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2700
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2700
         * @tc.desc    Start remote Ability with bundlename is null.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2700 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2700 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2700 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "",
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2700 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2700 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2700 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2700 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2700:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2700 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1900
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1900
         * @tc.desc    Start remote Ability without bundlename.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1900 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1900 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1900 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1900 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1900 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1900 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1900 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1900:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1900 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2500
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2500
         * @tc.desc    Start remote Ability with abilityname is error.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2500 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2500 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2500 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.WrongAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2500 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2500 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2500 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2500 err: ' + err.message);
                    expect(err.code).assertEqual(9);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2500:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2500 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2300
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2300
         * @tc.desc    Start remote Ability with abilityname is undefined.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2300 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2300 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2300 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: undefined,
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2300 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2300 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2300 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2300 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2300:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2300 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2400
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2400
         * @tc.desc    Start remote Ability with abilityname is null.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2400 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2400 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2400 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2400 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2400 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2400 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2400 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2400:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2400 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1800
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1800
         * @tc.desc    Start remote Ability without abilityname.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1800 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1800 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1800 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1800 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1800 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1800 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1800 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1800:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1800 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2900
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2900
         * @tc.desc    Start remote Ability with deviceId is undefined.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2900 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2900 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2900 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: undefined,
                    parameters: params
                };
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2900 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2900 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2900 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2900 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2900:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2900 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2000
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2000
         * @tc.desc    Start remote Ability without deviceId.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2000 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2000 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2000 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    parameters: params
                };
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2000 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2000 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2000 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2000 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2000:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2000 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3100
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3100
         * @tc.desc    Start remote Ability with error deviceId.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3100 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3100 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3100 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.ServiceAbility",
                    deviceId: "1234",
                    parameters: params
                };
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3100 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3100 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3100 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3100 err: ' + err.message);
                    expect(err.code).assertEqual(9);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3100:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3100 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3000
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3000
         * @tc.desc    Start remote Ability with dvId.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3000 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3000 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3000 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.MainAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3000 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3000 data' + JSON.stringify(data));
                    expect(data == 0).assertTrue();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3000 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3000 err: ' + err.message);
                    expect().assertFail();
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3000:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3000 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3200
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3200
         * @tc.desc    Start remote Ability with parmter is undefined.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3200 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3200 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3200 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = undefined;
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3200 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3200 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3200 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3200 err: ' + err.message);
                    expect(err.code).assertEqual(202);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3200:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3200 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2100
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2100
         * @tc.desc    Start remote Ability without parmter.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2100 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2100 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2100 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {};
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2100 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2100 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2100 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2100 err: ' + err.message);
                    expect(err.code).assertEqual(1);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2100:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2100 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3300
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3300
         * @tc.desc    Start remote Ability with parmter is null.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3300 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3300 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3300 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = "";
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3300 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3300 data' + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3300 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3300 err: ' + err.message);
                    expect(err.code).assertEqual(202);
                    expect(err.message).assertEqual("StartAbility Failed");
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3300:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3300 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3600
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3600
         * @tc.desc    Start remote Ability with 10 times.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3600 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3600 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3600 no device found');
                    expect(numDevices === 0).assertFail();
                }
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.MainAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3600 want=' + JSON.stringify(wantValue));
                for (let i = 0; i < 10; i++) {
                    featureAbility.startAbility({
                        want: wantValue
                    }).then((data) => {
                        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3600 data' + JSON.stringify(data));
                        expect(data == 0).assertTrue();
                    }).catch((err) => {
                        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3600 err: ' + err.code);
                        console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3600 err: ' + err.message);
                        expect().assertFail();
                    });
                    console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3600 running at : " + i + ",here");
                    await sleep(2000)
                }
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3600:error = " + error);
                expect().assertFail();
            }
            await sleep(1000);
            done();
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3600 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2200
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2200
         * @tc.desc    Start remote Ability.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2200 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2200 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2200 no device found');
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
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2200 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2200 data' + JSON.stringify(data));
                    expect(data == 0).assertTrue();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2200 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2200 err: ' + err.message);
                    expect().assertFail();
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2200:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_2200 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3500
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3500
         * @tc.desc    Start remote Ability after kill process of softbus_server.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3500 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3500 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3500 no device found');
                    expect(numDevices === 0).assertFail();
                };
                abilityDelegator.executeShellCommand("pidof softbus_server", (err, data) => {
                    console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3500:" + data.stdResult)
                    abilityDelegator.executeShellCommand("kill -9 " + data.stdResult, (err, data) => {
                        console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3500:" + data.stdResult)
                    })
                })
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.MainAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3500 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3500 data' + JSON.stringify(data));
                    expect(JSON.stringify(data) == 0).assertTrue();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3500 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3500 err: ' + err.message);
                    expect().assertFail();
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3500:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3500 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3400
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3400
         * @tc.desc    Start remote Ability after kill process of distributedsche.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3400 start------------------------");
            try {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3400 dvList:" + dvList.length);
                let numDevices = dvList.length;
                if (numDevices === 0) {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3400 no device found');
                    expect(numDevices === 0).assertFail();
                };
                abilityDelegator.executeShellCommand("pidof distributedsche", (err, data) => {
                    console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3400:" + data.stdResult)
                    abilityDelegator.executeShellCommand("kill -9" + data.stdResult, (err, data) => {
                        console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3400:" + data.stdResult)
                    })
                })
                let params;
                let wantValue = {
                    bundleName: "com.ohos.dmstest",
                    abilityName: "com.ohos.dmstest.MainAbility",
                    deviceId: dvId,
                    parameters: params
                };
                console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3400 want=' + JSON.stringify(wantValue));
                featureAbility.startAbility({
                    want: wantValue
                }).then((data) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3400 data' + JSON.stringify(data));
                    expect(data == 0).assertTrue();
                    done();
                }).catch((err) => {
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3400 err: ' + err.code);
                    console.info('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3400 err: ' + err.message);
                    expect().assertFail();
                    done();
                });
            } catch (error) {
                console.info("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3400:error = " + error);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_3400 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1100
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1100
         * @tc.desc    Start remote Ability with error bundlename.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1100 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1100";
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1100 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0900
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0900
         * @tc.desc    Start remote Ability with bundlename is undefined.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0900", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0900 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0900";
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0900 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1000
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1000
         * @tc.desc    Start remote Ability with bundlename is null.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1000", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1000 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1000";
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1000 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0200
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0200
         * @tc.desc    Start remote Ability without bundlename.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0200 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0200";
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0200 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0800
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0800
         * @tc.desc    Start remote Ability with abilityname is error.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0800", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0800 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0800";
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0800 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0600
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0600
         * @tc.desc    Start remote Ability with abilityname is undefined.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0600 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0600";
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0600 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0700
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0700
         * @tc.desc    Start remote Ability with abilityname is null.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0700 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0700";
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0700 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0100
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0100
         * @tc.desc    Start remote Ability without abilityname.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0100", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0100 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0100";
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0100 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1200
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1200
         * @tc.desc    Start remote Ability with deviceId is undefined.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1200", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1200 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1200";
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1200 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0300
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0300
         * @tc.desc    Start remote Ability without deviceId.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0300 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0300";
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0300 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1400
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1400
         * @tc.desc    Start remote Ability with error deviceId.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1400 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1400";
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1400 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1300
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1300
         * @tc.desc    Start remote Ability with dvId.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1300", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1300 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1300";
            console.info(TAG + " dvList:" + dvList.length);
            let numDevices = dvList.length;
            if (numDevices === 0) {
                console.info(TAG + ' no device found');
                expect(numDevices === 0).assertFail();
            };
            let params;
            let wantValue = {
                bundleName: "com.ohos.dmstest",
                abilityName: "com.ohos.dmstest.MainAbility",
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1300 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1500
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1500
         * @tc.desc    Start remote Ability with parmter is undefined.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1500 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1500";
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1500 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0400
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0400
         * @tc.desc    Start remote Ability without parmter.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0400", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0400 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0400";
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0400 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1600
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1600
         * @tc.desc    Start remote Ability with parmter is null.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1600", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1600 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1600";
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1600 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1700
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1700
         * @tc.desc    Start remote Ability with 10 times.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1700", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1700 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1700";
            console.info(TAG + " dvList:" + dvList.length);
            let numDevices = dvList.length;
            if (numDevices === 0) {
                console.info(TAG + ' no device found');
                expect(numDevices === 0).assertFail();
            };
            let params;
            let wantValue = {
                bundleName: "com.ohos.dmstest",
                abilityName: "com.ohos.dmstest.MainAbility",
                deviceId: dvId,
                parameters: params
            };
            console.info(TAG + ' want=' + JSON.stringify(wantValue));
            for (let i = 0; i < 4; i++) {
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
                });
                await sleep(3000)
                console.log('SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1700 i is' + i);
            }
            await sleep(3000);
            done();
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_1700 end------------------------");
        });

        /**
         * @tc.number  SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0500
         * @tc.name    SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0500
         * @tc.desc    Start remote Ability.
         * @tc.level   0
         */
        it("SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0500", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL0, async function (done) {
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0500 start------------------------");
            let TAG = "SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0500";
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
            console.info("-----------------SUB_DMS_StandardOs_collaboration_Startability_StartRemoteAbility_0500 end------------------------");
        });
    })
}
