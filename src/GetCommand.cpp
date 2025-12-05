// GetCommand.cpp
#include "GetCommand.h"
#include "FileManager.h"
#include "CommandResult.h"

#include <filesystem>
#include <fstream>
#include <iostream>

CommandResult GetCommand::execute(const std::vector<std::string>& comand, FileManager& fm) {

    if (comand.size() != 2) {
        return CommandResult(StatusCode::BAD_REQUEST,"");
    }

    // Extract filename for clearer name. 
    const std::string& fileName = comand[1];

    const std::string& basePath = fm.getEnvironment();
    const ICompressor& compressor = fm.getCompressor();

    // Build the full fill path, so the ifstrem know from where load the files. 
    std::string fullPath = basePath + "/" + fileName;

    // Open file for reading
    std::ifstream myFile(fullPath);
    // In case the fail opening failed. 
    if (!myFile.is_open()) {
        return CommandResult(StatusCode::NOT_FOUND,"");
    }

    std::string compressed;
    std::string nextLine;
    // Read the content from the file line by line.
    while (std::getline(myFile, nextLine)) {
        compressed += nextLine;
    }
    myFile.close();

    // Decompressed the content from the file by given compressor. 
    std::string content = compressor.decompress(compressed);

    // Print the content to the screen.
    //std::cout << content << std::endl;
    return CommandResult(StatusCode::OK, content);
}
