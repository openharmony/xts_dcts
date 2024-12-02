/*
 * Copyright (C) 2022-2024 Huawei Device Co., Ltd.
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
import hardwareManager from '@ohos.distributedHardware.hardwareManager';

export default function distributedHardware() {

    describe('distributedHardware', function () {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        beforeAll(async function (done) {
            console.info("beforeAll start");
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
		
        /*
         * @tc.number  SUB_DH_HardWareManager_Dcts_0100
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this    instance to call other device management methods, verification deviceID.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_HardWareManager_Dcts_0100", 0, async function (done) {
             console.info("-----------------SUB_DH_HardWareManager_Dcts_0100 start------------------------");

            try {
                let description = {
                  type: hardwareManager.DistributedHardwareType.ALL,
                  srcNetworkId: "123456"
                };
                console.log('SUB_DH_HardWareManager_Dcts_0100 pause start');
                hardwareManager.pauseDistributedHardware(description).then(() => {
                    console.log('SUB_DH_HardWareManager_Dcts_0100 pause successfully');
                }).catch((error) => {
                    console.error('SUB_DH_HardWareManager_Dcts_0100 pause failed, cause:' + error.code + "," + error.message);
                    expect(false).assertFail();
                    done();
                })
                console.log('pause SUB_DH_HardWareManager_Dcts_0100 distributed successfully');
                expect(true).assertTrue();
                done();
            } catch (error) {
                console.error('SUB_DH_HardWareManager_Dcts_0100 pause distributed failed:' + error.code + "," + error.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0100 end------------------------");
        })
        
        
        /*
         * @tc.number  SUB_DH_HardWareManager_Dcts_0200
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this    instance to call other device management methods, verification deviceID.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_HardWareManager_Dcts_0200", 0, async function (done) {
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0200 start------------------------");
            try {
                let description = {
                  type: hardwareManager.DistributedHardwareType.ALL,
                  srcNetworkId: "123456"
                };
                console.log('SUB_DH_HardWareManager_Dcts_0200 resume start');
                hardwareManager.resumeDistributedHardware(description).then(() => {
                    console.log('SUB_DH_HardWareManager_Dcts_0200 resume successfully');
                }).catch((error) => {
                    console.error('SUB_DH_HardWareManager_Dcts_0200 resume failed, cause:' + error.code + "," + error.message);
                    expect(false).assertFail();
                    done();
                })
                console.log('resume SUB_DH_HardWareManager_Dcts_0200 distributed successfully');
                expect(true).assertTrue();
                done();
            } catch (error) {
                console.error('SUB_DH_HardWareManager_Dcts_0200 resume distributed failed:' + error.code + "," + error.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0200 end------------------------");
        })
        
        /*
         * @tc.number  SUB_DH_HardWareManager_Dcts_0300
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this    instance to call other device management methods, verification deviceID.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_HardWareManager_Dcts_0300", 0, async function (done) {
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0300 start------------------------");
            try {
                let description = {
                  type: hardwareManager.DistributedHardwareType.ALL,
                  srcNetworkId: "123456"
                };
                console.log('SUB_DH_HardWareManager_Dcts_0300 stop start');
                hardwareManager.stopDistributedHardware(description).then(() => {
                    console.log('SUB_DH_HardWareManager_Dcts_0300 stop successfully');
                }).catch((error) => {
                    console.error('SUB_DH_HardWareManager_Dcts_0300 stop failed, cause:' + error.code + "," + error.message);
                    expect(false).assertFail();
                    done();
                })
                console.log('stop SUB_DH_HardWareManager_Dcts_0300 distributed successfully');
                expect(true).assertTrue();
                done();
            } catch (error) {
                console.error('SUB_DH_HardWareManager_Dcts_0300 stop distributed failed:' + error.code + "," + error.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0300 end------------------------");
        })

        /*
         * @tc.number  SUB_DH_HardWareManager_Dcts_0400
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this    instance to call other device management methods, verification deviceID.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_HardWareManager_Dcts_0400", 0, async function (done) {
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0400 start------------------------");
            try {
                let description = {
                  type: hardwareManager.DistributedHardwareType.CAMERA,
                  srcNetworkId: "123456"
                };
                console.log('SUB_DH_HardWareManager_Dcts_0400 resume start');
                hardwareManager.resumeDistributedHardware(description).then(() => {
                    console.log('SUB_DH_HardWareManager_Dcts_0400 resume successfully');
                }).catch((error) => {
                    console.error('SUB_DH_HardWareManager_Dcts_0400 resume failed, cause:' + error.code + "," + error.message);
                    expect(false).assertFail();
                    done();
                })
                console.log('resume SUB_DH_HardWareManager_Dcts_0400 distributed successfully');
                expect(true).assertTrue();
                done();
            } catch (error) {
                console.error('SUB_DH_HardWareManager_Dcts_0400 resume distributed failed:' + error.code + "," + error.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0400 end------------------------");
        })
        
        /*
         * @tc.number  SUB_DH_HardWareManager_Dcts_0500
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this    instance to call other device management methods, verification deviceID.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_HardWareManager_Dcts_0500", 0, async function (done) {
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0500 start------------------------");
            try {
                let description = {
                  type: hardwareManager.DistributedHardwareType.SCREEN,
                  srcNetworkId: "123456"
                };
                console.log('SUB_DH_HardWareManager_Dcts_0500 stop start');
                hardwareManager.stopDistributedHardware(description).then(() => {
                    console.log('SUB_DH_HardWareManager_Dcts_0500 stop successfully');
                }).catch((error) => {
                    console.error('SUB_DH_HardWareManager_Dcts_0500 stop failed, cause:' + error.code + "," + error.message);
                    expect(false).assertFail();
                    done();
                })
                console.log('stop SUB_DH_HardWareManager_Dcts_0500 distributed successfully');
                expect(true).assertTrue();
                done();
            } catch (error) {
                console.error('SUB_DH_HardWareManager_Dcts_0500 stop distributed failed:' + error.code + "," + error.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0500 end------------------------");
        })
        
        /*
         * @tc.number  SUB_DH_HardWareManager_Dcts_0600
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this    instance to call other device management methods, verification deviceID.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_HardWareManager_Dcts_0600", 0, async function (done) {
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0600 start------------------------");
            try {
                let description = {
                  type: hardwareManager.DistributedHardwareType.MODEM_MIC,
                  srcNetworkId: "123456"
                };
                console.log('SUB_DH_HardWareManager_Dcts_0600 resume start');
                hardwareManager.resumeDistributedHardware(description).then(() => {
                    console.log('SUB_DH_HardWareManager_Dcts_0600 resume successfully');
                }).catch((error) => {
                    console.error('SUB_DH_HardWareManager_Dcts_0600 resume failed, cause:' + error.code + "," + error.message);
                    expect(false).assertFail();
                    done();
                })
                console.log('resume SUB_DH_HardWareManager_Dcts_0600 distributed successfully');
                expect(true).assertTrue();
                done();
            } catch (error) {
                console.error('SUB_DH_HardWareManager_Dcts_0600 resume distributed failed:' + error.code + "," + error.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0600 end------------------------");
        })
        
        /*
         * @tc.number  SUB_DH_HardWareManager_Dcts_0700
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this    instance to call other device management methods, verification deviceID.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_HardWareManager_Dcts_0700", 0, async function (done) {
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0700 start------------------------");
            try {
                let description = {
                  type: hardwareManager.DistributedHardwareType.MODEM_SPEAKER,
                  srcNetworkId: "123456"
                };
                console.log('SUB_DH_HardWareManager_Dcts_0700 stop start');
                hardwareManager.stopDistributedHardware(description).then(() => {
                    console.log('SUB_DH_HardWareManager_Dcts_0700 stop successfully');
                }).catch((error) => {
                    console.error('SUB_DH_HardWareManager_Dcts_0700 stop failed, cause:' + error.code + "," + error.message);
                    expect(false).assertFail();
                    done();
                })
                console.log('stop SUB_DH_HardWareManager_Dcts_0700 distributed successfully');
                expect(true).assertTrue();
                done();
            } catch (error) {
                console.error('SUB_DH_HardWareManager_Dcts_0700 stop distributed failed:' + error.code + "," + error.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0700 end------------------------");
        })
        
        /*
         * @tc.number  SUB_DH_HardWareManager_Dcts_0800
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this    instance to call other device management methods, verification deviceID.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_HardWareManager_Dcts_0800", 0, async function (done) {
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0800 start------------------------");
            try {
                let description = {
                  type: hardwareManager.DistributedHardwareType.MIC,
                  srcNetworkId: "123456"
                };
                console.log('SUB_DH_HardWareManager_Dcts_0800 resume start');
                hardwareManager.resumeDistributedHardware(description).then(() => {
                    console.log('SUB_DH_HardWareManager_Dcts_0800 resume successfully');
                }).catch((error) => {
                    console.error('SUB_DH_HardWareManager_Dcts_0800 resume failed, cause:' + error.code + "," + error.message);
                    expect(false).assertFail();
                    done();
                })
                console.log('resume SUB_DH_HardWareManager_Dcts_0800 distributed successfully');
                expect(true).assertTrue();
                done();
            } catch (error) {
                console.error('SUB_DH_HardWareManager_Dcts_0800 resume distributed failed:' + error.code + "," + error.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0800 end------------------------");
        })
        
        /*
         * @tc.number  SUB_DH_HardWareManager_Dcts_0900
         * @tc.name    To manage devices, you must first call this method to obtain a {@code DeviceManager} instance and then
         * use this    instance to call other device management methods, verification deviceID.
         * @tc.desc    Function test
         * @tc.size    MediumTest
         * @tc.type:   Function
         * @tc.level   Level1
         */
        it("SUB_DH_HardWareManager_Dcts_0900", 0, async function (done) {
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0900 start------------------------");
            try {
                let description = {
                  type: hardwareManager.DistributedHardwareType.SPEAKER,
                  srcNetworkId: "123456"
                };
                console.log('SUB_DH_HardWareManager_Dcts_0900 stop start');
                hardwareManager.stopDistributedHardware(description).then(() => {
                    console.log('SUB_DH_HardWareManager_Dcts_0900 stop successfully');
                }).catch((error) => {
                    console.error('SUB_DH_HardWareManager_Dcts_0900 stop failed, cause:' + error.code + "," + error.message);
                    expect(false).assertFail();
                    done();
                })
                console.log('stop SUB_DH_HardWareManager_Dcts_0900 distributed successfully');
                expect(true).assertTrue();
                done();
            } catch (error) {
                console.error('SUB_DH_HardWareManager_Dcts_0900 stop distributed failed:' + error.code + "," + error.message);
                expect(false).assertFail();
                done();
            }
            await sleep(1000);
            console.info("-----------------SUB_DH_HardWareManager_Dcts_0900 end------------------------");
        })
    })
}