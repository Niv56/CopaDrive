// DeleteCommand.cpp
#include "DeleteCommand.h"
#include "FileManager.h"

#include <iostream>
#include <filesystem>

void DeleteCommand::execute(const std::vector<std::string>& comand, FileManager& fm) {

   if (comand.size() < 2) {
        return;
    }

    //Extract filename for clearer names 
    const std::string& fileName = comand[1];

    if (fileName.empty()) {
        return;
    }

     
    const std::string& basePath = fm.getEnvironment();

     // Build the full file path, so the ofstream knows where to save the file. 
    std::string fullPath   = basePath + "/" + fileName;

    // Use std::filesystem::remove to delete the file
    if (std :: filesystem :: remove(fullPath)) {
       // std::cout << "File successfully deleted: " << fileName << std::endl; need to implemt the code status
    } else {
       // std::cout << "Error or file not found: " << fileName << std::endl; need to implemt the code status
    }
}