#include "DeleteCommand.h"
#include "FileManager.h"
#include "CommandResult.h"
#include <iostream>
#include <filesystem>

// Deletes a single file from the storage directory.
CommandResult DeleteCommand::execute(const std::vector<std::string>& comand, FileManager& fm) {

    if (comand.size() != 2) {
        return CommandResult{StatusCode::BAD_REQUEST, ""};
    }

    const std::string& fileName = comand[1];

    if (fileName.empty()) {
        return CommandResult{StatusCode::BAD_REQUEST, ""};
    }

    const std::string& basePath = fm.getEnvironment();
    std::string fullPath = basePath + "/" + fileName;

    // Try to remove the file from disk.
    if (std::filesystem::remove(fullPath)) {
        return CommandResult{StatusCode::NO_CONTENT, ""};
    } else {
        return CommandResult{StatusCode::NOT_FOUND, ""};
    }
}
