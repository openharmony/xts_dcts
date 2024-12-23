#!/bin/bash

# Copyright (C) 2022 Huawei Device Co., Ltd.
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -e

usage()
{
    echo
    echo "USAGE"
    echo "       ./build.sh [suite=BUILD_TARGET] [target_os=TARGET_OS] [target_arch=TARGET_ARCH] [variant=BUILD_VARIANT] [target_subsystem=TARGET_SUBSYSTEM]"
    echo "                  target_platform  : TARGET_PLATFORM  the target platform, such as phone or ivi; Default to phone"
    echo "                  suite            : BUILD_TARGET       cts/hit/vts and so on, default value is hit"
    echo "                  target_arch      : TARGET_ARCH      arm64 or arm32, default value is arm64"
    echo "                  variant          : BUILD_VARIANT    release or debug. The default value is debug."
    echo "                  target_subsystem : TARGET_SUBSYSTEM the target subsystem to build"
    echo "                  system_size      : SYSTEM_SIZE      standard, large, and son on. Wherein,large is for L3-L5, and standard is for L2. The default value is large."
    echo "                  product_name     : PRODUCT_NAME     product name,for example,hikey960,Hi3516DV300,and so on."
    echo
    exit 1
}


parse_cmdline()
{
    BASE_HOME=$(dirname $(cd $(dirname $0); pwd))
    BASE_HOME=${BASE_HOME}/../..
    BUILD_TOOLS_DIR=${BASE_HOME}/prebuilts/build-tools/linux-x86/bin
    OUT_DIR=${BASE_HOME}/out
    BUILD_SHELL=${BASE_HOME}/build.sh
    # build all parts for all products by default
    BUILD_TARGET=""
    TARGET_PLATFORM=all
    GN_ARGS="is_dbt_test=true include_all=false"
    TARGET_ARCH=arm
    BUILD_VARIANT=release
    UPLOAD_API_INFO=False
    SYSTEM_SIZE=large
    PRODUCT_NAME=""
    USE_MUSL=false
    export PATH=${BASE_HOME}/prebuilts/python/linux-x86/3.8.3/bin:$PATH

    while [ -n "$1" ]
    do
        var="$1"
        OPTIONS=${var%%=*}
        PARAM=${var#*=}
        echo "OPTIONS=$OPTIONS"
        echo "PARAM=$PARAM"
        echo "-------------------"
        case "$OPTIONS" in
        suite)            BUILD_TARGET="$PARAM"
                          ;;
        target_arch)      TARGET_ARCH="$PARAM"
                          ;;
        variant)          BUILD_VARIANT="$PARAM"
                          ;;
	    target_platform)  TARGET_PLATFORM="$PARAM"
                          ;;
        use_musl)         USE_MUSL="$PARAM"
                          ;;                         
        target_subsystem) export target_subsystem=${PARAM}
                          ;;
        system_size)      SYSTEM_SIZE="$PARAM"
                          ;;
        product_name)     PRODUCT_NAME="$PARAM"
                          ;;
        upload_api_info)  UPLOAD_API_INFO=$(echo $PARAM |tr [a-z] [A-Z])
                          ;;
        cache_type)       CACHE_TYPE="$PARAM"
                          ;;
        *)   usage
             break;;
        esac
        shift
    done
    if [ "$SYSTEM_SIZE" = "standard" ]; then
       BUILD_TARGET=${BUILD_TARGET:-"test/xts/dcts:xts_dcts"}
       PRODUCT_NAME=${PRODUCT_NAME:-"Hi3516DV300"}
    else
       BUILD_TARGET=${BUILD_TARGET:-"dcts dcts_ivi dcts_intellitv dcts_wearable"}
       PRODUCT_NAME=${PRODUCT_NAME:-"arm64"}
    fi
}


do_make()
{
    cd $BASE_HOME
    HATS_ROOT="$BASE_HOME/test/xts/dcts"

    rm -rf "$BASE_HOME/test/xts/autogen_apiobjs"
    export XTS_SUITENAME=dcts
    if [ "$SYSTEM_SIZE" = "standard" ]; then
        MUSL_ARGS=""
        if [ "$PRODUCT_NAME" = "m40" ]; then
            if [ "$USE_MUSL" = "false" ]; then
                        MUSL_ARGS="--gn-args use_musl=false --gn-args use_custom_libcxx=true --gn-args use_custom_clang=true"			
		    fi
        fi
	CACHE_ARG=""
	if [ "$CACHE_TYPE" == "xcache" ];then
            CACHE_ARG="--ccache false --xcache true"
        fi
       ./build.sh --product-name $PRODUCT_NAME --gn-args build_xts=true --build-target $BUILD_TARGET --build-target "deploy_testtools" --gn-args is_standard_system=true $MUSL_ARGS --target-cpu $TARGET_ARCH --get-warning-list=false --stat-ccache=true --compute-overlap-rate=false --deps-guard=false --generate-ninja-trace=false  $CACHE_ARG --gn-args skip_generate_module_list_file=true
    else
       if [ "$BUILD_TARGET" = "dcts dcts_ivi dcts_intellitv dcts_wearable" ]; then
         ./build.sh --product-name $PRODUCT_NAME --gn-args build_xts=true --build-target "dcts" --build-target "dcts_ivi" --build-target "dcts_intellitv" --build-target "dcts_wearable" --build-target "deploy_testtools"
       else
         ./build.sh --product-name $PRODUCT_NAME --gn-args build_xts=true --build-target $BUILD_TARGET --build-target "deploy_testtools"
       fi
    fi
    ret=$?

    rm -rf "$BASE_HOME/test/xts/autogen_apiobjs"
    if [ "$ret" != 0 ]; then
        echo "build error"
        exit 1
    fi
}
parse_cmdline $@
do_make
exit 0
