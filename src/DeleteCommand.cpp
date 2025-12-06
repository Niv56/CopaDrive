#include "DeleteCommand.h"
#include "FileManager.h"
#include "CommandResult.h"
#include <iostream>
#include <filesystem>

CommandResult DeleteCommand::execute(const std::vector<std::string>& comand, FileManager& fm) {

   if (comand.size() != 2) {
        return CommandResult{StatusCode::BAD_REQUEST,""};
    }

    //Extract filename for clearer names 
    const std::string& fileName = comand[1];

    if (fileName.empty()) {
        return CommandResult{StatusCode::BAD_REQUEST,""};
    }

     
    const std::string& basePath = fm.getEnvironment();

     // Build the full file path, so the ofstream knows where to save the file. 
    std::string fullPath   = basePath + "/" + fileName;

    // Use std::filesystem::remove to delete the file
    if (std :: filesystem :: remove(fullPath)) {
       return CommandResult{StatusCode::NO_CONTENT,""};
    } else {
                return CommandResult{StatusCode::NOT_FOUND,""};
   }
}