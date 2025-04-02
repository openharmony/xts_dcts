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

import { describe, it, expect, Level } from '@ohos/hypium'

export default function EmptyTest() {
  describe('EmptyTest', () => {
    /*
      * @tc.number: test_fileio_create_dir_sync_000
      * @tc.name  : test_fileio_create_dir_sync_000
      * @tc.desc  : The Devices not support this stsCap.
      * @tc.size  : MediumTest
      * @tc.type  : Function
      * @tc.level : Level 3
      */
    it('test_fileio_create_dir_sync_000', Level.LEVEL3, async (done) => {
      let a = 1;
      let b = 2;
      expect(a+b).assertEqual(3);
      done();
    });
  })
}

