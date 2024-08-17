/*
 * Copyright (c) 2024  Huawei Device Co., Ltd.
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

#include "socket_common.h"

static int32_t g_currentSocket4Data = -1;
static int32_t g_waitFlag = WAIT_DEF_VALUE;
static int32_t g_waitFlag4Shutdown = WAIT_DEF_VALUE;
static int32_t g_waitFlag4Byte = WAIT_DEF_VALUE;
static int32_t g_waitFlag4Message = WAIT_DEF_VALUE;
static int32_t g_waitFlagStream = WAIT_DEF_VALUE;
static int32_t g_waitFlag4File = WAIT_DEF_VALUE;
static int32_t g_nodeOnlineCount = 0;
static int32_t g_nodeOfflineCount = 0;
static ISocketListener* g_socketlistenerdata = NULL;
static char g_networkId[NETWORK_ID_BUF_LEN] = { 0 };
static INodeStateCb g_defNodeStateCallback;
static char g_fillContentChar = 'd';
static unsigned int g_expectDataSize = 0;
static char* g_expectDataContent = NULL;

/*reset count*/
void ResetwaitCount4Online(void)
{
    g_nodeOnlineCount = 0;
}

/*common method*/
void ResetwaitCount4Offline(void)
{
    g_nodeOfflineCount = 0;
}

void Sleepn(int n)
{
    for(int i = 0; i < n; i++) {
        sleep(1);
        LOG("sleeped %d", i);
    }
}

char* GetSoftbusPid(void)
{
    FILE* file = NULL;
    int buffSize = 20;
    char* buffer = (char*)malloc(buffSize);
    if (buffer == NULL) {
        LOG("malloc fail");
        return NULL;
    }

    file = popen(CMD_PIDOF_SOFTBUS, "r");
    if (file == NULL) {
        LOG("call popen fail");
        free(buffer);
        return NULL;
    }
    (void)fgets(buffer, buffSize, file);
    LOG("##################Softbus PID:%s", buffer);
    pclose(file);

    return buffer;
}

static void OnDefNodeOnline(NodeBasicInfo* info)
{
    if (info == NULL) {
        LOG("[cb]Online: info is null");
        return;
    }
    (void)strncpy_s(g_networkId, NETWORK_ID_BUF_LEN, info->networkId, NETWORK_ID_BUF_LEN);
    LOG("[cb]Online id:%s, name:%s, type id:%u", info->networkId, info->deviceName, info->deviceTypeId);
    g_nodeOnlineCount++;
}

static void OnDefNodeOffline(NodeBasicInfo* info)
{
    if (info == NULL) {
        LOG("[cb]Offline: info is null");
        return;
    }
    LOG("[cb]Offline id:%s, name:%s, type id:%u", info->networkId, info->deviceName, info->deviceTypeId);
    g_nodeOfflineCount++;
}

static void OnDefNodeBasicInfoChanged(NodeBasicInfoType type, NodeBasicInfo* info)
{
    if (info == NULL) {
        LOG("[cb]InfoChanged: info is null, type[%d]", type);
        return;
    }
    LOG("[cb]InfoChanged id: %s,name: %s", info->networkId, info->deviceName);
}

static void onDefNodeStatusChanged(NodeStatusType type, NodeStatus *status)
{
    if (status == NULL) {
        LOG("[cb]StatusChanged: info is null, type[%d]", type);
        return;
    }
    LOG("[cb]StatusChanged id: %s,status: %d", status->basicInfo.networkId, status->authStatus);
}

int RegisterDeviceStateDefCallback(void)
{
    return RegNodeDeviceStateCb(DEF_PKG_NAME, &g_defNodeStateCallback);
}

int UnRegisterDeviceStateDefCallback(void)
{
    return UnregNodeDeviceStateCb(&g_defNodeStateCallback);
}

