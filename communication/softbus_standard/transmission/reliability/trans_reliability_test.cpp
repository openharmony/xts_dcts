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

#include "net_trans_common.h"
#include "wifi_utils.h"
#include "softbus_errcode.h"

using namespace testing::ext;

static const int EXPECT_INVALID_PARAM = SOFTBUS_INVALID_PARAM;

class TransReliabilityTest : public testing::Test {
public:
    static void SetUpTestCase();
    static void TearDownTestCase();
    void SetUp();
    void TearDown();
};

void TransReliabilityTest::SetUp() {}

void TransReliabilityTest::TearDown() {}

void TransReliabilityTest::SetUpTestCase()
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

void TransReliabilityTest::TearDownTestCase()
{
    int ret = UnRegisterDeviceStateDefCallback();
    EXPECT_EQ(SOFTBUS_OK, ret) << "call unReg node state callback fail";

    TestTearDown();
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli__0100
 * @tc.name   : SessionId doesn’t exist，Failed to send byte
 * @tc.desc   : Test Transceiver data reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli__0100, TestSize.Level3)
{
    int ret;
    int sessionId = 0;
    string data = "invalid session id";
    ret = SendBytes(sessionId, data.c_str(), data.length());
    EXPECT_EQ(SOFTBUS_TRANS_INVALID_SESSION_ID, ret);
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli__0200
 * @tc.name   : SessionId closed，Failed to send byte
 * @tc.desc   : Test Transceiver data reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli__0200, TestSize.Level3)
{
    int ret;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";

    int sessionId = GetCurrentSessionId4Data();
    ret = CloseSessionAndRemoveSs4Data();
    ASSERT_EQ(SOFTBUS_OK, ret);

    string data = "session closed";
    ret = SendBytes(sessionId, data.c_str(), data.length());
    EXPECT_EQ(SOFTBUS_TRANS_INVALID_SESSION_ID, ret);
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli__0300
 * @tc.name   : send data during OpenSession
 * @tc.desc   : Test Transceiver data reliability
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli__0300, TestSize.Level3)
{
    int ret;
    char* softbusPidStart;
    char* softbusPidEnd;
    softbusPidStart = GetSoftbusPid();
    EXPECT_TRUE(softbusPidStart != NULL);

    const int count = 4;
    int sessionId4Data[count];
    int sessionId4Ctrl[count];
    char groupId[][GROUP_ID_LEN] = { "g1", "g2", "g3", "g4" };
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_CTL, GetSessionListenser4Ctl());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS-ctrl fail";
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS-data fail";
    for (int i = 0; i < count; i++) {
        sessionId4Data[i] =
            OpenSession(SESSION_NAME_DATA, SESSION_NAME_DATA, GetNetworkId(), groupId[i], GetSessionAttr4Data());
        sessionId4Ctrl[i] =
            OpenSession(SESSION_NAME_CTL, SESSION_NAME_CTL, GetNetworkId(), groupId[i], GetSessionAttr4Ctl());
    }

    // send data
    char* sendData = (char*)malloc(TRANS_BYTES_LENGTH_MAX);
    ASSERT_TRUE(sendData != NULL);
    (void)memset_s(sendData, TRANS_BYTES_LENGTH_MAX, 'C', TRANS_BYTES_LENGTH_MAX);
    for (int i = 0; i < count; i++) {
        ret = SendBytes(sessionId4Data[i], sendData, TRANS_BYTES_LENGTH_MAX);
        LOG("######sid:%d, send byte:%d", sessionId4Data[i], ret);
        ret = SendBytes(sessionId4Ctrl[i], sendData, TRANS_BYTES_LENGTH_MAX);
        LOG("######sid:%d, send byte:%d", sessionId4Ctrl[i], ret);
    }
    for (int i = 0; i < count; i++) {
        ret = SendMessage(sessionId4Data[i], sendData, TRANS_BYTES_LENGTH_MAX);
        LOG("######sid:%d, send msg:%d", sessionId4Data[i], ret);
        ret = SendMessage(sessionId4Ctrl[i], sendData, TRANS_BYTES_LENGTH_MAX);
        LOG("######sid:%d, send msg:%d", sessionId4Ctrl[i], ret);
    }

    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_CTL);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSessionServer fail";
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSessionServer fail";

    softbusPidEnd = GetSoftbusPid();
    EXPECT_TRUE(softbusPidEnd != NULL);
    EXPECT_STREQ(softbusPidStart, softbusPidEnd);
    free(softbusPidStart);
    free(softbusPidEnd);
    free(sendData);
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli__0400
 * @tc.name   : SessionId doesn’t exist，Failed to send Message
 * @tc.desc   : Test Transceiver data reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli__0400, TestSize.Level3)
{
    int ret;
    int sessionId = 0;
    string data = "invalid session id";
    ret = SendMessage(sessionId, data.c_str(), data.length());
    EXPECT_EQ(SOFTBUS_TRANS_INVALID_SESSION_ID, ret);
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_0500
 * @tc.name   : CreateSessionServer repeatedly
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_0500, TestSize.Level3)
{
    int ret;
    char sessionNames[][SESSION_NAME_SIZE_MAX] = { "com.communication.demo1.1", "com.communication.demo1.2",
        "com.communication.demo1.3", "com.communication.demo1.4", "com.communication.demo1.5",
        "com.communication.demo1.6", "com.communication.demo1.7", "com.communication.demo1.8" };

    for (int i = 0; i < MAX_SESSION_SERVER_NUM_CLIENT; i++) {
        ret = CreateSessionServer(DEF_PKG_NAME, sessionNames[i], GetSessionListenser4Data());
        EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS fail,i=" << i;
    }

    // repeat once, expect success
    for (int i = 0; i < MAX_SESSION_SERVER_NUM_CLIENT; i++) {
        ret = CreateSessionServer(DEF_PKG_NAME, sessionNames[i], GetSessionListenser4Data());
        EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS success[repeat],i=" << i;
    }

    for (int i = 0; i < MAX_SESSION_SERVER_NUM_CLIENT; i++) {
        ret = RemoveSessionServer(DEF_PKG_NAME, sessionNames[i]);
        EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS fail,i=" << i;
    }
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_0600
 * @tc.name   : CreateSessionServer input pkg name null
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_0600, TestSize.Level3)
{
    int ret;
    ret = CreateSessionServer(NULL, SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "CreateSS[pkg name null]";
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS fail[session listener only malloc]";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_0700
 * @tc.name   : CreateSessionServer input session name null
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_0700, TestSize.Level3)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, NULL, GetSessionListenser4Data());
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "CreateSS[session name null]";
    
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS fail[session listener only malloc]";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_0800
 * @tc.name   : CreateSessionServer input session listener null
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_0800, TestSize.Level3)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, NULL);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "CreateSS[session listener null]";
   
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS fail[session listener only malloc]";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_0900
 * @tc.name   : CreateSessionServer input session listener only malloc
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_0900, TestSize.Level3)
{
    int ret;
    ISessionListener* listener = (ISessionListener*)malloc(sizeof(ISessionListener));
    (void)memset_s(listener, sizeof(ISessionListener), 0, sizeof(ISessionListener));
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, listener);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "CreateSS fail[session listener only malloc]";
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS fail[session listener only malloc]";

    free(listener);
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_1000
 * @tc.name   : CreateSessionServer input session listener only malloc
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_1000, TestSize.Level3)
{
    int ret;
    ISessionListener* listener = (ISessionListener*)malloc(sizeof(ISessionListener));
   
    listener->OnBytesReceived = NULL;
    listener->OnMessageReceived = NULL;
    listener->OnSessionClosed = NULL;
    listener->OnSessionOpened = NULL;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, listener);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "CreateSS success[session listener member=null]";
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS fail[session listener only malloc]";

    free(listener);
}


