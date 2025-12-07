#include "PostCommand.h"
#include "FileManager.h"
#include "CommandResult.h"
#include <iostream>
#include <filesystem>
#include <fstream>

// Stores a new compressed file in the storage directory.
CommandResult PostCommand::execute(const std::vector<std::string>& comand, FileManager& fm) {
        
    if (comand.size() != 3) {
        return CommandResult(StatusCode::BAD_REQUEST, "");
    }

    const std::string& fileName = comand[1];
    const std::string& content  = comand[2];

    if (fileName.empty()) {
        return CommandResult(StatusCode::BAD_REQUEST, "");
    }

    const std::string& basePath      = fm.getEnvironment();
    const ICompressor& compressor    = fm.getCompressor();
    std::string        compressed    = compressor.compress(content);
    std::string        fullPath      = basePath + "/" + fileName;

    std::filesystem::create_directories(basePath);

    std::ofstream myFile(fullPath);
    if (!myFile.is_open()) {
        return CommandResult(StatusCode::INTERNAL_SERVER_ERROR, "");
    }

    myFile << compressed;
    myFile.close();

    return CommandResult(StatusCode::CREATED, "");
}
