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

static int g_waitFlag = WAIT_DEF_VALUE;
static int FileSessionOpened(int sessionId, int result)
{
    LOG("[cb][file]open session sid[%d],rst[%d]", sessionId, result);
    if (result == SOFTBUS_OK) {
        g_waitFlag = WAIT_SUCCESS_VALUE;
    } else {
        g_waitFlag = WAIT_FAIL_VALUE;
    }
    return SOFTBUS_OK;
}

static void FileSessionClosed(int sessionId)
{
    LOG("[cb][file]close session sid[%d]", sessionId);
}

static void FileBytesReceived(int sessionId, const void* data, unsigned int dataLen)
{
    LOG("[cb][file]ByteRec sid:%d, data len:%d", sessionId, dataLen);
    if (data == NULL) {
        LOG("[cb][file]ByteRec invalid data=null sid[%d]", sessionId);
        g_waitFlag = WAIT_FAIL_VALUE;
    } else {
        g_waitFlag = WAIT_SUCCESS_VALUE;
    }
}

static void FileMessageReceived(int sessionId, const void* data, unsigned int dataLen)
{
    LOG("[cb][file]MessageRec sid:%d, data len:%d", sessionId, dataLen);
    if (data == NULL) {
        LOG("[cb][file]MessageRec invalid data=null sid[%d]", sessionId);
        g_waitFlag = WAIT_FAIL_VALUE;
    } else {
        g_waitFlag = WAIT_SUCCESS_VALUE;
    }
}

static SessionAttribute g_fileSessionAttr = {
    .dataType = TYPE_FILE,
};

static ISessionListener g_fileSessionListener = {
    .OnSessionOpened = FileSessionOpened,
    .OnSessionClosed = FileSessionClosed,
    .OnBytesReceived = FileBytesReceived,
    .OnMessageReceived = FileMessageReceived,
};

using namespace testing::ext;

class TransSessionFuncTest : public testing::Test {
public:
    // 测试套前置和后置操作
    static void SetUpTestCase();
    static void TearDownTestCase();

    // 测试用例前置和后置操作
    void SetUp();
    void TearDown();
};

void TransSessionFuncTest::SetUp() {}

void TransSessionFuncTest::TearDown() {}

void TransSessionFuncTest::SetUpTestCase()
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

    system(" truncate -s 8M /data/8M.tar");

    LOG("SetUp end");
}

void TransSessionFuncTest::TearDownTestCase()
{
    int ret = UnRegisterDeviceStateDefCallback();
    EXPECT_EQ(SOFTBUS_OK, ret) << "call unReg node state callback fail";

    TestTearDown();
}

/**
 * @tc.number  : SUB_Softbus_Trans_Comp_OpenSession_Func_0100
 * @tc.name    : one Client creates SessionServer + 1, Max succeeds, 1 fails
 * @tc.desc    : Test session management
 * @tc.type    : FUNC
 * @tc.size    : MediumTest
 */
