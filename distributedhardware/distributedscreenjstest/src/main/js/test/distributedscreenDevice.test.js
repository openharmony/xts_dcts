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
         * @tc.name    createDeviceManager()
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   0
         */
        it("SUB_DH_Device_Manager_Dcts_0100", 0, async function (done) {
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
        it("SUB_DH_Device_Manager_Dcts_0200", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0200 start------------------------");
            var discoverParam  = {
                "discoverTargetType":1
              };
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
         * @tc.level   0
         */
        it("SUB_DH_Device_Manager_Dcts_0300", 0, async function (done) {
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
         * @tc.name    getAvailableDeviceListSync().
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   0
         */
        it("SUB_DH_Device_Manager_Dcts_0400", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0400 start------------------------");
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
            console.info("-----------------SUB_DH_DeviceManager_Dcts_0400 end------------------------");
        })


         /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_0500
         * @tc.name   getAvailableDeviceList().
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   0
         */
        it("SUB_DH_Device_Manager_Dcts_0500", 0, async function (done) {
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
         * @tc.name    getAvailableDeviceList()
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   0
         */
        it("SUB_DH_Device_Manager_Dcts_0600", 0, async function (done) {
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
         it("SUB_DH_Device_Manager_Dcts_0700", 0, async function (done) {
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
                    expect(false).assertFail();
                    done();
                }
                
            } catch (err) {
                console.info("bindTarget errCode:" + err.code + ",errMessage:" + err.message);
                expect(err.code == 401).assertTrue();
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
         * @tc.level   0
         */
        it("SUB_DH_Device_Manager_Dcts_0800", 0, async function (done) {
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
         * @tc.level   0
         */
        it("SUB_DH_Device_Manager_Dcts_0900", 0, async function (done) {
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
         * @tc.level   0
         */
        it("SUB_DH_Device_Manager_Dcts_1000", 0, async function (done) {
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
         * @tc.level   0
         */
        it("SUB_DH_Device_Manager_Dcts_1100", 0, async function (done) {
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
         * @tc.level   0
         */
        it("SUB_DH_Device_Manager_Dcts_1200", 0, async function (done) {
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
         * @tc.name    Releases the {@code DeviceManager} instance that is no longer used.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   0
         */
        it("SUB_DH_Device_Manager_Dcts_1300", 0, async function (done) {
            console.info("-----------------SUB_DH_DeviceManager_Dcts_1300 start------------------------");
            try {
                if (deviceId !== null) {
                    dmInstance.unbindTarget(deviceId);
                    console.log("unbindTarget success");
                    expect(true).assertTrue();
                    done();
                } else {
                    console.log("unbindTarget deviceId is null");
                    expect(false).assertFail();
                    done();
                }
            } catch (err) {
                console.info("unbindTarget errCode:" + err.code + ",errMessage:" + err.message);
                expect(err.code == 401).assertTrue();
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
       it("SUB_DH_Device_Manager_Dcts_1400", 0, async function (done) {
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
        it("SUB_DH_Device_Manager_Dcts_1500", 0, async function (done) {
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
    })
}