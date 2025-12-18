#include <gtest/gtest.h>
#include "PostCommand.h"
#include "SearchCommand.h"
#include "FileManager.h"
#include "RLECompressor.h"
#include <filesystem>
#include <fstream>
#include <cstdlib>
#include <sstream>
#include <iostream>

// Configure PATH_DIR so all search tests work inside a temp directory.
static void setPathDirEnv_Search(const std::string &dir)
{
#ifdef _WIN32
    _putenv_s("PATH_DIR", dir.c_str());
#else
    setenv("PATH_DIR", dir.c_str(), 1);
#endif
}

// Test fixture: creates a dedicated storage folder per test and cleans it up.
class SearchCommandTest : public ::testing::Test
{
protected:
    std::string testDir;

    void SetUp() override
    {
        testDir = (std::filesystem::temp_directory_path() / "copadrive_search_tests").string();
        std::filesystem::create_directories(testDir);
        setPathDirEnv_Search(testDir);
    }

    void TearDown() override
    {
        std::filesystem::remove_all(testDir);
    }
};

// Create several files and verify that 'search' returns only the matching filenames.
TEST_F(SearchCommandTest, ShouldFindMatchingFiles)
{
    RLECompressor compressor;
    FileManager fm(compressor);

    PostCommand PostCmd;
    SearchCommand searchCmd;

    // Prepare some files
    PostCmd.execute({"post", "file1.txt", "hello world"}, fm);
    PostCmd.execute({"post", "file2.txt", "another text"}, fm);
    PostCmd.execute({"post", "file3.txt", "worldwide hello"}, fm);

    // Search for "world"
    CommandResult result = searchCmd.execute({"search", "world"}, fm);

    EXPECT_EQ(StatusCode::OK, result.status);

    std::string output = result.body;

    // We expect file1 and file3 in the output (order not guaranteed)
    EXPECT_NE(output.find("file1.txt"), std::string::npos);
    EXPECT_NE(output.find("file3.txt"), std::string::npos);
    // file2 should NOT appear
    EXPECT_EQ(output.find("file2.txt"), std::string::npos);
}

// Search for a term that does not exist → expect 404 and empty body.
TEST_F(SearchCommandTest, ShouldPrintNothingIfNoMatch)
{
    RLECompressor compressor;
    FileManager fm(compressor);

    PostCommand PostCmdCmd;
    SearchCommand searchCmd;

    PostCmdCmd.execute({"Post", "file1.txt", "hello world"}, fm);

    // Search for something that doesn't exist
    CommandResult result = searchCmd.execute({"search", "xxx"}, fm);

    EXPECT_EQ(StatusCode::NOT_FOUND, result.status);
    EXPECT_TRUE(result.body.empty());
}
