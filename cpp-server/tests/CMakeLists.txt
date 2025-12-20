# tests/CMakeLists.txt

add_executable(runTests
    sample_test.cpp
    RLECompressor_test.cpp

    # Command tests are currently disabled (outdated API vs FileManager)
    # PostCommand_test.cpp
    # SearchCommand_test.cpp
    # GetCommand_test.cpp
    # DeleteCommand_test.cpp
    # CommandParser_test.cpp

    ServerInitTests.cpp
    StressTest.cpp

    ThreadPoolTest.cpp
)

target_link_libraries(runTests
    PRIVATE
        gtest_main
        gtest
        CopaDriveLib
)

include(GoogleTest)
gtest_discover_tests(runTests)
