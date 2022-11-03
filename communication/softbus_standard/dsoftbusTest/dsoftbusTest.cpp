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

using namespace std;
using namespace testing::ext;

static INodeStateCb* g_nodeStateCallback = NULL;
static ISessionListener* g_sessionlist4Data = NULL;
static ISessionListener* g_sessionlist4Ctrl = NULL;
static ISessionListener* g_sessionlist4Perf = NULL;
static ISessionListener* g_sessionlist4Pass = NULL;
static ISessionListener* g_sessionlist4File = NULL;
static ISessionListener* g_sessionlist4Proxy = NULL;
static ISessionListener  *g_sessionlist4Stream  = NULL;

static uint64_t g_transTimeEnd;

static const char* def_passwd = "OH2022@xa";
static const char* def_ssid = "OpenHarmony_Private_Net_01";
static const char* slave_ssid = "OpenHarmony_Private_Net_02";

static const int three_seconds = 3;
static const int six_seconds = 6;
static const int ten_seconds = 10;

static void SetupCallback(void);
static void TeardownCallback(void);

class dsoftbusTest : public testing::Test {
public:
    static void SetUpTestCase();
    static void TearDownTestCase();
    void SetUp();
    void TearDown();
};

void dsoftbusTest ::SetUp() {}

void dsoftbusTest ::TearDown() {}

void dsoftbusTest ::SetUpTestCase()
{
    LOG("SetUpTestCase");
    AddPermission();
    sleep(1);
    system("pidof accesstoken_ser | xargs kill -9");
    sleep(1);
    TestSetUp();
    SetupCallback();
    int ret = RegNodeDeviceStateCb(DEF_PKG_NAME, g_nodeStateCallback);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call reg node state callback fail";
}

void dsoftbusTest::TearDownTestCase()
{
    LOG("TearDownTestCase");
    int ret = UnregNodeDeviceStateCb(g_nodeStateCallback);
    EXPECT_EQ(SOFTBUS_OK, ret) << "call unReg node state callback fail";
    TeardownCallback();
    TestTearDown();
}

static int OnFileSessionOpened(int sessionId, int result)
{
    LOG("[cb][file]open session sid[%d],rst[%d]", sessionId, result);
    return SOFTBUS_OK;
}

static void OnFileSessionClosed(int sessionId)
{
    LOG("[cb][file]close session sid[%d]", sessionId);
}

static void OnFileBytesReceived(int sessionId, const void* data, unsigned int dataLen)
{
    LOG("[cb][file]ByteRec sid:%d, data len:%d", sessionId, dataLen);
    if (data == NULL) {
        LOG("[cb][file]ByteRec invalid data=null sid[%d]", sessionId);
    }
}

static void OnFileMessageReceived(int sessionId, const void* data, unsigned int dataLen)
{
    LOG("[cb][file]MessageRec sid:%d, data len:%d", sessionId, dataLen);
    if (data == NULL) {
        LOG("[cb][file]MessageRec invalid data=null sid[%d]", sessionId);
    }
}

static int OnStreamSessionOpened(int sessionId, int result)
{
    LOG("[cb][stream]open session sid[%d],rst[%d]", sessionId, result);
    return SOFTBUS_OK;
}

static void OnStreamSessionClosed(int sessionId)
{
    LOG("[cb][stream]close session sid[%d]", sessionId);
}

static inline int GetNumberInStreamData(const char *streamData)
{
    if (streamData[0] == '1') {
        return (streamData[1] - '0');
    } else if (streamData[0] == '2') {
        return (streamData[1] - '0') * 10 + (streamData[2] - '0');
    } else if (streamData[0] == '3') {
        return (streamData[1] - '0') * 100 + (streamData[2] - '0') * 10 + (streamData[3] - '0');
    } else if (streamData[0] == '4') {
        return (streamData[1] - '0') * 1000 + (streamData[2] - '0') * 100 + (streamData[3] - '0' * 10 + (streamData[4] - '0'));
    }
    return -1;
}

static void StreamReceived(int sessionId, const StreamData *data, const StreamData *ext, const StreamFrameInfo *frame)
{
    g_transTimeEnd = GetCurrentTimeOfMs();
    int i = GetNumberInStreamData((const char *)data->buf);
    if (i < 0) {
        return;
    }
    if (i % 60 == 0)
    {
        LOG("### RECV counts = %d ", i );
    } else
    {
        LOG("### RECV counts = %d ", i );
    } 
    if (data != NULL) {
        LOG("[cb][stream]Rec sid:%d, data= %.*s.\n", sessionId, data->bufLen, data->buf);
    } 
}

