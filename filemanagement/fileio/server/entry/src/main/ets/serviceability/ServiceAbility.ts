/*
 * Copyright (c) 2022-2024 Huawei Device Co., Ltd.
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

import ServiceExtension from '@ohos.app.ability.ServiceExtensionAbility';
import rpc from "@ohos.rpc";
import fileio from '@ohos.fileio';
import fs from '@ohos.file.fs';
import wantAgent from '@ohos.wantAgent';
import backgroundTaskManager from '@ohos.backgroundTaskManager';

function startContinuousTask() {
    let wantAgentInfo = {
        wants: [
            {
                bundleName: "com.acts.fileio.test.server",
                abilityName: "com.acts.fileio.test.server.ServiceAbility"
            }
        ],
        operationType: wantAgent.OperationType.START_SERVICE,
        requestCode: 0,
        wantAgentFlags: [wantAgent.WantAgentFlags.UPDATE_PRESENT_FLAG]
    };

    wantAgent.getWantAgent(wantAgentInfo).then((wantAgentObj) => {
        try{
            backgroundTaskManager.startBackgroundRunning(this.context, backgroundTaskManager.BackgroundMode.MULTI_DEVICE_CONNECTION, wantAgentObj).then(() => {
              console.info("Operation startBackgroundRunning succeeded");
            }).catch((err) => {
              console.error("Operation startBackgroundRunning failed Cause: " + err);
            });
        }catch(error){
            console.error(`Operation startBackgroundRunning failed. code is ${error.code} message is ${error.message}`);
        }
    });
}

function stopContinuousTask() {
    try{
      backgroundTaskManager.stopBackgroundRunning(this.context).then(() => {
        console.info("Operation stopBackgroundRunning succeeded");
      }).catch((err) => {
        console.error("Operation stopBackgroundRunning failed Cause: " + err);
      });
    }catch(error){
      console.error(`Operation stopBackgroundRunning failed. code is ${error.code} message is ${error.message}`);
    }
}

export default class ServiceAbility extends ServiceExtension {
    onCreate(want) {
        // Called to return a FormBindingData object.
        console.info("FileioServer ServiceAbility onCreate")
    }

    onConnect(want) {
        // Called when the form provider is notified that a temporary form is successfully
        console.info("FileioServer ServiceAbility onConnect")
        return new Stub("rpcTestAbility");
    }

    onDisconnect(want) {
        // Called to notify the form provider to update a specified form.
        console.info("FileioServer ServiceAbility onDisconnect")
    }

    onRequest(want, startId){
        console.info("FileioServer ServiceAbility onRequest")

    }

    onDestroy() {
        // Called to notify the form provider that a specified form has been destroyed.
        console.info("IpcStageServer ServiceAbility onCronDestroyeate")

    }
}

function checkDirExists(destDirPath) {
    console.info("start check dir :" + destDirPath);
    try {
        let res = fs.accessSync(destDirPath);
        console.info('------------------- dest dir exists.');
        return res;
    } catch (e) {
        console.info('------------------- dest dir is not exists.');
        return false;
    }
}

function checkFileExists(destFilePath,) {
    console.info("start check file :" + destFilePath);
    try {
        let res = fs.accessSync(destFilePath);
        console.info('------------------- ' + destFilePath + ' exists.');
        return res;
    } catch (e) {
        console.info('------------------- ' + destFilePath + ' not exists.');
        return false;
    }
}

function getFileContent(fpath) {
    console.info("start get file content:" + fpath);
    let content = "";
    try {
        content = fs.readTextSync(fpath);
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

    async onRemoteMessageRequest(code, data, reply, option) {
        try{
            console.info("async onRemoteMessageRequest: " + code);
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
                        let file = fs.openSync(path);
                        result = reply.writeString("Server side dir synchronization delete failed!");
                        fs.closeSync(file);
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
                        let file = fs.openSync(path);
                        result = reply.writeString("Server side file synchronization delete failed!");
                        fs.closeSync(file);
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
                        let file = fs.openSync(path, fs.OpenMode.READ_WRITE);
                        fs.fsyncSync(file.fd);
                        fs.closeSync(file);
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
            console.info("async onRemoteMessageRequest: " + error);
        }
        return false
    }
}