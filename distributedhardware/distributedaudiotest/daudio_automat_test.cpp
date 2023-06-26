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

#include <gtest/gtest.h>
#include "distributedaudiotest.h"

using namespace testing::ext;
using namespace OHOS::DistributedHardware;

int32_t g_audioOk = 0;
int32_t g_audioDelay = 5;

class DAudioAutomatTest : public testing::Test {
public:
    static void SetUpTestCase(void);
    static void TearDownTestCase(void);
    void SetUp();
    void TearDown();
    DAudioAutomatTest();
};
void DAudioAutomatTest::SetUpTestCase(void){}
void DAudioAutomatTest::TearDownTestCase(void) {}
void DAudioAutomatTest::SetUp(void) {}
void DAudioAutomatTest::TearDown(void) {}
DAudioAutomatTest::DAudioAutomatTest(void) {}


/**
 * @tc.number    : DCameraTest_0100
 * @tc.name      ：StartMirror()
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 * @tc.desc      : The distributed screen starts mirroring the screen
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0001, TestSize.Level1)
{
    int32_t ret = InitTestDemo();
    EXPECT_EQ(g_audioOk, ret) << "InitTestDemo fail";
    sleep(g_audioDelay);
}

/**
 * @tc.number    : DCameraTest_0100
 * @tc.name      ：StartMirror()
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 * @tc.desc      : The distributed screen starts mirroring the screen
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0002, TestSize.Level1)
{
    std::string ret = FindAudioDevice();
    EXPECT_EQ(g_audioOk, atoi(ret.c_str())) << "FindAudioDevice fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0003, TestSize.Level1)
{
    std::string ret = OpenSpk("2");
    EXPECT_EQ(g_audioOk, atoi(ret.c_str())) << "OpenSpk fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0004, TestSize.Level1)
{
    std::string ret = StartRender();
    EXPECT_EQ(g_audioOk, atoi(ret.c_str())) << "StartRender fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0005, TestSize.Level1)
{
    std::string ret = StopRender();
    EXPECT_EQ(g_audioOk, atoi(ret.c_str())) << "StopRender fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0006, TestSize.Level1)
{
    std::string ret = CloseSpk();
    EXPECT_EQ(g_audioOk, atoi(ret.c_str())) << "CloseSpk fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0007, TestSize.Level1)
{
    std::string ret = OpenMic("2");
    EXPECT_EQ(g_audioOk, atoi(ret.c_str())) << "OpenMic fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0008, TestSize.Level1)
{
    std::string ret = StartCapture();
    EXPECT_EQ(g_audioOk, atoi(ret.c_str())) << "StartCapture fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0009, TestSize.Level1)
{
    std::string ret = StopCapture();
    EXPECT_EQ(g_audioOk, atoi(ret.c_str())) << "StopCapture fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0010, TestSize.Level1)
{
    std::string ret = CloseMic();
    EXPECT_EQ(g_audioOk, atoi(ret.c_str())) << "CloseMic fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0011, TestSize.Level1)
{
    std::string ret = SetVolume("5");
    EXPECT_EQ(g_audioOk, atoi(ret.c_str())) << "SetVolume fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0012, TestSize.Level1)
{
    std::string ret = GetVolume();
    EXPECT_EQ(g_audioOk, atoi(ret.c_str())) << "GetVolume fail";
    sleep(g_audioDelay);
}