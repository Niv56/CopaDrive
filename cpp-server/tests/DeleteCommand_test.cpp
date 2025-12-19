#include <gtest/gtest.h>
#include "DeleteCommand.h"
#include "PostCommand.h"
#include "FileManager.h"
#include "RLECompressor.h"
#include "CommandResult.h"
#include <iostream>
#include <filesystem>
#include <fstream>
#include <cstdlib>

// Configure PATH_DIR for tests to point to a temporary directory.
static void setPathDirEnv(const std::string& dir) {
#ifdef _WIN32
    _putenv_s("PATH_DIR", dir.c_str());
#else
    setenv("PATH_DIR", dir.c_str(), 1);
#endif
}

// Test fixture for DeleteCommand tests – sets up a clean temp directory.
class DeleteCommandTest : public ::testing::Test {
protected:
    std::string testDir;

    void SetUp() override {
        testDir = (std::filesystem::temp_directory_path()
                   / "copadrive_Delete_tests").string();
        std::filesystem::create_directories(testDir);
        setPathDirEnv(testDir);
    }

    void TearDown() override {
        std::filesystem::remove_all(testDir);
    }
};

// Delete existing file → expect 204 No Content and file removed.
TEST_F(DeleteCommandTest, ShouldDeleteFileSuccessfully) {
    RLECompressor compressor;
    FileManager fm(compressor);
    DeleteCommand cmd;
    std::vector<std::string> comand = {"delete", "hello.txt"};

    std::string fullPath = fm.getEnvironment() + "/hello.txt";

    std::ofstream file(fullPath);
    file << "any content";
    file.close();

    EXPECT_TRUE(std::filesystem::exists(fullPath));

    CommandResult result = cmd.execute(comand, fm);

    EXPECT_EQ(result.status, StatusCode::NO_CONTENT);
    EXPECT_FALSE(std::filesystem::exists(fullPath));
}

// Delete non-existing file → expect 404 Not Found and no crash.
TEST_F(DeleteCommandTest, ShouldNotCrashWhenFileDoesNotExist) {
    RLECompressor compressor;
    FileManager fm(compressor);
    DeleteCommand cmd;
    std::vector<std::string> comand = {"delete", "hello.txt"};

    std::string fullPath = fm.getEnvironment() + "/hello.txt";

    EXPECT_FALSE(std::filesystem::exists(fullPath));

    CommandResult result = cmd.execute(comand, fm);

    EXPECT_EQ(result.status, StatusCode::NOT_FOUND);
    EXPECT_FALSE(std::filesystem::exists(fullPath));
}
