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
import deviceManager from '@ohos.distributedDeviceManager';

export default function distributedScreen() {

    describe('distributedScreen', function () {

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        beforeAll(async function (done) {
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

        let dmInstance = nullptr;
        let dmNetworkId = nullptr;
        let dmDeviceInfo = nullptr;
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
                if (err) { 
                    console.error("createDeviceManager errCode:" + err.code + ",errMessage:" + err.message);
                }
                console.info("createDeviceManager success");
                dmInstance.on('replyResult', (data) => console.log("replyResult on:" + JSON.stringify(data)));
                dmInstance.on('discoverSuccess', (data) => console.log("discoverSuccess on:" + JSON.stringify(data)));
                dmInstance.on('discoverFail', (data) => console.log("discoverFail on:" + JSON.stringify(data)));
                dmInstance.on('serviceDie', (data) => console.log("serviceDie on:" + JSON.stringify(data)));
                dmInstance.on('deviceNameChange', (data) => console.log("deviceNameChange on:" + JSON.stringify(data)));
                dmInstance.on('deviceStateChange', (data) => console.log("deviceStateChange on:" + JSON.stringify(data)));
                expect(dmInstance != NUll).assertTrue();
                done();
            } catch(err) {
                console.error("createDeviceManager errCode:" + err.code + ",errMessage:" + err.message);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_createDeviceManager_0001 end------------------------");
        });

         /*
         * @tc.number  SUB_DH_startDiscovering_0002
         * @tc.name    Start to discover nearby devices.
         * @tc.desc    Function test
         * @tc.level   0
        */
         it("SUB_DH_startDiscovering_0002", 0, async function (done) {
            console.info("-----------------SUB_DH_startDiscovering_0002 start------------------------");
            var discoverParam  = {
                "discoverTargetType":1
              };
            try {
                dmInstance.startDiscovering(discoverParam);
                console.log("startDiscovering success");
                expect().assertTrue();
                done();
            } catch(err) {
                console.error("startDiscovering errCode:" + err.code + ",errMessage:" + err.message);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_startDiscovering_0002 end------------------------");
        });

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
                if (dmNetworkId === nullptr) {
                    console.error("getLocalDeviceNetworkId fail");
                }
                console.log("getLocalDeviceNetworkId dmNetworkId:" + dmNetworkId);
                expect(dmNetworkId != nullptr).assertTrue();
                done();
            } catch(err) {
                console.error("getLocalDeviceNetworkId errCode:" + err.code + ",errMessage:" + err.message);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getLocalDeviceNetworkId_0003 end------------------------");
        });

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
                if (dmDeviceInfo === nullptr) {
                    console.log('getAvailableDeviceListSync info fail');
                }
                console.log('getAvailableDeviceListSync info:' + dmDeviceInfo);
                expect(dmDeviceInfo != nullptr).assertTrue();
                done();
            } catch (err) {
                console.error("getAvailableDeviceListSync errCode:" + err.code + ",errMessage:" + err.message);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getAvailableDeviceListSync_0004 end------------------------");
        });

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
                    expect(data != nullptr).assertTrue();
                    done();
                });
            } catch (err) {
                console.error("getAvailableDeviceList errCode:" + err.code + ",errMessage:" + err.message);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getAvailableDeviceList_0005 end------------------------");
        });

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
                expect(data != nullptr).assertTrue();
                done();
            }).catch((err) => {
                console.error("getAvailableDeviceList errCode:" + err.code + ",errMessage:" + err.message);
                expect().assertFail();
                done();
            })
            await sleep(1000);
            console.info("-----------------SUB_DH_getAvailableDeviceList_0006 end------------------------");
        });

         /*
         * @tc.number  SUB_DH_bindTarget_0007
         * @tc.name    Get the device name of the local device.
         * @tc.desc    Function test
         * @tc.level   0
        */
         it("SUB_DH_bindTarget_0007", 0, async function (done) {
            console.info("-----------------SUB_DH_bindTarget_0007 start------------------------");
            let bindParam = {
                "bindType" : 1,
                "targetPkgName" : "com.ohos.distributedDeviceManager.screen",
                "appName" : "SubDctsdisScreenJsTest",
                "appOperation": "想要连接本机。",
                "customDescription": "device manager device manager device manager device manager device manager device manager device manager device manager"
            };
            try {
                dmInstance.bindTarget(dmDeviceInfo.deviceId, JSON.stringify(bindParam), (err, data) => {
                if (err) {
                    console.info("bindTarget fail errCode:" + err.code + ",errMessage:" + err.message);
                }
                console.log("bindTarget:" + JSON.stringify(data));
                expect(data != nullptr).assertTrue();
                done();
                })
            } catch (err) {
                console.info("bindTarget errCode:" + err.code + ",errMessage:" + err.message);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_bindTarget_0007 end------------------------");
        });

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
                if (lDeviceName === nullptr) {
                    console.log("getLocalDeviceName fail");
                }
                console.log("Get Local Device Name:" + lDeviceName);
                expect(lDeviceName != nullptr).assertTrue();
                done();
            } catch (err) {
                console.info("getLocalDeviceName errCode:" + err.code + ",errMessage:" + err.message);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getLocalDeviceName_0008 end------------------------");
        });

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
                if (lDeviceType === nullptr) {
                    console.log("getLocalDeviceType fail");
                }
                console.log("get Local Device Type:" + lDeviceType);
                expect(lDeviceType != nullptr).assertTrue();
                done();
            } catch (err) {
                console.info("getLocalDeviceType errCode:" + err.code + ",errMessage:" + err.message);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getLocalDeviceType_0009 end------------------------");
        });

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
                if (lDeviceId === nullptr) {
                    console.log("getLocalDeviceId fail");
                }
                console.log("get Local Device Id:" + lDeviceId);
                expect(lDeviceId != nullptr).assertTrue();
                done();
            } catch (err) {
                console.info("getLocalDeviceId errCode:" + err.code + ",errMessage:" + err.message);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getLocalDeviceId_0010 end------------------------");
        });

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
                if (deviceName === nullptr) {
                    console.log("getDeviceName fail");
                }
                console.log("get Device Name:" + deviceName);
                expect(deviceName != nullptr).assertTrue();
                done();
            } catch (err) {
                console.info("getDeviceName errCode:" + err.code + ",errMessage:" + err.message);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getDeviceName_0011 end------------------------");
        });

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
                if (deviceType === nullptr) {
                    console.log("getDeviceType fail");
                }
                console.log("get Device Type:" + deviceType);
                expect(deviceType != nullptr).assertTrue();
                done();
            } catch (err) {
                console.info("getDeviceType errCode:" + err.code + ",errMessage:" + err.message);
                expect().assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_getDeviceType_0012 end------------------------");
        });

        /*
         * @tc.number  SUB_DH_unbindTarget_0013
         * @tc.name    Unbind the specified target.
         * @tc.desc    Function test
         * @tc.level   0
        */
       it("SUB_DH_unbindTarget_0013", 0, async function (done) {
        console.info("-----------------SUB_DH_unbindTarget_0013 start------------------------");
        try {
            dmInstance.unbindTarget(dmDeviceInfo.deviceId);
            console.log("unbindTarget success");
            expect().assertTrue();
            done();
        } catch (err) {
            console.info("unbindTarget errCode:" + err.code + ",errMessage:" + err.message);
            expect().assertFail();
            done();
        }
        await sleep(1000);
        console.info("-----------------SUB_DH_unbindTarget_0013 end------------------------");
        });

       /*
         * @tc.number  SUB_DH_stopDiscovering_0014
         * @tc.name    Stop discovering nearby devices.
         * @tc.desc    Function test
         * @tc.level   0
        */
       it("SUB_DH_stopDiscovering_0014", 0, async function (done) {
        console.info("-----------------SUB_DH_stopDiscovering_0014 start------------------------");
        try {
            dmInstance.stopDiscovering();
            console.log("stopDiscovering success");
            expect().assertTrue();
            done();
        } catch (err) {
            console.info("stopDiscovering errCode:" + err.code + ",errMessage:" + err.message);
            expect().assertFail();
            done();
        }
        await sleep(1000);
        console.info("-----------------SUB_DH_stopDiscovering_0014 end------------------------");
        });

        /*
         * @tc.number  SUB_DH_releaseDeviceManager_0015
         * @tc.name    Releases the {@code DeviceManager} instance that is no longer used.
         * @tc.desc    Function test
         * @tc.level   0
        */
       it("SUB_DH_releaseDeviceManager_0015", 0, async function (done) {
        console.info("-----------------SUB_DH_releaseDeviceManager_0015 start------------------------");
        var mFilterOption = {
            targetPkgName: "com.ohos.devicemanagerui",
            sortType: 0,
            filter: JSON.stringify({
                key: 'test',
                value: 0
            })
        }
        try {
            dmInstance.off('dmFaCallback');
            dmInstance.off('discoverSuccess');
            dmInstance.off('discoverFail');
            dmInstance.off('serviceDie');
            dmInstance.off('deviceStateChange', JSON.stringify(mFilterOption), console.log("deviceStatusChange off:" + JSON.stringify(dmDeviceInfo)));
            deviceManager.releaseDeviceManager(dmInstance);
            console.log("releaseDeviceManager success");
            expect().assertTrue();
            done();
        } catch (err) {
            console.info("releaseDeviceManager errCode:" + err.code + ",errMessage:" + err.message);
            expect().assertFail();
            done();
        }
        await sleep(1000);
        console.info("-----------------SUB_DH_releaseDeviceManager_0015 end------------------------");
        });
    })
}