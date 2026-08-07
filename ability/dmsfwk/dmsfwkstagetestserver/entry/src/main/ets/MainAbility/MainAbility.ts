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
import AcCtrl from '@ohos.abilityAccessCtrl';
import AbilityConstant from '@ohos.app.ability.AbilityConstant';
import wantConstant from '@ohos.app.ability.wantConstant';
import { hilog } from '@kit.PerformanceAnalysisKit';
import abilityConnectionManager from '@ohos.distributedsched.abilityConnectionManager';

let AcManager = AcCtrl.createAtManager();

class MyMessageAble {
    num: number = 0;
    str: string = '';
    constructor(num: number, string: string) {
        this.num = num;
        this.str = string;
    }
    marshalling(messageParcel) {
        console.log('MyMessageAble messageParcel marshalling' + this.num + this.str)
        messageParcel.writeInt(this.num);
        messageParcel.writeString(this.str);
        return true;
    }
    unmarshalling(messageParcel) {
        console.log('MyMessageAble messageParcel unmarshalling' + this.num + this.str)
        this.num = messageParcel.readInt();
        this.str = messageParcel.readString();
        return true;
    }
}

function funcCallBack(pdata) {
    console.log('MainAbility funcCallBack is called' + pdata);
    let msg = new MyMessageAble(0, '');
    console.log('CALLTEST pdata.readSequenceable BEGIN');
    pdata.readParcelable(msg);
    return new MyMessageAble(10, 'Callee test')
}

export default class MainAbility extends Ability {
    localStorage: LocalStorage;

    onCreate(want, launchParam) {
        console.log("[Demo] MainAbility onCreate")
        globalThis.abilityWant = want;
        if (launchParam.launchReason == AbilityConstant.LaunchReason.CONTINUATION) {
            this.localStorage = new LocalStorage();
            this.context.restoreWindowStage(this.localStorage);
        }
        AcManager.requestPermissionsFromUser(this.context, ['ohos.permission.DISTRIBUTED_DATASYNC'], function (result) {
            console.info('Calc[IndexPage] grantPermission,requestPermissionsFromUser')
        })
        this.callee.on('test', funcCallBack);
    }

    onCollaborate(wantParam: Record<string, Object>): AbilityConstant.CollaborateResult {
        console.log('[demo] on collaborate begin');
        this.onCollab(wantParam);
        return 0;
    }

    onCollab(collabParam: Record<string, Object>) {
        let sessionId = this.createSessionFromWant(collabParam);
        console.log('[demo] onCollab this.createSessionFromWant sessionId' + sessionId);
        if (sessionId === -1) {
            hilog.info(0x0000, 'testTag', 'Invalid session ID.');
            console.log('[demo] onCollab session ID ' + sessionId);
            return;
        }
        console.log('[demo] onCollab sessionId' + sessionId);
        let collabToken = collabParam['ohos.extra.param.key.supportCollaborateIndex']['ohos.dms.collabToken'] as string;
        console.log('[demo] collabToken is' + collabToken);
        abilityConnectionManager.acceptConnect(sessionId, collabToken).then(() => {
            console.log('[demo] abilityConnectionManager.acceptConnect success');
        }).catch(() => {
            console.log('[demo] abilityConnectionManager.acceptConnect failed');
        });
    }

    createSessionFromWant(collabParam: Record<string, Object>): number {
        console.log('[demo] createSessionFromWant begin');
        console.log('[demo] createSessionFromWant begin one ' + JSON.stringify(collabParam));
        console.log('[demo] createSessionFromWant begin tow ' + JSON.stringify(collabParam['ohos.extra.param.key.supportCollaborateIndex']));
        let sessionId = -1;
        let peerInfo = collabParam['ohos.extra.param.key.supportCollaborateIndex']['PeerInfo'] as abilityConnectionManager.PeerInfo;
        console.log('[demo] createSessionFromWant PeerInfo is ' + JSON.stringify(peerInfo));
        if (peerInfo === undefined) {
            return sessionId;
        }
        console.log('[demo] onCollab begin one ' + JSON.stringify(peerInfo));

        let options = collabParam['ohos.extra.param.key.supportCollaborateIndex']['ConnectOption'] as abilityConnectionManager.ConnectOptions;
        console.log('[demo] createSessionFromWant options is ' + JSON.stringify(options));
        options.needSendData = true;
        options.needSendStream = false;
        options.needReceiveStream = false;
        console.log('[demo] createSessionFromWant options is ' + JSON.stringify(options));
        try {
            sessionId = abilityConnectionManager.createAbilityConnectionSession('collabTest', this.context, peerInfo, options);
            console.log('[demo] createAbilityConnectionSession sessionId is ' + sessionId);
        } catch (error) {
            console.log('[demo] createAbilityConnectionSession sessionId is failed ' + error.code);
        }
        return sessionId;
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
