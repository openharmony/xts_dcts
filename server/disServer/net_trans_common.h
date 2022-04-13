/*
 * Copyright (C) 2021 Huawei Device Co., Ltd.
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

#ifndef NET_TRANS_COMMON_H
#define NET_TRANS_COMMON_H

#include <cerrno>
#include <cstdarg>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <pthread.h>
#include <securec.h>
#include <sys/time.h>
#include <unistd.h>

#include "common_list.h"
#include "discovery_service.h"
#include "session.h"
#include "shm_utils.h"
#include "softbus_bus_center.h"
#include "softbus_def.h"
#include "softbus_errcode.h"
#include "softbus_utils.h"

#ifdef __cplusplus
extern "C" {
#endif

const int MAX_DATA_LENGTH = 1024;
const char DEF_GROUP_ID[50] = "DEF_GROUP_ID";
const char DEF_PKG_NAME[50] = "com.communication.demo";
const char SESSION_NAME_DATA[50] = "com.communication.demo.data";
const char SHM_DATA_RES[50] = "9999";

const int WAIT_DEF_VALUE = -1;
const int WAIT_SUCCESS_VALUE = 1;
const int WAIT_FAIL_VALUE = 0;
const int SESSION_ID_MIN = 1;
const int MAX_SESSION_NUM = 16;
const int ONE_SECOND = 1;
const int BOOL_TRUE = 1;
const int BOOL_FALSE = 0;

const int STR_PREFIX_FOUR = 4;
const int SLEEP_SECOND_ONE = 1;
const int SLEEP_SECOND_TEO = 2;
const int SLEEP_SECOND_TEN = 10;
const int SLEEP_SECOND_NINEHUNDRED = 900;
const int WHILE_I_ONEHUNDRED = 100;

const int CODE_PREFIX_FOUR = 4;
typedef enum {
    SESSION_4DATA = 1,
    SESSION_4CTL,
} WaitSessionType;

typedef enum {
    DATA_TYPE_MSG = 1,
    DATA_TYPE_BYTE,
} DataType;

typedef enum {
    STATE_ONLINE = 1,
    STATE_OFFLINE,
} WaitNodeStateType;

typedef enum {
    CONC_CLOSE_SESSION = 1,
} ConcurrentType;

typedef enum {
    CTRL_CODE_SOFTBUS_TYPE = 1000,
    CTRL_CODE_DATAMGR_TYPE = 2000,
    CTRL_CODE_DM_TYPE = 3000,
    CTRL_CODE_FILEMGR_TYPE = 4000,
    CTRL_CODE_DP_TYPE = 5000,
    CTRL_CODE_SEC_TYPE = 6000,
    CTRL_CODE_MEDIA_TYPE = 7000,
    CTRL_CODE_RESULT_TYPE = 9999,
} CtrlCodeType;

namespace NetTransCommon {

int Wait(int timeout);
int Wait4Session(int timeout, WaitSessionType type);
int WaitNodeCount(int timeout, WaitNodeStateType state, int expectCount);
static void OnDefDeviceFound(const DeviceInfo* device);
int CheckRemoteDeviceIsNull(int isSetNetId);
static void OnDefDiscoverFail(int subscribeId, DiscoveryFailReason failReason);

static void OnDefDiscoverSuccess(int subscribeId);

static void OnDefNodeOnline(NodeBasicInfo* info);

static void OnDefNodeOffline(NodeBasicInfo* info);

static void OnDefNodeBasicInfoChanged(NodeBasicInfoType type, NodeBasicInfo* info);

static void OnLeaveNetCallBack(const char* networkId, int32_t ret);
static int DataSessionOpened(int sessionId, int result);
void ResetWaitFlag(void);

void ResetWaitFlag4Data(void);

void ResetWaitCount4Offline(void);

void ResetWaitCount4Online(void);
int GetCurrentSessionId4Data(void);
int JoinNetwork(void);

int DiscoverAndJoinNetwork(void);

int LeaveNetWork(void);

static void DataSessionClosed(int sessionId);

static void DataBytesReceived(int sessionId, const void* data, unsigned int dataLen);

static void DataMessageReceived(int sessionId, const void* data, unsigned int dataLen);

int RegisterDeviceStateDefCallback(void);

int UnRegisterDeviceStateDefCallback(void);

int CreateSsAndOpenSession4Data(void);

int OpenSession4Data(void);

int SendDataMsgToRemote(CtrlCodeType code, char* data);

int CloseSessionAndRemoveSs4Data(void);

int IncrementSubId(void);

void OnDataMessageReceived(int sessionId, const void* data, unsigned int dataLen);

void* SendMsgTask(void* param);

void* DataOperateTask(void* param);

char* GetNetworkId(void);

ISessionListener* GetSessionListenser4Data(void);

void SetCurrentSessionId4Data(int sessionId);

ConnectionAddr* GetConnectAddr(void);

void init(void);

void destroy(void);
}; // namespace NetTransCommon

#ifdef __cplusplus
}
#endif
#endif
