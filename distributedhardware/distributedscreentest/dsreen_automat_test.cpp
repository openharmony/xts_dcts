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
#include "decoder_demo.h"
#include "nativetoken_kit.h"
#include "token_setproc.h"
#include "softbus_common.h"
#include "accesstoken_kit.h"

using namespace testing::ext;
using namespace OHOS::DistributedHardware;
using namespace OHOS::Security::AccessToken;

int32_t g_dSreenOk = 0;
int32_t g_dSleepOk = 1;
static constexpr int32_t DEFAULT_API_VERSION = 8;

static PermissionStateFull g_testState = {
    .permissionName = "ohos.permission.CAMERA",
    .isGeneral = true,
    .resDeviceID = {"local"},
    .grantStatus = {PermissionState::PERMISSION_GRANTED},
    .grantFlags = {1}
};

static HapPolicyParams g_PolicyPramsl = {
    .apl = APL_NORMAL,
    .domain = "test.domain.A",
    .permList = {},
    .permStateList = {g_testState}
};


class DSreenAutomatTest : public testing::Test {
public:
    static void SetUpTestCase(void);
    static void TearDownTestCase(void);
    void SetUp();
    void TearDown();
    DSreenAutomatTest();
};
void DSreenAutomatTest::SetUpTestCase(void)
{
    HapInfoParams info = {
        .userID = 1,
        .bundleName = "DctsdisScreenTest",
        .instIndex = 0,
        .appIDDesc = "testtesttesttest",
        .apiVersion = DEFAULT_API_VERSION,
        .isSystemApp = true
    };
    AccessTokenIDEx tokenIdEx = {0};
    tokenIdEx = AccessTokenKit::AllocHapToken(info, g_PolicyPramsl);
    SetSelfTokenID(tokenIdEx.tokenIDEx);
    sleep(g_dSleepOk);
}

void DSreenAutomatTest::TearDownTestCase(void) {}
void DSreenAutomatTest::SetUp(void) {}

