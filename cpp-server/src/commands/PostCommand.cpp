#include "PostCommand.h"
#include "FileManager.h"
#include "CommandResult.h"
#include "ICompressor.h"
#include <sstream>

CommandResult PostCommand::execute(const std::vector<std::string>& comand, FileManager& fm) {
    // Must have: POST <filename> <content...>
    if (comand.size() < 3) {
        return CommandResult(StatusCode::BAD_REQUEST, "");
    }

    const std::string& fileName = comand[1];
    if (fileName.empty()) {
        return CommandResult(StatusCode::BAD_REQUEST, "");
    }

    // Rebuild content (supports spaces)
    std::ostringstream oss;
    for (size_t i = 2; i < comand.size(); ++i) {
        if (i > 2) oss << ' ';
        oss << comand[i];
    }
    const std::string content = oss.str();

    // Compress content
    const ICompressor& compressor = fm.getCompressor();
    const std::string compressed  = compressor.compress(content);

    // Atomic: check + create under FileManager mutex
    FileManager::CreateStatus st = fm.createIfAbsent(fileName, compressed);

    if (st == FileManager::CreateStatus::Created) {
        return CommandResult(StatusCode::CREATED, "");
    }

    // Already exists OR IO error -> 400 (as your tests/flow expect)
    return CommandResult(StatusCode::BAD_REQUEST, "");
}
