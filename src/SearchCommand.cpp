// SearchCommand.cpp
#include "SearchCommand.h"
#include "FileManager.h"

#include <filesystem>
#include <fstream>
#include <iostream>

void SearchCommand::execute(const std::vector<std::string>& comand,
                            FileManager& fm) {
    if (comand.size() < 2) {
        return;
    }

    const std::string& textToSearch = comand[1];

    const std::string& basePath      = fm.getEnvironment();
    const ICompressor& compressor    = fm.getCompressor();

    std::vector<std::string> filesName;

    try {
        for (const auto& entry :
             std::filesystem::directory_iterator(basePath)) {

            if (!entry.is_regular_file()) {
                continue;
            }

            std::string fileName = entry.path().filename().string();
            std::string fullPath = basePath + "/" + fileName;

            std::ifstream myFile(fullPath);
            if (!myFile.is_open()) {
                continue;
            }

            std::string compressed;
            std::string nextLine;
            while (std::getline(myFile, nextLine)) {
                compressed += nextLine;
            }
            myFile.close();

            std::string contentDecompressed =
                compressor.decompress(compressed);

            if (contentDecompressed.find(textToSearch)
                != std::string::npos) {
                filesName.push_back(fileName);
            }
        }
    } catch (const std::filesystem::filesystem_error& e) {
    }

    for (const auto& name : filesName) {
        std::cout << name << std::endl;
    }
}
