/*
 * Copyright (c) 2023-2024 Huawei Device Co., Ltd.
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

#ifndef DISTRIBUTED_AUDIO_TEST_H
#define DISTRIBUTED_AUDIO_TEST_H

#include <chrono>
#include <iostream>
#include <string>
#include <cstdlib>
#include <sys/stat.h>
#include <thread>
#include <vector>

#include <v1_0/iaudio_adapter.h>
#include <v1_0/iaudio_manager.h>
#include <v1_0/iaudio_callback.h>
#include <v1_0/audio_types.h>
#include "distributed_hardware_log.h"
enum class DeviceStatus : uint32_t {
    DEVICE_IDLE = 0,
    DEVICE_OPEN = 1,
    DEVICE_START = 2,
    DEVICE_STOP = 3,
};

struct WAV_HEADER {
    /* RIFF Chunk Descriptor */
    uint8_t riff[4] = {'R', 'I', 'F', 'F'};
    uint32_t chunkSize = 0;
    uint8_t wave[4] = {'W', 'A', 'V', 'E'};
    /* "fmt" sub-chunk */
    uint8_t fmt[4] = {'f', 'm', 't', ' '};
    uint32_t subchunk1Size = 16;
    uint16_t audioFormat = 1;
    uint16_t numOfChan = 2;
    uint32_t samplesPerSec = 44100;
    uint32_t bytesPerSec = 176400;
    uint16_t blockAlign = 2;
    uint16_t bitsPerSample = 16;
    /* "data" sub-chunk */
    uint8_t subchunk2ID[4] = {'d', 'a', 't', 'a'};
    uint32_t subchunk2Size = 0;
};

enum DAudioErrorCode {
    DH_SUCCESS = 0,
    ERR_DH_AUDIO_NULLPTR = -40000,
    ERR_DH_AUDIO_FAILED = -40001,
    ERR_DH_AUDIO_NOT_SUPPORT = -40002,

    ERR_DH_AUDIO_SA_WRITE_INTERFACE_TOKEN_FAILED = -40003,
    ERR_DH_AUDIO_SA_WRITE_PARAM_FAIED = -40004,
    ERR_DH_AUDIO_SA_CALLBACK_NOT_FOUND = -40005,
    ERR_DH_AUDIO_SA_INVALID_INTERFACE_TOKEN = -40006,
    ERR_DH_AUDIO_SA_WAIT_TIMEOUT = -40007,
    ERR_DH_AUDIO_SA_PARAM_INVALID = -40008,
    ERR_DH_AUDIO_SA_DEVICE_NOT_EXIST = -40009,
    ERR_DH_AUDIO_SA_PROXY_NOT_INIT = -40010,
    ERR_DH_AUDIO_SA_LOAD_FAILED = -40011,
    ERR_DH_AUDIO_SA_STATUS_ERR = -40012,
    ERR_DH_AUDIO_NOT_FOUND_KEY = -40013,
    ERR_DH_AUDIO_SA_DEVID_ILLEGAL = -40014,
    ERR_DH_AUDIO_SA_PERMISSION_FAIED = -40015,

    // trans error
    ERR_DH_AUDIO_TRANS_ERROR = -40015,
    ERR_DH_AUDIO_TRANS_ILLEGAL_OPERATION = -40016,
    ERR_DH_AUDIO_TRANS_SESSION_NOT_OPEN = -40017,

    // codec error
    ERR_DH_AUDIO_BAD_VALUE = -42000,
    ERR_DH_AUDIO_BAD_OPERATE = -42001,
    ERR_DH_AUDIO_CODEC_CONFIG = -42002,
    ERR_DH_AUDIO_CODEC_START = -42003,
    ERR_DH_AUDIO_CODEC_STOP = -42004,
    ERR_DH_AUDIO_CODEC_RELEASE = -42005,
    ERR_DH_AUDIO_CODEC_INPUT = -42006,

    // spk client error
    ERR_DH_AUDIO_CLIENT_PARAM_ERROR = -43000,
    ERR_DH_AUDIO_CLIENT_RENDER_CREATE_FAILED = -43001,
    ERR_DH_AUDIO_CLIENT_RENDER_STARTUP_FAILURE = -43002,
    ERR_DH_AUDIO_CLIENT_RENDER_STOP_FAILED = -43003,
    ERR_DH_AUDIO_CLIENT_RENDER_RELEASE_FAILED = -43004,
    ERR_DH_AUDIO_CLIENT_SET_VOLUME_FAILED = -43005,
    ERR_DH_AUDIO_CLIENT_SET_MUTE_FAILED = -43006,

    // mic client error
    ERR_DH_AUDIO_CLIENT_CAPTURER_CREATE_FAILED = -43007,
    ERR_DH_AUDIO_CLIENT_CAPTURER_START_FAILED = -43008,

    // other error
    ERR_DH_AUDIO_HDI_CALL_FAILED = -44000,
    ERR_DH_AUDIO_HDI_INVALID_PARAM = -44001,
    ERR_DH_AV_TRANS_CREATE_CHANNEL_FAILED = -44002,
    ERR_DH_AUDIO_ACCESS_PERMISSION_CHECK_FAIL = -44003,
};

using WavHdr = struct WAV_HEADER;
int32_t InitTestDemo();
std::string FindAudioDevice();
std::string OpenSpk(std::string devId);
std::string StartRender();
std::string StopRender();
std::string CloseSpk();
std::string OpenMic(std::string devId);
std::string StartCapture();
std::string StopCapture();
std::string CloseMic();
std::string SetVolume(int vol);
std::string GetVolume();
std::string HandleAudioEvent(int32_t cmd);
#endif