int WaitNodeCount(int timeout, WaitNodeStateType state, int expectCount)
{
    LOG("Wait4Node,timeout:%d, type:%d, exp count:%d", timeout, state, expectCount);
    int hitFlag = -1;
    while (timeout > 0) {
        sleep(ONE_SECOND);
        switch (state) {
            case STATE_ONLINE:
                if (g_nodeOnlineCount == expectCount) {
                    LOG("Wait4Node[online] succ,timeout:%d", timeout);
                    hitFlag = 1;
                }
                break;
            case STATE_OFFLINE:
                if (g_nodeOfflineCount == expectCount) {
                    LOG("Wait4Node[offline] succ,timeout:%d", timeout);
                    hitFlag = 1;
                }
                break;
            default:
                LOG("Wait4Node state error");
                hitFlag = 1;
                break;
        }
        if (hitFlag != -1) {
            break;
        }
        timeout--;
    }
    switch (state) {
        case STATE_ONLINE:
            if (g_nodeOnlineCount != expectCount) {
                LOG("Wait4Node[online] fail[exp:%d, real:%d]", expectCount, g_nodeOnlineCount);
                return SOFTBUS_ERR;
            }
            break;
        case STATE_OFFLINE:
            if (g_nodeOfflineCount != expectCount) {
                LOG("Wait4Node[offline] fail[exp:%d, real:%d]", expectCount, g_nodeOfflineCount);
                return SOFTBUS_ERR;
            }
            break;
        default:
            return SOFTBUS_ERR;
    }
    return SOFTBUS_OK;
}

//socket callback
static void OnBindData(int32_t socket, PeerSocketInfo info)
{
    int successcount = 0;
    LOG("[cb][Ctrl]OnBind success  {socket:%d, name:%s, deviceId:%s, pkgName:%s, dataType:%d}", socket,
       info.name, info.networkId, info.pkgName, info.dataType);
    if (strcmp(info.networkId, g_networkId) != 0)
    {
        LOG("PeerSocket Info peer deviceId and check remote networkId are diff");
        successcount++;
    }
    if (strcmp(info.name, SOCKET_NAME_BYTE) != 0)
    {
        LOG("PeerSocket Info peer name and local name are diff");
        successcount++;
    }
    if (strcmp(info.pkgName, DEF_PKG_NAME) != 0)
    {
        LOG("PeerSocket Info peer pkgName and local pkgName are diff");
        successcount++;
    }
    if(successcount == 3)
    {
       g_waitFlag = WAIT_SUCCESS_VALUE;
    }else{
       g_waitFlag = WAIT_FAIL_VALUE;
    }
}

static void OnShutdownData(int32_t socket, ShutdownReason reason)
{
    LOG("[cb][Ctrl]OnShutdownData success  {socket:%d, reason:%u}", socket, reason);
    if (reason == SHUTDOWN_REASON_PEER || reason == SHUTDOWN_REASON_LOCAL)
    {
        g_waitFlag4Shutdown = WAIT_SUCCESS_VALUE;
    }else{
        g_waitFlag4Shutdown = WAIT_FAIL_VALUE;
    }
}

static int CheckReceiveSocketData(int socket, const void *data, unsigned int dataLen)
{
    if (socket == g_currentSocket4Data && dataLen == g_expectDataSize)
    {
        LOG("[check]socket/size ok socket:%d, size:%d", socket, dataLen);
    }else
    {
        LOG("[check]socket/size failed socket :%d, expectsocket:%d, size:%d, expectsize:%d",
         socket, g_currentSocket4Data, dataLen, g_expectDataSize);
         return SOFTBUS_ERR;
    }
    if (g_expectDataContent == NULL)
    {
        LOG("[check]socket  Datacunt is null !!!");
        return SOFTBUS_ERR;
    }else
    {
        int cmpRst = strncmp(g_expectDataContent, (char*)data, dataLen);
        if (cmpRst == 0) {
           LOG("[check] cmp content ok");
           return SOFTBUS_OK;
        } else {
           LOG("[check] cmp content fail[exp:%s,real:%s]", g_expectDataContent, (char*)data);
           return SOFTBUS_ERR;
        }
    }
}

