/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

#include "net_trans_common.h"
#include "wifi_utils.h"

using namespace testing::ext;

class TransFuncTest : public testing::Test {
public:
    // 测试套前置和后置操作
    static void SetUpTestCase();
    static void TearDownTestCase();

    // 测试用例前置和后置操作
    void SetUp();
    void TearDown();
};

void TransFuncTest::SetUp() {}

void TransFuncTest::TearDown() {}

void TransFuncTest::SetUpTestCase()
{
    LOG("SetUp begin");
    AddPermission();
    sleep(1);
    system("pidof accesstoken_ser | xargs kill -9");
    sleep(1);
    TestSetUp();

    int ret = RegisterDeviceStateDefCallback();
    EXPECT_EQ(SOFTBUS_OK, ret) << "call reg node state callback fail";
    ret = CheckRemoteDeviceIsNull(BOOL_TRUE);
    ASSERT_EQ(SOFTBUS_OK, ret) << "get node fail,please check network";

    LOG("SetUp end");
}

void TransFuncTest::TearDownTestCase()
{
    int ret = UnRegisterDeviceStateDefCallback();
    EXPECT_EQ(SOFTBUS_OK, ret) << "call unReg node state callback fail";

    TestTearDown();
}

/**
 * @tc.number : SUB_Softbus_Trans_SendByte_Func_0100
 * @tc.name     : SendByte Packet size 1B, send and receive successful
 * @tc.desc       : Test the SendByte specification
 * @tc.type       : FUNC
 * @tc.size        : MediumTest
 */
HWTEST_F(TransFuncTest, SUB_Softbus_Trans_SendByte_Func_0100, TestSize.Level3)
{
    int ret;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "create Ss and openS[data] fail";

    int size = 1;
    ret = SendData4Data(DATA_TYPE_BYTE, size);
    EXPECT_EQ(SOFTBUS_OK, ret) << "SendData4Data(byte, 1B) fail";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "close session and remove Ss fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_SendByte_Func_0200
 * @tc.name   : SendByte Packet size 2K, send and receive successful
 * @tc.desc   : Test the SendByte specification
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFuncTest, SUB_Softbus_Trans_SendByte_Func_0200, TestSize.Level1)
{
    int ret;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "create Ss and openS[data] fail";

    int size = 2 * 1024 * 1024;
    ret = SendData4Data(DATA_TYPE_BYTE, size);
    EXPECT_EQ(SOFTBUS_OK, ret) << "SendData4Data(byte,2M) fail";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "close session and remove Ss fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_SendByte_Func_0300
 * @tc.name   : SendByte Packet size Max, send and receive successful
 * @tc.desc   : Test the SendByte specification
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFuncTest, SUB_Softbus_Trans_SendByte_Func_0300, TestSize.Level2)
{
    int ret;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "create Ss and openS[data] fail";

    int size = TRANS_BYTES_LENGTH_MAX;
    ret = SendData4Data(DATA_TYPE_BYTE, size);
    EXPECT_EQ(SOFTBUS_OK, ret) << "SendData4Data(byte,Max) fail";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "close session and remove Ss fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_SendByte_Func_0400
 * @tc.name   : SendByte Packet size 0, send and receive successful
 * @tc.desc   : Test the SendByte specification
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFuncTest, SUB_Softbus_Trans_SendByte_Func_0400, TestSize.Level3)
{
    int ret;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "create Ss and openS[data] fail";

    int size = 0;
    string emptyStr = "";
    int sessionId = GetCurrentSessionId4Data();
    ret = SendBytes(sessionId, emptyStr.c_str(), size);
    EXPECT_NE(SOFTBUS_OK, ret) << "call sendbytes(empty) fail";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "close session and remove Ss fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_SendMessage_Func_0100
 * @tc.name     : SendMessage Packet size 1B, send and receive successful
 * @tc.desc       : Test the SendMessage specification
 * @tc.type       : FUNC
 * @tc.size        : MediumTest
 */
HWTEST_F(TransFuncTest, SUB_Softbus_Trans_SendMessage_Func_0100, TestSize.Level3)
{
    int ret;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "create Ss and openS[data] fail";

    int size = 1;
    ret = SendData4Data(DATA_TYPE_MSG, size);
    EXPECT_EQ(SOFTBUS_OK, ret) << "SendData4Data(msg, 1B) fail";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "close session and remove Ss fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_SendMessage_Func_0200
 * @tc.name   : SendMessage Packet size 1K, send and receive successful
 * @tc.desc   : Test the SendMessage specification
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFuncTest, SUB_Softbus_Trans_SendMessage_Func_0200, TestSize.Level1)
{
    int ret;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "create Ss and openS[data] fail";

    int size = 1000;
    ret = SendData4Data(DATA_TYPE_MSG, size);
    EXPECT_EQ(SOFTBUS_OK, ret) << "SendData4Data(msg,1K) fail";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "close session and remove Ss fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_SendMessage_Func_0300
 * @tc.name   : SendMessage Packet size Max, send and receive successful
 * @tc.desc   : Test the SendMessage specification
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFuncTest, SUB_Softbus_Trans_SendMessage_Func_0300, TestSize.Level2)
{
    int ret;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "create Ss and openS[data] fail";

    int size = TRANS_MESSAGE_LENGTH_MAX;
    ret = SendData4Data(DATA_TYPE_MSG, size);
    EXPECT_EQ(SOFTBUS_OK, ret) << "SendData4Data(msg,Max) fail";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "close session and remove Ss fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_SendMessage_Func_0400
 * @tc.name   : SendMessage Packet size 0, send and receive successful
 * @tc.desc   : Test the SendMessage specification
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFuncTest, SUB_Softbus_Trans_SendMessage_Func_0400, TestSize.Level3)
{
    int ret;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "create Ss and openS[data] fail";

    int size = 0;
    string emptyStr = "";
    int sessionId = GetCurrentSessionId4Data();
    ret = SendMessage(sessionId, emptyStr.c_str(), size);
    EXPECT_NE(SOFTBUS_OK, ret) << "call sendmsg(empty) fail";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "close session and remove Ss fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_SendMessage_Func_0500
 * @tc.name   : SendMessage Packet size Max+1, send and receive successful
 * @tc.desc   : Test the SendMessage specification
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFuncTest, SUB_Softbus_Trans_SendMessage_Func_0500, TestSize.Level3)
{
    int ret;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "create Ss and openS[data] fail";

    int size = TRANS_MESSAGE_LENGTH_MAX + 1;
    char* dataMoreMax = (char*)malloc(size);
    ASSERT_TRUE(dataMoreMax != NULL) << "malloc fail";

    int sessionId = GetCurrentSessionId4Data();
    ret = SendMessage(sessionId, &dataMoreMax, size);
    EXPECT_NE(SOFTBUS_OK, ret) << "call sendmsg(Max+1) fail";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "close session and remove Ss fail";
    free(dataMoreMax);
}