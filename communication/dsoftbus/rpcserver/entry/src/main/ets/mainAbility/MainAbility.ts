/*
 * Copyright (c) 2021-2024 Huawei Device Co., Ltd.
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

import UIAbility from '@ohos.app.ability.UIAbility';
import hilog from '@ohos.hilog';
import window from '@ohos.window';
import AcCtrl from '@ohos.abilityAccessCtrl';

let AcManager = AcCtrl.createAtManager();
export default class MainAbility extends UIAbility {
    onCreate(want, launchParam) {
        console.info('AceApplication onCreate');

        console.info('Calc[IndexPage] grantPermission');
        AcManager.requestPermissionsFromUser(this.context, ['ohos.permission.DISTRIBUTED_DATASYNC'], function (result) {
            console.info('Calc[IndexPage] grantPermission,requestPermissionsFromUser');
        });
    }

    onDestroy() {
        console.info("onDestroy");
    }

    onWindowStageCreate(windowStage: window.WindowStage) {
        // Main window is created, set main page for this ability
        hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onWindowStageCreate');
    
        windowStage.loadContent('pages/Index', (err, data) => {
          if (err.code) {
            hilog.error(0x0000, 'testTag', 'Failed to load the content. Cause: %{public}s', JSON.stringify(err) ?? '');
            return;
          }
            hilog.info(0x0000, 'testTag', 'Succeeded in loading the content. Data: %{public}s', JSON.stringify(data) ?? '');
        });
      }

    onWindowStageDestroy() {
        // Main window is destroyed, release UI related resources
        console.info("onWindowStageDestroy");
    }

    onForeground() {
        // Ability has brought to foreground
        console.info("onForeground");
    }

    onBackground() {
        // Ability has back to background
        console.info("onBackground");
    }

};
