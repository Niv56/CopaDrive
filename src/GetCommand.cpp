#include "GetCommand.h"
#include "FileManager.h"
#include "CommandResult.h"
#include <filesystem>
#include <fstream>
#include <iostream>

// Reads a compressed file, decompresses it, and returns its content.
CommandResult GetCommand::execute(const std::vector<std::string>& comand, FileManager& fm) {

    if (comand.size() != 2) {
        return CommandResult(StatusCode::BAD_REQUEST, "");
    }

    const std::string& fileName = comand[1];

    const std::string&   basePath   = fm.getEnvironment();
    const ICompressor&   compressor = fm.getCompressor();
    std::string          fullPath   = basePath + "/" + fileName;

    std::ifstream myFile(fullPath);
    if (!myFile.is_open()) {
        return CommandResult(StatusCode::NOT_FOUND, "");
    }

    std::string compressed;
    std::string nextLine;
    while (std::getline(myFile, nextLine)) {
        compressed += nextLine;
    }
    myFile.close();

    std::string content = compressor.decompress(compressed);

    return CommandResult(StatusCode::OK, content);
}