/*
 * Copyright (C) 2022 Huawei Device Co., Ltd.
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
#define LOG_TAG "disDataTest"

#include <cmath>
#include <condition_variable>
#include <cstdint>
#include <cstring>
#include <gtest/gtest.h>
#include <iostream>
#include <iterator>
#include <mutex>
#include <sstream> // 使用stringstream
#include <string>
#include <unistd.h>
#include <vector>

#include "distributed_kv_data_manager.h"
#include "log_print.h"
#include "shm_utils.h"
#include "types.h"

typedef enum {
    CTRL_CODE_SOFTBUS_TYPE = 1000,
    CTRL_CODE_SOFTBUS_OPEN_SESSION,
    CTRL_CODE_DATAMGR_TYPE = 2000,
    CTRL_CODE_DATAMGR_GET_DATA,
    CTRL_CODE_DATAMGR_GET_DATA_REPLY,
    CTRL_CODE_DATAMGR_CREATE_KV,
    CTRL_CODE_DATAMGR_DELETE_KV,
    CTRL_CODE_DATAMGR_PUT_DATA,
    CTRL_CODE_DATAMGR_DELETE_DATA,
    CTRL_CODE_DM_TYPE = 3000,
    CTRL_CODE_FILEMGR_TYPE = 4000,
    CTRL_CODE_DP_TYPE = 5000,
    CTRL_CODE_SEC_TYPE = 6000,
    CTRL_CODE_MEDIA_TYPE = 7000,
    CTRL_CODE_RESULT_TYPE = 9999,
} CtrlCodeType;

const int MAX_DATA_LENGTH = 1024;
const double DEFDELTA = 0.00001;
const int CODE_LEN_TEN = 10;
const char LOGSTR[20] = "LOG::----";

using namespace std;
using namespace testing::ext;
using namespace OHOS::DistributedKv;
namespace {
const int USLEEP_TIME_SUBSCRIBE = 0;
const int USLEEP_TIME = 0;
const int SECOND_TIME = 2;
std::mutex m;
std::condition_variable cv;
std::condition_variable cvOnChager;
bool isSyncComplete = false;
bool isOnChange = false;
} // namespace

class DeathRecipient : public KvStoreDeathRecipient {
public:
    DeathRecipient() {}
    virtual ~DeathRecipient() {}
    virtual void OnRemoteDied() override
    {
        std::cout << "server is dead" << std::endl;
    }
};

class KvStoreSyncCallbackTestImpl : public KvStoreSyncCallback {
public:
    void SyncCompleted(const std::map<std::string, Status>& results);
};

void KvStoreSyncCallbackTestImpl::SyncCompleted(const std::map<std::string, Status>& results)
{
    LOG("%s SyncCompleted begin", LOGSTR);
    for (const auto& result : results) {
        std::cout << result.first << " status: " << static_cast<int>(result.second) << std::endl;
    }
    isSyncComplete = true;
    cv.notify_all();
    LOG("%s SyncCompleted end", LOGSTR);
}

class Observer : public KvStoreObserver {
    void OnChange(const ChangeNotification& changeNotification);
};
void Observer::OnChange(const ChangeNotification& changeNotification)
{
    LOG("%s OnChange begin", LOGSTR);
    cout << "OnChange insert: " << changeNotification.GetInsertEntries().size()
         << " update: " << changeNotification.GetUpdateEntries().size()
         << " delete: " << changeNotification.GetDeleteEntries().size() << " "
         << changeNotification.GetDeviceId().c_str() << endl;

    isOnChange = true;
    cvOnChager.notify_all();
    LOG("%s OnChange end", LOGSTR);
}

class DistributedKvDataManagerTest : public testing::Test {
public:
    static void SetUpTestCase(void);
    static void TearDownTestCase(void);
    void SetUp();
    void TearDown();

    static const uint32_t CHECK_WAITING_TIME = 50000; // 50ms
    static void RemoveAllStore(DistributedKvDataManager manager);

    DistributedKvDataManagerTest();
};

class DisKvTest {
public:
    static DistributedKvDataManager manager;
    static std::shared_ptr<SingleKvStore> KvStorePtr; // declare kvstore instance.
    static Status statusGetKvStore;
    static Status statusCloseKvStore;
    static Status statusDeleteKvStore;
    static UserId userId;
    static AppId appId;
    static StoreId storeIdTest;
    static void SubscribeWithQuery(std::vector<std::string>& deviceList, DataQuery& dataQuery);
    static void SyncWithCondition(std::vector<std::string>& deviceList, DataQuery& dataQuery);
    static void RemoteCreateKV(char* str);
    static void RemoteDeleteKV(char* str);
    static void RemoteGetData(char* strKV);
    static void RemotePutData(char* strKV);
};

DistributedKvDataManager DisKvTest::manager;
std::shared_ptr<SingleKvStore> DisKvTest::KvStorePtr = nullptr; // declare kvstore instance.
Status DisKvTest::statusGetKvStore = Status::ERROR;
Status DisKvTest::statusCloseKvStore = Status::ERROR;
Status DisKvTest::statusDeleteKvStore = Status::ERROR;
UserId DisKvTest::userId;
AppId DisKvTest::appId;
StoreId DisKvTest::storeIdTest;

void DisKvTest::SubscribeWithQuery(std::vector<std::string>& deviceList, DataQuery& dataQuery)
{
    LOG("%s DisKvTest::SubscribeWithQuery", LOGSTR);
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    remoteDevice.clear();
    Status status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    deviceList.clear();
    for (const auto& device : remoteDevice) {
        std::cout << "start sync deviceId = " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isOnChange = false;
    auto syncStatus = DisKvTest::KvStorePtr->SubscribeWithQuery(deviceList, dataQuery);
    EXPECT_EQ(syncStatus, Status::SUCCESS) << "LOGdisDataTest--SUCCESS:SubscribeWithQuery";
    cvOnChager.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isOnChange; });
    if (isOnChange) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cvOnChager.wait_for isOnChange = %d", LOGSTR, isOnChange);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cvOnChager.wait_for isOnChange = %d", LOGSTR, isOnChange);
    }
}

void DisKvTest::SyncWithCondition(std::vector<std::string>& deviceList, DataQuery& dataQuery)
{
    LOG("%s DisKvTest::SyncWithCondition", LOGSTR);
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    remoteDevice.clear();
    Status status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    deviceList.clear();
    for (const auto& device : remoteDevice) {
        std::cout << "start sync deviceId = " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    auto syncStatus = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PULL, dataQuery);
    EXPECT_EQ(syncStatus, Status::SUCCESS) << "LOGdisDataTest--SUCCESS:SyncWithCondition";
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    if (isSyncComplete) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    }
}

void DisKvTest::RemoteCreateKV(char* str)
{
    LOG("%s RemoteCreateKV", LOGSTR);
    writeCodeDataToShm(CTRL_CODE_DATAMGR_CREATE_KV, str);

    char code[CODE_LEN_TEN] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    if (memset_s(code, strlen(code), 0, CODE_LEN_TEN) != EOK) {
        return;
    }
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    if (str == nullptr) {
        return;
    }
    if (strcpy_s(code, strlen(str) + 1, str) != EOK) {
        return;
    }
    waitDataWithCode(code, str);
    int ret = strcmp(str, "0");
    if (ret == 0) {
        LOG("%s SUCCESS: Remote---CREATE_KV ", LOGSTR);
    } else {
        LOG("%s ERR: Remote---CREATE_KV ret=%d", LOGSTR, ret);
    }
}
void DisKvTest::RemoteDeleteKV(char* str)
{
    LOG("%s RemoteCreateKV", LOGSTR);
    writeCodeDataToShm(CTRL_CODE_DATAMGR_DELETE_KV, str);

    char code[CODE_LEN_TEN] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    if (str == nullptr) {
        return;
    }

    if (strcpy_s(code, strlen(str) + 1, str) != EOK) {
        return;
    }
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    int ret = strcmp(str, "0");
    if (ret == 0) {
        LOG("%s SUCCESS: Remote---DELETE_KV ", LOGSTR);
    } else {
        LOG("%s ERR: Remote---DELETE_KV ret=%d", LOGSTR, ret);
    }
}

void DisKvTest::RemotePutData(char* strKV)
{
    LOG("%s DisKvTest::RemotePutData", LOGSTR);
    writeCodeDataToShm(CTRL_CODE_DATAMGR_PUT_DATA, strKV);
    char str[MAX_DATA_LENGTH] = { 0 };
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    if (strcpy_s(code, strlen(str) + 1, str) != EOK) {
        return;
    }
    char str2[MAX_DATA_LENGTH] = { 0 };
    waitDataWithCode(code, str2);
    std::cout << "yput get result=" << str2 << std::endl;
    // 检查远端是否返回成功
    int ret = strcmp(str2, "0");
    EXPECT_EQ(ret, 0) << "ERR: 远端put ret2";
}

void DisKvTest::RemoteGetData(char* strKV)
{
    LOG("%s DisKvTest::RemoteGetData", LOGSTR);
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV);
    char str[MAX_DATA_LENGTH] = { 0 };
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    if (strcpy_s(code, strlen(str) + 1, str) != EOK) {
        return;
    }
    char str2[MAX_DATA_LENGTH] = { 0 };
    LOG("%s 11--5.远端getcode=%s", LOGSTR, code);
    LOG("%s 11--5.远端getstr2=%s", LOGSTR, str2);
    waitDataWithCode(code, str2);
    LOG("%s 22--5.远端getcode=%s", LOGSTR, code);
    LOG("%s 22--5.远端getstr2=%s", LOGSTR, str2);
    std::cout << " yget result=" << str2 << std::endl;
    // 检查远端是否返回成功
    int ret = strcmp(str2, "0");
    EXPECT_EQ(ret, 0) << "ERR: 远端get ret";
}

void DistributedKvDataManagerTest::SetUpTestCase(void)
{
    // 连接共享内存
    createShm(SHM_SEND_KEY);
}

void DistributedKvDataManagerTest::TearDownTestCase(void)
{
    // 解关联共享内存
    disconnectShm();
}

void DistributedKvDataManagerTest::SetUp(void)
{
    LOG("%s SetUp", LOGSTR);
    DisKvTest::userId.userId = "account0";
    DisKvTest::appId.appId = "com.ohos.kvdatamanager3.test";
    DisKvTest::storeIdTest.storeId = "test3";
    Options options { .createIfMissing = true,
        .encrypt = false,
        .autoSync = false,
        .backup = false,
        .kvStoreType = KvStoreType::SINGLE_VERSION };
    // S1.本地删除数据库
    LOG("%s s1.Local---RemoveAllStore ", LOGSTR);
    RemoveAllStore(DisKvTest::manager);
    // S2.远端删除数据库
    LOG("%s s2.Remote---RemoveAllStore ", LOGSTR);
    char* str = (char*)malloc(MAX_DATA_LENGTH);
    if (str == nullptr) {
        std::cout << "ERROR: str malloc failed" << std::endl;
        return;
    }
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    DisKvTest::RemoteDeleteKV(str);
    free(str);
    // S3.本地创建数据库
    LOG("%s s3.Local---GetSingleKvStore ", LOGSTR);
    auto deathRecipient = std::make_shared<DeathRecipient>();
    DisKvTest::manager.RegisterKvStoreServiceDeathRecipient(deathRecipient);
    DisKvTest::statusGetKvStore = DisKvTest::manager.GetSingleKvStore(
        options, { DisKvTest::appId }, { DisKvTest::storeIdTest }, DisKvTest::KvStorePtr);
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // S4.本端注册同步回调对象
    LOG("%s s4.Local---RegisterSyncCallback ", LOGSTR);
    auto syncCallback = std::make_shared<KvStoreSyncCallbackTestImpl>();
    Status status = DisKvTest::KvStorePtr->RegisterSyncCallback(syncCallback);
    EXPECT_EQ(status, Status::SUCCESS) << "ERR: Local---RegisterSyncCallback";
    // S5.本端订阅数据变化
    LOG("%s s5.Local---SubscribeKvStore ", LOGSTR);
    auto observer = std::make_shared<Observer>();
    status = DisKvTest::KvStorePtr->SubscribeKvStore(SubscribeType::SUBSCRIBE_TYPE_ALL, observer);
    EXPECT_EQ(status, Status::SUCCESS) << "ERR: Local---SubscribeKvStore";
    // S6.远端创建数据库
    LOG("%s s6.Remote---GetSingleKvStore ", LOGSTR);
    str = (char*)malloc(MAX_DATA_LENGTH);
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    DisKvTest::RemoteCreateKV(str);
    free(str);
}

void DistributedKvDataManagerTest::TearDown(void)
{
    // 解注册回调
    Status status = DisKvTest::KvStorePtr->UnRegisterSyncCallback();
    EXPECT_EQ(status, Status::SUCCESS) << "ERR:un register sync callback failed.";
}
void DistributedKvDataManagerTest::RemoveAllStore(DistributedKvDataManager manager)
{
    LOG("%s ::RemoveAllStore begin... ", LOGSTR);
    DisKvTest::statusCloseKvStore = DisKvTest::manager.CloseAllKvStore(DisKvTest::appId);
    LOG("%s CloseAllKvStore", LOGSTR);
    if (DisKvTest::statusCloseKvStore == Status::SUCCESS) {
        LOG("%s SUCCESS: local---CloseAllKvStore ", LOGSTR);
    } else {
        LOG("%s ERR: local---CloseAllKvStore ", LOGSTR);
    }

    DisKvTest::statusDeleteKvStore = DisKvTest::manager.DeleteAllKvStore(DisKvTest::appId);
    LOG("%s DeleteAllKvStore", LOGSTR);
    if (DisKvTest::statusDeleteKvStore == Status::SUCCESS) {
        LOG("%s SUCCESS: local---DeleteAllKvStore ", LOGSTR);
    } else {
        LOG("%s ERR: local---DeleteAllKvStore ", LOGSTR);
    }
}

DistributedKvDataManagerTest::DistributedKvDataManagerTest(void) {}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_Push_0100
 *  @tc.name: DistribitedKvDataManagerTest  sync push
 *  @tc.desc: sync push, put int data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_Push_0100, TestSize.Level1 | Function | MediumTest)
{
    ZLOGI("DistribitedKvDataManager_Sync_Push_0100 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 本地数据库添加数据 100
    std::string stringKey = "math_score_int";
    Key keyInt = stringKey;
    Value valueInt = Value(TransferTypeToByteArray<int>(100));
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync::PUSH " << device.deviceId << std::endl;
        LOG("start sync Id = %s", device.deviceId.c_str());
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("cv.wait_for isSyncComplete = %d", isSyncComplete);

    // 远端getdata
    char strKV[MAX_DATA_LENGTH] = { "math" };
    (void)memset_s(strKV, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)strcpy_s(strKV, strlen("math_score_int:100") + 1, "math_score_int:100");
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV); // 2001:math_score_int:10
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999

    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "int 100 yget result=" << str << std::endl;
    // 检查远端是否返回成功
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0);
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_Push_0200
 *  @tc.name: DistribitedKvDataManagerTest  sync push
 *  @tc.desc: sync push, put float data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_Push_0200, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_Push_0200 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";

    // 本地数据库添加数据 3.14f
    std::string stringKey = "math_score_float";
    Key keyInt = stringKey;

    Value valueInt = Value(TransferTypeToByteArray<float>(3.14f));
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;

    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);

    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 远端getdata
    char strKV[MAX_DATA_LENGTH] = { "math" };
    (void)memset_s(strKV, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)strcpy_s(strKV, strlen("math_score_float:3.14") + 1, "math_score_float:3.14");
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV); // 2001:math_score_int:10
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << " float 3.14f yget result=" << str << std::endl;
    // 检查远端是否返回成功
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0);
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_Push_0300
 *  @tc.name: DistribitedKvDataManagerTest  sync push
 *  @tc.desc: sync push, put double data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_Push_0300, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_Push_0300 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 本地数据库添加数据 28.288f
    std::string stringKey = "math_score_double";
    Key keyInt = stringKey;
    Value valueInt = Value(TransferTypeToByteArray<double>(28.288f));
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);
    // 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }

    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 远端getdata
    char strKV[MAX_DATA_LENGTH] = { "math" };
    (void)memset_s(strKV, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)strcpy_s(strKV, strlen("math_score_double:28.288") + 1, "math_score_double:28.288");

    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV); // 2001:math_score_int:10
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999

    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "<double>(28.288f) get result=" << str << std::endl;

    // 检查远端是否返回成功
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0);
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_Push_0400
 *  @tc.name: DistribitedKvDataManagerTest  sync push
 *  @tc.desc: sync push, put int64_t data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_Push_0400, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_Push_0400 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";

    // 本地数据库添加数据 12345678
    Key keyInt = "math_score_int64_t";
    Value valueInt = Value(TransferTypeToByteArray<int64_t>(12345678));
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 远端getdata
    char strKV[MAX_DATA_LENGTH] = { "math" };
    (void)memset_s(strKV, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)strcpy_s(strKV, strlen("math_score_int64_t:12345678") + 1, "math_score_int64_t:12345678");
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV); // 2001:math_score_int:10
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << " <int64_t>(12345678) get result=" << str << std::endl;
    // 检查远端是否返回成功
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0);
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_Push_0500
 *  @tc.name: DistribitedKvDataManagerTest  sync push
 *  @tc.desc: sync push, put size_t data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_Push_0500, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_Push_0500 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 本地数据库添加数据 28
    Key keyInt = "math_score_size_t";
    Value valueInt = Value(TransferTypeToByteArray<size_t>(28));
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 远端getdata
    char strKV[MAX_DATA_LENGTH] = { "math" };
    (void)memset_s(strKV, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)strcpy_s(strKV, strlen("math_score_size_t:28") + 1, "math_score_size_t:28");

    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV); // 2001:math_score_int:10
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999

    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << " <size_t>(28) get result=" << str << std::endl;
    // 检查远端是否返回成功
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0);
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_Push_0600
 *  @tc.name: DistribitedKvDataManagerTest  sync push
 *  @tc.desc: sync push, put string data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_Push_0600, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_Push_0600 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 本地数据库添加数据string
    Key keyInt = "math_score_string";
    Value valueInt = Value("{\"class\":20, \"age\":18, \"gradle\":\"good\"}");
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 远端getdata
    char str[MAX_DATA_LENGTH] = { "math_score_string:{\"class\":20, \"age\":18, \"gradle\":\"good\"}" };
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, str); // 2001:math_score_int:10
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999

    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "string get result=" << str << std::endl;

    // 检查远端是否返回成功
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0);
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_Push_0700
 *  @tc.name: DistribitedKvDataManagerTest  sync push
 *  @tc.desc: sync push, put vector<uint8_t> data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_Push_0700, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_Push_0700 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 本地数据库添加数据 vector<int>
    std::string stringKey = "math_score_vector";
    Key keyInt = stringKey;
    std::vector<uint8_t> vect = { 0, 1, 2, 3, 4, 5, 6, 7 };
    Value valueInt = Value(vect);
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 远端getdata
    std::string strvc;
    strvc.assign(vect.begin(), vect.end());

    char strKV[MAX_DATA_LENGTH] = { "math_score_int" };
    (void)strcpy_s(strKV, strlen(stringKey.c_str()) + 1, stringKey.c_str());
    (void)strcat_s(strKV, MAX_DATA_LENGTH, ":");
    (void)strcat_s(strKV, MAX_DATA_LENGTH, strvc.c_str());

    std::cout << "strvc = " << strvc << std::endl;
    std::cout << "strvc.c_str() = " << strvc.c_str() << std::endl;
    std::cout << "strKV = " << strKV << std::endl;

    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV);
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { "9999" };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999

    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "vector<int> get result=" << str << std::endl;

    // 检查远端是否返回成功
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0);
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_Pull_0100
 *  @tc.name: remote put data, local sync pull
 *  @tc.desc: sync pull, put int data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_Pull_0100, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_Pull_0100 begin.");
    // 1.本端创建KV
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";

    // 2.远端创建KV
    // 本端注册同步回调对象

    // 3.本地数据库添加数据 100
    LOG("%s 3.本地数据库添加数据 100 ", LOGSTR);
    Key keyInt = "math_score_int";
    Value valueInt = Value(TransferTypeToByteArray<int>(100));
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 4. 本端sync push 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);
    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 5.远端修改数据200
    char strKV[MAX_DATA_LENGTH] = { "math" };
    (void)memset_s(strKV, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)strcpy_s(strKV, strlen("math_score_int:200") + 1, "math_score_int:200");
    writeCodeDataToShm(CTRL_CODE_DATAMGR_PUT_DATA, strKV);

    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999

    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << " 5.远端修改数据200， str=" << str << std::endl;
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 5.远端修改数据200";

    // 6.远端get 200
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV);
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << " 6.远端get数据200， str=" << str << std::endl;
    // 检查远端是否返回成功
    ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 6.远端get数据200";

    // 7.本地pull远端数据
    remoteDevice.clear();
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);
    deviceList.clear();
    for (const auto& device2 : remoteDevice) {
        std::cout << "start sync " << device2.deviceId << std::endl;
        deviceList.push_back(device2.deviceId);
    }
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PULL);
    EXPECT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    if (isSyncComplete) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    }

    // 8.本地get数据与200比较
    LOG("%s 8.本地get数据与200比较", LOGSTR);
    sleep(USLEEP_TIME);

    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get("math_score_int", valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    int aaa = TransferByteArrayToType<int>(valueRetInt.Data());
    EXPECT_EQ(aaa, 200) << "ERR:本地get数据与200比较";

    // 解注册回调
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_Pull_0200
 *  @tc.name: remote put data, local sync pull
 *  @tc.desc: sync pull, put float data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_Pull_0200, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_Pull_0200 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 2.创建远端Lv
    // 3. 本地数据库添加数据 100
    std::string stringKey = "math_score_float";
    Key keyInt = stringKey;
    Value valueInt = Value(TransferTypeToByteArray<float>(3.14f));

    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 4. 本端sync push 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 5.远端修改数据float:9.99
    char strKV[MAX_DATA_LENGTH] = { "math" };
    (void)memset_s(strKV, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)strcpy_s(strKV, strlen("math_score_float:9.99") + 1, "math_score_float:9.99");
    writeCodeDataToShm(CTRL_CODE_DATAMGR_PUT_DATA, strKV);
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "5.远端修改数据float:9.99， str=" << str << std::endl;
    // 检查远端是否返回成功
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 5.远端修改数据float:9.99";

    // 6.远端get float:9.99
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV);
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "6.远端get float:9.99， str=" << str << std::endl;
    // 检查远端是否返回成功
    ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 6.远端get float:9.99";

    // 7.本地pull远端数据
    remoteDevice.clear();
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);
    deviceList.clear();
    for (const auto& device2 : remoteDevice) {
        std::cout << "start sync " << device2.deviceId << std::endl;
        deviceList.push_back(device2.deviceId);
    }
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PULL);
    EXPECT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    if (isSyncComplete) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    }

    // 8.本地get数据 与 float:9.99比较
    LOG("%s 8.本地get数据 与 float:9.99比较", LOGSTR);
    sleep(USLEEP_TIME);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    float aaa = TransferByteArrayToType<float>(valueRetInt.Data());
    float delta = aaa - 9.99f;
    EXPECT_LE(std::fabs(delta), DEFDELTA) << "ERR:8.本地get数据 与 float:9.99比较";

    // 解注册回调
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_Pull_0300
 *  @tc.name: remote put data, local sync pull
 *  @tc.desc: sync pull, put double data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_Pull_0300, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_Pull_0300 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 2.创建远端Lv
    // 3. 本地数据库添加数据28.288f
    std::string stringKey = "math_score_double";
    Key keyInt = stringKey;
    Value valueInt = Value(TransferTypeToByteArray<double>(28.288));

    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);
    // 4. sync push 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);
    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }

    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });

    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 5.远端修改数据double:999.999
    char strKV[MAX_DATA_LENGTH] = { "math_score_double:999.999" };
    writeCodeDataToShm(CTRL_CODE_DATAMGR_PUT_DATA, strKV);
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { "9999" };
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999

    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << " 5.远端修改数据double:999.999， str=" << str << std::endl;
    // 检查远端是否返回成功
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 5.远端修改数据double:999.999";

    // 6.远端get double:999.999
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV);
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << " 6.远端get double:999.999， str=" << str << std::endl;
    // 检查远端是否返回成功
    ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 6.远端get double:999.999";

    // 7.本地pull远端数据
    remoteDevice.clear();
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);
    deviceList.clear();
    for (const auto& device2 : remoteDevice) {
        std::cout << "start sync " << device2.deviceId << std::endl;
        deviceList.push_back(device2.deviceId);
    }

    // std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PULL);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });

    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    if (isSyncComplete) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    }

    // 8.本地get数据 与double:999.999比较
    sleep(USLEEP_TIME);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    double aaa = TransferByteArrayToType<double>(valueRetInt.Data());
    double delta = aaa - 999.999;
    std::cout << "aaa = " << aaa << std::endl;
    std::cout << "delta = " << delta << std::endl;
    EXPECT_LE(std::fabs(delta), DEFDELTA) << "ERR:8.本地get数据 与double:999.999比较";

    // 解注册回调
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_Pull_0400
 *  @tc.name: remote put data, local sync pull
 *  @tc.desc: sync pull, put int64_t data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_Pull_0400, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_Pull_0400 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 2.创建远端Lv
    // 3. 本地数据库添加数据 100
    Key keyInt = "math_score_int64_t";
    Value valueInt = Value(TransferTypeToByteArray<int64_t>(12345678));
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 4. sync push 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 5.远端修改数据int64_t
    char strKV[MAX_DATA_LENGTH] = { "math" };
    (void)memset_s(strKV, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)strcpy_s(strKV, strlen("math_score_int64_t:99889988") + 1, "math_score_int64_t:99889988");

    writeCodeDataToShm(CTRL_CODE_DATAMGR_PUT_DATA, strKV);
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << " 5.远端修改数据int64_t， str=" << str << std::endl;
    // 检查远端是否返回成功
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 5.远端修改数据int64_t";

    // 6.远端get int64_t
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV);
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << " 6.远端get int64_t， str=" << str << std::endl;
    // 检查远端是否返回成功
    ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 6.远端get int64_t";

    // 7.本地pull远端数据
    remoteDevice.clear();
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);
    deviceList.clear();
    for (const auto& device2 : remoteDevice) {
        std::cout << "start sync " << device2.deviceId << std::endl;
        deviceList.push_back(device2.deviceId);
    }
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PULL);
    EXPECT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    if (isSyncComplete) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    }

    // 8.本地get数据与int64_t比较
    LOG("%s 8.本地get数据与int64_t比较", LOGSTR);
    sleep(USLEEP_TIME);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    int64_t aaa = TransferByteArrayToType<int64_t>(valueRetInt.Data());
    EXPECT_EQ(aaa, 99889988u) << "ERR: 8.本地get数据与int64_t比较";

    // 解注册回调
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_Pull_0500
 *  @tc.name: remote put data, local sync pull
 *  @tc.desc: sync pull, put size_t data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_Pull_0500, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_Pull_0100 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";

    // 2.创建远端Lv
    // 3. 本地数据库添加数据 100
    Key keyInt = "math_score_size_t";
    Value valueInt = Value(TransferTypeToByteArray<size_t>(28));
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 4. sync push 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);
    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 5.远端修改数据size_t:88
    char strKV[MAX_DATA_LENGTH] = { "math" };
    (void)memset_s(strKV, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)strcpy_s(strKV, strlen("math_score_size_t:88") + 1, "math_score_size_t:88");
    writeCodeDataToShm(CTRL_CODE_DATAMGR_PUT_DATA, strKV);
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << " 5.远端修改数据size_t:88， str=" << str << std::endl;
    // 检查远端是否返回成功
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 5.远端修改数据size_t:88";

    // 6.远端get size_t:88
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV);
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << " 6.远端get size_t:88， str=" << str << std::endl;
    // 检查远端是否返回成功
    ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 6.远端get size_t:88";

    // 7.本地pull远端数据
    remoteDevice.clear();
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    // std::vector<std::string> deviceList;
    deviceList.clear();
    for (const auto& device2 : remoteDevice) {
        std::cout << "start sync " << device2.deviceId << std::endl;
        deviceList.push_back(device2.deviceId);
    }
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PULL);
    EXPECT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    if (isSyncComplete) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    }

    // 8.本地get数据与size_t:88比较
    LOG("%s 8.本地get数据与size_t:88比较", LOGSTR);
    sleep(USLEEP_TIME);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    size_t aaa = TransferByteArrayToType<size_t>(valueRetInt.Data());
    EXPECT_EQ(aaa, 88u) << "ERR: 8.本地get数据与size_t:88比较";

    // 解注册回调
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_Pull_0600
 *  @tc.name: remote put data, local sync pull
 *  @tc.desc: sync pull, put string data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_Pull_0600, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_Pull_0600 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";

    // 2.创建远端Lv
    // 3. 本地数据库添加数据 100
    Key keyInt = "math_score_string";
    Value valueInt = Value("{\"class\":20, \"age\":18, \"gradle\":\"good\"}");
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 4. sync push 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 5.远端修改数据string
    char strPut[MAX_DATA_LENGTH] = { "math_score_string:{\"class\":88, \"age\":99, \"gradle\":\"QQWWQQ\"}" };
    writeCodeDataToShm(CTRL_CODE_DATAMGR_PUT_DATA, strPut);
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << " 5.远端修改数据string， str=" << str << std::endl;
    // 检查远端是否返回成功
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 5.远端修改数据string";

    // 6.远端get string
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strPut);
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << " 6.远端get string， str=" << str << std::endl;
    // 检查远端是否返回成功
    ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 6.远端get string";

    // 7.本地pull远端数据
    remoteDevice.clear();
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    deviceList.clear();
    for (const auto& device2 : remoteDevice) {
        std::cout << "start sync " << device2.deviceId << std::endl;
        deviceList.push_back(device2.deviceId);
    }
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PULL);
    EXPECT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    if (isSyncComplete) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    }

    // 8.本地get数据与string比较
    LOG("%s 8.本地get数据与string比较", LOGSTR);
    sleep(USLEEP_TIME);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    std::string aaa = valueRetInt.ToString();
    std::string sstring = "{\"class\":88, \"age\":99, \"gradle\":\"QQWWQQ\"}";
    EXPECT_EQ(aaa, sstring) << "ERR:  8.本地get数据与string比较";

    // 解注册回调
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_Pull_0700
 *  @tc.name: remote put data, local sync pull
 *  @tc.desc: sync pull, put vector<uint8_t> data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_Pull_0700, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_Pull_0700 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";

    // 2.创建远端Lv
    // 3.本地数据库添加数据 vector<int>
    std::string stringKey = "math_score_vector";
    Key keyInt = stringKey;
    std::vector<uint8_t> vect = { 0, 1, 2, 3, 4, 5, 6, 7 };
    Value valueInt = Value(vect);
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 4. sync push 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 5.远端修改数据vector
    std::vector<uint8_t> vect2 = { 9, 9, 8, 8, 7, 7, 6, 6 };
    std::string strvc;
    strvc.assign(vect2.begin(), vect2.end());

    char strKV[MAX_DATA_LENGTH] = { "math_score_int" };
    (void)strcpy_s(strKV, strlen(stringKey.c_str()) + 1, stringKey.c_str());
    (void)strcat_s(strKV, MAX_DATA_LENGTH, ":");
    (void)strcat_s(strKV, MAX_DATA_LENGTH, strvc.c_str());

    std::cout << "strvc = " << strvc << std::endl;
    std::cout << "strvc.c_str() = " << strvc.c_str() << std::endl;
    std::cout << "strKV = " << strKV << std::endl;

    writeCodeDataToShm(CTRL_CODE_DATAMGR_PUT_DATA, strKV);
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { "9999" };
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << " 5.远端修改数据vector， str=" << str << std::endl;
    // 检查远端是否返回成功
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 5.远端修改数据vector";

    // 6.远端get vector
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV);
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999

    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << " 6.远端get vector， str=" << str << std::endl;
    // 检查远端是否返回成功
    ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 6.远端get vector";

    // 7.本地pull远端数据
    remoteDevice.clear();
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    deviceList.clear();
    for (const auto& device2 : remoteDevice) {
        std::cout << "start sync " << device2.deviceId << std::endl;
        deviceList.push_back(device2.deviceId);
    }
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PULL);
    EXPECT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    if (isSyncComplete) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    }

    // 8.本地get数据与vector比较
    LOG("%s 8.本地get数据与vector比较", LOGSTR);
    sleep(USLEEP_TIME);

    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    std::string strValueRet = valueRetInt.ToString();
    EXPECT_EQ(strvc, strValueRet.c_str()) << "8.本地get数据与vector比较";

    // 解注册回调
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_PUSH_PULL_0100
 *  @tc.name: remote delete data, local sync push_pull
 *  @tc.desc: sync push_pull ,delete int data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_PUSH_PULL_0100, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_PUSH_PULL_0100 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 2.创建远端Lv
    // 3. 本地数据库添加数据 100
    Key keyInt = "math_score_int";
    Value valueInt = Value(TransferTypeToByteArray<int>(100));
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 4. sync push 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 5.远端delete数据
    char strKV[MAX_DATA_LENGTH] = { "math_score_int:100" };
    writeCodeDataToShm(CTRL_CODE_DATAMGR_DELETE_DATA, strKV);
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "5.远端delete数据， str=" << str << std::endl;
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 5.远端delete数据";

    // 6.远端get数据失败
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV);
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "6.远端get数据失败， str=" << str << std::endl;
    ret = strcmp(str, "1");
    EXPECT_EQ(ret, 0) << "ERR: 6.远端get数据失败";

    // 7.本地 push_pull 远端数据
    remoteDevice.clear();
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    deviceList.clear();
    for (const auto& device2 : remoteDevice) {
        std::cout << "start sync " << device2.deviceId << std::endl;
        deviceList.push_back(device2.deviceId);
    }
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH_PULL);
    EXPECT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    if (isSyncComplete) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    }

    // 8.本地get数据失败
    sleep(USLEEP_TIME);

    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR:8.本地get数据失败";

    // 解注册回调
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_PUSH_PULL_0200
 *  @tc.name: remote delete data, local sync push_pull
 *  @tc.desc: sync push_pull ,delete float data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_PUSH_PULL_0200, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_PUSH_PULL_0200 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 2.创建远端Lv
    // 3. 本地数据库添加数据 100
    Key keyInt = "math_score_int";
    Value valueInt = Value(TransferTypeToByteArray<float>(3.14f));
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 4. sync push 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 5.远端delete 数据
    char strKV[MAX_DATA_LENGTH] = { "math_score_int:100" };
    writeCodeDataToShm(CTRL_CODE_DATAMGR_DELETE_DATA, strKV);
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "5.远端delete数据， str=" << str << std::endl;
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 5.远端delete数据";
    // 6.远端get数据失败
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV);
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "6.远端get数据失败， str=" << str << std::endl;
    ret = strcmp(str, "1");
    EXPECT_EQ(ret, 0) << "ERR: 6.远端get数据失败";

    // 7.本地 push_pull 远端数据
    remoteDevice.clear();
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);
    deviceList.clear();
    for (const auto& device2 : remoteDevice) {
        std::cout << "start sync " << device2.deviceId << std::endl;
        deviceList.push_back(device2.deviceId);
    }
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH_PULL);
    EXPECT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    if (isSyncComplete) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    }

    // 8.本地get数据失败
    sleep(USLEEP_TIME);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR:8.本地get数据失败";

    // 解注册回调
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_PUSH_PULL_0300
 *  @tc.name: remote delete data, local sync push_pull
 *  @tc.desc: sync push_pull ,delete double data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_PUSH_PULL_0300, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_PUSH_PULL_0300 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";

    // 2.创建远端Lv
    // 3. 本地数据库添加数据 100
    Key keyInt = "math_score_int";
    Value valueInt = Value(TransferTypeToByteArray<double>(28.288f));
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 4. sync push 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 5.远端delete 数据
    char strKV[MAX_DATA_LENGTH] = { "math_score_int:100" };
    writeCodeDataToShm(CTRL_CODE_DATAMGR_DELETE_DATA, strKV);
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "5.远端delete数据， str=" << str << std::endl;
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 5.远端delete数据";

    // 6.远端get数据失败
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV);
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "6.远端get数据失败， str=" << str << std::endl;
    ret = strcmp(str, "1");
    EXPECT_EQ(ret, 0) << "ERR: 6.远端get数据失败";

    // 7.本地 push_pull 远端数据
    remoteDevice.clear();
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    deviceList.clear();
    for (const auto& device2 : remoteDevice) {
        std::cout << "start sync " << device2.deviceId << std::endl;
        deviceList.push_back(device2.deviceId);
    }
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH_PULL);
    EXPECT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    if (isSyncComplete) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    }

    // 8.本地get数据失败
    sleep(USLEEP_TIME);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR:8.本地get数据失败";

    // 解注册回调
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_PUSH_PULL_0400
 *  @tc.name: remote delete data, local sync push_pull
 *  @tc.desc: sync push_pull ,delete int64_t data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_PUSH_PULL_0400, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_PUSH_PULL_0400 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 2.创建远端Lv
    // 3. 本地数据库添加数据 100
    Key keyInt = "math_score_int";
    Value valueInt = Value(TransferTypeToByteArray<int64_t>(12345678));
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 4. sync push 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 5.远端delete 数据
    char strKV[MAX_DATA_LENGTH] = { "math_score_int:100" };
    writeCodeDataToShm(CTRL_CODE_DATAMGR_DELETE_DATA, strKV);
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "5.远端delete数据， str=" << str << std::endl;
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 5.远端delete数据";

    // 6.远端get数据失败
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV);
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "6.远端get数据失败， str=" << str << std::endl;
    ret = strcmp(str, "1");
    EXPECT_EQ(ret, 0) << "ERR: 6.远端get数据失败";

    // 7.本地 push_pull 远端数据
    remoteDevice.clear();
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);
    deviceList.clear();
    for (const auto& device2 : remoteDevice) {
        std::cout << "start sync " << device2.deviceId << std::endl;
        deviceList.push_back(device2.deviceId);
    }
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH_PULL);
    EXPECT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    if (isSyncComplete) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    }

    // 8.本地get数据失败
    sleep(USLEEP_TIME);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR:8.本地get数据失败";

    // 解注册回调
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_PUSH_PULL_0500
 *  @tc.name: remote delete data, local sync push_pull
 *  @tc.desc: sync push_pull ,delete size_t data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_PUSH_PULL_0500, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_PUSH_PULL_0500 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 2.创建远端Lv
    // 3. 本地数据库添加数据 100
    Key keyInt = "math_score_int";
    Value valueInt = Value(TransferTypeToByteArray<size_t>(28));
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 4. sync push 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 5.远端delete 数据
    char strKV[MAX_DATA_LENGTH] = { "math_score_int:100" };
    writeCodeDataToShm(CTRL_CODE_DATAMGR_DELETE_DATA, strKV);
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "5.远端delete数据， str=" << str << std::endl;
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 5.远端delete数据";

    // 6.远端get数据失败
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV);
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "6.远端get数据失败， str=" << str << std::endl;
    ret = strcmp(str, "1");
    EXPECT_EQ(ret, 0) << "ERR: 6.远端get数据失败";

    // 7.本地 push_pull 远端数据
    remoteDevice.clear();
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    deviceList.clear();
    for (const auto& device2 : remoteDevice) {
        std::cout << "start sync " << device2.deviceId << std::endl;
        deviceList.push_back(device2.deviceId);
    }
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH_PULL);
    EXPECT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    if (isSyncComplete) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    }

    // 8.本地get数据失败
    sleep(USLEEP_TIME);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR:8.本地get数据失败";

    // 解注册回调
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_PUSH_PULL_0600
 *  @tc.name: remote delete data, local sync push_pull
 *  @tc.desc: sync push_pull ,delete string  data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_PUSH_PULL_0600, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_PUSH_PULL_0600 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 2.创建远端Lv
    // 3. 本地数据库添加数据 100
    Key keyInt = "math_score_int";
    Value valueInt = Value("{\"class\":20, \"age\":18, \"gradle\":\"good\"}");
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 4. sync push 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);

    // 5.远端delete 数据
    char strKV[MAX_DATA_LENGTH] = { "math_score_int:100" };
    writeCodeDataToShm(CTRL_CODE_DATAMGR_DELETE_DATA, strKV);
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { 0 };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "5.远端delete数据， str=" << str << std::endl;
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 5.远端delete数据";

    // 6.远端get数据失败
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV);
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "6.远端get数据失败， str=" << str << std::endl;
    ret = strcmp(str, "1");
    EXPECT_EQ(ret, 0) << "ERR: 6.远端get数据失败";

    // 7.本地 push_pull 远端数据
    remoteDevice.clear();
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);

    deviceList.clear();
    for (const auto& device2 : remoteDevice) {
        std::cout << "start sync " << device2.deviceId << std::endl;
        deviceList.push_back(device2.deviceId);
    }
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH_PULL);
    EXPECT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    if (isSyncComplete) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    }

    // 8.本地get数据失败
    sleep(USLEEP_TIME);

    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR:8.本地get数据失败";
    // 解注册回调
}

/**
 *  @tc.number: DistribitedKvDataManager_Sync_PUSH_PULL_0700
 *  @tc.name: remote delete data, local sync push_pull
 *  @tc.desc: sync push_pull ,delete vector<uint8_t>  data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, DistribitedKvDataManager_Sync_PUSH_PULL_0700, TestSize.Level1)
{
    ZLOGI("DistribitedKvDataManager_Sync_PUSH_PULL_0700 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 2.创建远端Lv
    // 3. 本地数据库添加数据 100
    Key keyInt = "math_score_int";
    std::vector<uint8_t> vect = { 0, 1, 2, 3, 4, 5, 6, 7 };
    Value valueInt = Value(vect);
    Status status = DisKvTest::KvStorePtr->Put(keyInt, valueInt);
    EXPECT_EQ(Status::SUCCESS, status);

    // 4. sync push 同步数据到远端
    std::vector<OHOS::DistributedKv::DeviceInfo> remoteDevice;
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);
    std::vector<std::string> deviceList;
    for (const auto& device : remoteDevice) {
        std::cout << "start sync " << device.deviceId << std::endl;
        deviceList.push_back(device.deviceId);
    }
    std::unique_lock<std::mutex> lk(m);
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH);
    ASSERT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    // 5.远端delete 数据
    char strKV[MAX_DATA_LENGTH] = { "math_score_int:100" };
    writeCodeDataToShm(CTRL_CODE_DATAMGR_DELETE_DATA, strKV);
    char str[MAX_DATA_LENGTH] = { 0 };
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char code[CODE_LEN_TEN] = { "9999" };
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "5.远端delete数据， str=" << str << std::endl;
    int ret = strcmp(str, "0");
    EXPECT_EQ(ret, 0) << "ERR: 5.远端delete数据";

    // 6.远端get数据失败
    writeCodeDataToShm(CTRL_CODE_DATAMGR_GET_DATA, strKV);
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)memset_s(code, CODE_LEN_TEN, 0, CODE_LEN_TEN);
    Int2String(CTRL_CODE_RESULT_TYPE, str);
    ASSERT_NE(nullptr, str);
    (void)strcpy_s(code, strlen(str) + 1, str); // 9999
    (void)memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    waitDataWithCode(code, str);
    std::cout << "6.远端get数据失败， str=" << str << std::endl;
    ret = strcmp(str, "1");
    EXPECT_EQ(ret, 0) << "ERR: 6.远端get数据失败";

    // 7.本地 push_pull 远端数据
    remoteDevice.clear();
    status = DisKvTest::manager.GetDeviceList(remoteDevice, DeviceFilterStrategy::NO_FILTER);
    EXPECT_EQ(status, Status::SUCCESS);
    deviceList.clear();
    for (const auto& device2 : remoteDevice) {
        std::cout << "start sync " << device2.deviceId << std::endl;
        deviceList.push_back(device2.deviceId);
    }
    isSyncComplete = false;
    status = DisKvTest::KvStorePtr->Sync(deviceList, SyncMode::PUSH_PULL);
    EXPECT_EQ(status, Status::SUCCESS);
    cv.wait_for(lk, std::chrono::seconds(SECOND_TIME), [] { return isSyncComplete; });
    LOG("%s sync::PUSH  cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    if (isSyncComplete) {
        LOG("%s SUCCESS:SubscribeWithQuery.. cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    } else {
        LOG("%s ERR:SubscribeWithQuery..cv.wait_for isSyncComplete = %d", LOGSTR, isSyncComplete);
    }

    // 8.本地get数据失败
    sleep(USLEEP_TIME);

    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR:8.本地get数据失败";

    // 解注册回调
}

/**
 *  @tc.number: SubscribeWithQuery_0100
 *  @tc.name: SubscribeWithQuery
 *  @tc.desc: SubscribeWithQuery, int data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, SubscribeWithQuery_0100, TestSize.Level1)
{
    ZLOGI("SubscribeWithQuery_0100 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 1.本端创建Lv
    // 2.远端创建kv
    // 3.本端get数据,key不存在
    LOG("%s 3.本端get数据,key不存在 ", LOGSTR);
    Value valueInt;
    Key keyInt = "math_score_int";
    Status status = DisKvTest::KvStorePtr->Get(keyInt, valueInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR: 3.本端get数据失败,key不存在";
    // 4.远端put int 200
    LOG("%s 4.远端put int ", LOGSTR);
    char strKV[MAX_DATA_LENGTH] = { "math_score_int" };
    (void)memset_s(strKV, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)strcpy_s(strKV, strlen("math_score_int:200") + 1, "math_score_int:200");
    DisKvTest::RemotePutData(strKV);

    // 5.远端get int 200
    LOG("%s 5.远端get int 200 ", LOGSTR);
    DisKvTest::RemoteGetData(strKV);

    // 6.本端sync远端数据 SubscribeWithQuery
    LOG("%s 6.本端sync远端数据 SubscribeWithQuery", LOGSTR);
    std::vector<std::string> deviceList;
    deviceList.clear();
    DataQuery dataQuery;
    dataQuery.KeyPrefix("math");
    DisKvTest::SubscribeWithQuery(deviceList, dataQuery);

    // 7.本地get数据与200比较
    LOG("%s 7.本地get数据与200比较", LOGSTR);
    sleep(USLEEP_TIME_SUBSCRIBE);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    int aaa = TransferByteArrayToType<int>(valueRetInt.Data());
    std::cout << "7.本地get数据与200比较: aaa = " << aaa << std::endl;
    EXPECT_EQ(aaa, 200) << "ERR:本地get数据与200比较";

    // 取消订阅
    auto unSubscribeStatus = DisKvTest::KvStorePtr->UnsubscribeWithQuery(deviceList, dataQuery);
    EXPECT_EQ(unSubscribeStatus, Status::SUCCESS) << "LOGdisDataTest--ERR:SubscribeWithQuery";
}

/**
 *  @tc.number: SubscribeWithQuery_0200
 *  @tc.name: SubscribeWithQuery
 *  @tc.desc: SubscribeWithQuery, float data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, SubscribeWithQuery_0200, TestSize.Level1)
{
    ZLOGI("SubscribeWithQuery_0200 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 1.本端创建Lv
    // 2.远端创建kv
    // 3.本端get数据,key不存在
    LOG("%s 3.本端get数据,key不存在 ", LOGSTR);
    Value valueInt;
    Key keyInt = "math_score_float";
    Status status = DisKvTest::KvStorePtr->Get(keyInt, valueInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR: 3.本端get数据失败,key不存在";

    // 4.远端put float 9.99
    LOG("%s 4.远端put float 9.99 ", LOGSTR);
    char strKV[MAX_DATA_LENGTH] = { "math_score_float:9.99" };
    DisKvTest::RemotePutData(strKV);
    // 5.远端get 9.99
    LOG("%s 5.远端get float 9.99 ", LOGSTR);
    DisKvTest::RemoteGetData(strKV);

    // 6.本段sync远端数据 SubscribeWithQuery
    LOG("%s 6.本端sync远端数据 SubscribeWithQuery", LOGSTR);
    std::vector<std::string> deviceList;
    deviceList.clear();
    DataQuery dataQuery;
    dataQuery.KeyPrefix("math");
    DisKvTest::SubscribeWithQuery(deviceList, dataQuery);

    // 7.本地get数据与float 9.99比较
    sleep(USLEEP_TIME_SUBSCRIBE);
    LOG("%s 7.本地get数据与float 9.99比较", LOGSTR);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS) << "LOGdisDataTest--ERR:Get(keyInt, valueRetInt)";
    float aaa = TransferByteArrayToType<float>(valueRetInt.Data());
    float delta = aaa - 9.99f;
    EXPECT_LE(std::fabs(delta), DEFDELTA) << "ERR:本地get数据与float 9.99比较";
    // 取消订阅
    auto unSubscribeStatus = DisKvTest::KvStorePtr->UnsubscribeWithQuery(deviceList, dataQuery);
    EXPECT_EQ(unSubscribeStatus, Status::SUCCESS) << "LOGdisDataTest--ERR:SubscribeWithQuery";
}

/**
 *  @tc.number: SubscribeWithQuery_0300
 *  @tc.name: SubscribeWithQuery
 *  @tc.desc: SubscribeWithQuery, double data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, SubscribeWithQuery_0300, TestSize.Level1)
{
    ZLOGI("SubscribeWithQuery_0300 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 1.本端创建Lv
    // 2.远端创建kv
    // 3.本端get数据,key不存在
    LOG("%s 3.本端get数据,key不存在 ", LOGSTR);
    Value valueInt;
    Key keyInt = "math_score_double";
    Status status = DisKvTest::KvStorePtr->Get(keyInt, valueInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR: 3.本端get数据失败,key不存在";

    // 4.远端put double 999.999
    LOG("%s 4.远端put double 999.999 ", LOGSTR);
    char strKV[MAX_DATA_LENGTH] = { "math_score_double:999.999" };
    DisKvTest::RemotePutData(strKV);

    // 5.远端get double 999.999
    LOG("%s 5.远端getdouble 999.999 ", LOGSTR);
    DisKvTest::RemoteGetData(strKV);

    // 6.本段sync远端数据 SubscribeWithQuery
    LOG("%s 6.本端sync远端数据 SubscribeWithQuery", LOGSTR);
    std::vector<std::string> deviceList;
    deviceList.clear();
    DataQuery dataQuery;
    dataQuery.KeyPrefix("math");
    DisKvTest::SubscribeWithQuery(deviceList, dataQuery);

    // 7.本地get数据与double 999.999比较
    sleep(USLEEP_TIME_SUBSCRIBE);
    LOG("%s 7.本地get数据与double 999.999比较", LOGSTR);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    double aaa = TransferByteArrayToType<double>(valueRetInt.Data());
    double delta = aaa - 999.999;
    std::cout << "aaa = " << aaa << std::endl;
    std::cout << "delta = " << delta << std::endl;
    EXPECT_LE(std::fabs(delta), DEFDELTA) << "ERR:本地get数据与double 999.999比较";

    // 取消订阅
    auto unSubscribeStatus = DisKvTest::KvStorePtr->UnsubscribeWithQuery(deviceList, dataQuery);
    EXPECT_EQ(unSubscribeStatus, Status::SUCCESS) << "LOGdisDataTest--ERR:SubscribeWithQuery";
}

/**
 *  @tc.number: SubscribeWithQuery_0400
 *  @tc.name: SubscribeWithQuery
 *  @tc.desc: SubscribeWithQuery, int64_t data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, SubscribeWithQuery_0400, TestSize.Level1)
{
    ZLOGI("SubscribeWithQuery_0400 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 1.本端创建Lv
    // 2.远端创建kv
    // 3.本端get数据,key不存在
    LOG("%s 3.本端get数据,key不存在 ", LOGSTR);
    Value valueInt;
    Key keyInt = "math_score_int64_t";
    Status status = DisKvTest::KvStorePtr->Get(keyInt, valueInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR: 3.本端get数据失败,key不存在";
    // 4.远端put int64_t:99889988
    LOG("%s 4.远端put int64_t:99889988 ", LOGSTR);
    char strKV[MAX_DATA_LENGTH] = { "math_score_int64_t:99889988" };
    DisKvTest::RemotePutData(strKV);

    // 5.远端get int64_t:99889988
    LOG("%s 5.远端get int64_t:99889988", LOGSTR);
    DisKvTest::RemoteGetData(strKV);

    // 6.本段sync远端数据 SubscribeWithQuery
    LOG("%s 6.本端sync远端数据 SubscribeWithQuery", LOGSTR);
    std::vector<std::string> deviceList;
    deviceList.clear();
    DataQuery dataQuery;
    dataQuery.KeyPrefix("math");
    DisKvTest::SubscribeWithQuery(deviceList, dataQuery);

    // 7.本地get数据与int64_t:99889988比较
    sleep(USLEEP_TIME_SUBSCRIBE);
    LOG("%s 7.本地get数据与int64_t:99889988比较", LOGSTR);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    int64_t aaa = TransferByteArrayToType<int64_t>(valueRetInt.Data());
    EXPECT_EQ(aaa, 99889988u) << "ERR: 本地get数据与int64_t:99889988比较";

    // 取消订阅
    auto unSubscribeStatus = DisKvTest::KvStorePtr->UnsubscribeWithQuery(deviceList, dataQuery);
    EXPECT_EQ(unSubscribeStatus, Status::SUCCESS) << "LOGdisDataTest--ERR:SubscribeWithQuery";
}

/**
 *  @tc.number: SubscribeWithQuery_0500
 *  @tc.name: SubscribeWithQuery
 *  @tc.desc: SubscribeWithQuery, size_t data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, SubscribeWithQuery_0500, TestSize.Level1)
{
    ZLOGI("SubscribeWithQuery_0500 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 1.本端创建Lv
    // 2.远端创建kv
    // 3.本端get数据,key不存在
    LOG("%s 3.本端get数据,key不存在 ", LOGSTR);
    Value valueInt;
    Key keyInt = "math_score_size_t";
    Status status = DisKvTest::KvStorePtr->Get(keyInt, valueInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR: 3.本端get数据失败,key不存在";
    // 4.远端put size_t:88
    LOG("%s 4.远端put size_t:88 ", LOGSTR);
    char strKV[MAX_DATA_LENGTH] = { "math_score_size_t:88" };

    DisKvTest::RemotePutData(strKV);

    // 5.远端get size_t:88
    LOG("%s 5.远端get size_t:88 ", LOGSTR);
    DisKvTest::RemoteGetData(strKV);

    // 6.本段sync远端数据 SubscribeWithQuery
    LOG("%s 6.本端sync远端数据 SubscribeWithQuery", LOGSTR);
    std::vector<std::string> deviceList;
    deviceList.clear();
    DataQuery dataQuery;
    dataQuery.KeyPrefix("math");
    DisKvTest::SubscribeWithQuery(deviceList, dataQuery);

    // 7.本地get数据与size_t:88比较
    sleep(USLEEP_TIME_SUBSCRIBE);
    LOG("%s 7.本地get数据与size_t:88比较", LOGSTR);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    size_t aaa = TransferByteArrayToType<size_t>(valueRetInt.Data());
    EXPECT_EQ(aaa, 88u) << "ERR:7.本地get数据与size_t:88比较";
    // 取消订阅
    auto unSubscribeStatus = DisKvTest::KvStorePtr->UnsubscribeWithQuery(deviceList, dataQuery);
    EXPECT_EQ(unSubscribeStatus, Status::SUCCESS) << "LOGdisDataTest--ERR:SubscribeWithQuery";
}

/**
 *  @tc.number: SubscribeWithQuery_0600
 *  @tc.name: SubscribeWithQuery
 *  @tc.desc: SubscribeWithQuery, string data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, SubscribeWithQuery_0600, TestSize.Level1)
{
    ZLOGI("SubscribeWithQuery_0600 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 1.本端创建Lv
    // 2.远端创建kv
    // 3.本端get数据,key不存在
    LOG("%s 3.本端get数据,key不存在 ", LOGSTR);
    Value valueInt;
    Key keyInt = "math_score_string";
    Status status = DisKvTest::KvStorePtr->Get(keyInt, valueInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR: 3.本端get数据失败,key不存在";

    // 4.远端put string
    LOG("%s 4.远端put string", LOGSTR);
    char strKV[MAX_DATA_LENGTH] = { "math_score_string:{\"class\":88, \"age\":99, \"gradle\":\"QQWWQQ\"}" };
    DisKvTest::RemotePutData(strKV);
    // 5.远端get string
    LOG("%s 5.远端get string ", LOGSTR);
    DisKvTest::RemoteGetData(strKV);
    // 6.本段sync远端数据 SubscribeWithQuery
    LOG("%s 6.本端sync远端数据 SubscribeWithQuery", LOGSTR);
    std::vector<std::string> deviceList;
    deviceList.clear();
    DataQuery dataQuery;
    dataQuery.KeyPrefix("math");
    DisKvTest::SubscribeWithQuery(deviceList, dataQuery);

    // 7.本地get数据与string比较
    sleep(USLEEP_TIME_SUBSCRIBE);
    LOG("%s 7.本地get数据与string比较", LOGSTR);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    std::string aaa = valueRetInt.ToString();
    std::string sstring = "{\"class\":88, \"age\":99, \"gradle\":\"QQWWQQ\"}";
    EXPECT_EQ(aaa, sstring) << "ERR: 7.本地get数据与string比较";
    // 取消订阅
    auto unSubscribeStatus = DisKvTest::KvStorePtr->UnsubscribeWithQuery(deviceList, dataQuery);
    EXPECT_EQ(unSubscribeStatus, Status::SUCCESS) << "LOGdisDataTest--ERR:SubscribeWithQuery";
}

/**
 *  @tc.number: SubscribeWithQuery_0700
 *  @tc.name: SubscribeWithQuery
 *  @tc.desc: SubscribeWithQuery, vector<uint8_t>  data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, SubscribeWithQuery_0700, TestSize.Level1)
{
    ZLOGI("SubscribeWithQuery_0700 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 1.本端创建Lv  2.远端创建kv
    // 3.本端get数据,key不存在
    LOG("%s 3.本端get数据,key不存在 ", LOGSTR);
    Value valueInt;
    Key keyInt = "math_score_vector";
    Status status = DisKvTest::KvStorePtr->Get(keyInt, valueInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR: 3.本端get数据失败,key不存在";
    // 4.远端put vect
    LOG("%s 4.远端put vect ", LOGSTR);
    std::string stringKey = "math_score_vector";
    keyInt = stringKey;
    std::vector<uint8_t> vect2 = { 9, 9, 8, 8, 7, 7, 6, 6 };
    std::string strvc;
    strvc.assign(vect2.begin(), vect2.end());

    char strKV[MAX_DATA_LENGTH] = { "math_score_int" };
    (void)strcpy_s(strKV, strlen(stringKey.c_str()) + 1, stringKey.c_str());
    (void)strcat_s(strKV, MAX_DATA_LENGTH, ":");
    (void)strcat_s(strKV, MAX_DATA_LENGTH, strvc.c_str());
    DisKvTest::RemotePutData(strKV);
    // 5.远端getvect
    LOG("%s 5.远端get vect ", LOGSTR);
    DisKvTest::RemoteGetData(strKV);
    // 6.本段sync远端数据 SubscribeWithQuery
    LOG("%s 6.本端sync远端数据 SubscribeWithQuery", LOGSTR);
    std::vector<std::string> deviceList;
    deviceList.clear();
    DataQuery dataQuery;
    dataQuery.KeyPrefix("math");
    DisKvTest::SubscribeWithQuery(deviceList, dataQuery);

    // 7.本地get数据与vect比较
    sleep(USLEEP_TIME_SUBSCRIBE);
    LOG("%s 7.本地get数据与vect比较", LOGSTR);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    std::string strValueRet = valueRetInt.ToString();
    EXPECT_EQ(strvc, strValueRet.c_str()) << "ERR: 7.本地get数据与vect比较";
    // 取消订阅
    auto unSubscribeStatus = DisKvTest::KvStorePtr->UnsubscribeWithQuery(deviceList, dataQuery);
    EXPECT_EQ(unSubscribeStatus, Status::SUCCESS) << "LOGdisDataTest--ERR:SubscribeWithQuery";
}

/**
 *  @tc.number: SyncWithCondition_0100
 *  @tc.name: SyncWithCondition
 *  @tc.desc: SyncWithCondition, int data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, SyncWithCondition_0100, TestSize.Level1)
{
    ZLOGI("SyncWithCondition_0100 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 1.本端创建Lv
    // 2.远端创建kv
    // 3.本端get数据,key不存在
    LOG("%s 3.本端get数据,key不存在 ", LOGSTR);
    Value valueInt;
    Key keyInt = "math_score_int";
    Status status = DisKvTest::KvStorePtr->Get(keyInt, valueInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR: 3.本端get数据失败,key不存在";

    // 4.远端put int 200
    LOG("%s 4.远端put int 200", LOGSTR);
    char strKV[MAX_DATA_LENGTH] = { "math_score_int" };
    (void)memset_s(strKV, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    (void)strcpy_s(strKV, strlen("math_score_int:200") + 1, "math_score_int:200");
    DisKvTest::RemotePutData(strKV);

    // 5.远端get int 200
    LOG("%s 5.远端get int 200 ", LOGSTR);
    DisKvTest::RemoteGetData(strKV);

    // 6.本端sync远端数据 SyncWithCondition
    LOG("%s 6.本端sync远端数据 SyncWithCondition", LOGSTR);
    std::vector<std::string> deviceList;
    deviceList.clear();
    DataQuery dataQuery;
    dataQuery.KeyPrefix("math");
    DisKvTest::SyncWithCondition(deviceList, dataQuery);

    // 7.本地get数据与200比较
    LOG("%s 7.本地get数据与200比较", LOGSTR);
    sleep(USLEEP_TIME);

    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    int aaa = TransferByteArrayToType<int>(valueRetInt.Data());
    std::cout << "7.本地get数据与200比较: aaa = " << aaa << std::endl;
    EXPECT_EQ(aaa, 200) << "ERR:本地get数据与200比较";
}

/**
 *  @tc.number: SyncWithCondition_0200
 *  @tc.name: SyncWithCondition
 *  @tc.desc: SyncWithCondition, float data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, SyncWithCondition_0200, TestSize.Level1)
{
    ZLOGI("SyncWithCondition_0200 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 1.本端创建Lv
    // 2.远端创建kv
    // 3.本端get数据,key不存在
    LOG("%s 3.本端get数据,key不存在 ", LOGSTR);
    Value valueInt;
    Key keyInt = "math_score_float";
    Status status = DisKvTest::KvStorePtr->Get(keyInt, valueInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR: 3.本端get数据失败,key不存在";

    // 4.远端put float 9.99
    LOG("%s 4.远端put float 9.99 ", LOGSTR);
    char strKV[MAX_DATA_LENGTH] = { "math_score_float:9.99" };
    DisKvTest::RemotePutData(strKV);

    // 5.远端get 9.99
    LOG("%s 5.远端get float 9.99 ", LOGSTR);
    DisKvTest::RemoteGetData(strKV);

    // 6.本端sync远端数据 SyncWithCondition
    LOG("%s 6.本端sync远端数据 SyncWithCondition", LOGSTR);
    std::vector<std::string> deviceList;
    deviceList.clear();
    DataQuery dataQuery;
    dataQuery.KeyPrefix("math");
    DisKvTest::SyncWithCondition(deviceList, dataQuery);

    // 7.本地get数据与float 9.99比较
    sleep(USLEEP_TIME_SUBSCRIBE);
    LOG("%s 7.本地get数据与float 9.99比较", LOGSTR);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS) << "LOGdisDataTest--ERR:Get(keyInt, valueRetInt)";
    float aaa = TransferByteArrayToType<float>(valueRetInt.Data());
    float delta = aaa - 9.99f;
    EXPECT_LE(std::fabs(delta), DEFDELTA) << "ERR:本地get数据与float 9.99比较";
}

/**
 *  @tc.number: SyncWithCondition_0300
 *  @tc.name: SyncWithCondition
 *  @tc.desc: SyncWithCondition, double data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, SyncWithCondition_0300, TestSize.Level1)
{
    ZLOGI("SyncWithCondition_0300 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 1.本端创建Lv
    // 2.远端创建kv
    // 3.本端get数据,key不存在
    LOG("%s 3.本端get数据,key不存在 ", LOGSTR);
    Value valueInt;
    Key keyInt = "math_score_double";
    Status status = DisKvTest::KvStorePtr->Get(keyInt, valueInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR: 3.本端get数据失败,key不存在";

    // 4.远端put double 999.999
    LOG("%s 4.远端put double 999.999 ", LOGSTR);
    char strKV[MAX_DATA_LENGTH] = { "math_score_double:999.999" };
    DisKvTest::RemotePutData(strKV);

    // 5.远端get double 999.999
    LOG("%s 5.远端getdouble 999.999 ", LOGSTR);
    DisKvTest::RemoteGetData(strKV);

    // 6.本端sync远端数据 SyncWithCondition
    LOG("%s 6.本端sync远端数据 SyncWithCondition", LOGSTR);
    std::vector<std::string> deviceList;
    deviceList.clear();
    DataQuery dataQuery;
    dataQuery.KeyPrefix("math");
    DisKvTest::SyncWithCondition(deviceList, dataQuery);

    // 7.本地get数据与double 999.999比较
    sleep(USLEEP_TIME_SUBSCRIBE);
    LOG("%s 7.本地get数据与double 999.999比较", LOGSTR);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    double aaa = TransferByteArrayToType<double>(valueRetInt.Data());
    double delta = aaa - 999.999;
    std::cout << "aaa = " << aaa << std::endl;
    std::cout << "delta = " << delta << std::endl;
    EXPECT_LE(std::fabs(delta), DEFDELTA) << "ERR:本地get数据与double 999.999比较";
}

/**
 *  @tc.number: SyncWithCondition_0400
 *  @tc.name: SyncWithCondition
 *  @tc.desc: SyncWithCondition, int64_t data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, SyncWithCondition_0400, TestSize.Level1)
{
    ZLOGI("SyncWithCondition_0400 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 1.本端创建Lv
    // 2.远端创建kv
    // 3.本端get数据,key不存在
    LOG("%s 3.本端get数据,key不存在 ", LOGSTR);
    Value valueInt;
    Key keyInt = "math_score_int64_t";
    Status status = DisKvTest::KvStorePtr->Get(keyInt, valueInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR: 3.本端get数据失败,key不存在";

    // 4.远端put int64_t:99889988
    LOG("%s 4.远端put int64_t:99889988 ", LOGSTR);
    char strKV[MAX_DATA_LENGTH] = { "math_score_int64_t:99889988" };
    DisKvTest::RemotePutData(strKV);

    // 5.远端get int64_t:99889988
    LOG("%s 5.远端get int64_t:99889988", LOGSTR);
    DisKvTest::RemoteGetData(strKV);

    // 6.本端sync远端数据 SyncWithCondition
    LOG("%s 6.本端sync远端数据 SyncWithCondition", LOGSTR);
    std::vector<std::string> deviceList;
    deviceList.clear();
    DataQuery dataQuery;
    dataQuery.KeyPrefix("math");
    DisKvTest::SyncWithCondition(deviceList, dataQuery);

    // 7.本地get数据与int64_t:99889988比较
    sleep(USLEEP_TIME_SUBSCRIBE);
    LOG("%s 7.本地get数据与int64_t:99889988比较", LOGSTR);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    int64_t aaa = TransferByteArrayToType<int64_t>(valueRetInt.Data());
    EXPECT_EQ(aaa, 99889988u) << "ERR: 本地get数据与int64_t:99889988比较";
}

/**
 *  @tc.number: SyncWithCondition_0500
 *  @tc.name: SyncWithCondition
 *  @tc.desc: SyncWithCondition, size_t data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, SyncWithCondition_0500, TestSize.Level1)
{
    ZLOGI("SyncWithCondition_0500 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 1.本端创建Lv
    // 2.远端创建kv
    // 3.本端get数据,key不存在
    LOG("%s 3.本端get数据,key不存在 ", LOGSTR);
    Value valueInt;
    Key keyInt = "math_score_size_t";
    Status status = DisKvTest::KvStorePtr->Get(keyInt, valueInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR: 3.本端get数据失败,key不存在";

    // 4.远端put size_t:88
    LOG("%s 4.远端put size_t:88 ", LOGSTR);
    char strKV[MAX_DATA_LENGTH] = { "math_score_size_t:88" };
    DisKvTest::RemotePutData(strKV);

    // 5.远端get size_t:88
    LOG("%s 5.远端get size_t:88 ", LOGSTR);
    DisKvTest::RemoteGetData(strKV);

    // 6.本端sync远端数据 SyncWithCondition
    LOG("%s 6.本端sync远端数据 SyncWithCondition", LOGSTR);
    std::vector<std::string> deviceList;
    deviceList.clear();
    DataQuery dataQuery;
    dataQuery.KeyPrefix("math");
    DisKvTest::SyncWithCondition(deviceList, dataQuery);

    // 7.本地get数据与size_t:88比较
    sleep(USLEEP_TIME_SUBSCRIBE);
    LOG("%s 7.本地get数据与size_t:88比较", LOGSTR);

    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    size_t aaa = TransferByteArrayToType<size_t>(valueRetInt.Data());
    EXPECT_EQ(aaa, 88u) << "ERR:7.本地get数据与size_t:88比较";
}

/**
 *  @tc.number: SyncWithCondition_0600
 *  @tc.name: SyncWithCondition
 *  @tc.desc: SyncWithCondition, string data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, SyncWithCondition_0600, TestSize.Level1)
{
    ZLOGI("SyncWithCondition_0600 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 1.本端创建Lv
    // 2.远端创建kv
    // 3.本端get数据,key不存在
    LOG("%s 3.本端get数据,key不存在 ", LOGSTR);
    Value valueInt;
    Key keyInt = "math_score_string";
    Status status = DisKvTest::KvStorePtr->Get(keyInt, valueInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR: 3.本端get数据失败,key不存在";

    // 4.远端put string
    LOG("%s 4.远端put string", LOGSTR);
    char strKV[MAX_DATA_LENGTH] = { "math_score_string:{\"class\":88, \"age\":99, \"gradle\":\"QQWWQQ\"}" };
    DisKvTest::RemotePutData(strKV);

    // 5.远端get string
    LOG("%s 5.远端get string ", LOGSTR);
    DisKvTest::RemoteGetData(strKV);

    // 6.本端sync远端数据 SyncWithCondition
    LOG("%s 6.本端sync远端数据 SyncWithCondition", LOGSTR);
    std::vector<std::string> deviceList;
    deviceList.clear();
    DataQuery dataQuery;
    dataQuery.KeyPrefix("math");
    DisKvTest::SyncWithCondition(deviceList, dataQuery);

    // 7.本地get数据与string比较
    sleep(USLEEP_TIME_SUBSCRIBE);
    LOG("%s 7.本地get数据与string比较", LOGSTR);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    std::string aaa = valueRetInt.ToString();
    std::string sstring = "{\"class\":88, \"age\":99, \"gradle\":\"QQWWQQ\"}";
    EXPECT_EQ(aaa, sstring) << "ERR: 7.本地get数据与string比较";
}

/**
 *  @tc.number: SyncWithCondition_0700
 *  @tc.name: SyncWithCondition
 *  @tc.desc: SyncWithCondition, vector<uint8_t>  data
 *  @tc.type: FUNC
 */
