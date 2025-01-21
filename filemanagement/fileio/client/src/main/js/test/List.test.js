/*
 * Copyright (C) 2022-2025 Huawei Device Co., Ltd.
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
import FileioDistributedTest from './FileioJsUnit.test.js';
import EmptyTest from './Empty.test.js';
import deviceInfo from '@ohos.deviceInfo';
import devicemanager from 'libdevicemanager.so';

export default function testsuite() {
    let deviceTypeInfo = deviceInfo.deviceType;
    console.info('FileioDistributedTest the deviceType is :' + deviceTypeInfo);
    let E_SA_LOAD_FAILED = 4;
    let res = devicemanager.DeviceOpenP2PConnection();
    console.info("FileioDistributedTest: DeviceOpenP2PConnection is： " + res);
    if (res == E_SA_LOAD_FAILED){
      EmptyTest()
    }else{
      FileioDistributedTest()
    }
}
