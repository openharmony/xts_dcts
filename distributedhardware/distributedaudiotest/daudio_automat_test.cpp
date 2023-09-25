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
#include "./distributedaudiotest.h"

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

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0100, TestSize.Level1)
{
    std::string ret = FindAudioDevice();
    EXPECT_EQ(res, ret) << "FindAudioDevice fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0200, TestSize.Level1)
{
    std::string ret = OpenSpk();
    EXPECT_EQ(res, ret) << "OpenSpk fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0300, TestSize.Level1)
{
    std::string ret = StartRender();
    EXPECT_EQ(res, ret) << "StartRender fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0400, TestSize.Level1)
{
    std::string ret = StopRender();
    EXPECT_EQ(res, ret) << "StopRender fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0500, TestSize.Level1)
{
    std::string ret = CloseSpk();
    EXPECT_EQ(res, ret) << "CloseSpk fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0600, TestSize.Level1)
{
    std::string ret = OpenMic();
    EXPECT_EQ(res, ret) << "OpenMic fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0700, TestSize.Level1)
{
    std::string ret = StartCapture();
    EXPECT_EQ(res, ret) << "StartCapture fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0800, TestSize.Level1)
{
    std::string ret = StopCapture();
    EXPECT_EQ(res, ret) << "StopCapture fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_0900, TestSize.Level1)
{
    std::string ret = CloseMic();
    EXPECT_EQ(res, ret) << "CloseMic fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_1000, TestSize.Level1)
{
    std::string ret = SetVolume("5");
    EXPECT_EQ(res, ret) << "SetVolume five fail";
    sleep(g_audioDelay);
    ret = SetVolume("1");
    EXPECT_EQ(res, ret) << "SetVolume one fail";
    sleep(g_audioDelay);
}

HWTEST_F(DAudioAutomatTest, SUB_DH_DAudio_Dcts_1100, TestSize.Level1)
{
    std::string ret = GetVolume();
    EXPECT_EQ(res, ret) << "GetVolume fail";
    sleep(g_audioDelay);
}