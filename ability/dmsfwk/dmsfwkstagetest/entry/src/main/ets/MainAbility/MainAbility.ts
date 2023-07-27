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
import Ability from '@ohos.app.ability.UIAbility';
import AbilityConstant from '@ohos.app.ability.AbilityConstant';
import wantConstant from '@ohos.app.ability.wantConstant';

export default class MainAbility extends Ability {
    localStorage: LocalStorage;

    onCreate(want, launchParam) {
        console.log("[Demo] MainAbility onCreate")
        globalThis.abilityWant = want;
        if (launchParam.launchReason == AbilityConstant.LaunchReason.CONTINUATION) {
            this.localStorage = new LocalStorage();
            this.context.restoreWindowStage(this.localStorage);
        }
    }

    onNewWant(want, launchParam) {
        console.log("[Demo] MainAbility onNewWant")
        globalThis.abilityWant = want;
        if (launchParam.launchReason == AbilityConstant.LaunchReason.CONTINUATION) {
            this.localStorage = new LocalStorage();
            this.context.restoreWindowStage(this.localStorage);
        }
    }

    onDestroy() {
        console.log("[Demo] MainAbility onDestroy")
    }

    onWindowStageCreate(windowStage) {
        // Main window is created, set main page for this ability
        console.log("[Demo] MainAbility onWindowStageCreate")
        globalThis.abilityContext = this.context;
        windowStage.setUIContent(this.context, "MainAbility/pages/MainAbility_pages", null)
    }

    onWindowStageRestore(windowStage) {
        // Main window is created, set main page for this ability
        console.log("[Demo] MainAbility onWindowStageRestore")
        globalThis.abilityContext = this.context;
        windowStage.setUIContent(this.context, "MainAbility/pages/MainAbility_pages", null)
    }

    onWindowStageDestroy() {
        // Main window is destroyed, release UI related resources
        console.log("[Demo] MainAbility onWindowStageDestroy")
    }

    onForeground() {
        // Ability has brought to foreground
        console.log("[Demo] MainAbility onForeground")
    }

    onBackground() {
        // Ability has back to background
        console.log("[Demo] MainAbility onBackground")
    }

    onContinue(wantParams) {
        console.log('onContinue');
        console.info(`onContinue version = ${wantParams.version}, targetDevice: ${wantParams.targetDevice}`);
        wantParams[wantConstant.Params.SUPPORT_CONTINUE_PAGE_STACK_KEY] = false;
        wantParams[wantConstant.Params.SUPPORT_CONTINUE_SOURCE_EXIT_KEY] = false;
        return AbilityConstant.OnContinueResult.AGREE;
    }
};
