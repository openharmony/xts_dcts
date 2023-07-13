
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

#include <cstdio>
#include <cstring>
#include <cstdlib>
#include <unistd.h>
#include <cerrno>
#include <fcntl.h>
#include <csignal>
#include <sys/stat.h>

#include <iostream>
#include <string>

#include <securec.h>
#include "unistd.h"
#include "./distributedaudiotest.h"

std::string deviceId;

struct Request {
    pid_t pid;
    int commandNum;
    char reqString[70];
    int seqLen;
};

struct Response {
    int seqNum;
    char resString[CMD_EXECUTING_RETURN_LENGHT_MAX];
};

using namespace OHOS::DistributedHardware;
static AudioManager *g_manager = nullptr;
static AudioAdapter *g_adapter = nullptr;
static AudioRender *g_render = nullptr;
static AudioCapture *g_capture = nullptr;
static AudioAdapterDescriptor *g_devices = nullptr;

static constexpr const char* PLAY_THREAD = "playThread";
static constexpr const char* CAPTURE_THREAD = "captureThread";

int32_t g_deviceNum = 0;
int32_t g_frameNum = 0;
int32_t g_frameIndex = 0;
int32_t g_micFrameNum = 0;
bool g_isInitRenderData = false;
static std::vector<uint8_t*> renderData;

static DeviceStatus g_spkStatus = DEVICE_IDLE;
static DeviceStatus g_micStatus = DEVICE_IDLE;

static std::thread g_palyingThread;
static std::thread g_capingThread;
FILE *g_micFile = nullptr;

static int64_t GetNowTimeUs()
{
    std::chrono::microseconds nowUs =
        std::chrono::duration_cast<std::chrono::microseconds>(std::chrono::system_clock::now().time_since_epoch());
    return nowUs.count();
}

int32_t InitTestDemo()
{
    DHLOGI("**********************************************************************************");
    DHLOGI("Distributed Audio Test Demo Bin v1.3.");
    DHLOGI("**********************************************************************************");
    DHLOGI("Init distributed audio hdf service.");
    g_manager = GetAudioManagerFuncs();
    if (g_manager == nullptr) {
        DHLOGI("Distributed audio manager is null, quit!");
        return ERR_DH_AUDIO_HDF_FAIL;
    }
    DHLOGI("Load audio manager success.");
    return DH_SUCCESS;
}

std::string FindAudioDevice()
{
    if (g_manager == nullptr) {
        return "false";
    }
    int32_t ret = g_manager->GetAllAdapters(g_manager, &g_devices, &g_deviceNum);
    if (ret != DH_SUCCESS) {
        DHLOGI("Get audio devices failed!");
        return "false";
    }
    std::string res = "true";
    std::cout << "Get audio devices success, adapter size: " << g_deviceNum << std::endl;
    for (int32_t index = 0; index < g_deviceNum; index++) {
        const AudioAdapterDescriptor &desc = g_devices[index];
        std::cout << "Device[" << index << "] ID: " << desc.adapterName << std::endl;
        deviceId = deviceId +  desc.adapterName;
        DHLOGI("demo test: Device [%s] ID",desc.adapterName);
        if (index != g_deviceNum - 1) {
        }
        std::cout << "pin list: ";
        for (uint32_t i = 0; i < desc.portNum; i++) {
            std::cout << desc.ports[i].portId << ", ";
        }
        std::cout << std::endl;
    }
    return res;
}

static void HandleDevError(const char *condition, const char *value)
{
    if (condition[TYPE_OFFSET] == DEV_TYPE_SPK && g_spkStatus != DEVICE_IDLE) {
        CloseSpk();
    }

    if (condition[TYPE_OFFSET] == DEV_TYPE_MIC && g_micStatus == DEVICE_IDLE) {
        CloseMic();
    }

    DHLOGI("Receive abnormal event, Demo quit.");
}

static int32_t ParamEventCallback(AudioExtParamKey key, const char *condition, const char *value, void *reserved,
    void *cookie)
{
    std::string val(value);
    std::string con(condition);
    std::cout << std::endl;
    DHLOGI("**********************************************************************************");
    std::cout << "Event recived: " << key << std::endl;
    std::cout << "Condition: " << con << std::endl;
    std::cout << "Value: " << val << std::endl;
    std::cout << std::endl;
    DHLOGI("**********************************************************************************");

    if (key == AudioExtParamKey::AUDIO_EXT_PARAM_KEY_STATUS && con.rfind("ERR_EVENT", 0) == 0) {
        HandleDevError(condition, value);
    }
    return DH_SUCCESS;
}

