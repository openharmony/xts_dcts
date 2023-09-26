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

#ifndef JPQDOWN_disdveprofile_test_H
#define JPQDOWN_disdveprofile_test_H

#include <atomic>
#include <string>
#include <thread>

#include "service_characteristic.h"
#include "distributed_device_profile_service.h"
#include "service_characteristic_profile.h"
#include "nocopyable.h"
#include "distributed_hardware_log.h"
#include "distributed_device_profile_client.h"


namespace OHOS {
namespace DeviceProfile {
class DPTest{
public:
    DPTest();
    ~DPTest();
    std::string GetDevProfileTest();
    std::string PutDevProfileTest();
    std::string PutDevProfileSerciceidTest();
    int DeleteDevProfileTest();
    int SyncDveProfileTest();
    int SubscribeProfileEventsTest();
    void SendFP();

//private:
      
};

}
}
#endif //JPQDOWN_disdveprofile_test_H
