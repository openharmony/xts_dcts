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

#include <gtest/gtest.h>
#include "dcamera_client_test.h"

using namespace testing::ext;

int32_t DCAMERA_OK = 0;

class DCameraAutomatTest : public testing::Test {
public:
    static void SetUpTestCase(void);
    static void TearDownTestCase(void);
    void SetUp();
    void TearDown();
    DCameraAutomatTest();
};
void DCameraAutomatTest::SetUpTestCase(void) {}

void DCameraAutomatTest::TearDownTestCase(void)
{
    int ret = ReleaseDCamera();
    EXPECT_EQ(DCAMERA_OK, ret) << "ReleaseDCamera fail";
}
void DCameraAutomatTest::SetUp(void) {}

void DCameraAutomatTest::TearDown(void) {}
DCameraAutomatTest::DCameraAutomatTest(void) {}


HWTEST_F(DCameraAutomatTest, DCameraTest_0100, TestSize.Level1)
{
    int ret = InitDCamera();
    EXPECT_EQ(DCAMERA_OK, ret) << "InitDCamera fail";
    ret = DCameraPreview();
    EXPECT_EQ(DCAMERA_OK, ret) << "DCameraPreview fail";
    ret = DCameraPhoto();
    EXPECT_EQ(DCAMERA_OK, ret) << "DCameraPhoto fail";
}

