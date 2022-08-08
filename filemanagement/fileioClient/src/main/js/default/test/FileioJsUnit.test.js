/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

var data;
var reply;
var option;

describe('FileioJsUnitTest', function () {
    console.info("-----------------------SUB_Storage_Fileio_Distributed JS Test is starting-----------------------");

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
     * checkServerResult 发送rpc请求校验服务端数据
     * @param tcNumber 
     * @param dpath 
     * @param codeNumber 
     * @returns boolean
     */
    async function checkServerResult(tcNumber, path, codeNumber, done) {
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
                console.info(tcNumber + " :result.errCode = " + result.errCode);
                // expect(result.errCode == 0).assertTrue();

                var resultToken = result.reply.readString();
                console.info(tcNumber + " :run readString success, result is " + resultToken);
                expect(resultToken == SERVER_CHECK_SUCCESS).assertTrue();
                return true;
            }).catch((err) => {
                console.info(tcNumber + " sendRequest has failed for : " + err);
                return false;
            }).finally(() => {
                data.reclaim();
                reply.reclaim();
                done();
            })
        } catch (e) {
            console.info(tcNumber + " has failed for : " + e);
            return false;
        }
    }

    /**
     * getServerFileInfo 发送rpc请求获取服务端文件内容
     * @param tcNumber 
     * @param dpath 
     * @param codeNumber 
     * @returns string
     */
    async function getServerFileInfo(tcNumber, path, codeNumber, done) {
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
                return resultToken;
            }).catch((err) => {
                console.info(tcNumber + " sendRequest has failed for : " + err);
                return "Empty";
            }).finally(() => {
                data.reclaim();
                reply.reclaim();
                done();
            })
        } catch (e) {
            console.info(tcNumber + " has failed for : " + e);
            return "Empty";
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
            // basePath = await context.getFilesDir(); // /data/storage/el2/base/haps/entry/files
            basePath = await context.getOrCreateDistributedDir();

        } catch (e) {
            console.log("-------------- getDistributedFilePath() failed for : " + e);
        }
        return basePath + "/" + testName;
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
        sleep(2000);
    })
    afterEach(function () {
        console.info('afterEach called');
    })
    afterAll(function () {
        console.info('afterAll called');
    })

    /**
     * 
     * @tc.number  SUB_STORAGE_Distributed_FileIO_OpenSync_0000
     * @tc.name    test_fileio_create_file_sync_000
     * @tc.desc    Function of API, flags=0o102. mode=0o777
     * @tc.level   0
     */
    it("test_fileio_create_file_sync_000", 0, async function (done) {
        console.info("---------------------start test_fileio_create_file_sync_000---------------------------");
        let tcNumber = 'test_fileio_create_file_sync_000';
        let fpath = await getDistributedFilePath(tcNumber);
        console.info('fpath == ' + fpath);
        try {
            // 创建文件
            let fd = fileio.openSync(fpath, 0o102, 0o777);
            console.info('------------- create file success.');
            // 检查文件
            fileio.accessSync(fpath, 0);

            // 检查对端设备文件是否存在
            console.info('------------------- start check server... ');

            try {
                data = rpc.MessageParcel.create();
                reply = rpc.MessageParcel.create();
                option = new rpc.MessageOption();

                var writeResult = data.writeString(fpath);
                console.info(tcNumber + " : run writeString success, writeResult is " + writeResult);
                console.info(tcNumber + " : run writeString success, data is " + data.readString());
                expect(writeResult == true).assertTrue();

                if (gIRemoteObject == undefined) {
                    console.info(tcNumber + " : gIRemoteObject undefined");
                }
                await gIRemoteObject.sendRequest(CODE_CREATE_FILE, data, reply, option).then((result) => {
                    console.info(tcNumber + " : sendRequest success, result is " + result.errCode);
                    // expect(result.errCode == 0).assertTrue();

                    var resultToken = result.reply.readString();
                    console.info(tcNumber + " :run readString success, resultToken is " + resultToken);
                    expect(resultToken == SERVER_CHECK_SUCCESS).assertTrue();
                }).catch((err) => {
                    console.info(tcNumber + " sendRequest has failed for : " + err);
                    expect(false).assertTrue();
                }).finally(() => {
                    data.reclaim();
                    reply.reclaim();
                    done();
                })
            } catch (e) {
                console.info(tcNumber + " has failed for : " + e);
                expect(false).assertTrue();
            }

            // 清理测试环境
            console.info('------------  start clean test environment.');
            fileio.closeSync(fd);
            fileio.unlinkSync(fpath);

        } catch (e) {
            console.info('test_fileio_create_file_sync_000 has failed for : ' + e);
            expect(false).assertTrue();
        }
        console.info("---------------------end test_fileio_create_file_sync_000---------------------------");
    });

    /**
     * 
     * @tc.number   SUB_STORAGE_Distributed_FileIO_UnlinkSync_0000
     * @tc.name     test_fileio_delete_file_sync_000
     * @tc.desc     Function of API, unlinkSync()
     * @tc.level    0
     */
    it('test_fileio_delete_file_sync_000', 0, async function (done) {
        console.info("---------------------start test_fileio_delete_file_sync_000---------------------------");
        let tcNumber = 'test_fileio_delete_file_sync_000';
        let fpath = await getDistributedFilePath(tcNumber);
        console.info('fpath == ' + fpath);
        try {
            // 创建文件
            let fd = fileio.openSync(fpath, 0o102, 0o777);
            console.info('------------ test_fileio_delete_file_sync_000 : create file ...');
            // 检查文件
            try {
                fileio.accessSync(fpath, 0);
            } catch (e) {
                console.info('------------ test_fileio_delete_file_sync_000 : create file failed!');
                expect(false).assertTrue();
            }
            fileio.closeSync(fd);

            // check 对端文件是否存在
            console.info('------------------- start check server first ... ');

            try {
                data = rpc.MessageParcel.create();
                reply = rpc.MessageParcel.create();
                option = new rpc.MessageOption();

                var writeResult_1 = data.writeString(fpath);
                console.info(tcNumber + " : run writeString success, writeResult_1 is " + writeResult_1);
                console.info(tcNumber + " : run writeString success, data is " + data.readString());
                expect(writeResult_1 == true).assertTrue();

                if (gIRemoteObject == undefined) {
                    console.info(tcNumber + " : gIRemoteObject undefined");
                }

                await gIRemoteObject.sendRequest(CODE_CREATE_FILE, data, reply, option).then((result1) => {
                    console.info(tcNumber + " : sendRequest success, result1 is " + result1.errCode);
                    // expect(result.errCode == 0).assertTrue();

                    var resultToken_1 = result1.reply.readString();
                    console.info(tcNumber + " :run readString success, resultToken_1 is " + resultToken_1);
                    expect(resultToken_1 == SERVER_CHECK_SUCCESS).assertTrue();
                }).catch((err) => {
                    console.info(tcNumber + " sendRequest has failed for : " + err);
                    expect(false).assertTrue();
                }).finally(() => {
                    data.reclaim();
                    reply.reclaim();
                    done();
                })
            } catch (e) {
                console.info(tcNumber + " has failed for : " + e);
                expect(false).assertTrue();
            }

            // 删除文件
            fileio.unlinkSync(fpath);
            console.info('------------ test_fileio_delete_file_sync_000 : delete file ...');
            // 检查本地是否删除成功
            try {
                fileio.accessSync(fpath, 0);
                console.info('------------ test_fileio_delete_file_sync_000 : delete file failed!');
                expect(false).assertTrue();
            } catch (e) {
                console.info('------------ test_fileio_delete_file_sync_000 : delete file success!');

                // check 对端文件是否同步被删除
                sleep(1000);
                console.info('------------------- start check server second ... ');

                try {
                    data = rpc.MessageParcel.create();
                    reply = rpc.MessageParcel.create();
                    option = new rpc.MessageOption();

                    var writeResult_2 = data.writeString(fpath);
                    console.info(tcNumber + " : run writeString success, writeResult_2 is " + writeResult_2);
                    console.info(tcNumber + " : run writeString success, data is " + data.readString());
                    expect(writeResult_2 == true).assertTrue();

                    if (gIRemoteObject == undefined) {
                        console.info(tcNumber + " : gIRemoteObject undefined");
                    }

                    await gIRemoteObject.sendRequest(CODE_DELETE_FILE, data, reply, option).then((result2) => {
                        console.info(tcNumber + " : sendRequest success, result2 is " + result2.errCode);
                        // expect(result.errCode == 0).assertTrue();

                        var resultToken_2 = result2.reply.readString();
                        console.info(tcNumber + " : run readString success, resultToken_2 is " + resultToken_2);
                        expect(resultToken_2 == SERVER_CHECK_SUCCESS).assertTrue();
                    }).catch((err) => {
                        console.info(tcNumber + " sendRequest has failed for : " + err);
                        expect(false).assertTrue();
                    }).finally(() => {
                        data.reclaim();
                        reply.reclaim();
                        done();
                    })
                } catch (e) {
                    console.info(tcNumber + " has failed for : " + e);
                    expect(false).assertTrue();
                }
            }
        } catch (e) {
            console.info('test_fileio_delete_file_sync_000 has failed for : ' + e);
            expect(false).assertTrue();
        }
        console.info("---------------------end test_fileio_delete_file_sync_000---------------------------");
    });


    /**
     * 
     * @tc.number  SUB_STORAGE_Distributed_FileIO_Rename_0000
     * @tc.name    test_fileio_rename_file_000
     * @tc.desc    Function of API
     * @tc.level   0
     */
    it('test_fileio_rename_file_000', 0, async function (done) {
        console.info("---------------------start test_fileio_rename_file_000---------------------------");
        let tcNumber = 'test_fileio_rename_file_000';
        let fpath = await getDistributedFilePath(tcNumber);
        console.info('fpath == ' + fpath);
        try {
            // 创建文件
            let fd = fileio.openSync(fpath, 0o102, 0o777);
            // 检查文件
            console.info('------------------- start check client first... ');
            fileio.accessSync(fpath, 0);
            console.info('------------- create file success.');

            // 检查对端设备文件是否存在
            console.info('------------------- start check server first... ');

            try {
                data = rpc.MessageParcel.create();
                reply = rpc.MessageParcel.create();
                option = new rpc.MessageOption();

                var writeResult_1 = data.writeString(fpath);
                console.info(tcNumber + " : run writeString success, writeResult_1 is " + writeResult_1);
                console.info(tcNumber + " : run writeString success, data is " + data.readString());
                expect(writeResult_1 == true).assertTrue();

                if (gIRemoteObject == undefined) {
                    console.info(tcNumber + " : gIRemoteObject undefined");
                }

                await gIRemoteObject.sendRequest(CODE_CREATE_FILE, data, reply, option).then((result1) => {
                    console.info(tcNumber + " : sendRequest success, result1 is " + result1.errCode);

                    var renameToken_1 = result1.reply.readString();
                    console.info(tcNumber + " :run readString success, renameToken_1 is assertequal " + renameToken_1);
                    console.info(tcNumber + " :renameToken_1        =" + renameToken_1);
                    console.info(tcNumber + " :SERVER_CHECK_SUCCESS =" + SERVER_CHECK_SUCCESS);
                    expect(renameToken_1).assertEqual(SERVER_CHECK_SUCCESS);

                }).catch((err) => {
                    console.info(tcNumber + " sendRequest has failed for : " + err);
                    expect(false).assertTrue();
                }).finally(() => {
                    data.reclaim();
                    reply.reclaim();
                    done();
                })
            } catch (e) {
                console.info(tcNumber + " has failed for : " + e);
                expect(false).assertTrue();
            }

            // 本端文件重命名
            let newPath = fpath + "_new";
            console.info('------------ test_fileio_rename_file_000 : newPath = ' + newPath);
            fileio.renameSync(fpath, newPath);
            //检查本端重命名成功
            try {
                fileio.accessSync(newPath, 0);
                console.info('------------ test_fileio_rename_file_000 : rename file success!');
            } catch (error) {
                console.info('------------ test_fileio_rename_file_000 : rename file failed!');
                console.info('test_fileio_rename_file_000 has failed for : ' + error);
                expect(false).assertTrue();
            }
            // 检查对端设备文件是否存在
            console.info('------------------- start check server second... ');

            try {
                data = rpc.MessageParcel.create();
                reply = rpc.MessageParcel.create();
                option = new rpc.MessageOption();

                var writeResult = data.writeString(newPath);
                console.info(tcNumber + " : run writeString success, writeResult is " + writeResult);
                console.info(tcNumber + " : run writeString success, data is " + data.readString());
                expect(writeResult == true).assertTrue();

                if (gIRemoteObject == undefined) {
                    console.info(tcNumber + " : gIRemoteObject undefined");
                }
                await gIRemoteObject.sendRequest(CODE_CREATE_FILE, data, reply, option).then((result2) => {
                    console.info(tcNumber + " : sendRequest success, result2 is " + result2.errCode);
                    // expect(result2.errCode == 0).assertTrue();

                    var renameToken_2 = result2.reply.readString();
                    console.info(tcNumber + " :run readString success, renameToken_2 is " + renameToken_2);
                    expect(renameToken_2 == SERVER_CHECK_SUCCESS).assertTrue();

                }).catch((err) => {
                    console.info(tcNumber + " sendRequest has failed for : " + err);
                    expect(false).assertTrue();

                }).finally(() => {
                    data.reclaim();
                    reply.reclaim();
                    done();
                })
            } catch (e) {
                console.info(tcNumber + " has failed for : " + e);
                expect(false).assertTrue();

            }

            // 清理测试环境
            console.info('------------  start clean test environment.');
            fileio.closeSync(fd);
            fileio.unlinkSync(newPath);

        } catch (e) {
            console.info('test_fileio_rename_file_000 has failed for : ' + e);

        }
        console.info("---------------------end test_fileio_rename_file_000---------------------------");
    });

    /**
     * 
     * @tc.number  SUB_STORAGE_Distributed_FileIO_fSync_0000
     * @tc.name    test_fileio_fSync_file_000
     * @tc.desc    Function of API, fSync()
     * @tc.level   0
     */
    it('test_fileio_fSync_file_000', 0, async function (done) {
        console.info("---------------------start test_fileio_fSync_file_000---------------------------");
        let tcNumber = 'test_fileio_fSync_file_000';
        let fpath = await getDistributedFilePath(tcNumber);

        console.info('fpath == ' + fpath);
        try {
            // 创建文件
            let fd = fileio.openSync(fpath, 0o102, 0o777);

            // 检查对端设备文件是否存在
            console.info('------------------- start check server first(filecreate)... ');

            try {
                data = rpc.MessageParcel.create();
                reply = rpc.MessageParcel.create();
                option = new rpc.MessageOption();

                var writeResult_1 = data.writeString(fpath);
                console.info(tcNumber + " : run writeString success, writeResult_1 is " + writeResult_1);
                console.info(tcNumber + " : run writeString success, data is " + data.readString());
                expect(writeResult_1 == true).assertTrue();

                if (gIRemoteObject == undefined) {
                    console.info(tcNumber + " : gIRemoteObject undefined");
                }

                await gIRemoteObject.sendRequest(CODE_CREATE_FILE, data, reply, option).then((result1) => {
                    console.info(tcNumber + " : sendRequest success, result1 is " + result1.errCode);
                    // expect(result.errCode == 0).assertTrue();

                    var resultToken_1 = result1.reply.readString();
                    console.info(tcNumber + " :run readString success, resultToken_1 is " + resultToken_1);
                    expect(resultToken_1 == SERVER_CHECK_SUCCESS).assertTrue();

                }).catch((err) => {
                    console.info(tcNumber + " sendRequest has failed for : " + err);
                    expect(false).assertTrue();
                }).finally(() => {
                    data.reclaim();
                    reply.reclaim();
                    done();
                })
            } catch (e) {
                console.info(tcNumber + " has failed for : " + e);
                expect(false).assertTrue();
            }

            // 刷新对端文件，查看返回结果
            sleep(2000);
            console.info('------------------- start check server second(sync)... ');

            try {
                data = rpc.MessageParcel.create();
                reply = rpc.MessageParcel.create();
                option = new rpc.MessageOption();

                var writeResult_2 = data.writeString(fpath);
                console.info(tcNumber + " : run writeString success, writeResult_2 is " + writeResult_2);
                console.info(tcNumber + " : run writeString success, data is " + data.readString());
                expect(writeResult_2 == true).assertTrue();

                if (gIRemoteObject == undefined) {
                    console.info(tcNumber + " : gIRemoteObject undefined");
                }

                await gIRemoteObject.sendRequest(CODE_FSYNC_FILE, data, reply, option).then((result2) => {
                    console.info(tcNumber + " : sendRequest success, result2 is " + result2.errCode);
                    // expect(result.errCode == 0).assertTrue();

                    var resultToken_2 = result2.reply.readString();
                    console.info(tcNumber + " :run readString success, resultToken_2 is " + resultToken_2);

                    expect(resultToken_2 == SERVER_CHECK_SUCCESS).assertTrue();
                }).catch((err) => {
                    console.info(tcNumber + " sendRequest has failed for : " + err);
                    expect(false).assertTrue();
                }).finally(() => {
                    data.reclaim();
                    reply.reclaim();
                    done();
                })
            } catch (e) {
                console.info(tcNumber + " has failed for : " + e);
                expect(false).assertTrue();
            }

            // 清理测试环境
            console.info('------------  start clean test environment.');
            fileio.closeSync(fd);
            fileio.unlinkSync(fpath);
        } catch (e) {
            console.info('test_fileio_fSync_file_000 has failed for : ' + e);
            expect(false).assertTrue();
        }
        console.info("---------------------end test_fileio_fSync_file_000---------------------------");
    });

    console.info("-----------------------SUB_Storage_Fileio_Distributed JS Test is end-----------------------");
});