/* session callback for data */
static int OnDataSessionOpened(int sessionId, int result)
{
    LOG("[cb][data]session opened  sid:%d,ret:%d", sessionId, result);
    return SOFTBUS_OK;
}

static void OnDataSessionClosed(int sessionId)
{
    LOG("[cb][data]session closed  sid:%d", sessionId);
}

static void OnDataBytesReceived(int sessionId, const void* data, unsigned int dataLen)
{
    if (sessionId < 0) {
        LOG("[cb][data]byte received invalid session id[%d]", sessionId);
        return;
    }
    LOG("[cb][data]byte received   sid:%d, data-len:%d", sessionId, dataLen);
    int ret = SendBytes(sessionId, data, dataLen);
    LOG("[cb][data]byte received   send back:%d", ret);
}

static void OnDataMessageReceived(int sessionId, const void* data, unsigned int dataLen)
{
    if (sessionId < 0) {
        LOG("[cb][data]mesg received   invalid session id[%d]", sessionId);
        return;
    }
    LOG("[cb][data]mesg received   sid:%d, data-len:%d", sessionId, dataLen);
    int ret = SendMessage(sessionId, data, dataLen);
    LOG("[cb][data]mesg received   send back:%d", ret);
}

/* session callback for control */
static int GetCodeByMsg(const string& msg)
{
    LOG("[ctrl] recv msg content[%s]", msg.c_str());
    int ret = -1;
    if (strncmp(msg.c_str(), CTRL_MSG_CLOSE_WIFI_TEN_SEC, strlen(CTRL_MSG_CLOSE_WIFI_TEN_SEC)) == 0) {
        ret = CTRL_CODE_CLOSE_WIFI_TEN_SEC;
    } else if (strncmp(msg.c_str(), CTRL_MSG_CLOSE_WIFI_THREE_SEC, strlen(CTRL_MSG_CLOSE_WIFI_THREE_SEC)) == 0) {
        ret = CTRL_CODE_CLOSE_WIFI_THREE_SEC;
    } else if (strncmp(msg.c_str(), CTRL_MSG_CLOSE_WIFI_TEN_MIN, strlen(CTRL_MSG_CLOSE_WIFI_TEN_MIN)) == 0) {
        ret = CTRL_CODE_CLOSE_WIFI_TEN_MIN;
    } else if (strncmp(msg.c_str(), CTRL_MSG_CLOSE_WIFI_FIVE_MIN, strlen(CTRL_MSG_CLOSE_WIFI_FIVE_MIN)) == 0) {
        ret = CTRL_CODE_CLOSE_WIFI_FIVE_MIN;
    } else if (strncmp(msg.c_str(), CTRL_MSG_CHANGE_WIFI_TEN_SEC, strlen(CTRL_MSG_CHANGE_WIFI_TEN_SEC)) == 0) {
        ret = CTRL_CODE_CHANGE_WIFI_TEN_SEC;
    } else if (strncmp(msg.c_str(), CTRL_MSG_CHANGE_WIFI_SIXTY_SEC, strlen(CTRL_MSG_CHANGE_WIFI_SIXTY_SEC)) == 0) {
        ret = CTRL_CODE_CHANGE_WIFI_SIXTY_SEC;
    } else if (strncmp(msg.c_str(), CTRL_MSG_CLOSE_BR, strlen(CTRL_MSG_CLOSE_BR)) == 0) {
        ret = CTRL_CODE_CLOSE_BR;
    } else if (strncmp(msg.c_str(), CTRL_MSG_CLOSE_OPEN_BR, strlen(CTRL_MSG_CLOSE_OPEN_BR)) == 0) {
        ret = CTRL_CODE_CLOSE_OPEN_BR;
    } else if (strncmp(msg.c_str(), CTRL_MSG_OPEN_SESSION, strlen(CTRL_MSG_OPEN_SESSION)) == 0) {
        ret = CTRL_CODE_OPEN_SESSION;
    } else if (strncmp(msg.c_str(), CTRL_MSG_OPEN_SESSION_MSG, strlen(CTRL_MSG_OPEN_SESSION_MSG)) == 0) {
        ret = CTRL_CODE_OPEN_SESSION_MSG;
    } else if (strncmp(msg.c_str(), CTRL_MSG_OPEN_SESSION_NOT_EXIST, strlen(CTRL_MSG_OPEN_SESSION_NOT_EXIST)) == 0) {
        ret = CTRL_CODE_OPEN_SESSION_NOT_EXIST;
    }
    return ret;
}

