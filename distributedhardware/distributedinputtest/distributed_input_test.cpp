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

#include "distributed_input_test.h"
#include "system_ability_definition.h"
#include "dinput_context.h"
#include "dinput_errcode.h"

using namespace testing::ext;
using namespace OHOS::DistributedHardware::DistributedInput;
using namespace OHOS::DistributedHardware;
using namespace std;
using namespace OHOS;

void DistributedInputTest::SetUp()
{
}

void DistributedInputTest::TearDown()
{
}

void DistributedInputTest::SetUpTestCase()
{
}

void DistributedInputTest::TearDownTestCase()
{
}

void DistributedInputTest::TestPrepareDInputCallback::OnResult(
    const std::string& deviceId, const int32_t& status)
{
    (void)deviceId;
    (void)status;
    return;
}

void DistributedInputTest::TestUnprepareDInputCallback::OnResult(
    const std::string& deviceId, const int32_t& status)
{
    (void)deviceId;
    (void)status;
    return;
}

void DistributedInputTest::TestStartDInputCallback::OnResult(
    const std::string& deviceId, const uint32_t& inputTypes, const int32_t& status)
{
    (void)deviceId;
    (void)inputTypes;
    (void)status;
    return;
}

void DistributedInputTest::TestStopDInputCallback::OnResult(
    const std::string& deviceId, const uint32_t& inputTypes, const int32_t& status)
{
    (void)deviceId;
    (void)inputTypes;
    (void)status;
    return;
}

void DistributedInputTest::TestStartStopDInputCallback::OnResultDhids(
    const std::string &devId, const int32_t &status)
{
    (void)devId;
    (void)status;
    return;
}

void DistributedInputTest::TestInputNodeListener::OnNodeOnLine(const std::string srcDevId,
    const std::string sinkDevId, const std::string sinkNodeId, const std::string sinkNodeDesc)
{
    (void)srcDevId;
    (void)sinkDevId;
    (void)sinkNodeId;
    (void)sinkNodeDesc;
    return;
}

void DistributedInputTest::TestInputNodeListener::OnNodeOffLine(const std::string srcDevId,
    const std::string sinkDevId, const std::string sinkNodeId)
{
    (void)srcDevId;
    (void)sinkDevId;
    (void)sinkNodeId;
    return;
}

int32_t DistributedInputTest::TestSimulationEventListenerStub::OnSimulationEvent(
    uint32_t type, uint32_t code, int32_t value)
{
    (void)type;
    (void)code;
    (void)value;
    return DH_SUCCESS;
}

int DistributedInputTest::CheckSourceProxy() const
{
    OHOS::sptr<OHOS::ISystemAbilityManager> systemAbilityManager =
        OHOS::SystemAbilityManagerClient::GetInstance().GetSystemAbilityManager();
    if (!systemAbilityManager) {
        return DH_SUCCESS;
    }

    OHOS::sptr<OHOS::IRemoteObject> remoteObject = systemAbilityManager->GetSystemAbility(
        DISTRIBUTED_HARDWARE_INPUT_SOURCE_SA_ID);
    if (!remoteObject) {
        return DH_SUCCESS;
    }

    OHOS::sptr<IDistributedSourceInput> proxyTest;

    proxyTest = OHOS::iface_cast<IDistributedSourceInput>(remoteObject);
    if ((!proxyTest) || (!proxyTest->AsObject())) {
        return DH_SUCCESS;
    }

    return DH_SUCCESS;
}

