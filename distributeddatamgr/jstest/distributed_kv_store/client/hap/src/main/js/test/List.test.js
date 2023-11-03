/*
 * Copyright (C) 2023 Huawei Device Co., Ltd.
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
import kvSyncTest   from './KvStoreSecurityLevelJsunit.test.js';
import kvSyncTestS1 from './KvStoreSecurityLevelS1Jsunit.test.js';
import deviceinfo from '@ohos.deviceInfo'

export default function testsuite() {
    let logTag = 'RpcClient:  ';
    let flag_41 = 1;
    let localOSVersion = "";
    let OSVersion41 = "OpenHarmony-4.1";
    let osReleaseTypeInfo = deviceinfo.osReleaseType;
    console.info('the value of the deviceinfo osReleaseType is :' + osReleaseTypeInfo);
    let osFullNameInfo = deviceinfo.osFullName;
    console.info('the value of the deviceinfo osFullName is :' + osFullNameInfo);
    localOSVersion = osFullNameInfo.substring(0, 15);
    console.info(logTag + "localOSVersion is: " + localOSVersion);

    if (localOSVersion == OSVersion41) {
        flag_41 = 1;
        console.info(logTag + "flag_41 is: " + flag_41);
        kvSyncTestS1();
    } else {
        flag_41 = 0;
        console.info(logTag + "flag_41 is: " + flag_41);
        kvSyncTest();
    }
}
