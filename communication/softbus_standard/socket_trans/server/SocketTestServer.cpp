/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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
#include "socket.h"
#include "accesstoken_kit.h"

using namespace std;
using namespace testing::ext;


static INodeStateCb* g_nodeStateCallback = NULL;
static ISocketListener* g_sessionlist4SokectData  = NULL;

static void SetupCallback(void);
static void TeardownCallback(void);

class SocketTestServer : public testing::Test {
public:
    static void SetUpTestCase();
    static void TearDownTestCase();
    void SetUp();
    void TearDown();
};

void SocketTestServer ::SetUp() {}

void SocketTestServer ::TearDown() {}

void SocketTestServer ::SetUpTestCase()
{
    LOG("SetUpTestCase");
    AddPermission();
    sleep(ONE_SECOND);
    OHOS::Security::AccessToken::AccessTokenKit::ReloadNativeTokenInfo();
    sleep(ONE_SECOND);
    TestSetUp();
    SetupCallback();
    int ret = RegNodeDeviceStateCb(DEF_PKG_NAME, g_nodeStateCallback);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call reg node state callback fail";
}

void SocketTestServer::TearDownTestCase()
{
    LOG("TearDownTestCase");
    int ret = UnregNodeDeviceStateCb(g_nodeStateCallback);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call unReg node state callback fail";
    TeardownCallback();
    TestTearDown();
}

SocketInfo socketInfoByte = {
    .name = (char *)SOCKET_NAME_BYTE,
    .pkgName = (char *)DEF_PKG_NAME,
    .dataType = DATA_TYPE_BYTES,
};

SocketInfo socketInfoMessage = {
    .name = (char *)SOCKET_NAME_MESSAGE,
    .pkgName = (char *)DEF_PKG_NAME,
    .dataType = DATA_TYPE_MESSAGE,
};

SocketInfo socketInfoFile = {
    .name = (char *)SOCKET_NAME_FILE,
    .pkgName = (char *)DEF_PKG_NAME,
    .dataType = DATA_TYPE_FILE,
};

SocketInfo socketInfoStream = {
    .name = (char *)SOCKET_NAME_STREAM,
    .pkgName = (char *)DEF_PKG_NAME,
    .dataType = DATA_TYPE_VIDEO_STREAM,
};

/* socket callback for data */
bool OnNegotiate(int32_t socket, PeerSocketInfo info)
{
    uint64_t tokenId = GetTestTokenId();
    SetSelfTokenID(tokenId);
    LOG("[cb][data]OnNegotiate success  {socket:%d: }", socket);
    return true;
}

static void OnBind(int32_t socket, PeerSocketInfo info)
{
    uint64_t tokenId = GetTestTokenId();
    SetSelfTokenID(tokenId);
    LOG("[cb][data]OnBind success  {socket:%d, name:%s, deviceId:%s, pkgName:%s, dataType:%d}", socket,
        info.name, info.networkId, info.pkgName, info.dataType);
}

static void OnShutdown(int32_t socket, ShutdownReason reason)
{
    LOG("[cb][data] OnShutdown {socket:%d, reason:%d}", socket, reason);
}

static void OnByte(int32_t socket, const void* data, unsigned int dataLen)
{
    if (socket < 0) {
        LOG("[cb][data]byte received invalid socket id[%d]", socket);
        return;
    }
    LOG("[cb][data]byte received   socket:%d, data-len:%d", socket, dataLen);
    int ret = SendBytes(socket, data, dataLen);
    LOG("[cb][data]byte received   send back:%d", ret);
}

static void OnMessage(int32_t socket, const void* data, unsigned int dataLen)
{
    if (socket < 0) {
        LOG("[cb][data]mesg received   invalid socket id[%d]", socket);
        return;
    }
    LOG("[cb][data]mesg received   socket:%d, data-len:%d", socket, dataLen);
}