int DistributedInputTest::CheckSinkProxy() const
{
    OHOS::sptr<OHOS::ISystemAbilityManager> systemAbilityManager =
        OHOS::SystemAbilityManagerClient::GetInstance().GetSystemAbilityManager();
    if (!systemAbilityManager) {
        return DH_SUCCESS;
    }

    OHOS::sptr<OHOS::IRemoteObject> remoteObject = systemAbilityManager->GetSystemAbility(
        DISTRIBUTED_HARDWARE_INPUT_SINK_SA_ID);
    if (!remoteObject) {
        return DH_SUCCESS;
    }

    OHOS::sptr<IDistributedSinkInput> proxyTest;

    proxyTest = OHOS::iface_cast<IDistributedSinkInput>(remoteObject);
    if ((!proxyTest) || (!proxyTest->AsObject())) {
        return DH_SUCCESS;
    }

    return DH_SUCCESS;
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_0100, testing::ext::TestSize.Level0)
{
    string deviceId = "PrepareRemoteInput01";
    sptr<TestPrepareDInputCallback> callback(new TestPrepareDInputCallback());
    int32_t ret = DistributedInputKit::PrepareRemoteInput(deviceId, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_0200, testing::ext::TestSize.Level0)
{
    string deviceId = "";
    sptr<TestPrepareDInputCallback> callback = nullptr;
    int32_t ret = DistributedInputKit::PrepareRemoteInput(deviceId, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_0300, testing::ext::TestSize.Level0)
{
    std::string srcId = "PrepareRemoteInput_test";
    std::string sinkId = "PrepareRemoteInput_test";
    sptr<IPrepareDInputCallback> callback(new TestPrepareDInputCallback());
    int32_t ret = DistributedInputKit::PrepareRemoteInput(srcId, sinkId, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_0400, testing::ext::TestSize.Level0)
{
    std::string srcId = "";
    std::string sinkId = "";
    sptr<TestPrepareDInputCallback> callback = nullptr;
    int32_t ret = DistributedInputKit::PrepareRemoteInput(srcId, sinkId, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_0500, testing::ext::TestSize.Level0)
{
    string deviceId = "UnprepareRemoteInput01";
    sptr<TestUnprepareDInputCallback> callback(new TestUnprepareDInputCallback());
    int32_t ret = DistributedInputKit::UnprepareRemoteInput(deviceId, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_0600, testing::ext::TestSize.Level0)
{
    string deviceId = "";
    sptr<TestUnprepareDInputCallback> callback = nullptr;
    int32_t ret = DistributedInputKit::UnprepareRemoteInput(deviceId, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_0700, testing::ext::TestSize.Level0)
{
    std::string srcId = "PrepareRemoteInput_src";
    std::string sinkId = "PrepareRemoteInput_sink";
    sptr<TestUnprepareDInputCallback> callback(new TestUnprepareDInputCallback());
    int32_t ret = DistributedInputKit::UnprepareRemoteInput(srcId, sinkId, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_0800, testing::ext::TestSize.Level0)
{
    std::string srcId = "";
    std::string sinkId = "";
    sptr<TestUnprepareDInputCallback> callback = nullptr;
    int32_t ret = DistributedInputKit::UnprepareRemoteInput(srcId, sinkId, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_0900, testing::ext::TestSize.Level0)
{
    string deviceId = "StartRemoteInput01";
    sptr<TestStartDInputCallback> callback(new TestStartDInputCallback());
    int32_t ret =
        DistributedInputKit::StartRemoteInput(deviceId, static_cast<uint32_t>(DInputDeviceType::ALL), callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_1000, testing::ext::TestSize.Level0)
{
    string deviceId = "";
    sptr<TestStartDInputCallback> callback = nullptr;
    int32_t ret =
        DistributedInputKit::StartRemoteInput(deviceId, static_cast<uint32_t>(DInputDeviceType::ALL), callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_1100, testing::ext::TestSize.Level0)
{
    std::string sinkId = "StartRemoteInput_sink";
    std::vector<std::string> dhIds = {"dhIds_test"};
    sptr<TestStartStopDInputCallback> callback(new TestStartStopDInputCallback());
    int32_t ret = DistributedInputKit::StartRemoteInput(sinkId, dhIds, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_1200, testing::ext::TestSize.Level0)
{
    std::string sinkId = "";
    std::vector<std::string> dhIds;
    sptr<TestStartStopDInputCallback> callback = nullptr;
    int32_t ret = DistributedInputKit::StartRemoteInput(sinkId, dhIds, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_1300, testing::ext::TestSize.Level0)
{
    string srcId = "StartRemoteInput01-src";
    string sinkId = "StartRemoteInput01-sink";
    sptr<TestStartDInputCallback> callback(new TestStartDInputCallback());
    int32_t ret =
        DistributedInputKit::StartRemoteInput(srcId, sinkId, static_cast<uint32_t>(DInputDeviceType::ALL), callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_1400, testing::ext::TestSize.Level0)
{
    string srcId = "";
    string sinkId = "";
    sptr<TestStartDInputCallback> callback = nullptr;
    int32_t ret =
        DistributedInputKit::StartRemoteInput(srcId, sinkId, static_cast<uint32_t>(DInputDeviceType::ALL), callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_1500, testing::ext::TestSize.Level0)
{
    string srcId = "StartRemoteInput01-src";
    string sinkId = "StartRemoteInput01-sink";
    std::vector<std::string> dhIds = {"dhIds_test"};
    sptr<TestStartStopDInputCallback> callback(new TestStartStopDInputCallback());
    int32_t ret = DistributedInputKit::StartRemoteInput(srcId, sinkId, dhIds, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_1600, testing::ext::TestSize.Level0)
{
    string srcId = "";
    string sinkId = "";
    std::vector<std::string> dhIds;
    sptr<TestStartStopDInputCallback> callback = nullptr;
    int32_t ret = DistributedInputKit::StartRemoteInput(srcId, sinkId, dhIds, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_1700, testing::ext::TestSize.Level0)
{
    string deviceId = "StopRemoteInput01";
    sptr<TestStopDInputCallback> callback(new TestStopDInputCallback());
    int32_t ret =
        DistributedInputKit::StopRemoteInput(deviceId, static_cast<uint32_t>(DInputDeviceType::ALL), callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_1800, testing::ext::TestSize.Level0)
{
    string deviceId = "";
    sptr<TestStopDInputCallback> callback = nullptr;
    int32_t ret =
        DistributedInputKit::StopRemoteInput(deviceId, static_cast<uint32_t>(DInputDeviceType::ALL), callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_1900, testing::ext::TestSize.Level0)
{
    std::string sinkId = "StartRemoteInput_test";
    std::vector<std::string> dhIds = {"dhIds_test"};
    sptr<TestStartStopDInputCallback> callback(new TestStartStopDInputCallback());
    int32_t ret = DistributedInputKit::StopRemoteInput(sinkId, dhIds, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_2000, testing::ext::TestSize.Level0)
{
    std::string sinkId = "";
    std::vector<std::string> dhIds;
    sptr<TestStartStopDInputCallback> callback = nullptr;
    int32_t ret = DistributedInputKit::StopRemoteInput(sinkId, dhIds, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_2100, testing::ext::TestSize.Level0)
{
    string srcId = "StopRemoteInput03-src";
    string sinkId = "StopRemoteInput03-sink";
    sptr<TestStopDInputCallback> callback(new TestStopDInputCallback());
    int32_t ret =
        DistributedInputKit::StopRemoteInput(srcId, sinkId, static_cast<uint32_t>(DInputDeviceType::ALL), callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_2200, testing::ext::TestSize.Level0)
{
    string srcId = "";
    string sinkId = "";
    sptr<TestStopDInputCallback> callback = nullptr;
    int32_t ret =
        DistributedInputKit::StopRemoteInput(srcId, sinkId, static_cast<uint32_t>(DInputDeviceType::ALL), callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_2300, testing::ext::TestSize.Level0)
{
    string srcId = "StartRemoteInput01-src";
    string sinkId = "StartRemoteInput01-sink";
    std::vector<std::string> dhIds = {"dhIds_test"};
    sptr<TestStartStopDInputCallback> callback(new TestStartStopDInputCallback());
    int32_t ret = DistributedInputKit::StopRemoteInput(srcId, sinkId, dhIds, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_2400, testing::ext::TestSize.Level0)
{
    string srcId = "";
    string sinkId = "";
    std::vector<std::string> dhIds;
    sptr<TestStartStopDInputCallback> callback = nullptr;
    int32_t ret = DistributedInputKit::StopRemoteInput(srcId, sinkId, dhIds, callback);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_2500, testing::ext::TestSize.Level0)
{
    string deviceId = "IsNeedFilterOut01";
    BusinessEvent event;
    event.pressedKeys.push_back(29);
    event.pressedKeys.push_back(56);
    event.keyCode = 111;
    event.keyAction = 108;
    bool ret = DistributedInputKit::IsNeedFilterOut(deviceId, event);
    EXPECT_EQ(true, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_2600, testing::ext::TestSize.Level0)
{
    string deviceId;
    BusinessEvent event;
    bool ret = DistributedInputKit::IsNeedFilterOut(deviceId, event);
    EXPECT_EQ(true, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_2700, testing::ext::TestSize.Level0)
{
    string deviceId = "IsNeedFilterOut01";
    BusinessEvent event;
    event.pressedKeys.push_back(29);
    event.pressedKeys.push_back(56);
    event.keyCode = 111;
    event.keyAction = 108;
    bool ret = DistributedInputKit::IsNeedFilterOut(deviceId, event);
    EXPECT_EQ(true, ret);
}

/**
 * @tc.name: SUB_DH_DInput_Dcts_2800
 * @tc.desc: verify the function of filtering events on the touchscreen.
 * @tc.type: FUNC
 * @tc.require: SR000GNECO
 */
HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_2800, testing::ext::TestSize.Level0)
{
    std::string sourceWinId = "123";
    SinkScreenInfo sinkScreenInfo = DInputContext::GetInstance().GetSinkScreenInfo(sourceWinId);
    const TransformInfo trans{10, 10, 100, 100, 1.0, 1.0};
    sinkScreenInfo.transformInfo = trans;
    DInputContext::GetInstance().UpdateSinkScreenInfo(sourceWinId, sinkScreenInfo);

    sourceWinId = "456";
    sinkScreenInfo = DInputContext::GetInstance().GetSinkScreenInfo(sourceWinId);
    const TransformInfo trans1{120, 130, 50, 50, 1.0, 1.0};
    sinkScreenInfo.transformInfo = trans1;
    DInputContext::GetInstance().UpdateSinkScreenInfo(sourceWinId, sinkScreenInfo);

    TouchScreenEvent event;
    event.absX = 100;
    event.absY = 100;
    bool ret = DistributedInputKit::IsTouchEventNeedFilterOut(event);
    EXPECT_EQ(true, ret);

    event.absX = 140;
    event.absY = 150;
    ret = DistributedInputKit::IsTouchEventNeedFilterOut(event);
    EXPECT_EQ(true, ret);

    event.absX = 150;
    event.absY = 20;
    ret = DistributedInputKit::IsTouchEventNeedFilterOut(event);
    EXPECT_EQ(false, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_2900, testing::ext::TestSize.Level0)
{
    uint32_t flag = 1;
    DInputServerType retFlag = DistributedInputKit::IsStartDistributedInput(flag);
    EXPECT_EQ(DInputServerType::NULL_SERVER_TYPE, retFlag);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_3000, testing::ext::TestSize.Level0)
{
    std::string dhId = "IsStartDistributedInput02";
    bool ret = DistributedInputKit::IsStartDistributedInput(dhId);
    EXPECT_EQ(true, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_3100, testing::ext::TestSize.Level0)
{
    std::string dhId = "";
    bool ret = DistributedInputKit::IsStartDistributedInput(dhId);
    EXPECT_EQ(true, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_3200, testing::ext::TestSize.Level0)
{
    sptr<TestInputNodeListener> listener(new TestInputNodeListener());
    int32_t ret = DistributedInputKit::RegisterInputNodeListener(listener);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_3300, testing::ext::TestSize.Level0)
{
    sptr<TestInputNodeListener> listener = nullptr;
    int32_t ret = DistributedInputKit::RegisterInputNodeListener(listener);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_3400, testing::ext::TestSize.Level0)
{
    sptr<TestInputNodeListener> listener(new TestInputNodeListener());
    int32_t ret = DistributedInputKit::UnregisterInputNodeListener(listener);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_3500, testing::ext::TestSize.Level0)
{
    sptr<TestInputNodeListener> listener = nullptr;
    int32_t ret = DistributedInputKit::UnregisterInputNodeListener(listener);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_3600, testing::ext::TestSize.Level0)
{
    sptr<TestSimulationEventListenerStub> listener(new TestSimulationEventListenerStub());
    int32_t ret = DistributedInputKit::RegisterSimulationEventListener(listener);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_3700, testing::ext::TestSize.Level0)
{
    sptr<TestSimulationEventListenerStub> listener = nullptr;
    int32_t ret = DistributedInputKit::RegisterSimulationEventListener(listener);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_3800, testing::ext::TestSize.Level0)
{
    sptr<TestSimulationEventListenerStub> listener(new TestSimulationEventListenerStub());
    int32_t ret = DistributedInputKit::UnregisterSimulationEventListener(listener);
    EXPECT_EQ(DH_SUCCESS, ret);
}

HWTEST_F(DistributedInputTest, SUB_DH_DInput_Dcts_3900, testing::ext::TestSize.Level0)
{
    sptr<TestSimulationEventListenerStub> listener = nullptr;
    int32_t ret = DistributedInputKit::UnregisterSimulationEventListener(listener);
    EXPECT_EQ(DH_SUCCESS, ret);
}