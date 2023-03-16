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

static SessionAttribute g_fileSessionAttrP2P = {
    .dataType = TYPE_FILE,
    .linkTypeNum = 1,
    .linkType[0] = LINK_TYPE_WIFI_P2P,
};

static ISessionListener g_fileSessionListener = {
    .OnSessionOpened = FileSessionOpened,
    .OnSessionClosed = FileSessionClosed,
    .OnBytesReceived = FileBytesReceived,
    .OnMessageReceived = FileMessageReceived,
};


using namespace testing::ext;

class TransFileFuncTest : public testing::Test {
public:
    // 测试套前置和后置操作
    static void SetUpTestCase();
    static void TearDownTestCase();

    // 测试用例前置和后置操作
    void SetUp();
    void TearDown();
};

void TransFileFuncTest::SetUp() {
    // set listener
    int ret = SetFileSendListener(DEF_PKG_NAME, SESSION_NAME_FILE, GetSendFileListener());
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SetFileSendListener fail";
    ret = SetFileReceiveListener(DEF_PKG_NAME, SESSION_NAME_FILE, GetRecvFileListener(), RECV_FILE_PATH);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SetFileSendListener fail";
}

void TransFileFuncTest::TearDown() {}

void TransFileFuncTest::SetUpTestCase()
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

    system(" truncate -s 0M /data/A.tar");
    system(" truncate -s 8M /data/8M.tar");
    system(" truncate -s 8M /data/8M_DNull.tar");
    system(" truncate -s 400M /data/big.tar");
    sleepn(5);
    system(" truncate -s 8M /data/richu.jpg");
    system(" truncate -s 3M /data/richu-002.jpg");
    system(" truncate -s 10M /data/richu-003.jpg");

    LOG("SetUp end");
}

void TransFileFuncTest::TearDownTestCase()
{
    int ret = UnRegisterDeviceStateDefCallback();
    EXPECT_EQ(SOFTBUS_OK, ret) << "call unReg node state callback fail";

    TestTearDown();
}

