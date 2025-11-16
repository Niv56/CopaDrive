#include <gtest/gtest.h>

#include "ConsoleMenu.h"
#include <vector>
#include <string>
#include <iostream>

TEST(validation, test1){
    ConsoleMenu menu;
    std :: vector <std :: string> command = {"add" , "hello", "hello world" };
    EXPECT_TRUE(menu.validInput(command));
}

TEST(validation, test2){
    ConsoleMenu menu;
    std :: vector <std :: string> command = {"add" , "hello", "" };
    EXPECT_TRUE(menu.validInput(command));
}


TEST(validation, test3){
    ConsoleMenu menu;
    std :: vector <std :: string> command = {"get" , "hello"};
    EXPECT_TRUE(menu.validInput(command));
}

TEST(validation, test4){
    ConsoleMenu menu;
    std :: vector <std :: string> command = {"search" , "hello"};
    EXPECT_TRUE(menu.validInput(command));
}


TEST(validation, test5){
    ConsoleMenu menu;
    std :: vector <std :: string> command = {"SeaRch" , "hello"};
    EXPECT_TRUE(menu.validInput(command));
}


TEST(validation, test6){
    ConsoleMenu menu;
    std :: vector <std :: string> command = {"helow" , "hello"};
    EXPECT_FALSE(menu.validInput(command));
}


TEST(validation, test7){
    ConsoleMenu menu;
    std :: vector <std :: string> command = {"get" , "hello" ,"world"};
    EXPECT_FALSE(menu.validInput(command));
}


TEST(validation, test8){
    ConsoleMenu menu;
    std :: vector <std :: string> command = {"dadcf" , "hello","efniwefergegerg"};
    EXPECT_FALSE(menu.validInput(command));
}


TEST(validation, test9){
    ConsoleMenu menu;
    std :: vector <std :: string> command = {"search"};
    EXPECT_FALSE(menu.validInput(command));
}


TEST(split, test1){
    ConsoleMenu menu;
    std :: string command = "add hello.txt hello world";
    auto parts = menu.splitCommand(command);
    EXPECT_EQ(parts.size(), 3);
    EXPECT_EQ(parts[0], "add");
    EXPECT_EQ(parts[1], "hello.txt");
    EXPECT_EQ(parts[2], "hello world");
}


TEST(split, test2){
    ConsoleMenu menu;
    std :: string command = "search hello.txt hello world";
    auto parts = menu.splitCommand(command);
    EXPECT_EQ(parts.size(), 2);
    EXPECT_EQ(parts[0], "search");
    EXPECT_EQ(parts[1], "hello.txt hello world");
}


TEST(split, test3){
    ConsoleMenu menu;
    std :: string command = "get";
    auto parts = menu.splitCommand(command);
    EXPECT_EQ(parts.size(), 1);
    EXPECT_EQ(parts[0], "get");
}


TEST(split, test4){
    ConsoleMenu menu;
    std :: string command = "add hello.txt";
    auto parts = menu.splitCommand(command);
    EXPECT_EQ(parts.size(), 3);
    EXPECT_EQ(parts[0], "add");
    EXPECT_EQ(parts[1], "hello.txt");
    EXPECT_EQ(parts[2], "");
}


TEST(split, test5){
    ConsoleMenu menu;
    std :: string command = "search hello";
    auto parts = menu.splitCommand(command);
    EXPECT_EQ(parts.size(), 2);
    EXPECT_EQ(parts[0], "search");
    EXPECT_EQ(parts[1], "hello");
}