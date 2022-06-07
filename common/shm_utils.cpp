/*
 * Copyright (C) 2022 Huawei Device Co., Ltd.
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

#include <cstring>
#include <string.h>

#include "shm_utils.h"

using namespace std;

static void* shm = NULL;             //分配的共享内存的原始首地址
static struct shared_use_st* shared; //指向shm
static int shmid;                    //共享内存标识符
const int CALCU_TWO = 2;
const int CODE_HEAD = 4;
const int STR_KEY = 5;
const int RES_FAIL = -1;
int createShm(int key)
{
    //创建共享内存
    shmid = shmget((key_t)key, sizeof(struct shared_use_st), 0666 | IPC_CREAT);
    if (shmid == -1) {
        return -1;
    }
    //将共享内存连接到当前进程的地址空间
    shm = shmat(shmid, nullptr, 0);
    int n = -1;
    if (shm == static_cast<void*>(&n)) {
        return -1;
    }

    shared = (struct shared_use_st*)shm;
    initShm();
    return 0;
}

void initShm(void)
{
    memset_s(shm, sizeof(struct shared_use_st), 0, sizeof(struct shared_use_st));
    shared->written = 0;
    memset_s(shared->data, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    return;
}

int readDataFromShm(char* buf)
{
    // LOG("readDataFormShm, begin");
    if (shared->written != 0) {
        strcpy_s(buf, strlen(shared->data) + 1, shared->data);
        shared->written = 0;
        LOG("readDataFromShm %s", buf);
        memset_s(shared->data, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    } else {
        return -1;
    }
    return 0;
}

int waitDataWithCode(char* code, char* data)
{
    int i = 0;
    int timeout = 10;
    char str[1024] = { 0 };
    memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    while (i < timeout) {
        if (readDataFromShm(str) == 0 && strncmp(code, str, CODE_HEAD) == 0) {
            errno_t ret = 1;
            ret = strncpy_s(data, strlen("0") + 1, str + STR_KEY, 1);
            if (ret != EOK) {
                LOG("ERR:ret=%d", ret);
                return RES_FAIL;
            }
            return 0;
        }
        i++;
        sleep(1);
    }

    return -1;
}

int writeCodeDataToShm(int code, char* buf)
{
    char str[1024] = { 0 };
    memset_s(str, MAX_DATA_LENGTH, 0, MAX_DATA_LENGTH);
    char codeStr[5] = { 0 };
    memset_s(codeStr, 5, 0, 5);
    Int2String(code, codeStr);
    strcpy_s(str, strlen(codeStr) + 1, codeStr);
    if (strcat_s(str, strlen(":") + 1, ":") != EOK) {
        return -1;
    }
    if (strcat_s(str, strlen(buf) + 1, buf) != EOK) {
        return -1;
    }
    writeDataToShm(str);
    return 0;
}
int writeDataToShm(char* buf)
{
    LOG("writeDataToShm, begin");
    while (shared->written == 1) {
        sleep(1);
    }

    LOG("writeDataToShm %s", buf);
    memset_s(shared->data, 5, 0, 5);
    strcpy_s(shared->data, strlen(buf) + 1, buf);
    shared->written = 1;
    sleep(2);
    return 0;
}

int disconnectShm(void)
{
    if (shmdt(shm) == -1) {
        return -1;
    }
    return 0;
}

int deleteShm(void)
{
    if (shmctl(shmid, IPC_RMID, nullptr) == -1) {
        return -1;
    }
    return 0;
}

char* Int2String(int num, char* str) // 10进制
{
    int i = 0;   //指示填充str
    if (num < 0) //如果num为负数，将num变正
    {
        num = -num;
        str[i++] = '-';
    }
    //转换
    do {
        str[i++] = num % 10 + 48; //取num最低位 字符0~9的ASCII码是48~57：简单来说数字0+48=48，ASCII码对应字符'0'
        num /= 10;                //去掉最低位
    } while (num);                // num不为0继续循环

    str[i] = '\0';

    //确定开始调整的位置
    int j = 0;
    if (str[0] == '-') //如果有负号，负号不用调整
    {
        j = 1; //从第二位开始调整
        ++i;   //由于有负号，所以交换的对称轴也要后移一位
    }
    //对称交换
    for (; j < i / CALCU_TWO; j++) {
        //对称交换两端的值 其实就是省下中间变量交换a+b的值：a=a+b;b=a-b;a=a-b;
        str[j] = str[j] + str[i - 1 - j];
        str[i - 1 - j] = str[j] - str[i - 1 - j];
        str[j] = str[j] - str[i - 1 - j];
    }

    return str; //返回转换后的值
}