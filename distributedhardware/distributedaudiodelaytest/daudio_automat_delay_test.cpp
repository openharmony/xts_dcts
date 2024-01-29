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
#include "./distributedaudiodelaytest.h"
using namespace testing::ext;
using namespace OHOS::AudioStandard;
int32_t g_audioOk = 0;
int32_t g_audioDelay = 5;
class DAudioAutoDelaymatTest : public testing::Test {
public:
    static void SetUpTestCase(void);
    static void TearDownTestCase(void);
    void SetUp();
    void TearDown();
    DAudioAutoDelaymatTest();
};
void DAudioAutoDelaymatTest::SetUpTestCase(void)
{
    MakeShare();
}
void DAudioAutoDelaymatTest::TearDownTestCase(void) {}
void DAudioAutoDelaymatTest::SetUp(void) {}
void DAudioAutoDelaymatTest::TearDown(void) {}
DAudioAutoDelaymatTest::DAudioAutoDelaymatTest(void) {}

/**
 * @tc.name RemoteSpkInitProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_0100
 * @tc.desc  Call Remote Spk Init Process Test
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_0100, TestSize.Level1)
{
    std::string ret =  RemoteSpkInitProcessTest();
    EXPECT_EQ("Spk init SUCCESS", ret) << "Remote Spk init SUCCESS";
    sleep(g_audioDelay);
}

/**
 * @tc.name StartSpkProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_0200
 * @tc.desc Remote Call Start Spk Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_0200, TestSize.Level1)
{
    std::string ret =  StartSpkProcessTest();
    EXPECT_EQ("Spk start SUCCESS", ret) << "Local Spk start failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name PauseSpkProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_0300
 * @tc.desc Remote Call Pause Spk Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_0300, TestSize.Level1)
{
    std::string ret =  PauseSpkProcessTest();
    EXPECT_EQ("Spk pause SUCCESS", ret) << "Local Spk pause failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name ResumeSpkProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_0400
 * @tc.desc Remote Call Resume Spk Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_0400, TestSize.Level1)
{
    std::string ret = ResumeSpkProcessTest();
    EXPECT_EQ("Spk resume SUCCESS", ret) << "Local Spk resume failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name StopSpkProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_0500
 * @tc.desc Remote Call Stop Spk Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_0500, TestSize.Level1)
{
    std::string ret = StopSpkProcessTest();
    EXPECT_EQ("Spk stop SUCCESS", ret) << "Local Spk stop failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name ReleaseSpkProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_0600
 * @tc.desc Remote Call Release Spk Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_0600, TestSize.Level1)
{
    std::string ret = ReleaseSpkProcessTest();
    EXPECT_EQ("Spk release SUCCESS", ret) << "Local Spk release failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name RemoteMicInitProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_700
 * @tc.desc Remote Mic Init Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_700, TestSize.Level1)
{
    std::string ret = RemoteMicInitProcessTest();
    EXPECT_EQ("Mic init SUCCESS", ret) << "Local Mic init failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name StartMicProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_800
 * @tc.desc Remote Call Start Mic Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_800, TestSize.Level1)
{
    std::string ret = StartMicProcessTest();
    EXPECT_EQ("Mic start SUCCESS", ret) << "Local Mic start failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name PauseMicProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_900
 * @tc.desc Remote Call Pause Mic Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_900, TestSize.Level1)
{
    std::string ret = PauseMicProcessTest();
    EXPECT_EQ("Mic pause SUCCESS", ret) << "Local Mic pause failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name ResumeMicProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_1000
 * @tc.desc Remote Call Resume Mic Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_1000, TestSize.Level1)
{
    std::string ret = ResumeMicProcessTest();
    EXPECT_EQ("Mic resume SUCCESS", ret) << "Local Mic resume failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name StopMicProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_1100
 * @tc.desc Remote Call Stop Mic Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_1100, TestSize.Level1)
{
    std::string ret = StopMicProcessTest();
    EXPECT_EQ("Mic stop SUCCESS", ret) << "Local Mic stop failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name ReleaseMicProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_1200
 * @tc.desc Remote Call Release Mic Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_1200, TestSize.Level1)
{
    std::string ret = ReleaseMicProcessTest();
    EXPECT_EQ("Mic release SUCCESS", ret) << "Local Mic release failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name RemoteLoopTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_1300
 * @tc.desc  Call Remote Loop Latency Test
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_1300, TestSize.Level1)
{
    std::string ret = RemoteLoopTest();
    EXPECT_EQ("Loop latency test success", ret) << "Local Loop latency test failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name LocalSpkInitProcessTestk()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_1400
 * @tc.desc  Call Local Spk Init Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_1400, TestSize.Level1)
{
    std::string ret =  LocalSpkInitProcessTestk();
    EXPECT_EQ("Spk init SUCCESS", ret) << "Remote Spk init SUCCESS";
    sleep(g_audioDelay);
}

/**
 * @tc.name StartSpkProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_1500
 * @tc.desc Local Call Start Spk Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_1500, TestSize.Level1)
{
    std::string ret =  StartSpkProcessTest();
    EXPECT_EQ("Spk start SUCCESS", ret) << "remote Spk start failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name PauseSpkProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_1600
 * @tc.desc Local Call Pause Spk Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_1600, TestSize.Level1)
{
    std::string ret =  PauseSpkProcessTest();
    EXPECT_EQ("Spk pause SUCCESS", ret) << "remote Spk pause failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name ResumeSpkProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_1700
 * @tc.desc Local Call Resume Spk Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_1700, TestSize.Level1)
{
    std::string ret = ResumeSpkProcessTest();
    EXPECT_EQ("Spk resume SUCCESS", ret) << "remote Spk resume failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name StopSpkProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_1800
 * @tc.desc Local Call Stop Spk Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_1800, TestSize.Level1)
{
    std::string ret = StopSpkProcessTest();
    EXPECT_EQ("Spk stop SUCCESS", ret) << "remote Spk stop failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name ReleaseSpkProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_1900
 * @tc.desc Local Call Release Spk Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_1900, TestSize.Level1)
{
    std::string ret = ReleaseSpkProcessTest();
    EXPECT_EQ("Spk release SUCCESS", ret) << "remote Spk release failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name LocalMicInitProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_2000
 * @tc.desc Local Mic Init Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_2000, TestSize.Level1)
{
    std::string ret = LocalMicInitProcessTest();
    EXPECT_EQ("Mic init SUCCESS", ret) << "remote Mic init failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name StartMicProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_2100
 * @tc.desc Local Call Start Mic Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_2100, TestSize.Level1)
{
    std::string ret = StartMicProcessTest();
    EXPECT_EQ("Mic start SUCCESS", ret) << "remote start failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name PauseMicProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_2200
 * @tc.desc Local Call Pause Mic Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_2200, TestSize.Level1)
{
    std::string ret = PauseMicProcessTest();
    EXPECT_EQ("Mic pause SUCCESS", ret) << "remote Mic pause failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name ResumeMicProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_2300
 * @tc.desc Local Call Resume Mic Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_2300, TestSize.Level1)
{
    std::string ret = ResumeMicProcessTest();
    EXPECT_EQ("Mic resume SUCCESS", ret) << "remote Mic resume failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name StopMicProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_2400
 * @tc.desc Local Call Stop Mic Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_2400, TestSize.Level1)
{
    std::string ret = StopMicProcessTest();
    EXPECT_EQ("Mic stop SUCCESS", ret) << "remote Mic stop failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name ReleaseMicProcessTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_2500
 * @tc.desc Local Call Release Mic Process
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_2500, TestSize.Level1)
{
    std::string ret = ReleaseMicProcessTest();
    EXPECT_EQ("Mic release SUCCESS", ret) << "remote Mic release failed";
    sleep(g_audioDelay);
}

/**
 * @tc.name LocalLoopTest()
 * @tc.number SUB_DH_DAudio_Delay_Dcts_2600
 * @tc.desc  Call Local Loop Latency Test
 * @tc.size MediumTest
 * @tc.type Function
 * @tc.level Level 1
*/
HWTEST_F(DAudioAutoDelaymatTest, SUB_DH_DAudio_Delay_Dcts_2600, TestSize.Level1)
{
    std::string ret = LocalLoopTest();
    EXPECT_EQ("Loop latency test success", ret) << "remote Loop latency test failed";
    sleep(g_audioDelay);
}