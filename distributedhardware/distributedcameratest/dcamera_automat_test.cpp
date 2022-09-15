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
int32_t cameraOk = 0;
int32_t sleepOk = 2;
int32_t camoreError = -1;

class DCameraAutomatTest : public testing::Test {
public:
    static void SetUpTestCase(void);
    static void TearDownTestCase(void);
    void SetUp();
    void TearDown();
    DCameraAutomatTest();
};
void DCameraAutomatTest::SetUpTestCase(void)
{
    int32_t ret = mainDemo->InitSensors();
    if (ret == camoreError) {
        DHLOGE("main test: mainDemo->InitSensors() error");
        return;
    }

    ret = mainDemo->InitCameraDevice();
    if (ret == camoreError) {
        DHLOGE("main test: mainDemo->InitCameraDevice() error");
        return;
    }
    mainDemo->SetEnableResult();
}

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
    int32_t ret = PreviewOn(0, mainDemo);
    EXPECT_EQ(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0200, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(sleepOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0300, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(cameraOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0400, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAeExpo();
    EXPECT_EQ(cameraOk, ret) << "SetAeExpo fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0500, TestSize.Level1)
{
    int32_t ret = mainDemo->SetMetadata();
    EXPECT_EQ(cameraOk, ret) << "SetMetadata fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0600, TestSize.Level1)
{
    int32_t ret = CaptureTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0700, TestSize.Level1)
{
    int32_t ret = VideoTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0800, TestSize.Level1)
{
    int32_t ret = FlashLightTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_0900, TestSize.Level1)
{
    int32_t ret = OfflineTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "OfflineTest fail";
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1000, TestSize.Level1)
{
    int32_t ret = PreviewOn(0, mainDemo);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
    ret = mainDemo->SetAwbMode(sleepOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
    ret = mainDemo->SetAwbMode(cameraOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1100, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAeExpo();
    EXPECT_EQ(cameraOk, ret) << "SetAeExpo fail";
    sleep(sleepOk);
    ret = mainDemo->SetMetadata();
    EXPECT_EQ(cameraOk, ret) << "SetMetadata fail";
    sleep(sleepOk);
    ret = CaptureTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1200, TestSize.Level1)
{
    int32_t ret = VideoTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
    ret = FlashLightTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
    ret = OfflineTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "OfflineTest fail";
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1300, TestSize.Level1)
{
    int32_t ret = PreviewOn(0, mainDemo);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
    ret = mainDemo->SetAwbMode(cameraOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode fail";
    sleep(sleepOk);
    ret = mainDemo->SetAwbMode(sleepOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1400, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAeExpo();
    EXPECT_EQ(cameraOk, ret) << "SetAeExpo fail";
    sleep(sleepOk);
    ret = CaptureTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
    ret = mainDemo->SetMetadata();
    EXPECT_EQ(cameraOk, ret) << "SetMetadata fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1500, TestSize.Level1)
{
    int32_t ret = VideoTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
    ret = OfflineTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "OfflineTest fail";
    ret = FlashLightTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1600, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(sleepOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);ret = PreviewOn(0, mainDemo);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
    ret = mainDemo->SetAwbMode(cameraOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1700, TestSize.Level1)
{
    int32_t ret = mainDemo->SetMetadata();
    EXPECT_EQ(cameraOk, ret) << "SetMetadata fail";
    sleep(sleepOk);
     ret = mainDemo->SetAeExpo();
    EXPECT_EQ(cameraOk, ret) << "SetAeExpo fail";
    sleep(sleepOk);
    ret = CaptureTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1800, TestSize.Level1)
{
    int32_t ret = FlashLightTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
    ret = VideoTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
    ret = OfflineTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "OfflineTest fail";
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1900, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(cameraOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode fail";
    sleep(sleepOk);
    ret = mainDemo->SetAwbMode(sleepOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
    ret = PreviewOn(0, mainDemo);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2000, TestSize.Level1)
{
    int32_t ret = CaptureTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
    ret = mainDemo->SetMetadata();
    EXPECT_EQ(cameraOk, ret) << "SetMetadata fail";
    sleep(sleepOk);
     ret = mainDemo->SetAeExpo();
    EXPECT_EQ(cameraOk, ret) << "SetAeExpo fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2100, TestSize.Level1)
{
    int32_t ret = OfflineTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "OfflineTest fail";
    ret = FlashLightTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
    ret = VideoTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2200, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAeExpo();
    EXPECT_EQ(cameraOk, ret) << "SetAeExpo fail";
    sleep(sleepOk);
    ret = mainDemo->SetMetadata();
    EXPECT_EQ(cameraOk, ret) << "SetMetadata fail";
    sleep(sleepOk);
    ret = CaptureTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2300, TestSize.Level1)
{
    int32_t ret = PreviewOn(0, mainDemo);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
    ret = mainDemo->SetAwbMode(sleepOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
    ret = mainDemo->SetAwbMode(cameraOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2400, TestSize.Level1)
{
    int32_t ret = VideoTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
    ret = FlashLightTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
    ret = OfflineTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "OfflineTest fail";
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2500, TestSize.Level1)
{
    int32_t ret = VideoTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
    ret = FlashLightTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
    ret = OfflineTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "OfflineTest fail";
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2600, TestSize.Level1)
{
    int32_t ret = PreviewOn(0, mainDemo);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
    ret = mainDemo->SetAwbMode(sleepOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
    ret = mainDemo->SetAwbMode(cameraOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2700, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAeExpo();
    EXPECT_EQ(cameraOk, ret) << "SetAeExpo fail";
    sleep(sleepOk);
    ret = mainDemo->SetMetadata();
    EXPECT_EQ(cameraOk, ret) << "SetMetadata fail";
    sleep(sleepOk);
    ret = CaptureTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2800, TestSize.Level1)
{
    int32_t ret = VideoTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
    ret = OfflineTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "OfflineTest fail";
    ret = FlashLightTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2900, TestSize.Level1)
{
    int32_t ret = PreviewOn(0, mainDemo);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
    ret = mainDemo->SetAwbMode(cameraOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode fail";
    sleep(sleepOk);
    ret = mainDemo->SetAwbMode(sleepOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_3000, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAeExpo();
    EXPECT_EQ(cameraOk, ret) << "SetAeExpo fail";
    sleep(sleepOk);
    ret = CaptureTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
    ret = mainDemo->SetMetadata();
    EXPECT_EQ(cameraOk, ret) << "SetMetadata fail";
    sleep(sleepOk);
}