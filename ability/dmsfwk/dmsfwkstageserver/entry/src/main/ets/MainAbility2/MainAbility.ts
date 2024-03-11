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
import Ability from '@ohos.app.ability.UIAbility'
import AcCtrl from '@ohos.abilityAccessCtrl'
let AcManager = AcCtrl.createAtManager()
export default class MainAbility2 extends Ability {
    onCreate(want, launchParam) {
        console.log("[Demo] MainAbility onCreate:" + JSON.stringify(want))
        globalThis.abilityWant = want;
        if(want.parameters != undefined){
            if(want.parameters.startReason == "terminateSelf"){
                setTimeout(() => {
                    console.log("[Demo] MainAbility terminateSelf")
                    this.context.terminateSelf((err, data)=>{
                        console.log("[Demo] MainAbility terminateSelf " + JSON.stringify(err))
                    })
                }, 2000);
            }
            if(want.parameters.startReason == "terminateSelfWithResult"){
                setTimeout(() => {
                    console.log("[Demo] MainAbility terminateSelfWithResult")
                    this.context.terminateSelfWithResult({
                        resultCode:100,
                        want:{
                            bundleName:"com.example.configuration",
                            abilityName:"com.example.configuration.MainAbility"
                        }
                    }, (err, data)=>{
                        console.log("[Demo] MainAbility terminateSelfWithResult " + JSON.stringify(err))
                    })
                }, 2000);
            }
        }
        setTimeout(()=>{
            this.context.terminateSelf()
        },5000)
    }

    onDestroy() {
        console.log("[Demo] MainAbility onDestroy")
    }

    onWindowStageCreate(windowStage) {
        // Main window is created, set main page for this ability
        console.log("[Demo] MainAbility onWindowStageCreate")
        globalThis.abilityContext = this.context;
        windowStage.setUIContent(this.context, "MainAbility2/pages/MainAbility_pages", null)
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
};