static int32_t LoadSpkDev(const std::string &devId)
{
    std::cout << "Open SPK device , device Id:" << devId << std::endl;

    struct AudioAdapterDescriptor *dev = nullptr;
    for (int32_t index = 0; index < g_deviceNum; index++) {
        struct AudioAdapterDescriptor &desc = g_devices[index];
        if (desc.adapterName == devId) {
            dev = &desc;
            break;
        }
    }
    if (dev == nullptr) {
        DHLOGI("Input device id is wrong.");
        FindAudioDevice();
        return ERR_DH_AUDIO_HDF_FAIL;
    }
    if (g_manager == nullptr) {
        return ERR_DH_AUDIO_HDF_FAIL;
    }
    if (g_adapter == nullptr) {
        int32_t ret = g_manager->LoadAdapter(g_manager, dev, &g_adapter);
        if (ret != DH_SUCCESS || g_adapter == nullptr) {
            std::cout << "Load audio device failed, ret: " << ret << std::endl;
            return ERR_DH_AUDIO_HDF_FAIL;
        }
    }
    DHLOGI("Load audio device success.");
    return DH_SUCCESS;
}

std::string OpenSpk()
{
    if (g_spkStatus != DEVICE_IDLE) {
        DHLOGI("Speaker device is already opened.");
        return "true";
    }
    if (LoadSpkDev(deviceId) != DH_SUCCESS) {
        return "false";
    }
    ParamCallback callback = ParamEventCallback;
    int32_t ret = g_adapter->RegExtraParamObserver(g_adapter, callback, nullptr);
    if (ret != DH_SUCCESS) {
        std::cout << "Register observer failed, ret: " << ret << std::endl;
        return "false";
    }

    struct AudioDeviceDescriptor renderDesc;
    renderDesc.pins = AudioPortPin::PIN_OUT_SPEAKER;
    renderDesc.desc = nullptr;
    AudioSampleAttributes g_rattrs = {};
    g_rattrs.type = AUDIO_IN_MEDIA;
    g_rattrs.interleaved = RENDER_INTER_LEAVED;
    g_rattrs.streamId = RENDER_STREAM_ID;
    g_rattrs.channelCount = RENDER_CHANNEL_MASK;
    g_rattrs.sampleRate = AUDIO_SAMPLE_RATE;
    g_rattrs.format = AudioFormat::AUDIO_FORMAT_TYPE_PCM_16_BIT;
    ret = g_adapter->CreateRender(g_adapter, &renderDesc, &g_rattrs, &g_render);
    if (ret != DH_SUCCESS || g_render == nullptr) {
        std::cout << "Open SPK device failed, ret: " << ret << std::endl;
        return "true";
    }
    g_spkStatus = DEVICE_OPEN;
    DHLOGI("Open SPK device success.");
    return "true";
}

static void WriteStreamWait(const int64_t &startTime)
{
    int64_t endTime = GetNowTimeUs();
    int64_t passTime = endTime - startTime;

    if (passTime > AUDIO_FRAME_TIME_INTERFAL_DEFAULT) {
        return;
    }
    int64_t remainTime = AUDIO_FRAME_TIME_INTERFAL_DEFAULT - passTime;
    std::this_thread::sleep_for(std::chrono::microseconds(remainTime));
}

static void Play()
{
    if (g_render == nullptr) {
        DHLOGI("SPK device is null.");
        return;
    }
    if (pthread_setname_np(pthread_self(), PLAY_THREAD) != DH_SUCCESS) {
        DHLOGI("Play thread setname failed.");
    }
    DHLOGI("Playing thread started.");
    g_render->control.Start((AudioHandle)g_render);
    g_spkStatus = DEVICE_START;

    uint64_t size = 0;
    while (g_spkStatus == DEVICE_START) {
        int64_t startTime = GetNowTimeUs();
        int32_t ret = g_render->RenderFrame(g_render, renderData[g_frameIndex], RENDER_FRAME_SIZE, &size);
        if (ret != DH_SUCCESS) {
            std::cout<<"RenderFrame failed, index: "<< g_frameIndex << ", ret:  " << ret << std::endl;
        }
        g_frameIndex++;
        if (g_frameNum != 0 && g_frameIndex == g_frameNum) {
            g_frameIndex = 0;
        }
        WriteStreamWait(startTime);
    }
    DHLOGI("Playing thread stopped.");
}

