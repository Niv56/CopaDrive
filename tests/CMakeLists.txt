# tests/CMakeLists.txt

# Build the test executable
add_executable(runTests
    sample_test.cpp
    RLECompressor_test.cpp
    ConsoleMenu_test.cpp

    # New tests for command-based architecture
    AddCommand_test.cpp
    SearchCommand_test.cpp
    GetCommand_test.cpp
    DeleteCommand_test.cpp

    # REMOVE THIS — old FileManager tests no longer valid:
    # FileManager_test.cpp

    # New test for server validation
    ServerInitTests.cpp
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
