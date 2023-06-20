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
 * @tc.name      ：PreviewOn()
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 * @tc.desc      : Invoke the preview stream to send the preview file back to the local end and save it to the local end
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0100, TestSize.Level1)
{
    int32_t ret = PreviewOn(0, mainDemo);
    EXPECT_EQ(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_0100
 * @tc.name      : CaptureTest()
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 * @tc.desc      : Take pictures with a remote camera and save them locally
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0200, TestSize.Level1)
{
    int32_t ret = CaptureTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_0700
 * @tc.name      ：VideoTest()
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 * @tc.desc      : Record video with a remote camera and save the video locally
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0300, TestSize.Level1)
{
    int32_t ret = VideoTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_0200
 * @tc.name      : SetAwbMode()
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 * @tc.desc      : Set Awb Mode is 0, success is returned
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0400, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(sleepOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_0300
 * @tc.name      : SetAwbMode()
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 * @tc.desc      : the Set Awb Mode is 2, success is returned
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0500, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(cameraOk);
    EXPECT_EQ(cameraOk, ret) << "SetAwbMode fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_0400
 * @tc.name      ：mainDemo->SetAeExpo()
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 * @tc.desc      : Set the exposure mode update parameters
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0600, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAeExpo();
    EXPECT_EQ(cameraOk, ret) << "SetAeExpo fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_0500
 * @tc.name      ：mainDemo->SetMetadata()
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 * @tc.desc      : Set the parameters required for taking pictures and recording videos
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0700, TestSize.Level1)
{
    int32_t ret = mainDemo->SetMetadata();
    EXPECT_EQ(cameraOk, ret) << "SetMetadata fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_0800
 * @tc.name      ：FlashLightTest()
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 * @tc.desc      : Turn off the preview stream, turn on the flashlight, init the camera device, and turn on the preview
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0800, TestSize.Level1)
{
    int32_t ret = FlashLightTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_0900
 * @tc.name      ：OfflineTest()
 * @tc.desc      : [STD-DISTRIBUTED-0101]禁止修改分布式相机交互协议
 * @tc.desc      : Turn off Preview Turn on dual-stream offline mode delay 5 seconds after init the camera device
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_0900, TestSize.Level1)
{
    int32_t ret = OfflineTest(mainDemo);
    EXPECT_EQ(cameraOk, ret) << "OfflineTest fail";
}

/**
 * @tc.number    : DCameraTest_1000
 * @tc.name      : Test whether preview and awb parameter Settings can be successful
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_1100
 * @tc.name      : Whether an error occurs when multiple methods are executed consecutively
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_1200
 * @tc.name      : Whether an error occurs when multiple methods are executed consecutively
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_1300
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_1400
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_1500
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_1600
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_1700
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_1800
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_1900
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_2000
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_2100
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_2200
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_2300
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_2400
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_2500
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_2600
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_2700
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_2800
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_2900
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_3000
 * @tc.name      : Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
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

/**
 * @tc.number    : DCameraTest_3100
 * @tc.name      : Preview method Enter error parameters to see the return value
 * @tc.desc      : Test preview exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_3100, TestSize.Level1)
{
    int32_t ret = PreviewOn(1, mainDemo);
    DHLOGI("DCameraTest_3100 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_3200
 * @tc.name      : Preview method Enter error parameters to see the return value
 * @tc.desc      : Test preview exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_3200, TestSize.Level1)
{
    int32_t ret = PreviewOn(1, nullptr);
    DHLOGI("DCameraTest_3200 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_3300
 * @tc.name      : Preview method Enter error parameters to see the return value
 * @tc.desc      : Test preview exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_3300, TestSize.Level1)
{
    int32_t ret = PreviewOn(0, nullptr);
    DHLOGI("DCameraTest_3300 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_3400
 * @tc.name      : Preview method Enter error parameters to see the return value
 * @tc.desc      : Test preview exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_3400, TestSize.Level1)
{
    int32_t ret = PreviewOn(-1, mainDemo);
    DHLOGI("DCameraTest_3400 = ", ret);
    EXPECT_NE(cameraOk, ret) << "PreviewOn fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_3500
 * @tc.name      : Set the wrong awb mode to view the return result
 * @tc.desc      : Test SetAwbMode exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_3500, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(5);
    DHLOGI("DCameraTest_3500 = ", ret);
    EXPECT_NE(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_3600
 * @tc.name      : Set the wrong awb mode to view the return result
 * @tc.desc      : Test SetAwbMode exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_3600, TestSize.Level1)
{
    int32_t ret = mainDemo->SetAwbMode(camoreError);
    DHLOGI("DCameraTest_3600 = ", ret);
    EXPECT_NE(cameraOk, ret) << "SetAwbMode incandescent fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_3700
 * @tc.name      : awb mode input error parameters when calling the SetAeExpo method to see the results
 * @tc.desc      : Test SetAwbMode,SetAeExpo exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_3700, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_3800
 * @tc.name      : awb mode input error parameters when calling the SetAeExpo method to see the results
 * @tc.desc      : Test SetAwbMode,SetAeExpo exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_3800, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_3900
 * @tc.name      : CaptureTest Enter a null value to view the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_3900, TestSize.Level1)
{
    int32_t ret = CaptureTest(nullptr);
    DHLOGI("DCameraTest_3900 = ", ret);
    EXPECT_NE(cameraOk, ret) << "CaptureTest fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_4000
 * @tc.name      : VideoTest Enter a null value to view the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_4000, TestSize.Level1)
{
    int32_t ret = VideoTest(nullptr);
    DHLOGI("DCameraTest_4000 = ", ret);
    EXPECT_NE(cameraOk, ret) << "VideoTest fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_4100
 * @tc.name      : FlashLightTest Enter a null value to view the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_4100, TestSize.Level1)
{
    int32_t ret = FlashLightTest(nullptr);
    DHLOGI("DCameraTest_4100 = ", ret);
    EXPECT_NE(cameraOk, ret) << "FlashLightTest fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_4200
 * @tc.name      : OfflineTest Enter a null value to view the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_4200, TestSize.Level1)
{
    int32_t ret = OfflineTest(nullptr);
    DHLOGI("DCameraTest_4200 = ", ret);
    EXPECT_NE(cameraOk, ret) << "OfflineTest fail";
    sleep(sleepOk);
}

/**
 * @tc.number    : DCameraTest_4300
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_4300, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_4400
 * @tc.name      :  Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_4400, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_4500
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_4500, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_4600
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_4600, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_4700
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_4700, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_4800
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_4800, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_4900
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_4900, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_5000
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_5000, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_5100
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_5100, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_5200
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_5200, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_5300
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_5300, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_5400
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_5400, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_5500
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_5500, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_5600
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_5600, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_5700
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_5700, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_5800
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_5800, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_5900
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_5900, TestSize.Level1)
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

/**
 * @tc.number    : DCameraTest_6000
 * @tc.name      : Perform a combination test for different method exceptions and check the return result
 * @tc.desc      : Test exception
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DCameraAutomatTest, DCameraTest_6000, TestSize.Level1)
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