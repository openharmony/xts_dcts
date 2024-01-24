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
import rpc from '@ohos.rpc';
import CommonEventManager from '@ohos.commonEventManager';
import common from '@ohos.app.ability.common';

export class MyMessageAble {
  num: number = 0;
  str: string = '';
  constructor(num:number, string:string) {
    this.num = num;
    this.str = string;
  }
  marshalling(messageParcel) {
    console.log('MyMessageAble messageParcel marshalling' + this.num , + this.str)
    messageParcel.writeInt(this.num);
    messageParcel.writeString(this.str);
    return true;
  }
  unmarshalling(messageParcel) {
    console.log('MyMessageAble messageParcel unmarshalling' + this.num , + this.str)
    this.num = messageParcel.readInt();
    this.str = messageParcel.readString();
    return true;
  }
}

export class StubTest extends rpc.RemoteObject {
    constructor(descriptor) {

        super(descriptor)
    }

    onRemoteRequest(code, data, reply, option) {

        console.info("onRemoteRequest: " + code)
        let tmp1 = data.readInt();
        let tmp2 = data.readInt();
        let tmp3 = tmp1 + tmp2;
        let result = reply.writeInt(tmp3);
        console.info("The server's writeInt result is " + result);
        CommonEventManager.publish("DmsFwkService_RemoteObject", {
            parameters: {
                "msg": "receiveMessage = " + data.readInt()
            }
        }, (err, data) => {
            console.info("DmsFwkService_ConnectAbility onCreate");
        });
        return true
    }
}
export default class MainAbility extends Ability {
    localStorage: LocalStorage;

    onCreate(want, launchParam) {
        console.log("[Demo] MainAbility onCreate");
        AppStorage.setOrCreate<common.UIAbilityContext>('context', this.context);
        globalThis.abilityWant = want;
        if (launchParam.launchReason == AbilityConstant.LaunchReason.CONTINUATION) {
            this.localStorage = new LocalStorage();
            this.context.restoreWindowStage(this.localStorage);
        }
    }
    onConnect(want) {

        console.info("DmsFwkStageServer ServiceAbility onConnect")
        let commonEventPublishData = {
            parameters: {
                "life": "onConnect"
            }
        }
        CommonEventManager.publish("DmsFwkService_ConnectAbility", commonEventPublishData, (err) => {
            console.info("DmsFwkService_ConnectAbility onCreate");
        });
        return new StubTest("test");
    }

    onDisconnect(want) {
        console.info("DmsFwkStageServer ServiceAbility onDisconnect")

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
        console.log("[Demo] MainAbility onWindowStageCreate")
        globalThis.abilityContext = this.context;
        windowStage.setUIContent(this.context, "MainAbility/pages/MainAbility_pages", null)
    }

    onWindowStageRestore(windowStage) {
        console.log("[Demo] MainAbility onWindowStageRestore")
        globalThis.abilityContext = this.context;
        windowStage.setUIContent(this.context, "MainAbility/pages/MainAbility_pages", null)
    }

    onWindowStageDestroy() {
        console.log("[Demo] MainAbility onWindowStageDestroy")
    }

    onForeground() {
        console.log("[Demo] MainAbility onForeground")
    }

    onBackground() {
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
