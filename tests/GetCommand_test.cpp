#include <gtest/gtest.h>
#include "PostCommand.h"
#include "GetCommand.h"
#include "FileManager.h"
#include "RLECompressor.h"
#include "CommandResult.h"
#include <filesystem>
#include <fstream>
#include <cstdlib>
#include <sstream>
#include <iostream>

// Tests for GetCommand: setup temp PATH_DIR, create files, and verify status + body.


// Helper: configure PATH_DIR for all GetCommand tests
static void setPathDirEnv_Get(const std::string& dir) {
#ifdef _WIN32
    _putenv_s("PATH_DIR", dir.c_str());
#else
    setenv("PATH_DIR", dir.c_str(), 1);
#endif
}

// Test fixture: creates a dedicated temp directory for each test and cleans it up.
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

// Verifies that an existing file is read correctly and returned with 200 OK.
TEST_F(GetCommandTest, ShouldPrintFileContent) {
    RLECompressor compressor;
    FileManager fm(compressor);

    PostCommand PostCmd;
    GetCommand getCmd;

    std::string content = "this is a note"

    // Create a file via PostCommand
     PostCmd.execute({"Post", "note.txt", content}, fm);

    // Capture std::cout
    std::stringstream buffer;
    std::streambuf* oldBuf = std::cout.rdbuf(buffer.rdbuf());

    // Run get command
    CommandResult result = getCmd.execute({"get", "note.txt"}, fm);

    
    EXPECT_EQ(result.status, StatusCode::OK);
    
    EXPECT_EQ(result.body, testContent);
    

}

// Verifies that requesting a missing file returns 404 Not Found and empty body.
TEST_F(GetCommandTest, ShouldDoNothingIfFileMissing) {
    RLECompressor compressor;
    FileManager fm(compressor);

    GetCommand getCmd;

    // Capture std::cout
    std::streambuf* oldBuf = std::cout.rdbuf(buffer.rdbuf());

    // Try to get non-existing file
    CommandResult result = getCmd.execute({"get", "missing.txt"}, fm);

    EXPECT_EQ(result.status, StatusCode::NOT_FOUND);
    
    EXPECT_TRUE(result.body.empty());
   }