static void OnByteData(int32_t socket, const void *data, uint32_t dataLen)
{
    LOG("[cb] OnByteData socket:%d", socket);
    int ret = CheckReceiveSocketData(socket, data, dataLen);
    if (ret == SOFTBUS_OK)
    {
        g_waitFlag4Byte = WAIT_SUCCESS_VALUE;
        LOG("[cb] OnByteData data recv success");
    }else
    {
        g_waitFlag4Byte = WAIT_FAIL_VALUE;
        LOG("[cb] OnByteData data recv failed");
    }
}

static void OnMessageData(int32_t socket, const void *data, uint32_t dataLen)
{
    LOG("[cb] OnMessageData socket:%d", socket);
    int ret = CheckReceiveSocketData(socket, data, dataLen);
    if (ret == SOFTBUS_OK)
    {
        g_waitFlag4Message = WAIT_SUCCESS_VALUE;
        LOG("[cb] OnMessageData data recv success");
    }else
    {
        g_waitFlag4Message = WAIT_FAIL_VALUE;
        LOG("[cb] OnMessageData data recv failed");
    }
}

static void OnStreamData(int32_t socket, const StreamData *data, const StreamData *ext, const StreamFrameInfo *param)
{
    if (socket < 0) {
        LOG("[cb][data]OnStream invalid socket id[%d]", socket);
        return;
    }
    if (data == NULL) {
        LOG("[cb][data]OnStream socket id[%d], data is NULL", socket);
        return;
    }
    if (ext == NULL) {
        LOG("[cb][data]OnStream socket id[%d], ext is NULL", socket);
        return;
    }
    if (param == NULL) {
        LOG("[cb][data]OnStream socket id[%d], param is NULL", socket);
        return;
    }
    LOG("[cb][data]OnStream Success socket:%d,", socket);
    LOG("[cb][data]OnStream Success buf:%s,", (data->buf != NULL ? data->buf : "null"));
    LOG("[cb][data]OnStream Success buflen:%d", data->bufLen);
    LOG("[cb][data]OnStream Success buf:%s,", (ext->buf != NULL ? ext->buf : "null"));
    g_waitFlagStream = WAIT_SUCCESS_VALUE;
}

static const char *ClientUpdataRecvFilePath() {
    return "/data/";
}

static void OnFileData(int32_t socket, FileEvent *event)
{
    if (socket < 0) {
        LOG("[cb][data]OnFile invalid socket id[%d]", socket);
        return;
    }
    if (event == NULL) {
        LOG("[cb][data]OnFile socket id[%d], event is nullptr", socket);
        return;
    }
    if (event->type == FILE_EVENT_RECV_UPDATE_PATH) {
        LOG("[cb][data]OnFile event type:%d,", event->type);
        event->UpdateRecvPath = ClientUpdataRecvFilePath;
        return;
    }
    LOG("[cb][data]OnFile, event type:%d, fileCnt:%u", event->type, event->fileCnt);
    for (uint32_t i = 0; i < event->fileCnt; i++) {
        LOG("[cb][data] %s", (event->files[i] == NULL ? "null" : event->files[i]));
    }
    if (event->type == FILE_EVENT_SEND_FINISH) {
        LOG("[cb][data]OnFile recv finished");
        g_waitFlag4File = WAIT_SUCCESS_VALUE;
        return;
    }
    if (event->type == FILE_EVENT_SEND_PROCESS) {
        LOG("[cb][data]OnFile recv process");
        return;
    }
    if (event->type == FILE_EVENT_SEND_ERROR) {
        LOG("[cb][data]OnFile recv error!!");
        g_waitFlag4File = WAIT_FAIL_VALUE;
        return;
    }
}

static void OnQosData(int32_t socket, QoSEvent eventId, const QosTV *qos, uint32_t qosCunt)
{
    LOG("[cb][data] OnQos {socket:%d, event:%d}", socket, eventId);
}

