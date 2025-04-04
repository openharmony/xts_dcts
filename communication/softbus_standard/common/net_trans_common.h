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

#ifndef NET_TRANS_COMMON_H
#define NET_TRANS_COMMON_H

#include <pthread.h>
#include <securec.h>
#include <sys/time.h>
#include <unistd.h>
#include "common_list.h"
#include "session.h"
#include "softbus_bus_center.h"
#include "softbus_common.h"
#include "softbus_def.h"
#include "softbus_error_code.h"
#include "softbus_utils.h"
#include "nativetoken_kit.h"
#include "token_setproc.h"

#ifdef __cplusplus
extern "C" {
#endif

#define DEF_GROUP_ID "DEF_GROUP_ID"
#define DEF_SESSION_KEY "DEF_SESSION_KEY"
#define DEF_PKG_NAME "com.communication.demo1"
#define PKG_NAME_TWO "com.communication.demo2"
#define PKG_NAME_THREE "com.communication.demo3"
#define PKG_NAME_FOUR "com.communication.demo4"
#define SESSIONNAME_MAX "com.communication.demo.max.len.12345678901234567\
    0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789\
    012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678"
#define SESSIONNAME_MAX_OUT "com.communication.demo.max.len.12345678901234567\
    0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789\
    0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789"
#define PKGNAME_MAX "com.communication.demo.max.len.123456789012345678901234567890123"
#define PKGNAME_MAX_OUT "com.communication.demo.max.len.1234567890123456789012345678901234"

#define SESSION_NAME_DATA "com.communication.demo1.data"
#define SESSION_NAME_CTL "com.communication.demo1.control"
#define SESSION_NAME_PASS "com.communication.demo1.passive"
#define SESSION_NAME_FAIL "com.communication.demo1.fail"
#define SESSION_NAME_PERF "com.communication.demo1.perf"
#define SESSION_NAME_PROXY "com.communication.demo1.proxy"
#define SESSION_NAME_FILE "com.communication.demo1.file"
#define SESSION_NAME_STREAM "com.communication.demo1.stream"
#define DSOFT_PKG_NAME "com.plrdtest.dsoftbus"
#define SESSION_NAME_DSOFT_DATA "com.plrdtest.dsoftbus.data"
#define RECV_FILE_PATH "/data/"

#define CTRL_MSG_CLOSE_WIFI_THREE_SEC "close wifi 3sec"
#define CTRL_MSG_CLOSE_WIFI_TEN_MIN "close wifi 10min"
#define CTRL_MSG_CLOSE_WIFI_FIVE_MIN "close wifi 5min"
#define CTRL_MSG_CLOSE_WIFI_TEN_SEC "close wifi 10sec"
#define CTRL_MSG_CHANGE_WIFI_TEN_SEC "change wifi 10sec"
#define CTRL_MSG_CHANGE_WIFI_SIXTY_SEC "change wifi 60sec"
#define CTRL_MSG_CLOSE_WIFI_LOOP20 "close wifi loop 20"
#define CTRL_MSG_CHANGE_WIFI_LOOP20 "change wifi loop 20"
#define CTRL_MSG_CLOSE_WIFI_LOOP100 "close wifi loop 100"
#define CTRL_MSG_CHANGE_WIFI_LOOP100 "change wifi loop 100"

#define CTRL_MSG_OPEN_SESSION "open session"
#define CTRL_MSG_OPEN_SESSION_MSG "open session msg"
#define CTRL_MSG_OPEN_SESSION_NOT_EXIST "open session not exist"
#define CTRL_MSG_OPEN_SESSION_FAIL "open session fail"
#define CTRL_MSG_CLOSE_SESSION "close session"

#define CTRL_MSG_CLOSE_BR "close br"
#define CTRL_MSG_CLOSE_OPEN_BR "close-open br"
#define CTRL_MSG_CLOSE_AIR "close air"
#define CTRL_MSG_CLOSE_OPEN_AIR "close-open air"
#define CTRL_MSG_SEND_BIG_DATA "send big data"

#define WAIT_DEF_VALUE (-1)
#define WAIT_SUCCESS_VALUE 1
#define WAIT_FAIL_VALUE 0
#define SESSION_ID_MIN 1
#define MAX_SESSION_NUM 20
#define BOOL_TRUE 1
#define BOOL_FALSE 0
#define OPEN_SESSION_TIMEOUT 19
#define MULTI_REMOTE_DEV_COUNT 3
#define DEF_REMOTE_DEV_COUNT 1
#define SIZE_1K 1024

#define CMD_DOWN_ETH "ifconfig eth0 down"
#define CMD_PIDOF_SOFTBUS "pidof softbus_server"

#define MAX_SESSION_SERVER_NUM_CLIENT 8
#define MAX_SESSION_SERVER_NUM_SERVER 32
#define TRANS_BYTES_LENGTH_MAX (4 * 1024 * 1024)
#define TRANS_MESSAGE_LENGTH_MAX (4 * 1024)
#define TRANS_PROXY_BYTES_LENGTH_MAX (4 * 1024 * 1024)
#define TRANS_PROXY_MESSAGE_LENGTH_MAX (4 * 1024)
#define DEF_SEND_DATA_SID_COUNT 4
#define GROUP_ID_LEN 4

#define CASE_0 0
#define CASE_1 1
#define CASE_2 2
#define CASE_3 3
#define CASE_4 4
#define CASE_5 5
#define CASE_6 6
#define CASE_7 7
#define CASE_8 8
#define CASE_9 9
#define CASE_10 10

typedef enum {
    SESSION_4DATA = 1,
    SESSION_4CTL,
    SESSION_4PROXY,
    SESSION_4STREAM,
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
    CONC_LEAVE_NET,
    CONC_DIS_NET_RECOVERY,
    CONC_DIS_NET_NOT_RECOVERY,
    CONC_DOWN_NET,
    CONC_SEND_DATA_ONLY,
    CONC_CLOSE_SESSION_REMOTE,
} ConcurrentType;

typedef enum {
    CTRL_CODE_CLOSE_WIFI_TEN_SEC = 1,
    CTRL_CODE_CLOSE_WIFI_TEN_MIN,
    CTRL_CODE_CLOSE_WIFI_FIVE_MIN,
    CTRL_CODE_CLOSE_WIFI_THREE_SEC,
    CTRL_CODE_CHANGE_WIFI_TEN_SEC,
    CTRL_CODE_CHANGE_WIFI_SIXTY_SEC,
    CTRL_CODE_CHANGE_WIFI_LOOP20,
    CTRL_CODE_CLOSE_WIFI_LOOP20,
    CTRL_CODE_CHANGE_WIFI_LOOP100,
    CTRL_CODE_CLOSE_WIFI_LOOP100,
    CTRL_CODE_OPEN_SESSION,
    CTRL_CODE_OPEN_SESSION_MSG,
    CTRL_CODE_OPEN_SESSION_FAIL,
    CTRL_CODE_OPEN_SESSION_NOT_EXIST,
    CTRL_CODE_CLOSE_SESSION,
    CTRL_CODE_CLOSE_BR,
    CTRL_CODE_CLOSE_OPEN_BR,
    CTRL_CODE_CLOSE_AIR,
    CTRL_CODE_CLOSE_OPEN_AIR,
    CTRL_CODE_SEND_BIG_DATA,
} CtrlCodeType;

#define LOG(format, ...)                                                           \
    do {                                                                           \
        time_t timeSec;                                                            \
        time(&timeSec);                                                            \
        struct tm tmRst;                                                           \
        localtime_r(&timeSec, &tmRst);                                             \
        char strTime[10];                                                          \
        strftime(strTime, sizeof(strTime), "%H:%M:%S", &tmRst);                    \
        fprintf(stdout, "[Test-softbus] %s " format "\n", strTime, ##__VA_ARGS__); \
    } while (0)

char* GetSoftbusPid(void);
char* GetNetworkId(void);
uint64_t GetCurrentTimeOfMs(void);
int Wait(int timeout);
int Wait4Session(int timeout, WaitSessionType type);
int WaitNodeCount(int timeout, WaitNodeStateType state, int expectCount);

void sleepn(int n);
void TestSetUp(void);
void TestTearDown(void);

int RegisterDeviceStateDefCallback(void);
int UnRegisterDeviceStateDefCallback(void);
int CheckRemoteDeviceIsNull(int isSetNetId);

void ResetWaitFlag(void);
void ResetWaitFlag4Data(void);
void ResetWaitFlag4Ctl(void);
void ResetWaitFlag4Proxy(void);
void ResetWaitFlag4Stream(void);
void ResetwaitCount4Online(void);
void ResetwaitCount4Offline(void);

int SendData4Data(DataType type, int size);
int SendData4Message(DataType type, int size);

int CreateSsAndOpenSession4Data(void);
int CreateSsAndOpenSession4Ctl(void);
int CreateSsAndOpenSession4Proxy(void);
int OpenSessionBatch4Data(char groupId[][GROUP_ID_LEN], int* sessionId, int count);
int OpenSessionBatch4Ctl(char groupId[][GROUP_ID_LEN], int* sessionId, int count);
int OpenSession4DataByP2p(void);
int OpenSession4ProxyByP2p(void);
int CloseSessionBatch4Data(int* sessionId, int count);
int CloseSessionBatch4Ctl(int* sessionId, int count);
int GetCurrentSessionId4Data(void);
int GetCurrentSessionId4Ctl(void);
int GetCurrentSessionId4Proxy(void);
void SetCurrentSessionId4Data(int sessionId);
void SetCurrentSessionId4Ctl(int sessionId);
void SetCurrentSessionId4Proxy(int sessionId);
void ResetClosedSessionCount4Data(void);
void ResetClosedSessionCount4Ctrl(void);
int GetClosedSessionCount4Data(void);
int GetClosedSessionCount4Ctrl(void);
int CloseSessionAndRemoveSs4Data(void);
int CloseSessionAndRemoveSs4Ctl(void);
int CloseSessionAndRemoveSs4Proxy(void);
void AddPermission(void);
uint64_t GetTestTokenId(void);

ISessionListener* GetSessionListenser4Data(void);
ISessionListener* GetSessionListenser4Ctl(void);
ISessionListener* GetSessionListenser4Proxy(void);
ISessionListener* GetSessionListenser4Stream(void);

SessionAttribute* GetSessionAttr4Ctl(void);
SessionAttribute* GetSessionAttr4Data(void);
SessionAttribute* GetSessionAttr4Proxy(void);
SessionAttribute* GetSessionAttr4DataP2p(void);
SessionAttribute* GetSessionAttr4ProxyP2p(void);
IFileReceiveListener* GetRecvFileListener(void);
IFileSendListener* GetSendFileListener(void);

#ifdef __cplusplus
}
#endif
#endif