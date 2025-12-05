// tests/GetCommand_test.cpp
#include <gtest/gtest.h>

#include "PostCommand.h"
#include "GetCommand.h"
#include "FileManager.h"
#include "RLECompressor.h"

#include <filesystem>
#include <fstream>
#include <cstdlib>
#include <sstream>
#include <iostream>

// Helper: set PATH_DIR env var for tests
static void setPathDirEnv_Get(const std::string& dir) {
#ifdef _WIN32
    _putenv_s("PATH_DIR", dir.c_str());
#else
    setenv("PATH_DIR", dir.c_str(), 1);
#endif
}

class GetCommandTest : public ::testing::Test {
protected:
    std::string testDir;

    void SetUp() override {
        testDir = (std::filesystem::temp_directory_path()
                   / "copadrive_get_tests").string();
        std::filesystem::create_directories(testDir);
        setPathDirEnv_Get(testDir);
    }

    void TearDown() override {
        std::filesystem::remove_all(testDir);
    }
};

// should print file content to stdout
TEST_F(GetCommandTest, ShouldPrintFileContent) {
    RLECompressor compressor;
    FileManager fm(compressor);

    PostCommand PostCmd;
    GetCommand getCmd;

    // Create a file via PostCommand
    PostCmd.execute({"Post", "note.txt", "this is a note"}, fm);

    // Capture std::cout
    std::stringstream buffer;
    std::streambuf* oldBuf = std::cout.rdbuf(buffer.rdbuf());

    // Run get command
    getCmd.execute({"get", "note.txt"}, fm);

    std::cout.rdbuf(oldBuf);

    std::string output = buffer.str();
    // GetCommand prints content + std::endl
    EXPECT_NE(output.find("this is a note"), std::string::npos);
}

// should do nothing if file does not exist
TEST_F(GetCommandTest, ShouldDoNothingIfFileMissing) {
    RLECompressor compressor;
    FileManager fm(compressor);

    GetCommand getCmd;

    // Capture std::cout
    std::stringstream buffer;
    std::streambuf* oldBuf = std::cout.rdbuf(buffer.rdbuf());

    // Try to get non-existing file
    getCmd.execute({"get", "missing.txt"}, fm);

    std::cout.rdbuf(oldBuf);

    std::string output = buffer.str();
    EXPECT_TRUE(output.empty());
}
