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

enum class WaitSessionType : int {
    SESSION_4DATA = 1,
    SESSION_4CTL,
};

enum class DataType : int {
    DATA_TYPE_MSG = 1,
    DATA_TYPE_BYTE,
};

enum class WaitNodeStateType : int {
    STATE_ONLINE = 1,
    STATE_OFFLINE,
};

enum class ConcurrentType {
    CONC_CLOSE_SESSION = 1,
};

enum class CtrlCodeType : int {
    CTRL_CODE_SOFTBUS_TYPE = 1000,
    CTRL_CODE_DATAMGR_TYPE = 2000,
    CTRL_CODE_DM_TYPE = 3000,
    CTRL_CODE_FILEMGR_TYPE = 4000,
    CTRL_CODE_DP_TYPE = 5000,
    CTRL_CODE_SEC_TYPE = 6000,
    CTRL_CODE_MEDIA_TYPE = 7000,
    CTRL_CODE_RESULT_TYPE = 9999,
};

namespace NetTrans {
int Wait4Session(int timeout, WaitSessionType type);

int CheckRemoteDeviceIsNull(int isSetNetId);

void OnDefNodeOnline(NodeBasicInfo* info);

void OnDefNodeOffline(NodeBasicInfo* info);

void OnDefNodeBasicInfoChanged(NodeBasicInfoType type, NodeBasicInfo* info);

int DataSessionOpened(int sessionId, int result);

void ResetWaitFlag4Data(void);

void ResetWaitCount4Offline(void);

void ResetWaitCount4Online(void);
int GetCurrentSessionId4Data(void);

void DataSessionClosed(int sessionId);

void DataBytesReceived(int sessionId, const void* data, unsigned int dataLen);

void DataMessageReceived(int sessionId, const void* data, unsigned int dataLen);

int RegisterDeviceStateDefCallback(void);

int UnRegisterDeviceStateDefCallback(void);

int CreateSsAndOpenSession4Data();

int OpenSession4Data(void);

int SendDataMsgToRemote(CtrlCodeType code, char* data);

int CloseSessionAndRemoveSs4Data(void);

int IncrementSubId(void);

void OnDataMessageReceived(int sessionId, const char* data, unsigned int dataLen);

void* SendMsgTask(void* param);

void* DataOperateTask(void* param);

ISessionListener* GetSessionListenser4Data(void);

void SetCurrentSessionId4Data(int sessionId);

ConnectionAddr* GetConnectAddr(void);

void init(void);

void destroy(void);
}; // namespace NetTrans

#ifdef __cplusplus
}
#endif
#endif
