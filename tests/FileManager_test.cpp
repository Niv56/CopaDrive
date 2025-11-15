#include <gtest/gtest.h>

#include "FileManager.h"
#include "RLECompressor.h"
#include <filesystem>
#include <fstream>
#include <vector>
#include <string>
#include <algorithm>
#include <iostream>

 

TEST(SaveAndLoadFiles, Test1){
    RLECompressor rle;
    FileManager fm(rle);
    fm.saveFile("hello.txt1" , "hello world one");
    EXPECT_EQ(fm.loadFile("hello.txt1"),"hello world one");
}

TEST(loadFiles, Test2){
    RLECompressor rle;
    FileManager fm(rle);
    fm.saveFile("hello.txt2" , "");
    EXPECT_EQ(fm.loadFile("hello.txt2"),"");
}
  
TEST(loadFiles, Test3){
    RLECompressor rle;
    FileManager fm(rle);
    fm.saveFile("hello.txt3" , " ");
    EXPECT_EQ(fm.loadFile("hello.txt3")," ");
}

TEST(loadFiles, Test4){
     RLECompressor rle;
    FileManager fm(rle);
    fm.saveFile("hello.txt4" , "aaaabbbbbcccddddeee");
    fm.saveFile("hello.txt5" , "aaaabbbbbcccddddeee");
    fm.saveFile("hello.txt6" , "aaaabbbbbcccddddeee");
    EXPECT_EQ(fm.search("ab").size(), 3 );
}

TEST(loadFiles, Test5) {
    RLECompressor rle;
    FileManager fm(rle);
    std::vector<std::string> expected = {
        "hello.txt4",
        "hello.txt5",
        "hello.txt6"
    };
    auto result = fm.search("ab");
    EXPECT_EQ(result.size(), expected.size());
    for (const auto& name : expected) {
        EXPECT_NE(std::find(result.begin(), result.end(), name),
                  result.end());  
    }
}

 TEST(loadFiles, Test6){
    RLECompressor rle;
    FileManager fm(rle);
    fm.saveFile("hello.txt6" , "new change");
        EXPECT_EQ(fm.loadFile("hello.txt6"), "new change" );
 }

 TEST(loadFiles, Test7){
    RLECompressor rle;
    FileManager fm(rle);
    fm.saveFile("hello.txt7" , "fksbfvk%^%^$geg&%&%bdfgbdfhg");
        EXPECT_EQ(fm.loadFile("hello.txt7"), "fksbfvk%^%^$geg&%&%bdfgbdfhg" );
 }

 TEST(loadFiles, Test8){
    RLECompressor rle;
    FileManager fm(rle);
    EXPECT_EQ(fm.loadFile("file"), "" );
 }

TEST(loadFiles, Test9) {
    RLECompressor rle;
    FileManager fm(rle);  
    EXPECT_TRUE(fm.search("z").empty());  
}

TEST(loadFiles, Test10) {
    RLECompressor rle;
    FileManager fm(rle); 
    fm.saveFile("temp.txt", "AAAA");
    fm.saveFile("temp.txt", "BBBB");
    EXPECT_EQ(fm.loadFile("temp.txt"), "BBBB"); 
}


int main(int argc, char **argv){
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
