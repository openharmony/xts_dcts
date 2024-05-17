/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

#include <gtest/gtest.h>
#include "distributedaudiotest.h"
#include "audio_event.h"
#include "daudio_constants.h"
#include "daudio_errorcode.h"
#include "iservice_registry.h"
#include "daudio_sink_ipc_callback_proxy.h"
#include "daudio_sink_load_callback.h"
#define PRIVATE public
#define PROTECTED public
#include "daudio_sink_service.h"
#undef PROTECTED
#undef PRIVATE

using namespace testing::ext;
using namespace OHOS;
using namespace OHOS::DistributedHardware;

int32_t g_audioOk = 0;
int32_t g_audioDelay = 5;
std::string res = "true";
std::string g_testParams = "sink";
class DAudioAutomatTest : public testing::Test {
public:
    static void SetUpTestCase(void);
    static void TearDownTestCase(void);
    void SetUp();
    void TearDown();
    DAudioAutomatTest();
    std::shared_ptr<DAudioSinkService> sinkSrv_ = nullptr;
    sptr<IRemoteObject> remoteObject_ = nullptr;
    sptr<ISystemAbilityManager> samgr_ = nullptr;
};
void DAudioAutomatTest::SetUpTestCase(void)
{
    int ret = InitTestDemo();
    if (ret != g_audioOk) {
        DHLOGI("demo test:InitTestDemo error");
        return;
    }
}
void DAudioAutomatTest::TearDownTestCase(void) {}
void DAudioAutomatTest::SetUp(void)
{
    int32_t saId = 6666;
    bool runOnCreate = true;
    std::string params = "params";
    samgr_ = SystemAbilityManagerClient::GetInstance().GetSystemAbilityManager();
    if (samgr_ == nullptr) {
        return;
    }
    sptr<DAudioSinkLoadCallback> loadCallback(new DAudioSinkLoadCallback(params));
    samgr_->LoadSystemAbility(DISTRIBUTED_HARDWARE_AUDIO_SINK_SA_ID, loadCallback);
    remoteObject_ = samgr_->GetSystemAbility(DISTRIBUTED_HARDWARE_AUDIO_SINK_SA_ID);
    if (remoteObject_ == nullptr) {
        return;
    }

    sinkSrv_ = std::make_shared<DAudioSinkService>(saId, runOnCreate);
}
void DAudioAutomatTest::TearDown(void)
{
    if (samgr_ != nullptr) {
        samgr_->UnloadSystemAbility(DISTRIBUTED_HARDWARE_AUDIO_SINK_SA_ID);
    }
    sinkSrv_ = nullptr;
}
DAudioAutomatTest::DAudioAutomatTest(void) {}

