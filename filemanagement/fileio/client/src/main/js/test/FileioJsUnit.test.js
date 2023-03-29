/*
 * Copyright (c) 2022-2023 Huawei Device Co., Ltd.
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

import rpc from "@ohos.rpc";
import fileio from '@ohos.fileio';
import featureAbility from "@ohos.ability.featureAbility";
import securityLabel from '@ohos.file.securityLabel';
import TestService from "./testService"
import {describe, beforeAll, beforeEach, afterEach, afterAll, it, expect} from '@ohos/hypium';
import {UiDriver, BY} from '@ohos.UiTest';

let gIRemoteObject = null;
var testservice = null;

export default function FileioDistributedTest(){
    describe('FileioDistributedTest', function(){
        console.info("----------SUB_Storage_Fileio_Distributed JS Test is starting----------");
        const DISTRIBUTED_FILE_CONTENT = 'content';
        const SERVER_CHECK_SUCCESS = 'SUCCESS';
    
        const CODE_MK_DIR = 1;
        const CODE_RM_DIR = 2;
        const CODE_CREATE_FILE = 3;
        const CODE_DELETE_FILE = 4;
        const CODE_GET_FILE_CONTENT = 5;
        const CODE_GET_FILE_STAT = 6;
        const CODE_FSYNC_FILE = 7;
    
        /**
         * get app distributed file Path
         * @param testName 
         * @returns 
         */
        async function getDistributedFilePath(testName) {
            let basePath;
            try {
                let context = featureAbility.getContext();
                basePath = await context.getOrCreateDistributedDir();
            } catch (e) {
                console.log("-------- getDistributedFilePath() failed for : " + e);
            }
            return basePath + "/" + testName;
        }

        /**
         * Send rpc request to get server-side verification result without done
         * @param tcNumber 
         * @param path 
         * @param codeNumber 
         * @param callback 
         */
        async function getServerFileInfoFirst(tcNumber, path, codeNumber, callback) {
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
    
                var writeResult = data.writeString(path);
                console.info(tcNumber + " : client writeString success, data is " + data.readString());
                expect(writeResult == true).assertTrue();
    
                if (gIRemoteObject == undefined) {
                    console.info(tcNumber + " : gIRemoteObject undefined");
                }

                await gIRemoteObject.sendRequest(codeNumber, data, reply, option).then((result) => {
                    console.info(tcNumber + " : sendRequest success, result is " + result.errCode);
                    expect(result.errCode == 0).assertTrue();
    
                    var resultToken = result.reply.readString();
                    console.info(tcNumber + " : run readString success, result is " + resultToken);
                    callback(resultToken);
                }).catch((err) => {
                    console.info(tcNumber + " sendRequest has failed for : " + err);
                    callback("client sendRequest failed");
                }).finally(() => {
                    data.reclaim();
                    reply.reclaim();
                })
            } catch (e) {
                console.info(tcNumber + " has failed for : " + e);
                callback("client sendRequest failed");
            }
        }
    
        /**
         * Send rpc request to get server-side verification result
         * @param tcNumber 
         * @param path 
         * @param codeNumber 
         * @param done 
         * @param callback 
         */
        async function getServerFileInfo(tcNumber, path, codeNumber, done, callback) {
            try {
                var data = rpc.MessageParcel.create();
                var reply = rpc.MessageParcel.create();
                var option = new rpc.MessageOption();
    
                var writeResult = data.writeString(path);
                console.info(tcNumber + " : client writeString success, data is " + data.readString());
                expect(writeResult == true).assertTrue();
    
                if (gIRemoteObject == undefined) {
                    console.info(tcNumber + " : gIRemoteObject undefined");
                }

                await gIRemoteObject.sendRequest(codeNumber, data, reply, option).then((result) => {
                    console.info(tcNumber + " : sendRequest success, result is " + result.errCode);
                    expect(result.errCode == 0).assertTrue();
    
                    var resultToken = result.reply.readString();
                    console.info(tcNumber + " : run readString success, result is " + resultToken);
                    callback(resultToken);
                }).catch((err) => {
                    console.info(tcNumber + " sendRequest has failed for : " + err);
                    callback("client sendRequest failed");
                }).finally(() => {
                    data.reclaim();
                    reply.reclaim();
                    done();
                })
            } catch (e) {
                console.info(tcNumber + " has failed for : " + e);
                callback("client sendRequest failed");
            }
        }
        
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
                sleep(6000);
                await button.click();
            } catch (err) {
                console.info('err is ' + err);
                return;
            }
        }
    
        beforeAll(async function(done) {
            console.info('beforeAll called fileio server');
            await getPermission();
            sleep(5000);
            await driveFn();
            sleep(3000);
            
            testservice = new TestService;
            await testservice.toConnectAbility().then(data => {
                gIRemoteObject = data;
                console.info("fileioClient: toConnectAbility data is： " + data);
            })
            done();
            console.info("beforeAll done");
        })
        beforeEach(function () {
            console.info(('beforeEach called'));
            sleep(1500);
        })
        afterEach(function () {
            console.info('afterEach called');
        })
        afterAll(function () {
            console.info('afterAll called');
        })

        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_0000
         * @tc.name    test_fileio_create_dir_sync_000
         * @tc.desc    Test the distributed file mkdirSync interface without the mode parameter
         * @tc.level   0
         */
        it('test_fileio_create_dir_sync_000', 0, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_000--------");
            let tcNumber = 'test_fileio_create_dir_sync_000';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
            try {
                fileio.mkdirSync(dpath);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_000 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
    
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_000 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_000--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_0100
         * @tc.name    test_fileio_create_dir_sync_001
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o700
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_001', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_001--------");
            let tcNumber = 'test_fileio_create_dir_sync_001';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o700);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_001 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
    
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_001 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_001--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_0200
         * @tc.name    test_fileio_create_dir_sync_002
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o600
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_002', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_002--------");
            let tcNumber = 'test_fileio_create_dir_sync_002';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o600);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_002 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
    
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_002 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_002--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_0300
         * @tc.name    test_fileio_create_dir_sync_003
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o500
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_003', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_003--------");
            let tcNumber = 'test_fileio_create_dir_sync_003';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o500);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_003 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
    
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_003 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_003--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_0400
         * @tc.name    test_fileio_create_dir_sync_004
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o400
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_004', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_004--------");
            let tcNumber = 'test_fileio_create_dir_sync_004';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o400);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_004 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_004 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_004--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_0500
         * @tc.name    test_fileio_create_dir_sync_005
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o300
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_005', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_005--------");
            let tcNumber = 'test_fileio_create_dir_sync_005';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o300);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_005 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
    
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_005 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_005--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_0600
         * @tc.name    test_fileio_create_dir_sync_006
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o200
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_006', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_006--------");
            let tcNumber = 'test_fileio_create_dir_sync_006';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o200);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_006 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_006 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_006--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_0700
         * @tc.name    test_fileio_create_dir_sync_007
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o100
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_007', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_007--------");
            let tcNumber = 'test_fileio_create_dir_sync_007';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o100);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_007 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
    
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_007 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_007--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_0800
         * @tc.name    test_fileio_create_dir_sync_008
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o070
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_008', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_008--------");
            let tcNumber = 'test_fileio_create_dir_sync_008';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o070);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_008 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_008 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_008--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_0900
         * @tc.name    test_fileio_create_dir_sync_009
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o060
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_009', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_009--------");
            let tcNumber = 'test_fileio_create_dir_sync_009';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o060);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_009 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_009 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_009--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_1000
         * @tc.name    test_fileio_create_dir_sync_010
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o050
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_010', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_010--------");
            let tcNumber = 'test_fileio_create_dir_sync_010';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o050);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_010 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_010 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_010--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_1100
         * @tc.name    test_fileio_create_dir_sync_011
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o040
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_011', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_011--------");
            let tcNumber = 'test_fileio_create_dir_sync_011';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o040);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_011 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_011 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_011--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_1200
         * @tc.name    test_fileio_create_dir_sync_012
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o030
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_012', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_012--------");
            let tcNumber = 'test_fileio_create_dir_sync_012';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o030);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_012 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_012 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_012--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_1300
         * @tc.name    test_fileio_create_dir_sync_013
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o020
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_013', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_013--------");
            let tcNumber = 'test_fileio_create_dir_sync_013';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o020);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_013 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_013 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_013--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_1400
         * @tc.name    test_fileio_create_dir_sync_014
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o010
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_014', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_014--------");
            let tcNumber = 'test_fileio_create_dir_sync_014';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o010);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_014 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_014 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_014--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_1500
         * @tc.name    test_fileio_create_dir_sync_015
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o007
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_015', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_015--------");
            let tcNumber = 'test_fileio_create_dir_sync_015';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o007);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_015 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_015 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_015--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_1600
         * @tc.name    test_fileio_create_dir_sync_016
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o006
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_016', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_016--------");
            let tcNumber = 'test_fileio_create_dir_sync_016';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o006);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_016 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_016 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_016--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_1700
         * @tc.name    test_fileio_create_dir_sync_017
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o005
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_017', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_017--------");
            let tcNumber = 'test_fileio_create_dir_sync_017';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o005);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_017 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_017 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_017--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_1800
         * @tc.name    test_fileio_create_dir_sync_018
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o004
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_018', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_018--------");
            let tcNumber = 'test_fileio_create_dir_sync_018';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o004);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_018 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_018 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_018--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_1900
         * @tc.name    test_fileio_create_dir_sync_019
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o003
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_019', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_019--------");
            let tcNumber = 'test_fileio_create_dir_sync_019';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o003);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_019 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_019 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_019--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_2000
         * @tc.name    test_fileio_create_dir_sync_020
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o002
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_020', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_020--------");
            let tcNumber = 'test_fileio_create_dir_sync_020';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o002);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_020 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_020 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_020--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_2100
         * @tc.name    test_fileio_create_dir_sync_021
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o001
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_021', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_021--------");
            let tcNumber = 'test_fileio_create_dir_sync_021';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o001);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_021 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_021 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_021--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_2200
         * @tc.name    test_fileio_create_dir_sync_022
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o777
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_022', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_022--------");
            let tcNumber = 'test_fileio_create_dir_sync_022';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o777);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_022 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_022 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_022--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_2300
         * @tc.name    test_fileio_create_dir_sync_023
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o766
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_023', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_023--------");
            let tcNumber = 'test_fileio_create_dir_sync_023';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o766);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_023 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_023 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_023--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_2400
         * @tc.name    test_fileio_create_dir_sync_024
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o755
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_024', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_024--------");
            let tcNumber = 'test_fileio_create_dir_sync_024';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o755);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_024 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_024 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_024--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_2500
         * @tc.name    test_fileio_create_dir_sync_025
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o744
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_025', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_025--------");
            let tcNumber = 'test_fileio_create_dir_sync_025';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o744);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_025 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_025 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_025--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_2600
         * @tc.name    test_fileio_create_dir_sync_026
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o733
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_026', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_026--------");
            let tcNumber = 'test_fileio_create_dir_sync_026';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o733);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_026 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_026 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_026--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_2700
         * @tc.name    test_fileio_create_dir_sync_027
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o722
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_027', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_027--------");
            let tcNumber = 'test_fileio_create_dir_sync_027';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o722);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_027 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_027 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_027--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_2800
         * @tc.name    test_fileio_create_dir_sync_028
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o711
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_028', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_028--------");
            let tcNumber = 'test_fileio_create_dir_sync_028';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o001);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_028 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_028 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_028--------");
        });
    
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_2900
         * @tc.name    test_fileio_create_dir_sync_029
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o676
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_029', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_029--------");
            let tcNumber = 'test_fileio_create_dir_sync_029';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o676);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_029 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_029 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_029--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_3000
         * @tc.name    test_fileio_create_dir_sync_030
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o667
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_030', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_030--------");
            let tcNumber = 'test_fileio_create_dir_sync_030';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o667);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_030 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_030 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_030--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_3100
         * @tc.name    test_fileio_create_dir_sync_031
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o654
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_031', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_031--------");
            let tcNumber = 'test_fileio_create_dir_sync_031';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o654);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_031 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_031 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_031--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_3200
         * @tc.name    test_fileio_create_dir_sync_032
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o645
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_032', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_032--------");
            let tcNumber = 'test_fileio_create_dir_sync_032';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o645);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_032 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_032 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_032--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_3300
         * @tc.name    test_fileio_create_dir_sync_033
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o632
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_033', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_033--------");
            let tcNumber = 'test_fileio_create_dir_sync_033';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o632);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_033 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_033 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_033--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_3400
         * @tc.name    test_fileio_create_dir_sync_034
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o623
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_034', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_034--------");
            let tcNumber = 'test_fileio_create_dir_sync_034';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o623);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_034 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_034 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_034--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_3500
         * @tc.name    test_fileio_create_dir_sync_035
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o617
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_035', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_035--------");
            let tcNumber = 'test_fileio_create_dir_sync_035';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o617);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_035 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_035 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_035--------");
        });
    
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_3600
         * @tc.name    test_fileio_create_dir_sync_036
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o575
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_036', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_036--------");
            let tcNumber = 'test_fileio_create_dir_sync_036';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o575);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_036 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_036 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_036--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_3700
         * @tc.name    test_fileio_create_dir_sync_037
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o564
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_037', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_037--------");
            let tcNumber = 'test_fileio_create_dir_sync_037';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o564);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_037 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_037 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_037--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_3800
         * @tc.name    test_fileio_create_dir_sync_038
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o557
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_038', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_038--------");
            let tcNumber = 'test_fileio_create_dir_sync_038';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o557);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_038 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_038 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_038--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_3900
         * @tc.name    test_fileio_create_dir_sync_039
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o546
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_039', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_039--------");
            let tcNumber = 'test_fileio_create_dir_sync_039';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o546);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_039 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_039 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_039--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_4000
         * @tc.name    test_fileio_create_dir_sync_040
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o531
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_040', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_040--------");
            let tcNumber = 'test_fileio_create_dir_sync_040';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o531);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_040 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_040 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_040--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_4100
         * @tc.name    test_fileio_create_dir_sync_041
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o527
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_041', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_041--------");
            let tcNumber = 'test_fileio_create_dir_sync_041';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o527);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_041 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_041 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_041--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_4200
         * @tc.name    test_fileio_create_dir_sync_042
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o513
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_042', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_042--------");
            let tcNumber = 'test_fileio_create_dir_sync_042';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o513);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_042 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_042 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_042--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_4300
         * @tc.name    test_fileio_create_dir_sync_043
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o474
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_043', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_043--------");
            let tcNumber = 'test_fileio_create_dir_sync_043';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o474);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_043 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_043 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_043--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_4400
         * @tc.name    test_fileio_create_dir_sync_044
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o465
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_044', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_044--------");
            let tcNumber = 'test_fileio_create_dir_sync_044';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o465);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_044 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_044 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_044--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_4500
         * @tc.name    test_fileio_create_dir_sync_045
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o456
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_045', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_045--------");
            let tcNumber = 'test_fileio_create_dir_sync_045';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o456);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_045 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_045 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_045--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_4600
         * @tc.name    test_fileio_create_dir_sync_046
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o447
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_046', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_046--------");
            let tcNumber = 'test_fileio_create_dir_sync_046';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o447);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_046 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_046 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_046--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_4700
         * @tc.name    test_fileio_create_dir_sync_047
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o437
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_047', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_047--------");
            let tcNumber = 'test_fileio_create_dir_sync_047';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o437);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_047 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_047 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_047--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_4800
         * @tc.name    test_fileio_create_dir_sync_048
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o421
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_048', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_048--------");
            let tcNumber = 'test_fileio_create_dir_sync_048';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o421);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_048 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_048 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_048--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_4900
         * @tc.name    test_fileio_create_dir_sync_049
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o412
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_049', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_049--------");
            let tcNumber = 'test_fileio_create_dir_sync_049';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o412);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_049 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_049 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_049--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_5000
         * @tc.name    test_fileio_create_dir_sync_050
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o373
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_050', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_050--------");
            let tcNumber = 'test_fileio_create_dir_sync_050';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o373);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_050 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_050 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_050--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_5100
         * @tc.name    test_fileio_create_dir_sync_051
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o362
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_051', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_051--------");
            let tcNumber = 'test_fileio_create_dir_sync_051';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o362);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_051 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_051 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_051--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_5200
         * @tc.name    test_fileio_create_dir_sync_052
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o351
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_052', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_052--------");
            let tcNumber = 'test_fileio_create_dir_sync_052';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o351);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_052 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_052 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_052--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_5300
         * @tc.name    test_fileio_create_dir_sync_053
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o347
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_053', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_053--------");
            let tcNumber = 'test_fileio_create_dir_sync_053';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o347);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_053 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_053 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_053--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_5400
         * @tc.name    test_fileio_create_dir_sync_054
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o336
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_054', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_054--------");
            let tcNumber = 'test_fileio_create_dir_sync_054';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o336);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_054 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_054 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_054--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_5500
         * @tc.name    test_fileio_create_dir_sync_055
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o325
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_055', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_055--------");
            let tcNumber = 'test_fileio_create_dir_sync_055';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o325);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_055 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_055 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_055--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_5600
         * @tc.name    test_fileio_create_dir_sync_056
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o314
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_056', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_056--------");
            let tcNumber = 'test_fileio_create_dir_sync_056';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o314);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_056 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_056 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_056--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_5700
         * @tc.name    test_fileio_create_dir_sync_057
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o272
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_057', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_057--------");
            let tcNumber = 'test_fileio_create_dir_sync_057';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o272);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_057 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_057 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_057--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_5800
         * @tc.name    test_fileio_create_dir_sync_058
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o263
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_058', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_058--------");
            let tcNumber = 'test_fileio_create_dir_sync_058';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o263);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_058 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_058 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_058--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_5900
         * @tc.name    test_fileio_create_dir_sync_059
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o257
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_059', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_059--------");
            let tcNumber = 'test_fileio_create_dir_sync_059';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o257);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_059 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_059 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_059--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_6000
         * @tc.name    test_fileio_create_dir_sync_060
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o241
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_060', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_060--------");
            let tcNumber = 'test_fileio_create_dir_sync_060';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o241);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_060 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_060 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_060--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_6100
         * @tc.name    test_fileio_create_dir_sync_061
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o235
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_061', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_061--------");
            let tcNumber = 'test_fileio_create_dir_sync_061';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o235);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_061 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_061 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_061--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_6200
         * @tc.name    test_fileio_create_dir_sync_062
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o226
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_062', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_062--------");
            let tcNumber = 'test_fileio_create_dir_sync_062';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o226);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_062 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_062 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_062--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_6300
         * @tc.name    test_fileio_create_dir_sync_063
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o216
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_063', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_063--------");
            let tcNumber = 'test_fileio_create_dir_sync_063';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o216);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_063 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_063 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_063--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_6400
         * @tc.name    test_fileio_create_dir_sync_064
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o171
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_064', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_064--------");
            let tcNumber = 'test_fileio_create_dir_sync_064';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o171);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_064 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_064 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_064--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_6500
         * @tc.name    test_fileio_create_dir_sync_065
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o167
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_065', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_065--------");
            let tcNumber = 'test_fileio_create_dir_sync_065';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o167);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_065 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_065 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_065--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_6600
         * @tc.name    test_fileio_create_dir_sync_066
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o153
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_066', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_066--------");
            let tcNumber = 'test_fileio_create_dir_sync_066';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o153);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_066 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_066 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_066--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_6700
         * @tc.name    test_fileio_create_dir_sync_067
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o142
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_067', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_067--------");
            let tcNumber = 'test_fileio_create_dir_sync_067';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o142);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_067 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_067 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_067--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_6800
         * @tc.name    test_fileio_create_dir_sync_068
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o134
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_068', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_068--------");
            let tcNumber = 'test_fileio_create_dir_sync_068';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o134);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_068 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_068 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_068--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_6900
         * @tc.name    test_fileio_create_dir_sync_069
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o126
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_069', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_069--------");
            let tcNumber = 'test_fileio_create_dir_sync_069';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o126);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_069 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_069 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_069--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_7000
         * @tc.name    test_fileio_create_dir_sync_070
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o115
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_070', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_070--------");
            let tcNumber = 'test_fileio_create_dir_sync_070';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o115);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_070 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_070 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_070--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_7100
         * @tc.name    test_fileio_create_dir_sync_071
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o661
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_071', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_071--------");
            let tcNumber = 'test_fileio_create_dir_sync_071';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o661);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_071 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_071 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_071--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_7200
         * @tc.name    test_fileio_create_dir_sync_072
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o552
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_072', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_072--------");
            let tcNumber = 'test_fileio_create_dir_sync_072';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o552);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_072 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_072 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_072--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_7300
         * @tc.name    test_fileio_create_dir_sync_073
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o443
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_073', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_073--------");
            let tcNumber = 'test_fileio_create_dir_sync_073';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o443);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_073 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_073 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_073--------");
        });
    
        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirSync_7400
         * @tc.name    test_fileio_create_dir_sync_074
         * @tc.desc    Test the distributed file mkdirSync interface with mode=0o224
         * @tc.level   3
         */
        it('test_fileio_create_dir_sync_074', 3, async function (done) {
            console.info("--------start test_fileio_create_dir_sync_074--------");
            let tcNumber = 'test_fileio_create_dir_sync_074';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
    
            try {
                fileio.mkdirSync(dpath, 0o224);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                console.info('------ client mkdirSync success.');
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                    console.info("test_fileio_create_dir_sync_074 : getServerFileInfo serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
                dir.closeSync();
                fileio.rmdirSync(dpath);
            } catch (error) {
                console.info('test_fileio_create_dir_sync_074 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_dir_sync_074--------");
        });

        /** 
         * @tc.number  SUB_STORAGE_Distributed_FileIO_rmdirSync_0000
         * @tc.name    test_fileio_delete_dir_sync_000
         * @tc.desc    Function of API, test the rmdirSync() interface.
         * @tc.level   0
         */
        it('test_fileio_delete_dir_sync_000', 0, async function (done) {
            console.info("--------start test_fileio_delete_dir_sync_000--------");
            let tcNumber = 'test_fileio_delete_dir_sync_000';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
            try {
                fileio.mkdirSync(dpath);
                let dir = fileio.opendirSync(dpath);
                expect(dir !== null).assertTrue();
                dir.closeSync();
                console.info('------------- test_fileio_delete_dir_sync_000 : client mkdirSync success.');
    
                console.info('------ start check server first ... ');
                await getServerFileInfoFirst(tcNumber, dpath, CODE_MK_DIR, function (serverDirCreate) {
                    console.info("test_fileio_delete_dir_sync_000 : getServerFileInfoFirst serverDirCreate: " + serverDirCreate);
                    expect(serverDirCreate).assertEqual(SERVER_CHECK_SUCCESS);
                });
    
                fileio.rmdirSync(dpath);
                try {
                    fileio.opendirSync(dpath);
                    console.info('------------- test_fileio_delete_dir_sync_000 : client rmdirSync failed.');
                    expect(false).assertTrue();
                } catch (e) {
                    console.info('------------- test_fileio_delete_dir_sync_000 : check client rmdirSync success.');
                }
    
                console.info('------ start check server second ... ');
                await getServerFileInfo(tcNumber, dpath, CODE_RM_DIR, done, function (serverDirRemove) {
                    console.info("test_fileio_delete_dir_sync_000 : getServerFileInfo serverDirRemove: " + serverDirRemove);
                    expect(serverDirRemove).assertEqual(SERVER_CHECK_SUCCESS);
                });
            } catch (error) {
                console.info('test_fileio_delete_dir_sync_000 has failed for : ' + error);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_delete_dir_sync_000--------");
        });

        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_0000
         * @tc.name    test_fileio_create_file_sync_000
         * @tc.desc    Function of API, flags=0o100. mode=0o777
         * @tc.level   0
         */
        it('test_fileio_create_file_sync_000', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_000--------");
            let tcNumber = 'test_fileio_create_file_sync_000';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o777);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_000 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_000 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_000--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_0100
         * @tc.name    test_fileio_create_file_sync_001
         * @tc.desc    Function of API, flags=0o101. mode=0o777
         * @tc.level   0
         */
        it('test_fileio_create_file_sync_001', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_001--------");
            let tcNumber = 'test_fileio_create_file_sync_001';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o101, 0o777);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_001 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_001 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_001--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_0200
         * @tc.name    test_fileio_create_file_sync_002
         * @tc.desc    Function of API, flags=0o102. mode=0o777
         * @tc.level   0
         */
        it('test_fileio_create_file_sync_002', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_002--------");
            let tcNumber = 'test_fileio_create_file_sync_002';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o102, 0o777);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_002 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_002 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_002--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_0300
         * @tc.name    test_fileio_create_file_sync_003
         * @tc.desc    Function of API, flags=0o100. mode=0o744
         * @tc.level   3
         */
        it('test_fileio_create_file_sync_003', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_003--------");
            let tcNumber = 'test_fileio_create_file_sync_003';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o744);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_003 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_003 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_003--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_0400
         * @tc.name    test_fileio_create_file_sync_004
         * @tc.desc    Function of API, flags=0o100. mode=0o722
         * @tc.level   3
         */
        it('test_fileio_create_file_sync_004', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_004--------");
            let tcNumber = 'test_fileio_create_file_sync_004';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o722);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_004 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_004 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_004--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_0500
         * @tc.name    test_fileio_create_file_sync_005
         * @tc.desc    Function of API, flags=0o100. mode=0o711
         * @tc.level   3
         */
        it('test_fileio_create_file_sync_005', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_005--------");
            let tcNumber = 'test_fileio_create_file_sync_005';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o711);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_005 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_005 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_005--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_0600
         * @tc.name    test_fileio_create_file_sync_006
         * @tc.desc    Function of API, flags=0o100. mode=0o474
         * @tc.level   3
         */
        it('test_fileio_create_file_sync_006', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_006--------");
            let tcNumber = 'test_fileio_create_file_sync_006';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o474);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_006 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_006 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_006--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_0700
         * @tc.name    test_fileio_create_file_sync_007
         * @tc.desc    Function of API, flags=0o100. mode=0o447
         * @tc.level   3
         */
        it('test_fileio_create_file_sync_007', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_007--------");
            let tcNumber = 'test_fileio_create_file_sync_007';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o447);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_007 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_007 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_007--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_0800
         * @tc.name    test_fileio_create_file_sync_008
         * @tc.desc    Function of API, flags=0o100. mode=0o421
         * @tc.level   3
         */
        it('test_fileio_create_file_sync_008', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_008--------");
            let tcNumber = 'test_fileio_create_file_sync_008';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o421);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_008 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_008 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_008--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_0900
         * @tc.name    test_fileio_create_file_sync_009
         * @tc.desc    Function of API, flags=0o100. mode=0o412
         * @tc.level   3
         */
        it('test_fileio_create_file_sync_009', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_009--------");
            let tcNumber = 'test_fileio_create_file_sync_009';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o412);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_009 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_009 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_009--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_1000
         * @tc.name    test_fileio_create_file_sync_010
         * @tc.desc    Function of API, flags=0o100. mode=0o272
         * @tc.level   3
         */
        it('test_fileio_create_file_sync_010', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_010--------");
            let tcNumber = 'test_fileio_create_file_sync_010';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o272);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_010 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_010 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_010--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_1100
         * @tc.name    test_fileio_create_file_sync_011
         * @tc.desc    Function of API, flags=0o100. mode=0o241
         * @tc.level   3
         */
        it('test_fileio_create_file_sync_011', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_011--------");
            let tcNumber = 'test_fileio_create_file_sync_011';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o241);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_011 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_011 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_011--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_1200
         * @tc.name    test_fileio_create_file_sync_012
         * @tc.desc    Function of API, flags=0o100. mode=0o227
         * @tc.level   3
         */
        it('test_fileio_create_file_sync_012', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_012--------");
            let tcNumber = 'test_fileio_create_file_sync_012';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o227);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_012 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_012 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_012--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_1300
         * @tc.name    test_fileio_create_file_sync_013
         * @tc.desc    Function of API, flags=0o100. mode=0o214
         * @tc.level   3
         */
        it('test_fileio_create_file_sync_013', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_013--------");
            let tcNumber = 'test_fileio_create_file_sync_013';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o214);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_013 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_013 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_013--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_1400
         * @tc.name    test_fileio_create_file_sync_014
         * @tc.desc    Function of API, flags=0o100. mode=0o171
         * @tc.level   3
         */
        it('test_fileio_create_file_sync_014', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_014--------");
            let tcNumber = 'test_fileio_create_file_sync_014';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o171);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_014 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_014 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_014--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_1500
         * @tc.name    test_fileio_create_file_sync_015
         * @tc.desc    Function of API, flags=0o100. mode=0o142
         * @tc.level   3
         */
        it('test_fileio_create_file_sync_015', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_015--------");
            let tcNumber = 'test_fileio_create_file_sync_015';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o142);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_015 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_015 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_015--------");
        });
    
        /**
        * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_1600
        * @tc.name    test_fileio_create_file_sync_016
        * @tc.desc    Function of API, flags=0o100. mode=0o124
        * @tc.level   3
        */
        it('test_fileio_create_file_sync_016', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_016--------");
            let tcNumber = 'test_fileio_create_file_sync_016';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o124);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_016 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_016 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_016--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_1700
         * @tc.name    test_fileio_create_file_sync_017
         * @tc.desc    Function of API, flags=0o100. mode=0o117
         * @tc.level   3
         */
        it('test_fileio_create_file_sync_017', 0, async function (done) {
            console.info("--------start test_fileio_create_file_sync_017--------");
            let tcNumber = 'test_fileio_create_file_sync_017';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o100, 0o117);
                console.info('------------- create file success.');
                fileio.accessSync(fpath, 0);
    
                console.info('------ start check server... ');
                await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                    console.info("test_fileio_create_file_sync_017 getServerFileInfo serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                console.info('------------ start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_create_file_sync_017 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_create_file_sync_017--------");
        });

        /**
         * @tc.number   SUB_STORAGE_Distributed_FileIO_UnlinkSync_0000
         * @tc.name     test_fileio_delete_file_sync_000
         * @tc.desc     Function of API, unlinkSync()
         * @tc.level    0
         */
        it('test_fileio_delete_file_sync_000', 0, async function (done) {
            console.info("--------start test_fileio_delete_file_sync_000--------");
            let tcNumber = 'test_fileio_delete_file_sync_000';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o102, 0o777);
                console.info('------------ test_fileio_delete_file_sync_000 : create file ...');
    
                try {
                    fileio.accessSync(fpath, 0);
                } catch (e) {
                    console.info('------------ test_fileio_delete_file_sync_000 : create file failed!');
                    expect(false).assertTrue();
                }
                fileio.closeSync(fd);
    
                console.info('------ start check server first ... ');
                await getServerFileInfoFirst(tcNumber, fpath, CODE_CREATE_FILE, function (serverFileCreate) {
                    console.info("test_fileio_delete_file_sync_000 getServerFileInfoFirst serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                fileio.unlinkSync(fpath);
                console.info('------------ test_fileio_delete_file_sync_000 : delete file ...');
                try {
                    fileio.accessSync(fpath, 0);
                    console.info('------------ test_fileio_delete_file_sync_000 : delete file failed!');
                    expect(false).assertTrue();
                } catch (e) {
                    console.info('------------ test_fileio_delete_file_sync_000 : delete file success!');
    
                    console.info('------ start check server second ... ');
                    await getServerFileInfo(tcNumber, fpath, CODE_DELETE_FILE, done, function (serverFileDelete) {
                        console.info("test_fileio_delete_file_sync_000 getServerFileInfo serverFileDelete: " + serverFileDelete);
                        expect(serverFileDelete).assertEqual(SERVER_CHECK_SUCCESS);
                    })
                }
            } catch (e) {
                console.info('test_fileio_delete_file_sync_000 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_delete_file_sync_000--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_writeFile_0000
         * @tc.name    test_fileio_write_file_000
         * @tc.desc    Function of API,test writeSync() interface
         * @tc.level   0
         */
        it('test_fileio_write_file_000', 0, async function (done) {
            console.info("---------------------start test_fileio_write_file_000---------------------------");
            let tcNumber = 'test_fileio_write_file_000';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o102, 0o777);
                securityLabel.setSecurityLabelSync(fpath, "s0");
                fileio.writeSync(fd, DISTRIBUTED_FILE_CONTENT);
                console.info('-------------- test_fileio_write_file_000 : write file success.');
                let fileContent = fileio.readTextSync(fpath);
                console.info("-------------- test_fileio_write_file_000 : fileContent =" + fileContent);
                expect(DISTRIBUTED_FILE_CONTENT === fileContent).assertTrue();
    
                console.info('------------------- start check server... ');
                sleep(1000);
                await getServerFileInfo(tcNumber, fpath, CODE_GET_FILE_CONTENT, done, function (serverFileContent) {
                    console.info("-------------- test_fileio_write_file_000 : getServerFileInfo serverFileContent =" + serverFileContent);
                    expect(serverFileContent).assertEqual(DISTRIBUTED_FILE_CONTENT);
                })
    
                console.info('-------------- start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_write_file_000 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("---------------------end test_fileio_write_file_000---------------------------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_RenameFileSync_0000
         * @tc.name    test_fileio_rename_file_sync_000
         * @tc.desc    Function of API, Test the renameSync interface, rename the file.
         * @tc.level   0
         */
        it('test_fileio_rename_file_sync_000', 0, async function (done) {
            console.info("--------start test_fileio_rename_file_sync_000--------");
            let tcNumber = 'test_fileio_rename_file_sync_000';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o102, 0o777);
                fileio.accessSync(fpath, 0);
                console.info('------------- create file success.');
    
                console.info('------ start check server first... ');
                await getServerFileInfoFirst(tcNumber, fpath, CODE_CREATE_FILE, function (serverFileCreate) {
                    console.info("test_fileio_rename_file_sync_000 getServerFileInfoFirst serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                let newPath = fpath + "_rename";
                console.info('------------ test_fileio_rename_file_sync_000 : newPath = ' + newPath);
                fileio.renameSync(fpath, newPath);
    
                try {
                    fileio.accessSync(newPath, 0);
                    console.info('------------ test_fileio_rename_file_sync_000 : rename file success!');
                } catch (error) {
                    console.info('------------ test_fileio_rename_file_sync_000 : rename file failed!');
                    console.info('test_fileio_rename_file_sync_000 has failed for : ' + error);
                    expect(false).assertTrue();
                }
    
                console.info('------ start check server second... ');
                await getServerFileInfo(tcNumber, newPath, CODE_CREATE_FILE, done, function (serverFileRename) {
                    console.info("test_fileio_rename_file_sync_000 getServerFileInfo serverFileRename: " + serverFileRename);
                    expect(serverFileRename).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                fileio.closeSync(fd);
                fileio.unlinkSync(newPath);
            } catch (e) {
                console.info('test_fileio_rename_file_sync_000 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_rename_file_sync_000--------");
        });
    
        /**
         * @tc.number  SUB_STORAGE_Distributed_FileIO_RenameDirSync_0000
         * @tc.name    test_fileio_rename_dir_sync_000
         * @tc.desc    Function of API,Test the renameSync interface, rename the directory.
         * @tc.level   0
         */
        it('test_fileio_rename_dir_sync_000', 0, async function (done) {
            console.info("--------start test_fileio_rename_dir_sync_000--------");
            let tcNumber = 'test_fileio_rename_dir_sync_000';
            let dpath = await getDistributedFilePath(tcNumber) + 'd';
            try {
                fileio.mkdirSync(dpath);
                fileio.accessSync(dpath, 0);
                console.info('------------- create dir success.');
    
                console.info('------ start check server first... ');
                await getServerFileInfoFirst(tcNumber, dpath, CODE_MK_DIR, function (serverFileCreate) {
                    sleep(1000);
                    console.info("test_fileio_rename_dir_sync_000 getServerFileInfoFirst serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                let newPath = dpath + "_rename";
                console.info('------------ test_fileio_rename_dir_sync_000 : newPath = ' + newPath);
                fileio.renameSync(dpath, newPath);
    
                try {
                    fileio.accessSync(newPath, 0);
                    console.info('------------ test_fileio_rename_dir_sync_000 : rename file success!');
                } catch (error) {
                    console.info('------------ test_fileio_rename_dir_sync_000 : rename file failed!');
                    console.info('test_fileio_rename_dir_sync_000 has failed for : ' + error);
                    expect(false).assertTrue();
                }
    
                console.info('------ start check server second... ');
                await getServerFileInfo(tcNumber, newPath, CODE_MK_DIR, done, function (serverDirRename) {
                    sleep(1000);
                    console.info("test_fileio_rename_dir_sync_000 getServerFileInfo serverDirRename: " + serverDirRename);
                    expect(serverDirRename).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                fileio.rmdirSync(newPath);
            } catch (e) {
                console.info('test_fileio_rename_dir_sync_000 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_rename_dir_sync_000--------");
        });
    
        /**
        * @tc.number  SUB_STORAGE_Distributed_FileIO_CopyFileSync_0000
        * @tc.name    test_fileio_copy_file_sync_000
        * @tc.desc    Function of API, Test the copyFileSync interface, copy the file.
        * @tc.level   0
        */
        it('test_fileio_copy_file_sync_000', 0, async function (done) {
            console.info("--------start test_fileio_copy_file_sync_000--------");
            let tcNumber = 'test_fileio_copy_file_sync_000';
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o102, 0o777);
                fileio.accessSync(fpath, 0);
                console.info('------------- create file success.');
    
                console.info('------ start check server first... ');
                await getServerFileInfoFirst(tcNumber, fpath, CODE_CREATE_FILE, function (serverFileCreate) {
                    console.info("test_fileio_copy_file_sync_000 getServerFileInfoFirst serverFileCreate: " + serverFileCreate);
                    expect(serverFileCreate).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                let newPath = fpath + "_copy";
                console.info('------------ test_fileio_copy_file_sync_000 : newPath = ' + newPath);
                fileio.copyFileSync(fpath, newPath);
    
                try {
                    fileio.accessSync(newPath, 0);
                    console.info('------------ test_fileio_copy_file_sync_000 : copy file success!');
                } catch (error) {
                    console.info('------------ test_fileio_copy_file_sync_000 : copy file failed!');
                    console.info('test_fileio_copy_file_sync_000 has failed for : ' + error);
                    expect(false).assertTrue();
                }
    
                console.info('------ start check server second... ');
                await getServerFileInfo(tcNumber, newPath, CODE_CREATE_FILE, done, function (serverFileCopy) {
                    console.info("test_fileio_copy_file_sync_000 getServerFileInfo serverFileCopy: " + serverFileCopy);
                    expect(serverFileCopy).assertEqual(SERVER_CHECK_SUCCESS);
                })
    
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
                fileio.unlinkSync(newPath);
            } catch (e) {
                console.info('test_fileio_copy_file_sync_000 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("--------end test_fileio_copy_file_sync_000--------");
        });
    
        /**
         * @tc.number   SUB_STORAGE_Distributed_FileIO_StatSync_0000
         * @tc.name     test_fileio_file_statSync_000
         * @tc.desc     Function of API,test statSync() interface
         * @tc.level   0
         */
        it('test_fileio_file_statSync_000', 0, async function (done) {
            console.info("---------------------start test_fileio_file_statSync_000---------------------------");
            let tcNumber = 'test_fileio_file_statSync_000'
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o102, 0o660);
                let localStat = fileio.statSync(fpath);
                let localStatInfo = "localStat.size = " + localStat.size + ",localStat.mode = " + localStat.mode;
                console.info('------------------- test_fileio_file_statSync_000 localStatInfo = ' + localStatInfo);
    
                await getServerFileInfo(tcNumber, fpath, CODE_GET_FILE_STAT, done, function (serverFileStat) {
                    console.info("test_fileio_file_statSync_000 getServerFileInfo serverFileStat: " + serverFileStat);
                    expect(serverFileStat).assertEqual(localStatInfo);
                })
    
                console.info('------------  start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_file_statSync_000 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("---------------------end test_fileio_file_statSync_000---------------------------");
        });
    
        /**
        * @tc.number   SUB_STORAGE_Distributed_FileIO_fstatSync_0000
        * @tc.name     test_fileio_file_fstatSync_000
        * @tc.desc     Function of API,test fstatSync() interface
        * @tc.level   0
        */
        it('test_fileio_file_fstatSync_000', 0, async function (done) {
            console.info("---------------------start test_fileio_file_fstatSync_000---------------------------");
            let tcNumber = 'test_fileio_file_fstatSync_000'
            let fpath = await getDistributedFilePath(tcNumber);
            console.info('fpath == ' + fpath);
            try {
                let fd = fileio.openSync(fpath, 0o102, 0o660);
                let localStat = fileio.fstatSync(fd);
                let localStatInfo = "localStat.size = " + localStat.size + ",localStat.mode = " + localStat.mode;
                console.info('------------------- test_fileio_file_fstatSync_000 localStatInfo = ' + localStatInfo);
    
                await getServerFileInfo(tcNumber, fpath, CODE_GET_FILE_STAT, done, function (serverFileStat) {
                    console.info("test_fileio_file_fstatSync_000 getServerFileInfo serverFileStat: " + serverFileStat);
                    expect(serverFileStat).assertEqual(localStatInfo);
                })
    
                console.info('------------  start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_file_fstatSync_000 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("---------------------end test_fileio_file_fstatSync_000---------------------------");
        });
    
        /**
         * @tc.number   SUB_STORAGE_Distributed_FileIO_fsyncSync_0000
         * @tc.name     test_fileio_file_fsyncSync_000
         * @tc.desc     Function of API,test fsyncSync() interface
         * @tc.level   0
         */
        it('test_fileio_file_fsyncSync_000', 0, async function (done) {
            console.info("---------------------start test_fileio_file_fsyncSync_000---------------------------");
            let tcNumber = 'test_fileio_file_fsyncSync_000'
            let fpath = await getDistributedFilePath(tcNumber);
            try {
                let fd = fileio.openSync(fpath, 0o102, 0o777);
                securityLabel.setSecurityLabelSync(fpath, "s0");
                await getServerFileInfo(tcNumber, fpath, CODE_FSYNC_FILE, done, function (serverFileSync) {
                    sleep(2000);
                    console.info("test_fileio_file_fsyncSync_000 getServerFileInfo serverFileSync: " + JSON.stringify(serverFileSync));
                    expect(serverFileSync == SERVER_CHECK_SUCCESS).assertTrue();
                });
    
                console.info('------------  start clean test environment.');
                fileio.closeSync(fd);
                fileio.unlinkSync(fpath);
            } catch (e) {
                console.info('test_fileio_file_fsyncSync_000 has failed for : ' + e);
                expect(false).assertTrue();
            }
            console.info("---------------------end test_fileio_file_fsyncSync_000---------------------------");
        });
    
        console.info("----------SUB_Storage_Fileio_Distributed JS Test is end----------");
    });
}