static void OnStream(int32_t socket, const StreamData *data, const StreamData *ext, const StreamFrameInfo *param)
{
    if (socket < 0) {
        LOG("[cb][data]OnStream invalid socket id[%d]", socket);
        return;
    }
    if (data == nullptr) {
        LOG("[cb][data]OnStream socket id[%d], data is nullptr", socket);
        return;
    }
    if (ext == nullptr) {
        LOG("[cb][data]OnStream socket id[%d], ext is nullptr", socket);
        return;
    }
    if (param == nullptr) {
        LOG("[cb][data]OnStream socket id[%d], param is nullptr", socket);
        return;
    }

    LOG("[cb][data]OnStream Success socket:%d,", socket);
    LOG("[cb][data]OnStream Success buf:%s,", (data->buf != NULL ? data->buf : "null"));
    LOG("[cb][data]OnStream Success buflen:%d", data->bufLen);
    LOG("[cb][data]OnStream Success buf:%s,", (ext->buf != NULL ? ext->buf : "null"));
}

static const char *UpdataRecvFilePath()
{
    return "/data/";
}

static void OnFile(int32_t socket, FileEvent *event)
{
    if (socket < 0) {
        LOG("[cb][data]OnFile invalid socket id[%d]", socket);
        return;
    }
    if (event == nullptr) {
        LOG("[cb][data]OnFile socket id[%d], event is nullptr", socket);
        return;
    }
    if (event->type == FILE_EVENT_RECV_UPDATE_PATH) {
        LOG("[cb][data]OnFile event type:%d,", event->type);
        event->UpdateRecvPath = UpdataRecvFilePath;
        return;
    }
    LOG("[cb][data]OnFile, event type:%d, fileCnt:%u",
        event->type, event->fileCnt);
    for (uint32_t i = 0; i < event->fileCnt; i++) {
        LOG("[cb][data] %s", (event->files[i] == NULL ? "null" : event->files[i]));
    }
    if (event->type == FILE_EVENT_RECV_FINISH) {
        LOG("[cb][data]OnFile recv finished");
        return;
    }
    if (event->type == FILE_EVENT_RECV_PROCESS) {
        LOG("[cb][data]OnFile recv process");
        return;
    }
    if (event->type == FILE_EVENT_RECV_ERROR) {
        LOG("[cb][data]OnFile recv error!!");
        return;
    }
}

static void OnQos(int32_t socket, QoSEvent eventId, const QosTV *qos, uint32_t qosCunt)
{
    LOG("[cb][data] OnQos {socket:%d, event:%d}", socket, eventId);
}

/* net state callback */
static void OnNodeOnline(NodeBasicInfo* info)
{
    if (info == NULL) {
        LOG("[cb]Online: info is null");
    }

    LOG("[cb]Online id:%s, name:%s ,type id:%u", info->networkId, info->deviceName, info->deviceTypeId);
}

static void OnNodeOffline(NodeBasicInfo* info)
{
    if (info == NULL) {
        LOG("[cb]Offline: info is null");
        return;
    }

    LOG("[cb]Offline id:%s, name:%s ,type id:%u", info->networkId, info->deviceName, info->deviceTypeId);
}

static void OnNodeBasicInfoChanged(NodeBasicInfoType type, NodeBasicInfo* info)
{
    if (info == NULL) {
        LOG("[cb]InfoChanged: info is null, type[%d]", type);
        return;
    }
    LOG("[cb]InfoChanged id: %s, name: %s", info->networkId, info->deviceName);
}

static void onDefNodeStatusChanged(NodeStatusType type, NodeStatus *status)
{
    if (status == NULL) {
        LOG("[cb]StatusChanged: info is null, type[%d]", type);
        return;
    }
    LOG("[cb]StatusChanged id: %s,status: %d", status->basicInfo.networkId, status->authStatus);
}

