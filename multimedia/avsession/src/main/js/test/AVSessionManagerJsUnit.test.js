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
import avSession from "@ohos.multimedia.avsession";
import featureAbility from '@ohos.ability.featureAbility';
import deviceManager from '@ohos.distributedHardware.deviceManager';
import process from "@ohos.process";
import audio from "@ohos.multimedia.audio";
import TestService from "./testService";
import "./testService";
import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from '@ohos/hypium';
import { UiDriver, BY } from '@ohos.UiTest'

export default function AVSessionManagerJsUnit() {
    describe('AVSessionManagerJsUnit', function () {
        console.info("----------AVSession_Manager_Distributed JS Test is starting----------");
        const CODE_CAST_AUDIO = 1;
        let tag = "Application";
        let type = 'audio';
        let context = featureAbility.getContext();
        let session;
        let controller;
        let sessionId;
        let pid = process.pid;
        let uid = process.uid;
        let sessionToken;
        let audioDevices;
        let remoteDeviceId;
        let metadata1 = {
            assetId: "121278",
            artist: "Eminem",
        };
        let gIRemoteObject = null;
        let audioManager;
        let localAudioDevice;
        let testservice = null;
        let localDeviceId = undefined;
        let dvList = [];
        let dvId = null;

        deviceManager.createDeviceManager('com.example.myapplication', async (error, deviceManager) => {
            console.info("Client ceate device manager success");
            localDeviceId = deviceManager.getLocalDeviceInfoSync().deviceId;
            console.info("local device id is: " + localDeviceId);
            let deviceList = deviceManager.getTrustedDeviceListSync();
            dvList = deviceList;
            let deviceId = deviceList[0].deviceId;
            dvId = deviceId;
            console.info("deviceid is: " + deviceId)
            console.info("deviceList is: " + JSON.stringify(deviceList))
        })

        function sleep(time) {
            return new Promise(resolve => setTimeout(resolve, time));
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
                console.info(`come in driveFn`)
                console.info(`driver is ${JSON.stringify(driver)}`)
                await sleep(2000);
                let button = await driver.findComponent(BY.text('允许'));
                console.info(`button is ${JSON.stringify(button)}`);
                await sleep(5000);
                await button.click();
            } catch (err) {
                console.info('err is ' + err);
                return;
            }
        }

        beforeAll(async function (done) {
            console.info('beforeAll called avsession server');
            await getPermission();
            sleep(5000);
            await driveFn();
            sleep(100);

            await avSession.createAVSession(context, tag, type).then((data) => {
                session = data;
                sessionId = session.sessionId;
                sessionToken = { sessionId, pid, uid };
                console.info(sessionToken.pid);
                console.info(sessionToken.uid);
            }).catch((err) => {
                console.info(`Session create BusinessError: ${err.code}, message: ${err.message}`);
                expect(false).assertTrue();
            });
            await session.activate().then(() => {
                console.info('Session activate');
            }).catch((err) => {
                console.info(`Session activate BusinessError: ${err.code}, message: ${err.message}`);
                expect(false).assertTrue();
            })

            await session.setAVMetadata(metadata1).then(() => {
                console.info('Set artist successfully');
            }).catch((err) => {
                console.info(`Set artist BusinessError: ${err.code}, message: ${err.message}`);
                expect(false).assertTrue();
            })
            audioManager = audio.getAudioManager().getRoutingManager();
            await audioManager.getDevices(audio.DeviceFlag.DISTRIBUTED_OUTPUT_DEVICES_FLAG).then((data) => {
                console.info('get remote device success');
                audioDevices = data;
                remoteDeviceId = audioDevices[0].id;
                audioDevices[0].name = 'name';
                audioDevices[0].address = 'address';
            }).catch((err) => {
                console.info(`Get device BusinessError: ${err.code}, message: ${err.message}`);
                expect(false).assertTrue();
            });

            await audioManager.getDevices(audio.DeviceFlag.OUTPUT_DEVICES_FLAG).then((data) => {
                console.info('get localDevice successfully');
                localAudioDevice = data;
                localAudioDevice[0].name = 'name';
                localAudioDevice[0].address = 'address';
            }).catch((err) => {
                console.info(`Get device BusinessError: ${err.code}, message: ${err.message}`);
                expect(false).assertTrue();
            });

            sleep(1500);
            testservice = new TestService
            await testservice.toConnectAbility().then(data => {
                gIRemoteObject = data;
                console.info("toConnectAbility data is:" + data);
            })
            done();
            console.info('beforeAll done');
        })
        beforeEach(async function () {
            await sleep(1000);
            console.info('beforeEach called');
        })
        afterEach(function () {
            console.info('afterEach called');
        })
        afterAll(async function (done) {
            console.info('afterAll called');
            await session.destroy();
            done();
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_CAST_AUDIO_CALLBACK_0100
         * @tc.name      : CAST_AUDIO_0100
         * @tc.desc      : Testing cast audio with all session
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_CAST_AUDIO_CALLBACK_0100", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                avSession.castAudio('all', audioDevices, (err) => {
                    if (err) {
                        console.info(`Cast audio to remote device BusinessError: ${err.code}, message: ${err.message}`);
                        expect(false).assertTrue();
                    } else {
                        console.info('Cast audio to remote device');
                    }
                });
                await sleep(1500);
                try {
                    let data = rpc.MessageParcel.create();
                    let reply = rpc.MessageParcel.create();
                    let option = new rpc.MessageOption();

                    if (gIRemoteObject === undefined) {
                        console.info('gIRemoteObject undefined');
                    }

                    await gIRemoteObject.sendRequest(CODE_CAST_AUDIO, data, reply, option).then((result) => {
                        console.info(`sendRequest success, result is ${result.errCode}`);
                        let remoteResult = result.reply.readString();
                        console.info(`Run readString success, remoteResult is ${remoteResult}`);
                        expect(remoteResult === 'case 1 get successfully').assertTrue();
                    }).catch((err) => {
                        console.info(`sendRequest has failed BusinessError: ${err.code}, message: ${err.message}`);
                        expect(false).assertTrue();
                    }).finally(() => {
                        data.reclaim();
                        reply.reclaim();
                    });
                } catch (err) {
                    console.info(`Testing has failed BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                }
                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local device');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                await sleep(1000);
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_CAST_AUDIO_PROMISE_0100
         * @tc.name      : CAST_AUDIO_0100
         * @tc.desc      : Testing cast audio
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_CAST_AUDIO_PROMISE_0100", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                await avSession.castAudio('all', audioDevices).then(() => {
                    console.info('Cast audio to remote');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })

                await sleep(1500);

                try {
                    let data = rpc.MessageParcel.create();
                    let reply = rpc.MessageParcel.create();
                    let option = new rpc.MessageOption();

                    if (gIRemoteObject === undefined) {
                        console.info('gIRemoteObject undefined');
                    }

                    await gIRemoteObject.sendRequest(CODE_CAST_AUDIO, data, reply, option).then((result) => {
                        console.info(`sendRequest success, result is ${result.errCode}`);
                        let remoteResult = result.reply.readString();
                        console.info(`Run readString success, remoteResult is ${remoteResult}`);
                        expect(remoteResult === 'case 1 get successfully').assertTrue();
                    }).catch((err) => {
                        console.info(`sendRequest has failed BusinessError: ${err.code}, message: ${err.message}`);
                        expect(false).assertTrue();
                    }).finally(() => {
                        data.reclaim();
                        reply.reclaim();
                    });
                } catch (err) {
                    console.info(`Testing has failed BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                }

                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local device');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                await sleep(1000);
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_CAST_AUDIO_CALLBACK_0200
         * @tc.name      : CAST_AUDIO_0200
         * @tc.desc      : Testing cast audio
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_CAST_AUDIO_CALLBACK_0200", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                avSession.castAudio(sessionToken, audioDevices, (err) => {
                    if (err) {
                        console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                        expect(false).assertTrue();
                    } else {
                        console.info('Cast audio to remote device');
                    }
                });
                await sleep(1500);
                try {
                    let data = rpc.MessageParcel.create();
                    let reply = rpc.MessageParcel.create();
                    let option = new rpc.MessageOption();

                    if (gIRemoteObject === undefined) {
                        console.info('gIRemoteObject undefined');
                    }

                    await gIRemoteObject.sendRequest(CODE_CAST_AUDIO, data, reply, option).then((result) => {
                        console.info(`sendRequest success, result is ${result.errCode}`);
                        let remoteResult = result.reply.readString();
                        console.info(`Run readString success, remoteResult is ${remoteResult}`);
                        expect(remoteResult === 'case 1 get successfully').assertTrue();
                    }).catch((err) => {
                        console.info(`sendRequest has failed BusinessError: ${err.code}, message: ${err.message}`);
                        expect(false).assertTrue();
                    }).finally(() => {
                        data.reclaim();
                        reply.reclaim();
                    });
                } catch (err) {
                    console.info(`Testing has failed BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                }
                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local device');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                await sleep(1000);
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_CAST_AUDIO_PROMISE_0200
         * @tc.name      : CAST_AUDIO_0200
         * @tc.desc      : Testing cast audio with all session
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_CAST_AUDIO_PROMISE_0200", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to remote');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })

                await sleep(1500);

                try {
                    let data = rpc.MessageParcel.create();
                    let reply = rpc.MessageParcel.create();
                    let option = new rpc.MessageOption();

                    if (gIRemoteObject === undefined) {
                        console.info('gIRemoteObject undefined');
                    }

                    await gIRemoteObject.sendRequest(CODE_CAST_AUDIO, data, reply, option).then((result) => {
                        console.info(`sendRequest success, result is ${result.errCode}`);
                        let remoteResult = result.reply.readString();
                        console.info(`Run readString success, remoteResult is ${remoteResult}`);
                        expect(remoteResult === 'case 1 get successfully').assertTrue();
                    }).catch((err) => {
                        console.info(`sendRequest has failed BusinessError: ${err.code}, message: ${err.message}`);
                        expect(false).assertTrue();
                    }).finally(() => {
                        data.reclaim();
                        reply.reclaim();
                    });
                } catch (err) {
                    console.info(`Testing has failed BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                }

                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local device');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                await sleep(1000);
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_CAST_AUDIO_PROMISE_0300
         * @tc.name      : CAST_AUDIO_0300
         * @tc.desc      : Testing cast audio to local
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_CAST_AUDIO_PROMISE_0300", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to remote device');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })

                await sleep(1500);

                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local device');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                await sleep(1500);
                await session.getOutputDevice().then((data) => {
                    if (!data.isRemote) {
                        console.info('Get device information successfully');
                        expect(true).assertTrue();
                    } else {
                        console.info('Get device information failed');
                        expect(false).assertTrue();
                    }
                }).catch((err) => {
                    console.info(`Get device information BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_CAST_AUDIO_CALLBACK_0300
         * @tc.name      : CAST_AUDIO_0300
         * @tc.desc      : Testing cast audio to local
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_CAST_AUDIO_CALLBACK_0300", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                avSession.castAudio(sessionToken, audioDevices, (err) => {
                    if (err) {
                        console.info(`Cast audio BusinessError: ${err.code}, message: ${err.message}`);
                        expect(false).assertTrue();
                    } else {
                        console.info('Cast audio to remote device');
                    }
                });

                await sleep(1500);

                avSession.castAudio(sessionToken, localAudioDevice, (err) => {
                    if (err) {
                        console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                        expect(false).assertTrue();
                    } else {
                        console.info('Cast audio to local device');
                    }
                });

                await sleep(1500);
                await session.getOutputDevice().then((data) => {
                    if (!data.isRemote) {
                        console.info('Get device information successfully');
                        expect(true).assertTrue();
                    } else {
                        console.info('Get device information failed');
                        expect(false).assertTrue();
                    }
                }).catch((err) => {
                    console.info(`Get device information BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_ONOUTPUTDEVICE_CHANGE_0100
         * @tc.name      : ONOUTPUTDEVICE_CHANGE_0100
         * @tc.desc      : Testing output device change callback
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_ONOUTPUTDEVICE_CHANGE_0100", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                session.on('outputDeviceChange', (callback) => {
                    if (callback.isRemote) {
                        console.info(callback.deviceId.size);
                        console.info(callback.deviceName.size);
                        console.info('outputDeviceChange callback registration successful');
                        expect(true).assertTrue();
                    } else {
                        console.info('outputDeviceChange callback registration fail');
                        expect(false).assertTrue();
                    }
                });

                await sleep(1500);

                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to remote');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })

                await sleep(1500);
                session.off('outputDeviceChange');

                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_OFFOUTPUTDEVICE_CHANGE_0100
         * @tc.name      : OFFOUTPUTDEVICE_CHANGE_0100
         * @tc.desc      : Testing output device change callback
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_OFFOUTPUTDEVICE_CHANGE_0100", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                let flag = true;
                function callback1(callback) {
                    if (callback.isRemote) {
                        console.info('Outputdevicechanged callback registration successful');
                        flag = false;
                    }
                }

                function callback2(callback) {
                    if (callback.isRemote) {
                        console.info('Outputdevicechanged callback registration successful');
                        flag = false;
                    }
                }

                session.on('outputDeviceChange', callback1);

                session.on('outputDeviceChange', callback2);

                session.off('outputDeviceChange');

                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to remote');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })

                await sleep(1000);
                if (flag) {
                    console.info('Outputdevicechanged callback unRegistration successful');
                    expect(true).assertTrue();
                } else {
                    console.info('Outputdevicechanged callback unRegistration failed');
                    expect(false).assertTrue();
                }
                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_OFFOUTPUTDEVICE_CHANGE_0200
         * @tc.name      : OFFOUTPUTDEVICE_CHANGE_0200
         * @tc.desc      : Testing output device change callback
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_OFFOUTPUTDEVICE_CHANGE_0200", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                let flag = false;
                function callback1(callback) {
                    if (callback.isRemote) {
                        console.info('Outputdevicechanged callback registration successful');
                        flag = true;
                    }
                }

                function callback2(callback) {
                    if (callback.isRemote) {
                        console.info('Outputdevicechanged callback registration successful');
                        flag = false;
                    }
                }

                session.on('outputDeviceChange', callback1);

                session.on('outputDeviceChange', callback2);

                session.off('outputDeviceChange', callback2);

                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to remote');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })

                await sleep(1500);
                if (flag) {
                    console.info('Outputdevicechanged callback unRegistration successful');
                    expect(true).assertTrue();
                } else {
                    console.info('Outputdevicechanged callback unRegistration failed');
                    expect(false).assertTrue();
                }
                session.off('outputDeviceChange', callback1);
                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_ONOUTPUTDEVICE_CHANGE_0200
         * @tc.name      : ONOUTPUTDEVICE_CHANGE_0200
         * @tc.desc      : Testing output device change callback
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_ONOUTPUTDEVICE_CHANGE_0200", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                await avSession.createController(session.sessionId).then((data) => {
                    console.info('Controller create successful');
                    controller = data;
                }).catch((err) => {
                    console.info(`Controller create BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })

                controller.on('outputDeviceChange', (callback) => {
                    if (callback.isRemote) {
                        console.info('outputDeviceChange callback registration successful');
                        expect(true).assertTrue();
                    } else {
                        console.info('outputDeviceChange callback registration fail');
                        expect(false).assertTrue();
                    }
                });

                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to remote device');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })

                await sleep(1500);
                controller.off('outputDeviceChange');

                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                await controller.destroy();
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_OFFOUTPUTDEVICE_CHANGE_0300
         * @tc.name      : OFFOUTPUTDEVICE_CHANGE_0300
         * @tc.desc      : Testing output device change callback
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_OFFOUTPUTDEVICE_CHANGE_0300", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                await avSession.createController(session.sessionId).then((data) => {
                    console.info('Controller create successful');
                    controller = data;
                }).catch((err) => {
                    console.info(`Controller create BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                let flag = true;
                function callback1(callback) {
                    if (callback.isRemote) {
                        console.info('Outputdevicechanged callback registration successful');
                        flag = false;
                    }
                }

                function callback2(callback) {
                    if (callback.isRemote) {
                        console.info('Outputdevicechanged callback registration successful');
                        flag = false;
                    }
                }

                controller.on('outputDeviceChange', callback1);

                controller.on('outputDeviceChange', callback2);

                controller.off('outputDeviceChange');

                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to remote');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })

                await sleep(1000);
                if (flag) {
                    console.info('Outputdevicechanged callback unRegistration successful');
                    expect(true).assertTrue();
                } else {
                    console.info('Outputdevicechanged callback unRegistration failed');
                    expect(false).assertTrue();
                }
                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                await controller.destroy();
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_OFFOUTPUTDEVICE_CHANGE_0400
         * @tc.name      : OFFOUTPUTDEVICE_CHANGE_0400
         * @tc.desc      : Testing output device change callback
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_OFFOUTPUTDEVICE_CHANGE_0400", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                await avSession.createController(session.sessionId).then((data) => {
                    console.info('Controller create successful');
                    controller = data;
                }).catch((err) => {
                    console.info(`Controller create BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                let flag = false;
                function callback1(callback) {
                    if (callback.isRemote) {
                        console.info('Outputdevicechanged callback registration successful');
                        flag = true;
                    }
                }

                function callback2(callback) {
                    if (callback.isRemote) {
                        console.info('Outputdevicechanged callback registration successful');
                        flag = false;
                    }
                }

                controller.on('outputDeviceChange', callback1);

                controller.on('outputDeviceChange', callback2);

                controller.off('outputDeviceChange', callback2);

                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to remote');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })

                await sleep(1500);
                if (flag) {
                    console.info('Outputdevicechanged callback unRegistration successful');
                    expect(true).assertTrue();
                } else {
                    console.info('Outputdevicechanged callback unRegistration failed');
                    expect(false).assertTrue();
                }
                controller.off('outputDeviceChange', callback1);
                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                await controller.destroy();
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_GETCONTROLLER_PROMISE_0100
         * @tc.name      : GETCONTROLLER_PROMISE_0100
         * @tc.desc      : Testing get controller
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_GETCONTROLLER_PROMISE_0100", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                await avSession.createController(session.sessionId).then((data) => {
                    console.info('Controller create successful');
                    controller = data;
                }).catch((err) => {
                    console.info(`Controller create BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });

                await session.getController().then((data) => {
                    if (controller.sessionId === data.sessionId) {
                        console.info('Get controller successfully');
                        expect(true).assertTrue();
                    } else {
                        console.info('Get controller failed');
                        expect(false).assertTrue();
                    }
                }).catch((err) => {
                    console.info(`Get controller BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                await controller.destroy();
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_PROMISE_0100
         * @tc.name      : GETOUTPUTDEVICE_PROMISE_0100
         * @tc.desc      : Testing get output device
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_PROMISE_0100", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to remote');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                await sleep(1500);
                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                await sleep(1500);
                await session.getOutputDevice().then((data) => {
                    if (!data.isRemote) {
                        console.info('Get device information successfully');
                        expect(true).assertTrue();
                    } else {
                        console.info('Get device information failed');
                        expect(false).assertTrue();
                    }
                }).catch((err) => {
                    console.info(`Get device BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_PROMISE_0200
         * @tc.name      : GETOUTPUTDEVICE_PROMISE_0200
         * @tc.desc      : Testing get output device
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_PROMISE_0200", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to remote');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                await sleep(1500);
                await session.getOutputDevice().then((data) => {
                    if (data.isRemote) {
                        console.info('Get device information successfully');
                        expect(true).assertTrue();
                    } else {
                        console.info('Get device information failed');
                        expect(false).assertTrue();
                    }
                }).catch((err) => {
                    console.info(`Get device BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_PROMISE_0300
         * @tc.name      : GETOUTPUTDEVICE_PROMISE_0300
         * @tc.desc      : Testing get output device
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_PROMISE_0300", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                await avSession.createController(session.sessionId).then((data) => {
                    console.info('Controller create successful');
                    controller = data;
                }).catch((err) => {
                    console.info(`Controller create BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to remote');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                })
                await sleep(1500);
                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                await sleep(1500);
                await session.getOutputDevice().then((data) => {
                    if (!data.isRemote) {
                        console.info('Get device information successfully');
                        expect(true).assertTrue();
                    } else {
                        console.info('Get device information failed');
                        expect(false).assertTrue();
                    }
                }).catch((err) => {
                    console.info(`Get device BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                await controller.destroy();
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_PROMISE_0400
         * @tc.name      : GETOUTPUTDEVICE_PROMISE_0400
         * @tc.desc      : Testing get output device
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_PROMISE_0400", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                await avSession.createController(session.sessionId).then((data) => {
                    console.info('Controller create successful');
                    controller = data;
                }).catch((err) => {
                    console.info(`Controller create BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });

                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to remote');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });

                await sleep(1500);

                await session.getOutputDevice().then((data) => {
                    if (data.isRemote) {
                        console.info('Get device information successfully');
                        expect(true).assertTrue();
                    } else {
                        console.info('Get device information failed');
                        expect(false).assertTrue();
                    }
                }).catch((err) => {
                    console.info(`Get device BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                await controller.destroy();
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_CALLBACK_0100
         * @tc.name      : GETOUTPUTDEVICE_CALLBACK_0100
         * @tc.desc      : Testing get output device
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_CALLBACK_0100", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                session.getOutputDevice((err, value) => {
                    if (err) {
                        console.info(`Get device information BusinessError: ${err.code}, message: ${err.message}`);
                        expect(false).assertTrue();
                    } else if (!value.isRemote) {
                        console.info('Get device information successfully');
                        expect(true).assertTrue();
                    } else {
                        console.info('Get device information failed');
                        expect(false).assertTrue();
                    }
                });
                await sleep(2000);
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_CALLBACK_0200
         * @tc.name      : GETOUTPUTDEVICE_CALLBACK_0200
         * @tc.desc      : Testing get output device
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_CALLBACK_0200", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to remote');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                await sleep(1500);
                session.getOutputDevice((err, value) => {
                    if (err) {
                        console.info(`Get device information BusinessError: ${err.code}, message: ${err.message}`);
                        expect(false).assertTrue();
                    } else if (value.isRemote) {
                        console.info('Get device information successfully');
                        expect(true).assertTrue();
                    } else {
                        console.info('Get device information failed');
                        expect(false).assertTrue();
                    }
                });
                await sleep(1500);
                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_CALLBACK_0300
         * @tc.name      : GETOUTPUTDEVICE_CALLBACK_0300
         * @tc.desc      : Testing get output device
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_CALLBACK_0300", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                await avSession.createController(session.sessionId).then((data) => {
                    console.info('Controller create successful');
                    controller = data;
                }).catch((err) => {
                    console.info(`Controller create BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to remote');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                await sleep(500);
                await avSession.castAudio(sessionToken, localAudioDevice).then(() => {
                    console.info('Cast audio to local');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                await sleep(500);
                controller.getOutputDevice((err, value) => {
                    if (err) {
                        console.info(`Get device information BusinessError: ${err.code}, message: ${err.message}`);
                        expect(false).assertTrue();
                    } else if (!value.isRemote) {
                        console.info('Get device information successfully');
                        expect(true).assertTrue();
                    } else {
                        console.info('Get device information failed');
                        expect(false).assertTrue();
                    }
                });
                await sleep(1500);
                controller.destroy();
                done();
            }
        })

        /**
         * @tc.number    : SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_CALLBACK_0400
         * @tc.name      : GETOUTPUTDEVICE_CALLBACK_0400
         * @tc.desc      : Testing get output device
         * @tc.size      : MediumTest
         * @tc.type      : Function
         * @tc.level     : Level2
         */
        it("SUB_MULTIMEDIA_AVSESSION_GETOUTPUTDEVICE_CALLBACK_0400", 0, async function (done) {
            if (Object.keys(audioDevices).length === 0) {
                expect(true).assertTrue();
                done();
            } else {
                await avSession.createController(session.sessionId).then((data) => {
                    console.info('Controller create success');
                    controller = data;
                }).catch((err) => {
                    console.info(`Controller create BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to remote');
                }).catch((err) => {
                    console.info(`Cast audio to remote BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                await sleep(500);
                controller.getOutputDevice((err, value) => {
                    if (err) {
                        console.info(`Get device information BusinessError: ${err.code}, message: ${err.message}`);
                        expect(false).assertTrue();
                    } else if (value.isRemote) {
                        console.info('Get device information successfully');
                        expect(true).assertTrue();
                    } else {
                        console.info('Get device information failed');
                        expect(false).assertTrue();
                    }
                });
                await sleep(1500);
                await avSession.castAudio(sessionToken, audioDevices).then(() => {
                    console.info('Cast audio to local');
                }).catch((err) => {
                    console.info(`Cast audio to local BusinessError: ${err.code}, message: ${err.message}`);
                    expect(false).assertTrue();
                });
                controller.destroy();
                done();
            }
        })

        console.info("----------SUB_Multimedia_AV_Session_Distributed JS Test is end----------");
    });
}