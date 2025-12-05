#include "CommandParser.h"
#include <sstream>
#include <algorithm> // for tolower
#include <iostream>

std::vector<std::string> CommandParser::parse(const std::string& input) {
    std::vector<std::string> parts;

    // Empty Input
    if(input.empty()) return {};

    std::string command = input;

    // Remove all '\r' and '\n'
    command.erase(std::remove(command.begin(), command.end(), '\r'), command.end());
    command.erase(std::remove(command.begin(), command.end(), '\n'), command.end());

    std::istringstream iss(command);

    //Extra command name
    std::string commandName;
    if(!(iss >> commandName)){
        return {}; // Only whitespace in command
    }

    // Convert to lowercase
    for (char& c : commandName) c = std::tolower(c);
    parts.push_back(commandName);

    // Handle search method ("search" + content)
    if(commandName == "search"){
        std::string rest;
        std::getline(iss, rest);

        // Trim leading space if exists
        if(!rest.empty() && rest[0] == ' '){
            rest.erase(0,1);
        }
        
        // search MUST have content
        if (rest.empty()) {
            return {}; // invalid search
        }

        parts.push_back(rest);
        return parts;
    }

    // Handle get and delete - exactly one filename
    if (commandName == "get" || commandName == "delete") {
        std::string filename;

        // must have filename
        if (!(iss >> filename)) {
            return {}; 
        }

        // cannot have more than one argument
        std::string extra;
        if (iss >> extra) {
            return {};  
        }

        parts.push_back(filename);
        return parts;
    }

    // Handle post - ("post" + filename + content)
    if (commandName == "post") {
        std::string filename;

        // must have filename
        if (!(iss >> filename)) {
            return {};  
        }

        parts.push_back(filename);

        // now read the rest of the line as content
        std::string content;
        std::getline(iss, content);

        // remove leading space if exists
        if (!content.empty() && content[0] == ' ') {
            content.erase(0, 1);
        }

        // EMPTY content is allowed for post
        parts.push_back(content);

        return parts;
    }

    return {}; // invalid command
}