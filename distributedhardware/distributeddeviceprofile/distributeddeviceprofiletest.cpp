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

namespace OHOS {
namespace DeviceProfile {
using namespace testing;
using namespace testing::ext;
auto mainDemo = std::make_shared<DPTest>();
class ServiceProfileTest : public testing::Test {
public:
    static void SetUpTestCase();
    static void TearDownTestCase();
    void SetUp();
    void TearDown();
};

void ServiceProfileTest::SetUpTestCase()
{
    DTEST_LOG << "SetUpTestCase" << std::endl;
    
    
}

void ServiceProfileTest::TearDownTestCase()
{
    DTEST_LOG << "TearDownTestCase" << std::endl;
}

void ServiceProfileTest::SetUp()
{
    DTEST_LOG << "SetUp" << std::endl;
    mainDemo->SendFP();
}

void ServiceProfileTest::TearDown()
{
    DTEST_LOG << "TearDown" << std::endl;
}

/**
 * @tc.number    : SUB_DH_DPTSET_Dcts__001
 * @tc.name      ：PutDevProfileTest()
 * @tc.desc      : [SUB_DH_DPTSET_Dcts__001]更改profile数据
 * @tc.desc      : Change profile data
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */
HWTEST_F(ServiceProfileTest, SUB_DH_DPTSET_Dcts__001, TestSize.Level1)
{
    std::string ret = mainDemo->PutDevProfileTest();
    std::string res =  mainDemo->GetDevProfileTest();
    // if(res != ret){
    //     DHLOGI("demo test: GetDveProfileTest fail");  
    // }
    EXPECT_EQ(ret, res)<<"PutDevProfileTest PASS";
}

/**
 * @tc.number    : SUB_DH_DPTSET_Dcts__002
 * @tc.name      ：DeleteDevProfileTest
 * @tc.desc      : [SUB_DH_DPTSET_Dcts__002]删除profile数据
 * @tc.desc      : delete profile data
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */

HWTEST_F(ServiceProfileTest, SUB_DH_DPTSET_Dcts__002, TestSize.Level3)
{
    // 执行查询接口GetDeviceProfile
    int ret = mainDemo->DeleteDevProfileTest();
    std::string res =  mainDemo->GetDevProfileTest();
    EXPECT_EQ("", res)<<"PutDevProfileTest PASS";
}

/**
 * @tc.number    : SUB_DH_DPTSET_Dcts__003
 * @tc.name      ：SyncDveProfileTest
 * @tc.desc      : [SUB_DH_DPTSET_Dcts__002]同步profile数据
 * @tc.desc      : synchronous profile data
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */

HWTEST_F(ServiceProfileTest, SUB_DH_DPTSET_Dcts__003, TestSize.Level3)
{
    int ret = mainDemo->SyncDveProfileTest();
    EXPECT_EQ(0, ret)<<"SyncDveProfileTest PASS";
}

/**
 * @tc.number    : SUB_DH_DPTSET_Dcts__004
 * @tc.name      ：SyncDveProfileTest
 * @tc.desc      : [SUB_DH_DPTSET_Dcts__004]订阅profile数据
 * @tc.desc      : subscribe profile data
 * @tc.type      : FUNC
 * @tc.size      : Medium test
 */

HWTEST_F(ServiceProfileTest, SUB_DH_DPTSET_Dcts__004, TestSize.Level3)
{
    int ret = mainDemo->SubscribeProfileEventsTest();
    EXPECT_EQ(0, res)<<"SubscribeProfileEventsTest PASS";
}
}
}