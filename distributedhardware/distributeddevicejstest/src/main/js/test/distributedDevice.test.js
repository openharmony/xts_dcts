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
        * @tc.number  SUB_DH_DeviceManager_Dcts_0100
        * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
        * use this instance to call other device management methods.
        * @tc.desc    Function test
        * @tc.size    MediumTest
        * @tc.type:   Function
        * @tc.level   Level1
        */
        it("SUB_DH_DeviceManager_Dcts_0100", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0100 start------------------------");
            try {
                dmInstance = deviceManager.createDeviceManager("com.ohos.distributedscreenjstest");
                if (!dmInstance) { 
                    console.error("createDeviceManager errCode:" + err.code + ",errMessage:" + err.message);
                    expect(false).assertFail();
                    done();
                }
                console.info("createDeviceManager success");
                dmInstance.on('replyResult', (data) => console.log("replyResult on:" + JSON.stringify(data)));
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
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0100 end------------------------");
        })
        
        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_0200
         * @tc.name    Start to discover nearby devices.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_0200", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0200 start------------------------");
            var discoverParam  = {
                "discoverTargetType":1
              };
            let data = null;
            try {
                dmInstance.on('discoverSuccess', (data) => {
                    console.info("discoverSuccess:" + JSON.stringify(data));
                });

                dmInstance.startDiscovering(discoverParam);
                console.log("startDiscovering success");
                expect(true).assertTrue();
                done();
            } catch(err) {
                console.error("startDiscovering errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0200 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_0300
         * @tc.name    Get the network id of the local device
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_0300", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0300 start------------------------");
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
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0300 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_0400
         * @tc.name    Get a list of available devices. This interface query all authorized and connectable devices.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_0400", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0400 start------------------------");
            try {
                dmDeviceInfo = dmInstance.getAvailableDeviceListSync();
                if (dmDeviceInfo === null) {
                    console.log('getAvailableDeviceListSync info fail');
                }
                console.log('getAvailableDeviceListSync info:' + dmDeviceInfo);
                console.log('getAvailableDeviceListSync info:' + JSON.stringify(dmDeviceInfo[0]["deviceId"]));
                expect(dmDeviceInfo !== null).assertTrue();
                done();
            } catch (err) {
                console.error("getAvailableDeviceListSync errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0400 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_0500
         * @tc.name    Get a list of available devices. This interface query all authorized and connectable devices.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_0500", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0500 start------------------------");
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
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0500 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_0600
         * @tc.name    Get a list of available devices. This interface query all authorized and connectable devices.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_0600", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0600 start------------------------");
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
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0600 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_0700
         * @tc.name    Get the device name of the local device.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_0700", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0700 start------------------------");
            let bindParam = {
                "bindType" : 1,
                "targetPkgName" : "com.ohos.distributedDeviceManager",
                "appName" : "SubDctsdisDeviceJsTest",
                "appOperation": "想要连接本机。",
                "customDescription": "device manager"
            };
            try {
                if (deviceId !== null) {
                    dmInstance.bindTarget(deviceId, bindParam, (err, data) => {
                    if (err) {
                        console.info("bindTarget fail errCode:" + err.code + ",errMessage:" + err.message);
                    }
                    console.log("bindTarget:" + JSON.stringify(data));
                    expect(data != null).assertTrue();
                    done();
                    })
                } else {
                    console.log("bindTarget deviceId is null");
                    expect(true).assertTrue();
                    done();
                }
                
            } catch (err) {
                console.info("bindTarget errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0700 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_0800
         * @tc.name    Get the device name of the local device.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_0800", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0800 start------------------------");
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
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0800 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_0900
         * @tc.name    Get the device type of the local device
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_0900", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0900 start------------------------");
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
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0900 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_1000
         * @tc.name    Get the device id of the local device
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_1000", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1000 start------------------------");
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
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1000 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_1100
         * @tc.name    Get the device name by network id.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_1100", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1100 start------------------------");
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
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1100 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_1200
         * @tc.name    Get the device type by network id.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_1200", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1200 start------------------------");
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
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1200 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_1300
         * @tc.name    Unbind the specified target.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
       it("SUB_DH_DeviceManager_Dcts_1300", 0, async function (done) {
        console.info("-----------------SUB_DH_DeviceManager_Dcts_1300 start------------------------");
        try {
            if (deviceId !== null) {
                dmInstance.unbindTarget(deviceId);
                console.log("unbindTarget success");
                expect(true).assertTrue();
                done();
            } else {
                console.log("unbindTarget deviceId is null");
                expect(true).assertTrue();
                done();
            }
        } catch (err) {
            console.info("unbindTarget errCode:" + err.code + ",errMessage:" + err.message);
            expect(false).assertFail();
            done();
        }
        await sleep(1000);
        console.info("-----------------SUB_DH_DeviceManager_Dcts_1300 end------------------------");
        })

       /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_1400
         * @tc.name    Stop discovering nearby devices.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
       it("SUB_DH_DeviceManager_Dcts_1400", 0, async function (done) {
        console.info("-----------------SUB_DH_DeviceManager_Dcts_1400 start------------------------");
        try {
            dmInstance.stopDiscovering();
            console.log("stopDiscovering success");
            expect(true).assertTrue();
            done();
        } catch (err) {
            console.info("stopDiscovering errCode:" + err.code + ",errMessage:" + err.message);
            expect(false).assertFail();
            done();
        }
        await sleep(1000);
        console.info("-----------------SUB_DH_DeviceManager_Dcts_1400 end------------------------");
        })
		
        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_1500
         * @tc.name    Releases the {@code DeviceManager} instance that is no longer used.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_1500", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1500 start------------------------");
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
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1500 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_1600
         * @tc.name    Releases the {@code DeviceManager} instance that is no longer used.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_1600", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1600 start------------------------");
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
                expect(err.code == 11600101).assertTrue();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1600 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_1700
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_1700", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1700 start------------------------");
            let deviceInfoList = null;
            try {
                dmInstance = deviceManager.createDeviceManager("com.ohos.distributedscreenjstest");
                if (!dmInstance) { 
                    console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_1700 fail");
                }
                console.info("createDeviceManager SUB_DH_DeviceManager_Dcts_1700 success");

                try {
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_1700 releaseDeviceManager success");
                    deviceInfoList = dmInstance.getAvailableDeviceListSync();
                    if (!deviceInfoList) { 
                        console.log("getAvailableDeviceListSync three errCode:" + err.code + ",errMessage:" + err.message);
                    }
                    expect(deviceInfoList != null).assertTrue();
                    done();
                } catch (err) {
                    console.log("getAvailableDeviceListSync SUB_DH_DeviceManager_Dcts_1700 errCode:" + err.code + ",errMessage:" + err.message);
                    expect(err.code == 11600101).assertTrue();
                    done();
                }  
            } catch(err) {
                console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_1700 four errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1700 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_1800
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_1800", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1800 start------------------------");
            let deviceInfoList = null;
            try {
                dmInstance = deviceManager.createDeviceManager("com.ohos.distributedscreenjstest");
                if (!dmInstance) { 
                    console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_1800 fail");
                }
                console.info("createDeviceManager SUB_DH_DeviceManager_Dcts_1800 success");

                try {
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_1800 releaseDeviceManager success");
                    dmInstance.getAvailableDeviceList((err, data) => {
                    if (err) {
                        console.log("getAvailableDeviceList errCode:" + err.code + ",errMessage:" + err.message);
                    }
                        console.log('getAvailableDeviceList info: ' + JSON.stringify(data));
                        expect(data !== null).assertTrue();
                        done();
                    });
                } catch (err) {
                    console.log("getAvailableDeviceList SUB_DH_DeviceManager_Dcts_1800 errCode:" + err.code + ",errMessage:" + err.message);
                    expect(err.code == 11600101).assertTrue();
                    done();
                }  
            } catch(err) {
                console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_1800 four errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1800 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_1900
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_1900", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1900 start------------------------");
            let deviceInfoList = null;
            try {
                dmInstance = deviceManager.createDeviceManager("com.ohos.distributedscreenjstest");
                if (!dmInstance) { 
                    console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_1900 fail");
                }
                console.info("createDeviceManager SUB_DH_DeviceManager_Dcts_1900 success");
               
                deviceManager.releaseDeviceManager(dmInstance);
                console.info("SUB_DH_DeviceManager_Dcts_1900 releaseDeviceManager success");
                dmInstance.getAvailableDeviceList().then((data) => { 
                    console.log('getAvailableDeviceList SUB_DH_DeviceManager_Dcts_1900 info: ' + JSON.stringify(data));
                    expect(data !== null).assertTrue();
                    done();
                }).catch((err) => {
                    console.log("getAvailableDeviceList SUB_DH_DeviceManager_Dcts_1900 errCode:" + err.code + ",errMessage:" + err.message);
                    expect(err.code == 11600101).assertTrue();
                    done();
                })
            } catch(err) {
                console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_1900 four errCode:" + err.code + ",errMessage:" + err.message);
                expect(err.code == 11600101).assertTrue();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1900 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_2000
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_2000", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2000 start------------------------");
            let deviceNetworkId = null;
            try {
                dmInstance = deviceManager.createDeviceManager("com.ohos.distributedscreenjstest");
                if (!dmInstance) { 
                    console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2000 fail");
                }
                console.info("createDeviceManager SUB_DH_DeviceManager_Dcts_2000 success");

                try {
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_2000 releaseDeviceManager success");
                    
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_2000 releaseDeviceManager success");
                    console.log('local device networkId succes');
                    deviceNetworkId = dmInstance.getLocalDeviceNetworkId();
                    if (!deviceNetworkId) { 
                        console.log("getLocalDeviceNetworkId three errCode:" + err.code + ",errMessage:" + err.message);
                    }
                    console.log('local device networkId: ' + JSON.stringify(deviceNetworkId));
                    expect(deviceNetworkId != null).assertTrue();
                    done();
                } catch (err) {
                    console.log("getLocalDeviceNetworkId SUB_DH_DeviceManager_Dcts_2000 errCode:" + err.code + ",errMessage:" + err.message);
                    expect(err.code == 11600101).assertTrue();
                    done();
                }
            } catch(err) {
                console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2000 four errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2000 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_2100
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_2100", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2100 start------------------------");
            let deviceName = null;
            try {
                dmInstance = deviceManager.createDeviceManager("com.ohos.distributedscreenjstest");
                if (!dmInstance) { 
                    console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2100 fail");
                }
                console.info("createDeviceManager SUB_DH_DeviceManager_Dcts_2100 success");

                try {
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_2100 releaseDeviceManager success");
                    
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_2100 releaseDeviceManager success");
                    deviceName = dmInstance.getLocalDeviceName();
                    if (!deviceName) { 
                        console.log("getLocalDeviceName three errCode:" + err.code + ",errMessage:" + err.message);
                    }
                    expect(deviceName != null).assertTrue();
                    done();
                } catch (err) {
                    console.log("getLocalDeviceName SUB_DH_DeviceManager_Dcts_2100 errCode:" + err.code + ",errMessage:" + err.message);
                    expect(err.code == 11600101).assertTrue();
                    done();
                }
            } catch(err) {
                console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2100 four errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2100 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_2200
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_2200", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2200 start------------------------");
            let deviceType = null;
            try {
                dmInstance = deviceManager.createDeviceManager("com.ohos.distributedscreenjstest");
                if (!dmInstance) { 
                    console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2200 fail");
                }
                console.info("createDeviceManager SUB_DH_DeviceManager_Dcts_2200 success");

                try {
                   deviceManager.releaseDeviceManager(dmInstance);
                   console.info("SUB_DH_DeviceManager_Dcts_2200 releaseDeviceManager success");
                  
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_2200 releaseDeviceManager success");
                    deviceType = dmInstance.getLocalDeviceType();
                    if (!deviceType) { 
                        console.log("getLocalDeviceType three errCode:" + err.code + ",errMessage:" + err.message);
                    }
                    expect(deviceType != null).assertTrue();
                    done();
                } catch (err) {
                    console.log("getLocalDeviceType SUB_DH_DeviceManager_Dcts_2200 errCode:" + err.code + ",errMessage:" + err.message);
                    expect(err.code == 11600101).assertTrue();
                    done();
                }
            } catch(err) {
                console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2200 four errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2200 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_2300
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_2300", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2300 start------------------------");
            let deviceId = null;
            try {
                dmInstance = deviceManager.createDeviceManager("com.ohos.distributedscreenjstest");
                if (!dmInstance) { 
                    console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2300 fail");
                }
                console.info("createDeviceManager SUB_DH_DeviceManager_Dcts_2300 success");

                try {
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_2300 releaseDeviceManager success");
                    
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_2300 releaseDeviceManager success");
                    deviceId = dmInstance.getLocalDeviceId();
                    if (!deviceId) { 
                        console.log("getLocalDeviceId three errCode:" + err.code + ",errMessage:" + err.message);
                    }
                    expect(deviceId != null).assertTrue();
                    done();
                } catch (err) {
                    console.log("getLocalDeviceId SUB_DH_DeviceManager_Dcts_2300 errCode:" + err.code + ",errMessage:" + err.message);
                    expect(err.code == 11600101).assertTrue();
                    done();
                }  
            } catch(err) {
                console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2300 four errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2300 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_2400
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_2400", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2400 start------------------------");
            let deviceName = null;
            try {
                dmInstance = deviceManager.createDeviceManager("com.ohos.distributedscreenjstest");
                if (!dmInstance) { 
                    console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2400 fail");
                }
                console.info("createDeviceManager SUB_DH_DeviceManager_Dcts_2400 success");

                try {
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_2400 releaseDeviceManager success");
                    deviceName = dmInstance.getDeviceName(dmNetworkId);
                    if (!deviceName) { 
                        console.log("getDeviceName three errCode:" + err.code + ",errMessage:" + err.message);
                    }
                    expect(deviceName != null).assertTrue();
                    done();
                } catch (err) {
                    console.log("getDeviceName SUB_DH_DeviceManager_Dcts_2400 errCode:" + err.code + ",errMessage:" + err.message);
                    expect(err.code == 11600101).assertTrue();
                    done();
                }  
            } catch(err) {
                console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2400 four errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2400 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_2500
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_2500", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2500 start------------------------");
            let deviceType = null;
            try {
                dmInstance = deviceManager.createDeviceManager("com.ohos.distributedscreenjstest");
                if (!dmInstance) { 
                    console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2500 fail");
                }
                console.info("createDeviceManager SUB_DH_DeviceManager_Dcts_2500 success");

                try {
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_2500 releaseDeviceManager success");
                    deviceType = dmInstance.getDeviceType(dmNetworkId);
                    if (!deviceType) { 
                        console.log("getDeviceType three errCode:" + err.code + ",errMessage:" + err.message);
                    }
                    expect(deviceType != null).assertTrue();
                    done();
                } catch (err) {
                    console.log("getDeviceType SUB_DH_DeviceManager_Dcts_2500 errCode:" + err.code + ",errMessage:" + err.message);
                    expect(err.code == 11600101).assertTrue();
                    done();
                }   
            } catch(err) {
                console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2500 four errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2500 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_2600
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_2600", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2600 start------------------------");
            let deviceType = null;
            try {
                dmInstance = deviceManager.createDeviceManager("com.ohos.distributedscreenjstest");
                if (!dmInstance) { 
                    console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2600 fail");
                }
                console.info("createDeviceManager SUB_DH_DeviceManager_Dcts_2600 success");
                var discoverParam  = {
                    "discoverTargetType":1
                  };
                try {
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_2600 releaseDeviceManager success");
                    dmInstance.startDiscovering(discoverParam);
                    expect(true).assertTrue();
                    done();
                } catch (err) {
                    console.log("startDiscovering SUB_DH_DeviceManager_Dcts_2600 errCode:" + err.code + ",errMessage:" + err.message);
                    expect(err.code == 11600101).assertTrue();
                    done();
                }   
            } catch(err) {
                console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2600 four errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2600 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_2700
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_2700", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2700 start------------------------");
            let deviceType = null;
            try {
                dmInstance = deviceManager.createDeviceManager("com.ohos.distributedscreenjstest");
                if (!dmInstance) { 
                    console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2700 fail");
                }
                console.info("createDeviceManager SUB_DH_DeviceManager_Dcts_2700 success");

                let bindParam = {
                    "bindType" : 1,
                    "targetPkgName" : "com.ohos.distributedDeviceManager",
                    "appName" : "SubDctsdisDeviceJsTest",
                    "appOperation": "想要连接本机。",
                    "customDescription": "device manager"
                };

                try {
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_2700 releaseDeviceManager success");
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_2700 releaseDeviceManager success");
                    dmInstance.bindTarget(deviceId, bindParam, (err, data) => {
                        if (err) {
                            console.info("bindTarget fail");
                        }
                        console.info("bindTarget result:" + JSON.stringify(data));
                        expect(data != null).assertTrue();
                        done();
                    }); 
                } catch (err) {
                    console.log("bindTarget SUB_DH_DeviceManager_Dcts_2700 errCode:" + err.code + ",errMessage:" + err.message);
                    expect(err.code == 11600101).assertTrue();
                    done();
                }
            } catch(err) {
                console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2700 four errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2700 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_2800
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_2800", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2800 start------------------------");
            let deviceType = null;
            try {
                dmInstance = deviceManager.createDeviceManager("com.ohos.distributedscreenjstest");
                if (!dmInstance) { 
                    console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2800 fail");
                }
                console.info("createDeviceManager SUB_DH_DeviceManager_Dcts_2800 success");

                try {
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_2800 releaseDeviceManager success");
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_2800 releaseDeviceManager success");
                    dmInstance.unbindTarget(deviceId);
                    expect(true).assertTrue();
                    done();
                } catch (err) {
                    console.log("unbindTarget SUB_DH_DeviceManager_Dcts_2800 errCode:" + err.code + ",errMessage:" + err.message);
                    expect(err.code == 11600101).assertTrue();
                    done();
                }
            } catch(err) {
                console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2800 four errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2800 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_2900
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_DeviceManager_Dcts_2900", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2900 start------------------------");
            let deviceType = null;
            try {
                dmInstance = deviceManager.createDeviceManager("com.ohos.distributedscreenjstest");
                if (!dmInstance) { 
                    console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2900 fail");
                }
                console.info("createDeviceManager SUB_DH_DeviceManager_Dcts_2900 success");

                try {
                    let operation = 0;
                    deviceManager.releaseDeviceManager(dmInstance);
                    console.info("SUB_DH_DeviceManager_Dcts_2900 releaseDeviceManager success");
                    dmInstance.replyUiAction(operation, "extra")
                    expect(true).assertTrue();
                    done();
                } catch (err) {
                    console.log("replyUiAction SUB_DH_DeviceManager_Dcts_2900 errCode:" + err.code + ",errMessage:" + err.message);
                    expect(err.code == 11600101).assertTrue();
                    done();
                }
                
            } catch(err) {
                console.log("createDeviceManager SUB_DH_DeviceManager_Dcts_2900 four errCode:" + err.code + ",errMessage:" + err.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_DeviceManager_Dcts_2900 end------------------------");
        })
    })
}