std::string StartRender()
{
    if (g_spkStatus == DEVICE_IDLE || g_spkStatus == DEVICE_OPEN) {
        return "true";
    }

    if (g_spkStatus == DEVICE_OPEN) {
        WavHdr wavHeader;
        size_t headerSize = sizeof(WavHdr);
        if (!g_isInitRenderData) {
            struct stat statbuf;
            stat(SPK_FILE_PATH, &statbuf);
            int32_t size = statbuf.st_size;
            g_frameNum = (size - headerSize) / RENDER_FRAME_SIZE;
            std::cout << "Audio file frame num: " << g_frameNum << std::endl;
            for (int32_t j = 0; j < g_frameNum; j++) {
                uint8_t *frame = new uint8_t[RENDER_FRAME_SIZE]();
                renderData.push_back(frame);
            }
            g_isInitRenderData = true;
        }
        FILE *wavFile = fopen(SPK_FILE_PATH, "rb");
        fread(&wavHeader, 1, headerSize, wavFile);
        for (int32_t i = 0; i < g_frameNum; i++) {
            fread(renderData[i], 1, RENDER_FRAME_SIZE, wavFile);
        }
        fclose(wavFile);
        g_frameIndex = 0;
        g_palyingThread = std::thread(Play);
        return "true";
    }
    if (g_spkStatus == DEVICE_START) {
        return "Speaker device is started.";
    }
    if (g_spkStatus == DEVICE_STOP) {
        g_palyingThread = std::thread(Play);
    }
    return "true";
}

std::string StopRender()
{
    if (g_render == nullptr) {
        return "true";
    }

    if (g_spkStatus == DEVICE_IDLE) {
        return "Speaker device is not opened.";
    }

    if (g_spkStatus == DEVICE_OPEN) {
        return "Speaker device is not started.";
    }

    if (g_spkStatus == DEVICE_STOP) {
        return "Speaker device is already stoped.";
    }

    g_spkStatus = DEVICE_STOP;
    if (g_palyingThread.joinable()) {
        g_palyingThread.join();
    }
    g_render->control.Stop((AudioHandle)g_render);
    return "true";
}

std::string CloseSpk()
{
    if (g_spkStatus == DEVICE_IDLE) {
        return "true";
    }

    if (g_spkStatus == DEVICE_START) {
        StopRender();
    }

    int32_t ret = g_adapter->DestroyRender(g_adapter, g_render);
    if (ret != DH_SUCCESS) {
        return "Close speaker failed";
    }
    if (g_micStatus == DEVICE_IDLE) {
        g_manager->UnloadAdapter(g_manager, g_adapter);
        g_adapter = nullptr;
    }
    g_spkStatus = DEVICE_IDLE;

    if (g_isInitRenderData) {
        for (auto &p : renderData) {
            delete[] p;
        }
        renderData.clear();
        g_isInitRenderData = false;
    }
    return "true";
}

static int32_t LoadMicDev(const std::string &devId)
{
    std::cout << "Open MIC device ,input device Id:" << devId << std::endl;

    struct AudioAdapterDescriptor *dev = nullptr;
    for (int32_t index = 0; index < g_deviceNum; index++) {
        struct AudioAdapterDescriptor &desc = g_devices[index];
        if (desc.adapterName == devId) {
            dev = &desc;
            break;
        }
    }
    if (dev == nullptr) {
        DHLOGI("Input device id is wrong.");
        FindAudioDevice();
        return ERR_DH_AUDIO_HDF_FAIL;
    }
    if (g_manager == nullptr) {
        return ERR_DH_AUDIO_HDF_FAIL;
    }
    if (g_adapter == nullptr) {
        int32_t ret = g_manager->LoadAdapter(g_manager, dev, &g_adapter);
        if (ret != DH_SUCCESS || g_adapter == nullptr) {
            std::cout << "Load audio device failed, ret: " << ret << std::endl;
            return ERR_DH_AUDIO_HDF_FAIL;
        }
    }
    DHLOGI("Load audio device success.");
    return DH_SUCCESS;
}

std::string OpenMic()
{
    if (g_micStatus != DEVICE_IDLE) {
        return "Mic device is already opened.";
    }
    if (LoadMicDev(deviceId) != DH_SUCCESS) {
        return "Load audio device failed.";
    }

    AudioDeviceDescriptor captureDesc;
    captureDesc.pins = AudioPortPin::PIN_IN_MIC;
    captureDesc.desc = nullptr;
    AudioSampleAttributes captureAttr;
    captureAttr.type = AUDIO_IN_MEDIA;
    captureAttr.interleaved = CAPTURE_INTER_LEAVED;
    captureAttr.streamId = CAPTURE_STREAM_ID;
    captureAttr.channelCount = CAPTURE_CHANNEL_MASK;
    captureAttr.sampleRate = AUDIO_SAMPLE_RATE;
    captureAttr.format = AudioFormat::AUDIO_FORMAT_TYPE_PCM_16_BIT;
    int32_t ret = g_adapter->CreateCapture(g_adapter, &captureDesc, &captureAttr, &g_capture);
    if (ret != DH_SUCCESS || g_capture == nullptr) {
        return "true";
    }
    g_micStatus = DEVICE_OPEN;
    return "true";
}

