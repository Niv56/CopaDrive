#include <gtest/gtest.h>

#include "FileManager.h"
#include "RLECompressor.h"
#include <filesystem>
#include <fstream>

TEST(SaveFiles, Test1){
    RLECompressor rle;
    FileManager fm(rle);

    
    fm.saveFile("hello.txt" , "hello world hdhfh hdhdhdhc hdjdjdjdj jdcjdjdjudjd");
    EXPECT_EQ(fm.loadFile("hello.txt"),"hello world hdhfh hdhdhdhc hdjdjdjdj jdcjdjdjudjd");


}

int main(int argc, char **argv){
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
