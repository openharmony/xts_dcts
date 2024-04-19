/*
 * Copyright (c) 2021-2024 Huawei Device Co., Ltd.
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

#include "socket_common.h"
#include "accesstoken_kit.h"
#include "socket.h"

using namespace testing::ext;

class SocketTransFuncTest : public testing::Test {
public:
    // 测试套前置和后置操作
    static void SetUpTestCase();
    static void TearDownTestCase();

    // 测试用例前置和后置操作
    void SetUp();
    void TearDown();
};

void SocketTransFuncTest::SetUp() {}

void SocketTransFuncTest::TearDown() {}

void SocketTransFuncTest::SetUpTestCase()
{
    LOG("SetUp begin");
    AddPermission();
    sleep(1);
    system("pidof accesstoken_service | xargs kill -9");
    sleep(1);
    TestSetUp();

    int ret = RegisterDeviceStateDefCallback();
    EXPECT_EQ(SOFTBUS_OK, ret) << "call reg node state callback fail";
    ret = CheckRemoteDeviceIsNull(BOOL_TRUE);
    ASSERT_EQ(SOFTBUS_OK, ret) << "get node fail,please check network";

    system(" truncate -s 8M /data/8M.tar");

    LOG("SetUp end");
}

void SocketTransFuncTest::TearDownTestCase()
{
    int ret = UnRegisterDeviceStateDefCallback();
    EXPECT_EQ(SOFTBUS_OK, ret) << "call unReg node state callback fail";

    TestTearDown();
}

static inline void SetNumberInStreamData(char *streamData, int i)
{
    if (i < FRAME_10) {
        streamData[INDEX_0] = '1';
        streamData[INDEX_1] = '0' + i;
    } else if (i < FRAME_100) {
        streamData[INDEX_0] = '2';
        streamData[INDEX_1] = '0' + (i / TEN_PLACE);
        streamData[INDEX_2] = '0' + (i % TEN_PLACE);
    } else if (i < FRAME_1000) {
        streamData[INDEX_0] = '3';
        streamData[INDEX_1] = '0' + (i / HUNDRED_PLACE);
        streamData[INDEX_2] = '0' + ((i / TEN_PLACE) % TEN_PLACE);
        streamData[INDEX_3] = '0' + ((i % HUNDRED_PLACE) % TEN_PLACE);
    } else {
        streamData[INDEX_0] = '4';
        streamData[INDEX_1] = '0' + (i / THOUSAND_PLACE);
        streamData[INDEX_2] = '0' + ((i % THOUSAND_PLACE) / HUNDRED_PLACE);
        streamData[INDEX_3] = '0' + (((i % THOUSAND_PLACE) % HUNDRED_PLACE) / TEN_PLACE);
        streamData[INDEX_4] = '0' + (((i % THOUSAND_PLACE) % HUNDRED_PLACE) % TEN_PLACE);
    }
}

SocketInfo socketByteInfo = {
    .name = (char *)SOCKET_NAME_BYTE,
    .pkgName = (char *)DEF_PKG_NAME,
    .peerName = (char *)SOCKET_NAME_BYTE,
    .dataType = DATA_TYPE_BYTES,
    .peerNetworkId = (char *)GetNetworkId(),
};

SocketInfo socketMessageInfo = {
    .name = (char *)SOCKET_NAME_MESSAGE,
    .pkgName = (char *)DEF_PKG_NAME,
    .peerName = (char *)SOCKET_NAME_MESSAGE,
    .dataType = DATA_TYPE_MESSAGE,
    .peerNetworkId = (char *)GetNetworkId(),
};

SocketInfo socketFileInfo = {
    .name = (char *)SOCKET_NAME_FILE,
    .pkgName = (char *)DEF_PKG_NAME,
    .peerName = (char *)SOCKET_NAME_FILE,
    .dataType = DATA_TYPE_FILE,
    .peerNetworkId = (char *)GetNetworkId(),
};

SocketInfo socketStreamInfo = {
    .name = (char *)SOCKET_NAME_STREAM,
    .pkgName = (char *)DEF_PKG_NAME,
    .peerName = (char *)SOCKET_NAME_STREAM,
    .dataType = DATA_TYPE_VIDEO_STREAM,
    .peerNetworkId = (char *)GetNetworkId(),
};

QosTV info_wifi[] = {
    {.qos = QOS_TYPE_MIN_BW, .value = 10 * 1024 * 4024, },
    {.qos = QOS_TYPE_MIN_LATENCY, .value = 800, },
    {.qos = QOS_TYPE_MAX_LATENCY, .value = 800, },
};

QosTV info_p2p[] = {
    {.qos = QOS_TYPE_MIN_BW, .value = 160 * 1024 * 4024, },
    {.qos = QOS_TYPE_MIN_LATENCY, .value = 1600, },
    {.qos = QOS_TYPE_MAX_LATENCY, .value = 1600, },
};

/**
 * @tc.number : SUB_DSoftbus_Spec_DCTS_Socket_SendBytes_0100
 * @tc.name   : SendByte Packet size 1B, send and receive successful
 * @tc.desc   : Test the SendByte specification
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(SocketTransFuncTest, SUB_DSoftbus_Spec_DCTS_Socket_SendBytes_0100, TestSize.Level3)
{
    int ret;
    int32_t socket = Socket(socketByteInfo);
    EXPECT_GT(socket, 0) << "create socket[data] fail";
    ret = Bind(socket, (const QosTV *)info_wifi, sizeof(info_wifi) / sizeof(info_wifi[0]), GetSocketListnerData());
    EXPECT_EQ(SOFTBUS_OK, ret) << "Bind faild ret: "<< ret;
    SetCurrentSocket4Data(socket);
    LOG("###SendData  socket = %d ", socket);
    int size = 1;
    ret = SendSocket4Data(DATA_TYPE_BYTE, size);
    EXPECT_EQ(SOFTBUS_OK, ret) << "SendData4Data(byte, 1B) fail";
    Shutdown(socket);
}

/**
 * @tc.number : SUB_DSoftbus_Spec_DCTS_Socket_SendMessage_0100
 * @tc.name   : SendMessage Packet size 1B, send and receive successful
 * @tc.desc   : Test the SendMessage specification
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(SocketTransFuncTest, SUB_DSoftbus_Spec_DCTS_Socket_SendMessage_0100, TestSize.Level3)
{
    int ret;
    int32_t socket = Socket(socketMessageInfo);
    EXPECT_GT(socket, 0) << "create socket[data] fail";
    ret = Bind(socket, (const QosTV *)info_wifi, sizeof(info_wifi) / sizeof(info_wifi[0]), GetSocketListnerData());
    EXPECT_EQ(SOFTBUS_OK, ret) << "Bind faild ret: "<< ret;
    SetCurrentSocket4Data(socket);
    int size = 1;
    ret = SendSocket4Data(DATA_TYPE_MSG, size);
    EXPECT_EQ(SOFTBUS_OK, ret) << "SendData4Data(byte, 1B) fail";
    Shutdown(socket);
}

/**
 * @tc.number : SUB_DSoftbus_Spec_DCTS_Socket_SendFile_0100
 * @tc.name   : SendFile  size 8MB, send and receive successful
 * @tc.desc   : Test the SendFile specification
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(SocketTransFuncTest, SUB_DSoftbus_Spec_DCTS_Socket_SendFile_0100, TestSize.Level3)
{
    int ret;
    static const char* gFileOne[] = {
        "/data/8M.tar",
    };

    static const char *dFileList[] = {
        "/data/8M.tar",
    };

    int32_t socket = Socket(socketFileInfo);
    EXPECT_GT(socket, 0) << "create socket[data] fail";
    ret = Bind(socket, (const QosTV *)info_wifi, sizeof(info_wifi) / sizeof(info_wifi[0]), GetSocketListnerData());
    EXPECT_EQ(SOFTBUS_OK, ret) << "Bind faild ret: "<< ret;

    ResetWaitFlag4File();

    ret = SendFile(socket, gFileOne, dFileList, sizeof(gFileOne) / sizeof(gFileOne[0]));
    EXPECT_EQ(SOFTBUS_OK, ret) << "SendData4Data(byte, 1B) fail";
    ret = Wait4Socket(10, SOCKET_FILE);
    EXPECT_EQ(SOFTBUS_OK, ret) << "wait SendFile faild ";
    Shutdown(socket);
}

/**
 * @tc.number : SUB_DSoftbus_Spec_DCTS_Socket_SendStream_0100
 * @tc.name   : Video stream 1080P60 I150K P30K
 * @tc.desc   : Test the SendStream specification
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(SocketTransFuncTest, SUB_DSoftbus_Spec_DCTS_Socket_SendStream_0100, TestSize.Level3)
{
    int ret;
    char *sendIFrame = (char *)malloc(I_FRAME_SIZE3);
    EXPECT_NE(sendIFrame, nullptr);
    (void)memset_s(sendIFrame, sizeof(sendIFrame), 0, I_FRAME_SIZE3);
    char *sendPFrame = (char *)malloc(P_FRAME_SIZE3);
    EXPECT_NE(sendPFrame, nullptr);
    (void)memset_s(sendPFrame, sizeof(sendPFrame), 0, P_FRAME_SIZE3);
  
    StreamData extStreamData = {0};
    StreamData streamIData = {
        .buf = sendIFrame,
        .bufLen = I_FRAME_SIZE3 + 1,
    };
    StreamFrameInfo  iFrame = {
        .frameType = I_FRAME_TYPE,
    };
    StreamData streamPData = {
        .buf = sendPFrame,
        .bufLen = P_FRAME_SIZE3 + 1,
    };
    StreamFrameInfo  pFrame = {
        .frameType = P_FRAME_TYPE,
    };

    int32_t socket = Socket(socketStreamInfo);
    EXPECT_GT(socket, 0) << "create socket[data] fail";
    ret = Bind(socket, (const QosTV *)info_wifi, sizeof(info_wifi) / sizeof(info_wifi[0]), GetSocketListnerData());
    EXPECT_EQ(SOFTBUS_OK, ret) << "Bind faild ret: "<< ret;

    for (int i = 0; i < 600; i++) {
        if (i % 60 == 0) {
            //I_Fream
            SetNumberInStreamData(sendIFrame, i);
            iFrame.seqNum = i;
            iFrame.bitMap |= 0x00000002;
            LOG("###SendStream %.*s", streamIData.bufLen, streamIData.buf);
            ret = SendStream(socket, &streamIData, &extStreamData, &iFrame);
            EXPECT_EQ(SOFTBUS_OK, ret) << "call SendStream fail";
            LOG("###SendStream IFREAM counts = %d ", i);
        } else {
            //P Fream
            SetNumberInStreamData(sendPFrame, i);
            pFrame.seqNum = i;
            pFrame.bitMap |= 0x00000002;
            LOG("###SendStream %.*s", streamIData.bufLen, streamIData.buf);
            ret = SendStream(socket, &streamPData, &extStreamData, &pFrame);
            EXPECT_EQ(SOFTBUS_OK, ret) << "call SendStream fail";
            LOG("###SendStream PFREAM counts = %d ", i);
        }
        usleep(16666); //sleep 100ms
    }
    free(sendIFrame);
    sendIFrame = nullptr;
    free(sendPFrame);
    sendPFrame = nullptr;
    Shutdown(socket);
}

/**
 * @tc.number : SUB_DSoftbus_Spec_DCTS_Socket_SendBytes_P2P_0100
 * @tc.name   : SendByte Packet size 1B, send and receive successful
 * @tc.desc   : Test the SendByte specification
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(SocketTransFuncTest, SUB_DSoftbus_Spec_DCTS_Socket_SendBytes_P2P_0100, TestSize.Level3)
{
    int ret;
    int32_t socket = Socket(socketByteInfo);
    EXPECT_GT(socket, 0) << "create socket[data] fail";
    ret = Bind(socket, (const QosTV *)info_p2p, sizeof(info_p2p) / sizeof(info_p2p[0]), GetSocketListnerData());
    EXPECT_EQ(SOFTBUS_OK, ret) << "Bind faild ret: "<< ret;
    SetCurrentSocket4Data(socket);
    LOG("###SendData  socket = %d ", socket);
    int size = 1;
    ret = SendSocket4Data(DATA_TYPE_BYTE, size);
    EXPECT_EQ(SOFTBUS_OK, ret) << "SendData4Data(byte, 1B) fail";
    Shutdown(socket);
}

/**
 * @tc.number : SUB_DSoftbus_Spec_DCTS_Socket_SendMessage_P2P_0100
 * @tc.name   : SendMessage Packet size 1B, send and receive successful
 * @tc.desc   : Test the SendMessage specification
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(SocketTransFuncTest, SUB_DSoftbus_Spec_DCTS_Socket_SendMessage_P2P_0100, TestSize.Level3)
{
    int ret;
    int32_t socket = Socket(socketMessageInfo);
    EXPECT_GT(socket, 0) << "create socket[data] fail";
    ret = Bind(socket, (const QosTV *)info_p2p, sizeof(info_p2p) / sizeof(info_p2p[0]), GetSocketListnerData());
    EXPECT_EQ(SOFTBUS_OK, ret) << "Bind faild ret: "<< ret;
    SetCurrentSocket4Data(socket);
    int size = 1;
    ret = SendSocket4Data(DATA_TYPE_MSG, size);
    EXPECT_EQ(SOFTBUS_OK, ret) << "SendData4Data(byte, 1B) fail";
    Shutdown(socket);
}

/**
 * @tc.number : SUB_DSoftbus_Spec_DCTS_Socket_SendFile_P2P_0100
 * @tc.name   : SendFile  size 8MB, send and receive successful
 * @tc.desc   : Test the SendFile specification
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(SocketTransFuncTest, SUB_DSoftbus_Spec_DCTS_Socket_SendFile_P2P_0100, TestSize.Level3)
{
    int ret;
    static const char* gFileOne[] = {
        "/data/8M.tar",
    };

    static const char *dFileList[] = {
        "/data/8M.tar",
    };

    int32_t socket = Socket(socketFileInfo);
    EXPECT_GT(socket, 0) << "create socket[data] fail";
    ret = Bind(socket, (const QosTV *)info_p2p, sizeof(info_p2p) / sizeof(info_p2p[0]), GetSocketListnerData());
    EXPECT_EQ(SOFTBUS_OK, ret) << "Bind faild ret: "<< ret;

    ResetWaitFlag4File();

    ret = SendFile(socket, gFileOne, dFileList, sizeof(gFileOne) / sizeof(gFileOne[0]));
    EXPECT_EQ(SOFTBUS_OK, ret) << "SendFile 8M fail";
    ret = Wait4Socket(10, SOCKET_FILE);
    EXPECT_EQ(SOFTBUS_OK, ret) << "wait SendFile faild ";
    Shutdown(socket);
}

/**
 * @tc.number : SUB_DSoftbus_Spec_DCTS_Socket_SendStream_P2P_0100
 * @tc.name   : Video stream 1080P60 I150K P30K
 * @tc.desc   : Test the SendStream specification
 * @tc.type   : FUNC
 * @tc.size   : MediumTest
 */
