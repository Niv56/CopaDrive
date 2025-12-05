#include <gtest/gtest.h>
#include "CommandParser.h"
#include <vector>
#include <string>

TEST(CommandParserSplit, PostWithContent) {
    std::string input = "post hello.txt hello world";
    auto parts = CommandParser::parse(input);
    ASSERT_EQ(parts.size(), 3);
    EXPECT_EQ(parts[0], "post");
    EXPECT_EQ(parts[1], "hello.txt");
    EXPECT_EQ(parts[2], "hello world");
}

TEST(CommandParserSplit, PostEmptyContent) {
    std::string input = "post hello.txt";
    auto parts = CommandParser::parse(input);
    ASSERT_EQ(parts.size(), 3);
    EXPECT_EQ(parts[0], "post");
    EXPECT_EQ(parts[1], "hello.txt");
    EXPECT_EQ(parts[2], "");
}

TEST(CommandParserSplit, SearchWithContent) {
    std::string input = "search hello world";
    auto parts = CommandParser::parse(input);
    ASSERT_EQ(parts.size(), 2);
    EXPECT_EQ(parts[0], "search");
    EXPECT_EQ(parts[1], "hello world");
}

TEST(CommandParserValidation, SearchWithoutContentIsInvalid) {
    std::string input = "search";
    auto parts = CommandParser::parse(input);
    EXPECT_TRUE(parts.empty());
}

TEST(CommandParserSplit, GetSingleFilename) {
    std::string input = "get file1.txt";
    auto parts = CommandParser::parse(input);
    ASSERT_EQ(parts.size(), 2);
    EXPECT_EQ(parts[0], "get");
    EXPECT_EQ(parts[1], "file1.txt");
}

TEST(CommandParserValidation, GetWithTooManyArgsIsInvalid) {
    std::string input = "get a b";
    auto parts = CommandParser::parse(input);
    EXPECT_TRUE(parts.empty());
}

TEST(CommandParserCase, MixedCaseCommandName) {
    std::string input = "PoSt file hello";
    auto parts = CommandParser::parse(input);
    ASSERT_EQ(parts.size(), 3);
    EXPECT_EQ(parts[0], "post");     
    EXPECT_EQ(parts[1], "file");
    EXPECT_EQ(parts[2], "hello");
}

TEST(CommandParserValidation, UnknownCommandIsInvalid) {
    std::string input = "hello world";
    auto parts = CommandParser::parse(input);
    EXPECT_TRUE(parts.empty());
}

TEST(CommandParserCRLF, RemovesCRLF) {
    std::string input = "get file.txt\r\n";
    auto parts = CommandParser::parse(input);
    ASSERT_EQ(parts.size(), 2);
    EXPECT_EQ(parts[0], "get");
    EXPECT_EQ(parts[1], "file.txt");
}
