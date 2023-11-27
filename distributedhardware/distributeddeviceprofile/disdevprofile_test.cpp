/*
 * Copyright (c) 2021-2023 Huawei Device Co., Ltd.
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
#include <cstdlib>
#include "disdveprofile_test.h"
#include "nlohmann/json.hpp"
#include <system>
#include "json/json.h"
#include <thread>
#include "device_profile_log.h"
#include <string>
#include "distributed_device_profile_client.h"
int32_t dpOk = 0;
int32_t dpError = -1;
int DPTest::InitDevice()
{
    DHLOGI("demo test: InitDevice enter");
    auto disDPTest = std::make_shared<DistributedDeviceProfileService>();
    bool result = disDPTest->Init();
    if(!result){
       DHLOGI("demo test: InitDevice error"); 
        return dpError;
    }
    return dpOk;
}

int threadSendF()
{
    DHLOGI("demo test: 请插入第一个手机");
    int status = system("D:\\DP\\push.bat");
    Sleep(40000);
    if (status != 0) {
       DHLOGI("demo test: send file fail");
       return dpError; 
    }
    DHLOGI("demo test: 请插入第二个手机");
    int status = system("D:\\DP\\push.bat");
    Sleep(40000);
    if (status != 0) {
       DHLOGI("demo test: send file fail");
       return dpError; 
    }
    return dpOk;
}

void DPTest::SendFP()
{
    std::thread myThread(threadSendF);
    myThread.join();
}

std::string DPTest::GetDevProfileTest()
{
    ServiceCharacteristicProfile profile;
    std::string testServiceId = profile.GetServiceId();
    DistributedDeviceProfileClient::GetInstance().GetDeviceProfile("", testServiceId, profile);
    std::string jsonData = profile.GetCharacteristicProfileJson();
    if(jsonData.empty()){
        DHLOGI("demo test: GetDevProfileTest GetCharacteristicProfileJson error");
        return "false";
    }
    std::string result = result.append("jsonData:" + jsonData + "\n");
    return result;
}

std::string DPTest::PutDevProfileTest()
{
    // 声明并填充插入数据
    ServiceCharacteristicProfile profile;
    profile.SetServiceId("test");
    profile.SetServiceType("test");
    nlohmann::json j;
    j["testVersion"] = "3.0.0";
    j["testApiLevel"] = API_LEVEL;
    profile.SetCharacteristicProfileJson(j.dump());
    // 执行插入接口PutDeviceProfile
    DistributedDeviceProfileClient::GetInstance().PutDeviceProfile(profile);
    std::string jsonData = profile.GetCharacteristicProfileJson();
    if (jsonData.empty()) {
        DHLOGI("demo test: PutDevProfileTest GetCharacteristicProfileJson error");
        return "false";
    }
    std::string result = result.append("jsonData:" + jsonData + "\n");
    return result;
}
/*写入serviceid,servicetype为空*/
std::string DPTest::PutDevProfileSerciceidTest()
{
    // 声明并填充插入数据
    ServiceCharacteristicProfile profile;
    profile.SetServiceId("");
    profile.SetServiceType("");
    nlohmann::json j;
    j["testVersion"] = "3.0.0";
    j["testApiLevel"] = API_LEVEL;
    profile.SetCharacteristicProfileJson(j.dump());
    // 执行插入接口PutDeviceProfile
    DistributedDeviceProfileClient::GetInstance().PutDeviceProfile(profile);
    std::string jsonData = profile.GetCharacteristicProfileJson();
    if (jsonData.empty()) {
        DHLOGI("demo test: PutDevProfileTest error");
        return "false";
    }
    std::string result = result.append("jsonData:" + jsonData + "\n");
    return result;
}

int DPTest::DeleteDevProfileTest()
{
    std::string serviceId = "test";
    DistributedDeviceProfileClient::GetInstance().DeleteDeviceProfile(serviceId);
    if (ret != 0) {
            DHLOGI("demo test: DeleteDevProfileTest error");
            return dpError;
    }
    return dpOk;
}

int DPTest::SyncDveProfileTest(){
    ServiceCharacteristicProfile profile;
    SyncOptions syncOption;
    syncOption.SetSyncMode((OHOS::DeviceProfile::SyncMode)atoi(mode.c_str()));
    for (const auto& deviceId : deviceIds) {
        syncOption.AddDevice(deviceId);
    }
// 执行同步接口
    int32_t ret = DistributedDeviceProfileClient::GetInstance().SyncDeviceProfile(syncOption,
        std::make_shared<ProfileEventCallback>());
    if (ret != ERR_OK) {
        DHLOGI("demo test: SyncDveProfileTest error");
        return dpError;
    }

    return dpOk;
}

int DPTest::SubscribeProfileEventsTest(){

    auto callback = std::make_shared<ProfileEventCallback>();
    std::list<SubscribeInfo> subscribeInfos;
    ServiceCharacteristicProfile profile;
    std::string deviceId = JSON.stringify(dmDeviceInfo[0]["deviceId"]);
    std::string ServiceIds = profile.GetServiceId();
// 订阅EVENT_PROFILE_CHANGED事件
    ExtraInfo extraInfo;
    extraInfo["deviceId"] = deviceId;
    extraInfo["serviceIds"] = ServiceIds;
    SubscribeInfo changeEventInfo;
    changeEventInfo.profileEvent = ProfileEvent::EVENT_PROFILE_CHANGED;
    changeEventInfo.extraInfo = std::move(extraInfo);
    subscribeInfos.emplace_back(changeEventInfo);

// 订阅EVENT_SYNC_COMPLETED事件
    SubscribeInfo syncEventInfo;
    syncEventInfo.profileEvent = ProfileEvent::EVENT_SYNC_COMPLETED;
    subscribeInfos.emplace_back(syncEventInfo);

// 执行订阅接口
    std::list<ProfileEvent> failedEvents;
    DistributedDeviceProfileClient::GetInstance().SubscribeProfileEvents(subscribeInfos,
    callback, failedEvents);
    if (failedEvents.empty()) {
        DHLOGI("demo test: SubscribeProfileEvents error");
        return dpError;
    }

// 解除订阅
    std::list<ProfileEvent> profileEvents;
    profileEvents.emplace_back(ProfileEvent::EVENT_PROFILE_CHANGED);
    DistributedDeviceProfileClient::GetInstance().UnsubscribeProfileEvents(profileEvents,
    callback, failedEvents);
    if (failedEvents.empty()) {j
        DHLOGI("demo test: UnsubscribeProfileEvents error");
        return dpError;
    }
    return dpOk;
}
