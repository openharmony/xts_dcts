import abilityDelegatorRegistry from '@ohos.app.ability.abilityDelegatorRegistry';
import hilog from '@ohos.hilog'

export default class Utils{

  static async msSleep(count:int) : Promise<int> {
    return new Promise<int>((resolve, reject) => {
      setTimeout(() => {
        resolve(0)
      }, count)
    })
  }

  static async isIntNum(val:double) : Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (typeof val === 'number' && val % 1 === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    })
  }

  static async isNegativeNum(val: double): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (typeof val === 'number' && val < 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  static async nextFileName(testName: string) : Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let abilityDelegator:abilityDelegatorRegistry.AbilityDelegator = abilityDelegatorRegistry.getAbilityDelegator();
      let context = abilityDelegator.getAppContext();
      let data = context.filesDir;
      let BASE_PATH = data + '/';
      resolve(BASE_PATH + testName);
    })
  }
}