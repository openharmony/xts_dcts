#ifndef DISTRIBUTED_AUDIO_DELAY_TEST_H
#define DISTRIBUTED_AUDIO_DELAY_TEST_H
/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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
#include <cinttypes>
#include <condition_variable>
#include <cstdint>
#include <ctime>
#include <ostream>
#include <sstream>
#include <iostream>
#include <thread>
#include <mutex>
#include <map>
#include <securec.h>
#include <sys/time.h>
#include "audio_log.h"
#include "audio_errors.h"
#include "audio_utils.h"
#include "audio_process_in_client.h"
#include "audio_system_manager.h"
#include "parameter.h"
namespace OHOS {
namespace AudioStandard {
struct WAV_HEADER {
    /* RIFF Chunk Descriptor */
    uint8_t RIFF[4] = {'R', 'I', 'F', 'F'}; // RIFF Header Magic header
    uint32_t ChunkSize = 0; // RIFF Chunk Size
    uint8_t WAVE[4] = {'W', 'A', 'V', 'E'}; // WAVE Header
    /* "fmt" sub-chunk */
    uint8_t fmt[4] = {'f', 'm', 't', ' '}; // FMT header
    uint32_t Subchunk1Size = 16; // Size of the fmt chunk
    uint16_t AudioFormat = 1; // Audio format 1=PCM
    uint16_t NumOfChan = 2; // Number of channels 1=Mono 2=Stereo
    uint32_t SamplesPerSec = 44100; // Sampling Frequency in Hz
    uint32_t bytesPerSec = 176400; // bytes per second
    uint16_t blockAlign = 2; // 2=16-bit mono, 4=16-bit stereo
    uint16_t bitsPerSample = 16; // Number of bits per sample
    /* "data" sub-chunk */
    uint8_t Subchunk2ID[4] = {'d', 'a', 't', 'a'}; // "data"  string
    uint32_t Subchunk2Size = 0; // Sampled data length
};
using WavHdr = struct WAV_HEADER;
void MakeShare();
std::string LocalSpkInitProcessTestk();
std::string RemoteSpkInitProcessTest();
std::string StartSpkProcessTest();
std::string PauseSpkProcessTest();
std::string ResumeSpkProcessTest();
std::string StopSpkProcessTest();
std::string ReleaseSpkProcessTest();
std::string LocalMicInitProcessTest();
std::string RemoteMicInitProcessTest();
std::string StartMicProcessTest();
std::string PauseMicProcessTest();
std::string ResumeMicProcessTest();
std::string StopMicProcessTest();
std::string ReleaseMicProcessTest();
std::string LocalLoopTest();
std::string RemoteLoopTest();
}
}
#endif