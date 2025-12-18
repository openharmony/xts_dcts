# the minimum version of CMake.
cmake_minimum_required(VERSION 3.5.0)
project(fileioclient_test)

set(NATIVERENDER_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR})

include_directories(${NATIVERENDER_ROOT_PATH}
                    ${NATIVERENDER_ROOT_PATH}/include)

add_library(devicemanager SHARED devicemanager.cpp)
target_link_libraries(devicemanager PUBLIC libace_napi.z.so libace_ndk.z.so libhilog_ndk.z.so libutils.z.so libdevicemanagersdk.z.so libdistributed_file_daemon_kit_inner.z.so libipc_single.z.so)