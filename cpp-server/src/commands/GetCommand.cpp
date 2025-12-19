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

    // Safely read raw content via FileManager's mutex
    std::optional<std::string> compressed = fm.read(fileName);
    if (!compressed.has_value()) {
        return CommandResult(StatusCode::NOT_FOUND, "");
    }

    // Decompression logic handled within the command using the FileManager's compressor
    const ICompressor& compressor = fm.getCompressor();
    std::string content = compressor.decompress(compressed.value());

    return CommandResult(StatusCode::OK, content);
}