int Wait4Socket(int timeout, WaitSocketType type)
{
    int hitFlag = -1;
    int t = timeout;
    while (t > 0) {
        sleep(1);
        switch (type) {
            case SOCKET_BYTES:
                if (g_waitFlag4Byte != WAIT_DEF_VALUE) {
                    LOG("Wait4socket[Byte] succ, flag:%d", g_waitFlag4Byte);
                    hitFlag = 1;
                }
                break;
            case SOCKET_MSG:
                if (g_waitFlag4Message != WAIT_DEF_VALUE) {
                    LOG("Wait4socket[Message] succ,flag:%d", g_waitFlag4Message);
                    hitFlag = 1;
                }
                break;
            case SOCKET_FILE:
                if (g_waitFlag4File != WAIT_DEF_VALUE) {
                    LOG("Wait4socket[File] succ,flag:%d", g_waitFlag4File);
                    hitFlag = 1;
                }
                break;
            case SOCKET_STREAM:
                if (g_waitFlagStream != WAIT_DEF_VALUE) {
                    LOG("Wait4socket[Stream] succ,flag:%d", g_waitFlagStream);
                    hitFlag = 1;
                }
                break;
            case SOCKET_SHUTDOWN:
                if (g_waitFlag4Shutdown != WAIT_DEF_VALUE) {
                    LOG("Wait4socket[SHUTDOWN] succ,flag:%d", g_waitFlag4Shutdown);
                    hitFlag = 1;
                }
                break;
            default:
                LOG("Wait4socket type error");
                hitFlag = 1;
                break;
        }
        if (hitFlag != -1) {
            break;
        }
        t--;
    }
    switch (type) {
        case SOCKET_BYTES:
            if (g_waitFlag4Byte != WAIT_SUCCESS_VALUE) {
                LOG("Wait4socket[Byte] fail[exp:%d, real:%d]", WAIT_SUCCESS_VALUE, g_waitFlag4Byte);
                return SOFTBUS_ERR;
            }
            break;
        case SOCKET_MSG:
            if (g_waitFlag4Message != WAIT_SUCCESS_VALUE) {
                LOG("Wait4socket[Message] fail[exp:%d, real:%d]", WAIT_SUCCESS_VALUE, g_waitFlag4Message);
                return SOFTBUS_ERR;
            }
            break;
        case SOCKET_FILE:
            if (g_waitFlag4File != WAIT_SUCCESS_VALUE) {
                LOG("Wait4socket[File] fail[exp:%d, real:%d]", WAIT_SUCCESS_VALUE, g_waitFlag4File);
                return SOFTBUS_ERR;
            }
            break;
         case SOCKET_STREAM:
            if (g_waitFlagStream != WAIT_SUCCESS_VALUE) {
                LOG("Wait4socket[Stream] fail[exp:%d, real:%d]", WAIT_SUCCESS_VALUE, g_waitFlagStream);
                return SOFTBUS_ERR;
            }
            break;
         case SOCKET_SHUTDOWN:
            if (g_waitFlag4Shutdown != WAIT_SUCCESS_VALUE) {
                LOG("Wait4socket[SHUTDOWN] fail[exp:%d, real:%d]", WAIT_SUCCESS_VALUE, g_waitFlag4Shutdown);
                return SOFTBUS_ERR;
            }
            break;
        default:
            return SOFTBUS_ERR;
    }
    return SOFTBUS_OK;
}

int SendSocket4Data(DataType type, int size)
{
    int ret;
    LOG("###SendSocket4Data  g_currentSocket4Data = %d ", g_currentSocket4Data );
    if (size > 0) {
        g_expectDataContent = (char*)calloc(1, size);
        if (g_expectDataContent == NULL) {
            LOG("[send data]calloc fail");
            return SOFTBUS_ERR;
        }
        (void)memset_s(g_expectDataContent, size, g_fillContentChar, size);
    } else {
        LOG("[send data]invalid param[size>=1]");
        return SOFTBUS_ERR;
    }

    g_expectDataSize = size;
    
    if (type == DATA_TYPE_MSG) {
        ret = SendMessage(g_currentSocket4Data, g_expectDataContent, size);
        if (ret != SOFTBUS_OK) {
            LOG("[send data]call SendX fail, ret:%d", ret);
            free(g_expectDataContent);
            return SOFTBUS_ERR;
        }
    } else if (type == DATA_TYPE_BYTE) {
        ResetWaitFlag4Byte();
        ret = SendBytes(g_currentSocket4Data, g_expectDataContent, size);
        int timeout;
        if (size < SIZE_1K * SIZE_1K) {
            timeout = 30;
        }else if (size >= SIZE_1K * SIZE_1K && size < 2 * SIZE_1K * SIZE_1K)
        {
            timeout = 60;
        }else
        {
            timeout = 80;
        }
        ret = Wait4Socket(timeout, SOCKET_BYTES);
        return ret;
    } else {
        LOG("[send data]invalid param[DataType]");
        free(g_expectDataContent);
        return SOFTBUS_ERR;
    }
   
    LOG("[send data]call SendX success");
    free(g_expectDataContent);
    g_expectDataContent = NULL;
    return ret;
}

