/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

import Ability from '@ohos.app.ability.UIAbility';
import AcCtrl from '@ohos.abilityAccessCtrl';
import {Core} from 'deccjsunit/index';

let AcManager = AcCtrl.createAtManager()
export default class MainAbility extends Ability {
    onCreate(want, launchParam) {
        console.info('AceApplication onCreate');
        const core = Core.getInstance()
        core.init()
        const configService = core.getDefaultService('config')
        configService.setConfig(this)

        console.info('Calc[IndexPage] grantPermission')
        AcManager.requestPermissionsFromUser(this.context, ['ohos.permission.DISTRIBUTED_DATASYNC'], function (result) {
            console.info('Calc[IndexPage] grantPermission,requestPermissionsFromUser')
        })
    }

    onDestroy() {
        console.info("onDestroy")
    }

    onWindowStageCreate(windowStage) {
        // Main window is created, set main page for this ability
        console.info("onWindowStageCreate")

        windowStage.setUIContent(this.context, "pages/index", null)
    }

    onWindowStageDestroy() {
        // Main window is destroyed, release UI related resources
        console.info("onWindowStageDestroy")
    }

    onForeground() {
        // Ability has brought to foreground
        console.info("onForeground")
    }

    onBackground() {
        // Ability has back to background
        console.info("onBackground")
    }

};
