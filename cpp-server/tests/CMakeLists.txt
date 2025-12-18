# tests/CMakeLists.txt

# Build the test executable
add_executable(runTests
    sample_test.cpp
    RLECompressor_test.cpp

    # New tests for command-based architecture
    # PostCommand_test.cpp
    # SearchCommand_test.cpp
    # GetCommand_test.cpp
    # DeleteCommand_test.cpp
    # CommandParser_test.cpp

    # New test for server validation
    ServerInitTests.cpp
    StressTest.cpp
)

# Link GoogleTest + main library
target_link_libraries(runTests
    PRIVATE
        gtest_main
        gtest
        CopaDriveLib
)

# Enable automatic test discovery
include(GoogleTest)
gtest_discover_tests(runTests)