HWTEST_F(TransSessionFuncTest, SUB_Softbus_Trans_Comp_OpenSession_Func_0100, TestSize.Level3)
{
    int ret;
    char sessionNames[][SESSION_NAME_SIZE_MAX] = { "com.communication.demo1.1", "com.communication.demo1.2",
        "com.communication.demo1.3", "com.communication.demo1.4", "com.communication.demo1.5",
        "com.communication.demo1.6", "com.communication.demo1.7", "com.communication.demo1.8" };
    for (int i = 0; i < MAX_SESSION_SERVER_NUM_CLIENT; i++) {
        ret = CreateSessionServer(DEF_PKG_NAME, sessionNames[i], GetSessionListenser4Data());
        EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS fail,i=" << i;
    }
    string sessionName = "max+1";
    ret = CreateSessionServer(DEF_PKG_NAME, sessionName.c_str(), GetSessionListenser4Data());
    printf("CreateSS max+1, ret:%d \n", ret);
    EXPECT_NE(SOFTBUS_OK, ret) << "CreateSS max+1 success, expect fail";

    for (int i = 0; i < MAX_SESSION_SERVER_NUM_CLIENT; i++) {
        ret = RemoveSessionServer(DEF_PKG_NAME, sessionNames[i]);
        EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS fail,i=" << i;
    }
    ret = RemoveSessionServer(DEF_PKG_NAME, sessionName.c_str());
    printf("RemoveSS max+1, ret:%d \n", ret);
    EXPECT_NE(SOFTBUS_OK, ret) << "RemoveSS max+1 success, expect fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Func_0200
 * @tc.name   : OpenSession + 1, Max succeeds, 1 fails
 * @tc.desc   : Test session management
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransSessionFuncTest, SUB_Softbus_Trans_Comp_OpenSession_Func_0200, TestSize.Level3)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, GetSessionListenser4Data());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[data] fail";
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_CTL, GetSessionListenser4Ctl());
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[ctrl] fail";

    int count = MAX_SESSION_NUM / 2;
    int sessionId4Data[count];
    int sessionId4Ctrl[count];
    char groupId[][4] = { "g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8" };
    ret = OpenSessionBatch4Data(groupId, sessionId4Data, count);
    EXPECT_EQ(SOFTBUS_OK, ret) << "OpenSessionWithDiffGroupId4Data fail";
    ret = OpenSessionBatch4Ctl(groupId, sessionId4Ctrl, count);
    EXPECT_EQ(SOFTBUS_OK, ret) << "OpenSessionWithDiffGroupId4Ctl fail";

    // open max+1, expect fail
    int sessionId;
    sessionId = OpenSession(SESSION_NAME_DATA, SESSION_NAME_DATA, GetNetworkId(), DEF_GROUP_ID, GetSessionAttr4Data());
    EXPECT_FALSE(sessionId >= SESSION_ID_MIN) << "call OpenSession[data] success,sid=" << sessionId;

    // close session
    ret = CloseSessionBatch4Data(sessionId4Data, count);
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionBatch4Data fail";
    ret = CloseSessionBatch4Ctl(sessionId4Ctrl, count);
    EXPECT_EQ(SOFTBUS_OK, ret) << "CloseSessionBatch4Ctl fail";

    // remove  session server
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[data] fail";
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_CTL);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[ctrl] fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Func_0300
 * @tc.name   : Obtain DevicedName based on Sessionid
 * @tc.desc   : Test session management
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransSessionFuncTest, SUB_Softbus_Trans_Comp_OpenSession_Func_0300, TestSize.Level3)
{
    int ret;
    ret = CreateSsAndOpenSession4Data();
    ASSERT_EQ(SOFTBUS_OK, ret) << "create Ss and openS[data] fail";

    int sessionId = GetCurrentSessionId4Data();
    char mySessionName[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetMySessionName(sessionId, mySessionName, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call GetMySessionName fail, sid:" << sessionId;
    EXPECT_STREQ(SESSION_NAME_DATA, mySessionName) << "my session name cmp fail";

    char peerSessionName[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetPeerSessionName(sessionId, peerSessionName, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call GetPeerSessionName fail";
    EXPECT_STREQ(SESSION_NAME_DATA, peerSessionName) << "peer session name cmp fail";

    ret = CloseSessionAndRemoveSs4Data();
    EXPECT_EQ(SOFTBUS_OK, ret) << "close session and remove Ss fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Func_0400
 * @tc.name   : Obtain DevicedId based on Sessionid
 * @tc.desc   : Test session management
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransSessionFuncTest, SUB_Softbus_Trans_Comp_OpenSession_Func_0400, TestSize.Level3)
{
    int ret;
    ret = CreateSsAndOpenSession4Ctl();
    ASSERT_EQ(SOFTBUS_OK, ret) << "create Ss and openS[ctl] fail";

    char deviceId[SESSION_NAME_SIZE_MAX] = { 0 };
    ret = GetPeerDeviceId(GetCurrentSessionId4Ctl(), deviceId, SESSION_NAME_SIZE_MAX);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call GetPeerDeviceId fail";
    EXPECT_STREQ(GetNetworkId(), deviceId) << "peer device id cmp fail";

    ret = CloseSessionAndRemoveSs4Ctl();
    EXPECT_EQ(SOFTBUS_OK, ret) << "close session and remove Ss fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Func_0500
 * @tc.name   : OpenSession Type is TYPE_BYTES sendfile fail
 * @tc.desc   : 【G-DISTRIBUTED-0205】禁止修改Openharmony分布式软总线设备间传输通道管理协议。
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransSessionFuncTest, SUB_Softbus_Trans_Comp_OpenSession_Func_0500, TestSize.Level3)
{
    int ret;
    int sessionId;
    int timeout = 10;

    static const char* g_file[] = {
        "/data/8M.tar",
    };

    static const char *recv_file[] = {
        "/data/datatype_8M.tar",
    };

    ret = SetFileSendListener(DEF_PKG_NAME, SESSION_NAME_FILE, GetSendFileListener());
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SetFileSendListener fail";
    ret = SetFileReceiveListener(DEF_PKG_NAME, SESSION_NAME_FILE, GetRecvFileListener(), RECV_FILE_PATH);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SetFileSendListener fail";

    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE, &g_fileSessionListener);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call CreateSS[file] fail";

    sessionId = OpenSession(SESSION_NAME_FILE, SESSION_NAME_FILE, GetNetworkId(), DEF_GROUP_ID, GetSessionAttr4Data());
    if (sessionId < SESSION_ID_MIN)
    {
        LOG("call opensession[file] fail, ret sid:%d, netid:%s", sessionId, GetNetworkId());
    }
    ret = Wait4Session(timeout, SESSION_4DATA);
    if (ret != SOFTBUS_OK)
    {
        LOG("call opensession[file] fail");
    }
    
    ret = SendFile(sessionId, g_file, recv_file, 1);
    EXPECT_NE(SOFTBUS_OK, ret) << "sendfile succees";

    CloseSession(sessionId);
    
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE);
    EXPECT_EQ(SOFTBUS_OK, ret) << "remove Ss fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Func_0600
 * @tc.name   : OpenSession Type is TYPE_MESSAGE sendfile fail
 * @tc.desc   : Test session management
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransSessionFuncTest, SUB_Softbus_Trans_Comp_OpenSession_Func_0600, TestSize.Level3)
{
    int ret;
    int sessionId;
    int timeout = 10;

    static const char* g_file[] = {
        "/data/8M.tar",
    };

    static const char *recv_file[] = {
        "/data/messagetype_8M.tar",
    };

    ret = SetFileSendListener(DEF_PKG_NAME, SESSION_NAME_PROXY, GetSendFileListener());
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SetFileSendListener fail";
    ret = SetFileReceiveListener(DEF_PKG_NAME, SESSION_NAME_PROXY, GetRecvFileListener(), RECV_FILE_PATH);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SetFileSendListener fail";

    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_PROXY, GetSessionListenser4Proxy());
    EXPECT_EQ(SOFTBUS_OK, ret) << "call CreateSS[file] fail";

    sessionId = OpenSession(SESSION_NAME_PROXY, SESSION_NAME_PROXY, GetNetworkId(), DEF_GROUP_ID, GetSessionAttr4Proxy());
    if (sessionId < SESSION_ID_MIN)
    {
        LOG("call opensession[message] fail, ret sid:%d, netid:%s", sessionId, GetNetworkId());
    }
    ret = Wait4Session(timeout, SESSION_4PROXY);
    if (ret != SOFTBUS_OK)
    {
        LOG("call opensession[message] fail");
    }
    
    ret = SendFile(sessionId, g_file, recv_file, 1);
    EXPECT_NE(SOFTBUS_OK, ret) << "sendfile succees";

    CloseSession(sessionId);
    
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_PROXY);
    EXPECT_EQ(SOFTBUS_OK, ret) << "remove Ss fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Func_0700
 * @tc.name   : OpenSession Type is TYPE_STREAM sendfile fail
 * @tc.desc   : Test session management
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransSessionFuncTest, SUB_Softbus_Trans_Comp_OpenSession_Func_0700, TestSize.Level3)
{
    int ret;
    int sessionId;
    int timeout = 10;

    static const char* g_file[] = {
        "/data/8M.tar",
    };

    static const char *recv_file[] = {
        "/data/streamtype_8M.tar",
    };

    ret = SetFileSendListener(DEF_PKG_NAME, SESSION_NAME_STREAM, GetSendFileListener());
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SetFileSendListener fail";
    ret = SetFileReceiveListener(DEF_PKG_NAME, SESSION_NAME_STREAM, GetRecvFileListener(), RECV_FILE_PATH);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SetFileSendListener fail";

    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_STREAM, GetSessionListenser4Stream());
    EXPECT_EQ(SOFTBUS_OK, ret) << "call CreateSS[file] fail";

    SessionAttribute attr;
    (void)memset_s(&attr, sizeof(attr), 0, sizeof(attr));
    attr.dataType = TYPE_STREAM;
    sessionId = OpenSession(SESSION_NAME_STREAM, SESSION_NAME_STREAM, GetNetworkId(), DEF_GROUP_ID, &attr);
    if (sessionId < SESSION_ID_MIN)
    {
        LOG("call opensession[stream] fail, ret sid:%d, netid:%s", sessionId, GetNetworkId());
    }
    ret = Wait4Session(timeout, SESSION_4STREAM);
    if (ret != SOFTBUS_OK)
    {
        LOG("call opensession[stream] fail");
    }
    
    ret = SendFile(sessionId, g_file, recv_file, 1);
    EXPECT_NE(SOFTBUS_OK, ret) << "sendfile succees";

    CloseSession(sessionId);
    
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_STREAM);
    EXPECT_EQ(SOFTBUS_OK, ret) << "remove Ss fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Func_0800
 * @tc.name   : OpenSession Type is TYPE_BYTES sendstream fail
 * @tc.desc   : Test session management
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransSessionFuncTest, SUB_Softbus_Trans_Comp_OpenSession_Func_0800, TestSize.Level3)
{
    int ret;
    int sessionId;
    int timeout = 10;

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

    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_STREAM, &g_fileSessionListener);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call CreateSS[file] fail";

    sessionId = OpenSession(SESSION_NAME_STREAM, SESSION_NAME_STREAM, GetNetworkId(), DEF_GROUP_ID, GetSessionAttr4Data());
    if (sessionId < SESSION_ID_MIN)
    {
        LOG("call opensession[file] fail, ret sid:%d, netid:%s", sessionId, GetNetworkId());
    }
    ret = Wait4Session(timeout, SESSION_4DATA);
    if (ret != SOFTBUS_OK)
    {
        LOG("call opensession[file] fail");
    }
    
    ret = SendStream(sessionId, &streamData, &extStreamData, &frame);
    EXPECT_NE(SOFTBUS_OK, ret) << "sendstream succees";

    CloseSession(sessionId);
    
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE);
    EXPECT_EQ(SOFTBUS_OK, ret) << "remove Ss fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Func_0900
 * @tc.name   : OpenSession Type is TYPE_MESSAGE sendstream fail
 * @tc.desc   : Test session management
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransSessionFuncTest, SUB_Softbus_Trans_Comp_OpenSession_Func_0900, TestSize.Level3)
{
    int ret;
    int sessionId;
    int timeout = 10;

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

    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_PROXY, GetSessionListenser4Proxy());
    EXPECT_EQ(SOFTBUS_OK, ret) << "call CreateSS[file] fail";

    sessionId = OpenSession(SESSION_NAME_PROXY, SESSION_NAME_PROXY, GetNetworkId(), DEF_GROUP_ID, GetSessionAttr4Proxy());
    if (sessionId < SESSION_ID_MIN)
    {
        LOG("call opensession[message] fail, ret sid:%d, netid:%s", sessionId, GetNetworkId());
    }
    ret = Wait4Session(timeout, SESSION_4PROXY);
    if (ret != SOFTBUS_OK)
    {
        LOG("call opensession[message] fail");
    }
    
    ret = SendStream(sessionId, &streamData, &extStreamData, &frame);
    EXPECT_NE(SOFTBUS_OK, ret) << "sendstream succees";

    CloseSession(sessionId);
    
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_PROXY);
    EXPECT_EQ(SOFTBUS_OK, ret) << "remove Ss fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_OpenSession_Func_1000
 * @tc.name   : OpenSession Type is TYPE_FILE sendstream fail
 * @tc.desc   : Test session management
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransSessionFuncTest, SUB_Softbus_Trans_Comp_OpenSession_Func_1000, TestSize.Level3)
{
    int ret;
    int sessionId;
    int timeout = 10;

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

    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE, &g_fileSessionListener);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call CreateSS[file] fail";

    sessionId = OpenSession(SESSION_NAME_FILE, SESSION_NAME_FILE, GetNetworkId(), DEF_GROUP_ID, &g_fileSessionAttr);
    if (sessionId < SESSION_ID_MIN)
    {
        LOG("call opensession[stream] fail, ret sid:%d, netid:%s", sessionId, GetNetworkId());
    }
    ret = Wait4Session(timeout, SESSION_4STREAM);
    if (ret != SOFTBUS_OK)
    {
        LOG("call opensession[stream] fail");
    }
    
    ret = SendStream(sessionId, &streamData, &extStreamData, &frame);
    EXPECT_NE(SOFTBUS_OK, ret) << "sendstream succees";

    CloseSession(sessionId);
    
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_STREAM);
    EXPECT_EQ(SOFTBUS_OK, ret) << "remove Ss fail";
}