void* CtrlOperateTask(void* param)
{
    LOG("[operate] start...");
    int code = -1;
    if (param != NULL) {
        code = *((int*)param);
    }
    LOG("[operate] code:%d", code);
    int ret;
    int sleepTime;
    switch (code) {
        case CTRL_CODE_CLOSE_WIFI_TEN_SEC:
            WiFiUtils ::DisableThenEnableAndConnect(ten_seconds, def_ssid, def_passwd);
            break;
        case CTRL_CODE_CLOSE_WIFI_THREE_SEC:
            WiFiUtils ::DisableThenEnableAndConnect(three_seconds, def_ssid, def_passwd);
            break;
        case CTRL_CODE_CLOSE_WIFI_TEN_MIN:
            sleepTime = six_seconds * ten_seconds * ten_seconds;
            WiFiUtils ::DisableWifi();
            while (sleepTime > 0) {
                sleep(ten_seconds);
                sleepTime -= ten_seconds;
                LOG("[operate][close wifi 10mins] wait:%d", sleepTime);
            }
            WiFiUtils ::EnableThenConnect(def_ssid, def_passwd);
            break;
        case CTRL_CODE_CLOSE_WIFI_FIVE_MIN:
            sleepTime = three_seconds * ten_seconds * ten_seconds;
            WiFiUtils ::DisableWifi();
            while (sleepTime > 0) {
                sleep(ten_seconds);
                sleepTime -= ten_seconds;
                LOG("[operate][close wifi 5mins] wait:%d", sleepTime);
            }
            WiFiUtils ::EnableThenConnect(def_ssid, def_passwd);
            break;
        case CTRL_CODE_CHANGE_WIFI_TEN_SEC:
            sleepTime = ten_seconds;
            ret = WiFiUtils ::ConnectToNew(slave_ssid, def_passwd);
            LOG("[operate]connect to salve ret:%d", ret);
            LOG("[operate]start sleep:%d", sleepTime);
            sleep(sleepTime);
            ret = WiFiUtils ::ConnectToNew(def_ssid, def_passwd);
            LOG("[operate]connect to default ret:%d", ret);
            break;
        case CTRL_CODE_CHANGE_WIFI_SIXTY_SEC:
            sleepTime = six_seconds * ten_seconds;
            ret = WiFiUtils ::ConnectToNew(slave_ssid, def_passwd);
            LOG("[operate]connect to salve ret:%d", ret);
            LOG("[operate]start sleep:%d", sleepTime);
            sleep(sleepTime);
            ret = WiFiUtils ::ConnectToNew(def_ssid, def_passwd);
            LOG("[operate]connect to default ret:%d", ret);
            break;
        case CTRL_CODE_CLOSE_BR:
            // close br
            LOG("[operate]close br TODO...");
            break;
        case CTRL_CODE_CLOSE_OPEN_BR:
            // close open br
            LOG("[operate]close-open br TODO...");
            break;
        case CTRL_CODE_OPEN_SESSION:
            // open session and send byte
            LOG("[operate]open session TODO...");
            break;
        case CTRL_CODE_OPEN_SESSION_NOT_EXIST:
            // open session not exist
            LOG("[operate]open session not exist TODO...");
            break;
        case CTRL_CODE_OPEN_SESSION_MSG:
            // open session and send msg
            LOG("[operate]open session not exist TODO...");
            break;
        default:
            LOG("[operate]not support this code");
            break;
    }
    free(param);
    LOG("[operate] end");
    return nullptr;
}

static int OnCtrlSessionOpened(int sessionId, int result)
{
    LOG("[cb][ctrl]session opened sid:%d, ret:%d", sessionId, result);
    return SOFTBUS_OK;
}

static void OnCtrlSessionClosed(int sessionId)
{
    LOG("[cb][ctrl]session closed sid:%d", sessionId);
}