HWTEST_F(DistributedKvDataManagerTest, SyncWithCondition_0700, TestSize.Level1)
{
    ZLOGI("SyncWithCondition_0700 begin.");
    EXPECT_EQ(Status::SUCCESS, DisKvTest::statusGetKvStore) << "statusGetKvStore return wrong status";
    ASSERT_NE(nullptr, DisKvTest::KvStorePtr) << "KvStorePtr is nullptr";
    // 1.本端创建Lv  2.远端创建kv
    // 3.本端get数据,key不存在
    LOG("%s 3.本端get数据,key不存在 ", LOGSTR);
    Value valueInt;
    Key keyInt = "math_score_vector";
    Status status = DisKvTest::KvStorePtr->Get(keyInt, valueInt);
    EXPECT_EQ(status, Status::KEY_NOT_FOUND) << "ERR: 3.本端get数据失败,key不存在";
    // 4.远端put vect
    LOG("%s 4.远端put vect ", LOGSTR);
    std::string stringKey = "math_score_vector";
    keyInt = stringKey;

    std::vector<uint8_t> vect2 = { 9, 9, 8, 8, 7, 7, 6, 6 };
    std::string strvc;
    strvc.assign(vect2.begin(), vect2.end());
    char strKV[MAX_DATA_LENGTH] = { "math_score_int" };
    (void)strcpy_s(strKV, strlen(stringKey.c_str()) + 1, stringKey.c_str());
    (void)strcat_s(strKV, MAX_DATA_LENGTH, ":");
    (void)strcat_s(strKV, MAX_DATA_LENGTH, strvc.c_str());
    std::cout << "strvc = " << strvc << std::endl;
    std::cout << "strvc.c_str() = " << strvc.c_str() << std::endl;
    std::cout << "strKV = " << strKV << std::endl;
    DisKvTest::RemotePutData(strKV);

    // 5.远端getvect
    LOG("%s 5.远端get vect ", LOGSTR);
    DisKvTest::RemoteGetData(strKV);
    // 6.本端sync远端数据 SyncWithCondition
    LOG("%s 6.本端sync远端数据 SyncWithCondition", LOGSTR);
    std::vector<std::string> deviceList;
    deviceList.clear();
    DataQuery dataQuery;
    dataQuery.KeyPrefix("math");
    DisKvTest::SyncWithCondition(deviceList, dataQuery);
    // 7.本地get数据与vect比较
    sleep(USLEEP_TIME_SUBSCRIBE);
    LOG("%s 7.本地get数据与vect比较", LOGSTR);
    Value valueRetInt;
    status = DisKvTest::KvStorePtr->Get(keyInt, valueRetInt);
    EXPECT_EQ(status, Status::SUCCESS);
    std::string strValueRet = valueRetInt.ToString();
    EXPECT_EQ(strvc, strValueRet.c_str()) << "ERR: 7.本地get数据与vect比较";
}
