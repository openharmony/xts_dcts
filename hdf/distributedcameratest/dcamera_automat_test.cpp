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
int32_t CameraOk = 0;
int32_t SleepOk = 2;

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
    EXPECT_EQ(CameraOk, ret) << "InitSensors fail";
    sleep(SleepOk);
    ret = mainDemo->InitCameraDevice();
    EXPECT_EQ(CameraOk, ret) << "InitCameraDevice fail";
    sleep(SleepOk);
    ret = PreviewOn(0, mainDemo);
    EXPECT_EQ(CameraOk, ret) << "PreviewOn fail";
    sleep(SleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0200, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(SleepOk);
    EXPECT_EQ(CameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(SleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0300, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(SleepOk);
    EXPECT_EQ(CameraOk, ret) << "SetAwbMode fail";
    sleep(SleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0400, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAeExpo();
    EXPECT_EQ(CameraOk, ret) << "SetAeExpo fail";
    sleep(SleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0500, TestSize.Level1)
{
    int32_t ret = mainDemo->SetMetadata();
    EXPECT_EQ(CameraOk, ret) << "SetMetadata fail";
    sleep(SleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0600, TestSize.Level1)
{
    int32_t ret = CaptureTest(mainDemo);
    EXPECT_EQ(CameraOk, ret) << "CaptureTest fail";
    sleep(SleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0700, TestSize.Level1)
{
    int32_t ret = VideoTest(mainDemo);
    EXPECT_EQ(CameraOk, ret) << "VideoTest fail";
    sleep(SleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0800, TestSize.Level1)
{
    int32_t ret = FlashLightTest(mainDemo);
    EXPECT_EQ(CameraOk, ret) << "FlashLightTest fail";
    sleep(SleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0900, TestSize.Level1)
{
    int32_t ret = OfflineTest(mainDemo);
    EXPECT_EQ(CameraOk, ret) << "OfflineTest fail";
}

