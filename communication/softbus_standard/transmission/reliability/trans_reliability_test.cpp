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

#include "SoftBus_Test_Permission.h"
#include "net_trans_common.h"
#include "wifi_utils.h"

using namespace testing::ext;

static const int EXPECT_INVALID_PARAM = -998;

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
    TestSetUp();
    SoftBus_Test_Permission::AddPermission(DEF_PKG_NAME);

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
    SoftBus_Test_Permission::RemovePermission(DEF_PKG_NAME);
}

/**
 * @tc.number : SUB_Softbus_Trans_Reli_0100
 * @tc.name   : SessionId doesn’t exist，Failed to send byte
 * @tc.desc   : Test Transceiver data reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Reli_0100, TestSize.Level3)
{
    int ret;
    int sessionId = 0;
    string data = "invalid session id";
    ret = SendBytes(sessionId, data.c_str(), data.length());
    EXPECT_NE(SOFTBUS_OK, ret);
}

/**
 * @tc.number : SUB_Softbus_Trans_Reli_0200
 * @tc.name   : SessionId closed，Failed to send byte
 * @tc.desc   : Test Transceiver data reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Reli_0200, TestSize.Level3)
{
    int ret;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";

    int sessionId = GetCurrentSessionId4Data();
    ret = CloseSessionAndRemoveSs4Data();
    ASSERT_EQ(SOFTBUS_OK, ret);

    string data = "session closed";
    ret = SendBytes(sessionId, data.c_str(), data.length());
    EXPECT_NE(SOFTBUS_OK, ret);
}

/**
 * @tc.number : SUB_Softbus_Trans_Reli_0300
 * @tc.name   : send data during OpenSession
 * @tc.desc   : Test Transceiver data reliability
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Reli_0300, TestSize.Level3)
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
 * @tc.number : SUB_Softbus_Trans_Reli_0400
 * @tc.name   : SessionId doesn’t exist，Failed to send Message
 * @tc.desc   : Test Transceiver data reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Reli_0400, TestSize.Level3)
{
    int ret;
    int sessionId = 0;
    string data = "invalid session id";
    ret = SendMessage(sessionId, data.c_str(), data.length());
    EXPECT_NE(SOFTBUS_OK, ret);
}

/**
 * @tc.number : SUB_Softbus_Trans_Session_Reli_0100
 * @tc.name   : CreateSessionServer repeatedly
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Session_Reli_0100, TestSize.Level3)
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
 * @tc.number : SUB_Softbus_Trans_Session_Reli_0200
 * @tc.name   : CreateSessionServer input wrong value
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Session_Reli_0200, TestSize.Level3)
{
    int ret;
    ret = CreateSessionServer(NULL, SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "CreateSS[pkg name null]";
    ret = CreateSessionServer(DEF_PKG_NAME, NULL, GetSessionListenser4Data());
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "CreateSS[session name null]";
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, NULL);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "CreateSS[session listener null]";
    ISessionListener* listener = (ISessionListener*)malloc(sizeof(ISessionListener));
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, listener);
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS fail[session listener only malloc]";
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS fail[session listener only malloc]";

    listener->OnBytesReceived = NULL;
    listener->OnMessageReceived = NULL;
    listener->OnSessionClosed = NULL;
    listener->OnSessionOpened = NULL;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, listener);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "CreateSS success[session listener member=null]";

    free(listener);
}

/**
 * @tc.number : SUB_Softbus_Trans_Session_Reli_0300
 * @tc.name   : RemoveSessionServer input wrong value
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Session_Reli_0300, TestSize.Level3)
{
    int ret;
    ret = RemoveSessionServer(NULL, SESSION_NAME_DATA);
    EXPECT_NE(SOFTBUS_OK, ret) << "RemoveSS success[pkg name null]";
    ret = RemoveSessionServer(DEF_PKG_NAME, NULL);
    EXPECT_NE(SOFTBUS_OK, ret) << "RemoveSS success[session name null]";
    ret = RemoveSessionServer(NULL, NULL);
    EXPECT_NE(SOFTBUS_OK, ret) << "RemoveSS success[all null]";
}

/**
 * @tc.number : SUB_Softbus_Trans_Session_Reli_0400
 * @tc.name   : RemoveSessionServer There are unclosed Session
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Session_Reli_0400, TestSize.Level3)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[data] fail";
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_CTL, GetSessionListenser4Ctl());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[ctrl] fail";

    int count = MAX_SESSION_NUM / 2;
    int sessionId4Data[count];
    int sessionId4Ctrl[count];
    char groupId[][GROUP_ID_LEN] = { "g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8" };
    ret = OpenSessionBatch4Data(groupId, sessionId4Data, count);
    EXPECT_EQ(SOFTBUS_OK, ret) << "OpenSessionWithDiffGroupId4Data fail";
    ret = OpenSessionBatch4Ctl(groupId, sessionId4Ctrl, count);
    EXPECT_EQ(SOFTBUS_OK, ret) << "OpenSessionWithDiffGroupId4Ctl fail";

    ResetClosedSessionCount4Ctrl();
    ResetClosedSessionCount4Data();
    // remove session server, will close opened session
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[data] fail";
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_CTL);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[ctrl] fail";

    // check close session callback
    int timeout = 20;
    while (timeout > 0) {
        sleep(1);
        if (GetClosedSessionCount4Ctrl() == count && GetClosedSessionCount4Data() == count) {
            LOG("callback count right, timeout:%d", timeout);
            break;
        }
        timeout--;
    }
    EXPECT_EQ(count, GetClosedSessionCount4Ctrl());
    EXPECT_EQ(count, GetClosedSessionCount4Data());

    // create new,expect success
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[data] fail";
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_CTL, GetSessionListenser4Ctl());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[ctrl] fail";
    ret = OpenSessionBatch4Data(groupId, sessionId4Data, count);
    EXPECT_EQ(SOFTBUS_OK, ret) << "OpenSessionWithDiffGroupId4Data fail";
    ret = OpenSessionBatch4Ctl(groupId, sessionId4Ctrl, count);
    EXPECT_EQ(SOFTBUS_OK, ret) << "OpenSessionWithDiffGroupId4Ctl fail";

    // close session,expect success
    ret = CloseSessionBatch4Data(sessionId4Data, count);
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionBatch4Data fail";
    ret = CloseSessionBatch4Ctl(sessionId4Ctrl, count);
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionBatch4Ctl fail";

    // remove session server
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[data] fail";
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_CTL);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[ctrl] fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Session_Reli_0500
 * @tc.name   : OpenSession SessionServer do not exist
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Session_Reli_0500, TestSize.Level3)
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
 * @tc.number : SUB_Softbus_Trans_Session_Reli_0600
 * @tc.name   : OpenSession Open the same one repeatedly
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Session_Reli_0600, TestSize.Level3)
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
 * @tc.number : SUB_Softbus_Trans_Session_Reli_0700
 * @tc.name   : OpenSession input wrong value
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Session_Reli_0700, TestSize.Level3)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSessionServer fail";

    int sessionId;
    sessionId = OpenSession(NULL, SESSION_NAME_DATA, GetNetworkId(), DEF_GROUP_ID, GetSessionAttr4Data());
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call opensession success[my name null]";

    sessionId = OpenSession(SESSION_NAME_DATA, NULL, GetNetworkId(), DEF_GROUP_ID, GetSessionAttr4Data());
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call opensession success[peer name null]";

    sessionId = OpenSession(SESSION_NAME_DATA, SESSION_NAME_DATA, NULL, DEF_GROUP_ID, GetSessionAttr4Data());
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call opensession success[net id null]";

    string invalidNetId = "123456789012345678901234567890123456789012345678901234567890abcd";
    sessionId =
        OpenSession(SESSION_NAME_DATA, SESSION_NAME_DATA, invalidNetId.c_str(), DEF_GROUP_ID, GetSessionAttr4Data());
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call opensession success[net id invalid]";

    sessionId = OpenSession(SESSION_NAME_DATA, SESSION_NAME_DATA, GetNetworkId(), NULL, GetSessionAttr4Data());
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call opensession success[group id null]";

    sessionId = OpenSession(SESSION_NAME_DATA, SESSION_NAME_DATA, GetNetworkId(), DEF_GROUP_ID, NULL);
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call opensession success[arrt null]";

    SessionAttribute sAttr;
    sAttr.dataType = 50;
    sessionId = OpenSession(SESSION_NAME_DATA, SESSION_NAME_DATA, GetNetworkId(), DEF_GROUP_ID, &sAttr);
    EXPECT_TRUE(sessionId < SESSION_ID_MIN) << "call opensession success[arrt invalid]";

    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSessionServer fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Session_Reli_0800
 * @tc.name   : CloseSession repeatedly
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Session_Reli_0800, TestSize.Level3)
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
 * @tc.number : SUB_Softbus_Trans_Session_Reli_0900
 * @tc.name   : CloseSession not exist sessionId
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Session_Reli_0900, TestSize.Level3)
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
 * @tc.number : SUB_Softbus_Trans_Session_Reli_1000
 * @tc.name   : GetMySessionName input wrong value
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Session_Reli_1000, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char mySname[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetMySessionName(-1, mySname, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetMySessionName invalid sid[-1]";
    ret = GetMySessionName(MAX_SESSION_NUM + 1, mySname, SESSION_NAME_SIZE_MAX);
    EXPECT_NE(SOFTBUS_OK, ret) << "GetMySessionName invalid sid[max+1]";
    ret = GetMySessionName(sessionId + 1, mySname, SESSION_NAME_SIZE_MAX);
    EXPECT_NE(SOFTBUS_OK, ret) << "GetMySessionName invalid sid[not open]";
    ret = GetMySessionName(sessionId, NULL, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetMySessionName invalid sname[null]";
    ret = GetMySessionName(sessionId, mySname, SESSION_NAME_SIZE_MAX + 1);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetMySessionName invalid len[max+1]";

    char mySnameShort[5];
    ret = GetMySessionName(sessionId, mySnameShort, 5);
    EXPECT_NE(SOFTBUS_OK, ret) << "GetMySessionName len short than real";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Session_Reli_1100
 * @tc.name   : GetPeersessionName input wrong value
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Session_Reli_1100, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char peerSname[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetPeerSessionName(-1, peerSname, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetPeerSessionName invalid sid[-1]";
    ret = GetPeerSessionName(MAX_SESSION_NUM + 1, peerSname, SESSION_NAME_SIZE_MAX);
    EXPECT_NE(SOFTBUS_OK, ret) << "GetPeerSessionName invalid sid[max+1]";
    ret = GetPeerSessionName(sessionId + 1, peerSname, SESSION_NAME_SIZE_MAX);
    EXPECT_NE(SOFTBUS_OK, ret) << "GetPeerSessionName invalid sid[not open]";
    ret = GetPeerSessionName(sessionId, NULL, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetPeerSessionName invalid sname[null]";
    ret = GetPeerSessionName(sessionId, peerSname, SESSION_NAME_SIZE_MAX + 1);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetPeerSessionName invalid len[max+1]";

    char peerSnameShort[5];
    ret = GetPeerSessionName(sessionId, peerSnameShort, 5);
    EXPECT_NE(SOFTBUS_OK, ret) << "GetPeerSessionName len short than real";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Session_Reli_1200
 * @tc.name   : GetPeerDeviceId input wrong value
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Session_Reli_1200, TestSize.Level3)
{
    int ret;
    int sessionId;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "CreateSsAndOpenSession4Data fail";
    sessionId = GetCurrentSessionId4Data();

    char deviceId[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetPeerDeviceId(-1, deviceId, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetPeerDeviceId invalid sid[-1]";
    ret = GetPeerDeviceId(MAX_SESSION_NUM + 1, deviceId, SESSION_NAME_SIZE_MAX);
    EXPECT_NE(SOFTBUS_OK, ret) << "GetPeerDeviceId invalid sid[max+1]";
    ret = GetPeerDeviceId(sessionId + 1, deviceId, SESSION_NAME_SIZE_MAX);
    EXPECT_NE(SOFTBUS_OK, ret) << "GetPeerDeviceId invalid sid[not open]";
    ret = GetPeerDeviceId(sessionId, NULL, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetPeerDeviceId invalid sname[null]";
    ret = GetPeerDeviceId(sessionId, deviceId, SESSION_NAME_SIZE_MAX + 1);
    EXPECT_EQ(EXPECT_INVALID_PARAM, ret) << "GetPeerDeviceId invalid len[max+1]";

    char deviceIdShort[5];
    ret = GetPeerDeviceId(sessionId, deviceIdShort, 5);
    EXPECT_NE(SOFTBUS_OK, ret) << "GetPeerDeviceId len short than real";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionAndRemoveSs4Data fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Session_Reli_1300
 * @tc.name   : OpenSession, no Session Server exists on the peer
 * @tc.desc   : Test session management reliability
 * @tc.type   : RELI
 * @tc.size   : MediumTest
 */
HWTEST_F(TransReliabilityTest, SUB_Softbus_Trans_Session_Reli_1300, TestSize.Level3)
{
    int ret;
    char* softbusPidStart;
    char* softbusPidEnd;
    softbusPidStart = GetSoftbusPid();
    EXPECT_TRUE(softbusPidStart != NULL);

    int sessionId;
    string notExistSession = "Not Exist Session Name";
    ret = CreateSessionServer(DEF_PKG_NAME, notExistSession.c_str(), GetSessionListenser4Ctl());
    EXPECT_NE(SOFTBUS_OK, ret) << "CreateSS-ctrl fail";
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
    EXPECT_NE(SOFTBUS_OK, ret) << "RemoveSS-notExist fail";
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS-data fail";
    sleep(timeout);

    softbusPidEnd = GetSoftbusPid();
    EXPECT_TRUE(softbusPidEnd != NULL);
    EXPECT_STREQ(softbusPidStart, softbusPidEnd);
    free(softbusPidStart);
    free(softbusPidEnd);
}