static void ReadStreamWait(const int64_t &startTime)
{
    int64_t endTime = GetNowTimeUs();
    int32_t passTime = endTime - startTime;

    if (passTime > AUDIO_FRAME_TIME_INTERFAL_DEFAULT) {
        return;
    }
    int64_t remainTime = AUDIO_FRAME_TIME_INTERFAL_DEFAULT - passTime;
    std::this_thread::sleep_for(std::chrono::microseconds(remainTime));
}

static void Capture()
{
    if (g_capture == nullptr) {
        DHLOGI("MIC device is null.");
        return;
    }
    if (pthread_setname_np(pthread_self(), CAPTURE_THREAD) != DH_SUCCESS) {
        DHLOGI("Capture thread setname failed.");
    }
    DHLOGI("Capturing thread started.");
    g_capture->control.Start((AudioHandle)g_capture);
    g_micStatus = DEVICE_START;

    uint64_t size = 0;
    while (g_micStatus == DEVICE_START) {
        uint8_t *data[RENDER_FRAME_SIZE];
        int64_t startTime = GetNowTimeUs();
        int32_t ret = g_capture->CaptureFrame(g_capture, data, RENDER_FRAME_SIZE, &size);
        if (ret != DH_SUCCESS) {
            std::cout << "CaptureFrame failed, ret: " << ret << std::endl;
            return;
        }
        fwrite(data, 1, RENDER_FRAME_SIZE, g_micFile);
        g_micFrameNum++;
        ReadStreamWait(startTime);
    }
    DHLOGI("Capturing thread stopped.");
}

std::string StartCapture()
{
    if (g_micStatus == DEVICE_IDLE) {
        return "true";
    }

    if (g_micStatus == DEVICE_OPEN) {
        g_micFile = fopen(MIC_FILE_PATH, "ab+");
        if (g_micFile == nullptr) {
            return "Open pcm file failed.";
        }
        g_capingThread = std::thread(Capture);
        return "true";
    }

    if (g_micStatus == DEVICE_START) {
        return "Mic device is already started.";
    }

    if (g_micStatus == DEVICE_STOP) {
        g_capingThread = std::thread(Capture);
    }
    return "true";
}

std::string StopCapture()
{
    if (g_capture == nullptr) {
        return "true";
    }

    if (g_micStatus == DEVICE_IDLE) {
        return "Mic device is not opened.";
    }

    if (g_micStatus == DEVICE_OPEN) {
        return "Mic device is not started.";
    }

    if (g_micStatus == DEVICE_STOP) {
        return "Mic device is already started.";
    }

    g_micStatus = DEVICE_STOP;
    if (g_capingThread.joinable()) {
        g_capingThread.join();
    }
    g_capture->control.Stop((AudioHandle)g_capture);
    return "true";
}

std::string CloseMic()
{
    if (g_micStatus == DEVICE_IDLE) {
        return "true";
    }

    if (g_micStatus == DEVICE_START) {
        StopCapture();
    }

    int32_t ret = g_adapter->DestroyCapture(g_adapter, g_capture);
    if (ret != DH_SUCCESS) {
        return "Close mic failed.";
    }
    if (g_spkStatus == DEVICE_IDLE) {
        g_manager->UnloadAdapter(g_manager, g_adapter);
        g_adapter = nullptr;
    }
    if (g_micFile != nullptr) {
        fclose(g_micFile);
        g_micFile = nullptr;
    }
    g_micStatus = DEVICE_IDLE;
    return "true";
}

std::string SetVolume(std::string vol)
{
    if (g_spkStatus == DEVICE_IDLE) {
        return "true";
    }
    int32_t volInt = std::stoi(vol);
    if (volInt < VOLUME_MIN || volInt > VOLUME_MAX) {
        return "Volume is invalid";
    }
    enum AudioExtParamKey key = AudioExtParamKey::AUDIO_EXT_PARAM_KEY_VOLUME;
    std::string condition = "EVENT_TYPE=1;VOLUME_GROUP_ID=1;AUDIO_VOLUME_TYPE=1;";
    int32_t ret = g_adapter->SetExtraParams(g_adapter, key, condition.c_str(), vol.c_str());
    if (ret != DH_SUCCESS) {
        return "Set volume failed";
    }
    return "true";
}

std::string GetVolume()
{
    if (g_spkStatus == DEVICE_IDLE) {
        return "true";
    }
    enum AudioExtParamKey key = AudioExtParamKey::AUDIO_EXT_PARAM_KEY_VOLUME;
    std::string condition = "EVENT_TYPE=1;VOLUME_GROUP_ID=1;AUDIO_VOLUME_TYPE=1;";
    char vol[VOLUME_BIT];
    int32_t ret = g_adapter->GetExtraParams(g_adapter, key, condition.c_str(), vol, VOLUME_BIT);
    if (ret != DH_SUCCESS) {
        return "Get Volume failed.";
    }
    DHLOGI("demo test:GetVolume = %s", vol);
    return "true";
}