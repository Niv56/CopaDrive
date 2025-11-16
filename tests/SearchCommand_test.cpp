// tests/SearchCommand_test.cpp
#include <gtest/gtest.h>

#include "AddCommand.h"
#include "SearchCommand.h"
#include "FileManager.h"
#include "RLECompressor.h"

#include <filesystem>
#include <fstream>
#include <cstdlib>
#include <sstream>
#include <iostream>

// Helper: set PATH_DIR env var for tests
static void setPathDirEnv_Search(const std::string& dir) {
#ifdef _WIN32
    _putenv_s("PATH_DIR", dir.c_str());
#else
    setenv("PATH_DIR", dir.c_str(), 1);
#endif
}

class SearchCommandTest : public ::testing::Test {
protected:
    std::string testDir;

    void SetUp() override {
        testDir = (std::filesystem::temp_directory_path()
                   / "copadrive_search_tests").string();
        std::filesystem::create_directories(testDir);
        setPathDirEnv_Search(testDir);
    }

    void TearDown() override {
        std::filesystem::remove_all(testDir);
    }
};

// should find files that contain the searched text
TEST_F(SearchCommandTest, ShouldFindMatchingFiles) {
    RLECompressor compressor;
    FileManager fm(compressor);

    AddCommand addCmd;
    SearchCommand searchCmd;

    // Prepare some files
    addCmd.execute({"add", "file1.txt", "hello world"}, fm);
    addCmd.execute({"add", "file2.txt", "another text"}, fm);
    addCmd.execute({"add", "file3.txt", "worldwide hello"}, fm);

    // Capture std::cout
    std::stringstream buffer;
    std::streambuf* oldBuf = std::cout.rdbuf(buffer.rdbuf());

    // Search for "world"
    searchCmd.execute({"search", "world"}, fm);

    // Restore std::cout
    std::cout.rdbuf(oldBuf);

    std::string output = buffer.str();

    // We expect file1 and file3 in the output (order not guaranteed)
    EXPECT_NE(output.find("file1.txt"), std::string::npos);
    EXPECT_NE(output.find("file3.txt"), std::string::npos);
    // file2 should NOT appear
    EXPECT_EQ(output.find("file2.txt"), std::string::npos);
}

// should print nothing when no match found
TEST_F(SearchCommandTest, ShouldPrintNothingIfNoMatch) {
    RLECompressor compressor;
    FileManager fm(compressor);

    AddCommand addCmd;
    SearchCommand searchCmd;

    addCmd.execute({"add", "file1.txt", "hello world"}, fm);

    // Capture std::cout
    std::stringstream buffer;
    std::streambuf* oldBuf = std::cout.rdbuf(buffer.rdbuf());

    // Search for something that doesn't exist
    searchCmd.execute({"search", "xxx"}, fm);

    std::cout.rdbuf(oldBuf);

    std::string output = buffer.str();
    EXPECT_TRUE(output.empty());
}
