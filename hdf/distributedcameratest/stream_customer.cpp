/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

#include "stream_customer.h"
#include "distributed_hardware_log.h"
#include "video_key_info.h"

namespace OHOS {
namespace DistributedHardware {
StreamCustomer::StreamCustomer() {}
StreamCustomer::~StreamCustomer() {}

void StreamCustomer::CamFrame(const std::function<void(void*, uint32_t)> callback)
{
    DHLOGI("demo test:enter CamFrame thread ++ ");
    OHOS::Rect damage;
    int32_t flushFence = 0;
    int64_t newTimeStamp = 0;
    constexpr uint32_t delayTime = 5000;

    do {
        OHOS::sptr<OHOS::SurfaceBuffer> buff = nullptr;
        consumer_->AcquireBuffer(buff, flushFence, newTimeStamp, damage);
        if (buff != nullptr) {
            void* addr = buff->GetVirAddr();
            if (callback != nullptr) {
                int32_t gotSize = 0;
                int32_t frameNum = 0;
                int isKey = 0;
                int64_t timestamp;
                buff->GetExtraData()->ExtraGet(OHOS::Camera::dataSize, gotSize);
                buff->GetExtraData()->ExtraGet(OHOS::Camera::isKeyFrame, isKey);
                buff->GetExtraData()->ExtraGet(OHOS::Camera::timeStamp, timestamp);
                DHLOGE("demo test:CamFrame callback +++++++ Size == %d frameNum = %d timestamp == %lld",
                    gotSize, frameNum, timestamp);
                callback(addr, gotSize);
            }
            consumer_->ReleaseBuffer(buff, -1);
        }
        usleep(delayTime);
    } while (camFrameExit_ == 0);

    DHLOGI("demo test:Exiting CamFrame thread -- ");
}

sptr<OHOS::IBufferProducer> StreamCustomer::CreateProducer()
{
    consumer_ = OHOS::Surface::CreateSurfaceAsConsumer();
    if (consumer_ == nullptr) {
        return nullptr;
    }
    sptr<IBufferConsumerListener> listener = new TestBuffersConsumerListener();
    consumer_->RegisterConsumerListener(listener);

    auto producer = consumer_->GetProducer();
    if (producer == nullptr) {
        return nullptr;
    }

    DHLOGI("demo test, create a buffer queue producer %p", producer.GetRefPtr());
    return producer;
}

RetCode StreamCustomer::ReceiveFrameOn(const std::function<void(void*, uint32_t)> callback)
{
    DHLOGI("demo test:ReceiveFrameOn enter");

    if (camFrameExit_ == 1) {
        camFrameExit_ = 0;
        previewThreadId_ = new (std::nothrow) std::thread(&StreamCustomer::CamFrame, this, callback);
        if (previewThreadId_ == nullptr) {
            DHLOGE("demo test:ReceiveFrameOn failed");
            return RC_ERROR;
        }
    } else {
        DHLOGI("demo test:ReceiveFrameOn loop thread is running");
    }
    DHLOGI("demo test:ReceiveFrameOn exit");
    return RC_OK;
}

void StreamCustomer::ReceiveFrameOff()
{
    DHLOGI("demo test:ReceiveFrameOff enter");

    if (camFrameExit_ == 0) {
        camFrameExit_ = 1;
        if (previewThreadId_ != nullptr) {
            previewThreadId_->join();
            delete previewThreadId_;
            previewThreadId_ = nullptr;
        }
    }
    DHLOGI("demo test:ReceiveFrameOff exit");
}
}
}