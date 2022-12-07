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

#define I_FRAME_SIZE (150 * 1024)
#define P_FRAME_SIZE (30 * 1024)

using namespace testing::ext;

class TransStreamTest : public testing::Test {
   public:
    static void SetUpTestCase();
    static void TearDownTestCase();
    void SetUp();
    void TearDown();
};

void TransStreamTest::SetUp() {}

void TransStreamTest::TearDown() {}

void TransStreamTest::SetUpTestCase()
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
}

void TransStreamTest::TearDownTestCase()
{
    int ret = UnRegisterDeviceStateDefCallback();
    EXPECT_EQ(SOFTBUS_OK, ret) << "call unReg node state callback fail";

    TestTearDown();
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_SendStream_0100
 * @tc.name     : test Stream
 * @tc.desc     : Test send stream function
 * @tc.type     : FUNC
 * @tc.size     : MediumTest
 */
HWTEST_F(TransStreamTest, SUB_Softbus_Trans_Comp_SendStream_0100, TestSize.Level2) {
    int ret;

    string data = "send stream transmission test!!!!";
    char *sendData = (char *)malloc(data.length() + 1);
    EXPECT_NE(sendData, nullptr);
    ret = strcpy_s(sendData, data.length() + 1, data.c_str());
    EXPECT_EQ(ret, SOFTBUS_OK);
    StreamData extStreamData {0};
    StreamData streamData {
        .buf = sendData,
        .bufLen = data.length() + 1,
    };
    StreamFrameInfo  frame = {0};

    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_STREAM, GetSessionListenser4Stream());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[Stream] fail";

    SessionAttribute attr;
    (void)memset_s(&attr, sizeof(attr), 0, sizeof(attr));
    attr.dataType = TYPE_STREAM;
    int sessionId = OpenSession(SESSION_NAME_STREAM, SESSION_NAME_STREAM, GetNetworkId(),
                          DEF_GROUP_ID, &attr);
    EXPECT_TRUE(sessionId >= SESSION_ID_MIN) << "call OpenSession[Stream] fail, sessionId=" << sessionId;
    if (sessionId >= SESSION_ID_MIN) {
        ret = Wait4Session(5, SESSION_4STREAM);
        EXPECT_EQ(SOFTBUS_OK, ret) << "wait opensession fail[Stream]";
        LOG("call OpenSession[Stream] success");
    }
    ResetWaitFlag();
    ret = SendStream(sessionId, &streamData, &extStreamData, &frame);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SendStream fail";
    
    CloseSession(sessionId);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_STREAM);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[proxy] fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_SendStream_P2P_0100
 * @tc.name     : test Stream By P2P
 * @tc.desc     : Test send stream function
 * @tc.type     : FUNC
 * @tc.size     : MediumTest
 */
HWTEST_F(TransStreamTest, SUB_Softbus_Trans_Comp_SendStream_P2P_0100, TestSize.Level2) {
    int ret;

    string data = "send stream transmission test!!!!";
    char *sendData = (char *)malloc(data.length() + 1);
    EXPECT_NE(sendData, nullptr);
    ret = strcpy_s(sendData, data.length() + 1, data.c_str());
    EXPECT_EQ(ret, SOFTBUS_OK);
    StreamData extStreamData {0};
    StreamData streamData {
        .buf = sendData,
        .bufLen = data.length() + 1,
    };
    StreamFrameInfo  frame = {0};

    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_STREAM, GetSessionListenser4Stream());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[Stream] fail";

    SessionAttribute attr;
    (void)memset_s(&attr, sizeof(attr), 0, sizeof(attr));
    attr.dataType = TYPE_STREAM;
    attr.linkTypeNum = 1;
    attr.linkType[0] = LINK_TYPE_WIFI_P2P;

    int sessionId = OpenSession(SESSION_NAME_STREAM, SESSION_NAME_STREAM, GetNetworkId(),
                          DEF_GROUP_ID, &attr);
    EXPECT_TRUE(sessionId >= SESSION_ID_MIN) << "call OpenSession[Stream] fail, sessionId=" << sessionId;
    if (sessionId >= SESSION_ID_MIN) {
        ret = Wait4Session(5, SESSION_4STREAM);
        EXPECT_EQ(SOFTBUS_OK, ret) << "wait opensession fail[Stream]";
        LOG("call OpenSession[Stream] success");
    }
    ResetWaitFlag();
    ret = SendStream(sessionId, &streamData, &extStreamData, &frame);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SendStream fail";
    
    CloseSession(sessionId);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_STREAM);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[proxy] fail";
}