static int WaitFile(int timeout)
{
    LOG("start waitfile,timeout:%d", timeout);
    int count = 0;
    int t = timeout;
    while (t > 0) {
        sleep(1);
        if (g_waitFlag != WAIT_DEF_VALUE) {
            LOG("waitfile success[flag:%d][time:%d]", g_waitFlag, count);
            break;
        }
        t--;
        count++;
    }
    if (g_waitFlag != WAIT_SUCCESS_VALUE) {
        LOG("waitfile fail[exp:%d, real:%d][used time:%d]", WAIT_SUCCESS_VALUE, g_waitFlag, count);
        return SOFTBUS_ERR;
    }
    return SOFTBUS_OK;
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_SendFile_Fun_0100
 * @tc.name   : test SendFile 8M
 * @tc.desc   : [G-DISTRIBUTED-0208] 必须支持蓝牙 WiFi或以太网等软总线依赖的通信能力中的一种或者多种
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFileFuncTest, SUB_Softbus_Trans_Comp_SendFile_Fun_0100, TestSize.Level2)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE, &g_fileSessionListener);
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[file] fail";

    g_waitFlag = WAIT_DEF_VALUE;
    int sid = OpenSession(SESSION_NAME_FILE, SESSION_NAME_FILE, GetNetworkId(), DEF_GROUP_ID, &g_fileSessionAttr);
    EXPECT_TRUE(sid >= SESSION_ID_MIN) << "call OpenSession[file] fail, sid=" << sid;
    if (sid >= SESSION_ID_MIN) {
        ret = WaitFile(10);
        EXPECT_EQ(SOFTBUS_OK, ret) << "wait opensession fail[file]";
    }

    static const char* g_fileOne[] = {
        "/data/8M.tar",
    };

    static const char *dfileList[] = {
        "/data/8M.tar",
    };

    ResetWaitFlag();
    ret = SendFile(sid, g_fileOne, dfileList, 1);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SendFile fail";
    ret = Wait(10);
    EXPECT_EQ(SOFTBUS_OK, ret) << "wait send fail rst fail";

    CloseSession(sid);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[proxy] fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_SendFile_Fun_0200
 * @tc.name   : test SendFile 0M
 * @tc.desc   : Test send file function
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFileFuncTest, SUB_Softbus_Trans_Comp_SendFile_Fun_0200, TestSize.Level2)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE, &g_fileSessionListener);
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[file] fail";

    g_waitFlag = WAIT_DEF_VALUE;
    int sid = OpenSession(SESSION_NAME_FILE, SESSION_NAME_FILE, GetNetworkId(), DEF_GROUP_ID, &g_fileSessionAttr);
    EXPECT_TRUE(sid >= SESSION_ID_MIN) << "call OpenSession[file] fail, sid=" << sid;
    if (sid >= SESSION_ID_MIN) {
        ret = WaitFile(10);
        EXPECT_EQ(SOFTBUS_OK, ret) << "wait opensession fail[file]";
    }

    static const char* g_fileOne[] = {
        "/data/A.tar",
    };

    static const char *dfileList[] = {
        "/data/A_recv.tar",
    };

    ResetWaitFlag();
    ret = SendFile(sid, g_fileOne, dfileList, 1);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SendFile fail";
    ret = Wait(10);
    EXPECT_EQ(SOFTBUS_OK, ret) << "wait send fail rst fail";

    CloseSession(sid);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[proxy] fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_SendFile_Fun_0300
 * @tc.name   : SendFile the sender address is empty ,send failed
 * @tc.desc   : Test send file function
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFileFuncTest, SUB_Softbus_Trans_Comp_SendFile_Fun_0300, TestSize.Level2)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE, &g_fileSessionListener);
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[file] fail";

    g_waitFlag = WAIT_DEF_VALUE;
    int sid = OpenSession(SESSION_NAME_FILE, SESSION_NAME_FILE, GetNetworkId(), DEF_GROUP_ID, &g_fileSessionAttr);
    EXPECT_TRUE(sid >= SESSION_ID_MIN) << "call OpenSession[file] fail, sid=" << sid;
    if (sid >= SESSION_ID_MIN) {
        ret = WaitFile(10);
        EXPECT_EQ(SOFTBUS_OK, ret) << "wait opensession fail[file]";
    }

    static const char *dfileList[] = {
        "/data/SNULL.tar",
    };

    ResetWaitFlag();
    ret = SendFile(sid, NULL, dfileList, 1);
    EXPECT_NE(SOFTBUS_OK, ret) << "call SendFile successful";
    
    CloseSession(sid);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[proxy] fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_SendFile_Fun_0400
 * @tc.name   : SendFile the sender address is invalid ,send failed
 * @tc.desc   : Test send file function
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFileFuncTest, SUB_Softbus_Trans_Comp_SendFile_Fun_0400, TestSize.Level2)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE, &g_fileSessionListener);
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[file] fail";

    g_waitFlag = WAIT_DEF_VALUE;
    int sid = OpenSession(SESSION_NAME_FILE, SESSION_NAME_FILE, GetNetworkId(), DEF_GROUP_ID, &g_fileSessionAttr);
    EXPECT_TRUE(sid >= SESSION_ID_MIN) << "call OpenSession[file] fail, sid=" << sid;
    if (sid >= SESSION_ID_MIN) {
        ret = WaitFile(10);
        EXPECT_EQ(SOFTBUS_OK, ret) << "wait opensession fail[file]";
    }

    static const char *g_fileOne[] = {
        "/data/sendfile/8M.tar",
    };

    static const char *dfileList[] = {
        "/data/8M_invalid.tar",
    };

    ResetWaitFlag();
    ret = SendFile(sid, g_fileOne, dfileList, 1);
    EXPECT_NE(SOFTBUS_OK, ret) << "call SendFile successful";
    
    CloseSession(sid);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[proxy] fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_SendFile_Fun_0500
 * @tc.name   : SendFile the receiving address is null ,send successful
 * @tc.desc   : Test send file function
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFileFuncTest, SUB_Softbus_Trans_Comp_SendFile_Fun_0500, TestSize.Level2)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE, &g_fileSessionListener);
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[file] fail";

    g_waitFlag = WAIT_DEF_VALUE;
    int sid = OpenSession(SESSION_NAME_FILE, SESSION_NAME_FILE, GetNetworkId(), DEF_GROUP_ID, &g_fileSessionAttr);
    EXPECT_TRUE(sid >= SESSION_ID_MIN) << "call OpenSession[file] fail, sid=" << sid;
    if (sid >= SESSION_ID_MIN) {
        ret = WaitFile(10);
        EXPECT_EQ(SOFTBUS_OK, ret) << "wait opensession fail[file]";
    }

    static const char* g_fileOne[] = {
        "/data/8M_DNull.tar",
    };

    ResetWaitFlag();
    ret = SendFile(sid, g_fileOne, NULL, 1);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SendFile fail";
    ret = Wait(15);
    EXPECT_EQ(SOFTBUS_OK, ret) << "wait send fail rst fail";
    
    CloseSession(sid);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[proxy] fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_SendFile_Fun_0600
 * @tc.name   : SendFile the receiving address is invalid ,send successful
 * @tc.desc   : Test send file function
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFileFuncTest, SUB_Softbus_Trans_Comp_SendFile_Fun_0600, TestSize.Level2)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE, &g_fileSessionListener);
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[file] fail";

    g_waitFlag = WAIT_DEF_VALUE;
    int sid = OpenSession(SESSION_NAME_FILE, SESSION_NAME_FILE, GetNetworkId(), DEF_GROUP_ID, &g_fileSessionAttr);
    EXPECT_TRUE(sid >= SESSION_ID_MIN) << "call OpenSession[file] fail, sid=" << sid;
    if (sid >= SESSION_ID_MIN) {
        ret = WaitFile(10);
        EXPECT_EQ(SOFTBUS_OK, ret) << "wait opensession fail[file]";
    }

    static const char* g_fileOne[] = {
        "/data/8M.tar",
    };

    static const char *dfileList[] = {
        "/sendfile/8M_invalid.tar",
    };

    ResetWaitFlag();
    ret = SendFile(sid, g_fileOne, dfileList, 1);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SendFile fail";
    ret = Wait(15);
    EXPECT_EQ(SOFTBUS_OK, ret) << "wait send fail rst fail";
    
    CloseSession(sid);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[proxy] fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_SendFile_Fun_0700
 * @tc.name   : SendFile close  session ,send failed
 * @tc.desc   : Test send file function
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFileFuncTest, SUB_Softbus_Trans_Comp_SendFile_Fun_0700, TestSize.Level2)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE, &g_fileSessionListener);
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[file] fail";

    g_waitFlag = WAIT_DEF_VALUE;
    int sid = OpenSession(SESSION_NAME_FILE, SESSION_NAME_FILE, GetNetworkId(), DEF_GROUP_ID, &g_fileSessionAttr);
    EXPECT_TRUE(sid >= SESSION_ID_MIN) << "call OpenSession[file] fail, sid=" << sid;
    if (sid >= SESSION_ID_MIN) {
        ret = WaitFile(10);
        EXPECT_EQ(SOFTBUS_OK, ret) << "wait opensession fail[file]";
    }

    static const char* g_fileOne[] = {
        "/data/big.tar",
    };

    static const char *dfileList[] = {
        "/sendfile/big.tar",
    };

    ResetWaitFlag();
    ret = SendFile(sid, g_fileOne, dfileList, 1);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SendFile fail";

    CloseSession(sid);
    ret = Wait(15);
    EXPECT_NE(SOFTBUS_OK, ret) << "wait send success ,expect fail";
    
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[proxy] fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_SendFile_Fun_0800
 * @tc.name   : SendFile set recev listening address to be null or invalid
 * @tc.desc   : Test send file function
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFileFuncTest, SUB_Softbus_Trans_Comp_SendFile_Fun_0800, TestSize.Level2)
{
    int ret = SetFileReceiveListener(DEF_PKG_NAME, SESSION_NAME_FILE, GetRecvFileListener(), NULL);
    EXPECT_NE(SOFTBUS_OK, ret) << "call SetFileSendListener fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_SendFile_Fun_0900
 * @tc.name   : Send 4 files once
 * @tc.desc   : [G-DISTRIBUTED-0206]禁止修改传输的默认协议，新增或者变更默认传输协议必须通过协商机制来实现
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFileFuncTest, SUB_Softbus_Trans_Comp_SendFile_Fun_0900, TestSize.Level2)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE, &g_fileSessionListener);
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[file] fail";

    g_waitFlag = WAIT_DEF_VALUE;
    int sid = OpenSession(SESSION_NAME_FILE, SESSION_NAME_FILE, GetNetworkId(), DEF_GROUP_ID, &g_fileSessionAttr);
    EXPECT_TRUE(sid >= SESSION_ID_MIN) << "call OpenSession[file] fail, sid=" << sid;
    if (sid >= SESSION_ID_MIN) {
        ret = WaitFile(10);
        EXPECT_EQ(SOFTBUS_OK, ret) << "wait opensession fail[file]";
    }

    static const char* g_fileOne[] = {
        "/data/big.tar",
        "/data/richu.jpg",
        "/data/richu-002.jpg",
        "/data/richu-003.jpg",
    };

    ResetWaitFlag();
    ret = SendFile(sid, g_fileOne, NULL, 4);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SendFile fail";
    ret = Wait(350);
    EXPECT_EQ(SOFTBUS_OK, ret) << "wait send fail rst fail";

    CloseSession(sid);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[proxy] fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_SendFile_P2P_Fun_0100
 * @tc.name   : test SendFile 8M By P2P
 * @tc.desc   : [G-DISTRIBUTED-0206]禁止修改传输的默认协议，新增或者变更默认传输协议必须通过协商机制来实现
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFileFuncTest, SUB_Softbus_Trans_Comp_SendFile_P2P_Fun_0100, TestSize.Level2)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE, &g_fileSessionListener);
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[file] fail";

    g_waitFlag = WAIT_DEF_VALUE;
    int sid = OpenSession(SESSION_NAME_FILE, SESSION_NAME_FILE, GetNetworkId(), DEF_GROUP_ID, &g_fileSessionAttrP2P);
    EXPECT_TRUE(sid >= SESSION_ID_MIN) << "call OpenSession[file] fail, sid=" << sid;
    if (sid >= SESSION_ID_MIN) {
        ret = WaitFile(10);
        EXPECT_EQ(SOFTBUS_OK, ret) << "wait opensession fail[file]";
    }

    static const char* g_fileOne[] = {
        "/data/8M.tar",
    };

    static const char *dfileList[] = {
        "/data/P2P/8M.tar",
    };

    ResetWaitFlag();
    ret = SendFile(sid, g_fileOne, dfileList, 1);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SendFile fail";
    ret = Wait(10);
    EXPECT_EQ(SOFTBUS_OK, ret) << "wait send fail rst fail";

    CloseSession(sid);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[proxy] fail";
}

