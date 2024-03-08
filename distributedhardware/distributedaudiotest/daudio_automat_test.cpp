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

#include <gtest/gtest.h>
#include "distributedaudiotest.h"

using namespace testing::ext;
using namespace OHOS::DistributedHardware;

int32_t g_audioOk = 0;
int32_t g_audioDelay = 5;
std::string res = "true";

class DAudioAutomatTest : public testing::Test {
public:
    static void SetUpTestCase(void);
    static void TearDownTestCase(void);
    void SetUp();
    void TearDown();
    DAudioAutomatTest();
};
void DAudioAutomatTest::SetUpTestCase(void){
    int ret = InitTestDemo();
    if (ret != g_audioOk) {
        DHLOGI("demo test:InitTestDemo error");
        return;
    }
}
void DAudioAutomatTest::TearDownTestCase(void) {}
void DAudioAutomatTest::SetUp(void) {}
void DAudioAutomatTest::TearDown(void) {}
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
    std::string ret = HandleAudioEvent(9);
    EXPECT_EQ(res, ret) << "FindAudioDevice fail";
    sleep(g_audioDelay);
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
    std::string ret = HandleAudioEvent(1);
    EXPECT_EQ(res, ret) << "OpenSpk fail";
    sleep(g_audioDelay);
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

    std::string ret = HandleAudioEvent(3);
    EXPECT_EQ(res, ret) << "StartRender fail";
    sleep(g_audioDelay);
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
    std::string ret = HandleAudioEvent(4);
    EXPECT_EQ(res, ret) << "StopRender fail";
    sleep(g_audioDelay);
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
    std::string ret = HandleAudioEvent(11);
    EXPECT_EQ(res, ret) << "SetVolume five fail";
    sleep(g_audioDelay);
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
    std::string ret = HandleAudioEvent(12);
    EXPECT_EQ(res, ret) << "GetVolume fail";
    sleep(g_audioDelay);
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
    std::string ret = HandleAudioEvent(2);
    EXPECT_EQ(res, ret) << "CloseSpk fail";
    sleep(g_audioDelay);
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
    std::string ret = HandleAudioEvent(5);
    EXPECT_EQ(res, ret) << "OpenMic fail";
    sleep(g_audioDelay);
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
    std::string ret = HandleAudioEvent(7);
    EXPECT_EQ(res, ret) << "StartCapture fail";
    sleep(g_audioDelay);
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
    std::string ret = HandleAudioEvent(8);
    EXPECT_EQ(res, ret) << "StopCapture fail";
    sleep(g_audioDelay);
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
    std::string ret = HandleAudioEvent(6);
    EXPECT_EQ(res, ret) << "CloseMic fail";
    sleep(g_audioDelay);
}

