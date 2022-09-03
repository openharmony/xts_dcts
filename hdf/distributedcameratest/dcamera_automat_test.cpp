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

#include <gtest/gtest.h>
#include "dcamera_hdf_demo.h"
#include "distributed_hardware_log.h"

using namespace testing::ext;
using namespace OHOS::DistributedHardware;

auto mainDemo = std::make_shared<DcameraHdfDemo>();
int32_t g_dCamera_Ok = 0;
int32_t g_dCamera_Error = -1;
int32_t g_dSleepOk = 2;
int32_t g_dSleep = 5;

class DCameraAutomatTest : public testing::Test {
public:
    static void SetUpTestCase(void);
    static void TearDownTestCase(void);
    void SetUp();
    void TearDown();
    DCameraAutomatTest();
};
void DCameraAutomatTest::SetUpTestCase(void) {}

void DCameraAutomatTest::TearDownTestCase(void)
{
    PreviewOff(mainDemo);
    mainDemo->QuitDemo();
}
void DCameraAutomatTest::SetUp(void) {}
void DCameraAutomatTest::TearDown(void) {}
DCameraAutomatTest::DCameraAutomatTest(void) {}


HWTEST_F(DCameraAutomatTest, DCameraTest_0100, TestSize.Level1)
{
    int32_t ret = mainDemo->InitSensors();
    EXPECT_EQ(g_dCamera_Ok, ret) << "InitSensors fail";
    sleep(g_dSleepOk);
    ret = mainDemo->InitCameraDevice();
    EXPECT_EQ(g_dCamera_Ok, ret) << "InitCameraDevice fail";
    sleep(g_dSleepOk);
    ret = PreviewOn(0, mainDemo);
    EXPECT_EQ(g_dCamera_Ok, ret) << "PreviewOn fail";
    sleep(g_dSleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0200, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(g_dSleepOk);
    EXPECT_EQ(g_dCamera_Ok, ret) << "SetAwbMode incandescent fail";
    sleep(g_dSleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0300, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(g_dCamera_Ok);
    EXPECT_EQ(g_dCamera_Ok, ret) << "SetAwbMode fail";
    sleep(g_dSleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0400, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAeExpo();
    EXPECT_EQ(g_dCamera_Ok, ret) << "SetAeExpo fail";
    sleep(g_dSleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0500, TestSize.Level1)
{
    int32_t ret = mainDemo->SetMetadata();
    EXPECT_EQ(g_dCamera_Ok, ret) << "SetMetadata fail";
    sleep(g_dSleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0600, TestSize.Level1)
{
    int32_t ret = CaptureTest(mainDemo);
    EXPECT_EQ(g_dCamera_Ok, ret) << "CaptureTest fail";
    sleep(g_dSleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0700, TestSize.Level1)
{
    int32_t ret = VideoTest(mainDemo);
    EXPECT_EQ(g_dCamera_Ok, ret) << "VideoTest fail";
    sleep(g_dSleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0800, TestSize.Level1)
{
    int32_t ret = FlashLightTest(mainDemo);
    EXPECT_EQ(g_dCamera_Ok, ret) << "FlashLightTest fail";
    sleep(g_dSleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0900, TestSize.Level1)
{
    int32_t ret = OfflineTest(mainDemo);
    EXPECT_EQ(g_dCamera_Ok, ret) << "OfflineTest fail";
    sleep(g_dSleep);
}

