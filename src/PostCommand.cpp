// AddCommand.cpp
#include "PostCommand.h"
#include "FileManager.h"
#include "CommandResult.h"

#include <iostream>
#include <filesystem>
#include <fstream>

CommandResult PostCommand::execute(const std::vector<std::string>& comand, FileManager& fm) {
        
    if (comand.size() != 3) {
        return CommandResult(StatusCode::BAD_REQUEST,"");
    }

    //Extract filename and content for clearer names 
    const std::string& fileName = comand[1];
    const std::string& content  = comand[2];

    if (fileName.empty()) {
        return CommandResult(StatusCode::BAD_REQUEST,"");
    }

    const std::string& basePath = fm.getEnvironment();
    const ICompressor& compressor = fm.getCompressor();

    // Compress content before saving to reduce disk usage
    std::string compressed = compressor.compress(content);
    
    // Build the full file path, so the ofstream knows where to save the file. 
    std::string fullPath   = basePath + "/" + fileName;

    // Ensure that the directory in basepath are exsist.
    std::filesystem::create_directories(basePath);

    // Create/overwrite the target file in the full path
    std::ofstream myFile(fullPath);
    // In case the file opning failed
    if (!myFile.is_open()) {
        return CommandResult(StatusCode::INTERNAL_SERVER_ERROR,"");
    }
    // Write the content into the file
    myFile << compressed;
    // Close the file
    myFile.close();
    return CommandResult(StatusCode::CREATED,"");
}
