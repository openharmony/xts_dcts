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

import rpc from "@ohos.rpc";
import fileio from '@ohos.fileio';
import featureAbility from '@ohos.ability.featureAbility'
import deviceManager from '@ohos.distributedHardware.deviceManager';
import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from 'deccjsunit/index';

let gIRemoteObject = null;
let connectId = null;

describe('FileioJsUnitTest', function () {
    console.info("----------SUB_Storage_Fileio_Distributed JS Test is starting----------");
    const DISTRIBUTED_FILE_CONTENT = 'content';
    const APPEND_FILE_CONTENT = '_append';
    const SERVER_CHECK_SUCCESS = 'SUCCESS';

    const CODE_MK_DIR = 1;
    const CODE_RM_DIR = 2;
    const CODE_CREATE_FILE = 3;
    const CODE_DELETE_FILE = 4;
    const CODE_GET_FILE_CONTENT = 5;
    const CODE_GET_FILE_STAT = 6;
    const CODE_FSYNC_FILE = 7;

    function sleep(numberMillis) {
        var now = new Date();
        var exitTime = now.getTime() + numberMillis;
        while (true) {
            now = new Date();
            if (now.getTime() > exitTime)
                return;
        }
    }

    /**
     * 获取应用的分布式目录
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
            console.info(tcNumber + " : run writeString success, writeResult is " + writeResult);
            console.info(tcNumber + " : run writeString success, data is " + data.readString());
            expect(writeResult == true).assertTrue();

            if (gIRemoteObject == undefined) {
                console.info(tcNumber + " : gIRemoteObject undefined");
            }
            await gIRemoteObject.sendRequest(codeNumber, data, reply, option).then((result) => {
                console.info(tcNumber + " : sendRequest success, result is " + result.errCode);
                expect(result.errCode == 0).assertTrue();

                var resultToken = result.reply.readString();
                console.info(tcNumber + " :run readString success, result is " + resultToken);
                callback(resultToken);
            }).catch((err) => {
                console.info(tcNumber + " sendRequest has failed for : " + err);
                callback("Empty");
            }).finally(() => {
                data.reclaim();
                reply.reclaim();
                done();
            })
        } catch (e) {
            console.info(tcNumber + " has failed for : " + e);
            callback("Empty");
        }
    }

    beforeAll(async function (done) {
        console.info('beforeAll called fileio server');
        function deviceManagerCallback(error, deviceManager) {
            console.info("got deviceManager: " + deviceManager + ", error: " + error);
            let deviceList = deviceManager.getTrustedDeviceListSync();
            let deviceId = deviceList[0].deviceId;
            console.info("online device id: " + deviceId);

            let want = {
                "bundleName": "com.ohos.fileiotest",
                "abilityName": "com.example.server.ServiceAbility",
                "deviceId": deviceId,
                "flags": 256
            }
            let connect = {
                onConnect: function (elementName, remoteProxy) {
                    console.info('fileioClient: onConnect called,proxy: ' + (remoteProxy instanceof rpc.RemoteProxy));
                    gIRemoteObject = remoteProxy;
                    done();
                },
                onDisconnect: function (elementName) {
                    console.info("fileioClient: onDisconnect");
                },
                onFailed: function () {
                    console.info("fileioClient: onFailed");
                    gIRemoteObject = null;
                }
            }
            connectId = featureAbility.connectAbility(want, connect);
            connectId.info("connect ability got id: " + connectId);
        }
        deviceManager.createDeviceManager('com.ohos.fileiotest', deviceManagerCallback);
        console.info("beforeAll done");
    })
    beforeEach(function () {
        console.info(('beforeEach called'));
        sleep(1000);
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
                console.info("test_fileio_create_dir_sync_000 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_001 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_002 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_003 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_004 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_005 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_006 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_007 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_008 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_009 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_010 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_011 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_012 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_013 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_014 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_015 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_016 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_017 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_018 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_019 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_020 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_021 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_022 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_023 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_024 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_025 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_026 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_027 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_028 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_029 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_030 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_031 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_032 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_033 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_034 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_035 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_036 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_037 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_038 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_039 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_040 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_041 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_042 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_043 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_044 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_045 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_046 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_047 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_048 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_049 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_050 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_051 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_052 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_053 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_054 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_055 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_056 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_057 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_058 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_059 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_060 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_061 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_062 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_063 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_064 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_065 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_066 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_067 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_068 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_069 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_070 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_071 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_072 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_073 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_create_dir_sync_074 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
     * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirAsync_0000
     * @tc.name    test_fileio_create_dir_async_000
     * @tc.desc    Test the distributed file mkdir() interface without the mode parameter, returned in promise mode.
     * @tc.level   0
     */
     it('test_fileio_create_dir_async_000', 0, async function (done) {
        console.info("--------start test_fileio_create_dir_async_000--------");
        let tcNumber = 'test_fileio_create_dir_async_000';
        let dpath = await getDistributedFilePath(tcNumber) + 'd';
        try {
            await fileio.mkdir(dpath);
            let dir = fileio.opendirSync(dpath);
            expect(dir !== null).assertTrue();

            console.info('------ start check server... ');
            await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                console.info("test_fileio_create_dir_async_000 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
            });

            dir.closeSync();
            fileio.rmdirSync(dpath);
        } catch (error) {
            console.info('test_fileio_create_dir_async_000 has failed for : ' + error);
            expect(false).assertTrue();
        }
        console.info("--------end test_fileio_create_dir_async_000--------");
    });

    /** 
     * @tc.number  SUB_STORAGE_Distributed_FileIO_mkdirAsync_0100
     * @tc.name    test_fileio_create_dir_async_001
     * @tc.desc    Test the distributed file mkdir() interface without the mode parameter,returned in callback mode.
     * @tc.level   0
     */
     it('test_fileio_create_dir_async_001', 0, async function (done) {
        console.info("--------start test_fileio_create_dir_async_001--------");
        let tcNumber = 'test_fileio_create_dir_async_001';
        let dpath = await getDistributedFilePath(tcNumber) + 'd';
        try {
            fileio.mkdir(dpath, function(err) {
                console.info('------ client mkdirSync success.' + err);
                fileio.accessSync(dpath, 0);
            });
            
            console.info('------ start check server... ');
            await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                console.info("test_fileio_create_dir_async_001 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
            });

            fileio.rmdirSync(dpath);
        } catch (error) {
            console.info('test_fileio_create_dir_async_001 has failed for : ' + error);
            expect(false).assertTrue();
        }
        console.info("--------end test_fileio_create_dir_async_001--------");
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
            await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                console.info("test_fileio_delete_dir_sync_000 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                console.info("test_fileio_delete_dir_sync_000 : getServerFileInfo serverDirRemove: " + JSON.stringify(serverDirRemove));
                expect(serverDirRemove == SERVER_CHECK_SUCCESS).assertTrue();
            });
        } catch (error) {
            console.info('test_fileio_delete_dir_sync_000 has failed for : ' + error);
            expect(false).assertTrue();
        }
        console.info("--------end test_fileio_delete_dir_sync_000--------");
    });

    /** 
     * @tc.number  SUB_STORAGE_Distributed_FileIO_rmdirAsync_0000
     * @tc.name    test_fileio_delete_dir_async_000
     * @tc.desc    Function of API, Test the rmdir() interface and return in promise mode.
     * @tc.level   1
     */
     it('test_fileio_delete_dir_async_000', 1, async function (done) {
        console.info("--------start test_fileio_delete_dir_async_000--------");
        let tcNumber = 'test_fileio_delete_dir_async_000';
        let dpath = await getDistributedFilePath(tcNumber) + 'd';
        try {
            fileio.mkdirSync(dpath);
            let dir = fileio.opendirSync(dpath);
            expect(dir !== null).assertTrue();
            dir.closeSync();
            console.info('------------- test_fileio_delete_dir_async_000 : client mkdirSync success.');

            console.info('------ start check server first ... ');
            await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                console.info("test_fileio_delete_dir_async_000 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
            });

            await fileio.rmdir(dpath);
            try {
                fileio.opendirSync(dpath);
                console.info('------------- test_fileio_delete_dir_async_000 : client rmdirSync failed.');
                expect(false).assertTrue();
            } catch (e) {
                console.info('------------- test_fileio_delete_dir_async_000 : check client rmdirSync success.');
            }

            console.info('------ start check server second ... ');
            await getServerFileInfo(tcNumber, dpath, CODE_RM_DIR, done, function (serverDirRemove) {
                console.info("test_fileio_delete_dir_async_000 : getServerFileInfo serverDirRemove: " + JSON.stringify(serverDirRemove));
                expect(serverDirRemove == SERVER_CHECK_SUCCESS).assertTrue();
            });
        } catch (error) {
            console.info('test_fileio_delete_dir_async_000 has failed for : ' + error);
            expect(false).assertTrue();
        }
        console.info("--------end test_fileio_delete_dir_async_000--------");
    });

    /** 
     * @tc.number  SUB_STORAGE_Distributed_FileIO_rmdirAsync_0100
     * @tc.name    test_fileio_delete_dir_async_001
     * @tc.desc    Function of API, Test the rmdir() interface and returned in callback mode.
     * @tc.level   1
     */
     it('test_fileio_delete_dir_async_001', 1, async function (done) {
        console.info("--------start test_fileio_delete_dir_async_001--------");
        let tcNumber = 'test_fileio_delete_dir_async_001';
        let dpath = await getDistributedFilePath(tcNumber) + 'd';
        try {
            fileio.mkdirSync(dpath);
            let dir = fileio.opendirSync(dpath);
            expect(dir !== null).assertTrue();
            dir.closeSync();
            console.info('------------- test_fileio_delete_dir_async_001 : client mkdirSync success.');

            console.info('------ start check server first ... ');
            await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverDirCreate) {
                console.info("test_fileio_delete_dir_async_001 : getServerFileInfo serverDirCreate: " + JSON.stringify(serverDirCreate));
                expect(serverDirCreate == SERVER_CHECK_SUCCESS).assertTrue();
            });

            fileio.rmdir(dpath, function(err){
                try {
                    fileio.opendirSync(dpath);
                    console.info('------------- test_fileio_delete_dir_async_001 : client rmdirSync failed.');
                    expect(false).assertTrue();
                } catch (e) {
                    console.info('------------- test_fileio_delete_dir_async_001 : check client rmdirSync success.');
                }
            });
            console.info('------ start check server second ... ');
            await getServerFileInfo(tcNumber, dpath, CODE_RM_DIR, done, function (serverDirRemove) {
                console.info("test_fileio_delete_dir_async_001 : getServerFileInfo serverDirRemove: " + JSON.stringify(serverDirRemove));
                expect(serverDirRemove == SERVER_CHECK_SUCCESS).assertTrue();
            });
        } catch (error) {
            console.info('test_fileio_delete_dir_async_001 has failed for : ' + error);
            expect(false).assertTrue();
        }
        console.info("--------end test_fileio_delete_dir_async_001--------");
    });

    /**
     * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_0000
     * @tc.name    test_fileio_create_file_sync_000
     * @tc.desc    Function of API, flags=0o102. mode=0o777
     * @tc.level   0
     */
    it('test_fileio_create_file_sync_000', 0, async function (done) {
        console.info("--------start test_fileio_create_file_sync_000--------");
        let tcNumber = 'test_fileio_create_file_sync_000';
        let fpath = await getDistributedFilePath(tcNumber);
        console.info('fpath == ' + fpath);
        try {
            let fd = fileio.openSync(fpath, 0o102, 0o777);
            console.info('------------- create file success.');
            fileio.accessSync(fpath, 0);

            console.info('------ start check server... ');
            await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                console.info("test_fileio_create_file_sync_000 getServerFileInfo serverFileCreate: " + JSON.stringify(serverFileCreate));
                expect(serverFileCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
     * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenAsync_0000
     * @tc.name    test_fileio_create_file_async_000
     * @tc.desc    Function of API, test the open() interface with flags=0o102, mode=0o777, and return in promise mode.
     * @tc.level   1
     */
     it('test_fileio_create_file_async_000', 1, async function (done) {
        console.info("--------start test_fileio_create_file_async_000--------");
        let tcNumber = 'test_fileio_create_file_async_000';
        let fpath = await getDistributedFilePath(tcNumber);
        console.info('fpath == ' + fpath);
        try {
            let fd = await fileio.open(fpath, 0o102, 0o777);
            console.info('------------- create file success.');
            fileio.accessSync(fpath, 0);

            console.info('------ start check server... ');
            await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                console.info("test_fileio_create_file_async_000 getServerFileInfo serverFileCreate: " + JSON.stringify(serverFileCreate));
                expect(serverFileCreate == SERVER_CHECK_SUCCESS).assertTrue();
            })

            console.info('------------ start clean test environment.');
            fileio.closeSync(fd);
            fileio.unlinkSync(fpath);
        } catch (e) {
            console.info('test_fileio_create_file_async_000 has failed for : ' + e);
            expect(false).assertTrue();
        }
        console.info("--------end test_fileio_create_file_async_000--------");
    });

    /**
     * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenAsync_0100
     * @tc.name    test_fileio_create_file_async_001
     * @tc.desc    Function of API, test the open() interface with flags=0o102, mode=0o777, and returned in callback mode.
     * @tc.level   1
     */
     it('test_fileio_create_file_async_001', 1, async function (done) {
        console.info("--------start test_fileio_create_file_async_001--------");
        let tcNumber = 'test_fileio_create_file_async_001';
        let fpath = await getDistributedFilePath(tcNumber);
        console.info('fpath == ' + fpath);
        try {
            fileio.open(fpath, 0o102, 0o777, function(err, fd) {
                console.info('test_fileio_create_file_async_001  : ' + err);
                fileio.accessSync(fpath, 0);
                expect(fd != 0).assertTrue();
            });
            console.info('------ start check server... ');
            await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                console.info("test_fileio_create_file_async_001 getServerFileInfo serverFileCreate: " + JSON.stringify(serverFileCreate));
                expect(serverFileCreate == SERVER_CHECK_SUCCESS).assertTrue();
            })

            console.info('------------ start clean test environment.');
            fileio.unlinkSync(fpath);
        } catch (e) {
            console.info('test_fileio_create_file_async_001 has failed for : ' + e);
            expect(false).assertTrue();
        }
        console.info("--------end test_fileio_create_file_async_001--------");
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
            await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                console.info("test_fileio_delete_file_sync_000 getServerFileInfo serverFileCreate: " + JSON.stringify(serverFileCreate));
                expect(serverFileCreate == SERVER_CHECK_SUCCESS).assertTrue();
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
                    console.info("test_fileio_delete_file_sync_000 getServerFileInfo serverFileDelete: " + JSON.stringify(serverFileDelete));
                    expect(serverFileDelete == SERVER_CHECK_SUCCESS).assertTrue();
                })
            }
        } catch (e) {
            console.info('test_fileio_delete_file_sync_000 has failed for : ' + e);
            expect(false).assertTrue();
        }
        console.info("--------end test_fileio_delete_file_sync_000--------");
    });

    /**
     * @tc.number   SUB_STORAGE_Distributed_FileIO_Unlink_0000
     * @tc.name     test_fileio_delete_file_async_000
     * @tc.desc     Function of API, test the unlink() interface and returned in promise mode.
     * @tc.level    0
     */
     it('test_fileio_delete_file_async_000', 0, async function (done) {
        console.info("--------start test_fileio_delete_file_async_000--------");
        let tcNumber = 'test_fileio_delete_file_async_000';
        let fpath = await getDistributedFilePath(tcNumber);
        console.info('fpath == ' + fpath);
        try {
            let fd = fileio.openSync(fpath, 0o102, 0o777);
            console.info('------------ test_fileio_delete_file_async_000 : create file ...');

            try {
                fileio.accessSync(fpath, 0);
            } catch (e) {
                console.info('------------ test_fileio_delete_file_async_000 : create file failed!');
                expect(false).assertTrue();
            }
            fileio.closeSync(fd);

            console.info('------ start check server first ... ');
            await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                console.info("test_fileio_delete_file_async_000 getServerFileInfo serverFileCreate: " + JSON.stringify(serverFileCreate));
                expect(serverFileCreate == SERVER_CHECK_SUCCESS).assertTrue();
            })

            await fileio.unlink(fpath);
            console.info('------------ test_fileio_delete_file_async_000 : delete file ...');
            try {
                fileio.accessSync(fpath, 0);
                console.info('------------ test_fileio_delete_file_async_000 : delete file failed!');
                expect(false).assertTrue();
            } catch (e) {
                console.info('------------ test_fileio_delete_file_async_000 : delete file success!');

                console.info('------ start check server second ... ');
                await getServerFileInfo(tcNumber, fpath, CODE_DELETE_FILE, done, function (serverFileDelete) {
                    console.info("test_fileio_delete_file_async_000 getServerFileInfo serverFileDelete: " + JSON.stringify(serverFileDelete));
                    expect(serverFileDelete == SERVER_CHECK_SUCCESS).assertTrue();
                })
            }
        } catch (e) {
            console.info('test_fileio_delete_file_async_000 has failed for : ' + e);
            expect(false).assertTrue();
        }
        console.info("--------end test_fileio_delete_file_async_000--------");
    });

    /**
     * @tc.number   SUB_STORAGE_Distributed_FileIO_Unlink_0100
     * @tc.name     test_fileio_delete_file_async_001
     * @tc.desc     Function of API, test the unlink() interface and returned in callback mode.
     * @tc.level    0
     */
     it('test_fileio_delete_file_async_001', 0, async function (done) {
        console.info("--------start test_fileio_delete_file_async_001--------");
        let tcNumber = 'test_fileio_delete_file_async_001';
        let fpath = await getDistributedFilePath(tcNumber);
        console.info('fpath == ' + fpath);
        try {
            let fd = fileio.openSync(fpath, 0o102, 0o777);
            console.info('------------ test_fileio_delete_file_async_001 : create file ...');

            try {
                fileio.accessSync(fpath, 0);
            } catch (e) {
                console.info('------------ test_fileio_delete_file_async_001 : create file failed!');
                expect(false).assertTrue();
            }
            fileio.closeSync(fd);

            console.info('------ start check server first ... ');
            await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                console.info("test_fileio_delete_file_async_001 getServerFileInfo serverFileCreate: " + JSON.stringify(serverFileCreate));
                expect(serverFileCreate == SERVER_CHECK_SUCCESS).assertTrue();
            });

            fileio.unlink(fpath ,function(err) {
                try {
                    fileio.accessSync(fpath, 0);
                    console.info('------------ test_fileio_delete_file_async_001 : delete file failed!');
                    expect(false).assertTrue();
                } catch (e) {
                    console.info('------------ test_fileio_delete_file_async_001 : delete file success!');
                }
            });
            console.info('------ start check server second ... ');
            await getServerFileInfo(tcNumber, fpath, CODE_DELETE_FILE, done, function (serverFileDelete) {
                console.info("test_fileio_delete_file_async_001 getServerFileInfo serverFileDelete: " + JSON.stringify(serverFileDelete));
                expect(serverFileDelete == SERVER_CHECK_SUCCESS).assertTrue();
            });
        } catch (e) {
            console.info('test_fileio_delete_file_async_001 has failed for : ' + e);
            expect(false).assertTrue();
        }
        console.info("--------end test_fileio_delete_file_async_001--------");
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
            await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverFileCreate) {
                console.info("test_fileio_rename_dir_sync_000 getServerFileInfo serverFileCreate: " + JSON.stringify(serverFileCreate));
                expect(serverFileCreate == SERVER_CHECK_SUCCESS).assertTrue();
            })

            let newPath = dpath + "_new";
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
            await getServerFileInfo(tcNumber, newPath, CODE_MK_DIR, done, function (serverFileRename) {
                console.info("test_fileio_rename_dir_sync_000 getServerFileInfo serverFileRename: " + JSON.stringify(serverFileRename));
                expect(serverFileRename == SERVER_CHECK_SUCCESS).assertTrue();
            })

            fileio.rmdirSync(newPath);
        } catch (e) {
            console.info('test_fileio_rename_dir_sync_000 has failed for : ' + e);
            expect(false).assertTrue();
        }
        console.info("--------end test_fileio_rename_dir_sync_000--------");
    });

    /**
     * @tc.number  SUB_STORAGE_Distributed_FileIO_RenameDir_0000
     * @tc.name    test_fileio_rename_dir_async_000
     * @tc.desc    Function of API, Test the renameSync interface, rename the directory and returned in promise mode.
     * @tc.level   0
     */
     it('test_fileio_rename_dir_async_000', 0, async function (done) {
        console.info("--------start test_fileio_rename_dir_async_000--------");
        let tcNumber = 'test_fileio_rename_dir_async_000';
        let dpath = await getDistributedFilePath(tcNumber) + 'd';
        try {
            fileio.mkdirSync(dpath);
            fileio.accessSync(dpath, 0);
            console.info('------------- create dir success.');

            console.info('------ start check server first... ');
            await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverFileCreate) {
                console.info("test_fileio_rename_dir_async_000 getServerFileInfo serverFileCreate: " + JSON.stringify(serverFileCreate));
                expect(serverFileCreate == SERVER_CHECK_SUCCESS).assertTrue();
            })

            let newPath = dpath + "_new";
            console.info('------------ test_fileio_rename_dir_async_000 : newPath = ' + newPath);

            await fileio.rename(dpath, newPath);

            try {
                fileio.accessSync(newPath, 0);
                console.info('------------ test_fileio_rename_dir_async_000 : rename file success!');
            } catch (error) {
                console.info('test_fileio_rename_dir_async_000 has failed for : ' + error);
                console.info('------------ test_fileio_rename_dir_async_000 : rename file failed!');
                expect(false).assertTrue();
            }

            console.info('------ start check server second... ');
            await getServerFileInfo(tcNumber, newPath, CODE_MK_DIR, done, function (serverFileRename) {
                console.info("test_fileio_rename_dir_async_000 getServerFileInfo serverFileRename: " + JSON.stringify(serverFileRename));
                expect(serverFileRename == SERVER_CHECK_SUCCESS).assertTrue();
            })

            fileio.rmdirSync(newPath);
        } catch (e) {
            console.info('test_fileio_rename_dir_async_000 has failed for : ' + e);
            expect(false).assertTrue();
        }
        console.info("--------end test_fileio_rename_dir_async_000--------");
    });

    /**
     * @tc.number  SUB_STORAGE_Distributed_FileIO_RenameDir_0100
     * @tc.name    test_fileio_rename_dir_async_001
     * @tc.desc    Function of API, Test the renameSync interface, rename the directory and returned in callback mode.
     * @tc.level   0
     */
     it('test_fileio_rename_dir_async_001', 0, async function (done) {
        console.info("--------start test_fileio_rename_dir_async_001--------");
        let tcNumber = 'test_fileio_rename_dir_async_001';
        let dpath = await getDistributedFilePath(tcNumber) + 'd';
        try {
            fileio.mkdirSync(dpath);
            fileio.accessSync(dpath, 0);
            console.info('------------- create dir success.');

            console.info('------ start check server first... ');
            await getServerFileInfo(tcNumber, dpath, CODE_MK_DIR, done, function (serverFileCreate) {
                console.info("test_fileio_rename_dir_async_001 getServerFileInfo serverFileCreate: " + JSON.stringify(serverFileCreate));
                expect(serverFileCreate == SERVER_CHECK_SUCCESS).assertTrue();
            })

            let newPath = dpath + "_new";
            console.info('------------ test_fileio_rename_dir_async_001 : newPath = ' + newPath);
            fileio.rename(dpath, newPath, function(err){
                try {
                    fileio.accessSync(newPath, 0);
                    console.info('------------ test_fileio_rename_dir_async_001 : rename file success!');
                } catch (error) {
                    console.info('------------ test_fileio_rename_dir_async_001 : rename file failed!');
                    console.info('test_fileio_rename_dir_async_001 has failed for : ' + error);
                    expect(false).assertTrue();
                }
            });

            console.info('------ start check server second... ');
            await getServerFileInfo(tcNumber, newPath, CODE_MK_DIR, done, function (serverFileRename) {
                console.info("test_fileio_rename_dir_async_001 getServerFileInfo serverFileRename: " + JSON.stringify(serverFileRename));
                expect(serverFileRename == SERVER_CHECK_SUCCESS).assertTrue();
            })

            fileio.rmdirSync(newPath);
        } catch (e) {
            console.info('test_fileio_rename_dir_async_001 has failed for : ' + e);
            expect(false).assertTrue();
        }
        console.info("--------end test_fileio_rename_dir_async_001--------");
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
            await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                console.info("test_fileio_rename_file_sync_000 getServerFileInfo serverFileCreate: " + JSON.stringify(serverFileCreate));
                expect(serverFileCreate == SERVER_CHECK_SUCCESS).assertTrue();
            })

            let newPath = fpath + "_new";
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
                console.info("test_fileio_rename_file_sync_000 getServerFileInfo serverFileRename: " + JSON.stringify(serverFileRename));
                expect(serverFileRename == SERVER_CHECK_SUCCESS).assertTrue();
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
     * @tc.number  SUB_STORAGE_Distributed_FileIO_RenameFile_0000
     * @tc.name    test_fileio_rename_file_async_000
     * @tc.desc    Function of API, Test the rename interface, rename the file and returned in promise mode.
     * @tc.level   0
     */
     it('test_fileio_rename_file_async_000', 0, async function (done) {
        console.info("--------start test_fileio_rename_file_async_000--------");
        let tcNumber = 'test_fileio_rename_file_async_000';
        let fpath = await getDistributedFilePath(tcNumber);
        console.info('fpath == ' + fpath);
        try {
            let fd = fileio.openSync(fpath, 0o102, 0o777);
            fileio.accessSync(fpath, 0);
            console.info('------------- create file success.');

            console.info('------ start check server first... ');
            await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                console.info("test_fileio_rename_file_async_000 getServerFileInfo serverFileCreate: " + JSON.stringify(serverFileCreate));
                expect(serverFileCreate == SERVER_CHECK_SUCCESS).assertTrue();
            })

            let newPath = fpath + "_new";
            console.info('------------ test_fileio_rename_file_async_000 : newPath = ' + newPath);

            await fileio.rename(fpath, newPath);

            try {
                fileio.accessSync(newPath, 0);
                console.info('------------ test_fileio_rename_file_async_000 : rename file success!');
            } catch (error) {
                console.info('test_fileio_rename_file_async_000 has failed for : ' + error);
                console.info('------------ test_fileio_rename_file_async_000 : rename file failed!');
                expect(false).assertTrue();
            }

            console.info('------ start check server second... ');
            await getServerFileInfo(tcNumber, newPath, CODE_CREATE_FILE, done, function (serverFileRename) {
                console.info("test_fileio_rename_file_async_000 getServerFileInfo serverFileRename: " + JSON.stringify(serverFileRename));
                expect(serverFileRename == SERVER_CHECK_SUCCESS).assertTrue();
            })

            fileio.closeSync(fd);
            fileio.unlinkSync(newPath);
        } catch (e) {
            console.info('test_fileio_rename_file_async_000 has failed for : ' + e);
            expect(false).assertTrue();
        }
        console.info("--------end test_fileio_rename_file_async_000--------");
    });

    /**
     * @tc.number  SUB_STORAGE_Distributed_FileIO_RenameFile_0100
     * @tc.name    test_fileio_rename_file_async_001
     * @tc.desc    Function of API, Test the renameSync interface, rename the file and returned in callback mode.
     * @tc.level   0
     */
     it('test_fileio_rename_file_async_001', 0, async function (done) {
        console.info("--------start test_fileio_rename_file_async_001--------");
        let tcNumber = 'test_fileio_rename_file_async_001';
        let fpath = await getDistributedFilePath(tcNumber);
        console.info('fpath == ' + fpath);
        try {
            let fd = fileio.openSync(fpath, 0o102, 0o777);
            fileio.accessSync(fpath, 0);
            console.info('------------- create file success.');

            console.info('------ start check server first... ');
            await getServerFileInfo(tcNumber, fpath, CODE_CREATE_FILE, done, function (serverFileCreate) {
                console.info("test_fileio_rename_file_async_001 getServerFileInfo serverFileCreate: " + JSON.stringify(serverFileCreate));
                expect(serverFileCreate == SERVER_CHECK_SUCCESS).assertTrue();
            })

            let newPath = fpath + "_new";
            console.info('------------ test_fileio_rename_file_async_001 : newPath = ' + newPath);
            fileio.rename(fpath, newPath, function(err){
                try {
                    fileio.accessSync(newPath, 0);
                    console.info('------------ test_fileio_rename_file_async_001 : rename file success!');
                } catch (error) {
                    console.info('------------ test_fileio_rename_file_async_001 : rename file failed!');
                    console.info('test_fileio_rename_file_async_001 has failed for : ' + error);
                    expect(false).assertTrue();
                }
            });

            console.info('------ start check server second... ');
            await getServerFileInfo(tcNumber, newPath, CODE_CREATE_FILE, done, function (serverFileRename) {
                console.info("test_fileio_rename_file_async_001 getServerFileInfo serverFileRename: " + JSON.stringify(serverFileRename));
                expect(serverFileRename == SERVER_CHECK_SUCCESS).assertTrue();
            })

            fileio.closeSync(fd);
            fileio.unlinkSync(newPath);
        } catch (e) {
            console.info('test_fileio_rename_file_async_001 has failed for : ' + e);
            expect(false).assertTrue();
        }
        console.info("--------end test_fileio_rename_file_async_001--------");
    });

    console.info("----------SUB_Storage_Fileio_Distributed JS Test is end----------");
});