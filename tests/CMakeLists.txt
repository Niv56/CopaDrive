# tests/CMakeLists.txt
file(GLOB TEST_FILES "*.cpp")
add_executable(runTests ${TEST_FILES})
target_link_libraries(runTests PRIVATE CopaDriveLib GTest::gtest_main pthread)

include(GoogleTest)
gtest_discover_tests(runTests)
