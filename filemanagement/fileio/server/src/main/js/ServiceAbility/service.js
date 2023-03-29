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

export default {
    onStart() {
        console.info('FileioServer: onStart')
    },
    onStop() {
        console.info('FileioServer: onStop')
    },
    onCommand(want, startId) {
        console.info('FileioServer: onCommand, want: ' + JSON.stringify(want) + ', startId: ' + startId)
    },
    onConnect(want) {
        console.info('FileioServer: service onConnect called.')
        return new Stub("rpcTestAbility")
    },
    onDisconnect(want) {
        console.info('FileioServer: service onDisConnect called.')
    },
    onReconnect(want) {
        console.info('FileioServer: service onReConnect called.')
    }
}

function checkDirExists(destDirPath) {
    console.info("start check dir :" + destDirPath);
    try {
        fileio.accessSync(destDirPath, 0);
        console.info('------------------- dest dir exists.');
        return true;
    } catch (e) {
        console.info('------------------- dest dir is not exists.');
        return false;
    }
}

function checkFileExists(destFilePath,) {
    console.info("start check file :" + destFilePath);
    try {
        fileio.accessSync(destFilePath, 0);
        console.info('------------------- ' + destFilePath + ' exists.');
        return true;
    } catch (e) {
        console.info('------------------- ' + destFilePath + ' not exists.');
        return false;
    }
}

function getFileContent(fpath) {
    console.info("start get file content:" + fpath);
    let content = "";
    try {
        content = fileio.readTextSync(fpath);
        console.info("-------------- dest file content :" + content);
    } catch (e) {
        content = "serverSide readTextSync failed";
        console.info("-------------- read dest file content failed." + e);
    }
    return content;
}

const CODE_MK_DIR = 1;
const CODE_RM_DIR = 2;
const CODE_CREATE_FILE = 3;
const CODE_DELETE_FILE = 4;
const CODE_GET_FILE_CONTENT = 5;
const CODE_GET_FILE_STAT = 6;
const CODE_FSYNC_FILE = 7;

class Stub extends rpc.RemoteObject {
    constructor(descriptor) {
        super(descriptor);
    }

    onRemoteRequest(code, data, reply, option) {
        try {
            console.info("onRemoteRequest: " + code)
            switch (code) {
                case CODE_MK_DIR:
                {
                    console.info("case CODE_MK_DIR start")
                    let path = data.readString()
                    console.info("The server's readString result is " + path);
                    let checkResult = checkDirExists(path);
                    let result;
                    if (checkResult == true) {
                        result = reply.writeString("SUCCESS");
                    } else {
                        result = reply.writeString("Server side dir synchronization creation failed.");
                    }

                    console.info("The server's writeString result is " + result);
                    return true;
                }
                case CODE_RM_DIR:
                {
                    console.info("case CODE_RM_DIR start");
                    let path = data.readString();
                    console.info("The server's readString result is " + path);
                    let result;
                    try {
                        let dir = fileio.openDirSync(path);
                        result = reply.writeString("Server side dir synchronization creation failed!");
                        dir.closeSync();
                    } catch (error) {
                        result = reply.writeString("SUCCESS");
                    }

                    console.info("The server's writeString result is " + result);
                    return true;
                }
                case CODE_CREATE_FILE:
                {
                    console.info("case CODE_CREATE_FILE start");
                    let path = data.readString();
                    console.info("The server's readString result is " + path);

                    let checkResult = checkFileExists(path);
                    let result;
                    if (checkResult == true) {
                        result = reply.writeString("SUCCESS");
                    } else {
                        result = reply.writeString("Server side file synchronization creation failed!");
                    }

                    console.info("The server's writeString result is " + result);
                    return true;
                }
                case CODE_DELETE_FILE:
                {
                    console.info("case CODE_DELETE_FILE start");
                    let path = data.readString();
                    console.info("The server's readString result is " + path);
                    let result;
                    try {
                        let fd = fileio.openSync(path);
                        result = reply.writeString("Server side file synchronization creation failed!");
                        fileio.closeSync(fd);
                    } catch (error) {
                        result = reply.writeString("SUCCESS");
                    }

                    console.info("The server's writeString result is " + result);
                    return true;
                }
                case CODE_GET_FILE_CONTENT:
                {
                    console.info("case CODE_GET_FILE_CONTENT start");
                    let path = data.readString();
                    console.info("The server's readString result is " + path);
                    checkFileExists(path);
                    let content ="";
                    try {
                        console.info("---------------- start get file content:" + path);
                        content = getFileContent(path);
                        console.info("-------------- dest file content :" + content);
                    } catch (e) {
                        console.info("-------------- read dest file content failed." + e);
                    }

                    let result = reply.writeString(content);
                    console.info("The server's writeString result is " + result);
                    return true;
                }
                case CODE_GET_FILE_STAT:
                {
                    console.info("case CODE_GET_FILE_STAT start");
                    let path = data.readString();
                    console.info("The server's readString result is " + path);
                    let localStat = fileio.statSync(path);
                    let localStatInfo = "localStat.size = " + localStat.size + ",localStat.mode = " + localStat.mode;
                    let result = reply.writeString(localStatInfo);
                    console.info("The server's writeString result is " + result);
                    return true;
                }
                case CODE_FSYNC_FILE:
                {
                    console.info("case CODE_FSYNC_FILE start");
                    let path = data.readString();
                    console.info("The server's readString result is " + path);
                    let result;
                    try{
                        let fd = fileio.openSync(path, 0o2);
                        fileio.fsyncSync(fd);
                        console.info("sync data succeed");
                        result = reply.writeString("SUCCESS");
                    } catch (e) {
                        console.info("sync data failed with error:" + e);
                        result = reply.writeString("FAILED");
                    }
                    console.info("The server's writeString result is " + result);
                    return true;
                }
                default:
                    console.error("default case " + code);
                    return super.onRemoteMessageRequest(code, data, reply, option);
            }
        } catch (error) {
            console.info("onRemoteMessageRequest: " + error);
        }
        return false
    }
}