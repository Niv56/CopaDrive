// GetCommand.cpp
#include "GetCommand.h"
#include "FileManager.h"

#include <filesystem>
#include <fstream>
#include <iostream>

void GetCommand::execute(const std::vector<std::string>& comand, FileManager& fm) {

    if (comand.size() < 2) {
        return;
    }

    const std::string& fileName = comand[1];

    const std::string& basePath      = fm.getEnvironment();
    const ICompressor& compressor    = fm.getCompressor();

    std::string fullPath = basePath + "/" + fileName;

    std::ifstream myFile(fullPath);
    if (!myFile.is_open()) {
        return;
    }

    std::string compressed;
    std::string nextLine;
    while (std::getline(myFile, nextLine)) {
        compressed += nextLine;
    }
    myFile.close();

    std::string content = compressor.decompress(compressed);

    std::cout << content << std::endl;
}
