#include "CommandParser.h"
#include <sstream>
#include <algorithm> // for tolower
#include <iostream>

std::vector<std::string> CommandParser::parse(const std::string& input) {
    std::vector<std::string> parts;
    if (input.empty()) return parts;

    std::istringstream iss(input);
    
    // Extract command name
    std::string commandName;
    if (!(iss >> commandName)) {
        return parts; // Empty line or whitespace only
    }
    
    // Convert to lowercase (to support ADD, Add, add)
    for (auto& c : commandName) c = std::tolower(c);
    parts.push_back(commandName);

    // Extract arguments based on command type
    std::string arg1;
    
    // Handle Search/Get (one argument that may contain spaces)
    if (commandName == "search" || commandName == "get") {
        std::string restOfLine;
        std::getline(iss, restOfLine);
        
        // Remove leading whitespace if exists
        if (!restOfLine.empty() && restOfLine[0] == ' ') {
            restOfLine.erase(0, 1);
        }
        
        // If anything remains, add it as the second argument
        if (!restOfLine.empty()) {
            parts.push_back(restOfLine);
        }
    } 

    // Handle Add/Post (filename + content)
    else if (commandName == "add" || commandName == "post") {
        if (iss >> arg1) {
            parts.push_back(arg1); // Filename
            
            // The rest is the content
            std::string restOfLine;
            std::getline(iss, restOfLine);
            if (!restOfLine.empty() && restOfLine[0] == ' ') {
                restOfLine.erase(0, 1);
            }
            // Add content even if empty
            parts.push_back(restOfLine); 
        }
    }

    else {
        std::string arg;
        while(iss >> arg) {
            parts.push_back(arg);
        }
    }
    
    return parts;
}