static void SetupCallback(void)
{
    if (g_nodeStateCallback == NULL) {
        g_nodeStateCallback = (INodeStateCb*)calloc(1, sizeof(INodeStateCb));
        g_nodeStateCallback->events = EVENT_NODE_STATE_MASK;
        g_nodeStateCallback->onNodeOnline = OnNodeOnline;
        g_nodeStateCallback->onNodeOffline = OnNodeOffline;
        g_nodeStateCallback->onNodeBasicInfoChanged = OnNodeBasicInfoChanged;
        g_nodeStateCallback->onNodeStatusChanged = onDefNodeStatusChanged;
    }
    if (g_sessionlist4SokectData == NULL) {
        g_sessionlist4SokectData= (ISocketListener*)calloc(1, sizeof(ISocketListener));
        g_sessionlist4SokectData->OnBind = OnBind;
        g_sessionlist4SokectData->OnShutdown = OnShutdown;
        g_sessionlist4SokectData->OnBytes = OnByte;
        g_sessionlist4SokectData->OnMessage = OnMessage;
        g_sessionlist4SokectData->OnStream = OnStream;
        g_sessionlist4SokectData->OnFile = OnFile;
        g_sessionlist4SokectData->OnQos = OnQos;
        g_sessionlist4SokectData->OnNegotiate = OnNegotiate;
    }
}

static void TeardownCallback(void)
{
    if (g_nodeStateCallback != NULL) {
        free(g_nodeStateCallback);
        g_nodeStateCallback = NULL;
    }
    if (g_sessionlist4SokectData != NULL) {
        free(g_sessionlist4SokectData);
        g_sessionlist4SokectData = NULL;
    }
}

/**
 * @tc.number : SUB_Softbus_Trans_SelfNet_0100
 * @tc.name     : 创建SS，等待opensession和消息传输
 * @tc.desc       : 测试自组网下传输功能，模拟服务端
 * @tc.type       : FUNC
 * @tc.size        : MediumTest
 */
HWTEST_F(SocketTestServer, test_create_ss, TestSize.Level3)
{
    int runtime = 0;
    /*socket server*/
    QosTV info[] = {
        {.qos = QOS_TYPE_MIN_BW, .value = 2000}
    };

    int32_t socketByte = Socket(socketInfoByte);
    LOG("Create socket [data] ret:%d", socketByte);
    int32_t socketMessage = Socket(socketInfoMessage);
    LOG("Create socket [data] ret:%d", socketMessage);
    int32_t socketFile = Socket(socketInfoFile);
    LOG("Create socket [data] ret:%d", socketFile);
    int32_t socketStream = Socket(socketInfoStream);
    LOG("Create socket [data] ret:%d", socketStream);
    if (socketByte == SOFTBUS_OK && socketMessage
        == SOFTBUS_OK && socketFile == SOFTBUS_OK && socketStream == SOFTBUS_OK) {
        LOG("Create socket ok");
    }

    /*create Listener*/
    int32_t byteListenRet = Listen(socketByte, info, sizeof(info)/sizeof(info[0]), g_sessionlist4SokectData);
    LOG("Create Listen [data] ret:%d", byteListenRet);
    int32_t messageListenRet = Listen(socketMessage, info, sizeof(info)/sizeof(info[0]), g_sessionlist4SokectData);
    LOG("Create Listen [data] ret:%d", messageListenRet);
    int32_t fileListenRet = Listen(socketFile, info, sizeof(info)/sizeof(info[0]), g_sessionlist4SokectData);
    LOG("Create Listen [data] ret:%d", fileListenRet);
    int32_t streamListenRet = Listen(socketStream, info, sizeof(info)/sizeof(info[0]), g_sessionlist4SokectData);
    LOG("Create Listen [data] ret:%d", socketStream);
    if (byteListenRet == SOFTBUS_OK && messageListenRet
        == SOFTBUS_OK && fileListenRet == SOFTBUS_OK && streamListenRet == SOFTBUS_OK) {
        LOG("Create socket ok");
    }

    while (true) {
        sleep(ONE_SECOND);
        runtime += 1;
        if (runtime % 60 == 0) {
            LOG("### test run:%d s", runtime);
        }
    }
}