/*
 * Copyright (c) 2023-2024 Huawei Device Co., Ltd.
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

#define PRIVATE   public
#define PROTECTED public
#include <string>
#include <vector>
#include <new>
#include "gtest/gtest.h"
#include "refbase.h"
#include "iremote_stub.h"
#include "distributed_device_profile_constants.h"
#include "distributed_device_profile_errors.h"
#include "distributed_device_profile_log.h"
#include "distributed_device_profile_enums.h"
#include "device_profile.h"
#include "service_profile.h"
#include "content_sensor_manager_utils.h"
#include "characteristic_profile.h"
#include "i_sync_completed_callback.h"
#include "sync_completed_callback_stub.h"
#include "device_profile_manager.h"
#include "kv_adapter.h"
#include "profile_cache.h"
#include "accesstoken_kit.h"
#include "nativetoken_kit.h"
#include "token_setproc.h"
#undef PRIVATE
#undef PROTECTED

namespace OHOS {
namespace DistributedDeviceProfile {
using namespace OHOS::Security::AccessToken;
using namespace testing::ext;
using namespace std;

static constexpr int32_t DEFAULT_API_VERSION = 8;

static PermissionStateFull g_testState = {
    .permissionName = "ohos.permission.DISTRIBUTED_SOFTBUS_CENTER",
    .isGeneral = true,
    .resDeviceID = {"local"},
    .grantStatus = {PermissionState::PERMISSION_GRANTED},
    .grantFlags = {1}
};

static PermissionStateFull g_testState1 = {
    .permissionName = "ohos.permission.DISTRIBUTED_DATASYNC",
    .isGeneral = true,
    .resDeviceID = {"local"},
    .grantStatus = {PermissionState::PERMISSION_GRANTED},
    .grantFlags = {1}
};

static HapPolicyParams g_PolicyPramsl = {
    .apl = APL_NORMAL,
    .domain = "test.domain.A",
    .permList = {},
    .permStateList = {g_testState, g_testState1}
};

class DeviceProfileManagerTest : public testing::Test {
public:
    static void SetUpTestCase(void);
    static void TearDownTestCase(void);
    void SetUp();
    void TearDown();
};

void DeviceProfileManagerTest::SetUpTestCase(void)
{
    HapInfoParams info = {
        .userID = 1,
        .bundleName = "DctsDpTest",
        .instIndex = 0,
        .appIDDesc = "testtesttesttest",
        .apiVersion = DEFAULT_API_VERSION,
        .isSystemApp = true
    };
    AccessTokenIDEx tokenIdEx = {0};
    tokenIdEx = AccessTokenKit::AllocHapToken(info, g_PolicyPramsl);
    SetSelfTokenID(tokenIdEx.tokenIDEx);
    sleep(NUM_2);
}

void DeviceProfileManagerTest::TearDownTestCase(void) {
}

void DeviceProfileManagerTest::SetUp()
{
    DeviceProfileManager::GetInstance().Init();
}

void DeviceProfileManagerTest::TearDown()
{
    DeviceProfileManager::GetInstance().UnInit();
}

class SyncCallback : public SyncCompletedCallbackStub {
public:
    void OnSyncCompleted(const map<string, SyncStatus>& syncResults) {
    }
};

/**
 * @tc.name: SUB_DH_DDp_Dcts_0100
 * @tc.desc: Init succeed.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_0100, TestSize.Level1)
{
    DeviceProfileManager::GetInstance().UnInit();
    int32_t ret = DeviceProfileManager::GetInstance().Init();
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_0200
 * @tc.desc: UnInit succeed.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_0200, TestSize.Level1)
{
    int32_t ret = DeviceProfileManager::GetInstance().UnInit();
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_0300
 * @tc.desc: ReInit succeed.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_0300, TestSize.Level1)
{
    int32_t ret = DeviceProfileManager::GetInstance().ReInit();
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_0400
 * @tc.desc: PutServiceProfile succeed.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_0400, TestSize.Level1)
{
    string deviceId = ContentSensorManagerUtils::GetInstance().ObtainLocalUdid();

    ServiceProfile serviceProfile;
    serviceProfile.SetDeviceId(deviceId);
    serviceProfile.SetServiceName("serviceName");
    serviceProfile.SetServiceType("serviceType");
    
    int32_t ret = DeviceProfileManager::GetInstance().PutServiceProfile(serviceProfile);
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_0500
 * @tc.desc: PutServiceProfile failed, the profile is invalid.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_0500, TestSize.Level1)
{
    ServiceProfile serviceProfile;
    serviceProfile.SetDeviceId("");
    serviceProfile.SetServiceName("serviceName");
    serviceProfile.SetServiceType("serviceType");
    
    int32_t ret = DeviceProfileManager::GetInstance().PutServiceProfile(serviceProfile);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_0600
 * @tc.desc: PutServiceProfile failed, the profile is exist.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_0600, TestSize.Level1)
{
    string deviceId = ContentSensorManagerUtils::GetInstance().ObtainLocalUdid();

    ServiceProfile serviceProfile1;
    serviceProfile1.SetDeviceId(deviceId);
    serviceProfile1.SetServiceName("serviceName");
    serviceProfile1.SetServiceType("serviceType");

    ServiceProfile serviceProfile2;
    serviceProfile2.SetDeviceId(deviceId);
    serviceProfile2.SetServiceName("serviceName");
    serviceProfile2.SetServiceType("serviceType");
    
    DeviceProfileManager::GetInstance().PutServiceProfile(serviceProfile1);
    int32_t ret = DeviceProfileManager::GetInstance().PutServiceProfile(serviceProfile2);
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_0700
 * @tc.desc: PutServiceProfile failed, deviceProfileStore is nullptr.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_0700, TestSize.Level1)
{
    string deviceId = ContentSensorManagerUtils::GetInstance().ObtainLocalUdid();

    ServiceProfile serviceProfile10;
    serviceProfile10.SetDeviceId(deviceId);
    serviceProfile10.SetServiceName("serviceName10");
    serviceProfile10.SetServiceType("serviceType10");
    
    DeviceProfileManager::GetInstance().deviceProfileStore_ = nullptr;
    DeviceProfileManager::GetInstance().isFirst_.store(true);
    int32_t ret = DeviceProfileManager::GetInstance().PutServiceProfile(serviceProfile10);
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_0800
 * @tc.desc: PutServiceProfile failed, PutServiceProfile fail.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_0800, TestSize.Level1)
{
    string deviceId = ContentSensorManagerUtils::GetInstance().ObtainLocalUdid();

    ServiceProfile serviceProfile11;
    serviceProfile11.SetDeviceId(deviceId);
    serviceProfile11.SetServiceName("serviceName11");
    serviceProfile11.SetServiceType("serviceType11");

    DeviceProfileManager::GetInstance().deviceProfileStore_->UnInit();
    DeviceProfileManager::GetInstance().isFirst_.store(true);
    int32_t ret = DeviceProfileManager::GetInstance().PutServiceProfile(serviceProfile11);
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_0900
 * @tc.desc: PutServiceProfileBatch succeed.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_0900, TestSize.Level1)
{
    string deviceId = ContentSensorManagerUtils::GetInstance().ObtainLocalUdid();

    vector<ServiceProfile> serviceProfiles;
    ServiceProfile serviceProfile1;
    serviceProfile1.SetDeviceId(deviceId);
    serviceProfile1.SetServiceName("serviceName2");
    serviceProfile1.SetServiceType("serviceType2");
    serviceProfiles.push_back(serviceProfile1);

    ServiceProfile serviceProfile2;
    serviceProfile2.SetDeviceId(deviceId);
    serviceProfile2.SetServiceName("serviceName3");
    serviceProfile2.SetServiceType("serviceType3");
    serviceProfiles.push_back(serviceProfile2);
    
    int32_t ret = DeviceProfileManager::GetInstance().PutServiceProfileBatch(serviceProfiles);
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_1000
 * @tc.desc: PutServiceProfileBatch succeed, but first profile is invalid.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_1000, TestSize.Level1)
{
    string deviceId = ContentSensorManagerUtils::GetInstance().ObtainLocalUdid();

    vector<ServiceProfile> serviceProfiles;
    ServiceProfile serviceProfile1;
    serviceProfile1.SetDeviceId("");
    serviceProfile1.SetServiceName("serviceName");
    serviceProfile1.SetServiceType("serviceType");
    serviceProfiles.push_back(serviceProfile1);

    ServiceProfile serviceProfile4;
    serviceProfile4.SetDeviceId(deviceId);
    serviceProfile4.SetServiceName("serviceName4");
    serviceProfile4.SetServiceType("serviceType4");
    serviceProfiles.push_back(serviceProfile4);
    
    int32_t ret = DeviceProfileManager::GetInstance().PutServiceProfileBatch(serviceProfiles);
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_1100
 * @tc.desc: PutCharacteristicProfile succeed.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_1100, TestSize.Level1)
{
    string deviceId = ContentSensorManagerUtils::GetInstance().ObtainLocalUdid();

    CharacteristicProfile charProfile;
    charProfile.SetDeviceId(deviceId);
    charProfile.SetServiceName("serviceName");
    charProfile.SetCharacteristicKey("characteristicKey");
    charProfile.SetCharacteristicValue("characteristicValue");
    
    int32_t ret = DeviceProfileManager::GetInstance().PutCharacteristicProfile(charProfile);
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_1200
 * @tc.desc: PutCharacteristicProfile failed, the profile is invalid.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_1200, TestSize.Level1)
{
    CharacteristicProfile charProfile;
    charProfile.SetDeviceId("");
    charProfile.SetServiceName("serviceName");
    charProfile.SetCharacteristicKey("characteristicKey");
    charProfile.SetCharacteristicValue("characteristicValue");
    
    int32_t ret = DeviceProfileManager::GetInstance().PutCharacteristicProfile(charProfile);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_1300
 * @tc.desc: PutCharacteristicProfile failed, the profile is exist.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_1300, TestSize.Level1)
{
    string deviceId = ContentSensorManagerUtils::GetInstance().ObtainLocalUdid();

    CharacteristicProfile charProfile1;
    charProfile1.SetDeviceId(deviceId);
    charProfile1.SetServiceName("serviceName");
    charProfile1.SetCharacteristicKey("characteristicKey");
    charProfile1.SetCharacteristicValue("characteristicValue");

    CharacteristicProfile charProfile2;
    charProfile2.SetDeviceId(deviceId);
    charProfile2.SetServiceName("serviceName");
    charProfile2.SetCharacteristicKey("characteristicKey");
    charProfile2.SetCharacteristicValue("characteristicValue");
    
    DeviceProfileManager::GetInstance().PutCharacteristicProfile(charProfile1);
    int32_t ret = DeviceProfileManager::GetInstance().PutCharacteristicProfile(charProfile2);
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_1400
 * @tc.desc: PutCharacteristicProfile failed, deviceProfileStore is nullptr.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_1400, TestSize.Level1)
{
    CharacteristicProfile charProfile10;
    charProfile10.SetDeviceId("deviceId10");
    charProfile10.SetServiceName("serviceName10");
    charProfile10.SetCharacteristicKey("characteristicKey10");
    charProfile10.SetCharacteristicValue("characteristicValue10");
    
    DeviceProfileManager::GetInstance().deviceProfileStore_ = nullptr;
    int32_t ret = DeviceProfileManager::GetInstance().PutCharacteristicProfile(charProfile10);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_1500
 * @tc.desc: PutCharacteristicProfile failed, PutCharacteristicProfile fail.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_1500, TestSize.Level1)
{
    string deviceId = ContentSensorManagerUtils::GetInstance().ObtainLocalUdid();

    CharacteristicProfile charProfile11;
    charProfile11.SetDeviceId(deviceId);
    charProfile11.SetServiceName("serviceName11");
    charProfile11.SetCharacteristicKey("characteristicKey11");
    charProfile11.SetCharacteristicValue("characteristicValue11");

    DeviceProfileManager::GetInstance().deviceProfileStore_->UnInit();
    DeviceProfileManager::GetInstance().isFirst_.store(true);
    int32_t ret = DeviceProfileManager::GetInstance().PutCharacteristicProfile(charProfile11);
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_1600
 * @tc.desc: PutCharacteristicProfileBatch succeed.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_1600, TestSize.Level1)
{
    string deviceId = ContentSensorManagerUtils::GetInstance().ObtainLocalUdid();

    vector<CharacteristicProfile> charProfiles;
    CharacteristicProfile charProfile1;
    charProfile1.SetDeviceId(deviceId);
    charProfile1.SetServiceName("serviceName2");
    charProfile1.SetCharacteristicKey("characteristicKey2");
    charProfile1.SetCharacteristicValue("characteristicValue2");
    charProfiles.push_back(charProfile1);

    CharacteristicProfile charProfile2;
    charProfile2.SetDeviceId(deviceId);
    charProfile2.SetServiceName("serviceName3");
    charProfile2.SetCharacteristicKey("characteristicKey3");
    charProfile2.SetCharacteristicValue("characteristicValue3");
    charProfiles.push_back(charProfile2);
    
    int32_t ret = DeviceProfileManager::GetInstance().PutCharacteristicProfileBatch(charProfiles);
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_1700
 * @tc.desc: PutCharacteristicProfileBatch succeed, but first profile is invalid.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_1700, TestSize.Level1)
{
    string deviceId = ContentSensorManagerUtils::GetInstance().ObtainLocalUdid();

    vector<CharacteristicProfile> charProfiles;
    CharacteristicProfile charProfile1;
    charProfile1.SetDeviceId("");
    charProfile1.SetServiceName("serviceName");
    charProfile1.SetCharacteristicKey("characteristicKey");
    charProfile1.SetCharacteristicValue("characteristicValue");
    charProfiles.push_back(charProfile1);

    CharacteristicProfile charProfile4;
    charProfile4.SetDeviceId(deviceId);
    charProfile4.SetServiceName("serviceName4");
    charProfile4.SetCharacteristicKey("characteristicKey4");
    charProfile4.SetCharacteristicValue("characteristicValue4");
    charProfiles.push_back(charProfile4);
    
    int32_t ret = DeviceProfileManager::GetInstance().PutCharacteristicProfileBatch(charProfiles);
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_1800
 * @tc.desc: GetDeviceProfile succeed, GetDeviceProfile in cache.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_1800, TestSize.Level1)
{
    DeviceProfile deviceProfile2;
    deviceProfile2.SetDeviceId("anything2");
    deviceProfile2.SetDeviceTypeName("anything");
    deviceProfile2.SetDeviceTypeId(0);
    deviceProfile2.SetDeviceName("anything");
    deviceProfile2.SetManufactureName("anything");
    deviceProfile2.SetDeviceModel("anything");
    deviceProfile2.SetStorageCapability(1);
    deviceProfile2.SetOsSysCap("anything");
    deviceProfile2.SetOsApiLevel(1);
    deviceProfile2.SetOsVersion("anything");
    deviceProfile2.SetOsType(1);
    DeviceProfileManager::GetInstance().PutDeviceProfile(deviceProfile2);

    string deviceId = "anything2";
    DeviceProfile outDeviceProfile;
    int32_t ret = DeviceProfileManager::GetInstance().GetDeviceProfile(deviceId, outDeviceProfile);
    EXPECT_EQ(ret, DP_GET_KV_DB_FAIL);

    string outDeviceId = outDeviceProfile.GetDeviceId();
    outDeviceProfile.GetDeviceTypeName();
    outDeviceProfile.GetDeviceTypeId();
    outDeviceProfile.GetDeviceName();
    outDeviceProfile.GetManufactureName();
    outDeviceProfile.GetDeviceModel();
    outDeviceProfile.GetStorageCapability();
    outDeviceProfile.GetOsSysCap();
    outDeviceProfile.GetOsApiLevel();
    outDeviceProfile.GetOsVersion();
    outDeviceProfile.GetOsType();
    EXPECT_EQ(outDeviceId, "");
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_1900
 * @tc.desc: GetDeviceProfile failed, the profile is invalid.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_1900, TestSize.Level1)
{
    string deviceId = "";
    DeviceProfile outDeviceProfile;
    int32_t ret = DeviceProfileManager::GetInstance().GetDeviceProfile(deviceId, outDeviceProfile);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_2000
 * @tc.desc: GetDeviceProfile failed, deviceProfileStore is nullptr.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_2000, TestSize.Level1)
{
    string deviceId = "anything12";
    DeviceProfileManager::GetInstance().deviceProfileStore_ = nullptr;
    DeviceProfile outDeviceProfile;
    int32_t ret = DeviceProfileManager::GetInstance().GetDeviceProfile(deviceId, outDeviceProfile);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_2100
 * @tc.desc: GetDeviceProfile failed, Get data fail.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_2100, TestSize.Level1)
{
    string deviceId = "anything13";
    DeviceProfileManager::GetInstance().deviceProfileStore_->UnInit();
    DeviceProfile outDeviceProfile;
    int32_t ret = DeviceProfileManager::GetInstance().GetDeviceProfile(deviceId, outDeviceProfile);
    EXPECT_EQ(ret, DP_GET_KV_DB_FAIL);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_2200
 * @tc.desc: GetServiceProfile succeed, GetServiceProfile in cache.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_2200, TestSize.Level1)
{
    ServiceProfile serviceProfile5;
    serviceProfile5.SetDeviceId("deviceId5");
    serviceProfile5.SetServiceName("serviceName5");
    serviceProfile5.SetServiceType("serviceType5");
    DeviceProfileManager::GetInstance().PutServiceProfile(serviceProfile5);

    string deviceId = "deviceId5";
    string serviceName = "serviceName5";
    ServiceProfile outServiceProfile;
    int32_t ret = DeviceProfileManager::GetInstance().GetServiceProfile(deviceId, serviceName, outServiceProfile);
    EXPECT_EQ(ret, DP_GET_KV_DB_FAIL);

    string outDeviceId = outServiceProfile.GetDeviceId();
    outServiceProfile.GetServiceName();
    outServiceProfile.GetServiceType();
    EXPECT_EQ(outDeviceId, "");
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_2300
 * @tc.desc: GetServiceProfile failed, the profile is invalid.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_2300, TestSize.Level1)
{
    string deviceId = "";
    string serviceName = "serviceName";
    ServiceProfile outServiceProfile;
    int32_t ret = DeviceProfileManager::GetInstance().GetServiceProfile(deviceId, serviceName, outServiceProfile);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
    
    deviceId = "deviceId";
    serviceName = "";
    ret = DeviceProfileManager::GetInstance().GetServiceProfile(deviceId, serviceName, outServiceProfile);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_2400
 * @tc.desc: GetServiceProfile failed, deviceProfileStore is nullptr.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_2400, TestSize.Level1)
{
    string deviceId = "deviceId12";
    string serviceName = "serviceName12";
    DeviceProfileManager::GetInstance().deviceProfileStore_ = nullptr;
    ServiceProfile outServiceProfile;
    int32_t ret = DeviceProfileManager::GetInstance().GetServiceProfile(deviceId, serviceName, outServiceProfile);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_2500
 * @tc.desc: GetServiceProfile failed, Get data fail.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_2500, TestSize.Level1)
{
    string deviceId = "deviceId13";
    string serviceName = "serviceName13";
    DeviceProfileManager::GetInstance().deviceProfileStore_->UnInit();
    ServiceProfile outServiceProfile;
    int32_t ret = DeviceProfileManager::GetInstance().GetServiceProfile(deviceId, serviceName, outServiceProfile);
    EXPECT_EQ(ret, DP_GET_KV_DB_FAIL);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_2600
 * @tc.desc: GetCharacteristicProfile succeed, GetCharProfile in cache.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_2600, TestSize.Level1)
{
    CharacteristicProfile charProfile5;
    charProfile5.SetDeviceId("deviceId5");
    charProfile5.SetServiceName("serviceName5");
    charProfile5.SetCharacteristicKey("characteristicKey5");
    charProfile5.SetCharacteristicValue("characteristicValue5");
    DeviceProfileManager::GetInstance().PutCharacteristicProfile(charProfile5);

    string deviceId = "deviceId5";
    string serviceName = "serviceName5";
    string characteristicKey = "characteristicKey5";
    CharacteristicProfile outCharProfile;
    int32_t ret = DeviceProfileManager::GetInstance().GetCharacteristicProfile(deviceId, serviceName,
        characteristicKey, outCharProfile);
    EXPECT_EQ(ret, DP_GET_KV_DB_FAIL);
    
    string outDeviceId = outCharProfile.GetDeviceId();
    outCharProfile.GetServiceName();
    outCharProfile.GetCharacteristicKey();
    outCharProfile.GetCharacteristicValue();
    EXPECT_EQ(outDeviceId, "");
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_2700
 * @tc.desc: GetCharacteristicProfile failed, the profile is invalid.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_2700, TestSize.Level1)
{
    string deviceId = "";
    string serviceName = "serviceName";
    string characteristicKey = "characteristicKey";
    CharacteristicProfile outCharProfile;
    int32_t ret = DeviceProfileManager::GetInstance().GetCharacteristicProfile(deviceId, serviceName,
        characteristicKey, outCharProfile);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
    
    deviceId = "deviceId";
    serviceName = "serviceName";
    characteristicKey = "";
    ret = DeviceProfileManager::GetInstance().GetCharacteristicProfile(deviceId, serviceName,
        characteristicKey, outCharProfile);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_2800
 * @tc.desc: GetCharacteristicProfile failed, deviceProfileStore is nullptr.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_2800, TestSize.Level1)
{
    string deviceId = "deviceId12";
    string serviceName = "serviceName12";
    string characteristicKey = "characteristicKey12";
    DeviceProfileManager::GetInstance().deviceProfileStore_ = nullptr;
    CharacteristicProfile outCharProfile;
    int32_t ret = DeviceProfileManager::GetInstance().GetCharacteristicProfile(deviceId, serviceName,
        characteristicKey, outCharProfile);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_2900
 * @tc.desc: GetCharacteristicProfile failed, Get data fail.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_2900, TestSize.Level1)
{
    string deviceId = "deviceId13";
    string serviceName = "serviceName13";
    string characteristicKey = "characteristicKey13";
    DeviceProfileManager::GetInstance().deviceProfileStore_->UnInit();
    CharacteristicProfile outCharProfile;
    int32_t ret = DeviceProfileManager::GetInstance().GetCharacteristicProfile(deviceId, serviceName,
        characteristicKey, outCharProfile);
    EXPECT_EQ(ret, DP_GET_KV_DB_FAIL);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_3000
 * @tc.desc: DeleteServiceProfile succeed.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_3000, TestSize.Level1)
{
    string deviceId = ContentSensorManagerUtils::GetInstance().ObtainLocalUdid();

    ServiceProfile serviceProfile6;
    serviceProfile6.SetDeviceId(deviceId);
    serviceProfile6.SetServiceName("serviceName6");
    serviceProfile6.SetServiceType("serviceType6");
    DeviceProfileManager::GetInstance().PutServiceProfile(serviceProfile6);

    string serviceName = "serviceName6";
    int32_t ret = DeviceProfileManager::GetInstance().DeleteServiceProfile(deviceId, serviceName);
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_3100
 * @tc.desc: DeleteServiceProfile failed, the profile is invalid.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_3100, TestSize.Level1)
{
    string deviceId = "";
    string serviceName = "serviceName";
    int32_t ret = DeviceProfileManager::GetInstance().DeleteServiceProfile(deviceId, serviceName);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
    
    deviceId = "deviceId";
    serviceName = "";
    ret = DeviceProfileManager::GetInstance().DeleteServiceProfile(deviceId, serviceName);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_3200
 * @tc.desc: DeleteServiceProfile failed, deviceProfileStore is nullptr.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_3200, TestSize.Level1)
{
    string deviceId = "deviceId14";
    string serviceName = "serviceName14";
    DeviceProfileManager::GetInstance().deviceProfileStore_ = nullptr;
    int32_t ret = DeviceProfileManager::GetInstance().DeleteServiceProfile(deviceId, serviceName);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_3300
 * @tc.desc: DeleteServiceProfile failed, DeleteServiceProfile fail.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_3300, TestSize.Level1)
{
    string deviceId = ContentSensorManagerUtils::GetInstance().ObtainLocalUdid();

    string serviceName = "serviceName15";
    DeviceProfileManager::GetInstance().deviceProfileStore_->UnInit();
    int32_t ret = DeviceProfileManager::GetInstance().DeleteServiceProfile(deviceId, serviceName);
    EXPECT_EQ(ret, DP_DEL_KV_DB_FAIL);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_3400
 * @tc.desc: DeleteCharacteristicProfile succeed.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_3400, TestSize.Level1)
{
    string deviceId = ContentSensorManagerUtils::GetInstance().ObtainLocalUdid();

    CharacteristicProfile charProfile6;
    charProfile6.SetDeviceId(deviceId);
    charProfile6.SetServiceName("serviceName6");
    charProfile6.SetCharacteristicKey("characteristicKey6");
    charProfile6.SetCharacteristicValue("characteristicValue6");
    DeviceProfileManager::GetInstance().PutCharacteristicProfile(charProfile6);

    string serviceName = "serviceName6";
    string characteristicKey = "characteristicKey6";
    int32_t ret = DeviceProfileManager::GetInstance().DeleteCharacteristicProfile(deviceId, serviceName,
        characteristicKey);
    EXPECT_EQ(ret, DP_SUCCESS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_3500
 * @tc.desc: DeleteCharacteristicProfile failed, the profile is invalid.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_3500, TestSize.Level1)
{
    string deviceId = "";
    string serviceName = "serviceName";
    string characteristicKey = "characteristicKey";
    int32_t ret = DeviceProfileManager::GetInstance().DeleteCharacteristicProfile(deviceId, serviceName,
        characteristicKey);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
    
    deviceId = "deviceId";
    serviceName = "serviceName";
    characteristicKey = "";
    ret = DeviceProfileManager::GetInstance().DeleteCharacteristicProfile(deviceId, serviceName,
        characteristicKey);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_3600
 * @tc.desc: DeleteCharacteristicProfile failed, deviceProfileStore is nullptr.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_3600, TestSize.Level1)
{
    string deviceId = "deviceId14";
    string serviceName = "serviceName14";
    string characteristicKey = "characteristicKey14";
    DeviceProfileManager::GetInstance().deviceProfileStore_ = nullptr;
    int32_t ret = DeviceProfileManager::GetInstance().DeleteCharacteristicProfile(deviceId, serviceName,
        characteristicKey);
    EXPECT_EQ(ret, DP_INVALID_PARAMS);
}
/**
 * @tc.name: SUB_DH_DDp_Dcts_3700
 * @tc.desc: DeleteCharacteristicProfile failed, DeleteServiceProfile fail.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_3700, TestSize.Level1)
{
    string deviceId = ContentSensorManagerUtils::GetInstance().ObtainLocalUdid();

    string serviceName = "serviceName15";
    string characteristicKey = "characteristicKey15";
    DeviceProfileManager::GetInstance().deviceProfileStore_->UnInit();
    int32_t ret = DeviceProfileManager::GetInstance().DeleteCharacteristicProfile(deviceId, serviceName,
        characteristicKey);
    EXPECT_EQ(ret, DP_DEL_KV_DB_FAIL);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_3800
 * @tc.desc: SyncDeviceProfile failed, Params is invalid.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_3800, TestSize.Level1)
{
    DistributedDeviceProfile::DpSyncOptions syncOptions;
    OHOS::sptr<OHOS::IRemoteObject> syncCb = nullptr;
    
    syncOptions.AddDevice("deviceId1");
    syncOptions.AddDevice("deviceId2");
    syncOptions.SetSyncMode(SyncMode::MIN);
    
    int32_t errCode = DeviceProfileManager::GetInstance().SyncDeviceProfile(syncOptions, syncCb);
    EXPECT_EQ(errCode, DP_INVALID_PARAMS);
}

/**
 * @tc.name: SUB_DH_DDp_Dcts_3900
 * @tc.desc: SyncDeviceProfile failed, Params is invalid.
 * @tc.type: FUNC
 * @tc.require:
 */
HWTEST_F(DeviceProfileManagerTest, SUB_DH_DDp_Dcts_3900, TestSize.Level1)
{
    DistributedDeviceProfile::DpSyncOptions syncOptions;
    OHOS::sptr<OHOS::IRemoteObject> syncCb = new(nothrow) SyncCallback();
    
    syncOptions.AddDevice("deviceId1");
    syncOptions.AddDevice("deviceId2");
    syncOptions.SetSyncMode(SyncMode::MAX);
    
    int32_t errCode = DeviceProfileManager::GetInstance().SyncDeviceProfile(syncOptions, syncCb);
    EXPECT_EQ(errCode, DP_INVALID_PARAMS);
}
} // namespace DistributedDeviceProfile
} // namespace OHOS