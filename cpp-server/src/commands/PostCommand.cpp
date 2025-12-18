#include "PostCommand.h"
#include "FileManager.h"
#include "CommandResult.h"
#include "ICompressor.h"
#include <iostream>
#include <filesystem>
#include <fstream>

// Stores a new compressed file in the storage directory.
CommandResult PostCommand::execute(const std::vector<std::string>& comand, FileManager& fm) {
    if (comand.size() != 3) return CommandResult(StatusCode::BAD_REQUEST, "");

    const std::string& fileName = comand[1];
    const std::string& content = comand[2];

    // Check if file already exists to prevent overwrite if required by logic
    if (fm.exists(fileName)) return CommandResult(StatusCode::BAD_REQUEST, "");

    // Logic: Compress content using the reference provided by FileManage
    const ICompressor& compressor = fm.getCompressor();
    std::string compressed = compressor.compress(content);

    // Write the compressed data via the FileManager's mutex
    if (fm.write(fileName, compressed)) {
        return CommandResult(StatusCode::CREATED, "");
    }
    return CommandResult(StatusCode::INTERNAL_SERVER_ERROR, "");
}