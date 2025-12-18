 /*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "napi/native_api.h"
#include <cstdlib>
#include <js_native_api_types.h>
#include <tuple>
#include <unistd.h>
#include "device_manager.h"
#include "distributed_file_daemon_manager.h"

class FileIoClient : public OHOS::DistributedHardware::DmInitCallback {
    void OnRemoteDied() {
    }
};

static napi_value DeviceOpenP2PConnection(napi_env env, napi_callback_info info)
{
    std::shared_ptr<OHOS::DistributedHardware::DmInitCallback> initCallback = std::make_shared<FileIoClient>();
    auto &deviceManager = OHOS::DistributedHardware::DeviceManager::GetInstance();
    deviceManager.InitDeviceManager("com.acts.fileio.test.server", initCallback);
    std::vector<OHOS::DistributedHardware::DmDeviceInfo> deviceList;
    deviceManager.GetTrustedDeviceList("com.acts.fileio.test.server", "", deviceList);
    auto &dfsmanager = OHOS::Storage::DistributedFile::DistributedFileDaemonManager::GetInstance();
    int32_t ret = dfsmanager.ConnectDfs(deviceList[0].networkId);
    napi_value result = nullptr;
    napi_create_int32(env, ret, &result);
    return result;
}

EXTERN_C_START
static napi_value Init(napi_env env, napi_value exports)
{
    napi_property_descriptor desc[] = {
        {"DeviceOpenP2PConnection", nullptr, DeviceOpenP2PConnection, nullptr, nullptr, nullptr, napi_default, nullptr},
    };

    napi_define_properties(env, exports, sizeof(desc) / sizeof(desc[0]), desc);
    return exports;
}
EXTERN_C_END

static napi_module demoModule = {
    .nm_version = 1,
    .nm_flags = 0,
    .nm_filename = nullptr,
    .nm_register_func = Init,
    .nm_modname = "devicemanager",
    .nm_priv = ((void *)0),
    .reserved = {0},
};

extern "C" __attribute__((constructor)) void RegisterModule(void) { napi_module_register(&demoModule); }