/**
 * @tc.name FindAudioDevice()
 * @tc.number SUB_DH_DAudio_Dcts_0100
 * @tc.desc Find Audio Device Test
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0100, TestSize.Level1)
{
    std::string g_networkId;
    sptr<DAudioSinkIpcCallbackProxy> dAudioSinkIpcCallbackProxy(new DAudioSinkIpcCallbackProxy(remoteObject_));
    int32_t ret = sinkSrv_->InitSink(g_testParams, dAudioSinkIpcCallbackProxy);
    EXPECT_EQ(g_audioOk, ret) << "InitSink fail DCTS_0100";

    int32_t res = GetSyncOnlineDevices(g_networkId);
    EXPECT_EQ(g_audioOk, res) << "GetSyncOnlineDevices fail DCTS_0100";
   
    res = sinkSrv_->PauseDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, res) << "PauseDistributedHardware fail DCTS_0100";

    sinkSrv_->ReleaseSink();
}

/**
 * @tc.name OpenSpk()
 * @tc.number SUB_DH_DAudio_Dcts_0200
 * @tc.desc Open Spk Test
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0200, TestSize.Level1)
{
    std::string g_networkId;
    sptr<DAudioSinkIpcCallbackProxy> dAudioSinkIpcCallbackProxy(new DAudioSinkIpcCallbackProxy(remoteObject_));
    int32_t ret = sinkSrv_->InitSink(g_testParams, dAudioSinkIpcCallbackProxy);
    EXPECT_EQ(g_audioOk, ret) << "InitSink fail DCTS_0200";

    int32_t ref = GetSyncOnlineDevices(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "GetSyncOnlineDevices fail DCTS_0200";

    ref = sinkSrv_->ResumeDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "ResumeDistributedHardware fail DCTS_0200";

    sinkSrv_->ReleaseSink();
}

/**
 * @tc.name StartRender()
 * @tc.number SUB_DH_DAudio_Dcts_0300
 * @tc.desc Start Render Test
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0300, TestSize.Level1)
{
    std::string g_networkId;
    sptr<DAudioSinkIpcCallbackProxy> dAudioSinkIpcCallbackProxy(new DAudioSinkIpcCallbackProxy(remoteObject_));
    int32_t ret = sinkSrv_->InitSink(g_testParams, dAudioSinkIpcCallbackProxy);
    EXPECT_EQ(g_audioOk, ret) << "InitSink fail DCTS_0300";

    int32_t ref = GetSyncOnlineDevices(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "GetSyncOnlineDevices fail DCTS_0300";

    ref = sinkSrv_->StopDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "StopDistributedHardware fail DCTS_0300";

    sinkSrv_->ReleaseSink();
}

/**
 * @tc.name StopRender()
 * @tc.number SUB_DH_DAudio_Dcts_0400
 * @tc.desc Stop Render Test
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0400, TestSize.Level1)
{
    std::string g_networkId;
    sptr<DAudioSinkIpcCallbackProxy> dAudioSinkIpcCallbackProxy(new DAudioSinkIpcCallbackProxy(remoteObject_));
    int32_t ret = sinkSrv_->InitSink(g_testParams, dAudioSinkIpcCallbackProxy);
    EXPECT_EQ(g_audioOk, ret) << "InitSink fail DCTS_0400";

    int32_t ref = GetSyncOnlineDevices(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "GetSyncOnlineDevices fail DCTS_0400";

    ref = sinkSrv_->ResumeDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "ResumeDistributedHardware fail DCTS_0400";

    ref = sinkSrv_->StopDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "StopDistributedHardware fail DCTS_0400";

    sinkSrv_->ReleaseSink();
}

/**
 * @tc.name SetVolume()
 * @tc.number SUB_DH_DAudio_Dcts_0500
 * @tc.desc Set Volume Test
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0500, TestSize.Level1)
{
    std::string g_networkId;
    sptr<DAudioSinkIpcCallbackProxy> dAudioSinkIpcCallbackProxy(new DAudioSinkIpcCallbackProxy(remoteObject_));
    int32_t ret = sinkSrv_->InitSink(g_testParams, dAudioSinkIpcCallbackProxy);
    EXPECT_EQ(g_audioOk, ret) << "InitSink fail DCTS_0500";

    int32_t ref = GetSyncOnlineDevices(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "GetSyncOnlineDevices fail DCTS_0500";

    ref = sinkSrv_->ResumeDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "ResumeDistributedHardware fail DCTS_0500";

    ref = sinkSrv_->PauseDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "PauseDistributedHardware fail DCTS_0500";

    sinkSrv_->ReleaseSink();
}

/**
 * @tc.name GetVolume()
 * @tc.number SUB_DH_DAudio_Dcts_0600
 * @tc.desc Get Volume Test
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0600, TestSize.Level1)
{
    std::string g_networkId;
    sptr<DAudioSinkIpcCallbackProxy> dAudioSinkIpcCallbackProxy(new DAudioSinkIpcCallbackProxy(remoteObject_));
    int32_t ret = sinkSrv_->InitSink(g_testParams, dAudioSinkIpcCallbackProxy);
    EXPECT_EQ(g_audioOk, ret) << "InitSink fail DCTS_0600";

    int32_t ref = GetSyncOnlineDevices(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "GetSyncOnlineDevices fail DCTS_0600";
    
    ref = sinkSrv_->PauseDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "PauseDistributedHardware fail DCTS_0600";

    ref = sinkSrv_->ResumeDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "ResumeDistributedHardware fail DCTS_0600";

    sinkSrv_->ReleaseSink();
}

/**
 * @tc.name CloseSpk()
 * @tc.number SUB_DH_DAudio_Dcts_0700
 * @tc.desc Close Spk Test
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0700, TestSize.Level1)
{
    std::string g_networkId;
    sptr<DAudioSinkIpcCallbackProxy> dAudioSinkIpcCallbackProxy(new DAudioSinkIpcCallbackProxy(remoteObject_));
    int32_t ret = sinkSrv_->InitSink(g_testParams, dAudioSinkIpcCallbackProxy);
    EXPECT_EQ(g_audioOk, ret) << "InitSink fail DCTS_0700";

    int32_t ref = GetSyncOnlineDevices(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "GetSyncOnlineDevices fail DCTS_0700";

    ref = sinkSrv_->StopDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "StopDistributedHardware fail DCTS_0700";

    ref = sinkSrv_->ResumeDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "ResumeDistributedHardware fail DCTS_0700";

    sinkSrv_->ReleaseSink();
}

/**
 * @tc.name OpenMic()
 * @tc.number SUB_DH_DAudio_Dcts_0800
 * @tc.desc Open Mic Test
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0800, TestSize.Level1)
{
    std::string g_networkId;
    sptr<DAudioSinkIpcCallbackProxy> dAudioSinkIpcCallbackProxy(new DAudioSinkIpcCallbackProxy(remoteObject_));
    int32_t ret = sinkSrv_->InitSink(g_testParams, dAudioSinkIpcCallbackProxy);
    EXPECT_EQ(g_audioOk, ret) << "InitSink fail DCTS_0800";

    int32_t ref = GetSyncOnlineDevices(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "GetSyncOnlineDevices fail DCTS_0800";

    ref = sinkSrv_->PauseDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "PauseDistributedHardware fail DCTS_0800";

    ref = sinkSrv_->StopDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "StopDistributedHardware fail DCTS_0800";
    sleep(g_audioDelay);

    sinkSrv_->ReleaseSink();
}

/**
 * @tc.name StartCapture()
 * @tc.number SUB_DH_DAudio_Dcts_0900
 * @tc.desc Start Capture Test
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0900, TestSize.Level1)
{
    std::string g_networkId;
    sptr<DAudioSinkIpcCallbackProxy> dAudioSinkIpcCallbackProxy(new DAudioSinkIpcCallbackProxy(remoteObject_));
    int32_t ret = sinkSrv_->InitSink(g_testParams, dAudioSinkIpcCallbackProxy);
    EXPECT_EQ(g_audioOk, ret) << "InitSink fail DCTS_0900";

    int32_t ref = GetSyncOnlineDevices(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "GetSyncOnlineDevices fail DCTS_0900";

    std::string finish = HandleAudioEvent(5);
    EXPECT_EQ(res, finish) << "OpenMic fail DCTS_0900";
    sleep(g_audioDelay);

    ref = sinkSrv_->PauseDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "PauseDistributedHardware fail DCTS_0900";

    finish = HandleAudioEvent(7);
    EXPECT_EQ(res, finish) << "StartCapture fail DCTS_0900";
    sleep(g_audioDelay);

    ref = sinkSrv_->ResumeDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "ResumeDistributedHardware fail DCTS_0900";

    finish = HandleAudioEvent(8);
    EXPECT_EQ(res, finish) << "StopCapture fail DCTS_0900";
    sleep(g_audioDelay);

    finish = HandleAudioEvent(6);
    EXPECT_EQ(res, finish) << "CloseMic fail DCTS_0900";
    sleep(g_audioDelay);

    sinkSrv_->ReleaseSink();
}

/**
 * @tc.name StopCapture()
 * @tc.number SUB_DH_DAudio_Dcts_1000
 * @tc.desc Stop Capture Test
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_1000, TestSize.Level1)
{
    std::string g_networkId;
    sptr<DAudioSinkIpcCallbackProxy> dAudioSinkIpcCallbackProxy(new DAudioSinkIpcCallbackProxy(remoteObject_));
    int32_t ret = sinkSrv_->InitSink(g_testParams, dAudioSinkIpcCallbackProxy);
    EXPECT_EQ(g_audioOk, ret) << "InitSink fail DCTS_1000";

    int32_t ref = GetSyncOnlineDevices(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "GetSyncOnlineDevices fail DCTS_1000";

    std::string finish = HandleAudioEvent(5);
    EXPECT_EQ(res, finish) << "OpenMic fail DCTS_1000";
    sleep(g_audioDelay);

    finish = HandleAudioEvent(7);
    EXPECT_EQ(res, finish) << "StartCapture fail DCTS_1000";
    sleep(g_audioDelay);

    ref = sinkSrv_->PauseDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "PauseDistributedHardware fail DCTS_1000";

    ref = sinkSrv_->ResumeDistributedHardware(g_networkId);
    EXPECT_EQ(g_audioOk, ref) << "ResumeDistributedHardware fail DCTS_1000";

    finish = HandleAudioEvent(8);
    EXPECT_EQ(res, finish) << "StopCapture fail DCTS_1000";
    sleep(g_audioDelay);

    finish = HandleAudioEvent(6);
    EXPECT_EQ(res, finish) << "CloseMic fail DCTS_1000";
    sleep(g_audioDelay);

    sinkSrv_->ReleaseSink();
}

/**
 * @tc.name CloseMic()
 * @tc.number SUB_DH_DAudio_Dcts_1100
 * @tc.desc Close Mic Test
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_1100, TestSize.Level1)
{
    std::string g_networkId;
    sptr<DAudioSinkIpcCallbackProxy> dAudioSinkIpcCallbackProxy(new DAudioSinkIpcCallbackProxy(remoteObject_));
    int32_t ret = sinkSrv_->InitSink(g_testParams, dAudioSinkIpcCallbackProxy);
    EXPECT_EQ(0, ret) << "InitSink fail DCTS_1100";

    int32_t ref = GetSyncOnlineDevices(g_networkId);
    EXPECT_EQ(0, ref) << "GetSyncOnlineDevices fail DCTS_1100";

    std::string finish = HandleAudioEvent(5);
    EXPECT_EQ(res, finish) << "OpenMic fail DCTS_1100";
    sleep(g_audioDelay);

    finish = HandleAudioEvent(7);
    EXPECT_EQ(res, finish) << "StartCapture fail DCTS_1100";
    sleep(g_audioDelay);

    
    ref = sinkSrv_->PauseDistributedHardware(g_networkId);
    EXPECT_EQ(0, ref) << "PauseDistributedHardware fail DCTS_1100";

    finish = HandleAudioEvent(8);
    EXPECT_EQ(res, finish) << "StopCapture fail DCTS_1100";
    sleep(g_audioDelay);

    finish = HandleAudioEvent(6);
    EXPECT_EQ(res, finish) << "CloseMic fail DCTS_1100";
    sleep(g_audioDelay);

    ref = sinkSrv_->StopDistributedHardware(g_networkId);
    EXPECT_EQ(0, ref) << "StopDistributedHardware fail DCTS_1100";

    sinkSrv_->ReleaseSink();
}