static void OnCtrlBytesReceived(int sessionId, const void* data, unsigned int dataLen)
{
    if (sessionId < 0) {
        LOG("[cb][ctrl]byte received invalid session id[%d]", sessionId);
        return;
    }
    LOG("[cb][ctrl]byte received sid:%d, data-len:%d", sessionId, dataLen);
    int ret = SendBytes(sessionId, data, dataLen);
    LOG("[cb][ctrl]byte received send back:%d", ret);
}

static void OnCtrlMessageReceived(int sessionId, const void* data, unsigned int dataLen)
{
    if (sessionId < 0) {
        LOG("[cb][ctrl]mesg received invalid session id[%d]", sessionId);
        return;
    }
    LOG("[cb][ctrl]mesg received sid:%d, data-len:%d", sessionId, dataLen);
    int ret = SendMessage(sessionId, data, dataLen);
    LOG("[cb][ctrl]mesg received send back:%d", ret);

    // operate
    unsigned int maxCtrlLen = 25;
    if (dataLen < maxCtrlLen) {
        int* code = (int*)malloc(sizeof(int));
        *code = GetCodeByMsg((char*)data);
        LOG("[cb][ctrl]GetCodeByMsg is:%d", *code);
        if (*code != -1) {
            pthread_t ctrlThread;
            ret = pthread_create(&ctrlThread, nullptr, CtrlOperateTask, code);
            LOG("[cb][ctrl]create ctrl thread ret:%d", ret);
        } else {
            free(code);
        }
    }
}

/* session callback for performance */
static int OnPerfSessionOpened(int sessionId, int result)
{
    LOG("[cb][perf]session opened sid:%d, ret:%d", sessionId, result);
    return SOFTBUS_OK;
}

static void OnPerfSessionClosed(int sessionId)
{
    LOG("[cb][perf]session closed sid:%d", sessionId);
}

static void OnPerfBytesReceived(int sessionId, const void* data, unsigned int dataLen)
{
    if (sessionId < 0) {
        LOG("[cb][perf]byte received invalid session id[%d]", sessionId);
        return;
    }
    LOG("[cb][perf]byte received sid:%d, data-len:%d", sessionId, dataLen);
    int ret = SendBytes(sessionId, data, dataLen);
    LOG("[cb][perf]byte received send back:%d", ret);
}

static void OnPerfMessageReceived(int sessionId, const void* data, unsigned int dataLen)
{
    if (sessionId < 0) {
        LOG("[cb][perf]mesg received invalid session id[%d]", sessionId);
        return;
    }
    LOG("[cb][perf]mesg received sid:%d, data-len:%d", sessionId, dataLen);
    int ret = SendMessage(sessionId, data, dataLen);
    LOG("[cb][perf]mesg received send back:%d", ret);
}

static int OnPassSessionOpened(int sessionId, int result)
{
    LOG("[cb][pass]session opened sid:%d, ret:%d", sessionId, result);
    return SOFTBUS_OK;
}

static void OnPassSessionClosed(int sessionId)
{
    LOG("[cb][pass]session closed sid:%d", sessionId);
}

static void OnPassBytesReceived(int sessionId, const void* data, unsigned int dataLen)
{
    if (sessionId < 0) {
        LOG("[cb][pass]byte received invalid session id[%d]", sessionId);
        return;
    }
    LOG("[cb][pass]byte received sid:%d, data-len:%d", sessionId, dataLen);
}

static void OnPassMessageReceived(int sessionId, const void* data, unsigned int dataLen)
{
    if (sessionId < 0) {
        LOG("[cb][pass]mesg received invalid session id[%d]", sessionId);
        return;
    }
    LOG("[cb][pass]mesg received sid:%d, data-len:%d", sessionId, dataLen);
}

static int OnProxySessionOpened(int sessionId, int result)
{
    LOG("[cb][Proxy]session opened sid:%d, ret:%d", sessionId, result);
    return SOFTBUS_OK;
}

static void OnProxySessionClosed(int sessionId)
{
    LOG("[cb][Proxy]session closed sid:%d", sessionId);
}

static void OnProxyBytesReceived(int sessionId, const void* data, unsigned int dataLen)
{
    if (sessionId < 0) {
        LOG("[cb][Proxy]byte received invalid session id[%d]", sessionId);
        return;
    }
    LOG("[cb][Proxy]byte received sid:%d, data-len:%d", sessionId, dataLen);
    int ret = SendBytes(sessionId, data, dataLen);
    LOG("[cb][Proxy]byte received send back:%d", ret);
}