void DSreenAutomatTest::TearDown(void) {}
DSreenAutomatTest::DSreenAutomatTest(void) {}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_0100
 * @tc.name      ：StartMirror()
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 * @tc.desc      : The distributed screen starts mirroring the screen
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_0100, TestSize.Level1)
{
    int ret = StartMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_0200
 * @tc.name      ：StopMirror()
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 * @tc.desc      : The distributed screen stops the image projection
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_0200, TestSize.Level1)
{
    int ret = StopMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_0300
 * @tc.name      ：StartExpand()
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 * @tc.desc      : Distributed screens begin to expand the projection
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_0300, TestSize.Level1)
{
    int ret = StartExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartExpand fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_0400
 * @tc.name      ：StopExpand()
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 * @tc.desc      : The distributed screen stops extending the projection
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_0400, TestSize.Level1)
{
    int ret = StopExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopExpand fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_0500
 * @tc.name      ：CreateWindow()
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 * @tc.desc      : Distributed screen Creates a small window on the remote device
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_0500, TestSize.Level1)
{
    int ret = CreateWindow(0);
    EXPECT_EQ(g_dSreenOk, ret) << "CreateWindow fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_0600
 * @tc.name      ：QueryRemoteDeviceInfo()
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 * @tc.desc      : Distributed screen Displays information about remote devices
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_0600, TestSize.Level1)
{
    int ret = QueryRemoteDeviceInfo(0);
    EXPECT_EQ(g_dSreenOk, ret) << "QueryRemoteDeviceInfo fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_0700
 * @tc.name      ：QueryRemoteScreenInfo()
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 * @tc.desc      : Distributed screen Displays information about remote screens
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_0700, TestSize.Level1)
{
    int ret = QueryRemoteScreenInfo(0);
    EXPECT_EQ(g_dSreenOk, ret) << "QueryRemoteScreenInfo fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_0800
 * @tc.name      ：Call the start image projection and stop image projection to check whether it succeeds
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_0800, TestSize.Level1)
{
    int ret = StartMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = StopMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_0900
 * @tc.name      ：Call to start and stop the extended projection to see if it is successful
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_0900, TestSize.Level1)
{
    int ret = StartExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = StopExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_1000
 * @tc.name      ：Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_1000, TestSize.Level1)
{
    int ret = StartMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = StopMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
    ret = CreateWindow(0);
    EXPECT_EQ(g_dSreenOk, ret) << "CreateWindow fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_1000
 * @tc.name      ：Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_1100, TestSize.Level1)
{
    int ret = StartExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = StopExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
    ret = CreateWindow(0);
    EXPECT_EQ(g_dSreenOk, ret) << "CreateWindow fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_1000
 * @tc.name      ：Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_1200, TestSize.Level1)
{
    int ret = StartMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = CreateWindow(0);
    EXPECT_EQ(g_dSreenOk, ret) << "CreateWindow fail";
    ret = StopMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_1000
 * @tc.name      ：Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_1300, TestSize.Level1)
{
    int ret = StartExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = CreateWindow(0);
    EXPECT_EQ(g_dSreenOk, ret) << "CreateWindow fail";
    ret = StopExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_1000
 * @tc.name      ：Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_1400, TestSize.Level1)
{
    int ret = StartMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = QueryRemoteDeviceInfo(0);
    EXPECT_EQ(g_dSreenOk, ret) << "QueryRemoteDeviceInfo fail";
    ret = StopMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_1000
 * @tc.name      ：Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_1500, TestSize.Level1)
{
    int ret = StartMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = QueryRemoteScreenInfo(0);
    EXPECT_EQ(g_dSreenOk, ret) << "QueryRemoteScreenInfo fail";
    ret = StopMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_1000
 * @tc.name      ：Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_1600, TestSize.Level1)
{
    int ret = StartExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = QueryRemoteDeviceInfo(0);
    EXPECT_EQ(g_dSreenOk, ret) << "QueryRemoteDeviceInfo fail";
    ret = StopExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_1000
 * @tc.name      ：Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_1700, TestSize.Level1)
{
    int ret = StartExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = QueryRemoteScreenInfo(0);
    EXPECT_EQ(g_dSreenOk, ret) << "QueryRemoteScreenInfo fail";
    ret = StopExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_1000
 * @tc.name      ：Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_1800, TestSize.Level1)
{
    int ret = CreateWindow(0);
    EXPECT_EQ(g_dSreenOk, ret) << "CreateWindow fail";
    ret = StopMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
    ret = StartMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_1000
 * @tc.name      ：Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_1900, TestSize.Level1)
{
    int ret = StartExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = StopExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
    ret = StartMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = StopMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_1000
 * @tc.name      ：Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_2000, TestSize.Level1)
{
    int ret = StartMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = StartExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = StopMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
    ret = StopExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_1000
 * @tc.name      ：Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_2100, TestSize.Level1)
{
    int ret = StartExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = StartMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = StopMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
    ret = StopExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_1000
 * @tc.name      ：Scramble the method invocation order to see if the method invocation fails
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_2200, TestSize.Level1)
{
    int ret = CreateWindow(0);
    EXPECT_EQ(g_dSreenOk, ret) << "CreateWindow fail";
    ret = StopExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
    ret = StopMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
    ret = StartExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = StartMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    ret = StopExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
    ret = StopMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_2300
 * @tc.name      ：StartMirror method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_2300, TestSize.Level1)
{
    int ret = StartMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_2400
 * @tc.name      ：StopMirror method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_2400, TestSize.Level1)
{
    int ret = StopMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_2500
 * @tc.name      ：StartExpand method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_2500, TestSize.Level1)
{
    int ret = StartExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartExpand fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_2600
 * @tc.name      ：StopExpand method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_2600, TestSize.Level1)
{
    int ret = StopExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopExpand fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_2700
 * @tc.name      ：CreateWindow method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_2700, TestSize.Level1)
{
    int ret = CreateWindow(2);
    EXPECT_NE(g_dSreenOk, ret) << "CreateWindow fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_2800
 * @tc.name      ：QueryRemoteDeviceInfo method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_2800, TestSize.Level1)
{
    int ret = QueryRemoteDeviceInfo(2);
    EXPECT_NE(g_dSreenOk, ret) << "QueryRemoteDeviceInfo fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_2900
 * @tc.name      ：QueryRemoteScreenInfo method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_2900, TestSize.Level1)
{
    int ret = QueryRemoteScreenInfo(2);
    EXPECT_NE(g_dSreenOk, ret) << "QueryRemoteScreenInfo fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_3000
 * @tc.name      ：StartMirror and StopMirror method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_3000, TestSize.Level1)
{
    int ret = StartMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartMirror fail";
    ret = StopMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_3100
 * @tc.name      ：StartMirror and StartExpand method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_3100, TestSize.Level1)
{
    int ret = StartMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartMirror fail";
    ret = StartExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartExpand fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_3200
 * @tc.name      ：StartMirror and CreateWindow method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_3200, TestSize.Level1)
{
    int ret = StartMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartMirror fail";
    ret = CreateWindow(2);
    EXPECT_NE(g_dSreenOk, ret) << "CreateWindow fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_3300
 * @tc.name      ：StartMirror and QueryRemoteDeviceInfo method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_3300, TestSize.Level1)
{
    int ret = StartMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartMirror fail";
    ret = QueryRemoteDeviceInfo(2);
    EXPECT_NE(g_dSreenOk, ret) << "QueryRemoteDeviceInfo fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_3400
 * @tc.name      ：StartMirror and QueryRemoteScreenInfo method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_3400, TestSize.Level1)
{
    int ret = StartMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartMirror fail";
    ret = QueryRemoteScreenInfo(2);
    EXPECT_NE(g_dSreenOk, ret) << "QueryRemoteScreenInfo fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_3500
 * @tc.name      ：StartMirror and StopExpand method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_3500, TestSize.Level1)
{
    int ret = StartMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartMirror fail";
    ret = StopExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopExpand fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_3600
 * @tc.name      ：StopMirror and StartExpand method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_3600, TestSize.Level1)
{
    int ret = StopMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopMirror fail";
    ret = StartExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartExpand fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_3700
 * @tc.name      ：StopMirror and CreateWindow method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_3700, TestSize.Level1)
{
    int ret = StopMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopMirror fail";
    ret = CreateWindow(2);
    EXPECT_NE(g_dSreenOk, ret) << "CreateWindow fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_3800
 * @tc.name      ：StopMirror and QueryRemoteDeviceInfo method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_3800, TestSize.Level1)
{
    int ret = StopMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopMirror fail";
    ret = QueryRemoteDeviceInfo(2);
    EXPECT_NE(g_dSreenOk, ret) << "QueryRemoteDeviceInfo fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_3900
 * @tc.name      ：StopMirror and QueryRemoteScreenInfo method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_3900, TestSize.Level1)
{
    int ret = StopMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopMirror fail";
    ret = QueryRemoteScreenInfo(2);
    EXPECT_NE(g_dSreenOk, ret) << "QueryRemoteScreenInfo fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_4000
 * @tc.name      ：StopMirror and StopExpand method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_4000, TestSize.Level1)
{
    int ret = StopMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopMirror fail";
    ret = StopExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopExpand fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_4100
 * @tc.name      ：StartExpand and CreateWindow method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_4100, TestSize.Level1)
{
    int ret = StartExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartExpand fail";
    ret = CreateWindow(2);
    EXPECT_NE(g_dSreenOk, ret) << "CreateWindow fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_4200
 * @tc.name      ：StartExpand and QueryRemoteDeviceInfo method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_4200, TestSize.Level1)
{
    int ret = StartExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartExpand fail";
    ret = QueryRemoteDeviceInfo(2);
    EXPECT_NE(g_dSreenOk, ret) << "QueryRemoteDeviceInfo fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_4300
 * @tc.name      ：StartExpand and StopExpand method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_4300, TestSize.Level1)
{
    int ret = StartExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartExpand fail";
    ret = StopExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopExpand fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_4400
 * @tc.name      StartMirror and StopMirror method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_4400, TestSize.Level1)
{
    int ret = -1;
    for (int num = 0; num < 5; num++) {
        ret = StartMirror(0);
        std::cout << "SUB_DH_Dscreen_Dcts_4400 num:" << num << "ret:" << ret << std::endl;
        EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    }
    ret = StopMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_4500
 * @tc.name      StartMirror and StopMirror method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_4500, TestSize.Level1)
{
    int ret = StartMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    for (int num = 0; num < 5; num++) {
        ret = StopMirror(0);
        std::cout << "SUB_DH_Dscreen_Dcts_4500 num:" << num << "ret:" << ret << std::endl;
        EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
    }
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_4600
 * @tc.name      ：StartExpand and StopExpand method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_4600, TestSize.Level1)
{
    int ret = -1;
    for (int num = 0; num < 5; num++) {
        ret = StartExpand(0);
        std::cout << "SUB_DH_Dscreen_Dcts_4600 num:" << num << "ret:" << ret << std::endl;
        EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    }
    ret = StopExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopExpand fail";
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_4700
 * @tc.name      ：StartExpand and StopExpand method Enter error parameters to see the return value
 * @tc.desc      : Composite test function
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_4700, TestSize.Level1)
{
    int ret = -1;
    ret = StartExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
    for (int num = 0; num < 5; num++) {
        ret = StopExpand(0);
        std::cout << "SUB_DH_Dscreen_Dcts_4700 num:" << num << "ret:" << ret << std::endl;
        EXPECT_EQ(g_dSreenOk, ret) << "StopExpand fail";
    }
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_4800
 * @tc.name      ：CreateWindow()
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 * @tc.desc      : Distributed screen Creates a small window on the remote device
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_4800, TestSize.Level1)
{
    int ret = -1;
    for (int num = 0; num < 5; num++) {
        ret = CreateWindow(0);
        std::cout << "SUB_DH_Dscreen_Dcts_4800 num:" << num << "ret:" << ret << std::endl;
        EXPECT_EQ(g_dSreenOk, ret) << "CreateWindow fail";
    }
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_4900
 * @tc.name      ：QueryRemoteDeviceInfo()
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 * @tc.desc      : Distributed screen Displays information about remote devices
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_4900, TestSize.Level1)
{
    int ret = -1;
    for (int num = 0; num < 5; num++) {
        ret = QueryRemoteDeviceInfo(0);
        std::cout << "SUB_DH_Dscreen_Dcts_4900 num:" << num << "ret:" << ret << std::endl;
        EXPECT_EQ(g_dSreenOk, ret) << "QueryRemoteDeviceInfo fail";
    }
}

/**
 * @tc.number    : SUB_DH_Dscreen_Dcts_5000
 * @tc.name      ：QueryRemoteScreenInfo()
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 * @tc.desc      : Distributed screen Displays information about remote screens
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(DSreenAutomatTest, SUB_DH_Dscreen_Dcts_5000, TestSize.Level1)
{
    int ret = -1;
    for (int num = 0; num < 5; num++) {
        ret = QueryRemoteScreenInfo(0);
        std::cout << "SUB_DH_Dscreen_Dcts_5000 num:" << num << "ret:" << ret << std::endl;
        EXPECT_EQ(g_dSreenOk, ret) << "QueryRemoteScreenInfo fail";
    }
}