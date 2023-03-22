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

/**
 * @tc.number    : DCameraTest_0100
 * @tc.name      : PreviewOn parameter test
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0100, TestSize.Level1)
{
    int32_t ret = PreviewOn(0, mainDemo);
    EXPECT_EQ(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
}
/**
 * @tc.number    : DCameraTest_0200
 * @tc.name      : SetAwbMode parameter test
 * @tc.desc      :[STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0200, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(sleepOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
}
/**
 * @tc.number    : DCameraTest_0300
 * @tc.name      : SetAwbMode parameter test
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0300, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(cameraOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode fail";
    sleep(sleepOk);
}
/**
 * @tc.number    : DCameraTest_0400
 * @tc.name      : SetAeExpo parameter test
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0400, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAeExpo();
    EXPECT_EQ(cameraOk, ret) << "SetAeExpo fail";
    sleep(sleepOk);
}
/**
 * @tc.number    : DCameraTest_0500
 * @tc.name      : SetMetadata parameter test
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0500, TestSize.Level1)
{
    int32_t ret = mainDemo->SetMetadata();
    EXPECT_EQ(cameraOk, ret) << "SetMetadata fail";
    sleep(sleepOk);
}
/**
 * @tc.number    : DCameraTest_0600
 * @tc.name      : CaptureTest parameter test
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0600, TestSize.Level1)
{
    int32_t ret = CaptureTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
}
/**
 * @tc.number    : DCameraTest_0700
 * @tc.name      : VideoTest parameter test
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0700, TestSize.Level1)
{
    int32_t ret = VideoTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
}
/**
 * @tc.number    : DCameraTest_0800
 * @tc.name      : FlashLightTest parameter test
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0800, TestSize.Level1)
{
    int32_t ret = FlashLightTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
}
/**
 * @tc.number    : DCameraTest_0900
 * @tc.name      : OfflineTest parameter test
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0900, TestSize.Level1)
{
    int32_t ret = OfflineTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "OfflineTest fail";
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1000, TestSize.Level1)
{
    int32_t ret = PreviewOn(1, mainDemo);
    DHLOGI("DCameraTest_3100 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1100, TestSize.Level1)
{
    int32_t ret = PreviewOn(1, nullptr);
    DHLOGI("DCameraTest_3200 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1200, TestSize.Level1)
{
    int32_t ret = PreviewOn(0, nullptr);
    DHLOGI("DCameraTest_3300 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1300, TestSize.Level1)
{
    int32_t ret = PreviewOn(-1, mainDemo);
    DHLOGI("DCameraTest_3400 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1400, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(5);
    DHLOGI("DCameraTest_3500 = ", ret);
    EXPECT_NE(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1500, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(camoreError);
    DHLOGI("DCameraTest_3600 = ", ret);
    EXPECT_NE(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1600, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(camoreError);
    DHLOGI("DCameraTest_3700 = ", ret);
    EXPECT_NE(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
    ret = mainDemo->SetAeExpo();
    DHLOGI("DCameraTest_3701 = ", ret);
    EXPECT_EQ(cameraOk, ret) << "SetAeExpo fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1700, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(camoreError);
    DHLOGI("DCameraTest_3800 = ", ret);
    EXPECT_NE(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
    ret = mainDemo->SetMetadata();
    DHLOGI("DCameraTest_3801 = ", ret);
    EXPECT_EQ(cameraOk, ret) << "SetMetadata fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1800, TestSize.Level1)
{
    int32_t ret = CaptureTest(nullptr);
    DHLOGI("DCameraTest_3900 = ", ret);
    EXPECT_NE(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_1900, TestSize.Level1)
{
    int32_t ret = VideoTest(nullptr);
    DHLOGI("DCameraTest_4000 = ", ret);
    EXPECT_NE(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2000, TestSize.Level1)
{
    int32_t ret = FlashLightTest(nullptr);
    DHLOGI("DCameraTest_4100 = ", ret);
    EXPECT_NE(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2100, TestSize.Level1)
{
    int32_t ret = OfflineTest(nullptr);
    DHLOGI("DCameraTest_4200 = ", ret);
    EXPECT_NE(cameraOk, ret) << "OfflineTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2200, TestSize.Level1)
{
    int32_t ret = PreviewOn(1, nullptr);
    DHLOGI("DCameraTest_4300 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
    ret = mainDemo->SetAwbMode(5);
    DHLOGI("DCameraTest_4301 = ", ret);
    EXPECT_NE(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2300, TestSize.Level1)
{
    int32_t ret = PreviewOn(1, nullptr);
    DHLOGI("DCameraTest_4400 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
    ret = mainDemo->SetAwbMode(camoreError);
    DHLOGI("DCameraTest_4401 = ", ret);
    EXPECT_NE(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2400, TestSize.Level1)
{
    int32_t ret = PreviewOn(1, nullptr);
    DHLOGI("DCameraTest_4500 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
    ret = CaptureTest(nullptr);
    DHLOGI("DCameraTest_4501 = ", ret);
    EXPECT_NE(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2500, TestSize.Level1)
{
    int32_t ret = PreviewOn(1, nullptr);
    DHLOGI("DCameraTest_4600 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
    ret = VideoTest(nullptr);
    DHLOGI("DCameraTest_4601 = ", ret);
    EXPECT_NE(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2600, TestSize.Level1)
{
    int32_t ret = PreviewOn(1, nullptr);
    DHLOGI("DCameraTest_4700 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
    ret = PreviewOn(0, nullptr);
    DHLOGI("DCameraTest_4701 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2700, TestSize.Level1)
{
    int32_t ret = PreviewOn(1, nullptr);
    DHLOGI("DCameraTest_4800 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
    ret = FlashLightTest(nullptr);
    DHLOGI("DCameraTest_4801 = ", ret);
    EXPECT_NE(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2800, TestSize.Level1)
{
    int32_t ret = PreviewOn(1, nullptr);
    DHLOGI("DCameraTest_4900 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
    ret = OfflineTest(nullptr);
    DHLOGI("DCameraTest_4901 = ", ret);
    EXPECT_NE(cameraOk, ret) << "OfflineTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_2900, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(camoreError);
    DHLOGI("DCameraTest_5000 = ", ret);
    EXPECT_NE(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
    ret = CaptureTest(nullptr);
    DHLOGI("DCameraTest_5001 = ", ret);
    EXPECT_NE(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_3000, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(camoreError);
    DHLOGI("DCameraTest_5100 = ", ret);
    EXPECT_NE(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
    ret = VideoTest(nullptr);
    DHLOGI("DCameraTest_5101 = ", ret);
    EXPECT_NE(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_3100, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(camoreError);
    DHLOGI("DCameraTest_5200 = ", ret);
    EXPECT_NE(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
    ret = FlashLightTest(nullptr);
    DHLOGI("DCameraTest_5201 = ", ret);
    EXPECT_NE(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_3200, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(camoreError);
    DHLOGI("DCameraTest_5300 = ", ret);
    EXPECT_NE(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
    ret = OfflineTest(nullptr);
    DHLOGI("DCameraTest_5301 = ", ret);
    EXPECT_NE(cameraOk, ret) << "OfflineTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_3300, TestSize.Level1)
{
    int32_t ret = CaptureTest(nullptr);
    DHLOGI("DCameraTest_5400 = ", ret);
    EXPECT_NE(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
    ret = VideoTest(nullptr);
    DHLOGI("DCameraTest_5401 = ", ret);
    EXPECT_NE(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_3400, TestSize.Level1)
{
    int32_t ret = CaptureTest(nullptr);
    DHLOGI("DCameraTest_5500 = ", ret);
    EXPECT_NE(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
    ret = FlashLightTest(nullptr);
    DHLOGI("DCameraTest_5501 = ", ret);
    EXPECT_NE(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_3500, TestSize.Level1)
{
    int32_t ret = CaptureTest(nullptr);
    DHLOGI("DCameraTest_5600 = ", ret);
    EXPECT_NE(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
    ret = OfflineTest(nullptr);
    DHLOGI("DCameraTest_5601 = ", ret);
    EXPECT_NE(cameraOk, ret) << "OfflineTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_3600, TestSize.Level1)
{
    int32_t ret = VideoTest(nullptr);
    DHLOGI("DCameraTest_5700 = ", ret);
    EXPECT_NE(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
    ret = FlashLightTest(nullptr);
    DHLOGI("DCameraTest_5701 = ", ret);
    EXPECT_NE(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_3700, TestSize.Level1)
{
    int32_t ret = VideoTest(nullptr);
    DHLOGI("DCameraTest_5800 = ", ret);
    EXPECT_NE(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
    ret = OfflineTest(nullptr);
    DHLOGI("DCameraTest_5801 = ", ret);
    EXPECT_NE(cameraOk, ret) << "OfflineTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_3800, TestSize.Level1)
{
    int32_t ret = FlashLightTest(nullptr);
    DHLOGI("DCameraTest_5900 = ", ret);
    EXPECT_NE(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
    ret = OfflineTest(nullptr);
    DHLOGI("DCameraTest_5901 = ", ret);
    EXPECT_NE(cameraOk, ret) << "OfflineTest fail";
    sleep(sleepOk);
}

HWTEST_F(DCameraAutomatTest, DCameraTest_3900, TestSize.Level1)
{
    int32_t ret = FlashLightTest(nullptr);
    DHLOGI("DCameraTest_6000 = ", ret);
    EXPECT_NE(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
    ret = FlashLightTest(nullptr);
    DHLOGI("DCameraTest_6001 = ", ret);
    EXPECT_NE(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
}