/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_1100
 * @tc.name   : RemoveSessionServer input pkg name null
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_1100, TestSize.Level3)
{
    int ret;
    ret = RemoveSessionServer(NULL, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_INVALID_PARAM, ret) << "RemoveSS success[pkg name null]";

}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_1200
 * @tc.name   : RemoveSessionServer input session name null
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_1200, TestSize.Level3)
{
    int ret;
    
    ret = RemoveSessionServer(DEF_PKG_NAME, NULL);
    EXPECT_EQ(SOFTBUS_INVALID_PARAM, ret) << "RemoveSS success[session name null]";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_1300
 * @tc.name   : RemoveSessionServer input all null
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_1300, TestSize.Level3)
{
    int ret;
    ret = RemoveSessionServer(NULL, NULL);
    EXPECT_EQ(SOFTBUS_INVALID_PARAM, ret) << "RemoveSS success[all null]";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_1400
 * @tc.name   : OpenSession, SessionServer do not exist
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_1400, TestSize.Level3)
{
    int ret;
    int sessionId;
    ResetWaitFlag4Data();
    sessionId = OpenSession(SESSION_NAME_DATA, SESSION_NAME_DATA, GetNetworkId(), DEF_GROUP_ID, GetSessionAttr4Data());
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call OpenSession success,sid:" << sessionId;
    SetCurrentSessionId4Data(sessionId);
    ret = Wait4Session(5, SESSION_4DATA);
    EXPECT_NE(SOFTBUS_OK, ret) << "Wait4Session success";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_1500
 * @tc.name   : OpenSession Open the same one repeatedly
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_1500, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    // open session repeat
    int reSid;
    ResetWaitFlag4Data();
    reSid = OpenSession(SESSION_NAME_DATA, SESSION_NAME_DATA, GetNetworkId(), DEF_GROUP_ID, GetSessionAttr4Data());
    EXPECT_EQ(sessionId, reSid) << "repeat open sid not match";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_1600
 * @tc.name   : OpenSession input my name null
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_1600, TestSize.Level3)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSessionServer fail";

    int sessionId;
    sessionId = OpenSession(NULL, SESSION_NAME_DATA, GetNetworkId(), DEF_GROUP_ID, GetSessionAttr4Data());
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call opensession success[my name null]";

    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSessionServer fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_1700
 * @tc.name   : OpenSession input peer name null
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_1700, TestSize.Level3)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSessionServer fail";

    int sessionId;
    sessionId = OpenSession(SESSION_NAME_DATA, NULL, GetNetworkId(), DEF_GROUP_ID, GetSessionAttr4Data());
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call opensession success[peer name null]";

    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSessionServer fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_1800
 * @tc.name   : OpenSession input net id null
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_1800, TestSize.Level3)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSessionServer fail";

    int sessionId;
    sessionId = OpenSession(SESSION_NAME_DATA, SESSION_NAME_DATA, NULL, DEF_GROUP_ID, GetSessionAttr4Data());
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call opensession success[net id null]";

    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSessionServer fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_1900
 * @tc.name   : OpenSession input net id invalid
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_1900, TestSize.Level3)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSessionServer fail";

    int sessionId;
    string invalidNetId = "123456789012345678901234567890123456789012345678901234567890abcd";
    sessionId =
        OpenSession(SESSION_NAME_DATA, SESSION_NAME_DATA, invalidNetId.c_str(), DEF_GROUP_ID, GetSessionAttr4Data());
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call opensession success[net id invalid]";

    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSessionServer fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_2000
 * @tc.name   : OpenSession input group id null
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_2000, TestSize.Level3)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSessionServer fail";

    int sessionId;
    sessionId = OpenSession(SESSION_NAME_DATA, SESSION_NAME_DATA, GetNetworkId(), NULL, GetSessionAttr4Data());
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call opensession success[group id null]";

    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSessionServer fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_2100
 * @tc.name   : OpenSession input arrt null
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_2100, TestSize.Level3)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSessionServer fail";

    int sessionId;
    sessionId = OpenSession(SESSION_NAME_DATA, SESSION_NAME_DATA, GetNetworkId(), DEF_GROUP_ID, NULL);
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call opensession success[arrt null]";

    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSessionServer fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_2200
 * @tc.name   : OpenSession input arrt invalid
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_2200, TestSize.Level3)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSessionServer fail";

    int sessionId;
    SessionAttribute sAttr;
    sAttr.dataType = 50;
    sessionId = OpenSession(SESSION_NAME_DATA, SESSION_NAME_DATA, GetNetworkId(), DEF_GROUP_ID, &sAttr);
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call opensession success[arrt invalid]";

    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSessionServer fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_2300
 * @tc.name   : CloseSession repeatedly
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_2300, TestSize.Level3)
{
    int ret;
    int sessionId;
    char* softbusPidStart;
    char* softbusPidEnd;
    softbusPidStart = GetSoftbusPid();
    EXPECT_TRUE(softbusPidStart != NULL);

    ret = CreateSsAndOpenSession4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    ResetWaitFlag4Data();
    CloseSession(sessionId);
    ret = Wait4Session(3, SESSION_4DATA);
    EXPECT_NE(SOFTBUS_OK, ret) << "CloseSession(first) hit callback, expect not";

    // repeat,expect fail
    ResetWaitFlag4Data();
    CloseSession(sessionId);
    ret = Wait4Session(3, SESSION_4DATA);
    EXPECT_NE(SOFTBUS_OK, ret) << "CloseSession(repeat) hit callback, expect not";

    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSessionServer fail";

    softbusPidEnd = GetSoftbusPid();
    EXPECT_TRUE(softbusPidEnd != NULL);
    EXPECT_STREQ(softbusPidStart, softbusPidEnd);
    free(softbusPidStart);
    free(softbusPidEnd);
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_2400
 * @tc.name   : CloseSession not exist sessionId
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_2400, TestSize.Level3)
{
    int ret;
    int timeout = 3;
    int sessionId = MAX_SESSION_NUM + 1;
    ResetWaitFlag4Data();
    CloseSession(sessionId);
    ret = Wait4Session(timeout, SESSION_4DATA);
    EXPECT_NE(SOFTBUS_OK, ret) << "CloseSession[sid > max] success";

    sessionId = -1;
    ResetWaitFlag4Data();
    CloseSession(sessionId);
    ret = Wait4Session(timeout, SESSION_4DATA);
    EXPECT_NE(SOFTBUS_OK, ret) << "CloseSession[sid < 0] success";

    sessionId = 10;
    ResetWaitFlag4Data();
    CloseSession(sessionId);
    ret = Wait4Session(timeout, SESSION_4DATA);
    EXPECT_NE(SOFTBUS_OK, ret) << "CloseSession[sid not open] success";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_2500
 * @tc.name   : GetMySessionName input invalid sid -1
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_2500, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char mySname[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetMySessionName(-1, mySname, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetMySessionName invalid sid[-1]";
    
    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_2600
 * @tc.name   : GetMySessionName input invalid sid max+1
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_2600, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char mySname[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetMySessionName(MAX_SESSION_NUM + 1, mySname, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(SOFTBUS_TRANS_SESSION_INFO_NOT_FOUND, ret) << "GetMySessionName invalid sid[max+1]";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_2700
 * @tc.name   : GetMySessionName input invalid sid not open
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_2700, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char mySname[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetMySessionName(sessionId + 1, mySname, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(SOFTBUS_TRANS_SESSION_INFO_NOT_FOUND, ret) << "GetMySessionName invalid sid[not open]";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_2800
 * @tc.name   : GetMySessionName input MySessionName invalid sname null
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_2800, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    ret = GetMySessionName(sessionId, NULL, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetMySessionName invalid sname[null]";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_2900
 * @tc.name   : GetMySessionName input MySessionName invalid len[max+1]
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_2900, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char mySname[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetMySessionName(sessionId, mySname, SESSION_NAME_SIZE_MAX + 1);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetMySessionName invalid len[max+1]";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_3000
 * @tc.name   : GetMySessionName input MySessionName len short than real
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_3000, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();
    char mySnameShort[5];
    ret = GetMySessionName(sessionId, mySnameShort, 5);
    EXPECT_NE(SOFTBUS_OK, ret) << "GetMySessionName len short than real";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_3100
 * @tc.name   : GetPeersessionName input invalid sid -1
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_3100, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char peerSname[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetPeerSessionName(-1, peerSname, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetPeerSessionName invalid sid[-1]";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_3200
 * @tc.name   : GetPeersessionName input invalid sid max+1
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_3200, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char peerSname[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetPeerSessionName(MAX_SESSION_NUM + 1, peerSname, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(SOFTBUS_TRANS_SESSION_INFO_NOT_FOUND, ret) << "GetPeerSessionName invalid sid[max+1]";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_3300
 * @tc.name   : GetPeersessionName input invalid sid not open
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_3300, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char peerSname[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetPeerSessionName(sessionId + 1, peerSname, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(SOFTBUS_TRANS_SESSION_INFO_NOT_FOUND, ret) << "GetPeerSessionName invalid sid[not open]";
   
    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_3400
 * @tc.name   : GetPeersessionName input SessionName invalid sname[null]
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_3400, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    ret = GetPeerSessionName(sessionId, NULL, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetPeerSessionName invalid sname[null]";
   
    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_3500
 * @tc.name   : GetPeersessionName input PeerSessionName invalid len[max+1]
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_3500, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char peerSname[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetPeerSessionName(sessionId, peerSname, SESSION_NAME_SIZE_MAX + 1);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetPeerSessionName invalid len[max+1]";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_3600
 * @tc.name   : GetPeersessionName input PeerSessionName len short than real
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_3600, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char peerSnameShort[5];
    ret = GetPeerSessionName(sessionId, peerSnameShort, 5);
    EXPECT_NE(SOFTBUS_OK, ret) << "GetPeerSessionName len short than real";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_3700
 * @tc.name   : GetPeerDeviceId input DeviceId invalid sid -1
 * @tc.desc   : 【G-DISTRIBUTED-0205】禁止修改Openharmony分布式软总线设备间传输通道管理协议。
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_3700, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char deviceId[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetPeerDeviceId(-1, deviceId, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetPeerDeviceId invalid sid[-1]";
   
    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_3800
 * @tc.name   : GetPeerDeviceId input DeviceId invalid sid[max+1]
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_3800, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char deviceId[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetPeerDeviceId(MAX_SESSION_NUM + 1, deviceId, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(SOFTBUS_TRANS_SESSION_INFO_NOT_FOUND, ret) << "GetPeerDeviceId invalid sid[max+1]";
    
    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_3900
 * @tc.name   : GetPeerDeviceId input DeviceId invalid sid not open
 * @tc.desc   : 【G-DISTRIBUTED-0205】禁止修改Openharmony分布式软总线设备间传输通道管理协议。
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_3900, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";

    char deviceId[SESSION_NAME_SIZE_MAX] = { 0 };
    sessionId = GetCurrentSessionId4Data();
    ret = GetPeerDeviceId(sessionId + 1, deviceId, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(SOFTBUS_TRANS_SESSION_INFO_NOT_FOUND, ret) << "GetPeerDeviceId invalid sid[not open]";
    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_4000
 * @tc.name   : GetPeerDeviceId input DeviceId invalid sname[null]
 * @tc.desc   : 【G-DISTRIBUTED-0205】禁止修改Openharmony分布式软总线设备间传输通道管理协议。
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_4000, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    ret = GetPeerDeviceId(sessionId, NULL, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetPeerDeviceId invalid sname[null]";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}
/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_4100
 * @tc.name   : GetPeerDeviceId input DeviceId invalid len[max+1]
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_4100, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char deviceId[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetPeerDeviceId(sessionId, deviceId, SESSION_NAME_SIZE_MAX + 1);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetPeerDeviceId invalid len[max+1]";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}
/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_4200
 * @tc.name   : GetPeerDeviceId input DeviceId len short than real
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_4200, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char deviceIdShort[5];
    ret = GetPeerDeviceId(sessionId, deviceIdShort, 5);
    EXPECT_NE(SOFTBUS_OK, ret) << "GetPeerDeviceId len short than real";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_4300
 * @tc.name   : OpenSession, no Session Server exists on the peer
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_4300, TestSize.Level3)
{
    int ret;
    char* softbusPidStart;
    char* softbusPidEnd;
    softbusPidStart = GetSoftbusPid();
    EXPECT_TRUE(softbusPidStart != NULL);

    int sessionId;
    string notExistSession = "Not Exist Session Name";
    ret = CreateSessionServer(DEF_PKG_NAME, notExistSession.c_str(), GetSessionListenser4Ctl());
    EXPECT_EQ(SOFTBUS_PERMISSION_DENIED, ret) << "CreateSS-ctrl fail";
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS-data fail";

    ResetWaitFlag4Data();
    sessionId =
        OpenSession(SESSION_NAME_DATA, notExistSession.c_str(), GetNetworkId(), DEF_GROUP_ID, GetSessionAttr4Data());
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call open session fail, expect success";
    ret = Wait4Session(OPEN_SESSION_TIMEOUT, SESSION_4DATA);
    EXPECT_NE(SOFTBUS_OK, ret) << "wait session cb success, expect fail";

    int timeout = 5;
    ResetWaitFlag4Data();
    sessionId = OpenSession(SESSION_NAME_DATA, SESSION_NAME_DATA, GetNetworkId(), DEF_GROUP_ID, GetSessionAttr4Data());
    SetCurrentSessionId4Data(sessionId);
    EXPECT_TRUE(sessionId >= SESSION_ID_MIN) << "OpenSession normal[data] fail, expect success";
    ret = Wait4Session(timeout, SESSION_4DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "wait session cb fail, expect success";

    // clean
    CloseSession(sessionId);
    ret = RemoveSessionServer(DEF_PKG_NAME, notExistSession.c_str());
    EXPECT_EQ(SOFTBUS_PERMISSION_DENIED, ret) << "RemoveSS-notExist fail";
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS-data fail";
    sleep(timeout);

    softbusPidEnd = GetSoftbusPid();
    EXPECT_TRUE(softbusPidEnd != NULL);
    EXPECT_STREQ(softbusPidStart, softbusPidEnd);
    free(softbusPidStart);
    free(softbusPidEnd);
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_4400
 * @tc.name   : CreateSessionServer, input sessionName Max success
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_4400, TestSize.Level3)
{
    int ret = CreateSessionServer(DEF_PKG_NAME, SESSIONNAME_MAX, GetSessionListenser4Ctl());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS-ctrl fail";
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSIONNAME_MAX);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS-ctrl fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_4500
 * @tc.name   : CreateSessionServer, input sessionName contains special char
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_4500, TestSize.Level3)
{
    string sessionName = "com.communication.demo.max.len.#@$%!";
    int ret = CreateSessionServer(DEF_PKG_NAME, sessionName.c_str(), GetSessionListenser4Ctl());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS-ctrl fail";
    ret = RemoveSessionServer(DEF_PKG_NAME, sessionName.c_str());
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS-ctrl fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_4600
 * @tc.name   : CreateSessionServer, input pkgName Max success
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_4600, TestSize.Level3)
{
    int ret = CreateSessionServer(PKGNAME_MAX, SESSION_NAME_CTL, GetSessionListenser4Ctl());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS-ctrl fail";
    ret = RemoveSessionServer(PKGNAME_MAX, SESSION_NAME_CTL);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS-ctrl fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_4700
 * @tc.name   : CreateSessionServer, input pkgNameMax and sessionNameMax
 * @tc.desc   : 【G-DISTRIBUTED-0205】禁止修改Openharmony分布式软总线设备间传输通道管理协议。
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_4700, TestSize.Level3)
{
    int ret = CreateSessionServer(PKGNAME_MAX, SESSIONNAME_MAX, GetSessionListenser4Ctl());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS-ctrl fail, pkgnamelen:"
        << strlen(PKGNAME_MAX) << ",sessionLen:" << strlen(SESSIONNAME_MAX);
    ret = RemoveSessionServer(PKGNAME_MAX, SESSIONNAME_MAX);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS-ctrl fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_4800
 * @tc.name   : CreateSessionServer, input pkgName Max+1 failed
 * @tc.desc   : 【G-DISTRIBUTED-0205】禁止修改Openharmony分布式软总线设备间传输通道管理协议。
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_4800, TestSize.Level3)
{
    int ret = CreateSessionServer(PKGNAME_MAX_OUT, SESSION_NAME_CTL, GetSessionListenser4Ctl());
    EXPECT_EQ(SOFTBUS_INVALID_PARAM, ret) << "CreateSS-ctrl success";
    ret = RemoveSessionServer(PKGNAME_MAX_OUT, SESSION_NAME_CTL);
    EXPECT_EQ(SOFTBUS_INVALID_PARAM, ret) << "RemoveSS-ctrl fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_4900
 * @tc.name   : CreateSessionServer, input sessionName Max+1 failed
 * @tc.desc   : 【G-DISTRIBUTED-0205】禁止修改Openharmony分布式软总线设备间传输通道管理协议。
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_4900, TestSize.Level3)
{
    int ret = CreateSessionServer(DEF_PKG_NAME, SESSIONNAME_MAX_OUT, GetSessionListenser4Ctl());
    EXPECT_EQ(SOFTBUS_INVALID_PARAM, ret) << "CreateSS-ctrl success";
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSIONNAME_MAX_OUT);
    EXPECT_EQ(SOFTBUS_INVALID_PARAM, ret) << "RemoveSS-ctrl success";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_5000
 * @tc.name   : CreateSessionServer, input pkgName contains special char
 * @tc.desc   : 【G-DISTRIBUTED-0205】禁止修改Openharmony分布式软总线设备间传输通道管理协议。
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_5000, TestSize.Level3)
{
    int ret = CreateSessionServer(DEF_PKG_NAME, SESSIONNAME_MAX, GetSessionListenser4Ctl());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS-ctrl fail";
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSIONNAME_MAX);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS-ctrl fail";
    ret = CreateSessionServer(PKGNAME_MAX, SESSIONNAME_MAX, GetSessionListenser4Ctl());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS-ctrl fail";
    ret = RemoveSessionServer(PKGNAME_MAX, SESSIONNAME_MAX);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS-ctrl fail";
    string pkgName = "com.communication.demo.max.len.#@$%!";
    ret = CreateSessionServer(pkgName.c_str(), SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(SOFTBUS_INVALID_PKGNAME, ret) << "CreateSS-ctrl success";
    ret = RemoveSessionServer(pkgName.c_str(), SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS-ctrl success";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_5100
 * @tc.name   : CreateSessionServer, input invalid sessionName  failed
 * @tc.desc   : 【G-DISTRIBUTED-0211】出于安全和兼容性考虑，不应修改安全相关逻辑，不应变更软总线依赖的安全和协议部件。
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_OpenSession_Reli_5100, TestSize.Level3)
{
    string sessionName = "com.communication.test.demo";
    int ret = CreateSessionServer(DEF_PKG_NAME, sessionName.c_str(), GetSessionListenser4Ctl());
    EXPECT_EQ(SOFTBUS_PERMISSION_DENIED, ret) << "CreateSS-ctrl success";
    ret = RemoveSessionServer(DEF_PKG_NAME, sessionName.c_str());
    EXPECT_EQ(SOFTBUS_PERMISSION_DENIED, ret) << "RemoveSS-ctrl fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Reli_5200
 * @tc.name   : GetNodeKeyInfoTestCase
 * @tc.desc   : GetNodeKeyInfo Performance Testing
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */

HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Comp_GetNodeKey_Reli_5200, TestSize.Level3)
{
        int ret;
        NodeBasicInfo info;
        char udid[UDID_BUF_LEN] = {0};
        (void)memset_s(&info, sizeof(NodeBasicInfo), 0, sizeof(NodeBasicInfo));
        GetLocalNodeDeviceInfo(DEF_PKG_NAME, &info);
        ret = GetNodeKeyInfo(DEF_PKG_NAME, info.networkId, NODE_KEY_UDID,
            (uint8_t *)udid, UDID_BUF_LEN);
        EXPECT_EQ(0, ret) <<  "GetNodeKeyInfoTestCase failed.";
}