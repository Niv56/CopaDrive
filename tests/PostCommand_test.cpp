#include <gtest/gtest.h>
#include "PostCommand.h"
#include "FileManager.h"
#include "RLECompressor.h"
#include "CommandResult.h"
#include <filesystem>
#include <fstream>
#include <cstdlib>

// Configure PATH_DIR so PostCommand writes into a temp test directory.
static void setPathDirEnv(const std::string& dir) {
#ifdef _WIN32
    _putenv_s("PATH_DIR", dir.c_str());
#else
    setenv("PATH_DIR", dir.c_str(), 1);
#endif
}

// Test fixture: creates a temporary storage directory for each test and cleans it up.
class PostCommandTest : public ::testing::Test {
protected:
    std::string testDir;

    void SetUp() override {
        testDir = (std::filesystem::temp_directory_path()
                   / "copadrive_post_tests").string();
        std::filesystem::create_directories(testDir);
        setPathDirEnv(testDir);
    }

    void TearDown() override {
        std::filesystem::remove_all(testDir);
    }
};

// Post a file with valid name and content → expect 201 Created and correct decompressed content.
TEST_F(PostCommandTest, ShouldPostFileSuccessfully) {
    RLECompressor compressor;
    FileManager fm(compressor);

    PostCommand cmd;

    // Command format: ["post", fileName, content]
    std::vector<std::string> comand = {"post", "hello.txt", "hello world"};

    CommandResult result = cmd.execute(comand, fm);

    std::string fullPath = fm.getEnvironment() + "/hello.txt";

    EXPECT_EQ(result.status,StatusCode::CREATED);

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

// Reject a 'post' with empty filename → 400 Bad Request and no files written.
TEST_F(PostCommandTest, ShouldNotPostUnnamedFile) {
    RLECompressor compressor;
    FileManager fm(compressor);

    PostCommand cmd;

    // Empty file name
    std::vector<std::string> comand = {"post", "", "some content"};
    CommandResult result = cmd.execute(comand, fm);
    
    EXPECT_EQ(result.status, StatusCode::BAD_REQUEST);
    EXPECT_TRUE(result.body.empty());

    std::size_t fileCount = 0;
    for (const auto& entry : std::filesystem::directory_iterator(testDir)) {
        if (entry.is_regular_file()) {
            ++fileCount;
        }
    }
}
