# tests/CMakeLists.txt

add_executable(runTests
    sample_test.cpp
    RLECompressor_test.cpp
    FileManager_test.cpp
    ConsoleMenu_test.cpp
)

target_link_libraries(runTests
    PRIVATE
        gtest_main
        gtest
        CopaDriveLib
)

include(GoogleTest)
gtest_discover_tests(runTests)