// set/get function
void ResetWaitFlag(void)
{
    g_waitFlag = WAIT_DEF_VALUE;
}

void ResetWaitFlag4Shutdown(void)
{
    g_waitFlag4Shutdown = WAIT_DEF_VALUE;
}

void ResetWaitFlag4Byte(void)
{
    g_waitFlag4Byte = WAIT_DEF_VALUE;
}

void ResetWaitFlag4Message(void)
{
    g_waitFlag4Message = WAIT_DEF_VALUE;
}

void ResetWaitFlag4Stream(void)
{
    g_waitFlagStream = WAIT_DEF_VALUE;
}

void ResetWaitFlag4File(void)
{
    g_waitFlag4File = WAIT_DEF_VALUE;
}

char* GetNetworkId(void)
{
    return g_networkId;
}

// To one device only
int CheckRemoteDeviceIsNull(int isSetNetId)
{
    int nodeNum = 0;
    NodeBasicInfo* nodeInfo = NULL;
    int ret = GetAllNodeDeviceInfo(DEF_PKG_NAME, &nodeInfo, &nodeNum);
    LOG("[check]get node number is:%d, ret:%d", nodeNum, ret);
    if (nodeInfo != NULL && nodeNum > 0) {
        LOG("[check]get netid is:%s", nodeInfo->networkId);
        if (isSetNetId == BOOL_TRUE) {
            (void)strncpy_s(g_networkId, NETWORK_ID_BUF_LEN, nodeInfo->networkId, NETWORK_ID_BUF_LEN);
        }
        FreeNodeInfo(nodeInfo);
        return SOFTBUS_OK;
    } else {
        LOG("[check]get nodeInfo is null");
        return SOFTBUS_ERR;
    }
}

ISocketListener* GetSocketListnerData(void)
{
    return g_socketlistenerdata;
}

void SetCurrentSocket4Data(int socket)
{
    g_currentSocket4Data = socket;
}

int GetCurrentSocket4Data(void)
{
    return g_currentSocket4Data;
}

void TestSetUp(void)
{
    g_defNodeStateCallback.events = EVENT_NODE_STATE_MASK;
    g_defNodeStateCallback.onNodeOnline = OnDefNodeOnline;
    g_defNodeStateCallback.onNodeOffline = OnDefNodeOffline;
    g_defNodeStateCallback.onNodeBasicInfoChanged = OnDefNodeBasicInfoChanged;
    g_defNodeStateCallback.onNodeStatusChanged = onDefNodeStatusChanged;
    if (g_socketlistenerdata == NULL) {
        g_socketlistenerdata = (ISocketListener*)calloc(1, sizeof(ISocketListener));
        g_socketlistenerdata->OnBind = OnBindData;
        g_socketlistenerdata->OnShutdown = OnShutdownData;
        g_socketlistenerdata->OnBytes = OnByteData;
        g_socketlistenerdata->OnMessage = OnMessageData;
        g_socketlistenerdata->OnStream = OnStreamData;
        g_socketlistenerdata->OnFile = OnFileData;
        g_socketlistenerdata->OnQos = OnQosData;
    };
}

void TestTearDown(void)
{
   
    if (g_socketlistenerdata != NULL) {
        free(g_socketlistenerdata);
        g_socketlistenerdata = NULL;
    }
}

void AddPermission(void)
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
        .processName = "dsoftbus_test_service",
        .aplStr = "system_core",
    };
    tokenId = GetAccessTokenId(&infoTnstance);
    SetSelfTokenID(tokenId);
}