static void OnProxyMessageReceived(int sessionId, const void* data, unsigned int dataLen)
{
   if (sessionId < 0) {
        LOG("[cb][Proxy]mesg received   invalid session id[%d]", sessionId);
        return;
    }
    LOG("[cb][Proxy]mesg received   sid:%d, data-len:%d", sessionId, dataLen);
    int ret = SendMessage(sessionId, data, dataLen);
    LOG("[cb][Proxy]mesg received   send back:%d", ret);
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

static void SetupCallback(void)
{
    if (g_sessionlist4Data == NULL) {
        g_sessionlist4Data = (ISessionListener*)calloc(1, sizeof(ISessionListener));
        g_sessionlist4Data->OnSessionOpened = OnDataSessionOpened;
        g_sessionlist4Data->OnSessionClosed = OnDataSessionClosed;
        g_sessionlist4Data->OnMessageReceived = OnDataMessageReceived;
        g_sessionlist4Data->OnBytesReceived = OnDataBytesReceived;
    }

    if (g_sessionlist4Ctrl == NULL) {
        g_sessionlist4Ctrl = (ISessionListener*)calloc(1, sizeof(ISessionListener));
        g_sessionlist4Ctrl->OnSessionOpened = OnCtrlSessionOpened;
        g_sessionlist4Ctrl->OnSessionClosed = OnCtrlSessionClosed;
        g_sessionlist4Ctrl->OnMessageReceived = OnCtrlMessageReceived;
        g_sessionlist4Ctrl->OnBytesReceived = OnCtrlBytesReceived;
    }

    if (g_sessionlist4Perf == NULL) {
        g_sessionlist4Perf = (ISessionListener*)calloc(1, sizeof(ISessionListener));
        g_sessionlist4Perf->OnSessionOpened = OnPerfSessionOpened;
        g_sessionlist4Perf->OnSessionClosed = OnPerfSessionClosed;
        g_sessionlist4Perf->OnMessageReceived = OnPerfMessageReceived;
        g_sessionlist4Perf->OnBytesReceived = OnPerfBytesReceived;
    }

    if (g_sessionlist4Pass == NULL) {
        g_sessionlist4Pass = (ISessionListener*)calloc(1, sizeof(ISessionListener));
        g_sessionlist4Pass->OnSessionOpened = OnPassSessionOpened;
        g_sessionlist4Pass->OnSessionClosed = OnPassSessionClosed;
        g_sessionlist4Pass->OnMessageReceived = OnPassMessageReceived;
        g_sessionlist4Pass->OnBytesReceived = OnPassBytesReceived;
    }

    if (g_sessionlist4Proxy == NULL) {
        g_sessionlist4Proxy = (ISessionListener*)calloc(1, sizeof(ISessionListener));
        g_sessionlist4Proxy->OnSessionOpened = OnProxySessionOpened;
        g_sessionlist4Proxy->OnSessionClosed = OnProxySessionClosed;
        g_sessionlist4Proxy->OnMessageReceived = OnProxyMessageReceived;
        g_sessionlist4Proxy->OnBytesReceived = OnProxyBytesReceived;
    }

    if (g_sessionlist4File == NULL) {
        g_sessionlist4File = (ISessionListener*)calloc(1, sizeof(ISessionListener));
        g_sessionlist4File->OnSessionOpened = OnFileSessionOpened;
        g_sessionlist4File->OnSessionClosed = OnFileSessionClosed;
        g_sessionlist4File->OnMessageReceived = OnFileMessageReceived;
        g_sessionlist4File->OnBytesReceived = OnFileBytesReceived;
    }

    if (g_nodeStateCallback == NULL) {
        g_nodeStateCallback = (INodeStateCb*)calloc(1, sizeof(INodeStateCb));
        g_nodeStateCallback->events = EVENT_NODE_STATE_MASK;
        g_nodeStateCallback->onNodeOnline = OnNodeOnline;
        g_nodeStateCallback->onNodeOffline = OnNodeOffline;
        g_nodeStateCallback->onNodeBasicInfoChanged = OnNodeBasicInfoChanged;
    }

    if (g_sessionlist4Stream == NULL) {
        g_sessionlist4Stream= (ISessionListener*)calloc(1, sizeof(ISessionListener));
        g_sessionlist4Stream->OnSessionOpened = OnStreamSessionOpened;
        g_sessionlist4Stream->OnSessionClosed = OnStreamSessionClosed;
        g_sessionlist4Stream->OnStreamReceived = StreamReceived;
    }
}

static void TeardownCallback(void)
{
    if (g_sessionlist4Data != NULL) {
        free(g_sessionlist4Data);
        g_sessionlist4Data = NULL;
    }
    if (g_sessionlist4Ctrl != NULL) {
        free(g_sessionlist4Ctrl);
        g_sessionlist4Ctrl = NULL;
    }
    if (g_sessionlist4Perf != NULL) {
        free(g_sessionlist4Perf);
        g_sessionlist4Perf = NULL;
    }
    if (g_sessionlist4Pass != NULL) {
        free(g_sessionlist4Pass);
        g_sessionlist4Pass = NULL;
    }
    if (g_sessionlist4Proxy != NULL) {
        free(g_sessionlist4Proxy);
        g_sessionlist4Proxy = NULL;
    }
    if (g_sessionlist4File != NULL) {
        free(g_sessionlist4File);
        g_sessionlist4File = NULL;
    }
    if (g_nodeStateCallback != NULL) {
        free(g_nodeStateCallback);
        g_nodeStateCallback = NULL;
    }
    if (g_sessionlist4Stream != NULL) {
        free(g_sessionlist4Stream);
        g_sessionlist4Stream = NULL;
    }
}

/**
 * @tc.number : SUB_Softbus_Trans_SelfNet_0100
 * @tc.name     : 创建SS，等待opensession和消息传输
 * @tc.desc       : 测试自组网下传输功能，模拟服务端
 * @tc.type       : FUNC
 * @tc.size        : MediumTest
 */
HWTEST_F(dsoftbusTest, test_create_ss, TestSize.Level3)
{
    int dataRet = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA, g_sessionlist4Data);
    LOG("CreateSs[data] ret:%d", dataRet);
    int ctrlRet = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_CTL, g_sessionlist4Ctrl);
    LOG("CreateSs[ctrl] ret:%d", ctrlRet);
    int perfRet = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_PERF, g_sessionlist4Perf);
    LOG("CreateSs[perf] ret:%d", perfRet);
    int passRet = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_PASS, g_sessionlist4Pass);
    LOG("CreateSs[pass] ret:%d", passRet);
    int proxyRet = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_PROXY, g_sessionlist4Proxy);
    LOG("CreateSs[Proxy] ret:%d", proxyRet);
    int fileRet = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE, g_sessionlist4File);
    LOG("CreateSs[file] ret:%d", fileRet);
    int streamRet = CreateSessionServer(DEF_PKG_NAME, SESSION_NAME_STREAM, g_sessionlist4Stream);
    LOG("CreateSs[stream] ret:%d", streamRet);

    int runtime = 0;
    if (dataRet == SOFTBUS_OK && ctrlRet == SOFTBUS_OK && perfRet == SOFTBUS_OK
    && passRet == SOFTBUS_OK && fileRet == SOFTBUS_OK && streamRet == SOFTBUS_OK && proxyRet == SOFTBUS_OK) {
        LOG("CreateSs ok");
    }

    int ret = SetFileSendListener(DEF_PKG_NAME, SESSION_NAME_FILE, GetSendFileListener());
    if (ret != SOFTBUS_OK) {
        LOG("##set send listener fail:%d", ret);
    }
    ret = SetFileReceiveListener(DEF_PKG_NAME, SESSION_NAME_FILE, GetRecvFileListener(), RECV_FILE_PATH);
    if (ret != SOFTBUS_OK) {
        LOG("##set recv listener fail:%d", ret);
    }

    while (1) {
        sleep(1);
        runtime += 1;
        if (runtime % 60 == 0) {
            LOG("### test run:%d s", runtime);
        }
    }

    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_DATA);
    LOG("RemoveSs[data] ret:%d", ret);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_CTL);
    LOG("RemoveSs[ctrl] ret:%d", ret);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_PERF);
    LOG("RemoveSs[perf] ret:%d", ret);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_PASS);
    LOG("RemoveSs[pass] ret:%d", ret);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_PROXY);
    LOG("RemoveSs[Proxy] ret:%d", ret);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE);
    LOG("RemoveSs[file] ret:%d", ret);
    ret = RemoveSessionServer(DEF_PKG_NAME, SESSION_NAME_FILE);
    LOG("RemoveSs[stram] ret:%d", ret);
}
