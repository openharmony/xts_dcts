/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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

#include <iostream>

#include "display.h"
#include "display_manager.h"
#include "dscreen_source_handler.h"
#include "dscreen_sink_handler.h"
#include "dscreen_util.h"
#include "idistributed_hardware_sink.h"
#include "idistributed_hardware_source.h"
#include "screen.h"
#include "screen_client.h"
#include "screen_client_common.h"
#include "screen_manager.h"
#include "wm_common.h"
#include "window.h"
#include "window_option.h"

#include "decoder_demo.h"
#include "softbus_adapter_mem.h"
#include "softbus_bus_center.h"
#include "softbus_common.h"

using namespace std;
using namespace OHOS;
using namespace OHOS::DistributedHardware;
using namespace OHOS::Rosen;
using namespace OHOS::Media;

namespace {
    static char const *g_pkgName = "ohos.dsoftbus.tool";
}

constexpr int32_t SLEEP_FIVE_SECOND = 10;
static vector<sptr<Screen>> remoteScreens;
static uint64_t g_screenId = 0;

int QueryRemoteScreenInfo(void)
{
    vector<sptr<Screen>> allScreens = ScreenManager::GetInstance().GetAllScreens();
    sptr<Display> defaultDisplay = DisplayManager::GetInstance().GetDefaultDisplay();
    for (const auto &screen : allScreens) {
        if (screen == nullptr) {
            continue;
        }
        if (!screen->IsReal() && screen->GetWidth() > 0) {
            remoteScreens.push_back(screen);
        }
    }
    DHLOGE("-------------remote screen info---------------");
    DHLOGE("remote screen Num: %d", remoteScreens.size());
    for (const auto &screen : remoteScreens) {
        if (screen == nullptr) {
            continue;
        }
        g_screenId = screen->GetId();
        DHLOGE("--------screen id: %d ---------", screen->GetId());
        DHLOGE("screen name: : %s", GetAnonyString(screen->GetName()).c_str());
        DHLOGE("width: : %d", screen->GetWidth());
        DHLOGE("height : %d", screen->GetHeight());
        DHLOGE("-------------------------------------------");
    }

    return 0;
}

int StartMirror(void)
{
    uint64_t ret = QueryRemoteScreenInfo();
    if (ret != 0) {
        DHLOGE("Error: no remote screens enabled");
        return -1;
    }

    DHLOGE("select remote screen id to mirror");
    
    bool isMirrorIdValid = false;
    for (const auto &screen : remoteScreens) {
        if (screen == nullptr) {
            continue;
        }
        if (screen->GetId() == g_screenId) {
            isMirrorIdValid = true;
            break;
        }
    }

    if (!isMirrorIdValid) {
        DHLOGE("input mirrorId is not valid!");
        return -1;
    }

    sptr<Display> defaultDisplay = DisplayManager::GetInstance().GetDefaultDisplay();
    DHLOGE("------------start mirror----------");
    DHLOGE("mirror screen Id is: %d", g_screenId);
    vector<uint64_t> mirrorIds;
    mirrorIds.push_back(g_screenId);
    ScreenManager::GetInstance().MakeMirror(defaultDisplay->GetScreenId(), mirrorIds);
    sleep(SLEEP_FIVE_SECOND);
    return 0;
}

int StopMirror(void)
{
    uint64_t ret = QueryRemoteScreenInfo();
    if (ret != 0) {
        DHLOGE("no remote screens enabled, no need stop mirror ");
        return -1;
    }

    bool isStopMirrorIdValid = false;
    for (const auto &screen : remoteScreens) {
        if (screen == nullptr) {
            continue;
        }
        if (screen->GetId() == g_screenId) {
            isStopMirrorIdValid = true;
            break;
        }
    }
    if (!isStopMirrorIdValid) {
        DHLOGE("input g_screenId is not valid! ");
        return -1;
    }

    DHLOGE("-------------- stop mirror ------------");
    DHLOGE("stop mirror screen id is: %d", g_screenId);
    vector<uint64_t> stopMirrorIds;
    stopMirrorIds.push_back(g_screenId);
    ScreenManager::GetInstance().RemoveVirtualScreenFromGroup(stopMirrorIds);
    sleep(SLEEP_FIVE_SECOND);
    return 0;
}

int StartExpand(void)
{
    uint64_t ret = QueryRemoteScreenInfo();
    if (ret != 0) {
        DHLOGE("Error: no remote screens enabled");
        return -1;
    }

    bool isExpandIdValid = false;
    for (const auto &screen : remoteScreens) {
        if (screen == nullptr) {
            continue;
        }
        if (screen->GetId() == g_screenId) {
            isExpandIdValid = true;
            break;
        }
    }

    if (!isExpandIdValid) {
        DHLOGE("input expandId is not valid!");
        return -1;
    }

    sptr<Display> defaultDisplay = DisplayManager::GetInstance().GetDefaultDisplay();
    DHLOGE("------------start expand----------");
    DHLOGE("expand screen Id is: %d", g_screenId);
    vector<ExpandOption> options = {{defaultDisplay->GetScreenId(), 0, 0}, {g_screenId, defaultDisplay->GetWidth(), 0}};
    ScreenManager::GetInstance().MakeExpand(options);
    sleep(SLEEP_FIVE_SECOND);
    return 0;
}

