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

#ifndef NET_TRANS_COMMON_H
#define NET_TRANS_COMMON_H

#include <pthread.h>
#include <securec.h>
#include <sys/time.h>
#include <unistd.h>
#include <inttypes.h>
#include "session.h"
#include "socket.h"
#include "softbus_bus_center.h"
#include "softbus_common.h"
#include "softbus_error_code.h"
#include "nativetoken_kit.h"
#include "token_setproc.h"

#ifdef __cplusplus
extern "C" {
#endif

#define DEF_GROUP_ID "DEF_GROUP_ID"
#define DEF_SESSION_KEY "DEF_SESSION_KEY"
#define DEF_PKG_NAME "com.communication.demo1"
#define PKG_NAME_TWO "com.communication.demo2"
#define SESSIONNAME_MAX "com.communication.demo1.max.len.12345678901234567\
    0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789\
    01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567"
#define SESSIONNAME_MAX_OUT "com.communication.demo1.max.len.12345678901234567\
    0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789\
    012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678"
#define PKGNAME_MAX "com.communication.demo1.max.len.1234567890123456789012345678901"
#define PKGNAME_MAX_OUT "com.communication.demo1.max.len.123456789012345678901234567890123"

#define SOCKET_NAME_BYTE "com.communication.demo1.socket.byte"
#define SOCKET_NAME_MESSAGE "com.communication.demo1.socket.message"
#define SOCKET_NAME_FILE "com.communication.demo1.socket.file"
#define SOCKET_NAME_STREAM "com.communication.demo1.socket.stream"

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
#define MAX_SESSION_NUM 16
#define BOOL_TRUE 1
#define BOOL_FALSE 0
#define OPEN_SESSION_TIMEOUT 19
#define MULTI_REMOTE_DEV_COUNT 3
#define DEF_REMOTE_DEV_COUNT 1
#define SIZE_1K 1024
#define CMD_PIDOF_SOFTBUS "pidof softbus_server"
#define MAX_SESSION_SERVER_NUM_CLIENT 8
#define MAX_SESSION_SERVER_NUM_SERVER 32
#define TRANS_BYTES_LENGTH_MAX (4 * 1024 * 1024)
#define TRANS_MESSAGE_LENGTH_MAX (4 * 1024)
#define TRANS_PROXY_BYTES_LENGTH_MAX (4 * 1024 * 1024)
#define TRANS_PROXY_MESSAGE_LENGTH_MAX (4 * 1024)
#define DEF_SEND_DATA_SID_COUNT 4
#define GROUP_ID_LEN 4
#define ONE_SECOND 1

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

#define INDEX_0 0
#define INDEX_1 1
#define INDEX_2 2
#define INDEX_3 3
#define INDEX_4 4

#define TEN_PLACE 10
#define HUNDRED_PLACE  100
#define THOUSAND_PLACE  1000
#define FRAME_10 10
#define FRAME_100 100
#define FRAME_1000 1000
/*stream*/
#define I_FRAME_TYPE (1)
#define P_FRAME_TYPE (2)
/*common*/
#define I_FRAME_SIZE0 (0 * 1024)
#define P_FRAME_SIZE0 (0 * 1024)
/*1080P10 I_FRAME 400k P_FRAME 27k*/
#define I_FRAME_SIZE1 (400 * 1024)
#define P_FRAME_SIZE1 (27 * 1024)
/*1080P30 I_FRAME 200k P_FRAME 46k*/
#define I_FRAME_SIZE2 (200 * 1024)
#define P_FRAME_SIZE2 (46 * 1024)
/*1080P60 I_FRAME 150k P_FRAME 30k*/
#define I_FRAME_SIZE3 (150 * 1024)
#define P_FRAME_SIZE3 (30 * 1024)
/*2kP60 I_FRAME 180k P_FRAME 62k*/
#define I_FRAME_SIZE4 (180 * 1024)
#define P_FRAME_SIZE4 (62 * 1024)
/*2kP60 I_FRAME 270k P_FRAME 60k*/
#define I_FRAME_SIZE5 (270 * 1024)
#define P_FRAME_SIZE5 (60 * 1024)
/*4KP30 I_FRAME 400k P_FRAME 119k*/
#define I_FRAME_SIZE6 (400 * 1024)
#define P_FRAME_SIZE6 (119 * 1024)
/*4KP30 I_FRAME 600k P_FRAME 112k*/
#define I_FRAME_SIZE7 (600 * 1024)
#define P_FRAME_SIZE7 (112 * 1024)
/*4KP60 I_FRAME 400K P_FRAME 123K*/
#define I_FRAME_SIZE8 (400 * 1024)
#define P_FRAME_SIZE8 (123 * 1024)
/*4KP60 I_FRAME 600K P_FRAME 120K*/
#define I_FRAME_SIZE9 (600 * 1024)
#define P_FRAME_SIZE9 (120 * 1024)
/*1080P60 I_FRAME 867K P_FRAME 7K*/
#define I_FRAME_SIZE10 (867 * 1024)
#define P_FRAME_SIZE10 (7 * 1024)
/*1080P60 I_FRAME 1330K P_FRAME 10K*/
#define I_FRAME_SIZE11 (1330 * 1024)
#define P_FRAME_SIZE11 (10 * 1024)

typedef enum {
    SOCKET_BYTES = 1,
    SOCKET_MSG,
    SOCKET_FILE,
    SOCKET_STREAM,
    SOCKET_SHUTDOWN,
}WaitSocketType;

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

int Wait4Socket(int timeout, WaitSocketType type);
int WaitNodeCount(int timeout, WaitNodeStateType state, int expectCount);

void Sleepn(int n);
void TestSetUp(void);
void TestTearDown(void);

int RegisterDeviceStateDefCallback(void);
int UnRegisterDeviceStateDefCallback(void);
int CheckRemoteDeviceIsNull(int isSetNetId);

void ResetWaitFlag(void);
void ResetWaitFlag4Shutdown(void);
void ResetWaitFlag4Byte(void);
void ResetWaitFlag4Message(void);
void ResetWaitFlag4Stream(void);
void ResetWaitFlag4File(void);
void ResetwaitCount4Online(void);
void ResetwaitCount4Offline(void);
void AddPermission(void);
uint64_t GetTestTokenId(void);

int SendSocket4Data(DataType type, int size);

char* GetSoftbusPid(void);
char* GetNetworkId(void);

void SetCurrentSocket4Data(int socket);

int GetCurrentSocket4Data(void);

ISocketListener* GetSocketListnerData(void);

#ifdef __cplusplus
}
#endif
#endif