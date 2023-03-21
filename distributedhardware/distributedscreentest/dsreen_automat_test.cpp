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
#include "decoder_demo.h"
#include "nativetoken_kit.h"
#include "token_setproc.h"
#include "softbus_common.h"

using namespace testing::ext;

int32_t g_dSreenOk = 0;
int32_t g_dSleepOk = 1;

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
    uint64_t tokenId;
    const char *perms[2];
    perms[0] = OHOS_PERMISSION_DISTRIBUTED_SOFTBUS_CENTER;
    perms[1] = OHOS_PERMISSION_DISTRIBUTED_DATASYNC;
    NativeTokenInfoParams infoTnstance = {
        .dcapsNum = 0,
        .permsNum = 2,
        .aclsNum = 0,
        .dcaps = NULL,
        .perms = perms,
        .acls = NULL,
        .processName = "dsoftbus_service",
        .aplStr = "system_core",
    };
    tokenId = GetAccessTokenId(&infoTnstance);
    SetSelfTokenID(tokenId);
    sleep(g_dSleepOk);
    system("pidof accesstoken_ser | xargs kill -9");
}

void DSreenAutomatTest::TearDownTestCase(void) {}
void DSreenAutomatTest::SetUp(void) {}

void DSreenAutomatTest::TearDown(void) {}
DSreenAutomatTest::DSreenAutomatTest(void) {}

/**
 * @tc.number    : DSreenTest_0100
 * @tc.name      : StartMirror parameter test
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 */
HWTEST_F(DSreenAutomatTest, DSreenTest_0100, TestSize.Level1)
{
    int ret = StartMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartMirror fail";
}

/**
 * @tc.number    : DSreenTest_0200
 * @tc.name      : StopMirror parameter test
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 */
HWTEST_F(DSreenAutomatTest, DSreenTest_0200, TestSize.Level1)
{
    int ret = StopMirror(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopMirror fail";
}

/**
 * @tc.number    : DSreenTest_0300
 * @tc.name      : StartExpand parameter test
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 */
HWTEST_F(DSreenAutomatTest, DSreenTest_0300, TestSize.Level1)
{
    int ret = StartExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StartExpand fail";
}

/**
 * @tc.number    : DSreenTest_0400
 * @tc.name      : StopExpand parameter test
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 */
HWTEST_F(DSreenAutomatTest, DSreenTest_0400, TestSize.Level1)
{
    int ret = StopExpand(0);
    EXPECT_EQ(g_dSreenOk, ret) << "StopExpand fail";
}

/**
 * @tc.number    : DSreenTest_0500
 * @tc.name      : CreateWindow parameter test
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 */
HWTEST_F(DSreenAutomatTest, DSreenTest_0500, TestSize.Level1)
{
    int ret = CreateWindow(0);
    EXPECT_EQ(g_dSreenOk, ret) << "CreateWindow fail";
}

/**
 * @tc.number    : DSreenTest_0600
 * @tc.name      : QueryRemoteDeviceInfo parameter test
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 */
HWTEST_F(DSreenAutomatTest, DSreenTest_0600, TestSize.Level1)
{
    int ret = QueryRemoteDeviceInfo(0);
    EXPECT_EQ(g_dSreenOk, ret) << "QueryRemoteDeviceInfo fail";
}

/**
 * @tc.number    : DSreenTest_0700
 * @tc.name      : QueryRemoteScreenInfo parameter test
 * @tc.desc      : [STD-DISTRIBUTED-0113]禁止修改OpenHarmony分布式屏幕交互协议
 */
HWTEST_F(DSreenAutomatTest, DSreenTest_0700, TestSize.Level1)
{
    int ret = QueryRemoteScreenInfo(0);
    EXPECT_EQ(g_dSreenOk, ret) << "QueryRemoteScreenInfo fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_0800, TestSize.Level1)
{
    int ret = StartMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartMirror fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_0900, TestSize.Level1)
{
    int ret = StopMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopMirror fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_1000, TestSize.Level1)
{
    int ret = StartExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartExpand fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_1100, TestSize.Level1)
{
    int ret = StopExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopExpand fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_1200, TestSize.Level1)
{
    int ret = CreateWindow(2);
    EXPECT_NE(g_dSreenOk, ret) << "CreateWindow fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_1300, TestSize.Level1)
{
    int ret = QueryRemoteDeviceInfo(2);
    EXPECT_NE(g_dSreenOk, ret) << "QueryRemoteDeviceInfo fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_1400, TestSize.Level1)
{
    int ret = QueryRemoteScreenInfo(2);
    EXPECT_NE(g_dSreenOk, ret) << "QueryRemoteScreenInfo fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_1500, TestSize.Level1)
{
    int ret = StartMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartMirror fail";
    ret = StopMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopMirror fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_1600, TestSize.Level1)
{
    int ret = StartMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartMirror fail";
    ret = StartExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartExpand fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_1700, TestSize.Level1)
{
    int ret = StartMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartMirror fail";
    ret = CreateWindow(2);
    EXPECT_NE(g_dSreenOk, ret) << "CreateWindow fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_1800, TestSize.Level1)
{
    int ret = StartMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartMirror fail";
    ret = QueryRemoteDeviceInfo(2);
    EXPECT_NE(g_dSreenOk, ret) << "QueryRemoteDeviceInfo fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_1900, TestSize.Level1)
{
    int ret = StartMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartMirror fail";
    ret = QueryRemoteScreenInfo(2);
    EXPECT_NE(g_dSreenOk, ret) << "QueryRemoteScreenInfo fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_2000, TestSize.Level1)
{
    int ret = StartMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartMirror fail";
    ret = StopExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopExpand fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_2100, TestSize.Level1)
{
    int ret = StopMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopMirror fail";
    ret = StartExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartExpand fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_2200, TestSize.Level1)
{
    int ret = StopMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopMirror fail";
    ret = CreateWindow(2);
    EXPECT_NE(g_dSreenOk, ret) << "CreateWindow fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_2300, TestSize.Level1)
{
    int ret = StopMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopMirror fail";
    ret = QueryRemoteDeviceInfo(2);
    EXPECT_NE(g_dSreenOk, ret) << "QueryRemoteDeviceInfo fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_2400, TestSize.Level1)
{
    int ret = StopMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopMirror fail";
    ret = QueryRemoteScreenInfo(2);
    EXPECT_NE(g_dSreenOk, ret) << "QueryRemoteScreenInfo fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_2500, TestSize.Level1)
{
    int ret = StopMirror(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopMirror fail";
    ret = StopExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopExpand fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_2600, TestSize.Level1)
{
    int ret = StartExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartExpand fail";
    ret = CreateWindow(2);
    EXPECT_NE(g_dSreenOk, ret) << "CreateWindow fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_2700, TestSize.Level1)
{
    int ret = StartExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartExpand fail";
    ret = QueryRemoteDeviceInfo(2);
    EXPECT_NE(g_dSreenOk, ret) << "QueryRemoteDeviceInfo fail";
}

HWTEST_F(DSreenAutomatTest, DSreenTest_2800, TestSize.Level1)
{
    int ret = StartExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StartExpand fail";
    ret = StopExpand(2);
    EXPECT_NE(g_dSreenOk, ret) << "StopExpand fail";
}