/*
 * Copyright (C) 2022 Huawei Device Co., Ltd.
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
import deviceManager from '@ohos.distributedDeviceManager';
import featureAbility from "@ohos.ability.featureAbility";
import { UiDriver, BY } from '@ohos.UiTest';

export default function distributedDeviceManager() {

    describe('distributedDeviceManager', function () {
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
        
        beforeAll(async function (done) {
            console.info("beforeAll start");
            await getPermission();
            sleep(5000);
            await driveFn();
            sleep(5000);
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
        })

        afterAll(async function (done) {
            console.info('afterAll called');
            done();
        })

        let dmInstance = null;
        let dmNetworkId = null;
        let dmDeviceInfo = null;
        let deviceId = null;
        /*
        * @tc.number  SUB_DH_createDeviceManager_0001
        * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
        * use this instance to call other device management methods.
        * @tc.desc    Function test
        * @tc.level   0
        */
        it("SUB_DH_createDeviceManager_0001", 0, async function (done) {
            console.info("-----------------SUB_DH_createDeviceManager_0001 start------------------------");
            try {
                dmInstance = deviceManager.createDeviceManager("com.ohos.distributedscreenjstest");
                if (!dmInstance) { 
                    console.error("createDeviceManager errCode:" + err.code + ",errMessage:" + err.message);
                    expect(false).assertFail();
                    done();
                }
                console.info("createDeviceManager success");
                dmInstance.on('replyResult', (data) => console.log("replyResult on:" + JSON.stringify(data)));
                dmInstance.on('discoverSuccess', (data) => console.log("discoverSuccess on:" + JSON.stringify(data)));
                dmInstance.on('discoverFail', (data) => console.log("discoverFail on:" + JSON.stringify(data)));
                dmInstance.on('serviceDie', (data) => console.log("serviceDie on:" + JSON.stringify(data)));
                dmInstance.on('deviceNameChange', (data) => console.log("deviceNameChange on:" + JSON.stringify(data)));
                dmInstance.on('deviceStateChange', (data) => console.log("deviceStateChange on:" + JSON.stringify(data)));
                expect(dmInstance !== null).assertTrue();
                done();
            } catch(err) {
                console.error("createDeviceManager errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_createDeviceManager_0001 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_getLocalDeviceNetworkId_0003
         * @tc.name    Get the network id of the local device
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DH_getLocalDeviceNetworkId_0003", 0, async function (done) {
            console.info("-----------------SUB_DH_getLocalDeviceNetworkId_0003 start------------------------");
            try {
                dmNetworkId = dmInstance.getLocalDeviceNetworkId();
                if (dmNetworkId === null) {
                    console.error("getLocalDeviceNetworkId fail");
                }
                console.log("getLocalDeviceNetworkId dmNetworkId:" + dmNetworkId);
                expect(dmNetworkId !== null).assertTrue();
                done();
            } catch(err) {
                console.error("getLocalDeviceNetworkId errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getLocalDeviceNetworkId_0003 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_getAvailableDeviceListSync_0004
         * @tc.name    Get a list of available devices. This interface query all authorized and connectable devices.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DH_getAvailableDeviceListSync_0004", 0, async function (done) {
            console.info("-----------------SUB_DH_getAvailableDeviceListSync_0004 start------------------------");
            try {
                dmDeviceInfo = dmInstance.getAvailableDeviceListSync();
                if (dmDeviceInfo === null) {
                    console.log('getAvailableDeviceListSync info fail');
                }
                console.log('getAvailableDeviceListSync info:' + dmDeviceInfo);
                console.log('getAvailableDeviceListSync info:' + JSON.stringify(dmDeviceInfo[0]["deviceId"]));
                deviceId = JSON.stringify(dmDeviceInfo[0]["deviceId"]);
                console.log('getAvailableDeviceListSync info:' + deviceId);
                expect(dmDeviceInfo !== null).assertTrue();
                done();
            } catch (err) {
                console.error("getAvailableDeviceListSync errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getAvailableDeviceListSync_0004 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_getAvailableDeviceList_0005
         * @tc.name    Get a list of available devices. This interface query all authorized and connectable devices.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DH_getAvailableDeviceList_0005", 0, async function (done) {
            console.info("-----------------SUB_DH_getAvailableDeviceList_0005 start------------------------");
            try {
                dmInstance.getAvailableDeviceList((err, data) => {
                    if (err) {
                        console.error("getAvailableDeviceList errCode:" + err.code + ",errMessage:" + err.message);
                    }
                    console.log('getAvailableDeviceList info: ' + JSON.stringify(data));
                    expect(data !== null).assertTrue();
                    done();
                });
            } catch (err) {
                console.error("getAvailableDeviceList errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getAvailableDeviceList_0005 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_getAvailableDeviceList_0006
         * @tc.name    Get a list of available devices. This interface query all authorized and connectable devices.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DH_getAvailableDeviceList_0006", 0, async function (done) {
            console.info("-----------------SUB_DH_getAvailableDeviceList_0006 start------------------------");
            dmInstance.getAvailableDeviceList().then((data) => { 
                console.log('getAvailableDeviceList info: ' + JSON.stringify(data));
                expect(data !== null).assertTrue();
                done();
            }).catch((err) => {
                console.error("getAvailableDeviceList errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            })
            await sleep(1000);
            console.info("-----------------SUB_DH_getAvailableDeviceList_0006 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_getLocalDeviceName_0008
         * @tc.name    Get the device name of the local device.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DH_getLocalDeviceName_0008", 0, async function (done) {
            console.info("-----------------SUB_DH_getLocalDeviceName_0008 start------------------------");
            try {
                let lDeviceName = dmInstance.getLocalDeviceName();
                if (lDeviceName === null) {
                    console.log("getLocalDeviceName fail");
                }
                console.log("Get Local Device Name:" + lDeviceName);
                expect(lDeviceName !== null).assertTrue();
                done();
            } catch (err) {
                console.info("getLocalDeviceName errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getLocalDeviceName_0008 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_getLocalDeviceType_0009
         * @tc.name    Get the device type of the local device
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DH_getLocalDeviceType_0009", 0, async function (done) {
            console.info("-----------------SUB_DH_getLocalDeviceType_0009 start------------------------");
            try {
                let lDeviceType = dmInstance.getLocalDeviceType();
                if (lDeviceType === null) {
                    console.log("getLocalDeviceType fail");
                }
                console.log("get Local Device Type:" + lDeviceType);
                expect(lDeviceType !== null).assertTrue();
                done();
            } catch (err) {
                console.info("getLocalDeviceType errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getLocalDeviceType_0009 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_getLocalDeviceId_0010
         * @tc.name    Get the device id of the local device
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DH_getLocalDeviceId_0010", 0, async function (done) {
            console.info("-----------------SUB_DH_getLocalDeviceId_0010 start------------------------");
            try {
                let lDeviceId = dmInstance.getLocalDeviceId();
                if (lDeviceId === null) {
                    console.log("getLocalDeviceId fail");
                }
                console.log("get Local Device Id:" + lDeviceId);
                expect(lDeviceId !== null).assertTrue();
                done();
            } catch (err) {
                console.info("getLocalDeviceId errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getLocalDeviceId_0010 end------------------------");
        })

        /*
        * @tc.number  SUB_DH_getDeviceName_0011
        * @tc.name    Get the device name by network id.
        * @tc.desc    Function test
        * @tc.level   0
        */
        it("SUB_DH_getDeviceName_0011", 0, async function (done) {
            console.info("-----------------SUB_DH_getDeviceName_0011 start------------------------");
            try {
                let deviceName = dmInstance.getDeviceName(dmNetworkId);
                if (deviceName === null) {
                    console.log("getDeviceName fail");
                }
                console.log("get Device Name:" + deviceName);
                expect(deviceName !== null).assertTrue();
                done();
            } catch (err) {
                console.info("getDeviceName errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getDeviceName_0011 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_getDeviceType_0012
         * @tc.name    Get the device type by network id.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DH_getDeviceType_0012", 0, async function (done) {
            console.info("-----------------SUB_DH_getDeviceType_0012 start------------------------");
            try {
                let deviceType = dmInstance.getDeviceType(dmNetworkId);
                if (deviceType === null) {
                    console.log("getDeviceType fail");
                }
                console.log("get Device Type:" + deviceType);
                expect(deviceType !== null).assertTrue();
                done();
            } catch (err) {
                console.info("getDeviceType errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getDeviceType_0012 end------------------------");
        })
		
		/*
         * @tc.number  SUB_DH_releaseDeviceManager_0015
         * @tc.name    Releases the {@code DeviceManager} instance that is no longer used.
         * @tc.desc    Function test
         * @tc.level   0
        */
        it("SUB_DH_releaseDeviceManager_0015", 0, async function (done) {
            console.info("-----------------SUB_DH_releaseDeviceManager_0015 start------------------------");
            var mFilterOption = {
                targetPkgName: "com.ohos.distributedscreenjstest",
                sortType: 0,
                filter: JSON.stringify({
                    key: 'test',
                    value: 0
                })
            }
            try {
                dmInstance.off('replyResult');
                dmInstance.off('discoverSuccess');
                dmInstance.off('discoverFail');
                dmInstance.off('serviceDie');
                dmInstance.off('deviceStateChange');
				dmInstance.off('deviceNameChange');
                deviceManager.releaseDeviceManager(dmInstance);
                console.log("releaseDeviceManager success");
                expect(true).assertTrue();
                done();
            } catch (err) {
                console.info("releaseDeviceManager errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_releaseDeviceManager_0015 end------------------------");
        })
    })
}