// tests/PostCommand_test.cpp
#include <gtest/gtest.h>

#include "PostCommand.h"
#include "FileManager.h"
#include "RLECompressor.h"

#include <filesystem>
#include <fstream>
#include <cstdlib>

// Helper: set PATH_DIR env var for tests
static void setPathDirEnv(const std::string& dir) {
#ifdef _WIN32
    _putenv_s("PATH_DIR", dir.c_str());
#else
    setenv("PATH_DIR", dir.c_str(), 1);
#endif
}

// Test fixture for PostCommand-related tests
class PostCommandTest : public ::testing::Test {
protected:
    std::string testDir;

    void SetUp() override {
        // Create a temporary directory for the test files
        testDir = (std::filesystem::temp_directory_path()
                   / "copadrive_post_tests").string();
        std::filesystem::create_directories(testDir);

        // Make FileManager use this temporary directory
        setPathDirEnv(testDir);
    }

    void TearDown() override {
        // Clean up all files created during the test
        std::filesystem::remove_all(testDir);
    }
};

// should post a file successfully
TEST_F(PostCommandTest, ShouldPostFileSuccessfully) {
    RLECompressor compressor;
    FileManager fm(compressor);

    PostCommand cmd;

    // Command format: ["post", fileName, content]
    std::vector<std::string> comand = {"post", "hello.txt", "hello world"};

    cmd.execute(comand, fm);

    // Build full path to the created file
    std::string fullPath = fm.getEnvironment() + "/hello.txt";

    // Check that file exists
    EXPECT_TRUE(std::filesystem::exists(fullPath));

    // Optional: verify content by reading + decompressing
    std::ifstream file(fullPath);
    ASSERT_TRUE(file.is_open());

    std::string compressed;
    std::string line;
    while (std::getline(file, line)) {
        compressed += line;
    }
    file.close();

    std::string decompressed = compressor.decompress(compressed);
    EXPECT_EQ(decompressed, "hello world");
}

// should not post an unnamed file
TEST_F(PostCommandTest, ShouldNotPostUnnamedFile) {
    RLECompressor compressor;
    FileManager fm(compressor);

    PostCommand cmd;

    // Empty file name
    std::vector<std::string> comand = {"post", "", "some content"};
    cmd.execute(comand, fm);

    // Check that no files were created in the test directory
    std::size_t fileCount = 0;
    for (const auto& entry : std::filesystem::directory_iterator(testDir)) {
        if (entry.is_regular_file()) {
            ++fileCount;
        }
    }
    EXPECT_EQ(fileCount, 0);
}
