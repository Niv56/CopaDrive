// AddCommand.cpp
#include "AddCommand.h"
#include "FileManager.h"

#include <filesystem>
#include <fstream>

void AddCommand::execute(const std::vector<std::string>& comand,
                         FileManager& fm) {
    if (comand.size() < 3) {
        return;
    }

    const std::string& fileName = comand[1];
    const std::string& content  = comand[2];

    if (fileName.empty()) {
        return;
    }

    const std::string& basePath      = fm.getEnvironment();
    const ICompressor& compressor    = fm.getCompressor();

    std::string compressed = compressor.compress(content);
    std::string fullPath   = basePath + "/" + fileName;

    std::filesystem::create_directories(basePath);

    std::ofstream myFile(fullPath);
    if (!myFile.is_open()) {
        return;
    }

    myFile << compressed;
    myFile.close();
}