/**
 * @tc.number : SUB_Softbus_Trans_Comp_SendFile_P2P_Fun_0200
 * @tc.name   : test SendFile 0M By P2P
 * @tc.desc   : Test send file function
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(TransFileFuncTest, SUB_Softbus_Trans_Comp_SendFile_P2P_Fun_0200, TestSize.Level2)
{
    int ret;
    ret = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE, &g_fileSessionListener);
    EXPECT_EQ(SOFTBUS_OK, ret) << "CreateSS[file] fail";

    g_waitFlag = WAIT_DEF_VALUE;
    int sid = OpenSession(SESSION_NAME_FILE, SESSION_NAME_FILE, GetNetworkId(), DEF_GROUP_ID, &g_fileSessionAttrP2P);
    EXPECT_TRUE(sid >= SESSION_ID_MIN) << "call OpenSession[file] fail, sid=" << sid;
    if (sid >= SESSION_ID_MIN) {
        ret = WaitFile(10);
        EXPECT_EQ(SOFTBUS_OK, ret) << "wait opensession fail[file]";
    }

    static const char* g_fileOne[] = {
        "/data/A.tar",
    };

    static const char *dfileList[] = {
        "/data/P2P/A_recv.tar",
    };

    ResetWaitFlag();
    ret = SendFile(sid, g_fileOne, dfileList, 1);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call SendFile fail";
    ret = Wait(10);
    EXPECT_EQ(SOFTBUS_OK, ret) << "wait send fail rst fail";

    CloseSession(sid);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE);
    EXPECT_EQ(SOFTBUS_OK, ret) << "RemoveSS[proxy] fail";
}
