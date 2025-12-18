#include "DeleteCommand.h"
#include "FileManager.h"
#include "CommandResult.h"
#include <iostream>
#include <filesystem>

// Validates input and calls the FileManager to remove the file.
CommandResult DeleteCommand::execute(const std::vector<std::string>& comand, FileManager& fm) {
    if (comand.size() != 2) {
        return CommandResult(StatusCode::BAD_REQUEST, "");
    }

    const std::string& fileName = comand[1];

    // Perform deletion via the FileManager (Mutex protected)
    if (fm.remove(fileName)) {
        return CommandResult(StatusCode::NO_CONTENT, "");
    } else {
        return CommandResult(StatusCode::NOT_FOUND, "");
    }
}