int StopExpand(void)
{
    uint64_t ret = QueryRemoteScreenInfo();
    if (ret != 0) {
        DHLOGE("no remote screens enabled, no need stop expand");
        return -1;
    }

    bool isStopExpandIdValid = false;
    for (const auto &screen : remoteScreens) {
        if (screen == nullptr) {
            continue;
        }
        if (screen->GetId() == g_screenId) {
            isStopExpandIdValid = true;
            break;
        }
    }
    if (!isStopExpandIdValid) {
        DHLOGE("input g_screenId is not valid!");
        return -1;
    }

    DHLOGE("-------------- stop expand ------------");
    DHLOGE("stop expand screen id is : %d", g_screenId);
    vector<uint64_t> stopExpandIds;
    stopExpandIds.push_back(g_screenId);
    ScreenManager::GetInstance().RemoveVirtualScreenFromGroup(stopExpandIds);
    sleep(SLEEP_FIVE_SECOND);
    return 0;
}

static void PrintNodeProperty(NodeBasicInfo *nodeInfo)
{
    if (nodeInfo == nullptr) {
        DHLOGE("nodeInfo is nullptr");
        return;
    }

    DHLOGE("DeviceName = %s", nodeInfo->deviceName);
    DHLOGE("NetworkId = %s", GetAnonyString(nodeInfo->networkId).c_str());
    NodeDeviceInfoKey key = NODE_KEY_UDID;
    unsigned char udid[UDID_BUF_LEN] = {0};
    if (GetNodeKeyInfo(g_pkgName, nodeInfo->networkId, key, udid, UDID_BUF_LEN) != 0) {
        DHLOGE("GetNodeKeyInfo Fail!");
    }
    key = NODE_KEY_UUID;
    unsigned char uuid[UUID_BUF_LEN] = {0};
    if (GetNodeKeyInfo(g_pkgName, nodeInfo->networkId, key, uuid, UUID_BUF_LEN) != 0) {
        DHLOGE("GetNodeKeyInfo Fail!");
    }
}

int QueryRemoteDeviceInfo(void)
{
    NodeBasicInfo localNodeinfo;
    NodeBasicInfo *remoteNodeInfo = nullptr;
    int32_t infoNum = 0;

    DHLOGE("-----------Local Device Info------");

    if (GetLocalNodeDeviceInfo(g_pkgName, &localNodeinfo) != 0) {
        printf("LnnGetLocalNodeInfo Fail!\n");
        DHLOGE("LnnGetLocalNodeInfo Fail!");
        return -1;
    }

    PrintNodeProperty(&localNodeinfo);
    DHLOGE("-------Remote Device info---------");
    if (GetAllNodeDeviceInfo(g_pkgName, &remoteNodeInfo, &infoNum) != 0) {
        DHLOGE("GetAllNodeDeviceInfo Fail!");
        return -1;
    }

    DHLOGE("Device Num = %d", infoNum);
    for (int i = 0; i < infoNum; ++i) {
        DHLOGE("[No.%d]", i + 1);
        PrintNodeProperty(remoteNodeInfo + i);
    }

    FreeNodeInfo(remoteNodeInfo);
    DHLOGE("SoftBusDumpDeviceInfo complete");
    sleep(SLEEP_FIVE_SECOND);
    return 0;
}

int CreateWindow(void)
{
    DHLOGE("create window, please input window size");

    uint32_t windowWidth = 640;
    uint32_t windowHeight = 480;
   
    sptr<Display> defaultDisplay = DisplayManager::GetInstance().GetDefaultDisplay();
    shared_ptr<WindowProperty> windowProperty = make_shared<WindowProperty>();
    windowProperty->displayId = defaultDisplay->GetId();
    windowProperty->startX = 0;
    windowProperty->startY = 0;
    windowProperty->width = windowWidth;
    windowProperty->height = windowHeight;
    int32_t windowId = ScreenClient::GetInstance().AddWindow(windowProperty);
    ScreenClient::GetInstance().ShowWindow(windowId);
    sptr<Surface> surface = ScreenClient::GetInstance().GetSurface(windowId);
    DHLOGE("create window success.");

    auto vdec = make_shared<VDecDemo>();
    if (vdec == nullptr) {
        DHLOGE("videoDecoder is nullptr");
        return -1;
    }
    vdec->SetWindowSize(windowWidth, windowHeight);
    vdec->SetOutputSurface(surface);
    DHLOGE("start run decoder");
    vdec->RunCase();
    DHLOGE("create window success, window id: %d, width: %d, height: %d", windowId, windowWidth, windowHeight);
    ScreenClient::GetInstance().RemoveWindow(windowId);
    sleep(SLEEP_FIVE_SECOND);
    return 0;
}
