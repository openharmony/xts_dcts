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

import {Core} from 'deccjsunit/index';
import featureAbility from '@ohos.ability.featureAbility';

export default {
    onCreate() {
        console.info('AceApplication onCreate');
        const core = Core.getInstance()
        core.init()
        const configService = core.getDefaultService('config')
        configService.setConfig(this)

        console.info('Calc[IndexPage] grantPermission')
        let context = featureAbility.getContext()
        context.requestPermissionsFromUser(['ohos.permission.DISTRIBUTED_DATASYNC'], 666, function (result) {
            console.info('Calc[IndexPage] grantPermission,requestPermissionsFromUser,'+result.requestCode)
        })
        setTimeout(()=>{
            featureAbility.terminateSelf()
        },2000)
    },
    onDestroy() {
        console.info('AceApplication onDestroy');
    }
};
