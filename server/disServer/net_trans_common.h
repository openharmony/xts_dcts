#ifndef NET_TRANS_COMMON_H
#define NET_TRANS_COMMON_H

#include "session.h"
#include "softbus_def.h"
#include "common_list.h"
#include "softbus_utils.h"
#include "softbus_bus_center.h"
#include "softbus_errcode.h"
#include "discovery_service.h"
#include "shm_utils.h"

#include <errno.h>
#include <securec.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <stdint.h>
#include <pthread.h>
#include <stdarg.h>
#include <sys/time.h>

#ifdef __cplusplus
extern "C" {
#endif

#define MAX_DATA_LENGTH 1024
#define DEF_GROUP_ID "DEF_GROUP_ID"
#define DEF_SESSION_KEY   "DEF_SESSION_KEY"
#define DEF_PKG_NAME      "com.communication.demo"
#define SESSION_NAME_DATA "com.communication.demo.data"
#define DSOFT_PKG_NAME     "com.plrdtest.dsoftbus"
#define RECV_FILE_PATH     "/data/"

#define WAIT_DEF_VALUE     -1
#define WAIT_SUCCESS_VALUE  1
#define WAIT_FAIL_VALUE     0
#define SESSION_ID_MIN      1
#define GROUP_ID_LEN        4
#define MAX_SESSION_NUM     16
#define ONE_SECOND          1
#define BOOL_TRUE           1
#define BOOL_FALSE           0
#define OPEN_SESSION_TIMEOUT 19

#define MAX_SESSION_SERVER_NUM_CLIENT   8
#define MAX_SESSION_SERVER_NUM_SERVER   32
#define TRANS_BYTES_LENGTH_MAX          (4 * 1024 * 1024)
#define TRANS_MASSAGE_LENGTH_MAX        4096

#define PRINT_SPLIT_LINE()     \
	printf("+--------------------------------+\n");

typedef enum{
    SESSION_4DATA =1,
	SESSION_4CTL,
}WaitSessionType;


typedef enum{
    DATA_TYPE_MSG =1,
	DATA_TYPE_BYTE,
}DataType;

typedef enum{
    STATE_ONLINE =1,
	STATE_OFFLINE,
}WaitNodeStateType;

typedef enum{
    CONC_CLOSE_SESSION =1,
}ConcurrentType;

typedef enum{
    CTRL_CODE_SOFTBUS_TYPE =1000,
	CTRL_CODE_DATAMGR_TYPE =2000,
	CTRL_CODE_DM_TYPE =3000,
	CTRL_CODE_FILEMGR_TYPE =4000,
	CTRL_CODE_DP_TYPE =5000,
	CTRL_CODE_SEC_TYPE =6000,
	CTRL_CODE_MEDIA_TYPE =7000,
	CTRL_CODE_RESULT_TYPE =9999,
}CtrlCodeType;

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
	
	static void DataBytesReceived(int sessionId,const void* data, unsigned int dataLen);
	
	static void DataMessageReceived(int sessionId,const void* data, unsigned int dataLen);
	
	int RegisterDeviceStateDefCallback(void);
	
	int UnRegisterDeviceStateDefCallback(void);
	
	int CreateSsAndOpenSession4Data(void);
	
	int OpenSession4Data(void);
	
	int SendDataMsgToRemote(CtrlCodeType code, char* data);
	
	int CloseSessionAndRemoveSs4Data(void);
	
	int IncrementSubId();
	
	void OnDataMessageReceived(int sessionId, const void* data,unsigned int dataLen);
	
	void *SendMsgTask(void* param);
	
	void *DataOperateTask(void* param);
	
	char *GetNetworkId(void);
	
	ISessionListener* GetSessionListenser4Data(void);
	
	void SetCurrentSessionId4Data(int sessionId);
	
	ConnectionAddr* GetConnectAddr(void);
	
	void init(void);
	
	void destroy(void);

	


#ifdef __cplusplus
}
#endif
#endif

