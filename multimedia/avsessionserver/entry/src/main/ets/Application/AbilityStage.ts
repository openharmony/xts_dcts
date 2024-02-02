import AbilityStage from '@ohos.app.ability.AbilityStage';

export default class MyAbilityStage extends AbilityStage {
  onCreate(): void {
    // 应用的HAP在首次加载的时，为该Module初始化操作
    console.info("[Demo] MyAbilityStage onCreate")
    globalThis.stageOnCreateRun = 1;
    globalThis.stageContext = this.context;
  }
}