HWTEST_F(SocketTransFuncTest, SUB_DSoftbus_Spec_DCTS_Socket_SendStream_P2P_0100, TestSize.Level3)
{
    int ret;
    char *sendIFrame = (char *)malloc(I_FRAME_SIZE3);
    EXPECT_NE(sendIFrame, nullptr);
    (void)memset_s(sendIFrame, sizeof(sendIFrame), 0, I_FRAME_SIZE3);
    char *sendPFrame = (char *)malloc(P_FRAME_SIZE3);
    EXPECT_NE(sendPFrame, nullptr);
    (void)memset_s(sendPFrame, sizeof(sendPFrame), 0, P_FRAME_SIZE3);
  
    StreamData extStreamData = {0};
    StreamData streamIData = {
        .buf = sendIFrame,
        .bufLen = I_FRAME_SIZE3 + 1,
    };
    StreamFrameInfo  iFrame = {
        .frameType = I_FRAME_TYPE,
    };

    StreamData streamPData = {
        .buf = sendPFrame,
        .bufLen = P_FRAME_SIZE3 + 1,
    };
    StreamFrameInfo  pFrame = {
        .frameType = P_FRAME_TYPE,
    };

    int32_t socket = Socket(socketStreamInfo);
    EXPECT_GT(socket, 0) << "create socket[data] fail";
    ret = Bind(socket, (const QosTV *)info_p2p, sizeof(info_p2p) / sizeof(info_p2p[0]), GetSocketListnerData());
    EXPECT_EQ(SOFTBUS_OK, ret) << "Bind faild ret: "<< ret;

    for (int i = 0; i < 600; i++) {
        if (i % 60 == 0) {
            //I_Fream
            SetNumberInStreamData(sendIFrame, i);
            iFrame.seqNum = i;
            iFrame.bitMap |= 0x00000002;
            LOG("###SendStream %.*s", streamIData.bufLen, streamIData.buf);
            ret = SendStream(socket, &streamIData, &extStreamData, &iFrame);
            EXPECT_EQ(SOFTBUS_OK, ret) << "call SendStream fail";
            LOG("###SendStream IFREAM counts = %d ", i);
        } else {
            //P Fream
            SetNumberInStreamData(sendPFrame, i);
            pFrame.seqNum = i;
            pFrame.bitMap |= 0x00000002;
            LOG("###SendStream %.*s", streamIData.bufLen, streamIData.buf);
            ret = SendStream(socket, &streamPData, &extStreamData, &pFrame);
            EXPECT_EQ(SOFTBUS_OK, ret) << "call SendStream fail";
            LOG("###SendStream PFREAM counts = %d ", i);
        }
        usleep(16666); //sleep 100ms
    }
    
    free(sendIFrame);
    sendIFrame = nullptr;
    free(sendPFrame);
    sendPFrame = nullptr;
    Shutdown(socket);
}