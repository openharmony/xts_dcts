/*
 * Copyright (C) 2024 Huawei Device Co., Ltd.
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

export default function distributedDeviceManager() {

    describe('distributedDeviceManager', function () {
        const TEST_BUNDLE_NAME = 'com.ohos.distributedjstest';

        let dmInstance = null;

        beforeAll(async function (done) {
            console.info(('beforeAll called'));
            done();
        })

        beforeEach(async function (done) {
            console.info(('beforeEach called'));
            done();
        })

        afterEach(async function (done) {
            console.info('afterEach called');
            setTimeout(done, 4000);
            done();
        })

        afterAll(async function (done) {
            console.info('afterAll called');
            done();
        })

        /*
        * @tc.number  SUB_DH_Device_Dcts_0100
        * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
        * use this instance to call other device management methods.
        * @tc.desc    Function test
        * @tc.size    MediumTest
        * @tc.type:   Function
        * @tc.level   Level1
        */
        it("SUB_DH_Device_Dcts_0100", 0, async function (done) {
            console.info("-----------------SUB_DH_Device_Dcts_0100 start------------------------");
            
            dmInstance = deviceManager.createDeviceManager(TEST_BUNDLE_NAME);
            if (!dmInstance) { 
                console.error("createDeviceManager errCode:" + err.code + ",errMessage:" + err.message);
                expect().assertFail();
                done();
            }
            console.info("createDeviceManager success");
            expect(dmInstance !== null).assertTrue();
            done();
            console.info("-----------------SUB_DH_Device_Dcts_0100 end------------------------");
        })

       /*
        * @tc.number  SUB_DH_Device_Dcts_0200
        * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
        * use this instance to call other device management methods.
        * @tc.desc    Function test
        * @tc.size    MediumTest
        * @tc.type:   Function
        * @tc.level   Level1
        */
        it("SUB_DH_Device_Dcts_0200", 0, async function (done) {
            console.info("----------------------SUB_DH_Device_Dcts_0200 begin---------------------------");
            try {
                dmInstance.on("serviceDie", (data) => {
                console.error("in SUB_DH_Device_Dcts_0200 deviceManager.on success without permission , data:" + JSON.stringify(data));
                expect().assertFail();
                done();
                });
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_0200 deviceManager.on failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("-----------------SUB_DH_Device_Dcts_0200 end------------------------");
        })
        
        /*
         * @tc.number  SUB_DH_Device_Dcts_0300
         * @tc.name    Start to discover nearby devices.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_0300", 0, async function (done) {
            console.info("----------------------SUB_DH_Device_Dcts_0300 begin---------------------------");
            try {
                dmInstance.on("discoverFailure", (data) => {
                console.error("in SUB_DH_Device_Dcts_0300 deviceManager.on success without permission , data:" + JSON.stringify(data));
                expect().assertFail();
                done();
                });
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_0300 deviceManager.on failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("-----------------SUB_DH_Device_Dcts_0300 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_DeviceManager_Dcts_0300
         * @tc.name    Get the network id of the local device
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_0400", 0, async function (done) {
            console.info("----------------------SUB_DH_Device_Dcts_0400 begin---------------------------");
            try {
                dmInstance.on("deviceNameChange", (data) => {
                console.error("in SUB_DH_Device_Dcts_0400 deviceManager.on success without permission , data:" + JSON.stringify(data));
                expect().assertFail();
                done();
                });
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_0400 deviceManager.on failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("----------------------SUB_DH_Device_Dcts_0400 end---------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_0500
         * @tc.name    Get a list of available devices. This interface query all authorized and connectable devices.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_0500", 0, async function (done) {
            console.info("----------------------SUB_DH_Device_Dcts_0500 begin---------------------------");
            try {
                dmInstance.on("discoverSuccess", (data) => {
                console.error("in SUB_DH_Device_Dcts_0500 deviceManager.on success without permission , data:" + JSON.stringify(data));
                expect().assertFail();
                done();
                });
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_0500 deviceManager.on failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("----------------------SUB_DH_Device_Dcts_0500 end---------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_0600
         * @tc.name    Get a list of available devices. This interface query all authorized and connectable devices.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_0600", 0, async function (done) {
            console.info("----------------------SUB_DH_Device_Dcts_0600 begin---------------------------");
            try {
                dmInstance.on("deviceStateChange", (data) => {
                console.error("in SUB_DH_Device_Dcts_0600 deviceManager.on success without permission , data:" + JSON.stringify(data));
                expect().assertFail();
                done();
                });
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_0600 deviceManager.on failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("----------------------SUB_DH_Device_Dcts_0600 end---------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_0700
         * @tc.name    Get a list of available devices. This interface query all authorized and connectable devices.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_0700", 0, async function (done) {
            console.info("----------------------SUB_DH_Device_Dcts_0700 begin---------------------------");
            try {
                dmInstance.off("serviceDie", (data) => {
                console.error("in SUB_DH_Device_Dcts_0700 deviceManager.off success without permission , data:" + JSON.stringify(data));
                expect().assertFail();
                done();
                });
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_0700 deviceManager.off failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("----------------------SUB_DH_Device_Dcts_0700 end---------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_0800
         * @tc.name    Get the device name of the local device.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_0800", 0, async function (done) {
            console.info("----------------------SUB_DH_Device_Dcts_0800 begin---------------------------");
            try {
                dmInstance.off("discoverFailure", (data) => {
                console.error("in SUB_DH_Device_Dcts_0800 deviceManager.off success without permission , data:" + JSON.stringify(data));
                expect().assertFail();
                done();
                });
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_0800 deviceManager.off failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("----------------------SUB_DH_Device_Dcts_0800 end---------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_0900
         * @tc.name    Get the device name of the local device.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_0900", 0, async function (done) {
            console.info("----------------------SUB_DH_Device_Dcts_0900 begin---------------------------");
            try {
                dmInstance.off("deviceNameChange", (data) => {
                console.error("in SUB_DH_Device_Dcts_0900 deviceManager.off success without permission , data:" + JSON.stringify(data));
                expect().assertFail();
                done();
                });
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_0900 deviceManager.off failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("----------------------SUB_DH_Device_Dcts_0900 end---------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_1000
         * @tc.name    Get the device type of the local device
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_1000", 0, async function (done) {
            console.info("----------------------SUB_DH_Device_Dcts_1000 begin---------------------------");
            try {
                dmInstance.off("discoverSuccess", (data) => {
                console.error("in SUB_DH_Device_Dcts_1000 deviceManager.off success without permission , data:" + JSON.stringify(data));
                expect().assertFail();
                done();
                });
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_1000 deviceManager.off failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("----------------------SUB_DH_Device_Dcts_1000 end---------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_1100
         * @tc.name    Get the device id of the local device
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_1100", 0, async function (done) {
            console.info("----------------------SUB_DH_Device_Dcts_1100 begin---------------------------");
            try {
                dmInstance.off("deviceStateChange", (data) => {
                console.error("in SUB_DH_Device_Dcts_1100 deviceManager.off success without permission , data:" + JSON.stringify(data));
                expect().assertFail();
                done();
                });
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_1100 deviceManager.off failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("----------------------SUB_DH_Device_Dcts_1100 end---------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_1200
         * @tc.name    Get the device name by network id.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_1200", 0, async function (done) {
            console.info("-----------------SUB_DH_Device_Dcts_1200 start------------------------");
            try {
                dmInstance.getAvailableDeviceList();
                console.error("in SUB_DH_Device_Dcts_1200 success without permission ");
                expect().assertFail();
                done();
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_1200 failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("-----------------SUB_DH_Device_Dcts_1200 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_1300
         * @tc.name    Get the device type by network id.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_1300", 0, async function (done) {
            console.info("-----------------SUB_DH_Device_Dcts_1300 start------------------------");
            try {
                dmInstance.getAvailableDeviceList((error, data) => {
                console.info("in SUB_DH_Device_Dcts_1300 success without permission");
                expect().assertFail();
                done();
                });
            } catch (error) {
                console.info("in SUB_DH_Device_Dcts_1300 failed, code is ${error.code}, message is ${error.message}");
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("-----------------SUB_DH_Device_Dcts_1300 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_1400
         * @tc.name    Unbind the specified target.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
       it("SUB_DH_Device_Dcts_1400", 0, async function (done) {
            console.info("-----------------SUB_DH_Device_Dcts_1400 start------------------------");
            try {
                dmInstance.bindTarget("deviceId", {
                "bindType" : 1,
                "targetPkgName" : "com.ohos.distributedDeviceManager",
                "appName" : "SubDctsDeviceJsTest",
                "appOperation": "想要连接本机。",
                "customDescription": "device manager"
                }, (error, data) => {
                if (error) {
                    console.info("in SUB_DH_Device_Dcts_1400 failed, code is ${error.code}, message is ${error.message}");
                    expect(error.code == 201).assertTrue();
                    done();
                } else {
                    console.error("in SUB_DH_Device_Dcts_1400 success without permission, data:" + JSON.stringify(data));
                    expect().assertFail();
                    done();
                }
                });
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_1400 failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("-----------------SUB_DH_Device_Dcts_1400 end------------------------");
        })

       /*
         * @tc.number  SUB_DH_Device_Dcts_1500
         * @tc.name    Stop discovering nearby devices.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
       it("SUB_DH_Device_Dcts_1500", 0, async function (done) {
            console.info("-----------------SUB_DH_Device_Dcts_1500 start------------------------");
            try {
                dmInstance.unbindTarget("deviceId");
                console.error("in SUB_DH_Device_Dcts_1500 success without permission ");
                expect().assertFail();
                done();
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_1500 failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("-----------------SUB_DH_Device_Dcts_1500 end------------------------");
        })
		
        /*
         * @tc.number  SUB_DH_Device_Dcts_1600
         * @tc.name    Releases the {@code DeviceManager} instance that is no longer used.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_1600", 0, async function (done) {
            console.info("-----------------SUB_DH_Device_Dcts_1600 start------------------------");
            try {
                dmInstance.startDiscovering({"discoverTargetType":1});
                console.error("in SUB_DH_Device_Dcts_1600 success without permission ");
                expect().assertFail();
                done();
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_1600 failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("-----------------SUB_DH_Device_Dcts_1600 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_1700
         * @tc.name    Releases the {@code DeviceManager} instance that is no longer used.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_1700", 0, async function (done) {
            console.info("-----------------SUB_DH_Device_Dcts_1700 start------------------------");
            try {
                dmInstance.stopDiscovering();
                console.error("in SUB_DH_Device_Dcts_1700 success without permission ");
                expect().assertFail();
                done();
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_1700 failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("-----------------SUB_DH_Device_Dcts_1700 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_1800
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_1800", 0, async function (done) {
            console.info("-----------------SUB_DH_Device_Dcts_1800 start------------------------");
            try {
                dmInstance.getAvailableDeviceListSync();
                console.error("in SUB_DH_Device_Dcts_1800 success without permission ");
                expect().assertFail();
                done();
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_1800 failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("-----------------SUB_DH_Device_Dcts_1800 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_1900
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_1900", 0, async function (done) {
            console.info("-----------------SUB_DH_Device_Dcts_1900 start------------------------");
            try {
                dmInstance.getLocalDeviceType();
                console.error("in SUB_DH_Device_Dcts_1900 success without permission ");
                expect().assertFail();
                done();
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_1900 failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("-----------------SUB_DH_Device_Dcts_1900 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_2000
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_2000", 0, async function (done) {
            console.info("-----------------SUB_DH_Device_Dcts_2000 start------------------------");
            try {
                dmInstance.getLocalDeviceName();
                console.error("in SUB_DH_Device_Dcts_2000 success without permission ");
                expect().assertFail();
                done();
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_2000 failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("-----------------SUB_DH_Device_Dcts_2000 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_2100
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_2100", 0, async function (done) {
            console.info("-----------------SUB_DH_Device_Dcts_2100 start------------------------");
            try {
                dmInstance.getLocalDeviceNetworkId();
                console.error("in SUB_DH_Device_Dcts_2100 success without permission ");
                expect().assertFail();
                done();
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_2100 failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("-----------------SUB_DH_Device_Dcts_2100 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_2200
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this instance to call other device management methods.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_2200", 0, async function (done) {
            console.info("-----------------SUB_DH_Device_Dcts_2200 start------------------------");
            try {
                dmInstance.getLocalDeviceId();
                console.error("in SUB_DH_Device_Dcts_2200 success without permission ");
                expect().assertFail();
                done();
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_2200 failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("-----------------SUB_DH_Device_Dcts_2200 end------------------------");
        })

        /*
        * @tc.number  SUB_DH_Device_Dcts_2300
        * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
        * use this instance to call other device management methods.
        * @tc.desc    Function test
        * @tc.size    MediumTest
        * @tc.type:   Function
        * @tc.level   Level1
        */
        it("SUB_DH_Device_Dcts_2300", 0, async function (done) {
            console.info("----------------------SUB_DH_Device_Dcts_2300 begin---------------------------");
            try {
                dmInstance.on("replyResult", (data) => {
                console.error("in SUB_DH_Device_Dcts_2300 replyResult.on success without permission , data:" + JSON.stringify(data));
                expect().assertFail();
                done();
                });
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_2300 replyResult.on failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("-----------------SUB_DH_Device_Dcts_2300 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_2400
         * @tc.name    Get the device name of the local device.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_2400", 0, async function (done) {
            console.info("----------------------SUB_DH_Device_Dcts_2400 begin---------------------------");
            try {
                dmInstance.off("replyResult", (data) => {
                console.error("in SUB_DH_Device_Dcts_2400 replyResult.off success without permission , data:" + JSON.stringify(data));
                expect().assertFail();
                done();
                });
            } catch (error) {
                console.info(`in SUB_DH_Device_Dcts_2400 replyResult.off failed, code is ${error.code}, message is ${error.message}`);
                expect(error.code == 201).assertTrue();
                done();
            }
            console.info("----------------------SUB_DH_Device_Dcts_2400 end---------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_2500
         * @tc.name    Get the device name of the local device.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_2500", 0, async function (done) {
            console.info("----------------------SUB_DH_Device_Dcts_2500 begin---------------------------");
            try {
                // 设备网络标识，可以从可信设备列表中获取
                let dmNetworkId = '123456789';
                let deviceName = dmInstance.getDeviceName(dmNetworkId);
                console.log('SUB_DH_Device_Dcts_2500 device name: ' + JSON.stringify(deviceName)); 
                expect(deviceName == null).assertFail();
                done();
              } catch (err) {
                console.info('SUB_DH_Device_Dcts_2500 getDeviceName errCode:' + err.code + ',errMessage:' + err.message);
                expect(err.code == 201).assertTrue();
                done();
              }
            console.info("----------------------SUB_DH_Device_Dcts_2500 end---------------------------");
        })

        /*
         * @tc.number  SUB_DH_Device_Dcts_2600
         * @tc.name    Get the device name of the local device.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_Device_Dcts_2600", 0, async function (done) {
            console.info("----------------------SUB_DH_Device_Dcts_2600 begin---------------------------");
            try {
                let dmNetworkIdType = '123456789';
                let deviceType = dmInstance.getDeviceType(dmNetworkIdType);
                console.log('SUB_DH_Device_Dcts_2600 device name: ' + JSON.stringify(deviceType)); 
                expect(deviceType == null).assertFail();
                done();
              } catch (err) {
                console.info('SUB_DH_Device_Dcts_2500 getDeviceName errCode:' + err.code + ',errMessage:' + err.message);
                expect(err.code == 201).assertTrue();
                done();
              }
            console.info("----------------------SUB_DH_Device_Dcts_2600 end---------------------------");
        })
    })
}