/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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
import { describe, it, expect, TestType, Size, Level, beforeAll} from "../../../hypium/index";
import hardwareManager from "@ohos.distributedHardware.hardwareManager";
import { BusinessError } from "@ohos.base"
import hilog from '@ohos.hilog'
import Utils from './Util.test';

let domain: int = 0x0000; //日志标识,0x0000作为测试框架的业务标识
let tag: string = 'testTag'; //日志标识字符串,作为tag标识当前runner类下的测试行为
let dhTypes: Array<hardwareManager.DistributedHardwareType> = [
  hardwareManager.DistributedHardwareType.ALL,
  hardwareManager.DistributedHardwareType.CAMERA,
  hardwareManager.DistributedHardwareType.SCREEN,
  hardwareManager.DistributedHardwareType.MODEM_MIC,
  hardwareManager.DistributedHardwareType.MODEM_SPEAKER,
  hardwareManager.DistributedHardwareType.MIC,
  hardwareManager.DistributedHardwareType.SPEAKER];

export default function HardwareManager_Test() {

  describe("HardwareManager_Test", (): void => {
    hilog.info(domain, tag, '%{public}s', 'describe start');

    beforeAll(() => {
      hilog.info(domain, tag, '%{public}s', 'beforeAll in');
    })

    /**
     * @tc.number    SUB_DH_HardwareManager_pauseDistributedHardware_1
     * @tc.name      SUB_DH_HardwareManager_pauseDistributedHardware_1
     * @tc.desc      test SUB_DH_HardwareManager_pauseDistributedHardware_1
     * @tc.level     LEVEL1
     * @tc.size      MEDIUMTEST
     * @tc.type      FUNCTION
     */
    it("SUB_DH_HardwareManager_pauseDistributedHardware_1", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL1,async (done: () => void): Promise<void> => {
      await Utils.msSleep(1000)
      hilog.info(domain, tag, '%{public}s','-------------------- start SUB_DH_HardwareManager_pauseDistributedHardware_1 --------------------')
      try {
        for (const dhType of dhTypes) {
          let description: hardwareManager.HardwareDescriptor = {
            type: dhType,
            srcNetworkId: '1111'
          };
          hilog.info(domain, tag, 'description: ' + JSON.stringify(description));
          hardwareManager.pauseDistributedHardware(description).then(() => {
            hilog.info(domain, tag, 'pause distributed hardware successfully');
          }).catch((error: Error) => {
            let err: BusinessError = error as BusinessError;
            hilog.error(domain, tag, '%{public}s', `pause distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
            if (err.code != 202 ) {
              expect(null).assertFail();
            }
          })
        }
        hilog.info(domain, tag, 'pause distributed hardware done');
      } catch (error) {
        let err: BusinessError = error as BusinessError;
        hilog.error(domain, tag, '%{public}s', `pause distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
        expect(null).assertFail();
      } finally {
        hilog.info(domain, tag, '%{public}s', 'SUB_DH_HardwareManager_pauseDistributedHardware_1 reclaim done')
      }
      hilog.info(domain, tag, '%{public}s','-------------------- end SUB_DH_HardwareManager_pauseDistributedHardware_1 --------------------')
      done()
    });

    /**
     * @tc.number    SUB_DH_HardwareManager_resumeDistributedHardware_1
     * @tc.name      SUB_DH_HardwareManager_resumeDistributedHardware_1
     * @tc.desc      test SUB_DH_HardwareManager_resumeDistributedHardware_1
     * @tc.level     LEVEL1
     * @tc.size      MEDIUMTEST
     * @tc.type      FUNCTION
     */
    it("SUB_DH_HardwareManager_resumeDistributedHardware_1", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL1,async (done: () => void): Promise<void> => {
      await Utils.msSleep(1000)
      hilog.info(domain, tag, '%{public}s','-------------------- start SUB_DH_HardwareManager_resumeDistributedHardware_1 --------------------')
      try {
        for (const dhType of dhTypes) {
          let description: hardwareManager.HardwareDescriptor = {
            type: dhType,
            srcNetworkId: '1111'
          };
          hilog.info(domain, tag, 'description: ' + JSON.stringify(description));
          hardwareManager.resumeDistributedHardware(description).then(() => {
            hilog.info(domain, tag, 'resume distributed hardware successfully');
          }).catch((error: Error) => {
            let err: BusinessError = error as BusinessError;
            hilog.error(domain, tag, '%{public}s', `resume distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
            if (err.code != 202 ) {
              expect(null).assertFail();
            }
          })
        }
        hilog.info(domain, tag, 'resume distributed hardware done');
      } catch (error) {
        let err: BusinessError = error as BusinessError;
        hilog.error(domain, tag, '%{public}s', `resume distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
        expect(null).assertFail();
      } finally {
        hilog.info(domain, tag, '%{public}s', 'SUB_DH_HardwareManager_resumeDistributedHardware_1 reclaim done')
      }
      hilog.info(domain, tag, '%{public}s','-------------------- end SUB_DH_HardwareManager_resumeDistributedHardware_1 --------------------')
      done()
    });

    /**
     * @tc.number    SUB_DH_HardwareManager_stopDistributedHardware_1
     * @tc.name      SUB_DH_HardwareManager_stopDistributedHardware_1
     * @tc.desc      test SUB_DH_HardwareManager_stopDistributedHardware_1
     * @tc.level     LEVEL1
     * @tc.size      MEDIUMTEST
     * @tc.type      FUNCTION
     */
    it("SUB_DH_HardwareManager_stopDistributedHardware_1", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL1,async (done: () => void): Promise<void> => {
      await Utils.msSleep(1000)
      hilog.info(domain, tag, '%{public}s','-------------------- start SUB_DH_HardwareManager_stopDistributedHardware_1 --------------------')
      try {
        for (const dhType of dhTypes) {
          let description: hardwareManager.HardwareDescriptor = {
            type: dhType,
            srcNetworkId: '1111'
          };
          hilog.info(domain, tag, 'description: ' + JSON.stringify(description));
          hardwareManager.stopDistributedHardware(description).then(() => {
            hilog.info(domain, tag, 'stop distributed hardware successfully');
          }).catch((error: Error) => {
            let err: BusinessError = error as BusinessError;
            hilog.error(domain, tag, '%{public}s', `stop distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
            if (err.code != 202 ) {
              expect(null).assertFail();
            }
          })
        }
        hilog.info(domain, tag, 'stop distributed hardware done');
      } catch (error) {
        let err: BusinessError = error as BusinessError;
        hilog.error(domain, tag, '%{public}s', `stop distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
        expect(null).assertFail();
      } finally {
        hilog.info(domain, tag, '%{public}s', 'SUB_DH_HardwareManager_stopDistributedHardware_1 reclaim done')
      }
      hilog.info(domain, tag, '%{public}s','-------------------- end SUB_DH_HardwareManager_stopDistributedHardware_1 --------------------')
      done()
    });

    /**
     * @tc.number    SUB_DH_HardwareManager_pauseDistributedHardware_2
     * @tc.name      SUB_DH_HardwareManager_pauseDistributedHardware_2
     * @tc.desc      test SUB_DH_HardwareManager_pauseDistributedHardware_2
     * @tc.level     LEVEL1
     * @tc.size      MEDIUMTEST
     * @tc.type      FUNCTION
     */
    it("SUB_DH_HardwareManager_pauseDistributedHardware_2", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL1,async (done: () => void): Promise<void> => {
      await Utils.msSleep(1000)
      hilog.info(domain, tag, '%{public}s','-------------------- start SUB_DH_HardwareManager_pauseDistributedHardware_2 --------------------')
      try {
        for (const dhType of dhTypes) {
          let description: hardwareManager.HardwareDescriptor = {
            type: dhType
          };
          hilog.info(domain, tag, 'description: ' + JSON.stringify(description));
          hardwareManager.pauseDistributedHardware(description).then(() => {
            hilog.info(domain, tag, 'pause distributed hardware successfully');
          }).catch((error: Error) => {
            let err: BusinessError = error as BusinessError;
            hilog.error(domain, tag, '%{public}s', `pause distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
            if (err.code != 202 ) {
              expect(null).assertFail();
            }
          })
        }
        hilog.info(domain, tag, 'pause distributed hardware done');
      } catch (error) {
        let err: BusinessError = error as BusinessError;
        hilog.error(domain, tag, '%{public}s', `pause distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
        expect(null).assertFail();
      } finally {
        hilog.info(domain, tag, '%{public}s', 'SUB_DH_HardwareManager_pauseDistributedHardware_2 reclaim done')
      }
      hilog.info(domain, tag, '%{public}s','-------------------- end SUB_DH_HardwareManager_pauseDistributedHardware_2 --------------------')
      done()
    });

    /**
     * @tc.number    SUB_DH_HardwareManager_resumeDistributedHardware_2
     * @tc.name      SUB_DH_HardwareManager_resumeDistributedHardware_2
     * @tc.desc      test SUB_DH_HardwareManager_resumeDistributedHardware_2
     * @tc.level     LEVEL1
     * @tc.size      MEDIUMTEST
     * @tc.type      FUNCTION
     */
    it("SUB_DH_HardwareManager_resumeDistributedHardware_2", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL1,async (done: () => void): Promise<void> => {
      await Utils.msSleep(1000)
      hilog.info(domain, tag, '%{public}s','-------------------- start SUB_DH_HardwareManager_resumeDistributedHardware_2 --------------------')
      try {
        for (const dhType of dhTypes) {
          let description: hardwareManager.HardwareDescriptor = {
            type: dhType
          };
          hilog.info(domain, tag, 'description: ' + JSON.stringify(description));
          hardwareManager.resumeDistributedHardware(description).then(() => {
            hilog.info(domain, tag, 'resume distributed hardware successfully');
          }).catch((error: Error) => {
            let err: BusinessError = error as BusinessError;
            hilog.error(domain, tag, '%{public}s', `resume distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
            if (err.code != 202 ) {
              expect(null).assertFail();
            }
          })
        }
        hilog.info(domain, tag, 'resume distributed hardware done');
      } catch (error) {
        let err: BusinessError = error as BusinessError;
        hilog.error(domain, tag, '%{public}s', `resume distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
        expect(null).assertFail();
      } finally {
        hilog.info(domain, tag, '%{public}s', 'SUB_DH_HardwareManager_resumeDistributedHardware_2 reclaim done')
      }
      hilog.info(domain, tag, '%{public}s','-------------------- end SUB_DH_HardwareManager_resumeDistributedHardware_2 --------------------')
      done()
    });

    /**
     * @tc.number    SUB_DH_HardwareManager_stopDistributedHardware_2
     * @tc.name      SUB_DH_HardwareManager_stopDistributedHardware_2
     * @tc.desc      test SUB_DH_HardwareManager_stopDistributedHardware_2
     * @tc.level     LEVEL1
     * @tc.size      MEDIUMTEST
     * @tc.type      FUNCTION
     */
    it("SUB_DH_HardwareManager_stopDistributedHardware_2", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL1,async (done: () => void): Promise<void> => {
      await Utils.msSleep(1000)
      hilog.info(domain, tag, '%{public}s','-------------------- start SUB_DH_HardwareManager_stopDistributedHardware_2 --------------------')
      try {
        for (const dhType of dhTypes) {
          let description: hardwareManager.HardwareDescriptor = {
            type: dhType
          };
          hilog.info(domain, tag, 'description: ' + JSON.stringify(description));
          hardwareManager.stopDistributedHardware(description).then(() => {
            hilog.info(domain, tag, 'stop distributed hardware successfully');
          }).catch((error: Error) => {
            let err: BusinessError = error as BusinessError;
            hilog.error(domain, tag, '%{public}s', `stop distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
            if (err.code != 202 ) {
              expect(null).assertFail();
            }
          })
        }
        hilog.info(domain, tag, 'stop distributed hardware done');
      } catch (error) {
        let err: BusinessError = error as BusinessError;
        hilog.error(domain, tag, '%{public}s', `stop distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
        expect(null).assertFail();
      } finally {
        hilog.info(domain, tag, '%{public}s', 'SUB_DH_HardwareManager_stopDistributedHardware_2 reclaim done')
      }
      hilog.info(domain, tag, '%{public}s','-------------------- end SUB_DH_HardwareManager_stopDistributedHardware_2 --------------------')
      done()
    });

    /**
     * @tc.number    SUB_DH_HardwareManager_pauseDistributedHardware_4
     * @tc.name      SUB_DH_HardwareManager_pauseDistributedHardware_4
     * @tc.desc      test SUB_DH_HardwareManager_pauseDistributedHardware_4
     * @tc.level     LEVEL1
     * @tc.size      MEDIUMTEST
     * @tc.type      FUNCTION
     */
    it("SUB_DH_HardwareManager_pauseDistributedHardware_4", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL1,async (done: () => void): Promise<void> => {
      await Utils.msSleep(1000)
      hilog.info(domain, tag, '%{public}s','-------------------- start SUB_DH_HardwareManager_pauseDistributedHardware_4 --------------------')
      try {
        let description: hardwareManager.HardwareDescriptor = {
          type: hardwareManager.DistributedHardwareType.CAMERA,
          srcNetworkId: ''
        };
        hilog.info(domain, tag, 'description: ' + JSON.stringify(description));
        hardwareManager.pauseDistributedHardware(description).then(() => {
          hilog.info(domain, tag, 'pause distributed hardware successfully');
        }).catch((error: Error) => {
          let err: BusinessError = error as BusinessError;
          hilog.error(domain, tag, '%{public}s', `pause distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
          if (err.code != 202 && err.code != 401 ) {
            expect(null).assertFail();
          }
        })
        hilog.info(domain, tag, 'pause distributed hardware done');
      } catch (error) {
        let err: BusinessError = error as BusinessError;
        hilog.error(domain, tag, '%{public}s', `pause distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
        expect(null).assertFail();
      } finally {
        hilog.info(domain, tag, '%{public}s', 'SUB_DH_HardwareManager_pauseDistributedHardware_4 reclaim done')
      }
      hilog.info(domain, tag, '%{public}s','-------------------- end SUB_DH_HardwareManager_pauseDistributedHardware_4 --------------------')
      done()
    });

    /**
     * @tc.number    SUB_DH_HardwareManager_resumeDistributedHardware_4
     * @tc.name      SUB_DH_HardwareManager_resumeDistributedHardware_4
     * @tc.desc      test SUB_DH_HardwareManager_resumeDistributedHardware_4
     * @tc.level     LEVEL1
     * @tc.size      MEDIUMTEST
     * @tc.type      FUNCTION
     */
    it("SUB_DH_HardwareManager_resumeDistributedHardware_4", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL1,async (done: () => void): Promise<void> => {
      await Utils.msSleep(1000)
      hilog.info(domain, tag, '%{public}s','-------------------- start SUB_DH_HardwareManager_resumeDistributedHardware_4 --------------------')
      try {
        let description: hardwareManager.HardwareDescriptor = {
          type: hardwareManager.DistributedHardwareType.CAMERA,
          srcNetworkId: ''
        };
        hilog.info(domain, tag, 'description: ' + JSON.stringify(description));
        hardwareManager.resumeDistributedHardware(description).then(() => {
          hilog.info(domain, tag, 'resume distributed hardware successfully');
        }).catch((error: Error) => {
          let err: BusinessError = error as BusinessError;
          hilog.error(domain, tag, '%{public}s', `resume distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
          if (err.code != 202 && err.code != 401 ) {
            expect(null).assertFail();
          }
        })
        hilog.info(domain, tag, 'resume distributed hardware done');
      } catch (error) {
        let err: BusinessError = error as BusinessError;
        hilog.error(domain, tag, '%{public}s', `resume distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
        expect(null).assertFail();
      } finally {
        hilog.info(domain, tag, '%{public}s', 'SUB_DH_HardwareManager_resumeDistributedHardware_4 reclaim done')
      }
      hilog.info(domain, tag, '%{public}s','-------------------- end SUB_DH_HardwareManager_resumeDistributedHardware_4 --------------------')
      done()
    });

    /**
     * @tc.number    SUB_DH_HardwareManager_stopDistributedHardware_4
     * @tc.name      SUB_DH_HardwareManager_stopDistributedHardware_4
     * @tc.desc      test SUB_DH_HardwareManager_stopDistributedHardware_4
     * @tc.level     LEVEL1
     * @tc.size      MEDIUMTEST
     * @tc.type      FUNCTION
     */
    it("SUB_DH_HardwareManager_stopDistributedHardware_4", TestType.FUNCTION | Size.MEDIUMTEST | Level.LEVEL1,async (done: () => void): Promise<void> => {
      await Utils.msSleep(1000)
      hilog.info(domain, tag, '%{public}s','-------------------- start SUB_DH_HardwareManager_stopDistributedHardware_4 --------------------')
      try {
        let description: hardwareManager.HardwareDescriptor = {
          type: hardwareManager.DistributedHardwareType.CAMERA,
          srcNetworkId: ''
        };
        hilog.info(domain, tag, 'description: ' + JSON.stringify(description));
        hardwareManager.stopDistributedHardware(description).then(() => {
          hilog.info(domain, tag, 'stop distributed hardware successfully');
        }).catch((error: Error) => {
          let err: BusinessError = error as BusinessError;
          hilog.error(domain, tag, '%{public}s', `stop distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
          if (err.code != 202 && err.code != 401 ) {
            expect(null).assertFail();
          }
        })
        hilog.info(domain, tag, 'stop distributed hardware done');
      } catch (error) {
        let err: BusinessError = error as BusinessError;
        hilog.error(domain, tag, '%{public}s', `stop distributed hardware failed: code is ${err.code}, msg is ${err.message}`);
        expect(null).assertFail();
      } finally {
        hilog.info(domain, tag, '%{public}s', 'SUB_DH_HardwareManager_stopDistributedHardware_4 reclaim done')
      }
      hilog.info(domain, tag, '%{public}s','-------------------- end SUB_DH_HardwareManager_stopDistributedHardware_4 --------------------')
      done()
    });

  })
}